use crate::config::AppConfig;
use chrono::Utc;
use sha2::{Digest, Sha256};
use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{Read, Write};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub sender: String,
    pub recipient: String,
    pub amount: u64,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub index: u64,
    pub timestamp: i64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub nonce: u64,
    pub hash: String,
}

impl Block {
    pub fn new(index: u64, transactions: Vec<Transaction>, previous_hash: String) -> Self {
        let mut block = Self {
            index,
            timestamp: Utc::now().timestamp(),
            transactions,
            previous_hash,
            nonce: 0,
            hash: String::new(),
        };
        block.hash = block.calculate_hash();
        block
    }

    pub fn calculate_hash(&self) -> String {
        let serialized = serde_json::to_string(self).unwrap();
        let mut hasher = Sha256::new();
        hasher.update(serialized.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn mine(&mut self, difficulty: usize) {
        let target = "0".repeat(difficulty);
        while !self.hash.starts_with(&target) {
            self.nonce += 1;
            self.hash = self.calculate_hash();
        }
    }
}

#[derive(Debug, Clone)]
pub struct NeoBlockchain {
    pub chain: Arc<Mutex<Vec<Block>>>,
    pub pending_transactions: Arc<Mutex<Vec<Transaction>>>,
    pub config: AppConfig,
}

#[derive(Debug, thiserror::Error)]
pub enum BlockchainError {
    #[error("Blockchain runtime error")]
    RuntimeError,
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

impl NeoBlockchain {
    pub fn new(cfg: AppConfig) -> Self {
        let mut blockchain = Self {
            chain: Arc::new(Mutex::new(vec![])),
            pending_transactions: Arc::new(Mutex::new(vec![])),
            config: cfg.clone(),
        };
        blockchain.create_genesis_block();
        blockchain
    }

    fn create_genesis_block(&mut self) {
        let genesis = Block::new(
            0,
            vec![Transaction {
                sender: "System".to_string(),
                recipient: "genesis".to_string(),
                amount: self.config.genesis_balance,
                signature: "".to_string(),
            }],
            "0".to_string(),
        );

        let mut chain = self.chain.lock().unwrap();
        chain.push(genesis);
    }

    pub fn calculate_hash(data: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn validate_transaction(&self, tx: &Transaction) -> bool {
        self.get_balance(&tx.sender) >= tx.amount
    }

    pub fn validate_block(&self, block: &Block) -> bool {
        let chain = self.chain.lock().unwrap();
        if let Some(last_block) = chain.last() {
            block.previous_hash == last_block.hash &&
            block.hash.starts_with(&"0".repeat(self.config.difficulty))
        } else {
            false
        }
    }

    pub fn create_transaction(&self, tx: Transaction) -> bool {
        if self.validate_transaction(&tx) {
            self.pending_transactions.lock().unwrap().push(tx);
            true
        } else {
            false
        }
    }

    pub fn create_transaction_with_params(&self, from: &str, to: &str, amount: u64) -> bool {
        let tx = Transaction {
            sender: from.to_string(),
            recipient: to.to_string(),
            amount,
            signature: "unsigned".to_string(),
        };
        self.create_transaction(tx)
    }

    pub fn mine_pending(&self, miner_address: &str) {
        let transactions = self.pending_transactions.lock().unwrap().clone();
        let chain = self.chain.lock().unwrap();
        let last_block = chain.last().unwrap().clone();
        drop(chain);

        let mut block = Block::new(last_block.index + 1, transactions, last_block.hash.clone());
        block.mine(self.config.difficulty);

        let mut chain = self.chain.lock().unwrap();
        chain.push(block);
        self.pending_transactions.lock().unwrap().clear();

        // Нагорода майнеру
        let reward_tx = Transaction {
            sender: "System".to_string(),
            recipient: miner_address.to_string(),
            amount: self.config.mining_reward,
            signature: "".to_string(),
        };
        self.create_transaction(reward_tx);
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0;
        let chain = self.chain.lock().unwrap();

        for block in chain.iter() {
            for tx in &block.transactions {
                if tx.recipient == address {
                    balance += tx.amount;
                }
                if tx.sender == address {
                    balance -= tx.amount;
                }
            }
        }

        let pending_txs = self.pending_transactions.lock().unwrap();
        for tx in pending_txs.iter() {
            if tx.recipient == address {
                balance += tx.amount;
            }
            if tx.sender == address {
                balance -= tx.amount;
            }
        }

        balance
    }

    pub fn load_from_file(&self, filename: &str) -> Result<(), BlockchainError> {
        if let Ok(mut file) = File::open(filename) {
            let mut contents = String::new();
            file.read_to_string(&mut contents)?;
            let loaded: Vec<Block> = serde_json::from_str(&contents)?;

            let mut chain = self.chain.lock().unwrap();
            *chain = loaded;
            Ok(())
        } else {
            Err(BlockchainError::RuntimeError)
        }
    }

    pub fn save_to_file(&self, filename: &str) -> Result<(), BlockchainError> {
        let chain = self.chain.lock().unwrap();
        let mut file = File::create(filename)?;
        let json = serde_json::to_string(&*chain)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }

    pub fn get_network_stats(&self) -> HashMap<String, String> {
        let mut stats = HashMap::new();
        let chain = self.chain.lock().unwrap();

        stats.insert("total_blocks".to_string(), chain.len().to_string());
        stats.insert("pending_transactions".to_string(), self.pending_transactions.lock().unwrap().len().to_string());
        stats.insert("difficulty".to_string(), self.config.difficulty.to_string());
        stats.insert("mining_reward".to_string(), self.config.mining_reward.to_string());

        if let Some(last_block) = chain.last() {
            stats.insert("latest_block_hash".to_string(), last_block.hash.clone());
        } else {
            stats.insert("latest_block_hash".to_string(), "".to_string());
        }

        stats
    }

    // НОВІ МЕТОДИ ДЛЯ P2P МЕРЕЖІ
    pub fn receive_block(&self, block_value: Value) -> bool {
        if let Ok(block) = serde_json::from_value::<Block>(block_value) {
            if self.validate_block(&block) {
                let mut chain = self.chain.lock().unwrap();

                // Перевіряємо, чи блок ще не існує
                if chain.iter().any(|b| b.hash == block.hash) {
                    println!("Block already exists in chain");
                    return false;
                }

                chain.push(block);
                println!("Block added from network");
                return true;
            } else {
                println!("Invalid block received, rejected");
            }
        } else {
            println!("Failed to deserialize block");
        }
        false
    }

    pub fn receive_transaction(&self, tx_value: Value) -> bool {
        if let Ok(tx) = serde_json::from_value::<Transaction>(tx_value) {
            if self.create_transaction(tx.clone()) {
                println!("Transaction accepted from network: {:?}", tx);
                return true;
            } else {
                println!("Invalid transaction rejected: {:?}", tx);
            }
        } else {
            println!("Failed to deserialize transaction");
        }
        false
    }

    pub fn get_last_block(&self) -> Option<Block> {
        let chain = self.chain.lock().unwrap();
        chain.last().cloned()
    }

    pub fn get_block_count(&self) -> usize {
        let chain = self.chain.lock().unwrap();
        chain.len()
    }

    pub fn get_pending_transactions_count(&self) -> usize {
        let pending_txs = self.pending_transactions.lock().unwrap();
        pending_txs.len()
    }

    pub fn get_chain_json(&self) -> Result<String, BlockchainError> {
        let chain = self.chain.lock().unwrap();
        let json = serde_json::to_string(&*chain)?;
        Ok(json)
    }

    pub fn replace_chain(&self, new_chain: Vec<Block>) -> bool {
        // Перевіряємо чи нова ланцюг довша і валідна
        let current_chain = self.chain.lock().unwrap();
        if new_chain.len() > current_chain.len() && self.validate_chain(&new_chain) {
            drop(current_chain);
            let mut chain = self.chain.lock().unwrap();
            *chain = new_chain;
            println!("Chain replaced with longer valid chain");
            true
        } else {
            println!("New chain is not longer or invalid");
            false
        }
    }

    fn validate_chain(&self, chain: &[Block]) -> bool {
        for i in 1..chain.len() {
            let previous_block = &chain[i - 1];
            let current_block = &chain[i];

            if current_block.previous_hash != previous_block.hash {
                return false;
            }

            if !current_block.hash.starts_with(&"0".repeat(self.config.difficulty)) {
                return false;
            }
        }
        true
    }
}