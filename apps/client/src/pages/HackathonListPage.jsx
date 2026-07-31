import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Trophy, Calendar, Users } from 'lucide-react';
import apiClient from '../services/apiClient';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { HACKATHON_THEMES } from '@forge/shared';

export function HackathonListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hackathons, setHackathons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const mode = searchParams.get('mode') || '';
  const theme = searchParams.get('theme') || '';
  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    async function loadHackathons() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (mode) queryParams.set('mode', mode);
        if (theme) queryParams.set('theme', theme);
        if (status) queryParams.set('status', status);
        queryParams.set('page', String(page));
        const query = queryParams.toString();
        const res = await apiClient.get(`/hackathons?${query}`);
        setHackathons(res.data.items);
        setTotal(res.data.total);
      } catch {
        setHackathons([]);
      } finally {
        setLoading(false);
      }
    }
    loadHackathons();
  }, [search, mode, theme, status, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display text-text-primary">
            Explore Hackathons
          </h1>
          <p className="text-sm text-text-secondary">
            Find an upcoming or active hackathon, assemble a team, and ship awesome software.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                className="pl-9"
              />
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3.5" />
            </div>

            {/* Mode Select */}
            <select
              value={mode}
              onChange={(e) => updateParam('mode', e.target.value)}
              className="bg-surface border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-secondary"
            >
              <option value="">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>

            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="bg-surface border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-secondary"
            >
              <option value="">All Statuses</option>
              <option value="registration_open">Registration Open</option>
              <option value="submissions_open">Submissions Open</option>
              <option value="judging">Judging in Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Theme Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-text-secondary font-medium shrink-0">Themes:</span>
            <button
              onClick={() => updateParam('theme', '')}
              className={`px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                !theme ? 'bg-accent-primary text-white border-accent-primary' : 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {HACKATHON_THEMES.slice(0, 8).map((t) => (
              <button
                key={t}
                onClick={() => updateParam('theme', t === theme ? '' : t)}
                className={`px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                  theme === t ? 'bg-accent-primary text-white border-accent-primary' : 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : hackathons.length === 0 ? (
          <EmptyState
            title="No hackathons found"
            description="Try relaxing your search query or filters."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hackathons.map((h) => (
              <Card key={h._id} interactive className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge status={h.status} />
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">{h.mode}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1">{h.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">{h.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border-subtle">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(h.startDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-accent-primary">{h.prizePool || '$50,000'}</span>
                  </div>
                  <Link to={`/hackathons/${h.slug}`} className="block">
                    <Button variant="secondary" className="w-full">
                      View Hackathon
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
