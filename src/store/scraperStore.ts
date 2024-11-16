import { create } from 'zustand';
import { ScrapeJob, ScraperConfig, ScraperStats } from '../types/scraper';

interface ScraperStore {
  jobs: ScrapeJob[];
  config: ScraperConfig;
  addJob: (url: string) => void;
  updateConfig: (config: Partial<ScraperConfig>) => void;
  removeJob: (id: string) => void;
  updateJobStatus: (id: string, status: ScrapeJob['status'], data?: Partial<ScrapeJob>) => void;
  clearCompletedJobs: () => void;
  getStats: () => ScraperStats;
}

export const useScraperStore = create<ScraperStore>((set, get) => ({
  jobs: [],
  config: {
    concurrent: 3,
    timeout: 30000,
    retries: 3,
    userAgent: 'Mozilla/5.0 (compatible; GrayGhostBot/1.0)',
    depth: 1,
    followLinks: false,
    respectRobotsTxt: true,
    validateSSL: true,
    extractMetadata: true,
    parseScripts: true,
    rateLimit: 1,
    maxSize: 5242880, // 5MB
    allowedDomains: [],
    excludePatterns: [],
    customHeaders: {},
    customSelectors: {},
  },
  addJob: (url: string) =>
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          id: crypto.randomUUID(),
          url,
          status: 'pending',
          startTime: new Date(),
        },
      ],
    })),
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
  removeJob: (id: string) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    })),
  updateJobStatus: (id: string, status: ScrapeJob['status'], data?: Partial<ScrapeJob>) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              ...data,
              status,
              ...(status === 'completed' || status === 'failed' ? { endTime: new Date() } : {}),
            }
          : job
      ),
    })),
  clearCompletedJobs: () =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.status === 'pending' || job.status === 'running'),
    })),
  getStats: () => {
    const jobs = get().jobs;
    const completedJobs = jobs.filter((job) => job.status === 'completed');
    const failedJobs = jobs.filter((job) => job.status === 'failed');
    
    const totalDataCollected = completedJobs.reduce(
      (sum, job) => sum + (job.dataCollected || 0),
      0
    );
    
    const averageJobTime =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const duration = job.endTime && job.startTime
              ? job.endTime.getTime() - job.startTime.getTime()
              : 0;
            return sum + duration;
          }, 0) / completedJobs.length
        : 0;

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      totalDataCollected,
      averageJobTime,
    };
  },
}));