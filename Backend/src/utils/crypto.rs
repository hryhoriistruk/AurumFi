use ed25519_dalek::{Signature, Verifier, VerifyingKey};

pub fn verify_signature(
    public_key_bytes: &[u8],
    message: &[u8],
    signature_bytes: &[u8],
) -> bool {
    let public_key = match <&[u8; 32]>::try_from(public_key_bytes) {
        Ok(bytes) => match VerifyingKey::from_bytes(bytes) {
            Ok(pk) => pk,
            Err(_) => return false,
        },
        Err(_) => return false,
    };

    let signature = match Signature::from_slice(signature_bytes) {
        Ok(sig) => sig,
        Err(_) => return false,
    };

    public_key.verify(message, &signature).is_ok()
}