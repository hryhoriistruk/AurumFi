use sha2::{Sha256, Digest};

pub fn calculate_hash(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn proof_of_work(previous_hash: &str, transactions: &str, difficulty: u32) -> (u64, String) {
    let mut nonce = 0u64;
    loop {
        let data = format!("{}{}{}", previous_hash, transactions, nonce);
        let hash = calculate_hash(&data);
        if hash.starts_with(&"0".repeat(difficulty as usize)) {
            return (nonce, hash);
        }
        nonce += 1;
    }
}
