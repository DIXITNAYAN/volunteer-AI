import { useGetAnalyticsSummary, useGetRecentEmergencies, useGetPriorityBreakdown, useGetSkillDemand } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle2, Zap, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-red-100 text-red-700",
  Resolved: "bg-green-100 text-green-700",
};

const PRIORITY_BADGE_COLORS: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: recent, isLoading: recentLoading } = useGetRecentEmergencies({ limit: 5 });
  const { data: priorities } = useGetPriorityBreakdown();
  const { data: skillDemand } = useGetSkillDemand();

  const priorityChartData = priorities
    ? Object.entries(priorities).map(([name, count]) => ({ name, count }))
    : [];

  const statCards = [
    {
      label: "Total Volunteers",
      value: summary?.totalVolunteers ?? 0,
      sub: `${summary?.availableVolunteers ?? 0} available`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Emergencies",
      value: summary?.activeEmergencies ?? 0,
      sub: `${summary?.criticalCases ?? 0} critical`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Resolved Cases",
      value: summary?.resolvedEmergencies ?? 0,
      sub: "all time",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg Response",
      value: summary?.avgResponseTime ?? "—",
      sub: "estimated",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of volunteer operations and emergencies</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                {summaryLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Emergency Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priorityChartData.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No emergency data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priorityChartData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityChartData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Top Skills in Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!skillDemand || skillDemand.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No skill demand data yet
              </div>
            ) : (
              <div className="space-y-3">
                {skillDemand.slice(0, 6).map((item) => {
                  const max = skillDemand[0]?.count ?? 1;
                  const pct = Math.round((item.count / max) * 100);
                  return (
                    <div key={item.skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Emergencies</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !recent || recent.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              No emergencies recorded yet
            </div>
          ) : (
            <div className="divide-y">
              {recent.map((e) => (
                <div key={e.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {e.assignedVolunteers.length} volunteer{e.assignedVolunteers.length !== 1 ? "s" : ""} assigned
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE_COLORS[e.priority] ?? ""}`}>
                      {e.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[e.status] ?? ""}`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
