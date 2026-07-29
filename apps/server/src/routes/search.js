import { Router } from 'express';
import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';

const router = Router();

// GET /api/v1/search/hackathons?q= — Search hackathons (Public)
router.get('/hackathons', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const results = await Hackathon.find({
      $text: { $search: q },
      status: { $ne: 'draft' },
    })
      .select('title slug bannerUrl mode theme status startDate endDate')
      .limit(10)
      .lean();
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// GET /api/v1/search/teams?q=&hackathonId= — Search teams
router.get('/teams', async (req, res, next) => {
  try {
    const { q, hackathonId } = req.query;
    if (!q || !hackathonId) return res.json({ success: true, data: [] });

    const results = await Team.find({
      hackathonId,
      name: { $regex: q, $options: 'i' },
    })
      .populate('ownerId', 'name avatarUrl')
      .limit(10)
      .lean();
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// GET /api/v1/search/projects?q=&hackathonId= — Search projects
router.get('/projects', async (req, res, next) => {
  try {
    const { q, hackathonId } = req.query;
    if (!q || !hackathonId) return res.json({ success: true, data: [] });

    const results = await Submission.find({
      hackathonId,
      projectName: { $regex: q, $options: 'i' },
    })
      .select('projectName problemStatement techStack githubUrl status')
      .limit(10)
      .lean();
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

export default router;
