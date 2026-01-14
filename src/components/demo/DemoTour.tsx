import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    target: 'welcome',
    title: 'Welcome to LawyerReferral Demo! 👋',
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    const seen = localStorage.getItem('demo-tour-completed');
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const animateTransition = useCallback((newStep: number, dir: 'next' | 'prev') => {
    setDirection(dir);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsTransitioning(false);
    }, 150);
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      animateTransition(currentStep + 1, 'next');
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateTransition(currentStep - 1, 'prev');
    }
  };

  const handleComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      localStorage.setItem('demo-tour-completed', 'true');
      setHasSeenTour(true);
      setIsOpen(false);
      onComplete?.();
    }, 200);
  };

  const handleSkip = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      localStorage.setItem('demo-tour-completed', 'true');
      setHasSeenTour(true);
      setIsOpen(false);
    }, 200);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setDirection('next');
    setIsTransitioning(false);
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
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500",
          isTransitioning ? "opacity-70" : "opacity-100"
        )}
        onClick={handleSkip}
      />

      {/* Tour card */}
      <div className={`fixed z-50 ${getPositionClasses(step.position)}`}>
        <Card 
          className={cn(
            "bg-slate-800/95 backdrop-blur-xl border-primary/30 shadow-2xl max-w-md w-full mx-4",
            "transition-all duration-300 ease-out",
            isTransitioning && direction === 'next' && "opacity-0 translate-x-8 scale-95",
            isTransitioning && direction === 'prev' && "opacity-0 -translate-x-8 scale-95",
            !isTransitioning && "opacity-100 translate-x-0 scale-100"
          )}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (index !== currentStep) {
                          animateTransition(index, index > currentStep ? 'next' : 'prev');
                        }
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500 ease-out cursor-pointer hover:opacity-80",
                        index === currentStep 
                          ? 'bg-primary w-8 shadow-[0_0_10px_hsl(var(--primary)/0.5)]' 
                          : index < currentStep 
                            ? 'bg-primary/60 w-6 hover:bg-primary/80' 
                            : 'bg-white/20 w-6 hover:bg-white/40'
                      )}
                      aria-label={`Go to step ${index + 1}: ${tourSteps[index].title}`}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 
                className={cn(
                  "text-xl font-semibold text-white mb-2 transition-all duration-300",
                  isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                {step.title}
              </h3>
              <p 
                className={cn(
                  "text-slate-300 leading-relaxed transition-all duration-300 delay-75",
                  isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                {step.content}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={handleSkip}
              >
                Skip tour
              </Button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
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
        <div 
          className={cn(
            "fixed z-45 transition-all duration-500 ease-out",
            getHighlightClasses(step.target),
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 border-2 border-primary/40 rounded-xl animate-[pulse_2s_ease-in-out_infinite]" />
          {/* Inner highlight ring */}
          <div className="absolute inset-1 border border-primary/60 rounded-lg" />
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-[shimmer_2s_ease-in-out_infinite]" />
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
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
