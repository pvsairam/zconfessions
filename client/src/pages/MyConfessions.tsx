import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import type { Confession } from "@shared/schema";

export default function MyConfessions() {
  const { address: walletAddress } = useWallet();
  
  const { data: myConfessions, isLoading } = useQuery<Confession[]>({
    queryKey: ["/api/confessions/me", walletAddress || "disconnected"],
    queryFn: async () => {
      if (!walletAddress) return [];
      const response = await fetch(`/api/confessions/me?walletAddress=${walletAddress}`);
      if (!response.ok) throw new Error("Failed to fetch confessions");
      return response.json();
    },
    staleTime: 0,
  });

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title="My Confessions"
        subtitle="Your encrypted secrets"
        icon={<UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
      />

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {!walletAddress ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center justify-center py-20 px-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-6 border border-primary/10">
                <Lock className="w-8 h-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight" data-testid="text-connect-wallet">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground/80 text-center max-w-xs text-[15px] leading-relaxed">
                Connect your wallet from the Feed page to view your confessions
              </p>
            </motion.div>
          ) : isLoading ? (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              ))}
            </>
          ) : myConfessions && myConfessions.length > 0 ? (
            myConfessions.map((confession, index) => (
              <ConfessionCard
                key={confession.id}
                confession={confession}
                index={index}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center justify-center py-20 px-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-6 border border-primary/10">
                <UserCircle className="w-8 h-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight" data-testid="text-no-confessions">
                No confessions yet
              </h3>
              <p className="text-muted-foreground/80 text-center max-w-xs text-[15px] leading-relaxed">
                You haven't made any confessions yet. Start sharing anonymously!
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
