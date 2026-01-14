import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    target: 'welcome',
    title: 'Welcome to ReferEase Demo! 👋',
    content: 'This guided tour will walk you through the different ways you can explore our attorney referral platform.',
    position: 'center',
  },
  {
    target: 'role-cards',
    title: 'Role-Based Access',
    content: 'Experience the platform from different perspectives. Each role has unique features and permissions tailored to their workflow.',
    position: 'bottom',
  },
  {
    target: 'attorney-demo',
    title: 'Attorney Application Demo',
    content: 'See how attorneys apply to join the referral panel. Complete a sample application and experience the onboarding process.',
    position: 'top',
  },
  {
    target: 'client-demo',
    title: 'Client Referral Demo',
    content: 'Walk through the client journey - from submitting an intake request to getting matched with an attorney.',
    position: 'top',
  },
];

interface DemoTourProps {
  onComplete?: () => void;
}

export default function DemoTour({ onComplete }: DemoTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('demo-tour-completed');
    if (!seen) {
      // Auto-start tour for first-time visitors after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('demo-tour-completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('demo-tour-completed', 'true');
    setHasSeenTour(true);
    setIsOpen(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = tourSteps[currentStep];

  if (!isOpen) {
    return (
      <Button
        onClick={handleRestart}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 z-50 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white shadow-lg gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {hasSeenTour ? 'Restart Tour' : 'Take a Tour'}
      </Button>
    );
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Tour card */}
      <div className={`fixed z-50 ${getPositionClasses(step.position)}`}>
        <Card className="bg-slate-800/95 backdrop-blur-xl border-primary/30 shadow-2xl max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-6 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-primary' 
                          : index < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300 leading-relaxed">{step.content}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10"
                onClick={handleSkip}
              >
                Skip tour
              </Button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Highlight indicator for non-center positions */}
      {step.position !== 'center' && (
        <div className={`fixed z-45 ${getHighlightClasses(step.target)}`}>
          <div className="absolute inset-0 border-2 border-primary rounded-xl animate-pulse" />
        </div>
      )}
    </>
  );
}

function getPositionClasses(position: TourStep['position']): string {
  switch (position) {
    case 'center':
      return 'inset-0 flex items-center justify-center';
    case 'top':
      return 'left-1/2 -translate-x-1/2 bottom-32';
    case 'bottom':
      return 'left-1/2 -translate-x-1/2 top-32';
    case 'left':
      return 'right-8 top-1/2 -translate-y-1/2';
    case 'right':
      return 'left-8 top-1/2 -translate-y-1/2';
    default:
      return 'inset-0 flex items-center justify-center';
  }
}

function getHighlightClasses(target: string): string {
  switch (target) {
    case 'role-cards':
      return 'top-[280px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl h-[420px]';
    case 'attorney-demo':
      return 'top-[720px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl h-[180px]';
    case 'client-demo':
      return 'top-[920px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl h-[180px]';
    default:
      return '';
  }
}
