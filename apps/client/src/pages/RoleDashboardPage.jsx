import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCounter } from '../components/ui/StatCounter';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Trophy, Users, FileCode, Award, ArrowRight, Clock, PlusCircle } from 'lucide-react';

export function RoleDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (user.role === 'participant') {
          const regsRes = await apiClient.get('/registrations/mine');
          setData({ registrations: regsRes.data });
        } else if (user.role === 'organizer') {
          const hackathonsRes = await apiClient.get('/hackathons');
          const myHackathons = hackathonsRes.data.items.filter(h => h.organizerId?._id === user._id || h.organizerId === user._id);
          setData({ hackathons: myHackathons });
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

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border-subtle p-6 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Role: <Badge role={user.role} /> • Profile Completion: {user.profileCompletion || 0}%
          </p>
        </div>

        {user.role === 'organizer' && (
          <Link to="/app/organizer/hackathons/new">
            <Button className="font-semibold">
              <PlusCircle className="w-4 h-4" /> Create Hackathon
            </Button>
          </Link>
        )}
      </div>

      {/* Participant View */}
      {user.role === 'participant' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold font-display text-text-primary">My Registrations</h2>
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
                <Card key={reg._id} className="space-y-3">
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

          {!data?.hackathons || data.hackathons.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.hackathons.map((h) => (
                <Card key={h._id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge status={h.status} />
                    <span className="text-xs text-text-secondary">{h.mode}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{h.title}</h3>
                  <div className="pt-3 border-t border-border-subtle flex flex-wrap gap-2">
                    <Link to={`/app/organizer/hackathons/${h._id}/registrations`}>
                      <Button size="sm" variant="secondary">Registrations</Button>
                    </Link>
                    <Link to={`/app/organizer/hackathons/${h._id}/results`}>
                      <Button size="sm" variant="secondary">Results & Publish</Button>
                    </Link>
                  </div>
                </Card>
              ))}
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
                    <Link to={`/app/judge/submissions/${sub._id}/review`}>
                      <Button size="sm" className="w-full">
                        {sub.hasReviewed ? 'View Score' : 'Evaluate Project'}
                      </Button>
                    </Link>
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
          <h2 className="text-lg font-bold font-display text-text-primary">Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <StatCounter value={data?.platformStats?.totalSubmissions || 0} label="Total Submissions" />
            </Card>
            <Card className="text-center p-6">
              <StatCounter value={data?.platformStats?.totalReviews || 0} label="Total Reviews" />
            </Card>
            <Card className="text-center p-6">
              <StatCounter value={Object.values(data?.platformStats?.usersByRole || {}).reduce((a, b) => a + b, 0)} label="Total Platform Users" />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
