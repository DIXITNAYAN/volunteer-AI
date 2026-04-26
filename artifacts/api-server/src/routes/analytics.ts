import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { emergenciesTable, volunteersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res) => {
  const [volStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      available: sql<number>`count(*) filter (where ${volunteersTable.available})::int`,
    })
    .from(volunteersTable);

  const [emStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${emergenciesTable.status} = 'Active')::int`,
      resolved: sql<number>`count(*) filter (where ${emergenciesTable.status} = 'Resolved')::int`,
      critical: sql<number>`count(*) filter (where ${emergenciesTable.priority} = 'Critical' and ${emergenciesTable.status} = 'Active')::int`,
    })
    .from(emergenciesTable);

  res.json({
    totalVolunteers: volStats?.total ?? 0,
    availableVolunteers: volStats?.available ?? 0,
    totalEmergencies: emStats?.total ?? 0,
    activeEmergencies: emStats?.active ?? 0,
    resolvedEmergencies: emStats?.resolved ?? 0,
    avgResponseTime: "~2 hrs",
    criticalCases: emStats?.critical ?? 0,
  });
});

router.get("/analytics/recent-emergencies", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "5")), 50);

  const emergencies = await db
    .select()
    .from(emergenciesTable)
    .orderBy(desc(emergenciesTable.createdAt))
    .limit(limit);

  res.json(
    emergencies.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      resolvedAt: e.resolvedAt ? e.resolvedAt.toISOString() : null,
    }))
  );
});

router.get("/analytics/priority-breakdown", async (_req, res) => {
  const rows = await db
    .select({
      priority: emergenciesTable.priority,
      count: sql<number>`count(*)::int`,
    })
    .from(emergenciesTable)
    .groupBy(emergenciesTable.priority);

  const breakdown: Record<string, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  for (const row of rows) {
    breakdown[row.priority] = row.count;
  }

  res.json(breakdown);
});

router.get("/analytics/skill-demand", async (_req, res) => {
  const rows = await db
    .select({
      skill: sql<string>`unnest(${emergenciesTable.requiredSkills})`,
    })
    .from(emergenciesTable);

  const countMap = new Map<string, number>();
  for (const row of rows) {
    countMap.set(row.skill, (countMap.get(row.skill) ?? 0) + 1);
  }

  const result = Array.from(countMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json(result);
});

export default router;
