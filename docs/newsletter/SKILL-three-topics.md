# SKILL — The three-topic AI newsletter (v2)

**Status:** DRAFT for approval. Not yet live in the prompt.
**Supersedes:** the 7-section structure when approved.
**Design pairing:** keep the Quiet Modern visual paradigm
(`docs/newsletter/email-paradigm.md`) — this SKILL only changes *what sections
appear* and *what goes in them*, not the visual system.

---

## The thesis

Readers don't want a magazine. They want three useful things in their inbox:

1. **A thing they can actually do** — an AI workflow or move that helps their
   small business this week.
2. **A thing they should know** — the most important AI news that matters to
   them (a model, a product, a capability, an industry shift).
3. **Proof someone like them did it** — a real SMB that used AI to get a real
   result.

Nothing else. No tool spotlights, no prompt of the week, no feed roundup, no
docs block. If a section doesn't fit one of the three buckets above, cut it.

---

## The fixed three-topic structure

Every issue has exactly these three sections, in this order. If a source pack
can't fill all three, we omit the issue and try again next cycle rather than
ship a weak one.

### 1. The Move — "Try this"
**What:** one specific AI-powered workflow or technique the reader can put to
work this week. Names specific AI tools. Gives a specific before/after. Gives
specific steps.

**Who it's for (in the section):** the named kind of SMB — "solo accountants,"
"dental-office schedulers," "agency account managers." Never "businesses."

**Shape:**
- One-line outcome headline (bold).
- 1–2 sentence setup: what it replaces and why that matters.
- `spec` fenced block (For / Cost / Stack) — keeps the paradigm motif.
- 3–5 numbered steps. Each step names a button, menu, or specific action.
- One line starting `**Catch:**` naming the one thing that will trip them up.

**Length:** ~200–300 words.

**Must-haves:** at least one named AI tool, at least one real link from the
pack, one concrete time/$ number.

**Cut criteria:** if the workflow would still make sense with AI removed, cut
the section. It's not right for this newsletter.

### 2. The News — "What shipped"
**What:** the single most important AI news item this week, framed for an
owner-operator. A model release, a product launch, a capability milestone, a
policy/industry shift. One item. Not a roundup.

**Shape:**
- Bold one-line AI-framed headline.
- Paragraph 1 (2–3 sentences): what happened, with the source `[link](url)`,
  in plain English.
- Paragraph 2 (2–3 sentences): why the SMB reader should care. Who should pay
  attention, who can ignore it for now.
- `pullquote` fenced block with the single sharpest sentence in the section.
- One line starting `**What to do this week:**` — one concrete action. "Try
  it," "ignore it until X," "switch from Y to Z."

**Length:** ~150–220 words.

**Must-haves:** named AI product/company, source link from the pack, a clear
"who cares / who doesn't" sentence.

**Cut criteria:** if the story is just a model benchmark number with no SMB
relevance, swap it for the next-best item. A story with no reader implication
does not run.

### 3. The Win — "Someone like you did it"
**What:** one real small business that used AI to get a real result. Named
business, named AI tool, a real number.

**Shape:** a `win` fenced block with:
- `Business:` named business + city
- `Headline:` one-line summary
- `Metric:` the number (e.g. "2.1 hrs → 23 min/day")
- `Body:` 2–3 sentences on how they did it, with named AI tools
- `Quote:` one short verbatim quote — only if the pack has it; omit otherwise

**Length:** the card does the work. 60–120 words.

**Cut criteria (this is the strict one):** if the pack does NOT contain a
verified case study with a real business name, a real AI tool, and a real
number, the section is OMITTED entirely. No invented wins. No anonymized
composites. The absence of a Win section is a feature, not a failure — it
tells the reader the ones we do ship are real.

---

## The frame (what wraps the three sections)

### Cold open — 1–2 sentences
Plain prose at the top of the body. No heading. Ties the three sections
together with a one-line theme. If the three items don't rhyme, the cold open
says "three unrelated things this week — all three matter for different
reasons" and moves on.

### Sign-off
Four lines. No CTA stack.

> That's the week.
>
> If you tried [The Move / The News / The Win], hit reply and tell me how it
> went. I read every reply.
>
> — Ryan
>
> P.S. One-line forward ask OR tease of next week's topic.

---

## Subject + preview rules

- **Subject** (<55 chars) names the single most useful thing in the issue.
  Usually that's The Move, sometimes The News if something huge shipped.
  MUST name a specific AI tool or capability — never a generic productivity
  verb.
- **Preview** (~80–110 chars) extends the subject. Tells the reader what the
  other two sections are without listing them.

**Passes:**
- `Subject: Claude Files replaces your proposal assistant`
  `Preview: A 20-min setup, a new image model from Google, and a dental clinic that cut email 80%.`

**Fails:**
- `Subject: This week in AI` (no specificity)
- `Subject: Three ways to save time with AI` (generic verb)

---

## Voice (unchanged from paradigm)

Owner-to-owner. Contractions always. Short sentences. Concrete numbers. Jargon
translated at point of use. No banned phrases (see
`docs/newsletter/voice-guide.md`). Earn each em-dash.

---

## Hard editorial rules

1. **Three sections, never more.** If a fourth good item exists, save it for
   next week. Scarcity is the format.
2. **Every section names AI.** A section that could run in a non-AI newsletter
   doesn't belong.
3. **Every concrete claim has a link from the pack.** No inline links that
   weren't in the source material.
4. **No placeholders in the output.** If you can't fill a section from the
   pack, the issue gets skipped and we try tomorrow.
5. **The Win is sacred.** Either it's a real, named, verifiable AI case study,
   or the Win section doesn't ship. No exceptions.

---

## When to SKIP the issue entirely

If all three of these are true, return `Subject: (skip)` and ship nothing:

- No pack item is concrete enough to be The Move this week, AND
- No pack item is big enough AI news to be The News, AND
- No pack item is a verified SMB AI win.

A skip is better than a filler issue. The paradigm rule "a 4-section issue
with all real content beats a 9-section one with placeholders" applies here
too — the strongest version is: **a zero-issue week beats a bad issue.**

---

## Length budget

- Cold open: 30–50 words
- The Move: 200–300 words
- The News: 150–220 words
- The Win: 60–120 words (card does the lifting)
- Sign-off: 40–60 words

**Total: ~500–700 words.** That's a 3–4 minute read.

This is shorter than the old format on purpose. A focused short letter gets
forwarded. A long one gets archived.

---

## Open questions for you to decide before we implement

- [ ] **Cadence** — is this still daily, or switching to weekly?
- [ ] **The Win fallback** — when no verified win is available (will be most
      weeks at the start), do we: (a) omit the section and run a two-topic
      issue, or (b) skip the whole issue? Current proposal: (a) for now, to
      keep the habit running.
- [ ] **The Move fallback** — if no pack item supports a specific workflow,
      can we run The Move off a Prompt-of-the-Week-style recipe? Current
      proposal: no — it has to be grounded in an AI tool from the pack, so we
      stay news-fresh.

---

## What implementation will change

Once you approve this SKILL:

- `src/lib/newsletter-prompt.ts` collapses from the 7-section structure to
  the three-topic structure above.
- `src/lib/newsletter-email-template.ts` is unchanged (the Quiet Modern
  paradigm stays; fewer sections just means less rendering).
- `docs/newsletter/SKILL.md` gets superseded by this file (we keep the old
  one as history).
- Cadence stays as you set it (daily/weekly) — not a prompt concern.

Approve this file and I'll implement + fire preview #12.
