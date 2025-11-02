// REAL API Route - Execute Full Swarm Process

import { NextRequest, NextResponse } from 'next/server';
import { ScoutAgent } from '@/lib/agents/scout';
import { ConsensusEngine } from '@/lib/agents/verifier';
import { ExecutorAgent } from '@/lib/agents/executor';
import { cortensor } from '@/lib/cortensor/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { task, categories } = await request.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const taskId = `task_${Date.now()}`;
    
    const results = {
      task,
      taskId,
      status: 'completed',
      phases: {} as any,
      cortensor: {} as any,
      totalTime: 0,
      discoveries: [] as any[],
      verified: [] as any[],
      executed: [] as any[]
    };

    // Stake $COR tokens for this task
    console.log('Staking $COR tokens for task execution');
    const stakeResult = await cortensor.stakeTokens(1000, taskId);
    results.cortensor.staked = {
      amount: 1000,
      token: 'COR',
      tx_hash: stakeResult.tx_hash,
      success: stakeResult.success
    };

    // Phase 1: REAL Discovery with Cortensor AI
    console.log('Phase 1: Scout Discovery');
    const scout = new ScoutAgent();
    const discoveries = await scout.discover(task, categories || ['web3', 'depin', 'climate']);
    
    results.phases.discovery = {
      completed: true,
      count: discoveries.length,
      duration: Date.now() - startTime
    };
    results.discoveries = discoveries.slice(0, 10); // Top 10

    // Phase 2: REAL Verification
    console.log('Phase 2: Consensus Verification');
    const verifyStart = Date.now();
    const consensus = new ConsensusEngine(0.7, 5);
    const verifications = await consensus.verifyBatch(discoveries.slice(0, 10));
    
    const verified = Array.from(verifications.entries())
      .filter(([_, result]) => result.verified)
      .map(([id, result]) => ({
        discoveryId: id,
        confidence: result.confidence,
        consensusReached: result.consensusReached,
        reason: result.reason,
        votes: result.votes.length
      }));

    results.phases.verification = {
      completed: true,
      totalChecked: discoveries.slice(0, 10).length,
      verified: verified.length,
      rejected: discoveries.slice(0, 10).length - verified.length,
      duration: Date.now() - verifyStart
    };
    results.verified = verified;

    // Phase 3: REAL Execution
    console.log('Phase 3: Blockchain Execution');
    const execStart = Date.now();
    const executor = new ExecutorAgent();
    
    // Check blockchain connection
    const isConnected = await executor.isConnected();
    const networkInfo = await executor.getNetworkInfo();

    const executions = [];
    
    if (verified.length > 0) {
      // Execute for top verified discoveries
      for (const v of verified.slice(0, 3)) {
        const discovery = discoveries.find(d => d.id === v.discoveryId);
        if (discovery) {
          const result = await executor.deployGrantContract(discovery, 10000);
          executions.push({
            discoveryId: v.discoveryId,
            title: discovery.title,
            ...result
          });
        }
      }
    }

    results.phases.execution = {
      completed: true,
      executed: executions.length,
      failed: executions.filter(e => !e.success).length,
      blockchainConnected: isConnected,
      network: networkInfo,
      duration: Date.now() - execStart
    };
    results.executed = executions;

    // Collect all PoI hashes from Cortensor-enhanced discoveries
    const poiHashes = discoveries
      .filter((d: any) => d.cortensor_poi)
      .map((d: any) => d.cortensor_poi);

    // Validate PoI hashes
    if (poiHashes.length > 0) {
      console.log('Validating Proof-of-Inference');
      const poiValidations = await Promise.all(
        poiHashes.slice(0, 3).map(hash => cortensor.validatePoI(hash))
      );
      
      results.cortensor.proof_of_inference = {
        total_inferences: discoveries.length,
        poi_validated: poiValidations.filter(v => v.valid).length,
        total_validators: poiValidations.reduce((sum, v) => sum + v.validators, 0),
        hashes: poiHashes.slice(0, 5)
      };
    }

    // Final metrics
    results.totalTime = Date.now() - startTime;
    results.cortensor.network = 'Cortensor Decentralized Inference';
    results.cortensor.total_cost_cor = 1000 + (discoveries.length * 10);

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error: any) {
    console.error('Swarm execution error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
