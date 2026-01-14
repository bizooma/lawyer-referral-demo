import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useClientIntakes } from '@/hooks/useClientIntakes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, User, ArrowRight, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'new':
      return { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock };
    case 'pending_match':
      return { label: 'Finding Attorney', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    case 'matched':
      return { label: 'Attorney Matched', color: 'bg-purple-100 text-purple-800', icon: User };
    case 'referred':
      return { label: 'Referred', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'closed':
      return { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800', icon: FileText };
  }
};

export default function ClientDashboard() {
  const { user } = useDemoAuth();
  const { data: intakes, isLoading } = useClientIntakes();

  const activeIntakes = intakes?.filter((i) => !['closed', 'cancelled'].includes(i.status || '')) || [];
  const latestIntake = activeIntakes[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.display_name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Track your referrals and find legal assistance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeIntakes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{intakes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attorneys Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {intakes?.filter((i) => i.assigned_attorney_id).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Referral Status */}
      {latestIntake ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Latest Referral</CardTitle>
                <CardDescription>
                  {latestIntake.intake_number} • {latestIntake.area_of_law?.replace('_', ' ')}
                </CardDescription>
              </div>
              {(() => {
                const config = getStatusConfig(latestIntake.status || 'new');
                return (
                  <Badge className={config.color}>
                    <config.icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent>
            {latestIntake.assigned_attorney && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-2">Your Assigned Attorney</p>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{latestIntake.assigned_attorney.name}</p>
                    <p className="text-sm text-muted-foreground">{latestIntake.assigned_attorney.firm_name}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      {latestIntake.assigned_attorney.phone && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {latestIntake.assigned_attorney.phone}
                        </span>
                      )}
                      {latestIntake.assigned_attorney.email && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {latestIntake.assigned_attorney.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Submitted {format(new Date(latestIntake.created_at || ''), 'PPP')}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/demo/client/referrals">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Active Referrals</h3>
            <p className="text-muted-foreground mb-4">
              Need legal assistance? Request an attorney referral.
            </p>
            <Button asChild>
              <Link to="/demo/client/intake">Request Referral</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" className="justify-start h-auto py-4" asChild>
            <Link to="/demo/client/intake">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">New Referral Request</div>
                <div className="text-sm text-muted-foreground">Find an attorney for your legal matter</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4" asChild>
            <Link to="/demo/client/referrals">
              <Clock className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">View All Referrals</div>
                <div className="text-sm text-muted-foreground">Track status of your requests</div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
