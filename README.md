# Pay2Alpha

Private, paid expert insights — credits and payouts on Base; encrypted messages on Oasis Sapphire.

## What this project is

- Credit-based paid messaging between experts and clients
- Commerce plane: Base Sepolia (USDC approvals, buy/spend/refund credits, claim)
- Privacy plane: Sapphire Testnet (confidential record storage, SIWE-gated key access)
- Frontend: Vite + React/TS, wallet-native UX (MetaMask)

## Deployed contracts

- Base Sepolia (commerce)

  - `Pay2Alpha` (latest): `0x3096A0B60eD807EE6C4323bD2460638652b8fC8F`
  - Explorer: [`basescan`](https://sepolia.basescan.org/address/0x3096A0B60eD807EE6C4323bD2460638652b8fC8F)

- Sapphire Testnet (privacy)
  - `SapphireChatRecords`: `0xC5Dd06a0345087ceb10AB852441ecc22F0Fc9e0D`
  - Explorer: [`oasis explorer`](https://explorer.oasis.io/testnet/sapphire/search?q=0xC5Dd06a0345087ceb10AB852441ecc22F0Fc9e0D)

Shortcuts:

- Base Sepolia explorer root: `https://sepolia.basescan.org/`
- Sapphire Testnet explorer root: `https://explorer.oasis.io/testnet/sapphire`

## Why split-plane?

- Base keeps fees low and accounting auditable
- Sapphire stores message secrets and enforces access with SIWE; content never leaves the confidential runtime

## Key flows (MVP)

- Buy credits (USDC, Base) → `buyCredits(expert, credits)`
- Expert sends premium (Sapphire) → `createRecord(expert, client, ipfsCid|text, secret)`
- Reveal (client): `spendCredits(recordId, 1)` on Base, then SIWE → `login` → `getSecretKey` on Sapphire
- Refund (client): `refundCredits(recordId, n)` on Base
- Claim (expert): `claimCredits(recordId, n)` on Base

## Quick start

Prereqs: Node 18+, pnpm/npm, a test wallet with Base Sepolia ETH + USDC and Sapphire ROSE.

Install deps:

```bash
pnpm i # or npm i
```

Frontend:

```bash
cd frontend
pnpm i
pnpm run dev
```

Hardhat (contracts):

```bash
pnpm hardhat compile
# Deploy SapphireChatRecords (Sapphire Testnet)
pnpm hardhat deploySapphireChat --network sapphireTestnet
# Deploy Pay2Alpha (Base Sepolia)
pnpm hardhat deployPay2Alpha --stablecoin <USDC_ADDRESS> --network baseSepolia
```

Env you may need (`.env`):

```
PRIVATE_KEY=<hex without 0x or with 0x>
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SAPPHIRE_RPC=https://testnet.sapphire.oasis.io
SIWE_DOMAIN=localhost
STABLECOIN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

## Frontend config hints

Check `frontend/src/config.ts` for:

- Base: chain id/hex, RPC, USDC, `pay2alpha`
- Sapphire: chain id/hex, RPC, `chat`, `siweDomain`

## Available scripts (selected)

- `deployPay2Alpha` – deploys Pay2Alpha
- `deploySapphireChat` – deploys SapphireChatRecords
- `export-abis` – auto-export ABIs to `/abis` and `frontend/src/abis`
- Example utility tasks: `setRoflApp`, `siweToken`, etc.

## The problem it solves

- Experts drown in unpaid DMs; buyers can’t verify delivery nor keep messages private
- Pay2Alpha creates a clean “spend-to-reveal” flow: auditable payments + private delivery

## What can people use it for

- Paid 1:1 insights (trading/investment, legal/tax, smart-contract reviews)
- Gated research drops and premium Q&A
- DAO advisory: credit budgets for contributors

## Challenges I ran into

- Coordinating UX across two chains (Base + Sapphire) and two providers
- SIWE-gated decryption edge cases (domain/chain id, signature shape)
- Mapping purchases (Base records) to reveal events (Sapphire records) reliably

## Security & privacy notes

- Message secrets are only returned to `expert` or `client` (or with a valid SIWE token)
- Credits and payouts are fully on-chain on Base; no custodial balances

## License

MIT
