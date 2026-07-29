import { Router } from 'express';
import { Certificate } from '../models/index.js';
import { requireAuth } from '../middlewares/auth.js';
import { NotFoundError } from '../middlewares/errorHandler.js';

const router = Router();

// GET /api/v1/certificates/mine — Own certificates (Participant)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const list = await Certificate.find({ userId: req.user._id })
      .populate('hackathonId', 'title slug bannerUrl startDate endDate')
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/verify/:code — Public certificate verification (Doc 4 §1.10)
router.get('/verify/:code', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ verificationCode: req.params.code })
      .populate('userId', 'name email avatarUrl')
      .populate('hackathonId', 'title slug startDate endDate organizerId')
      .lean();
    if (!cert) throw new NotFoundError('Certificate');
    res.json({ success: true, data: cert });
  } catch (err) { next(err); }
});

export default router;
