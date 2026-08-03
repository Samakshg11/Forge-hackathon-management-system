import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Users, Shield, Bookmark, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { Skeleton } from '../components/ui/Skeleton';

export function HackathonDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    async function loadHackathon() {
      try {
        const res = await apiClient.get(`/hackathons/${slug}`);
        setHackathon(res.data);
      } catch {
        setHackathon(null);
      } finally {
        setLoading(false);
      }
    }
    loadHackathon();
  }, [slug]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      await apiClient.post('/registrations', { hackathonId: hackathon._id });
      showToast('Registration submitted! Waiting for organizer approval.', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) return navigate('/login');
    try {
      if (bookmarked) {
        await apiClient.delete(`/bookmarks/${hackathon._id}`);
        setBookmarked(false);
        showToast('Bookmark removed', 'info');
      } else {
        await apiClient.post('/bookmarks', { hackathonId: hackathon._id });
        setBookmarked(true);
        showToast('Hackathon bookmarked!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle bookmark', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center text-text-secondary">
          Hackathon not found.
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative w-full h-72 sm:h-96 bg-surface border-b border-border-subtle overflow-hidden">
        {hackathon.bannerUrl ? (
          <img src={hackathon.bannerUrl} alt={hackathon.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-accent-primary/20 via-surface to-accent-secondary/20 flex items-center justify-center">
            <Trophy className="w-24 h-24 text-accent-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 -mt-20 relative z-10 space-y-8 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge status={hackathon.status} />
              <span className="text-xs font-mono uppercase text-text-secondary">{hackathon.mode}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-text-primary">
              {hackathon.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent-primary" />
                {new Date(hackathon.startDate).toLocaleDateString()} — {new Date(hackathon.endDate).toLocaleDateString()}
              </span>
              {hackathon.venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent-secondary" />
                  {hackathon.venue}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-status-success" />
                Max Team Size: {hackathon.maxTeamSize}
              </span>
            </div>
          </div>

          {/* Action CTAs & Timers */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-lg space-y-4 w-full md:w-80 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary uppercase">Prize Pool</span>
              <span className="text-lg font-bold text-accent-primary">{hackathon.prizePool || '$50,000'}</span>
            </div>

            <CountdownTimer targetDate={hackathon.registrationDeadline} label="Registration" />

            {(hackathon.resultsPublished || hackathon.status === 'completed') && (
              <Link to={`/hackathons/${hackathon.slug}/leaderboard`} className="block">
                <Button variant="secondary" className="w-full font-semibold flex items-center justify-center gap-2 border-accent-primary/40 text-accent-primary">
                  <Trophy className="w-4 h-4" /> View Leaderboard
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRegister}
                isLoading={registering}
                className="flex-1 font-semibold"
              >
                Register Now
              </Button>
              <button
                onClick={toggleBookmark}
                className="p-2.5 rounded-md border border-border-subtle bg-surface-raised hover:text-accent-primary transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-accent-primary text-accent-primary' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-text-primary">About the Event</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {hackathon.description}
              </p>
            </Card>

            {/* Judging Criteria Rubric (Doc 4 §1.8) */}
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Judging Criteria Rubric</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hackathon.judgingCriteria?.map((crit) => (
                  <div key={crit.name} className="p-3.5 rounded-lg bg-surface-raised border border-border-subtle space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase text-accent-primary">{crit.name}</h4>
                      <span className="text-xs font-mono font-bold text-text-secondary">{crit.maxScore} pts</span>
                    </div>
                    <p className="text-xs text-text-secondary">{crit.description || 'Standard evaluation criterion.'}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rules */}
            {hackathon.rules && (
              <Card className="space-y-3">
                <h3 className="text-lg font-bold text-text-primary">Hackathon Rules</h3>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {hackathon.rules}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-text-secondary tracking-wider">Themes</h4>
              <div className="flex flex-wrap gap-2">
                {hackathon.theme?.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-surface-raised border border-border-subtle text-xs text-text-primary font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-text-secondary tracking-wider">Organizer</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-bold text-accent-primary">
                  {hackathon.organizerId?.name?.[0] || 'O'}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-text-primary">{hackathon.organizerId?.name || 'Organizer'}</h5>
                  <p className="text-xs text-text-secondary">Verified Event Runner</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
