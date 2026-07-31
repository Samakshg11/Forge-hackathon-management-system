import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCounter } from '../components/ui/StatCounter';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Trophy,
  Users,
  FileCode,
  Award,
  ArrowRight,
  Clock,
  PlusCircle,
  Sparkles,
  Layers3,
  Activity,
  Flag,
  BellRing,
} from 'lucide-react';

export function RoleDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (user.role === 'participant') {
          const regsRes = await apiClient.get('/registrations/mine');
          setData({ registrations: regsRes.data });
        } else if (user.role === 'organizer') {
          const mineRes = await apiClient.get('/hackathons/mine');
          setData(mineRes.data);
        } else if (user.role === 'judge') {
          const assignmentsRes = await apiClient.get('/judge/assignments');
          setData({ assignments: assignmentsRes.data });
        } else if (user.role === 'admin') {
          const statsRes = await apiClient.get('/analytics/platform');
          setData({ platformStats: statsRes.data });
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const organizerSummary = data?.summary || { total: 0, drafts: 0, published: 0, active: 0, completed: 0, statusCounts: {} };
  const myHackathons = data?.hackathons || [];
  const isAdminAnalytics = location.pathname.includes('/analytics');

  if (loading) {
    return <Skeleton className="h-[28rem] w-full rounded-2xl" />;
  }

  const heroStats =
    user.role === 'organizer'
      ? [
          { label: 'Total hackathons', value: organizerSummary.total, icon: Layers3 },
          { label: 'Active now', value: organizerSummary.active, icon: Activity },
          { label: 'Drafts', value: organizerSummary.drafts, icon: FileCode },
          { label: 'Published', value: organizerSummary.published, icon: Flag },
        ]
      : user.role === 'admin'
        ? [
            { label: 'Total submissions', value: data?.platformStats?.totalSubmissions || 0, icon: FileCode },
            { label: 'Total reviews', value: data?.platformStats?.totalReviews || 0, icon: Award },
            { label: 'Platform users', value: Object.values(data?.platformStats?.usersByRole || {}).reduce((a, b) => a + b, 0), icon: Users },
            { label: 'Hackathon states', value: Object.values(data?.platformStats?.hackathonsByStatus || {}).reduce((a, b) => a + b, 0), icon: Sparkles },
          ]
        : user.role === 'judge'
          ? [
              { label: 'Assigned submissions', value: data?.assignments?.length || 0, icon: BellRing },
              { label: 'Reviewed', value: data?.assignments?.filter((item) => item.hasReviewed).length || 0, icon: Award },
              { label: 'Pending', value: data?.assignments?.filter((item) => !item.hasReviewed).length || 0, icon: Clock },
              { label: 'Active queues', value: 1, icon: Layers3 },
            ]
          : [
              { label: 'Registrations', value: data?.registrations?.length || 0, icon: FileCode },
              { label: 'Approved', value: data?.registrations?.filter((item) => item.status === 'approved').length || 0, icon: Trophy },
              { label: 'Pending', value: data?.registrations?.filter((item) => item.status === 'pending').length || 0, icon: Clock },
              { label: 'Teams ready', value: data?.registrations?.filter((item) => item.teamId).length || 0, icon: Users },
            ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-surface via-surface to-accent-primary/10 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/70 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
              Hackathon control center
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">
                Welcome back, {user.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-text-secondary leading-relaxed">
                Track event health, launch new hackathons, review submissions, and keep the whole workflow moving
                from one command surface.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <Badge role={user.role} />
              <span>Profile completion {user.profileCompletion || 0}%</span>
              <span>•</span>
              <span>{user.role === 'organizer' ? 'Organizer workspace' : user.role === 'admin' ? 'Admin operations' : user.role === 'judge' ? 'Judge queue' : 'Builder dashboard'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {user.role === 'organizer' && (
              <Link to="/app/organizer/hackathons/new">
                <Button className="font-semibold shadow-glow">
                  <PlusCircle className="w-4 h-4" /> Launch hackathon
                </Button>
              </Link>
            )}
            {user.role === 'admin' && !isAdminAnalytics && (
              <Link to="/app/admin/analytics">
                <Button variant="secondary" className="font-semibold">
                  View analytics
                </Button>
              </Link>
            )}
            {user.role === 'participant' && (
              <Link to="/hackathons">
                <Button variant="secondary" className="font-semibold">
                  Explore hackathons
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {heroStats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5 border border-border-subtle bg-surface/90">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-xs uppercase tracking-[0.24em]">{item.label}</span>
                <Icon className="h-4 w-4 text-accent-primary" />
              </div>
              <div className="mt-3 text-3xl font-display font-bold text-text-primary">{item.value}</div>
            </Card>
          );
        })}
      </section>

      {/* Participant View */}
      {user.role === 'participant' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold font-display text-text-primary">My Registrations</h2>
            <Link to="/hackathons" className="text-xs font-semibold text-accent-primary hover:underline">
              Discover more
            </Link>
          </div>
          {!data?.registrations || data.registrations.length === 0 ? (
            <EmptyState
              title="No registrations yet"
              description="Explore open hackathons and submit a registration to get started."
              action={
                <Link to="/hackathons">
                  <Button size="sm">Explore Hackathons</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.registrations.map((reg) => (
                <Card key={reg._id} className="space-y-3 p-5 border border-border-subtle bg-surface/90">
                  <div className="flex items-center justify-between">
                    <Badge status={reg.status} />
                    <span className="text-xs text-text-secondary">
                      Registered: {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary line-clamp-1">
                    {reg.hackathonId?.title || 'Hackathon'}
                  </h3>
                  {reg.status === 'approved' && (
                    <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                      {reg.teamId ? (
                        <Link to={`/app/teams/${reg.teamId._id || reg.teamId}`}>
                          <Button size="sm" variant="secondary">Go to Team Workspace</Button>
                        </Link>
                      ) : (
                        <Link to={`/app/teams/new?hackathonId=${reg.hackathonId._id}`}>
                          <Button size="sm" className="bg-status-success hover:bg-status-success/90">
                            Create / Join Team
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                  {reg.status === 'rejected' && (
                    <p className="text-xs text-status-danger mt-1">Reason: {reg.rejectionReason}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organizer View */}
      {user.role === 'organizer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-text-primary">My Managed Hackathons</h2>
            <Link to="/app/organizer/hackathons/new">
              <Button size="sm">New Hackathon</Button>
            </Link>
          </div>

          {!myHackathons || myHackathons.length === 0 ? (
            <EmptyState
              title="No hackathons created yet"
              description="Click the button below to launch your first hackathon wizard."
              action={
                <Link to="/app/organizer/hackathons/new">
                  <Button size="sm">Create Hackathon</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myHackathons.map((h) => (
                  <Card key={h._id} className="space-y-4 p-5 border border-border-subtle bg-surface/90">
                    <div className="flex items-center justify-between gap-3">
                      <Badge status={h.status} />
                      <span className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">{h.mode}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary line-clamp-1">{h.title}</h3>
                      <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                        {h.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                      <span>{h.theme?.join(' • ')}</span>
                    </div>
                    <div className="pt-3 border-t border-border-subtle flex flex-wrap gap-2">
                      <Link to={`/app/organizer/hackathons/${h._id}/edit`}>
                        <Button size="sm" variant="secondary">Edit hackathon</Button>
                      </Link>
                      <Link to={`/hackathons/${h.slug}`}>
                        <Button size="sm" variant="secondary">View public page</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-5 border border-border-subtle bg-surface/90 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Portfolio at a glance</h3>
                  <p className="mt-1 text-sm text-text-secondary">Drafts, live events, and completed hackathons in one view.</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(organizerSummary.statusCounts || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                          <span className="capitalize">{status.replaceAll('_', ' ')}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            style={{ width: `${Math.max(10, Math.min(100, (count / Math.max(1, organizerSummary.total)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Judge View */}
      {user.role === 'judge' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold font-display text-text-primary">Assigned Submissions Queue</h2>
          {!data?.assignments || data.assignments.length === 0 ? (
            <EmptyState
              title="No assigned submissions"
              description="Organizers have not assigned projects to your review queue yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.assignments.map((sub) => (
                <Card key={sub._id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge status={sub.hasReviewed ? 'approved' : 'pending'}>
                      {sub.hasReviewed ? 'Reviewed' : 'Pending Review'}
                    </Badge>
                    <span className="text-xs text-text-secondary">{sub.hackathonId?.title}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{sub.projectName}</h3>
                  <div className="pt-2 border-t border-border-subtle">
                    <Button size="sm" className="w-full" variant="secondary" disabled>
                      {sub.hasReviewed ? 'Reviewed' : 'Review screen coming soon'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin View */}
      {user.role === 'admin' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold font-display text-text-primary">Platform Overview</h2>
            <Link to="/app/admin/analytics" className="text-xs font-semibold text-accent-primary hover:underline">
              Open analytics
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6">
              <StatCounter value={data?.platformStats?.totalSubmissions || 0} label="Total Submissions" />
            </Card>
            <Card className="p-6">
              <StatCounter value={data?.platformStats?.totalReviews || 0} label="Total Reviews" />
            </Card>
            <Card className="p-6">
              <StatCounter value={Object.values(data?.platformStats?.usersByRole || {}).reduce((a, b) => a + b, 0)} label="Total Platform Users" />
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-base font-bold text-text-primary mb-4">Users by role</h3>
              <div className="space-y-3">
                {Object.entries(data?.platformStats?.usersByRole || {}).map(([role, count]) => (
                  <div key={role}>
                    <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                      <span className="capitalize">{role}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
                      <div className="h-full rounded-full bg-accent-primary" style={{ width: `${Math.max(8, count * 18)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-base font-bold text-text-primary mb-4">Hackathons by status</h3>
              <div className="space-y-3">
                {Object.entries(data?.platformStats?.hackathonsByStatus || {}).map(([status, count]) => (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                      <span className="capitalize">{status.replaceAll('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary" style={{ width: `${Math.max(8, count * 18)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {user.role === 'judge' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data?.assignments?.length > 0 && (
            <Card className="p-5 border border-border-subtle bg-surface/90">
              <h3 className="text-base font-bold text-text-primary">Review queue snapshot</h3>
              <p className="mt-1 text-sm text-text-secondary">{data.assignments.length} submissions in your queue.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
