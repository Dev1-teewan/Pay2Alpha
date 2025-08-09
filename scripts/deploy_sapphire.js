const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const domain = process.env.SIWE_DOMAIN || "localhost";
  const C = await hre.ethers.getContractFactory("SapphireChatRecords");
  const c = await C.deploy(domain);
  await c.waitForDeployment();
  console.log("SapphireChatRecords deployed:", await c.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
