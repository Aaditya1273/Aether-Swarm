'use client';

import { useState, useEffect } from 'react';
import { SwarmCard } from './SwarmCard';
import { AgentFlowChart } from './AgentFlowChart';

interface Swarm {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  agents: number;
  uptime: string;
  tasksCompleted: number;
  consensusRate: number;
  categories: string[];
}

interface SwarmDashboardProps {
  swarms: Swarm[];
}

export function SwarmDashboard({ swarms }: SwarmDashboardProps) {
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [mockSwarms, setMockSwarms] = useState<Swarm[]>([
    {
      id: 'swarm-001',
      name: 'DePIN Discovery Swarm',
      status: 'running',
      agents: 5,
      uptime: '2h 34m',
      tasksCompleted: 127,
      consensusRate: 94.2,
      categories: ['depin', 'infrastructure']
    },
    {
      id: 'swarm-002', 
      name: 'Climate Tech Scout',
      status: 'running',
      agents: 3,
      uptime: '45m',
      tasksCompleted: 23,
      consensusRate: 87.5,
      categories: ['climate', 'sustainability']
    },
    {
      id: 'swarm-003',
      name: 'Education Initiative Finder',
      status: 'paused',
      agents: 4,
      uptime: '1h 12m',
      tasksCompleted: 67,
      consensusRate: 91.8,
      categories: ['education', 'accessibility']
    }
  ]);

  const activeSwarms = mockSwarms.filter(s => s.status === 'running');
  const totalAgents = mockSwarms.reduce((sum, s) => sum + s.agents, 0);
  const avgConsensusRate = mockSwarms.reduce((sum, s) => sum + s.consensusRate, 0) / mockSwarms.length;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Swarms</p>
              <p className="text-3xl font-bold text-cyan-400">{activeSwarms.length}</p>
            </div>
            <div className="text-cyan-400 text-2xl">🌀</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Agents</p>
              <p className="text-3xl font-bold text-purple-400">{totalAgents}</p>
            </div>
            <div className="text-purple-400 text-2xl">🤖</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Consensus Rate</p>
              <p className="text-3xl font-bold text-green-400">{avgConsensusRate.toFixed(1)}%</p>
            </div>
            <div className="text-green-400 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tasks Today</p>
              <p className="text-3xl font-bold text-yellow-400">
                {mockSwarms.reduce((sum, s) => sum + s.tasksCompleted, 0)}
              </p>
            </div>
            <div className="text-yellow-400 text-2xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Swarm Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockSwarms.map((swarm) => (
          <SwarmCard
            key={swarm.id}
            swarm={swarm}
            onClick={() => setSelectedSwarm(swarm)}
          />
        ))}
      </div>

      {/* Agent Flow Visualization */}
      {selectedSwarm && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Agent Communication Flow: {selectedSwarm.name}
            </h3>
            <button
              onClick={() => setSelectedSwarm(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <AgentFlowChart swarmId={selectedSwarm.id} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl">🕵️</div>
            <div className="flex-1">
              <p className="text-white font-medium">Scout Agent discovered new DePIN opportunity</p>
              <p className="text-sm text-gray-400">Helium network expansion in Southeast Asia • 2 minutes ago</p>
            </div>
            <div className="text-green-400 text-sm font-medium">High Impact</div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl">🧠</div>
            <div className="flex-1">
              <p className="text-white font-medium">Verifier Agent validated climate tech proposal</p>
              <p className="text-sm text-gray-400">Carbon capture project verification complete • 5 minutes ago</p>
            </div>
            <div className="text-blue-400 text-sm font-medium">Verified</div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl">⚙️</div>
            <div className="flex-1">
              <p className="text-white font-medium">Executor Agent deployed funding contract</p>
              <p className="text-sm text-gray-400">$50,000 grant for open-source education tools • 8 minutes ago</p>
            </div>
            <div className="text-purple-400 text-sm font-medium">Executed</div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <p className="text-white font-medium">Swarm consensus reached on infrastructure proposal</p>
              <p className="text-sm text-gray-400">85% approval rate with 12 agent votes • 12 minutes ago</p>
            </div>
            <div className="text-green-400 text-sm font-medium">Consensus</div>
          </div>
        </div>
      </div>
    </div>
  );
}