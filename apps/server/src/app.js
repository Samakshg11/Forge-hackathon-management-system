import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

// Route imports
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import hackathonsRouter from './routes/hackathons.js';
import registrationsRouter from './routes/registrations.js';
import teamsRouter from './routes/teams.js';
import submissionsRouter from './routes/submissions.js';
import judgeRouter from './routes/judge.js';
import reviewsRouter from './routes/reviews.js';
import leaderboardRouter from './routes/leaderboard.js';
import certificatesRouter from './routes/certificates.js';
import notificationsRouter from './routes/notifications.js';
import bookmarksRouter from './routes/bookmarks.js';
import searchRouter from './routes/search.js';
import analyticsRouter from './routes/analytics.js';
import adminRouter from './routes/admin.js';
import uploadsRouter from './routes/uploads.js';
import statsRouter from './routes/stats.js';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", env.CLIENT_URL],
      },
    },
  })
);
app.use(mongoSanitize()); // Prevent NoSQL injection

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // required for refresh-token cookie
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRouter);
app.use(`${API}/users`, usersRouter);
app.use(`${API}/hackathons`, hackathonsRouter);
app.use(`${API}/registrations`, registrationsRouter);
app.use(`${API}/teams`, teamsRouter);
app.use(`${API}/submissions`, submissionsRouter);
app.use(`${API}/judge`, judgeRouter);
app.use(`${API}/reviews`, reviewsRouter);
app.use(`${API}/leaderboard`, leaderboardRouter);
app.use(`${API}/certificates`, certificatesRouter);
app.use(`${API}/notifications`, notificationsRouter);
app.use(`${API}/bookmarks`, bookmarksRouter);
app.use(`${API}/search`, searchRouter);
app.use(`${API}/analytics`, analyticsRouter);
app.use(`${API}/admin`, adminRouter);
app.use(`${API}/uploads`, uploadsRouter);
app.use(`${API}/stats`, statsRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
