package com.aurumfi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.Security;

@SpringBootApplication
public class AurumFiApplication {

    public static void main(String[] args) {
        // Додаємо Bouncy Castle провайдер для криптографії
        Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

        SpringApplication.run(AurumFiApplication.class, args);
        System.out.println("🚀 AurumFi Blockchain Started Successfully!");
        System.out.println("📍 API available at: http://localhost:8081");
        System.out.println("⛏️  Difficulty: 4");
        System.out.println("💰 Mining reward: 50 AUR");
        System.out.println("🔓 Security: DISABLED (for development)");
    }
}