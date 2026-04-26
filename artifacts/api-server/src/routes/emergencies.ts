import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { emergenciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const serializeEmergency = (e: typeof emergenciesTable.$inferSelect) => ({
  ...e,
  createdAt: e.createdAt.toISOString(),
  resolvedAt: e.resolvedAt ? e.resolvedAt.toISOString() : null,
});

router.get("/emergencies", async (req, res) => {
  const { status } = req.query as { status?: string };

  let emergencies;
  if (status && (status === "Active" || status === "Resolved")) {
    emergencies = await db
      .select()
      .from(emergenciesTable)
      .where(eq(emergenciesTable.status, status));
  } else {
    emergencies = await db.select().from(emergenciesTable);
  }

  res.json(emergencies.map(serializeEmergency));
});

router.post("/emergencies", async (req, res) => {
  const {
    description,
    priority,
    location,
    requiredSkills,
    assignedVolunteers,
    reason,
    estimatedResponseTime,
  } = req.body as {
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    location?: string;
    requiredSkills?: string[];
    assignedVolunteers?: string[];
    reason?: string;
    estimatedResponseTime?: string;
  };

  const [emergency] = await db
    .insert(emergenciesTable)
    .values({
      description,
      priority,
      location,
      requiredSkills: requiredSkills ?? [],
      assignedVolunteers: assignedVolunteers ?? [],
      reason,
      estimatedResponseTime,
    })
    .returning();

  res.status(201).json(serializeEmergency(emergency!));
});

router.get("/emergencies/:id", async (req, res) => {
  const { id } = req.params;
  const [emergency] = await db
    .select()
    .from(emergenciesTable)
    .where(eq(emergenciesTable.id, id));

  if (!emergency) {
    res.status(404).json({ error: "Emergency not found" });
    return;
  }

  res.json(serializeEmergency(emergency));
});

router.patch("/emergencies/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: "Active" | "Resolved" };

  const [emergency] = await db
    .update(emergenciesTable)
    .set({
      status,
      resolvedAt: status === "Resolved" ? new Date() : null,
    })
    .where(eq(emergenciesTable.id, id))
    .returning();

  if (!emergency) {
    res.status(404).json({ error: "Emergency not found" });
    return;
  }

  res.json(serializeEmergency(emergency));
});

export default router;
