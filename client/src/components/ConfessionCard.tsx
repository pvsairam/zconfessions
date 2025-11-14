import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MoodBadge } from "./MoodBadge";
import { motion } from "framer-motion";
import type { Confession } from "@shared/schema";

interface ConfessionCardProps {
  confession: Confession;
  index?: number;
}

export function ConfessionCard({ confession, index = 0 }: ConfessionCardProps) {
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.23, 1, 0.32, 1] }}
    >
      <Card
        data-testid={`card-confession-${confession.id}`}
        className="bg-card border border-card-border p-5 sm:p-6 relative overflow-hidden hover-elevate transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
              <p className="text-xs font-mono text-muted-foreground/80 truncate tracking-tight" data-testid={`text-hash-${confession.id}`}>
                {confession.hash.substring(0, 12)}...
              </p>
            </div>
          </div>
          <MoodBadge mood={confession.mood as "Sad" | "Positive" | "Neutral"} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground/90 font-medium" data-testid={`text-timestamp-${confession.id}`}>
            {formatTimestamp(confession.timestamp)}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
