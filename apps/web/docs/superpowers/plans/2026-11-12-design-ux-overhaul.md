# Design & UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dramatically improve visual design, interactiveness, and smoothness across all 4 public-facing pages — landing (`/`), properties (`/properties`), property detail (`/properties/[slug]`), and admin (`/admin`) — with a cinematic building that looks architecturally believable and a user flow that feels like a natural journey.

**Architecture:** Each task is a self-contained file edit with no dependencies between tasks except T1 (design tokens) which must land first; T2–T5 can then run in parallel. The persistent `<Canvas>` is never unmounted. All HTML overlays ride on top via `z-index`, never inside WebGL.

**Tech Stack:** Next.js 15 App Router, React 18, Three.js / @react-three/fiber / @react-three/drei, GSAP + ScrollTrigger, Lenis, Zustand, Tailwind CSS, TypeScript strict, Framer Motion (`motion`)

**Spec:** This document is its own spec. Visual direction: cinematic luxury hospitality (dark-first, glassmorphism, gold accent `#DFBB6B`, Inter / Playfair Display pairing, `power3.inOut` easing, reduced motion compliant).

## Global Constraints

- Never unmount `<Canvas>` — camera state persists across route changes
- Body text, forms, calendars — real DOM, not WebGL
- All motion: `prefers-reduced-motion` respected (`useReducedMotion`)
- Tailwind only for style — no inline `style={{}}` except for GSAP targets or Three.js computed values
- TypeScript strict — no `any` without comment
- Minimum touch target 44×44px
- WCAG AA contrast (4.5:1 body, 3:1 large text)
- Brand gold: `#DFBB6B` (CSS var `--brand-gold`)
- Fonts: `Playfair Display` (headings), `Inter` (body/UI) — both via `next/font/google`

## Review Focus

1. **Scroll at max speed on mobile** — GSAP `scrub` must still produce smooth chapter transitions; test at `scrollPercent` boundaries ±1%.
2. **Property card `<img>` CORS from Cloudinary** — verify `crossOrigin="anonymous"` doesn't break lazy loading fallback.
3. **Camera flights during filter change** — `flyTo` must be interruptible; calling `flyTo` while another is in progress must not snap.
4. **Booking modal on 1024px viewport** — two-column layout must not overflow `max-h-[90vh]`; inner scroll must work on iOS Safari.
5. **Admin image upload on slow connection** — upload spinner must be visible and the form must not submit before `imageUrl` resolves.

---

## Task 1: Typography & Token Upgrade (foundation — land first)

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/tailwind.config.ts`

**Interfaces:**
- Produces: `--font-heading`, `--font-body` CSS vars; Tailwind `font-heading` / `font-body` utilities; refined `--glass-bg`, `--glass-border`, `--brand-gold` tokens; `shadow-luxury`, `shadow-glow-lg` Tailwind utilities.

- [ ] **Step 1:** In `layout.tsx`, import and load `Playfair_Display` (weights 400, 700, 900, italic) and `Inter` (variable) from `next/font/google`. Assign their `variable` CSS class strings. Add both class strings to `<html>` alongside existing `font-sans`.

- [ ] **Step 2:** In `globals.css`, under `:root` add:
  ```css
  --font-heading: var(--font-playfair);
  --font-body: var(--font-inter);
  --brand-gold: #DFBB6B;
  --brand-gold-muted: rgba(223, 187, 107, 0.15);
  --glass-bg-light: rgba(255,255,255,0.78);
  --glass-bg-dark: rgba(10,14,23,0.68);
  --glass-border-light: rgba(0,0,0,0.10);
  --glass-border-dark: rgba(255,255,255,0.12);
  ```
  Under `.dark`: override `--glass-bg` and `--glass-border` to dark variants.

- [ ] **Step 3:** In `tailwind.config.ts`, extend `fontFamily` to add `heading: ['var(--font-playfair)', 'Georgia', 'serif']` and `body: ['var(--font-inter)', 'system-ui', 'sans-serif']`. Add to `boxShadow`: `'luxury': '0 25px 60px -10px rgba(0,0,0,0.45)', 'glow-lg': '0 0 40px rgba(223,187,107,0.25)'`.

- [ ] **Step 4:** Verify TypeScript passes: `pnpm --filter web exec tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 5:** Commit `git commit -m "feat: playfair+inter typography & refined CSS design tokens"`.

---

## Task 2: Cinematic Landing Building (LandingScene.tsx)

**Files:**
- Modify: `apps/web/src/components/3d/scenes/LandingScene.tsx`
- Modify: `apps/web/src/lib/3d/curves.ts`
- Modify: `apps/web/src/components/3d/AppCanvas.tsx` (lighting upgrade only)

**Interfaces:**
- Consumes: `useThemeStore` (isDark)
- Produces: visually richer, architecturally believable 3-storey villa with realistic proportions; camera curves tuned for the new geometry.

### Design decisions (spec-locked):
- **Ground floor** (Y 0–3.6): 18m wide, 14m deep concrete-and-glass pavilion. Left 40% = infinity pool terrace with water material shimmer. Right 60% = internal salon visible through full-height glass. Rear wall is fair-faced concrete with shadow lines (boxGeometry stacked). Roof line is flat with thin overhang slab.
- **Level 2** (Y 3.6–7.2): narrower white-render volume (14m × 10m) set back from ground floor front by 1.5m, creating a cantilever shadow. Full-width glass balcony rail at front.
- **Level 3 / Rooftop** (Y 7.2–9.4): open timber pergola 10m × 8m, 4 posts each corner, horizontal louvers, fire pit glow.
- **Realistic materials**: use `roughness` 0.65–0.8 for concrete, 0.05–0.15 + `metalness` 0.9 for glass, `roughness` 0.75 for timber. Add a subtle `envMapIntensity` where possible.
- **Landscape**: dark basalt ground plane (120×120). Two mature tree silhouettes (tapered cylinder stacks) flanking the driveway at ±9m x. Low horizontal planting beds.
- **Driveway**: pale stone pavers 2×0.6m in a 2-lane arrangement from camera approach.
- **Night pool**: animated shimmer via `<meshStandardMaterial>` with time-driven emissiveIntensity using `useFrame` — keep it subtle (0.1–0.3 range).
- **Lighting**: 3 area lights (not point lights) for realistic soft shadows — one above pool, one interior salon, one rooftop. Keep existing pointLights for accent glow. Add `<ambientLight intensity={0.15}>` to base.

- [ ] **Step 1:** In `LandingScene.tsx`, split building into 5 named sub-groups: `<GroundPavilion>`, `<Pool>`, `<Level2Suite>`, `<RooftopPergola>`, `<Landscape>` — each as a local function component returning `<group>`. Move all existing JSX into these functions. Confirm the scene renders identically before making geometry changes.

- [ ] **Step 2:** Rework `<GroundPavilion>` with the spec geometry above. Key changes:
  - Rear concrete wall: 3 stacked horizontal shadow bands (0.05m gap = shadow lines visible from outside).
  - Side walls: fair-faced concrete with subtle horizontal texture via `roughness 0.72`.
  - Glass facade: split into 4 sliding door panels (each 3m wide) with thin aluminium frame strips between them.
  - Ceiling soffit: 0.15m slab underside visible from outside approach angle.
  - Interior floor: polished concrete, `metalness 0.4, roughness 0.3`.

- [ ] **Step 3:** Rework `<Pool>` with animated shimmer:
  ```tsx
  // Inside Pool component, add useFrame:
  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.emissiveIntensity = 0.08 + Math.sin(clock.elapsedTime * 0.8) * 0.06;
    }
  });
  // Water material: add emissive={poolGlow}, emissiveIntensity=0.1
  ```
  Pool deck: add 6 sunlounger silhouettes (flatbox + backrest box) in a row along pool edge.

- [ ] **Step 4:** Rework `<Level2Suite>` — set back 1.5m from ground floor front, add balcony overhang casting shadow, correct proportions (14m×10m×3.6m).

- [ ] **Step 5:** Rework `<RooftopPergola>` — 4 corner posts (not 2×2 grid), 11 louvers, outdoor sofa group, correct Y base at 7.2.

- [ ] **Step 6:** Add `<Landscape>` — driveway pavers (2 lanes, 8 pavers each), 2 tree silhouettes at x=±9, 3 planting beds along building edge.

- [ ] **Step 7:** Upgrade `AppCanvas.tsx` lighting — replace any `directionalLight` with `<directionalLight castShadow shadow-mapSize={[2048,2048]}>`. Add `<ambientLight intensity={isDark ? 0.12 : 0.35}>`.

- [ ] **Step 8:** Tune `curves.ts` — adjust `POSITION_POINTS` so the camera approach is 2m lower (Y from 3.2→1.8) and 20% further back (Z from 16→20), making the full villa height visible on arrival. Adjust lookat to center on the glass facade at Y=1.8.

- [ ] **Step 9:** Visually verify at `http://localhost:3000` — scroll from 0% to 100% and confirm all 5 chapters show believable architectural geometry.

- [ ] **Step 10:** Commit `git commit -m "feat: cinematic villa geometry overhaul with animated pool shimmer"`.

---

## Task 3: Landing Page Overlay UX (ScrollJourneyOverlay.tsx)

**Files:**
- Modify: `apps/web/src/components/landing/ScrollJourneyOverlay.tsx`
- Create: `apps/web/src/components/landing/ChapterCard.tsx`
- Create: `apps/web/src/components/landing/ScrollHint.tsx`

**Interfaces:**
- Consumes: `LANDING_CHAPTERS` from `curves.ts`, `useCameraStore`, Lenis, GSAP
- Produces: animated chapter card with Playfair heading, stagger-revealed body text, scroll-progress bar, animated scroll hint, final CTA with entrance animation.

### Design decisions:
- Chapter card: bottom-left anchored, max-width 520px, glass panel with `backdrop-blur-2xl`, thin gold left border `border-l-2 border-brand-gold`. Title in `font-heading` italic bold, 48–64px, uppercase tracking.
- Chapter transitions: on chapter change, animate card out (translateY +20px, opacity 0, 180ms) then new card in (translateY from -20px, opacity 1, 280ms) using `motion` from `framer-motion`.
- Scroll progress bar: thin 1px line at very bottom of viewport, fills left-to-right in gold.
- Scroll hint: animated dual chevron `⌄` at bottom-center, fades out after user scrolls 10%.
- Final chapter CTA: two buttons — primary "Explore Residences →" (gold, pill) + secondary "Concierge Chat" (ghost glass pill linking to WhatsApp).
- Top HUD: minimal — logo left, chapter dots right (5 dots, active = gold filled, rest = glass outlined). No percentage readout (removes feel of "debugging").

- [ ] **Step 1:** Create `ChapterCard.tsx` — accepts `chapter: LandingChapter`, `isVisible: boolean`. Uses `<AnimatePresence>` and `<motion.div>` with `initial={{ opacity:0, y:20 }}`, `animate={{ opacity:1, y:0 }}`, `exit={{ opacity:0, y:-16 }}`, transition `duration:0.32, ease:[0.16,1,0.3,1]`. Title rendered in `font-heading italic`, subtitle in `font-body` size 15px leading relaxed.

- [ ] **Step 2:** Create `ScrollHint.tsx` — renders a bouncing double-chevron SVG, `<motion.div>` with `animate={{ opacity: scrollPercent > 8 ? 0 : 1 }}` transition `duration:0.5`. Fixed bottom-center, z-30.

- [ ] **Step 3:** Rewrite `ScrollJourneyOverlay.tsx`:
  - Import `ChapterCard`, `ScrollHint`, `AnimatePresence`.
  - Bottom-left anchored fixed HUD div for the chapter card.
  - Top HUD: brand mark left (12px uppercase tracking), chapter dots right.
  - Bottom: 1px progress bar `<div style={{ width: `${scrollPercent}%` }} className="h-px bg-brand-gold fixed bottom-0 left-0 z-50 transition-none" />`.
  - Remove old `border-b/t` rows and percentage readout.

- [ ] **Step 4:** Lenis duration increase to `1.6` and add `lerp: 0.07` for heavier, more cinematic scroll damping.

- [ ] **Step 5:** Visual check at `http://localhost:3000` — chapter cards animate cleanly, scroll hint fades at 8%, progress bar fills.

- [ ] **Step 6:** Commit `git commit -m "feat: cinematic scroll overlay with animated chapter cards and progress bar"`.

---

## Task 4: Properties Page Design Overhaul (/properties)

**Files:**
- Modify: `apps/web/src/app/properties/page.tsx`

**Interfaces:**
- Consumes: `Property[]` from API, `useCameraStore.flyTo`
- Produces: masonry-style responsive grid, richer cards with multi-image preview hint, animated filter bar with stagger, skeleton loaders.

### Design decisions:
- **Hero header**: large `font-heading` italic `"Our Estates"` with a thin gold underline SVG, subtitle line, then filter bar inline below.
- **Property cards**: taller 16/9 hero (not 16/10). On hover: image zooms 1.06×, card lifts with `translateY(-4px) shadow-luxury`. Bottom strip shows price in `font-heading` size 22px, then specs row, then "Enter 3D →" pill button that grows with scale(1.03) on hover.
- **Room preview dots**: small dots below the image (count = number of sections). Active dot = gold, rest = white/30. Hovering dot switches preview image with a 300ms crossfade.
- **Filter bar**: pill-shaped glassmorphism bar. Each filter control is a tappable pill (not a `<select>`). Bedrooms: 1 2 3 4 5+ pills. Guests: same. Price: single slider below the pill row. Active filter pill = gold filled.
- **Skeleton loaders**: while loading, show 6 card skeleton placeholders with `animate-pulse` shimmer.
- **Empty state**: animated SVG illustration (simple wireframe house outline drawn with GSAP stroke animation) + "No matches — try adjusting filters".
- **Stagger entrance**: on mount, cards stagger in with `motion` `staggerChildren: 0.07`, each `initial={{ opacity:0, y:28 }}`, `animate={{ opacity:1, y:0 }}`.

- [ ] **Step 1:** Add skeleton loader — `function PropertyCardSkeleton()` returns a glass card with pulsing grey boxes for image, title, specs, price. Render 6 when `loading === true`.

- [ ] **Step 2:** Rework filter bar to pill-based controls. Bedrooms filter: array `[0,1,2,3,4,5]`, map to `<button>` pills; active = `bg-brand-gold text-black`. Max-price slider keep but style with wider track and gold thumb.

- [ ] **Step 3:** Add `hoveredSection` state per card (`Record<string, number>`). Image container renders `<img>` for `sections[hoveredSection[p.id] ?? 0]?.imageUrl`. Dots below image: `sections.slice(0,5).map((s,i) => <button onClick(e => { e.stopPropagation(); setHoveredSection(id, i) }))`. Transition between images with CSS `transition-opacity duration-300`.

- [ ] **Step 4:** Rework card layout — 16/9 image, card body padding `p-5`, title `font-heading text-xl`, price `font-heading text-2xl text-brand-gold`, specs row unchanged but `gap-4`. CTA button: rounded-full, tracks group-hover state.

- [ ] **Step 5:** Wrap card grid in `<motion.div variants={container}>` with `staggerChildren`. Each card in `<motion.div variants={item}>` with `viewport={{ once: true, margin: "-50px" }}`.

- [ ] **Step 6:** Add `font-heading` to page `<h1>` and hero subtitle in `font-body`.

- [ ] **Step 7:** `pnpm --filter web exec tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 8:** Commit `git commit -m "feat: properties page masonry cards, pill filters, section preview dots, skeleton loaders"`.

---

## Task 5: Property Detail Page UX (/properties/[slug])

**Files:**
- Modify: `apps/web/src/app/properties/[slug]/page.tsx`
- Modify: `apps/web/src/components/ui/SectionRail.tsx`
- Modify: `apps/web/src/components/booking/BookingModal.tsx`

**Interfaces:**
- Consumes: `Property`, `usePropertyViewStore`, `useCameraStore`
- Produces: polished info HUD bottom-left, animated section rail, sticky "Reserve" button, booking modal layout improvements.

### Design decisions:
- **Info HUD** (bottom-left of viewport, fixed, `z-30`): compact glass card, max-width 380px. Shows property title in `font-heading italic`, location with pin icon, bedrooms/baths/guests specs row, price `font-heading bold text-2xl gold`, then "Reserve" button (gold, full-width pill) and secondary "WhatsApp" button (ghost glass). Card reveals with `motion` on `showDetails` toggle.
- **Top-left back button**: `← All Residences` pill button that triggers `useCameraStore.flyTo` back to gallery mode + `router.push('/properties')`.
- **Section rail**: horizontal scrollable pill row, centered at bottom, each pill shows room icon + name. Active pill = gold background, smooth `scrollIntoView` on change.
- **Booking modal improvements**: on desktop ≥1024px, two-column (`max-w-5xl`). Left column calendar, right column booking form. Max-height `92vh`, `overflow-y-auto` on both columns independently.
- **Room transition indicator**: while camera is flying between sections, show a brief centered pill `"Travelling to [Room Name]..."` with a progress line.

- [ ] **Step 1:** Add `showDetails` auto-reveal on data load — 800ms after `setProperty(data)`, call `setShowDetails(true)` via `setTimeout`. Previously it may have required manual toggle.

- [ ] **Step 2:** Rework the bottom-left HUD in `page.tsx` using `font-heading italic` for title, gold price, two action buttons. Wrap in `<motion.div initial={{ x: -40, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.9, duration:0.5, ease:[0.16,1,0.3,1] }}>`.

- [ ] **Step 3:** Add back-navigation button — top-left fixed, `z-40`, pill button "← Residences". On click: `useCameraStore.getState().setMode('GALLERY')` + `router.push('/properties')`.

- [ ] **Step 4:** In `SectionRail.tsx`, add smooth `scrollIntoView` on `activeSectionIndex` change:
  ```tsx
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeSectionIndex]);
  ```
  Style active rail item with `bg-brand-gold text-black font-semibold` and inactive with `glass-panel text-[var(--text-secondary)]`. Add thin icon before room name (use `Camera` for PANORAMA, `Image` for PHOTO from lucide).

- [ ] **Step 5:** In `BookingModal.tsx`, ensure on `lg:` screen the modal is `grid grid-cols-7 gap-0` with left col `col-span-4 p-6 overflow-y-auto max-h-[80vh]` and right col `col-span-3 p-6 overflow-y-auto max-h-[80vh]`. Each column scrolls independently.

- [ ] **Step 6:** Add flight indicator: `usePropertyViewStore` already knows `activeSectionIndex` changes — add a `isTraveling` boolean that is `true` for 700ms on section change. Render centered pill `fixed inset-x-0 top-1/2 flex justify-center z-50 pointer-events-none`.

- [ ] **Step 7:** `pnpm --filter web exec tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 8:** Commit `git commit -m "feat: property detail HUD polish, section rail icons, booking modal columns"`.

---

## Task 6: Header & Nav Polish

**Files:**
- Modify: `apps/web/src/components/ui/Header.tsx`

**Interfaces:**
- Produces: scroll-aware transparent → frosted glass nav, active route indicator, mobile-responsive hamburger menu.

### Design decisions:
- On scroll `> 40px`: nav transitions from fully transparent (glass-panel with no background) to `glass-panel` with blur. Use `window.scrollY` listener + Lenis scroll event.
- Active nav link: gold underline `after:` pseudo-element that slides in with `transition-transform`.
- Mobile (< 640px): hamburger icon opens a full-screen glass overlay menu with large nav links.
- Brand name: "AURA" in `font-heading italic`, "3D" in `font-body text-brand-gold`.

- [ ] **Step 1:** Add `scrolled` state: `useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn, { passive:true }); return () => window.removeEventListener('scroll', fn); }, [])`.

- [ ] **Step 2:** Apply conditional class to `<nav>`: `scrolled ? 'glass-panel shadow-luxury' : 'bg-transparent border-transparent'`. Transition: `transition-all duration-500`.

- [ ] **Step 3:** Add `isMobileMenuOpen` state. Render hamburger `<button>` (3 lines SVG animating to X) visible only on `sm:hidden`. Render full-screen overlay menu `fixed inset-0 z-50 glass-panel flex flex-col justify-center items-center gap-8` with large `font-heading italic` nav links.

- [ ] **Step 4:** Remove "Admin" from main nav — replace with a subtle small key icon `⌐` link that appears only on `/admin/*` paths or when a JWT token exists in localStorage. This cleans up the public nav.

- [ ] **Step 5:** Commit `git commit -m "feat: scroll-aware nav, mobile hamburger menu, polished brand typography"`.

---

## Task 7: Global Micro-interactions & Polish Pass

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/src/components/ui/Header.tsx` (page transition overlay)
- Create: `apps/web/src/components/ui/PageTransition.tsx`

**Interfaces:**
- Produces: page transition wipe animation between routes, button press feedback, focus rings, hover shimmer on glass cards.

### Design decisions:
- **Page transitions**: on route change, a full-screen `div` with `bg-gradient-to-b from-black to-brand-gold-muted` sweeps left-to-right (scaleX 0→1 then 1→0 in 350ms) using GSAP in `AppCanvas.tsx`'s layout. Use Next.js `usePathname` change to trigger.
- **Button micro-feedback**: all `<button>` elements get CSS `active:scale-95 transition-transform duration-100`.
- **Focus rings**: replace default browser focus ring with `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2` on all interactive elements. Add to `globals.css` as a global rule.
- **Card hover shimmer**: glass cards get a `::before` pseudo-element with `background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)` that moves on hover using `backgroundPosition` transition.
- **Scroll-to-top**: floating pill `↑` button appears when scroll > 300px on `/properties` and `/`.

- [ ] **Step 1:** Create `PageTransition.tsx` — a fixed `div` using `usePathname` change to trigger GSAP timeline `fromTo` on `scaleX`. Layer: `z-[9999]`, `origin-left`, `pointer-events-none`. Mount it once in `layout.tsx`.

- [ ] **Step 2:** In `globals.css`, add:
  ```css
  *:focus-visible { outline: 2px solid var(--brand-gold); outline-offset: 2px; border-radius: 4px; }
  button, [role="button"] { @apply active:scale-95; }
  .glass-panel { position: relative; overflow: hidden; }
  .glass-panel::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%); background-size: 200% 200%; background-position: 200% 200%; transition: background-position 0.6s ease; pointer-events: none; }
  .glass-panel:hover::before { background-position: 0% 0%; }
  ```

- [ ] **Step 3:** Add `scroll-to-top` button in `ScrollJourneyOverlay.tsx` and `properties/page.tsx`. Renders only when `scrollPercent > 60`, `fixed bottom-6 right-6 z-40`, gold pill. On click: `lenis.scrollTo(0)`.

- [ ] **Step 4:** Mount `<PageTransition />` in `apps/web/src/app/layout.tsx` after `<Header />`.

- [ ] **Step 5:** Commit `git commit -m "feat: page transitions, focus rings, card shimmer, scroll-to-top"`.

---

## Execution Order

Tasks **must** be executed in this order due to the token dependency:

```
T1 (tokens) → T2 (3D building) → T3 (landing overlay)
                               → T4 (properties page)
                               → T5 (property detail)
                               → T6 (header nav)
                               → T7 (micro-interactions)
```

T2–T7 can be batched in a single session after T1 lands, as they touch separate files.
