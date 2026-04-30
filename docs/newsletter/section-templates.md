# Section templates and worked examples

Every issue uses the same skeleton in the same order. This is intentional — readers learn the shape and can scan to the section they want. Departing from the order should be a deliberate editorial choice, not laziness.

## Subject line + preview text

The subject line is the only part of the newsletter most subscribers will see. Treat it as a separate piece of writing, not an afterthought.

**Patterns that work for SMB AI:**

- *The specific outcome* — "Cut your invoice chase-up to zero" / "Replace your weekly reporting with one prompt"
- *The named tool + named outcome* — "Use Claude to draft every estimate this week"
- *The contrarian* — "Stop using ChatGPT for customer email"
- *The number* — "3 prompts that replaced our $400/mo virtual assistant"
- *The week-tagged digest* — "This week: a free CRM that drafts its own follow-ups"

**Patterns that don't work:**

- "🚀 BIG NEWS 🚀" — no information
- "GPT-5 is here" — your reader doesn't care which model
- "The future of AI in small business" — too abstract, sounds like a webinar invite
- "[Newsletter name] #47" — date/issue number subjects get worst opens

**Preview text** is the second line in the inbox. Use it to extend, not echo, the subject. If the subject is the headline, the preview is the deck.

```
Subject:  Replace your weekly reporting with one prompt
Preview:  Plus: a free tool that drafts customer follow-ups, and the
          $19/month CRM Substack writers are switching to.
```

## 1. Cold open — 1 to 2 sentences

The first thing in the body. Sets the theme of the issue, gestures at one or two things below, and gets out of the way. No "Hey {name}!" — that's a sales newsletter tic. Open with a line, not a greeting.

**Example 1 (theme-led):**
> Three different builders shipped variations of the same idea this week — using AI to do the part of sales that nobody likes. So this issue is mostly about that.

**Example 2 (anchor-led):**
> If you only read one thing in here, read the Workflow of the Week. It's a 20-minute setup that's been quietly replacing $1,500/month bookkeepers in roofing companies.

## 2. The Big Story

The single most important AI thing of the week, framed for SMBs. Not a model release recap. Not a press release rewrite. A 150–250 word piece that tells the reader: *here's what changed, here's what it means for you, here's what to do (or not do) about it this week*.

**Template:**
```
## The Big Story
**[One-line, SMB-framed headline.]**

[Sentence 1: what happened, in plain English.]
[Sentence 2: why it actually matters — the second-order effect, not the announcement.]

[Paragraph 2 (2–3 sentences): the SMB-specific implication. Who should care, who shouldn't.]

**What to do this week:** [One concrete action — try it, ignore it, wait, switch from X to Y.]

[Optional: link to the user's deeper guide on the topic.]
```

**Worked example:**
> ## The Big Story
> **Anthropic put a "skills" system into Claude — and it's the cleanest way yet to give an AI your SOPs.**
>
> Anthropic shipped a feature called Skills this week. Strip the marketing, and what it actually is: a folder of instructions, examples, and reference docs that Claude reads when a task matches. Think of it as turning your "how we do invoicing" Notion doc into something the AI actually follows.
>
> If you've been frustrated that ChatGPT keeps giving you generic answers instead of your-specific answers, this is the unlock. The catch: it's a Claude feature only right now, and the setup takes about an hour the first time.
>
> **What to do this week:** Pick one repetitive task you already have a written process for — quoting, onboarding, weekly reports — and turn that doc into a Claude skill. Don't try to skill-ify your whole business yet.
>
> [Full setup guide on our site →]

## 3. Workflow of the Week

The keeper section. A step-by-step a reader can copy in under 30 minutes. Real tools, real prices, real screenshots if you have them. This is the section that gets forwarded.

**Template:**
```
## Workflow of the Week
**Goal:** [One sentence. What the reader will have working at the end.]
**Time:** [X–Y minutes]
**Cost:** [$X/month or "free with limits"]
**Tools:** [Named, with links]

**Why this matters:** [2 sentences. The before/after in human terms.]

**Steps:**
1. [Specific. Names the button to click or the menu to open.]
2. [Specific.]
3. [Specific.]
4. [Specific.]
5. [Specific.]

**Catch:** [The one thing that will trip you up. Always include this.]

**Want to go deeper?** [Link to user's docs.]
```

**Worked example:**
> ## Workflow of the Week
> **Goal:** Auto-draft a personalized follow-up email to every new lead, sitting in your draft folder for you to review.
> **Time:** ~25 minutes
> **Cost:** $20/month (one ChatGPT Plus account is enough)
> **Tools:** Gmail, Zapier (free tier works), ChatGPT
>
> **Why this matters:** Most SMBs lose deals not because the lead wasn't interested but because the follow-up went out three days late and sounded like a template. This puts a personalized first draft in your hands within five minutes of the lead landing.
>
> **Steps:**
> 1. In Zapier, create a new Zap with the trigger "New Email Matching Search in Gmail." Search criteria: `from:noreply@your-form-tool.com`.
> 2. Add a step: "Extract Data" — pull the lead's name, business, and what they wrote in the form notes.
> 3. Add a ChatGPT step. Paste in the prompt template (in the Prompt of the Week section below).
> 4. Add a final Gmail step: "Create Draft." Map the AI's output to the body, the lead's email to To.
> 5. Send yourself a test lead. Check your drafts folder.
>
> **Catch:** Zapier counts every lead as a task. If you get more than 100 leads a month you'll need the $20 Zapier tier — bringing your real cost to $40/mo.
>
> **Want to go deeper?** [Full walkthrough with screenshots →]

## 4. Tool Spotlight

One tool. Reviewed honestly. The reader should finish this section knowing whether to try it tonight or skip it.

**Template:**
```
## Tool Spotlight: [Name]
**What it is:** [One sentence, no buzzwords.]
**Best for:** [Who specifically. "Solo consultants who write a lot of proposals," not "businesses."]
**Pricing:** [Free tier? Real SMB-relevant tier?]

[Paragraph: what it does well, in concrete terms.]

[Paragraph: what it doesn't do, or where it falls down. Always include this — readers trust the section more for it.]

**Verdict:** [One line. "Worth a free trial if X" or "Skip unless you already use Y."]
```

**Worked example:**
> ## Tool Spotlight: Lindy
> **What it is:** A no-code builder for AI assistants that handle email, calendar, and CRM tasks.
> **Best for:** Solo founders and small teams drowning in inbound where the same 5 things need doing on every email.
> **Pricing:** Free tier (400 credits/mo, ~50 light tasks). Pro tier $49/mo. Most SMBs end up on Pro within two weeks.
>
> Lindy's pitch is "an assistant that actually does things, not just chats." In practice it's strong at the boring middle layer — reading an inbound email, classifying it, drafting a reply, scheduling a call, dropping a row in your CRM. The interface for setting up flows is the cleanest of the AI-assistant tools we've tried.
>
> Where it falls down: anything multi-step that involves data lookups across more than two systems gets fragile fast. And if you're already deep in Zapier or Make, you probably don't need it — you can build the same thing in tools you're paying for.
>
> **Verdict:** Worth the free tier this weekend if email is your bottleneck. Skip if you've already automated your inbox.

## 5. Prompt of the Week

One prompt. Copy-pasteable. Plus a short "why it works" so the reader can adapt it to their own business.

**Template:**
```
## Prompt of the Week
**Use it for:** [Specific task]

```
[The actual prompt, in a code block so it's easy to copy.]
```

**Why it works:** [2–3 sentences. What the prompt is doing that a casual prompt wouldn't.]

**Tweak it:** [One concrete thing the reader should change for their business.]
```

## 6. From the Feed

3–5 curated items from the week's social/community scanning. This is the sense of "you don't have to scroll Twitter, I scrolled it for you."

**Template (per item):**
```
- **[One-line takeaway, in your voice.]** [@author] [link to the original]. [One sentence of context: why it's here.]
```

**Worked examples:**
> - **A 4-line prompt that replaces most "executive summarizer" GPTs.** [@swyx](#) shared the version he uses to compress meeting transcripts. Cleaner than the bloated 40-line versions making the rounds.
>
> - **An n8n template for auto-categorizing every Stripe charge into a P&L line.** [@aiautomations](#) — useful if you're still doing this manually in QuickBooks.
>
> - **The case for not using AI for sales calls (yet).** [@operator-name](#) on why his agency tried Pylon, Fathom, and Hunch and went back to humans. Honest writeup with numbers.

## 7. SMB Win

A short case study. 100–150 words. A specific business, a specific tool, a specific result with a number attached. If the user doesn't have a real one this week, they should either pull a public case study (and credit it) or skip the section — never invent one.

**Template:**
```
## SMB Win
**Who:** [Name or anonymized — "a 12-person dental practice in Phoenix"]
**Stack:** [Tools used]
**Result:** [Specific, with numbers]

[2–3 sentences of how they did it.]

[Optional: link to a longer writeup on the user's site.]
```

If using a composite, label it: "*Composite based on three businesses we worked with.*"

## 8. From the Docs

A simple link block to 3–4 of the user's website resources. Pick guides relevant to this week's topics — don't just dump a static link list.

**Template:**
```
## From the Docs
- 🎯 [Specific guide title] — *one-line description*
- 📋 [Specific guide title] — *one-line description*
- 🛠 [Specific guide title] — *one-line description*
```

(Emoji optional and only one per line.)

## 9. Sign-off + CTA

Short. One CTA, not five.

**Template:**
```
That's the week.

If you tried [the workflow / the tool / the prompt], hit reply and tell me how it went. I read every reply.

— [Name]

P.S. [Optional: one-line tease of next week, or one ask — "forward this to the SMB owner who keeps complaining about email."]
```

## On length

The whole issue should be 800–1,200 words. If you're going long, it's almost always the Big Story or the Workflow of the Week that's bloated. Cut adjectives, cut throat-clearing, cut anything the reader could skip without losing the point.

A reliable cut: read your draft and ask, "if I deleted this sentence, would the reader miss it?" If no, delete it.
