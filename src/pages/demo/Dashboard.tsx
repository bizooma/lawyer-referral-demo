import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIntakes, useIntakeStats } from '@/hooks/useIntakes';
import { useAttorneyStats } from '@/hooks/useAttorneys';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useDemoAuth();
  const { data: intakes, isLoading: intakesLoading } = useIntakes();
  const { data: intakeStats } = useIntakeStats();
  const { data: attorneyStats } = useAttorneyStats();

  const recentIntakes = intakes?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-yellow-100 text-yellow-800';
      case 'referred': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.display_name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your referral program today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intakes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intakeStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{intakeStats?.thisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Intakes</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intakeStats?.new || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting matching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referred</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intakeStats?.referred || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Attorneys</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attorneyStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {attorneyStats?.available || 0} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and recent intakes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/demo/intake">
                <FileText className="mr-2 h-4 w-4" />
                Create New Intake
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/demo/matching">
                <TrendingUp className="mr-2 h-4 w-4" />
                Run Matching
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/demo/attorneys">
                <Users className="mr-2 h-4 w-4" />
                View Attorney Directory
              </Link>
            </Button>
            {user?.role === 'program_admin' && (
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/demo/reports">
                  <Clock className="mr-2 h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Intakes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Intakes</CardTitle>
            <CardDescription>Latest client inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            {intakesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentIntakes.length > 0 ? (
              <div className="space-y-3">
                {recentIntakes.map((intake) => (
                  <div 
                    key={intake.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {intake.intake_number} - {intake.caller_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {intake.area_of_law} • {format(new Date(intake.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(intake.status || 'new')}>
                      {intake.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No intakes yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
