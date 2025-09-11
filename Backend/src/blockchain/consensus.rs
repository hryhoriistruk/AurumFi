// src/blockchain/consensus.rs

use crate::blockchain::neo_chain::BlockchainError;

#[derive(Debug)]
pub enum ConsensusError {
    ChainError,
    OtherError,
}

impl From<BlockchainError> for ConsensusError {
    fn from(_err: BlockchainError) -> Self {
        ConsensusError::ChainError
    }
}

pub struct ConsensusEngine;

impl ConsensusEngine {
    pub fn new() -> Self {
        ConsensusEngine
    }
}