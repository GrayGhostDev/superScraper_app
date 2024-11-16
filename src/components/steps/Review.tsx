import React from 'react';
import { FormData } from '../../types/forms';
import { CheckCircle } from 'lucide-react';

interface ReviewProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const Review: React.FC<ReviewProps> = ({ formData }) => {
  const renderSection = (title: string, data: Record<string, any>) => (
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {Object.entries(data).map(([key, value]) => {
          if (Array.isArray(value)) {
            if (value[0] instanceof File) {
              return (
                <div key={key} className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {value.length} files uploaded
                  </dd>
                </div>
              );
            }
            return (
              <div key={key} className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {value.filter(Boolean).join(', ') || 'None'}
                </dd>
              </div>
            );
          }
          return (
            <div key={key}>
              <dt className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {value || 'Not provided'}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            Please review all information before submitting
          </p>
        </div>
      </div>

      {renderSection('Basic Information', formData.basicInformation)}
      {renderSection('Location Details', formData.locationDetails)}
      {renderSection('Incident Information', formData.incidentInformation)}
      {renderSection('Injury Details', formData.injuryDetails)}
      {renderSection('Documentation', formData.documentation)}
    </div>
  );
};