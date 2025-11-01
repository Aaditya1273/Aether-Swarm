export interface SwarmConfig {
  name: string;
  agents: AgentConfig;
  consensus: ConsensusConfig;
  publicGoods: PublicGoodsConfig;
  cortensor: CortensorConfig;
}

export interface AgentConfig {
  count: number;
  templates: string[];
  resources: ResourceLimits;
}

export interface ResourceLimits {
  cpuLimit: string;
  memoryLimit: string;
  inferenceBudget: number;
}

export interface ConsensusConfig {
  algorithm: 'pbft' | 'stake_weighted' | 'hybrid';
  threshold: number;
  timeoutMs: number;
  stakeWeight: boolean;
}

export interface PublicGoodsConfig {
  categories: string[];
  budget: number;
  impactMetrics: string[];
  quadraticFunding: boolean;
}

export interface CortensorConfig {
  apiEndpoint: string;
  modelPreferences: string[];
  inferenceTimeout: number;
  proofOfInference: boolean;
  stakePoolId?: string;
}

export interface AgentTask {
  id: string;
  taskType: TaskType;
  prompt: string;
  context: Record<string, any>;
  priority: number;
  stakeAmount: number;
}

export type TaskType = 
  | { type: 'scout'; categories: string[] }
  | { type: 'verify'; proposalId: string }
  | { type: 'execute'; action: ExecutionAction };

export type ExecutionAction = 
  | { type: 'deployContract'; bytecode: string; params: string[] }
  | { type: 'mintNFT'; metadata: any }
  | { type: 'createGrant'; amount: number; recipient: string }
  | { type: 'updateRepository'; repoUrl: string; changes: string[] };

export interface AgentOutput {
  agentId: string;
  taskId: string;
  result: any;
  confidence: number;
  proofHash?: string;
  executionTimeMs: number;
  resourcesUsed: ResourceUsage;
}

export interface ResourceUsage {
  inferenceCalls: number;
  tokensConsumed: number;
  stakeConsumed: number;
}

export interface SwarmEvent {
  id: string;
  timestamp: number;
  eventType: SwarmEventType;
  agentId?: string;
  data: any;
}

export enum SwarmEventType {
  AgentSpawned = 'AgentSpawned',
  ProposalCreated = 'ProposalCreated',
  ConsensusReached = 'ConsensusReached',
  TaskExecuted = 'TaskExecuted',
  InferenceCompleted = 'InferenceCompleted',
  StakeUpdated = 'StakeUpdated',
  SwarmStopped = 'SwarmStopped',
}

export interface ConsensusProposal {
  id: string;
  proposerId: string;
  proposalType: ProposalType;
  data: any;
  stakeAmount: number;
  timestamp: number;
}

export enum ProposalType {
  TaskExecution = 'TaskExecution',
  ResourceAllocation = 'ResourceAllocation',
  SwarmConfiguration = 'SwarmConfiguration',
  PublicGoodsInitiative = 'PublicGoodsInitiative',
}

export interface ConsensusVote {
  voterId: string;
  proposalId: string;
  vote: VoteType;
  stakeWeight: number;
  reasoning?: string;
  timestamp: number;
}

export enum VoteType {
  Approve = 'Approve',
  Reject = 'Reject',
  Abstain = 'Abstain',
}

export interface ConsensusResult {
  proposalId: string;
  decision: ConsensusDecision;
  voteSummary: VoteSummary;
  finalizedAt: number;
  executionApproved: boolean;
}

export enum ConsensusDecision {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Timeout = 'Timeout',
}

export interface VoteSummary {
  totalVotes: number;
  approveVotes: number;
  rejectVotes: number;
  abstainVotes: number;
  totalStake: number;
  approveStake: number;
  rejectStake: number;
  participationRate: number;
}

export interface InferenceRequest {
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  sessionId?: string;
  proofOfInference: boolean;
  stakeAmount?: number;
}

export interface InferenceResponse {
  id: string;
  model: string;
  response: string;
  tokensUsed: number;
  inferenceTimeMs: number;
  proofHash?: string;
  validatorNodes: string[];
  consensusScore: number;
}

export interface MultiNodeSession {
  sessionId: string;
  nodes: string[];
  consensusThreshold: number;
  routingStrategy: string;
}

export interface StakePool {
  poolId: string;
  totalStake: number;
  activeTasks: number;
  performanceScore: number;
}