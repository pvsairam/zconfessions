import { ethers } from 'ethers';
import contractData from '../compiled/ConfessionsContract.json' assert { type: 'json' };
import type { Confession } from '@shared/schema';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// Simple in-memory cache with TTL
interface CacheEntry {
  data: Confession[];
  timestamp: number;
}

let confessionsCache: CacheEntry | null = null;
const CACHE_TTL = 30000; // 30 seconds

// Function to invalidate cache (called after new submissions)
export function invalidateConfessionsCache() {
  confessionsCache = null;
}

export async function getConfessionsFromChain(): Promise<Confession[]> {
  if (!CONTRACT_ADDRESS) {
    return [];
  }

  // Validate DEPLOYMENT_BLOCK is set in production
  if (!process.env.DEPLOYMENT_BLOCK) {
    console.warn('WARNING: DEPLOYMENT_BLOCK not set. Defaulting to block 0. This may cause slow queries.');
  }

  // Return cached data if still fresh
  if (confessionsCache && Date.now() - confessionsCache.timestamp < CACHE_TTL) {
    return confessionsCache.data;
  }

  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractData.abi, provider);

    // Get current block
    const currentBlock = await provider.getBlockNumber();
    
    // Start from deployment block (defaults to 0 for development, but should be set in production)
    const deploymentBlock = parseInt(process.env.DEPLOYMENT_BLOCK || '0');
    const fromBlock = deploymentBlock;

    // Get ConfessionSubmitted events from recent blocks
    const filter = contract.filters.ConfessionSubmitted();
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);

    const confessions: Confession[] = [];
    const seen = new Set<string>(); // Deduplicate by on-chain ID

    for (const event of events) {
      const args = event.args;
      if (!args) continue;

      const onChainId = args[0].toString();
      const hash = args[1];
      const sentiment = Number(args[2]);
      const submitter = args[3];
      const timestamp = Number(args[4]);

      // Deduplicate using on-chain ID (stable across reorgs)
      if (seen.has(onChainId)) continue;
      seen.add(onChainId);

      // Validate sentiment range (contract should enforce this, but double-check)
      if (sentiment < 1 || sentiment > 10) {
        console.warn(`Invalid sentiment ${sentiment} in event ${onChainId}`);
        continue;
      }

      // No timestamp validation - contract enforces block.timestamp which is canonical
      // Removing artificial time windows to preserve all historical data

      // Derive mood from sentiment (same logic as frontend)
      const mood = sentiment < 3 ? "Sad" : sentiment > 5 ? "Positive" : "Neutral";

      confessions.push({
        id: onChainId,
        hash,
        sentiment,
        mood,
        walletAddress: submitter,
        txHash: event.transactionHash,
        timestamp: new Date(timestamp * 1000),
      });
    }

    // Sort by timestamp descending
    const sortedConfessions = confessions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Cache the results
    confessionsCache = {
      data: sortedConfessions,
      timestamp: Date.now(),
    };

    return sortedConfessions;
  } catch (error) {
    console.error('Error fetching confessions from blockchain:', error);
    // Return cached data if available, even if stale
    return confessionsCache?.data || [];
  }
}

export async function getUserConfessionsFromChain(walletAddress: string): Promise<Confession[]> {
  const allConfessions = await getConfessionsFromChain();
  return allConfessions.filter(
    c => c.walletAddress.toLowerCase() === walletAddress.toLowerCase()
  );
}
