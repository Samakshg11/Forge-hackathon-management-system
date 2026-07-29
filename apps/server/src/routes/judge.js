import { Router } from 'express';
import * as reviewService from '../services/reviewService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// GET /api/v1/judge/assignments — View assigned submissions queue
router.get('/assignments', requireAuth, requireRole('judge'), async (req, res, next) => {
  try {
    const assignments = await reviewService.getAssignedSubmissionsForJudge(req.user._id);
    res.json({ success: true, data: assignments });
  } catch (err) { next(err); }
});

// GET /api/v1/judge/submissions/:id — Judge blind submission detail view
router.get('/submissions/:id', requireAuth, requireRole('judge'), async (req, res, next) => {
  try {
    const data = await reviewService.getSubmissionForJudge(req.params.id, req.user._id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
