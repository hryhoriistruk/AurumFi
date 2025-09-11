package com.aurumfi.model;

import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.util.HashMap;
import java.util.Map;

public class Wallet {
    private PrivateKey privateKey;
    private String publicKey;
    private String address;
    private double balance;

    public Wallet() {
        generateKeyPair();
        this.address = generateAddressFromPublicKey();
        this.balance = 0;
    }

    public void generateKeyPair() {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("ECDSA", "BC");
            SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
            ECGenParameterSpec ecSpec = new ECGenParameterSpec("prime192v1");

            keyGen.initialize(ecSpec, random);
            KeyPair keyPair = keyGen.generateKeyPair();

            this.privateKey = keyPair.getPrivate();
            this.publicKey = bytesToHex(keyPair.getPublic().getEncoded());

        } catch (Exception e) {
            // Fallback to simple address generation
            this.publicKey = "pub_" + System.currentTimeMillis();
            this.address = "addr_" + System.currentTimeMillis();
        }
    }

    private String generateAddressFromPublicKey() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(publicKey.getBytes());
            return "AUR_" + bytesToHex(hash).substring(0, 20);
        } catch (Exception e) {
            return "addr_" + System.currentTimeMillis();
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    public double getBalance() {
        return balance;
    }

    public void addFunds(double amount) {
        balance += amount;
    }

    public boolean deductFunds(double amount) {
        if (balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public String getPublicKey() { return publicKey; }
    public PrivateKey getPrivateKey() { return privateKey; }
    public String getAddress() { return address; }

    public Transaction sendFunds(String recipient, double value) {
        if (getBalance() < value) {
            System.out.println("❌ Not enough funds");
            return null;
        }

        // Спрощена транзакція для тестування
        Transaction transaction = new Transaction(this.address, recipient, value);
        this.balance -= value;

        return transaction;
    }
}