import { useState, useEffect } from 'react';
import { notifications } from '../utils/notifications';

export const useTensorflow = () => {
  const [tf, setTf] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTensorflow = async () => {
      try {
        const tensorflowModule = await import('@tensorflow/tfjs');
        await tensorflowModule.ready();
        setTf(tensorflowModule);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize TensorFlow:', error);
        notifications.show('Failed to initialize TensorFlow.js', 'error');
      }
    };

    initTensorflow();
  }, []);

  return { tf, isInitialized };
};