use crate::{
    agents::*, consensus::*, cortensor::*, SwarmConfig, SwarmError, SwarmEvent, 
    SwarmEventType, SwarmResult
};
use std::collections::HashMap;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use uuid::Uuid;
use std::sync::Arc;

pub struct Swarm {
    pub id: Uuid,
    pub config: SwarmConfig,
    pub agents: HashMap<Uuid, Box<dyn Agent>>,
    pub consensus_engine: ConsensusEngine,
    pub cortensor_client: CortensorClient,
    pub event_sender: mpsc::UnboundedSender<SwarmEvent>,
    pub event_receiver: Arc<RwLock<mpsc::UnboundedReceiver<SwarmEvent>>>,
    pub is_running: Arc<RwLock<bool>>,
    pub task_queue: Arc<RwLock<Vec<AgentTask>>>,
    pub execution_history: Arc<RwLock<Vec<AgentOutput>>>,
}

impl Swarm {
    pub fn new(config: SwarmConfig) -> Self {
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        
        let cortensor_client = CortensorClient::new(
            config.cortensor.api_endpoint.clone(),
            None, // API key would be loaded from env
            config.cortensor.model_preferences.clone(),
            config.cortensor.inference_timeout,
        );

        let consensus_engine = ConsensusEngine::new(
            match config.consensus.algorithm.as_str() {
                "pbft" => ConsensusAlgorithm::PBFT,
                "stake_weighted" => ConsensusAlgorithm::StakeWeighted,
                "hybrid" => ConsensusAlgorithm::Hybrid,
                _ => ConsensusAlgorithm::Hybrid,
            },
            config.consensus.threshold,
            config.consensus.timeout_ms,
        );

        Self {
            id: Uuid::new_v4(),
            config,
            agents: HashMap::new(),
            consensus_engine,
            cortensor_client,
            event_sender,
            event_receiver: Arc::new(RwLock::new(event_receiver)),
            is_running: Arc::new(RwLock::new(false)),
            task_queue: Arc::new(RwLock::new(Vec::new())),
            execution_history: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn start(&mut self) -> SwarmResult<()> {
        *self.is_running.write().await = true;
        
        // Spawn agents based on configuration
        self.spawn_agents().await?;
        
        // Start the main swarm loop
        self.start_swarm_loop().await?;
        
        self.emit_event(SwarmEventType::AgentSpawned, None, serde_json::json!({
            "swarm_id": self.id,
            "agent_count": self.agents.len(),
            "config": self.config
        })).await;

        tracing::info!("Swarm {} started with {} agents", self.id, self.agents.len());
        Ok(())
    }

    pub async fn stop(&mut self) -> SwarmResult<()> {
        *self.is_running.write().await = false;
        
        // Shutdown all agents
        for (agent_id, agent) in &mut self.agents {
            if let Err(e) = agent.shutdown().await {
                tracing::warn!("Error shutting down agent {}: {}", agent_id, e);
            }
        }
        
        self.emit_event(SwarmEventType::SwarmStopped, None, serde_json::json!({
            "swarm_id": self.id,
            "shutdown_time": chrono::Utc::now().timestamp()
        })).await;

        tracing::info!("Swarm {} stopped", self.id);
        Ok(())
    }

    async fn spawn_agents(&mut self) -> SwarmResult<()> {
        let agent_count = self.config.agents.count;
        let templates = &self.config.agents.templates;
        
        for i in 0..agent_count {
            let template = &templates[i % templates.len()];
            let agent: Box<dyn Agent> = match template.as_str() {
                "scout" => Box::new(ScoutAgent::new(
                    self.cortensor_client.clone(),
                    self.config.public_goods.categories.clone(),
                )),
                "verifier" => Box::new(VerifierAgent::new(
                    self.cortensor_client.clone(),
                )),
                "executor" => Box::new(ExecutorAgent::new(
                    self.cortensor_client.clone(),
                )),
                _ => {
                    return Err(SwarmError::ConfigError(
                        format!("Unknown agent template: {}", template)
                    ));
                }
            };

            let agent_id = agent.agent_id();
            
            // Add agent stake to consensus engine
            self.consensus_engine.add_agent_stake(
                agent_id, 
                self.config.agents.resources.inference_budget / agent_count as u64
            );
            
            self.agents.insert(agent_id, agent);
        }

        Ok(())
    }

    async fn start_swarm_loop(&self) -> SwarmResult<()> {
        let is_running = Arc::clone(&self.is_running);
        let task_queue = Arc::clone(&self.task_queue);
        let execution_history = Arc::clone(&self.execution_history);
        let event_sender = self.event_sender.clone();
        let consensus_engine = self.consensus_engine.clone();
        
        tokio::spawn(async move {
            let mut task_interval = interval(Duration::from_secs(10)); // Check for tasks every 10s
            let mut consensus_interval = interval(Duration::from_secs(30)); // Run consensus every 30s
            
            loop {
                if !*is_running.read().await {
                    break;
                }

                tokio::select! {
                    _ = task_interval.tick() => {
                        // Generate new tasks based on public goods discovery
                        Self::generate_discovery_tasks(&task_queue, &event_sender).await;
                    }
                    _ = consensus_interval.tick() => {
                        // Run consensus on recent outputs
                        Self::run_consensus_cycle(&execution_history, &consensus_engine, &event_sender).await;
                    }
                }
            }
        });

        Ok(())
    }

    async fn generate_discovery_tasks(
        task_queue: &Arc<RwLock<Vec<AgentTask>>>,
        event_sender: &mpsc::UnboundedSender<SwarmEvent>,
    ) {
        // Generate scout tasks for public goods discovery
        let scout_task = AgentTask {
            id: Uuid::new_v4(),
            task_type: TaskType::Scout {
                categories: vec![
                    "depin".to_string(),
                    "climate".to_string(),
                    "education".to_string(),
                    "open_source".to_string(),
                ],
            },
            prompt: "Discover high-impact public goods opportunities that need funding or support".to_string(),
            context: HashMap::new(),
            priority: 5,
            stake_amount: 1000,
        };

        task_queue.write().await.push(scout_task.clone());
        
        let _ = event_sender.send(SwarmEvent {
            id: Uuid::new_v4(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            event_type: SwarmEventType::ProposalCreated,
            agent_id: None,
            data: serde_json::json!({
                "task_id": scout_task.id,
                "task_type": "scout",
                "categories": scout_task.task_type
            }),
        });
    }

    async fn run_consensus_cycle(
        execution_history: &Arc<RwLock<Vec<AgentOutput>>>,
        consensus_engine: &ConsensusEngine,
        event_sender: &mpsc::UnboundedSender<SwarmEvent>,
    ) {
        let recent_outputs: Vec<AgentOutput> = {
            let history = execution_history.read().await;
            // Get outputs from last 5 minutes
            let cutoff = chrono::Utc::now().timestamp() as u64 - 300;
            history.iter()
                .filter(|output| {
                    // Simulate timestamp check
                    true // In real implementation, check output.timestamp > cutoff
                })
                .cloned()
                .collect()
        };

        if recent_outputs.len() >= 2 {
            // Create consensus proposal
            if let Ok(proposal) = consensus_engine.create_proposal_from_outputs(
                recent_outputs.clone(),
                ProposalType::PublicGoodsInitiative,
            ) {
                // Simulate agent votes
                let votes = consensus_engine.simulate_agent_votes(&proposal, &recent_outputs);
                
                // Process consensus
                if let Ok(result) = consensus_engine.process_consensus(proposal.clone(), votes).await {
                    let _ = event_sender.send(SwarmEvent {
                        id: Uuid::new_v4(),
                        timestamp: chrono::Utc::now().timestamp() as u64,
                        event_type: SwarmEventType::ConsensusReached,
                        agent_id: None,
                        data: serde_json::json!({
                            "proposal_id": proposal.id,
                            "decision": result.decision,
                            "execution_approved": result.execution_approved,
                            "vote_summary": result.vote_summary
                        }),
                    });

                    // If consensus approves, create execution task
                    if result.execution_approved {
                        // This would trigger actual execution in a real implementation
                        tracing::info!("Consensus approved proposal {}", proposal.id);
                    }
                }
            }
        }
    }

    pub async fn execute_task(&mut self, task: AgentTask) -> SwarmResult<Vec<AgentOutput>> {
        let mut outputs = Vec::new();
        
        // Find suitable agents for the task
        let suitable_agents: Vec<Uuid> = self.agents.iter()
            .filter(|(_, agent)| {
                match (&task.task_type, agent.agent_type()) {
                    (TaskType::Scout { .. }, AgentType::Scout) => true,
                    (TaskType::Verify { .. }, AgentType::Verifier) => true,
                    (TaskType::Execute { .. }, AgentType::Executor) => true,
                    _ => false,
                }
            })
            .map(|(id, _)| *id)
            .collect();

        // Execute task with suitable agents
        for agent_id in suitable_agents {
            if let Some(agent) = self.agents.get_mut(&agent_id) {
                match agent.execute(task.clone()).await {
                    Ok(output) => {
                        let output_clone = output.clone();
                        outputs.push(output_clone.clone());
                        self.execution_history.write().await.push(output_clone.clone());
                        
                        self.emit_event(
                            SwarmEventType::TaskExecuted,
                            Some(agent_id),
                            serde_json::json!({
                                "task_id": task.id,
                                "agent_id": agent_id,
                                "confidence": output_clone.confidence,
                                "execution_time_ms": output_clone.execution_time_ms
                            })
                        ).await;
                    }
                    Err(e) => {
                        tracing::error!("Agent {} failed to execute task: {}", agent_id, e);
                    }
                }
            }
        }

        Ok(outputs)
    }

    pub async fn add_task(&self, task: AgentTask) -> SwarmResult<()> {
        self.task_queue.write().await.push(task);
        Ok(())
    }

    pub async fn get_status(&self) -> SwarmResult<serde_json::Value> {
        let is_running = *self.is_running.read().await;
        let task_count = self.task_queue.read().await.len();
        let execution_count = self.execution_history.read().await.len();
        
        Ok(serde_json::json!({
            "swarm_id": self.id,
            "name": self.config.name,
            "is_running": is_running,
            "agent_count": self.agents.len(),
            "pending_tasks": task_count,
            "completed_executions": execution_count,
            "consensus_algorithm": self.config.consensus.algorithm,
            "public_goods_categories": self.config.public_goods.categories,
            "uptime_seconds": 0 // Would track actual uptime
        }))
    }

    async fn emit_event(
        &self,
        event_type: SwarmEventType,
        agent_id: Option<Uuid>,
        data: serde_json::Value,
    ) {
        let event = SwarmEvent {
            id: Uuid::new_v4(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            event_type,
            agent_id,
            data,
        };

        let _ = self.event_sender.send(event);
    }

    /// Demo method: Execute a complete public goods discovery cycle
    pub async fn demo_public_goods_cycle(&mut self) -> SwarmResult<serde_json::Value> {
        tracing::info!("Starting public goods discovery demo cycle");

        // 1. Scout for opportunities
        let scout_task = AgentTask {
            id: Uuid::new_v4(),
            task_type: TaskType::Scout {
                categories: vec!["depin".to_string(), "climate".to_string()],
            },
            prompt: "Find DePIN and climate tech projects needing support".to_string(),
            context: HashMap::new(),
            priority: 10,
            stake_amount: 2000,
        };

        let scout_outputs = self.execute_task(scout_task).await?;
        
        if scout_outputs.is_empty() {
            return Err(SwarmError::AgentError("No scout outputs generated".to_string()));
        }

        // 2. Verify the best opportunity
        let best_opportunity = &scout_outputs[0];
        let verify_task = AgentTask {
            id: Uuid::new_v4(),
            task_type: TaskType::Verify {
                proposal_id: best_opportunity.task_id.to_string(),
            },
            prompt: "Verify the legitimacy and impact potential of this opportunity".to_string(),
            context: HashMap::new(),
            priority: 8,
            stake_amount: 1500,
        };

        let verify_outputs = self.execute_task(verify_task).await?;

        // 3. If verified, execute a mock grant
        let mut execution_outputs = Vec::new();
        if !verify_outputs.is_empty() && verify_outputs[0].confidence > 0.7 {
            let execute_task = AgentTask {
                id: Uuid::new_v4(),
                task_type: TaskType::Execute {
                    action: ExecutionAction::CreateGrant {
                        amount: 50000,
                        recipient: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87".to_string(),
                    },
                },
                prompt: "Create grant for verified public goods opportunity".to_string(),
                context: HashMap::new(),
                priority: 10,
                stake_amount: 3000,
            };

            execution_outputs = self.execute_task(execute_task).await?;
        }

        // 4. Run consensus on the complete cycle
        let scout_len = scout_outputs.len();
        let verify_confidence = verify_outputs.get(0).map(|o| o.confidence).unwrap_or(0.0);
        let execution_success = !execution_outputs.is_empty();
        
        let all_outputs = [scout_outputs, verify_outputs, execution_outputs].concat();
        let proposal = self.consensus_engine.create_proposal_from_outputs(
            all_outputs.clone(),
            ProposalType::PublicGoodsInitiative,
        )?;

        let votes = self.consensus_engine.simulate_agent_votes(&proposal, &all_outputs);
        let consensus_result = self.consensus_engine.process_consensus(proposal, votes).await?;

        Ok(serde_json::json!({
            "demo_cycle_complete": true,
            "scout_discoveries": scout_len,
            "verification_confidence": verify_confidence,
            "execution_success": execution_success,
            "consensus_decision": consensus_result.decision,
            "consensus_approved": consensus_result.execution_approved,
            "total_agents_participated": all_outputs.len(),
            "cycle_timestamp": chrono::Utc::now().timestamp()
        }))
    }
}