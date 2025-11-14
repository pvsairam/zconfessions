# Confidential Confessions

A privacy-focused Web3 application built as a Telegram Mini App that enables users to submit anonymous confessions using Fully Homomorphic Encryption (FHE).

## Overview

Confidential Confessions leverages Zama's FHEVM v0.9 on Ethereum Sepolia testnet for true confidential computing. Users can submit encrypted confessions that are stored on-chain while maintaining complete privacy and anonymity.

## Features

- **Fully Homomorphic Encryption**: Messages encrypted using Zama's FHEVM technology
- **On-chain Privacy**: Confessions stored as encrypted `euint256` values on Sepolia
- **Anonymous Authorship**: Private verification of confession authorship
- **Telegram Mini App**: Seamless integration with Telegram's platform
- **Modern UI**: Glassmorphic design with refined typography and intentional spacing
- **MetaMask Integration**: Connect your wallet to submit confessions

## Smart Contract

**Deployed on Ethereum Sepolia:**
- Contract Address: `0x2b88d9258eAD8FF8cfEA3372B07826a7E8F72467`
- Network: Sepolia Testnet (Chain ID: 11155111)
- Explorer: [View on Etherscan](https://sepolia.etherscan.io/address/0x2b88d9258eAD8FF8cfEA3372B07826a7E8F72467)

## Technology Stack

### Frontend
- React + TypeScript
- Vite build system
- Tailwind CSS for styling
- Radix UI components
- Framer Motion animations
- TanStack Query for state management

### Backend
- Express.js
- TypeScript
- In-memory storage (upgradable to PostgreSQL)
- Drizzle ORM

### Web3 & Encryption
- Zama FHEVM v0.9
- @zama-fhe/relayer-sdk for client-side encryption
- Solidity 0.8.27
- Hardhat for smart contract development
- MetaMask wallet integration

### Telegram Integration
- Telegram Web App SDK
- Haptic feedback support
- Theme synchronization

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on port 5000.

### Smart Contract Deployment

```bash
npx hardhat deploy --network sepolia
```

## Architecture

- **Encrypted Storage**: Messages stored on-chain as `euint256` (encrypted uint256)
- **Client-side Encryption**: Uses @zama-fhe/relayer-sdk with zero-knowledge proofs
- **Public Decryption**: Messages marked publicly decryptable via `FHE.makePubliclyDecryptable()`
- **Private Verification**: Authorship verification using encrypted comparison (`FHE.eq()`)
- **Access Control**: ACL-based permissions via `FHE.allowThis()` and `FHE.allow()`

## Smart Contract Functions

```solidity
storeConfession(externalEuint256, bytes inputProof) - Store encrypted confession
verifyMyConfession(uint256 confessionId) - Verify authorship privately
getConfessionCount() - Get total number of confessions
getConfessionTimestamp(uint256 confessionId) - Get confession timestamp
```

## License

MIT

## Acknowledgments

Built with [Zama's FHEVM](https://www.zama.ai/) for fully homomorphic encryption on Ethereum.
