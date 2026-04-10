'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getSupabase } from '@/lib/supabase';
import type { SubmissionEnriched } from '@/types';
import { KpiCard, LiveDot, ChartCard, ThemeBars, DataQualityBars, AlertBanner, Toast } from './dashboard-components';
import LeadsTable from './LeadsTable';

// ── Types ────────────────────────────────────────────────────────────

interface StatsPayload {
  kpis: {
    total: number;
    contacted: number;
    uncontacted: number;
    stale30d: number;
    warm: number;
    today: number;
    oldestStaleDays: number;
  };
  weekly: { week: string; total: number; contacted: number }[];
  themes: { theme: string; count: number }[];
  dataQuality: { label: string; count: number }[];
  staleness: { bucket: string; count: number }[];
  emailDomains: { domain: string; count: number }[];
  warmOverlap: { source: string; count: number }[];
  submissions: (SubmissionEnriched & { ageDays: number })[];
}

// ── Constants ────────────────────────────────────────────────────────

const DONUT_COLORS = ['#22c55e', '#ef4444'];
const STALENESS_COLORS: Record<string, string> = {
  '<7d': '#22c55e',
  '7-14d': '#f59e0b',
  '14-30d': '#ef4444',
  '>30d': '#7f1d1d',
};
const DOMAIN_COLORS = ['#7c5cff', '#06b6d4', '#f59e0b', '#22c55e'];

export default function SubmissionsDashboard() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [flashToday, setFlashToday] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions-stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: StatsPayload = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced refresh ──────────────────────────────────────────────
  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStats();
    }, 500);
  }, [fetchStats]);

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    fetchStats();

    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase client not available for realtime');
      return;
    }

    const channel = supabase
      .channel('submissions-dashboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          const newRow = payload.new as { name?: string; business?: string };
          setFlashToday(true);
          setTimeout(() => setFlashToday(false), 2000);
          setToastMsg(`New lead: ${newRow.name || 'Unknown'} — ${newRow.business || ''}`);
          setToastVisible(true);
          setTimeout(() => setToastVisible(false), 4000);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'submissions' },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error — submissions dashboard');
        }
      });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchStats, debouncedRefresh]);

  // ── Toggle contacted ───────────────────────────────────────────────
  const handleToggleContacted = useCallback(async (id: number, contacted: boolean) => {
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted, table: 'submissions' }),
      });
      if (res.ok) {
        // Optimistic local update
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: prev.submissions.map(s =>
              s.id === id ? { ...s, contacted, contacted_at: contacted ? new Date().toISOString() : null } : s
            ),
          };
        });
        debouncedRefresh();
      }
    } catch (err) {
      console.error('Toggle contacted error:', err);
    }
  }, [debouncedRefresh]);

  // ── Loading / Error states ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-[#8a93a6] animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-[#ef4444]">{error || 'No data available'}</div>
      </div>
    );
  }

  const { kpis, weekly, themes, dataQuality, staleness, emailDomains, warmOverlap, submissions } = stats;

  // ── Date range for subtitle ────────────────────────────────────────
  const oldest = submissions.length > 0
    ? new Date(submissions[submissions.length - 1]?.created_at).toLocaleDateString()
    : '–';
  const newest = submissions.length > 0
    ? new Date(submissions[0]?.created_at).toLocaleDateString()
    : '–';

  // ── Donut data ─────────────────────────────────────────────────────
  const donutData = [
    { name: 'Contacted', value: kpis.contacted },
    { name: 'Uncontacted', value: kpis.uncontacted },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-white tracking-tight">Submissions</h1>
            <LiveDot connected={realtimeConnected} />
          </div>
          <p className="text-[13px] text-[#8a93a6] mt-1">
            {kpis.total} total · {oldest} → {newest}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="px-4 py-2 bg-[#242a38] text-[#8a93a6] rounded-lg text-[13px] hover:text-white transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <AlertBanner uncontacted={kpis.uncontacted} oldestStaleDays={kpis.oldestStaleDays} />

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <KpiCard
          label="New Today"
          value={kpis.today}
          subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
          tag={{ text: 'today', color: 'purple' }}
          flash={flashToday}
        />
        <KpiCard
          label="Contacted"
          value={kpis.contacted}
          subtitle={kpis.total > 0 ? `${((kpis.contacted / kpis.total) * 100).toFixed(0)}% of total` : '0%'}
          tag={{ text: 'contacted', color: 'green' }}
        />
        <KpiCard
          label="Uncontacted"
          value={kpis.uncontacted}
          subtitle={kpis.total > 0 ? `${((kpis.uncontacted / kpis.total) * 100).toFixed(0)}% of total` : '0%'}
          tag={{ text: 'needs action', color: 'red' }}
        />
        <KpiCard
          label="Stale >30d"
          value={kpis.stale30d}
          subtitle="uncontacted, over 30 days"
          tag={{ text: 'warning', color: 'amber' }}
        />
        <KpiCard
          label="Warm Overlap"
          value={kpis.warm}
          subtitle="also in newsletter/class/waitlist"
          tag={{ text: 'warm', color: 'green' }}
          flash={flashToday}
        />
      </div>

      {/* ── Charts Row 1 ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Weekly volume */}
        <ChartCard title="Weekly Volume vs Contacted" subtitle="Last 12 weeks" className="lg:col-span-2">
          <div className="h-[200px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barGap={2}>
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#8a93a6', fontSize: 11 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  axisLine={{ stroke: '#242a38' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151d', border: '1px solid #242a38', borderRadius: 10, fontSize: 12, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#8a93a6' }} />
                <Bar dataKey="total" name="Submissions" fill="#7c5cff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contacted" name="Contacted" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Contacted donut */}
        <ChartCard title="Contacted Ratio">
          <div className="h-[220px] sm:h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151d', border: '1px solid #242a38', borderRadius: 10, fontSize: 12, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Themes */}
        <ChartCard title="Challenge Themes" subtitle="Regex-tagged from scaling_challenge">
          <ThemeBars data={themes} />
        </ChartCard>

        {/* Data quality */}
        <ChartCard title="Data Quality" subtitle="Issues in submission fields">
          <DataQualityBars data={dataQuality} />
        </ChartCard>
      </div>

      {/* ── Charts Row 3 ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Staleness histogram */}
        <ChartCard title="Staleness Histogram" subtitle="Uncontacted by age">
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staleness}>
                <XAxis dataKey="bucket" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={{ stroke: '#242a38' }} tickLine={false} />
                <YAxis tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#12151d', border: '1px solid #242a38', borderRadius: 10, fontSize: 12, color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {staleness.map((entry) => (
                    <Cell key={entry.bucket} fill={STALENESS_COLORS[entry.bucket] || '#7c5cff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Email domains */}
        <ChartCard title="Email Domains" subtitle="gmail, yahoo, personal, business">
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailDomains} layout="vertical">
                <XAxis type="number" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="domain" type="category" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#12151d', border: '1px solid #242a38', borderRadius: 10, fontSize: 12, color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {emailDomains.map((_, i) => (
                    <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Warm overlap */}
        <ChartCard title="Warm Overlap" subtitle="Submissions also in…">
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warmOverlap} layout="vertical">
                <XAxis type="number" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="source" type="category" tick={{ fill: '#8a93a6', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#12151d', border: '1px solid #242a38', borderRadius: 10, fontSize: 12, color: '#fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Leads Table ─────────────────────────────────────────────── */}
      <ChartCard title="Leads" subtitle={`${submissions.length} submissions`} className="mb-8">
        <LeadsTable
          submissions={submissions}
          onToggleContacted={handleToggleContacted}
        />
      </ChartCard>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
