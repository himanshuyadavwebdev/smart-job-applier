import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    matchScore: { type: Number, default: 0 },
    tailoredResumeText: { type: String, default: '' },
    tailoredResumeUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    emailDraft: { type: String, default: '' },
    status: {
      type: String,
      enum: ['saved', 'generating', 'previewing', 'applied', 'rejected', 'interview'],
      default: 'saved',
    },
    appliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
