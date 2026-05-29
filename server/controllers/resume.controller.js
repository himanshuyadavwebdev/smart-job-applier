import { validationResult } from 'express-validator';
import { Resume } from '../models/Resume.model.js';
import { User } from '../models/User.model.js';
import { extractText } from '../services/resumeParserService.js';
import { classifyResume, getATSScore } from '../services/aiService.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.', errors: [] });
    }

    const { buffer, mimetype, originalname } = req.file;

    // Extract text
    const rawText = await extractText(buffer, mimetype);
    if (!rawText || rawText.length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract meaningful text from the file. Please ensure the file is not scanned or image-based.', errors: [] });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      public_id: `resume_${req.user._id}_${Date.now()}`,
      format: mimetype === 'application/pdf' ? 'pdf' : 'docx',
    });

    // AI Classification
    const classification = await classifyResume(rawText);

    // Deactivate existing resumes
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });

    // Save new resume
    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: uploadResult.secure_url,
      fileName: originalname,
      rawText,
      classification,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully.',
      data: resume,
    });
  } catch (err) {
    next(err);
  }
}

export async function getActiveResume(req, res, next) {
  try {
    const resume = await Resume.findOne({ userId: req.user._id, isActive: true });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No active resume found. Please upload your resume.', errors: [] });
    }
    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const {
      desiredRole, experienceLevel, targetLevel,
      salaryMin, salaryMax, currency,
      jobType, preferredLocations, techStack,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'preferences.desiredRole': desiredRole,
          'preferences.experienceLevel': experienceLevel,
          'preferences.targetLevel': targetLevel,
          'preferences.salaryMin': salaryMin,
          'preferences.salaryMax': salaryMax,
          'preferences.currency': currency || 'USD',
          'preferences.jobType': jobType || [],
          'preferences.preferredLocations': preferredLocations || [],
          'preferences.techStack': techStack || [],
        },
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      data: user.preferences,
    });
  } catch (err) {
    next(err);
  }
}

export async function getATSScoreController(req, res, next) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required.', errors: [] });
    }

    const resume = await Resume.findOne({ userId: req.user._id, isActive: true });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No active resume found.', errors: [] });
    }

    const result = await getATSScore(resume.rawText, jobDescription);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
