// REAL Swarm Executor - Calls actual API

'use client';

import { useState } from 'react';

export function SwarmExecutor() {
  const [task, setTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleExecute = async () => {
    if (!task.trim()) {
      setError('Please enter a task');
      return;
    }

    setIsExecuting(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task, 
          categories: ['depin', 'climate', 'web3'] 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Execution failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Execute Swarm Task</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Find DePIN infrastructure gaps in Southeast Asia"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecuting || !task.trim()}
            className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 ${
              isExecuting || !task.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isExecuting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Swarm...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Execute</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Execution Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Time</p>
                <p className="text-2xl font-bold">{(results.totalTime / 1000).toFixed(2)}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Discoveries</p>
                <p className="text-2xl font-bold">{results.discoveries?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-green-600">{results.verified?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">$COR Cost</p>
                <p className="text-2xl font-bold text-purple-600">{results.cortensor?.total_cost_cor || 0}</p>
              </div>
            </div>
          </div>

          {/* Cortensor Integration */}
          {results.cortensor && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Cortensor Integration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-purple-700 font-medium">$COR Staked</p>
                  <p className="text-lg font-bold text-purple-900">{results.cortensor.staked?.amount || 0}</p>
                  {results.cortensor.staked?.success && (
                    <p className="text-xs text-green-600">✓ Confirmed</p>
                  )}
                </div>
                {results.cortensor.proof_of_inference && (
                  <>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">PoI Validated</p>
                      <p className="text-lg font-bold text-purple-900">
                        {results.cortensor.proof_of_inference.poi_validated}/{results.cortensor.proof_of_inference.total_inferences}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Validators</p>
                      <p className="text-lg font-bold text-purple-900">{results.cortensor.proof_of_inference.total_validators}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Network</p>
                      <p className="text-xs font-bold text-purple-900">Cortensor</p>
                      <p className="text-xs text-purple-600">Decentralized</p>
                    </div>
                  </>
                )}
              </div>
              {results.cortensor.staked?.tx_hash && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-purple-700">Transaction Hash:</p>
                  <p className="text-xs font-mono text-purple-900 truncate">{results.cortensor.staked.tx_hash}</p>
                </div>
              )}
            </div>
          )}

          {/* Phase Results */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Phase Breakdown</h3>
            <div className="space-y-4">
              {/* Discovery */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">1. Discovery Phase</h4>
                <p className="text-sm text-gray-600">
                  Found {results.phases?.discovery?.count} opportunities in {(results.phases?.discovery?.duration / 1000).toFixed(1)}s
                </p>
              </div>

              {/* Verification */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">2. Verification Phase</h4>
                <p className="text-sm text-gray-600">
                  Verified {results.phases?.verification?.verified}/{results.phases?.verification?.totalChecked} discoveries
                </p>
              </div>

              {/* Execution */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">3. Execution Phase</h4>
                <p className="text-sm text-gray-600">
                  Executed {results.phases?.execution?.executed} transactions
                  {results.phases?.execution?.blockchainConnected && ' • Blockchain Connected ✓'}
                </p>
              </div>
            </div>
          </div>

          {/* Discoveries */}
          {results.discoveries && results.discoveries.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Top Discoveries</h3>
              <div className="space-y-3">
                {results.discoveries.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{d.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{d.description?.substring(0, 150)}...</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">{d.source}</span>
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View Source →
                          </a>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-blue-600">{d.score}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
