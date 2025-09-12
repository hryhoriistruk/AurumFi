use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer};
use rand::rngs::OsRng;
use sha2::{Sha256, Digest};
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
        rng.fill_bytes(&mut secret_key);
        let signing = SigningKey::from_bytes(&secret_key);
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

    pub fn sign(&self, msg: &[u8]) -> Signature {
        self.signing.sign(msg)
    }
}
