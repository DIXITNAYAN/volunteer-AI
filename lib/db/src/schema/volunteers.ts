import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const volunteersTable = pgTable("volunteers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  skills: text("skills").array().notNull().default([]),
  available: boolean("available").notNull().default(true),
  location: text("location"),
  totalAssignments: integer("total_assignments").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({
  id: true,
  totalAssignments: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVolunteerSchema = insertVolunteerSchema.partial();

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type UpdateVolunteer = z.infer<typeof updateVolunteerSchema>;
export type Volunteer = typeof volunteersTable.$inferSelect;
