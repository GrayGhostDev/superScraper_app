import { Router } from 'express';
import { pdlRoutes } from './pdl.js';
import { trafficRoutes } from './traffic.js';
import { hospitalRoutes } from './hospital.js';
import { authMiddleware } from '../middleware/auth.js';

export const setupRoutes = (app) => {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // Protected routes
  router.use('/api', authMiddleware);
  router.use('/api/pdl', pdlRoutes);
  router.use('/api/traffic', trafficRoutes);
  router.use('/api/hospitals', hospitalRoutes);

  app.use(router);
};