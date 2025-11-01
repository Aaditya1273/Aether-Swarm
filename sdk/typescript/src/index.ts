export * from './swarm';
export * from './agents';
export * from './cortensor';
export * from './consensus';
export * from './types';

// Main exports for easy importing
export { AetherSwarm } from './swarm';
export { CortensorClient } from './cortensor';
export { ScoutAgent, VerifierAgent, ExecutorAgent } from './agents';
export type { 
  SwarmConfig, 
  AgentTask, 
  AgentOutput, 
  SwarmEvent,
  ConsensusResult 
} from './types';