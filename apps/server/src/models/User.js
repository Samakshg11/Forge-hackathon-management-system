import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const achievementEntrySchema = new mongoose.Schema(
  {
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const portfolioEntrySchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' },
    rank: Number,
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    completedAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'judge', 'participant'],
      default: 'participant',
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    skills: [{ type: String, maxlength: 50 }],
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    xp: { type: Number, default: 0 },
    userAchievements: [achievementEntrySchema],
    portfolioEntries: [portfolioEntrySchema],
    // Judge-only: self-declared conflicts of interest
    conflictsOfInterest: [{ type: String }],
    // Soft-delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1 });

// Instance method: compare password
userSchema.methods.comparePassword = function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Static: compute profile completion %
userSchema.methods.computeProfileCompletion = function () {
  const fields = [
    this.avatarUrl,
    this.bio,
    this.skills?.length > 0,
    this.githubUrl,
    this.linkedinUrl,
  ];
  const filled = fields.filter(Boolean).length;
  this.profileCompletion = Math.round((filled / fields.length) * 100);
  return this.profileCompletion;
};

// Filter soft-deleted by default
userSchema.pre('find', function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

export default mongoose.model('User', userSchema);
