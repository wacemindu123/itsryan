import crypto from 'crypto';

export type NewsletterAction = 'approve' | 'changes';

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function randomNonce(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function signActionToken(params: {
  draftId: number;
  action: NewsletterAction;
  nonce: string;
  secret: string;
}): string {
  const payload = `${params.draftId}:${params.action}:${params.nonce}`;
  return crypto.createHmac('sha256', params.secret).update(payload).digest('hex');
}

export function verifyActionToken(params: {
  draftId: number;
  action: NewsletterAction;
  nonce: string;
  token: string;
  secret: string;
}): boolean {
  const expected = signActionToken({
    draftId: params.draftId,
    action: params.action,
    nonce: params.nonce,
    secret: params.secret,
  });
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.token));
}

export function requireCronAuth(request: Request): Response | null {
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron === '1') return null;

  const secret = process.env.NEWSLETTER_CRON_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Cron secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';

  if (!token || token !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

export function formatIssueDateET(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  if (!year || !month || !day) return date.toISOString().slice(0, 10);
  return `${year}-${month}-${day}`;
}
