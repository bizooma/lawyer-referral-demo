import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useComplianceProfile } from "@/hooks/useComplianceConfig";
import { PRACTICE_AREAS, LANGUAGES } from "@/hooks/useProductionMatching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = ["all", "new", "pending_match", "matched", "referred", "closed", "cancelled"];

export default function AppIntakes() {
  const { activeOrgId } = useAuth();
  const { canCreateIntakes, loading: complianceLoading, profile } = useComplianceProfile(activeOrgId);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ackDisclosures, setAckDisclosures] = useState(false);
  const [form, setForm] = useState<any>({
    caller_name: "", caller_phone: "", caller_email: "",
    area_of_law: "family_law", county: "", language_preference: "English",
    narrative: "", urgency: "normal",
  });

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    let q = supabase.from("intakes").select("*").eq("organization_id", activeOrgId).order("created_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status as any);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setIntakes(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeOrgId, status]);

  const submit = async () => {
    if (!activeOrgId) return;
    if (!form.caller_name || !form.county || !form.area_of_law) {
      toast.error("Name, area of law, and county are required.");
      return;
    }
    const disclosures = profile?.config?.disclosures ?? [];
    const hasRequired = disclosures.some((d: any) => d.required !== false);
    if (hasRequired && !ackDisclosures) {
      toast.error("You must confirm required consumer disclosures were provided.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.rpc("create_intake", {
      _org_id: activeOrgId,
      _caller_name: form.caller_name,
      _caller_phone: form.caller_phone || null,
      _caller_email: form.caller_email || null,
      _area_of_law: form.area_of_law,
      _county: form.county,
      _language_preference: form.language_preference,
      _narrative: form.narrative || null,
      _urgency: form.urgency,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Intake created");
    setOpen(false);
    setAckDisclosures(false);
    setForm({ caller_name: "", caller_phone: "", caller_email: "", area_of_law: "family_law", county: "", language_preference: "English", narrative: "", urgency: "normal" });
    load();
  };

  const disclosures = profile?.config?.disclosures ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intakes</h1>
          <p className="text-muted-foreground mt-1">Manage prospective client intakes.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!canCreateIntakes && !complianceLoading}>
          <Plus className="h-4 w-4 mr-2" /> New Intake
        </Button>
      </div>

      {!complianceLoading && !canCreateIntakes && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Intake creation is blocked</p>
            <p className="text-sm text-amber-800">Your compliance profile must be attested before creating public intakes.</p>
          </div>
          <Link to="/app/compliance"><Button size="sm">Set up compliance</Button></Link>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Intakes ({intakes.length})</CardTitle>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>)}</SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading…</p> :
            intakes.length === 0 ? <p className="text-muted-foreground">No intakes yet.</p> :
            <ul className="divide-y">
              {intakes.map((i) => (
                <li key={i.id}>
                  <Link to={`/app/intakes/${i.id}`} className="py-3 flex items-center justify-between hover:bg-muted/40 -mx-2 px-2 rounded">
                    <div>
                      <p className="font-medium">{i.caller_name} <span className="text-xs text-muted-foreground">· {i.intake_number}</span></p>
                      <p className="text-sm text-muted-foreground">
                        {i.area_of_law.replace(/_/g," ")} · {i.county} · {new Date(i.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{i.status.replace(/_/g," ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          }
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>New Intake</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Client name*</Label><Input value={form.caller_name} onChange={(e) => setForm({ ...form, caller_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.caller_phone} onChange={(e) => setForm({ ...form, caller_phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.caller_email} onChange={(e) => setForm({ ...form, caller_email: e.target.value })} /></div>
            <div className="space-y-2"><Label>County*</Label><Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} /></div>
            <div className="space-y-2"><Label>Area of Law*</Label>
              <Select value={form.area_of_law} onValueChange={(v) => setForm({ ...form, area_of_law: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRACTICE_AREAS.map(p => <SelectItem key={p} value={p}>{p.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Preferred Language</Label>
              <Select value={form.language_preference} onValueChange={(v) => setForm({ ...form, language_preference: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2"><Label>Matter Narrative</Label>
              <Textarea rows={4} value={form.narrative} onChange={(e) => setForm({ ...form, narrative: e.target.value })} /></div>

            {disclosures.length > 0 && (
              <div className="md:col-span-2 border rounded-md p-3 bg-muted/30 space-y-2">
                <p className="text-sm font-medium">Required consumer disclosures</p>
                {disclosures.map((d: any, idx: number) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {d.title && <span className="font-medium text-foreground">{d.title}: </span>}{d.body}
                  </div>
                ))}
                <label className="flex items-center gap-2 pt-1 text-sm">
                  <input type="checkbox" checked={ackDisclosures} onChange={(e) => setAckDisclosures(e.target.checked)} />
                  I confirm the required disclosures were provided to the client.
                </label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !canCreateIntakes}>{saving ? "Saving…" : "Create Intake"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
