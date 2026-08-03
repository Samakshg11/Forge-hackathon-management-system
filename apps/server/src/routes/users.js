import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import User from '../models/User.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '@forge/shared';
import { NotFoundError } from '../middlewares/errorHandler.js';

const router = Router();

// GET /api/v1/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').lean();
    if (!user) throw new NotFoundError('User');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /api/v1/users/me
router.patch('/me', requireAuth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.validated },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!user) throw new NotFoundError('User');
    user.computeProfileCompletion();
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/v1/users/judges — list all judges (organizer/admin only)
router.get('/judges', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const judges = await User.find({ role: 'judge' })
      .select('name email avatarUrl bio')
      .lean();
    res.json({ success: true, data: judges });
  } catch (err) { next(err); }
});

// GET /api/v1/users/:username/portfolio — public
router.get('/:username/portfolio', async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.params.username })
      .select('name avatarUrl bio skills portfolioEntries userAchievements xp githubUrl linkedinUrl')
      .lean();
    if (!user) throw new NotFoundError('User');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

export default router;
