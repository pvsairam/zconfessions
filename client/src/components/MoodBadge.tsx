import { Badge } from "@/components/ui/badge";
import { Smile, Frown, Meh } from "lucide-react";

interface MoodBadgeProps {
  mood: "Sad" | "Positive" | "Neutral";
}

export function MoodBadge({ mood }: MoodBadgeProps) {
  const config = {
    Sad: {
      icon: Frown,
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      testId: "badge-mood-sad",
    },
    Positive: {
      icon: Smile,
      className: "bg-green-500/20 text-green-400 border-green-500/30",
      testId: "badge-mood-positive",
    },
    Neutral: {
      icon: Meh,
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      testId: "badge-mood-neutral",
    },
  };

  const { icon: Icon, className, testId } = config[mood];

  return (
    <Badge
      data-testid={testId}
      variant="outline"
      className={`${className} flex items-center gap-1.5 px-2.5 py-1`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-semibold tracking-tight">{mood}</span>
    </Badge>
  );
}
