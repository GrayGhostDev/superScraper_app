export const MOCK_INCIDENTS = [
  {
    id: 'inc_001',
    type: 'accident',
    severity: 'major',
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128]
    },
    description: 'Multi-vehicle collision',
    startTime: new Date(),
    delay: 1200,
    probability: 'certain',
    affectedRoads: ['I-95']
  },
  {
    id: 'inc_002',
    type: 'accident',
    severity: 'moderate',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]
    },
    description: 'Vehicle breakdown causing delays',
    startTime: new Date(),
    delay: 600,
    probability: 'certain',
    affectedRoads: ['FDR Drive']
  },
  {
    id: 'inc_003',
    type: 'accident',
    severity: 'severe',
    location: {
      type: 'Point',
      coordinates: [-73.984634, 40.748817]
    },
    description: 'Major accident with injuries',
    startTime: new Date(),
    delay: 1800,
    probability: 'certain',
    affectedRoads: ['7th Ave']
  }
];