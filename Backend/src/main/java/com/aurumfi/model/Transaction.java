package com.aurumfi.model;

import java.time.LocalDateTime;

public class Transaction {
    private String fromAddress;
    private String toAddress;
    private double amount;
    private LocalDateTime timestamp;
    private String hash;

    public Transaction(String fromAddress, String toAddress, double amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = LocalDateTime.now();
        this.hash = calculateHash();
    }

    public String calculateHash() {
        String dataToHash = fromAddress + toAddress + amount + timestamp.toString();
        return Integer.toHexString(dataToHash.hashCode());
    }

    // Manual getters
    public String getFromAddress() { return fromAddress; }
    public String getToAddress() { return toAddress; }
    public double getAmount() { return amount; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getHash() { return hash; }
}