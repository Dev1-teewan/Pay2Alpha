export const CONFIG = {
  base: {
    chainId: 84532, // Base Sepolia
    chainHex: "0x14A34",
    rpcUrl: import.meta.env.VITE_BASE_RPC || "https://sepolia.base.org",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    pay2alpha: "0x3096A0B60eD807EE6C4323bD2460638652b8fC8F",
    startBlock: Number(import.meta.env.VITE_PAY2ALPHA_START_BLOCK || 0),
  },
  sapphire: {
    chainId: 23295, // Sapphire Testnet
    chainHex: "0x5aff",
    rpcUrl:
      import.meta.env.VITE_SAPPHIRE_RPC || "https://testnet.sapphire.oasis.io",
    chat: "0xC5Dd06a0345087ceb10AB852441ecc22F0Fc9e0D",
    siweDomain: import.meta.env.VITE_SIWE_DOMAIN || "localhost",
  },
};
