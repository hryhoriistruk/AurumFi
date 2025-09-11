package com.aurumfi.network;

public class NetworkMessage {
    private String type;
    private String data;

    public NetworkMessage() {}

    public NetworkMessage(String type, String data) {
        this.type = type;
        this.data = data;
    }

    // Getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}