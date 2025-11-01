@echo off
echo 🌀 Building Aether Swarm - Complete System
echo ==========================================

echo [INFO] Checking prerequisites...

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Rust/Cargo not found. Please install Rust: https://rustup.rs/
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+: https://nodejs.org/
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

echo [INFO] Building Rust SDK...
cd sdk\rust
cargo build --release
if %errorlevel% neq 0 (
    echo [ERROR] Rust SDK build failed
    exit /b 1
)
echo [SUCCESS] Rust SDK built successfully
cd ..\..

echo [INFO] Building CLI tool...
cd cli
cargo build --release
if %errorlevel% neq 0 (
    echo [ERROR] CLI build failed
    exit /b 1
)
echo [SUCCESS] CLI tool built successfully

echo [INFO] Installing CLI globally...
cargo install --path .
if %errorlevel% neq 0 (
    echo [WARNING] CLI global install failed (binary available in target\release\)
) else (
    echo [SUCCESS] CLI installed globally as 'aether-swarm'
)
cd ..

echo [INFO] Setting up Web Dashboard...
cd web-dashboard
npm install
if %errorlevel% neq 0 (
    echo [WARNING] Web Dashboard setup failed (continuing...)
) else (
    echo [SUCCESS] Web Dashboard dependencies installed
)
cd ..

echo.
echo 🎉 Build Complete!
echo ==================
echo.
echo Next steps:
echo 1. Start web dashboard: cd web-dashboard ^&^& npm run dev
echo 2. Run CLI demo: aether-swarm demo --demo-type quick
echo 3. Create swarm: aether-swarm template --type basic --output config.json
echo 4. Spawn swarm: aether-swarm spawn --config config.json
echo.
echo 📚 Documentation: docs\
echo 🌐 Dashboard: http://localhost:3000 (after npm run dev)
echo 🔧 CLI Help: aether-swarm --help
echo.
echo [SUCCESS] Aether Swarm is ready for Cortensor Hackathon #2!