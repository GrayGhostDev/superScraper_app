import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface MetricsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  iconColor: string;
  formatter?: (value: number) => string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  icon: Icon,
  title,
  value,
  iconColor,
  formatter = (v) => v.toString()
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {formatter(value)}
      </p>
    </div>
  );
};