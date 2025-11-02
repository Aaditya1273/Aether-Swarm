// REAL Self-Improvement Loop for Agent System

import { cortensor } from '../cortensor/client';

interface PerformanceMetrics {
  successRate: number;
  avgConfidence: number;
  avgExecutionTime: number;
  tasksCompleted: number;
}

interface AgentStrategy {
  id: string;
  promptTemplate: string;
  temperature: number;
  parameters: Record<string, any>;
  performance: PerformanceMetrics;
  generation: number;
  timestamp: number;
}

export class SelfImprovementEngine {
  private strategies: Map<string, AgentStrategy> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private improvementThreshold = 0.75; // 75% success rate to keep strategy

  // Learn from task execution results
  async learnFromExecution(
    taskType: string,
    success: boolean,
    confidence: number,
    executionTime: number,
    strategyUsed: AgentStrategy
  ): Promise<void> {
    // Update strategy performance
    const strategy = this.strategies.get(strategyUsed.id);
    if (strategy) {
      const totalTasks = strategy.performance.tasksCompleted + 1;
      const successCount = strategy.performance.successRate * strategy.performance.tasksCompleted + (success ? 1 : 0);
      
      strategy.performance = {
        successRate: successCount / totalTasks,
        avgConfidence: (strategy.performance.avgConfidence * strategy.performance.tasksCompleted + confidence) / totalTasks,
        avgExecutionTime: (strategy.performance.avgExecutionTime * strategy.performance.tasksCompleted + executionTime) / totalTasks,
        tasksCompleted: totalTasks
      };

      this.strategies.set(strategyUsed.id, strategy);
    }

    // If performance is below threshold, trigger improvement
    if (strategy && strategy.performance.successRate < this.improvementThreshold && strategy.performance.tasksCompleted > 10) {
      await this.improveStrategy(strategy, taskType);
    }
  }

  // Use Cortensor AI to improve agent strategies
  private async improveStrategy(strategy: AgentStrategy, taskType: string): Promise<AgentStrategy> {
    console.log(`🔄 Self-improving strategy for ${taskType} (current success: ${strategy.performance.successRate})`);

    try {
      // Ask Cortensor AI to analyze and improve the strategy
      const response = await cortensor.inference({
        prompt: `You are analyzing an AI agent strategy that needs improvement.

Current Strategy:
- Task Type: ${taskType}
- Prompt Template: ${strategy.promptTemplate}
- Temperature: ${strategy.temperature}
- Success Rate: ${(strategy.performance.successRate * 100).toFixed(1)}%
- Avg Confidence: ${(strategy.performance.avgConfidence * 100).toFixed(1)}%
- Avg Execution Time: ${strategy.performance.avgExecutionTime.toFixed(0)}ms

Analyze the strategy and suggest improvements. Return JSON:
{
  "promptTemplate": "improved prompt template",
  "temperature": number,
  "reasoning": "why these changes will improve performance",
  "expectedImprovement": number
}`,
        temperature: 0.3,
        max_tokens: 500,
        stake_amount: 200
      });

      // Parse improved strategy
      try {
        const improvement = JSON.parse(response.result);
        
        const improvedStrategy: AgentStrategy = {
          id: `${strategy.id}_v${strategy.generation + 1}`,
          promptTemplate: improvement.promptTemplate || strategy.promptTemplate,
          temperature: improvement.temperature || strategy.temperature,
          parameters: { ...strategy.parameters },
          performance: {
            successRate: 0,
            avgConfidence: 0,
            avgExecutionTime: 0,
            tasksCompleted: 0
          },
          generation: strategy.generation + 1,
          timestamp: Date.now()
        };

        this.strategies.set(improvedStrategy.id, improvedStrategy);
        
        console.log(`✅ Generated improved strategy v${improvedStrategy.generation}`);
        console.log(`   Reasoning: ${improvement.reasoning}`);
        console.log(`   Expected improvement: +${improvement.expectedImprovement}%`);

        return improvedStrategy;
      } catch {
        return strategy;
      }
    } catch (error) {
      console.error('Strategy improvement failed:', error);
      return strategy;
    }
  }

  // Get best performing strategy for task type
  getBestStrategy(taskType: string): AgentStrategy | null {
    let best: AgentStrategy | null = null;
    let bestScore = 0;

    for (const strategy of this.strategies.values()) {
      const score = strategy.performance.successRate * 0.6 + 
                   strategy.performance.avgConfidence * 0.3 +
                   (1 - strategy.performance.avgExecutionTime / 10000) * 0.1;
      
      if (score > bestScore && strategy.performance.tasksCompleted > 5) {
        bestScore = score;
        best = strategy;
      }
    }

    return best;
  }

  // Create initial strategy
  createStrategy(taskType: string, promptTemplate: string): AgentStrategy {
    const strategy: AgentStrategy = {
      id: `strategy_${taskType}_${Date.now()}`,
      promptTemplate,
      temperature: 0.7,
      parameters: {},
      performance: {
        successRate: 0,
        avgConfidence: 0,
        avgExecutionTime: 0,
        tasksCompleted: 0
      },
      generation: 1,
      timestamp: Date.now()
    };

    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  // Get improvement statistics
  getImprovementStats(): {
    totalStrategies: number;
    avgGeneration: number;
    bestPerformance: number;
    improvementRate: number;
  } {
    const strategies = Array.from(this.strategies.values());
    
    return {
      totalStrategies: strategies.length,
      avgGeneration: strategies.reduce((sum, s) => sum + s.generation, 0) / strategies.length || 0,
      bestPerformance: Math.max(...strategies.map(s => s.performance.successRate), 0),
      improvementRate: strategies.filter(s => s.generation > 1).length / strategies.length || 0
    };
  }
}

// Global instance
export const selfImprovement = new SelfImprovementEngine();
