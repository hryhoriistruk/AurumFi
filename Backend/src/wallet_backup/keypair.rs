use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer}; // <- додали Signer
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Sha256, Digest};
use bs58;
use hex;

pub struct WalletKeypair {
    pub signing: SigningKey,
    pub verifying: VerifyingKey,
}

impl WalletKeypair {
    pub fn new() -> Self {
        let mut rng = OsRng{};
        let mut bytes = [0u8; 32];
        rng.fill_bytes(&mut bytes);
        let signing = SigningKey::from_bytes(&bytes);
        let verifying = signing.verifying_key();
        Self { signing, verifying }
    }

    pub fn address(&self) -> String {
        let hash = Sha256::digest(self.verifying.to_bytes());
        bs58::encode(hash).into_string()
    }

    pub fn public_key_hex(&self) -> String {
        hex::encode(self.verifying.to_bytes())
    }

    pub fn secret_key_hex(&self) -> String {
        hex::encode(self.signing.to_bytes())
    }

    pub fn sign(&self, msg: &[u8]) -> Signature {
        self.signing.try_sign(msg).expect("Signing failed")
    }
}
