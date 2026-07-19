import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield } from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
  is_demo: boolean;
  attorney_count: number;
  created_at: string;
}
interface Tier { code: string; name: string; max_attorneys: number | null }

export default function Platform() {
  const { user, isLoading } = useAuth();
  const [isPa, setIsPa] = useState<boolean | null>(null);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).rpc("is_platform_admin");
      setIsPa(!!data);
    })();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const [orgRes, tierRes] = await Promise.all([
      (supabase as any).rpc("list_all_orgs_for_platform"),
      supabase.from("plan_tiers").select("code, name, max_attorneys").order("sort_order"),
    ]);
    if (orgRes.error) toast.error(orgRes.error.message);
    setOrgs(orgRes.data ?? []);
    setTiers((tierRes.data as Tier[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isPa) load();
  }, [isPa]);

  const changeTier = async (orgId: string, tier: string) => {
    const { error } = await (supabase as any).rpc("set_org_plan_tier", { _org_id: orgId, _tier: tier });
    if (error) return toast.error(error.message);
    toast.success("Plan updated");
    load();
  };

  if (isLoading || isPa === null) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isPa) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-2">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Not authorized</h1>
          <p className="text-muted-foreground">This console is for platform administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Platform Console
          </h1>
          <p className="text-muted-foreground mt-1">Manage plan tiers for every organization on the platform.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Organizations</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Attorneys</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Change Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgs.map((o) => {
                    const t = tiers.find((x) => x.code === o.plan_tier);
                    const cap = t?.max_attorneys ?? null;
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <div className="font-medium">{o.name}</div>
                          <div className="text-xs text-muted-foreground">{o.slug}{o.is_demo && " · demo"}</div>
                        </TableCell>
                        <TableCell>
                          {o.attorney_count}{cap !== null ? ` / ${cap}` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t?.name ?? o.plan_tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={o.plan_tier} onValueChange={(v) => changeTier(o.id, v)}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {tiers.map((t) => (
                                <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
