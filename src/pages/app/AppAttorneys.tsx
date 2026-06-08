import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Attorney {
  id: string;
  name: string;
  firm_name: string | null;
  email: string;
  bar_number: string;
}

export default function AppAttorneys() {
  const { activeOrgId, activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", firm_name: "", email: "", bar_number: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("attorneys")
      .select("id, name, firm_name, email, bar_number")
      .eq("organization_id", activeOrgId)
      .order("name");
    if (error) toast.error(error.message);
    else setAttorneys(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSaving(true);
    const { error } = await supabase.from("attorneys").insert({
      ...form,
      organization_id: activeOrgId,
      practice_areas: [],
      counties: [],
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({ name: "", firm_name: "", email: "", bar_number: "" });
    toast.success("Attorney added");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attorneys</h1>
        <p className="text-muted-foreground mt-1">
          Manage the attorneys on your referral panel.
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Add Attorney</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm">Firm</Label>
                <Input id="firm" value={form.firm_name} onChange={(e) => setForm({ ...form, firm_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bar">Bar Number</Label>
                <Input id="bar" required value={form.bar_number} onChange={(e) => setForm({ ...form, bar_number: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Add Attorney"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Panel ({attorneys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : attorneys.length === 0 ? (
            <p className="text-muted-foreground">No attorneys yet.</p>
          ) : (
            <ul className="divide-y">
              {attorneys.map((a) => (
                <li key={a.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.firm_name ? `${a.firm_name} · ` : ""}
                      {a.email} · Bar #{a.bar_number}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
