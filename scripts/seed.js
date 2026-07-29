import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../apps/server/src/models/User.js';
import Hackathon from '../apps/server/src/models/Hackathon.js';
import Registration from '../apps/server/src/models/Registration.js';
import Team from '../apps/server/src/models/Team.js';
import Submission from '../apps/server/src/models/Submission.js';
import { Sponsor, Achievement } from '../apps/server/src/models/index.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge';

async function seed() {
  console.log('🌱  Starting database seed...');
  await mongoose.connect(MONGODB_URI, { dbName: 'forge' });

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Hackathon.deleteMany({}),
    Registration.deleteMany({}),
    Team.deleteMany({}),
    Submission.deleteMany({}),
    Sponsor.deleteMany({}),
    Achievement.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123', 12);

  // 1. Create Users for all 4 roles
  const [admin, organizer, judge1, judge2, part1, part2, part3] = await User.create([
    {
      name: 'System Admin',
      email: 'admin@forge.dev',
      passwordHash,
      role: 'admin',
      isVerified: true,
      bio: 'Platform Administrator',
    },
    {
      name: 'Sarah Organizer',
      email: 'organizer@forge.dev',
      passwordHash,
      role: 'organizer',
      isVerified: true,
      bio: 'Lead Event Runner @ TechForge',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Dr. Alex Vance',
      email: 'judge1@forge.dev',
      passwordHash,
      role: 'judge',
      isVerified: true,
      bio: 'AI Research Director & Investor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Elena Rostova',
      email: 'judge2@forge.dev',
      passwordHash,
      role: 'judge',
      isVerified: true,
      bio: 'Principal Staff Engineer @ Vercel',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      name: 'Samaksh Builder',
      email: 'builder@forge.dev',
      passwordHash,
      role: 'participant',
      isVerified: true,
      bio: 'Fullstack developer building open source tools.',
      skills: ['React', 'Node.js', 'MongoDB', 'Python', 'TailwindCSS'],
      githubUrl: 'https://github.com/samakshgarg',
      profileCompletion: 100,
      xp: 650,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      name: 'Marcus Chen',
      email: 'marcus@forge.dev',
      passwordHash,
      role: 'participant',
      isVerified: true,
      skills: ['TypeScript', 'Next.js', 'PyTorch'],
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@forge.dev',
      passwordHash,
      role: 'participant',
      isVerified: true,
      skills: ['Figma', 'UI/UX', 'CSS Architecture'],
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  ]);

  console.log('✅  Users seeded');

  // 2. Create Sponsors
  const sponsors = await Sponsor.create([
    { name: 'Vercel', tier: 'platinum', logoUrl: 'https://cdn.worldvectorlogo.com/logos/vercel.svg', websiteUrl: 'https://vercel.com' },
    { name: 'MongoDB', tier: 'gold', logoUrl: 'https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg', websiteUrl: 'https://mongodb.com' },
    { name: 'Cloudinary', tier: 'gold', logoUrl: 'https://cdn.worldvectorlogo.com/logos/cloudinary.svg', websiteUrl: 'https://cloudinary.com' },
  ]);

  // 3. Create Achievements
  await Achievement.create([
    { name: 'First Forge', description: 'Submit your first hackathon project', iconKey: 'anvil', xpValue: 100, criteriaKey: 'first_submission' },
    { name: 'Team Player', description: 'Join or create a team', iconKey: 'users', xpValue: 50, criteriaKey: 'team_join' },
    { name: 'Champion', description: 'Place top 3 in any hackathon', iconKey: 'trophy', xpValue: 500, criteriaKey: 'top3_finish' },
  ]);

  // 4. Create Hackathons
  const now = new Date();
  const regDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const subStart = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const subDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const revDeadline = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000);

  const hackathon1 = await Hackathon.create({
    organizerId: organizer._id,
    title: 'AI Global Innovation Hackathon 2026',
    slug: 'ai-global-innovation-2026',
    description: 'Build the next generation of autonomous AI agents, multimodal LLM applications, and developer productivity tools. Prize pool $50,000 in cash and cloud credits.',
    theme: ['AI/ML', 'DevTools', 'Open Source'],
    mode: 'online',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    registrationDeadline: regDeadline,
    submissionStart: subStart,
    submissionDeadline: subDeadline,
    reviewDeadline: revDeadline,
    startDate: now,
    endDate: endDate,
    prizePool: '$50,000 USD',
    maxTeamSize: 4,
    status: 'registration_open',
    assignedJudgeIds: [judge1._id, judge2._id],
    sponsorIds: sponsors.map((s) => s._id),
    rules: 'All code must be written during the hackathon period. Use of open-source libraries and APIs is encouraged.',
    judgingCriteria: [
      { name: 'innovation', description: 'Originality and novelty of idea', maxScore: 10, weight: 1 },
      { name: 'technicalComplexity', description: 'Depth of technical architecture', maxScore: 10, weight: 1 },
      { name: 'ui', description: 'Design quality and UX fluidity', maxScore: 10, weight: 1 },
      { name: 'functionality', description: 'Completeness and stability of demo', maxScore: 10, weight: 1 },
      { name: 'scalability', description: 'Potential for real-world adoption', maxScore: 10, weight: 1 },
      { name: 'documentation', description: 'Clarity of README and presentation', maxScore: 10, weight: 1 },
      { name: 'presentation', description: 'Quality of pitch and demo video', maxScore: 10, weight: 1 },
    ],
  });

  const hackathon2 = await Hackathon.create({
    organizerId: organizer._id,
    title: 'Web3 & Decentralized Infrastructure Sprint',
    slug: 'web3-decentralized-sprint-2026',
    description: 'Create zero-knowledge privacy tooling, decentralized storage networks, or cross-chain smart contract protocols.',
    theme: ['Web3/Blockchain', 'Cybersecurity'],
    mode: 'hybrid',
    venue: 'San Francisco, CA & Online',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
    registrationDeadline: regDeadline,
    submissionStart: subStart,
    submissionDeadline: subDeadline,
    reviewDeadline: revDeadline,
    startDate: now,
    endDate: endDate,
    prizePool: '$25,000 USD',
    maxTeamSize: 3,
    status: 'published',
    assignedJudgeIds: [judge1._id],
    sponsorIds: [sponsors[0]._id],
    judgingCriteria: [
      { name: 'innovation', description: 'Novelty of protocol design', maxScore: 10, weight: 1 },
      { name: 'technicalComplexity', description: 'Smart contract security', maxScore: 10, weight: 1 },
      { name: 'ui', description: 'User experience', maxScore: 10, weight: 1 },
      { name: 'functionality', description: 'Working prototype', maxScore: 10, weight: 1 },
      { name: 'scalability', description: 'Gas efficiency', maxScore: 10, weight: 1 },
      { name: 'documentation', description: 'Protocol docs', maxScore: 10, weight: 1 },
      { name: 'presentation', description: 'Demo video', maxScore: 10, weight: 1 },
    ],
  });

  console.log('✅  Hackathons seeded');

  // 5. Create Approved Registrations
  await Registration.create([
    { userId: part1._id, hackathonId: hackathon1._id, status: 'approved' },
    { userId: part2._id, hackathonId: hackathon1._id, status: 'approved' },
    { userId: part3._id, hackathonId: hackathon1._id, status: 'approved' },
  ]);

  // 6. Create Team
  const team1 = await Team.create({
    hackathonId: hackathon1._id,
    name: 'NeuralCrafters',
    description: 'Building autonomous coding assistants powered by deep reasoning models.',
    ownerId: part1._id,
    members: [{ userId: part1._id }, { userId: part2._id }],
  });

  // 7. Create Submission
  await Submission.create({
    teamId: team1._id,
    hackathonId: hackathon1._id,
    projectName: 'FORGE Agentic Assistant',
    problemStatement: 'Hackathon participants struggle with fragmented coordination tools across forms, discord, and spreadsheets.',
    solution: 'An end-to-end real-time hackathon management platform with automated AI judging assistance and live state tracking.',
    description: 'Built with React, Express, MongoDB, Socket.io, GSAP, and Matter.js.',
    githubUrl: 'https://github.com/samakshgarg/Forge-capstone',
    liveDemoUrl: 'http://localhost:5173',
    techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'TailwindCSS', 'GSAP'],
    status: 'submitted',
    assignedJudgeIds: [judge1._id, judge2._id],
    submittedAt: new Date(),
  });

  console.log('\n🎉  Seed completed successfully!');
  console.log('──────────────────────────────────────────────────────────');
  console.log('Credentials:');
  console.log('  Admin:       admin@forge.dev / Password123');
  console.log('  Organizer:   organizer@forge.dev / Password123');
  console.log('  Judge 1:     judge1@forge.dev / Password123');
  console.log('  Participant: builder@forge.dev / Password123');
  console.log('──────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
