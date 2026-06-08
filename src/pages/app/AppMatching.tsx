import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Rule {
  id: string;
  rule_name: string;
  description: string | null;
  weight: number;
  is_active: boolean | null;
}

export default function AppMatching() {
  const { activeOrgId } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) return;
    supabase
      .from("matching_rules")
      .select("id, rule_name, description, weight, is_active")
      .eq("organization_id", activeOrgId)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setRules(data ?? []);
        setLoading(false);
      });
  }, [activeOrgId]);

  const toggle = async (rule: Rule) => {
    const { error } = await supabase
      .from("matching_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", rule.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRules((rs) => rs.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matching Rules</h1>
        <p className="text-muted-foreground mt-1">
          Toggle the rules that influence attorney matching for this organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rules ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : rules.length === 0 ? (
            <p className="text-muted-foreground">No rules configured yet.</p>
          ) : (
            <ul className="space-y-3">
              {rules.map((r) => (
                <li key={r.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex-1">
                    <p className="font-medium">{r.rule_name}</p>
                    {r.description && (
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-bold">
                        {r.weight > 0 ? "+" : ""}
                        {r.weight}
                      </p>
                    </div>
                    <Switch checked={!!r.is_active} onCheckedChange={() => toggle(r)} />
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
