import { Claim } from '../types/triage';
import { ScoreNormalizer } from '../utils/scoreNormalizer';

export class RiskScorer {
  static calculate(claim: Claim): number {
    const factors = {
      value: Math.min(claim.value / 100000, 1),
      fraudScore: claim.fraudScore || 0,
      previousClaims: Math.min(claim.previousClaims / 5, 1),
      litigationLikelihood: claim.litigationLikelihood || 0,
      adversePartyHistory: claim.adversePartyHistory ? 0.7 : 0,
      mediaAttention: claim.mediaAttention ? 0.8 : 0,
      regulatoryImpact: claim.regulatoryImpact ? 0.9 : 0
    };

    return ScoreNormalizer.normalize(Object.values(factors));
  }
}