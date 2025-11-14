// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint256, externalEuint256, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AnonymousConfessions
 * @dev A smart contract for storing encrypted confessions using FHE by Zama
 * Features:
 * - Store encrypted messages/confessions on-chain
 * - Public access to decrypt messages without revealing author
 * - Verify confession authorship privately
 */
contract AnonymousConfessions is ZamaEthereumConfig {
    
    struct EncryptedConfession {
        euint256 message;
        euint256 authorHash;
        uint256 timestamp;
        uint256 confessionId;
    }
    
    EncryptedConfession[] public confessions;
    
    event ConfessionStored(uint256 indexed confessionId, uint256 timestamp);
    
    uint256 private confessionCounter;
    
    constructor() {
        confessionCounter = 0;
    }
    
    /**
     * @dev Store a new encrypted confession
     */
    function storeConfession(
        externalEuint256 encryptedMessage,
        bytes calldata inputProof
    ) external returns (uint256) {
        euint256 message = FHE.fromExternal(encryptedMessage, inputProof);
        
        uint256 authorValue = uint256(uint160(msg.sender));
        euint256 authorHash = FHE.asEuint256(authorValue);
        
        uint256 confessionId = confessionCounter++;
        
        EncryptedConfession memory newConfession = EncryptedConfession({
            message: message,
            authorHash: authorHash,
            timestamp: block.timestamp,
            confessionId: confessionId
        });
        
        confessions.push(newConfession);
        
        // Make publicly decryptable
        FHE.makePubliclyDecryptable(message);
        FHE.allowThis(authorHash);
        
        emit ConfessionStored(confessionId, block.timestamp);
        
        return confessionId;
    }
    
    /**
     * @dev Verify if caller authored a confession
     */
    function verifyMyConfession(uint256 _confessionId) external returns (ebool) {
        require(_confessionId < confessions.length, "Invalid ID");
        
        euint256 storedAuthorHash = confessions[_confessionId].authorHash;
        uint256 callerValue = uint256(uint160(msg.sender));
        euint256 callerHash = FHE.asEuint256(callerValue);
        
        ebool result = FHE.eq(storedAuthorHash, callerHash);
        FHE.allow(result, msg.sender);
        
        return result;
    }
    
    function getConfessionCount() external view returns (uint256) {
        return confessions.length;
    }
    
    function getConfessionTimestamp(uint256 _confessionId) external view returns (uint256) {
        require(_confessionId < confessions.length, "Invalid ID");
        return confessions[_confessionId].timestamp;
    }
}
