use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use std::convert::TryInto;

#[derive(Debug)]
pub enum TransactionError {
    InvalidSignature,
}

pub struct Transaction {
    pub message: Vec<u8>,
    pub signature: Vec<u8>,
    pub public_key_bytes: [u8; 32],
}

impl Transaction {
    pub fn verify_transaction_signature(&self) -> Result<(), TransactionError> {
        let public_key = VerifyingKey::from_bytes(&self.public_key_bytes)
            .map_err(|_| TransactionError::InvalidSignature)?;

        let signature_array: &[u8; 64] = self.signature.as_slice()
            .try_into()
            .map_err(|_| TransactionError::InvalidSignature)?;

        let signature = Signature::from_slice(signature_array)
            .map_err(|_| TransactionError::InvalidSignature)?;

        public_key
            .verify(&self.message, &signature)
            .map_err(|_| TransactionError::InvalidSignature)
    }
}