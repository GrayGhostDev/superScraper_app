import * as tf from '@tensorflow/tfjs';

export class TensorflowLoader {
  private static instance: TensorflowLoader;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): TensorflowLoader {
    if (!TensorflowLoader.instance) {
      TensorflowLoader.instance = new TensorflowLoader();
    }
    return TensorflowLoader.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await tf.ready();
      this.initialized = true;
      console.log('TensorFlow.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getTensorflow(): typeof tf {
    if (!this.initialized) {
      throw new Error('TensorFlow.js not initialized. Call initialize() first.');
    }
    return tf;
  }
}