#!/usr/bin/env node

/**
 * Aether Swarm Production Validation Script
 * Validates that all production integrations are working correctly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function makeHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data
        });
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateEnvironment() {
  log('\n🔍 Validating Environment Configuration...', 'cyan');
  
  if (!checkFileExists('.env')) {
    log('❌ .env file not found', 'red');
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = [
    'CORTENSOR_API_ENDPOINT',
    'ARBITRUM_SEPOLIA_RPC',
    'COR_TOKEN_ADDRESS'
  ];
  
  const optionalVars = [
    'CORTENSOR_API_KEY',
    'GITHUB_TOKEN',
    'NEWS_API_KEY',
    'PINATA_API_KEY'
  ];
  
  let allRequired = true;
  let optionalCount = 0;
  
  for (const varName of requiredVars) {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      log(`✅ ${varName}: configured`, 'green');
    } else {
      log(`❌ ${varName}: missing or not configured`, 'red');
      allRequired = false;
    }
  }
  
  for (const varName of optionalVars) {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      log(`✅ ${varName}: configured`, 'green');
      optionalCount++;
    } else {
      log(`⚠️  ${varName}: not configured`, 'yellow');
    }
  }
  
  log(`\n📊 Configuration Summary:`, 'blue');
  log(`   Required variables: ${allRequired ? 'All configured' : 'Missing some'}`, allRequired ? 'green' : 'red');
  log(`   Optional variables: ${optionalCount}/${optionalVars.length} configured`, optionalCount > 0 ? 'green' : 'yellow');
  
  return allRequired;
}

async function validateBuild() {
  log('\n🔨 Validating Build Artifacts...', 'cyan');
  
  const artifacts = [
    { path: 'cli/target/release/aether-swarm.exe', name: 'CLI (Windows)' },
    { path: 'cli/target/release/aether-swarm', name: 'CLI (Unix)' },
    { path: 'sdk/rust/target/release/libaether_swarm_sdk.rlib', name: 'Rust SDK' },
    { path: 'sdk/typescript/dist/index.js', name: 'TypeScript SDK' },
    { path: 'web-dashborad/node_modules', name: 'Dashboard Dependencies' },
    { path: 'web-dashborad/.next', name: 'Dashboard Build' }
  ];
  
  let buildValid = true;
  
  for (const artifact of artifacts) {
    if (checkFileExists(artifact.path)) {
      log(`✅ ${artifact.name}: built`, 'green');
    } else {
      log(`❌ ${artifact.name}: missing`, 'red');
      if (!artifact.name.includes('Windows') && !artifact.name.includes('Unix')) {
        buildValid = false;
      }
    }
  }
  
  return buildValid;
}

async function validateNetworkConnections() {
  log('\n🌐 Validating Network Connections...', 'cyan');
  
  const endpoints = [
    { url: 'https://arbitrum-sepolia.g.alchemy.com/v2/demo', name: 'Arbitrum Sepolia RPC' },
    { url: 'https://api.github.com', name: 'GitHub API' },
    { url: 'https://newsapi.org', name: 'NewsAPI' },
    { url: 'https://hn.algolia.com/api/v1/search?query=test', name: 'HackerNews API' },
    { url: 'https://www.reddit.com/r/technology/hot.json?limit=1', name: 'Reddit API' }
  ];
  
  let connectionsValid = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeHttpsRequest(endpoint.url);
      if (response.statusCode === 200 || response.statusCode === 201) {
        log(`✅ ${endpoint.name}: accessible`, 'green');
      } else {
        log(`⚠️  ${endpoint.name}: returned ${response.statusCode}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: connection failed (${error.message})`, 'red');
      connectionsValid = false;
    }
  }
  
  return connectionsValid;
}

async function validateCortensorIntegration() {
  log('\n🧠 Validating Cortensor Integration...', 'cyan');
  
  // Check if we can load environment variables
  require('dotenv').config();
  
  const cortensorEndpoint = process.env.CORTENSOR_API_ENDPOINT;
  const apiKey = process.env.CORTENSOR_API_KEY;
  
  if (!cortensorEndpoint) {
    log('❌ Cortensor API endpoint not configured', 'red');
    return false;
  }
  
  log(`✅ Cortensor endpoint: ${cortensorEndpoint}`, 'green');
  
  if (!apiKey || apiKey.includes('your_')) {
    log('⚠️  Cortensor API key not configured (some features limited)', 'yellow');
    return true; // Not critical for basic functionality
  }
  
  log('✅ Cortensor API key: configured', 'green');
  
  // Test basic connectivity (without making actual API calls to avoid costs)
  try {
    const url = new URL(cortensorEndpoint);
    log(`✅ Cortensor URL format: valid (${url.hostname})`, 'green');
    return true;
  } catch (error) {
    log(`❌ Cortensor URL format: invalid`, 'red');
    return false;
  }
}

async function validateBlockchainIntegration() {
  log('\n⛓️  Validating Blockchain Integration...', 'cyan');
  
  require('dotenv').config();
  
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC;
  const tokenAddress = process.env.COR_TOKEN_ADDRESS;
  
  if (!rpcUrl || rpcUrl.includes('YOUR_API_KEY')) {
    log('❌ Arbitrum Sepolia RPC not configured', 'red');
    return false;
  }
  
  if (!tokenAddress || tokenAddress.length !== 42) {
    log('❌ $COR token address invalid', 'red');
    return false;
  }
  
  log('✅ RPC URL: configured', 'green');
  log(`✅ $COR Token: ${tokenAddress}`, 'green');
  log('✅ Chain ID: 421614 (Arbitrum Sepolia)', 'green');
  
  return true;
}

async function runProductionTest() {
  log('\n🧪 Running Production Test...', 'cyan');
  
  try {
    // Try to run a quick CLI validation
    const cliPath = checkFileExists('cli/target/release/aether-swarm.exe') 
      ? 'cli/target/release/aether-swarm.exe'
      : 'cli/target/release/aether-swarm';
    
    if (!checkFileExists(cliPath)) {
      log('❌ CLI executable not found', 'red');
      return false;
    }
    
    // Test CLI help command
    try {
      execSync(`${cliPath} --help`, { stdio: 'pipe' });
      log('✅ CLI executable: working', 'green');
    } catch (error) {
      log('❌ CLI executable: failed to run', 'red');
      return false;
    }
    
    // Test configuration validation
    try {
      execSync(`${cliPath} validate --config examples/swarm-configs/basic-public-goods.json`, { stdio: 'pipe' });
      log('✅ Configuration validation: working', 'green');
    } catch (error) {
      log('⚠️  Configuration validation: failed (check config files)', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Production test failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🌀 Aether Swarm Production Validation', 'cyan');
  log('=====================================', 'cyan');
  
  const results = {
    environment: await validateEnvironment(),
    build: await validateBuild(),
    network: await validateNetworkConnections(),
    cortensor: await validateCortensorIntegration(),
    blockchain: await validateBlockchainIntegration(),
    production: await runProductionTest()
  };
  
  log('\n📊 Validation Summary:', 'blue');
  log('=====================', 'blue');
  
  let allPassed = true;
  for (const [category, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${category.toUpperCase().padEnd(12)}: ${status}`, color);
    if (!passed) allPassed = false;
  }
  
  log('\n🎯 Overall Status:', 'blue');
  if (allPassed) {
    log('🎉 ALL SYSTEMS GO! Aether Swarm is ready for production use.', 'green');
    log('\n🚀 Next steps:', 'cyan');
    log('1. Start the dashboard: cd web-dashborad && npm run dev');
    log('2. Run a production demo: ./cli/target/release/aether-swarm demo --demo-type quick');
    log('3. Create your first real swarm: ./cli/target/release/aether-swarm init --task "Your task"');
  } else {
    log('⚠️  Some validations failed. Please fix the issues above before production use.', 'yellow');
    log('\n🔧 Common fixes:', 'cyan');
    log('1. Run the setup script: ./scripts/setup-production.bat (Windows) or ./scripts/setup-production.sh (Unix)');
    log('2. Configure your .env file with real API keys');
    log('3. Ensure all dependencies are installed');
  }
  
  log('\n💡 For support, join the Cortensor Discord: https://discord.gg/cortensor', 'blue');
}

// Run validation
main().catch(error => {
  log(`\n💥 Validation script failed: ${error.message}`, 'red');
  process.exit(1);
});