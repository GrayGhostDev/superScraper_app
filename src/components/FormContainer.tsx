import React from 'react';
import { useDataCollection } from '../hooks/useDataCollection';
import { StepIndicator } from './StepIndicator';
import { BasicInformation } from './steps/BasicInformation';
import { LocationDetails } from './steps/LocationDetails';
import { IncidentInformation } from './steps/IncidentInformation';
import { InjuryDetails } from './steps/InjuryDetails';
import { Documentation } from './steps/Documentation';
import { Review } from './steps/Review';
import { ArrowLeft, ArrowRight, Save, Download } from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Incident' },
  { id: 4, title: 'Injury' },
  { id: 5, title: 'Documents' },
  { id: 6, title: 'Review' },
];

export const FormContainer: React.FC = () => {
  const {
    currentStep,
    formData,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    submitForm,
    exportData,
  } = useDataCollection();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformation formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <LocationDetails formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <IncidentInformation formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <InjuryDetails formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Documentation formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Review formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
        />
        
        <div className="p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}
            
            <div className="mt-8 flex items-center justify-between pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep === 6 && (
                  <>
                    <button
                      type="button"
                      onClick={() => exportData('json')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={submitForm}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Submit
                    </button>
                  </>
                )}
                {currentStep < 6 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};