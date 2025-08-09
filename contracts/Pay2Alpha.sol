// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pay2Alpha is Ownable {
    IERC20 public stablecoin; // e.g., USDC

    struct AlphaRecord {
        address expert;
        address client;
        uint256 totalAmountPaid;
        uint256 credits;
        uint256 creditsUsed;
        uint256 timestamp;
    }

    struct Expert {
        string name;
        uint256 pricePerCredit;
    }

    mapping(uint256 => AlphaRecord) public records;
    uint256 public recordCount;

    mapping(address => Expert) public experts;

    event ExpertRegistered(address expert, string name, uint256 pricePerCredit);
    event CreditsPurchased(address client, address expert, uint256 credits, uint256 amount);
    event CreditsClaimed(address expert, uint256 recordId, uint256 creditsClaimed);
    event CreditsRefunded(address client, uint256 recordId, uint256 creditsRefunded);

    constructor(address _stablecoin) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
    }

    function registerExpert(string calldata _name, uint256 _pricePerCredit) external {
        require(bytes(experts[msg.sender].name).length == 0, "Already registered");
        experts[msg.sender] = Expert(_name, _pricePerCredit);
        emit ExpertRegistered(msg.sender, _name, _pricePerCredit);
    }

    function setPrice(uint256 _pricePerCredit) external {
        require(bytes(experts[msg.sender].name).length > 0, "Not registered");
        experts[msg.sender].pricePerCredit = _pricePerCredit;
    }

    function buyCredits(address _expert, uint256 _credits) external {
        require(bytes(experts[_expert].name).length > 0, "Expert not found");
        uint256 cost = experts[_expert].pricePerCredit * _credits;

        require(stablecoin.transferFrom(msg.sender, address(this), cost), "Payment failed");

        records[recordCount] = AlphaRecord({
            expert: _expert,
            client: msg.sender,
            totalAmountPaid: cost,
            credits: _credits,
            creditsUsed: 0,
            timestamp: block.timestamp
        });

        emit CreditsPurchased(msg.sender, _expert, _credits, cost);
        recordCount++;
    }

    function claimCredits(uint256 _recordId, uint256 _creditsToClaim) external {
        AlphaRecord storage rec = records[_recordId];
        require(msg.sender == rec.expert, "Not your record");
        require(rec.creditsUsed + _creditsToClaim <= rec.credits, "Too many credits");

        uint256 amount = (rec.totalAmountPaid * _creditsToClaim) / rec.credits;
        require(stablecoin.transfer(rec.expert, amount), "Transfer failed");

        rec.creditsUsed += _creditsToClaim;
        emit CreditsClaimed(msg.sender, _recordId, _creditsToClaim);
    }

    function refundCredits(uint256 _recordId, uint256 _creditsToRefund) external {
        AlphaRecord storage rec = records[_recordId];
        require(msg.sender == rec.client, "Not your purchase");
        require(rec.creditsUsed + _creditsToRefund <= rec.credits, "Too many credits");

        uint256 amount = (rec.totalAmountPaid * _creditsToRefund) / rec.credits;
        require(stablecoin.transfer(rec.client, amount), "Transfer failed");

        rec.creditsUsed += _creditsToRefund;
        emit CreditsRefunded(msg.sender, _recordId, _creditsToRefund);
    }
}
