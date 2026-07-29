import mongoose from 'mongoose';

export const Certificate = mongoose.model(
  'Certificate',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
      rank: { type: Number, default: null },
      verificationCode: { type: String, required: true, unique: true },
      pdfUrl: { type: String, default: '' },
      superseded: { type: Boolean, default: false },
      issuedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
  )
);

export const Bookmark = mongoose.model(
  'Bookmark',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    },
    { timestamps: true }
  ).index({ userId: 1, hackathonId: 1 }, { unique: true })
);

export const Achievement = mongoose.model(
  'Achievement',
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    iconKey: { type: String, default: '' },
    xpValue: { type: Number, default: 50 },
    criteriaKey: { type: String, required: true }, // e.g. 'first_submission', 'top3_finish'
  })
);

export const Message = mongoose.model(
  'Message',
  new mongoose.Schema(
    {
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true, maxlength: 2000 },
      sentAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
  ).index({ teamId: 1, sentAt: 1 })
);

export const Sponsor = mongoose.model(
  'Sponsor',
  new mongoose.Schema({
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze'], default: 'silver' },
    websiteUrl: { type: String, default: '' },
  })
);

export const Settings = mongoose.model(
  'Settings',
  new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    notificationPreferences: {
      emailRegistrationUpdates: { type: Boolean, default: true },
      emailTeamInvites: { type: Boolean, default: true },
      emailSubmissionLocked: { type: Boolean, default: true },
      emailResultsPublished: { type: Boolean, default: true },
      inAppAll: { type: Boolean, default: true },
    },
  })
);

export const RefreshToken = mongoose.model(
  'RefreshToken',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tokenHash: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      revoked: { type: Boolean, default: false },
      replacedByTokenId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true }
  )
);

export const Session = mongoose.model(
  'Session',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      refreshTokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'RefreshToken' },
      userAgent: { type: String, default: '' },
      ip: { type: String, default: '' },
      lastActiveAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
);
