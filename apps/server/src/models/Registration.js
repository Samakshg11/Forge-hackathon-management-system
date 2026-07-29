import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    rejectionReason: { type: String, default: '' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Unique compound index — prevents double registration (race-condition safe, Doc 4 Rule 1)
registrationSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });
registrationSchema.index({ hackathonId: 1, status: 1 });

export default mongoose.model('Registration', registrationSchema);
