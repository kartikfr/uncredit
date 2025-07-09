import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, BarChart3, Sparkles } from 'lucide-react';

interface CompareOnboardingOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CompareOnboardingOverlay: React.FC<CompareOnboardingOverlayProps> = ({
  isVisible,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0 });
  const [compareButtonPosition, setCompareButtonPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      // Wait for the page to load and then show the spotlight
      const timer = setTimeout(() => {
        setShowSpotlight(true);
        setStep(0);
        
        // Calculate position for the compare button on the first card
        setTimeout(() => {
          const firstCard = document.querySelector('[data-card-index="0"]');
          if (firstCard) {
            const cardRect = firstCard.getBoundingClientRect();
            const compareButton = firstCard.querySelector('button[onclick*="onAddToCompare"]');
            if (compareButton) {
              const buttonRect = compareButton.getBoundingClientRect();
              setSpotlightPosition({
                top: buttonRect.top + buttonRect.height / 2,
                left: buttonRect.left + buttonRect.width / 2
              });
            } else {
              // Fallback position
              setSpotlightPosition({
                top: cardRect.top + 20,
                left: cardRect.left + 80
              });
            }
          }
          
          // Calculate position for the floating compare button
          const floatingCompareButton = document.querySelector('.fixed.bottom-6.right-6 button');
          if (floatingCompareButton) {
            const buttonRect = floatingCompareButton.getBoundingClientRect();
            setCompareButtonPosition({
              top: buttonRect.top + buttonRect.height / 2,
              left: buttonRect.left + buttonRect.width / 2
            });
          } else {
            // Fallback position
            setCompareButtonPosition({
              top: window.innerHeight - 100,
              left: window.innerWidth - 200
            });
          }
        }, 500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "Welcome to Card Comparison! 🔍",
      description: "Let me show you how to compare up to 3 credit cards side by side to make the best decision for your needs.",
      position: "top-4 left-4"
    },
    {
      title: "Add Cards to Compare",
      description: "Click the (+) button on any card to add it to your comparison list. You can select up to 3 cards at a time.",
      position: "top-4 left-4"
    },
    {
      title: "Compare Selected Cards",
      description: "Once you've selected your cards, click the 'Compare Cards' button that appears at the bottom right to view the detailed comparison.",
      position: "bottom-4 right-4"
    },
    {
      title: "You're Ready to Compare! 🎉",
      description: "Now you can easily compare cards based on fees, features, rewards, and more. The comparison tool will help you make informed decisions.",
      position: "top-4 left-4"
    }
  ];

  const currentStep = steps[step];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      {/* Spotlight effect around the compare button on first card */}
      {showSpotlight && step === 1 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div 
            className="absolute w-8 h-8 rounded-full bg-white/20 border-2 border-success/50 shadow-lg animate-pulse"
            style={{
              top: spotlightPosition.top - 16,
              left: spotlightPosition.left - 16,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      )}

      {/* Spotlight effect around the floating compare button */}
      {showSpotlight && step === 2 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div 
            className="absolute w-48 h-16 rounded-lg bg-white/20 border-2 border-success/50 shadow-lg animate-pulse"
            style={{
              top: compareButtonPosition.top - 32,
              left: compareButtonPosition.left - 96,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      )}

      {/* Onboarding Card */}
      <div className={`absolute ${currentStep.position} max-w-md bg-card border border-border rounded-lg shadow-xl p-6 animate-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">{currentStep.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === step ? 'bg-success' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span>{step + 1} of {steps.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-success hover:bg-success/90"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              {step === 1 ? <Plus className="ml-2 h-4 w-4" /> : 
               step === 2 ? <BarChart3 className="ml-2 h-4 w-4" /> : 
               <Sparkles className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating tip near the compare button */}
      {showSpotlight && step === 1 && (
        <div 
          className="absolute bg-success text-white px-3 py-2 rounded-lg shadow-lg animate-bounce"
          style={{
            top: spotlightPosition.top - 40,
            left: spotlightPosition.left + 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="text-sm font-medium">Click to add!</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-success"></div>
        </div>
      )}

      {/* Floating tip near the floating compare button */}
      {showSpotlight && step === 2 && (
        <div 
          className="absolute bg-success text-white px-3 py-2 rounded-lg shadow-lg animate-bounce"
          style={{
            top: compareButtonPosition.top - 60,
            left: compareButtonPosition.left - 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="text-sm font-medium">Click to compare!</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-success"></div>
        </div>
      )}
    </div>
  );
};

export default CompareOnboardingOverlay; 