export class ScoreNormalizer {
    static normalize(values: number[]): number {
      const sum = values.reduce((a, b) => a + b, 0);
      return Math.min(sum / values.length, 1);
    }
  
    static normalizeWeights(weights: Record<string, number>): Record<string, number> {
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.001) {
        const factor = 1 / sum;
        return Object.fromEntries(
          Object.entries(weights).map(([key, value]) => [key, value * factor])
        );
      }
      return weights;
    }
  }