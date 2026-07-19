import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyAttorney, useMyReferrals } from "@/hooks/useMyAttorney";
import { Bell, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AttorneyDashboard() {
  const { data: attorney, isLoading } = useMyAttorney();
  const { data: referrals = [] } = useMyReferrals();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!attorney) return (
    <Card><CardHeader><CardTitle>No attorney record linked</CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground">Ask your bar administrator to send you an invite.</p></CardContent></Card>
  );

  const pending = referrals.filter((r: any) => r.status === "pending");
  const accepted = referrals.filter((r: any) => r.status === "accepted" || r.status === "contacted");
  const declined = referrals.filter((r: any) => r.status === "declined");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {attorney.name}</h1>
          <p className="text-muted-foreground mt-1">
            {attorney.firm_name || "Attorney Portal"} · {attorney.is_active ? "Accepting referrals" : "Not accepting referrals"}
          </p>
        </div>
        {pending.length > 0 && (
          <Button asChild variant="destructive">
            <Link to="/attorney/referrals"><Bell className="h-4 w-4 mr-2" /> {pending.length} Pending</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={pending.length} tone="text-amber-600" />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Accepted / Contacted" value={accepted.length} tone="text-emerald-600" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Declined" value={declined.length} tone="text-muted-foreground" />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Referrals</CardTitle></CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No referrals yet.</p>
          ) : (
            <ul className="divide-y">
              {referrals.slice(0, 6).map((r: any) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.intake?.caller_name ?? "Client"}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {r.intake?.area_of_law?.replace(/_/g, " ")} · {r.intake?.county}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.status === "pending" ? "default" : "secondary"}>{r.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.created_at ? format(new Date(r.created_at), "PP") : ""}
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

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent><div className={`text-3xl font-bold ${tone}`}>{value}</div></CardContent>
    </Card>
  );
}
