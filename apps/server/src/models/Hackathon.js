import mongoose from 'mongoose';

const judgingCriterionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    maxScore: { type: Number, default: 10 },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const hackathonSchema = new mongoose.Schema(
  {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 5000 },
    theme: [{ type: String, required: true }],
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
    venue: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    registrationDeadline: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    reviewDeadline: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    prizePool: { type: String, default: '' },
    maxTeamSize: { type: Number, default: 4, min: 1, max: 20 },
    rules: { type: String, default: '' },
    judgingCriteria: [judgingCriterionSchema],
    status: {
      type: String,
      enum: [
        'draft',
        'published',
        'registration_open',
        'registration_closed',
        'submissions_open',
        'judging',
        'completed',
      ],
      default: 'draft',
    },
    resultsPublished: { type: Boolean, default: false },
    assignedJudgeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sponsorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' }],
  },
  { timestamps: true }
);

// Indexes from Doc 5 §5.1
hackathonSchema.index({ title: 'text', description: 'text', theme: 'text' });
hackathonSchema.index({ organizerId: 1 });
hackathonSchema.index({ status: 1 });

export default mongoose.model('Hackathon', hackathonSchema);
