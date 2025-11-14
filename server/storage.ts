import { type User, type InsertUser, type Confession, type InsertConfession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getConfessions(): Promise<Confession[]>;
  getConfessionsByWallet(walletAddress: string): Promise<Confession[]>;
  createConfession(confession: InsertConfession): Promise<Confession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private confessions: Map<string, Confession>;

  constructor() {
    this.users = new Map();
    this.confessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConfessions(): Promise<Confession[]> {
    return Array.from(this.confessions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getConfessionsByWallet(walletAddress: string): Promise<Confession[]> {
    return Array.from(this.confessions.values())
      .filter((c) => c.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = randomUUID();
    const confession: Confession = {
      ...insertConfession,
      id,
      txHash: insertConfession.txHash ?? null,
      timestamp: new Date(),
    };
    this.confessions.set(id, confession);
    return confession;
  }
}

export const storage = new MemStorage();
