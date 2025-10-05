// Note: Hardhat is primarily for Ethereum/EVM chains
// For Aptos, you would typically use Aptos CLI or other Aptos-specific tools
// This configuration is kept for reference but won't be used for Aptos deployment

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Aptos doesn't use Hardhat - use Aptos CLI instead
    // This is kept for any remaining EVM contracts if needed
  },
  // Aptos uses different verification tools
  // Use Aptos Explorer for contract verification
};
