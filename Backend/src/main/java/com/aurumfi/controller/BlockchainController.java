package com.aurumfi.controller;

import com.aurumfi.model.Block;
import com.aurumfi.model.Transaction;
import com.aurumfi.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/blockchain")
    public ResponseEntity<Map<String, Object>> getBlockchain() {
        Map<String, Object> response = new HashMap<>();
        response.put("chain", blockchainService.getChain());
        response.put("pendingTransactions", blockchainService.getPendingTransactions());
        response.put("length", blockchainService.getChain().size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transactions")
    public ResponseEntity<Map<String, Object>> createTransaction(@RequestBody Transaction tx) {
        try {
            blockchainService.addTransaction(tx);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Transaction added to pending pool");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mine")
    public ResponseEntity<Map<String, Object>> mineBlock(@RequestParam String minerAddress) {
        blockchainService.minePendingTransactions(minerAddress);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Block mined successfully");
        response.put("balance", blockchainService.getBalanceOfAddress(minerAddress));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance/{address}")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable String address) {
        double balance = blockchainService.getBalanceOfAddress(address);
        return ResponseEntity.ok(Map.of("address", address, "balance", balance));
    }
}