import slugify from '../utils/slugify.js';
import Hackathon from '../models/Hackathon.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '../middlewares/errorHandler.js';
import { validateHackathonDates } from '@forge/shared';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createHackathon(data, organizerId) {
  const slug = await generateUniqueSlug(data.title);
  const hackathon = await Hackathon.create({
    ...data,
    slug,
    organizerId,
    status: 'draft',
  });
  return hackathon;
}

// ── Get All (public, with search + filters + pagination) ──────────────────────

export async function listHackathons({ search, mode, theme, status, page = 1, limit = 12 }) {
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (mode) query.mode = mode;
  if (theme) query.theme = theme;
  if (status) query.status = status;
  else {
    // Public listing only shows non-draft hackathons
    query.status = { $ne: 'draft' };
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Hackathon.find(query)
      .populate('organizerId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Hackathon.countDocuments(query),
  ]);

  return { items, total, page, limit, hasMore: skip + items.length < total };
}

// ── Get Featured (landing page) ───────────────────────────────────────────────

export async function getFeaturedHackathons() {
  return Hackathon.find({
    status: { $in: ['published', 'registration_open', 'submissions_open'] },
  })
    .sort({ startDate: 1 })
    .limit(6)
    .populate('organizerId', 'name avatarUrl')
    .lean();
}

// ── Get By Slug ───────────────────────────────────────────────────────────────

export async function getHackathonBySlug(slug) {
  const hackathon = await Hackathon.findOne({ slug })
    .populate('organizerId', 'name avatarUrl')
    .populate('sponsorIds')
    .lean();
  if (!hackathon) throw new NotFoundError('Hackathon');
  return hackathon;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateHackathon(id, data, requestingUser) {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) throw new NotFoundError('Hackathon');

  // Ownership enforced in middleware — this is a secondary service-layer guard
  if (
    requestingUser.role !== 'admin' &&
    hackathon.organizerId.toString() !== requestingUser._id.toString()
  ) {
    throw new ForbiddenError('You can only edit your own hackathons');
  }

  // Date ordering validation (only if dates are being updated)
  const dateKeys = ['registrationDeadline', 'submissionStart', 'submissionDeadline', 'reviewDeadline', 'startDate', 'endDate'];
  const hasDateUpdate = dateKeys.some((k) => data[k] !== undefined);
  if (hasDateUpdate) {
    const merged = { ...hackathon.toObject(), ...data };
    const dateErrors = validateHackathonDates(merged);
    if (dateErrors.length) throw new ValidationError('Invalid dates', dateErrors);
  }

  // maxTeamSize decrease guard (Doc 4 Rule 31)
  if (data.maxTeamSize !== undefined && data.maxTeamSize < hackathon.maxTeamSize) {
    const largestTeam = await Team.findOne({ hackathonId: id })
      .sort({ 'members.length': -1 })
      .lean();
    if (largestTeam && largestTeam.members.length > data.maxTeamSize) {
      throw new ValidationError(
        `Cannot reduce maxTeamSize below ${largestTeam.members.length} — existing teams exceed this limit`
      );
    }
  }

  Object.assign(hackathon, data);
  await hackathon.save();
  return hackathon;
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishHackathon(id, organizerId) {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) throw new NotFoundError('Hackathon');

  if (hackathon.status !== 'draft')
    throw new ValidationError('Only draft hackathons can be published');

  // Required field check
  const required = ['title', 'description', 'theme', 'mode', 'registrationDeadline', 'submissionStart', 'submissionDeadline', 'reviewDeadline', 'startDate', 'endDate'];
  const missing = required.filter((f) => !hackathon[f] || (Array.isArray(hackathon[f]) && hackathon[f].length === 0));
  if (missing.length) throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);

  // Date ordering
  const dateErrors = validateHackathonDates(hackathon);
  if (dateErrors.length) throw new ValidationError('Invalid dates', dateErrors);

  hackathon.status = 'published';
  await hackathon.save();
  return hackathon;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteHackathon(id, confirmTitle, requestingUser) {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) throw new NotFoundError('Hackathon');

  const hasRegistrations = await Registration.countDocuments({ hackathonId: id });
  if (hasRegistrations > 0) {
    if (!confirmTitle || confirmTitle !== hackathon.title) {
      throw new ValidationError(
        'This hackathon has existing registrations. Type the hackathon title to confirm deletion.'
      );
    }
  }

  await Hackathon.findByIdAndDelete(id);
}

// ── Public Stats ──────────────────────────────────────────────────────────────

export async function getPublicStats() {
  const [activeHackathons, totalUsers, totalSubmissions] = await Promise.all([
    Hackathon.countDocuments({ status: { $in: ['registration_open', 'submissions_open'] } }),
    (await import('../models/User.js')).default.countDocuments({ isDeleted: false }),
    (await import('../models/Submission.js')).default.countDocuments({ status: 'submitted' }),
  ]);
  return { activeHackathons, totalUsers, totalSubmissions };
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

async function generateUniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (await Hackathon.exists({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
