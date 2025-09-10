package com.aurumfi.model;

import com.aurumfi.util.CryptoUtils;
import java.util.List;

public class Block {
    private String hash;
    private String previousHash;
    private long timestamp;
    private List<Transaction> transactions;
    private int nonce;
    private int difficulty;
    private int version = 1;
    private String merkleRoot;

    public Block(String previousHash, List<Transaction> transactions, int difficulty) {
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.timestamp = System.currentTimeMillis();
        this.difficulty = difficulty;
        this.nonce = 0;
        this.merkleRoot = calculateMerkleRoot();
        this.hash = calculateHash();
    }

    public String calculateHash() {
        String data = previousHash +
                timestamp +
                nonce +
                difficulty +
                merkleRoot;
        return CryptoUtils.applySHA256(data);
    }

    public String calculateMerkleRoot() {
        if (transactions.isEmpty()) return CryptoUtils.applySHA256("");

        // Спрощена версія меркл рута для тестування
        StringBuilder txData = new StringBuilder();
        for (Transaction tx : transactions) {
            txData.append(tx.getTransactionId());
        }
        return CryptoUtils.applySHA256(txData.toString());
    }

    public void mineBlock() {
        merkleRoot = calculateMerkleRoot();
        String target = "0".repeat(difficulty);

        System.out.println("⛏️ Mining block with difficulty " + difficulty + "...");

        while (!hash.substring(0, difficulty).equals(target)) {
            nonce++;
            hash = calculateHash();
        }

        System.out.println("✅ Block mined: " + hash);
        System.out.println("Nonce: " + nonce);
    }

    public boolean hasValidTransactions() {
        for (Transaction tx : transactions) {
            // Для спрощення, всі транзакції вважаються валідними
            // Можна додати перевірку підпису пізніше
            if (tx.getAmount() <= 0) {
                return false;
            }
        }
        return true;
    }

    // Getters
    public String getHash() { return hash; }
    public String getPreviousHash() { return previousHash; }
    public long getTimestamp() { return timestamp; }
    public List<Transaction> getTransactions() { return transactions; }
    public int getNonce() { return nonce; }
    public int getDifficulty() { return difficulty; }
    public String getMerkleRoot() { return merkleRoot; }
}