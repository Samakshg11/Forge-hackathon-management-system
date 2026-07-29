import { Router } from 'express';
import { getPublicStats } from '../services/hackathonService.js';

const router = Router();

// GET /api/v1/stats/public — Public statistics for hero section counters
router.get('/public', async (req, res, next) => {
  try {
    const stats = await getPublicStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
});

export default router;
