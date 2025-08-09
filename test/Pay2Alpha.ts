import { expect } from "chai";
import { ethers } from "hardhat";

describe("Pay2Alpha", function () {
  it("end-to-end: register, buy, claim, refund", async function () {
    const [deployer, client, expert] = await ethers.getSigners();

    // Deploy mock USDC (6 decimals) and mint to client
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    let usdc: any = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
    await usdc.waitForDeployment();

    const mintAmount = ethers.parseUnits("1000", 6);
    await usdc.mint(client.address, mintAmount);

    // Deploy Pay2Alpha with mock token
    const Pay2Alpha = await ethers.getContractFactory("Pay2Alpha");
    let p2a: any = await Pay2Alpha.deploy(await usdc.getAddress());
    await p2a.waitForDeployment();

    // Expert registers with price per credit = 1 USDC
    const pricePerCredit = ethers.parseUnits("1", 6);
    await p2a.connect(expert).registerExpert("Alice", pricePerCredit);

    // Client buys 10 credits
    const creditsToBuy = 10n;
    const cost = pricePerCredit * creditsToBuy; // 10 USDC
    await usdc.connect(client).approve(await p2a.getAddress(), cost);
    await expect(p2a.connect(client).buyCredits(expert.address, creditsToBuy))
      .to.emit(p2a, "CreditsPurchased")
      .withArgs(client.address, expert.address, creditsToBuy, cost);

    // Record 0 checks
    const rec = await p2a.records(0);
    expect(rec.expert).to.eq(expert.address);
    expect(rec.client).to.eq(client.address);
    expect(rec.totalAmountPaid).to.eq(cost);
    expect(rec.credits).to.eq(creditsToBuy);
    expect(rec.creditsUsed).to.eq(0n);

    // Expert claims 3 credits -> receives 3 USDC
    const claimCredits = 3n;
    const expectedClaimAmount = (cost * claimCredits) / creditsToBuy; // 3 USDC
    const expertBalBefore = await usdc.balanceOf(expert.address);
    await expect(p2a.connect(expert).claimCredits(0, claimCredits))
      .to.emit(p2a, "CreditsClaimed")
      .withArgs(expert.address, 0, claimCredits);
    const expertBalAfter = await usdc.balanceOf(expert.address);
    expect(expertBalAfter - expertBalBefore).to.eq(expectedClaimAmount);

    // Client refunds 2 credits -> gets 2 USDC back
    const refundCredits = 2n;
    const expectedRefundAmount = (cost * refundCredits) / creditsToBuy; // 2 USDC
    const clientBalBefore = await usdc.balanceOf(client.address);
    await expect(p2a.connect(client).refundCredits(0, refundCredits))
      .to.emit(p2a, "CreditsRefunded")
      .withArgs(client.address, 0, refundCredits);
    const clientBalAfter = await usdc.balanceOf(client.address);
    expect(clientBalAfter - clientBalBefore).to.eq(expectedRefundAmount);

    // creditsUsed should now be 5 (3 claimed + 2 refunded)
    const recAfter = await p2a.records(0);
    expect(recAfter.creditsUsed).to.eq(5n);
  });
});
