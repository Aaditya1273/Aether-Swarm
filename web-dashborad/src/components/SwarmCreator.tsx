'use client';

import { useState } from 'react';

interface SwarmCreatorProps {
  onSwarmCreated: (swarm: any) => void;
}

export function SwarmCreator({ onSwarmCreated }: SwarmCreatorProps) {
  const [task, setTask] = useState('');
  const [agentCount, setAgentCount] = useState(5);
  const [categories, setCategories] = useState<string[]>(['depin', 'climate']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

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

  const getIcon = (name: string) => {
    const icons: { [key: string]: JSX.Element } = {
      rocket: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      lightbulb: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 17H9.154a3.374 3.374 0 00-1.849-.553l-.548-.547z" />
        </svg>
      ),
      swirl: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };
    return icons[name] || icons.rocket;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="text-blue-600">
            {getIcon('rocket')}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Swarm</h2>
        </div>
        
        <div className="space-y-6">
          {/* Swarm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Swarm Name
            </label>
            <input
              type="text"
              value={swarmName}
              onChange={(e) => setSwarmName(e.target.value)}
              placeholder="e.g., Climate Tech Discovery Swarm"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Agent Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Agents
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3"
                max="10"
                value={agentCount}
                onChange={(e) => setAgentCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-gray-900 font-medium w-8">{agentCount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              More agents = better coverage but higher resource usage
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Focus Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categories.includes(category)
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget ($COR tokens)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              min="10000"
              max="1000000"
              step="10000"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Budget for inference calls, staking, and grant distribution
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consensus Algorithm
                </label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="hybrid">Hybrid (PBFT + Stake)</option>
                  <option value="pbft">PBFT Only</option>
                  <option value="stake_weighted">Stake Weighted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consensus Threshold
                </label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
            className={`w-full py-4 rounded-lg font-medium text-lg transition-all flex items-center justify-center space-x-2 ${
              !swarmName.trim() || isCreating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
            }`}
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Swarm...</span>
              </>
            ) : (
              <>
                <div className="text-white">
                  {getIcon('swirl')}
                </div>
                <span>Create Swarm</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              {getIcon('lightbulb')}
            </div>
            <div>
              <h4 className="text-blue-900 font-medium mb-1">Pro Tip</h4>
              <p className="text-blue-800 text-sm">
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