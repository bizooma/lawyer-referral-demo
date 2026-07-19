import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrgPlan } from "@/hooks/useOrgPlan";

const FEATURE_LABELS: Record<string, string> = {
  advanced_reports: "Advanced analytics & reports",
  multi_county: "Multi-county matching",
  custom_branding: "Custom branding",
  api_access: "API access",
};

export function PlanCard({ orgId, tierCode }: { orgId: string; tierCode: string }) {
  const { tier, attorneyCount, loading } = useOrgPlan(orgId, tierCode);

  if (loading || !tier) return null;

  const cap = tier.max_attorneys;
  const usagePct = cap ? Math.min(100, Math.round((attorneyCount / cap) * 100)) : 0;
  const nearCap = cap && attorneyCount / cap >= 0.9;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Plan <Badge variant="secondary">{tier.name}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {tier.features?.description || "Your organization's current plan."}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/contact">Contact us to change your plan</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Attorneys</span>
            <span className={nearCap ? "text-destructive font-medium" : "text-muted-foreground"}>
              {attorneyCount}{cap !== null ? ` of ${cap}` : " (unlimited)"}
            </span>
          </div>
          {cap !== null && (
            <div className="h-2 rounded bg-muted overflow-hidden">
              <div
                className={`h-full ${nearCap ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Included features</p>
          <ul className="text-sm space-y-1">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => {
              const on = !!tier.features?.[key];
              return (
                <li key={key} className={on ? "text-foreground" : "text-muted-foreground"}>
                  <span className="inline-block w-4">{on ? "✓" : "—"}</span> {label}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Billing is handled offline. Reach out and we'll upgrade or downgrade your plan.
        </p>
      </CardContent>
    </Card>
  );
}
