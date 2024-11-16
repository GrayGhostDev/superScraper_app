import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`relative ${
                index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
              }`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => onStepClick(step.id)}
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                    step.id < currentStep
                      ? 'bg-indigo-600'
                      : step.id === currentStep
                      ? 'border-2 border-indigo-600 bg-white'
                      : 'border-2 border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        step.id === currentStep ? 'bg-indigo-600' : 'bg-transparent'
                      }`}
                    />
                  )}
                </button>
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 h-0.5 w-full ${
                      step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <span
                className={`absolute -bottom-6 w-max text-sm font-medium ${
                  step.id === currentStep
                    ? 'text-indigo-600'
                    : step.id < currentStep
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};