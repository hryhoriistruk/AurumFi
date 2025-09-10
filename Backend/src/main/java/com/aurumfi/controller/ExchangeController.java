package com.aurumfi.controller;

import com.aurumfi.core.Blockchain;
import com.aurumfi.model.Transaction;
import com.aurumfi.token.AurumToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.util.Iterator;


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

    public ExchangeController() {
        this.aurumToken = new AurumToken("founder"); // Assuming AurumToken is initialized
    }

    // Endpoint to place a buy order
    @PostMapping("/buy")
    public ResponseEntity<Map<String, Object>> placeBuyOrder(@RequestBody Map<String, Object> requestBody) {
        try {
            String buyerAddress = (String) requestBody.get("address");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());
            BigDecimal price = new BigDecimal(requestBody.get("price").toString());

            // Basic validation
            if (amount.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount and price must be positive"));
            }
            // Check if buyer has enough AUR to cover the order (amount * price)
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

            matchOrders(order); // Attempt to match immediately

            if (!order.containsKey("executed")) { // If not fully executed, add to order book
                buyOrders.computeIfAbsent(price, k -> new ArrayList<>()).add(order);
            }

            return ResponseEntity.ok(Map.of("message", "Buy order placed successfully", "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint to place a sell order
    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> placeSellOrder(@RequestBody Map<String, Object> requestBody) {
        try {
            String sellerAddress = (String) requestBody.get("address");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());
            BigDecimal price = new BigDecimal(requestBody.get("price").toString());

            // Basic validation
            if (amount.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount and price must be positive"));
            }
            // Check if seller has enough AUR to sell
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

            matchOrders(order); // Attempt to match immediately

            if (!order.containsKey("executed")) { // If not fully executed, add to order book
                sellOrders.computeIfAbsent(price, k -> new ArrayList<>()).add(order);
            }

            return ResponseEntity.ok(Map.of("message", "Sell order placed successfully", "order", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Matching Engine (simplified)
    private void matchOrders(Map<String, Object> newOrder) {
        String newOrderType = (String) newOrder.get("type");
        BigDecimal newOrderAmount = (BigDecimal) newOrder.get("amount");
        BigDecimal newOrderPrice = (BigDecimal) newOrder.get("price");
        String newOrderAddress = (String) newOrder.get("address");

        if (newOrderType.equals("buy")) {
            // Try to match with sell orders
            for (Map.Entry<BigDecimal, List<Map<String, Object>>> entry : sellOrders.entrySet()) {
                BigDecimal sellPrice = entry.getKey();
                List<Map<String, Object>> sellsAtPrice = entry.getValue();

                if (newOrderPrice.compareTo(sellPrice) >= 0) { // Buy price is higher or equal to sell price
                    Iterator<Map<String, Object>> iterator = sellsAtPrice.iterator();
                    while (iterator.hasNext() && newOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
                        Map<String, Object> existingSellOrder = iterator.next();
                        BigDecimal existingSellAmount = (BigDecimal) existingSellOrder.get("amount");
                        String sellerAddress = (String) existingSellOrder.get("address");

                        BigDecimal tradeAmount = newOrderAmount.min(existingSellAmount);
                        BigDecimal tradePrice = sellPrice; // Trade at the sell order's price

                        // Execute trade
                        try {
                            // Transfer tokens from seller to buyer
                            aurumToken.transfer(sellerAddress, newOrderAddress, tradeAmount);
                            // Transfer AUR (currency) from buyer to seller
                            // This would involve a separate "currency" token or direct balance update in Blockchain
                            // For simplicity, let's assume direct balance update for now
                            // blockchain.transferFunds(newOrderAddress, sellerAddress, tradeAmount.multiply(tradePrice).doubleValue());

                            // Record trade
                            Map<String, Object> trade = new HashMap<>();
                            trade.put("buyOrderId", newOrder.get("orderId"));
                            trade.put("sellOrderId", existingSellOrder.get("orderId"));
                            trade.put("buyer", newOrderAddress);
                            trade.put("seller", sellerAddress);
                            trade.put("amount", tradeAmount);
                            trade.put("price", tradePrice);
                            trade.put("timestamp", System.currentTimeMillis());
                            tradeHistory.add(trade);

                            // Update remaining amounts
                            newOrderAmount = newOrderAmount.subtract(tradeAmount);
                            existingSellOrder.put("amount", existingSellAmount.subtract(tradeAmount));

                            if (((BigDecimal) existingSellOrder.get("amount")).compareTo(BigDecimal.ZERO) <= 0) {
                                iterator.remove(); // Remove fully executed sell order
                            }
                            newOrder.put("amount", newOrderAmount); // Update new order's remaining amount

                            System.out.println("Trade executed: " + tradeAmount + " AUR at " + tradePrice + " for " + newOrderAddress + " and " + sellerAddress);

                        } catch (Exception e) {
                            System.err.println("Error executing trade: " + e.getMessage());
                            // Handle error, maybe revert balances or log for manual review
                        }
                    }
                    if (sellsAtPrice.isEmpty()) {
                        sellOrders.remove(sellPrice); // Remove price level if no orders left
                    }
                }
            }
            if (newOrderAmount.compareTo(BigDecimal.ZERO) <= 0) {
                newOrder.put("executed", true); // Mark new order as fully executed
            }
        } else if (newOrderType.equals("sell")) {
            // Try to match with buy orders
            for (Map.Entry<BigDecimal, List<Map<String, Object>>> entry : buyOrders.entrySet()) {
                BigDecimal buyPrice = entry.getKey();
                List<Map<String, Object>> buysAtPrice = entry.getValue();

                if (newOrderPrice.compareTo(buyPrice) <= 0) { // Sell price is lower or equal to buy price
                    Iterator<Map<String, Object>> iterator = buysAtPrice.iterator();
                    while (iterator.hasNext() && newOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
                        Map<String, Object> existingBuyOrder = iterator.next();
                        BigDecimal existingBuyAmount = (BigDecimal) existingBuyOrder.get("amount");
                        String buyerAddress = (String) existingBuyOrder.get("address");

                        BigDecimal tradeAmount = newOrderAmount.min(existingBuyAmount);
                        BigDecimal tradePrice = buyPrice; // Trade at the buy order's price

                        // Execute trade
                        try {
                            // Transfer tokens from seller to buyer
                            aurumToken.transfer(newOrderAddress, buyerAddress, tradeAmount);
                            // Transfer AUR (currency) from buyer to seller
                            // blockchain.transferFunds(buyerAddress, newOrderAddress, tradeAmount.multiply(tradePrice).doubleValue());

                            // Record trade
                            Map<String, Object> trade = new HashMap<>();
                            trade.put("buyOrderId", existingBuyOrder.get("orderId"));
                            trade.put("sellOrderId", newOrder.get("orderId"));
                            trade.put("buyer", buyerAddress);
                            trade.put("seller", newOrderAddress);
                            trade.put("amount", tradeAmount);
                            trade.put("price", tradePrice);
                            trade.put("timestamp", System.currentTimeMillis());
                            tradeHistory.add(trade);

                            // Update remaining amounts
                            newOrderAmount = newOrderAmount.subtract(tradeAmount);
                            existingBuyOrder.put("amount", existingBuyAmount.subtract(tradeAmount));

                            if (((BigDecimal) existingBuyOrder.get("amount")).compareTo(BigDecimal.ZERO) <= 0) {
                                iterator.remove(); // Remove fully executed buy order
                            }
                            newOrder.put("amount", newOrderAmount); // Update new order's remaining amount

                            System.out.println("Trade executed: " + tradeAmount + " AUR at " + tradePrice + " for " + buyerAddress + " and " + newOrderAddress);

                        } catch (Exception e) {
                            System.err.println("Error executing trade: " + e.getMessage());
                        }
                    }
                    if (buysAtPrice.isEmpty()) {
                        buyOrders.remove(buyPrice); // Remove price level if no orders left
                    }
                }
            }
            if (newOrderAmount.compareTo(BigDecimal.ZERO) <= 0) {
                newOrder.put("executed", true); // Mark new order as fully executed
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
