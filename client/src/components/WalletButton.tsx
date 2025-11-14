import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";

interface WalletButtonProps {
  onConnect?: (address: string) => void;
}

export function WalletButton({ onConnect }: WalletButtonProps) {
  const { address, isConnected, connect, disconnect: contextDisconnect } = useWallet();
  const [showDialog, setShowDialog] = useState(false);

  const handleConnect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to connect your wallet");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sepoliaChainId = "0xaa36a7";
      
      if (chainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            alert("Please add Sepolia network to MetaMask");
          }
          return;
        }
      }

      const userAddress = accounts[0];
      connect(userAddress);
      setShowDialog(false);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      }
      
      onConnect?.(userAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = () => {
    contextDisconnect();
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs font-semibold bg-primary/5 border-primary/20 text-primary">
            Sepolia
          </Badge>
          <Button
            data-testid="button-wallet-connected"
            variant="outline"
            size="sm"
            onClick={() => setShowDialog(true)}
            className="font-mono text-xs tracking-tight"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            {truncateAddress(address)}
          </Button>
        </div>
      ) : (
        <Button
          data-testid="button-connect-wallet"
          onClick={handleConnect}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5" />
          Connect
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card/98 backdrop-blur-md border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 tracking-tight">
              <Wallet className="w-5 h-5 text-primary" />
              Wallet Connected
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              You're connected to Sepolia testnet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-muted-foreground/70 mb-2">Address</p>
              <p className="font-mono text-sm tracking-tight" data-testid="text-wallet-address">{address}</p>
            </div>
            <Button
              data-testid="button-disconnect-wallet"
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full font-semibold"
            >
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
