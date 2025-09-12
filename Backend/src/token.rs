// FileName: /Backend/src/token.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AurumFiToken {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub max_supply: u64,
    pub balances: HashMap<String, u64>,
    pub allowances: HashMap<String, HashMap<String, u64>>,
    pub created_at: DateTime<Utc>,
    pub version: String,
}

impl AurumFiToken {
    pub fn new() -> Self {
        let total_supply = 21_000_000 * 10u64.pow(8); // 21 million tokens with 8 decimals
        let mut balances = HashMap::new();

        // Initial distribution
        balances.insert("founder".to_string(), total_supply / 2); // 50% to founder
        balances.insert("treasury".to_string(), total_supply / 4); // 25% to treasury
        balances.insert("mining_rewards".to_string(), total_supply / 4); // 25% for mining

        Self {
            name: "AurumFi".to_string(),
            symbol: "AFI".to_string(),
            decimals: 8,
            total_supply,
            max_supply: 21_000_000 * 10u64.pow(8),
            balances,
            allowances: HashMap::new(),
            created_at: Utc::now(),
            version: "1.0.0".to_string(),
        }
    }

    pub fn balance_of(&self, address: &str) -> u64 {
        *self.balances.get(address).unwrap_or(&0)
    }

    pub fn transfer(&mut self, from: &str, to: &str, amount: u64) -> Result<bool, String> {
        let from_balance = self.balance_of(from);

        if from_balance < amount {
            return Err("Insufficient balance".to_string());
        }

        if amount == 0 {
            return Err("Amount must be greater than 0".to_string());
        }

        // Update balances
        self.balances.insert(from.to_string(), from_balance - amount);
        let to_balance = self.balance_of(to);
        self.balances.insert(to.to_string(), to_balance + amount);

        Ok(true)
    }

    pub fn approve(&mut self, owner: &str, spender: &str, amount: u64) -> Result<bool, String> {
        let owner_allowances = self.allowances.entry(owner.to_string()).or_insert_with(HashMap::new);
        owner_allowances.insert(spender.to_string(), amount);
        Ok(true)
    }

    pub fn allowance(&self, owner: &str, spender: &str) -> u64 {
        self.allowances
            .get(owner)
            .and_then(|allowances| allowances.get(spender))
            .cloned()
            .unwrap_or(0)
    }

    pub fn transfer_from(&mut self, spender: &str, from: &str, to: &str, amount: u64) -> Result<bool, String> {
        let allowed = self.allowance(from, spender);

        if allowed < amount {
            return Err("Insufficient allowance".to_string());
        }

        // Transfer tokens
        self.transfer(from, to, amount)?;

        // Update allowance
        let owner_allowances = self.allowances.get_mut(from).unwrap();
        owner_allowances.insert(spender.to_string(), allowed - amount);

        Ok(true)
    }

    pub fn mint(&mut self, to: &str, amount: u64) -> Result<bool, String> {
        if self.total_supply + amount > self.max_supply {
            return Err("Would exceed max supply".to_string());
        }

        let to_balance = self.balance_of(to);
        self.balances.insert(to.to_string(), to_balance + amount);
        self.total_supply += amount;

        Ok(true)
    }

    pub fn burn(&mut self, from: &str, amount: u64) -> Result<bool, String> {
        let from_balance = self.balance_of(from);

        if from_balance < amount {
            return Err("Insufficient balance to burn".to_string());
        }

        self.balances.insert(from.to_string(), from_balance - amount);
        self.total_supply -= amount;

        Ok(true)
    }

    pub fn get_token_info(&self) -> TokenInfo {
        TokenInfo {
            name: self.name.clone(),
            symbol: self.symbol.clone(),
            decimals: self.decimals,
            total_supply: self.total_supply,
            max_supply: self.max_supply,
            holders: self.balances.len(),
            created_at: self.created_at,
            version: self.version.clone(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenInfo {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub max_supply: u64,
    pub holders: usize,
    pub created_at: DateTime<Utc>,
    pub version: String,
}