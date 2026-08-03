import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
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
  Clock,
  Sparkles,
  Layers3,
  BellRing,
  UserPlus,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export function RoleDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const showToast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState(null); // hackathon being assigned judges

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (user.role === 'participant') {
          const regs = await apiClient.get('/registrations/mine');
          setData({ registrations: Array.isArray(regs) ? regs : regs?.registrations || [] });
        } else if (user.role === 'organizer') {
          const mine = await apiClient.get('/hackathons/mine');
          // apiClient interceptor unwraps {success,data} → data, so mine = {hackathons, summary}
          setData(mine);
        } else if (user.role === 'judge') {
          const assignments = await apiClient.get('/judge/assignments');
          setData({ assignments: Array.isArray(assignments) ? assignments : assignments?.assignments || [] });
        } else if (user.role === 'admin') {
          const stats = await apiClient.get('/analytics/platform');
          setData({ platformStats: stats });
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const isAdminAnalytics = location.pathname.includes('/analytics');

  if (loading) {
    return <Skeleton className="h-[28rem] w-full rounded-2xl" />;
  }

  const heroStats =
    user.role === 'admin'
      ? [
          { label: 'Total submissions', value: data?.platformStats?.totalSubmissions || 0, icon: FileCode },
          { label: 'Total reviews', value: data?.platformStats?.totalReviews || 0, icon: Award },
          { label: 'Platform users', value: Object.values(data?.platformStats?.usersByRole || {}).reduce((a, b) => a + b, 0), icon: Users },
          { label: 'Hackathon states', value: Object.values(data?.platformStats?.hackathonsByStatus || {}).reduce((a, b) => a + b, 0), icon: Sparkles },
        ]
      : user.role === 'organizer'
        ? [
            { label: 'Total Hackathons', value: data?.summary?.total || 0, icon: Trophy },
            { label: 'Published Events', value: data?.summary?.published || 0, icon: Sparkles },
            { label: 'Active Events', value: data?.summary?.active || 0, icon: Users },
            { label: 'Draft Events', value: data?.summary?.drafts || 0, icon: Clock },
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
      {/* Hero Header */}
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
                Track event health, launch new hackathons, review submissions, and keep the whole workflow moving from one command surface.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <Badge role={user.role} />
              <span>Profile completion {user.profileCompletion || 0}%</span>
              <span>•</span>
              <span>
                {user.role === 'admin'
                  ? 'Admin operations'
                  : user.role === 'organizer'
                    ? 'Organizer control center'
                    : user.role === 'judge'
                      ? 'Judge queue'
                      : 'Builder dashboard'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {user.role === 'admin' && !isAdminAnalytics && (
              <Link to="/app/admin/analytics">
                <Button variant="secondary" className="font-semibold">
                  View analytics
                </Button>
              </Link>
            )}
            {user.role === 'organizer' && (
              <Link to="/app/organizer/hackathons/new">
                <Button className="font-semibold">
                  Create Hackathon
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

      {/* Hero Stats */}
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold font-display text-text-primary">My Hackathons</h2>
            <Link to="/app/organizer/hackathons/new" className="text-xs font-semibold text-accent-primary hover:underline">
              + Create New Hackathon
            </Link>
          </div>
          {!data?.hackathons || data.hackathons.length === 0 ? (
            <EmptyState
              title="No hackathons created yet"
              description="Launch your first hackathon to start accepting registrations and project submissions."
              action={
                <Link to="/app/organizer/hackathons/new">
                  <Button size="sm">Create Hackathon</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.hackathons.map((h) => (
                <Card key={h._id} className="space-y-3 p-5 border border-border-subtle bg-surface/90">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge status={h.status} />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-text-secondary">Status:</span>
                      <select
                        value={h.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await apiClient.patch(`/hackathons/${h._id}`, { status: newStatus });
                            showToast(`Status updated to ${newStatus}`, 'success');
                            const mine = await apiClient.get('/hackathons/mine');
                            setData(mine);
                          } catch (err) {
                            showToast(err?.message || 'Failed to update status', 'error');
                          }
                        }}
                        className="bg-surface-raised border border-border-subtle rounded text-xs font-semibold text-text-primary px-2 py-1 focus:outline-none focus:border-accent-primary"
                      >
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                        <option value="registration_open">registration_open</option>
                        <option value="registration_closed">registration_closed</option>
                        <option value="submissions_open">submissions_open</option>
                        <option value="judging">judging</option>
                        <option value="completed">completed</option>
                      </select>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-text-primary line-clamp-1">{h.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-2">{h.description}</p>
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary">
                      {new Date(h.startDate).toLocaleDateString()} — {new Date(h.endDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link to={`/hackathons/${h.slug}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                      <Link to={`/app/organizer/hackathons/${h._id}/edit`}>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAssignTarget(assignTarget?._id === h._id ? null : h)}
                        className="flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        Assign Judges
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Judge Assignment Panel */}
          {assignTarget && (
            <JudgeAssignPanel
              hackathon={assignTarget}
              onClose={() => setAssignTarget(null)}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* Judge View */}
      {user.role === 'judge' && (
        <JudgeReviewQueue data={data} onReviewSubmitted={async () => {
          const assignments = await apiClient.get('/judge/assignments');
          setData({ assignments: Array.isArray(assignments) ? assignments : assignments?.assignments || [] });
        }} />
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
              <StatCounter
                value={Object.values(data?.platformStats?.usersByRole || {}).reduce((a, b) => a + b, 0)}
                label="Total Platform Users"
              />
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
                      <div
                        className="h-full rounded-full bg-accent-primary"
                        style={{ width: `${Math.max(8, count * 18)}%` }}
                      />
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
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary"
                        style={{ width: `${Math.max(8, count * 18)}%` }}
                      />
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

function JudgeReviewQueue({ data, onReviewSubmitted }) {
  const showToast = useToast();
  const [selectedSub, setSelectedSub] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [scores, setScores] = useState({
    innovation: 8,
    technicalComplexity: 8,
    ui: 8,
    functionality: 8,
    scalability: 8,
    documentation: 8,
    presentation: 8,
  });
  const [feedback, setFeedback] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmitting(true);
    try {
      await apiClient.post('/reviews', {
        submissionId: selectedSub._id,
        scores,
        feedback: feedback || 'Great work on this submission!',
      });
      showToast('Review submitted successfully!', 'success');
      setSelectedSub(null);
      onReviewSubmitted();
    } catch (err) {
      showToast(err?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const assignments = data?.assignments || [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold font-display text-text-primary">Assigned Submissions Queue</h2>
      {assignments.length === 0 ? (
        <EmptyState
          title="No assigned submissions"
          description="Organizers have not assigned projects to your review queue yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((sub) => (
            <Card key={sub._id} className="space-y-3 p-5 border border-border-subtle bg-surface/90">
              <div className="flex items-center justify-between">
                <Badge status={sub.hasReviewed ? 'approved' : 'pending'}>
                  {sub.hasReviewed ? 'Reviewed' : 'Pending Review'}
                </Badge>
                <span className="text-xs text-text-secondary">{sub.hackathonId?.title}</span>
              </div>
              <h3 className="text-base font-bold text-text-primary">{sub.projectName}</h3>
              <p className="text-xs text-text-secondary line-clamp-2">{sub.problemStatement || sub.solution}</p>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                <a
                  href={sub.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent-primary hover:underline font-mono"
                >
                  GitHub Repository ↗
                </a>
                <Button
                  size="sm"
                  variant={sub.hasReviewed ? 'ghost' : 'secondary'}
                  disabled={sub.hasReviewed}
                  onClick={() => {
                    setSelectedSub(sub);
                    setFeedback('');
                  }}
                >
                  {sub.hasReviewed ? 'Completed' : 'Review & Score'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Blind Review: {selectedSub.projectName}</h3>
                <p className="text-xs text-text-secondary">Blind Evaluation — Team identity is hidden</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-text-secondary hover:text-text-primary font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary">Rubric Scores (1 - 10)</h4>
                {Object.keys(scores).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-4 bg-surface-raised p-2.5 rounded-md border border-border-subtle">
                    <span className="text-xs font-semibold capitalize text-text-primary">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[key]}
                        onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                        className="w-28 accent-accent-primary"
                      />
                      <span className="text-xs font-bold font-mono text-accent-primary w-6 text-right">{scores[key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Qualitative Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the team..."
                  rows={3}
                  className="w-full bg-surface-raised border border-border-subtle rounded-md p-2.5 text-xs text-text-primary"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" isLoading={submitting} className="flex-1 font-semibold">
                  Submit Final Review
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSelectedSub(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function JudgeAssignPanel({ hackathon, onClose, showToast }) {
  const [submissions, setSubmissions] = useState([]);
  const [judges, setJudges] = useState([]);
  const [assignments, setAssignments] = useState({}); // { submissionId: Set<judgeId> }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [subs, judgeList] = await Promise.all([
          apiClient.get(`/hackathons/${hackathon._id}/submissions`),
          apiClient.get('/users/judges'),
        ]);
        const subsArr = Array.isArray(subs) ? subs : subs?.submissions || subs?.data || [];
        const judgesArr = Array.isArray(judgeList) ? judgeList : judgeList?.judges || judgeList?.data || [];
        setSubmissions(subsArr);
        setJudges(judgesArr);
        // Pre-populate existing assignments
        const init = {};
        subsArr.forEach((s) => {
          init[s._id] = new Set((s.assignedJudgeIds || []).map((j) => j?.toString?.() || j));
        });
        setAssignments(init);
      } catch (err) {
        showToast(err?.message || 'Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hackathon._id]);

  const toggleJudge = (submissionId, judgeId) => {
    setAssignments((prev) => {
      const current = new Set(prev[submissionId] || []);
      if (current.has(judgeId)) current.delete(judgeId);
      else current.add(judgeId);
      return { ...prev, [submissionId]: current };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assignmentPayload = Object.entries(assignments).map(([submissionId, judgeSet]) => ({
        submissionId,
        judgeIds: Array.from(judgeSet),
      }));
      await apiClient.post(`/hackathons/${hackathon._id}/assign-judges`, { assignments: assignmentPayload });
      showToast('Judges assigned successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err?.message || 'Failed to assign judges', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-border-subtle rounded-xl w-full max-w-3xl p-6 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Assign Judges</h3>
            <p className="text-xs text-text-secondary mt-0.5">{hackathon.title}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-text-secondary">Loading submissions and judges…</div>
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-text-secondary">No submissions found for this hackathon yet.</p>
            <p className="text-xs text-text-secondary mt-1">Participants must submit their projects first.</p>
          </div>
        ) : judges.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-text-secondary">No judges registered yet.</p>
            <p className="text-xs text-text-secondary mt-1">Ask users to register with the judge role.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Click judge names to toggle assignment. Each submission can have multiple judges.
            </p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {submissions.map((sub) => (
                <div key={sub._id} className="bg-surface-raised border border-border-subtle rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{sub.projectName}</p>
                      <p className="text-xs text-text-secondary">{sub.teamId?.name || 'Unknown team'}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-surface border border-border-subtle rounded px-2 py-0.5 text-text-secondary">
                      {(assignments[sub._id]?.size || 0)} judge{(assignments[sub._id]?.size || 0) !== 1 ? 's' : ''} assigned
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {judges.map((judge) => {
                      const isAssigned = assignments[sub._id]?.has(judge._id);
                      return (
                        <button
                          key={judge._id}
                          onClick={() => toggleJudge(sub._id, judge._id)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                            isAssigned
                              ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                              : 'bg-surface border-border-subtle text-text-secondary hover:border-accent-primary/50 hover:text-text-primary'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center text-[9px] font-bold uppercase">
                            {judge.name?.[0] || 'J'}
                          </span>
                          {judge.name}
                          {isAssigned && <span className="ml-0.5">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-border-subtle">
          <Button onClick={handleSave} isLoading={saving} disabled={loading || saving} className="flex-1 font-semibold">
            Save Assignments
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default RoleDashboardPage;
