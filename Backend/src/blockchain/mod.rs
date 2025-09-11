pub mod block;
pub mod consensus;

use crate::blockchain::block::{Block, Transaction};
use std::sync::{Arc, Mutex};
use serde_json::Value;
use sha2::{Sha256, Digest};

#[derive(Clone)]
pub struct NeoBlockchain {
    pub chain: Arc<Mutex<Vec<Block>>>,
    pub pending_transactions: Arc<Mutex<Vec<Transaction>>>,
    pub difficulty: usize,
    pub mining_reward: u64,
}

impl NeoBlockchain {
    pub fn new(config: crate::config::AppConfig) -> Self {
        let genesis_block = Block::new(
            0,
            vec![Transaction {
                sender: "System".to_string(),
                recipient: "genesis".to_string(),
                amount: config.genesis_balance,
                signature: "".to_string(),
            }],
            "0".to_string(),
        );

        Self {
            chain: Arc::new(Mutex::new(vec![genesis_block])),
            pending_transactions: Arc::new(Mutex::new(vec![])),
            difficulty: config.difficulty,
            mining_reward: config.mining_reward,
        }
    }

    pub fn calculate_hash(data: &str) -> String {
        let hash = Sha256::digest(data.as_bytes());
        hex::encode(hash)
    }

    pub fn validate_transaction(&self, tx: &Transaction) -> bool {
        // Перевірка балансу відправника
        self.get_balance(&tx.sender) >= tx.amount
    }

    pub fn validate_block(&self, block: &Block) -> bool {
        let chain = self.chain.lock().unwrap();
        let last_block = chain.last().unwrap();
        block.previous_hash == last_block.hash &&
        block.calculate_hash().starts_with(&"0".repeat(self.difficulty))
    }

    pub fn create_transaction(&self, tx: Transaction) -> bool {
        if self.validate_transaction(&tx) {
            self.pending_transactions.lock().unwrap().push(tx);
            true
        } else {
            false
        }
    }

    pub fn mine_pending(&self, miner_address: &str) {
        let transactions = self.pending_transactions.lock().unwrap().clone();
        let last_block = self.chain.lock().unwrap().last().unwrap().clone();
        let mut block = Block::new(last_block.index + 1, transactions, last_block.hash.clone());
        block.mine(self.difficulty);

        self.chain.lock().unwrap().push(block);
        self.pending_transactions.lock().unwrap().clear();

        // Нагорода майнеру
        let reward_tx = Transaction {
            sender: "System".to_string(),
            recipient: miner_address.to_string(),
            amount: self.mining_reward,
            signature: "".to_string(),
        };
        self.create_transaction(reward_tx);
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0;
        for block in self.chain.lock().unwrap().iter() {
            for tx in &block.transactions {
                if tx.recipient == address { balance += tx.amount; }
                if tx.sender == address { balance -= tx.amount; }
            }
        }
        for tx in self.pending_transactions.lock().unwrap().iter() {
            if tx.recipient == address { balance += tx.amount; }
            if tx.sender == address { balance -= tx.amount; }
        }
        balance
    }

    pub fn receive_block(&self, block: Value) {
        if let Ok(new_block) = serde_json::from_value::<Block>(block) {
            if self.validate_block(&new_block) {
                self.chain.lock().unwrap().push(new_block);
            } else {
                println!("Received invalid block, rejected!");
            }
        }
    }

    pub fn receive_transaction(&self, tx: Value) {
        if let Ok(new_tx) = serde_json::from_value::<Transaction>(tx) {
            if self.create_transaction(new_tx.clone()) {
                println!("Transaction accepted: {:?}", new_tx);
            } else {
                println!("Invalid transaction rejected: {:?}", new_tx);
            }
        }
    }
}
