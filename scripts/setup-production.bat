@echo off
setlocal enabledelayedexpansion

REM Aether Swarm Production Setup Script for Windows
REM This script sets up a complete production environment with real integrations

echo 🌀 Aether Swarm Production Setup
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: !NODE_VERSION!
)

REM Check if Rust is installed
rustc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Rust not found. Please install Rust from https://rustup.rs/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('rustc --version') do set RUST_VERSION=%%i
    echo ✅ Rust: !RUST_VERSION!
)

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install Git from https://git-scm.com/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ Git: !GIT_VERSION!
)

REM Setup environment file
echo.
echo 🔧 Setting up environment configuration...

if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please edit .env file with your API keys before continuing
    
    echo.
    echo 🔑 Essential API keys needed:
    echo • Cortensor API key
    echo • Alchemy API key for Arbitrum Sepolia
    echo • GitHub Personal Access Token
    echo • NewsAPI key
    echo.
    echo Opening .env file for editing...
    notepad .env
    pause
) else (
    echo ✅ .env file already exists
)

REM Build Rust SDK
echo.
echo 🦀 Building Rust SDK...
cd sdk\rust
cargo build --release
if %errorlevel% neq 0 (
    echo ❌ Rust SDK build failed
    pause
    exit /b 1
) else (
    echo ✅ Rust SDK built successfully
)
cd ..\..

REM Build TypeScript SDK
echo.
echo 📦 Building TypeScript SDK...
cd sdk\typescript
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo ❌ TypeScript SDK build failed
    pause
    exit /b 1
) else (
    echo ✅ TypeScript SDK built successfully
)
cd ..\..

REM Build CLI
echo.
echo ⚙️  Building CLI tool...
cd cli
cargo build --release
if %errorlevel% neq 0 (
    echo ❌ CLI build failed
    pause
    exit /b 1
) else (
    echo ✅ CLI tool built successfully
)
cd ..

REM Setup web dashboard
echo.
echo 🌐 Setting up web dashboard...
cd web-dashborad
call npm install
if %errorlevel% neq 0 (
    echo ❌ Web dashboard setup failed
    pause
    exit /b 1
) else (
    echo ✅ Web dashboard dependencies installed
    
    REM Build for production
    call npm run build
    if %errorlevel% neq 0 (
        echo ⚠️  Web dashboard build failed, but development mode will work
    ) else (
        echo ✅ Web dashboard built for production
    )
)
cd ..

REM Validate setup
echo.
echo 🔍 Validating setup...

if exist "cli\target\release\aether-swarm.exe" (
    echo ✅ CLI tool ready
) else (
    echo ❌ CLI tool not found
)

if exist ".env" (
    echo ✅ Environment configuration ready
) else (
    echo ❌ Environment configuration missing
)

REM Final instructions
echo.
echo 🎉 Aether Swarm setup complete!
echo.
echo 📚 Next steps:
echo 1. Review and update your .env file with API keys
echo 2. Start the web dashboard: cd web-dashborad ^&^& npm run dev
echo 3. Test the CLI: .\cli\target\release\aether-swarm.exe demo --demo-type quick
echo 4. Create your first swarm: .\cli\target\release\aether-swarm.exe init --task "Find climate tech opportunities"
echo.
echo 🔗 Useful links:
echo • Cortensor Network: https://cortensor.com
echo • Arbitrum Sepolia Explorer: https://sepolia.arbiscan.io
echo • Documentation: .\docs\
echo • Examples: .\examples\
echo.
echo 💡 Pro tips:
echo • Get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia
echo • Join Cortensor Discord for support: https://discord.gg/cortensor
echo • Monitor your swarms at: http://localhost:3000
echo.
echo Happy swarming! 🌀

pause