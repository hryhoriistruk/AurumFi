use crate::blockchain::block::{Block, Transaction};
use crate::config::AppConfig;

#[derive(Debug)]
pub struct Blockchain {
    pub chain: Vec<Block>,
    pub pending_transactions: Vec<Transaction>,
    pub difficulty: usize,
    pub mining_reward: u64,
    pub config: AppConfig,
}

impl Blockchain {
    pub fn new(config: AppConfig) -> Self {
        let mut blockchain = Blockchain {
            chain: vec![],
            pending_transactions: vec![],
            difficulty: 3,  // можна збільшити
            mining_reward: 50,
            config,
        };
        blockchain.create_genesis_block();
        blockchain
    }

    pub fn create_genesis_block(&mut self) {
        let genesis_block = Block::new(0, vec![], String::from("0"));
        self.chain.push(genesis_block);
    }

    pub fn get_last_block(&self) -> &Block {
        self.chain.last().unwrap()
    }

    pub fn add_transaction(&mut self, transaction: Transaction) {
        self.pending_transactions.push(transaction);
    }

    pub fn mine_pending_transactions(&mut self, miner_address: String) {
        let mut block = Block::new(
            (self.chain.len()) as u64,
            self.pending_transactions.clone(),
            self.get_last_block().hash.clone(),
        );
        block.mine(self.difficulty);
        self.chain.push(block);

        // винагорода майнеру
        self.pending_transactions = vec![Transaction {
            sender: String::from("system"),
            recipient: miner_address,
            amount: self.mining_reward,
        }];
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0;
        for block in &self.chain {
            for tx in &block.transactions {
                if tx.sender == address {
                    balance -= tx.amount;
                }
                if tx.recipient == address {
                    balance += tx.amount;
                }
            }
        }
        balance
    }

    pub fn is_chain_valid(&self) -> bool {
        for i in 1..self.chain.len() {
            let current_block = &self.chain[i];
            let previous_block = &self.chain[i - 1];

            if current_block.hash != current_block.calculate_hash() {
                return false;
            }
            if current_block.previous_hash != previous_block.hash {
                return false;
            }
        }
        true
    }
}
