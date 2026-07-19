import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiCheckList } from "@/components/app/MultiCheckList";
import { PRACTICE_AREAS, LANGUAGES } from "@/hooks/useProductionMatching";
import { useMyAttorney } from "@/hooks/useMyAttorney";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AttorneyProfile() {
  const { data: attorney, isLoading } = useMyAttorney();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [countyInput, setCountyInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attorney) {
      setForm(attorney);
      setCountyInput((attorney.counties ?? []).join(", "));
    }
  }, [attorney]);

  if (isLoading || !form) return <p className="text-muted-foreground">Loading…</p>;

  const save = async () => {
    setSaving(true);
    const counties = countyInput.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await (supabase as any).rpc("update_my_attorney_profile", {
      _practice_areas: form.practice_areas,
      _counties: counties,
      _languages: form.languages,
      _phone: form.phone,
      _firm_name: form.firm_name,
      _max_active_referrals: form.max_active_referrals,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["my-attorney"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Bar-verified fields (name, email, bar number, insurance) can only be changed by your bar administrator.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Read-only (managed by the bar)</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {attorney!.name}</div>
          <div><span className="text-muted-foreground">Email:</span> {attorney!.email}</div>
          <div><span className="text-muted-foreground">Bar #:</span> {attorney!.bar_number}</div>
          <div><span className="text-muted-foreground">Years of experience:</span> {attorney!.years_experience ?? "—"}</div>
          <div><span className="text-muted-foreground">Insurance carrier:</span> {attorney!.insurance_carrier ?? "—"}</div>
          <div><span className="text-muted-foreground">Coverage:</span> {attorney!.insurance_coverage_amount ? `$${attorney!.insurance_coverage_amount.toLocaleString()}` : "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My editable profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Firm</Label>
            <Input value={form.firm_name ?? ""} onChange={(e) => setForm({ ...form, firm_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label>
            <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>

          <div className="space-y-2 md:col-span-2"><Label>Practice Areas</Label>
            <MultiCheckList options={PRACTICE_AREAS as any} value={form.practice_areas ?? []}
              onChange={(v) => setForm({ ...form, practice_areas: v })} columns={3} /></div>

          <div className="space-y-2 md:col-span-2"><Label>Counties served (comma-separated)</Label>
            <Textarea rows={2} value={countyInput} onChange={(e) => setCountyInput(e.target.value)} /></div>

          <div className="space-y-2 md:col-span-2"><Label>Languages</Label>
            <MultiCheckList options={LANGUAGES} value={form.languages ?? []}
              onChange={(v) => setForm({ ...form, languages: v })} columns={3} /></div>

          <div className="space-y-2"><Label>Max Active Referrals</Label>
            <Input type="number" min={1} value={form.max_active_referrals ?? 10}
              onChange={(e) => setForm({ ...form, max_active_referrals: Number(e.target.value) })} /></div>

          <div className="md:col-span-2">
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
