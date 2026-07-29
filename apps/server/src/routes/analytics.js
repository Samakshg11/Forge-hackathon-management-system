import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import Hackathon from '../models/Hackathon.js';
import Registration from '../models/Registration.js';
import Submission from '../models/Submission.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const router = Router();

// GET /api/v1/analytics/hackathon/:id — Hackathon specific analytics (Organizer / Admin)
router.get('/hackathon/:id', requireAuth, requireRole('organizer', 'admin'), async (req, res, next) => {
  try {
    const hackathonId = req.params.id;
    const [registrations, submissions, reviews] = await Promise.all([
      Registration.find({ hackathonId }).lean(),
      Submission.find({ hackathonId }).lean(),
      Review.aggregate([
        {
          $lookup: {
            from: 'submissions',
            localField: 'submissionId',
            foreignField: '_id',
            as: 'sub',
          },
        },
        { $unwind: '$sub' },
        { $match: { 'sub.hackathonId': hackathonId } },
      ]),
    ]);

    const registrationFunnel = {
      pending: registrations.filter((r) => r.status === 'pending').length,
      approved: registrations.filter((r) => r.status === 'approved').length,
      rejected: registrations.filter((r) => r.status === 'rejected').length,
      total: registrations.length,
    };

    const submissionStats = {
      draft: submissions.filter((s) => s.status === 'draft').length,
      submitted: submissions.filter((s) => s.status === 'submitted').length,
      total: submissions.length,
    };

    // Tech stack breakdown
    const techMap = {};
    submissions.forEach((s) => {
      s.techStack?.forEach((t) => {
        techMap[t] = (techMap[t] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        registrationFunnel,
        submissionStats,
        reviewsCount: reviews.length,
        techStackDistribution: Object.entries(techMap).map(([tech, count]) => ({ tech, count })),
      },
    });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/platform — Platform wide analytics (Admin only)
router.get('/platform', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const [usersByRole, hackathonsByStatus, totalSubmissions, totalReviews] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Hackathon.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Submission.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        usersByRole: Object.fromEntries(usersByRole.map((u) => [u._id, u.count])),
        hackathonsByStatus: Object.fromEntries(hackathonsByStatus.map((h) => [h._id, h.count])),
        totalSubmissions,
        totalReviews,
      },
    });
  } catch (err) { next(err); }
});

export default router;
