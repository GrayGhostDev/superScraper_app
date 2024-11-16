import { notifications } from '../../utils/notifications';
import * as tf from '@tensorflow/tfjs';
import { OutlierDetector } from '../predictive/OutlierDetector';
import { ClaimsPredictor } from '../predictive/ClaimsPredictor';
import natural from 'natural';

interface AnalysisResult {
  summary: {
    totalItems: number;
    uniqueEntities: number;
    completeness: number;
    accuracy: number;
  };
  patterns: {
    type: string;
    frequency: number;
    confidence: number;
  }[];
  anomalies: {
    field: string;
    value: any;
    score: number;
  }[];
  sentiment: {
    score: number;
    label: string;
    confidence: number;
  };
  topics: {
    name: string;
    relevance: number;
    keywords: string[];
  }[];
  relationships: {
    source: string;
    target: string;
    type: string;
    strength: number;
  }[];
}

export class DataAnalyzer {
  private outlierDetector: OutlierDetector;
  private claimsPredictor: ClaimsPredictor;
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
  private classifier: natural.BayesClassifier;

  constructor() {
    this.outlierDetector = new OutlierDetector();
    this.claimsPredictor = new ClaimsPredictor();
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.classifier = new natural.BayesClassifier();

    // Train the classifier with sample data
    this.trainClassifier();
  }

  async analyzeData(data: any[]): Promise<AnalysisResult> {
    try {
      const [
        summary,
        patterns,
        anomalies,
        sentiment,
        topics,
        relationships
      ] = await Promise.all([
        this.generateSummary(data),
        this.detectPatterns(data),
        this.detectAnomalies(data),
        this.analyzeSentiment(data),
        this.extractTopics(data),
        this.findRelationships(data)
      ]);

      return {
        summary,
        patterns,
        anomalies,
        sentiment,
        topics,
        relationships
      };
    } catch (error) {
      console.error('Data analysis error:', error);
      notifications.show('Failed to analyze data', 'error');
      throw error;
    }
  }

  private async generateSummary(data: any[]) {
    const uniqueEntities = new Set(
      data.map(item => JSON.stringify(item))
    ).size;

    const completeness = this.calculateCompleteness(data);
    const accuracy = await this.estimateAccuracy(data);

    return {
      totalItems: data.length,
      uniqueEntities,
      completeness,
      accuracy
    };
  }

  private async detectPatterns(data: any[]) {
    const patterns: { type: string; frequency: number; confidence: number; }[] = [];
    
    // Analyze value patterns
    Object.keys(data[0] || {}).forEach(field => {
      const values = data.map(item => item[field]);
      const frequency = this.calculateFrequency(values);
      
      if (frequency > 0.1) { // 10% threshold
        patterns.push({
          type: `${field}_pattern`,
          frequency,
          confidence: this.calculatePatternConfidence(values)
        });
      }
    });

    return patterns;
  }

  private async detectAnomalies(data: any[]) {
    const anomalies: { field: string; value: any; score: number; }[] = [];
    
    // Convert data to tensor format
    const tensor = tf.tensor2d(
      data.map(item => Object.values(item).filter(val => typeof val === 'number'))
    );

    // Use outlier detector
    const outliers = await this.outlierDetector.detectOutliers(data);
    
    outliers.forEach((item, index) => {
      if (item.isOutlier) {
        Object.entries(data[index]).forEach(([field, value]) => {
          anomalies.push({
            field,
            value,
            score: item.outlierScore
          });
        });
      }
    });

    // Cleanup
    tensor.dispose();

    return anomalies;
  }

  private async analyzeSentiment(data: any[]) {
    const text = this.extractText(data);
    const tokens = this.tokenizer.tokenize(text);
    
    // Use classifier for sentiment analysis
    const sentiment = this.classifier.classify(text);
    const probs = this.classifier.getClassifications(text);
    
    return {
      score: this.calculateSentimentScore(tokens),
      label: sentiment,
      confidence: Math.max(...probs.map(p => p.value))
    };
  }

  private async extractTopics(data: any[]) {
    const topics: { name: string; relevance: number; keywords: string[]; }[] = [];
    const text = this.extractText(data);
    
    // Add document to TF-IDF
    this.tfidf.addDocument(text);
    
    // Get top terms
    const terms = this.tfidf.listTerms(0);
    const topTerms = terms
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, 10);
    
    // Group terms into topics
    const clusters = this.clusterTerms(topTerms);
    
    clusters.forEach((cluster, i) => {
      topics.push({
        name: `Topic ${i + 1}`,
        relevance: this.calculateTopicRelevance(cluster),
        keywords: cluster.map(term => term.term)
      });
    });

    return topics;
  }

  private async findRelationships(data: any[]) {
    const relationships: {
      source: string;
      target: string;
      type: string;
      strength: number;
    }[] = [];

    // Find correlations between fields
    const fields = Object.keys(data[0] || {});
    
    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        const source = fields[i];
        const target = fields[j];
        
        const correlation = this.calculateCorrelation(
          data.map(item => item[source]),
          data.map(item => item[target])
        );

        if (Math.abs(correlation) > 0.5) {
          relationships.push({
            source,
            target,
            type: correlation > 0 ? 'positive' : 'negative',
            strength: Math.abs(correlation)
          });
        }
      }
    }

    return relationships;
  }

  private calculateCompleteness(data: any[]): number {
    const fields = Object.keys(data[0] || {});
    const totalFields = fields.length * data.length;
    let nonEmptyFields = 0;

    data.forEach(item => {
      fields.forEach(field => {
        if (item[field] !== null && item[field] !== undefined && item[field] !== '') {
          nonEmptyFields++;
        }
      });
    });

    return nonEmptyFields / totalFields;
  }

  private async estimateAccuracy(data: any[]): Promise<number> {
    // Implementation would depend on validation rules and ground truth
    return 0.95;
  }

  private calculateFrequency(values: any[]): number {
    const counts = new Map<string, number>();
    values.forEach(value => {
      const key = JSON.stringify(value);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const maxCount = Math.max(...counts.values());
    return maxCount / values.length;
  }

  private calculatePatternConfidence(values: any[]): number {
    // Implementation would use statistical measures
    return 0.8;
  }

  private extractText(data: any[]): string {
    return data
      .map(item => Object.values(item).filter(val => typeof val === 'string'))
      .flat()
      .join(' ');
  }

  private calculateSentimentScore(tokens: string[]): number {
    // Implementation would use sentiment dictionary
    return 0.5;
  }

  private clusterTerms(terms: { term: string; tfidf: number; }[]) {
    // Simple clustering implementation
    const clusters: typeof terms[] = [];
    let currentCluster: typeof terms = [];

    terms.forEach(term => {
      if (currentCluster.length >= 3) {
        clusters.push(currentCluster);
        currentCluster = [];
      }
      currentCluster.push(term);
    });

    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    return clusters;
  }

  private calculateTopicRelevance(cluster: { term: string; tfidf: number; }[]): number {
    return cluster.reduce((sum, term) => sum + term.tfidf, 0) / cluster.length;
  }

  private calculateCorrelation(x: any[], y: any[]): number {
    // Implementation of Pearson correlation coefficient
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private trainClassifier() {
    // Train with sample data
    this.classifier.addDocument('excellent great amazing', 'positive');
    this.classifier.addDocument('good nice well done', 'positive');
    this.classifier.addDocument('bad terrible awful', 'negative');
    this.classifier.addDocument('poor disappointing', 'negative');
    this.classifier.train();
  }
}