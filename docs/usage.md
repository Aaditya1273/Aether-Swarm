# Aether Swarm Usage Guide

## Getting Started

### Installation

1. **Install Prerequisites**
   ```bash
   # Node.js 18+
   node --version
   
   # Rust 1.70+
   rustc --version
   
   # Install CLI
   cd cli
   cargo install --path .
   ```

2. **Build SDK**
   ```bash
   cd sdk/rust
   cargo build --release
   
   cd ../typescript
   npm install && npm run build
   ```

## CLI Commands

### Swarm Management

```bash
# Create a new swarm
aether-swarm spawn --config examples/swarm-configs/basic.json --name "public-goods-swarm"

# List active swarms
aether-swarm list

# Get swarm status
aether-swarm status <swarm-id>

# Stop a swarm
aether-swarm stop <swarm-id>

# View swarm logs
aether-swarm logs <swarm-id> --follow
```

### Configuration Management

```bash
# Validate configuration
aether-swarm validate --config path/to/config.json

# Generate template
aether-swarm template --type public-goods --output my-config.json

# Update swarm configuration
aether-swarm update <swarm-id> --config new-config.json
```

## Web Dashboard

### Accessing the Dashboard

1. Start the development server:
   ```bash
   cd web-dashboard
   npm run dev
   ```

2. Open http://localhost:3000

### Dashboard Features

- **Swarm Overview**: Real-time status of all active swarms
- **Agent Monitoring**: Individual agent performance and tasks
- **Task Pipeline**: Current and queued public goods initiatives
- **Analytics**: Historical performance and impact metrics
- **Configuration Editor**: Visual swarm configuration builder

## SDK Integration

### TypeScript/JavaScript

```typescript
import { AetherSwarm, SwarmConfig } from '@aether-swarm/sdk';

// Initialize swarm
const config: SwarmConfig = {
  agents: 5,
  consensus: 'pbft',
  publicGoods: {
    categories: ['education', 'environment', 'healthcare'],
    budget: 1000000
  }
};

const swarm = new AetherSwarm(config);

// Start swarm
await swarm.start();

// Monitor events
swarm.on('proposal', (proposal) => {
  console.log('New proposal:', proposal);
});

swarm.on('consensus', (decision) => {
  console.log('Consensus reached:', decision);
});
```

### Rust

```rust
use aether_swarm_sdk::{Swarm, SwarmConfig, Agent};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = SwarmConfig::builder()
        .agent_count(5)
        .consensus_algorithm("pbft")
        .public_goods_categories(vec!["education", "environment"])
        .build();
    
    let mut swarm = Swarm::new(config).await?;
    
    // Start swarm
    swarm.start().await?;
    
    // Listen for events
    while let Some(event) = swarm.next_event().await {
        match event {
            SwarmEvent::Proposal(proposal) => {
                println!("New proposal: {:?}", proposal);
            }
            SwarmEvent::Consensus(decision) => {
                println!("Consensus: {:?}", decision);
            }
        }
    }
    
    Ok(())
}
```

## Configuration Format

### Basic Swarm Configuration

```json
{
  "name": "public-goods-swarm",
  "version": "1.0.0",
  "agents": {
    "count": 5,
    "templates": ["researcher", "validator", "executor"]
  },
  "consensus": {
    "algorithm": "pbft",
    "threshold": 0.67,
    "timeout": 30000
  },
  "publicGoods": {
    "categories": ["education", "environment", "healthcare"],
    "budget": 1000000,
    "impactMetrics": ["reach", "sustainability", "cost_effectiveness"]
  },
  "network": {
    "p2p_port": 8080,
    "discovery": "mdns",
    "encryption": true
  }
}
```

### Agent Templates

```json
{
  "name": "researcher",
  "role": "discovery",
  "capabilities": [
    "web_scraping",
    "data_analysis",
    "report_generation"
  ],
  "resources": {
    "cpu_limit": "2",
    "memory_limit": "4GB",
    "network_bandwidth": "100Mbps"
  },
  "behavior": {
    "exploration_rate": 0.3,
    "collaboration_preference": 0.8,
    "risk_tolerance": 0.2
  }
}
```

## Best Practices

### Swarm Configuration
- Start with 3-7 agents for optimal consensus performance
- Use diverse agent templates for better coverage
- Set realistic budget constraints
- Monitor resource usage regularly

### Development
- Test configurations in development mode first
- Use the validation command before deployment
- Monitor logs for consensus issues
- Implement proper error handling in SDK integrations

### Production Deployment
- Use TLS encryption for all network communications
- Implement proper monitoring and alerting
- Regular backup of swarm state
- Gradual scaling of agent count