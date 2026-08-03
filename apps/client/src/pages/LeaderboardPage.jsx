import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Medal, ExternalLink, Github, ArrowLeft, Star, Users, CheckCircle2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export function LeaderboardPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await apiClient.get(`/leaderboard/${slug}`);
        setData(res.data);
      } catch (err) {
        setErrorMsg(err.message || 'Results have not been published for this hackathon yet.');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const leaderboard = data?.leaderboard || [];
  const topThree = leaderboard.slice(0, 3);
  const restEntries = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-accent-primary selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Back */}
        <Link to={`/hackathons/${slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hackathon Details
        </Link>

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-r from-surface via-surface to-accent-primary/10 p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-primary">
            <Trophy className="w-3.5 h-3.5" /> Official Tournament Standings
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-text-primary">
            {data?.hackathonTitle || 'Hackathon'} Leaderboard
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
            <span>Total Projects Evaluated: <strong className="text-text-primary">{data?.totalSubmissions || leaderboard.length}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-status-success font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Results Published
            </span>
          </div>
        </div>

        {errorMsg ? (
          <EmptyState
            title="Results Pending"
            description={errorMsg}
            action={
              <Link to={`/hackathons/${slug}`}>
                <Button variant="secondary" size="sm">Back to Event Details</Button>
              </Link>
            }
          />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            title="No submissions evaluated yet"
            description="Leaderboard will update once judges finish scoring submissions."
          />
        ) : (
          <div className="space-y-8">
            {/* Podium for Top 3 */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.map((entry, idx) => {
                  const rankStyles = [
                    'border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-surface to-surface', // Rank 1
                    'border-slate-300/40 bg-gradient-to-b from-slate-400/10 via-surface to-surface', // Rank 2
                    'border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-surface to-surface', // Rank 3
                  ];
                  const rankLabels = ['1st Place Winner', '2nd Place Runner Up', '3rd Place Winner'];
                  const rankIcons = ['🏆', '🥈', '🥉'];

                  return (
                    <Card key={entry.submissionId} className={`p-6 space-y-4 border relative ${rankStyles[idx] || 'border-border-subtle bg-surface'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{rankIcons[idx]}</span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                          {rankLabels[idx]}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-display text-text-primary line-clamp-1">{entry.projectName}</h3>
                        <p className="text-xs text-accent-primary font-semibold mt-0.5">{entry.teamName}</p>
                      </div>

                      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Final Score:</span>
                        <span className="text-lg font-bold font-display text-accent-primary">
                          {entry.averageScore} <span className="text-xs font-normal text-text-secondary">/ 100</span>
                        </span>
                      </div>

                      {entry.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.techStack.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 rounded bg-surface-raised border border-border-subtle text-[10px] font-mono text-text-secondary">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        {entry.githubUrl && (
                          <a href={entry.githubUrl} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-text-primary text-xs flex items-center gap-1">
                            <Github className="w-3.5 h-3.5" /> Code
                          </a>
                        )}
                        {entry.liveDemoUrl && (
                          <a href={entry.liveDemoUrl} target="_blank" rel="noreferrer" className="text-accent-primary hover:underline text-xs flex items-center gap-1 font-semibold">
                            Demo <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Complete Leaderboard Table */}
            <Card className="p-0 overflow-hidden border border-border-subtle bg-surface">
              <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">Full Ranking Matrix</h3>
                <span className="text-xs text-text-secondary font-mono">{leaderboard.length} Total Submissions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-raised text-text-secondary uppercase font-mono tracking-wider border-b border-border-subtle">
                    <tr>
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Team & Project</th>
                      <th className="px-6 py-3.5">Tech Stack</th>
                      <th className="px-6 py-3.5 text-right">Avg Score</th>
                      <th className="px-6 py-3.5 text-right">Reviews</th>
                      <th className="px-6 py-3.5 text-center">Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-medium">
                    {leaderboard.map((entry) => (
                      <tr key={entry.submissionId} className="hover:bg-surface-raised/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-sm">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${
                            entry.rank === 1 ? 'bg-amber-500/20 text-amber-400 border-amber-400/40' :
                            entry.rank === 2 ? 'bg-slate-300/20 text-slate-300 border-slate-300/40' :
                            entry.rank === 3 ? 'bg-amber-700/20 text-amber-600 border-amber-700/40' :
                            'bg-surface-raised text-text-secondary border-border-subtle'
                          }`}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-primary text-sm">{entry.projectName}</div>
                          <div className="text-accent-primary text-xs font-semibold">{entry.teamName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {entry.techStack?.slice(0, 3).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded bg-surface-raised text-[10px] text-text-secondary font-mono border border-border-subtle">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-sm text-text-primary">
                          {entry.averageScore}
                        </td>
                        <td className="px-6 py-4 text-right text-text-secondary font-mono">
                          {entry.reviewCount}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {entry.githubUrl && (
                              <a href={entry.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-surface-raised text-text-secondary hover:text-text-primary" title="GitHub Repository">
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {entry.liveDemoUrl && (
                              <a href={entry.liveDemoUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-surface-raised text-accent-primary" title="Live Demo">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default LeaderboardPage;
