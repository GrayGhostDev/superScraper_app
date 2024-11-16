import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { useTensorflow } from '../../../hooks/useTensorflow';
import { MetricsCard } from './MetricsCard';
import { OutlierChart } from './OutlierChart';
import { OutlierTable } from './OutlierTable';
import { ClaimData } from '../../../types/claims';
import { notifications } from '../../../utils/notifications';

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

  const handleInvestigate = (claim: ClaimData) => {
    notifications.show(`Investigating claim ${claim.id}`, 'info');
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
          <MetricsCard
            icon={AlertTriangle}
            title="Total Outliers"
            value={metrics.totalOutliers}
            iconColor="text-red-500"
          />
          <MetricsCard
            icon={DollarSign}
            title="Average Value"
            value={metrics.averageValue}
            iconColor="text-green-500"
            formatter={formatCurrency}
          />
          <MetricsCard
            icon={TrendingUp}
            title="Max Value"
            value={metrics.maxValue}
            iconColor="text-blue-500"
            formatter={formatCurrency}
          />
          <MetricsCard
            icon={Activity}
            title="Outlier Percentage"
            value={metrics.outlierPercentage}
            iconColor="text-purple-500"
            formatter={(v) => `${v.toFixed(1)}%`}
          />
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

        <OutlierChart data={claimData} />

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detected Outliers</h3>
          <OutlierTable
            claims={claimData.filter(claim => claim.isOutlier)}
            onInvestigate={handleInvestigate}
          />
        </div>
      </div>
    </div>
  );
};