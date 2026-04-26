import { useState } from "react";
import { useAnalyzeEmergency } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, AlertTriangle, Clock, Users, Wrench, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Medium: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
  High: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

type AnalysisResult = {
  priority: string;
  required_skills: string[];
  assigned_volunteers: string[];
  reason: string;
  estimated_response_time: string;
  emergencyId?: string;
};

export default function Analyze() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useAnalyzeEmergency();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      const data = await analyzeMutation.mutateAsync({
        data: {
          description: description.trim(),
          location: location.trim() || undefined,
        },
      });
      setResult(data as AnalysisResult);
    } catch {
      toast({
        title: "Analysis failed",
        description: "Could not analyze the emergency. Please try again.",
        variant: "destructive",
      });
    }
  };

  const priorityStyle = result ? PRIORITY_STYLES[result.priority] ?? PRIORITY_STYLES.Medium : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI Emergency Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Describe an emergency and let Gemini AI assess priority, required skills, and recommend volunteers.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Emergency Description *</Label>
              <textarea
                id="description"
                required
                rows={4}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe the emergency in detail — e.g. 'A gas leak has been reported in a residential building on Main Street. Multiple residents are evacuating and there is a risk of explosion.'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g. 123 Main Street, Downtown"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={analyzeMutation.isPending || !description.trim()}
              className="w-full gap-2"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Emergency
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analyzeMutation.isPending && (
        <Card className="border-primary/30">
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="font-medium text-foreground">Gemini AI is analyzing the emergency...</p>
            <p className="text-sm text-muted-foreground mt-1">Assessing priority and matching available volunteers</p>
          </CardContent>
        </Card>
      )}

      {result && !analyzeMutation.isPending && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Analysis complete — emergency recorded
          </div>

          <Card className={`border ${priorityStyle?.border}`}>
            <CardHeader className={`${priorityStyle?.bg} rounded-t-lg pb-3`}>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-base ${priorityStyle?.text}`}>
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Priority Assessment
                </CardTitle>
                <span className={`text-lg font-bold ${priorityStyle?.text}`}>
                  {result.priority}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI Reasoning</p>
                <p className="text-sm text-foreground">{result.reason}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Required Skills
                  </p>
                  {result.required_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {result.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">None identified</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Response Time
                  </p>
                  <p className="text-sm font-medium">{result.estimated_response_time}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Assigned Volunteers ({result.assigned_volunteers.length})
                </p>
                {result.assigned_volunteers.length > 0 ? (
                  <div className="space-y-1">
                    {result.assigned_volunteers.map((id) => (
                      <div key={id} className="text-sm text-foreground bg-muted px-3 py-1.5 rounded flex items-center gap-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-xs">{id}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No available volunteers matched the required skills</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setResult(null); setDescription(""); setLocation(""); }}>
              Analyze Another
            </Button>
            <Button asChild className="gap-2">
              <Link to="/emergencies">
                View Emergencies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
