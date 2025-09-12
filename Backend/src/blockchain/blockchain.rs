use crate::config::AppConfig;
use chrono::Utc;
use sha2::{Digest, Sha256};
use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{Read, Write};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
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

#[derive(Debug)]
pub struct NeoBlockchain {
    pub chain: Arc<Mutex<Vec<Block>>>,
    pub pending_transactions: Vec<Transaction>,
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
            pending_transactions: vec![],
            config: cfg,
        };
        blockchain.create_genesis_block();
        blockchain
    }

    fn create_genesis_block(&mut self) {
        let genesis = Block {
            index: 0,
            timestamp: Utc::now().timestamp(),
            transactions: vec![],
            previous_hash: String::from("0"),
            nonce: 0,
            hash: String::new(),
        };
        let hash = self.calculate_hash(&genesis);
        let mut genesis = genesis;
        genesis.hash = hash;

        let mut chain = self.chain.lock().unwrap();
        chain.push(genesis);
    }

    fn calculate_hash(&self, block: &Block) -> String {
        let serialized = serde_json::to_string(block).unwrap();
        let mut hasher = Sha256::new();
        hasher.update(serialized.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn create_transaction(&mut self, from: &str, to: &str, amount: u64) -> bool {
        let tx = Transaction {
            from: from.to_string(),
            to: to.to_string(),
            amount,
        };
        self.pending_transactions.push(tx);
        true
    }

    pub fn mine_block(&mut self, miner_address: &str) -> Result<(), BlockchainError> {
        let mut chain = self.chain.lock().unwrap();
        let index = chain.len() as u64;
        let previous_hash = chain.last().unwrap().hash.clone();
        let transactions = self.pending_transactions.clone();

        let mut nonce = 0;
        let mut new_block = Block {
            index,
            timestamp: Utc::now().timestamp(),
            transactions,
            previous_hash,
            nonce,
            hash: String::new(),
        };

        loop {
            let hash = self.calculate_hash(&new_block);
            if hash.starts_with("00") {
                new_block.hash = hash;
                break;
            }
            nonce += 1;
            new_block.nonce = nonce;
        }

        chain.push(new_block);
        self.pending_transactions = vec![Transaction {
            from: String::from("System"),
            to: miner_address.to_string(),
            amount: self.config.mining_reward,
        }];
        Ok(())
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0;
        let chain = self.chain.lock().unwrap();

        for block in chain.iter() {
            for tx in &block.transactions {
                if tx.from == address {
                    balance -= tx.amount;
                }
                if tx.to == address {
                    balance += tx.amount;
                }
            }
        }
        balance
    }

    pub fn load_from_file(&mut self, filename: &str) -> Result<(), BlockchainError> {
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
        stats.insert("pending_transactions".to_string(), self.pending_transactions.len().to_string());
        stats.insert("difficulty".to_string(), self.config.difficulty.to_string());
        stats.insert("mining_reward".to_string(), self.config.mining_reward.to_string());

        if let Some(last_block) = chain.last() {
            stats.insert("latest_block_hash".to_string(), last_block.hash.clone());
        } else {
            stats.insert("latest_block_hash".to_string(), "".to_string());
        }

        stats
    }

    pub fn mine_pending(&mut self, miner_address: &str) {
        let _ = self.mine_block(miner_address);
    }
}