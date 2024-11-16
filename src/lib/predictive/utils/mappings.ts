export class SeverityMapper {
    private static readonly severityMap: Record<string, number> = {
      critical: 1.0,
      severe: 0.8,
      moderate: 0.5,
      minor: 0.2,
      negligible: 0.1
    };
  
    static mapSeverity(severity: string): number {
      return this.severityMap[severity.toLowerCase()] || 0.1;
    }
  
    static getSeverityLevels(): string[] {
      return Object.keys(this.severityMap);
    }
  }
  
  export class JurisdictionMapper {
    private static readonly jurisdictionMap: Record<string, number> = {
      international: 1.0,
      federal: 0.8,
      state: 0.5,
      local: 0.3
    };
  
    static mapJurisdiction(jurisdiction: string): number {
      return this.jurisdictionMap[jurisdiction.toLowerCase()] || 0.3;
    }
  
    static getJurisdictionLevels(): string[] {
      return Object.keys(this.jurisdictionMap);
    }
  }