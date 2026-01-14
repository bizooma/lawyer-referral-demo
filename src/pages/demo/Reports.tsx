import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIntakes, useIntakeStats } from '@/hooks/useIntakes';
import { useAttorneyStats } from '@/hooks/useAttorneys';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Users, FileText, Clock } from 'lucide-react';

const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const { user } = useDemoAuth();
  const { data: intakes } = useIntakes();
  const { data: intakeStats } = useIntakeStats();
  const { data: attorneyStats } = useAttorneyStats();

  // Status distribution data
  const statusData = useMemo(() => {
    if (!intakeStats) return [];
    return [
      { name: 'New', value: intakeStats.new, fill: COLORS[0] },
      { name: 'Matched', value: intakeStats.matched, fill: COLORS[1] },
      { name: 'Referred', value: intakeStats.referred, fill: COLORS[2] },
      { name: 'Closed', value: intakeStats.closed, fill: COLORS[3] },
    ];
  }, [intakeStats]);

  // Practice area distribution
  const practiceAreaData = useMemo(() => {
    if (!intakes) return [];
    const counts: Record<string, number> = {};
    intakes.forEach(intake => {
      const area = intake.area_of_law;
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ 
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        value 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [intakes]);

  // Weekly trend (simulated)
  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      intakes: Math.floor(Math.random() * 8) + 2,
      referrals: Math.floor(Math.random() * 6) + 1,
    }));
  }, []);

  // County distribution
  const countyData = useMemo(() => {
    if (!intakes) return [];
    const counts: Record<string, number> = {};
    intakes.forEach(intake => {
      counts[intake.county] = (counts[intake.county] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [intakes]);

  if (user?.role !== 'program_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Access Restricted</h2>
          <p className="text-muted-foreground mt-2">Reports are only available to Program Administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Program performance metrics and insights.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Intakes</p>
                <p className="text-2xl font-bold">{intakeStats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referral Rate</p>
                <p className="text-2xl font-bold">
                  {intakeStats?.total ? Math.round((intakeStats.referred / intakeStats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Attorneys</p>
                <p className="text-2xl font-bold">{attorneyStats?.active || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Processing</p>
                <p className="text-2xl font-bold">2.4 days</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intake Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Intake Status Distribution</CardTitle>
            <CardDescription>Current status of all intakes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Practice Area Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Intakes by Practice Area</CardTitle>
            <CardDescription>Most common legal issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={practiceAreaData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Intakes and referrals this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="intakes" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="referrals" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* County Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Intakes by County</CardTitle>
            <CardDescription>Geographic distribution of intakes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
