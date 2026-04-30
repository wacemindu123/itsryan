# Newsletter spec

Canonical spec for the weekly AI-for-SMB newsletter. The drafting prompt in
`src/lib/newsletter-prompt.ts` is derived from these files and should be kept
in sync when they change.

- `SKILL.md` — top-level system: format, the 9-section structure, the SMB
  filter, anti-patterns.
- `voice-guide.md` — tone rules, banned phrases, jargon translation table,
  CTA patterns.
- `section-templates.md` — exact templates + worked examples for every
  section, plus subject-line patterns.
- `research-process.md` — sourcing playbook (X, Reddit, LinkedIn, HN, PH,
  podcasts) and verification routine.
- `sample-issue.md` — full worked example using `[REPLACE: ...]` placeholders
  for brand, links, and the week's verified content.

## Audience

Owner-operator of a 1–50 person business — clinic, agency, trades, ecom,
professional services. Smart, busy, doesn't write code. Wants to know what
to use, how to use it, and what it costs in time and dollars.

## Cadence note

The current production cron in `vercel.json` runs daily at 7am EST. The skill
specifies a weekly cadence. Until the cadence is reconciled, treat each
generated draft as one issue and apply the full 9-section structure.
