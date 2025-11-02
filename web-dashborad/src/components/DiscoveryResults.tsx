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

  const getIcon = (name: string) => {
    const icons: { [key: string]: JSX.Element } = {
      search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      searchLarge: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    };
    return icons[name] || icons.search;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">
            {getIcon('search')}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Discovery Results
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({filteredDiscoveries.length} found)
            </span>
          </h3>
        </div>
        
        {/* Category Filter */}
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredDiscoveries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2 flex justify-center">
            {getIcon('searchLarge')}
          </div>
          <p className="text-gray-600">No discoveries found</p>
          <p className="text-sm text-gray-500 mt-1">
            Run scout tasks to discover public goods opportunities
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredDiscoveries.map((discovery) => (
            <div key={discovery.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getSourceIcon(discovery.source)}</span>
                    <span className="text-sm text-gray-600">{discovery.source}</span>
                    <span className={`text-sm font-medium ${getCategoryColor(discovery.category)}`}>
                      {discovery.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(discovery.created_at)}
                    </span>
                  </div>
                  
                  <h4 className="text-gray-900 font-medium mb-2 line-clamp-2">
                    {discovery.title}
                  </h4>
                  
                  {discovery.description && (
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {discovery.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {discovery.impact_score && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Impact:</span>
                        <span className="text-sm font-medium text-orange-600">
                          {discovery.impact_score.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <span className="text-sm font-medium text-green-600">
                        {(discovery.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {discovery.url && (
                      <a
                        href={discovery.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
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
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(discovery.metadata).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="text-gray-800">{String(value)}</span>
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