import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku"),
  name: text("name").notNull(),
  price: numeric("price"),
  url: text("url"),
  image: text("image"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Queries table
export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  query: text("query").notNull(),
  results: jsonb("results"),
  latencyMs: integer("latency_ms"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
});

export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;

// Shared types for API
export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface ProductData {
  name: string;
  price?: number;
  image?: string;
  url: string;
  sku?: string;
  source?: string;
}
