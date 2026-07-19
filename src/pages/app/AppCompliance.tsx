import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle, Plus, Trash2, Save } from "lucide-react";

type Jurisdiction = { id: string; code: string; name: string; template: any; template_version: number };

type Disclosure = { key: string; label: string; text: string; required: boolean };
type Config = {
  fee: {
    allowed_fee_models: string[];
    selected_fee_model: string;
    consultation_fee_cap: number | null;
    consultation_minutes: number | null;
    percentage_rate: number | null;
    flat_fee: number | null;
  };
  attorney_qualification: {
    malpractice_insurance_required: boolean;
    min_coverage: number | null;
    min_years_experience: number | null;
    good_standing_required: boolean;
    specialty_cert_required: boolean;
  };
  disclosures: Disclosure[];
  panel_types: string[];
  extras: Record<string, unknown>;
  review_required: boolean;
};

type Profile = {
  id: string;
  organization_id: string;
  jurisdiction_id: string | null;
  config: Config;
  template_version_seeded: number | null;
  status: "draft" | "attested" | "needs_reattest";
  attested_by: string | null;
  attested_at: string | null;
  attested_version: number | null;
};

const FEE_MODEL_LABELS: Record<string, string> = {
  flat_membership: "Flat membership",
  registration: "Registration fee",
  consultation_cap: "Capped consultation fee",
  percentage_of_recovery: "Percentage of recovery",
  none: "No fee",
};

const PANEL_OPTIONS = ["general", "family", "criminal", "immigration", "personal_injury", "landlord_tenant", "estate", "business", "employment"];

export default function AppCompliance() {
  const { activeOrgId, activeMembership, user } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";

  const [loading, setLoading] = useState(true);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [dirty, setDirty] = useState(false);
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [attesterName, setAttesterName] = useState<string>("");

  const jurisdiction = useMemo(
    () => jurisdictions.find((j) => j.id === profile?.jurisdiction_id) ?? null,
    [jurisdictions, profile]
  );

  useEffect(() => {
    if (!activeOrgId) return;
    (async () => {
      setLoading(true);
      const [{ data: jur }, { data: prof }] = await Promise.all([
        supabase.from("jurisdictions").select("*").order("name"),
        supabase.from("org_compliance_profiles").select("*").eq("organization_id", activeOrgId).maybeSingle(),
      ]);
      setJurisdictions((jur ?? []) as any);
      if (prof) {
        setProfile(prof as any);
        setConfig((prof as any).config);
        if ((prof as any).attested_by) {
          const { data: p } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", (prof as any).attested_by)
            .maybeSingle();
          setAttesterName((p as any)?.display_name ?? "");
        }
      } else {
        setProfile(null);
        setConfig(null);
      }
      setLoading(false);
    })();
  }, [activeOrgId]);

  const initialize = async () => {
    if (!activeOrgId || !selectedJurisdictionId) return;
    setSaving(true);
    const { error } = await supabase.rpc("initialize_compliance_profile", {
      _org_id: activeOrgId,
      _jurisdiction_id: selectedJurisdictionId,
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    const { data: prof } = await supabase
      .from("org_compliance_profiles").select("*").eq("organization_id", activeOrgId).maybeSingle();
    setProfile(prof as any);
    setConfig((prof as any).config);
    setSaving(false);
    toast.success("Compliance profile initialized. Review and attest.");
  };

  const updateConfig = (updater: (c: Config) => Config) => {
    if (!config) return;
    setConfig(updater(structuredClone(config)));
    setDirty(true);
  };

  const saveDraft = async () => {
    if (!profile || !config || !activeOrgId) return;
    setSaving(true);
    const { error } = await supabase
      .from("org_compliance_profiles")
      .update({ config: config as any, status: "draft" })
      .eq("organization_id", activeOrgId);
    if (error) {
      toast.error(error.message);
    } else {
      setProfile({ ...profile, config, status: "draft" });
      setDirty(false);
      toast.success("Saved as draft. Re-attest to activate.");
    }
    setSaving(false);
  };

  const attest = async () => {
    if (!activeOrgId) return;
    setSaving(true);
    // Save any pending edits first
    if (dirty) {
      const { error } = await supabase
        .from("org_compliance_profiles")
        .update({ config: config as any, status: "draft" })
        .eq("organization_id", activeOrgId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    const { error } = await supabase.rpc("attest_compliance_profile", { _org_id: activeOrgId });
    if (error) { toast.error(error.message); setSaving(false); return; }
    const { data: prof } = await supabase
      .from("org_compliance_profiles").select("*").eq("organization_id", activeOrgId).maybeSingle();
    setProfile(prof as any);
    setConfig((prof as any).config);
    setDirty(false);
    setAttesterName(user?.email ?? "");
    setSaving(false);
    toast.success("Compliance profile attested and activated.");
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance</CardTitle>
          <CardDescription>Only program administrators can view or modify compliance settings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // First-run: pick jurisdiction
  if (!profile) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance</h1>
          <p className="text-muted-foreground mt-1">Choose your jurisdiction to seed a compliance profile.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Select jurisdiction</CardTitle>
            <CardDescription>
              We'll seed a conservative template with placeholders you should review with counsel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedJurisdictionId} onValueChange={setSelectedJurisdictionId}>
              <SelectTrigger><SelectValue placeholder="Choose a jurisdiction" /></SelectTrigger>
              <SelectContent>
                {jurisdictions.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.name} ({j.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={initialize} disabled={!selectedJurisdictionId || saving}>
              Initialize compliance profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config) return null;

  const statusBadge = () => {
    if (dirty) return <Badge variant="destructive">Unsaved changes</Badge>;
    if (profile.status === "attested") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Attested</Badge>;
    if (profile.status === "needs_reattest") return <Badge variant="destructive">Needs re-attestation</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
  };

  const fee = config.fee;
  const showParam = (m: string) => fee.selected_fee_model === m;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Compliance {statusBadge()}
          </h1>
          <p className="text-muted-foreground mt-1">
            Jurisdiction: <strong>{jurisdiction?.name ?? "—"}</strong>
            {profile.status === "attested" && profile.attested_at && (
              <> · Attested by <strong>{attesterName || "admin"}</strong> on{" "}
                {new Date(profile.attested_at).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={!dirty || saving}>
            <Save className="h-4 w-4 mr-2" />Save draft
          </Button>
          <Button onClick={attest} disabled={saving}>
            <ShieldCheck className="h-4 w-4 mr-2" />Attest &amp; Activate
          </Button>
        </div>
      </div>

      {config.review_required && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex gap-3 text-sm text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            This template uses placeholders that <strong>must be reviewed with counsel</strong> for your jurisdiction.
            By attesting, your organization confirms these rules are correct and accepts responsibility for compliance.
          </div>
        </div>
      )}

      {/* Fee model */}
      <Card>
        <CardHeader>
          <CardTitle>Fee model</CardTitle>
          <CardDescription>How your program charges attorneys or clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selected fee model</Label>
            <Select
              value={fee.selected_fee_model}
              onValueChange={(v) => updateConfig((c) => { c.fee.selected_fee_model = v; return c; })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fee.allowed_fee_models.map((m) => (
                  <SelectItem key={m} value={m}>{FEE_MODEL_LABELS[m] ?? m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Allowed for this jurisdiction: {fee.allowed_fee_models.map((m) => FEE_MODEL_LABELS[m] ?? m).join(", ")}
            </p>
          </div>

          {(showParam("flat_membership") || showParam("registration")) && (
            <div className="space-y-2">
              <Label>Flat fee ($)</Label>
              <Input
                type="number"
                value={fee.flat_fee ?? ""}
                onChange={(e) => updateConfig((c) => { c.fee.flat_fee = e.target.value ? Number(e.target.value) : null; return c; })}
              />
            </div>
          )}

          {showParam("consultation_cap") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consultation fee cap ($)</Label>
                <Input
                  type="number"
                  value={fee.consultation_fee_cap ?? ""}
                  onChange={(e) => updateConfig((c) => { c.fee.consultation_fee_cap = e.target.value ? Number(e.target.value) : null; return c; })}
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation minutes</Label>
                <Input
                  type="number"
                  value={fee.consultation_minutes ?? ""}
                  onChange={(e) => updateConfig((c) => { c.fee.consultation_minutes = e.target.value ? Number(e.target.value) : null; return c; })}
                />
              </div>
            </div>
          )}

          {showParam("percentage_of_recovery") && (
            <div className="space-y-2">
              <Label>Percentage rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={fee.percentage_rate ?? ""}
                onChange={(e) => updateConfig((c) => { c.fee.percentage_rate = e.target.value ? Number(e.target.value) : null; return c; })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attorney qualification */}
      <Card>
        <CardHeader>
          <CardTitle>Attorney qualification</CardTitle>
          <CardDescription>Minimum bar for panel members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Malpractice insurance required</Label>
            <Switch
              checked={config.attorney_qualification.malpractice_insurance_required}
              onCheckedChange={(v) => updateConfig((c) => { c.attorney_qualification.malpractice_insurance_required = v; return c; })}
            />
          </div>
          {config.attorney_qualification.malpractice_insurance_required && (
            <div className="space-y-2">
              <Label>Minimum coverage ($)</Label>
              <Input
                type="number"
                value={config.attorney_qualification.min_coverage ?? ""}
                onChange={(e) => updateConfig((c) => { c.attorney_qualification.min_coverage = e.target.value ? Number(e.target.value) : null; return c; })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Minimum years of experience</Label>
            <Input
              type="number"
              value={config.attorney_qualification.min_years_experience ?? ""}
              onChange={(e) => updateConfig((c) => { c.attorney_qualification.min_years_experience = e.target.value ? Number(e.target.value) : null; return c; })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Good standing required</Label>
            <Switch
              checked={config.attorney_qualification.good_standing_required}
              onCheckedChange={(v) => updateConfig((c) => { c.attorney_qualification.good_standing_required = v; return c; })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Specialty certification required</Label>
            <Switch
              checked={config.attorney_qualification.specialty_cert_required}
              onCheckedChange={(v) => updateConfig((c) => { c.attorney_qualification.specialty_cert_required = v; return c; })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Disclosures */}
      <Card>
        <CardHeader>
          <CardTitle>Disclosures</CardTitle>
          <CardDescription>Shown to clients during intake and referral.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.disclosures.map((d, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Key</Label>
                  <Input
                    value={d.key}
                    onChange={(e) => updateConfig((c) => { c.disclosures[i].key = e.target.value; return c; })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Label</Label>
                  <Input
                    value={d.label}
                    onChange={(e) => updateConfig((c) => { c.disclosures[i].label = e.target.value; return c; })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Text</Label>
                <Textarea
                  value={d.text}
                  onChange={(e) => updateConfig((c) => { c.disclosures[i].text = e.target.value; return c; })}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={d.required}
                    onCheckedChange={(v) => updateConfig((c) => { c.disclosures[i].required = v; return c; })}
                  />
                  <Label>Required</Label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => updateConfig((c) => { c.disclosures.splice(i, 1); return c; })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => updateConfig((c) => {
              c.disclosures.push({ key: `disclosure_${c.disclosures.length + 1}`, label: "", text: "[Review with counsel]", required: true });
              return c;
            })}
          >
            <Plus className="h-4 w-4 mr-2" />Add disclosure
          </Button>
        </CardContent>
      </Card>

      {/* Panels */}
      <Card>
        <CardHeader>
          <CardTitle>Panels</CardTitle>
          <CardDescription>Practice-area panels this program operates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PANEL_OPTIONS.map((p) => {
              const active = config.panel_types.includes(p);
              return (
                <Button
                  key={p}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateConfig((c) => {
                    c.panel_types = active ? c.panel_types.filter((x) => x !== p) : [...c.panel_types, p];
                    return c;
                  })}
                >
                  {p.replace(/_/g, " ")}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Attesting confirms your organization has reviewed these rules for your jurisdiction and accepts responsibility
        for their accuracy and ongoing compliance. Any edits after attestation return the profile to Draft and require
        re-attestation before public intakes are accepted.
      </p>
    </div>
  );
}
