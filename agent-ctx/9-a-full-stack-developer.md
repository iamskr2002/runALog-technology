# Task 9-a — full-stack-developer

Task: Dedicated `/work` page + "View All Work" button (refactor project card into shared modules, 8 concept projects)
Status: ✅ Completed & verified

## Files created
- `src/lib/work-data.ts` — `ProjectVisualKind` + `ConceptProject` types; `conceptProjects` (8 items). Original 4 first, content-identical to the previous `work.tsx` data. 4 new concept projects (ClinicFlow — Appointment Platform / dashboard, ShopLocal Storefront / ecommerce, InvoiceFlow Automation / workflow, GrowthLens Campaign Console / campaign). All "Concept:"-framed, no fabricated metrics.
- `src/components/site/project-card.tsx` — "use client". BrowserFrame + 4 mockup visuals + `ProjectVisual` switch moved verbatim from `work.tsx`; exports `ProjectCard({ project, index })` (Reveal delay = index*80, same stagger as before; card + details Dialog copied as-is).
- `src/app/work/page.tsx` — server component. Metadata (absolute title "Our Work — RunA Log Technologies", description/openGraph honesty-framed, canonical `/work`); shell copied from `page.tsx` (noscript reveal fallback, Navbar, `main#main flex-1`, Footer `mt-auto`). Navy-950 hero band with teal radial glow + dot grid, "OUR WORK" pill, h1 with teal-highlighted "think", honest description, Check trust row. Grid of all 8 ProjectCards (`md:grid-cols-2 lg:grid-cols-3 gap-5`, `py-16 md:py-24`, `max-w-7xl` container). Navy-900 CTA band "Your project could be next." + "Start a Project" → `/#contact` + ghost "Explore Services" → `/#services` (next/link).

## Files modified
- `src/components/site/work.tsx` — imports ProjectCard/conceptProjects; moved code deleted; section #work, SectionHeading, grid, 4 original cards and md:col-span-2 CTA banner unchanged. Added centered Reveal row below grid: outline Button (size lg, `h-11 px-7`, `hover:border-navy-950 hover:bg-navy-950 hover:text-white`) "View All Work" + ArrowRight via `next/link` → `/work`, plus muted microcopy line.
- `src/lib/site-config.ts` — navItems "Our Work" → `/work` (only change).
- `src/components/site/footer.tsx` — companyLinks "Our Work" → `/work` (only change).
- `src/app/sitemap.ts` — added `/work` URL (monthly, priority 0.8, same pattern as service pages).

## Key decisions
- Shared data/types in `src/lib/work-data.ts` so homepage + /work render from one source; new projects reuse ONLY existing visual kinds.
- `ProjectCard` owns its Reveal (delay from `index` prop) → identical DOM to the previous inline map; grid children remain the Reveal divs.
- `/work` metadata uses `title: { absolute: ... }` because root layout template is `"%s | RunA Log Technologies"` — a plain string would have produced a duplicated company name.
- Outline "View All Work" hover styled brand-navy (`hover:bg-navy-950 hover:text-white`), `h-11` for ≥44px touch target; buttons on the /work CTA band follow hero conventions (primary + ghost-with-white-text on navy).
- Untouched per constraints: services.tsx, contact.tsx, hero*, navbar.tsx, admin/**, api/**, prisma/**.

## Verification
- `bun run lint` → 0 errors.
- `bunx tsc --noEmit` → 0 errors in touched files (remaining output is pre-existing: examples/, skills/, api/admin/activities, reveal.tsx).
- `GET /work` → 200; `GET /` → 200; `/sitemap.xml` contains `/work`.
- curl content checks: homepage shows "View All Work" + microcopy + 4 original projects; /work renders hero, all 8 projects, CTA band, correct `<title>`.
- dev.log: clean compile, `GET /work 200`, no errors/warnings.

## Notes for next agents
- To add more concept projects, append to `conceptProjects` in `src/lib/work-data.ts` (visual must be one of dashboard|ecommerce|workflow|campaign; context must start with "Concept:").
- Navbar "Our Work" now navigates to `/work`; homepage section `#work` still exists for in-page anchors (footer/hero links).
