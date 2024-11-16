import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface Prediction {
  date: string;
  predictedValue: number;
  actualValue?: number;
  confidence: number;
}

export const PredictiveModel: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 0,
    loss: 0,
    mae: 0
  });

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      const newModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 1 })
        ]
      });

      newModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      setModel(newModel);
      await trainModel(newModel);
    } catch (error) {
      console.error('Failed to initialize model:', error);
    }
  };

  const trainModel = async (model: tf.LayersModel) => {
    setIsTraining(true);
    try {
      // Mock training data - replace with real historical data
      const trainingData = generateMockTrainingData();
      const xs = tf.tensor2d(trainingData.inputs);
      const ys = tf.tensor2d(trainingData.outputs);

      const history = await model.fit(xs, ys, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs) {
              setModelMetrics({
                accuracy: 1 - (logs.loss || 0),
                loss: logs.loss || 0,
                mae: logs.mae || 0
              });
            }
          }
        }
      });

      generatePredictions(model);
    } catch (error) {
      console.error('Failed to train model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const generatePredictions = (model: tf.LayersModel) => {
    const futureDates = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      return date.toISOString().split('T')[0];
    });

    const mockInput = tf.tensor2d(Array(12).fill(Array(10).fill(Math.random())));
    const predictions = model.predict(mockInput) as tf.Tensor;
    const predictionValues = predictions.dataSync();

    const predictionData: Prediction[] = futureDates.map((date, i) => ({
      date,
      predictedValue: predictionValues[i] * 10000, // Scale for realistic claim values
      confidence: 0.7 + Math.random() * 0.2 // Mock confidence scores
    }));

    setPredictions(predictionData);
  };

  const generateMockTrainingData = () => {
    const numSamples = 1000;
    const inputs = Array.from({ length: numSamples }, () => 
      Array.from({ length: 10 }, () => Math.random())
    );
    const outputs = inputs.map(input => 
      [input.reduce((a, b) => a + b) / 10 + Math.random() * 0.2]
    );
    return { inputs, outputs };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Predictive Analytics</h2>
          </div>
          {isTraining && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Training in progress...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Model Accuracy</p>
            <p className="text-2xl font-bold text-indigo-600">
              {(modelMetrics.accuracy * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Loss</p>
            <p className="text-2xl font-bold text-indigo-600">
              {modelMetrics.loss.toFixed(4)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Mean Absolute Error</p>
            <p className="text-2xl font-bold text-indigo-600">
              {modelMetrics.mae.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="predictedValue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Predicted Value"
              />
              <Line
                type="monotone"
                dataKey="actualValue"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Actual Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Prediction Insights</h3>
          <div className="space-y-4">
            {predictions.slice(0, 3).map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(prediction.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Predicted Value: {formatCurrency(prediction.predictedValue)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-600">
                    {(prediction.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};