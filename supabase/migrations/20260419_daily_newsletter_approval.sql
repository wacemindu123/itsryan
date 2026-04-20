-- Daily newsletter approval-gated pipeline

-- Ensure base tables exist (safe to run on fresh or partially-provisioned DBs)
create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  phone text,
  name text,
  subscribed boolean not null default true,
  unsubscribe_token text,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_subscribed_idx
  on public.newsletter_subscribers (subscribed);

create table if not exists public.newsletter_drafts (
  id bigserial primary key,
  subject text not null,
  content text not null,
  sms_content text,
  status text not null default 'draft',
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Extend newsletter_drafts to support daily issues + approval tokens + audit fields
alter table if exists public.newsletter_drafts
  add column if not exists issue_date date,
  add column if not exists preview_sent_at timestamptz,
  add column if not exists approval_nonce_hash text,
  add column if not exists approval_used_at timestamptz,
  add column if not exists changes_nonce_hash text,
  add column if not exists changes_used_at timestamptz,
  add column if not exists regeneration_count int not null default 0,
  add column if not exists last_feedback text,
  add column if not exists generation_context jsonb,
  add column if not exists send_started_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists resend_batch_id text;

create unique index if not exists newsletter_drafts_issue_date_unique
  on public.newsletter_drafts (issue_date)
  where issue_date is not null;

create table if not exists public.newsletter_send_logs (
  id bigserial primary key,
  draft_id bigint references public.newsletter_drafts(id) on delete cascade,
  to_email text not null,
  resend_message_id text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_send_logs_draft_id_idx
  on public.newsletter_send_logs (draft_id);
