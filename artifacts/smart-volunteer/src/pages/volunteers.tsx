import { useState } from "react";
import {
  useGetVolunteers,
  useCreateVolunteer,
  useUpdateVolunteer,
  useDeleteVolunteer,
  useToggleVolunteerAvailability,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Pencil, Trash2, MapPin, Phone } from "lucide-react";

type VolunteerForm = {
  name: string;
  email: string;
  phone: string;
  skills: string;
  available: boolean;
  location: string;
};

const emptyForm = (): VolunteerForm => ({
  name: "",
  email: "",
  phone: "",
  skills: "",
  available: true,
  location: "",
});

export default function Volunteers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [availableFilter, setAvailableFilter] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<VolunteerForm>(emptyForm());

  const { data: volunteers, isLoading } = useGetVolunteers({
    search: search || undefined,
    available: availableFilter === "true" ? true : availableFilter === "false" ? false : undefined,
  });

  const createMutation = useCreateVolunteer();
  const updateMutation = useUpdateVolunteer();
  const deleteMutation = useDeleteVolunteer();
  const toggleMutation = useToggleVolunteerAvailability();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (v: NonNullable<typeof volunteers>[number]) => {
    setEditId(v.id);
    setForm({
      name: v.name,
      email: v.email,
      phone: v.phone ?? "",
      skills: v.skills.join(", "),
      available: v.available,
      location: v.location ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      available: form.available,
      location: form.location || undefined,
    };

    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: payload });
      toast({ title: "Volunteer updated" });
    } else {
      await createMutation.mutateAsync({ data: payload });
      toast({ title: "Volunteer added" });
    }
    invalidate();
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this volunteer?")) return;
    await deleteMutation.mutateAsync({ id });
    toast({ title: "Volunteer deleted" });
    invalidate();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleMutation.mutateAsync({ id, data: { available: !current } });
    invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Volunteers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your volunteer roster</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Volunteer
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          value={availableFilter ?? ""}
          onChange={(e) => setAvailableFilter(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !volunteers || volunteers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No volunteers found. Add your first volunteer!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {volunteers.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-foreground">{v.name}</p>
                      <Badge
                        variant="secondary"
                        className={
                          v.available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {v.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{v.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {v.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {v.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {v.phone}
                        </span>
                      )}
                      {v.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {v.location}
                        </span>
                      )}
                      <span>{v.totalAssignments} assignment{v.totalAssignments !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={v.available}
                      onCheckedChange={() => handleToggle(v.id, v.available)}
                      title="Toggle availability"
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Volunteer" : "Add Volunteer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated) *</Label>
              <Input
                id="skills"
                placeholder="e.g. First Aid, Firefighting, Search and Rescue"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Downtown, Zone A"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(v) => setForm({ ...form, available: v })}
              />
              <Label htmlFor="available">Available for assignment</Label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editId ? "Save Changes" : "Add Volunteer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
