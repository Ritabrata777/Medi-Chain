# Aptos Migration Guide

This guide explains how to migrate from MetaMask/Polygon to Petra/Aptos for the MediChain application.

## Overview of Changes

### Wallet Integration
- **Before**: MetaMask (Ethereum/EVM compatible)
- **After**: Petra Wallet (Aptos native)

### Blockchain Network
- **Before**: Polygon Amoy Testnet (Chain ID: 80002)
- **After**: Aptos Testnet (Chain ID: 2)

### Smart Contracts
- **Before**: Solidity contracts (EVM compatible)
- **After**: Move contracts (Aptos native)

## Installation Steps

### 1. Install Petra Wallet

1. Visit [petra.app](https://petra.app/)
2. Download and install the Petra browser extension
3. Create a new wallet or import an existing one
4. Switch to Aptos Testnet (Petra automatically connects to testnet)

### 2. Install Aptos CLI

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

### 3. Setup Aptos Account

```bash
# Initialize Aptos account
aptos init

# Fund account with testnet tokens
aptos account fund-with-faucet
```

### 4. Install Dependencies

```bash
# Install new dependencies
npm install

# The @aptos-labs/ts-sdk package has been added for Aptos integration
```

## Configuration Changes

### Environment Variables

Update your `.env` file with Aptos-specific configuration:

```env
# Aptos Testnet RPC URL
APTOS_TESTNET_RPC_URL="https://fullnode.testnet.aptoslabs.com/v1"
NEXT_PUBLIC_APTOS_TESTNET_RPC_URL="https://fullnode.testnet.aptoslabs.com/v1"

# Contract Addresses (Update after deployment)
NEXT_PUBLIC_MEDI_CHAIN_CONTRACT_ADDRESS="0xYOUR_APTOS_CONTRACT_ADDRESS_HERE"
NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS="0xYOUR_APTOS_FUNDRAISER_CONTRACT_ADDRESS_HERE"
NEXT_PUBLIC_HEALTH_WALLET_CONTRACT_ADDRESS="0xYOUR_APTOS_HEALTH_WALLET_CONTRACT_ADDRESS_HERE"
```

## Smart Contract Deployment

### 1. Deploy Move Contracts

```bash
# Deploy to Aptos testnet
npm run deploy:aptos

# Or manually:
aptos move publish
```

### 2. Initialize Contract

After deployment, you need to initialize the contract:

```bash
# Initialize the MediChain contract
aptos move run --function-id 0xYOUR_CONTRACT_ADDRESS::medichain::initialize
```

## Key Differences

### Wallet Connection

**Before (MetaMask):**
```javascript
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
```

**After (Petra):**
```javascript
const response = await window.aptos.connect();
const address = response.address;
```

### Transaction Signing

**Before (Ethers.js):**
```javascript
const transaction = await contract.addConsultationLog(summaryHash, patientHash);
const receipt = await transaction.wait();
```

**After (Aptos SDK):**
```javascript
const transaction = {
  type: "entry_function_payload",
  function: `${CONTRACT_ADDRESS}::medichain::add_consultation_log`,
  arguments: [summaryHash, patientHash],
  type_arguments: []
};
const response = await window.aptos.signAndSubmitTransaction(transaction);
```

### Gas Fees

- **Before**: MATIC tokens on Polygon
- **After**: APT tokens on Aptos

## Testing

### 1. Test Wallet Connection

Visit `/test-wallet` to test your Petra wallet connection.

### 2. Test Contract Interaction

Use the dashboard to test doctor registration, patient registration, and consultation logging.

## Troubleshooting

### Common Issues

1. **Petra wallet not detected**
   - Ensure Petra extension is installed and unlocked
   - Refresh the page after installing Petra

2. **Transaction fails**
   - Check if you have sufficient APT for gas fees
   - Ensure you're connected to Aptos testnet
   - Verify contract address is correct

3. **Contract not found**
   - Ensure contract is deployed and initialized
   - Check contract address in environment variables

### Getting Test Tokens

Use the Aptos testnet faucet to get APT tokens:
- Visit: https://faucet.testnet.aptoslabs.com/
- Or use: `aptos account fund-with-faucet`

## Migration Checklist

- [ ] Install Petra wallet
- [ ] Install Aptos CLI
- [ ] Setup Aptos account
- [ ] Update environment variables
- [ ] Deploy Move contracts
- [ ] Initialize contracts
- [ ] Test wallet connection
- [ ] Test contract interactions
- [ ] Update any remaining references to MetaMask/Polygon

## Support

For issues related to:
- **Petra Wallet**: Visit [petra.app/docs](https://petra.app/docs)
- **Aptos Development**: Visit [aptos.dev](https://aptos.dev)
- **Move Language**: Visit [move-language.github.io](https://move-language.github.io)

## Notes

- Aptos uses a different programming model than Ethereum
- Move contracts are more secure by default
- Gas fees on Aptos are typically lower
- Aptos has better parallel execution capabilities
