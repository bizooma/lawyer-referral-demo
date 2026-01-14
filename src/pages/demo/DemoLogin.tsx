import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemoAuth, getDashboardPath, DemoRole } from '@/contexts/DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Shield, User, Briefcase, ArrowLeft, Scale } from 'lucide-react';
import DemoTour from '@/components/demo/DemoTour';

const roles: { role: DemoRole; title: string; icon: typeof UserCircle; description: string; features: string[]; color: string }[] = [
  {
    role: 'intake_specialist',
    title: 'Intake Specialist',
    icon: UserCircle,
    description: 'Process intake requests and manage client referrals',
    features: ['Create and manage intakes', 'Run matching algorithm', 'Assign attorneys', 'Track referral status'],
    color: 'text-blue-600 bg-blue-100',
  },
  {
    role: 'program_admin',
    title: 'Program Admin',
    icon: Shield,
    description: 'Full system access with reporting and configuration',
    features: ['All Intake Specialist features', 'View analytics reports', 'Manage attorney directory', 'Configure system settings'],
    color: 'text-purple-600 bg-purple-100',
  },
  {
    role: 'client',
    title: 'Client',
    icon: User,
    description: 'Track your referrals and find an attorney',
    features: ['Request attorney referral', 'Track referral status', 'View assigned attorney', 'Manage your profile'],
    color: 'text-amber-600 bg-amber-100',
  },
  {
    role: 'attorney',
    title: 'Attorney',
    icon: Briefcase,
    description: 'Manage your referrals and availability',
    features: ['View referred clients', 'Accept or decline referrals', 'Update your profile', 'Set availability status'],
    color: 'text-emerald-600 bg-emerald-100',
  },
];

export default function DemoLogin() {
  const { login, isLoading } = useDemoAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const handleLogin = async (role: DemoRole) => {
    setLoadingRole(role);
    await login(role);
    navigate(getDashboardPath(role));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DemoTour />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-white">ReferEase Demo</h1>
          </div>

          <p className="text-slate-300 text-lg">
            Explore the referral management system from different perspectives.
            Select a role below to experience the platform.
          </p>
        </div>

        {/* Role Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((item) => (
            <Card key={item.role} className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 hover:bg-white/15 transition-all shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                    <CardDescription className="mt-1 text-slate-300">{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {item.features.map((feature) => (
                    <li key={feature} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleLogin(item.role)}
                  disabled={isLoading}
                >
                  {loadingRole === item.role ? 'Loading...' : `Login as ${item.title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attorney Application Demo Card */}
        <Card className="max-w-4xl mx-auto mb-8 bg-white/10 backdrop-blur-xl border-emerald-500/30 hover:border-emerald-500/50 hover:bg-white/15 transition-all shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg text-emerald-600 bg-emerald-100">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Attorney Application Demo</h3>
                <p className="text-slate-300 mb-3">
                  Experience the attorney onboarding process. This demo shows how attorneys apply to join the referral program.
                </p>
                <ul className="space-y-1">
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Complete a sample application form
                  </li>
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    See how bar verification works
                  </li>
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Preview the attorney onboarding experience
                  </li>
                </ul>
              </div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap" asChild>
              <Link to="/demo/attorney/signup">Start Application Demo</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Client Referral Demo Card */}
        <Card className="max-w-4xl mx-auto mb-8 bg-white/10 backdrop-blur-xl border-amber-500/30 hover:border-amber-500/50 hover:bg-white/15 transition-all shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg text-amber-600 bg-amber-100">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Client Referral Demo</h3>
                <p className="text-slate-300 mb-3">
                  See how website visitors request an attorney referral. This demo walks through the complete client intake experience.
                </p>
                <ul className="space-y-1">
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Complete a multi-step intake form
                  </li>
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Simulate referral fee payment
                  </li>
                  <li className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Track your attorney match status
                  </li>
                </ul>
              </div>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 whitespace-nowrap" asChild>
              <Link to="/demo/client/intake">Start Client Demo</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h3 className="text-amber-400 font-medium mb-2">Demo Notice</h3>
            <p className="text-slate-400 text-sm">
              This is a demonstration environment with simulated data. No real legal advice
              is provided, and no actual attorney-client relationships are formed. All
              payment processing is simulated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
