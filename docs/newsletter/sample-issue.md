# SAMPLE ISSUE — generated using the ai-newsletter-for-smbs skill

> **Note:** this is a worked example to show what the skill produces. Items marked `[REPLACE: ...]` are placeholders the user fills in with their own brand, links, and the week's verified content. Twitter handles in *From the Feed* are placeholders — substitute real ones from your weekly research pass.

---

**Subject:** Let your inbox draft its own replies (it's about time)
**Preview:** Plus: the $19/mo CRM that builds its own follow-up sequences, a 4-line prompt you'll paste twice today, and the assistant tool that just doubled its free tier.

---

If you've been hearing "AI agents" all week and rolling your eyes, you're not wrong — most of it is engineers building toys for engineers. But three of the items below are workflows you can actually have running before lunch. Start with the Workflow of the Week.

---

## The Big Story
**The "AI assistant" tools quietly grew up — and your inbox is the obvious place to start.**

Two of the bigger names in the AI-assistant space — the kind of tool that reads your email, drafts replies, and updates your CRM without you in the loop — shipped meaningful updates this week. The headline isn't the features. It's the pricing: free tiers that are now actually usable for a solo or small team, instead of the 50-credit teasers from six months ago.

Why it matters for you: this is the first generation of these tools where you can run a real test on your real inbox without putting in a credit card. Two weeks ago that wasn't true.

**What to do this week:** If email triage is your daily 90-minute tax, pick one tool (we'd start with Lindy or Mindy) and point it at a *secondary* inbox first — a sales@ or info@ alias, not your main one. You want to see what it gets right and wrong before it touches anything important.

[REPLACE: link to your "AI inbox automation" guide →]

---

## Workflow of the Week
**Goal:** Every new lead from your website form gets a personalized follow-up email drafted and sitting in your Gmail drafts within five minutes — for you to review and send.
**Time:** ~25 minutes
**Cost:** $20/month (one ChatGPT Plus account is enough at typical small-business volume)
**Tools:** Gmail, Zapier (free tier works at <100 leads/mo), ChatGPT

**Why this matters:** Most SMBs don't lose deals because the lead wasn't interested. They lose deals because the follow-up went out three days late and read like a template. This puts a personalized first draft in front of you within minutes — you still review it, you still send it, but the blank-page tax is gone.

**Steps:**
1. In Zapier, create a new Zap. Trigger: **New Email Matching Search in Gmail**. Search criteria: `from:noreply@your-form-tool.com` (replace with whatever your form tool uses).
2. Add a step: **Formatter → Extract Pattern**. Pull out the lead's name, company, and the freeform message they wrote.
3. Add a **ChatGPT** step. In the prompt field, paste the prompt below from *Prompt of the Week*. Map the lead's name/company/message into the variables.
4. Add a **Gmail → Create Draft** step. Map the AI's output to the body. To: the lead's email. Subject: "Re: your inquiry — [Company Name]".
5. Send yourself a test through your real form. Check your drafts folder. If the draft is in your voice, turn the Zap on. If it isn't, edit the prompt and try again.

**Catch:** Zapier's free tier caps at 100 tasks a month. If your lead volume is higher, the next tier is $20/mo — making your real cost ~$40/mo. Still cheaper than missing one deal.

**Want screenshots?** [REPLACE: link to your full walkthrough →]

---

## Tool Spotlight: Lindy
**What it is:** A no-code builder for AI assistants that handle email, calendar, and CRM tasks.
**Best for:** Solo founders and small teams drowning in inbound where the same five tasks repeat on every email — read, classify, draft a reply, schedule a call, drop a row in the CRM.
**Pricing:** Free tier (400 credits/mo, ~50 light tasks). Pro $49/mo. Most SMBs end up on Pro within two weeks if they're using it daily.

Lindy's pitch is "an assistant that does things, not just chats." In practice, it's strong at the boring middle layer — the read-classify-draft-schedule-log loop. The flow builder is the cleanest of the AI-assistant tools we've tried this year.

Where it falls down: anything that needs to chain multiple data lookups across more than two systems gets fragile fast. And if you already live in Zapier or Make, you can probably build the same thing in tools you're already paying for — Lindy's edge is the polish, not unique capability.

**Verdict:** Worth the free tier this weekend if email is your bottleneck. Skip if your inbox automation already works.

---

## Prompt of the Week
**Use it for:** Drafting personalized first-touch follow-ups to inbound leads, in your voice.

```
You are drafting a follow-up email from {{your_first_name}}, owner of {{your_business}}.

A new lead just submitted our website form. Here's what we know:
- Name: {{lead_name}}
- Company: {{lead_company}}
- What they wrote: {{lead_message}}

Write a 4-sentence reply that:
1. Acknowledges something specific they said (not generic).
2. Answers the most likely follow-up question they'd have.
3. Suggests a 15-minute call with two specific time options next week.
4. Ends with a one-line P.S. that sounds like a human, not a salesperson.

Keep the tone warm and direct. No exclamation points. No "I hope this email finds you well." No "circling back."
```

**Why it works:** Most AI-drafted emails fail because the prompt is too short — you get a generic template. This one names the persona (you), names the artifact (4-sentence email), and bans the specific phrases that make AI emails feel like AI emails.

**Tweak it:** Change line 1 ("acknowledges something specific they said") to whatever's most distinctive about your sales motion — a pricing question, a portfolio link, a specific concern your industry has.

---

## From the Feed

- **A 4-line prompt that compresses a meeting transcript into action items + decisions + open questions.** [REPLACE: @handle](#) — cleaner than the bloated 40-line versions making the rounds.
- **An n8n template for auto-categorizing every Stripe charge into a P&L line.** [REPLACE: @handle](#) — useful if you're still doing this manually in QuickBooks.
- **The case for *not* using AI for sales calls (yet).** [REPLACE: @handle](#) on why his agency tested three AI notetakers and went back to humans. Honest writeup with numbers — worth the click.
- **A roofer in Ohio who replaced his $1,500/mo bookkeeper with two Claude skills and a Zapier flow.** [REPLACE: link](#) — short Reddit writeup with the actual flow attached.

---

## SMB Win
**Who:** A 12-person dental practice in Phoenix.
**Stack:** Lindy (free tier), Google Calendar, their existing PMS via email-parser bridge.
**Result:** Cut no-show rate from 18% to 7% in six weeks. ~$3,800/mo recovered revenue.

They didn't try to "AI-ify" the whole practice. They picked one painful loop — confirming appointments — and let Lindy run it: pull tomorrow's schedule, send a personalized text, log the response, escalate to the front-desk only if the patient says they need to reschedule.

[REPLACE: link to longer writeup →]

---

## From the Docs
- 🎯 [REPLACE: link] **The 30-minute AI inbox setup** — every step, with screenshots.
- 📋 [REPLACE: link] **Our SMB AI tool stack (updated monthly)** — what we recommend by business type.
- 🛠 [REPLACE: link] **Prompt library for service businesses** — 15 prompts you can paste today.

---

That's the week.

If you set up the inbox flow, hit reply and tell me what your test draft looked like — good or terrible. I read everything.

— [REPLACE: your name]

P.S. If you know an SMB owner who keeps saying "I should do something about my email," forward this. That's the one ask.

---

## Pre-send checklist (delete before sending)

- [ ] Subject + preview tested in your sending tool's inbox preview
- [ ] All `[REPLACE: ...]` placeholders filled in with real links and copy
- [ ] At least one inline link to your docs is present in the body
- [ ] All tweet/post handles in *From the Feed* are real and verified this week
- [ ] The SMB Win is either real (named or honestly anonymized) or labeled as a composite
- [ ] One CTA at the bottom, not three
- [ ] Total word count: 800–1,200
- [ ] Read aloud once for breath; cut anything that ran out of breath
