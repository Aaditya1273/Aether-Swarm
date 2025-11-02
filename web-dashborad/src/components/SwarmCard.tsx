'use client';

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

interface SwarmCardProps {
  swarm: Swarm;
  onClick: () => void;
}

export function SwarmCard({ swarm, onClick }: SwarmCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'paused': return 'Paused';
      case 'stopped': return 'Stopped';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'depin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'climate': return 'bg-green-100 text-green-700 border-green-200';
      case 'education': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'healthcare': return 'bg-red-100 text-red-700 border-red-200';
      case 'infrastructure': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'sustainability': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'accessibility': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{swarm.name}</h3>
            <p className="text-sm text-gray-500">ID: {swarm.id.slice(0, 8)}...</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(swarm.status)}`}></div>
          <span className="text-sm text-gray-600 font-medium">{getStatusText(swarm.status)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{swarm.agents}</div>
          <div className="text-xs text-gray-500 font-medium">Agents</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{swarm.tasksCompleted}</div>
          <div className="text-xs text-gray-500 font-medium">Tasks</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Uptime</span>
          <span className="text-sm text-gray-900 font-medium">{swarm.uptime}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Consensus Rate</span>
          <span className="text-sm text-green-600 font-medium">{swarm.consensusRate}%</span>
        </div>
        
        {/* Consensus Rate Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${swarm.consensusRate}%` }}
          ></div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {swarm.categories.map((category, index) => (
          <span
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        ))}
      </div>

      {/* Action Hint */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Click to view details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}