import { Router } from 'express';
import * as authService from '../services/authService.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter, strictAuthLimiter } from '../middlewares/rateLimiter.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@forge/shared';

const router = Router();

// POST /api/v1/auth/signup
router.post('/signup', strictAuthLimiter, validate(signupSchema), async (req, res, next) => {
  try {
    const result = await authService.signup(req.validated);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { accessToken, rawToken, user } = await authService.login(
      req.validated,
      req.headers['user-agent'],
      req.ip
    );
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    await authService.logout(rawToken);
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    const { accessToken, rawToken: newRawToken, user } = await authService.rotateRefreshToken(
      rawToken,
      req.headers['user-agent'],
      req.ip
    );
    res.cookie('refreshToken', newRawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  strictAuthLimiter,
  validate(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      await authService.forgotPassword(req.validated.email);
      // Always 200 to avoid email enumeration
      res.json({ success: true, data: { message: 'If that email exists, a reset link was sent.' } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req, res, next) => {
    try {
      await authService.resetPassword(req.validated.token, req.validated.password);
      res.json({ success: true, data: { message: 'Password reset. Please log in.' } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
