/*
  Hardhat tasks for Pay2Alpha and SapphireChatRecords, modeled after demo-quiz backend tasks.
  Usage examples:
    npx hardhat deployPay2Alpha --stablecoin 0x... --network baseSepolia
    npx hardhat deploySapphireChat --domain localhost --network sapphireTestnet
    npx hardhat registerExpert --pay2alpha 0x... --name "Alice" --price 1000000 --network baseSepolia
    npx hardhat buyCredits --pay2alpha 0x... --expert 0x... --credits 3 --network baseSepolia
    npx hardhat claimCredits --pay2alpha 0x... --recordId 0 --credits 1 --network baseSepolia
    npx hardhat refundCredits --pay2alpha 0x... --recordId 0 --credits 1 --network baseSepolia
    npx hardhat createRecord --sapphireChat 0x... --expert 0x... --client 0x... --ipfsCid Qm... --secret 0x... --network sapphireTestnet
    npx hardhat getSecret --sapphireChat 0x... --id 0 --network sapphireTestnet
*/

require("@nomicfoundation/hardhat-ethers");
require("@oasisprotocol/sapphire-hardhat");

const path = require("path");
const fs = require("fs/promises");
const canonicalize = require("canonicalize");
const { task } = require("hardhat/config");
const { TASK_COMPILE } = require("hardhat/builtin-tasks/task-names");

// Export ABIs like demo-quiz
const TASK_EXPORT_ABIS = "export-abis";

task(TASK_COMPILE, async (_args, hre, runSuper) => {
  await runSuper();
  await hre.run(TASK_EXPORT_ABIS);
});

task("siweToken", "Generate SIWE auth token for SapphireChatRecords")
  .addParam("sapphirechat", "SapphireChatRecords contract address")
  .addOptionalParam("addr", "User address for the token (defaults to signer)")
  .addOptionalParam("domain", "Domain for SIWE (defaults to contract domain)")
  .setAction(async (args, hre) => {
    const { ethers } = hre;
    const sapphire = require("@oasisprotocol/sapphire-paratime");
    const { JsonRpcProvider, Wallet, Contract, Signature } = require("ethers");
    const url = hre.network.config.url || "https://testnet.sapphire.oasis.io";
    const provider = new JsonRpcProvider(url, "any");
    const wrapped = sapphire.wrapEthereumProvider(provider);
    const pkRaw = process.env.PRIVATE_KEY || "";
    const pk = pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`;
    if (!pk || pk.length < 66)
      throw new Error("PRIVATE_KEY env not set for siweToken task");
    const wallet = new Wallet(pk, provider);
    const userAddr =
      (args.addr && ethers.getAddress(args.addr)) || wallet.address;
    const { abi } = await hre.artifacts.readArtifact(
      "contracts/SapphireChatRecords.sol:SapphireChatRecords"
    );
    const c = new Contract(args.sapphirechat, abi, wallet.connect(wrapped));
    const domain = args.domain || (await c.domain());
    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);

    function toIso(ts) {
      return new Date(ts).toISOString().replace(/\.\d{3}Z$/, "Z");
    }
    const issuedAt = toIso(Date.now());
    const alphabet =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let nonce = "";
    for (let i = 0; i < 16; i++)
      nonce += alphabet[Math.floor(Math.random() * alphabet.length)];
    const uri = `https://${domain}/login`;
    const statement = "Pay2Alpha access";
    const siweMsg =
      `${domain} wants you to sign in with your Ethereum account:\n` +
      `${userAddr}\n\n` +
      `${statement}\n\n` +
      `URI: ${uri}\n` +
      `Version: 1\n` +
      `Chain ID: ${chainId}\n` +
      `Nonce: ${nonce}\n` +
      `Issued At: ${issuedAt}`;

    const sigHex = await wallet.signMessage(siweMsg);
    const sig = Signature.from(sigHex);
    const token = await c.login(siweMsg, { v: sig.v, r: sig.r, s: sig.s });
    console.log(`Token: ${token}`);
  });

task(TASK_EXPORT_ABIS, async (_args, hre) => {
  const outDir = path.join(hre.config.paths.root, "abis");
  const srcDir = path.basename(hre.config.paths.sources);
  await fs.mkdir(outDir, { recursive: true });
  const fqns = await hre.artifacts.getAllFullyQualifiedNames();
  await Promise.all(
    fqns.map(async (fqn) => {
      const { abi, contractName, sourceName } =
        await hre.artifacts.readArtifact(fqn);
      if (!abi.length || !sourceName.startsWith(srcDir)) return;
      await fs.writeFile(
        path.join(outDir, `${contractName}.json`),
        `${canonicalize(abi)}\n`
      );
    })
  );
});

task("deployPay2Alpha", "Deploys Pay2Alpha to the selected network")
  .addOptionalParam(
    "stablecoin",
    "ERC-20 token address for payments; falls back to env STABLECOIN_ADDRESS"
  )
  .setAction(async (args, hre) => {
    const stablecoin = args.stablecoin || process.env.STABLECOIN_ADDRESS;
    if (!stablecoin) {
      throw new Error(
        "stablecoin address not provided. Use --stablecoin or set STABLECOIN_ADDRESS env var."
      );
    }
    await hre.run("compile");
    const F = await hre.ethers.getContractFactory("Pay2Alpha");
    const c = await F.deploy(stablecoin);
    await c.waitForDeployment();
    const addr = await c.getAddress();
    console.log(`Pay2Alpha deployed at: ${addr}`);
    return addr;
  });

task(
  "deploySapphireChat",
  "Deploys SapphireChatRecords (confidential) to Sapphire"
)
  .addOptionalParam(
    "domain",
    "SIWE domain for auth",
    process.env.SIWE_DOMAIN || "localhost"
  )
  .setAction(async (args, hre) => {
    await hre.run("compile");
    const F = await hre.ethers.getContractFactory("SapphireChatRecords");
    const c = await F.deploy(args.domain);
    await c.waitForDeployment();
    const addr = await c.getAddress();
    console.log(`SapphireChatRecords deployed at: ${addr}`);
    return addr;
  });

task("registerExpert")
  .addParam("pay2alpha", "Pay2Alpha contract address")
  .addParam("name", "Expert display name")
  .addParam("price", "Price per credit in stablecoin base units (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("Pay2Alpha", args.pay2alpha);
    const tx = await c.registerExpert(args.name, BigInt(args.price));
    const r = await tx.wait();
    console.log(`Expert registered. Tx: ${r.hash}`);
  });

task("setPrice")
  .addParam("pay2alpha", "Pay2Alpha contract address")
  .addParam("price", "New price per credit in stablecoin base units (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("Pay2Alpha", args.pay2alpha);
    const tx = await c.setPrice(BigInt(args.price));
    const r = await tx.wait();
    console.log(`Price updated. Tx: ${r.hash}`);
  });

task("buyCredits")
  .addParam("pay2alpha", "Pay2Alpha contract address")
  .addParam("expert", "Expert address")
  .addParam("credits", "Number of credits to buy (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("Pay2Alpha", args.pay2alpha);
    const tx = await c.buyCredits(args.expert, BigInt(args.credits));
    const r = await tx.wait();
    console.log(`Credits purchased. Tx: ${r.hash}`);
  });

task("stablecoinApprove")
  .addParam("token", "Stablecoin ERC20 address")
  .addParam("spender", "Spender address (e.g., Pay2Alpha)")
  .addParam("amount", "Allowance amount (uint)")
  .setAction(async (args, hre) => {
    const erc20Abi = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function balanceOf(address) public view returns (uint256)",
      "function decimals() public view returns (uint8)",
      "function symbol() public view returns (string)",
    ];
    const signer = (await hre.ethers.getSigners())[0];
    const token = new hre.ethers.Contract(args.token, erc20Abi, signer);
    const tx = await token.approve(args.spender, BigInt(args.amount));
    const r = await tx.wait();
    const allowance = await token.allowance(signer.address, args.spender);
    const bal = await token.balanceOf(signer.address);
    console.log(
      `Approved. Tx: ${r.hash}\nAllowance: ${allowance}\nBalance: ${bal}`
    );
  });

task("stablecoinInfo")
  .addParam("token", "Stablecoin ERC20 address")
  .addParam("owner", "Owner address to query allowance/balance for")
  .addParam("spender", "Spender address to query allowance for")
  .setAction(async (args, hre) => {
    const erc20Abi = [
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function balanceOf(address) public view returns (uint256)",
      "function decimals() public view returns (uint8)",
      "function symbol() public view returns (string)",
    ];
    const provider = hre.ethers.provider;
    const token = new hre.ethers.Contract(args.token, erc20Abi, provider);
    const [allowance, balance, decimals, symbol] = await Promise.all([
      token.allowance(args.owner, args.spender),
      token.balanceOf(args.owner),
      token.decimals(),
      token.symbol(),
    ]);
    console.log(
      `Token ${symbol} (decimals ${decimals})\nOwner: ${args.owner}\nSpender: ${args.spender}\nAllowance: ${allowance}\nBalance: ${balance}`
    );
  });

task("claimCredits")
  .addParam("pay2alpha", "Pay2Alpha contract address")
  .addParam("recordid", "Record id (uint)")
  .addParam("credits", "Credits to claim (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("Pay2Alpha", args.pay2alpha);
    const tx = await c.claimCredits(
      BigInt(args.recordid),
      BigInt(args.credits)
    );
    const r = await tx.wait();
    console.log(`Credits claimed. Tx: ${r.hash}`);
  });

task("refundCredits")
  .addParam("pay2alpha", "Pay2Alpha contract address")
  .addParam("recordid", "Record id (uint)")
  .addParam("credits", "Credits to refund (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt("Pay2Alpha", args.pay2alpha);
    const tx = await c.refundCredits(
      BigInt(args.recordid),
      BigInt(args.credits)
    );
    const r = await tx.wait();
    console.log(`Credits refunded. Tx: ${r.hash}`);
  });

task("createRecord")
  .addParam("sapphirechat", "SapphireChatRecords contract address")
  .addParam("expert", "Expert address")
  .addParam("client", "Client address")
  .addParam("ipfscid", "IPFS CID for encrypted chat content")
  .addParam("secret", "Secret key bytes (0x-prefixed hex)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt(
      "SapphireChatRecords",
      args.sapphirechat
    );
    const tx = await c.createRecord(
      args.expert,
      args.client,
      args.ipfscid,
      args.secret
    );
    const r = await tx.wait();
    console.log(`Record created. Tx: ${r.hash}`);
  });

task("getSecret")
  .addParam("sapphirechat", "SapphireChatRecords contract address")
  .addParam("id", "Record id (uint)")
  .addOptionalParam(
    "token",
    "SiweAuth token bytes (0x hex) for delegated access",
    "0x"
  )
  .setAction(async (args, hre) => {
    const sapphire = require("@oasisprotocol/sapphire-paratime");
    const { JsonRpcProvider, Wallet, Contract } = require("ethers");
    const { abi } = await hre.artifacts.readArtifact(
      "contracts/SapphireChatRecords.sol:SapphireChatRecords"
    );
    const url = hre.network.config.url || "https://testnet.sapphire.oasis.io";
    const provider = new JsonRpcProvider(url, "any");
    const pkRaw = process.env.PRIVATE_KEY || "";
    const pk = pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`;
    if (!pk || pk.length < 66) {
      throw new Error("PRIVATE_KEY env not set for getSecret task");
    }
    const wallet = new Wallet(pk, provider);
    const wrapped = sapphire.wrapEthereumProvider(provider);
    const c = new Contract(args.sapphirechat, abi, wallet.connect(wrapped));
    const secret = await c.getSecretKey(BigInt(args.id), args.token);
    console.log(`Secret: ${secret}`);
  });

task("getRecord")
  .addParam("sapphirechat", "SapphireChatRecords contract address")
  .addParam("id", "Record id (uint)")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt(
      "SapphireChatRecords",
      args.sapphirechat
    );
    const rec = await c.records(BigInt(args.id));
    // rec = [expert, client, ipfsCid, secretKey, timestamp]
    console.log(
      `Record ${args.id}:\n expert=${rec[0]}\n client=${rec[1]}\n ipfsCid=${rec[2]}\n secret(len)=${rec[3].length}\n timestamp=${rec[4]}`
    );
  });

task("setRoflApp")
  .addParam("sapphirechat", "SapphireChatRecords contract address")
  .addParam("address", "New ROFL app address")
  .setAction(async (args, hre) => {
    const c = await hre.ethers.getContractAt(
      "SapphireChatRecords",
      args.sapphirechat
    );
    const tx = await c.setRoflApp(args.address);
    const r = await tx.wait();
    console.log(`ROFL app set to ${args.address}. Tx: ${r.hash}`);
  });

// Placeholder for ROFL integration helpers: In production, a ROFL app can mint SIWE tokens
// that can be provided as the `token` parameter to getSecretKey for delegated access.
// We will finalize based on chosen ROFL workflow (signing vs. mediation).
