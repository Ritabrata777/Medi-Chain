#!/usr/bin/env node

/**
 * Aptos Deployment Script for MediChain
 * 
 * This script deploys the MediChain Move smart contract to Aptos testnet.
 * 
 * Prerequisites:
 * 1. Install Aptos CLI: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/
 * 2. Create an account: aptos init
 * 3. Fund your account with testnet tokens: aptos account fund-with-faucet
 * 
 * Usage:
 * node scripts/deploy-aptos.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Aptos deployment for MediChain...\n');

try {
    // Check if Aptos CLI is installed
    console.log('📋 Checking Aptos CLI installation...');
    execSync('aptos --version', { stdio: 'pipe' });
    console.log('✅ Aptos CLI is installed\n');

    // Check if Move.toml exists
    const moveTomlPath = path.join(__dirname, '..', 'Move.toml');
    if (!fs.existsSync(moveTomlPath)) {
        throw new Error('Move.toml not found. Please ensure you are in the project root directory.');
    }
    console.log('✅ Move.toml found\n');

    // Check if sources directory exists
    const sourcesPath = path.join(__dirname, '..', 'sources');
    if (!fs.existsSync(sourcesPath)) {
        throw new Error('sources directory not found. Please ensure Move contracts are in the sources directory.');
    }
    console.log('✅ Sources directory found\n');

    // Compile the Move contracts
    console.log('🔨 Compiling Move contracts...');
    execSync('aptos move compile', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Contracts compiled successfully\n');

    // Test the contracts (optional)
    console.log('🧪 Running tests...');
    try {
        execSync('aptos move test', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('✅ All tests passed\n');
    } catch (error) {
        console.log('⚠️  Some tests failed, but continuing with deployment...\n');
    }

    // Deploy to testnet
    console.log('🚀 Deploying to Aptos testnet...');
    const deployOutput = execSync('aptos move publish --profile medichain --assume-yes', { 
        stdio: 'pipe', 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
    });
    
    console.log('✅ Deployment successful!');
    console.log('📄 Deployment output:');
    console.log(deployOutput);

    // Extract contract address from output
    const addressMatch = deployOutput.match(/Successfully submitted a transaction: (0x[a-fA-F0-9]+)/);
    if (addressMatch) {
        const contractAddress = addressMatch[1];
        console.log(`\n🎉 Contract deployed at address: ${contractAddress}`);
        console.log('\n📝 Next steps:');
        console.log('1. Update your .env file with the contract address:');
        console.log(`   NEXT_PUBLIC_MEDI_CHAIN_CONTRACT_ADDRESS="${contractAddress}"`);
        console.log('2. Initialize the contract by calling the initialize function');
        console.log('3. Register doctors and patients as needed');
        console.log('\n🔗 View on Aptos Explorer:');
        console.log(`   https://explorer.aptoslabs.com/account/${contractAddress}?network=testnet`);
    }

} catch (error) {
    console.error('❌ Deployment failed:');
    console.error(error.message);
    
    if (error.message.includes('aptos: command not found')) {
        console.log('\n💡 To install Aptos CLI:');
        console.log('   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3');
        console.log('   Or visit: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/');
    }
    
    if (error.message.includes('Account not found')) {
        console.log('\n💡 To create an Aptos account:');
        console.log('   aptos init');
        console.log('   aptos account fund-with-faucet');
    }
    
    process.exit(1);
}
