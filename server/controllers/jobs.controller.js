import { Job } from '../models/Job.model.js';
import { Application } from '../models/Application.model.js';
import { Resume } from '../models/Resume.model.js';
import { User } from '../models/User.model.js';
import { fetchJobs } from '../services/jobFetchService.js';
import { rankJobs } from '../services/matchingService.js';

export async function getMatchedJobs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const user = await User.findById(req.user._id);
    const resume = await Resume.findOne({ userId: req.user._id, isActive: true });

    const preferences = {
      ...user.preferences.toObject(),
      ...(req.query.role && { desiredRole: req.query.role }),
      ...(req.query.location && { preferredLocations: [req.query.location] }),
      ...(req.query.jobType && { jobType: [req.query.jobType] }),
      ...(req.query.salaryMin && { salaryMin: parseInt(req.query.salaryMin) }),
    };

    const rawJobs = await fetchJobs(preferences);
    const rankedJobs = rankJobs(rawJobs, resume, preferences);

    const total = rankedJobs.length;
    const start = (page - 1) * limit;
    const paged = rankedJobs.slice(start, start + limit);

    // Get saved job IDs for this user
    const savedApps = await Application.find({ userId: req.user._id, status: 'saved' }).select('jobId');
    const savedIds = new Set(savedApps.map((a) => String(a.jobId)));

    const jobsWithStatus = paged.map((job) => ({
      ...job,
      isSaved: savedIds.has(String(job._id)),
    }));

    res.json({
      success: true,
      data: {
        jobs: jobsWithStatus,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.', errors: [] });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function saveJob(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.', errors: [] });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.', errors: [] });
    }

    const resume = await Resume.findOne({ userId: req.user._id, isActive: true });

    const existing = await Application.findOne({ userId: req.user._id, jobId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Job already saved.', data: existing });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      resumeId: resume?._id || null,
      status: 'saved',
    });

    res.status(201).json({ success: true, message: 'Job saved.', data: application });
  } catch (err) {
    next(err);
  }
}

export async function unsaveJob(req, res, next) {
  try {
    const result = await Application.findOneAndDelete({
      userId: req.user._id,
      jobId: req.params.jobId,
      status: 'saved',
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Saved job not found.', errors: [] });
    }

    res.json({ success: true, message: 'Job removed from saved list.' });
  } catch (err) {
    next(err);
  }
}

export async function getSavedJobs(req, res, next) {
  try {
    const saved = await Application.find({ userId: req.user._id, status: 'saved' })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}
