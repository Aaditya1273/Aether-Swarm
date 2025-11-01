# 🌀 Aether Swarm: Decentralized Agent Collective for Public Goods Discovery & Execution

🔥 **"A self-orchestrating hive of AI agents that discover, verify, and execute public goods—powered by Cortensor's decentralized intelligence."**

## 🚀 Project Overview

Aether Swarm is a next-generation, multi-agent "hive mind" built on the Cortensor decentralized inference network. It autonomously scouts, verifies, and executes high-impact public goods initiatives — such as open-source tools, DePIN nodes, and climate data projects — using a collective of specialized agents working in parallel.

Rather than a single bot, Aether functions as a collaborative agentic ecosystem. Each agent specializes (Scout, Verifier, Executor) and communicates through Cortensor's inference layer to make collective decisions, guided by stake-weighted community priorities.

**🧠 Core Innovation: Swarm Consensus**
- Agents debate, cross-verify, and finalize outcomes using decentralized inference calls
- 70% stake-weighted majority agreement triggers automatic task execution
- Self-improvement loop fine-tunes agent prompts after every successful execution

**Key Features:**
- 🕵️‍♂️ **Scout Agents**: Crawl GitHub/news for opportunities, score via inference
- 🧠 **Verifier Agents**: Validate claims through multi-node consensus  
- ⚙️ **Executor Agents**: Automate on-chain task execution (EVM hooks, NFT minting)
- 📊 **Real-time Dashboard**: Flowchart visualization of agent communication
- 💰 **$COR Staking**: Community prioritizes tasks through token staking
- 🔄 **PoI Integration**: Proof-of-Inference validation for verifiable outputs

## Project Structure

```
aether-swarm/
├── web-dashboard/          # Next.js 14 UI Dashboard
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/          # Utilities & API clients
│   ├── package.json
│   └── next.config.js
│
├── sdk/                   # Rust + TypeScript Hybrid SDK
│   ├── rust/             # Core agent logic (Rust)
│   │   ├── src/
│   │   └── Cargo.toml
│   ├── typescript/       # JS/TS bindings
│   │   ├── src/
│   │   └── package.json
│   └── bindings/         # WASM/FFI bindings
│
├── cli/                  # Rust CLI Tool
│   ├── src/
│   │   ├── main.rs
│   │   └── commands/
│   └── Cargo.toml
│
├── docs/                 # Documentation
│   ├── architecture.md
│   ├── usage.md
│   └── demo-steps.md
│
└── examples/             # Sample Configurations
    ├── agent-templates/
    ├── swarm-configs/
    └── public-goods-scenarios/
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Rust 1.70+ and Cargo
- Git

### Setup & Run

1. **Clone and navigate to project:**
   ```bash
   cd aether-swarm
   ```

2. **Start the Web Dashboard:**
   ```bash
   cd web-dashboard
   npm install
   npm run dev
   ```
   Dashboard available at: http://localhost:3000

3. **Build the SDK:**
   ```bash
   cd ../sdk/rust
   cargo build --release
   
   cd ../typescript
   npm install
   npm run build
   ```

4. **Install CLI tool:**
   ```bash
   cd ../../cli
   cargo install --path .
   ```

5. **Spawn your first swarm:**
   ```bash
   aether-swarm spawn --config ../examples/swarm-configs/basic-public-goods.json
   aether-swarm status
   ```

## Development Commands

### Web Dashboard
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Rust Components
```bash
cargo build          # Build debug version
cargo build --release # Build optimized version
cargo test           # Run tests
cargo fmt            # Format code
```

### CLI Usage
```bash
aether-swarm spawn --config <config-file>    # Create new swarm
aether-swarm list                            # List active swarms
aether-swarm status <swarm-id>              # Check swarm status
aether-swarm stop <swarm-id>                # Stop swarm
aether-swarm logs <swarm-id>                # View swarm logs
```

## Hackathon Submission

**Event:** Cortensor Hackathon #2  
**Deadline:** November 2, 2025  
**Team:** [Your Team Name]  
**Category:** Decentralized AI Systems

### Submission Checklist
- [ ] Complete project implementation
- [ ] Working demo with public goods scenario
- [ ] Documentation and setup instructions
- [ ] Video demonstration (max 5 minutes)
- [ ] Deployment on testnet/mainnet

## Architecture Highlights

- **Swarm Coordination:** Rust-based consensus algorithms for agent coordination
- **Real-time Monitoring:** Next.js dashboard with WebSocket connections
- **Cross-platform SDK:** WASM bindings for browser and Node.js compatibility
- **Template System:** JSON-based agent and swarm configuration
- **Public Goods Focus:** Built-in templates for common public goods scenarios

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE.md for details

---

*Built with ❤️ for the Cortensor community and public goods ecosystem*