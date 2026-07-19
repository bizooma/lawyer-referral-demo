import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useComplianceProfile } from "@/hooks/useComplianceConfig";
import { PRACTICE_AREAS, LANGUAGES } from "@/hooks/useProductionMatching";
import { MultiCheckList } from "@/components/app/MultiCheckList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Attorney {
  id: string;
  name: string;
  firm_name: string | null;
  email: string;
  phone: string | null;
  bar_number: string;
  practice_areas: string[];
  counties: string[];
  languages: string[] | null;
  max_active_referrals: number;
  years_experience: number | null;
  insurance_carrier: string | null;
  insurance_coverage_amount: number | null;
  in_good_standing: boolean;
  is_active: boolean | null;
  capacity_status: string | null;
}

const empty = (): Partial<Attorney> => ({
  name: "",
  firm_name: "",
  email: "",
  phone: "",
  bar_number: "",
  practice_areas: [],
  counties: [],
  languages: ["English"],
  max_active_referrals: 10,
  years_experience: 0,
  insurance_carrier: "",
  insurance_coverage_amount: 0,
  in_good_standing: true,
  is_active: true,
});

export default function AppAttorneys() {
  const { activeOrgId, activeMembership } = useAuth();
  const { profile } = useComplianceProfile(activeOrgId);
  const qual = profile?.config?.attorney_qualification ?? {};
  const isAdmin = activeMembership?.role === "program_admin";

  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Attorney> | null>(null);
  const [saving, setSaving] = useState(false);
  const [countyInput, setCountyInput] = useState("");

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("attorneys")
      .select("*")
      .eq("organization_id", activeOrgId)
      .order("name");
    if (error) toast.error(error.message);
    else setAttorneys((data as Attorney[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeOrgId]);

  const openNew = () => { setEditing(empty()); setCountyInput(""); };
  const openEdit = (a: Attorney) => { setEditing({ ...a }); setCountyInput((a.counties ?? []).join(", ")); };
  const close = () => { setEditing(null); setSaving(false); };

  const validate = (a: Partial<Attorney>): string | null => {
    if (!a.name || !a.email || !a.bar_number) return "Name, email, and bar number are required.";
    if (!a.practice_areas?.length) return "Select at least one practice area.";
    if (qual.min_years_experience && (a.years_experience ?? 0) < qual.min_years_experience) {
      return `This organization requires at least ${qual.min_years_experience} years of experience.`;
    }
    if (qual.good_standing_required && !a.in_good_standing) {
      return "This organization requires attorneys to be in good standing.";
    }
    if (qual.malpractice_insurance_required) {
      if (!a.insurance_carrier?.trim()) return "Malpractice insurance carrier is required.";
      if (!a.insurance_coverage_amount || a.insurance_coverage_amount <= 0)
        return "Malpractice insurance coverage amount is required.";
      if (qual.min_coverage && a.insurance_coverage_amount < qual.min_coverage) {
        return `Minimum insurance coverage is $${qual.min_coverage.toLocaleString()}.`;
      }
    }
    return null;
  };

  const save = async () => {
    if (!editing || !activeOrgId) return;
    const err = validate(editing);
    if (err) { toast.error(err); return; }
    setSaving(true);
    const counties = countyInput.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: editing.name,
      firm_name: editing.firm_name || null,
      email: editing.email,
      phone: editing.phone || null,
      bar_number: editing.bar_number,
      practice_areas: editing.practice_areas,
      counties,
      languages: editing.languages,
      max_active_referrals: editing.max_active_referrals ?? 10,
      years_experience: editing.years_experience ?? null,
      insurance_carrier: editing.insurance_carrier || null,
      insurance_coverage_amount: editing.insurance_coverage_amount || null,
      in_good_standing: editing.in_good_standing ?? true,
      is_active: editing.is_active ?? true,
      organization_id: activeOrgId,
    };
    const q = editing.id
      ? supabase.from("attorneys").update(payload).eq("id", editing.id)
      : supabase.from("attorneys").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Attorney updated" : "Attorney added");
    close();
    load();
  };

  const remove = async (a: Attorney) => {
    if (!confirm(`Delete ${a.name}?`)) return;
    const { error } = await supabase.from("attorneys").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Attorney deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attorneys</h1>
          <p className="text-muted-foreground mt-1">Manage the attorneys on your referral panel.</p>
        </div>
        {isAdmin && (
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Attorney</Button>
        )}
      </div>

      {(qual.malpractice_insurance_required || qual.min_years_experience || qual.good_standing_required) && (
        <div className="text-sm rounded-md border bg-muted/40 p-3">
          <p className="font-medium mb-1">Compliance requirements from your jurisdiction:</p>
          <ul className="list-disc ml-5 text-muted-foreground">
            {qual.malpractice_insurance_required && (
              <li>Malpractice insurance{qual.min_coverage ? ` (min $${qual.min_coverage.toLocaleString()})` : ""}</li>
            )}
            {qual.min_years_experience && <li>Minimum {qual.min_years_experience} years of experience</li>}
            {qual.good_standing_required && <li>Must be in good standing with the bar</li>}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Panel ({attorneys.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading…</p> :
            attorneys.length === 0 ? <p className="text-muted-foreground">No attorneys yet.</p> :
            <ul className="divide-y">
              {attorneys.map((a) => (
                <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{a.name} {a.is_active === false && <span className="text-xs text-muted-foreground">(inactive)</span>}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {a.firm_name ? `${a.firm_name} · ` : ""}{a.email} · Bar #{a.bar_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(a.practice_areas ?? []).map(p => p.replace(/_/g," ")).join(", ") || "No practice areas"} · Cap: {a.max_active_referrals}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => remove(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          }
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Attorney" : "Add Attorney"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Name*</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Firm</Label>
                <Input value={editing.firm_name ?? ""} onChange={(e) => setEditing({ ...editing, firm_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email*</Label>
                <Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label>
                <Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Bar Number*</Label>
                <Input value={editing.bar_number ?? ""} onChange={(e) => setEditing({ ...editing, bar_number: e.target.value })} /></div>
              <div className="space-y-2"><Label>Years of Experience{qual.min_years_experience ? `* (min ${qual.min_years_experience})` : ""}</Label>
                <Input type="number" min={0} value={editing.years_experience ?? 0} onChange={(e) => setEditing({ ...editing, years_experience: Number(e.target.value) })} /></div>

              <div className="space-y-2 md:col-span-2"><Label>Practice Areas*</Label>
                <MultiCheckList options={PRACTICE_AREAS as any} value={editing.practice_areas ?? []}
                  onChange={(v) => setEditing({ ...editing, practice_areas: v })} columns={3} /></div>

              <div className="space-y-2 md:col-span-2"><Label>Counties served (comma-separated)</Label>
                <Textarea rows={2} value={countyInput} onChange={(e) => setCountyInput(e.target.value)} placeholder="Duval, Clay, St. Johns" /></div>

              <div className="space-y-2 md:col-span-2"><Label>Languages</Label>
                <MultiCheckList options={LANGUAGES} value={editing.languages ?? []}
                  onChange={(v) => setEditing({ ...editing, languages: v })} columns={3} /></div>

              <div className="space-y-2"><Label>Max Active Referrals</Label>
                <Input type="number" min={1} value={editing.max_active_referrals ?? 10} onChange={(e) => setEditing({ ...editing, max_active_referrals: Number(e.target.value) })} /></div>

              <div className="flex items-center gap-3 pt-6">
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <Label>Active</Label>
              </div>

              {qual.good_standing_required && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch checked={editing.in_good_standing ?? true} onCheckedChange={(v) => setEditing({ ...editing, in_good_standing: v })} />
                  <Label>Attorney is in good standing with the bar</Label>
                </div>
              )}

              {qual.malpractice_insurance_required && (
                <>
                  <div className="space-y-2"><Label>Insurance Carrier*</Label>
                    <Input value={editing.insurance_carrier ?? ""} onChange={(e) => setEditing({ ...editing, insurance_carrier: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Coverage Amount*{qual.min_coverage ? ` (min $${qual.min_coverage.toLocaleString()})` : ""}</Label>
                    <Input type="number" min={0} value={editing.insurance_coverage_amount ?? 0} onChange={(e) => setEditing({ ...editing, insurance_coverage_amount: Number(e.target.value) })} /></div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
