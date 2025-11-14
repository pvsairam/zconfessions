import { initSDK, createInstance, FhevmInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/web';
import { ethers } from 'ethers';

let fhevmInstance: FhevmInstance | null = null;
let sdkInitialized = false;

export async function initializeFHE(): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    // Step 1: Initialize WASM (only once)
    if (!sdkInitialized) {
      console.log('Initializing FHE WASM...');
      await initSDK();
      sdkInitialized = true;
      console.log('WASM initialized successfully');
    }
    
    // Step 2: Create instance
    console.log('Creating FHEVM instance...');
    console.log('window.ethereum available:', !!window.ethereum);
    
    // Use latest Sepolia config with updated relayer URL
    const config = { 
      ...SepoliaConfig,
      network: window.ethereum,
      relayerUrl: 'https://relayer.testnet.zama.cloud', // Updated from .org to .cloud
      gatewayChainId: 55815, // Updated gateway chain ID
    };
    
    console.log('Using config:', JSON.stringify({ ...config, network: '(window.ethereum)' }, null, 2));
    
    fhevmInstance = await createInstance(config);
    
    console.log('FHEVM instance created successfully!');
    
    return fhevmInstance;
  } catch (error: any) {
    console.error('Failed to initialize FHEVM:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw new Error(`Failed to initialize FHE encryption: ${error?.message || 'Unknown error'}`);
  }
}

export async function getFHEVM(): Promise<FhevmInstance> {
  if (!fhevmInstance) {
    return await initializeFHE();
  }
  return fhevmInstance;
}

export async function encryptConfession(
  message: string,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> {
  try {
    const instance = await getFHEVM();
    
    // Create encrypted input
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    
    // Convert message to BigInt (limited to 32 bytes)
    const messageBytes = ethers.toUtf8Bytes(message);
    const truncatedBytes = messageBytes.slice(0, 32);
    
    // Convert bytes to BigInt
    let messageBigInt = BigInt(0);
    for (let i = 0; i < truncatedBytes.length; i++) {
      messageBigInt = (messageBigInt << BigInt(8)) | BigInt(truncatedBytes[i]);
    }
    
    // Add uint256 to encrypted input
    input.add256(messageBigInt);
    
    // Generate encrypted data and proof
    const encryptedData = await input.encrypt();
    
    // Convert handles and proof to hex strings
    const handle = ethers.hexlify(encryptedData.handles[0]);
    const proof = ethers.hexlify(encryptedData.inputProof);
    
    return {
      handle,
      proof,
    };
  } catch (error: any) {
    console.error('FHE encryption failed:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw new Error(`Failed to encrypt message: ${error?.message || 'Unknown error'}`);
  }
}
