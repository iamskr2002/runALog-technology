# Supabase Migration Guide — RunA Log Technologies

This guide explains how to move the entire database (schema + data) from the
local SQLite file (`db/custom.db`) to a Supabase Postgres database.

The migration kit consists of three files:

| File | Purpose |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Hand-written Postgres DDL that mirrors `prisma/schema.prisma` 1:1 (5 tables, FKs, indexes). |
| `scripts/export-sqlite-data.ts` | Read-only script that exports every row from SQLite into Postgres-flavored SQL. |
| `supabase/0002_data_export.sql` | The generated data file (created by the script above). Run it once, after `0001_init.sql`. |

---

## 1. What you'll migrate

Five tables, moved from `db/custom.db` (SQLite) into Supabase (Postgres):

| Table | What it holds |
| --- | --- |
| `ProjectInquiry` | Inquiries submitted through the public contact / "Start a Project" form |
| `Staff` | Team members who sign in to the staff panel (scrypt password hashes) |
| `Lead` | Sales leads (manual, CSV/XLSX import, or converted from an inquiry) |
| `Activity` | Scheduled calls / meetings / follow-ups with leads |
| `Client` | Onboarded clients, usually converted from a won lead |

The data export generated with this kit contained:

```
ProjectInquiry:   0 rows
Staff:            2 rows
Lead:           123 rows
Activity:         0 rows
Client:           0 rows
Total:          125 rows
```

(Counts are a snapshot from when `scripts/export-sqlite-data.ts` last ran.
If new rows were added to the SQLite database afterwards, re-run the export
script before importing — see section 5.)

---

## 2. Prerequisites

1. A Supabase account and a Supabase project (create one at
   [https://supabase.com](https://supabase.com) if you do not have one yet —
   the free tier is sufficient for this app).
2. The database connection string. In the Supabase Dashboard open
   **Project Settings -> Database** (on newer dashboards: the **Connect**
   button at the top of the project page). You will see several URIs:

   - **Session pooler** URI (port `5432`, host looks like
     `aws-0-<region>.pooler.supabase.com`) — recommended for the running
     application (section 6).
   - **Direct connection** URI (`postgresql://db.<ref>.supabase.co:5432/postgres`)
     — fine for running the migration SQL files.
   - **Transaction pooler** URI (port `6543`) — also usable for migrations.

   The URI looks like:
   `postgresql://postgres.<project-ref>:<YOUR-PASSWORD>@<host>:5432/postgres`

3. Keep this URI private — it contains your database password (see section 8).

---

## 3. Option A (recommended): apply the schema with the SQL file

This uses `supabase/migrations/0001_init.sql`, which creates the exact same
structure that the Prisma schema describes.

**Via the Supabase Dashboard (easiest):**

1. Open your project at `https://supabase.com/dashboard`.
2. In the left sidebar click **SQL Editor**, then **New query**.
3. Open `supabase/migrations/0001_init.sql` locally, copy its entire content,
   paste it into the editor, and click **Run**.
4. Expected result: "Success. No rows returned." You can confirm under
   **Table Editor** that the five tables now exist (all empty).

**Via the Supabase CLI (if you use it):**

```bash
# One-time setup in the project folder (links the CLI to your project;
# it will ask for the database password):
supabase link --project-ref <your-project-ref>

# Applies every file under supabase/migrations/ that has not run yet:
supabase db push
```

Alternative for a one-off apply straight to the database:

```bash
psql "<your-connection-string>" -f supabase/migrations/0001_init.sql
```

The CLI records each applied migration in Supabase's migration history, which
keeps future schema changes orderly.

---

## 4. Option B (alternative): let Prisma generate the schema

Instead of running the SQL file, you can switch the Prisma toolchain to
Postgres and let it create the tables. Both approaches produce the same
structure — pick one, not both.

1. Edit `prisma/schema.prisma` and change the datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Put your Supabase connection string in `.env`:

   ```
   DATABASE_URL="postgresql://postgres.<project-ref>:<YOUR-PASSWORD>@<host>:5432/postgres"
   ```

3. Regenerate the client and create the tables:

   ```bash
   bun run db:generate          # rebuilds the Prisma client for Postgres
   bun run db:migrate --name init   # creates the tables and writes prisma/migrations/
   ```

Note: this path generates the SQL from the schema automatically (it will also
create its own migration files under `prisma/migrations/`). It does **not**
use `supabase/migrations/0001_init.sql`. Both routes result in the identical
database structure, so the data file from section 5 works with either one.
If you go this way, skip section 3 entirely.

---

## 5. Data migration

The generated data file is `supabase/0002_data_export.sql` (125 rows as of
the last run). If the SQLite database has changed since it was generated,
regenerate it first — the script only reads the database, never modifies it:

```bash
bun scripts/export-sqlite-data.ts
```

Then import the data:

1. Open the **SQL Editor** in the Supabase Dashboard.
2. Copy the entire content of `supabase/0002_data_export.sql`, paste it,
   and click **Run**.

Important:

- **Run it once, on empty tables** (right after `0001_init.sql` or the
  Option B migration, before anyone starts using the Supabase database).
  The file contains plain `INSERT` statements; running it twice would
  duplicate rows or fail on duplicate keys.
- The whole file is wrapped in a `BEGIN; ... COMMIT;` transaction, so it
  either fully applies or rolls back entirely — a partial import is not
  possible.
- Rows are inserted in FK-safe order (ProjectInquiry -> Staff -> Lead ->
  Activity -> Client), so no foreign-key violations occur on a fresh schema.

To verify, open **Table Editor** in Supabase and compare the row counts with
the summary the export script printed (or with section 1 above).

---

## 6. Post-migration checklist

Work through these steps after the data import:

1. **Verify row counts.** In the Supabase Dashboard open **Table Editor** and
   check each table's row count against the export summary:
   `ProjectInquiry 0 / Staff 2 / Lead 123 / Activity 0 / Client 0`
   (or the numbers from a newer export).
2. **Switch Prisma to Postgres (if you used Option A).** The SQL-file path
   creates the tables, but the application itself still needs a Postgres-capable
   Prisma client: edit `prisma/schema.prisma`, set `provider = "postgresql"`,
   then run `bun run db:generate`. Without this step the app keeps talking to
   SQLite and will not see the Supabase data.
3. **Update `.env`.** Replace the old SQLite URL with the Supabase URI:

   ```
   DATABASE_URL="postgresql://postgres.<project-ref>:<YOUR-PASSWORD>@<host>:5432/postgres"
   ```

   For the **Session pooler** URI (recommended for the app) you can keep the
   default port `5432`. If you instead connect through the **transaction
   pooler** (port `6543`), Prisma should run in pgBouncer-friendly mode —
   append connection parameters to the URL:

   ```
   DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

   (`pgbouncer=true` disables prepared statements that transaction-pooling
   does not support; `connection_limit=1` keeps one connection per serverless
   instance. On the session pooler with port 5432 these parameters are not
   required.)
4. **Restart the app.** Stop and start the dev server (or redeploy in
   production) so the new `DATABASE_URL` and regenerated Prisma client load.
5. **Smoke test.** Submit the public contact form once, then sign in to the
   admin panel (`/admin`) and confirm the inquiry appears, leads list
   correctly, and staff logins still work (their scrypt password hashes were
   migrated unchanged).

---

## 7. Rollback

Keep the SQLite file (`db/custom.db`) and do not delete it until the Supabase
setup has been verified in everyday use. Rolling back is simple and safe:

1. Restore `.env` to the SQLite URL: `DATABASE_URL=file:/home/z/my-project/db/custom.db`
2. (If you switched providers) set `provider = "sqlite"` in
   `prisma/schema.prisma` and run `bun run db:generate`.
3. Restart the app.

The SQLite file is never modified by the export script, so it remains a
complete, untouched backup of the pre-migration state. Nothing you do on the
Supabase side can damage it.

---

## 8. Security notes

- **The connection string contains your database password.** It lives in
  `.env`, which is gitignored — never paste it into code, screenshots, chat,
  or commit it to version control. If it ever leaks, rotate the password in
  Supabase (**Project Settings -> Database -> Reset database password**).
- **The data export file contains personal data and password hashes.**
  `supabase/0002_data_export.sql` includes customer contact details and the
  staff scrypt password hashes. Treat it like a database dump: do not commit
  it, and delete it from your machine once the migration is verified.
- **Staff passwords migrate as-is.** Passwords are stored as scrypt hashes
  (`src/lib/password.ts`); the hashes are copied unchanged and remain valid —
  nobody needs to reset their password after the migration.
- **The admin panel password is not in the database.** It stays in `.env` as
  `ADMIN_PASSWORD` (with the signing secret in `ADMIN_SECRET`), so it is
  unaffected by the migration — just make sure `.env` is carried over to
  whatever environment runs the app.
