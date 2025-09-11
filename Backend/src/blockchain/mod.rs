pub mod network;

use crate::config::AppConfig;

#[derive(Debug)]
pub struct NeoBlockchain {
    pub config: AppConfig,
}

#[derive(Debug, thiserror::Error)]
pub enum BlockchainError {
    #[error("Blockchain runtime error")]
    RuntimeError,
}

impl NeoBlockchain {
    pub fn new(cfg: AppConfig) -> Self {
        Self { config: cfg }
    }

    pub async fn start(&mut self) -> Result<(), BlockchainError> {
        // TODO: Реалізуйте запуск ноди
        Ok(())
    }
}
