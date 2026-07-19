import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { runMatching, ScoredAttorney } from "@/hooks/useProductionMatching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Send } from "lucide-react";

export default function AppIntakeDetail() {
  const { id } = useParams();
  const { activeOrgId } = useAuth();
  const [intake, setIntake] = useState<any>(null);
  const [assigned, setAssigned] = useState<any>(null);
  const [matches, setMatches] = useState<ScoredAttorney[] | null>(null);
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    const { data, error } = await supabase.from("intakes").select("*").eq("id", id).maybeSingle();
    if (error) return toast.error(error.message);
    setIntake(data);
    if (data?.assigned_attorney_id) {
      const { data: a } = await supabase.from("attorneys").select("*").eq("id", data.assigned_attorney_id).maybeSingle();
      setAssigned(a);
    } else {
      setAssigned(null);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const runMatch = async () => {
    if (!activeOrgId || !intake) return;
    setRunning(true);
    try {
      const res = await runMatching(activeOrgId, intake);
      setMatches(res);
    } finally { setRunning(false); }
  };

  const sendReferral = async (attorneyId: string) => {
    if (!intake) return;
    setSending(attorneyId);
    const { error } = await supabase.rpc("send_referral", { _intake_id: intake.id, _attorney_id: attorneyId });
    setSending(null);
    if (error) return toast.error(error.message);
    toast.success("Referral sent");
    setMatches(null);
    load();
  };

  if (!intake) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link to="/app/intakes" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to intakes
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{intake.caller_name}</h1>
        <p className="text-muted-foreground">{intake.intake_number} · <span className="capitalize">{intake.status.replace(/_/g," ")}</span></p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Phone:</span> {intake.caller_phone || "—"}</p>
            <p><span className="text-muted-foreground">Email:</span> {intake.caller_email || "—"}</p>
            <p><span className="text-muted-foreground">Language:</span> {intake.language_preference}</p>
            <p><span className="text-muted-foreground">Urgency:</span> {intake.urgency}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Matter</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Area of law:</span> {intake.area_of_law.replace(/_/g," ")}</p>
            <p><span className="text-muted-foreground">County:</span> {intake.county}</p>
            <p className="pt-2 whitespace-pre-wrap">{intake.narrative || "No narrative provided."}</p>
          </CardContent>
        </Card>
      </div>

      {assigned && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assigned Attorney</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{assigned.name}</p>
            <p className="text-muted-foreground">{assigned.firm_name || ""} · {assigned.email}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Matching</CardTitle>
          <Button onClick={runMatch} disabled={running}>
            <Sparkles className="h-4 w-4 mr-2" /> {running ? "Running…" : "Run Matching"}
          </Button>
        </CardHeader>
        <CardContent>
          {matches === null ? (
            <p className="text-muted-foreground text-sm">Run matching to see ranked attorneys for this intake.</p>
          ) : matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">No eligible attorneys found.</p>
          ) : (
            <ul className="divide-y">
              {matches.map((m) => (
                <li key={m.attorney.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{m.attorney.name} <span className="text-xs text-muted-foreground">({m.score} pts)</span></p>
                    <p className="text-xs text-muted-foreground">
                      Practice {m.breakdown.practiceArea} · County {m.breakdown.county} · Language {m.breakdown.language} · Capacity {m.breakdown.capacity} · Exclusion {m.breakdown.exclusion}
                    </p>
                    <p className="text-xs text-muted-foreground">Active load: {m.attorney.active_count}/{m.attorney.max_active_referrals ?? "∞"}</p>
                  </div>
                  <Button size="sm" onClick={() => sendReferral(m.attorney.id)} disabled={sending === m.attorney.id}>
                    <Send className="h-3.5 w-3.5 mr-2" /> {sending === m.attorney.id ? "Sending…" : "Send Referral"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
