// REAL GitHub Scout Agent with Cortensor Integration

import { cortensor } from '../cortensor/client';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
}

interface Discovery {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  score: number;
  category: string;
  timestamp: number;
}

export class ScoutAgent {
  private githubToken: string;
  private newsApiKey: string;

  constructor() {
    this.githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
    this.newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
  }

  // REAL GitHub API search
  async searchGitHub(query: string, topics: string[]): Promise<Discovery[]> {
    try {
      const topicQuery = topics.map(t => `topic:${t}`).join('+');
      const searchQuery = `${query}+${topicQuery}+stars:>10+is:public`;
      
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=20`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const repos: GitHubRepo[] = data.items || [];

      return repos.map((repo, index) => ({
        id: `gh-${Date.now()}-${index}`,
        title: repo.name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        source: 'GitHub',
        score: this.calculateScore(repo),
        category: this.categorizeRepo(repo.topics, repo.description),
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('GitHub API Error:', error);
      return [];
    }
  }

  // REAL News API search
  async searchNews(query: string): Promise<Discovery[]> {
    try {
      if (!this.newsApiKey) {
        console.warn('NewsAPI key not configured');
        return [];
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&language=en`,
        {
          headers: {
            'X-Api-Key': this.newsApiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      const articles = data.articles || [];

      return articles.map((article: any, index: number) => ({
        id: `news-${Date.now()}-${index}`,
        title: article.title,
        description: article.description || article.content?.substring(0, 200) || '',
        url: article.url,
        source: article.source.name,
        score: this.calculateNewsScore(article),
        category: 'research',
        timestamp: new Date(article.publishedAt).getTime(),
      }));
    } catch (error) {
      console.error('NewsAPI Error:', error);
      return [];
    }
  }

  // Combined discovery with Cortensor AI enhancement
  async discover(query: string, categories: string[] = ['depin', 'climate', 'web3']): Promise<Discovery[]> {
    const [githubResults, newsResults] = await Promise.all([
      this.searchGitHub(query, categories),
      this.searchNews(query)
    ]);

    const combined = [...githubResults, ...newsResults];
    
    // Use Cortensor AI to enhance scoring
    const enhanced = await this.enhanceWithCortensor(combined.slice(0, 10));
    
    // Sort by enhanced score
    return enhanced.sort((a, b) => b.score - a.score);
  }

  // Enhance discoveries using Cortensor AI inference
  private async enhanceWithCortensor(discoveries: Discovery[]): Promise<Discovery[]> {
    const enhanced = await Promise.all(
      discoveries.map(async (discovery) => {
        try {
          // Call Cortensor for AI-powered analysis
          const response = await cortensor.inference({
            prompt: `Analyze this public goods project and provide a score (0-100) and reasoning:
Title: ${discovery.title}
Description: ${discovery.description}
Category: ${discovery.category}
Current Score: ${discovery.score}

Provide JSON: {"score": number, "confidence": number, "reasoning": "text"}`,
            temperature: 0.3,
            max_tokens: 200,
            stake_amount: 100
          });

          // Parse AI response
          let aiScore = discovery.score;
          try {
            const analysis = JSON.parse(response.result);
            aiScore = (discovery.score + analysis.score) / 2; // Blend scores
          } catch {
            // If parsing fails, use original score
          }

          return {
            ...discovery,
            score: Math.round(aiScore),
            cortensor_poi: response.proof_of_inference.hash,
            cortensor_verified: true
          };
        } catch (error) {
          return discovery;
        }
      })
    );

    return enhanced;
  }

  private calculateScore(repo: GitHubRepo): number {
    let score = 0;
    
    // Stars contribute to score
    score += Math.min(repo.stargazers_count / 10, 50);
    
    // Recent activity bonus
    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 20;
    else if (daysSinceUpdate < 90) score += 10;
    
    // Has description
    if (repo.description) score += 10;
    
    // Popular topics
    const importantTopics = ['blockchain', 'web3', 'depin', 'climate', 'dao'];
    const topicMatches = repo.topics.filter(t => importantTopics.includes(t.toLowerCase())).length;
    score += topicMatches * 5;
    
    return Math.min(Math.round(score), 100);
  }

  private calculateNewsScore(article: any): number {
    let score = 50; // Base score
    
    // Recent news gets bonus
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 24) score += 30;
    else if (hoursOld < 72) score += 15;
    
    // Has image
    if (article.urlToImage) score += 10;
    
    // Content length
    if (article.content && article.content.length > 500) score += 10;
    
    return Math.min(score, 100);
  }

  private categorizeRepo(topics: string[], description: string): string {
    const text = `${topics.join(' ')} ${description}`.toLowerCase();
    
    if (text.includes('depin') || text.includes('iot') || text.includes('helium') || text.includes('filecoin')) {
      return 'depin';
    }
    if (text.includes('climate') || text.includes('carbon') || text.includes('environment')) {
      return 'climate';
    }
    if (text.includes('education') || text.includes('learning') || text.includes('school')) {
      return 'education';
    }
    if (text.includes('health') || text.includes('medical') || text.includes('hospital')) {
      return 'healthcare';
    }
    
    return 'other';
  }
}
