import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  Users, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle2,
  Play,
  BookOpen
} from 'lucide-react';

const tourSteps = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Your central hub for monitoring program activity. View key metrics, recent intakes, and quick access to common tasks.',
    icon: LayoutDashboard,
    path: '/demo/dashboard',
    features: ['Real-time statistics', 'Recent intake list', 'Quick action buttons'],
  },
  {
    id: 'intake',
    title: 'Intake Wizard',
    description: 'A step-by-step form to collect client information and legal needs. The wizard guides staff through capturing all required details.',
    icon: FileText,
    path: '/demo/intake',
    features: ['Multi-step form', 'Field validation', 'Progress tracking'],
  },
  {
    id: 'matching',
    title: 'Attorney Matching',
    description: 'Our intelligent matching algorithm scores attorneys based on practice area, location, language, and availability.',
    icon: Scale,
    path: '/demo/matching',
    features: ['Scoring algorithm', 'Best match highlighting', 'One-click referral'],
  },
  {
    id: 'attorneys',
    title: 'Attorney Directory',
    description: 'Manage your panel of participating attorneys. View profiles, filter by specialty, and track availability.',
    icon: Users,
    path: '/demo/attorneys',
    features: ['Searchable directory', 'Detailed profiles', 'Status management'],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Gain insights into program performance with visual analytics. Track trends, referral rates, and geographic distribution.',
    icon: BarChart3,
    path: '/demo/reports',
    adminOnly: true,
    features: ['Interactive charts', 'Performance metrics', 'Trend analysis'],
  },
  {
    id: 'settings',
    title: 'Program Settings',
    description: 'Configure organization details, matching rule weights, and notification preferences.',
    icon: Settings,
    path: '/demo/settings',
    adminOnly: true,
    features: ['Organization branding', 'Algorithm tuning', 'Notification config'],
  },
];

export default function GuidedTour() {
  const navigate = useNavigate();
  const { user } = useDemoAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleVisit = (step: typeof tourSteps[0]) => {
    setCompletedSteps(prev => [...new Set([...prev, step.id])]);
    navigate(step.path);
  };

  const visibleSteps = tourSteps.filter(step => 
    !step.adminOnly || user?.role === 'program_admin'
  );

  const progress = (completedSteps.length / visibleSteps.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guided Tour</h1>
        <p className="text-muted-foreground">
          Explore RefferEase's key features and learn how the platform works.
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Tour Progress</p>
              <p className="text-sm text-muted-foreground">
                {completedSteps.length} of {visibleSteps.length} sections visited
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <CardTitle>Quick Start</CardTitle>
          </div>
          <CardDescription>
            New to RefferEase? Here's the typical workflow for processing a client intake.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
              Receive call
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
              Create intake
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
              Run matching
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="gap-1">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">4</span>
              Send referral
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tour Steps */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleSteps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;
          
          return (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isCompleted ? 'border-green-500/50 bg-green-50/50' : ''}`}
              onClick={() => handleVisit(step)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-primary/10'}`}>
                      <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-primary'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {step.title}
                        {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </CardTitle>
                      {step.adminOnly && (
                        <Badge variant="secondary" className="text-xs mt-1">Admin Only</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                <div className="flex flex-wrap gap-1">
                  {step.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisit(step);
                  }}
                >
                  {isCompleted ? 'Visit Again' : 'Explore'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Need More Help?</p>
              <p className="text-sm text-muted-foreground mt-1">
                This demo showcases core functionality with fictional data. In a production environment, 
                you would have access to comprehensive documentation, training materials, and support channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
