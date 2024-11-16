import { notifications } from '../../utils/notifications';
import { pdlService } from './pdlService';

class EnrichmentService {
  private static instance: EnrichmentService;

  private constructor() {}

  static getInstance(): EnrichmentService {
    if (!EnrichmentService.instance) {
      EnrichmentService.instance = new EnrichmentService();
    }
    return EnrichmentService.instance;
  }

  async enrichClaimData(claim: any) {
    try {
      // Enrich claimant data
      const claimantData = await pdlService.enrichPerson({
        first_name: claim.claimant_info?.firstName,
        last_name: claim.claimant_info?.lastName,
        email: claim.claimant_info?.email,
        company: claim.claimant_info?.employer
      });

      // Enrich location data using location service
      const locationService = (await import('./locationService')).locationService;
      const locationData = await locationService.geocode(claim.location_details?.address || '');

      // Enrich with traffic data
      const trafficService = (await import('./trafficService')).trafficService;
      const trafficData = locationData.bbox ? 
        await trafficService.getTrafficIncidents({
          north: locationData.bbox[3],
          south: locationData.bbox[1],
          east: locationData.bbox[2],
          west: locationData.bbox[0]
        }) : [];

      return {
        claimant: claimantData,
        location: locationData,
        traffic: trafficData,
        enrichedAt: new Date()
      };
    } catch (error) {
      console.error('Enrichment error:', error);
      notifications.show('Failed to enrich claim data', 'error');
      throw error;
    }
  }

  async enrichBatchClaims(claims: any[]) {
    const results = await Promise.allSettled(
      claims.map(claim => this.enrichClaimData(claim))
    );

    return results.map((result, index) => ({
      claim: claims[index],
      enrichment: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
}

export const enrichmentService = EnrichmentService.getInstance();