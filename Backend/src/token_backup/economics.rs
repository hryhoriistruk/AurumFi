use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenEconomics {
    pub initial_supply: u64,
    pub max_supply: Option<u64>,
    pub inflation_rate: f64,
    pub staking_reward: f64,
    pub transaction_fee: u64,
    pub burn_rate: f64,
}

impl TokenEconomics {
    pub fn new() -> Self {
        Self {
            initial_supply: 100_000_000, // 100 million tokens
            max_supply: Some(1_000_000_000), // 1 billion max supply
            inflation_rate: 0.02, // 2% annual inflation
            staking_reward: 0.08, // 8% staking reward
            transaction_fee: 100, // 100 base fee units
            burn_rate: 0.0001, // 0.01% burn rate per transaction
        }
    }

    pub fn calculate_staking_rewards(&self, amount: u64, duration_days: u64) -> u64 {
        let daily_rate = self.staking_reward / 365.0;
        let total_rate = daily_rate * duration_days as f64;
        (amount as f64 * total_rate) as u64
    }

    pub fn calculate_transaction_fee(&self, amount: u64) -> u64 {
        let fee = (amount as f64 * 0.001).max(self.transaction_fee as f64) as u64;
        let burn_amount = (fee as f64 * self.burn_rate) as u64;
        fee - burn_amount
    }

    pub fn calculate_inflation(&self, current_supply: u64) -> u64 {
        (current_supply as f64 * self.inflation_rate) as u64
    }

    pub fn is_max_supply_reached(&self, current_supply: u64) -> bool {
        self.max_supply.map(|max| current_supply >= max).unwrap_or(false)
    }
}