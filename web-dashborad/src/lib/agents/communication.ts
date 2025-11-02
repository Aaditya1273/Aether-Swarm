// REAL Agent-to-Agent Communication System

interface Message {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast';
  content: any;
  timestamp: number;
  priority: number;
}

interface AgentNode {
  id: string;
  type: 'scout' | 'verifier' | 'executor';
  status: 'active' | 'busy' | 'idle';
  capabilities: string[];
  messageQueue: Message[];
}

export class AgentCommunicationHub {
  private agents: Map<string, AgentNode> = new Map();
  private messageHistory: Message[] = [];
  private routingTable: Map<string, string[]> = new Map();

  // Register agent in the network
  registerAgent(agentId: string, type: 'scout' | 'verifier' | 'executor', capabilities: string[]): void {
    this.agents.set(agentId, {
      id: agentId,
      type,
      status: 'idle',
      capabilities,
      messageQueue: []
    });

    console.log(`🤝 Agent ${agentId} registered in communication hub`);
  }

  // Send message from one agent to another
  async sendMessage(from: string, to: string, content: any, type: 'request' | 'response' | 'broadcast' = 'request'): Promise<boolean> {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type,
      content,
      timestamp: Date.now(),
      priority: content.priority || 5
    };

    const targetAgent = this.agents.get(to);
    if (!targetAgent) {
      console.error(`❌ Agent ${to} not found`);
      return false;
    }

    targetAgent.messageQueue.push(message);
    this.messageHistory.push(message);

    console.log(`📨 Message sent: ${from} → ${to} (${type})`);
    return true;
  }

  // Broadcast message to all agents of a type
  async broadcast(from: string, agentType: 'scout' | 'verifier' | 'executor', content: any): Promise<number> {
    let sentCount = 0;
    
    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.type === agentType && agentId !== from) {
        await this.sendMessage(from, agentId, content, 'broadcast');
        sentCount++;
      }
    }

    return sentCount;
  }

  // Route task to best available agent
  async routeTask(taskType: string, taskData: any): Promise<string | null> {
    const availableAgents = Array.from(this.agents.entries())
      .filter(([_, agent]) => 
        agent.status === 'idle' && 
        agent.capabilities.includes(taskType)
      )
      .sort((a, b) => a[1].messageQueue.length - b[1].messageQueue.length);

    if (availableAgents.length === 0) {
      console.warn(`⚠️ No available agents for task: ${taskType}`);
      return null;
    }

    const [selectedAgentId, selectedAgent] = availableAgents[0];
    
    await this.sendMessage('system', selectedAgentId, {
      taskType,
      taskData,
      priority: 8
    }, 'request');

    selectedAgent.status = 'busy';
    
    console.log(`🎯 Task routed to agent: ${selectedAgentId}`);
    return selectedAgentId;
  }

  // Get next message for an agent
  getNextMessage(agentId: string): Message | null {
    const agent = this.agents.get(agentId);
    if (!agent || agent.messageQueue.length === 0) {
      return null;
    }

    // Sort by priority (higher first)
    agent.messageQueue.sort((a, b) => b.priority - a.priority);
    return agent.messageQueue.shift() || null;
  }

  // Update agent status
  updateAgentStatus(agentId: string, status: 'active' | 'busy' | 'idle'): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
    }
  }

  // Get communication statistics
  getStats(): {
    totalAgents: number;
    activeAgents: number;
    totalMessages: number;
    messagesPerAgent: Record<string, number>;
  } {
    const messageCount: Record<string, number> = {};
    
    for (const msg of this.messageHistory) {
      messageCount[msg.from] = (messageCount[msg.from] || 0) + 1;
    }

    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active' || a.status === 'busy').length,
      totalMessages: this.messageHistory.length,
      messagesPerAgent: messageCount
    };
  }

  // Get message flow for visualization
  getMessageFlow(): Array<{ from: string; to: string; count: number }> {
    const flow: Map<string, number> = new Map();
    
    for (const msg of this.messageHistory) {
      const key = `${msg.from}->${msg.to}`;
      flow.set(key, (flow.get(key) || 0) + 1);
    }

    return Array.from(flow.entries()).map(([key, count]) => {
      const [from, to] = key.split('->');
      return { from, to, count };
    });
  }
}

// Global communication hub
export const communicationHub = new AgentCommunicationHub();
