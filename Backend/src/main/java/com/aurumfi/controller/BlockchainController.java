package com.aurumfi.controller;

import com.aurumfi.core.Blockchain;
import com.aurumfi.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    @Autowired
    private Blockchain blockchain;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/chain")
    public ResponseEntity<Map<String, Object>> getBlockchain() {
        Map<String, Object> response = new HashMap<>();
        response.put("chain", blockchain.getChain());
        response.put("length", blockchain.getBlockCount());
        response.put("isValid", blockchain.isChainValid());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transaction")
    public ResponseEntity<Map<String, Object>> createTransaction(
            @RequestBody Map<String, Object> requestBody) {

        try {
            String fromAddress = (String) requestBody.get("fromAddress");
            String toAddress = (String) requestBody.get("toAddress");
            double amount = Double.parseDouble(requestBody.get("amount").toString());

            System.out.println("Received transaction: " + fromAddress + " -> " + toAddress + " : " + amount);

            Transaction transaction = new Transaction(fromAddress, toAddress, amount);
            blockchain.addTransaction(transaction);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Transaction added to pending pool");
            response.put("transactionId", transaction.getTransactionId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Transaction error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mine")
    public ResponseEntity<Map<String, Object>> mineBlock(@RequestBody Map<String, Object> requestBody) {
        try {
            String minerAddress = (String) requestBody.get("minerAddress");
            System.out.println("Mining block for: " + minerAddress);

            blockchain.minePendingTransactions(minerAddress);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Block mined successfully");
            response.put("minerReward", Blockchain.miningReward);
            response.put("blockHeight", blockchain.getBlockCount());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Mining error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable String address) {
        System.out.println("Balance request for: " + address);
        double balance = blockchain.getBalanceOfAddress(address);
        return ResponseEntity.ok(Map.of(
                "address", address,
                "balance", balance,
                "currency", "AUR"
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getBlockchainInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("difficulty", Blockchain.difficulty);
        info.put("miningReward", Blockchain.miningReward);
        info.put("pendingTransactions", blockchain.getPendingTransactionCount());
        info.put("chainLength", blockchain.getBlockCount());
        info.put("isValid", blockchain.isChainValid());
        return ResponseEntity.ok(info);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("blockCount", blockchain.getBlockCount());
        stats.put("pendingTransactions", blockchain.getPendingTransactionCount());
        stats.put("totalSupply", blockchain.getTotalSupply());
        stats.put("difficulty", Blockchain.difficulty);
        stats.put("isValid", blockchain.isChainValid());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingTransactions() {
        try {
            return ResponseEntity.ok(blockchain.getPendingTransactions());
        } catch (Exception e) {
            return ResponseEntity.ok(new Object[0]);
        }
    }

    @PostMapping("/faucet")
    public ResponseEntity<Map<String, Object>> getTestFunds(@RequestBody Map<String, Object> requestBody) {
        try {
            String address = (String) requestBody.get("address");
            double amount = 1000; // Тестові кошти

            // Створюємо транзакцію з системного faucet
            Transaction faucetTx = new Transaction("faucet", address, amount);
            blockchain.addTransaction(faucetTx);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test funds added to address: " + address);
            response.put("amount", amount);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}