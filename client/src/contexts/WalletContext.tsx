import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: (address: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem("walletAddress");
  });
  
  const isConnected = !!address;

  const connect = (newAddress: string) => {
    setAddress(newAddress);
    localStorage.setItem("walletAddress", newAddress);
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("walletAddress");
  };


  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
