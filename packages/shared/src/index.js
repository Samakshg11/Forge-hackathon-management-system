import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const UserRole = z.enum(['admin', 'organizer', 'judge', 'participant']);

export const HackathonMode = z.enum(['online', 'offline', 'hybrid']);

export const HackathonStatus = z.enum([
  'draft',
  'published',
  'registration_open',
  'registration_closed',
  'submissions_open',
  'judging',
  'completed',
]);

export const RegistrationStatus = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const SubmissionStatus = z.enum([
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
]);

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: UserRole.default('participant'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8)
      .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Profile / Settings Schemas ───────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(20).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  notificationPreferences: z
    .object({
      emailRegistrationUpdates: z.boolean().optional(),
      emailTeamInvites: z.boolean().optional(),
      emailSubmissionLocked: z.boolean().optional(),
      emailResultsPublished: z.boolean().optional(),
      inAppAll: z.boolean().optional(),
    })
    .optional(),
});

// ─── Hackathon Schemas ────────────────────────────────────────────────────────

export const judgingCriterionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  maxScore: z.number().int().min(1).max(100).default(10),
  weight: z.number().min(0).max(1).default(1),
});

export const hackathonBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  theme: z.array(z.string()).min(1, 'Select at least one theme').max(10),
  mode: HackathonMode,
  venue: z.string().max(200).optional(),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  registrationDeadline: z.string().datetime(),
  submissionStart: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
  reviewDeadline: z.string().datetime(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  prizePool: z.string().max(500).optional(),
  maxTeamSize: z.number().int().min(1).max(20).default(4),
  rules: z.string().max(10000).optional(),
  judgingCriteria: z.array(judgingCriterionSchema).min(1).max(10),
});

export const createHackathonSchema = hackathonBaseSchema;
export const updateHackathonSchema = hackathonBaseSchema.partial();

/**
 * Validates that hackathon dates are in a logical order.
 * @param {object} data - hackathon date fields
 * @returns {string[]} array of error messages (empty if valid)
 */
export function validateHackathonDates(data) {
  const errors = [];
  const rd = new Date(data.registrationDeadline);
  const ss = new Date(data.submissionStart);
  const sd = new Date(data.submissionDeadline);
  const rv = new Date(data.reviewDeadline);
  const st = new Date(data.startDate);
  const en = new Date(data.endDate);

  if (rd >= sd) errors.push('Registration deadline must be before submission deadline');
  if (ss >= sd) errors.push('Submission start must be before submission deadline');
  if (sd >= rv) errors.push('Submission deadline must be before review deadline');
  if (st > en) errors.push('Start date must be before or equal to end date');
  return errors;
}

// ─── Registration Schemas ─────────────────────────────────────────────────────

export const createRegistrationSchema = z.object({
  hackathonId: z.string().min(1),
});

export const rejectRegistrationSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for rejection').max(500),
});

// ─── Team Schemas ─────────────────────────────────────────────────────────────

export const createTeamSchema = z.object({
  hackathonId: z.string().min(1),
  name: z.string().min(3, 'Team name must be at least 3 characters').max(40),
  description: z.string().max(500).optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(3).max(40).optional(),
  description: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1),
});

// ─── Submission Schemas ───────────────────────────────────────────────────────

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\//;

export const submissionBaseSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters').max(120),
  problemStatement: z.string().min(20).max(2000),
  solution: z.string().min(20).max(5000),
  description: z.string().max(5000).optional(),
  githubUrl: z
    .string()
    .regex(GITHUB_URL_REGEX, 'Must be a valid GitHub repository URL')
    .optional()
    .or(z.literal('')),
  liveDemoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  techStack: z.array(z.string()).min(1, 'Add at least one technology').max(20),
  screenshotUrls: z.array(z.string().url()).max(6).default([]),
  presentationUrl: z.string().url().optional().or(z.literal('')),
  demoVideoUrl: z.string().url().optional().or(z.literal('')),
});

export const createSubmissionSchema = submissionBaseSchema.extend({
  teamId: z.string().min(1),
  hackathonId: z.string().min(1),
});

export const updateSubmissionSchema = submissionBaseSchema.partial();

// Required fields gate for draft → submitted transition
export const submitSubmissionSchema = submissionBaseSchema.extend({
  githubUrl: z.string().regex(GITHUB_URL_REGEX, 'GitHub URL is required for submission'),
  projectName: z.string().min(2).max(120),
  problemStatement: z.string().min(20).max(2000),
  solution: z.string().min(20).max(5000),
  techStack: z.array(z.string()).min(1),
});

// ─── Review Schemas ───────────────────────────────────────────────────────────

export const rubricScoreSchema = z.object({
  innovation: z.number().int().min(1).max(10),
  technicalComplexity: z.number().int().min(1).max(10),
  ui: z.number().int().min(1).max(10),
  functionality: z.number().int().min(1).max(10),
  scalability: z.number().int().min(1).max(10),
  documentation: z.number().int().min(1).max(10),
  presentation: z.number().int().min(1).max(10),
});

export const createReviewSchema = z.object({
  submissionId: z.string().min(1),
  scores: rubricScoreSchema,
  feedback: z.string().min(20, 'Feedback must be at least 20 characters').max(5000),
});

// ─── Search / Filter Schemas ──────────────────────────────────────────────────

export const hackathonFilterSchema = z.object({
  search: z.string().max(100).optional(),
  mode: HackathonMode.optional(),
  theme: z.string().optional(),
  status: HackathonStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ─── Constants ────────────────────────────────────────────────────────────────

export const HACKATHON_THEMES = [
  'AI/ML',
  'Web3/Blockchain',
  'HealthTech',
  'FinTech',
  'EdTech',
  'ClimaTech',
  'Gaming',
  'Open Source',
  'Social Impact',
  'IoT/Hardware',
  'Cybersecurity',
  'AR/VR',
  'DevTools',
  'Other',
];

export const RUBRIC_CRITERIA = [
  'innovation',
  'technicalComplexity',
  'ui',
  'functionality',
  'scalability',
  'documentation',
  'presentation',
];

export const RUBRIC_LABELS = {
  innovation: 'Innovation',
  technicalComplexity: 'Technical Complexity',
  ui: 'UI/UX Design',
  functionality: 'Functionality',
  scalability: 'Scalability',
  documentation: 'Documentation',
  presentation: 'Presentation',
};

export const MAX_TOTAL_SCORE = RUBRIC_CRITERIA.length * 10; // 70
