use crate::wallet::WalletAddress;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceToken {
    votes: HashMap<WalletAddress, u64>,
    proposals: HashMap<u64, Proposal>,
    next_proposal_id: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub creator: WalletAddress,
    pub votes_for: u64,
    pub votes_against: u64,
    pub created_at: i64,
    pub end_time: i64,
    pub executed: bool,
}

impl GovernanceToken {
    pub fn new() -> Self {
        Self {
            votes: HashMap::new(),
            proposals: HashMap::new(),
            next_proposal_id: 1,
        }
    }

    pub fn create_proposal(
        &mut self,
        creator: WalletAddress,
        title: String,
        description: String,
        duration_days: u64,
    ) -> u64 {
        let proposal_id = self.next_proposal_id;
        self.next_proposal_id += 1;

        let proposal = Proposal {
            id: proposal_id,
            title,
            description,
            creator,
            votes_for: 0,
            votes_against: 0,
            created_at: chrono::Utc::now().timestamp(),
            end_time: chrono::Utc::now().timestamp() + (duration_days * 86400) as i64,
            executed: false,
        };

        self.proposals.insert(proposal_id, proposal);
        proposal_id
    }

    pub fn vote(
        &mut self,
        voter: WalletAddress,
        proposal_id: u64,
        vote_power: u64,
        in_favor: bool,
    ) -> Result<(), GovernanceError> {
        let proposal = self.proposals.get_mut(&proposal_id)
            .ok_or(GovernanceError::ProposalNotFound)?;

        if chrono::Utc::now().timestamp() > proposal.end_time {
            return Err(GovernanceError::VotingEnded);
        }

        if in_favor {
            proposal.votes_for += vote_power;
        } else {
            proposal.votes_against += vote_power;
        }

        Ok(())
    }

    pub fn execute_proposal(&mut self, proposal_id: u64) -> Result<(), GovernanceError> {
        let proposal = self.proposals.get_mut(&proposal_id)
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.executed {
            return Err(GovernanceError::AlreadyExecuted);
        }

        if chrono::Utc::now().timestamp() < proposal.end_time {
            return Err(GovernanceError::VotingOngoing);
        }

        proposal.executed = true;

        // Here you would implement the actual proposal execution logic
        log::info!("Executing proposal: {}", proposal.title);

        Ok(())
    }

    pub fn get_proposal(&self, proposal_id: u64) -> Option<&Proposal> {
        self.proposals.get(&proposal_id)
    }

    pub fn get_all_proposals(&self) -> Vec<&Proposal> {
        self.proposals.values().collect()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum GovernanceError {
    #[error("Proposal not found")]
    ProposalNotFound,
    #[error("Voting has already ended")]
    VotingEnded,
    #[error("Voting is still ongoing")]
    VotingOngoing,
    #[error("Proposal already executed")]
    AlreadyExecuted,
    #[error("Insufficient voting power")]
    InsufficientVotingPower,
}