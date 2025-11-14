import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { AppHeader } from "@/components/AppHeader";
import { Lock, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { submitFHEConfession, waitForTransaction } from "@/lib/web3";
import { encryptConfession } from "@/lib/fhe";

export default function NewConfession() {
  const [, setLocation] = useLocation();
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address: walletAddress } = useWallet();

  const submitMutation = useMutation({
    mutationFn: async (confessionText: string) => {
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      // Check if contract is deployed
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("FHE contract not deployed. Please wait for deployment.");
      }

      const sentiment = analyzeSentiment(confessionText);
      const mood = sentiment < 3 ? "Sad" : sentiment > 5 ? "Positive" : "Neutral";

      let txHash = null;
      let confessionHash = "";

      try {
        // Step 1: Encrypt confession with FHE
        toast({
          title: "Encrypting confession...",
          description: "Using Fully Homomorphic Encryption",
        });

        const { handle, proof } = await encryptConfession(
          confessionText,
          contractAddress,
          walletAddress
        );

        // Create hash for backend storage
        const hashData = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(confessionText)
        );
        const hashArray = Array.from(new Uint8Array(hashData));
        confessionHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Step 2: Submit to blockchain
        toast({
          title: "Submitting to blockchain...",
          description: "Please confirm in your wallet",
        });

        txHash = await submitFHEConfession(handle, proof);

        toast({
          title: "Transaction sent!",
          description: "Waiting for confirmation...",
        });

        // Step 3: Wait for confirmation
        const success = await waitForTransaction(txHash);
        if (!success) {
          toast({
            title: "Transaction failed",
            description: "The blockchain transaction was not successful",
            variant: "destructive",
          });
          throw new Error("Transaction failed on-chain");
        }

        toast({
          title: "Encrypted & confirmed!",
          description: "Saving metadata...",
        });

      } catch (error: any) {
        // Check if user rejected the transaction
        if (error.code === 4001 || error.message?.includes("user rejected")) {
          toast({
            title: "Transaction cancelled",
            description: "You rejected the transaction in your wallet",
            variant: "destructive",
          });
          throw new Error("Transaction cancelled by user");
        }

        // Check for insufficient funds
        if (error.code === -32000 || error.message?.includes("insufficient funds")) {
          toast({
            title: "Insufficient funds",
            description: "You don't have enough Sepolia ETH. Get some from a faucet.",
            variant: "destructive",
          });
          throw new Error("Insufficient Sepolia ETH");
        }

        // FHE encryption error
        if (error.message?.includes("FHE") || error.message?.includes("encrypt")) {
          toast({
            title: "Encryption failed",
            description: error.message || "Failed to encrypt your confession",
            variant: "destructive",
          });
          throw error;
        }

        // Generic blockchain error
        toast({
          title: "Blockchain error",
          description: error.message || "Failed to submit transaction",
          variant: "destructive",
        });
        throw new Error(`Blockchain error: ${error.message}`);
      }

      // Save to backend
      return apiRequest("POST", "/api/confessions", {
        hash: confessionHash,
        sentiment,
        mood,
        walletAddress,
        txHash,
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["/api/confessions/me", walletAddress] });
      }
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: Error) => {
      // Don't show toast if blockchain error already showed specific toast
      if (!error.message.includes("Blockchain error") && 
          !error.message.includes("Transaction cancelled") &&
          !error.message.includes("Insufficient Sepolia ETH") &&
          !error.message.includes("Transaction failed on-chain")) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const analyzeSentiment = (text: string): number => {
    const positiveWords = ["happy", "great", "love", "amazing", "wonderful", "good", "excited"];
    const negativeWords = ["sad", "hate", "terrible", "awful", "bad", "angry", "upset"];
    
    const lowerText = text.toLowerCase();
    let score = 5;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    return Math.max(1, Math.min(10, score));
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Empty confession",
        description: "Please write something to confess",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 500) {
      toast({
        title: "Too long",
        description: "Please keep your confession under 500 characters",
        variant: "destructive",
      });
      return;
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }

    submitMutation.mutate(text);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <AppHeader
        title="New Confession"
        subtitle="Anonymous & Encrypted"
        icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
      />

      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center justify-center h-full px-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20"
              >
                <Lock className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-3 tracking-tight" data-testid="text-success-message">
                Confession Submitted
              </h2>
              <p className="text-muted-foreground/80 text-center text-[15px]">
                Your secret is encrypted and safe
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6"
            >
              <div className="rounded-xl p-5 sm:p-6 bg-card border border-card-border">
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/10">
                    <Lock className="w-4 h-4 text-primary/80" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1.5 tracking-tight text-foreground">Protected by FHE</h3>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                      Your confession is encrypted using Fully Homomorphic Encryption. 
                      Only sentiment is analyzed, never the actual text.
                    </p>
                  </div>
                </div>

                <Textarea
                  data-testid="input-confession"
                  placeholder="Share your confession anonymously..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[220px] text-base resize-none bg-background/50 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/30 placeholder:text-muted-foreground/50 leading-relaxed"
                  maxLength={500}
                />

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground/70 font-medium tabular-nums" data-testid="text-char-count">
                    {text.length}/500
                  </span>
                </div>
              </div>

              <Button
                data-testid="button-submit-confession"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !text.trim()}
                className="w-full h-14 text-base font-semibold tracking-tight"
                size="lg"
              >
                {submitMutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Lock className="w-4 h-4 mr-2.5" />
                    </motion.div>
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2.5" />
                    Submit Confession
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
