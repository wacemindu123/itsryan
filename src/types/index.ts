// ── Database entity types ────────────────────────────────────────────
// Single source of truth — imported by admin pages, public pages, and API routes.

export interface HowtoGuide {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  category: string;
  google_doc_url: string | null;
  prompt_content: string | null;
  preview_image_url: string | null;
  price: number;
  energy: number;
  related_ids: number[];
  status: string;
  tiktok_url: string | null;
  display_order: number;
  featured: boolean;
  created_at: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export interface Submission {
  id: number;
  name: string;
  website: string | null;
  email: string;
  phone: string;
  business: string;
  scaling_challenge: string;
  created_at: string;
  contacted: boolean;
  contacted_at: string | null;
}

export interface SubmissionEnriched extends Submission {
  themes: string[];
  is_warm: boolean;
}

export interface ClassSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  business: string | null;
  format: string;
  experience: string;
  created_at: string;
  contacted: boolean;
}

export interface Prompt {
  id: number;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  content: string;
}

export interface Business {
  id: number;
  name: string;
  thumbnail: string | null;
  website_url: string | null;
  description: string | null;
  value_delivered: number;
  revenue_generated: number;
  color: string;
  video_links: string[];
  github_links: string[];
  additional_links: string[];
  featured: boolean;
  display_order: number;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  phone: string | null;
  name: string | null;
  subscribed: boolean;
  created_at: string;
}

export interface NewsletterDraft {
  id: number;
  subject: string;
  content: string;
  sms_content: string | null;
  status: string;
  approved_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  status: string;
  demo_url: string | null;
  video_url: string | null;
  tags: string[];
  featured: boolean;
  display_order: number;
}

export interface ProjectWaitlistEntry {
  id: number;
  project_id: number;
  email: string;
  phone: string | null;
  created_at: string;
  projects: { name: string } | null;
}
