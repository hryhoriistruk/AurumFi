use crate::blockchain::block::Block;
use serde_json;
use std::fs;

pub fn save_chain_to_disk(path: &str, chain: &Vec<Block>) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(chain)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn load_chain_from_disk(path: &str) -> Result<Vec<Block>, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path)?;
    let chain: Vec<Block> = serde_json::from_str(&json)?;
    Ok(chain)
}
