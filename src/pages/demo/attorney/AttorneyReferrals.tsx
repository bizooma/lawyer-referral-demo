import { useState, useEffect } from 'react';
import { useAttorneyReferrals, useAttorneyProfile } from '@/hooks/useAttorneyReferrals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  pending_match: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-purple-100 text-purple-800',
  referred: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

type ActionType = 'accept' | 'decline' | 'contact' | null;

export default function AttorneyReferrals() {
  const { user } = useDemoAuth();
  const { data: profile } = useAttorneyProfile();
  const { data: referrals, isLoading } = useAttorneyReferrals();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Subscribe to real-time updates for referrals assigned to this attorney
  useEffect(() => {
    if (!profile?.attorney_id) return;

    const channel = supabase
      .channel('attorney-referrals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intakes',
          filter: `assigned_attorney_id=eq.${profile.attorney_id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['attorney-referrals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.attorney_id, queryClient]);

  const filteredReferrals = referrals?.filter((r) => {
    const matchesSearch =
      r.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.intake_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAction = async () => {
    if (!selectedReferral || !profile?.attorney_id) return;

    setIsProcessing(true);
    try {
      // Map action type to referral status
      const statusMap: Record<string, 'accepted' | 'declined' | 'contacted'> = {
        accept: 'accepted',
        decline: 'declined',
        contact: 'contacted',
      };

      const newStatus = statusMap[actionType!];

      // Check if a response already exists
      const { data: existingResponse } = await supabase
        .from('referral_responses')
        .select('id')
        .eq('intake_id', selectedReferral.id)
        .eq('attorney_id', profile.attorney_id)
        .maybeSingle();

      if (existingResponse) {
        // Update existing response
        await supabase
          .from('referral_responses')
          .update({
            status: newStatus,
            response_date: new Date().toISOString(),
            notes: notes || null,
          })
          .eq('id', existingResponse.id);
      } else {
        // Create new response
        await supabase
          .from('referral_responses')
          .insert({
            intake_id: selectedReferral.id,
            attorney_id: profile.attorney_id,
            status: newStatus,
            response_date: new Date().toISOString(),
            notes: notes || null,
          });
      }

      // Update intake status based on action
      if (actionType === 'accept' || actionType === 'contact') {
        await supabase
          .from('intakes')
          .update({ status: 'referred' })
          .eq('id', selectedReferral.id);
      } else if (actionType === 'decline') {
        // If declined, set back to pending_match so they can find another attorney
        await supabase
          .from('intakes')
          .update({ 
            status: 'pending_match',
            assigned_attorney_id: null 
          })
          .eq('id', selectedReferral.id);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['attorney-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-responses'] });
      queryClient.invalidateQueries({ queryKey: ['pending-referrals'] });

      toast.success(
        actionType === 'accept'
          ? 'Referral accepted! The client has been notified.'
          : actionType === 'decline'
          ? 'Referral declined. The client will be matched with another attorney.'
          : 'Client marked as contacted!'
      );

      setActionType(null);
      setSelectedReferral(null);
      setNotes('');
    } catch (error) {
      console.error('Error processing action:', error);
      toast.error('Failed to process action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referred Clients</h1>
        <p className="text-muted-foreground">Manage clients referred to you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or intake number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="matched">Pending Response</SelectItem>
            <SelectItem value="referred">Accepted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referrals List */}
      {filteredReferrals.length > 0 ? (
        <div className="space-y-4">
          {filteredReferrals.map((referral) => (
            <Card key={referral.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{referral.caller_name}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                      <span>{referral.intake_number}</span>
                      <span className="capitalize">{referral.area_of_law?.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {referral.county}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(referral.created_at || ''), 'PP')}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[referral.status || 'new']}>
                    {referral.status === 'matched' ? 'Pending Response' : referral.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {referral.narrative && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {referral.narrative}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {referral.caller_phone && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {referral.caller_phone}
                    </span>
                  )}
                  {referral.caller_email && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {referral.caller_email}
                    </span>
                  )}
                  {referral.language_preference && referral.language_preference !== 'English' && (
                    <Badge variant="outline">{referral.language_preference}</Badge>
                  )}
                  {referral.urgency === 'urgent' && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                </div>

                {referral.status === 'matched' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setActionType('accept');
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setActionType('contact');
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Mark Contacted
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setActionType('decline');
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}

                {referral.status === 'referred' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    You accepted this referral
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Referrals Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'New referrals will appear here'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' && 'Accept Referral'}
              {actionType === 'decline' && 'Decline Referral'}
              {actionType === 'contact' && 'Mark as Contacted'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' && 'The client will be notified that you will be representing them.'}
              {actionType === 'decline' && 'The client will be matched with another attorney.'}
              {actionType === 'contact' && 'Confirm that you have reached out to the client.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={actionType === 'decline' ? 'Reason for declining (optional)' : 'Notes (optional)'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setNotes(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionType === 'decline' ? 'destructive' : 'default'}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  {actionType === 'accept' && 'Accept Referral'}
                  {actionType === 'decline' && 'Decline Referral'}
                  {actionType === 'contact' && 'Confirm Contact'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
