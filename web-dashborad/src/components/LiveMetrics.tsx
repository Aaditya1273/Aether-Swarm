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

const getIcon = (iconName: string) => {
  const iconProps = "w-6 h-6";
  
  switch (iconName) {
    case 'search':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
    case 'lightning':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'check-circle':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'clock':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'currency-dollar':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
    case 'rocket':
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
    default:
      return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Discoveries',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: 'search',
      color: 'text-blue-600'
    },
    {
      title: 'Active Swarms',
      value: '23',
      change: '+3',
      trend: 'up',
      icon: 'lightning',
      color: 'text-purple-600'
    },
    {
      title: 'Consensus Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: 'check-circle',
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: '1.3s',
      change: '-0.2s',
      trend: 'up',
      icon: 'clock',
      color: 'text-yellow-600'
    },
    {
      title: 'COR Staked',
      value: '2.4M',
      change: '+156K',
      trend: 'up',
      icon: 'currency-dollar',
      color: 'text-orange-600'
    },
    {
      title: 'Grants Deployed',
      value: '89',
      change: '+7',
      trend: 'up',
      icon: 'rocket',
      color: 'text-cyan-600'
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Metrics</h1>
          <p className="text-gray-600 mt-1">Real-time network performance and activity monitoring</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Cortensor Network Status</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{networkStats.totalNodes.toLocaleString()}</div>
            <div className="text-sm text-gray-600 font-medium">Total Nodes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{networkStats.activeInferences}</div>
            <div className="text-sm text-gray-600 font-medium">Active Inferences</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{networkStats.networkUptime}</div>
            <div className="text-sm text-gray-600 font-medium">Network Uptime</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{networkStats.totalStake}</div>
            <div className="text-sm text-gray-600 font-medium">Total Stake</div>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                metric.color === 'text-blue-600' ? 'bg-blue-100' :
                metric.color === 'text-purple-600' ? 'bg-purple-100' :
                metric.color === 'text-green-600' ? 'bg-green-100' :
                metric.color === 'text-yellow-600' ? 'bg-yellow-100' :
                metric.color === 'text-orange-600' ? 'bg-orange-100' :
                metric.color === 'text-cyan-600' ? 'bg-cyan-100' : 'bg-gray-100'
              }`}>
                <div className={metric.color}>
                  {getIcon(metric.icon)}
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'text-green-700 bg-green-100' : 
                metric.trend === 'down' ? 'text-red-700 bg-red-100' : 'text-gray-700 bg-gray-100'
              }`}>
                <span>{metric.change}</span>
                <span>{metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}</span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metric.value}
            </div>
            
            <div className="text-sm text-gray-600 font-medium">
              {metric.title}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
        </div>
        
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

      {/* Performance Charts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-gray-700 font-medium">Discovery Rate Chart</div>
              <div className="text-sm text-gray-500 mt-1">Real-time visualization</div>
            </div>
          </div>
          
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-gray-700 font-medium">Response Time Graph</div>
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
      case 'discovery': return 'border-l-blue-500';
      case 'consensus': return 'border-l-green-500';
      case 'execution': return 'border-l-purple-500';
      case 'verification': return 'border-l-yellow-500';
      case 'staking': return 'border-l-orange-500';
      case 'swarm': return 'border-l-cyan-500';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 transition-colors ${getTypeColor(type)}`}>
      <div className="text-lg">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-gray-900 font-medium">{message}</div>
        <div className="text-sm text-gray-600 truncate">{details}</div>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap font-medium">{time}</div>
    </div>
  );
}