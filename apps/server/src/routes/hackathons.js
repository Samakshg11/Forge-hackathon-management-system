import { Router } from 'express';
import * as hackathonService from '../services/hackathonService.js';
import { requireAuth, requireRole, requireOwnership } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createHackathonSchema, updateHackathonSchema, hackathonFilterSchema } from '@forge/shared';
import Hackathon from '../models/Hackathon.js';

const router = Router();

// GET /api/v1/hackathons — List, filter, search, paginate
router.get('/', validate(hackathonFilterSchema, 'query'), async (req, res, next) => {
  try {
    const result = await hackathonService.listHackathons(req.validated);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /api/v1/hackathons/mine — Hackathons owned by the current organizer/admin
router.get('/mine', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const organizerFilter = req.user.role === 'admin' ? {} : { organizerId: req.user._id };
    const hackathons = await Hackathon.find(organizerFilter)
      .populate('organizerId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const statusCounts = hackathons.reduce((acc, hackathon) => {
      acc[hackathon.status] = (acc[hackathon.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        hackathons,
        summary: {
          total: hackathons.length,
          drafts: statusCounts.draft || 0,
          published: (statusCounts.published || 0) + (statusCounts.registration_open || 0) + (statusCounts.submissions_open || 0),
          active: (statusCounts.registration_open || 0) + (statusCounts.submissions_open || 0) + (statusCounts.judging || 0),
          completed: statusCounts.completed || 0,
          statusCounts,
        },
      },
    });
  } catch (err) { next(err); }
});

// GET /api/v1/hackathons/featured — Featured on landing page
router.get('/featured', async (req, res, next) => {
  try {
    const featured = await hackathonService.getFeaturedHackathons();
    res.json({ success: true, data: featured });
  } catch (err) { next(err); }
});

// GET /api/v1/hackathons/:slug — Get by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonBySlug(req.params.slug);
    res.json({ success: true, data: hackathon });
  } catch (err) { next(err); }
});

// POST /api/v1/hackathons — Create draft (Organizer / Admin)
router.post(
  '/',
  requireAuth,
  requireRole('organizer', 'admin'),
  validate(createHackathonSchema),
  async (req, res, next) => {
    try {
      const hackathon = await hackathonService.createHackathon(req.validated, req.user._id);
      res.status(201).json({ success: true, data: hackathon });
    } catch (err) { next(err); }
  }
);

// PATCH /api/v1/hackathons/:id — Update hackathon
router.patch(
  '/:id',
  requireAuth,
  requireRole('organizer', 'admin'),
  requireOwnership(async (req) => Hackathon.findById(req.params.id), 'organizerId', 'Hackathon'),
  validate(updateHackathonSchema),
  async (req, res, next) => {
    try {
      const updated = await hackathonService.updateHackathon(req.params.id, req.validated, req.user);
      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/hackathons/:id/publish — Publish draft
router.post(
  '/:id/publish',
  requireAuth,
  requireRole('organizer', 'admin'),
  requireOwnership(async (req) => Hackathon.findById(req.params.id), 'organizerId', 'Hackathon'),
  async (req, res, next) => {
    try {
      const published = await hackathonService.publishHackathon(req.params.id, req.user._id);
      res.json({ success: true, data: published });
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/hackathons/:id — Delete hackathon
router.delete(
  '/:id',
  requireAuth,
  requireRole('organizer', 'admin'),
  requireOwnership(async (req) => Hackathon.findById(req.params.id), 'organizerId', 'Hackathon'),
  async (req, res, next) => {
    try {
      await hackathonService.deleteHackathon(req.params.id, req.body.confirmTitle, req.user);
      res.json({ success: true, data: { message: 'Hackathon deleted successfully' } });
    } catch (err) { next(err); }
  }
);

export default router;
