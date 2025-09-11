use ed25519_dalek::{Signature, Verifier, VerifyingKey};

#[derive(Debug)]
pub enum MultisigError {
    InvalidSignature,
}

pub struct MultisigWallet {
    pub public_keys: Vec<VerifyingKey>,
    pub threshold: usize,
}

impl MultisigWallet {
    pub fn new(public_keys: Vec<VerifyingKey>, threshold: usize) -> Self {
        MultisigWallet { public_keys, threshold }
    }

    pub fn verify_multisig_signature(
        &self,
        message: &[u8],
        signature_bytes: &[u8],
    ) -> Result<(), MultisigError> {
        let signature = Signature::from_slice(signature_bytes).map_err(|_| MultisigError::InvalidSignature)?;

        for pk in &self.public_keys {
            if pk.verify(message, &signature).is_ok() {
                return Ok(());
            }
        }

        Err(MultisigError::InvalidSignature)
    }
}

pub struct MultisigTransaction {
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
}