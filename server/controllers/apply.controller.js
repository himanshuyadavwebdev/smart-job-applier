import { Application } from '../models/Application.model.js';
import { Job } from '../models/Job.model.js';
import { Resume } from '../models/Resume.model.js';
import { User } from '../models/User.model.js';
import { generateApplicationDocs } from '../services/aiService.js';
import { sendApplicationConfirmation } from '../services/emailService.js';

export async function generateDocs(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.', errors: [] });
    }

    const [job, resume, user] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ userId: req.user._id, isActive: true }),
      User.findById(req.user._id).select('-passwordHash'),
    ]);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.', errors: [] });
    if (!resume) return res.status(404).json({ success: false, message: 'No active resume found. Please upload your resume first.', errors: [] });

    // Create or update application as 'generating'
    let application = await Application.findOneAndUpdate(
      { userId: req.user._id, jobId },
      {
        $set: {
          resumeId: resume._id,
          status: 'generating',
        },
      },
      { upsert: true, new: true }
    );

    const userProfile = {
      name: user.name,
      preferences: user.preferences,
      classification: resume.classification,
    };

    const docs = await generateApplicationDocs(resume.rawText, job.description, userProfile);

    application = await Application.findByIdAndUpdate(
      application._id,
      {
        $set: {
          tailoredResumeText: docs.tailoredResumeText,
          coverLetter: docs.coverLetter,
          emailDraft: docs.emailDraft,
          status: 'previewing',
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Application documents generated.',
      data: {
        applicationId: application._id,
        tailoredResumeText: docs.tailoredResumeText,
        coverLetter: docs.coverLetter,
        emailDraft: docs.emailDraft,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmApplication(req, res, next) {
  try {
    const { jobId, coverLetter, tailoredResumeText } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.', errors: [] });
    }

    const [job, resume] = await Promise.all([
      Job.findById(jobId),
      Resume.findOne({ userId: req.user._id, isActive: true }),
    ]);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.', errors: [] });

    const application = await Application.findOneAndUpdate(
      { userId: req.user._id, jobId },
      {
        $set: {
          coverLetter: coverLetter || '',
          tailoredResumeText: tailoredResumeText || '',
          status: 'applied',
          appliedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found. Please generate documents first.', errors: [] });
    }

    // Send confirmation email async
    sendApplicationConfirmation(req.user, job, application).catch(() => {});

    res.json({
      success: true,
      message: 'Application confirmed and submitted.',
      data: { application, applyUrl: job.applyUrl },
    });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationHistory(req, res, next) {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId')
      .populate('resumeId', 'fileName classification.role classification.atsScore')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['applied', 'rejected', 'interview'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}.`, errors: [] });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status } },
      { new: true }
    ).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.', errors: [] });
    }

    res.json({ success: true, message: 'Status updated.', data: application });
  } catch (err) {
    next(err);
  }
}
