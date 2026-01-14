import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Scale, CheckCircle, Building, User, MapPin, Languages } from 'lucide-react';
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

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Vietnamese', 'Korean', 'Tagalog', 'Armenian'];

const steps = [
  { id: 1, name: 'Bar Verification', icon: Scale },
  { id: 2, name: 'Contact Info', icon: User },
  { id: 3, name: 'Practice Areas', icon: Building },
  { id: 4, name: 'Service Area', icon: MapPin },
  { id: 5, name: 'Languages', icon: Languages },
  { id: 6, name: 'Confirmation', icon: CheckCircle },
];

export default function AttorneySignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    barNumber: '',
    name: '',
    email: '',
    phone: '',
    firmName: '',
    practiceAreas: [] as string[],
    counties: [] as string[],
    languages: ['English'] as string[],
    agreeToTerms: false,
  });

  const toggleArrayItem = (field: 'practiceAreas' | 'counties' | 'languages', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.barNumber.length >= 5;
      case 2:
        return formData.name && formData.email && formData.phone;
      case 3:
        return formData.practiceAreas.length > 0;
      case 4:
        return formData.counties.length > 0;
      case 5:
        return formData.languages.length > 0 && formData.agreeToTerms;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success('Application submitted successfully! (Demo)');
    setCurrentStep(6);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/demo"
            className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Demo Login
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-white">Attorney Registration</h1>
          </div>
          <p className="text-slate-400">Join our referral network</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-slate-600 text-slate-400'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter your State Bar number for verification'}
              {currentStep === 2 && 'Provide your contact information'}
              {currentStep === 3 && 'Select your areas of practice'}
              {currentStep === 4 && 'Choose counties you can serve'}
              {currentStep === 5 && 'Languages and agreement'}
              {currentStep === 6 && 'Your application has been submitted'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Bar Verification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="barNumber">State Bar Number</Label>
                  <Input
                    id="barNumber"
                    value={formData.barNumber}
                    onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                    placeholder="Enter your bar number"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll verify your bar status with the State Bar of California
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400">
                  Demo Mode: Any bar number with 5+ characters will be accepted
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@lawfirm.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="firmName">Firm Name (Optional)</Label>
                  <Input
                    id="firmName"
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    placeholder="Smith & Associates"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Practice Areas */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select all areas you practice:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PRACTICE_AREAS.map((area) => (
                    <div key={area.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.value}
                        checked={formData.practiceAreas.includes(area.value)}
                        onCheckedChange={() => toggleArrayItem('practiceAreas', area.value)}
                      />
                      <label htmlFor={area.value} className="text-sm cursor-pointer">
                        {area.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Counties */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select counties you can serve:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {COUNTIES.map((county) => (
                    <div key={county} className="flex items-center space-x-2">
                      <Checkbox
                        id={county}
                        checked={formData.counties.includes(county)}
                        onCheckedChange={() => toggleArrayItem('counties', county)}
                      />
                      <label htmlFor={county} className="text-sm cursor-pointer">
                        {county}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Languages & Terms */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Languages you can serve clients in:</p>
                  <div className="flex flex-wrap gap-4">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={lang}
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => toggleArrayItem('languages', lang)}
                        />
                        <label htmlFor={lang} className="text-sm cursor-pointer">
                          {lang}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: !!checked })}
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the referral program terms and conditions, including the fee structure
                      and ethical guidelines for attorney referrals.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {currentStep === 6 && (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                <p className="text-muted-foreground mb-6">
                  We'll review your application and verify your bar status.
                  You'll receive an email within 1-2 business days.
                </p>
                <Button onClick={() => navigate('/demo')}>
                  Return to Demo Login
                </Button>
              </div>
            )}

            {/* Navigation */}
            {currentStep < 6 && (
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {currentStep < 5 ? (
                  <Button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
