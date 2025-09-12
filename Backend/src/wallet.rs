// FileName: /Backend/src/wallet.rs
use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer, Verifier};
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Sha256, Digest};
use bs58;
use hex;
use std::collections::HashMap;

pub struct WalletKeypair {
    pub signing: SigningKey,
    pub verifying: VerifyingKey,
}

impl WalletKeypair {
    pub fn new() -> Self {
        let mut rng = OsRng;
        let mut secret_key = [0u8; 32];
        rng.fill_bytes(&mut secret_key);

        let signing = SigningKey::from_bytes(&secret_key);
        let verifying = signing.verifying_key();
        Self { signing, verifying }
    }

    pub fn from_bytes(secret_key: &[u8; 32]) -> Result<Self, String> {
        let signing = SigningKey::from_bytes(secret_key);
        let verifying = signing.verifying_key();
        Ok(Self { signing, verifying })
    }

    pub fn address(&self) -> String {
        let hash = Sha256::digest(self.verifying.to_bytes());
        format!("AFI{}", bs58::encode(&hash[..20]).into_string())
    }

    pub fn public_key_hex(&self) -> String {
        hex::encode(self.verifying.to_bytes())
    }

    pub fn secret_key_hex(&self) -> String {
        hex::encode(self.signing.to_bytes())
    }

    pub fn sign(&self, msg: &[u8]) -> Signature {
        self.signing.sign(msg)
    }

    pub fn verify(&self, msg: &[u8], signature: &Signature) -> bool {
        self.verifying.verify(msg, signature).is_ok()
    }

    // Додано метод для отримання VerifyingKey з адреси (для валідації на бекенді)
    pub fn verifying_key_from_address(address: &str) -> Result<VerifyingKey, String> {
        // Припускаємо, що адреса починається з "AFI" і решта - це bs58 закодований хеш
        if !address.starts_with("AFI") {
            return Err("Invalid address prefix".to_string());
        }
        let bs58_part = &address[3..];
        // Виправлення: викликати into_vec() для отримання Result<Vec<u8>, DecodeError>
        let hash_bytes = bs58::decode(bs58_part)
            .into_vec()
            .map_err(|_| "Invalid bs58 encoding".to_string())?;

        // Це не пряме перетворення, оскільки адреса - це хеш публічного ключа.
        // Для валідації потрібно мати публічний ключ, який відповідає адресі.
        // У реальній системі публічний ключ може бути частиною транзакції або зберігатися в блокчейні.
        // Для спрощення, припустимо, що ми можемо отримати публічний ключ звідкись.
        // Або, що більш реалістично, транзакція повинна містити публічний ключ відправника.
        // Для цього прикладу, ми будемо використовувати публічний ключ, переданий у транзакції.
        Err("Cannot derive public key directly from address hash".to_string())
    }
}

pub struct KeypairManager {
    wallets: HashMap<String, WalletKeypair>,
}

impl KeypairManager {
    pub fn new() -> Self {
        Self {
            wallets: HashMap::new(),
        }
    }

    pub fn create_wallet(&mut self, name: String) -> String {
        let wallet = WalletKeypair::new();
        let address = wallet.address();
        self.wallets.insert(name, wallet);
        address
    }

    pub fn get_wallet(&self, name: &str) -> Option<&WalletKeypair> {
        self.wallets.get(name)
    }

    pub fn import_wallet(&mut self, name: String, secret_key: &str) -> Result<String, String> {
        let key_bytes = hex::decode(secret_key).map_err(|_| "Invalid hex key")?;
        if key_bytes.len() != 32 {
            return Err("Key must be 32 bytes".to_string());
        }

        let mut key_array = [0u8; 32];
        key_array.copy_from_slice(&key_bytes);

        let wallet = WalletKeypair::from_bytes(&key_array)?;
        let address = wallet.address();
        self.wallets.insert(name, wallet);
        Ok(address)
    }

    pub fn list_wallets(&self) -> Vec<(String, String)> {
        self.wallets.iter()
            .map(|(name, wallet)| (name.clone(), wallet.address()))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wallet_creation() {
        let wallet = WalletKeypair::new();
        let address = wallet.address();
        assert!(address.starts_with("AFI"));
    }

    #[test]
    fn test_wallet_sign_verify() {
        let wallet = WalletKeypair::new();
        let message = b"Hello, AurumFi!";
        let signature = wallet.sign(message);
        assert!(wallet.verify(message, &signature));
    }

    #[test]
    fn test_wallet_import_export() {
        let wallet = WalletKeypair::new();
        let secret_key_hex = wallet.secret_key_hex();

        let key_bytes = hex::decode(&secret_key_hex).unwrap();
        let mut key_array = [0u8; 32];
        key_array.copy_from_slice(&key_bytes);

        let imported_wallet = WalletKeypair::from_bytes(&key_array).unwrap();
        assert_eq!(wallet.address(), imported_wallet.address());
    }

    #[test]
    fn test_keypair_manager() {
        let mut manager = KeypairManager::new();
        let address = manager.create_wallet("test".to_string());
        assert!(address.starts_with("AFI"));

        let wallet = manager.get_wallet("test").unwrap();
        assert_eq!(wallet.address(), address);

        let wallets = manager.list_wallets();
        assert_eq!(wallets.len(), 1);
        assert_eq!(wallets[0].0, "test");
        assert_eq!(wallets[0].1, address);
    }
}