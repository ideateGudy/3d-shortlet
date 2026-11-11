# Camera-Driven 3D Shortlet Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a luxury, camera-driven 3D shortlet property platform from scratch in an empty repository, where ~90% of the experience is continuous 3D camera travel through properties, backed by a persistent Next.js WebGL canvas, NestJS API with Neon/PostgreSQL exclusion constraints preventing double-booking, and a dark glassmorphic UI.

**Architecture:** Monorepo using `pnpm workspaces` containing `apps/web` (Next.js App Router, Three.js, React Three Fiber, Drei, GSAP, Lenis, Zustand, Tailwind), `apps/api` (NestJS, Prisma, Neon/Postgres, JWT, Multer/Cloudinary), and `packages/shared` (TypeScript schemas, DTOs, API client). A single persistent `<Canvas>` in the root layout drives all route transitions via a unified `CameraDirector` state machine.

**Tech Stack:** Next.js, React Three Fiber (`@react-three/fiber`), Three.js, `@react-three/drei`, GSAP + ScrollTrigger, Lenis, Zustand, Tailwind CSS, NestJS, Prisma ORM, PostgreSQL (with `btree_gist`), Sharp, TypeScript strict.
