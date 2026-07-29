import mongoose from 'mongoose';

const submissionVersionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

submissionVersionSchema.index({ submissionId: 1, editedAt: -1 });

export default mongoose.model('SubmissionVersion', submissionVersionSchema);
