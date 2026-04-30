---
name: ai-newsletter-for-smbs
description: Use this skill whenever the user is writing, planning, drafting, or editing an issue of their weekly AI newsletter for small business owners. Triggers on phrases like "write this week's newsletter," "draft the AI digest," "put together my Friday email," "the newsletter for my community," or any mention of a recurring AI-for-SMB email. Also use when the user is doing the upstream research — scraping X/Twitter, Reddit, LinkedIn, Hacker News, or Product Hunt for AI workflow content — and needs to filter, summarize, or rank what they found for an SMB audience. Do not use for one-off marketing emails, sales sequences, blog posts, or technical documentation; this skill is specifically for the recurring weekly community newsletter format.
---

# AI Newsletter for Small Businesses

## What this skill is for

You are helping the user produce a weekly newsletter for a community of small business owners learning to adopt AI. The audience is the owner-operator of a 1–50 person business — a clinic, a law firm, a roofer, an agency, a Shopify brand, a real estate team. They are smart and busy. They do not write code. They want to know what to use, how to use it, and what it will cost them in time and dollars.

This is **not** a newsletter for AI engineers, prompt-engineers-as-content, or VCs chasing the next model release. The framing always answers one question: **"What does this mean for me as an SMB owner this week?"** If a section can't answer that question, it doesn't belong in the issue.

## Format at a glance

- **Length**: 5–7 minute read. Roughly 800–1,200 words.
- **Cadence**: Weekly. Most SMB readers open over morning coffee or between meetings — assume scannable.
- **Voice**: Smart but warm. Plainspoken. No jargon without a translation. Closer to *Ben's Bites* or *The Neuron* than *Stratechery* or *Import AI*.
- **Structure**: Fixed sections in fixed order so readers know where to look. Skim-friendly: bold leads, short bullets, one TL;DR per section.

## The standard issue structure

Every issue uses this exact skeleton. Sections can shrink or grow but should not be reordered or removed without a deliberate reason.

```
1. Subject line + preview text
2. Cold open (1–2 sentences, sets the week's theme)
3. The Big Story  — the one news item that matters most this week
4. Workflow of the Week — a step-by-step the reader can copy in <30 minutes
5. Tool Spotlight — one tool, with use case + pricing + gotcha
6. Prompt of the Week — one copy-paste prompt with the "why it works"
7. From the Feed — 3–5 curated tweets/posts/threads
8. SMB Win — a short case study (real or composite, labeled honestly)
9. From the Docs — link block to the user's website resources
10. Sign-off + CTA
```

For full templates, voice rules, and worked examples, read `references/section-templates.md`.

## The SMB filter — apply to everything

Before any item goes into the newsletter, ask the four-question filter. If it can't answer at least three, cut it.

1. **Who is it for?** — Can you name a specific kind of SMB owner who would benefit? "All businesses" is a fail.
2. **What does it cost?** — In time to set up, dollars per month, and skill required. Vague = fail.
3. **What does it replace or speed up?** — Concrete before/after. "Saves time" is a fail; "Replaces 2 hours of weekly invoice chasing" passes.
4. **What's the catch?** — Every tool has one. Pricing tiers, accuracy ceilings, learning curves. If you can't name the catch, you don't understand the tool well enough to recommend it.

This filter is the single most important thing in this skill. AI newsletters die when they drift toward "cool things engineers built this week." The reader doesn't care that something is cool. They care that it makes them money or saves them time **on Tuesday**.

## Research and content sourcing

Each issue starts with research, not writing. The user has specifically called out X/Twitter and other community spaces as their content engine. For the full sourcing playbook — which accounts to monitor, how to triage threads, how to verify a claim before quoting it, and how to convert a builder thread into an SMB-readable workflow — read `references/research-process.md`.

Quick rule: **never repeat hype you can't verify**. If a tweet claims a tool "increased sales 400%," either find the underlying case study or rewrite the item as "[builder name] claims..." with a clear attribution. Trust is the only moat a small newsletter has.

## Voice and tone rules

The full voice guide is in `references/voice-guide.md`. The short version:

- Talk to one person, not "you all" or "our community."
- Translate every acronym the first time it appears in an issue (RAG, MCP, LLM, etc.).
- Concrete numbers beat adjectives. "$20/month, ~10 minutes to set up" beats "affordable and easy."
- No emoji storms. One emoji per section maximum, and only if it earns its keep.
- No "this changes everything." No "game-changer." No "the AI revolution is here." Banned phrases list lives in the voice guide.
- Active voice. Short sentences. The reader can feel when you're padding.

## Linking to the user's documentation

The user maintains a website with documentation, guides, and resources for their community. Every issue should drive readers there at least twice — once contextually inside a section (e.g., "we have a full setup guide for this here →") and once in the dedicated **From the Docs** section near the bottom.

When the user provides their site URL and a list of relevant docs at the top of the conversation, weave them in naturally where the topic matches. If the user hasn't provided URLs yet, leave clearly marked placeholders like `[LINK: setup guide for X]` so the user can fill them in before sending. Never invent URLs.

## How to handle a draft request

When the user asks you to write or draft an issue, follow this sequence:

1. **Confirm the inputs you have.** Date of the issue, this week's "big story," any specific tools/tweets/posts the user already wants featured, the website URL and any relevant doc links.
2. **If you're missing the big story or research material, ask.** Don't fabricate news. If the user wants you to do the research, follow `references/research-process.md`.
3. **Run everything through the SMB filter** above before drafting.
4. **Draft top to bottom in the standard structure.** Use the templates in `references/section-templates.md`.
5. **Apply the voice rules** from `references/voice-guide.md`. Read your draft once focused on cuts — most first drafts can lose 15–20% with no loss of meaning.
6. **End with a checklist** of what the user needs to verify or fill in (links, claims, the case study subject) before sending.

## Anti-patterns to avoid

These show up constantly in AI newsletters and they are all death for SMB readers.

- **The model-release recap.** "OpenAI announced GPT-X. It has Y new features." SMB owners don't care about the model. They care about what it now lets them do that they couldn't do last week. Lead with the use case, not the model name.
- **The framework drop.** Long thought-leadership pieces about "the four pillars of AI adoption." Your reader is trying to get one thing working before lunch.
- **Tool dumps.** "10 AI tools you need to know about." A reader can't act on 10 tools. Pick one and go deep.
- **Builder-speak.** Words like "agentic," "tool-calling," "embeddings," "MCP" used without translation. If you must use them, translate inline the first time.
- **Vague case studies.** "A small business in Texas used AI and saved tons of time." Either get specifics or cut it.

## Output format

Unless the user asks for something else, deliver drafts as Markdown. Headers, bullets, and bold work in every email tool the user is likely to use (Beehiiv, Substack, ConvertKit, Ghost, Kit, Mailchimp). Include the subject line and preview text at the very top, clearly labeled, so the user can copy them into their sending tool.

Skill resources reference:
- `references/section-templates.md` — exact templates for every section, plus subject-line patterns and 3 worked examples per section.
- `references/research-process.md` — how to find content each week from X/Twitter, LinkedIn, Reddit, HN, Product Hunt, podcasts, and community Discords; how to verify claims; how to convert builder threads into SMB workflows.
- `references/voice-guide.md` — tone rules, banned phrases, SMB framing checklist, CTA patterns.
