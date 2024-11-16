import React from 'react';

interface Entity {
  text: string;
  type: string;
  confidence: number;
}

interface EntityHighlighterProps {
  entities: Entity[];
}

export const EntityHighlighter: React.FC<EntityHighlighterProps> = ({ entities }) => {
  const getEntityColor = (type: string): string => {
    const colors: Record<string, string> = {
      person: 'bg-blue-100 text-blue-800',
      organization: 'bg-purple-100 text-purple-800',
      location: 'bg-green-100 text-green-800',
      date: 'bg-yellow-100 text-yellow-800',
      money: 'bg-emerald-100 text-emerald-800',
      percentage: 'bg-pink-100 text-pink-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase()] || colors.default;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {entities.map((entity, index) => (
          <div
            key={index}
            className={`px-2 py-1 rounded-md text-sm ${getEntityColor(entity.type)}`}
            title={`Confidence: ${Math.round(entity.confidence * 100)}%`}
          >
            <span className="font-medium">{entity.text}</span>
            <span className="text-xs ml-1 opacity-75">({entity.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
};