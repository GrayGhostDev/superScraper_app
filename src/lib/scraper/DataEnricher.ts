import { notifications } from '../../utils/notifications';
import { LinkedInEnricher } from '../enrichment/providers/linkedin';
import { HunterEnricher } from '../enrichment/providers/hunter';
import { RocketReachEnricher } from '../enrichment/providers/rocketreach';
import { PeopleDataLabsEnricher } from '../enrichment/providers/peopledatalabs';
import { LexisNexisEnricher } from '../enrichment/providers/lexisnexis';

interface EnrichmentResult {
  provider: string;
  data: any;
  confidence: number;
  timestamp: Date;
}

export class DataEnricher {
  private linkedInEnricher: LinkedInEnricher;
  private hunterEnricher: HunterEnricher;
  private rocketReachEnricher: RocketReachEnricher;
  private peopleDataLabsEnricher: PeopleDataLabsEnricher;
  private lexisNexisEnricher: LexisNexisEnricher;

  constructor() {
    this.linkedInEnricher = new LinkedInEnricher(import.meta.env.VITE_LINKEDIN_API_KEY);
    this.hunterEnricher = new HunterEnricher(import.meta.env.VITE_HUNTER_API_KEY);
    this.rocketReachEnricher = new RocketReachEnricher(import.meta.env.VITE_ROCKETREACH_API_KEY);
    this.peopleDataLabsEnricher = new PeopleDataLabsEnricher(import.meta.env.VITE_PEOPLEDATALABS_API_KEY);
    this.lexisNexisEnricher = new LexisNexisEnricher(import.meta.env.VITE_LEXISNEXIS_API_KEY);
  }

  async enrichData(data: any): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];

    try {
      // Run enrichment in parallel
      const [
        companyData,
        emailData,
        contactData,
        demographicData,
        riskData
      ] = await Promise.allSettled([
        this.enrichCompanyData(data),
        this.enrichEmailData(data),
        this.enrichContactData(data),
        this.enrichDemographicData(data),
        this.enrichRiskData(data)
      ]);

      // Process successful results
      [companyData, emailData, contactData, demographicData, riskData]
        .filter((result): result is PromiseFulfilledResult<EnrichmentResult> => 
          result.status === 'fulfilled'
        )
        .forEach(result => results.push(result.value));

      return results;
    } catch (error) {
      console.error('Data enrichment error:', error);
      notifications.show('Failed to enrich data', 'error');
      return results;
    }
  }

  private async enrichCompanyData(data: any): Promise<EnrichmentResult> {
    const companyName = this.extractCompanyName(data);
    if (!companyName) {
      throw new Error('No company name found');
    }

    const result = await this.linkedInEnricher.enrichCompanyData(companyName);
    return {
      provider: 'linkedin',
      data: result.data,
      confidence: this.calculateConfidence(result.data),
      timestamp: new Date()
    };
  }

  private async enrichEmailData(data: any): Promise<EnrichmentResult> {
    const domain = this.extractDomain(data);
    if (!domain) {
      throw new Error('No domain found');
    }

    const result = await this.hunterEnricher.findEmailsByDomain(domain);
    return {
      provider: 'hunter',
      data: result.data,
      confidence: this.calculateConfidence(result.data),
      timestamp: new Date()
    };
  }

  private async enrichContactData(data: any): Promise<EnrichmentResult> {
    const name = this.extractName(data);
    if (!name) {
      throw new Error('No name found');
    }

    const result = await this.rocketReachEnricher.lookupPerson(name);
    return {
      provider: 'rocketreach',
      data: result.data,
      confidence: this.calculateConfidence(result.data),
      timestamp: new Date()
    };
  }

  private async enrichDemographicData(data: any): Promise<EnrichmentResult> {
    const params = this.extractDemographicParams(data);
    const result = await this.peopleDataLabsEnricher.enrichPerson(params);
    return {
      provider: 'peopledatalabs',
      data: result.data,
      confidence: this.calculateConfidence(result.data),
      timestamp: new Date()
    };
  }

  private async enrichRiskData(data: any): Promise<EnrichmentResult> {
    const params = this.extractRiskParams(data);
    const result = await this.lexisNexisEnricher.performRiskAssessment(params);
    return {
      provider: 'lexisnexis',
      data: result.data,
      confidence: this.calculateConfidence(result.data),
      timestamp: new Date()
    };
  }

  private extractCompanyName(data: any): string | null {
    // Implementation to extract company name from various data formats
    return data.company || data.organization || null;
  }

  private extractDomain(data: any): string | null {
    // Implementation to extract domain from various data formats
    if (data.website) return new URL(data.website).hostname;
    if (data.email) return data.email.split('@')[1];
    return null;
  }

  private extractName(data: any): string | null {
    // Implementation to extract full name from various data formats
    if (data.fullName) return data.fullName;
    if (data.firstName && data.lastName) {
      return `${data.firstName} ${data.lastName}`;
    }
    return null;
  }

  private extractDemographicParams(data: any): any {
    return {
      name: this.extractName(data),
      email: data.email,
      phone: data.phone,
      location: data.location
    };
  }

  private extractRiskParams(data: any): any {
    return {
      name: this.extractName(data),
      dateOfBirth: data.dateOfBirth,
      ssn: data.ssn,
      address: data.address
    };
  }

  private calculateConfidence(data: any): number {
    if (!data) return 0;
    
    // Calculate confidence based on data completeness
    const fields = Object.keys(data);
    const nonEmptyFields = fields.filter(field => {
      const value = data[field];
      return value !== null && value !== undefined && value !== '';
    });

    return nonEmptyFields.length / fields.length;
  }
}