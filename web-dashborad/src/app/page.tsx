'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { SwarmDashboard } from '@/components/SwarmDashboard';
import { SwarmExecutor } from '@/components/SwarmExecutor';
import { LiveMetrics } from '@/components/LiveMetrics';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'metrics'>('dashboard');
  const [swarms, setSwarms] = useState<any[]>([]);

  // Show landing page first
  if (!showDashboard) {
    return <LandingPage onEnterDashboard={() => setShowDashboard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo and Product Name */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDashboard(false)}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors mr-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Aether Swarm</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Decentralized AI Collective</p>
              </div>
            </div>

            {/* Center: Navigation Tabs */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Swarm</span>
              </button>
              
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeTab === 'metrics'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Live Metrics</span>
              </button>
            </nav>

            {/* Right: Status Badge */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cortensor Network</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <SwarmDashboard swarms={swarms} />}
        {activeTab === 'create' && <SwarmExecutor />}
        {activeTab === 'metrics' && <LiveMetrics />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Built on Cortensor Network</p>
            <p className="text-xs text-gray-500 mt-1">
              A self-orchestrating collective of AI agents that discover, verify, and execute public goods
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}