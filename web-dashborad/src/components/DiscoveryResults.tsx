'use client';

import { useState, useEffect } from 'react';
import { getDiscoveryResults, getSourceIcon, getCategoryColor, formatTimeAgo, DiscoveryResult } from '@/lib/database';

interface DiscoveryResultsProps {
  swarmId: string;
  limit?: number;
}

export function DiscoveryResults({ swarmId, limit = 10 }: DiscoveryResultsProps) {
  const [discoveries, setDiscoveries] = useState<DiscoveryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadDiscoveries = async () => {
      setLoading(true);
      try {
        const results = await getDiscoveryResults(swarmId, limit);
        setDiscoveries(results);
      } catch (error) {
        console.error('Failed to load discoveries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscoveries();
    
    // Refresh every 30 seconds for live demo
    const interval = setInterval(loadDiscoveries, 30000);
    return () => clearInterval(interval);
  }, [swarmId, limit]);

  const categories = ['all', ...Array.from(new Set(discoveries.map(d => d.category)))];
  const filteredDiscoveries = selectedCategory === 'all' 
    ? discoveries 
    : discoveries.filter(d => d.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          🔍 Discovery Results
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({filteredDiscoveries.length} found)
          </span>
        </h3>
        
        {/* Category Filter */}
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredDiscoveries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-400">No discoveries found</p>
          <p className="text-sm text-gray-500 mt-1">
            Run scout tasks to discover public goods opportunities
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredDiscoveries.map((discovery) => (
            <div key={discovery.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getSourceIcon(discovery.source)}</span>
                    <span className="text-sm text-gray-400">{discovery.source}</span>
                    <span className={`text-sm font-medium ${getCategoryColor(discovery.category)}`}>
                      {discovery.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(discovery.created_at)}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium mb-2 line-clamp-2">
                    {discovery.title}
                  </h4>
                  
                  {discovery.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {discovery.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {discovery.impact_score && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Impact:</span>
                        <span className="text-sm font-medium text-yellow-400">
                          {discovery.impact_score.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">Confidence:</span>
                      <span className="text-sm font-medium text-green-400">
                        {(discovery.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {discovery.url && (
                      <a
                        href={discovery.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Source →
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className={`w-3 h-3 rounded-full ${
                    discovery.confidence > 0.9 ? 'bg-green-400' :
                    discovery.confidence > 0.7 ? 'bg-yellow-400' : 'bg-red-400'
                  }`} title={`Confidence: ${(discovery.confidence * 100).toFixed(1)}%`} />
                </div>
              </div>
              
              {/* Metadata */}
              {discovery.metadata && Object.keys(discovery.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600/30">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(discovery.metadata).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="text-xs bg-slate-600/30 px-2 py-1 rounded">
                        <span className="text-gray-400">{key}:</span>{' '}
                        <span className="text-gray-300">{String(value)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}