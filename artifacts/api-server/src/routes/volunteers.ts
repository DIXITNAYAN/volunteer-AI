import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { volunteersTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/volunteers", async (req, res) => {
  const { search, available, skill } = req.query as {
    search?: string;
    available?: string;
    skill?: string;
  };

  let query = db.select().from(volunteersTable).$dynamic();

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(volunteersTable.name, `%${search}%`),
        sql`EXISTS (SELECT 1 FROM unnest(${volunteersTable.skills}) s WHERE lower(s) LIKE lower(${`%${search}%`}))`
      )
    );
  }

  if (available !== undefined) {
    conditions.push(eq(volunteersTable.available, available === "true"));
  }

  if (skill) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM unnest(${volunteersTable.skills}) s WHERE lower(s) = lower(${skill}))`
    );
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const volunteers = await query;
  res.json(
    volunteers.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }))
  );
});

router.post("/volunteers", async (req, res) => {
  const { name, email, phone, skills, available, location } = req.body as {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    available?: boolean;
    location?: string;
  };

  const [volunteer] = await db
    .insert(volunteersTable)
    .values({
      name,
      email,
      phone,
      skills: skills ?? [],
      available: available ?? true,
      location,
    })
    .returning();

  res.status(201).json({
    ...volunteer,
    createdAt: volunteer!.createdAt.toISOString(),
    updatedAt: volunteer!.updatedAt.toISOString(),
  });
});

router.get("/volunteers/:id", async (req, res) => {
  const { id } = req.params;
  const [volunteer] = await db
    .select()
    .from(volunteersTable)
    .where(eq(volunteersTable.id, id));

  if (!volunteer) {
    res.status(404).json({ error: "Volunteer not found" });
    return;
  }

  res.json({
    ...volunteer,
    createdAt: volunteer.createdAt.toISOString(),
    updatedAt: volunteer.updatedAt.toISOString(),
  });
});

router.put("/volunteers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, skills, available, location } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    available?: boolean;
    location?: string;
  };

  const [volunteer] = await db
    .update(volunteersTable)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(skills !== undefined && { skills }),
      ...(available !== undefined && { available }),
      ...(location !== undefined && { location }),
      updatedAt: new Date(),
    })
    .where(eq(volunteersTable.id, id))
    .returning();

  if (!volunteer) {
    res.status(404).json({ error: "Volunteer not found" });
    return;
  }

  res.json({
    ...volunteer,
    createdAt: volunteer.createdAt.toISOString(),
    updatedAt: volunteer.updatedAt.toISOString(),
  });
});

router.delete("/volunteers/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db
    .delete(volunteersTable)
    .where(eq(volunteersTable.id, id))
    .returning({ id: volunteersTable.id });

  if (result.length === 0) {
    res.status(404).json({ error: "Volunteer not found" });
    return;
  }

  res.json({ success: true });
});

router.patch("/volunteers/:id/availability", async (req, res) => {
  const { id } = req.params;
  const { available } = req.body as { available: boolean };

  const [volunteer] = await db
    .update(volunteersTable)
    .set({ available, updatedAt: new Date() })
    .where(eq(volunteersTable.id, id))
    .returning();

  if (!volunteer) {
    res.status(404).json({ error: "Volunteer not found" });
    return;
  }

  res.json({
    ...volunteer,
    createdAt: volunteer.createdAt.toISOString(),
    updatedAt: volunteer.updatedAt.toISOString(),
  });
});

export default router;
