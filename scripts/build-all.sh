#!/bin/bash

echo "🌀 Building Aether Swarm - Complete System"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
    print_error "Rust/Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+: https://nodejs.org/"
    exit 1
fi

print_success "Prerequisites check passed"

# Build Rust SDK
print_status "Building Rust SDK..."
cd sdk/rust
if cargo build --release; then
    print_success "Rust SDK built successfully"
else
    print_error "Rust SDK build failed"
    exit 1
fi
cd ../..

# Build TypeScript SDK
print_status "Building TypeScript SDK..."
cd sdk/typescript
if npm install && npm run build; then
    print_success "TypeScript SDK built successfully"
else
    print_warning "TypeScript SDK build failed (continuing...)"
fi
cd ../..

# Build CLI
print_status "Building CLI tool..."
cd cli
if cargo build --release; then
    print_success "CLI tool built successfully"
    
    # Install CLI globally
    print_status "Installing CLI globally..."
    if cargo install --path .; then
        print_success "CLI installed globally as 'aether-swarm'"
    else
        print_warning "CLI global install failed (binary available in target/release/)"
    fi
else
    print_error "CLI build failed"
    exit 1
fi
cd ..

# Setup Web Dashboard
print_status "Setting up Web Dashboard..."
cd web-dashboard
if npm install; then
    print_success "Web Dashboard dependencies installed"
else
    print_warning "Web Dashboard setup failed (continuing...)"
fi
cd ..

# Run quick test
print_status "Running quick system test..."
if command -v aether-swarm &> /dev/null; then
    print_status "Testing CLI..."
    aether-swarm demo --demo-type quick
    print_success "System test completed"
else
    print_warning "CLI not in PATH, run: export PATH=\$PATH:$(pwd)/cli/target/release"
fi

echo ""
echo "🎉 Build Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Start web dashboard: cd web-dashboard && npm run dev"
echo "2. Run CLI demo: aether-swarm demo --demo-type quick"
echo "3. Create swarm: aether-swarm template --type basic --output config.json"
echo "4. Spawn swarm: aether-swarm spawn --config config.json"
echo ""
echo "📚 Documentation: docs/"
echo "🌐 Dashboard: http://localhost:3000 (after npm run dev)"
echo "🔧 CLI Help: aether-swarm --help"
echo ""
print_success "Aether Swarm is ready for Cortensor Hackathon #2!"