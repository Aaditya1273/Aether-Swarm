use crate::{SwarmError, SwarmResult};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::time::{timeout, Duration};
use ethers::prelude::*;
use ethers::providers::{Provider, Http};
use ethers::types::Address;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct CortensorClient {
    pub client: Client,
    api_endpoint: String,
    api_key: Option<String>,
    model_preferences: Vec<String>,
    inference_timeout: Duration,
    // Real Cortensor network integration
    rpc_provider: Arc<Provider<Http>>,
    cor_token_address: Address,
    chain_id: u64,
    wallet: Option<LocalWallet>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InferenceRequest {
    pub model: String,
    pub prompt: String,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub session_id: Option<String>,
    pub proof_of_inference: bool,
    pub stake_amount: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InferenceResponse {
    pub id: String,
    pub model: String,
    pub response: String,
    pub tokens_used: u32,
    pub inference_time_ms: u64,
    pub proof_hash: Option<String>,
    pub validator_nodes: Vec<String>,
    pub consensus_score: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MultiNodeSession {
    pub session_id: String,
    pub nodes: Vec<String>,
    pub consensus_threshold: f64,
    pub routing_strategy: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StakePool {
    pub pool_id: String,
    pub total_stake: u64,
    pub active_tasks: u32,
    pub performance_score: f64,
}

impl CortensorClient {
    pub async fn new(
        api_endpoint: String,
        api_key: Option<String>,
        model_preferences: Vec<String>,
        inference_timeout_ms: u64,
        private_key: Option<String>,
    ) -> SwarmResult<Self> {
        // Real Cortensor Arbitrum Sepolia connection
        let rpc_url = "https://arbitrum-sepolia.g.alchemy.com/v2/demo"; // Replace with real API key
        let provider = Provider::<Http>::try_from(rpc_url)
            .map_err(|e| SwarmError::CortensorError(format!("RPC connection failed: {}", e)))?;
        
        // $COR token contract on Arbitrum Sepolia
        let cor_token_address = "0x8e0eef788350f40255d86dfe8d91ec0ad3a4547f"
            .parse::<Address>()
            .map_err(|e| SwarmError::CortensorError(format!("Invalid token address: {}", e)))?;
        
        let wallet = if let Some(pk) = private_key {
            Some(pk.parse::<LocalWallet>()
                .map_err(|e| SwarmError::CortensorError(format!("Invalid private key: {}", e)))?)
        } else {
            None
        };

        Ok(Self {
            client: Client::new(),
            api_endpoint,
            api_key,
            model_preferences,
            inference_timeout: Duration::from_millis(inference_timeout_ms),
            rpc_provider: Arc::new(provider),
            cor_token_address,
            chain_id: 421614, // Arbitrum Sepolia
            wallet,
        })
    }

    /// Single inference call with PoI validation
    pub async fn inference(&self, request: InferenceRequest) -> SwarmResult<InferenceResponse> {
        // Real Cortensor API endpoint
        let url = format!("{}/v1/inference", self.api_endpoint);
        
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("Content-Type", "application/json".parse().unwrap());
        headers.insert("User-Agent", "Aether-Swarm/1.0".parse().unwrap());
        
        if let Some(api_key) = &self.api_key {
            headers.insert(
                "Authorization",
                format!("Bearer {}", api_key).parse().unwrap(),
            );
        }

        // Add Cortensor-specific headers
        headers.insert("X-Chain-ID", self.chain_id.to_string().parse().unwrap());
        headers.insert("X-Proof-Required", "true".parse().unwrap());

        let payload = serde_json::json!({
            "model": request.model,
            "messages": [
                {
                    "role": "user",
                    "content": request.prompt
                }
            ],
            "max_tokens": request.max_tokens.unwrap_or(1024),
            "temperature": request.temperature.unwrap_or(0.3),
            "proof_of_inference": request.proof_of_inference,
            "stake_amount": request.stake_amount.unwrap_or(1000),
            "session_id": request.session_id,
            "chain_id": self.chain_id
        });

        let start_time = std::time::Instant::now();
        
        let response = timeout(
            self.inference_timeout,
            self.client.post(&url).headers(headers).json(&payload).send(),
        )
        .await
        .map_err(|_| SwarmError::CortensorError("Inference timeout".to_string()))?
        .map_err(|e| SwarmError::CortensorError(format!("Request failed: {}", e)))?;

        let inference_time = start_time.elapsed().as_millis() as u64;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(SwarmError::CortensorError(format!(
                "API error {}: {}",
                status,
                error_text
            )));
        }

        let response_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| SwarmError::CortensorError(format!("Parse error: {}", e)))?;

        // Parse Cortensor response format
        let inference_response = InferenceResponse {
            id: response_data["id"].as_str().unwrap_or("unknown").to_string(),
            model: request.model,
            response: response_data["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            tokens_used: response_data["usage"]["total_tokens"].as_u64().unwrap_or(0) as u32,
            inference_time_ms: inference_time,
            proof_hash: response_data["proof_hash"].as_str().map(|s| s.to_string()),
            validator_nodes: response_data["validator_nodes"]
                .as_array()
                .map(|arr| arr.iter().map(|v| v.as_str().unwrap_or("").to_string()).collect())
                .unwrap_or_default(),
            consensus_score: response_data["consensus_score"].as_f64().unwrap_or(0.0),
        };

        // Validate PoI if required
        if request.proof_of_inference {
            if let Some(proof_hash) = &inference_response.proof_hash {
                let is_valid = self.validate_poi(proof_hash).await?;
                if !is_valid {
                    return Err(SwarmError::CortensorError(
                        "Proof of Inference validation failed".to_string()
                    ));
                }
            }
        }

        Ok(inference_response)
    }

    /// Multi-node consensus inference for critical decisions
    pub async fn consensus_inference(
        &self,
        prompt: String,
        session: &MultiNodeSession,
    ) -> SwarmResult<Vec<InferenceResponse>> {
        let mut responses = Vec::new();
        
        for model in &self.model_preferences {
            let request = InferenceRequest {
                model: model.clone(),
                prompt: prompt.clone(),
                max_tokens: Some(512),
                temperature: Some(0.1), // Low temperature for consistency
                session_id: Some(session.session_id.clone()),
                proof_of_inference: true,
                stake_amount: Some(1000), // Default stake
            };

            match self.inference(request).await {
                Ok(response) => responses.push(response),
                Err(e) => tracing::warn!("Inference failed for model {}: {}", model, e),
            }
        }

        if responses.is_empty() {
            return Err(SwarmError::CortensorError(
                "All inference calls failed".to_string(),
            ));
        }

        Ok(responses)
    }

    /// Create multi-node session for swarm consensus
    pub async fn create_session(&self, node_count: u32) -> SwarmResult<MultiNodeSession> {
        let url = format!("{}/v1/sessions", self.api_endpoint);
        
        let request = serde_json::json!({
            "node_count": node_count,
            "consensus_threshold": 0.7,
            "routing_strategy": "adaptive_latency",
            "session_type": "swarm_consensus"
        });

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "Session creation failed: {}",
                response.status()
            )));
        }

        let session: MultiNodeSession = response.json().await?;
        Ok(session)
    }

    /// Stake $COR tokens for task prioritization
    pub async fn stake_for_task(
        &self,
        task_id: &str,
        amount: u64,
        pool_id: &str,
    ) -> SwarmResult<String> {
        let url = format!("{}/v1/stake", self.api_endpoint);
        
        let request = serde_json::json!({
            "task_id": task_id,
            "amount": amount,
            "pool_id": pool_id,
            "stake_type": "task_priority"
        });

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "Staking failed: {}",
                response.status()
            )));
        }

        let result: serde_json::Value = response.json().await?;
        Ok(result["transaction_hash"]
            .as_str()
            .unwrap_or("unknown")
            .to_string())
    }

    /// Get stake pool information
    pub async fn get_stake_pool(&self, pool_id: &str) -> SwarmResult<StakePool> {
        let url = format!("{}/v1/stake/pools/{}", self.api_endpoint, pool_id);
        
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "Pool query failed: {}",
                response.status()
            )));
        }

        let pool: StakePool = response.json().await?;
        Ok(pool)
    }

    /// Validate Proof-of-Inference for agent outputs
    pub async fn validate_poi(&self, proof_hash: &str) -> SwarmResult<bool> {
        let url = format!("{}/v1/proof/validate/{}", self.api_endpoint, proof_hash);
        
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "PoI validation failed: {}",
                response.status()
            )));
        }

        let result: serde_json::Value = response.json().await?;
        Ok(result["valid"].as_bool().unwrap_or(false))
    }

    /// Store agent memory in PoI-verified vector store
    pub async fn store_memory(
        &self,
        agent_id: &str,
        memory_data: &serde_json::Value,
    ) -> SwarmResult<String> {
        let url = format!("{}/v1/memory/store", self.api_endpoint);
        
        let request = serde_json::json!({
            "agent_id": agent_id,
            "data": memory_data,
            "proof_required": true,
            "retention_days": 30
        });

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "Memory storage failed: {}",
                response.status()
            )));
        }

        let result: serde_json::Value = response.json().await?;
        Ok(result["memory_id"]
            .as_str()
            .unwrap_or("unknown")
            .to_string())
    }

    /// Retrieve shared agent memory
    pub async fn get_memory(&self, memory_id: &str) -> SwarmResult<serde_json::Value> {
        let url = format!("{}/v1/memory/{}", self.api_endpoint, memory_id);
        
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(SwarmError::CortensorError(format!(
                "Memory retrieval failed: {}",
                response.status()
            )));
        }

        let memory: serde_json::Value = response.json().await?;
        Ok(memory)
    }
}