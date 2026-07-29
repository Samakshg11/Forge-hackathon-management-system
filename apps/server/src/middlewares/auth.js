import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { AuthError, ForbiddenError } from './errorHandler.js';
import ActivityLog from '../models/ActivityLog.js';

/**
 * Verifies the Bearer access token and attaches req.user.
 * On expiry, returns 401 so the client can silent-refresh.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.sub).lean();
    if (!user) throw new AuthError('User not found');
    if (user.isBlocked) throw new ForbiddenError('Account is blocked');
    if (user.isDeleted) throw new AuthError('Account has been deleted');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-based access control.
 * @param {...string} roles - allowed roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AuthError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role '${req.user.role}' cannot perform this action`));
    }
    next();
  };
}

/**
 * Ownership check — loads the resource and compares ownerField to req.user._id.
 * Admin bypasses ownership and the bypass is audit-logged (Doc 6 §2.2 / Doc 4 Rule 36).
 *
 * @param {function} resourceLoader - async (req) => document
 * @param {string} ownerField - field on the document containing the owner id
 * @param {string} resourceType - string label for audit log
 */
export function requireOwnership(resourceLoader, ownerField = 'organizerId', resourceType = 'Resource') {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new AuthError());

      const resource = await resourceLoader(req);
      if (!resource) return next(new ForbiddenError('Resource not found or access denied'));

      req.resource = resource;

      const ownerId = resource[ownerField]?.toString();
      const userId = req.user._id.toString();

      if (req.user.role === 'admin') {
        // Admin bypass — log it
        await ActivityLog.create({
          actorId: req.user._id,
          action: `admin.ownership_bypass`,
          targetType: resourceType,
          targetId: resource._id,
          reason: req.body.reason || 'Admin override',
        });
        return next();
      }

      if (ownerId !== userId) {
        return next(new ForbiddenError('You do not have permission to modify this resource'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
