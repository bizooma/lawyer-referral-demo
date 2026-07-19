import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useMyReferrals } from "@/hooks/useMyAttorney";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Phone, Mail, MapPin } from "lucide-react";

const OUTCOMES = ["accepted", "contacted", "declined", "closed"] as const;

export default function AttorneyReferrals() {
  const { data: referrals = [], isLoading } = useMyReferrals();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [status, setStatus] = useState<string>("accepted");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const open = (r: any) => { setEditing(r); setStatus(r.status ?? "accepted"); setNotes(r.notes ?? ""); };

  const submit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await (supabase as any).rpc("respond_to_referral", {
      _referral_id: editing.id, _status: status, _notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Response recorded");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["my-referrals"] });
  };

  const shown = filter === "all" ? referrals : referrals.filter((r: any) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Referrals</h1>
          <p className="text-muted-foreground mt-1">Clients referred to you by the bar.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {OUTCOMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            <SelectItem value="pending">pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> :
        shown.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No referrals to show.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {shown.map((r: any) => (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{r.intake?.caller_name ?? "Client"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {r.intake?.intake_number} · {r.intake?.area_of_law?.replace(/_/g, " ")} · <MapPin className="inline h-3 w-3" /> {r.intake?.county}
                        {r.created_at && ` · ${format(new Date(r.created_at), "PP")}`}
                      </p>
                    </div>
                    <Badge>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.intake?.narrative && <p className="text-sm text-muted-foreground line-clamp-3">{r.intake.narrative}</p>}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {r.intake?.caller_phone && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-4 w-4" /> {r.intake.caller_phone}</span>}
                    {r.intake?.caller_email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-4 w-4" /> {r.intake.caller_email}</span>}
                    {r.intake?.urgency === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => { open(r); setStatus("accepted"); }}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => { open(r); setStatus("contacted"); }}>Mark Contacted</Button>
                    <Button size="sm" variant="outline" onClick={() => { open(r); setStatus("closed"); }}>Close</Button>
                    <Button size="sm" variant="destructive" onClick={() => { open(r); setStatus("declined"); }}>Decline</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update referral</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OUTCOMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
