import { ethers } from 'ethers';
import contractData from '../compiled/ConfessionsContract.json' assert { type: 'json' };

export const CONTRACT_ABI = contractData.abi;

// Get contract address from environment (set after deployment)
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

export interface ContractConfession {
  hash: string;
  sentiment: bigint;
  timestamp: bigint;
  submitter: string;
}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not set. Please deploy the contract first.');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function submitConfessionToChain(
  signer: ethers.Signer,
  hash: string,
  sentiment: number
): Promise<ethers.TransactionReceipt | null> {
  const contract = getContract(signer);
  
  // Convert hash to bytes32
  const hashBytes = ethers.id(hash);
  
  // Submit transaction
  const tx = await contract.submitConfession(hashBytes, sentiment);
  
  // Wait for confirmation
  return await tx.wait();
}

export async function getConfessionFromChain(
  provider: ethers.Provider,
  id: number
): Promise<ContractConfession> {
  const contract = getContract(provider);
  const confession = await contract.getConfession(id);
  
  return {
    hash: confession.hash,
    sentiment: confession.sentiment,
    timestamp: confession.timestamp,
    submitter: confession.submitter,
  };
}

export async function getConfessionCount(provider: ethers.Provider): Promise<number> {
  const contract = getContract(provider);
  const count = await contract.getConfessionCount();
  return Number(count);
}

export async function getUserConfessions(
  provider: ethers.Provider,
  userAddress: string
): Promise<number[]> {
  const contract = getContract(provider);
  const confessionIds = await contract.getUserConfessions(userAddress);
  return confessionIds.map((id: bigint) => Number(id));
}
