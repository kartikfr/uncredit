import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Sparkles } from 'lucide-react';

interface AIOnboardingOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AIOnboardingOverlay: React.FC<AIOnboardingOverlayProps> = ({
  isVisible,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      // Wait for the page to load and then show the spotlight
      const timer = setTimeout(() => {
        setShowSpotlight(true);
        setStep(0);
        
        // Calculate position for the Ask AI button on the first card
        setTimeout(() => {
          const firstCard = document.querySelector('[data-card-index="0"]');
          if (firstCard) {
            const cardRect = firstCard.getBoundingClientRect();
            // Look for the Ask AI button more specifically
            const askAIButton = firstCard.querySelector('button:has([data-testid="ask-ai"])') || 
                               firstCard.querySelector('button[onclick*="onAskAI"]') ||
                               firstCard.querySelector('button:has(.lucide-message-circle)');
            
            if (askAIButton) {
              const buttonRect = askAIButton.getBoundingClientRect();
              setSpotlightPosition({
                top: buttonRect.top + buttonRect.height / 2,
                left: buttonRect.left + buttonRect.width / 2
              });
            } else {
              // Fallback position - look for the action buttons area
              const actionButtons = firstCard.querySelector('.flex.flex-col.items-end');
              if (actionButtons) {
                const buttonsRect = actionButtons.getBoundingClientRect();
                setSpotlightPosition({
                  top: buttonsRect.top + buttonsRect.height / 2,
                  left: buttonsRect.left + buttonsRect.width / 2
                });
              } else {
                // Final fallback position
                setSpotlightPosition({
                  top: cardRect.top + cardRect.height * 0.7,
                  left: cardRect.right - 100
                });
              }
            }
          }
        }, 500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (step < 2) {
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
      title: "Welcome to AI Assistant! 🤖",
      description: "Let me show you how to use our AI-powered card assistant to get personalized recommendations and answers to your questions.",
      position: "top-4 left-4"
    },
    {
      title: "Ask AI Button",
      description: "Click the 'Ask AI' button on any card to start a conversation. You can ask about fees, benefits, eligibility, or get personalized advice!",
      position: "top-4 left-4"
    },
    {
      title: "You're All Set! 🎉",
      description: "Now you can explore cards and use AI Assistant whenever you need help. The AI will remember your preferences and provide personalized recommendations.",
      position: "top-4 left-4"
    }
  ];

  const currentStep = steps[step];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      {/* Spotlight effect around the first Ask AI button */}
      {showSpotlight && step === 1 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div 
            className="absolute w-32 h-12 rounded-lg bg-white/20 border-2 border-primary/50 shadow-lg animate-pulse"
            style={{
              top: spotlightPosition.top - 24,
              left: spotlightPosition.left - 64,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      )}

      {/* Onboarding Card */}
      <div className={`absolute ${currentStep.position} max-w-md bg-card border border-border rounded-lg shadow-xl p-6 animate-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
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
                    index === step ? 'bg-primary' : 'bg-muted'
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
              className="bg-primary hover:bg-primary/90"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating tip near the Ask AI button */}
      {showSpotlight && step === 1 && (
        <div 
          className="absolute bg-primary text-white px-3 py-2 rounded-lg shadow-lg animate-bounce"
          style={{
            top: spotlightPosition.top - 60,
            left: spotlightPosition.left + 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="text-sm font-medium">Click here!</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      )}
    </div>
  );
};

export default AIOnboardingOverlay; 