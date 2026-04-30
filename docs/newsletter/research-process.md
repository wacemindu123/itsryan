# Research process — finding what goes in this week's issue

Most AI newsletters fail at the research stage, not the writing stage. The writing is downstream of the input. If you scan the wrong sources you'll produce the wrong newsletter — model-release recaps for an audience that doesn't run models. This document is the sourcing playbook.

The job each week is to come back from research with **roughly 8–12 candidate items**, then cut to the 5–7 that actually make it into the issue after the SMB filter. Going wider than 12 wastes time; going narrower than 8 means you'll publish whatever you found instead of the best of what you found.

## Where to look (in priority order)

### Tier 1 — the highest-signal sources for SMB workflow content

**X / Twitter "AI builder" cohort.** This is the single richest vein for practical workflow content because builders post their actual prompts, screenshots, and Loom walkthroughs publicly. Maintain a private list and check it daily, not weekly — good threads get buried fast. Accounts to monitor (representative, not exhaustive — refresh quarterly):

- *Solo builders shipping AI products for SMBs:* people who post n8n / Zapier / Make automation walkthroughs, GPT prompt libraries, and SMB-niche tools. Look for accounts with 5–50K followers — too small and they're unverified, too big and the content gets watered down for general audiences.
- *Agency operators:* people running AI-implementation agencies for plumbers, dentists, real estate, etc. They post the actual workflows their clients pay for.
- *Indie hackers / Build-in-public:* their tools are often priced for SMBs.

What to grab: a screenshot of the workflow, the builder's handle for attribution, and the original tweet URL. You will need all three.

**Reddit, specifically r/smallbusiness, r/Entrepreneur, r/marketing, r/automation, r/n8n, r/Notion, r/ChatGPTPro.** Look for posts in the format "I used X to do Y and saved Z hours." These are gold because the OP is usually an SMB owner, not a builder — which means the writeup is already in your reader's voice. The comments are often more useful than the post.

**LinkedIn — but only specific creators.** LinkedIn's algorithm rewards hot takes, so most AI content there is noise. Useful exception: operators (heads of ops, COOs, founders) at SMBs and mid-market companies posting before/after walkthroughs of internal AI tools. Build a small list of 15–25 of these people. Ignore the rest of LinkedIn.

### Tier 2 — useful for The Big Story and Tool Spotlight

**Product Hunt.** Daily front page. Filter for tools that (a) have a real free tier or trial, and (b) describe a use case in plain English. Skip anything pitched as "AI for AI" or "an LLM-powered orchestration layer."

**Hacker News.** Check Show HN and the front page weekly. Most submissions are too technical for SMB readers, but every few weeks something genuinely SMB-relevant surfaces. The HN comments are the second-best fact-check resource on the internet (after the underlying primary source).

**Newsletters that share your audience adjacent.** Skim — don't copy — Ben's Bites, The Neuron, TLDR AI, Superhuman, Mindstream. You're checking what's already saturated so you don't lead with the same story they all led with.

### Tier 3 — for depth, not breadth

**Podcasts.** Lenny's Podcast, How I AI, the All-In niche AI episodes. Useful when you want a long-form quote or framing for an opinion piece, not for weekly news. One episode a week is enough.

**YouTube.** Channel-by-channel. The "AI tutorial" YouTubers (the ones doing screen recordings of n8n flows, GPT custom-action setups, Zapier-with-OpenAI walkthroughs) are a strong source for the Workflow of the Week.

**Vendor changelogs.** The big ones — OpenAI, Anthropic, Google, Microsoft, Zapier, Make, n8n, HubSpot, Notion — but only when the changelog item has a clear SMB use case. Most don't.

## The weekly research ritual

Don't try to do this in one sitting. Spread it across the week so good content has time to surface and the issue benefits from a few days of distance.

| Day | What to do | Time |
|---|---|---|
| Mon | Refresh the X list. Skim the weekend's posts. Capture 5–10 candidates in a running notes doc. | 20 min |
| Tue | Reddit + LinkedIn pass. Look for SMB owner writeups specifically. | 20 min |
| Wed | Product Hunt + Hacker News. Identify the Tool Spotlight candidate and the Big Story. | 20 min |
| Thu | Verification day. For every candidate, find the primary source and confirm the claim. | 30 min |
| Fri | Draft the issue, then cut. | 90 min |

Adjust to your sending day. The point is verification gets its own slot and isn't crammed in the day-of.

## How to capture a candidate

For every candidate item you find, write down all six fields. If you can't fill them in, the item isn't ready.

```
1. One-line headline (in SMB voice, not builder voice)
2. Source URL (the original — not a screenshot, not an aggregator)
3. Original author / handle for attribution
4. The SMB filter answers: Who-for / Cost / Replaces / Catch
5. Closest doc on your site (for the link)
6. Why-it's-interesting in one sentence (this becomes the lead in the section)
```

If you can't write the sentence in #6 without being vague, the item is probably not interesting enough.

## Verifying claims before they go in

The most common newsletter failure mode is repeating a tweet's hype as if it were fact. The fix is a short verification routine:

1. **Find the primary source.** A vendor blog post, a real case study, the actual product page, the actual GitHub repo. If the only source is a tweet, the item gets attributed to the tweeter, not asserted as fact ("Builder @x claims ..." rather than "The tool does ...").
2. **Spot-check the numbers.** "Increased revenue 400%" or "saved 50 hours a week" claims need a primary source or they get softened or cut. Specifically: cut numbers unless you can link to where they came from.
3. **Try the tool, even briefly.** For any Tool Spotlight, sign up for the free tier. You don't need to become a power user, but you need to have seen the actual UI. Readers can feel when a tool was reviewed without being touched.
4. **Read the pricing page.** Always. AI tool pricing changes constantly and is full of asterisks (per-seat minimums, usage-based add-ons, "Contact us" enterprise tiers). Get the actual SMB-relevant price.

## Converting a builder thread into an SMB workflow

This is the hardest skill — and where the newsletter earns its money. A builder posts a clever workflow on X. Before it's useful to your reader, it needs to be re-framed.

Builder voice (don't use this):
> "Just shipped a slick agentic loop using OpenAI's responses API + tool calls + a Pinecone vector store to auto-tag inbound leads from our HubSpot webhook. 0.3s p50 latency 🚀"

SMB voice (do use this):
> "Want every new lead in your CRM auto-tagged by industry, deal size, and likelihood to close — without you reading each form? Here's a 25-minute setup using HubSpot + a free OpenAI account. Total cost: about $5 a month at typical small-business volume."

The translation moves: replace the tool soup with one named outcome, replace "agentic loop" with "set it up once and it runs," replace latency claims with cost-per-month, and replace "shipped" with "set up."

If you can't make that translation cleanly, the workflow probably isn't ready for SMBs yet. That's fine — note it for a future issue.

## A note on AI-generated research

It's tempting to ask an LLM "what are the top AI tools for small businesses this week" and use the answer. **Don't.** Models hallucinate tool names, conflate features, and don't know what shipped this week. Use models for *summarizing sources you've already found and verified*, not for finding sources. Research is the human-in-the-loop part of this skill.
