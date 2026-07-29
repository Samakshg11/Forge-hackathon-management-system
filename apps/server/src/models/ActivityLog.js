import mongoose from 'mongoose';

// Immutable append-only audit trail (Doc 4 §1.23 — no update/delete endpoint ever)
const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'hackathon.force_delete', 'registration.approve'
    targetType: { type: String, required: true }, // e.g. 'Hackathon', 'Registration'
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, default: '' },
    diff: { type: mongoose.Schema.Types.Mixed, default: null }, // { before, after }
  },
  {
    timestamps: true,
    // Prevent accidental updates — this collection is append-only
  }
);

activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ actorId: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
