package com.aurumfi.model;

import com.aurumfi.util.CryptoUtils;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    // Конструктор для Jackson десеріалізації
    @JsonCreator
    public Block(
            @JsonProperty("hash") String hash,
            @JsonProperty("previousHash") String previousHash,
            @JsonProperty("timestamp") long timestamp,
            @JsonProperty("transactions") List<Transaction> transactions,
            @JsonProperty("nonce") int nonce,
            @JsonProperty("difficulty") int difficulty,
            @JsonProperty("version") int version,
            @JsonProperty("merkleRoot") String merkleRoot) {
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.version = version;
        this.merkleRoot = merkleRoot;
    }

    // Існуючий конструктор для створення нових блоків
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

    @JsonIgnore
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

    @JsonIgnore
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

    // Getters з анотаціями @JsonProperty для серіалізації
    @JsonProperty
    public String getHash() { return hash; }

    @JsonProperty
    public String getPreviousHash() { return previousHash; }

    @JsonProperty
    public long getTimestamp() { return timestamp; }

    @JsonProperty
    public List<Transaction> getTransactions() { return transactions; }

    @JsonProperty
    public int getNonce() { return nonce; }

    @JsonProperty
    public int getDifficulty() { return difficulty; }

    @JsonProperty
    public int getVersion() { return version; }

    @JsonProperty
    public String getMerkleRoot() { return merkleRoot; }

    // Setters для десеріалізації (необов'язково, але корисно)
    public void setHash(String hash) { this.hash = hash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }
    public void setNonce(int nonce) { this.nonce = nonce; }
    public void setDifficulty(int difficulty) { this.difficulty = difficulty; }
    public void setVersion(int version) { this.version = version; }
    public void setMerkleRoot(String merkleRoot) { this.merkleRoot = merkleRoot; }

    @Override
    public String toString() {
        return "Block{" +
                "hash='" + hash + '\'' +
                ", previousHash='" + previousHash + '\'' +
                ", timestamp=" + timestamp +
                ", transactions=" + transactions.size() +
                ", nonce=" + nonce +
                ", difficulty=" + difficulty +
                ", version=" + version +
                ", merkleRoot='" + merkleRoot + '\'' +
                '}';
    }
}