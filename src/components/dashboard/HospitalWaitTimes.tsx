import React, { useEffect, useState } from 'react';
import { Timer, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import { useHospitalStore } from '../../store/hospitalStore';
import { HospitalWaitTimeService } from '../../lib/hospital/waitTimeService';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const waitTimeService = new HospitalWaitTimeService(
  import.meta.env.VITE_HOSPITAL_API_KEY || '',
  import.meta.env.VITE_HOSPITAL_API_URL || ''
);

export const HospitalWaitTimes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { waitTimes, updateWaitTime } = useHospitalStore();
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaitTimes = async () => {
      try {
        const hospitals = ['hosp_001', 'hosp_002', 'hosp_003'];
        const times = await waitTimeService.getWaitTimes(hospitals);
        Object.entries(times).forEach(([id, data]) => {
          updateWaitTime(id, data);
        });
      } catch (error) {
        console.error('Failed to fetch wait times:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitTimes();
  }, [updateWaitTime]);

  useEffect(() => {
    if (!selectedHospital) return;

    const unsubscribe = waitTimeService.subscribeToUpdates(
      selectedHospital,
      (data) => updateWaitTime(selectedHospital, data)
    );

    return () => {
      unsubscribe();
    };
  }, [selectedHospital, updateWaitTime]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const waitTimeData = Object.values(waitTimes).map((hospital) => ({
    name: hospital.name,
    emergency: hospital.departments.emergency,
    urgent: hospital.departments.urgent,
    standard: hospital.departments.standard,
  }));

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Hospital Wait Times</h2>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-gray-400">Loading wait times...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Hospital Wait Times</h2>
        </div>
        <div className="text-sm text-gray-500">
          Real-time updates every 5 minutes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.values(waitTimes).map((hospital) => (
          <div
            key={hospital.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedHospital === hospital.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-200'
            }`}
            onClick={() => setSelectedHospital(hospital.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{hospital.name}</h3>
              {getTrendIcon(hospital.trend)}
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Timer className="h-5 w-5 text-gray-400" />
              {hospital.currentWait} min
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {hospital.activeCases} active cases
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Updated {formatDistanceToNow(hospital.lastUpdated)} ago
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Wait Times by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="emergency"
                  stroke="#ef4444"
                  name="Emergency"
                />
                <Line
                  type="monotone"
                  dataKey="urgent"
                  stroke="#f59e0b"
                  name="Urgent Care"
                />
                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke="#3b82f6"
                  name="Standard"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {selectedHospital && waitTimes[selectedHospital] && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Department Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Emergency</span>
                <span className="font-medium text-red-600">
                  {waitTimes[selectedHospital].departments.emergency} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Urgent Care</span>
                <span className="font-medium text-amber-600">
                  {waitTimes[selectedHospital].departments.urgent} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Standard</span>
                <span className="font-medium text-blue-600">
                  {waitTimes[selectedHospital].departments.standard} min
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};