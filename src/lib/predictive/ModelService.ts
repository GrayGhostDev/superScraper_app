import * as tf from '@tensorflow/tfjs';
import { notifications } from '../../utils/notifications';

export class ModelService {
  private model: tf.LayersModel | null = null;
  private isTraining = false;
  private trainingCallbacks: Set<(metrics: any) => void> = new Set();

  async initialize() {
    try {
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
      console.error('Failed to initialize model:', error);
      notifications.show('Failed to initialize predictive model', 'error');
      return false;
    }
  }

  async train(data: { inputs: number[][]; outputs: number[][] }) {
    if (!this.model || this.isTraining) return;

    this.isTraining = true;
    try {
      const xs = tf.tensor2d(data.inputs);
      const ys = tf.tensor2d(data.outputs);

      await this.model.fit(xs, ys, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.trainingCallbacks.forEach(callback => callback(logs));
          }
        }
      });

      notifications.show('Model training completed', 'success');
    } catch (error) {
      console.error('Training error:', error);
      notifications.show('Failed to train model', 'error');
    } finally {
      this.isTraining = false;
    }
  }

  predict(inputs: number[][]): number[] {
    if (!this.model) return [];

    try {
      const inputTensor = tf.tensor2d(inputs);
      const predictions = this.model.predict(inputTensor) as tf.Tensor;
      return Array.from(predictions.dataSync());
    } catch (error) {
      console.error('Prediction error:', error);
      notifications.show('Failed to generate predictions', 'error');
      return [];
    }
  }

  onTrainingProgress(callback: (metrics: any) => void) {
    this.trainingCallbacks.add(callback);
    return () => this.trainingCallbacks.delete(callback);
  }

  async saveModel(path: string) {
    if (!this.model) return false;
    try {
      await this.model.save(`localstorage://${path}`);
      return true;
    } catch (error) {
      console.error('Failed to save model:', error);
      return false;
    }
  }

  async loadModel(path: string) {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${path}`);
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }
}