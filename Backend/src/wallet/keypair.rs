use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer};
use rand::rngs::OsRng;
use rand::RngCore; // <-- needed for fill_bytes
use sha2::{Digest, Sha256};
use bs58;
use hex;

pub struct WalletKeypair {
    pub signing: SigningKey,
    pub verifying: VerifyingKey,
}

impl WalletKeypair {
    pub fn new() -> Self {
        let mut rng = OsRng;
        let mut secret_key = [0u8; 32];
        rng.fill_bytes(&mut secret_key); // RngCore trait needed
        let signing = SigningKey::from_bytes(&secret_key);
        let verifying = signing.verifying_key();
        Self { signing, verifying }
    }

    pub fn from_secret_bytes(secret_key_bytes: [u8; 32]) -> Self {
        let signing = SigningKey::from_bytes(&secret_key_bytes);
        let verifying = signing.verifying_key();
        Self { signing, verifying }
    }

    pub fn secret_bytes(&self) -> [u8; 32] {
        self.signing.to_bytes()
    }

    pub fn public_bytes(&self) -> [u8; 32] {
        self.verifying.to_bytes()
    }

    pub fn address(&self) -> String {
        let hash = Sha256::digest(&self.verifying.to_bytes());
        bs58::encode(hash).into_string()
    }

    pub fn public_key_hex(&self) -> String {
        hex::encode(self.verifying.to_bytes())
    }

    pub fn secret_key_hex(&self) -> String {
        hex::encode(self.signing.to_bytes())
    }

    pub fn sign(&self, msg: &[u8]) -> Signature {
        self.signing.sign(msg) // Signer trait imported
    }

    pub fn get_balance(&self) -> u64 {
        0
    }
}
