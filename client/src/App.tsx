import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { WalletProvider } from "@/contexts/WalletContext";
import Feed from "@/pages/Feed";
import NewConfession from "@/pages/NewConfession";
import MyConfessions from "@/pages/MyConfessions";
import { useEffect } from "react";

function Router() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Feed} />
          <Route path="/new" component={NewConfession} />
          <Route path="/me" component={MyConfessions} />
          <Route component={Feed} />
        </Switch>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      try {
        tg.enableClosingConfirmation();
      } catch (e) {
        console.log("Closing confirmation not supported in this Telegram version");
      }
      
      if (tg.colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
