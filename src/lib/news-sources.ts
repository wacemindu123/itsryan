// Curated source list for the daily AI newsletter.
// Keep this list founder-relevant: practical AI, builder tools, product news.
// Avoid: academic-only, funding gossip, enterprise-only launches.

export interface RssSource {
  name: string;
  url: string;
  weight: number; // 0-1, used in ranking
  tier: 1 | 2 | 3;
}

export const RSS_SOURCES: RssSource[] = [
  // Tier 1 — high signal, founder-relevant
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', weight: 1.0, tier: 1 },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/news/rss.xml', weight: 1.0, tier: 1 },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', weight: 0.9, tier: 1 },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', weight: 0.8, tier: 1 },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', weight: 1.0, tier: 1 },
  { name: 'Ethan Mollick - One Useful Thing', url: 'https://www.oneusefulthing.org/feed', weight: 1.0, tier: 1 },

  // Tier 2 — solid, mix of product news + practical takes
  { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', weight: 0.7, tier: 2 },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', weight: 0.7, tier: 2 },
  { name: 'Ars Technica AI', url: 'https://arstechnica.com/ai/feed/', weight: 0.7, tier: 2 },
  { name: 'Stratechery (Ben Thompson)', url: 'https://stratechery.com/feed/', weight: 0.8, tier: 2 },
  { name: 'Every', url: 'https://every.to/feed.xml', weight: 0.7, tier: 2 },

  // Tier 3 — broader tech, light weight
  { name: 'Hacker News Frontpage', url: 'https://hnrss.org/frontpage?points=150&count=30', weight: 0.6, tier: 3 },
];

// Reddit: JSON API, no key. We'll fetch top posts of the past week.
export const REDDIT_SUBREDDITS: { name: string; weight: number }[] = [
  { name: 'artificial', weight: 0.9 },
  { name: 'LocalLLaMA', weight: 0.9 },
  { name: 'singularity', weight: 0.6 },
  { name: 'ChatGPT', weight: 0.7 },
  { name: 'OpenAI', weight: 0.8 },
];

// Keyword list used for soft filtering of HN + Reddit items.
export const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'llm', 'gpt', 'claude', 'gemini',
  'anthropic', 'openai', 'mistral', 'llama', 'agent', 'agents',
  'copilot', 'chatbot', 'prompt', 'embedding', 'rag', 'fine-tune',
  'model', 'transformer', 'diffusion', 'voice clone', 'deepfake',
  'automation', 'workflow', 'generative',
];

// Domains we deprioritize (pure funding news, paywalls that block Jina).
export const DOMAIN_PENALTIES: Record<string, number> = {
  'bloomberg.com': -0.3,
  'wsj.com': -0.3,
  'ft.com': -0.3,
  'theinformation.com': -0.3,
};
