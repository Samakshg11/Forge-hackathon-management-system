import { Router } from 'express';
import * as submissionService from '../services/submissionService.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSubmissionSchema, updateSubmissionSchema } from '@forge/shared';

const router = Router();

// POST /api/v1/submissions — Create draft
router.post('/', requireAuth, requireRole('participant'), validate(createSubmissionSchema), async (req, res, next) => {
  try {
    const submission = await submissionService.createDraftSubmission(req.user._id, req.validated);
    res.status(201).json({ success: true, data: submission });
  } catch (err) { next(err); }
});

// PATCH /api/v1/submissions/:id — Autosave / update draft
router.patch('/:id', requireAuth, validate(updateSubmissionSchema), async (req, res, next) => {
  try {
    const updated = await submissionService.autosaveSubmission(req.params.id, req.user._id, req.validated);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST /api/v1/submissions/:id/submit — Finalize submit (draft -> submitted)
router.post('/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const submitted = await submissionService.finalizeSubmit(req.params.id, req.user._id);
    res.json({ success: true, data: submitted });
  } catch (err) { next(err); }
});

// GET /api/v1/submissions/:id — View submission
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id, req.user);
    res.json({ success: true, data: submission });
  } catch (err) { next(err); }
});

// GET /api/v1/submissions/:id/versions — View version history
router.get('/:id/versions', requireAuth, async (req, res, next) => {
  try {
    const versions = await submissionService.getSubmissionVersions(req.params.id, req.user);
    res.json({ success: true, data: versions });
  } catch (err) { next(err); }
});

export default router;
