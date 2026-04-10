'use client';

import { useState, useMemo } from 'react';
import type { SubmissionEnriched } from '@/types';

// ── Theme regex patterns (client-side mirror for filtering) ──────────
const THEME_LIST = [
  'marketing/leads', 'tech/website', 'time/ops', 'customer/retention',
  'ai/automation', 'scaling/growth', 'sales/conversion', 'finance/pricing',
  'inventory/supply', 'hiring/team',
];

// ── Relative time helper ─────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── Props ────────────────────────────────────────────────────────────
interface LeadsTableProps {
  submissions: SubmissionEnriched[];
  onToggleContacted: (id: number, contacted: boolean) => void;
}

export default function LeadsTable({ submissions, onToggleContacted }: LeadsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<string[]>([]);
  const [contactedFilter, setContactedFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [warmOnly, setWarmOnly] = useState(false);
  const [drawerSub, setDrawerSub] = useState<SubmissionEnriched | null>(null);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const perPage = 20;

  // ── Filtering ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = submissions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.business.toLowerCase().includes(q) ||
        s.scaling_challenge.toLowerCase().includes(q)
      );
    }
    if (themeFilter.length > 0) {
      result = result.filter(s => themeFilter.some(t => s.themes.includes(t)));
    }
    if (contactedFilter === 'yes') result = result.filter(s => s.contacted);
    if (contactedFilter === 'no') result = result.filter(s => !s.contacted);
    if (warmOnly) result = result.filter(s => s.is_warm);
    return result;
  }, [submissions, search, themeFilter, contactedFilter, warmOnly]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  // Reset page when filters change
  const resetPage = () => setPage(0);

  return (
    <>
      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email, business, challenge…"
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage(); }}
          className="flex-1 min-w-[200px] px-3 py-2 bg-[#0b0d12] border border-[#242a38] rounded-lg text-white text-[13px] placeholder:text-[#8a93a6] focus:outline-none focus:border-[#7c5cff]"
        />

        {/* Theme multi-select dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="px-3 py-2 bg-[#0b0d12] border border-[#242a38] rounded-lg text-[13px] text-[#8a93a6] hover:text-white transition-colors cursor-pointer"
          >
            Themes {themeFilter.length > 0 && `(${themeFilter.length})`} ▾
          </button>
          {showThemeDropdown && (
            <div className="absolute top-full mt-1 left-0 z-40 bg-[#12151d] border border-[#242a38] rounded-lg p-2 w-52 shadow-xl">
              {THEME_LIST.map(t => (
                <label key={t} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#242a38] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={themeFilter.includes(t)}
                    onChange={() => {
                      setThemeFilter(prev =>
                        prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                      );
                      resetPage();
                    }}
                    className="w-3.5 h-3.5 accent-[#7c5cff]"
                  />
                  <span className="text-[12px] text-[#8a93a6]">{t}</span>
                </label>
              ))}
              {themeFilter.length > 0 && (
                <button
                  onClick={() => { setThemeFilter([]); resetPage(); }}
                  className="mt-1 w-full text-center text-[11px] text-[#ef4444] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contacted filter */}
        <select
          value={contactedFilter}
          onChange={e => { setContactedFilter(e.target.value as 'all' | 'yes' | 'no'); resetPage(); }}
          className="px-3 py-2 bg-[#0b0d12] border border-[#242a38] rounded-lg text-[13px] text-[#8a93a6] cursor-pointer focus:outline-none"
        >
          <option value="all">All status</option>
          <option value="yes">Contacted</option>
          <option value="no">Uncontacted</option>
        </select>

        {/* Warm only toggle */}
        <label className="flex items-center gap-2 px-3 py-2 bg-[#0b0d12] border border-[#242a38] rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={warmOnly}
            onChange={e => { setWarmOnly(e.target.checked); resetPage(); }}
            className="w-3.5 h-3.5 accent-[#22c55e]"
          />
          <span className="text-[12px] text-[#8a93a6]">Warm only</span>
        </label>
      </div>

      {/* ── Count + pagination info ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-[#8a93a6]">{filtered.length} leads</span>
        <span className="text-[12px] text-[#8a93a6]">
          Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#242a38]">
              {['Created', 'Name', 'Business', 'Email', 'Phone', 'Website', 'Themes', 'Contacted'].map(h => (
                <th key={h} className="text-[11px] font-semibold text-[#8a93a6] uppercase tracking-wider px-3 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-[#8a93a6] text-sm py-12">No leads match filters</td>
              </tr>
            ) : (
              paged.map(sub => (
                <tr
                  key={sub.id}
                  onClick={() => setDrawerSub(sub)}
                  className="border-b border-[#242a38]/50 hover:bg-[#242a38]/30 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-[12px] text-[#8a93a6] whitespace-nowrap">{relativeTime(sub.created_at)}</td>
                  <td className="px-3 py-3 text-[13px] text-white font-medium">
                    {sub.name}
                    {sub.is_warm && <span className="ml-1.5 text-[10px] text-[#22c55e]">●</span>}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#8a93a6]">{sub.business}</td>
                  <td className="px-3 py-3 text-[13px] text-[#8a93a6] break-all">{sub.email}</td>
                  <td className="px-3 py-3 text-[13px] text-[#8a93a6]">{sub.phone || '–'}</td>
                  <td className="px-3 py-3 text-[13px] text-[#8a93a6] max-w-[120px] truncate">
                    {sub.website ? (
                      <a
                        href={sub.website.match(/^https?:\/\//) ? sub.website : `https://${sub.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-[#7c5cff] hover:underline"
                      >
                        {sub.website.replace(/^https?:\/\//, '').slice(0, 25)}
                      </a>
                    ) : '–'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {sub.themes.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-[#7c5cff]/15 text-[#7c5cff] px-1.5 py-0.5 rounded-full whitespace-nowrap">{t}</span>
                      ))}
                      {sub.themes.length > 3 && (
                        <span className="text-[10px] text-[#8a93a6]">+{sub.themes.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); onToggleContacted(sub.id, !sub.contacted); }}
                      className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${sub.contacted ? 'bg-[#22c55e]' : 'bg-[#242a38]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sub.contacted ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-[12px] bg-[#0b0d12] border border-[#242a38] rounded-lg text-[#8a93a6] disabled:opacity-30 cursor-pointer"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-[12px] bg-[#0b0d12] border border-[#242a38] rounded-lg text-[#8a93a6] disabled:opacity-30 cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      {drawerSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerSub(null)} />
          <div className="relative w-full max-w-lg bg-[#12151d] border-l border-[#242a38] overflow-y-auto p-6">
            <button
              onClick={() => setDrawerSub(null)}
              className="absolute top-4 right-4 text-[#8a93a6] hover:text-white text-lg cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-1">{drawerSub.name}</h2>
            <p className="text-[13px] text-[#8a93a6] mb-6">{drawerSub.business}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0b0d12] rounded-lg p-3">
                <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-1">Email</p>
                <p className="text-[13px] text-white break-all">{drawerSub.email}</p>
              </div>
              <div className="bg-[#0b0d12] rounded-lg p-3">
                <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-1">Phone</p>
                <p className="text-[13px] text-white">{drawerSub.phone || '–'}</p>
              </div>
              <div className="bg-[#0b0d12] rounded-lg p-3">
                <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-1">Website</p>
                {drawerSub.website ? (
                  <a href={drawerSub.website.match(/^https?:\/\//) ? drawerSub.website : `https://${drawerSub.website}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#7c5cff] hover:underline break-all">{drawerSub.website}</a>
                ) : (
                  <p className="text-[13px] text-white">–</p>
                )}
              </div>
              <div className="bg-[#0b0d12] rounded-lg p-3">
                <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-[13px] text-white">{new Date(drawerSub.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Themes */}
            {drawerSub.themes.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-2">Detected Themes</p>
                <div className="flex flex-wrap gap-1.5">
                  {drawerSub.themes.map(t => (
                    <span key={t} className="text-[11px] bg-[#7c5cff]/15 text-[#7c5cff] px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {drawerSub.is_warm && (
              <div className="mb-6 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg px-4 py-2.5">
                <p className="text-[12px] text-[#22c55e] font-medium">🔥 Warm lead — also in newsletter, class signups, or waitlist</p>
              </div>
            )}

            {/* Scaling Challenge */}
            <div className="mb-6">
              <p className="text-[10px] text-[#8a93a6] uppercase tracking-wider mb-2">Scaling Challenge</p>
              <div className="bg-[#0b0d12] rounded-lg p-4">
                <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap">{drawerSub.scaling_challenge}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!drawerSub.contacted ? (
                <button
                  onClick={() => {
                    onToggleContacted(drawerSub.id, true);
                    setDrawerSub({ ...drawerSub, contacted: true });
                  }}
                  className="flex-1 py-3 bg-[#22c55e] text-black rounded-xl font-semibold text-[14px] hover:bg-[#22c55e]/90 cursor-pointer"
                >
                  Mark Contacted
                </button>
              ) : (
                <button
                  onClick={() => {
                    onToggleContacted(drawerSub.id, false);
                    setDrawerSub({ ...drawerSub, contacted: false });
                  }}
                  className="flex-1 py-3 bg-[#242a38] text-[#8a93a6] rounded-xl font-semibold text-[14px] hover:bg-[#242a38]/80 cursor-pointer"
                >
                  Mark Uncontacted
                </button>
              )}
              <button
                onClick={() => setDrawerSub(null)}
                className="px-6 py-3 bg-[#242a38] text-[#8a93a6] rounded-xl font-semibold text-[14px] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
