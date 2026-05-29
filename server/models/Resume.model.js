import mongoose from 'mongoose';

const classificationSchema = new mongoose.Schema({
  role: { type: String, default: '' },
  experienceLevel: { type: String, default: '' },
  skills: [String],
  techStack: [String],
  strengths: [String],
  missingSkills: [String],
  atsScore: { type: Number, default: 0 },
  summary: { type: String, default: '' },
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: '' },
    rawText: { type: String, default: '' },
    classification: { type: classificationSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);
