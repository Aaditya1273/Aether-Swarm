'use client';

import { useState } from 'react';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const { isConnected } = useAccount();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Aether Swarm</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 transition-colors">Use Cases</a>
              <WalletConnect />
              {isConnected && (
                <button
                  onClick={onEnterDashboard}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Launch Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="text-sm font-medium text-blue-700">Powered by Cortensor Network</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Autonomous AI Agents for<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Public Goods Discovery
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              A self-orchestrating collective of AI agents that discover, verify, and execute 
              high-impact public goods initiatives through decentralized consensus.
            </p>
            {!isConnected && (
              <div className="mb-6 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center space-x-2 text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Connect your wallet to access the dashboard</span>
              </div>
            )}
            <div className="flex justify-center space-x-4">
              {isConnected ? (
                <button
                  onClick={onEnterDashboard}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  Get Started
                </button>
              ) : (
                <div className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg font-semibold text-lg cursor-not-allowed">
                  Get Started
                </div>
              )}
              <a
                href="https://github.com/Aaditya1273/Aether-Swarm"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-700 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all font-semibold text-lg"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">&lt;1.5s</div>
              <div className="text-sm text-gray-600">Avg Inference Speed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">90%+</div>
              <div className="text-sm text-gray-600">Consensus Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">48hrs</div>
              <div className="text-sm text-gray-600">Discovery to Funding</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">$0.02</div>
              <div className="text-sm text-gray-600">Cost per Task</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">Revolutionizing public goods through autonomous agent collectives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Autonomous Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Scout agents continuously scan GitHub, research papers, and news sources 24/7 to identify 
                emerging public goods opportunities with AI-powered analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Decentralized Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Multi-node consensus validation with Cortensor's Proof-of-Inference ensures objective, 
                bias-free assessment of every opportunity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Execution</h3>
              <p className="text-gray-600 leading-relaxed">
                Executor agents automatically deploy smart contracts and distribute funds on Arbitrum, 
                eliminating bureaucratic delays.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Swarm Consensus</h3>
              <p className="text-gray-600 leading-relaxed">
                Stake-weighted voting with 70% consensus threshold ensures democratic decision-making 
                while maintaining efficiency.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proof-of-Inference</h3>
              <p className="text-gray-600 leading-relaxed">
                Cryptographic verification of all agent outputs ensures transparency and accountability 
                in every decision made by the swarm.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Live dashboard with WebSocket updates shows agent communication, consensus progress, 
                and blockchain transactions in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">A seamless four-step process from discovery to execution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Discover</h3>
                <p className="text-gray-600 text-sm">
                  Scout agents scan GitHub, news, and research to identify public goods opportunities
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gray-300 -translate-x-4"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Verify</h3>
                <p className="text-gray-600 text-sm">
                  Verifier agents validate feasibility through multi-node consensus and PoI validation
                </p>
              </div>
              <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gray-300 -translate-x-4"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Consensus</h3>
                <p className="text-gray-600 text-sm">
                  Swarm reaches stake-weighted consensus with 70% threshold for democratic approval
                </p>
              </div>
              <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gray-300 -translate-x-4"></div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Execute</h3>
              <p className="text-gray-600 text-sm">
                Executor agents deploy smart contracts and distribute funds automatically on-chain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Use Cases</h2>
            <p className="text-xl text-gray-600">Real-world applications across multiple domains</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">DePIN Infrastructure</h3>
              <p className="text-gray-600 text-sm">
                Discover gaps in Helium, Filecoin, and Arweave networks and fund node deployments
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Climate Technology</h3>
              <p className="text-gray-600 text-sm">
                Identify carbon capture projects and renewable energy initiatives needing support
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Education & Research</h3>
              <p className="text-gray-600 text-sm">
                Fund open-source educational tools and academic research with measurable impact
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Healthcare Innovation</h3>
              <p className="text-gray-600 text-sm">
                Support medical research, open health data, and telemedicine infrastructure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technical Architecture</h2>
            <p className="text-xl text-gray-600">Built with cutting-edge technologies</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">Rust Core</div>
              <div className="text-sm text-gray-600">High-performance agent logic</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">Next.js 14</div>
              <div className="text-sm text-gray-600">Modern React dashboard</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">Arbitrum</div>
              <div className="text-sm text-gray-600">Layer 2 scaling solution</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">Cortensor</div>
              <div className="text-sm text-gray-600">Decentralized AI network</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">IPFS</div>
              <div className="text-sm text-gray-600">Decentralized storage</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">SQLite</div>
              <div className="text-sm text-gray-600">Persistent data layer</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">Proof-of-Inference</div>
              <div className="text-sm text-gray-600">Cryptographic verification</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 12v12h24V0H0v12zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.728-.05-1.196.331-1.192.967a.88.88 0 00.102.45c.16.331.458.53 1.39.933 1.719.74 2.454 1.227 2.911 1.92.51.773.625 2.008.278 2.926-.38.998-1.325 1.676-2.655 1.9-.411.07-1.384.055-1.814-.025-1.008-.188-1.963-.685-2.405-1.254a3.22 3.22 0 01-.313-.44l1.026-.6c.036-.02.16.12.281.311.357.564.638.795 1.122.921.716.188 1.638.02 2.026-.37.165-.165.234-.406.234-.815 0-.415-.05-.585-.246-.857-.247-.341-.736-.614-1.925-1.076-1.359-.528-1.94-.857-2.463-1.39-.595-.61-.862-1.41-.862-2.586 0-.931.165-1.636.544-2.323.534-.968 1.523-1.636 2.847-1.922.411-.09 1.384-.055 1.773.055z"/>
                </svg>
              </div>
              <div className="font-bold text-gray-900 mb-1">TypeScript</div>
              <div className="text-sm text-gray-600">Type-safe SDK bindings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Public Goods Funding?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join the autonomous revolution in decentralized intelligence and public goods discovery
          </p>
          <div className="flex justify-center space-x-4">
            {isConnected ? (
              <button
                onClick={onEnterDashboard}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Launch Dashboard
              </button>
            ) : (
              <div className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg font-semibold text-lg cursor-not-allowed flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connect Wallet First</span>
              </div>
            )}
            <a
              href="https://github.com/Aaditya1273/Aether-Swarm"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 transition-all font-semibold text-lg border-2 border-blue-500"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-bold">Aether Swarm</span>
              </div>
              <p className="text-sm">
                Decentralized agent collective for autonomous public goods discovery and execution.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><button onClick={onEnterDashboard} className="hover:text-white transition-colors">Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/Aaditya1273/Aether-Swarm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/Aaditya1273/Aether-Swarm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://cortensor.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Cortensor Network</a></li>
                <li><a href="https://arbiscan.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Arbitrum Explorer</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/Aaditya1273/Aether-Swarm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>Built on Cortensor Network</p>
            <p className="mt-2">© 2025 Aether Swarm. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
