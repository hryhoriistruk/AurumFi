package com.aurumfi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AurumFiApplication {
    public static void main(String[] args) {
        SpringApplication.run(AurumFiApplication.class, args);
        System.out.println("🚀 AurumFi Java Backend Started Successfully!");
    }

    // ВИДАЛИТИ цей метод corsConfigurer() - він вже є в CorsConfig.java
}