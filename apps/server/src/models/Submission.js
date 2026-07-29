import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    projectName: { type: String, required: true, trim: true, maxlength: 120 },
    problemStatement: { type: String, required: true, maxlength: 2000 },
    solution: { type: String, required: true, maxlength: 5000 },
    description: { type: String, default: '', maxlength: 5000 },
    githubUrl: { type: String, default: '' },
    liveDemoUrl: { type: String, default: '' },
    techStack: [{ type: String }],
    screenshotUrls: [{ type: String }],
    presentationUrl: { type: String, default: '' },
    demoVideoUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    locked: { type: Boolean, default: false },
    assignedJudgeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    submittedAt: { type: Date, default: null },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One submission per team (Doc 4 Rule 18)
submissionSchema.index({ hackathonId: 1, status: 1 });
submissionSchema.index({ projectName: 'text', description: 'text' });

export default mongoose.model('Submission', submissionSchema);
