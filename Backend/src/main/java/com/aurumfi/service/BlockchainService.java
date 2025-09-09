package com.aurumfi.service;

import com.aurumfi.model.Block;
import com.aurumfi.model.Transaction;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BlockchainService {

    private List<Block> chain = new ArrayList<>();
    private List<Transaction> pendingTransactions = new ArrayList<>();
    private int difficulty = 2;
    private double miningReward = 100;

    public BlockchainService() {
        // Create genesis block
        chain.add(createGenesisBlock());
    }

    private Block createGenesisBlock() {
        return new Block("0", new ArrayList<>(), difficulty);
    }

    public Block getLatestBlock() {
        return chain.get(chain.size() - 1);
    }

    public void minePendingTransactions(String miningRewardAddress) {
        // Add mining reward transaction
        Transaction rewardTx = new Transaction(null, miningRewardAddress, miningReward);
        pendingTransactions.add(rewardTx);

        Block block = new Block(getLatestBlock().getHash(), new ArrayList<>(pendingTransactions), difficulty);
        block.mineBlock();

        chain.add(block);
        pendingTransactions.clear();
    }

    public void addTransaction(Transaction transaction) {
        if (transaction.getFromAddress() == null || transaction.getToAddress() == null) {
            throw new IllegalArgumentException("Transaction must include from and to address");
        }
        if (transaction.getAmount() <= 0) {
            throw new IllegalArgumentException("Transaction amount should be positive");
        }
        // For demo, no signature validation
        pendingTransactions.add(transaction);
    }

    public double getBalanceOfAddress(String address) {
        double balance = 0;
        for (Block block : chain) {
            for (Transaction tx : block.getTransactions()) {
                if (address.equals(tx.getFromAddress())) {
                    balance -= tx.getAmount();
                }
                if (address.equals(tx.getToAddress())) {
                    balance += tx.getAmount();
                }
            }
        }
        for (Transaction tx : pendingTransactions) {
            if (address.equals(tx.getFromAddress())) {
                balance -= tx.getAmount();
            }
        }
        return balance;
    }

    public List<Block> getChain() {
        return chain;
    }

    public List<Transaction> getPendingTransactions() {
        return pendingTransactions;
    }
}