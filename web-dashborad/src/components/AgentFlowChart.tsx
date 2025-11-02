'use client';

import { useState, useEffect } from 'react';

interface AgentFlowChartProps {
  swarmId: string;
}

interface AgentNode {
  id: string;
  type: 'scout' | 'verifier' | 'executor';
  status: 'active' | 'idle' | 'processing';
  currentTask?: string;
  confidence?: number;
}

export function AgentFlowChart({ swarmId }: AgentFlowChartProps) {
  const [agents, setAgents] = useState<AgentNode[]>([
    {
      id: 'scout-1',
      type: 'scout',
      status: 'processing',
      currentTask: 'Scanning GitHub repositories',
      confidence: 0.87
    },
    {
      id: 'verifier-1',
      type: 'verifier',
      status: 'processing',
      currentTask: 'Cross-validating proposals',
      confidence: 0.94
    },
    {
      id: 'executor-1',
      type: 'executor',
      status: 'active',
      currentTask: 'Deploying grant contract',
      confidence: 0.96
    }
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 'processing' : Math.random() > 0.3 ? 'active' : 'idle',
        confidence: agent.confidence ? Math.max(0.7, Math.min(1.0, agent.confidence + (Math.random() - 0.5) * 0.1)) : undefined
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'scout': return '🕵️';
      case 'verifier': return '🧠';
      case 'executor': return '⚙️';
      default: return '🤖';
    }
  };

  const getAgentColor = (type: string, status: string) => {
    const baseColors = {
      scout: 'border-blue-300',
      verifier: 'border-purple-300', 
      executor: 'border-green-300'
    };

    const statusColors = {
      active: '',
      processing: 'ring-2 ring-yellow-200 ring-opacity-50',
      idle: 'opacity-75'
    };

    return `${baseColors[type as keyof typeof baseColors]} ${statusColors[status as keyof typeof statusColors]}`;
  };

  return (
    <div className="relative w-full h-96 bg-gray-50 rounded-xl p-6 border border-gray-200">
      {/* Agent nodes */}
      <div className="grid grid-cols-3 gap-4 h-full">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`relative p-4 rounded-xl border-2 ${getAgentColor(agent.type, agent.status)} bg-white shadow-sm`}
          >
            {/* Agent Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getAgentIcon(agent.type)}</span>
              <div>
                <div className="text-sm font-medium text-white capitalize">
                  {agent.type}
                </div>
                <div className="text-xs text-gray-400">
                  {agent.id}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'active' ? 'bg-green-400' :
                agent.status === 'processing' ? 'bg-yellow-400 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="text-xs text-gray-300 capitalize">{agent.status}</span>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Current Task:</div>
                <div className="text-xs text-white truncate" title={agent.currentTask}>
                  {agent.currentTask}
                </div>
              </div>
            )}

            {/* Confidence Score */}
            {agent.confidence && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Confidence</span>
                  <span className="text-green-400">{(agent.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${agent.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Processing Animation */}
            {agent.status === 'processing' && (
              <div className="absolute top-1 right-1">
                <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="text-white font-medium mb-2">Agent Types</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🕵️</span>
            <span className="text-gray-300">Scout</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧠</span>
            <span className="text-gray-300">Verifier</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚙️</span>
            <span className="text-gray-300">Executor</span>
          </div>
        </div>
      </div>
    </div>
  );
}