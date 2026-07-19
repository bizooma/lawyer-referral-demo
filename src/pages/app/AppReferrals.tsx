import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const OUTCOMES = ["accepted", "declined", "contacted", "closed"] as const;

export default function AppReferrals() {
  const { activeOrgId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>("accepted");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("referral_responses")
      .select("*, intake:intakes(id, intake_number, caller_name, area_of_law, county), attorney:attorneys(id, name, firm_name, email)")
      .eq("organization_id", activeOrgId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeOrgId]);

  const openEdit = (r: any) => { setEditing(r); setNewStatus(r.status ?? "accepted"); setNotes(r.notes ?? ""); };
  const saveOutcome = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_referral_outcome", {
      _referral_id: editing.id, _status: newStatus, _notes: notes || null, _close_intake: false,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Referral updated");
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground mt-1">Track referral outcomes recorded by bar staff.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Referrals ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading…</p> :
            rows.length === 0 ? <p className="text-muted-foreground">No referrals yet.</p> :
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {r.attorney?.name ?? "Unknown attorney"} ← {r.intake?.caller_name ?? "Unknown client"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {r.intake?.intake_number} · {r.intake?.area_of_law?.replace(/_/g," ")} · {r.intake?.county} · Sent {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{r.status}</span>
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Update</Button>
                    {r.intake?.id && <Link to={`/app/intakes/${r.intake.id}`}><Button size="sm" variant="ghost">View Intake</Button></Link>}
                  </div>
                </li>
              ))}
            </ul>
          }
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Referral Outcome</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional close reason or details" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveOutcome} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
