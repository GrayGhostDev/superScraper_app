export interface ClaimScore {
    severity: number;
    urgency: number;
    complexity: number;
    risk: number;
    priority: number;
  }
  
  export interface TriageWeights {
    severity: number;
    urgency: number;
    complexity: number;
    risk: number;
  }
  
  export interface Claim {
    id: string;
    value: number;
    severity: string;
    involvedParties: number;
    hasLegalRepresentation: boolean;
    permanentImpact: boolean;
    involvedMinor: boolean;
    submittedAt: Date;
    daysUntilDeadline: number;
    requiresImmediateMedical: boolean;
    ongoingTreatment: boolean;
    financialHardship: boolean;
    lossOfIncome: boolean;
    documents: any[];
    jurisdiction: string;
    multiplePolicies: boolean;
    requiresExpertWitness: boolean;
    crossBorder: boolean;
    precedentSetting: boolean;
    fraudScore: number;
    previousClaims: number;
    litigationLikelihood: number;
    adversePartyHistory: boolean;
    mediaAttention: boolean;
    regulatoryImpact: boolean;
  }