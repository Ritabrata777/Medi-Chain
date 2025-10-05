const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Check if we're on the correct network
  const network = await hre.ethers.provider.getNetwork();
  console.log("Deploying to network:", network.name, "with chain ID:", network.chainId);

  // Deploy MediChain Contract
  console.log("\nDeploying MediChain contract...");
  const mediChain = await hre.ethers.deployContract("MediChain", [deployer.address]);
  await mediChain.waitForDeployment();
  const mediChainAddress = mediChain.target;
  console.log(`✅ MediChain contract deployed to: ${mediChainAddress}`);

  // Deploy Fundraiser Contract, linking it to the MediChain contract
  console.log("\nDeploying Fundraiser contract...");
  const fundraiser = await hre.ethers.deployContract("Fundraiser", [deployer.address, mediChainAddress]);
  await fundraiser.waitForDeployment();
  const fundraiserAddress = fundraiser.target;
  console.log(`✅ Fundraiser contract deployed to: ${fundraiserAddress}`);

  // Deploy HealthRecordWallet Contract
  console.log("\nDeploying HealthRecordWallet contract...");
  const healthRecordWallet = await hre.ethers.deployContract("HealthRecordWallet");
  await healthRecordWallet.waitForDeployment();
  const healthRecordWalletAddress = healthRecordWallet.target;
  console.log(`✅ HealthRecordWallet deployed to: ${healthRecordWalletAddress}`);
  
  // --- Save contract ABIs and addresses ---
  console.log("\nSaving contract artifacts...");
  saveContractArtifacts("MediChain", mediChainAddress);
  saveContractArtifacts("Fundraiser", fundraiserAddress);
  saveContractArtifacts("HealthRecordWallet", healthRecordWalletAddress);
  console.log("✅ Artifacts saved successfully.");


  // Verify contracts on PolygonScan (if API key is provided)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\nVerifying contracts on PolygonScan... (This may take a moment)");
    
    // Wait for a few blocks to be mined before verification
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: mediChainAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ MediChain contract verified on PolygonScan");
    } catch (error) {
      console.log("⚠️  MediChain contract verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: fundraiserAddress,
        constructorArguments: [deployer.address, mediChainAddress],
      });
      console.log("✅ Fundraiser contract verified on PolygonScan");
    } catch (error) {
      console.log("⚠️  Fundraiser contract verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: healthRecordWalletAddress,
        constructorArguments: [],
      });
      console.log("✅ HealthRecordWallet verified on PolygonScan");
    } catch (error) {
      console.log("⚠️  HealthRecordWallet verification failed:", error.message);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log(`📋 MediChain: ${mediChainAddress}`);
  console.log(`💰 Fundraiser: ${fundraiserAddress}`);
  console.log(`🗂️  HealthRecordWallet: ${healthRecordWalletAddress}`);
  console.log(`👑 Admin Wallet: ${deployer.address}`);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Copy the addresses above");
  console.log("2. Create a .env file in your project root with the following variables:");
  console.log("   AMOY_RPC_URL=https://rpc-amoy.polygon.technology/");
  console.log("   NEXT_PUBLIC_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/");
  console.log(`   NEXT_PUBLIC_MEDI_CHAIN_CONTRACT_ADDRESS=${mediChainAddress}`);
  console.log(`   NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS=${fundraiserAddress}`);
  console.log(`   NEXT_PUBLIC_HEALTH_WALLET_CONTRACT_ADDRESS=${healthRecordWalletAddress}`);
  console.log(`   NEXT_PUBLIC_ADMIN_WALLETS=${deployer.address}`);
  console.log(`   PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE`);
  console.log(`   POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_API_KEY_HERE`);
  
  console.log("\n3. Restart your development server");
  console.log("4. The frontend will now be connected to your deployed contracts on Polygon Amoy testnet");
  
  console.log("\n🔗 Useful Links:");
  console.log(`   MediChain on PolygonScan: https://amoy.polygonscan.com/address/${mediChainAddress}`);
  console.log(`   Fundraiser on PolygonScan: https://amoy.polygonscan.com/address/${fundraiserAddress}`);
  console.log("   Polygon Amoy Faucet: https://faucet.polygon.technology/");
  
  console.log("\n⚠️  Important Notes:");
  console.log("   - Make sure you have MATIC tokens in your wallet for gas fees");
  console.log("   - The admin wallet can verify doctors and manage user bans");
  console.log("   - All transactions will be on the Polygon Amoy testnet");
}

function saveContractArtifacts(contractName, contractAddress) {
  const contractsDir = path.join(__dirname, "..", "src", "frontend", "contracts");
  const backendContractsDir = path.join(__dirname, "..", "src", "backend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
   if (!fs.existsSync(backendContractsDir)) {
    fs.mkdirSync(backendContractsDir, { recursive: true });
  }

  const artifact = hre.artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );
  fs.writeFileSync(
    path.join(backendContractsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
