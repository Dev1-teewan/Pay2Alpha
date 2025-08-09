import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@oasisprotocol/sapphire-hardhat";
import "./tasks/pay2alpha";
require("dotenv").config();

const { PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, SAPPHIRE_RPC } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
    sapphireTestnet: {
      url: SAPPHIRE_RPC || "https://testnet.sapphire.oasis.io",
      chainId: 23295,
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
};

export default config;
