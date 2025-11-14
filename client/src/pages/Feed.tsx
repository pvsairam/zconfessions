import { useQuery } from "@tanstack/react-query";
import { WalletButton } from "@/components/WalletButton";
import { AppHeader } from "@/components/AppHeader";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Confession } from "@shared/schema";

export default function Feed() {
  const { data: confessions, isLoading } = useQuery<Confession[]>({
    queryKey: ["/api/confessions"],
  });

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title="Confessions"
        subtitle="Powered by FHE"
        icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
        rightSlot={<WalletButton />}
        titleTestId="text-app-title"
      />

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              ))}
            </>
          ) : confessions && confessions.length > 0 ? (
            confessions.map((confession, index) => (
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
                <Lock className="w-8 h-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight" data-testid="text-empty-state">
                No confessions yet
              </h3>
              <p className="text-muted-foreground/80 text-center max-w-xs text-[15px] leading-relaxed">
                Be the first to share an anonymous confession. Your privacy is protected by encryption.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
