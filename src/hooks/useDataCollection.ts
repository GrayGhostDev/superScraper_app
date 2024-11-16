import { useState } from 'react';
import { FormData, ValidationSchema } from '../types/forms';
import { notifications } from '../utils/notifications';

const initialFormData: FormData = {
  basicInformation: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  },
  locationDetails: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  incidentInformation: {
    date: '',
    time: '',
    description: '',
    witnesses: [],
    type: '',
  },
  injuryDetails: {
    injuryType: '',
    bodyPart: '',
    severity: '',
    treatment: '',
    medicalProvider: '',
  },
  documentation: {
    photos: [],
    documents: [],
    additionalNotes: '',
  },
};

export const useDataCollection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (
    section: keyof FormData,
    data: Partial<FormData[keyof FormData]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const isStepValid = (step: number): boolean => {
    const section = Object.keys(formData)[step - 1] as keyof FormData;
    const schema = ValidationSchema[section];
    try {
      schema.parse(formData[section]);
      return true;
    } catch {
      return false;
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    } else {
      notifications.show('Please complete the current step before proceeding', 'error');
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } else {
      notifications.show('Please complete all required fields', 'error');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitForm = async () => {
    if (Object.keys(formData).every((_, index) => isStepValid(index + 1))) {
      try {
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        notifications.show('Form submitted successfully!', 'success');
      } catch (error) {
        notifications.show('Failed to submit form. Please try again.', 'error');
      }
    } else {
      notifications.show('Please complete all required fields', 'error');
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const filename = `data-collection-${new Date().toISOString()}.${format}`;
    const data = format === 'json' 
      ? JSON.stringify(formData, null, 2)
      : convertToCSV(formData);
    
    const blob = new Blob([data], { type: `text/${format};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    currentStep,
    formData,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    isStepValid,
    submitForm,
    exportData,
  };
};

const convertToCSV = (data: FormData): string => {
  // Implementation of CSV conversion logic
  const headers = ['Field', 'Value'];
  const rows = [];

  for (const [section, fields] of Object.entries(data)) {
    rows.push([section, '']);
    for (const [field, value] of Object.entries(fields)) {
      rows.push([field, value.toString()]);
    }
  }

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
    ).join(','))
  ].join('\n');
};