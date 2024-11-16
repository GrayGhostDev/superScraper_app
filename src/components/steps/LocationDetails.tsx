import React from 'react';
import { FormData } from '../../types/forms';

interface LocationDetailsProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  formData,
  updateFormData,
}) => {
  const { address, city, state, zipCode, country } = formData.locationDetails;

  const handleChange = (field: string, value: string) => {
    updateFormData('locationDetails', { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Street Address *
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP/Postal Code *
          </label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => handleChange('country', e.target.value)}
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