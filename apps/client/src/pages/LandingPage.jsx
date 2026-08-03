import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, ShieldCheck, Zap, Radio, Cpu, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import StoryCanvas from '../components/story/StoryCanvas';
import StoryBeat from '../components/story/StoryBeat';
import '../components/story/story.css';

const steps = [
  { num: '01', title: 'Create Profile', desc: 'Sign up as a participant, organizer, or judge and set up your skills.' },
  { num: '02', title: 'Join or Host', desc: 'Browse active hackathons or launch your own custom event in minutes.' },
  { num: '03', title: 'Build & Collaborate', desc: 'Assemble team workspace, chat in real time, and submit project details.' },
  { num: '04', title: 'Evaluate & Celebrate', desc: 'Weighted scorecards, live leaderboard results, and verifiable certificates.' },
];

const features = [
  {
    icon: Cpu,
    title: 'Smart Event Pipeline',
    desc: 'Custom registration approval queues, team size locks, and automated submission deadlines.',
  },
  {
    icon: ShieldCheck,
    title: 'Fair & Blind Judging',
    desc: 'Structured rubric scorecards and weighted evaluation algorithms to keep judging bias-free.',
  },
  {
    icon: Radio,
    title: 'Real-time Operations',
    desc: 'Socket.io powered live notifications, team chat, and real-time dashboard updates.',
  },
  {
    icon: Award,
    title: 'Verifiable Certificates',
    desc: 'Automated certificate generation for winners and participants with instant verification codes.',
  },
];

const sponsors = [
  'Google Cloud',
  'Microsoft',
  'Meta',
  'Amazon Web Services',
  'NVIDIA',
  'Stripe',
  'Vercel',
  'MongoDB',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans selection:bg-accent-primary selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-border-subtle bg-gradient-to-b from-surface via-canvas to-canvas">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-4 py-1.5 text-xs font-semibold text-accent-primary uppercase tracking-widest">
            <Sparkles className="h-4 w-4" /> The Hackathon Management Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-text-primary max-w-5xl mx-auto leading-tight">
            Orchestrate World-Class Hackathons with Precision
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            FORGE connects organizers, builders, and judges in one unified operating system. Manage registrations, team workspaces, blind judging queues, and live leaderboards seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="font-bold text-base px-8">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/hackathons">
              <Button variant="secondary" size="lg" className="font-semibold text-base px-8">
                Explore Hackathons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section using StoryCanvas & StoryBeat */}
      <section className="relative py-16 bg-surface/50 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-primary">Product Showcase</span>
            <h2 className="text-3xl font-bold font-display text-text-primary">Engineered for Event Excellence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 border border-border-subtle bg-surface hover:border-accent-primary/40 transition-colors">
              <div className="p-3 w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-text-primary">Organizer Command Center</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Full lifecycle control from draft creation to registration approvals, judge assignments, and automated certificate distribution.
              </p>
            </Card>

            <Card className="p-8 space-y-4 border border-border-subtle bg-surface hover:border-accent-primary/40 transition-colors">
              <div className="p-3 w-12 h-12 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-text-primary">Collaborative Workspaces</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Participants form teams, invite collaborators, coordinate over real-time chat, and manage versioned project submissions.
              </p>
            </Card>

            <Card className="p-8 space-y-4 border border-border-subtle bg-surface hover:border-accent-primary/40 transition-colors">
              <div className="p-3 w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-text-primary">Transparent Leaderboards</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Multi-criterion scoring rubrics aggregate judge evaluations automatically into verifiable, published leaderboard rankings.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-primary">Step-by-Step</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">How FORGE Works</h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">From registration to winner ceremony, every step is streamlined.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <Card key={step.num} className="p-6 space-y-4 relative overflow-hidden border border-border-subtle bg-surface">
              <span className="text-4xl font-black font-mono text-accent-primary/20 absolute top-4 right-4">
                {step.num}
              </span>
              <h3 className="text-lg font-bold text-text-primary pt-2">{step.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-surface/30 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-primary">Platform Capabilities</span>
            <h2 className="text-3xl font-bold font-display text-text-primary">Built for High-Stakes Events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="p-6 space-y-3 border border-border-subtle bg-surface">
                  <div className="p-3 w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{feat.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sponsors Bar */}
      <section id="sponsors" className="py-12 border-b border-border-subtle bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            Trusted for Hackathons & Innovation Challenges Worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
            {sponsors.map((name) => (
              <span key={name} className="text-base sm:text-lg font-bold font-display text-text-primary tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
