import axios, { AxiosInstance } from 'axios';
import { 
  InferenceRequest, 
  InferenceResponse, 
  MultiNodeSession, 
  StakePool 
} from './types';

export class CortensorClient {
  private client: AxiosInstance;
  private apiEndpoint: string;
  private modelPreferences: string[];
  private inferenceTimeout: number;

  constructor(
    apiEndpoint: string,
    apiKey?: string,
    modelPreferences: string[] = ['gpt-4', 'claude-3'],
    inferenceTimeoutMs: number = 30000
  ) {
    this.apiEndpoint = apiEndpoint;
    this.modelPreferences = modelPreferences;
    this.inferenceTimeout = inferenceTimeoutMs;

    this.client = axios.create({
      baseURL: apiEndpoint,
      timeout: inferenceTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });
  }

  /**
   * Single inference call with PoI validation
   */
  async inference(request: InferenceRequest): Promise<InferenceResponse> {
    try {
      const response = await this.client.post('/v1/inference', request);
      return response.data;
    } catch (error) {
      throw new Error(`Cortensor inference failed: ${error}`);
    }
  }

  /**
   * Multi-node consensus inference for critical decisions
   */
  async consensusInference(
    prompt: string,
    session: MultiNodeSession
  ): Promise<InferenceResponse[]> {
    const responses: InferenceResponse[] = [];
    
    for (const model of this.modelPreferences) {
      try {
        const request: InferenceRequest = {
          model,
          prompt,
          maxTokens: 512,
          temperature: 0.1, // Low temperature for consistency
          sessionId: session.sessionId,
          proofOfInference: true,
          stakeAmount: 1000,
        };

        const response = await this.inference(request);
        responses.push(response);
      } catch (error) {
        console.warn(`Inference failed for model ${model}:`, error);
      }
    }

    if (responses.length === 0) {
      throw new Error('All inference calls failed');
    }

    return responses;
  }

  /**
   * Create multi-node session for swarm consensus
   */
  async createSession(nodeCount: number): Promise<MultiNodeSession> {
    try {
      const response = await this.client.post('/v1/sessions', {
        node_count: nodeCount,
        consensus_threshold: 0.7,
        routing_strategy: 'adaptive_latency',
        session_type: 'swarm_consensus',
      });

      return response.data;
    } catch (error) {
      throw new Error(`Session creation failed: ${error}`);
    }
  }

  /**
   * Stake $COR tokens for task prioritization
   */
  async stakeForTask(
    taskId: string,
    amount: number,
    poolId: string
  ): Promise<string> {
    try {
      const response = await this.client.post('/v1/stake', {
        task_id: taskId,
        amount,
        pool_id: poolId,
        stake_type: 'task_priority',
      });

      return response.data.transaction_hash || 'unknown';
    } catch (error) {
      throw new Error(`Staking failed: ${error}`);
    }
  }

  /**
   * Get stake pool information
   */
  async getStakePool(poolId: string): Promise<StakePool> {
    try {
      const response = await this.client.get(`/v1/stake/pools/${poolId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Pool query failed: ${error}`);
    }
  }

  /**
   * Validate Proof-of-Inference for agent outputs
   */
  async validatePoI(proofHash: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/v1/proof/validate/${proofHash}`);
      return response.data.valid || false;
    } catch (error) {
      throw new Error(`PoI validation failed: ${error}`);
    }
  }

  /**
   * Store agent memory in PoI-verified vector store
   */
  async storeMemory(agentId: string, memoryData: any): Promise<string> {
    try {
      const response = await this.client.post('/v1/memory/store', {
        agent_id: agentId,
        data: memoryData,
        proof_required: true,
        retention_days: 30,
      });

      return response.data.memory_id || 'unknown';
    } catch (error) {
      throw new Error(`Memory storage failed: ${error}`);
    }
  }

  /**
   * Retrieve shared agent memory
   */
  async getMemory(memoryId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v1/memory/${memoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Memory retrieval failed: ${error}`);
    }
  }

  /**
   * Health check for Cortensor API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/v1/models');
      return response.data.models || [];
    } catch (error) {
      console.warn('Failed to fetch available models:', error);
      return this.modelPreferences;
    }
  }
}