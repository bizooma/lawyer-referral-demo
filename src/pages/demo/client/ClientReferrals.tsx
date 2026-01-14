import { useEffect } from 'react';
import { useClientIntakes } from '@/hooks/useClientIntakes';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, User, Phone, Mail, MapPin, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FileText };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800', icon: FileText };
  }
};

export default function ClientReferrals() {
  const { user } = useDemoAuth();
  const { data: intakes, isLoading } = useClientIntakes();
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('client-referrals-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intakes',
          filter: `demo_user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['client-intakes'] });
          
          if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (newRecord.status !== oldRecord.status) {
              if (newRecord.status === 'referred') {
                toast.success('Your attorney has accepted your case!', {
                  icon: <CheckCircle className="h-4 w-4" />,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Referrals</h1>
          <p className="text-muted-foreground">Track the status of your referral requests</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Referrals</h1>
          <p className="text-muted-foreground">Track the status of your referral requests</p>
        </div>
        <Button asChild>
          <Link to="/demo/client/intake">New Request</Link>
        </Button>
      </div>

      {intakes && intakes.length > 0 ? (
        <div className="space-y-4">
          {intakes.map((intake) => {
            const statusConfig = getStatusConfig(intake.status || 'new');
            return (
              <Card key={intake.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{intake.intake_number}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="capitalize">{intake.area_of_law?.replace('_', ' ')}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {intake.county}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(intake.created_at || ''), 'PP')}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={statusConfig.color}>
                      <statusConfig.icon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {intake.narrative && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {intake.narrative}
                    </p>
                  )}

                  {intake.assigned_attorney && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Assigned Attorney</p>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{intake.assigned_attorney.name}</p>
                          <p className="text-sm text-muted-foreground">{intake.assigned_attorney.firm_name}</p>
                        </div>
                        <div className="flex gap-2">
                          {intake.assigned_attorney.phone && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                          {intake.assigned_attorney.email && (
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Status message */}
                      {intake.status === 'referred' && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Your attorney has accepted and will contact you soon.
                        </div>
                      )}
                      {intake.status === 'matched' && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Waiting for attorney confirmation...
                        </div>
                      )}
                    </div>
                  )}

                  {!intake.assigned_attorney && intake.status !== 'closed' && intake.status !== 'cancelled' && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        We're working on finding the best attorney match for your case.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Referrals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by requesting an attorney referral for your legal matter.
            </p>
            <Button asChild>
              <Link to="/demo/client/intake">Request Referral</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
