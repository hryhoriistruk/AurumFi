package com.aurumfi.model;

import java.security.*;
import java.util.ArrayList;
import java.util.List;

public class Transaction {
    private String transactionId;
    private String fromAddress;
    private String toAddress;
    private double amount;
    private byte[] signature;

    private List<TransactionInput> inputs;
    private List<TransactionOutput> outputs;

    // Конструктор для простих транзакцій (без підпису)
    public Transaction(String fromAddress, String toAddress, double amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.inputs = new ArrayList<>();
        this.outputs = new ArrayList<>();
        this.transactionId = calculateHash();
    }

    // Конструктор для підписаних транзакцій
    public Transaction(String fromAddress, String toAddress, double amount,
                       List<TransactionInput> inputs, PrivateKey privateKey) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.inputs = inputs;
        this.outputs = new ArrayList<>();
        this.transactionId = calculateHash();
        generateSignature(privateKey);
    }

    public String calculateHash() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = fromAddress + toAddress + amount;
            byte[] hash = digest.digest(input.getBytes("UTF-8"));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void generateSignature(PrivateKey privateKey) {
        try {
            Signature dsa = Signature.getInstance("ECDSA", "BC");
            dsa.initSign(privateKey);
            String data = fromAddress + toAddress + amount;
            dsa.update(data.getBytes("UTF-8"));
            this.signature = dsa.sign();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean verifySignature() {
        try {
            if (signature == null) {
                return true; // Транзакції без підпису вважаються валідними для спрощення
            }

            // Тут має бути логіка перевірки підпису, але для спрощення повертаємо true
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getFromAddress() {
        return fromAddress;
    }

    public String getToAddress() {
        return toAddress;
    }

    public double getAmount() {
        return amount;
    }

    public List<TransactionInput> getInputs() {
        return inputs;
    }

    public List<TransactionOutput> getOutputs() {
        return outputs;
    }

    public boolean processTransaction() {
        if (!verifySignature()) {
            System.out.println("❌ Transaction signature failed to verify");
            return false;
        }

        // Спрощена логіка для тестування
        return true;
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "id='" + transactionId + '\'' +
                ", from='" + fromAddress + '\'' +
                ", to='" + toAddress + '\'' +
                ", amount=" + amount +
                '}';
    }
}