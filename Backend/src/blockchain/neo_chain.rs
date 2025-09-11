// src/blockchain/neo_chain.rs

use crate::config::AppConfig;

#[derive(Debug)]
pub enum BlockchainError {
    SomeError,
}

#[derive(Clone, Debug)]
pub struct NeoBlockchain {
    pub chain_data: Vec<u8>,
    pub height: u64,
}

impl NeoBlockchain {
    pub fn new(_cfg: AppConfig) -> Self {
        NeoBlockchain {
            chain_data: Vec::new(),
            height: 0,
        }
    }

    pub async fn start(&mut self) -> Result<(), BlockchainError> {
        // Заглушка — тут буде запуск вузла
        log::info!("Blockchain started at height {}", self.height);
        Ok(())
    }
}
