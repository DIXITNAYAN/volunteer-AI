import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { emergenciesTable, volunteersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

router.post("/emergency/analyze", async (req, res) => {
  const { description, location } = req.body as {
    description: string;
    location?: string;
  };

  const volunteers = await db
    .select()
    .from(volunteersTable)
    .where(eq(volunteersTable.available, true));

  const volunteerList = volunteers
    .map(
      (v) =>
        `- ${v.name} (ID: ${v.id}, Skills: ${v.skills.join(", ")}, Location: ${v.location ?? "Unknown"})`
    )
    .join("\n");

  const prompt = `You are an emergency response coordinator. Analyze the following emergency and provide structured recommendations.

Emergency Description: ${description}
${location ? `Location: ${location}` : ""}

Available Volunteers:
${volunteerList || "No volunteers currently available."}

Respond ONLY with valid JSON (no markdown, no code blocks) in this exact format:
{
  "priority": "Low" | "Medium" | "High" | "Critical",
  "required_skills": ["skill1", "skill2"],
  "assigned_volunteers": ["volunteer_id1", "volunteer_id2"],
  "reason": "Brief explanation of priority assessment and volunteer selection",
  "estimated_response_time": "e.g. 30 minutes"
}

Rules:
- priority must be exactly one of: Low, Medium, High, Critical
- assigned_volunteers must be IDs from the provided list only
- Only assign volunteers whose skills match the required skills
- required_skills should reflect what skills are needed for this emergency
- Keep reason concise (1-2 sentences)`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  let analysis: {
    priority: string;
    required_skills: string[];
    assigned_volunteers: string[];
    reason: string;
    estimated_response_time: string;
  };

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    analysis = JSON.parse(cleaned);
  } catch {
    analysis = {
      priority: "Medium",
      required_skills: [],
      assigned_volunteers: [],
      reason: "Unable to parse AI response",
      estimated_response_time: "Unknown",
    };
  }

  const [emergency] = await db
    .insert(emergenciesTable)
    .values({
      description,
      priority: analysis.priority as "Low" | "Medium" | "High" | "Critical",
      location,
      requiredSkills: analysis.required_skills ?? [],
      assignedVolunteers: analysis.assigned_volunteers ?? [],
      reason: analysis.reason,
      estimatedResponseTime: analysis.estimated_response_time,
    })
    .returning();

  res.json({
    priority: analysis.priority,
    required_skills: analysis.required_skills ?? [],
    assigned_volunteers: analysis.assigned_volunteers ?? [],
    reason: analysis.reason,
    estimated_response_time: analysis.estimated_response_time,
    emergencyId: emergency!.id,
  });
});

export default router;
