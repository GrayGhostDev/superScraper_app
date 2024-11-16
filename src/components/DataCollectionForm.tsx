import React from 'react';
import { AddJobForm } from './AddJobForm';
import { ConfigPanel } from './ConfigPanel';
import { JobList } from './JobList';
import { StatsPanel } from './StatsPanel';

export const DataCollectionForm: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <AddJobForm />
        <JobList />
      </div>
      <div className="space-y-6">
        <StatsPanel />
        <ConfigPanel />
      </div>
    </div>
  );
};