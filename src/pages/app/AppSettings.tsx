import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Upload, X, Lock } from "lucide-react";
import { PlanCard } from "@/components/app/PlanCard";
import { useOrgPlan, planHasFeature } from "@/hooks/useOrgPlan";
import { Link } from "react-router-dom";

type FormState = {
  name: string;
  primary_color: string;
  accent_color: string;
  contact_email: string;
  contact_phone: string;
  support_url: string;
  disclaimer_text: string;
  widget_intro: string;
  logo_url: string;
  favicon_url: string;
};

const EMPTY: FormState = {
  name: "",
  primary_color: "#1e3a5f",
  accent_color: "#3b82f6",
  contact_email: "",
  contact_phone: "",
  support_url: "",
  disclaimer_text: "",
  widget_intro: "",
  logo_url: "",
  favicon_url: "",
};

export default function AppSettings() {
  const { activeOrgId, activeMembership, refreshMemberships } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    supabase
      .from("organizations")
      .select(
        "name, primary_color, accent_color, contact_email, contact_phone, support_url, disclaimer_text, widget_intro, logo_url, favicon_url"
      )
      .eq("id", activeOrgId)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data) {
          setForm({
            name: data.name ?? "",
            primary_color: data.primary_color ?? "#1e3a5f",
            accent_color: data.accent_color ?? "#3b82f6",
            contact_email: data.contact_email ?? "",
            contact_phone: data.contact_phone ?? "",
            support_url: data.support_url ?? "",
            disclaimer_text: data.disclaimer_text ?? "",
            widget_intro: data.widget_intro ?? "",
            logo_url: data.logo_url ?? "",
            favicon_url: data.favicon_url ?? "",
          });
        }
        setLoading(false);
      });
  }, [activeOrgId]);

  const uploadFile = async (kind: "logo" | "favicon", file: File) => {
    if (!activeOrgId) return;
    setUploading(kind);
    const ext = file.name.split(".").pop() || "png";
    const path = `${activeOrgId}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("org-branding")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(null);
      return;
    }
    const { data: signed } = await supabase.storage
      .from("org-branding")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    const url = signed?.signedUrl ?? "";
    setForm((f) => ({ ...f, [kind === "logo" ? "logo_url" : "favicon_url"]: url }));
    setUploading(null);
    toast.success(`${kind === "logo" ? "Logo" : "Favicon"} uploaded`);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSaving(true);
    const { error } = await supabase.from("organizations").update(form).eq("id", activeOrgId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    refreshMemberships();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Only program administrators can edit organization settings.
        </p>
      </div>
    );
  }

  const orgTier = activeMembership?.organization.plan_tier ?? "local_bar";
  const { tier: planTier } = useOrgPlan(activeOrgId, orgTier);
  const brandingAllowed = planHasFeature(planTier, "custom_branding");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Branding & Settings</h1>
        <p className="text-muted-foreground mt-1">
          White-label your referral portal. Changes apply across your dashboard, public landing
          pages, and the embeddable intake widget.
        </p>
      </div>

      {activeOrgId && <PlanCard orgId={activeOrgId} tierCode={orgTier} />}

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Public-facing name, contact, and disclaimer.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={save} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support">Support URL</Label>
                <Input id="support" placeholder="https://…" value={form.support_url} onChange={(e) => setForm({ ...form, support_url: e.target.value })} />
              </div>

              {!brandingAllowed && (
                <div className="rounded-md border border-dashed p-4 bg-muted/40 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Custom branding is a Regional or Statewide feature</p>
                    <p className="text-muted-foreground">
                      Upload a logo/favicon and set custom colors on a higher plan.{" "}
                      <Link to="/contact" className="underline">Contact us to upgrade</Link>.
                    </p>
                  </div>
                </div>
              )}
              <fieldset disabled={!brandingAllowed} className={!brandingAllowed ? "opacity-60 pointer-events-none" : ""}>
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {form.logo_url ? (
                    <div className="relative">
                      <img src={form.logo_url} alt="Logo" className="h-16 w-auto rounded border bg-white p-2" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logo_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-32 rounded border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                      No logo
                    </div>
                  )}
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile("logo", e.target.files[0])}
                  />
                  <Button type="button" variant="outline" onClick={() => logoInput.current?.click()} disabled={uploading === "logo"}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading === "logo" ? "Uploading…" : "Upload Logo"}
                  </Button>
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  {form.favicon_url ? (
                    <div className="relative">
                      <img src={form.favicon_url} alt="Favicon" className="h-10 w-10 rounded border bg-white p-1" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, favicon_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded border border-dashed flex items-center justify-center text-[10px] text-muted-foreground">
                      None
                    </div>
                  )}
                  <input
                    ref={faviconInput}
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile("favicon", e.target.files[0])}
                  />
                  <Button type="button" variant="outline" onClick={() => faviconInput.current?.click()} disabled={uploading === "favicon"}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading === "favicon" ? "Uploading…" : "Upload Favicon"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input id="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input id="accent" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
                    <input
                      type="color"
                      value={form.accent_color}
                      onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="widget">Widget Intro Text</Label>
                <Textarea
                  id="widget"
                  rows={2}
                  placeholder="Shown above the intake form on your embedded widget."
                  value={form.widget_intro}
                  onChange={(e) => setForm({ ...form, widget_intro: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disclaimer">Legal Disclaimer</Label>
                <Textarea
                  id="disclaimer"
                  rows={4}
                  value={form.disclaimer_text}
                  onChange={(e) => setForm({ ...form, disclaimer_text: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
