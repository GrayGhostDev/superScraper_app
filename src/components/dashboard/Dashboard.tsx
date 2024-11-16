import React, { useState } from 'react';
import { InputPanel } from './InputPanel';
import { ClaimsAnalysis } from './ClaimsAnalysis';
import { LocationAnalytics } from './LocationAnalytics';
import { InjuryTracking } from './InjuryTracking';
import { KeyMetrics } from './KeyMetrics';
import { DataCollectionForm } from '../DataCollectionForm';
import { DataViewer } from './DataViewer';
import { DataVisualizations } from '../DataVisualization';
import { PredictiveModel } from '../predictive/PredictiveModel';
import { ClaimsTriage } from '../predictive/ClaimsTriage';
import { OutlierDetection } from '../predictive/OutlierDetection';
import { BarChart2, MapPin, Activity, FileText, PieChart, Brain, Database } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'claims', label: 'Claims Analysis', icon: PieChart },
  { id: 'location', label: 'Location Analytics', icon: MapPin },
  { id: 'injury', label: 'Injury Tracking', icon: Activity },
  { id: 'predictive', label: 'Predictive Analytics', icon: Brain },
  { id: 'collection', label: 'Data Collection', icon: FileText },
  { id: 'data', label: 'Data Viewer', icon: Database },
];

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <KeyMetrics />
            <div className="mt-6">
              <DataVisualizations />
            </div>
          </>
        );
      case 'claims':
        return <ClaimsAnalysis />;
      case 'location':
        return <LocationAnalytics />;
      case 'injury':
        return <InjuryTracking />;
      case 'predictive':
        return (
          <div className="space-y-6">
            <PredictiveModel />
            <ClaimsTriage />
            <OutlierDetection />
          </div>
        );
      case 'collection':
        return <DataCollectionForm />;
      case 'data':
        return <DataViewer />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InputPanel />
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                        ${
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};