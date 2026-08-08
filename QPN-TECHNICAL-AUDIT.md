# QPN Technical Audit — Initial Findings

Date: 2026-08-08
Branch: `qpn/audit-admin-foundation`

## Scope

This audit covers the current monorepo architecture, API server, database package, mobile state/admin layer, and streaming boundaries.

## Critical findings

### P0 — No application database schema yet

`lib/db` is provisioned for PostgreSQL/Drizzle, but `lib/db/src/schema/index.ts` exports no tables. The database connection exists, but there is currently no persisted News/Categories/Users/Admin/Events/Deals content model.

### P0 — Existing mobile admin uses client-side credentials

`artifacts/mobile/app/admin.tsx` contains a hardcoded admin credential and performs authentication locally in the mobile bundle. This is not suitable for production authorization because the credential can be extracted from the shipped application. The web admin introduced on this branch uses server-side environment secrets instead.

### P0 — Existing admin data is device-local

`AppContext` persists channels, carousel, ads, affiliates and saved deals with AsyncStorage. The current admin screen updates that local state. Those changes are therefore not a central content-management system and cannot reliably control all users' devices.

### P1 — API currently exposes only health/radio routes

The main API router mounts health and radio. There is no News CRUD, authentication API, content moderation, search, events, deals, analytics, or notification API yet.

### P1 — CORS is unrestricted

The Express app currently uses `cors()` without an allowlist. This is acceptable for development but should be restricted before production admin/content APIs are exposed.

### P1 — Radio proxy needs hardening without changing sources

The radio HLS proxy intentionally supports the current QMC streams. The asset proxy accepts an arbitrary HTTPS asset URL after validating only the scheme. This should be restricted to approved upstream hosts while preserving the current official stream URLs and playback behavior.

## Protected systems

- TV: existing YouTube live/embed sources are treated as protected. Do not change URLs or playback implementation during the growth work.
- Radio: current QMC HLS sources and existing fallback/playback behavior are treated as protected. Security hardening must not alter the stream sources.

## Architecture target

Mobile/Web clients -> authenticated API -> PostgreSQL/Drizzle -> Admin Web

Initial content models:

- users / admin roles
- news
- categories
- media
- events
- deals
- businesses (later)
- notifications (later)
- analytics (later)

## Branch changes

This branch contains only the audit marker plus the first web-admin authentication foundation. Nothing has been merged into `main`.

## Next implementation order

1. Configure deployment secrets for the web admin.
2. Add PostgreSQL/Drizzle schemas and migrations for admin/content.
3. Add authenticated News CRUD endpoints with validation.
4. Build the web News Manager: draft, publish, schedule, breaking, edit, archive.
5. Connect mobile news feed to the API.
6. Add search/trending/analytics.
7. Add user submissions/moderation.

TV and Radio remain out of scope for these changes.
