import Review from '../models/Review.js';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import User from '../models/User.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../middlewares/errorHandler.js';
import { emitToRoom } from '../socket/index.js';

export async function submitReview({ submissionId, scores, feedback }, judgeId, io) {
  const submission = await Submission.findById(submissionId).populate('hackathonId');
  if (!submission) throw new NotFoundError('Submission');

  // Check assigned judge
  const isAssigned = submission.assignedJudgeIds.some((j) => j.toString() === judgeId.toString());
  if (!isAssigned) {
    throw new ForbiddenError('You are not assigned to review this submission');
  }

  // Check review deadline (only if set)
  const hackathon = submission.hackathonId;
  if (hackathon.reviewDeadline && new Date() > new Date(hackathon.reviewDeadline)) {
    throw new ValidationError('Review deadline has passed for this hackathon');
  }

  // Check existing review (immutable rule)
  const existing = await Review.findOne({ submissionId, judgeId });
  if (existing) {
    throw new ConflictError('You have already submitted a review for this project. Submitted reviews are final.');
  }

  // Calculate total score (7 criteria, 1-10 each = max 70)
  const totalScore =
    scores.innovation +
    scores.technicalComplexity +
    scores.ui +
    scores.functionality +
    scores.scalability +
    scores.documentation +
    scores.presentation;

  const review = await Review.create({
    submissionId,
    judgeId,
    scores,
    totalScore,
    feedback,
  });

  // Emit socket event for live leaderboard update
  if (io) {
    emitToRoom(io, `hackathon:${hackathon._id}`, 'leaderboard:updated', {
      hackathonId: hackathon._id.toString(),
      submissionId,
    });
    emitToRoom(io, `hackathon:${hackathon._id}`, 'review:submitted', {
      judgeId: judgeId.toString(),
      submissionId: submissionId.toString(),
    });
  }

  return review;
}

export async function getAssignedSubmissionsForJudge(judgeId) {
  const submissions = await Submission.find({ assignedJudgeIds: judgeId })
    .populate('hackathonId', 'title slug reviewDeadline')
    .populate('teamId', 'name')
    .lean();

  // Attach status: completed or pending review
  const reviews = await Review.find({ judgeId }).lean();
  const reviewedMap = new Set(reviews.map((r) => r.submissionId.toString()));

  return submissions.map((sub) => ({
    ...sub,
    hasReviewed: reviewedMap.has(sub._id.toString()),
  }));
}

export async function assignJudgesToSubmissions(hackathonId, assignments) {
  // assignments: [{ submissionId, judgeIds: [] }]
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new NotFoundError('Hackathon');

  for (const item of assignments) {
    await Submission.findByIdAndUpdate(item.submissionId, {
      $set: { assignedJudgeIds: item.judgeIds },
    });
  }

  return { message: 'Judges assigned successfully' };
}

export async function getSubmissionForJudge(submissionId, judgeId) {
  const submission = await Submission.findById(submissionId)
    .populate('hackathonId')
    .populate('teamId', 'name members')
    .lean();
  if (!submission) throw new NotFoundError('Submission');

  const isAssigned = submission.assignedJudgeIds.some((j) => j.toString() === judgeId.toString());
  if (!isAssigned) {
    throw new ForbiddenError('You are not assigned to this submission');
  }

  // BLIND SCORING: Omit other judges' reviews/scores until judge has submitted their own
  const myReview = await Review.findOne({ submissionId, judgeId }).lean();

  return {
    submission,
    myReview: myReview || null,
    hasReviewed: !!myReview,
  };
}
