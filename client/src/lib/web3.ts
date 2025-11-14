import { ethers, BrowserProvider } from 'ethers';
import contractData from './contract-abi.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getProvider();
  return await provider.getSigner();
}

export async function switchToSepolia(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (error: any) {
    // If chain not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

export async function submitFHEConfession(
  encryptedHandle: string,
  inputProof: string
): Promise<string> {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error('Contract not deployed yet. Please deploy the contract first.');
  }

  // Ensure we're on Sepolia
  await switchToSepolia();

  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, contractData.abi, signer);

  // Submit encrypted confession with proof
  const tx = await contract.storeConfession(encryptedHandle, inputProof);

  // Return transaction hash
  return tx.hash;
}

export async function waitForTransaction(txHash: string): Promise<boolean> {
  const provider = await getProvider();
  const receipt = await provider.waitForTransaction(txHash);
  return receipt?.status === 1;
}

export async function getConfessionCount(): Promise<number> {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    return 0;
  }

  const provider = await getProvider();
  const contract = new ethers.Contract(contractAddress, contractData.abi, provider);
  
  try {
    const count = await contract.getConfessionCount();
    return Number(count);
  } catch {
    return 0;
  }
}
