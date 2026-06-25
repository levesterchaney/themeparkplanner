'use client';

import React from 'react';
import { Button } from '@/components';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
  isOptional?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: (data: unknown) => void;
  onCancel?: () => void;
  completionData?: unknown;
  isLoading?: boolean;
  className?: string;
}

export default function Wizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onCancel,
  completionData,
  isLoading = false,
  className = '',
}: WizardProps) {
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData?.isValid !== false;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(completionData);
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or the next step if current is valid
    if (stepIndex <= currentStep || canProceed) {
      onStepChange(stepIndex);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg flex flex-col h-full ${className}`}
    >
      {/* Step Progress Indicator */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center cursor-pointer"
              onClick={() => handleStepClick(index)}
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200
                  ${
                    index < currentStep
                      ? 'bg-green-600 text-white' // Completed
                      : index === currentStep
                        ? 'bg-blue-600 text-white' // Current
                        : index === currentStep + 1 && canProceed
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' // Next available
                          : 'bg-gray-200 text-gray-500' // Future/disabled
                  }
                `}
              >
                {index < currentStep ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step Label */}
              <div className="ml-3 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 ${
                      index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 py-8 overflow-y-auto flex-1 min-h-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStepData?.title}
          </h2>
          {currentStepData?.description && (
            <p className="mt-2 text-gray-600">{currentStepData.description}</p>
          )}
        </div>

        <div className="min-h-[400px]">{currentStepData?.content}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex space-x-3">
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" disabled={isLoading}>
              Cancel
            </Button>
          )}
          {!isFirstStep && (
            <Button
              onClick={handleBack}
              variant="secondary"
              disabled={isLoading}
            >
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Progress indicator */}
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>

          <Button
            onClick={handleNext}
            variant="primary"
            disabled={!canProceed || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isLastStep ? (
              'Generate Itinerary'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
