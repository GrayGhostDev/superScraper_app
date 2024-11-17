import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/incidents', async (req, res, next) => {
  try {
    const { north, south, east, west } = req.query;
    
    const response = await axios.get(
      `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${process.env.VITE_TOMTOM_TOKEN}&bbox=${west},${south},${east},${north}`
    );

    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    next(error);
  }
});

export const trafficRoutes = router;