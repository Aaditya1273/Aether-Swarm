// Simple SQLite database interface for the web dashboard
// In a real production app, this would be a proper API

export interface DiscoveryResult {
  id: string;
  source: string;
  category: string;
  title: string;
  url?: string;
  description?: string;
  impact_score?: number;
  confidence: number;
  created_at: string;
  metadata: any;
}

export interface SwarmAnalytics {
  swarm_id: string;
  total_tasks: number;
  total_outputs: number;
  total_discoveries: number;
  total_consensus: number;
  average_confidence: number;
  generated_at: string;
}

export interface TaskRecord {
  id: string;
  swarm_id: string;
  task_type: string;
  prompt: string;
  status: string;
  created_at: string;
  completed_at?: string;
  results?: any;
}

// Mock database functions for hackathon demo
// In production, these would call actual API endpoints

export async function getSwarmAnalytics(swarmId: string): Promise<SwarmAnalytics> {
  // Mock data for demo
  return {
    swarm_id: swarmId,
    total_tasks: Math.floor(Math.random() * 50) + 10,
    total_outputs: Math.floor(Math.random() * 200) + 50,
    total_discoveries: Math.floor(Math.random() * 100) + 20,
    total_consensus: Math.floor(Math.random() * 30) + 5,
    average_confidence: 0.7 + Math.random() * 0.3,
    generated_at: new Date().toISOString()
  };
}

export async function getDiscoveryResults(swarmId: string, limit?: number): Promise<DiscoveryResult[]> {
  // Mock discovery results for demo
  const mockResults: DiscoveryResult[] = [
    {
      id: '1',
      source: 'GitHub',
      category: 'depin',
      title: 'Helium Network Coverage Gap Analysis Tool',
      url: 'https://github.com/example/helium-coverage',
      description: 'Open source tool for analyzing Helium network coverage gaps in underserved regions',
      impact_score: 8.5,
      confidence: 0.92,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      metadata: {
        stars: 234,
        language: 'Python',
        last_updated: '2024-11-01'
      }
    },
    {
      id: '2',
      source: 'NewsAPI',
      category: 'climate',
      title: 'New Carbon Capture Startup Seeks Open Source Contributors',
      url: 'https://example.com/carbon-capture-news',
      description: 'Climate tech startup looking for developers to contribute to their open source carbon tracking platform',
      impact_score: 9.2,
      confidence: 0.87,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      metadata: {
        funding_needed: '$50,000',
        timeline: '6 months'
      }
    },
    {
      id: '3',
      source: 'HackerNews',
      category: 'education',
      title: 'Open Educational Resources Platform Needs Accessibility Features',
      url: 'https://news.ycombinator.com/item?id=example',
      description: 'Popular educational platform seeking contributors to improve accessibility for disabled learners',
      impact_score: 7.8,
      confidence: 0.94,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      metadata: {
        users_impacted: '10,000+',
        tech_stack: 'React, Node.js'
      }
    },
    {
      id: '4',
      source: 'Reddit',
      category: 'depin',
      title: 'Community-Driven IoT Sensor Network for Air Quality',
      url: 'https://reddit.com/r/example',
      description: 'Grassroots initiative to deploy low-cost air quality sensors in urban areas',
      impact_score: 8.1,
      confidence: 0.89,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      metadata: {
        upvotes: 156,
        comments: 42
      }
    },
    {
      id: '5',
      source: 'GitHub',
      category: 'climate',
      title: 'Renewable Energy Grid Optimization Algorithm',
      url: 'https://github.com/example/grid-optimization',
      description: 'Machine learning algorithms for optimizing renewable energy distribution in smart grids',
      impact_score: 9.5,
      confidence: 0.96,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      metadata: {
        stars: 567,
        forks: 89,
        language: 'Python'
      }
    }
  ];

  const results = limit ? mockResults.slice(0, limit) : mockResults;
  
  // Add some randomization to make it feel more live
  return results.map(result => ({
    ...result,
    confidence: Math.max(0.7, result.confidence + (Math.random() - 0.5) * 0.1),
    impact_score: result.impact_score ? Math.max(5, result.impact_score + (Math.random() - 0.5) * 2) : undefined
  }));
}

export async function getRecentTasks(swarmId: string, limit?: number): Promise<TaskRecord[]> {
  // Mock task records for demo
  const mockTasks: TaskRecord[] = [
    {
      id: 'task-1',
      swarm_id: swarmId,
      task_type: 'Scout',
      prompt: 'Find DePIN infrastructure opportunities in Southeast Asia',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      results: {
        discoveries: 12,
        confidence: 0.89
      }
    },
    {
      id: 'task-2',
      swarm_id: swarmId,
      task_type: 'Verify',
      prompt: 'Validate climate tech funding proposal #abc123',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
      results: {
        verified: true,
        confidence: 0.94
      }
    },
    {
      id: 'task-3',
      swarm_id: swarmId,
      task_type: 'Execute',
      prompt: 'Deploy grant contract for verified opportunity',
      status: 'executing',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      results: null
    }
  ];

  return limit ? mockTasks.slice(0, limit) : mockTasks;
}

// Utility functions
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getSourceIcon(source: string): string {
  switch (source.toLowerCase()) {
    case 'github': return '🐙';
    case 'newsapi': return '📰';
    case 'hackernews': return '🟠';
    case 'reddit': return '🤖';
    default: return '🔍';
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'depin': return 'text-blue-400';
    case 'climate': return 'text-green-400';
    case 'education': return 'text-purple-400';
    case 'healthcare': return 'text-red-400';
    case 'open_source': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
}