import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  FileText, 
  CreditCard, 
  CheckCircle,
  Scale,
  AlertTriangle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const PRACTICE_AREAS = [
  'Personal Injury',
  'Family Law',
  'Criminal Defense',
  'Estate & Probate',
  'Immigration',
  'Business Law',
];

const COUNTIES = [
  'Los Angeles',
  'San Diego',
  'Orange',
  'Riverside',
  'San Bernardino',
  'Santa Clara',
  'Alameda',
  'Sacramento',
  'San Francisco',
  'Fresno',
];

const steps = [
  { id: 1, name: 'Your Information', icon: User },
  { id: 2, name: 'Legal Issue', icon: FileText },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Confirmation', icon: CheckCircle },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  practiceArea: string;
  issueDescription: string;
  urgency: string;
  agreedToTerms: boolean;
  paymentMethod: string;
}

export default function PublicClientIntake() {
  const navigate = useNavigate();
  const { login } = useDemoAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    county: '',
    practiceArea: '',
    issueDescription: '',
    urgency: 'normal',
    agreedToTerms: false,
    paymentMethod: 'credit_card',
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.county;
      case 2:
        return formData.practiceArea && formData.issueDescription;
      case 3:
        return formData.agreedToTerms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-login as demo client
    await login('client');
    
    toast.success('Referral request submitted successfully!', {
      description: 'You have been logged into your demo client account.',
    });
    
    // Navigate to client dashboard
    navigate('/demo/client/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-orange-50">
      {/* Demo Banner */}
      <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
        <AlertTriangle className="inline-block w-4 h-4 mr-2" />
        DEMO MODE - This is a simulation. No real legal referrals or payments are processed.
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Lawyer Referral Program</h1>
              <p className="text-xs text-muted-foreground">Attorney Referral Service</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/demo')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        isComplete ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          {/* Step 1: Your Information */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Your Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact details so we can match you with the right attorney.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> County *
                  </Label>
                  <Select value={formData.county} onValueChange={(value) => updateField('county', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTIES.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county} County
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Legal Issue */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Your Legal Issue
                </CardTitle>
                <CardDescription>
                  Tell us about your legal matter so we can find the best attorney match.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practiceArea">Area of Law *</Label>
                  <Select value={formData.practiceArea} onValueChange={(value) => updateField('practiceArea', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of legal help you need" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRACTICE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => updateField('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How urgent is your matter?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - No immediate deadline</SelectItem>
                      <SelectItem value="normal">Normal - Within a few weeks</SelectItem>
                      <SelectItem value="high">High - Need help soon</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Describe Your Legal Issue *</Label>
                  <Textarea
                    id="issueDescription"
                    value={formData.issueDescription}
                    onChange={(e) => updateField('issueDescription', e.target.value)}
                    placeholder="Please provide a brief description of your legal matter. Include any relevant dates, parties involved, or key facts..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    This information will be shared with potential attorneys to help them understand your case.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Referral Fee Payment
                </CardTitle>
                <CardDescription>
                  A small referral fee helps us maintain our attorney network and services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Attorney Referral Fee</span>
                    <span className="text-2xl font-bold text-amber-600">$35.00</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time fee • Includes up to 3 attorney matches
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('paymentMethod', 'credit_card')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.paymentMethod === 'credit_card'
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-border hover:border-amber-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-2 text-amber-500" />
                      <div className="font-medium">Credit Card</div>
                      <div className="text-xs text-muted-foreground">Visa, Mastercard, Amex</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('paymentMethod', 'paypal')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.paymentMethod === 'paypal'
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-border hover:border-amber-300'
                      }`}
                    >
                      <div className="w-6 h-6 mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        PP
                      </div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-xs text-muted-foreground">Fast & secure</div>
                    </button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    DEMO MODE
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This is a demo environment. No actual payment will be processed.
                    Click "Submit Payment" to simulate a successful transaction.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => updateField('agreedToTerms', checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-amber-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>.
                    I understand that this referral does not guarantee legal representation.
                  </label>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Request Submitted!</CardTitle>
                <CardDescription>
                  Your attorney referral request has been received.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">What happens next?</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Our team will review your request and match you with qualified attorneys</li>
                    <li>You'll receive up to 3 attorney matches within 24-48 hours</li>
                    <li>Matched attorneys will contact you directly to discuss your case</li>
                    <li>You can track your referral status in your dashboard</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Demo Account Created</h4>
                  <p className="text-sm text-amber-700">
                    A demo client account has been set up for you. Click below to access your
                    dashboard and track your simulated referral.
                  </p>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Go to My Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="px-6 pb-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep === 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Submit Payment
                  <CreditCard className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@example.com" className="text-amber-600 hover:underline">
            support@example.com
          </a>
        </p>
      </main>
    </div>
  );
}
