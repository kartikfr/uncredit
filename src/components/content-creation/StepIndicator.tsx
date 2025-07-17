import React from 'react';
import { 
  Sparkles, 
  Monitor, 
  CreditCard, 
  User, 
  MessageSquare, 
  Edit3, 
  Calendar, 
  History,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  onStepClick: (stepId: string) => void;
  completedSteps: string[];
}

const stepConfig: Step[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Sparkles,
    description: 'Choose your platform'
  },
  {
    id: 'platform',
    name: 'Format',
    icon: Monitor,
    description: 'Select content format'
  },
  {
    id: 'cards',
    name: 'Cards',
    icon: CreditCard,
    description: 'Choose credit cards'
  },
  {
    id: 'tone',
    name: 'Tone',
    icon: User,
    description: 'Set your tone'
  },
  {
    id: 'prompt',
    name: 'Generate',
    icon: MessageSquare,
    description: 'Generate content'
  },
  {
    id: 'editor',
    name: 'Edit',
    icon: Edit3,
    description: 'Edit & format'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: Calendar,
    description: 'Schedule & publish'
  },
  {
    id: 'history',
    name: 'History',
    icon: History,
    description: 'View history'
  }
];

export default function StepIndicator({ 
  currentStep, 
  onStepClick, 
  completedSteps 
}: Omit<StepIndicatorProps, 'steps'>) {
  const currentStepIndex = stepConfig.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / stepConfig.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="absolute -top-6 left-0 text-xs text-gray-500">
          Step {currentStepIndex + 1} of {stepConfig.length}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {stepConfig.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = index <= currentStepIndex; // Can only go to current or previous steps
          
          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Icon */}
              <Button
                variant="ghost"
                size="sm"
                className={`w-12 h-12 rounded-full p-0 transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-emerald-500 text-white shadow-lg scale-110' 
                    : isCompleted 
                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </Button>

              {/* Step Name */}
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium ${
                  isCurrent ? 'text-emerald-600' : 
                  isCompleted ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-400 mt-1 max-w-16">
                  {step.description}
                </div>
              </div>

              {/* Connection Line */}
              {index < stepConfig.length - 1 && (
                <div className="absolute top-6 left-full w-full h-0.5 bg-gray-200 -z-10">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: isCompleted ? '100%' : 
                             index < currentStepIndex ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              )}

              {/* Current Step Indicator */}
              {isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <motion.div
        className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          {(() => {
            const Icon = stepConfig[currentStepIndex]?.icon || Sparkles;
            return <Icon className="h-5 w-5 text-emerald-600" />;
          })()}
          <div>
            <h3 className="font-semibold text-emerald-800">
              {stepConfig[currentStepIndex]?.name || 'Current Step'}
            </h3>
            <p className="text-sm text-emerald-700">
              {stepConfig[currentStepIndex]?.description || 'Complete this step to continue'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 