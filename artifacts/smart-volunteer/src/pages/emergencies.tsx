import { useState } from "react";
import {
  useGetEmergencies,
  useCreateEmergency,
  useUpdateEmergencyStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, MapPin, Clock, CheckCircle2, Users } from "lucide-react";
import { Link } from "wouter";

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_DOT: Record<string, string> = {
  Low: "bg-green-500",
  Medium: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};

type CreateForm = {
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  location: string;
  requiredSkills: string;
  assignedVolunteers: string;
  reason: string;
  estimatedResponseTime: string;
};

const emptyForm = (): CreateForm => ({
  description: "",
  priority: "Medium",
  location: "",
  requiredSkills: "",
  assignedVolunteers: "",
  reason: "",
  estimatedResponseTime: "",
});

export default function Emergencies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm());

  const { data: emergencies, isLoading } = useGetEmergencies({
    status: statusFilter as "Active" | "Resolved" | undefined || undefined,
  });

  const createMutation = useCreateEmergency();
  const updateStatusMutation = useUpdateEmergencyStatus();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/emergencies"] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      data: {
        description: form.description,
        priority: form.priority,
        location: form.location || undefined,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        assignedVolunteers: form.assignedVolunteers.split(",").map((s) => s.trim()).filter(Boolean),
        reason: form.reason || undefined,
        estimatedResponseTime: form.estimatedResponseTime || undefined,
      },
    });
    toast({ title: "Emergency recorded" });
    invalidate();
    queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    setDialogOpen(false);
    setForm(emptyForm());
  };

  const handleResolve = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, data: { status: "Resolved" } });
    toast({ title: "Emergency resolved" });
    invalidate();
    queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emergencies</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage emergency cases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/analyze">
              <AlertTriangle className="w-4 h-4" />
              AI Analyze
            </Link>
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Emergency
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "Active", "Resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !emergencies || emergencies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No emergencies found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {emergencies.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className={`w-1 shrink-0 ${PRIORITY_DOT[e.priority] ?? "bg-gray-400"}`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{e.description}</p>
                        {e.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{e.reason}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {e.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {e.location}
                            </span>
                          )}
                          {e.estimatedResponseTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {e.estimatedResponseTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {e.assignedVolunteers.length} volunteer{e.assignedVolunteers.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {e.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {e.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                              PRIORITY_STYLES[e.priority] ?? ""
                            }`}
                          >
                            {e.priority}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              e.status === "Active"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {e.status}
                          </span>
                        </div>
                        {e.status === "Active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() => handleResolve(e.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(e.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record New Emergency</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desc">Description *</Label>
              <textarea
                id="desc"
                required
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe the emergency situation..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as CreateForm["priority"] })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Location</Label>
                <Input
                  id="loc"
                  placeholder="e.g. Downtown"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g. First Aid, Search and Rescue"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Response Time</Label>
              <Input
                id="eta"
                placeholder="e.g. 30 minutes"
                value={form.estimatedResponseTime}
                onChange={(e) => setForm({ ...form, estimatedResponseTime: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Record Emergency
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
