import { Home, Plus, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Feed", testId: "nav-feed" },
    { path: "/new", icon: Plus, label: "New", testId: "nav-new" },
    { path: "/me", icon: User, label: "Me", testId: "nav-me" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-md border-t border-border/60 pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <motion.button
                data-testid={item.testId}
                onClick={() => {
                  if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
                  }
                }}
                className={`
                  flex flex-col items-center justify-center gap-1.5 min-w-[72px] h-14 rounded-lg
                  transition-all duration-200 relative px-3
                  ${isActive ? "text-primary" : "text-muted-foreground/70 hover-elevate"}
                `}
                whileTap={{ scale: 0.96 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/8 rounded-lg border border-primary/15"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-primary" : ""}`} />
                <span className={`text-[11px] font-semibold relative z-10 tracking-tight ${isActive ? "text-primary" : ""}`}>
                  {item.label}
                </span>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
