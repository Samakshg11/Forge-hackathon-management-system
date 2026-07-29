import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middlewares/auth.js';
import { env } from '../config/env.js';

const router = Router();

// POST /api/v1/uploads/sign — Request Cloudinary signature for direct browser upload
router.post('/sign', requireAuth, async (req, res, next) => {
  try {
    const { folder = 'general' } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      timestamp,
      folder: `forge/${folder}`,
    };

    let signature = '';
    if (env.CLOUDINARY_API_SECRET) {
      signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);
    } else {
      signature = 'mock_signature_for_development';
    }

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: env.CLOUDINARY_CLOUD_NAME || 'forge_dev',
        apiKey: env.CLOUDINARY_API_KEY || '123456789',
        folder: `forge/${folder}`,
      },
    });
  } catch (err) { next(err); }
});

export default router;
