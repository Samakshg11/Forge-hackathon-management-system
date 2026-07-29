import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import app from './app.js';
import { initSocket } from './socket/index.js';
import { startCronJobs } from './cron/index.js';

async function bootstrap() {
  await connectDB();

  const httpServer = createServer(app);

  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Make io available throughout the app
  app.set('io', io);

  initSocket(io);
  startCronJobs(io);

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${env.PORT} is already in use by another process.`);
      console.error(`👉 Change PORT in .env or kill the process using port ${env.PORT}.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  httpServer.listen(env.PORT, () => {
    console.log(`🚀  FORGE server running on http://localhost:${env.PORT}`);
    console.log(`🌍  Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    httpServer.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
