import React from 'react';
import { FormData } from '../../types/forms';
import { Plus, X } from 'lucide-react';

interface IncidentInformationProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const IncidentInformation: React.FC<IncidentInformationProps> = ({
  formData,
  updateFormData,
}) => {
  const { date, time, description, witnesses, type } = formData.incidentInformation;

  const handleChange = (field: string, value: string | string[]) => {
    updateFormData('incidentInformation', { [field]: value });
  };

  const addWitness = () => {
    handleChange('witnesses', [...witnesses, '']);
  };

  const removeWitness = (index: number) => {
    const newWitnesses = witnesses.filter((_, i) => i !== index);
    handleChange('witnesses', newWitnesses);
  };

  const updateWitness = (index: number, value: string) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index] = value;
    handleChange('witnesses', newWitnesses);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date of Incident *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time of Incident *
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => handleChange('time', e.target.value)}
            className="mt-1"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type of Incident *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select type...</option>
          <option value="slip-and-fall">Slip and Fall</option>
          <option value="vehicle-accident">Vehicle Accident</option>
          <option value="workplace-injury">Workplace Injury</option>
          <option value="medical-incident">Medical Incident</option>
          <option value="property-damage">Property Damage</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description of Incident *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Witnesses
          </label>
          <button
            type="button"
            onClick={addWitness}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Witness
          </button>
        </div>
        
        <div className="space-y-2">
          {witnesses.map((witness, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={witness}
                onChange={(e) => updateWitness(index, e.target.value)}
                placeholder="Witness name"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeWitness(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        * Required fields
      </div>
    </div>
  );
};