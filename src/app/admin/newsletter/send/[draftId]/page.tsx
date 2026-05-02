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
  content: string;
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
    supabase.from('newsletter_drafts').select('id, subject, content, status, sent_at, send_started_at, created_at').eq('id', draftId).single(),
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
      <div className="space-y-4">
        <Link href="/admin/newsletter/send" className="text-sm text-gray-500 hover:text-gray-900">← All Drafts</Link>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-gray-600">
          Draft <strong>#{draftId}</strong> not found.
        </div>
      </div>
    );
  }

  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const total = logs.length;
  const successRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  // Dedupe failures by email — show only the latest attempt per address
  const failureMap = new Map<string, SendLog>();
  for (const l of logs) {
    if (l.status === 'failed' && !failureMap.has(l.to_email)) {
      failureMap.set(l.to_email, l);
    }
  }
  // Exclude failures where a later attempt succeeded
  const sentEmails = new Set(logs.filter((l) => l.status === 'sent').map((l) => l.to_email));
  const uniqueFailures = [...failureMap.values()].filter((l) => !sentEmails.has(l.to_email));

  // Group errors by message for a summary view
  const errorGroups: Record<string, string[]> = {};
  for (const f of uniqueFailures) {
    const key = f.error || 'Unknown error';
    if (!errorGroups[key]) errorGroups[key] = [];
    errorGroups[key].push(f.to_email);
  }

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Link href="/admin/newsletter/send" className="hover:text-gray-900 transition-colors">All Drafts</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">#{draft.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">{draft.subject}</h1>
            <StatusPill status={draft.status} sentAt={draft.sent_at} />
          </div>
          <p className="text-sm text-gray-500 mt-1">Draft #{draft.id}</p>
        </div>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Delivered" value={sentCount} color="green" />
        <StatCard label="Failed" value={uniqueFailures.length} color={uniqueFailures.length > 0 ? 'red' : 'gray'} />
        <StatCard label="Total Attempts" value={total} color="gray" />
        <StatCard
          label="Success Rate"
          value={total > 0 ? `${successRate}%` : '—'}
          color={successRate >= 95 ? 'green' : successRate >= 80 ? 'gray' : 'red'}
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Delivery progress</span>
            <span>{sentCount} of {sentCount + uniqueFailures.length} recipients</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(sentCount / Math.max(sentCount + uniqueFailures.length, 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <TimelineItem label="Created" date={draft.created_at} />
          <TimelineItem label="Approved" date={draft.send_started_at} />
          <TimelineItem label="Completed" date={draft.sent_at} />
        </div>
      </div>

      {/* Error summary — grouped by error type */}
      {uniqueFailures.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-red-100">
          <div className="px-5 py-4 bg-red-50 border-b border-red-100">
            <h2 className="text-sm font-semibold text-red-900">
              {uniqueFailures.length} Permanent Failure{uniqueFailures.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-xs text-red-700 mt-0.5">Emails that failed and were not successfully retried</p>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(errorGroups).map(([error, emails]) => (
              <div key={error} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-800 truncate">{error}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {emails.slice(0, 10).map((email) => (
                        <span key={email} className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-mono text-red-700 border border-red-100">
                          {email}
                        </span>
                      ))}
                      {emails.length > 10 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs text-red-500">
                          +{emails.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-700">{emails.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No errors state */}
      {uniqueFailures.length === 0 && total > 0 && (
        <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-100">
          <p className="text-sm font-medium text-green-800">All emails delivered successfully</p>
        </div>
      )}

      {/* Resend link */}
      <p className="text-xs text-gray-400 text-center">
        Deep diagnostics available at{' '}
        <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          resend.com/emails
        </a>
      </p>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: 'green' | 'red' | 'gray' }) {
  const valueColor = color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${valueColor}`}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  );
}

function TimelineItem({ label, date }: { label: string; date: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${date ? 'bg-green-500' : 'bg-gray-200'}`} />
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</div>
        <div className={`text-sm mt-0.5 ${date ? 'text-gray-900' : 'text-gray-400'}`}>{fmtFull(date)}</div>
      </div>
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
      : 'bg-amber-50 text-amber-700 border-amber-200';
  return (
    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function fmtFull(iso: string | null | undefined): string {
  if (!iso) return 'Pending';
  try {
    return new Date(iso).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
