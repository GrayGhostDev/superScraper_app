import React from 'react';
import { FormData } from '../../types/forms';

interface InjuryDetailsProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const InjuryDetails: React.FC<InjuryDetailsProps> = ({
  formData,
  updateFormData,
}) => {
  const { injuryType, bodyPart, severity, treatment, medicalProvider } = formData.injuryDetails;

  const handleChange = (field: string, value: string) => {
    updateFormData('injuryDetails', { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="injuryType" className="block text-sm font-medium text-gray-700">
            Type of Injury *
          </label>
          <select
            id="injuryType"
            value={injuryType}
            onChange={(e) => handleChange('injuryType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select injury type...</option>
            <option value="sprain">Sprain/Strain</option>
            <option value="fracture">Fracture</option>
            <option value="laceration">Laceration</option>
            <option value="burn">Burn</option>
            <option value="concussion">Concussion</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="bodyPart" className="block text-sm font-medium text-gray-700">
            Affected Body Part *
          </label>
          <select
            id="bodyPart"
            value={bodyPart}
            onChange={(e) => handleChange('bodyPart', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select body part...</option>
            <option value="head">Head</option>
            <option value="neck">Neck</option>
            <option value="back">Back</option>
            <option value="arm">Arm</option>
            <option value="hand">Hand</option>
            <option value="leg">Leg</option>
            <option value="foot">Foot</option>
            <option value="multiple">Multiple Parts</option>
          </select>
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity *
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select severity...</option>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">
            Initial Treatment *
          </label>
          <select
            id="treatment"
            value={treatment}
            onChange={(e) => handleChange('treatment', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select treatment...</option>
            <option value="first-aid">First Aid</option>
            <option value="emergency">Emergency Room</option>
            <option value="hospitalization">Hospitalization</option>
            <option value="none">No Treatment Required</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="medicalProvider" className="block text-sm font-medium text-gray-700">
            Medical Provider *
          </label>
          <input
            type="text"
            id="medicalProvider"
            value={medicalProvider}
            onChange={(e) => handleChange('medicalProvider', e.target.value)}
            placeholder="Name of hospital, clinic, or healthcare provider"
            className="mt-1"
            required
          />
        </div>
      </div>

      <div className="text-sm text-gray-500">
        * Required fields
      </div>
    </div>
  );
};