import mongoose from 'mongoose';

const scoresSchema = new mongoose.Schema(
  {
    innovation: { type: Number, required: true, min: 1, max: 10 },
    technicalComplexity: { type: Number, required: true, min: 1, max: 10 },
    ui: { type: Number, required: true, min: 1, max: 10 },
    functionality: { type: Number, required: true, min: 1, max: 10 },
    scalability: { type: Number, required: true, min: 1, max: 10 },
    documentation: { type: Number, required: true, min: 1, max: 10 },
    presentation: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scores: { type: scoresSchema, required: true },
  // Stored at submit time, never retroactively recalculated (Doc 4 Rule — historical integrity)
  totalScore: { type: Number, required: true },
  feedback: { type: String, required: true, maxlength: 5000 },
  submittedAt: { type: Date, default: Date.now },
});

// One review per judge per submission (Doc 4 Rule 21)
reviewSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
