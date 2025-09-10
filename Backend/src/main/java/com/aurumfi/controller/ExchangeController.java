package com.aurumfi.controller;

import com.aurumfi.core.Blockchain;
import com.aurumfi.token.AurumToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/exchange")
public class ExchangeController {

    @Autowired
    private Blockchain blockchain;
    private AurumToken aurumToken;

    // Order Book: Map<Price, List<Order>>
    private Map<BigDecimal, List<Map<String, Object>>> buyOrders = new ConcurrentHashMap<>();
    private Map<BigDecimal, List<Map<String, Object>>> sellOrders = new ConcurrentHashMap<>();
    private List<Map<String, Object>> tradeHistory = new ArrayList<>();

    // Адреса адміністратора, яка виконує transferFrom
    private final String EXCHANGE_ADMIN_ADDRESS = "founder"; // Має співпадати з adminAddress в AurumToken

    public ExchangeController() {
        this.aurumToken = new AurumToken("founder");
        // Якщо потрібно, встановіть adminAddress явно:
        // aurumToken.setAdminAddress(EXCHANGE_ADMIN_ADDRESS);
    }

    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> placeBuyOrder(@RequestBody Map<String, Object> requestBody) {
        try {
            String buyerAddress = (String) requestBody.get("address");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());
            BigDecimal price = new BigDecimal(requestBody.get("price").toString());

            if (amount.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount and price must be positive"));
            }
            BigDecimal totalCost = amount.multiply(price);
            if (blockchain.getBalanceOfAddress(buyerAddress) < totalCost.doubleValue()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient funds to place buy order"));
            }

            Map<String, Object> order = new HashMap<>();
            order.put("orderId", UUID.randomUUID().toString());
            order.put("type", "buy");
            order.put("address", buyerAddress);
            order.put("amount", amount);
            order.put("price", price);
            order.put("timestamp", System.currentTimeMillis());

            matchOrders(order);

            if (!order.containsKey("executed")) {
                buyOrders.computeIfAbsent(price, k -> new ArrayList<>()).add(order);
            }

            return ResponseEntity.ok(Map.of("message", "Buy order placed successfully", "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> placeSellOrder(@RequestBody Map<String, Object> requestBody) {
        try {
            String sellerAddress = (String) requestBody.get("address");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());
            BigDecimal price = new BigDecimal(requestBody.get("price").toString());

            if (amount.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount and price must be positive"));
            }
            if (aurumToken.balanceOf(sellerAddress).compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient token balance to place sell order"));
            }

            Map<String, Object> order = new HashMap<>();
            order.put("orderId", UUID.randomUUID().toString());
            order.put("type", "sell");
            order.put("address", sellerAddress);
            order.put("amount", amount);
            order.put("price", price);
            order.put("timestamp", System.currentTimeMillis());

            matchOrders(order);

            if (!order.containsKey("executed")) {
                sellOrders.computeIfAbsent(price, k -> new ArrayList<>()).add(order);
            }

            return ResponseEntity.ok(Map.of("message", "Sell order placed successfully", "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private void matchOrders(Map<String, Object> newOrder) {
        String newOrderType = (String) newOrder.get("type");
        BigDecimal newOrderAmount = (BigDecimal) newOrder.get("amount");
        BigDecimal newOrderPrice = (BigDecimal) newOrder.get("price");
        String newOrderAddress = (String) newOrder.get("address");

        if (newOrderType.equals("buy")) {
            for (Map.Entry<BigDecimal, List<Map<String, Object>>> entry : sellOrders.entrySet()) {
                BigDecimal sellPrice = entry.getKey();
                List<Map<String, Object>> sellsAtPrice = entry.getValue();

                if (newOrderPrice.compareTo(sellPrice) >= 0) {
                    Iterator<Map<String, Object>> iterator = sellsAtPrice.iterator();
                    while (iterator.hasNext() && newOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
                        Map<String, Object> existingSellOrder = iterator.next();
                        BigDecimal existingSellAmount = (BigDecimal) existingSellOrder.get("amount");
                        String sellerAddress = (String) existingSellOrder.get("address");

                        BigDecimal tradeAmount = newOrderAmount.min(existingSellAmount);
                        BigDecimal tradePrice = sellPrice;

                        try {
                            // Використовуємо transferFrom з правами адміністратора
                            aurumToken.transferFrom(sellerAddress, newOrderAddress, tradeAmount, EXCHANGE_ADMIN_ADDRESS);

                            // Тут можна додати логіку передачі валюти від покупця продавцю

                            Map<String, Object> trade = new HashMap<>();
                            trade.put("buyOrderId", newOrder.get("orderId"));
                            trade.put("sellOrderId", existingSellOrder.get("orderId"));
                            trade.put("buyer", newOrderAddress);
                            trade.put("seller", sellerAddress);
                            trade.put("amount", tradeAmount);
                            trade.put("price", tradePrice);
                            trade.put("timestamp", System.currentTimeMillis());
                            tradeHistory.add(trade);

                            newOrderAmount = newOrderAmount.subtract(tradeAmount);
                            existingSellOrder.put("amount", existingSellAmount.subtract(tradeAmount));

                            if (((BigDecimal) existingSellOrder.get("amount")).compareTo(BigDecimal.ZERO) <= 0) {
                                iterator.remove();
                            }
                            newOrder.put("amount", newOrderAmount);

                            System.out.println("Trade executed: " + tradeAmount + " AUR at " + tradePrice + " for " + newOrderAddress + " and " + sellerAddress);

                        } catch (Exception e) {
                            System.err.println("Error executing trade: " + e.getMessage());
                        }
                    }
                    if (sellsAtPrice.isEmpty()) {
                        sellOrders.remove(sellPrice);
                    }
                }
            }
            if (newOrderAmount.compareTo(BigDecimal.ZERO) <= 0) {
                newOrder.put("executed", true);
            }
        } else if (newOrderType.equals("sell")) {
            for (Map.Entry<BigDecimal, List<Map<String, Object>>> entry : buyOrders.entrySet()) {
                BigDecimal buyPrice = entry.getKey();
                List<Map<String, Object>> buysAtPrice = entry.getValue();

                if (newOrderPrice.compareTo(buyPrice) <= 0) {
                    Iterator<Map<String, Object>> iterator = buysAtPrice.iterator();
                    while (iterator.hasNext() && newOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
                        Map<String, Object> existingBuyOrder = iterator.next();
                        BigDecimal existingBuyAmount = (BigDecimal) existingBuyOrder.get("amount");
                        String buyerAddress = (String) existingBuyOrder.get("address");

                        BigDecimal tradeAmount = newOrderAmount.min(existingBuyAmount);
                        BigDecimal tradePrice = buyPrice;

                        try {
                            // Використовуємо transferFrom з правами адміністратора
                            aurumToken.transferFrom(newOrderAddress, buyerAddress, tradeAmount, EXCHANGE_ADMIN_ADDRESS);

                            // Тут можна додати логіку передачі валюти від покупця продавцю

                            Map<String, Object> trade = new HashMap<>();
                            trade.put("buyOrderId", existingBuyOrder.get("orderId"));
                            trade.put("sellOrderId", newOrder.get("orderId"));
                            trade.put("buyer", buyerAddress);
                            trade.put("seller", newOrderAddress);
                            trade.put("amount", tradeAmount);
                            trade.put("price", tradePrice);
                            trade.put("timestamp", System.currentTimeMillis());
                            tradeHistory.add(trade);

                            newOrderAmount = newOrderAmount.subtract(tradeAmount);
                            existingBuyOrder.put("amount", existingBuyAmount.subtract(tradeAmount));

                            if (((BigDecimal) existingBuyOrder.get("amount")).compareTo(BigDecimal.ZERO) <= 0) {
                                iterator.remove();
                            }
                            newOrder.put("amount", newOrderAmount);

                            System.out.println("Trade executed: " + tradeAmount + " AUR at " + tradePrice + " for " + buyerAddress + " and " + newOrderAddress);

                        } catch (Exception e) {
                            System.err.println("Error executing trade: " + e.getMessage());
                        }
                    }
                    if (buysAtPrice.isEmpty()) {
                        buyOrders.remove(buyPrice);
                    }
                }
            }
            if (newOrderAmount.compareTo(BigDecimal.ZERO) <= 0) {
                newOrder.put("executed", true);
            }
        }
    }

    @GetMapping("/orderbook")
    public ResponseEntity<Map<String, Object>> getOrderBook() {
        Map<String, Object> orderBook = new HashMap<>();
        orderBook.put("buyOrders", buyOrders);
        orderBook.put("sellOrders", sellOrders);
        return ResponseEntity.ok(orderBook);
    }

    @GetMapping("/tradehistory")
    public ResponseEntity<List<Map<String, Object>>> getTradeHistory() {
        return ResponseEntity.ok(tradeHistory);
    }
}