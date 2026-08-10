# QPN Technical Audit

This file marks the controlled technical audit branch.

- TV streaming: protected; do not modify.
- Radio streaming: protected; do not modify.
- Admin web: separate web surface.
- Admin credentials: must be provided via environment secrets, never committed.
- News Engine: source adapters, filtering, deduplication, and official Diwan source are implemented.
- Validation now in progress: workspace TypeScript, CI, database-backed News Sync, and end-to-end API verification.

Branch: qpn/audit-admin-foundation
