// src/utils.rs
use sha2::{Sha256, Digest};
use hex;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn calculate_hash(data: &str) -> String {
    let hash = Sha256::digest(data.as_bytes());
    hex::encode(hash)
}

pub fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

pub fn format_amount(amount: u64, decimals: u8) -> String {
    let divisor = 10u64.pow(decimals as u32);
    let whole = amount / divisor;
    let fraction = amount % divisor;

    if fraction == 0 {
        format!("{}", whole)
    } else {
        format!("{}.{:0width$}", whole, fraction, width = decimals as usize)
            .trim_end_matches('0')
            .trim_end_matches('.')
            .to_string()
    }
}

pub fn parse_amount(amount_str: &str, decimals: u8) -> Result<u64, String> {
    let parts: Vec<&str> = amount_str.split('.').collect();

    match parts.len() {
        1 => {
            // No decimal point
            let whole: u64 = parts[0].parse().map_err(|_| "Invalid amount")?;
            Ok(whole * 10u64.pow(decimals as u32))
        }
        2 => {
            // Has decimal point
            let whole: u64 = parts[0].parse().map_err(|_| "Invalid whole part")?;
            let mut fraction_str = parts[1].to_string();

            // Pad or truncate fraction to match decimals
            if fraction_str.len() > decimals as usize {
                fraction_str.truncate(decimals as usize);
            } else {
                while fraction_str.len() < decimals as usize {
                    fraction_str.push('0');
                }
            }

            let fraction: u64 = fraction_str.parse().map_err(|_| "Invalid fraction part")?;
            Ok(whole * 10u64.pow(decimals as u32) + fraction)
        }
        _ => Err("Invalid amount format".to_string())
    }
}