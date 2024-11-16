import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClaimData } from '../../../types/claims';
import { formatCurrency } from '../../../utils/formatters';

interface OutlierChartProps {
  data: ClaimData[];
}

export const OutlierChart: React.FC<OutlierChartProps> = ({ data }) => {
  return (
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
            data={data.filter(d => !d.isOutlier)}
            fill="#6366f1"
          />
          <Scatter
            name="Outliers"
            data={data.filter(d => d.isOutlier)}
            fill="#ef4444"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};