'use client';

import { useState, useEffect } from 'react';
import { SwarmDashboard } from '@/components/SwarmDashboard';
import { SwarmCreator } from '@/components/SwarmCreator';
import { LiveMetrics } from '@/components/LiveMetrics';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'metrics'>('dashboard');
  const [swarms, setSwarms] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            🌀 Aether Swarm
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Decentralized Agent Collective for Public Goods Discovery & Execution
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Powered by Cortensor's Decentralized Intelligence Network
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-purple-500/20">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'create'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              🚀 Create Swarm
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'metrics'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📈 Live Metrics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <SwarmDashboard swarms={swarms} />}
          {activeTab === 'create' && <SwarmCreator onSwarmCreated={(swarm) => setSwarms([...swarms, swarm])} />}
          {activeTab === 'metrics' && <LiveMetrics />}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p className="text-sm">
            Built for Cortensor Hackathon #2 • Deadline: November 2, 2025
          </p>
          <p className="text-xs mt-2">
            🔥 "A self-orchestrating hive of AI agents that discover, verify, and execute public goods"
          </p>
        </div>
      </div>
    </div>
  );
}