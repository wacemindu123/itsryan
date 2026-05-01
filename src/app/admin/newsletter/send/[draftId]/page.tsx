import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface SendLog {
  id: number;
  draft_id: number;
  to_email: string;
  status: 'sent' | 'failed';
  resend_message_id: string | null;
  error: string | null;
  created_at: string;
}

interface Draft {
  id: number;
  subject: string;
  status: string;
  sent_at: string | null;
  send_started_at: string | null;
  created_at: string;
}

async function loadReceipt(draftId: number): Promise<{ draft: Draft | null; logs: SendLog[] }> {
  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    return { draft: null, logs: [] };
  }

  const [draftRes, logsRes] = await Promise.all([
    supabase.from('newsletter_drafts').select('id, subject, status, sent_at, send_started_at, created_at').eq('id', draftId).single(),
    supabase.from('newsletter_send_logs').select('*').eq('draft_id', draftId).order('created_at', { ascending: false }),
  ]);

  return {
    draft: (draftRes.data as Draft) ?? null,
    logs: ((logsRes.data as SendLog[]) ?? []),
  };
}

export default async function NewsletterSendReceiptPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId: draftIdStr } = await params;
  const draftId = Number(draftIdStr);
  if (!Number.isFinite(draftId)) notFound();

  const { draft, logs } = await loadReceipt(draftId);

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/admin/newsletter" className="text-sm text-gray-600 hover:text-gray-900">← Back to Newsletter</Link>
          <div className="mt-6 bg-white rounded-lg p-8 text-gray-700">
            Draft <strong>#{draftId}</strong> not found, or the database is not configured.
          </div>
        </div>
      </div>
    );
  }

  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const total = logs.length;
  const successRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  const failures = logs.filter((l) => l.status === 'failed');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/newsletter" className="text-sm text-gray-600 hover:text-gray-900">← Back to Newsletter</Link>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Receipt</h1>
            <p className="text-sm text-gray-600 mt-1">
              Draft #{draft.id} — <span className="font-medium text-gray-800">{draft.subject}</span>
            </p>
          </div>
          <StatusBadge status={draft.status} sentAt={draft.sent_at} />
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card label="Sent" value={sentCount.toLocaleString()} tone="good" />
          <Card label="Failed" value={failedCount.toLocaleString()} tone={failedCount > 0 ? 'bad' : 'neutral'} />
          <Card label="Total attempts" value={total.toLocaleString()} tone="neutral" />
          <Card label="Success rate" value={total > 0 ? `${successRate}%` : '—'} tone={successRate >= 95 ? 'good' : successRate >= 80 ? 'neutral' : 'bad'} />
        </div>

        {/* Timing */}
        <div className="mt-6 bg-white rounded-lg p-5 text-sm text-gray-700 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Created" value={fmt(draft.created_at)} />
            <Field label="Send started" value={fmt(draft.send_started_at)} />
            <Field label="Completed" value={fmt(draft.sent_at)} />
          </div>
        </div>

        {/* Failures */}
        {failures.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-red-200 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-200 text-sm font-semibold text-red-900">
              Failures ({failures.length})
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-5 py-2">Email</th>
                  <th className="px-5 py-2">Error</th>
                  <th className="px-5 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100 align-top">
                    <td className="px-5 py-3 font-mono text-xs text-gray-900">{l.to_email}</td>
                    <td className="px-5 py-3 text-xs text-red-800 whitespace-pre-wrap break-words">{l.error || '(no message)'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All attempts */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-900 flex items-center justify-between">
            <span>All send attempts ({total})</span>
            <span className="text-xs text-gray-500 font-normal">Newest first</span>
          </div>
          {total === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500 text-center">
              No send logs for this draft yet. If you&apos;ve already clicked Approve &amp; Send, check that the send endpoint completed without an error.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500 bg-white border-b border-gray-200">
                <tr>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2">Email</th>
                  <th className="px-5 py-2">Resend ID</th>
                  <th className="px-5 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100">
                    <td className="px-5 py-2">
                      <span
                        className={
                          l.status === 'sent'
                            ? 'inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-xs font-medium'
                            : 'inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium'
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 font-mono text-xs text-gray-900">{l.to_email}</td>
                    <td className="px-5 py-2 font-mono text-[11px] text-gray-500">{l.resend_message_id || '—'}</td>
                    <td className="px-5 py-2 text-xs text-gray-500 whitespace-nowrap">{fmt(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Resend dashboard: <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="underline">resend.com/emails</a> — filter by Message ID for deep diagnostics (bounce reason, inbox placement).
        </p>
      </div>
    </div>
  );
}

// ── Presentational helpers ────────────────────────────────────────────

function Card({ label, value, tone }: { label: string; value: string; tone: 'good' | 'bad' | 'neutral' }) {
  const toneClass =
    tone === 'good' ? 'text-green-700' : tone === 'bad' ? 'text-red-700' : 'text-gray-900';
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</div>
      <div className="mt-1 text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status, sentAt }: { status: string; sentAt: string | null }) {
  const label = sentAt ? 'Sent' : status;
  const tone =
    label === 'Sent' || status === 'sent'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'skipped'
      ? 'bg-gray-100 text-gray-700 border-gray-200'
      : 'bg-amber-50 text-amber-800 border-amber-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York' });
  } catch {
    return iso;
  }
}
