import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const preferencesSchema = new mongoose.Schema({
  desiredRole: { type: String, default: '' },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead', ''], default: '' },
  targetLevel: { type: String, default: '' },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  jobType: [{ type: String, enum: ['Remote', 'Hybrid', 'On-site'] }],
  preferredLocations: [String],
  techStack: [String],
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: null },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);
