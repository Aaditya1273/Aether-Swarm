use crate::{CortensorClient, SwarmError, SwarmResult};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::mpsc;
use uuid::Uuid;

#[async_trait]
pub trait Agent: Send + Sync {
    async fn execute(&mut self, task: AgentTask) -> SwarmResult<AgentOutput>;
    fn agent_type(&self) -> AgentType;
    fn agent_id(&self) -> Uuid;
    async fn shutdown(&mut self) -> SwarmResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentType {
    Scout,
    Verifier,
    Executor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTask {
    pub id: Uuid,
    pub task_type: TaskType,
    pub prompt: String,
    pub context: HashMap<String, serde_json::Value>,
    pub priority: u32,
    pub stake_amount: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskType {
    Scout { categories: Vec<String> },
    Verify { proposal_id: String },
    Execute { action: ExecutionAction },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExecutionAction {
    DeployContract { bytecode: String, params: Vec<String> },
    MintNFT { metadata: serde_json::Value },
    CreateGrant { amount: u64, recipient: String },
    UpdateRepository { repo_url: String, changes: Vec<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentOutput {
    pub agent_id: Uuid,
    pub task_id: Uuid,
    pub result: serde_json::Value,
    pub confidence: f64,
    pub proof_hash: Option<String>,
    pub execution_time_ms: u64,
    pub resources_used: ResourceUsage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub inference_calls: u32,
    pub tokens_consumed: u32,
    pub stake_consumed: u64,
}

// Scout Agent - Discovers public goods opportunities
pub struct ScoutAgent {
    id: Uuid,
    cortensor: CortensorClient,
    specialization: Vec<String>, // e.g., ["depin", "climate", "education"]
    memory_store: HashMap<String, serde_json::Value>,
}

impl ScoutAgent {
    pub fn new(cortensor: CortensorClient, specialization: Vec<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            cortensor,
            specialization,
            memory_store: HashMap::new(),
        }
    }

    async fn scout_github(&self, categories: &[String]) -> SwarmResult<Vec<serde_json::Value>> {
        let prompt = format!(
            "Scout GitHub for high-impact public goods projects in categories: {:?}. 
            Look for:
            1. Active repositories with recent commits
            2. Clear public benefit potential
            3. Funding/resource needs
            4. Community engagement metrics
            
            Return JSON array of opportunities with: repo_url, description, impact_score (1-10), funding_need, category",
            categories
        );

        let request = crate::cortensor::InferenceRequest {
            model: "gpt-4".to_string(),
            prompt,
            max_tokens: Some(1024),
            temperature: Some(0.3),
            session_id: None,
            proof_of_inference: true,
            stake_amount: Some(500),
        };

        let response = self.cortensor.inference(request).await?;
        
        // Parse JSON response
        let opportunities: Vec<serde_json::Value> = serde_json::from_str(&response.response)
            .unwrap_or_else(|_| vec![]);

        Ok(opportunities)
    }

    async fn scout_news_sources(&self, categories: &[String]) -> SwarmResult<Vec<serde_json::Value>> {
        let prompt = format!(
            "Analyze recent news and research for emerging public goods opportunities in: {:?}.
            Focus on:
            1. Climate tech initiatives needing support
            2. Open source infrastructure gaps
            3. DePIN deployment opportunities
            4. Educational resource needs
            
            Return JSON array with: title, source, urgency_score (1-10), resource_type, estimated_impact",
            categories
        );

        let request = crate::cortensor::InferenceRequest {
            model: "claude-3".to_string(),
            prompt,
            max_tokens: Some(1024),
            temperature: Some(0.2),
            session_id: None,
            proof_of_inference: true,
            stake_amount: Some(500),
        };

        let response = self.cortensor.inference(request).await?;
        
        let opportunities: Vec<serde_json::Value> = serde_json::from_str(&response.response)
            .unwrap_or_else(|_| vec![]);

        Ok(opportunities)
    }
}

#[async_trait]
impl Agent for ScoutAgent {
    async fn execute(&mut self, task: AgentTask) -> SwarmResult<AgentOutput> {
        let start_time = std::time::Instant::now();
        
        let result = match &task.task_type {
            TaskType::Scout { categories } => {
                let mut all_opportunities = Vec::new();
                
                // Scout multiple sources in parallel
                let github_results = self.scout_github(categories).await?;
                let news_results = self.scout_news_sources(categories).await?;
                
                all_opportunities.extend(github_results);
                all_opportunities.extend(news_results);
                
                // Score and rank opportunities
                let scored_opportunities = self.score_opportunities(all_opportunities).await?;
                
                serde_json::json!({
                    "opportunities": scored_opportunities,
                    "total_found": scored_opportunities.len(),
                    "categories_searched": categories,
                    "agent_specialization": self.specialization
                })
            }
            _ => {
                return Err(SwarmError::AgentError(
                    "Scout agent received non-scout task".to_string(),
                ));
            }
        };

        let execution_time = start_time.elapsed().as_millis() as u64;

        Ok(AgentOutput {
            agent_id: self.id,
            task_id: task.id,
            result,
            confidence: 0.85, // Scout confidence based on source diversity
            proof_hash: Some("scout_proof_hash".to_string()), // Would be actual PoI hash
            execution_time_ms: execution_time,
            resources_used: ResourceUsage {
                inference_calls: 2,
                tokens_consumed: 2048,
                stake_consumed: 1000,
            },
        })
    }

    fn agent_type(&self) -> AgentType {
        AgentType::Scout
    }

    fn agent_id(&self) -> Uuid {
        self.id
    }

    async fn shutdown(&mut self) -> SwarmResult<()> {
        // Store final memory state
        let memory_data = serde_json::json!({
            "specialization": self.specialization,
            "discoveries_count": self.memory_store.len(),
            "shutdown_time": chrono::Utc::now().timestamp()
        });

        self.cortensor
            .store_memory(&self.id.to_string(), &memory_data)
            .await?;

        Ok(())
    }
}

impl ScoutAgent {
    async fn score_opportunities(&self, opportunities: Vec<serde_json::Value>) -> SwarmResult<Vec<serde_json::Value>> {
        let prompt = format!(
            "Score these public goods opportunities for impact and feasibility. 
            Opportunities: {}
            
            For each, add:
            - impact_score (1-10): Potential positive impact
            - feasibility_score (1-10): How achievable with available resources
            - urgency_score (1-10): Time sensitivity
            - final_score: Weighted combination
            
            Return the same JSON array with added scoring fields.",
            serde_json::to_string(&opportunities).unwrap_or_default()
        );

        let request = crate::cortensor::InferenceRequest {
            model: "gpt-4".to_string(),
            prompt,
            max_tokens: Some(2048),
            temperature: Some(0.1),
            session_id: None,
            proof_of_inference: true,
            stake_amount: Some(750),
        };

        let response = self.cortensor.inference(request).await?;
        
        let scored: Vec<serde_json::Value> = serde_json::from_str(&response.response)
            .unwrap_or_else(|_| opportunities);

        Ok(scored)
    }
}

// Verifier Agent - Validates proposals and claims
pub struct VerifierAgent {
    id: Uuid,
    cortensor: CortensorClient,
    verification_methods: Vec<String>,
}

impl VerifierAgent {
    pub fn new(cortensor: CortensorClient) -> Self {
        Self {
            id: Uuid::new_v4(),
            cortensor,
            verification_methods: vec![
                "cross_reference".to_string(),
                "source_validation".to_string(),
                "impact_analysis".to_string(),
                "feasibility_check".to_string(),
            ],
        }
    }

    async fn verify_proposal(&self, proposal_id: &str) -> SwarmResult<serde_json::Value> {
        // Multi-node consensus verification
        let session = self.cortensor.create_session(3).await?;
        
        let prompt = format!(
            "Verify this public goods proposal (ID: {}). 
            Check:
            1. Legitimacy of claims and sources
            2. Feasibility of proposed solution
            3. Potential impact measurement
            4. Resource requirements accuracy
            5. Risk assessment
            
            Return JSON with: verified (bool), confidence (0-1), issues (array), recommendations (array)",
            proposal_id
        );

        let responses = self.cortensor.consensus_inference(prompt, &session).await?;
        
        // Aggregate verification results
        let mut total_confidence = 0.0;
        let mut verified_count = 0;
        
        for response in &responses {
            if let Ok(result) = serde_json::from_str::<serde_json::Value>(&response.response) {
                if let Some(verified) = result["verified"].as_bool() {
                    if verified {
                        verified_count += 1;
                    }
                }
                if let Some(confidence) = result["confidence"].as_f64() {
                    total_confidence += confidence;
                }
            }
        }

        let consensus_reached = (verified_count as f64 / responses.len() as f64) >= 0.7;
        let avg_confidence = total_confidence / responses.len() as f64;

        Ok(serde_json::json!({
            "proposal_id": proposal_id,
            "verified": consensus_reached,
            "consensus_confidence": avg_confidence,
            "validator_responses": responses.len(),
            "verification_methods": self.verification_methods,
            "timestamp": chrono::Utc::now().timestamp()
        }))
    }
}

#[async_trait]
impl Agent for VerifierAgent {
    async fn execute(&mut self, task: AgentTask) -> SwarmResult<AgentOutput> {
        let start_time = std::time::Instant::now();
        
        let result = match &task.task_type {
            TaskType::Verify { proposal_id } => {
                self.verify_proposal(proposal_id).await?
            }
            _ => {
                return Err(SwarmError::AgentError(
                    "Verifier agent received non-verification task".to_string(),
                ));
            }
        };

        let execution_time = start_time.elapsed().as_millis() as u64;

        Ok(AgentOutput {
            agent_id: self.id,
            task_id: task.id,
            result,
            confidence: 0.92, // High confidence due to multi-node consensus
            proof_hash: Some("verifier_proof_hash".to_string()),
            execution_time_ms: execution_time,
            resources_used: ResourceUsage {
                inference_calls: 3, // Multi-node consensus
                tokens_consumed: 1536,
                stake_consumed: 1500,
            },
        })
    }

    fn agent_type(&self) -> AgentType {
        AgentType::Verifier
    }

    fn agent_id(&self) -> Uuid {
        self.id
    }

    async fn shutdown(&mut self) -> SwarmResult<()> {
        Ok(())
    }
}

// Executor Agent - Executes approved tasks
pub struct ExecutorAgent {
    id: Uuid,
    cortensor: CortensorClient,
    execution_capabilities: Vec<String>,
}

impl ExecutorAgent {
    pub fn new(cortensor: CortensorClient) -> Self {
        Self {
            id: Uuid::new_v4(),
            cortensor,
            execution_capabilities: vec![
                "smart_contracts".to_string(),
                "nft_minting".to_string(),
                "grant_distribution".to_string(),
                "repository_updates".to_string(),
            ],
        }
    }

    async fn execute_action(&self, action: &ExecutionAction) -> SwarmResult<serde_json::Value> {
        match action {
            ExecutionAction::DeployContract { bytecode, params } => {
                // Mock contract deployment
                Ok(serde_json::json!({
                    "action": "deploy_contract",
                    "contract_address": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
                    "transaction_hash": "0xabc123...",
                    "gas_used": 2100000,
                    "status": "success"
                }))
            }
            ExecutionAction::MintNFT { metadata } => {
                // Mock NFT minting
                Ok(serde_json::json!({
                    "action": "mint_nft",
                    "token_id": 12345,
                    "metadata_uri": "ipfs://QmHash...",
                    "transaction_hash": "0xdef456...",
                    "status": "success"
                }))
            }
            ExecutionAction::CreateGrant { amount, recipient } => {
                // Mock grant creation
                Ok(serde_json::json!({
                    "action": "create_grant",
                    "grant_id": "grant_789",
                    "amount": amount,
                    "recipient": recipient,
                    "transaction_hash": "0xghi789...",
                    "status": "success"
                }))
            }
            ExecutionAction::UpdateRepository { repo_url, changes } => {
                // Mock repository update
                Ok(serde_json::json!({
                    "action": "update_repository",
                    "repo_url": repo_url,
                    "changes_applied": changes.len(),
                    "commit_hash": "abc123def456",
                    "status": "success"
                }))
            }
        }
    }
}

#[async_trait]
impl Agent for ExecutorAgent {
    async fn execute(&mut self, task: AgentTask) -> SwarmResult<AgentOutput> {
        let start_time = std::time::Instant::now();
        
        let result = match &task.task_type {
            TaskType::Execute { action } => {
                self.execute_action(action).await?
            }
            _ => {
                return Err(SwarmError::AgentError(
                    "Executor agent received non-execution task".to_string(),
                ));
            }
        };

        let execution_time = start_time.elapsed().as_millis() as u64;

        Ok(AgentOutput {
            agent_id: self.id,
            task_id: task.id,
            result,
            confidence: 0.95, // High confidence for successful execution
            proof_hash: Some("executor_proof_hash".to_string()),
            execution_time_ms: execution_time,
            resources_used: ResourceUsage {
                inference_calls: 1,
                tokens_consumed: 512,
                stake_consumed: 2000, // Higher stake for execution
            },
        })
    }

    fn agent_type(&self) -> AgentType {
        AgentType::Executor
    }

    fn agent_id(&self) -> Uuid {
        self.id
    }

    async fn shutdown(&mut self) -> SwarmResult<()> {
        Ok(())
    }
}