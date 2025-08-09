const hre = require("hardhat");

async function main() {
  const stablecoinAddress = process.env.STABLECOIN_ADDRESS;
  if (!stablecoinAddress) {
    throw new Error(
      "Missing STABLECOIN_ADDRESS in environment. Set it to the ERC20 on Base Sepolia you want to use."
    );
  }

  const Pay2Alpha = await hre.ethers.getContractFactory("Pay2Alpha");
  const contract = await Pay2Alpha.deploy(stablecoinAddress);
  await contract.waitForDeployment();
  console.log("Pay2Alpha deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
