import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emergenciesTable = pgTable("emergencies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  description: text("description").notNull(),
  priority: text("priority", { enum: ["Low", "Medium", "High", "Critical"] }).notNull(),
  status: text("status", { enum: ["Active", "Resolved"] }).notNull().default("Active"),
  requiredSkills: text("required_skills").array().notNull().default([]),
  assignedVolunteers: text("assigned_volunteers").array().notNull().default([]),
  reason: text("reason"),
  estimatedResponseTime: text("estimated_response_time"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertEmergencySchema = createInsertSchema(emergenciesTable).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type Emergency = typeof emergenciesTable.$inferSelect;
