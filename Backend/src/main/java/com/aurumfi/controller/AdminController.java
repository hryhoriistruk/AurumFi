package com.aurumfi.controller;

import com.aurumfi.core.Blockchain;
import com.aurumfi.token.AurumToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private Blockchain blockchain;
    private AurumToken aurumToken;

    // In a real application, you'd have a proper authentication mechanism
    // For demo purposes, a simple hardcoded admin check
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "adminpassword"; // NEVER do this in production

    public AdminController() {
        this.aurumToken = new AurumToken("founder"); // Assuming AurumToken is initialized
    }

    // Basic admin login (for demo purposes)
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> adminLogin(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password)) {
            // In production, return a JWT token here
            return ResponseEntity.ok(Map.of("message", "Login successful", "token", "fake-admin-token"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    // Example of a protected admin endpoint
    @GetMapping("/blockchain-stats")
    public ResponseEntity<Map<String, Object>> getAdminBlockchainStats(@RequestHeader("Authorization") String token) {
        if (!isValidAdminToken(token)) { // Implement proper token validation
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("blockCount", blockchain.getBlockCount());
        stats.put("pendingTransactions", blockchain.getPendingTransactionCount());
        stats.put("totalSupply", aurumToken.totalSupply().toString()); // Get total supply from token contract
        stats.put("difficulty", Blockchain.difficulty);
        stats.put("isValid", blockchain.isChainValid());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/mint-tokens")
    public ResponseEntity<Map<String, Object>> mintTokens(@RequestHeader("Authorization") String token,
                                                          @RequestBody Map<String, Object> requestBody) {
        if (!isValidAdminToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            String recipientAddress = (String) requestBody.get("recipientAddress");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());

            if (aurumToken.mint(recipientAddress, amount)) {
                return ResponseEntity.ok(Map.of("message", "Tokens minted successfully", "recipient", recipientAddress, "amount", amount));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to mint tokens"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/burn-tokens")
    public ResponseEntity<Map<String, Object>> burnTokens(@RequestHeader("Authorization") String token,
                                                          @RequestBody Map<String, Object> requestBody) {
        if (!isValidAdminToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        try {
            String address = (String) requestBody.get("address");
            BigDecimal amount = new BigDecimal(requestBody.get("amount").toString());

            if (aurumToken.burn(address, amount)) {
                return ResponseEntity.ok(Map.of("message", "Tokens burned successfully", "address", address, "amount", amount));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to burn tokens"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Placeholder for token validation
    private boolean isValidAdminToken(String token) {
        // In a real app, validate JWT token against a secret key
        return "fake-admin-token".equals(token);
    }
}
