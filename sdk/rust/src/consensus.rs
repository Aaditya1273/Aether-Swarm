use crate::{AgentOutput, SwarmResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusEngine {
    pub algorithm: ConsensusAlgorithm,
    pub threshold: f64,
    pub timeout_ms: u64,
    pub stake_weights: HashMap<Uuid, u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConsensusAlgorithm {
    PBFT,           // Practical Byzantine Fault Tolerance
    StakeWeighted,  // Stake-weighted voting
    Hybrid,         // PBFT + Stake weighting
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusProposal {
    pub id: Uuid,
    pub proposer_id: Uuid,
    pub proposal_type: ProposalType,
    pub data: serde_json::Value,
    pub stake_amount: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProposalType {
    TaskExecution,
    ResourceAllocation,
    SwarmConfiguration,
    PublicGoodsInitiative,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusVote {
    pub voter_id: Uuid,
    pub proposal_id: Uuid,
    pub vote: VoteType,
    pub stake_weight: u64,
    pub reasoning: Option<String>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VoteType {
    Approve,
    Reject,
    Abstain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusResult {
    pub proposal_id: Uuid,
    pub decision: ConsensusDecision,
    pub vote_summary: VoteSummary,
    pub finalized_at: u64,
    pub execution_approved: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConsensusDecision {
    Approved,
    Rejected,
    Timeout,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoteSummary {
    pub total_votes: u32,
    pub approve_votes: u32,
    pub reject_votes: u32,
    pub abstain_votes: u32,
    pub total_stake: u64,
    pub approve_stake: u64,
    pub reject_stake: u64,
    pub participation_rate: f64,
}

impl ConsensusEngine {
    pub fn new(
        algorithm: ConsensusAlgorithm,
        threshold: f64,
        timeout_ms: u64,
    ) -> Self {
        Self {
            algorithm,
            threshold,
            timeout_ms,
            stake_weights: HashMap::new(),
        }
    }

    pub fn add_agent_stake(&mut self, agent_id: Uuid, stake: u64) {
        self.stake_weights.insert(agent_id, stake);
    }

    pub async fn process_consensus(
        &self,
        proposal: ConsensusProposal,
        votes: Vec<ConsensusVote>,
    ) -> SwarmResult<ConsensusResult> {
        match self.algorithm {
            ConsensusAlgorithm::PBFT => self.pbft_consensus(proposal, votes).await,
            ConsensusAlgorithm::StakeWeighted => self.stake_weighted_consensus(proposal, votes).await,
            ConsensusAlgorithm::Hybrid => self.hybrid_consensus(proposal, votes).await,
        }
    }

    async fn pbft_consensus(
        &self,
        proposal: ConsensusProposal,
        votes: Vec<ConsensusVote>,
    ) -> SwarmResult<ConsensusResult> {
        let total_agents = self.stake_weights.len() as u32;
        let required_votes = ((total_agents as f64 * self.threshold).ceil() as u32).max(1);

        let vote_summary = self.calculate_vote_summary(&votes);

        let decision = if vote_summary.approve_votes >= required_votes {
            ConsensusDecision::Approved
        } else if vote_summary.reject_votes > total_agents - required_votes {
            ConsensusDecision::Rejected
        } else {
            ConsensusDecision::Timeout
        };

        Ok(ConsensusResult {
            proposal_id: proposal.id,
            decision: decision.clone(),
            vote_summary,
            finalized_at: chrono::Utc::now().timestamp() as u64,
            execution_approved: matches!(decision, ConsensusDecision::Approved),
        })
    }

    async fn stake_weighted_consensus(
        &self,
        proposal: ConsensusProposal,
        votes: Vec<ConsensusVote>,
    ) -> SwarmResult<ConsensusResult> {
        let vote_summary = self.calculate_vote_summary(&votes);
        let total_stake = self.stake_weights.values().sum::<u64>();
        let required_stake = (total_stake as f64 * self.threshold) as u64;

        let decision = if vote_summary.approve_stake >= required_stake {
            ConsensusDecision::Approved
        } else if vote_summary.reject_stake > total_stake - required_stake {
            ConsensusDecision::Rejected
        } else {
            ConsensusDecision::Timeout
        };

        Ok(ConsensusResult {
            proposal_id: proposal.id,
            decision: decision.clone(),
            vote_summary,
            finalized_at: chrono::Utc::now().timestamp() as u64,
            execution_approved: matches!(decision, ConsensusDecision::Approved),
        })
    }

    async fn hybrid_consensus(
        &self,
        proposal: ConsensusProposal,
        votes: Vec<ConsensusVote>,
    ) -> SwarmResult<ConsensusResult> {
        // Combine PBFT and stake-weighted approaches
        let pbft_result = self.pbft_consensus(proposal.clone(), votes.clone()).await?;
        let stake_result = self.stake_weighted_consensus(proposal, votes).await?;

        // Both must approve for hybrid consensus
        let decision = match (pbft_result.decision, stake_result.decision) {
            (ConsensusDecision::Approved, ConsensusDecision::Approved) => ConsensusDecision::Approved,
            (ConsensusDecision::Rejected, _) | (_, ConsensusDecision::Rejected) => ConsensusDecision::Rejected,
            _ => ConsensusDecision::Timeout,
        };

        Ok(ConsensusResult {
            proposal_id: pbft_result.proposal_id,
            decision: decision.clone(),
            vote_summary: stake_result.vote_summary, // Use stake-weighted summary
            finalized_at: chrono::Utc::now().timestamp() as u64,
            execution_approved: matches!(decision, ConsensusDecision::Approved),
        })
    }

    fn calculate_vote_summary(&self, votes: &[ConsensusVote]) -> VoteSummary {
        let mut approve_votes = 0;
        let mut reject_votes = 0;
        let mut abstain_votes = 0;
        let mut approve_stake = 0;
        let mut reject_stake = 0;
        let mut total_stake = 0;

        for vote in votes {
            let stake = self.stake_weights.get(&vote.voter_id).copied().unwrap_or(0);
            total_stake += stake;

            match vote.vote {
                VoteType::Approve => {
                    approve_votes += 1;
                    approve_stake += stake;
                }
                VoteType::Reject => {
                    reject_votes += 1;
                    reject_stake += stake;
                }
                VoteType::Abstain => {
                    abstain_votes += 1;
                }
            }
        }

        let total_possible_stake: u64 = self.stake_weights.values().sum();
        let participation_rate = if total_possible_stake > 0 {
            total_stake as f64 / total_possible_stake as f64
        } else {
            0.0
        };

        VoteSummary {
            total_votes: votes.len() as u32,
            approve_votes,
            reject_votes,
            abstain_votes,
            total_stake,
            approve_stake,
            reject_stake,
            participation_rate,
        }
    }

    /// Create a proposal from agent outputs for swarm consensus
    pub fn create_proposal_from_outputs(
        &self,
        outputs: Vec<AgentOutput>,
        proposal_type: ProposalType,
    ) -> SwarmResult<ConsensusProposal> {
        // Aggregate agent outputs into a consensus proposal
        let aggregated_data = serde_json::json!({
            "agent_outputs": outputs,
            "output_count": outputs.len(),
            "average_confidence": outputs.iter()
                .map(|o| o.confidence)
                .sum::<f64>() / outputs.len() as f64,
            "total_resources_used": {
                "inference_calls": outputs.iter().map(|o| o.resources_used.inference_calls).sum::<u32>(),
                "tokens_consumed": outputs.iter().map(|o| o.resources_used.tokens_consumed).sum::<u32>(),
                "stake_consumed": outputs.iter().map(|o| o.resources_used.stake_consumed).sum::<u64>(),
            }
        });

        let total_stake = outputs.iter()
            .map(|o| o.resources_used.stake_consumed)
            .sum::<u64>();

        Ok(ConsensusProposal {
            id: Uuid::new_v4(),
            proposer_id: Uuid::new_v4(), // Swarm proposer
            proposal_type,
            data: aggregated_data,
            stake_amount: total_stake,
            timestamp: chrono::Utc::now().timestamp() as u64,
        })
    }

    /// Simulate agent voting based on output confidence and stake
    pub fn simulate_agent_votes(
        &self,
        proposal: &ConsensusProposal,
        agent_outputs: &[AgentOutput],
    ) -> Vec<ConsensusVote> {
        let mut votes = Vec::new();

        for output in agent_outputs {
            let stake = self.stake_weights.get(&output.agent_id).copied().unwrap_or(1000);
            
            // Vote based on confidence threshold
            let vote = if output.confidence >= 0.7 {
                VoteType::Approve
            } else if output.confidence < 0.3 {
                VoteType::Reject
            } else {
                VoteType::Abstain
            };

            votes.push(ConsensusVote {
                voter_id: output.agent_id,
                proposal_id: proposal.id,
                vote,
                stake_weight: stake,
                reasoning: Some(format!("Confidence: {:.2}", output.confidence)),
                timestamp: chrono::Utc::now().timestamp() as u64,
            });
        }

        votes
    }
}