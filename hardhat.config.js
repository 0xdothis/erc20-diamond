const { vars } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const ALCHEMY_RPC_URL = vars.get("ALCHEMY_RPC_URL");
const ALCHEMY_BASE_SEPOLIA = vars.get("ALCHEMY_BASE_SEPOLIA");
const ACIENTGURU_PRIVATE_KEY = vars.get("ACIENTGURU_PRIVATE_KEY");
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    "base-sepolia": {
      url: ALCHEMY_BASE_SEPOLIA,
      accounts: [ACIENTGURU_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
