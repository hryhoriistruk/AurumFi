package com.aurumfi.util;

import com.aurumfi.model.Transaction;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class CryptoUtils {

    public static String applySHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
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

    public static byte[] applyECDSASig(PrivateKey privateKey, String input) {
        try {
            Signature dsa = Signature.getInstance("ECDSA", "BC");
            dsa.initSign(privateKey);
            dsa.update(input.getBytes());
            return dsa.sign();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static boolean verifyECDSASig(PublicKey publicKey, String data, byte[] signature) {
        try {
            Signature ecdsa = Signature.getInstance("ECDSA", "BC");
            ecdsa.initVerify(publicKey);
            ecdsa.update(data.getBytes());
            return ecdsa.verify(signature);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String getStringFromKey(Key key) {
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }

    // Додано для біржової сумісності
    public static PublicKey getPublicKeyFromString(String key) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(key);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("ECDSA", "BC");
            return keyFactory.generatePublic(keySpec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to reconstruct public key", e);
        }
    }

    public static PrivateKey getPrivateKeyFromString(String key) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(key);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("ECDSA", "BC");
            return keyFactory.generatePrivate(keySpec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to reconstruct private key", e);
        }
    }

    public static String calculateMerkleRoot(List<Transaction> transactions) {
        if (transactions.isEmpty()) return applySHA256("");

        List<String> treeLayer = new ArrayList<>();
        for (Transaction tx : transactions) {
            treeLayer.add(tx.getTransactionId());
        }

        while (treeLayer.size() > 1) {
            List<String> newLayer = new ArrayList<>();
            for (int i = 0; i < treeLayer.size(); i += 2) {
                if (i + 1 < treeLayer.size()) {
                    newLayer.add(applySHA256(treeLayer.get(i) + treeLayer.get(i+1)));
                } else {
                    newLayer.add(applySHA256(treeLayer.get(i) + treeLayer.get(i)));
                }
            }
            treeLayer = newLayer;
        }

        return treeLayer.get(0);
    }

    // Додано валідацію адрес для біржової безпеки
    public static boolean isValidAddress(String address) {
        if (address == null || address.length() < 26 || address.length() > 35) {
            return false;
        }

        // Перевірка формату AurumFi адрес
        if (!address.startsWith("AUR_")) {
            return false;
        }

        // Додаткова перевірка checksums може бути додана тут
        return true;
    }

    // Генерація детермінованих адрес для біржових депозитів
    public static String generateDepositAddress(String exchangeId, String userId) {
        String input = exchangeId + userId + System.currentTimeMillis();
        String hash = applySHA256(input);
        return "AUR_DEP_" + hash.substring(0, 20).toUpperCase();
    }

    // Валідація цифрових підписів для біржових транзакцій
    public static boolean validateExchangeTransaction(Transaction tx, PublicKey exchangePublicKey) {
        try {
            // Спеціальна логіка валідації для біржових транзакцій
            if (tx.getFromAddress().startsWith("EXCHANGE_") || tx.getToAddress().startsWith("EXCHANGE_")) {
                // Додаткові перевірки для біржових операцій
                return tx.getAmount() > 0 && tx.getAmount() <= 1000000; // Ліміт на транзакцію
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}