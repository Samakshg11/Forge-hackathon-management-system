import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import apiClient from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { StatCounter } from '../components/ui/StatCounter';

const COLORS = ['#7C3AED', '#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#84CC16'];

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiClient.get('/analytics/platform');
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <Skeleton className="h-[32rem] w-full rounded-2xl" />;
  }

  const roleData = Object.entries(data?.usersByRole || {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(data?.hackathonsByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border-subtle bg-gradient-to-br from-surface via-surface to-accent-secondary/10 p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-text-secondary">Platform analytics</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold text-text-primary">Operational visibility for the whole event platform.</h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary leading-relaxed">
          Track adoption, hackathon health, and moderation throughput without leaving the dashboard.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <StatCounter value={data?.totalSubmissions || 0} label="Total Submissions" />
        </Card>
        <Card className="p-6">
          <StatCounter value={data?.totalReviews || 0} label="Total Reviews" />
        </Card>
        <Card className="p-6">
          <StatCounter value={roleData.reduce((sum, item) => sum + item.value, 0)} label="Total Users" />
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-5 min-h-[22rem]">
          <h2 className="text-base font-bold text-text-primary">Users by role</h2>
          <div className="mt-4 h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 min-h-[22rem]">
          <h2 className="text-base font-bold text-text-primary">Hackathons by status</h2>
          <div className="mt-4 h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}