'use client';

import { ReactNode } from 'react';

// ── KPI Card ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  subtitle?: string;
  tag?: { text: string; color: 'green' | 'red' | 'amber' | 'purple' };
  flash?: boolean;
}

export function KpiCard({ label, value, subtitle, tag, flash }: KpiCardProps) {
  const tagColors = {
    green: 'bg-[#22c55e]/15 text-[#22c55e]',
    red: 'bg-[#ef4444]/15 text-[#ef4444]',
    amber: 'bg-[#f59e0b]/15 text-[#f59e0b]',
    purple: 'bg-[#7c5cff]/15 text-[#7c5cff]',
  };

  return (
    <div
      className={`bg-[#12151d] border border-[#242a38] rounded-[14px] p-5 transition-all ${
        flash ? 'ring-2 ring-[#7c5cff] ring-opacity-60 animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#8a93a6] font-medium">{label}</span>
        {tag && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagColors[tag.color]}`}>
            {tag.text}
          </span>
        )}
      </div>
      <div className="text-[32px] font-bold text-white tracking-tight leading-none">{value}</div>
      {subtitle && <div className="text-[12px] text-[#8a93a6] mt-1">{subtitle}</div>}
    </div>
  );
}

// ── Live Dot ─────────────────────────────────────────────────────────

interface LiveDotProps {
  connected: boolean;
}

export function LiveDot({ connected }: LiveDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${
          connected
            ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse'
            : 'bg-[#8a93a6]'
        }`}
      />
      <span className="text-[11px] text-[#8a93a6] font-medium">
        {connected ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

// ── Chart Card (wrapper) ─────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-[#12151d] border border-[#242a38] rounded-[14px] p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[12px] text-[#8a93a6] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Theme Bars ───────────────────────────────────────────────────────

interface ThemeBarsProps {
  data: { theme: string; count: number }[];
}

export function ThemeBars({ data }: ThemeBarsProps) {
  if (data.length === 0) return <div className="text-[#8a93a6] text-sm">No theme data</div>;
  const max = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-2.5">
      {data.map(({ theme, count }) => (
        <div key={theme} className="flex items-center gap-3">
          <span className="text-[12px] text-[#8a93a6] w-[90px] sm:w-[130px] truncate shrink-0">{theme}</span>
          <div className="flex-1 h-6 bg-[#0b0d12] rounded-md overflow-hidden relative">
            <div
              className="h-full rounded-md"
              style={{
                width: `${Math.max((count / max) * 100, 4)}%`,
                background: 'linear-gradient(90deg, #7c5cff, #06b6d4)',
              }}
            />
          </div>
          <span className="text-[13px] font-semibold text-white w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Data Quality Bars ────────────────────────────────────────────────

interface DataQualityProps {
  data: { label: string; count: number }[];
}

export function DataQualityBars({ data }: DataQualityProps) {
  if (data.length === 0) return <div className="text-[#8a93a6] text-sm">No quality data</div>;
  const max = Math.max(...data.map(d => d.count), 1);

  function barColor(count: number): string {
    if (count > 100) return '#ef4444';
    if (count >= 20) return '#f59e0b';
    return '#7c5cff';
  }

  return (
    <div className="space-y-2.5">
      {data.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-[12px] text-[#8a93a6] w-[110px] sm:w-[180px] truncate shrink-0">{label}</span>
          <div className="flex-1 h-6 bg-[#0b0d12] rounded-md overflow-hidden">
            <div
              className="h-full rounded-md"
              style={{
                width: `${Math.max((count / max) * 100, 4)}%`,
                backgroundColor: barColor(count),
              }}
            />
          </div>
          <span className="text-[13px] font-semibold text-white w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Alert Banner ─────────────────────────────────────────────────────

interface AlertBannerProps {
  uncontacted: number;
  oldestStaleDays: number;
}

export function AlertBanner({ uncontacted, oldestStaleDays }: AlertBannerProps) {
  if (uncontacted <= 50 && oldestStaleDays <= 14) return null;

  const messages: string[] = [];
  if (uncontacted > 50) messages.push(`${uncontacted} uncontacted submissions`);
  if (oldestStaleDays > 14) messages.push(`oldest stale lead is ${oldestStaleDays} days old`);

  return (
    <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-[14px] px-5 py-3 mb-6">
      <p className="text-[14px] text-[#ef4444] font-medium">
        ⚠️ Attention: {messages.join(' · ')}
      </p>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#22c55e] text-black px-5 py-3 rounded-xl shadow-2xl text-[14px] font-medium animate-bounce">
      {message}
    </div>
  );
}
