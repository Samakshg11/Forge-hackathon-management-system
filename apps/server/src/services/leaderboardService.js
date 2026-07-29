import Review from '../models/Review.js';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import { Certificate } from '../models/index.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../middlewares/errorHandler.js';
import { emitToRoom } from '../socket/index.js';
import crypto from 'crypto';

export async function getLeaderboard(hackathonId, requestingUser = null) {
  const hackathon = await Hackathon.findById(hackathonId).lean();
  if (!hackathon) throw new NotFoundError('Hackathon');

  const isOrganizer = requestingUser && hackathon.organizerId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser && requestingUser.role === 'admin';

  // Public can only view if results are published
  if (!hackathon.resultsPublished && !isOrganizer && !isAdmin) {
    throw new ForbiddenError('Results have not been published for this hackathon yet');
  }

  // Aggregate all submitted reviews for this hackathon
  const submissions = await Submission.find({
    hackathonId,
    status: { $in: ['submitted', 'under_review', 'approved'] },
  })
    .populate('teamId', 'name members')
    .lean();

  const submissionIds = submissions.map((s) => s._id);

  const reviewsAgg = await Review.aggregate([
    { $match: { submissionId: { $in: submissionIds } } },
    {
      $group: {
        _id: '$submissionId',
        avgScore: { $avg: '$totalScore' },
        reviewCount: { $sum: 1 },
        scoresList: { $push: '$scores' },
      },
    },
  ]);

  const aggMap = new Map(reviewsAgg.map((r) => [r._id.toString(), r]));

  const leaderboardEntries = submissions.map((sub) => {
    const agg = aggMap.get(sub._id.toString()) || { avgScore: 0, reviewCount: 0, scoresList: [] };
    return {
      submissionId: sub._id,
      projectName: sub.projectName,
      teamName: sub.teamId?.name || 'Un-named Team',
      teamId: sub.teamId?._id,
      githubUrl: sub.githubUrl,
      liveDemoUrl: sub.liveDemoUrl,
      techStack: sub.techStack,
      submittedAt: sub.submittedAt || sub.createdAt,
      averageScore: Number(agg.avgScore.toFixed(2)),
      reviewCount: agg.reviewCount,
    };
  });

  // Rank descending by avgScore, break ties by earliest submittedAt timestamp (Doc 4 §1.9 rule)
  leaderboardEntries.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  // Assign rank numbers (1-indexed, tie support)
  let currentRank = 1;
  const ranked = leaderboardEntries.map((entry, index) => {
    if (index > 0 && entry.averageScore < leaderboardEntries[index - 1].averageScore) {
      currentRank = index + 1;
    }
    return {
      ...entry,
      rank: currentRank,
    };
  });

  return {
    hackathonTitle: hackathon.title,
    resultsPublished: hackathon.resultsPublished,
    totalSubmissions: submissions.length,
    leaderboard: ranked,
  };
}

export async function publishResults(hackathonId, organizerId, io) {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new NotFoundError('Hackathon');

  if (hackathon.organizerId.toString() !== organizerId.toString()) {
    throw new ForbiddenError('Only the organizer can publish results');
  }

  hackathon.status = 'completed';
  hackathon.resultsPublished = true;
  await hackathon.save();

  // Generate Leaderboard
  const data = await getLeaderboard(hackathonId, { _id: organizerId, role: 'organizer' });

  // Certificate generation for top teams & participants
  for (const entry of data.leaderboard) {
    if (entry.teamId) {
      const team = await (await import('../models/Team.js')).default.findById(entry.teamId).lean();
      if (team) {
        for (const member of team.members) {
          const verificationCode = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
          const cert = await Certificate.create({
            userId: member.userId,
            hackathonId: hackathon._id,
            rank: entry.rank,
            verificationCode,
            pdfUrl: `/api/v1/certificates/download/${verificationCode}`,
          });

          // Append to user portfolio
          await User.findByIdAndUpdate(member.userId, {
            $push: {
              portfolioEntries: {
                hackathonId: hackathon._id,
                rank: entry.rank,
                certificateId: cert._id,
                completedAt: new Date(),
              },
            },
            $inc: { xp: entry.rank <= 3 ? 500 : 150 },
          });

          await Notification.create({
            userId: member.userId,
            type: 'results_published',
            title: `Hackathon Results Published! 🎉`,
            body: `Results for "${hackathon.title}" are out! Your team placed Rank #${entry.rank}. Check your certificate!`,
            link: `/leaderboard/${hackathon.slug}`,
          });
        }
      }
    }
  }

  if (io) {
    emitToRoom(io, `hackathon:${hackathon._id}`, 'results:published', {
      hackathonId: hackathon._id.toString(),
    });
  }

  return { message: 'Results published successfully and certificates generated' };
}
