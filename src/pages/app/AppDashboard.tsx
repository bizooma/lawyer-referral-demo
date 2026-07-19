import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Scale, ArrowRight, AlertTriangle } from "lucide-react";

interface Counts {
  attorneys: number;
  intakes: number;
  matchingRules: number;
}

export default function AppDashboard() {
  const { activeMembership, activeOrgId } = useAuth();
  const [counts, setCounts] = useState<Counts>({ attorneys: 0, intakes: 0, matchingRules: 0 });
  const [loading, setLoading] = useState(true);
  const [complianceReady, setComplianceReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    Promise.all([
      supabase.from("attorneys").select("id", { count: "exact", head: true }).eq("organization_id", activeOrgId),
      supabase.from("intakes").select("id", { count: "exact", head: true }).eq("organization_id", activeOrgId),
      supabase.from("matching_rules").select("id", { count: "exact", head: true }).eq("organization_id", activeOrgId),
    ]).then(([a, i, m]) => {
      setCounts({
        attorneys: a.count ?? 0,
        intakes: i.count ?? 0,
        matchingRules: m.count ?? 0,
      });
      setLoading(false);
    });
    supabase.rpc("org_is_compliance_ready", { _org_id: activeOrgId }).then(({ data }) => {
      setComplianceReady(Boolean(data));
    });
  }, [activeOrgId]);

  const cards = [
    { label: "Panel Attorneys", value: counts.attorneys, icon: Users, href: "/app/attorneys" },
    { label: "Intakes", value: counts.intakes, icon: FileText, href: "/app/attorneys" },
    { label: "Matching Rules", value: counts.matchingRules, icon: Scale, href: "/app/matching" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{activeMembership?.organization.name}</h1>
        <p className="text-muted-foreground mt-1">
          {activeMembership?.organization.is_demo
            ? "You're viewing the shared demo organization. Sign up to get your own tenant."
            : "Your bar association's referral program."}
        </p>
      </div>

      {complianceReady === false && !activeMembership?.organization.is_demo && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Compliance setup incomplete</p>
            <p className="text-sm text-amber-800">
              Complete and attest your compliance setup before accepting public intakes.
            </p>
          </div>
          <Link to="/app/compliance">
            <Button size="sm">Set up compliance</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "—" : c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Your tenant is live. Here's what to do next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">Configure your organization</p>
              <p className="text-sm text-muted-foreground">Branding, contact info, disclaimers.</p>
            </div>
            <Link to="/app/settings">
              <Button variant="outline" size="sm">
                Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">Add panel attorneys</p>
              <p className="text-sm text-muted-foreground">Build your referral panel.</p>
            </div>
            <Link to="/app/attorneys">
              <Button variant="outline" size="sm">
                Attorneys <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">Tune your matching rules</p>
              <p className="text-sm text-muted-foreground">Control how clients are matched to attorneys.</p>
            </div>
            <Link to="/app/matching">
              <Button variant="outline" size="sm">
                Rules <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
