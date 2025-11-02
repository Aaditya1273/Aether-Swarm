use crate::{AgentOutput, SwarmResult, SwarmError};
use sqlx::{SqlitePool, Row};
use serde_json;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct SwarmDatabase {
    pool: SqlitePool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SwarmRecord {
    pub id: String,
    pub name: String,
    pub status: String,
    pub agent_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub config: serde_json::Value,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TaskRecord {
    pub id: String,
    pub swarm_id: String,
    pub task_type: String,
    pub prompt: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub results: Option<serde_json::Value>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AgentOutputRecord {
    pub id: String,
    pub swarm_id: String,
    pub task_id: String,
    pub agent_id: String,
    pub agent_type: String,
    pub confidence: f64,
    pub execution_time_ms: i64,
    pub tokens_used: i32,
    pub stake_consumed: i64,
    pub proof_hash: Option<String>,
    pub result_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ConsensusRecord {
    pub id: String,
    pub swarm_id: String,
    pub proposal_id: String,
    pub decision: String,
    pub vote_count: i32,
    pub approval_rate: f64,
    pub stake_weight: i64,
    pub created_at: DateTime<Utc>,
    pub details: serde_json::Value,
}

impl SwarmDatabase {
    pub async fn new(database_path: &str) -> SwarmResult<Self> {
        // Create SQLite database file if it doesn't exist
        let database_url = if database_path.starts_with("sqlite:") {
            database_path.to_string()
        } else {
            format!("sqlite:{}", database_path)
        };
        
        // Ensure parent directory exists
        if let Some(parent) = std::path::Path::new(database_path).parent() {
            std::fs::create_dir_all(parent).ok();
        }
        
        let pool = SqlitePool::connect(&database_url)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to connect to database: {}", e)))?;

        let db = Self { pool };
        
        // Initialize database schema
        db.init_schema().await?;
        
        Ok(db)
    }

    async fn init_schema(&self) -> SwarmResult<()> {
        // Create swarms table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS swarms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                agent_count INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                config TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create swarms table: {}", e)))?;

        // Create tasks table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                swarm_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                prompt TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                results TEXT,
                FOREIGN KEY (swarm_id) REFERENCES swarms (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create tasks table: {}", e)))?;

        // Create agent_outputs table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS agent_outputs (
                id TEXT PRIMARY KEY,
                swarm_id TEXT NOT NULL,
                task_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                confidence REAL NOT NULL,
                execution_time_ms INTEGER NOT NULL,
                tokens_used INTEGER NOT NULL,
                stake_consumed INTEGER NOT NULL,
                proof_hash TEXT,
                result_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (swarm_id) REFERENCES swarms (id),
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create agent_outputs table: {}", e)))?;

        // Create consensus table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS consensus (
                id TEXT PRIMARY KEY,
                swarm_id TEXT NOT NULL,
                proposal_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                vote_count INTEGER NOT NULL,
                approval_rate REAL NOT NULL,
                stake_weight INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                details TEXT NOT NULL,
                FOREIGN KEY (swarm_id) REFERENCES swarms (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create consensus table: {}", e)))?;

        // Create discovery_results table for hackathon demo
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS discovery_results (
                id TEXT PRIMARY KEY,
                swarm_id TEXT NOT NULL,
                source TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT,
                description TEXT,
                impact_score REAL,
                confidence REAL,
                created_at TEXT NOT NULL,
                metadata TEXT,
                FOREIGN KEY (swarm_id) REFERENCES swarms (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create discovery_results table: {}", e)))?;

        Ok(())
    }

    // Swarm operations
    pub async fn create_swarm(&self, swarm: &SwarmRecord) -> SwarmResult<()> {
        sqlx::query(
            r#"
            INSERT INTO swarms (id, name, status, agent_count, created_at, updated_at, config)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#,
        )
        .bind(&swarm.id)
        .bind(&swarm.name)
        .bind(&swarm.status)
        .bind(swarm.agent_count)
        .bind(swarm.created_at.to_rfc3339())
        .bind(swarm.updated_at.to_rfc3339())
        .bind(swarm.config.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create swarm: {}", e)))?;

        Ok(())
    }

    pub async fn get_swarm(&self, swarm_id: &str) -> SwarmResult<Option<SwarmRecord>> {
        let row = sqlx::query(
            "SELECT id, name, status, agent_count, created_at, updated_at, config FROM swarms WHERE id = ?1"
        )
        .bind(swarm_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to get swarm: {}", e)))?;

        if let Some(row) = row {
            let config_str: String = row.get("config");
            let config: serde_json::Value = serde_json::from_str(&config_str)
                .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse config: {}", e)))?;

            Ok(Some(SwarmRecord {
                id: row.get("id"),
                name: row.get("name"),
                status: row.get("status"),
                agent_count: row.get("agent_count"),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse created_at: {}", e)))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse updated_at: {}", e)))?
                    .with_timezone(&Utc),
                config,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn list_swarms(&self) -> SwarmResult<Vec<SwarmRecord>> {
        let rows = sqlx::query(
            "SELECT id, name, status, agent_count, created_at, updated_at, config FROM swarms ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to list swarms: {}", e)))?;

        let mut swarms = Vec::new();
        for row in rows {
            let config_str: String = row.get("config");
            let config: serde_json::Value = serde_json::from_str(&config_str)
                .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse config: {}", e)))?;

            swarms.push(SwarmRecord {
                id: row.get("id"),
                name: row.get("name"),
                status: row.get("status"),
                agent_count: row.get("agent_count"),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse created_at: {}", e)))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse updated_at: {}", e)))?
                    .with_timezone(&Utc),
                config,
            });
        }

        Ok(swarms)
    }

    pub async fn update_swarm_status(&self, swarm_id: &str, status: &str) -> SwarmResult<()> {
        sqlx::query(
            "UPDATE swarms SET status = ?1, updated_at = ?2 WHERE id = ?3"
        )
        .bind(status)
        .bind(Utc::now().to_rfc3339())
        .bind(swarm_id)
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to update swarm status: {}", e)))?;

        Ok(())
    }

    // Task operations
    pub async fn create_task(&self, task: &TaskRecord) -> SwarmResult<()> {
        sqlx::query(
            r#"
            INSERT INTO tasks (id, swarm_id, task_type, prompt, status, created_at, completed_at, results)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
        )
        .bind(&task.id)
        .bind(&task.swarm_id)
        .bind(&task.task_type)
        .bind(&task.prompt)
        .bind(&task.status)
        .bind(task.created_at.to_rfc3339())
        .bind(task.completed_at.map(|dt| dt.to_rfc3339()))
        .bind(task.results.as_ref().map(|r| r.to_string()))
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to create task: {}", e)))?;

        Ok(())
    }

    pub async fn get_tasks_for_swarm(&self, swarm_id: &str) -> SwarmResult<Vec<TaskRecord>> {
        let rows = sqlx::query(
            "SELECT id, swarm_id, task_type, prompt, status, created_at, completed_at, results FROM tasks WHERE swarm_id = ?1 ORDER BY created_at DESC"
        )
        .bind(swarm_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to get tasks: {}", e)))?;

        let mut tasks = Vec::new();
        for row in rows {
            let results = if let Some(results_str) = row.get::<Option<String>, _>("results") {
                Some(serde_json::from_str(&results_str)
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse results: {}", e)))?)
            } else {
                None
            };

            tasks.push(TaskRecord {
                id: row.get("id"),
                swarm_id: row.get("swarm_id"),
                task_type: row.get("task_type"),
                prompt: row.get("prompt"),
                status: row.get("status"),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse created_at: {}", e)))?
                    .with_timezone(&Utc),
                completed_at: if let Some(completed_str) = row.get::<Option<String>, _>("completed_at") {
                    Some(DateTime::parse_from_rfc3339(&completed_str)
                        .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse completed_at: {}", e)))?
                        .with_timezone(&Utc))
                } else {
                    None
                },
                results,
            });
        }

        Ok(tasks)
    }

    // Agent output operations
    pub async fn save_agent_output(&self, swarm_id: &str, task_id: &str, output: &AgentOutput) -> SwarmResult<()> {
        let record = AgentOutputRecord {
            id: Uuid::new_v4().to_string(),
            swarm_id: swarm_id.to_string(),
            task_id: task_id.to_string(),
            agent_id: output.agent_id.to_string(),
            agent_type: format!("{:?}", output.agent_id), // Would need agent type from context
            confidence: output.confidence,
            execution_time_ms: output.execution_time_ms as i64,
            tokens_used: output.resources_used.tokens_consumed as i32,
            stake_consumed: output.resources_used.stake_consumed as i64,
            proof_hash: output.proof_hash.clone(),
            result_data: output.result.clone(),
            created_at: Utc::now(),
        };

        sqlx::query(
            r#"
            INSERT INTO agent_outputs (id, swarm_id, task_id, agent_id, agent_type, confidence, 
                                     execution_time_ms, tokens_used, stake_consumed, proof_hash, 
                                     result_data, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
            "#,
        )
        .bind(&record.id)
        .bind(&record.swarm_id)
        .bind(&record.task_id)
        .bind(&record.agent_id)
        .bind(&record.agent_type)
        .bind(record.confidence)
        .bind(record.execution_time_ms)
        .bind(record.tokens_used)
        .bind(record.stake_consumed)
        .bind(&record.proof_hash)
        .bind(record.result_data.to_string())
        .bind(record.created_at.to_rfc3339())
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to save agent output: {}", e)))?;

        Ok(())
    }

    pub async fn get_agent_outputs_for_task(&self, task_id: &str) -> SwarmResult<Vec<AgentOutputRecord>> {
        let rows = sqlx::query(
            r#"
            SELECT id, swarm_id, task_id, agent_id, agent_type, confidence, execution_time_ms,
                   tokens_used, stake_consumed, proof_hash, result_data, created_at
            FROM agent_outputs WHERE task_id = ?1 ORDER BY created_at ASC
            "#
        )
        .bind(task_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to get agent outputs: {}", e)))?;

        let mut outputs = Vec::new();
        for row in rows {
            let result_data_str: String = row.get("result_data");
            let result_data: serde_json::Value = serde_json::from_str(&result_data_str)
                .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse result_data: {}", e)))?;

            outputs.push(AgentOutputRecord {
                id: row.get("id"),
                swarm_id: row.get("swarm_id"),
                task_id: row.get("task_id"),
                agent_id: row.get("agent_id"),
                agent_type: row.get("agent_type"),
                confidence: row.get("confidence"),
                execution_time_ms: row.get("execution_time_ms"),
                tokens_used: row.get("tokens_used"),
                stake_consumed: row.get("stake_consumed"),
                proof_hash: row.get("proof_hash"),
                result_data,
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))
                    .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse created_at: {}", e)))?
                    .with_timezone(&Utc),
            });
        }

        Ok(outputs)
    }

    // Consensus operations
    pub async fn save_consensus_result(&self, consensus: &ConsensusRecord) -> SwarmResult<()> {
        sqlx::query(
            r#"
            INSERT INTO consensus (id, swarm_id, proposal_id, decision, vote_count, approval_rate,
                                 stake_weight, created_at, details)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#,
        )
        .bind(&consensus.id)
        .bind(&consensus.swarm_id)
        .bind(&consensus.proposal_id)
        .bind(&consensus.decision)
        .bind(consensus.vote_count)
        .bind(consensus.approval_rate)
        .bind(consensus.stake_weight)
        .bind(consensus.created_at.to_rfc3339())
        .bind(consensus.details.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to save consensus result: {}", e)))?;

        Ok(())
    }

    // Discovery results for hackathon demo
    pub async fn save_discovery_result(&self, swarm_id: &str, source: &str, category: &str, 
                                     title: &str, url: Option<&str>, description: Option<&str>,
                                     impact_score: Option<f64>, confidence: f64,
                                     metadata: &serde_json::Value) -> SwarmResult<()> {
        sqlx::query(
            r#"
            INSERT INTO discovery_results (id, swarm_id, source, category, title, url, description,
                                         impact_score, confidence, created_at, metadata)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(swarm_id)
        .bind(source)
        .bind(category)
        .bind(title)
        .bind(url)
        .bind(description)
        .bind(impact_score)
        .bind(confidence)
        .bind(Utc::now().to_rfc3339())
        .bind(metadata.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| SwarmError::DatabaseError(format!("Failed to save discovery result: {}", e)))?;

        Ok(())
    }

    pub async fn get_discovery_results(&self, swarm_id: &str, limit: Option<i32>) -> SwarmResult<Vec<serde_json::Value>> {
        let limit_clause = if let Some(l) = limit {
            format!("LIMIT {}", l)
        } else {
            String::new()
        };

        let query = format!(
            r#"
            SELECT id, source, category, title, url, description, impact_score, confidence, created_at, metadata
            FROM discovery_results WHERE swarm_id = ?1 ORDER BY created_at DESC {}
            "#,
            limit_clause
        );

        let rows = sqlx::query(&query)
            .bind(swarm_id)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get discovery results: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let metadata_str: String = row.get("metadata");
            let metadata: serde_json::Value = serde_json::from_str(&metadata_str)
                .map_err(|e| SwarmError::DatabaseError(format!("Failed to parse metadata: {}", e)))?;

            results.push(serde_json::json!({
                "id": row.get::<String, _>("id"),
                "source": row.get::<String, _>("source"),
                "category": row.get::<String, _>("category"),
                "title": row.get::<String, _>("title"),
                "url": row.get::<Option<String>, _>("url"),
                "description": row.get::<Option<String>, _>("description"),
                "impact_score": row.get::<Option<f64>, _>("impact_score"),
                "confidence": row.get::<f64, _>("confidence"),
                "created_at": row.get::<String, _>("created_at"),
                "metadata": metadata
            }));
        }

        Ok(results)
    }

    // Analytics for hackathon demo
    pub async fn get_swarm_analytics(&self, swarm_id: &str) -> SwarmResult<serde_json::Value> {
        // Get task count
        let task_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM tasks WHERE swarm_id = ?1")
            .bind(swarm_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get task count: {}", e)))?;

        // Get agent output count
        let output_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM agent_outputs WHERE swarm_id = ?1")
            .bind(swarm_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get output count: {}", e)))?;

        // Get average confidence
        let avg_confidence: Option<f64> = sqlx::query_scalar("SELECT AVG(confidence) FROM agent_outputs WHERE swarm_id = ?1")
            .bind(swarm_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get average confidence: {}", e)))?;

        // Get discovery count
        let discovery_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM discovery_results WHERE swarm_id = ?1")
            .bind(swarm_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get discovery count: {}", e)))?;

        // Get consensus count
        let consensus_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM consensus WHERE swarm_id = ?1")
            .bind(swarm_id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| SwarmError::DatabaseError(format!("Failed to get consensus count: {}", e)))?;

        Ok(serde_json::json!({
            "swarm_id": swarm_id,
            "total_tasks": task_count,
            "total_outputs": output_count,
            "total_discoveries": discovery_count,
            "total_consensus": consensus_count,
            "average_confidence": avg_confidence.unwrap_or(0.0),
            "generated_at": Utc::now().to_rfc3339()
        }))
    }
}