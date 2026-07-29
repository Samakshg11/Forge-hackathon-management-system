import { Router } from 'express';
import * as leaderboardService from '../services/leaderboardService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import Hackathon from '../models/Hackathon.js';
import { NotFoundError } from '../middlewares/errorHandler.js';

const router = Router();

// GET /api/v1/leaderboard/:slug — Public / Organizer view of leaderboard
router.get('/:slug', async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug }).lean();
    if (!hackathon) throw new NotFoundError('Hackathon');

    // Optional user context from header token if present
    let requestingUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const jwt = (await import('jsonwebtoken')).default;
        const { env } = await import('../config/env.js');
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        requestingUser = { _id: decoded.sub, role: decoded.role };
      } catch {
        // Ignore unverified optional auth token
      }
    }

    const data = await leaderboardService.getLeaderboard(hackathon._id, requestingUser);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/v1/leaderboard/:id/publish-results — Organizer publish results
router.post('/:id/publish-results', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const result = await leaderboardService.publishResults(req.params.id, req.user._id, io);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
