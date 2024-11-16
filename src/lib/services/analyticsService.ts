import { notifications } from '../../utils/notifications';
import * as tf from '@tensorflow/tfjs';

class AnalyticsService {
  private static instance: AnalyticsService;
  private model: tf.LayersModel | null = null;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize() {
    try {
      await tf.ready();
      
      // Initialize TensorFlow model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 1 })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      return true;
    } catch (error) {
      console.error('Analytics initialization error:', error);
      notifications.show('Failed to initialize analytics', 'error');
      return false;
    }
  }

  async analyzeTrends(data: any[]) {
    try {
      const trends = {
        temporal: await this.analyzeTemporalPatterns(data),
        spatial: await this.analyzeSpatialPatterns(data),
        categorical: this.analyzeCategoricalDistribution(data),
        correlations: this.analyzeCorrelations(data),
        insights: this.generateInsights(data)
      };

      return trends;
    } catch (error) {
      console.error('Trend analysis error:', error);
      notifications.show('Failed to analyze trends', 'error');
      throw error;
    }
  }

  private generateInsights(data: any[]) {
    const insights = [];

    // Growth trend
    const growth = this.calculateGrowthTrend(data);
    insights.push({
      type: 'trend',
      title: 'Growth Trend',
      description: `${growth > 0 ? 'Positive' : 'Negative'} growth trend observed`,
      value: Math.abs(growth).toFixed(1) + '%',
      change: growth
    });

    // Pattern detection
    const patterns = this.detectPatterns(data);
    patterns.forEach(pattern => {
      insights.push({
        type: 'pattern',
        title: pattern.name,
        description: pattern.description,
        value: pattern.value,
        confidence: pattern.confidence
      });
    });

    return insights;
  }

  private calculateGrowthTrend(data: any[]): number {
    if (data.length < 2) return 0;
    
    const firstValue = data[0].value || 0;
    const lastValue = data[data.length - 1].value || 0;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  private detectPatterns(data: any[]) {
    const patterns = [];

    // Seasonality detection
    const seasonality = this.detectSeasonality(data);
    if (seasonality.exists) {
      patterns.push({
        name: 'Seasonal Pattern',
        description: `Seasonal cycle detected with period of ${seasonality.period} units`,
        value: `${seasonality.period} units`,
        confidence: seasonality.confidence
      });
    }

    // Clustering
    const clusters = this.detectClusters(data);
    if (clusters.length > 0) {
      patterns.push({
        name: 'Data Clusters',
        description: `${clusters.length} distinct data clusters identified`,
        value: clusters.length.toString(),
        confidence: 0.85
      });
    }

    return patterns;
  }

  private detectSeasonality(data: any[]) {
    // Implementation of seasonality detection
    return {
      exists: false,
      period: 0,
      confidence: 0
    };
  }

  private detectClusters(data: any[]) {
    // Implementation of clustering
    return [];
  }

  private async analyzeTemporalPatterns(data: any[]) {
    const timestamps = data.map(item => new Date(item.timestamp).getTime());
    const values = data.map(item => item.value);

    const tensor = tf.tensor2d(
      timestamps.map((t, i) => [t, values[i]]),
      [timestamps.length, 2]
    );

    // Perform time series analysis
    const patterns = {
      seasonality: this.detectSeasonality(tensor),
      trend: this.detectTrend(tensor),
      outliers: this.detectTemporalOutliers(tensor)
    };

    tensor.dispose();
    return patterns;
  }

  private async analyzeSpatialPatterns(data: any[]) {
    const locations = data
      .filter(item => item.location?.coordinates)
      .map(item => ({
        coordinates: item.location.coordinates,
        value: item.value
      }));

    return {
      clusters: this.detectSpatialClusters(locations),
      hotspots: this.detectHotspots(locations),
      density: this.calculateSpatialDensity(locations)
    };
  }

  private analyzeCategoricalDistribution(data: any[]) {
    const categories = new Map<string, number>();
    
    data.forEach(item => {
      if (item.category) {
        categories.set(
          item.category,
          (categories.get(item.category) || 0) + 1
        );
      }
    });

    return Array.from(categories.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / data.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzeCorrelations(data: any[]) {
    const numericalFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    const correlations = new Map<string, number>();

    for (let i = 0; i < numericalFields.length; i++) {
      for (let j = i + 1; j < numericalFields.length; j++) {
        const field1 = numericalFields[i];
        const field2 = numericalFields[j];
        
        const correlation = this.calculateCorrelation(
          data.map(item => item[field1]),
          data.map(item => item[field2])
        );

        correlations.set(`${field1}-${field2}`, correlation);
      }
    }

    return Array.from(correlations.entries())
      .map(([fields, value]) => ({
        fields: fields.split('-'),
        correlation: value,
        strength: Math.abs(value)
      }))
      .sort((a, b) => b.strength - a.strength);
  }

  private detectTrend(tensor: tf.Tensor2D) {
    // Implementation of trend detection
    return {
      direction: 'stable',
      magnitude: 0,
      confidence: 0
    };
  }

  private detectTemporalOutliers(tensor: tf.Tensor2D) {
    // Implementation of temporal outlier detection
    return [];
  }

  private detectSpatialClusters(locations: any[]) {
    // Implementation of spatial clustering
    return [];
  }

  private detectHotspots(locations: any[]) {
    // Implementation of hotspot detection
    return [];
  }

  private calculateSpatialDensity(locations: any[]) {
    // Implementation of spatial density calculation
    return {
      max: 0,
      min: 0,
      mean: 0,
      hotspots: []
    };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

export const analyticsService = AnalyticsService.getInstance();