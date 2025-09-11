// src/token/nft.rs

// Якщо потрібні функції hash і hash_hex, додайте їх сюди або імпортуйте з іншого модуля

pub fn hash(data: &[u8]) -> Vec<u8> {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

pub fn hash_hex(data: &[u8]) -> String {
    hex::encode(hash(data))
}