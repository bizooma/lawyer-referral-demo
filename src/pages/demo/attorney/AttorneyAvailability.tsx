import { useState } from 'react';
import { useAttorneyProfile } from '@/hooks/useAttorneyReferrals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttorneyAvailability() {
  const { data: profile, isLoading } = useAttorneyProfile();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    acceptingReferrals: profile?.accepting_referrals ?? true,
    capacityStatus: profile?.attorney?.capacity_status || 'available',
    maxReferralsPerWeek: 5,
    vacationMode: false,
    vacationEndDate: '',
  });

  // Update settings when profile loads
  if (profile && settings.acceptingReferrals !== profile.accepting_referrals) {
    setSettings((prev) => ({
      ...prev,
      acceptingReferrals: profile.accepting_referrals ?? true,
      capacityStatus: profile.attorney?.capacity_status || 'available',
    }));
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Availability settings updated (Demo)');
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Availability Settings</h1>
        <p className="text-muted-foreground">Control when and how you receive referrals</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Status
            {settings.acceptingReferrals && !settings.vacationMode ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Paused
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="accepting" className="text-base">Accept New Referrals</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle off to temporarily stop receiving new referrals
                </p>
              </div>
              <Switch
                id="accepting"
                checked={settings.acceptingReferrals}
                onCheckedChange={(checked) => setSettings({ ...settings, acceptingReferrals: checked })}
              />
            </div>

            <div className="pt-4 border-t">
              <Label htmlFor="capacity">Capacity Status</Label>
              <Select
                value={settings.capacityStatus}
                onValueChange={(v) => setSettings({ ...settings, capacityStatus: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available - Full Capacity</SelectItem>
                  <SelectItem value="limited">Limited - Reduced Capacity</SelectItem>
                  <SelectItem value="at_capacity">At Capacity - No New Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Preferences</CardTitle>
          <CardDescription>Set limits on how many referrals you want to receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxReferrals">Maximum Referrals Per Week</Label>
              <Select
                value={settings.maxReferralsPerWeek.toString()}
                onValueChange={(v) => setSettings({ ...settings, maxReferralsPerWeek: parseInt(v) })}
              >
                <SelectTrigger className="mt-2 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 per week</SelectItem>
                  <SelectItem value="5">5 per week</SelectItem>
                  <SelectItem value="10">10 per week</SelectItem>
                  <SelectItem value="20">20 per week</SelectItem>
                  <SelectItem value="999">No limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vacation Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vacation Mode
          </CardTitle>
          <CardDescription>Automatically pause referrals during your time off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vacation" className="text-base">Enable Vacation Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily pause all referrals
                </p>
              </div>
              <Switch
                id="vacation"
                checked={settings.vacationMode}
                onCheckedChange={(checked) => setSettings({ ...settings, vacationMode: checked })}
              />
            </div>

            {settings.vacationMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Vacation Mode Active</p>
                    <p className="text-sm text-amber-700">
                      You will not receive any new referrals while vacation mode is enabled.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
