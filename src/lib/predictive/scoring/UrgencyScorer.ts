import { Claim } from '../types/triage';
import { ScoreNormalizer } from '../utils/scoreNormalizer';

export class UrgencyScorer {
  static calculate(claim: Claim): number {
    const factors = {
      age: Math.min(
        (Date.now() - claim.submittedAt.getTime()) / (30 * 24 * 60 * 60 * 1000),
        1
      ),
      statuteOfLimitations: claim.daysUntilDeadline < 30 ? 1 :
                          claim.daysUntilDeadline < 90 ? 0.5 : 0.2,
      requiresImmediateMedical: claim.requiresImmediateMedical ? 1 : 0,
      ongoingTreatment: claim.ongoingTreatment ? 0.7 : 0,
      financialHardship: claim.financialHardship ? 0.7 : 0,
      lossOfIncome: claim.lossOfIncome ? 0.6 : 0
    };

    return ScoreNormalizer.normalize(Object.values(factors));
  }
}