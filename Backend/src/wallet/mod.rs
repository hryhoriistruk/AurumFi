pub mod keypair;

pub use keypair::WalletKeypair;  // робимо публічним

use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Менеджер гаманців
pub struct KeypairManager {
    wallets: HashMap<String, WalletKeypair>,
    storage_path: String,
}

impl KeypairManager {
    pub fn new(storage_path: String) -> Self {
        fs::create_dir_all(&storage_path).ok();
        KeypairManager {
            wallets: HashMap::new(),
            storage_path,
        }
    }

    /// Створити новий гаманець
    pub fn create_wallet(&mut self, name: &str) -> Result<&WalletKeypair, String> {
        let wallet = WalletKeypair::new();
        let address = wallet.address();
        self.wallets.insert(address.clone(), wallet);

        let secret_path = Path::new(&self.storage_path).join(format!("{}.key", name));
        fs::write(secret_path, self.wallets[&address].secret_key_hex())
            .map_err(|e| e.to_string())?;

        Ok(self.wallets.get(&address).unwrap())
    }

    /// Отримати гаманець за адресою
    pub fn get_wallet(&self, address: &str) -> Option<&WalletKeypair> {
        self.wallets.get(address)
    }
}
