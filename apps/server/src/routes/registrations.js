import { Router } from 'express';
import * as registrationService from '../services/registrationService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRegistrationSchema, rejectRegistrationSchema } from '@forge/shared';

const router = Router();

// GET /api/v1/registrations/mine — My registrations (Participant)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const list = await registrationService.getMyRegistrations(req.user._id);
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

// GET /api/v1/registrations?hackathonId= — List for organizer approval queue
router.get('/', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const { hackathonId } = req.query;
    const list = await registrationService.getRegistrationsForHackathon(hackathonId, req.user._id);
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

// POST /api/v1/registrations — Register for a hackathon
router.post('/', requireAuth, requireRole('participant'), validate(createRegistrationSchema), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const registration = await registrationService.register(req.user._id, req.validated.hackathonId, io);
    res.status(201).json({ success: true, data: registration });
  } catch (err) { next(err); }
});

// PATCH /api/v1/registrations/:id/approve — Approve registration (Organizer/Admin)
router.patch('/:id/approve', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const updated = await registrationService.approveRegistration(req.params.id, req.user._id, io);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// PATCH /api/v1/registrations/:id/reject — Reject registration (Organizer/Admin)
router.patch('/:id/reject', requireAuth, requireRole('organizer', 'admin'), validate(rejectRegistrationSchema), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const updated = await registrationService.rejectRegistration(req.params.id, req.validated.reason, req.user._id, io);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// DELETE /api/v1/registrations/:id — Cancel registration (Participant)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const cancelled = await registrationService.cancelRegistration(req.params.id, req.user._id);
    res.json({ success: true, data: cancelled });
  } catch (err) { next(err); }
});

export default router;
