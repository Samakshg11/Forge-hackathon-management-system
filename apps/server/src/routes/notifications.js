import { Router } from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/v1/notifications — My notifications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, data: { notifications: list, unreadCount } });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read — Mark as read
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { $set: { isRead: true } });
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/read-all — Mark all as read
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) { next(err); }
});

export default router;
