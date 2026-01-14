import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemoAuth, DemoRole } from '@/contexts/DemoAuthContext';
import { UserCircle, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DemoLogin() {
  const { login, isLoading } = useDemoAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: DemoRole) => {
    await login(role);
    navigate('/demo/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">Demo Environment</h1>
          <p className="text-muted-foreground">
            Experience RefferEase with one-click access. Choose a role to explore.
          </p>
        </div>

        <div className="grid gap-4">
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleLogin('intake_specialist')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Intake Specialist</CardTitle>
                  <CardDescription>Process client intakes and manage referrals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Create and manage intake records</li>
                <li>• Run attorney matching algorithm</li>
                <li>• Send referral notifications</li>
                <li>• View intake history and status</li>
              </ul>
              <Button 
                variant="demo" 
                className="w-full"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin('intake_specialist');
                }}
              >
                Login as Intake Specialist
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleLogin('program_admin')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Program Admin</CardTitle>
                  <CardDescription>Full access to all system features</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• All Intake Specialist capabilities</li>
                <li>• Manage attorney directory</li>
                <li>• Configure matching rules</li>
                <li>• Access reports and analytics</li>
              </ul>
              <Button 
                variant="demo" 
                className="w-full"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin('program_admin');
                }}
              >
                Login as Program Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 text-center">
            <strong>Demo Notice:</strong> This environment uses fictional data. 
            All actions are simulated and no real legal advice or payments are processed.
          </p>
        </div>
      </div>
    </div>
  );
}
