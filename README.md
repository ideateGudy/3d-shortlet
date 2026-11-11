# AURA 3D — Camera-Driven 3D Luxury Shortlet Platform

A cinematic, camera-driven luxury shortlet property platform built from scratch. Roughly **90% of the visitor experience is continuous 3D camera flight and spatial exploration** through luxury properties.

---

## 0. The One Big Idea: The Camera IS the Interface
Visitors never "go to a page" — they **travel** through architectural spaces.
- **One persistent `<Canvas>`** mounted in the root Next.js layout that survives App Router navigation. Next.js route changes swap scene content and trigger **camera flights**, not page reloads.
- The camera is controlled exclusively by a centralized **CameraDirector** (`useCameraStore`). No UI component moves the camera directly.
- UI elements (calendars, pricing breakdowns, filters, guest selectors) are rendered as real accessible HTML panels above the WebGL canvas ("sandwich" method).

---

## 1. Tech Stack
- **Monorepo (`pnpm workspaces`):**
  - `apps/web`: Next.js 14 App Router, TypeScript strict, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, GSAP + ScrollTrigger, Lenis smooth scroll, Zustand, Motion, React Icons.
  - `apps/api`: NestJS, Prisma ORM, PostgreSQL (with `btree_gist` exclusion constraints), JWT Auth, Multer local storage / Cloudinary fallback, Sharp.
  - `packages/shared`: Shared TypeScript types, DTO contracts, and typed API client (`ShortletApiClient`).

---

## 2. Quick Start (Zero External Setup)

### Prerequisites
- Node.js >= 18
- pnpm >= 9
- PostgreSQL (Local or Neon)

### 1-Command Setup & Run
```bash
# 1. Install dependencies across monorepo
pnpm install

# 2. Generate placeholder 360° panoramas & architectural photos
pnpm generate:placeholders

# 3. Apply PostgreSQL schema & exclusion constraints
pnpm db:migrate

# 4. Seed database with Admin, 4 luxury properties, and sections
pnpm db:seed

# 5. Start both API (port 4000) and Web (port 3000) concurrently
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. CameraDirector Modes & Flight Craft

1. **Mode 1: Landing Scroll-Scrubbed Journey (`/`)**
   - Camera follows a `CatmullRomCurve3` trajectory through an architectural showroom (Arrival → Grand Living Hall → Master Bedroom → Skyline Terrace → "Find Your Stay" portal gateway).
   - Driven by Lenis smooth scroll + GSAP ScrollTrigger (`scrub`).
2. **Mode 2: Properties Gallery Lateral Rail (`/properties`)**
   - Floating glass property portals along a 3D depth rail.
   - Hovering aims the camera toward the portal; clicking executes a flight straight through the portal into the property detail view.
3. **Mode 3: Property Immersive Space (`/properties/:slug`)**
   - Inside `PANORAMA` sections: Camera sits at the center of an inverted sphere (`side={THREE.BackSide}`) with damped drag and mobile gyroscope look-around.
   - Inside `PHOTO` sections: Rendered as depth-layered architectural planes with subtle mouse parallax.
   - Hotspot clicks trigger continuous 750ms dolly flight + FOV pulse (+12) + texture crossfade into the next section.
4. **Mode 4: Booking Vantage**
   - Opening the reservation drawer glides the camera smoothly back to a calibrated vantage angle framing the room behind the glass booking calendar. Closing returns to previous look angles.

---

## 4. Double-Booking Prevention & Concurrency Guarantees

Reservations are strictly protected against double-booking race conditions at the database level:
- **PostgreSQL `btree_gist` Exclusion Constraint:**
  ```sql
  ALTER TABLE "Booking" ADD CONSTRAINT "no_overlapping_bookings"
  EXCLUDE USING gist (
    "propertyId" WITH =,
    daterange("checkIn", "checkOut", '[)') WITH &&
  ) WHERE ("status" IN ('CONFIRMED', 'PENDING'));
  ```
- **15-Minute Hold Locks:**
  When a guest starts checkout, dates are reserved in a `PENDING` hold for 15 minutes.
- **Scheduled Expiry Worker:**
  A NestJS cron task (`@Cron('*/1 * * * *')`) automatically cancels expired holds.
- **Automated Concurrency Suite:**
  Run `pnpm --filter api test:e2e` to verify that concurrent overlapping booking attempts for the same property result in exactly 1 success and 1 HTTP 409 conflict.

---

## 5. Default Credentials & Seed Data

- **Admin Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Email:** `admin@shortlet3d.com`
- **Admin Password:** `AdminPassword123!`
- **Seeded Residences:**
  1. *The Obsidian Penthouse* (Manhattan, NY — 4 Bed, 5 Bath, $2,850/night)
  2. *Azure Cliffside Villa* (Santorini Caldera, Greece — 5 Bed, 6 Bath, $3,400/night)
  3. *Komorebi Forest Sanctuary* (Kyoto Highlands, Japan — 3 Bed, 3 Bath, $1,950/night)
  4. *Solis Desert Pavilion* (Joshua Tree, CA — 3 Bed, 3 Bath, $1,650/night)

---

## 6. Project Verification Commands

```bash
# Build all packages & apps
pnpm build

# Run automated double-booking concurrency test
pnpm --filter api test:e2e

# Run development servers
pnpm dev
```
