# Next.js + Tailwind Migration Plan

Migrate the current static HTML/CSS/JS site to Next.js 14 with Tailwind CSS for improved performance, developer experience, and modern tooling.

---

## Current State Analysis

| Asset | Size | Description |
|-------|------|-------------|
| `index.html` | 304 lines | Main landing page |
| `admin.html` | 246 lines | Admin dashboard with Clerk auth |
| `css/styles.css` | 870 lines | Custom CSS |
| `css/admin.css` | ~400 lines | Admin styles |
| `js/main.js` | 138 lines | Form handling, modals, scroll animations |
| `js/prompts.js` | ~165 lines | Prompt library functionality |
| `js/admin.js` | ~484 lines | Admin CRUD operations |
| `api/*.js` | 9 files | Vercel serverless functions (already compatible) |

**Integrations:** Supabase, Clerk, Calendly, Microsoft Clarity

---

## Recommendation: **Proceed with Migration**

### Why migrate:
- **Performance**: Next.js provides automatic code splitting, image optimization, and static generation
- **Developer Experience**: Hot reload, TypeScript support, component-based architecture
- **Tailwind**: Faster styling, smaller CSS bundles, design consistency
- **Future-proof**: Easier to add features like blog, dynamic pages, SEO improvements
- **API Routes**: Your existing `/api` functions work unchanged in Next.js

### Why you might wait:
- Current site is simple and works well
- Migration takes 4-6 hours of development time
- Learning curve if unfamiliar with React/Next.js

---

## Migration Steps

### Phase 1: Project Setup (~30 min)
- [ ] Create new Next.js 14 project with App Router
- [ ] Configure Tailwind CSS
- [ ] Set up project structure
- [ ] Configure environment variables
- [ ] Move existing `/api` folder (works as-is)

### Phase 2: Convert Pages (~2 hours)
- [ ] Create reusable components (Header, Footer, Button, Card, Modal)
- [ ] Convert `index.html` → `app/page.tsx`
- [ ] Convert `admin.html` → `app/admin/page.tsx`
- [ ] Migrate CSS to Tailwind utility classes
- [ ] Preserve all animations and interactions

### Phase 3: Integrate Services (~1 hour)
- [ ] Set up Clerk with `@clerk/nextjs`
- [ ] Configure Supabase client
- [ ] Add Microsoft Clarity script
- [ ] Add Calendly widget

### Phase 4: Testing & Deployment (~1 hour)
- [ ] Test all forms and API endpoints
- [ ] Test Clerk authentication flow
- [ ] Verify mobile responsiveness
- [ ] Deploy to Vercel
- [ ] Verify custom domain works

---

## New Project Structure

```
/app
  /page.tsx              # Home page
  /admin/page.tsx        # Admin dashboard (protected)
  /layout.tsx            # Root layout with Clerk provider
  /globals.css           # Tailwind imports
/components
  /ui                    # Reusable UI components
    /Button.tsx
    /Card.tsx
    /Modal.tsx
  /Header.tsx
  /Footer.tsx
  /HeroSection.tsx
  /CapabilitiesGrid.tsx
  /PromptLibrary.tsx
  /ContactForm.tsx
  /ClassSignupForm.tsx
/lib
  /supabase.ts           # Supabase client
/api                     # Existing API routes (unchanged)
```

---

## Tech Stack After Migration

| Category | Current | After Migration |
|----------|---------|-----------------|
| Framework | Static HTML | Next.js 14 (App Router) |
| Styling | Custom CSS | Tailwind CSS |
| Language | JavaScript | TypeScript |
| Auth | Clerk (vanilla JS) | @clerk/nextjs |
| Database | Supabase | Supabase (unchanged) |
| Hosting | Vercel | Vercel (unchanged) |
| Analytics | Microsoft Clarity | Microsoft Clarity (unchanged) |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Keep old site as backup branch |
| Clerk integration issues | Use official @clerk/nextjs package |
| API routes breaking | API folder structure is compatible |
| SEO changes | Preserve meta tags and structure |

---

## Decision Required

**Do you want to proceed with the migration?**

If yes, I'll start with Phase 1 and create the new Next.js project alongside your existing code, allowing you to compare and test before switching over.
