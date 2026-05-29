import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true },
    source: { type: String, enum: ['Adzuna', 'JSearch', 'Manual'], default: 'Adzuna' },
    title: { type: String, required: true },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    jobType: { type: String, default: '' },
    description: { type: String, default: '' },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    currency: { type: String, default: 'USD' },
    skills: [String],
    applyUrl: { type: String, required: true },
    postedAt: { type: Date, default: null },
    fetchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

jobSchema.index({ externalId: 1, source: 1 }, { unique: true });

export const Job = mongoose.model('Job', jobSchema);
