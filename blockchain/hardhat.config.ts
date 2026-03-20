import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@oasisprotocol/sapphire-hardhat";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },

  networks: {
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 0x5aff,
      gasPrice: 100000000000
    },
  },

etherscan: {
  apiKey: {
    sapphireTestnet: "empty"
  },
  customChains: [
    {
      network: "sapphireTestnet",
      chainId: 23295,
      urls: {
        apiURL: "https://explorer.oasis.io/testnet/sapphire/api",
        browserURL: "https://explorer.oasis.io/testnet/sapphire"
      }
    }
  ]
}
};

export default config;