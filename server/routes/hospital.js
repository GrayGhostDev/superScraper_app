import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/wait-times', async (req, res, next) => {
  try {
    const { hospitalIds } = req.query;
    
    const response = await axios.get(
      `${process.env.VITE_HOSPITAL_API_URL}/wait-times`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_HOSPITAL_API_KEY}`
        },
        params: { hospitalIds }
      }
    );

    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    next(error);
  }
});

export const hospitalRoutes = router;