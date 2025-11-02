#!/bin/bash

# Aether Swarm Production Setup Script
# This script sets up a complete production environment with real integrations

set -e

echo "🌀 Aether Swarm Production Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on supported OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    echo -e "${RED}❌ Unsupported operating system: $OSTYPE${NC}"
    exit 1
fi

echo -e "${BLUE}🖥️  Detected OS: $OS${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

# Check Rust
if command_exists rustc; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✅ Rust: $RUST_VERSION${NC}"
else
    echo -e "${RED}❌ Rust not found. Installing Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git: $GIT_VERSION${NC}"
else
    echo -e "${RED}❌ Git not found. Please install Git${NC}"
    exit 1
fi

# Check Docker (optional but recommended)
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker: $DOCKER_VERSION${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not found. Some features may be limited${NC}"
    DOCKER_AVAILABLE=false
fi

# Setup environment file
echo -e "\n${YELLOW}🔧 Setting up environment configuration...${NC}"

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your API keys before continuing${NC}"
    
    # Prompt for essential API keys
    echo -e "\n${BLUE}🔑 Let's configure your API keys:${NC}"
    
    read -p "Enter your Cortensor API key (or press Enter to skip): " CORTENSOR_KEY
    if [ ! -z "$CORTENSOR_KEY" ]; then
        sed -i.bak "s/your_cortensor_api_key_here/$CORTENSOR_KEY/" .env
        echo -e "${GREEN}✅ Cortensor API key configured${NC}"
    fi
    
    read -p "Enter your Alchemy API key for Arbitrum Sepolia (or press Enter to skip): " ALCHEMY_KEY
    if [ ! -z "$ALCHEMY_KEY" ]; then
        sed -i.bak "s/YOUR_API_KEY/$ALCHEMY_KEY/" .env
        echo -e "${GREEN}✅ Alchemy RPC configured${NC}"
    fi
    
    read -p "Enter your GitHub Personal Access Token (or press Enter to skip): " GITHUB_TOKEN
    if [ ! -z "$GITHUB_TOKEN" ]; then
        sed -i.bak "s/your_github_personal_access_token/$GITHUB_TOKEN/" .env
        echo -e "${GREEN}✅ GitHub token configured${NC}"
    fi
    
    read -p "Enter your NewsAPI key (or press Enter to skip): " NEWS_KEY
    if [ ! -z "$NEWS_KEY" ]; then
        sed -i.bak "s/your_newsapi_org_key/$NEWS_KEY/" .env
        echo -e "${GREEN}✅ NewsAPI key configured${NC}"
    fi
    
    # Clean up backup files
    rm -f .env.bak
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Build Rust SDK
echo -e "\n${YELLOW}🦀 Building Rust SDK...${NC}"
cd sdk/rust
cargo build --release
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Rust SDK built successfully${NC}"
else
    echo -e "${RED}❌ Rust SDK build failed${NC}"
    exit 1
fi
cd ../..

# Build TypeScript SDK
echo -e "\n${YELLOW}📦 Building TypeScript SDK...${NC}"
cd sdk/typescript
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript SDK built successfully${NC}"
else
    echo -e "${RED}❌ TypeScript SDK build failed${NC}"
    exit 1
fi
cd ../..

# Build CLI
echo -e "\n${YELLOW}⚙️  Building CLI tool...${NC}"
cd cli
cargo build --release
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CLI tool built successfully${NC}"
    
    # Install CLI globally (optional)
    read -p "Install CLI globally? (y/N): " INSTALL_CLI
    if [[ $INSTALL_CLI =~ ^[Yy]$ ]]; then
        cargo install --path .
        echo -e "${GREEN}✅ CLI installed globally as 'aether-swarm'${NC}"
    fi
else
    echo -e "${RED}❌ CLI build failed${NC}"
    exit 1
fi
cd ..

# Setup web dashboard
echo -e "\n${YELLOW}🌐 Setting up web dashboard...${NC}"
cd web-dashborad
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Web dashboard dependencies installed${NC}"
    
    # Build for production
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Web dashboard built for production${NC}"
    else
        echo -e "${YELLOW}⚠️  Web dashboard build failed, but development mode will work${NC}"
    fi
else
    echo -e "${RED}❌ Web dashboard setup failed${NC}"
    exit 1
fi
cd ..

# Setup database (if Docker is available)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "\n${YELLOW}🗄️  Setting up database (optional)...${NC}"
    read -p "Setup PostgreSQL and Redis with Docker? (y/N): " SETUP_DB
    if [[ $SETUP_DB =~ ^[Yy]$ ]]; then
        docker-compose up -d postgres redis
        echo -e "${GREEN}✅ Database services started${NC}"
    fi
fi

# Validate setup
echo -e "\n${YELLOW}🔍 Validating setup...${NC}"

# Test CLI
if [ -f "cli/target/release/aether-swarm" ] || command_exists aether-swarm; then
    echo -e "${GREEN}✅ CLI tool ready${NC}"
else
    echo -e "${RED}❌ CLI tool not found${NC}"
fi

# Test environment
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Environment configuration ready${NC}"
else
    echo -e "${RED}❌ Environment configuration missing${NC}"
fi

# Final instructions
echo -e "\n${GREEN}🎉 Aether Swarm setup complete!${NC}"
echo -e "\n${BLUE}📚 Next steps:${NC}"
echo -e "1. Review and update your .env file with API keys"
echo -e "2. Start the web dashboard: ${YELLOW}cd web-dashborad && npm run dev${NC}"
echo -e "3. Test the CLI: ${YELLOW}./cli/target/release/aether-swarm demo --demo-type quick${NC}"
echo -e "4. Create your first swarm: ${YELLOW}./cli/target/release/aether-swarm init --task 'Find climate tech opportunities'${NC}"

echo -e "\n${BLUE}🔗 Useful links:${NC}"
echo -e "• Cortensor Network: https://cortensor.com"
echo -e "• Arbitrum Sepolia Explorer: https://sepolia.arbiscan.io"
echo -e "• Documentation: ./docs/"
echo -e "• Examples: ./examples/"

echo -e "\n${BLUE}💡 Pro tips:${NC}"
echo -e "• Get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia"
echo -e "• Join Cortensor Discord for support: https://discord.gg/cortensor"
echo -e "• Monitor your swarms at: http://localhost:3000"

echo -e "\n${GREEN}Happy swarming! 🌀${NC}"