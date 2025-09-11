package com.aurumfi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

import java.security.Security;

@SpringBootApplication
@ComponentScan(basePackages = {"com.aurumfi.config", "com.aurumfi.controller", "com.aurumfi.core", "com.aurumfi.token", "com.aurumfi.util", "com.aurumfi.network"})
public class AurumFiApplication {

    public static void main(String[] args) {
        try {
            // Додаємо Bouncy Castle провайдер для криптографії
            Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

            SpringApplication.run(AurumFiApplication.class, args);
            System.out.println("🚀 AurumFi Blockchain Started Successfully!");
            System.out.println("📍 API available at: http://localhost:8081");
            System.out.println("⛏️  Difficulty: 4");
            System.out.println("💰 Mining reward: 50 AUR");
            System.out.println("🔓 Security: DISABLED (for development)");
        } catch (Exception e) {
            System.err.println("❌ Application failed to start: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}