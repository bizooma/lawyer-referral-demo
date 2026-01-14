import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, CreditCard, FileText, User, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PRACTICE_AREAS = [
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'family_law', label: 'Family Law' },
  { value: 'criminal_defense', label: 'Criminal Defense' },
  { value: 'estate_probate', label: 'Estate & Probate' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'business', label: 'Business Law' },
];

const COUNTIES = [
  'Los Angeles', 'Orange', 'San Diego', 'Riverside', 'San Bernardino',
  'Santa Clara', 'Alameda', 'Sacramento', 'San Francisco', 'Contra Costa',
];

const steps = [
  { id: 1, name: 'Your Information', icon: User },
  { id: 2, name: 'Legal Issue', icon: FileText },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Confirmation', icon: CheckCircle },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  areaOfLaw: string;
  county: string;
  narrative: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export default function ClientIntakeWizard() {
  const { user } = useDemoAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.display_name || '',
    email: user?.email || '',
    phone: '',
    areaOfLaw: '',
    county: '',
    narrative: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.areaOfLaw && formData.county && formData.narrative;
      case 3:
        return formData.cardNumber && formData.expiry && formData.cvv;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success('Referral request submitted successfully!');
    setCurrentStep(4);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Request Attorney Referral</h1>
        <p className="text-muted-foreground">Complete the form below to find the right attorney for your needs</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              <step.icon className="h-5 w-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Tell us how to reach you'}
            {currentStep === 2 && 'Describe your legal matter'}
            {currentStep === 3 && 'Pay the referral fee to proceed'}
            {currentStep === 4 && 'Your request has been submitted'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Legal Issue */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="areaOfLaw">Area of Law</Label>
                <Select value={formData.areaOfLaw} onValueChange={(v) => updateField('areaOfLaw', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area of law" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTICE_AREAS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Select value={formData.county} onValueChange={(v) => updateField('county', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="narrative">Describe Your Legal Issue</Label>
                <Textarea
                  id="narrative"
                  value={formData.narrative}
                  onChange={(e) => updateField('narrative', e.target.value)}
                  placeholder="Please describe your legal matter in detail..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Referral Fee</span>
                  <span className="font-semibold">$35.00</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This one-time fee covers the cost of matching you with a qualified attorney.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700">Demo Mode: No real payment will be processed</span>
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => updateField('cardNumber', e.target.value)}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={formData.expiry}
                    onChange={(e) => updateField('expiry', e.target.value)}
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => updateField('cvv', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-6">
                We're reviewing your request and will match you with a qualified attorney soon.
                You'll receive an email notification when your attorney is assigned.
              </p>
              <Button onClick={() => navigate('/demo/client/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Submit & Pay $35'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
