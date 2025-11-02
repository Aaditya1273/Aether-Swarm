import { useEffect, useRef, useState } from 'react';

export interface SwarmEvent {
  id: string;
  timestamp: number;
  event_type: 'AgentSpawned' | 'TaskExecuted' | 'ConsensusReached' | 'ProposalCreated' | 'SwarmStopped';
  agent_id?: string;
  data: any;
}

export interface SwarmMetrics {
  swarm_id: string;
  active_agents: number;
  tasks_completed: number;
  consensus_rate: number;
  uptime_seconds: number;
  inference_calls_per_minute: number;
  average_confidence: number;
}

export class SwarmWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('🌀 Connected to Aether Swarm WebSocket');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket connection closed');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    
    switch (type) {
      case 'swarm_event':
        this.emit('swarm_event', payload as SwarmEvent);
        break;
      case 'metrics_update':
        this.emit('metrics_update', payload as SwarmMetrics);
        break;
      case 'agent_communication':
        this.emit('agent_communication', payload);
        break;
      case 'consensus_update':
        this.emit('consensus_update', payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  on(event: string, handler: (data: any) => void) {
    this.eventHandlers.set(event, handler);
  }

  private emit(event: string, data: any) {
    const handler = this.eventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Subscribe to specific swarm updates
  subscribeToSwarm(swarmId: string) {
    this.send({
      type: 'subscribe',
      swarm_id: swarmId
    });
  }

  // Request real-time metrics
  requestMetrics() {
    this.send({
      type: 'get_metrics'
    });
  }

  // Send command to swarm
  sendSwarmCommand(swarmId: string, command: string, params?: any) {
    this.send({
      type: 'swarm_command',
      swarm_id: swarmId,
      command,
      params
    });
  }
}

// React hook for WebSocket connection
export function useSwarmWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<SwarmEvent[]>([]);
  const [metrics, setMetrics] = useState<SwarmMetrics[]>([]);
  const wsRef = useRef<SwarmWebSocket | null>(null);

  useEffect(() => {
    const ws = new SwarmWebSocket(url);
    wsRef.current = ws;

    ws.on('swarm_event', (event: SwarmEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
    });

    ws.on('metrics_update', (metric: SwarmMetrics) => {
      setMetrics(prev => {
        const updated = prev.filter(m => m.swarm_id !== metric.swarm_id);
        return [metric, ...updated];
      });
    });

    ws.connect()
      .then(() => setIsConnected(true))
      .catch(console.error);

    return () => {
      ws.disconnect();
      setIsConnected(false);
    };
  }, [url]);

  const subscribeToSwarm = (swarmId: string) => {
    wsRef.current?.subscribeToSwarm(swarmId);
  };

  const sendCommand = (swarmId: string, command: string, params?: any) => {
    wsRef.current?.sendSwarmCommand(swarmId, command, params);
  };

  const requestMetrics = () => {
    wsRef.current?.requestMetrics();
  };

  return {
    isConnected,
    events,
    metrics,
    subscribeToSwarm,
    sendCommand,
    requestMetrics
  };
}

// WebSocket server URL based on environment
export const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NODE_ENV === 'production' 
    ? 'wss://api.aether-swarm.com/ws'
    : `${protocol}//${window.location.host}/api/ws`;
  
  return host;
};