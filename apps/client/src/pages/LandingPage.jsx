import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Cpu, Radio, ShieldCheck, Trophy, Zap } from 'lucide-react';

import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from '../components/Footer';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MagneticButton } from '../components/ui/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const FRAME_PATH = '/frames/frame_';
const FRAME_EXTENSION = '.png';
const FRAME_PAD = 4;
const BACKGROUND = '#0E1116';

// Five narrative beats mapped against the artifact sequence's own motion —
// the footage zooms in tight, pulls back to reveal the full ring structure,
// holds/rotates, then returns to a close hold at the end. Copy follows that
// arc rather than fighting it, so every beat lands on frames that support it.
const STORY_BEATS = [
  { key: 'intro', start: 0, in: 0.1, out: 0.22, end: 0.3 },
  { key: 'reveal', start: 0.18, in: 0.28, out: 0.42, end: 0.5 },
  { key: 'system', start: 0.42, in: 0.5, out: 0.64, end: 0.72 },
  { key: 'sync', start: 0.62, in: 0.7, out: 0.82, end: 0.88 },
  { key: 'final', start: 0.82, in: 0.9, out: 1, end: 1 },
];

function frameUrl(index) {
  return `${FRAME_PATH}${String(index).padStart(FRAME_PAD, '0')}${FRAME_EXTENSION}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeHackathons: 14, totalUsers: 1840, totalSubmissions: 420 });
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const canvasRef = useRef(null);
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const scrollCueRef = useRef(null);
  const beatRefs = useRef([]);
  const framesRef = useRef([]);
  const loadedCountRef = useRef(0);
  const navScrolledRef = useRef(false);
  const canvasSizeRef = useRef({ width: 0, height: 0, scale: 1 });
  const frameProxyRef = useRef({ frame: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, featuredRes] = await Promise.all([
          apiClient.get('/stats/public'),
          apiClient.get('/hackathons/featured'),
        ]);
        setStats(statsRes.data);
        setFeatured(featuredRes.data);
      } catch {
        // Fallback values keep the landing page usable when the API is unavailable.
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const story = storyRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext('2d', { alpha: false });

    if (!canvas || !story || !stage || !context) {
      return undefined;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    function drawFrame(index) {
      const { width, height } = canvasSizeRef.current;
      let frameIndex = clamp(Math.round(index), 0, FRAME_COUNT - 1);
      let image = framesRef.current[frameIndex];

      // Frames finish downloading in whatever order the network delivers
      // them, not necessarily 0→191. Walk backward first (show the most
      // recent loaded moment behind the current position), and if nothing
      // earlier has loaded yet, walk forward instead so we still draw
      // *something* rather than leaving the canvas black.
      let searchIndex = frameIndex;
      while (!image && searchIndex > 0) {
        searchIndex -= 1;
        image = framesRef.current[searchIndex];
      }
      if (!image) {
        searchIndex = frameIndex;
        while (!image && searchIndex < FRAME_COUNT - 1) {
          searchIndex += 1;
          image = framesRef.current[searchIndex];
        }
      }

      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, width, height);

      if (!image) {
        return;
      }

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;

      if (imageRatio > canvasRatio) {
        drawHeight = drawWidth / imageRatio;
      } else {
        drawWidth = drawHeight * imageRatio;
      }

      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      canvasSizeRef.current = { width, height, scale };
      context.setTransform(scale, 0, 0, scale, 0, 0);
      drawFrame(frameProxyRef.current.frame);
    }

    function preloadFrames() {
      Array.from({ length: FRAME_COUNT }, (_, index) => {
        const image = new Image();
        image.src = frameUrl(index + 1);

        image.onload = () => {
          framesRef.current[index] = image;
          loadedCountRef.current += 1;
          setLoadProgress(Math.round((loadedCountRef.current / FRAME_COUNT) * 100));
          // Repaint on every arrival, not just the first frame — otherwise a
          // frame that finishes loading while the user isn't actively
          // scrolling (or after they've scrolled past) never gets drawn.
          drawFrame(frameProxyRef.current.frame);
        };

        image.onerror = () => {
          loadedCountRef.current += 1;
          setLoadProgress(Math.round((loadedCountRef.current / FRAME_COUNT) * 100));
        };

        return image;
      });
    }

    resizeCanvas();
    preloadFrames();
    window.addEventListener('resize', resizeCanvas);

    // Safety net: while frames are still streaming in, keep repainting the
    // current position every tick. This guarantees the sequence "catches up"
    // on its own the moment enough frames exist, instead of staying stuck on
    // a black canvas until the next scroll event fires. Once everything is
    // loaded this loop stops — draws are then driven purely by scroll.
    let catchUpRaf = 0;
    function catchUpLoop() {
      drawFrame(frameProxyRef.current.frame);
      if (loadedCountRef.current < FRAME_COUNT) {
        catchUpRaf = requestAnimationFrame(catchUpLoop);
      }
    }
    catchUpRaf = requestAnimationFrame(catchUpLoop);

    // Drive the frame sequence, the nav background, and every beat's
    // reveal/exit off one pinned ScrollTrigger. `scrub: 0.85` intentionally
    // trails the raw scroll position by a fraction of a second — that lag is
    // what makes the sequence feel like it has physical weight instead of
    // snapping 1:1 to the wheel, which is what reads as "cheap".
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const proxy = frameProxyRef.current;
      proxy.frame = 0;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: story,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.85,
          onUpdate: (self) => {
            const nextNavScrolled = self.progress > 0.02 || window.scrollY > 12;
            if (nextNavScrolled !== navScrolledRef.current) {
              navScrolledRef.current = nextNavScrolled;
              setNavScrolled(nextNavScrolled);
            }
            stage.style.setProperty('--artifact-progress', self.progress.toFixed(4));
            if (scrollCueRef.current) {
              scrollCueRef.current.style.setProperty(
                '--cue-opacity',
                (1 - clamp(self.progress / 0.06, 0, 1)).toFixed(3)
              );
            }
          },
        },
      });

      timeline.to(proxy, {
        frame: FRAME_COUNT - 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => drawFrame(proxy.frame),
      });

      STORY_BEATS.forEach(({ key, start, in: fadeInEnd, out: fadeOutStart, end }, index) => {
        const el = beatRefs.current[index];
        if (!el) return;

        const enterFrom = prefersReducedMotion
          ? { autoAlpha: 0 }
          : { autoAlpha: 0, y: 28, filter: 'blur(6px)' };
        const enterTo = prefersReducedMotion
          ? { autoAlpha: 1 }
          : { autoAlpha: 1, y: 0, filter: 'blur(0px)' };
        const exitTo = prefersReducedMotion
          ? { autoAlpha: 0 }
          : { autoAlpha: 0, y: -18, filter: 'blur(4px)' };

        if (index === 0) {
          // The hero beat gets its own immediate on-load reveal — nobody
          // should have to scroll before they see the headline. It only
          // joins the scroll timeline for its exit, once the reveal settles.
          gsap.fromTo(el, enterFrom, {
            ...enterTo,
            duration: prefersReducedMotion ? 0.6 : 1.5,
            ease: 'power3.out',
            delay: prefersReducedMotion ? 0 : 0.25,
          });
        } else {
          // Every other beat rises with a soft upward drift + blur-clear
          // rather than a flat opacity fade — no snap cuts.
          timeline.fromTo(el, enterFrom, { ...enterTo, ease: 'power2.out', duration: fadeInEnd - start }, start);
        }

        if (key !== 'final') {
          timeline.to(el, { ...exitTo, ease: 'power1.in', duration: end - fadeOutStart }, fadeOutStart);
        }
      });
    }, story);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(catchUpRaf);
      ctx.revert();
    };
  }, []);

  const statItems = [
    { label: 'Active hackathons', value: stats.activeHackathons },
    { label: 'Builders onboarded', value: stats.totalUsers },
    { label: 'Submissions shipped', value: stats.totalSubmissions },
  ];

  return (
    <div className="forge-artifact-page min-h-screen text-text-primary selection:bg-accent-primary selection:text-white">
      <header className={`artifact-nav ${navScrolled ? 'is-scrolled' : ''}`}>
        <Link to="/" className="artifact-brand" aria-label="FORGE home">
          <span>F</span>
          FORGE
        </Link>

        <nav className="artifact-nav-links" aria-label="Primary">
          <a href="#artifact">Artifact</a>
          <a href="#engine">Engine</a>
          <Link to="/hackathons">Hackathons</Link>
        </nav>

        <div className="artifact-nav-actions">
          {user ? (
            <Link to="/dashboard" className="artifact-link-button">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="artifact-link-button">
                Log in
              </Link>
              <Link to="/signup" className="artifact-primary-button">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section ref={storyRef} id="artifact" className="artifact-scroll-story" aria-label="FORGE AI artifact scroll story">
          <div ref={stageRef} className="artifact-sticky-stage">
            <canvas ref={canvasRef} className="artifact-canvas" aria-label="Exploded futuristic AI desktop artifact" />

            <div
              ref={(el) => (beatRefs.current[0] = el)}
              className="artifact-story-copy artifact-story-copy--intro"
            >
              <p className="artifact-eyebrow">FORGE AI Core</p>
              <h1>Hackathons, orchestrated by intelligence.</h1>
              <p>
                A futuristic command artifact for organizers, judges, and builders moving from registration chaos to
                launch-ready execution.
              </p>
              <div className="artifact-hero-actions">
                <MagneticButton
                  as={Link}
                  to="/hackathons"
                  className="artifact-primary-button artifact-primary-button--large"
                >
                  Explore hackathons <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton as={Link} to="/signup" className="artifact-link-button artifact-link-button--large">
                  Start building
                </MagneticButton>
              </div>
            </div>

            <div
              ref={(el) => (beatRefs.current[1] = el)}
              className="artifact-story-copy artifact-story-copy--middle artifact-story-copy--left"
            >
              <p className="artifact-eyebrow">Scroll to unseal</p>
              <h2>Every event layer opens with intent.</h2>
              <p>The core pulls back to reveal the full structure underneath — nothing hidden, nothing bolted on.</p>
            </div>

            <div
              ref={(el) => (beatRefs.current[2] = el)}
              className="artifact-story-copy artifact-story-copy--middle artifact-story-copy--right"
            >
              <p className="artifact-eyebrow">One connected system</p>
              <h2>Registrations, teams, submissions, scoring.</h2>
              <p>Every layer of running an event lives in one place, moving in lockstep instead of six disconnected tools.</p>
            </div>

            <div ref={(el) => (beatRefs.current[3] = el)} className="artifact-story-copy artifact-story-copy--end">
              <p className="artifact-eyebrow">Real-time operating layer</p>
              <h2>The whole hackathon stays in sync.</h2>
              <p>FORGE turns scattered decisions into a clear, live control plane for the people running the room.</p>
            </div>

            <div
              ref={(el) => (beatRefs.current[4] = el)}
              className="artifact-story-copy artifact-story-copy--final"
            >
              <p className="artifact-eyebrow">Ready when you are</p>
              <h2>Built for builders. Built for the room.</h2>
              <div className="artifact-hero-actions">
                <MagneticButton as={Link} to="/signup" className="artifact-primary-button artifact-primary-button--large">
                  Launch FORGE <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>

            <div ref={scrollCueRef} className="artifact-scroll-cue" aria-hidden="true">
              <span />
              Scroll
            </div>

            {loadProgress < 100 && (
              <div className="artifact-loader" aria-live="polite">
                Loading artifact {loadProgress}%
              </div>
            )}

            <div className="artifact-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>

        <section id="engine" className="artifact-section artifact-section--stats">
          <div className="artifact-section-heading">
            <p className="artifact-eyebrow">Live Platform Signal</p>
            <h2>Built for the actual pressure of running a hackathon.</h2>
          </div>
          <div className="artifact-stats-grid">
            {statItems.map((item) => (
              <div key={item.label} className="artifact-stat">
                <strong>{Number(item.value || 0).toLocaleString()}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="artifact-section">
          <div className="artifact-feature-grid">
            <article>
              <Cpu className="h-5 w-5" />
              <h3>Smart event pipeline</h3>
              <p>Custom approval queues, participant deduplication, deadline locks, and team rules stay enforceable.</p>
            </article>
            <article>
              <ShieldCheck className="h-5 w-5" />
              <h3>Fair judging layer</h3>
              <p>Blind scorecards and weighted results help keep evaluation structured, auditable, and bias-resistant.</p>
            </article>
            <article>
              <Radio className="h-5 w-5" />
              <h3>Realtime coordination</h3>
              <p>Socket-powered updates keep organizers, participants, judges, and leaderboards moving together.</p>
            </article>
            <article>
              <Zap className="h-5 w-5" />
              <h3>Launch-ready outcomes</h3>
              <p>Certificates, submissions, bookmarks, and dashboards carry the event beyond the final demo.</p>
            </article>
          </div>
        </section>

        <section className="artifact-section artifact-section--hackathons">
          <div className="artifact-section-heading artifact-section-heading--row">
            <div>
              <p className="artifact-eyebrow">Live Competitions</p>
              <h2>Active hackathons</h2>
            </div>
            <Link to="/hackathons" className="artifact-link-button artifact-link-button--large">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="artifact-hackathon-grid">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <div className="artifact-hackathon-grid">
              {featured.length > 0 ? (
                featured.slice(0, 3).map((hackathon) => (
                  <Link key={hackathon._id} to={`/hackathons/${hackathon.slug}`} className="artifact-hackathon-card">
                    <div className="flex items-center justify-between gap-2">
                      <Badge status={hackathon.status} />
                      <span>{hackathon.mode}</span>
                    </div>
                    <h3>{hackathon.title}</h3>
                    <p>{hackathon.description}</p>
                    <div className="artifact-card-foot">
                      <Trophy className="h-4 w-4" />
                      <strong>{hackathon.prizePool || '$50,000'}</strong>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="artifact-empty">
                  <h3>No hackathons listed yet.</h3>
                  <p>Create the first event and make the platform come alive.</p>
                  <Link to="/hackathons/create" className="artifact-primary-button">
                    Create hackathon
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="artifact-section artifact-section--final">
          <div className="artifact-final-panel">
            <p className="artifact-eyebrow">Ready to FORGE</p>
            <h2>Bring every builder, judge, and organizer into one intelligent event space.</h2>
            <div className="artifact-hero-actions">
              <Link to="/signup" className="artifact-primary-button artifact-primary-button--large">
                Join FORGE <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/hackathons" className="artifact-link-button artifact-link-button--large">
                Browse events
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
