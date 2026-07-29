import crypto from 'crypto';
import Team from '../models/Team.js';
import Registration from '../models/Registration.js';
import Hackathon from '../models/Hackathon.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../middlewares/errorHandler.js';
import { emitToRoom, emitToUser } from '../socket/index.js';

export async function createTeam(userId, { hackathonId, name, description }) {
  // 1. Verify approved registration (Rule 13)
  const reg = await Registration.findOne({ userId, hackathonId, status: 'approved' });
  if (!reg) {
    throw new ValidationError('You must have an approved registration for this hackathon to create a team');
  }

  // 2. Verify user is not already on a team in this hackathon (Rule 7)
  const existingTeam = await Team.findOne({
    hackathonId,
    'members.userId': userId,
  });
  if (existingTeam) {
    throw new ConflictError('You are already a member of a team in this hackathon');
  }

  // 3. Unique team name in hackathon
  const nameExists = await Team.exists({ hackathonId, name });
  if (nameExists) {
    throw new ConflictError('A team with this name already exists in this hackathon');
  }

  const team = await Team.create({
    hackathonId,
    name,
    description,
    ownerId: userId,
    members: [{ userId, joinedAt: new Date() }],
  });

  // Link team to registration
  reg.teamId = team._id;
  await reg.save();

  return team;
}

export async function getTeamById(teamId) {
  const team = await Team.findById(teamId)
    .populate('ownerId', 'name email avatarUrl githubUrl')
    .populate('members.userId', 'name email avatarUrl githubUrl skills bio')
    .populate('hackathonId')
    .lean();
  if (!team) throw new NotFoundError('Team');
  return team;
}

export async function inviteMember(teamId, email, requestingUserId) {
  const team = await Team.findById(teamId).populate('hackathonId');
  if (!team) throw new NotFoundError('Team');

  if (team.ownerId.toString() !== requestingUserId.toString()) {
    throw new ForbiddenError('Only the team owner can invite members');
  }

  if (team.members.length >= team.hackathonId.maxTeamSize) {
    throw new ValidationError(`Team is already at maximum capacity (${team.hackathonId.maxTeamSize} members)`);
  }

  // Check if invited user exists and has approved registration
  const invitee = await User.findOne({ email }).lean();
  if (!invitee) {
    throw new NotFoundError('No user found with that email address');
  }

  const reg = await Registration.findOne({ userId: invitee._id, hackathonId: team.hackathonId._id, status: 'approved' });
  if (!reg) {
    throw new ValidationError('Invited user does not have an approved registration for this hackathon');
  }

  const alreadyOnTeam = await Team.findOne({ hackathonId: team.hackathonId._id, 'members.userId': invitee._id });
  if (alreadyOnTeam) {
    throw new ConflictError('Invited user is already on a team for this hackathon');
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  team.pendingInvites.push({ email, token, expiresAt });
  await team.save();

  // Create notification
  await Notification.create({
    userId: invitee._id,
    type: 'team_invite',
    title: `Team Invitation`,
    body: `You have been invited to join team "${team.name}" for ${team.hackathonId.title}`,
    link: `/app/teams/${team._id}/join?token=${token}`,
  });

  return { message: 'Invitation sent successfully', inviteToken: token };
}

export async function acceptInvite(inviteToken, userId, io) {
  const team = await Team.findOne({ 'pendingInvites.token': inviteToken }).populate('hackathonId');
  if (!team) throw new NotFoundError('Invalid or expired invitation token');

  const invite = team.pendingInvites.find((i) => i.token === inviteToken);
  if (!invite || new Date() > new Date(invite.expiresAt)) {
    throw new ValidationError('Invitation token has expired');
  }

  const user = await User.findById(userId).lean();
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new ForbiddenError('This invite was sent to a different email address');
  }

  // Atomic capacity check & join
  const updatedTeam = await Team.findOneAndUpdate(
    {
      _id: team._id,
      $expr: { $lt: [{ $size: '$members' }, team.hackathonId.maxTeamSize] },
    },
    {
      $push: { members: { userId, joinedAt: new Date() } },
      $pull: { pendingInvites: { token: inviteToken } },
    },
    { new: true }
  ).populate('members.userId', 'name email avatarUrl');

  if (!updatedTeam) {
    throw new ConflictError('Team capacity reached or invite already accepted');
  }

  // Update registration
  await Registration.updateOne(
    { userId, hackathonId: team.hackathonId._id },
    { $set: { teamId: team._id } }
  );

  if (io) {
    emitToRoom(io, `team:${team._id}`, 'team:memberJoined', {
      teamId: team._id,
      member: user,
    });
  }

  return updatedTeam;
}

export async function removeMember(teamId, targetUserId, requestingUserId, io) {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError('Team');

  if (team.ownerId.toString() !== requestingUserId.toString() && targetUserId !== requestingUserId) {
    throw new ForbiddenError('Only the team owner can remove members');
  }

  if (targetUserId === team.ownerId.toString()) {
    throw new ValidationError('Owner cannot leave without transferring ownership first');
  }

  team.members = team.members.filter((m) => m.userId.toString() !== targetUserId);
  await team.save();

  // Clear registration teamId
  await Registration.updateOne(
    { userId: targetUserId, hackathonId: team.hackathonId },
    { $unset: { teamId: '' } }
  );

  if (io) {
    emitToRoom(io, `team:${team._id}`, 'team:memberRemoved', {
      teamId: team._id,
      userId: targetUserId,
    });
  }

  return team;
}

export async function transferOwnership(teamId, newOwnerId, requestingUserId, io) {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError('Team');

  if (team.ownerId.toString() !== requestingUserId.toString()) {
    throw new ForbiddenError('Only the team owner can transfer ownership');
  }

  const isMember = team.members.some((m) => m.userId.toString() === newOwnerId);
  if (!isMember) {
    throw new ValidationError('New owner must be a member of the team');
  }

  team.ownerId = newOwnerId;
  await team.save();

  if (io) {
    emitToRoom(io, `team:${team._id}`, 'team:ownershipTransferred', {
      teamId: team._id,
      newOwnerId,
    });
  }

  return team;
}

export async function deleteTeam(teamId, requestingUserId) {
  const team = await Team.findById(teamId);
  if (!team) throw new NotFoundError('Team');

  if (team.ownerId.toString() !== requestingUserId.toString()) {
    throw new ForbiddenError('Only the team owner can delete the team');
  }

  // Cascade delete draft submission if any
  if (team.submissionId) {
    await Submission.findByIdAndDelete(team.submissionId);
  }

  // Clear registration links
  await Registration.updateMany(
    { teamId: team._id },
    { $unset: { teamId: '' } }
  );

  await Team.findByIdAndDelete(teamId);
  return { message: 'Team deleted successfully' };
}
