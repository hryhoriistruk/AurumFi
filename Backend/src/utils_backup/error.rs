use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Crypto error: {0}")]
    Crypto(String),
    #[error("Blockchain error: {0}")]
    Blockchain(String),
    #[error("Wallet error: {0}")]
    Wallet(String),
    #[error("Network error: {0}")]
    Network(String),
    #[error("Contract error: {0}")]
    Contract(String),
    #[error("Configuration error: {0}")]
    Config(String),
    #[error("Database error: {0}")]
    Database(String),
}

impl From<ed25519_dalek::SignatureError> for Error {
    fn from(err: ed25519_dalek::SignatureError) -> Self {
        Error::Crypto(format!("Signature error: {}", err))
    }
}

impl From<hex::FromHexError> for Error {
    fn from(err: hex::FromHexError) -> Self {
        Error::Crypto(format!("Hex conversion error: {}", err))
    }
}