import { Claim } from '../types/triage';
import { ScoreNormalizer } from '../utils/scoreNormalizer';
import { JurisdictionMapper } from '../utils/mappings';

export class ComplexityScorer {
  static calculate(claim: Claim): number {
    const factors = {
      multipleParties: Math.min(claim.involvedParties / 5, 1),
      documentCount: Math.min(claim.documents.length / 20, 1),
      jurisdictionalComplexity: JurisdictionMapper.mapJurisdiction(claim.jurisdiction),
      policyComplexity: claim.multiplePolicies ? 0.7 : 0.3,
      requiresExpertWitness: claim.requiresExpertWitness ? 0.6 : 0,
      crossBorderElements: claim.crossBorder ? 0.8 : 0,
      precedentSetting: claim.precedentSetting ? 0.9 : 0
    };

    return ScoreNormalizer.normalize(Object.values(factors));
  }
}