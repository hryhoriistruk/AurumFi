// src/smart_contracts/mod.rs
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

pub mod nep5;
pub mod vm;
pub mod gas_system;
pub mod storage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartContract {
    pub address: String,
    pub code: Vec<u8>,
    pub storage: HashMap<String, String>,
    pub author: String,
    pub version: String,
    pub gas_consumed: u64,
}

impl SmartContract {
    pub fn new(address: String, code: Vec<u8>, author: String) -> Self {
        Self {
            address,
            code,
            storage: HashMap::new(),
            author,
            version: "1.0.0".to_string(),
            gas_consumed: 0,
        }
    }

    pub fn execute(&mut self, method: &str, params: Vec<String>) -> Result<String, String> {
        // Simple contract execution simulation
        match method {
            "balanceOf" => {
                if let Some(address) = params.get(0) {
                    Ok(self.storage.get(address).unwrap_or(&"0".to_string()).clone())
                } else {
                    Err("Missing address parameter".to_string())
                }
            }
            "transfer" => {
                if params.len() >= 3 {
                    let from = &params[0];
                    let to = &params[1];
                    let amount: u64 = params[2].parse().map_err(|_| "Invalid amount")?;

                    let from_balance: u64 = self.storage.get(from).unwrap_or(&"0".to_string()).parse().unwrap_or(0);
                    if from_balance >= amount {
                        let to_balance: u64 = self.storage.get(to).unwrap_or(&"0".to_string()).parse().unwrap_or(0);
                        self.storage.insert(from.clone(), (from_balance - amount).to_string());
                        self.storage.insert(to.clone(), (to_balance + amount).to_string());
                        self.gas_consumed += 100; // Gas cost for transfer
                        Ok("true".to_string())
                    } else {
                        Err("Insufficient balance".to_string())
                    }
                } else {
                    Err("Missing parameters".to_string())
                }
            }
            _ => Err(format!("Unknown method: {}", method))
        }
    }
}