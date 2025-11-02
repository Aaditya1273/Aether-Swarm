'use client';

import { useState, useEffect } from 'react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Discoveries',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: '🔍',
      color: 'text-blue-400'
    },
    {
      title: 'Active Swarms',
      value: '23',
      change: '+3',
      trend: 'up',
      icon: '🌀',
      color: 'text-purple-400'
    },
    {
      title: 'Consensus Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: '🎯',
      color: 'text-green-400'
    },
    {
      title: 'Avg Response Time',
      value: '1.3s',
      change: '-0.2s',
      trend: 'up',
      icon: '⚡',
      color: 'text-yellow-400'
    },
    {
      title: '$COR Staked',
      value: '2.4M',
      change: '+156K',
      trend: 'up',
      icon: '💰',
      color: 'text-orange-400'
    },
    {
      title: 'Grants Deployed',
      value: '89',
      change: '+7',
      trend: 'up',
      icon: '🚀',
      color: 'text-cyan-400'
    }
  ]);

  const [networkStats, setNetworkStats] = useState({
    totalNodes: 1247,
    activeInferences: 89,
    networkUptime: '99.7%',
    totalStake: '12.4M COR'
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: updateMetricValue(metric.title, metric.value),
        change: generateRandomChange(metric.trend)
      })));

      setNetworkStats(prev => ({
        ...prev,
        activeInferences: Math.floor(Math.random() * 50) + 70,
        totalNodes: prev.totalNodes + Math.floor(Math.random() * 3) - 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateMetricValue = (title: string, currentValue: string): string => {
    const numValue = parseFloat(currentValue.replace(/[^\d.]/g, ''));
    let change = 0;

    switch (title) {
      case 'Total Discoveries':
        change = Math.floor(Math.random() * 5);
        return (numValue + change).toLocaleString();
      case 'Active Swarms':
        change = Math.floor(Math.random() * 3) - 1;
        return Math.max(1, numValue + change).toString();
      case 'Consensus Rate':
        change = (Math.random() - 0.5) * 2;
        return Math.min(100, Math.max(80, numValue + change)).toFixed(1) + '%';
      case 'Avg Response Time':
        change = (Math.random() - 0.5) * 0.4;
        return Math.max(0.5, numValue + change).toFixed(1) + 's';
      case '$COR Staked':
        change = Math.random() * 0.1;
        return (numValue + change).toFixed(1) + 'M';
      case 'Grants Deployed':
        change = Math.random() > 0.8 ? 1 : 0;
        return (numValue + change).toString();
      default:
        return currentValue;
    }
  };

  const generateRandomChange = (trend: 'up' | 'down' | 'stable'): string => {
    const value = Math.random() * 10;
    const sign = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Network Status */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <h2 className="text-xl font-bold text-white mb-6">🌐 Network Status</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{networkStats.totalNodes}</div>
            <div className="text-sm text-gray-400">Total Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{networkStats.activeInferences}</div>
            <div className="text-sm text-gray-400">Active Inferences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{networkStats.networkUptime}</div>
            <div className="text-sm text-gray-400">Network Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{networkStats.totalStake}</div>
            <div className="text-sm text-gray-400">Total Stake</div>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20 hover:border-slate-400/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`flex items-center space-x-1 text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <span>{metric.change}</span>
                <span>{metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}</span>
              </div>
            </div>
            
            <div className={`text-3xl font-bold ${metric.color} mb-2`}>
              {metric.value}
            </div>
            
            <div className="text-sm text-gray-400">
              {metric.title}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <h3 className="text-xl font-bold text-white mb-6">📡 Live Activity Feed</h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <ActivityItem 
            icon="🔍"
            message="Scout agent discovered new DePIN opportunity"
            details="Helium network expansion in rural Kenya"
            time="2s ago"
            type="discovery"
          />
          <ActivityItem 
            icon="🎯"
            message="Consensus reached on climate tech proposal"
            details="87% approval rate with 12 agent votes"
            time="15s ago"
            type="consensus"
          />
          <ActivityItem 
            icon="⚙️"
            message="Executor deployed grant contract"
            details="$25,000 for open education platform"
            time="32s ago"
            type="execution"
          />
          <ActivityItem 
            icon="🧠"
            message="Verifier validated infrastructure claim"
            details="Cross-referenced 3 independent sources"
            time="1m ago"
            type="verification"
          />
          <ActivityItem 
            icon="💰"
            message="New stake deposited in pool"
            details="50,000 $COR tokens staked"
            time="2m ago"
            type="staking"
          />
          <ActivityItem 
            icon="🌀"
            message="New swarm spawned"
            details="Healthcare research collective (5 agents)"
            time="3m ago"
            type="swarm"
          />
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-500/20">
        <h3 className="text-xl font-bold text-white mb-6">📈 Performance Trends</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-700/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-gray-400">Discovery Rate Chart</div>
              <div className="text-sm text-gray-500 mt-1">Real-time visualization</div>
            </div>
          </div>
          
          <div className="h-48 bg-slate-700/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-gray-400">Response Time Graph</div>
              <div className="text-sm text-gray-500 mt-1">Last 24 hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  icon: string;
  message: string;
  details: string;
  time: string;
  type: 'discovery' | 'consensus' | 'execution' | 'verification' | 'staking' | 'swarm';
}

function ActivityItem({ icon, message, details, time, type }: ActivityItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discovery': return 'border-l-blue-400';
      case 'consensus': return 'border-l-green-400';
      case 'execution': return 'border-l-purple-400';
      case 'verification': return 'border-l-yellow-400';
      case 'staking': return 'border-l-orange-400';
      case 'swarm': return 'border-l-cyan-400';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 bg-slate-700/20 rounded-lg border-l-4 ${getTypeColor(type)}`}>
      <div className="text-lg">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{message}</div>
        <div className="text-sm text-gray-400 truncate">{details}</div>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{time}</div>
    </div>
  );
}