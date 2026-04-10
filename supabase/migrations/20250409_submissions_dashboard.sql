-- ============================================================
-- Submissions Dashboard Migration
-- Run this against your Supabase database via the SQL editor.
-- ============================================================

-- 1. Add contacted_at column if it doesn't exist
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz;

-- Back-fill contacted_at for rows already marked contacted
UPDATE public.submissions
  SET contacted_at = created_at
  WHERE contacted = true AND contacted_at IS NULL;

-- 2. Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- 3. Create submissions_enriched view
-- Tags each submission with detected themes and warm-overlap flag.
CREATE OR REPLACE VIEW public.submissions_enriched AS
WITH theme_tags AS (
  SELECT
    s.id,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN LOWER(s.scaling_challenge) ~* 'market|lead|advertis|social media|seo|brand|audience|traffic|visibility' THEN 'marketing/leads' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'website|tech|app|software|platform|tool|integr|shopify|wordpress' THEN 'tech/website' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'time|overwhelm|organiz|systems?|process|sop|manual|tedious|repetit' THEN 'time/ops' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'customer|client|retention|churn|support|onboard' THEN 'customer/retention' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'automat|ai |a\.i\.|agent|workflow|zapier|make\.com|n8n' THEN 'ai/automation' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'scal|grow|expand|plateau|stuck' THEN 'scaling/growth' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'sales|convert|pipeline|crm|follow[ -]?up|outreach' THEN 'sales/conversion' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'pric|revenue|cash|financ|budget|profit|invoic' THEN 'finance/pricing' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'inventory|supply|shipp|fulfil|logistic|manufact' THEN 'inventory/supply' END,
      CASE WHEN LOWER(s.scaling_challenge) ~* 'hir|staff|employ|delegate|outsourc|contractor' THEN 'hiring/team' END
    ], NULL) AS themes
  FROM public.submissions s
),
warm_check AS (
  SELECT
    s.id,
    (
      EXISTS (SELECT 1 FROM public.newsletter_subscribers ns WHERE ns.email = s.email)
      OR EXISTS (SELECT 1 FROM public.class_signups cs WHERE cs.email = s.email)
      OR EXISTS (SELECT 1 FROM public.project_waitlist pw WHERE pw.email = s.email)
    ) AS is_warm
  FROM public.submissions s
)
SELECT
  s.id, s.name, s.email, s.business, s.scaling_challenge,
  s.phone, s.website, s.created_at, s.contacted, s.contacted_at,
  t.themes,
  w.is_warm
FROM public.submissions s
JOIN theme_tags t ON t.id = s.id
JOIN warm_check w ON w.id = s.id;

-- 4. Create submissions_stats RPC
-- Returns all KPI numbers and chart series as a single JSON payload.
CREATE OR REPLACE FUNCTION public.submissions_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH base AS (
    SELECT * FROM public.submissions_enriched
  ),
  kpis AS (
    SELECT jsonb_build_object(
      'total', (SELECT COUNT(*) FROM base),
      'contacted', (SELECT COUNT(*) FROM base WHERE contacted = true),
      'uncontacted', (SELECT COUNT(*) FROM base WHERE contacted = false),
      'stale_30d', (SELECT COUNT(*) FROM base WHERE contacted = false AND created_at < NOW() - INTERVAL '30 days'),
      'warm', (SELECT COUNT(*) FROM base WHERE is_warm = true),
      'today', (SELECT COUNT(*) FROM base WHERE created_at::date = CURRENT_DATE),
      'oldest_stale_days', COALESCE(
        (SELECT EXTRACT(DAY FROM NOW() - MIN(created_at))::int FROM base WHERE contacted = false),
        0
      )
    ) AS val
  ),
  weekly AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'week', TO_CHAR(week_start, 'YYYY-MM-DD'),
        'total', total,
        'contacted', contacted_count
      ) ORDER BY week_start
    ) AS val
    FROM (
      SELECT
        DATE_TRUNC('week', created_at) AS week_start,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE contacted = true) AS contacted_count
      FROM base
      WHERE created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
    ) w
  ),
  staleness AS (
    SELECT jsonb_agg(
      jsonb_build_object('bucket', bucket, 'count', cnt)
      ORDER BY sort_order
    ) AS val
    FROM (
      SELECT
        CASE
          WHEN age < 7 THEN '<7d'
          WHEN age < 14 THEN '7-14d'
          WHEN age < 30 THEN '14-30d'
          ELSE '>30d'
        END AS bucket,
        CASE
          WHEN age < 7 THEN 1
          WHEN age < 14 THEN 2
          WHEN age < 30 THEN 3
          ELSE 4
        END AS sort_order,
        COUNT(*) AS cnt
      FROM (
        SELECT EXTRACT(DAY FROM NOW() - created_at)::int AS age
        FROM base WHERE contacted = false
      ) ages
      GROUP BY bucket, sort_order
    ) s
  )
  SELECT jsonb_build_object(
    'kpis', (SELECT val FROM kpis),
    'weekly', COALESCE((SELECT val FROM weekly), '[]'::jsonb),
    'staleness', COALESCE((SELECT val FROM staleness), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
