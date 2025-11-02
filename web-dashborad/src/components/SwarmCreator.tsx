'use client';

import { useState } from 'react';

interface SwarmCreatorProps {
  onSwarmCreated: (swarm: any) => void;
}

export function SwarmCreator({ onSwarmCreated }: SwarmCreatorProps) {
  const [swarmName, setSwarmName] = useState('');
  const [agentCount, setAgentCount] = useState(3);
  const [categories, setCategories] = useState<string[]>(['depin', 'climate']);
  const [budget, setBudget] = useState(100000);
  const [isCreating, setIsCreating] = useState(false);

  const availableCategories = [
    'depin',
    'climate', 
    'education',
    'healthcare',
    'open_source'
  ];

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreateSwarm = async () => {
    if (!swarmName.trim()) return;
    
    setIsCreating(true);
    
    // Simulate swarm creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSwarm = {
      id: `swarm-${Date.now()}`,
      name: swarmName,
      status: 'running' as const,
      agents: agentCount,
      uptime: '0m',
      tasksCompleted: 0,
      consensusRate: 0,
      categories: categories
    };
    
    onSwarmCreated(newSwarm);
    
    // Reset form
    setSwarmName('');
    setAgentCount(3);
    setCategories(['depin', 'climate']);
    setBudget(100000);
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">🚀 Create New Swarm</h2>
        
        <div className="space-y-6">
          {/* Swarm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Swarm Name
            </label>
            <input
              type="text"
              value={swarmName}
              onChange={(e) => setSwarmName(e.target.value)}
              placeholder="e.g., Climate Tech Discovery Swarm"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Agent Count */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Agents
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3"
                max="10"
                value={agentCount}
                onChange={(e) => setAgentCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-medium w-8">{agentCount}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              More agents = better coverage but higher resource usage
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Focus Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categories.includes(category)
                      ? 'bg-purple-600 text-white border-2 border-purple-500'
                      : 'bg-slate-700/50 text-gray-300 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget ($COR tokens)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              min="10000"
              max="1000000"
              step="10000"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-400 mt-1">
              Budget for inference calls, staking, and grant distribution
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consensus Algorithm
                </label>
                <select className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="hybrid">Hybrid (PBFT + Stake)</option>
                  <option value="pbft">PBFT Only</option>
                  <option value="stake_weighted">Stake Weighted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consensus Threshold
                </label>
                <select className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="0.7">70% (Recommended)</option>
                  <option value="0.6">60% (Faster)</option>
                  <option value="0.8">80% (More Secure)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateSwarm}
            disabled={!swarmName.trim() || isCreating}
            className={`w-full py-4 rounded-lg font-medium text-lg transition-all ${
              !swarmName.trim() || isCreating
                ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02]'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Swarm...</span>
              </div>
            ) : (
              '🌀 Create Swarm'
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 text-xl">💡</div>
            <div>
              <h4 className="text-blue-300 font-medium mb-1">Pro Tip</h4>
              <p className="text-blue-200 text-sm">
                Start with 3-5 agents and expand based on performance. Each agent specializes in different aspects: 
                Scout (discovery), Verifier (validation), and Executor (implementation).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}