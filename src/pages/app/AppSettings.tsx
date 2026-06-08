import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AppSettings() {
  const { activeOrgId, activeMembership, refreshMemberships } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";

  const [form, setForm] = useState({
    name: "",
    primary_color: "#1e3a5f",
    contact_email: "",
    contact_phone: "",
    disclaimer_text: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeOrgId) return;
    supabase
      .from("organizations")
      .select("name, primary_color, contact_email, contact_phone, disclaimer_text, logo_url")
      .eq("id", activeOrgId)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data) {
          setForm({
            name: data.name ?? "",
            primary_color: data.primary_color ?? "#1e3a5f",
            contact_email: data.contact_email ?? "",
            contact_phone: data.contact_phone ?? "",
            disclaimer_text: data.disclaimer_text ?? "",
            logo_url: data.logo_url ?? "",
          });
        }
        setLoading(false);
      });
  }, [activeOrgId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSaving(true);
    const { error } = await supabase.from("organizations").update(form).eq("id", activeOrgId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Organization branding and contact info. Used across your referral portal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>White-label your tenant.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={save} className="space-y-4">
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
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" placeholder="https://…" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input id="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: form.primary_color }} />
                </div>
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
