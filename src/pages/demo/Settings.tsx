import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { useMatchingRules } from '@/hooks/useMatchingRules';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { user } = useDemoAuth();
  const { data: matchingRules, isLoading: rulesLoading } = useMatchingRules();

  const handleSave = () => {
    toast.info('Demo Mode', {
      description: 'Settings changes are simulated in demo mode.',
    });
  };

  if (user?.role !== 'program_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">Access Restricted</h2>
          <p className="text-muted-foreground mt-2">Settings are only available to Program Administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure program settings and matching rules.
        </p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Demo Mode Active</p>
          <p className="text-sm text-amber-700">
            Changes made here are simulated and will not persist. In a live environment, 
            these settings would be saved to the database.
          </p>
        </div>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="matching">Matching Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Basic information about your bar association</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" defaultValue="California State Bar Association" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" defaultValue="referrals@example.bar.org" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" type="tel" defaultValue="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input id="primaryColor" defaultValue="#1e3a5f" />
                    <div className="w-10 h-10 rounded border" style={{ backgroundColor: '#1e3a5f' }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disclaimer">Legal Disclaimer</Label>
                <textarea
                  id="disclaimer"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="The Lawyer Referral Service provides referrals to attorneys for informational purposes only. The selection of an attorney is an important decision and should not be based solely on referral."
                />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Rules */}
        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Matching Algorithm Rules</CardTitle>
              <CardDescription>
                Configure the scoring weights for attorney matching. Higher weights mean stronger influence on match scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : matchingRules && matchingRules.length > 0 ? (
                <div className="space-y-4">
                  {matchingRules.map((rule) => (
                    <div 
                      key={rule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rule.rule_name}</p>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="text-lg font-bold">{rule.weight > 0 ? '+' : ''}{rule.weight}</p>
                        </div>
                        <Switch checked={rule.is_active ?? true} />
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleSave} className="mt-4">
                    <Save className="mr-2 h-4 w-4" />
                    Save Rules
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No matching rules configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send email notifications for new referrals</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send SMS alerts for urgent intakes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">Send daily summary of pending intakes</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Attorney Confirmation</p>
                  <p className="text-sm text-muted-foreground">Require attorneys to confirm referral receipt</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
