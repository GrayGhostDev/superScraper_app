import { Router } from 'express';
import { PDLClient } from '@peopledatalabs/client';
import { logger } from '../utils/logger.js';

const router = Router();
const pdl = new PDLClient({ apiKey: process.env.PDL_API_KEY });

router.post('/search', async (req, res, next) => {
  try {
    const { sql, size = 10, dataset = "all" } = req.body;

    const response = await pdl.person.search.sql({
      sql,
      size,
      dataset,
      pretty: true
    });

    res.json({
      status: 'success',
      data: response.data,
      headers: response.headers
    });
  } catch (error) {
    next(error);
  }
});

router.post('/enrich', async (req, res, next) => {
  try {
    const response = await pdl.person.enrichment(req.body);
    res.json({
      status: 'success',
      data: response.data,
      headers: response.headers
    });
  } catch (error) {
    next(error);
  }
});

router.post('/company/enrich', async (req, res, next) => {
  try {
    const response = await pdl.company.enrichment(req.body);
    res.json({
      status: 'success',
      data: response.data,
      headers: response.headers
    });
  } catch (error) {
    next(error);
  }
});

export const pdlRoutes = router;