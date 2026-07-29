import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import ActivityLog from '../models/ActivityLog.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../middlewares/errorHandler.js';

const router = Router();

// Middleware: all admin routes require Admin role
router.use(requireAuth, requireRole('admin'));

// GET /api/v1/admin/users — List/search users
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(query),
    ]);

    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/users/:id/block — Block / Unblock user
router.patch('/users/:id/block', async (req, res, next) => {
  try {
    const { isBlocked, reason } = req.body;
    if (req.params.id === req.user._id.toString()) {
      throw new ForbiddenError('Admin cannot block their own account');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: { isBlocked } }, { new: true });
    if (!user) throw new NotFoundError('User');

    // Write to audit log (Doc 4 Rule 36)
    await ActivityLog.create({
      actorId: req.user._id,
      action: isBlocked ? 'user.block' : 'user.unblock',
      targetType: 'User',
      targetId: user._id,
      reason: reason || 'Admin action',
    });

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/users/:id/role — Change user role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role, reason } = req.body;
    if (!['admin', 'organizer', 'judge', 'participant'].includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true });
    if (!user) throw new NotFoundError('User');

    await ActivityLog.create({
      actorId: req.user._id,
      action: 'user.change_role',
      targetType: 'User',
      targetId: user._id,
      reason: reason || 'Admin role change',
    });

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/logs — Immutable audit logs query
router.get('/logs', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      ActivityLog.find()
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ActivityLog.countDocuments(),
    ]);

    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/hackathons — Global hackathons view
router.get('/hackathons', async (req, res, next) => {
  try {
    const list = await Hackathon.find()
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

export default router;
