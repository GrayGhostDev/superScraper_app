import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface AIResultsChartProps {
  data: Record<string, number>;
}

export const AIResultsChart: React.FC<AIResultsChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value: value
  }));

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Metrics</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="value" 
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};