import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Globe, Shield, Sparkles, Trophy, Zap } from 'lucide-react';

export function LandingPage() {
  const howItWorks = [
    'Create Profile',
    'Join Hackathons',
    'Build & Submit',
    'Get Recognized',
  ];

  const featureChips = [
    { label: 'AI', tone: 'from-cyan-400/25 to-cyan-500/10', icon: Sparkles },
    { label: 'WAI', tone: 'from-violet-400/25 to-violet-500/10', icon: Globe },
    { label: 'Web3', tone: 'from-sky-400/25 to-sky-500/10', icon: Shield },
    { label: 'Fintech', tone: 'from-fuchsia-400/25 to-fuchsia-500/10', icon: Trophy },
  ];

  const sponsors = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'NVIDIA', 'Stripe', 'coinbase'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(128,90,213,0.28),_transparent_24%),radial-gradient(circle_at_right,_rgba(34,211,238,0.22),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.14),_transparent_26%),#030303] text-white selection:bg-cyan-500/30">
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />

      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed left-1/2 top-6 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-full border border-white/14 bg-white/8 px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="hidden md:flex items-center gap-6 pl-4 text-zinc-300">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it Works</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
            <a href="#sponsors" className="transition-colors hover:text-white">Sponsors</a>
          </div>

          <div className="flex-1 md:flex-none" />

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-[linear-gradient(135deg,rgba(168,85,247,0.85),rgba(34,211,238,0.85))] px-4 py-2 font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.25)] transition-transform hover:scale-[1.02]"
          >
            Get Started
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.nav>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-6 pb-0 pt-28 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-zinc-300">Hackathon OS v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="max-w-6xl text-center text-6xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <span className="bg-gradient-to-r from-[#ce7bff] via-[#9ec8ff] to-[#68f0ff] bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(132,94,255,0.35)]">
            Forge the Future
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 max-w-3xl text-center text-base leading-8 text-zinc-300 sm:text-lg md:text-xl"
        >
          The premium orchestration engine for world-class hackathons. Build, manage, and scale innovation in a
          platform that feels like an operating system for builders.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white px-8 py-4 font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start Organizing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/hackathons"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-8 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
          >
            View Showcase
          </Link>
        </motion.div>

        <div className="relative mt-16 w-full max-w-6xl lg:mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative mx-auto aspect-[1.4/1] w-full max-w-4xl"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(108,219,255,0.18),_transparent_55%)] blur-3xl" />
            <div className="absolute inset-8 rounded-full border border-cyan-300/12 bg-white/3 shadow-[0_0_120px_rgba(100,180,255,0.08)] backdrop-blur-sm" />
            <div
              className="absolute inset-12 rounded-full border border-violet-300/16"
              style={{ animation: 'spin 42s linear infinite' }}
            />
            <div
              className="absolute inset-16 rounded-full border border-cyan-200/18"
              style={{ animation: 'spin 28s linear infinite reverse' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[34rem] w-[34rem] max-w-[88vw] max-h-[88vw] sm:h-[38rem] sm:w-[38rem]">
                <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(150,238,255,0.65),rgba(112,76,255,0.45)_35%,rgba(0,0,0,0.9)_72%)] blur-[1px] shadow-[0_0_80px_rgba(105,212,255,0.25)]" />
                <div className="absolute inset-[8%] rounded-full border border-cyan-300/25 shadow-[inset_0_0_40px_rgba(112,239,255,0.14)]" />
                <div
                  className="absolute inset-[3%] rounded-full border border-violet-300/18"
                  style={{ animation: 'spin 18s linear infinite' }}
                />
                <div className="absolute inset-[22%] rounded-full border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]" />
                <div className="absolute left-[12%] top-[18%] h-4 w-4 rounded-full bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                <div className="absolute right-[10%] top-[28%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(78,228,255,0.8)]" />
                <div className="absolute bottom-[20%] left-[16%] h-3.5 w-3.5 rounded-full bg-violet-300 shadow-[0_0_22px_rgba(205,132,255,0.9)]" />
                <div className="absolute bottom-[18%] right-[18%] h-4 w-4 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
              </div>
            </div>

            {featureChips.map((chip, index) => {
              const Icon = chip.icon;
              const positions = [
                'left-[22%] top-[14%]',
                'left-[6%] top-[50%]',
                'right-[7%] top-[28%]',
                'right-[18%] bottom-[13%]',
              ];

              return (
                <motion.div
                  key={chip.label}
                  initial={{ opacity: 0, y: 18, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.08 }}
                  className={`absolute ${positions[index]} rounded-2xl border border-white/10 bg-gradient-to-b ${chip.tone} px-4 py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.08)]`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-white">{chip.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <section id="how-it-works" className="mt-16 w-full max-w-6xl px-0 sm:px-4 lg:mt-14">
          <div className="mb-5 text-left sm:text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">How it Works</h2>
          </div>

          <div className="relative mx-auto mt-6 max-w-6xl">
            <div className="absolute left-4 right-4 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-cyan-400/0 via-cyan-300/70 to-purple-400/0 lg:block" />
            <div className="grid gap-4 lg:grid-cols-4">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 + index * 0.1 }}
                  className={`relative rounded-2xl border px-5 py-5 text-center shadow-[0_0_35px_rgba(0,0,0,0.28)] backdrop-blur-xl ${
                    index === 0
                      ? 'border-cyan-400/45 bg-[linear-gradient(180deg,rgba(59,130,246,0.22),rgba(17,24,39,0.74))]'
                      : index === 1
                        ? 'border-violet-400/45 bg-[linear-gradient(180deg,rgba(168,85,247,0.22),rgba(17,24,39,0.74))]'
                        : index === 2
                          ? 'border-cyan-300/45 bg-[linear-gradient(180deg,rgba(34,211,238,0.2),rgba(17,24,39,0.74))]'
                          : 'border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(17,24,39,0.72))]'
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-base font-semibold text-white shadow-inner">
                    {index + 1}
                  </div>
                  <div className="mt-4 text-lg font-medium text-white">{step}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section id="sponsors" className="relative z-10 mt-12 border-t border-white/8 bg-white/[0.03] py-8 backdrop-blur-sm">
        <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
          Trusted by Global Innovators
        </p>
        <div className="flex overflow-hidden">
          <div className="flex min-w-max gap-20 whitespace-nowrap py-3 animate-marquee">
            {sponsors.map((logo) => (
              <span key={logo} className="text-3xl font-semibold text-white/80 transition-colors hover:text-white">
                {logo}
              </span>
            ))}
          </div>
          <div className="flex min-w-max gap-20 whitespace-nowrap py-3 animate-marquee" aria-hidden="true">
            {sponsors.map((logo) => (
              <span key={logo} className="text-3xl font-semibold text-white/80 transition-colors hover:text-white">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
