import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Draft {
  id: number;
  subject: string;
  status: string;
  sent_at: string | null;
  send_started_at: string | null;
  created_at: string;
}

interface SendStats {
  draft_id: number;
  sent: number;
  failed: number;
}

async function loadDrafts(): Promise<{ drafts: Draft[]; statsMap: Record<number, SendStats> }> {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return { drafts: [], statsMap: {} };
  }

  const { data: drafts } = await supabase
    .from('newsletter_drafts')
    .select('id, subject, status, sent_at, send_started_at, created_at')
    .order('created_at', { ascending: false });

  if (!drafts || drafts.length === 0) return { drafts: [], statsMap: {} };

  // Fetch send log counts per draft
  const { data: logs } = await supabase
    .from('newsletter_send_logs')
    .select('draft_id, status');

  const statsMap: Record<number, SendStats> = {};
  if (logs) {
    for (const log of logs) {
      if (!statsMap[log.draft_id]) {
        statsMap[log.draft_id] = { draft_id: log.draft_id, sent: 0, failed: 0 };
      }
      if (log.status === 'sent') statsMap[log.draft_id].sent++;
      else statsMap[log.draft_id].failed++;
    }
  }

  return { drafts: drafts as Draft[], statsMap };
}

export default async function NewsletterSendIndexPage() {
  const { drafts, statsMap } = await loadDrafts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Send History</h1>
          <p className="text-sm text-gray-500 mt-1">All newsletter drafts and their delivery status</p>
        </div>
        <Link
          href="/admin/newsletter"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to Newsletter
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-500">No drafts yet. Drafts are generated automatically on the cron schedule.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Draft</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Delivery</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Sent</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drafts.map((d) => {
                const stats = statsMap[d.id];
                const total = stats ? stats.sent + stats.failed : 0;
                return (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">#{d.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 max-w-[300px] truncate">{d.subject}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={d.status} sentAt={d.sent_at} />
                    </td>
                    <td className="px-5 py-4">
                      {total > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${total > 0 ? (stats!.sent / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {stats!.sent}/{total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(d.sent_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/newsletter/send/${d.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status, sentAt }: { status: string; sentAt: string | null }) {
  const label = sentAt ? 'Sent' : status;
  const cls =
    label === 'Sent' || status === 'sent'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'skipped'
      ? 'bg-gray-100 text-gray-600 border-gray-200'
      : status === 'draft' || status === 'pending'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
