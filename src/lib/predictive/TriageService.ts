import { notifications } from '../../utils/notifications';
import { Claim, ClaimScore, TriageWeights } from './types/triage';
import { ScoreNormalizer } from './utils/scoreNormalizer';
import { SeverityScorer } from './scoring/SeverityScorer';
import { UrgencyScorer } from './scoring/UrgencyScorer';
import { ComplexityScorer } from './scoring/ComplexityScorer';
import { RiskScorer } from './scoring/RiskScorer';
import { SeverityMapper, JurisdictionMapper } from './utils/mappings';

export class TriageService {
  private weights: TriageWeights = {
    severity: 0.35,
    urgency: 0.25,
    complexity: 0.20,
    risk: 0.20
  };

  async triageClaim(claim: Claim): Promise<ClaimScore> {
    try {
      const severity = SeverityScorer.calculate(claim);
      const urgency = UrgencyScorer.calculate(claim);
      const complexity = ComplexityScorer.calculate(claim);
      const risk = RiskScorer.calculate(claim);

      const priority = this.calculatePriority({
        severity,
        urgency,
        complexity,
        risk
      });

      return {
        severity,
        urgency,
        complexity,
        risk,
        priority
      };
    } catch (error) {
      console.error('Triage error:', error);
      notifications.show('Failed to triage claim', 'error');
      throw error;
    }
  }

  async triageBatch(claims: Claim[]): Promise<ClaimScore[]> {
    try {
      return await Promise.all(claims.map(claim => this.triageClaim(claim)));
    } catch (error) {
      console.error('Batch triage error:', error);
      notifications.show('Failed to process batch triage', 'error');
      throw error;
    }
  }

  private calculatePriority(scores: Omit<ClaimScore, 'priority'>): number {
    return Object.entries(scores).reduce(
      (priority, [key, value]) => priority + (value * (this.weights[key as keyof TriageWeights] || 0)),
      0
    );
  }

  updateWeights(newWeights: Partial<TriageWeights>): void {
    this.weights = {
      ...this.weights,
      ...newWeights
    };
    
    const normalizedWeights = ScoreNormalizer.normalizeWeights(this.weights);
    this.weights = normalizedWeights as TriageWeights;
  }

  getWeights(): TriageWeights {
    return { ...this.weights };
  }

  getSeverityLevels(): string[] {
    return SeverityMapper.getSeverityLevels();
  }

  getJurisdictionLevels(): string[] {
    return JurisdictionMapper.getJurisdictionLevels();
  }
}