import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Rule {
  id: string;
  rule_name: string;
  description: string | null;
  weight: number;
  is_active: boolean | null;
}

export default function AppMatching() {
  const { activeOrgId, activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!activeOrgId) return;
    setLoading(true);
    supabase
      .from("matching_rules")
      .select("id, rule_name, description, weight, is_active")
      .eq("organization_id", activeOrgId)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setRules(data ?? []);
        setLoading(false);
      });
  };
  useEffect(load, [activeOrgId]);

  const update = async (rule: Rule, patch: Partial<Rule>) => {
    const next = { ...rule, ...patch };
    setRules((rs) => rs.map((r) => (r.id === rule.id ? next : r)));
    const { error } = await supabase.from("matching_rules").update(patch).eq("id", rule.id);
    if (error) { toast.error(error.message); load(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matching Rules</h1>
        <p className="text-muted-foreground mt-1">
          Weights below drive the production matching engine for this organization.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Rules ({rules.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading…</p> :
            rules.length === 0 ? <p className="text-muted-foreground">No rules configured yet.</p> :
            <ul className="space-y-3">
              {rules.map((r) => (
                <li key={r.id} className="flex items-center justify-between border rounded-lg p-4 gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{r.rule_name}</p>
                    {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      {isAdmin ? (
                        <Input type="number" className="w-24" value={r.weight}
                          onChange={(e) => update(r, { weight: Number(e.target.value) })} />
                      ) : (
                        <p className="font-bold">{r.weight > 0 ? "+" : ""}{r.weight}</p>
                      )}
                    </div>
                    <Switch checked={!!r.is_active} disabled={!isAdmin}
                      onCheckedChange={(v) => update(r, { is_active: v })} />
                  </div>
                </li>
              ))}
            </ul>
          }
        </CardContent>
      </Card>
    </div>
  );
}
