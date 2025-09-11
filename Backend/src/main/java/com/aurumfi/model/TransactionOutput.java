package com.aurumfi.model;

public class TransactionOutput {
    public String id;
    public String recipient;
    public double value;

    public TransactionOutput(String id, String recipient, double value) {
        this.id = id;
        this.recipient = recipient;
        this.value = value;
    }

    public boolean isMine(String publicKey) {
        return recipient.equals(publicKey);
    }
}