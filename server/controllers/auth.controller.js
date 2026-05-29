import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.model.js';
import { Resume } from '../models/Resume.model.js';
import { generateToken } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/emailService.js';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.', errors: [] });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = generateToken(user._id);
    sendWelcomeEmail(user).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', errors: [] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', errors: [] });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user.toObject ? req.user.toObject() : req.user;
    delete user.passwordHash;

    const activeResume = await Resume.findOne({ userId: user._id, isActive: true });

    res.json({
      success: true,
      data: { user, resume: activeResume || null },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully.' });
}
