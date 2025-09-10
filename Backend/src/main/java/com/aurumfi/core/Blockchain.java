package com.aurumfi.core;

import com.aurumfi.model.Block;
import com.aurumfi.model.Transaction;
import com.aurumfi.model.TransactionOutput;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Component
public class Blockchain {
    public static List<Block> chain = new ArrayList<>();
    public static List<Transaction> pendingTransactions = new ArrayList<>();
    public static HashMap<String, TransactionOutput> UTXOs = new HashMap<>();

    public static int difficulty = 4;
    public static double miningReward = 50;
    public static int blockTimeTarget = 60000; // 1 хвилина в мілісекундах

    public Blockchain() {
        chain.add(createGenesisBlock());
        adjustDifficulty();
        System.out.println("✅ Blockchain initialized with genesis block");
        System.out.println("💰 Genesis address 'founder' has balance: " + getBalanceOfAddress("founder"));
    }

    private Block createGenesisBlock() {
        // Створюємо genesis block з початковою транзакцією
        List<Transaction> genesisTransactions = new ArrayList<>();
        Transaction genesisTx = new Transaction("genesis", "founder", 1000);
        genesisTransactions.add(genesisTx);

        Block genesis = new Block("0", genesisTransactions, difficulty);
        genesis.mineBlock();
        return genesis;
    }

    public Block getLatestBlock() {
        return chain.get(chain.size() - 1);
    }

    public void minePendingTransactions(String miningRewardAddress) {
        // Додаємо mining reward
        Transaction rewardTx = new Transaction("system", miningRewardAddress, miningReward);
        pendingTransactions.add(rewardTx);

        // Створюємо та майнимо блок
        Block block = new Block(getLatestBlock().getHash(), new ArrayList<>(pendingTransactions), difficulty);
        block.mineBlock();

        chain.add(block);
        pendingTransactions.clear();

        adjustDifficulty();

        System.out.println("✅ Block #" + chain.size() + " mined successfully!");
        System.out.println("💰 Miner reward: " + miningReward + " AUR sent to " + miningRewardAddress);
    }

    public void addTransaction(Transaction transaction) {
        if (transaction == null) {
            throw new RuntimeException("Transaction cannot be null");
        }

        // ДЛЯ ДЕМОНСТРАЦІЇ - ВИМКНУТО ПЕРЕВІРКУ БАЛАНСУ
        // Будь-яка транзакція дозволена навіть з нульовим балансом
        pendingTransactions.add(transaction);
        System.out.println("✅ Transaction added to pool: " + transaction.getTransactionId());
        System.out.println("From: " + transaction.getFromAddress() + " To: " + transaction.getToAddress() + " Amount: " + transaction.getAmount());
    }

    public boolean isChainValid() {
        for (int i = 1; i < chain.size(); i++) {
            Block current = chain.get(i);
            Block previous = chain.get(i-1);

            if (!current.getHash().equals(current.calculateHash())) {
                System.out.println("❌ Invalid block hash at block " + i);
                return false;
            }
            if (!current.getPreviousHash().equals(previous.getHash())) {
                System.out.println("❌ Invalid previous hash at block " + i);
                return false;
            }
            if (!current.hasValidTransactions()) {
                System.out.println("❌ Invalid transactions in block " + i);
                return false;
            }
        }
        return true;
    }

    private void adjustDifficulty() {
        if (chain.size() % 10 == 0 && chain.size() >= 10) {
            long timeTaken = chain.get(chain.size()-1).getTimestamp() -
                    chain.get(chain.size()-10).getTimestamp();

            System.out.println("⏱️ Time taken for last 10 blocks: " + timeTaken + "ms");

            if (timeTaken < blockTimeTarget / 2) {
                difficulty++;
                System.out.println("📈 Difficulty increased to: " + difficulty);
            } else if (timeTaken > blockTimeTarget * 2) {
                difficulty = Math.max(1, difficulty - 1);
                System.out.println("📉 Difficulty decreased to: " + difficulty);
            } else {
                System.out.println("⚖️ Difficulty remains: " + difficulty);
            }
        }
    }

    public double getBalanceOfAddress(String address) {
        double balance = 0;

        // Перевіряємо транзакції в блоках
        for (Block block : chain) {
            for (Transaction tx : block.getTransactions()) {
                if (tx.getFromAddress().equals(address)) {
                    balance -= tx.getAmount();
                }
                if (tx.getToAddress().equals(address)) {
                    balance += tx.getAmount();
                }
            }
        }

        // Перевіряємо pending transactions
        for (Transaction tx : pendingTransactions) {
            if (tx.getFromAddress().equals(address)) {
                balance -= tx.getAmount();
            }
            if (tx.getToAddress().equals(address)) {
                balance += tx.getAmount();
            }
        }

        return balance;
    }

    // Додаткові методи для зручності
    public int getBlockCount() {
        return chain.size();
    }

    public int getPendingTransactionCount() {
        return pendingTransactions.size();
    }

    public double getTotalSupply() {
        double total = 0;
        for (Block block : chain) {
            for (Transaction tx : block.getTransactions()) {
                if (tx.getFromAddress().equals("system") || tx.getFromAddress().equals("genesis")) {
                    total += tx.getAmount();
                }
            }
        }
        return total;
    }

    public List<Transaction> getPendingTransactions() {
        return new ArrayList<>(pendingTransactions);
    }

    public List<Block> getChain() {
        return new ArrayList<>(chain);
    }
}