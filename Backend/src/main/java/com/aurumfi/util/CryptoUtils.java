package com.aurumfi.util;

import com.aurumfi.model.Transaction;
import java.security.*;
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
}