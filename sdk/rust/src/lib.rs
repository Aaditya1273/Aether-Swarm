use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::mpsc;
use uuid::Uuid;

pub mod agents;
pub mod cortensor;
pub mod consensus;
pub mod swarm;

pub use agents::*;
pub use cortensor::*;
pub use consensus::*;
pub use swarm::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmConfig {
    pub name: String,
    pub agents: AgentConfig,
    pub consensus: ConsensusConfig,
    pub public_goods: PublicGoodsConfig,
    pub cortensor: CortensorConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub count: usize,
    pub templates: Vec<String>,
    pub resources: ResourceLimits,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub cpu_limit: String,
    pub memory_limit: String,
    pub inference_budget: u64, // $COR tokens
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusConfig {
    pub algorithm: String,
    pub threshold: f64,
    pub timeout_ms: u64,
    pub stake_weight: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicGoodsConfig {
    pub categories: Vec<String>,
    pub budget: u64,
    pub impact_metrics: Vec<String>,
    pub quadratic_funding: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CortensorConfig {
    pub api_endpoint: String,
    pub model_preferences: Vec<String>,
    pub inference_timeout: u64,
    pub proof_of_inference: bool,
    pub stake_pool_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmEvent {
    pub id: Uuid,
    pub timestamp: u64,
    pub event_type: SwarmEventType,
    pub agent_id: Option<Uuid>,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SwarmEventType {
    AgentSpawned,
    ProposalCreated,
    ConsensusReached,
    TaskExecuted,
    InferenceCompleted,
    StakeUpdated,
    SwarmStopped,
}

pub type SwarmResult<T> = Result<T, SwarmError>;

#[derive(Debug, thiserror::Error)]
pub enum SwarmError {
    #[error("Cortensor API error: {0}")]
    CortensorError(String),
    #[error("Consensus failed: {0}")]
    ConsensusError(String),
    #[error("Agent error: {0}")]
    AgentError(String),
    #[error("Configuration error: {0}")]
    ConfigError(String),
    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

// WASM bindings for web integration
#[cfg(feature = "wasm")]
mod wasm {
    use super::*;
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    pub struct WasmSwarm {
        inner: Swarm,
    }

    #[wasm_bindgen]
    impl WasmSwarm {
        #[wasm_bindgen(constructor)]
        pub fn new(config: &str) -> Result<WasmSwarm, JsValue> {
            let config: SwarmConfig = serde_json::from_str(config)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            
            let swarm = Swarm::new(config);
            Ok(WasmSwarm { inner: swarm })
        }

        #[wasm_bindgen]
        pub async fn start(&mut self) -> Result<(), JsValue> {
            self.inner.start().await
                .map_err(|e| JsValue::from_str(&e.to_string()))
        }

        #[wasm_bindgen]
        pub async fn stop(&mut self) -> Result<(), JsValue> {
            self.inner.stop().await
                .map_err(|e| JsValue::from_str(&e.to_string()))
        }
    }
}