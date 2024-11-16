import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTensorflow } from '../../hooks/useTensorflow';
import { ClaimData } from '../../types/claims';
import { notifications } from '../../utils/notifications';

export const OutlierDetection: React.FC = () => {
  const [claimData, setClaimData] = useState<ClaimData[]>([]);
  const [outlierThreshold, setOutlierThreshold] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalOutliers: 0,
    averageValue: 0,
    maxValue: 0,
    outlierPercentage: 0
  });

  const { tf, isInitialized } = useTensorflow();

  useEffect(() => {
    if (isInitialized) {
      detectOutliers();
    }
  }, [isInitialized]);

  const detectOutliers = async () => {
    if (!tf) return;

    setIsProcessing(true);
    try {
      const mockData = generateMockData();
      
      // Convert to tensor
      const tensorData = tf.tensor2d(
        mockData.map(d => [d.value, d.processingTime, d.complexity])
      );

      // Standardize the data
      const { mean, variance } = tf.moments(tensorData, 0);
      const standardized = tensorData.sub(mean).div(tf.sqrt(variance));

      // Calculate Mahalanobis distances
      const distances = standardized.norm('euclidean', 1);
      const distanceValues = await distances.array();

      // Mark outliers
      const processedData = mockData.map((claim, i) => ({
        ...claim,
        isOutlier: distanceValues[i] > outlierThreshold
      }));

      // Calculate metrics
      const outliers = processedData.filter(d => d.isOutlier);
      const claimValues = processedData.map(d => d.value);
      const maxValue = Math.max(...claimValues);
      const averageValue = claimValues.reduce((a, b) => a + b, 0) / claimValues.length;

      setMetrics({
        totalOutliers: outliers.length,
        averageValue,
        maxValue,
        outlierPercentage: (outliers.length / processedData.length) * 100
      });

      setClaimData(processedData);

      // Cleanup tensors
      tensorData.dispose();
      mean.dispose();
      variance.dispose();
      standardized.dispose();
      distances.dispose();

    } catch (error) {
      console.error('Error detecting outliers:', error);
      notifications.show('Failed to detect outliers', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockData = (): ClaimData[] => {
    return Array.from({ length: 100 }, (_, i) => {
      const baseValue = Math.random() * 50000 + 5000;
      const isAnomaly = Math.random() < 0.1;
      
      return {
        id: `CL-${String(i).padStart(6, '0')}`,
        value: isAnomaly ? baseValue * 3 : baseValue,
        processingTime: isAnomaly ? Math.random() * 100 + 50 : Math.random() * 30 + 10,
        complexity: isAnomaly ? Math.random() * 5 + 3 : Math.random() * 3 + 1,
        isOutlier: false
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Outlier Detection</h2>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-amber-600">
              <Activity className="h-5 w-5 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-gray-600">Total Outliers</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalOutliers}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <p className="text-sm text-gray-600">Average Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.averageValue)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-600">Max Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.maxValue)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <p className="text-sm text-gray-600">Outlier Percentage</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.outlierPercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outlier Threshold (σ)
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={outlierThreshold}
            onChange={(e) => {
              setOutlierThreshold(parseFloat(e.target.value));
              detectOutliers();
            }}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Less Strict</span>
            <span>{outlierThreshold}σ</span>
            <span>More Strict</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="value" 
                name="Claim Value"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                dataKey="processingTime" 
                name="Processing Time"
                unit=" days"
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "Claim Value") return formatCurrency(value);
                  if (name === "Processing Time") return `${value} days`;
                  return value;
                }}
              />
              <Scatter
                name="Normal Claims"
                data={claimData.filter(d => !d.isOutlier)}
                fill="#6366f1"
              />
              <Scatter
                name="Outliers"
                data={claimData.filter(d => d.isOutlier)}
                fill="#ef4444"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detected Outliers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complexity Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claimData
                  .filter(claim => claim.isOutlier)
                  .map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(claim.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.processingTime.toFixed(1)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-indigo-600 rounded-full"
                              style={{ width: `${(claim.complexity / 5) * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {claim.complexity.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};