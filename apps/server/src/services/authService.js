import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { RefreshToken, Session, Settings } from '../models/index.js';
import Notification from '../models/Notification.js';
import {
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../middlewares/errorHandler.js';
import { sendEmail } from '../emails/emailService.js';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// ── Token Helpers ─────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateOpaqueToken() {
  return crypto.randomBytes(40).toString('hex');
}

async function storeRefreshToken(userId, userAgent, ip) {
  const rawToken = generateOpaqueToken();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS_MS());

  const stored = await RefreshToken.create({ userId, tokenHash, expiresAt });
  await Session.create({ userId, refreshTokenId: stored._id, userAgent, ip });

  return { rawToken, storedId: stored._id };
}

function REFRESH_TOKEN_DAYS_MS() {
  return REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function setRefreshCookie(res, rawToken) {
  res.cookie('refreshToken', rawToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_DAYS_MS(),
    path: '/api/v1/auth/refresh',
  });
}

// ── Service Methods ───────────────────────────────────────────────────────────

export async function signup({ name, email, password, role }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Generate email verification token
  const verifyToken = jwt.sign(
    { sub: email, purpose: 'verify' },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: '24h' }
  );

  const user = await User.create({ name, email, passwordHash, role });

  // Create default settings
  await Settings.create({ userId: user._id });

  // Welcome notification
  await Notification.create({
    userId: user._id,
    type: 'welcome',
    title: 'Welcome to FORGE',
    body: 'Complete your profile to get started.',
    link: '/app/profile',
  });

  await sendEmail({
    to: email,
    subject: 'Verify your FORGE account',
    html: `<p>Hi ${name},</p>
           <p>Click the link below to verify your email (valid for 24 hours):</p>
           <a href="${env.CLIENT_URL}/verify-email/${verifyToken}">Verify Email</a>`,
  });

  return { user: sanitizeUser(user) };
}

export async function login({ email, password }, userAgent, ip) {
  const user = await User.findOne({ email });
  if (!user) throw new AuthError('Invalid email or password');
  if (user.isBlocked) throw new AuthError('Your account has been blocked. Contact support.');
  if (user.isDeleted) throw new AuthError('Account not found');

  const valid = await user.comparePassword(password);
  if (!valid) throw new AuthError('Invalid email or password');

  const accessToken = generateAccessToken(user);
  const { rawToken } = await storeRefreshToken(user._id, userAgent, ip);

  return { accessToken, rawToken, user: sanitizeUser(user) };
}

export async function logout(rawToken) {
  if (!rawToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await RefreshToken.updateOne({ tokenHash }, { $set: { revoked: true } });
}

export async function rotateRefreshToken(rawToken, userAgent, ip) {
  if (!rawToken) throw new AuthError('No refresh token provided');

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored) throw new AuthError('Invalid refresh token');

  // Detect reuse of an already-rotated token → revoke all sessions (token theft)
  if (stored.revoked) {
    await RefreshToken.updateMany({ userId: stored.userId }, { $set: { revoked: true } });
    const user = await User.findById(stored.userId);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'FORGE Security Alert — Suspicious login detected',
        html: `<p>We detected suspicious activity on your account. All sessions have been revoked.</p>
               <p>If this wasn't you, reset your password immediately.</p>`,
      });
    }
    throw new AuthError('Token reuse detected. All sessions revoked.');
  }

  if (stored.expiresAt < new Date()) throw new AuthError('Refresh token expired');

  const user = await User.findById(stored.userId).lean();
  if (!user || user.isBlocked || user.isDeleted) throw new AuthError('Account unavailable');

  // Rotate: revoke old, issue new
  const newToken = await storeRefreshToken(user._id, userAgent, ip);
  stored.revoked = true;
  stored.replacedByTokenId = newToken.storedId;
  await stored.save();

  const accessToken = generateAccessToken(user);
  return { accessToken, rawToken: newToken.rawToken, user: sanitizeUser(user) };
}

export async function verifyEmail(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ValidationError('Invalid or expired verification link');
  }

  if (decoded.purpose !== 'verify') throw new ValidationError('Invalid token purpose');

  const user = await User.findOneAndUpdate(
    { email: decoded.sub, isVerified: false },
    { $set: { isVerified: true } },
    { new: true }
  );

  if (!user) throw new NotFoundError('User');

  return { user: sanitizeUser(user) };
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email }).lean();
  // Always respond 200 to avoid email enumeration
  if (!user) return;

  const resetToken = jwt.sign(
    { sub: user._id.toString(), purpose: 'reset' },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  await sendEmail({
    to: email,
    subject: 'FORGE — Password Reset',
    html: `<p>Reset your password (link valid for 1 hour):</p>
           <a href="${env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>`,
  });
}

export async function resetPassword(token, password) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ValidationError('Invalid or expired reset link');
  }

  if (decoded.purpose !== 'reset') throw new ValidationError('Invalid token purpose');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.findByIdAndUpdate(decoded.sub, { $set: { passwordHash } }, { new: true });
  if (!user) throw new NotFoundError('User');

  // Revoke all refresh tokens for security
  await RefreshToken.updateMany({ userId: user._id }, { $set: { revoked: true } });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}
