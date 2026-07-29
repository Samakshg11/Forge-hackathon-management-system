import cron from 'node-cron';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import { emitToRoom } from '../socket/index.js';

/**
 * Runs every minute.
 * Finds hackathons whose submissionDeadline has just passed and
 * locks all un-locked submissions — then emits submission:locked.
 * This is the authoritative lock mechanism; client-side timers are UX only.
 */
function submissionLockJob(io) {
  return cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find hackathons in submissions_open state that are now past their deadline
      const hackathons = await Hackathon.find({
        status: 'submissions_open',
        submissionDeadline: { $lte: now },
      }).lean();

      for (const hackathon of hackathons) {
        // Lock all non-locked submissions
        const result = await Submission.updateMany(
          { hackathonId: hackathon._id, locked: false },
          { $set: { locked: true, lockedAt: now, status: 'submitted' } }
        );

        if (result.modifiedCount > 0) {
          // Move hackathon to judging status
          await Hackathon.findByIdAndUpdate(hackathon._id, {
            $set: { status: 'judging' },
          });

          // Broadcast to all participants/organizer of this hackathon
          emitToRoom(io, `hackathon:${hackathon._id}`, 'submission:locked', {
            hackathonId: hackathon._id.toString(),
          });

          console.log(
            `🔒  Locked ${result.modifiedCount} submissions for hackathon: ${hackathon.title}`
          );
        }
      }
    } catch (err) {
      console.error('submissionLockJob error:', err.message);
    }
  });
}

/**
 * Runs every 5 minutes.
 * Transitions hackathons from published → registration_open and
 * registration_open → registration_closed based on dates.
 */
function hackathonStatusJob(io) {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();

      // published → registration_open (when registration is within the window)
      await Hackathon.updateMany(
        {
          status: 'published',
          startDate: { $lte: now },
          registrationDeadline: { $gte: now },
        },
        { $set: { status: 'registration_open' } }
      );

      // registration_open → registration_closed (past deadline)
      await Hackathon.updateMany(
        {
          status: 'registration_open',
          registrationDeadline: { $lt: now },
        },
        { $set: { status: 'registration_closed' } }
      );

      // registration_closed → submissions_open (when submissionStart reached)
      await Hackathon.updateMany(
        {
          status: 'registration_closed',
          submissionStart: { $lte: now },
          submissionDeadline: { $gte: now },
        },
        { $set: { status: 'submissions_open' } }
      );
    } catch (err) {
      console.error('hackathonStatusJob error:', err.message);
    }
  });
}

export function startCronJobs(io) {
  submissionLockJob(io);
  hackathonStatusJob(io);
  console.log('⏰  Cron jobs started');
}
