import { Router } from 'express';
import { Bookmark } from '../models/index.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/v1/bookmarks — My bookmarks
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Bookmark.find({ userId: req.user._id })
      .populate('hackathonId')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list.map((b) => b.hackathonId) });
  } catch (err) { next(err); }
});

// POST /api/v1/bookmarks — Bookmark hackathon
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { hackathonId } = req.body;
    await Bookmark.findOneAndUpdate(
      { userId: req.user._id, hackathonId },
      { userId: req.user._id, hackathonId },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: { bookmarked: true } });
  } catch (err) { next(err); }
});

// DELETE /api/v1/bookmarks/:hackathonId — Remove bookmark
router.delete('/:hackathonId', requireAuth, async (req, res, next) => {
  try {
    await Bookmark.deleteOne({ userId: req.user._id, hackathonId: req.params.hackathonId });
    res.json({ success: true, data: { bookmarked: false } });
  } catch (err) { next(err); }
});

export default router;
