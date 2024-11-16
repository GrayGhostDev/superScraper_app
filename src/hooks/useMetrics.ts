import { useMemo } from 'react';
import { useScraperStore } from '../store/scraperStore';

export const useMetrics = () => {
  const jobs = useScraperStore((state) => state.jobs);
  const stats = useScraperStore((state) => state.getStats());

  const metrics = useMemo(() => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    
    const averageProcessingTime = completedJobs.reduce((acc, job) => {
      if (job.performance?.processingTime) {
        return acc + job.performance.processingTime;
      }
      return acc;
    }, 0) / (completedJobs.length || 1);

    const successRate = (stats.completedJobs / stats.totalJobs) * 100 || 0;
    
    const dataQuality = {
      withMetadata: completedJobs.filter(job => 
        job.data?.some(item => item.metadata && Object.keys(item.metadata).length > 0)
      ).length,
      withSchema: completedJobs.filter(job =>
        job.data?.some(item => item.schema && Object.keys(item.schema).length > 0)
      ).length,
      avgLinksPerPage: completedJobs.reduce((acc, job) => {
        const links = job.data?.reduce((sum, item) => sum + (item.links?.length || 0), 0) || 0;
        return acc + (links / (job.data?.length || 1));
      }, 0) / (completedJobs.length || 1),
      score: calculateQualityScore(completedJobs)
    };

    return {
      successRate,
      averageProcessingTime,
      dataQuality,
      totalDataCollected: stats.totalDataCollected,
      averageJobTime: stats.averageJobTime
    };
  }, [jobs, stats]);

  return metrics;
};

function calculateQualityScore(jobs: any[]): number {
  if (jobs.length === 0) return 0;

  const scores = jobs.map(job => {
    let score = 0;
    const data = job.data?.[0];

    if (!data) return 0;

    // Metadata presence
    if (data.metadata && Object.keys(data.metadata).length > 0) score += 0.25;
    
    // Schema presence
    if (data.schema && Object.keys(data.schema).length > 0) score += 0.25;
    
    // Links presence
    if (data.links && data.links.length > 0) score += 0.25;
    
    // Content quality
    if (data.text && data.text.length > 100) score += 0.25;

    return score;
  });

  return (scores.reduce((a, b) => a + b, 0) / jobs.length) * 100;
}