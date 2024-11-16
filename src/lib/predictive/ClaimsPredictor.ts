import * as tf from '@tensorflow/tfjs';
import { ModelService } from './ModelService';
import { notifications } from '../../utils/notifications';

export class ClaimsPredictor {
  private modelService: ModelService;
  private historicalData: any[] = [];

  constructor() {
    this.modelService = new ModelService();
  }

  async initialize(historicalData: any[]) {
    this.historicalData = historicalData;
    const initialized = await this.modelService.initialize();
    
    if (initialized) {
      await this.trainModel();
    }
    
    return initialized;
  }

  private async trainModel() {
    if (this.historicalData.length === 0) return;

    const { inputs, outputs } = this.preprocessData(this.historicalData);
    await this.modelService.train({ inputs, outputs });
  }

  private preprocessData(data: any[]) {
    const inputs = data.map(claim => [
      claim.value,
      claim.processingTime,
      claim.complexity,
      claim.risk,
      claim.age,
      claim.previousClaims,
      claim.severity,
      claim.type,
      claim.location,
      claim.season
    ]);

    const outputs = data.map(claim => [claim.finalValue]);

    return { inputs, outputs };
  }

  async predictClaimValue(claimData: any) {
    try {
      const processedInput = this.preprocessData([claimData]).inputs;
      const prediction = this.modelService.predict(processedInput);
      return prediction[0];
    } catch (error) {
      console.error('Prediction error:', error);
      notifications.show('Failed to predict claim value', 'error');
      return null;
    }
  }

  async predictBatch(claims: any[]) {
    try {
      const processedInputs = this.preprocessData(claims).inputs;
      return this.modelService.predict(processedInputs);
    } catch (error) {
      console.error('Batch prediction error:', error);
      notifications.show('Failed to process batch predictions', 'error');
      return [];
    }
  }

  onTrainingProgress(callback: (metrics: any) => void) {
    return this.modelService.onTrainingProgress(callback);
  }

  async saveModel() {
    return await this.modelService.saveModel('claims-predictor');
  }

  async loadModel() {
    return await this.modelService.loadModel('claims-predictor');
  }
}