import { Router } from 'express';
import * as reviewService from '../services/reviewService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createReviewSchema } from '@forge/shared';

const router = Router();

// POST /api/v1/reviews — Submit review (Judge)
router.post('/', requireAuth, requireRole('judge'), validate(createReviewSchema), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const review = await reviewService.submitReview(req.validated, req.user._id, io);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
});

export default router;
