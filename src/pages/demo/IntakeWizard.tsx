import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PRACTICE_AREAS = [
  'family_law',
  'criminal_defense',
  'personal_injury',
  'immigration',
  'bankruptcy',
  'employment',
  'real_estate',
  'estate_planning',
  'business',
  'civil_rights',
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

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Vietnamese', 'Korean', 'Tagalog', 'Armenian'];

const steps = [
  { id: 1, name: 'Caller Info', description: 'Basic contact details' },
  { id: 2, name: 'Legal Issue', description: 'Case information' },
  { id: 3, name: 'Preferences', description: 'Client preferences' },
  { id: 4, name: 'Review', description: 'Confirm details' },
];

interface IntakeFormData {
  callerName: string;
  callerPhone: string;
  callerEmail: string;
  clientId: string;
  areaOfLaw: string;
  county: string;
  narrative: string;
  urgency: string;
  languagePreference: string;
  issueDate: string;
}

export default function IntakeWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>({
    callerName: '',
    callerPhone: '',
    callerEmail: '',
    clientId: '',
    areaOfLaw: '',
    county: '',
    narrative: '',
    urgency: 'normal',
    languagePreference: 'English',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const progress = (currentStep / steps.length) * 100;

  const updateField = (field: keyof IntakeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.callerName && formData.clientId;
      case 2:
        return formData.areaOfLaw && formData.county;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate intake creation (read-only demo)
    toast.success('Intake Created Successfully!', {
      description: `Intake for ${formData.callerName} has been recorded. In a live system, this would be saved to the database.`,
    });
    navigate('/demo/matching', { 
      state: { 
        newIntake: {
          ...formData,
          intakeNumber: `INT-${Date.now().toString().slice(-6)}`,
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Client Intake</h1>
        <p className="text-muted-foreground">
          Complete the intake form to record a new client inquiry.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep} of {steps.length}</span>
          <span className="font-medium">{steps[currentStep - 1].name}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`text-xs ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Caller Info */}
          {currentStep === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="callerName">Caller Name *</Label>
                  <Input
                    id="callerName"
                    value={formData.callerName}
                    onChange={(e) => updateField('callerName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID *</Label>
                  <Input
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) => updateField('clientId', e.target.value)}
                    placeholder="CL-12345"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="callerPhone">Phone Number</Label>
                  <Input
                    id="callerPhone"
                    type="tel"
                    value={formData.callerPhone}
                    onChange={(e) => updateField('callerPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callerEmail">Email Address</Label>
                  <Input
                    id="callerEmail"
                    type="email"
                    value={formData.callerEmail}
                    onChange={(e) => updateField('callerEmail', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Legal Issue */}
          {currentStep === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="areaOfLaw">Area of Law *</Label>
                  <Select 
                    value={formData.areaOfLaw} 
                    onValueChange={(value) => updateField('areaOfLaw', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area of law" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRACTICE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County *</Label>
                  <Select 
                    value={formData.county} 
                    onValueChange={(value) => updateField('county', value)}
                  >
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Date of Issue</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateField('issueDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="narrative">Case Narrative</Label>
                <Textarea
                  id="narrative"
                  value={formData.narrative}
                  onChange={(e) => updateField('narrative', e.target.value)}
                  placeholder="Describe the legal issue..."
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select 
                    value={formData.urgency} 
                    onValueChange={(value) => updateField('urgency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select 
                    value={formData.languagePreference} 
                    onValueChange={(value) => updateField('languagePreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Caller Name</p>
                  <p className="font-medium">{formData.callerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client ID</p>
                  <p className="font-medium">{formData.clientId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{formData.callerPhone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.callerEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area of Law</p>
                  <p className="font-medium capitalize">{formData.areaOfLaw.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">County</p>
                  <p className="font-medium">{formData.county}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{formData.urgency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{formData.languagePreference}</p>
                </div>
              </div>
              {formData.narrative && (
                <div>
                  <p className="text-sm text-muted-foreground">Narrative</p>
                  <p className="font-medium">{formData.narrative}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleSubmit}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Create Intake
          </Button>
        )}
      </div>
    </div>
  );
}
