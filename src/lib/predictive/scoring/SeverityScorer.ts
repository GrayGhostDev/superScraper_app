import { Claim } from '../types/triage';
import { ScoreNormalizer } from '../utils/scoreNormalizer';
import { SeverityMapper } from '../utils/mappings';

export class SeverityScorer {
  static calculate(claim: Claim): number {
    const factors = {
      value: Math.min(claim.value / 100000, 1),
      injurySeverity: SeverityMapper.mapSeverity(claim.severity),
      multipleParties: claim.involvedParties > 1 ? 0.5 : 0,
      legalRepresentation: claim.hasLegalRepresentation ? 0.3 : 0,
      permanentImpact: claim.permanentImpact ? 0.4 : 0,
      minorInvolved: claim.involvedMinor ? 0.3 : 0
    };

    return ScoreNormalizer.normalize(Object.values(factors));
  }
}