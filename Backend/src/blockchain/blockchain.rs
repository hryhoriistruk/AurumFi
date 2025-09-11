use crate::config::AppConfig;
use chrono::Utc;
use sha2::{Digest, Sha256};
use serde::{Serialize, Deserialize};

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
    pub chain: Vec<Block>,
    pub pending_transactions: Vec<Transaction>,
    pub config: AppConfig,
}

#[derive(Debug, thiserror::Error)]
pub enum BlockchainError {
    #[error("Blockchain runtime error")]
    RuntimeError,
}

impl NeoBlockchain {
    pub fn new(cfg: AppConfig) -> Self {
        let mut blockchain = Self {
            chain: vec![],
            pending_transactions: vec![],
            config: cfg,
        };
        // Створюємо блок генезису
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
        self.chain.push(genesis);
    }

    fn calculate_hash(&self, block: &Block) -> String {
        let serialized = serde_json::to_string(block).unwrap();
        let mut hasher = Sha256::new();
        hasher.update(serialized.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn create_transaction(&mut self, from: &str, to: &str, amount: u64) {
        let tx = Transaction {
            from: from.to_string(),
            to: to.to_string(),
            amount,
        };
        self.pending_transactions.push(tx);
    }

    pub fn mine_block(&mut self, miner_address: &str) -> Result<(), BlockchainError> {
        let index = self.chain.len() as u64;
        let previous_hash = self.chain.last().unwrap().hash.clone();
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

        // Проста Proof-of-Work (хеш починається з "00")
        loop {
            let hash = self.calculate_hash(&new_block);
            if hash.starts_with("00") {
                new_block.hash = hash;
                break;
            }
            nonce += 1;
            new_block.nonce = nonce;
        }

        self.chain.push(new_block);
        self.pending_transactions = vec![Transaction {
            from: String::from("System"),
            to: miner_address.to_string(),
            amount: 50, // винагорода майнеру
        }];
        Ok(())
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0;
        for block in &self.chain {
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
}
