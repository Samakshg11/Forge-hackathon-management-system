import Registration from '../models/Registration.js';
import Hackathon from '../models/Hackathon.js';
import Notification from '../models/Notification.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../middlewares/errorHandler.js';
import { emitToUser, emitToRoom } from '../socket/index.js';

export async function register(userId, hackathonId, io) {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new NotFoundError('Hackathon');

  if (hackathon.status !== 'published' && hackathon.status !== 'registration_open') {
    throw new ValidationError('Registration is not currently open for this hackathon');
  }

  if (new Date() > new Date(hackathon.registrationDeadline)) {
    throw new ValidationError('Registration deadline has passed');
  }

  const existing = await Registration.findOne({ userId, hackathonId });
  if (existing) {
    if (existing.status === 'rejected') {
      throw new ConflictError('Your registration for this hackathon was previously rejected');
    }
    throw new ConflictError('You have already registered for this hackathon');
  }

  const registration = await Registration.create({
    userId,
    hackathonId,
    status: 'pending',
  });

  // Socket notification to organizer
  if (io) {
    emitToRoom(io, `hackathon:${hackathonId}`, 'registration:created', {
      registrationId: registration._id,
      userId,
      hackathonId,
    });
  }

  return registration;
}

export async function getRegistrationsForHackathon(hackathonId, organizerId) {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new NotFoundError('Hackathon');

  return Registration.find({ hackathonId })
    .populate('userId', 'name email avatarUrl githubUrl skills profileCompletion')
    .sort({ createdAt: -1 })
    .lean();
}

export async function approveRegistration(registrationId, organizerId, io) {
  const reg = await Registration.findById(registrationId).populate('hackathonId');
  if (!reg) throw new NotFoundError('Registration');

  if (new Date() > new Date(reg.hackathonId.registrationDeadline)) {
    throw new ValidationError('Organizer cannot approve a registration after registration deadline has passed');
  }

  reg.status = 'approved';
  reg.decidedBy = organizerId;
  reg.decidedAt = new Date();
  await reg.save();

  // Create in-app notification
  await Notification.create({
    userId: reg.userId,
    type: 'registration_approved',
    title: `Registration Approved!`,
    body: `Your registration for "${reg.hackathonId.title}" has been approved. You can now form or join a team!`,
    link: `/app/dashboard`,
  });

  if (io) {
    emitToUser(io, reg.userId.toString(), 'registration:updated', {
      registrationId: reg._id,
      status: 'approved',
    });
  }

  return reg;
}

export async function rejectRegistration(registrationId, reason, organizerId, io) {
  const reg = await Registration.findById(registrationId).populate('hackathonId');
  if (!reg) throw new NotFoundError('Registration');

  reg.status = 'rejected';
  reg.rejectionReason = reason;
  reg.decidedBy = organizerId;
  reg.decidedAt = new Date();
  await reg.save();

  await Notification.create({
    userId: reg.userId,
    type: 'registration_rejected',
    title: `Registration Update`,
    body: `Your registration for "${reg.hackathonId.title}" was not approved: ${reason}`,
    link: `/app/dashboard`,
  });

  if (io) {
    emitToUser(io, reg.userId.toString(), 'registration:updated', {
      registrationId: reg._id,
      status: 'rejected',
      reason,
    });
  }

  return reg;
}

export async function cancelRegistration(registrationId, userId) {
  const reg = await Registration.findById(registrationId);
  if (!reg) throw new NotFoundError('Registration');

  if (reg.userId.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized to cancel this registration');
  }

  if (reg.status !== 'pending') {
    throw new ValidationError('Only pending registrations can be cancelled');
  }

  reg.status = 'cancelled';
  await reg.save();
  return reg;
}

export async function getMyRegistrations(userId) {
  return Registration.find({ userId, status: { $ne: 'cancelled' } })
    .populate('hackathonId')
    .sort({ createdAt: -1 })
    .lean();
}
