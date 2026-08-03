import Submission from '../models/Submission.js';
import SubmissionVersion from '../models/SubmissionVersion.js';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import Notification from '../models/Notification.js';
import { NotFoundError, ForbiddenError, LockedError, ValidationError, ConflictError } from '../middlewares/errorHandler.js';

export async function createDraftSubmission(userId, data) {
  const team = await Team.findById(data.teamId);
  if (!team) throw new NotFoundError('Team');

  const isMember = team.members.some((m) => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ForbiddenError('Only team members can create or edit project submissions');
  }

  const hackathon = await Hackathon.findById(data.hackathonId);
  if (!hackathon) throw new NotFoundError('Hackathon');

  if (new Date() > new Date(hackathon.submissionDeadline)) {
    throw new LockedError('Submission deadline has passed');
  }

  const existing = await Submission.findOne({ teamId: data.teamId });
  if (existing) {
    throw new ConflictError('Your team already has a submission for this hackathon');
  }

  // Auto-assign all system judges to submission
  const User = (await import('../models/User.js')).default;
  const systemJudges = await User.find({ role: 'judge' }).select('_id').lean();
  const judgeIds = systemJudges.map((j) => j._id);

  const submission = await Submission.create({
    ...data,
    status: 'draft',
    locked: false,
    assignedJudgeIds: judgeIds,
  });

  team.submissionId = submission._id;
  await team.save();

  return submission;
}

export async function autosaveSubmission(submissionId, userId, data) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new NotFoundError('Submission');

  if (submission.locked) {
    throw new LockedError('This submission is locked and cannot be edited');
  }

  const hackathon = await Hackathon.findById(submission.hackathonId);
  if (new Date() > new Date(hackathon.submissionDeadline)) {
    submission.locked = true;
    submission.lockedAt = new Date();
    await submission.save();
    throw new LockedError('Submission deadline has passed. Form locked.');
  }

  const team = await Team.findById(submission.teamId);
  const isMember = team?.members.some((m) => m.userId.toString() === userId.toString());
  if (!isMember) {
    throw new ForbiddenError('Only team members can edit the submission');
  }

  // Create version snapshot if this is an edit after initial submission
  if (submission.status === 'submitted') {
    await SubmissionVersion.create({
      submissionId: submission._id,
      snapshot: submission.toObject(),
      editedBy: userId,
    });
  }

  Object.assign(submission, data);
  await submission.save();
  return submission;
}

export async function finalizeSubmit(submissionId, userId) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new NotFoundError('Submission');

  if (submission.locked) {
    throw new LockedError('Submission is locked');
  }

  const hackathon = await Hackathon.findById(submission.hackathonId);
  if (new Date() > new Date(hackathon.submissionDeadline)) {
    throw new LockedError('Submission deadline has passed');
  }

  // Validate required fields for final submit
  if (!submission.projectName || !submission.problemStatement || !submission.solution || !submission.githubUrl) {
    throw new ValidationError('All required fields (Project Name, Problem Statement, Solution, GitHub URL) must be filled');
  }

  const User = (await import('../models/User.js')).default;
  const systemJudges = await User.find({ role: 'judge' }).select('_id').lean();
  const judgeIds = systemJudges.map((j) => j._id);

  submission.status = 'submitted';
  submission.submittedAt = new Date();
  submission.assignedJudgeIds = Array.from(new Set([...(submission.assignedJudgeIds || []).map(id => id.toString()), ...judgeIds.map(id => id.toString())]));
  await submission.save();

  // Notify team members
  const team = await Team.findById(submission.teamId);
  if (team) {
    for (const member of team.members) {
      await Notification.create({
        userId: member.userId,
        type: 'submission_successful',
        title: 'Project Submitted!',
        body: `Your team "${team.name}" has successfully submitted "${submission.projectName}" for ${hackathon.title}`,
        link: `/app/teams/${team._id}`,
      });
    }
  }

  return submission;
}

export async function getSubmissionById(submissionId, requestingUser) {
  const submission = await Submission.findById(submissionId)
    .populate('teamId')
    .populate('hackathonId')
    .lean();
  if (!submission) throw new NotFoundError('Submission');

  // RBAC check: team members, assigned judges, organizer, or admin
  const team = await Team.findById(submission.teamId);
  const isMember = team?.members.some((m) => m.userId.toString() === requestingUser._id.toString());
  const isOrganizer = submission.hackathonId.organizerId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'admin';
  const isJudge = submission.assignedJudgeIds.some((j) => j.toString() === requestingUser._id.toString());

  if (!isMember && !isOrganizer && !isAdmin && !isJudge) {
    throw new ForbiddenError('You do not have access to view this submission');
  }

  return submission;
}

export async function getSubmissionVersions(submissionId, requestingUser) {
  const versions = await SubmissionVersion.find({ submissionId })
    .populate('editedBy', 'name email avatarUrl')
    .sort({ editedAt: -1 })
    .lean();
  return versions;
}
