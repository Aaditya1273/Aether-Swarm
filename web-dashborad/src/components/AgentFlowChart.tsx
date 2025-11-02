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
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                agent.type === 'scout' ? 'bg-blue-100' :
                agent.type === 'verifier' ? 'bg-purple-100' : 'bg-green-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  agent.type === 'scout' ? 'text-blue-600' :
                  agent.type === 'verifier' ? 'text-purple-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {agent.type === 'scout' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                  {agent.type === 'verifier' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {agent.type === 'executor' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 capitalize">
                  {agent.type}
                </div>
                <div className="text-xs text-gray-500">
                  {agent.id}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'active' ? 'bg-green-500' :
                agent.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className={`text-xs font-medium capitalize ${
                agent.status === 'active' ? 'text-green-700' :
                agent.status === 'processing' ? 'text-yellow-700' :
                'text-gray-500'
              }`}>{agent.status}</span>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 font-medium mb-1">Current Task:</div>
                <div className="text-xs text-gray-700 truncate" title={agent.currentTask}>
                  {agent.currentTask}
                </div>
              </div>
            )}

            {/* Confidence Score */}
            {agent.confidence && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium">Confidence</span>
                  <span className="text-green-600 font-semibold">{(agent.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${agent.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Processing Animation */}
            {agent.status === 'processing' && (
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-sm">
        <div className="text-gray-900 font-semibold mb-2">Agent Types</div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-gray-700">Scout</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-700">Verifier</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <span className="text-gray-700">Executor</span>
          </div>
        </div>
      </div>
    </div>
  );
}