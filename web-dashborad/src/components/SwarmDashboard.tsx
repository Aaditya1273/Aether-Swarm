'use client';

import { useState, useEffect } from 'react';
import { SwarmCard } from './SwarmCard';
import { AgentFlowChart } from './AgentFlowChart';
import { DiscoveryResults } from './DiscoveryResults';
import { useSwarmWebSocket, getWebSocketUrl } from '@/lib/websocket';

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
  const [liveSwarms, setLiveSwarms] = useState<Swarm[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Real-time WebSocket connection
  const { isConnected, events, metrics, subscribeToSwarm, requestMetrics } = useSwarmWebSocket(getWebSocketUrl());

  // Update swarms from real-time metrics
  useEffect(() => {
    if (metrics.length > 0) {
      const updatedSwarms = metrics.map(metric => ({
        id: metric.swarm_id,
        name: `Swarm ${metric.swarm_id.slice(0, 8)}`,
        status: 'running' as const,
        agents: metric.active_agents,
        uptime: formatUptime(metric.uptime_seconds),
        tasksCompleted: metric.tasks_completed,
        consensusRate: metric.consensus_rate,
        categories: ['depin', 'climate', 'education'] // Would come from swarm config
      }));
      setLiveSwarms(updatedSwarms);
    }
  }, [metrics]);

  // Update recent activity from events
  useEffect(() => {
    if (events.length > 0) {
      const activities = events.slice(0, 10).map(event => ({
        id: event.id,
        type: event.event_type,
        agent_id: event.agent_id,
        data: event.data,
        timestamp: event.timestamp
      }));
      setRecentActivity(activities);
    }
  }, [events]);

  // Request metrics on component mount
  useEffect(() => {
    if (isConnected) {
      requestMetrics();
      // Request metrics every 30 seconds
      const interval = setInterval(requestMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, requestMetrics]);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Use live swarms if available, otherwise fall back to props
  const displaySwarms = liveSwarms.length > 0 ? liveSwarms : swarms;

  const activeSwarms = displaySwarms.filter(s => s.status === 'running');
  const totalAgents = displaySwarms.reduce((sum, s) => sum + s.agents, 0);
  const avgConsensusRate = displaySwarms.length > 0 
    ? displaySwarms.reduce((sum, s) => sum + s.consensusRate, 0) / displaySwarms.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Swarms</p>
              <p className="text-3xl font-bold text-gray-900">{activeSwarms.length}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Agents</p>
              <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Consensus Rate</p>
              <p className="text-3xl font-bold text-gray-900">{avgConsensusRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Tasks Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {displaySwarms.reduce((sum, s) => sum + s.tasksCompleted, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
          isConnected 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Live Data Connected' : 'Connecting to Live Data...'}
        </div>
      </div>

      {/* Swarm Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displaySwarms.map((swarm) => (
          <SwarmCard
            key={swarm.id}
            swarm={swarm}
            onClick={() => {
              setSelectedSwarm(swarm);
              subscribeToSwarm(swarm.id);
            }}
          />
        ))}
        
        {displaySwarms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Swarms</h3>
            <p className="text-gray-500">Create your first swarm to start discovering public goods opportunities</p>
          </div>
        )}
      </div>

      {/* Agent Flow Visualization */}
      {selectedSwarm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          
          <DiscoveryResults swarmId={selectedSwarm.id} limit={5} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <h3 className="text-xl font-bold text-white mb-6">
          Recent Activity 
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({recentActivity.length} live events)
          </span>
        </h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {getActivityTitle(activity.type, activity.data)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {getActivityDescription(activity.type, activity.data)} • {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <div className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {getActivityStatus(activity.type)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📡</div>
              <p className="text-gray-400">Waiting for live activity...</p>
              <p className="text-sm text-gray-500 mt-1">
                {isConnected ? 'Connected and monitoring swarms' : 'Connecting to live feed...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getActivityIcon(type: string): string {
    switch (type) {
      case 'AgentSpawned': return '🚀';
      case 'TaskExecuted': return '⚡';
      case 'ConsensusReached': return '🎯';
      case 'ProposalCreated': return '💡';
      case 'SwarmStopped': return '🛑';
      default: return '📊';
    }
  }

  function getActivityTitle(type: string, data: any): string {
    switch (type) {
      case 'AgentSpawned': return `New swarm spawned with ${data.agent_count || 0} agents`;
      case 'TaskExecuted': return `Agent completed task with ${((data.confidence || 0) * 100).toFixed(1)}% confidence`;
      case 'ConsensusReached': return `Swarm consensus reached`;
      case 'ProposalCreated': return `New proposal created for ${data.task_type || 'unknown'} task`;
      case 'SwarmStopped': return 'Swarm stopped';
      default: return 'Unknown activity';
    }
  }

  function getActivityDescription(type: string, data: any): string {
    switch (type) {
      case 'AgentSpawned': return `Swarm ID: ${data.swarm_id?.slice(0, 8) || 'unknown'}`;
      case 'TaskExecuted': return `Execution time: ${data.execution_time_ms || 0}ms`;
      case 'ConsensusReached': return `${data.execution_approved ? 'Approved' : 'Rejected'} with ${(data.vote_summary?.participation_rate * 100 || 0).toFixed(1)}% participation`;
      case 'ProposalCreated': return `Categories: ${data.categories?.join(', ') || 'unknown'}`;
      case 'SwarmStopped': return `Shutdown completed`;
      default: return 'Live event data';
    }
  }

  function getActivityColor(type: string): string {
    switch (type) {
      case 'AgentSpawned': return 'text-blue-400';
      case 'TaskExecuted': return 'text-green-400';
      case 'ConsensusReached': return 'text-purple-400';
      case 'ProposalCreated': return 'text-yellow-400';
      case 'SwarmStopped': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  function getActivityStatus(type: string): string {
    switch (type) {
      case 'AgentSpawned': return 'Active';
      case 'TaskExecuted': return 'Completed';
      case 'ConsensusReached': return 'Consensus';
      case 'ProposalCreated': return 'Pending';
      case 'SwarmStopped': return 'Stopped';
      default: return 'Live';
    }
  }

  function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000; // Convert to milliseconds
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}