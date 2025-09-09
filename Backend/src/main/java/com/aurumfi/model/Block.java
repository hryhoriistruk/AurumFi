package com.aurumfi.model;

import java.time.LocalDateTime;
import java.util.List;

public class Block {
    private String hash;
    private String previousHash;
    private LocalDateTime timestamp;
    private List<Transaction> transactions;
    private int nonce;
    private int difficulty;

    public Block(String previousHash, List<Transaction> transactions, int difficulty) {
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = LocalDateTime.now();
        this.difficulty = difficulty;
        this.nonce = 0;
        this.hash = calculateHash();
    }

    public String calculateHash() {
        String dataToHash = previousHash + timestamp.toString() + transactions.toString() + nonce;
        return Integer.toHexString(dataToHash.hashCode());
    }

    public void mineBlock() {
        String target = "0".repeat(difficulty);
        while (!hash.substring(0, Math.min(difficulty, hash.length())).equals(target)) {
            nonce++;
            hash = calculateHash();
        }
        System.out.println("Block mined: " + hash);
    }

    // Manual getters
    public String getHash() { return hash; }
    public String getPreviousHash() { return previousHash; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public List<Transaction> getTransactions() { return transactions; }
    public int getNonce() { return nonce; }
    public int getDifficulty() { return difficulty; }
}