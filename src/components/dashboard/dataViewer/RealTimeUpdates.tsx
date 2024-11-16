import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealTimeUpdates } from '../../../hooks/useRealTimeUpdates';
import { webSocketService } from '../../../lib/services/webSocketService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export const RealTimeUpdates: React.FC = () => {
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    average: 0,
    min: 0,
    max: 0,
    trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
  });

  useEffect(() => {
    const handleUpdate = (data: any) => {
      const timestamp = new Date();
      const newData = { ...data, timestamp };
      
      setRealtimeData(prev => {
        const updated = [...prev, newData].slice(-20);
        
        // Calculate metrics
        const values = updated.map(d => d.value);
        const total = values.reduce((a, b) => a + b, 0);
        const average = total / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        // Calculate trend
        const trend = updated.length > 1 
          ? updated[updated.length - 1].value > updated[updated.length - 2].value
            ? 'increasing'
            : updated[updated.length - 1].value < updated[updated.length - 2].value
              ? 'decreasing'
              : 'stable'
          : 'stable';

        setMetrics({ total, average, min, max, trend });
        
        return updated;
      });
    };

    const unsubscribe = webSocketService.subscribe('updates', handleUpdate);
    setIsConnected(webSocketService.isConnected());

    return () => {
      unsubscribe();
    };
  }, []);

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium">Real-Time Updates</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            {getTrendIcon()}
          </div>
          <p className="text-2xl font-bold mt-1">{metrics.total.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <span className="text-sm text-gray-600">Average</span>
          <p className="text-2xl font-bold mt-1">{metrics.average.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <span className="text-sm text-gray-600">Minimum</span>
          <p className="text-2xl font-bold mt-1">{metrics.min.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <span className="text-sm text-gray-600">Maximum</span>
          <p className="text-2xl font-bold mt-1">{metrics.max.toFixed(2)}</p>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Live Data Stream</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {realtimeData.slice(-3).reverse().map((update, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Update #{realtimeData.length - index}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(update.timestamp, { addSuffix: true })}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Value</span>
                <span className="font-medium">{update.value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm">{update.type}</span>
              </div>
              {update.change && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Change</span>
                  <span className={`text-sm ${
                    update.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {update.change > 0 ? '+' : ''}{update.change.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};