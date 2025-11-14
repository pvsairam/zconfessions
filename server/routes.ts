import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfessionSchema } from "@shared/schema";
import { getConfessionsFromChain, getUserConfessionsFromChain, invalidateConfessionsCache } from "./blockchain";

const USE_BLOCKCHAIN = !!process.env.CONTRACT_ADDRESS;

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/confessions", async (req, res) => {
    try {
      // Use blockchain as data source if contract is deployed
      const confessions = USE_BLOCKCHAIN 
        ? await getConfessionsFromChain()
        : await storage.getConfessions();
      res.json(confessions);
    } catch (error) {
      console.error("Error fetching confessions:", error);
      res.status(500).json({ error: "Failed to fetch confessions" });
    }
  });

  app.get("/api/confessions/me", async (req, res) => {
    try {
      const walletAddress = req.query.walletAddress as string;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Use blockchain as data source if contract is deployed
      const confessions = USE_BLOCKCHAIN
        ? await getUserConfessionsFromChain(walletAddress)
        : await storage.getConfessionsByWallet(walletAddress);
      res.json(confessions);
    } catch (error) {
      console.error("Error fetching user confessions:", error);
      res.status(500).json({ error: "Failed to fetch confessions" });
    }
  });

  app.post("/api/confessions", async (req, res) => {
    try {
      const result = insertConfessionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid confession data",
          details: result.error.errors 
        });
      }

      // Only save to local storage if blockchain is not being used
      // When blockchain is active, data source is contract events
      if (USE_BLOCKCHAIN && result.data.txHash) {
        // Blockchain mode: just acknowledge receipt
        // Invalidate cache so next GET fetches fresh events
        invalidateConfessionsCache();
        // Actual data will be served from contract events
        res.status(201).json({ 
          message: "Confession submitted to blockchain",
          txHash: result.data.txHash 
        });
      } else {
        // Fallback mode: save to in-memory storage
        const confession = await storage.createConfession(result.data);
        res.status(201).json(confession);
      }
    } catch (error) {
      console.error("Error creating confession:", error);
      res.status(500).json({ error: "Failed to create confession" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
