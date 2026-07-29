import { Router } from 'express';
import * as teamService from '../services/teamService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTeamSchema, updateTeamSchema, inviteMemberSchema, transferOwnershipSchema } from '@forge/shared';

const router = Router();

// POST /api/v1/teams — Create team
router.post('/', requireAuth, requireRole('participant'), validate(createTeamSchema), async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.user._id, req.validated);
    res.status(201).json({ success: true, data: team });
  } catch (err) { next(err); }
});

// GET /api/v1/teams/:id — View team details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// POST /api/v1/teams/:id/invite — Invite member
router.post('/:id/invite', requireAuth, validate(inviteMemberSchema), async (req, res, next) => {
  try {
    const result = await teamService.inviteMember(req.params.id, req.validated.email, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// POST /api/v1/teams/:id/join — Accept invite
router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const { token } = req.body;
    const team = await teamService.acceptInvite(token, req.user._id, io);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// DELETE /api/v1/teams/:id/members/:userId — Remove member / leave team
router.delete('/:id/members/:userId', requireAuth, async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const team = await teamService.removeMember(req.params.id, req.params.userId, req.user._id, io);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// POST /api/v1/teams/:id/transfer-ownership — Transfer ownership
router.post('/:id/transfer-ownership', requireAuth, validate(transferOwnershipSchema), async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const team = await teamService.transferOwnership(req.params.id, req.validated.newOwnerId, req.user._id, io);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

// DELETE /api/v1/teams/:id — Delete team
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await teamService.deleteTeam(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
