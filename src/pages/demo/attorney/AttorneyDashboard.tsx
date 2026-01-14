import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useAttorneyProfile, useAttorneyReferrals, useReferralResponses } from '@/hooks/useAttorneyReferrals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttorneyDashboard() {
  const { user } = useDemoAuth();
  const { data: profile, isLoading: profileLoading } = useAttorneyProfile();
  const { data: referrals, isLoading: referralsLoading } = useAttorneyReferrals();
  const { data: responses } = useReferralResponses();

  const pendingCount = responses?.filter((r) => r.status === 'pending').length || 0;
  const acceptedCount = responses?.filter((r) => r.status === 'accepted').length || 0;
  const declinedCount = responses?.filter((r) => r.status === 'declined').length || 0;
  const contactedCount = responses?.filter((r) => r.status === 'contacted').length || 0;

  const recentReferrals = referrals?.slice(0, 5) || [];

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.display_name}</h1>
          <p className="text-muted-foreground">
            {profile?.attorney?.firm_name || 'Attorney Portal'} • 
            {profile?.accepting_referrals ? ' Accepting Referrals' : ' Not Accepting Referrals'}
          </p>
        </div>
        {pendingCount > 0 && (
          <Button variant="destructive" asChild>
            <Link to="/demo/attorney/referrals">
              <Bell className="h-4 w-4 mr-2" />
              {pendingCount} Pending
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{contactedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {responses && responses.length > 0
                ? Math.round(((acceptedCount + contactedCount) / responses.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      {profile?.attorney && (
        <Card>
          <CardHeader>
            <CardTitle>Your Profile Summary</CardTitle>
            <CardDescription>Make sure your profile is up to date to receive relevant referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Practice Areas</p>
                <div className="flex flex-wrap gap-1">
                  {profile.attorney.practice_areas?.slice(0, 3).map((area: string) => (
                    <Badge key={area} variant="secondary" className="text-xs capitalize">
                      {area.replace('_', ' ')}
                    </Badge>
                  ))}
                  {(profile.attorney.practice_areas?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(profile.attorney.practice_areas?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Counties Served</p>
                <div className="flex flex-wrap gap-1">
                  {profile.attorney.counties?.slice(0, 3).map((county: string) => (
                    <Badge key={county} variant="outline" className="text-xs">
                      {county}
                    </Badge>
                  ))}
                  {(profile.attorney.counties?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(profile.attorney.counties?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {profile.attorney.languages?.map((lang: string) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/demo/attorney/profile">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Clients referred to you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/demo/attorney/referrals">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentReferrals.length > 0 ? (
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{referral.caller_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {referral.area_of_law?.replace('_', ' ')} • {referral.county}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={referral.status === 'referred' ? 'default' : 'secondary'}>
                      {referral.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(referral.created_at || ''), 'PP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No referrals yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
