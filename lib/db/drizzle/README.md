# QPN database migrations

The database package uses Drizzle Kit against PostgreSQL.

Before applying schema changes in a deployed environment:

1. Set `DATABASE_URL` in the deployment environment.
2. Generate a migration with `pnpm --filter @workspace/db generate`.
3. Review the generated SQL before applying it.
4. Apply the reviewed migration using the deployment's database migration procedure.

`pnpm --filter @workspace/db push` remains available for controlled development environments. Do not run `push-force` against production without an explicit backup and review.
