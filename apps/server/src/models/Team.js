import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pendingInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    description: { type: String, default: '', maxlength: 500 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    pendingInvites: [pendingInviteSchema],
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', default: null },
  },
  { timestamps: true }
);

// Unique team name per hackathon (Doc 4 Rule — business rule)
teamSchema.index({ hackathonId: 1, name: 1 }, { unique: true });
teamSchema.index({ hackathonId: 1 });

export default mongoose.model('Team', teamSchema);
