// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract SapphireChatRecords is SiweAuth {
    address public roflApp;

    struct Record {
        address expert;
        address client;
        string ipfsCid;
        bytes secretKey;
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;
    uint256 public recordCount;

    constructor(string memory domain) SiweAuth(domain) {
        roflApp = msg.sender;
    }

    modifier onlyRofl() {
        require(msg.sender == roflApp, "only rofl");
        _;
    }

    function setRoflApp(address _r) external {
        require(msg.sender == roflApp, "only rofl");
        roflApp = _r;
    }

    function createRecord(
        address _expert,
        address _client,
        string calldata _ipfsCid,
        bytes calldata _secretKey
    ) external onlyRofl returns (uint256) {
        records[recordCount] = Record({
            expert: _expert,
            client: _client,
            ipfsCid: _ipfsCid,
            secretKey: _secretKey,
            timestamp: block.timestamp
        });
        recordCount++;
        return recordCount - 1;
    }

    function getSecretKey(uint256 _id, bytes memory token) external view returns (bytes memory) {
        require(_id < recordCount, "unknown record");
        Record storage r = records[_id];

        if (msg.sender == r.expert || msg.sender == r.client) {
            return r.secretKey;
        }

        address auth = authMsgSender(token);
        require(auth == r.expert || auth == r.client, "not authorized");
        return r.secretKey;
    }
}


