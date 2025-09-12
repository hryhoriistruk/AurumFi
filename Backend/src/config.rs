// FileName: /Backend/src/config.rs
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub node_name: String,
    pub difficulty: usize,
    pub genesis_balance: u64,
    pub mining_reward: u64,
    pub transaction_fee: u64,
    pub chain_file: String,
}

impl AppConfig {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let contents = fs::read_to_string(path)?;
        let cfg: AppConfig = toml::from_str(&contents)?;
        Ok(cfg)
    }
}