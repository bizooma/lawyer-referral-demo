import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrgPlan, planHasFeature } from "@/hooks/useOrgPlan";
import { UpgradePrompt } from "@/components/app/UpgradePrompt";

interface Report {
  totalIntakes: number;
  totalReferrals: number;
  intakesByStatus: Record<string, number>;
  intakesByArea: Record<string, number>;
  intakesByCounty: Record<string, number>;
  volumeByWeek: Array<{ week: string; count: number }>;
  attorneyPerf: Array<{ name: string; received: number; accepted: number; closed: number }>;
}

export default function AppReports() {
  const { activeOrgId, activeMembership } = useAuth();
  const { tier } = useOrgPlan(activeOrgId, activeMembership?.organization.plan_tier ?? "local_bar");
  const advanced = planHasFeature(tier, "advanced_reports");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) return;
    (async () => {
      setLoading(true);
      const [{ data: intakes }, { data: refs }] = await Promise.all([
        supabase.from("intakes").select("id, status, area_of_law, county, created_at").eq("organization_id", activeOrgId),
        supabase.from("referral_responses").select("id, status, attorney_id, attorney:attorneys(name)").eq("organization_id", activeOrgId),
      ]);

      const intakesByStatus: Record<string, number> = {};
      const intakesByArea: Record<string, number> = {};
      const intakesByCounty: Record<string, number> = {};
      const weekMap = new Map<string, number>();
      (intakes ?? []).forEach((i: any) => {
        intakesByStatus[i.status] = (intakesByStatus[i.status] ?? 0) + 1;
        intakesByArea[i.area_of_law] = (intakesByArea[i.area_of_law] ?? 0) + 1;
        intakesByCounty[i.county] = (intakesByCounty[i.county] ?? 0) + 1;
        const d = new Date(i.created_at);
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const key = monday.toISOString().slice(0, 10);
        weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
      });

      const perfMap = new Map<string, { name: string; received: number; accepted: number; closed: number }>();
      (refs ?? []).forEach((r: any) => {
        const key = r.attorney_id ?? "unknown";
        const name = r.attorney?.name ?? "Unknown";
        const cur = perfMap.get(key) ?? { name, received: 0, accepted: 0, closed: 0 };
        cur.received += 1;
        if (r.status === "accepted") cur.accepted += 1;
        if (r.status === "closed") cur.closed += 1;
        perfMap.set(key, cur);
      });

      setReport({
        totalIntakes: intakes?.length ?? 0,
        totalReferrals: refs?.length ?? 0,
        intakesByStatus, intakesByArea, intakesByCounty,
        volumeByWeek: Array.from(weekMap.entries()).sort().map(([week, count]) => ({ week, count })),
        attorneyPerf: Array.from(perfMap.values()).sort((a, b) => b.received - a.received),
      });
      setLoading(false);
    })();
  }, [activeOrgId]);

  if (loading || !report) return <p className="text-muted-foreground">Loading…</p>;

  const empty = report.totalIntakes === 0 && report.totalReferrals === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Real aggregations across your intakes and referrals.</p>
      </div>

      {empty ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          No data yet. Create your first intake and send a referral to see reports here.
        </CardContent></Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Intakes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{report.totalIntakes}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Referrals</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{report.totalReferrals}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Weeks Tracked</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{report.volumeByWeek.length}</p></CardContent></Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Breakdown title="Intakes by Status" data={report.intakesByStatus} />
            <Breakdown title="Intakes by Practice Area" data={report.intakesByArea} />
            <Breakdown title="Intakes by County" data={report.intakesByCounty} />
          </div>

          {!advanced ? (
            <UpgradePrompt
              title="Advanced analytics is a Regional or Statewide feature"
              description="Weekly referral volume trends and attorney performance breakdowns are available on higher plans."
            />
          ) : (
          <>
          <Card>
            <CardHeader><CardTitle>Referral Volume by Week</CardTitle></CardHeader>
            <CardContent>
              {report.volumeByWeek.length === 0 ? <p className="text-muted-foreground text-sm">No intakes yet.</p> :
                <ul className="space-y-1 text-sm">
                  {report.volumeByWeek.map(w => (
                    <li key={w.week} className="flex items-center gap-3">
                      <span className="w-24 text-muted-foreground">{w.week}</span>
                      <div className="flex-1 bg-muted h-3 rounded"><div className="bg-primary h-3 rounded" style={{ width: `${Math.min(100, w.count * 10)}%` }} /></div>
                      <span className="w-8 text-right">{w.count}</span>
                    </li>
                  ))}
                </ul>
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Attorney Performance</CardTitle></CardHeader>
            <CardContent>
              {report.attorneyPerf.length === 0 ? <p className="text-muted-foreground text-sm">No referrals sent yet.</p> :
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground border-b">
                    <th className="py-2">Attorney</th><th>Received</th><th>Accepted</th><th>Closed</th>
                  </tr></thead>
                  <tbody>
                    {report.attorneyPerf.map((a, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium">{a.name}</td><td>{a.received}</td><td>{a.accepted}</td><td>{a.closed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </CardContent>
          </Card>
          </>
          )}
        </>
      )}
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {entries.length === 0 ? <p className="text-muted-foreground text-sm">No data.</p> :
          <ul className="space-y-1 text-sm">
            {entries.map(([k, v]) => (
              <li key={k} className="flex justify-between"><span className="capitalize">{k.replace(/_/g," ")}</span><span className="font-medium">{v}</span></li>
            ))}
          </ul>
        }
      </CardContent>
    </Card>
  );
}
