import React from 'react';
import { FormData } from '../../types/forms';

interface BasicInformationProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  updateFormData,
}) => {
  const { firstName, lastName, email, phone, dateOfBirth } = formData.basicInformation;

  const handleChange = (field: string, value: string) => {
    updateFormData('basicInformation', { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
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