import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronRight, AlertTriangle, FileText, Car, Stethoscope, CloudSun, Shield } from 'lucide-react';
import { ClaimType, InjurySeverity } from '../../types/claims';
import { useParameterStore } from '../../store/parameterStore';
import { notifications } from '../../utils/notifications';

export const InputPanel: React.FC = () => {
  const { parameters, updateParameters, validateParameters } = useParameterStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['claim']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleChange = (section: string, field: string, value: any) => {
    updateParameters(section as any, { [field]: value });
  };

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    fields: Array<{ key: string; label: string; type: string; options?: any[] }>
  ) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-gray-200 py-4">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {fields.map(({ key, label, type, options }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {label}
                </label>
                {type === 'select' ? (
                  <select
                    value={parameters[id as keyof typeof parameters]?.[key] || ''}
                    onChange={(e) => handleChange(id, key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select...</option>
                    {options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : type === 'textarea' ? (
                  <textarea
                    value={parameters[id as keyof typeof parameters]?.[key] || ''}
                    onChange={(e) => handleChange(id, key, e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                ) : (
                  <input
                    type={type}
                    value={parameters[id as keyof typeof parameters]?.[key] || ''}
                    onChange={(e) => handleChange(id, key, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">Parameters</h2>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {renderSection('claim', 'Claim Identification', <FileText className="h-4 w-4 text-gray-500" />, [
          { key: 'claim_id', label: 'Claim ID', type: 'text' },
          { key: 'policy_number', label: 'Policy Number', type: 'text' },
          { key: 'report_date', label: 'Report Date', type: 'date' }
        ])}

        {renderSection('claimant', 'Claimant Details', <Shield className="h-4 w-4 text-gray-500" />, [
          { key: 'name', label: 'Full Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'address', label: 'Address', type: 'text' }
        ])}

        {renderSection('accident', 'Accident Specifics', <AlertTriangle className="h-4 w-4 text-gray-500" />, [
          { key: 'date', label: 'Incident Date', type: 'date' },
          { key: 'time', label: 'Incident Time', type: 'time' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' }
        ])}

        {renderSection('vehicle', 'Vehicle Information', <Car className="h-4 w-4 text-gray-500" />, [
          { key: 'make', label: 'Make', type: 'text' },
          { key: 'model', label: 'Model', type: 'text' },
          { key: 'year', label: 'Year', type: 'number' },
          { key: 'vin', label: 'VIN', type: 'text' },
          { key: 'damage_description', label: 'Damage Description', type: 'textarea' }
        ])}

        {renderSection('injury', 'Injury Details', <Stethoscope className="h-4 w-4 text-gray-500" />, [
          { key: 'type', label: 'Injury Type', type: 'select', options: [
            { value: 'sprain', label: 'Sprain/Strain' },
            { value: 'fracture', label: 'Fracture' },
            { value: 'laceration', label: 'Laceration' },
            { value: 'concussion', label: 'Concussion' },
            { value: 'burn', label: 'Burn' }
          ]},
          { key: 'severity', label: 'Severity', type: 'select', options: [
            { value: InjurySeverity.MINOR, label: 'Minor' },
            { value: InjurySeverity.MODERATE, label: 'Moderate' },
            { value: InjurySeverity.SEVERE, label: 'Severe' },
            { value: InjurySeverity.CRITICAL, label: 'Critical' }
          ]},
          { key: 'treatment_facility', label: 'Treatment Facility', type: 'text' },
          { key: 'treatment_date', label: 'Treatment Date', type: 'date' }
        ])}

        {renderSection('weather', 'Weather Conditions', <CloudSun className="h-4 w-4 text-gray-500" />, [
          { key: 'conditions', label: 'Weather Conditions', type: 'select', options: [
            { value: 'clear', label: 'Clear' },
            { value: 'rain', label: 'Rain' },
            { value: 'snow', label: 'Snow' },
            { value: 'fog', label: 'Fog' },
            { value: 'wind', label: 'Strong Wind' }
          ]},
          { key: 'visibility', label: 'Visibility', type: 'select', options: [
            { value: 'good', label: 'Good' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'poor', label: 'Poor' }
          ]},
          { key: 'temperature', label: 'Temperature (°F)', type: 'number' }
        ])}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => {
            const errors = validateParameters();
            if (errors.length === 0) {
              notifications.show('Parameters applied successfully', 'success');
            } else {
              notifications.show(errors[0], 'error');
            }
          }}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Parameters
        </button>
      </div>
    </div>
  );
};