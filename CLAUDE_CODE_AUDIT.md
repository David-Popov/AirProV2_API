# Claude Code Session Audit — AirProV2_API

**Date:** 2026-07-02
**Method:** Local session transcripts don't leave your machine, so this audit reconstructs session friction from the durable footprint your sessions left behind, gathered by three parallel research agents:

- **Git history** — 116 commits across all branches, including 23 with `Co-Authored-By: Claude` (almost all in a 4-day burst, Mar 27–30, 2026) and 7 merges of `claude/*` branches
- **GitHub activity** — all 31 PRs, all 79 Actions runs (with job logs for representative failures), issues
- **Repo dev-experience survey** — build/test/run/deploy surface, config layout, fresh-clone tripwires

Bottom line: **your sessions produce good code fast, but the friction lives in everything around the code** — deploys, config plumbing, verification before merge, and the fact that no project memory ever reaches a session.

---

## Friction clusters

### Cluster A — Deploy pipeline fragility (worst offender)

The deploy pipeline generated more fix-commits, retries, and late-night sessions than any feature work.

**Evidence:**
- **The `git pull` divergence bug was fixed twice.** Staging deploy switched `git pull` → `git reset --hard` on Mar 27 (`0bd7eb8`, 14 minutes after the deploy config landed). The *same* failure bit prod three days later and was fixed identically (`bd0c6be`/`4a68312`, Mar 30) — the commit message even cites "same pattern already used in deploy-staging.yml". The session had no memory that this failure mode existed.
- **The 1-CPU staging server couldn't build the frontend** — 4 escalating fixes in 31 minutes, all after 1 AM on Mar 30: raise SSH timeout to 30m (`0b24f4f`) → drop `tsc` from build (`c182a8e`, 943s → ~60-90s) → optimizeDeps pre-bundling (`f9aaf38`) → replace Phosphor icons with Lucide entirely (`08023e8`). Each step separately merged from `claude/reverent-boyd` (branch re-merged 3× that night).
- **Prod deploy failed on "port 80 already allocated"** after PR #27 (run 27376365454, Jun 11) — 6-minute Docker build succeeded, then died at container recreation.
- **Pi staging never succeeded once**: 4 runs, 4 failures (cloudflared SSH `websocket: bad handshake`), then the whole workflow was deleted. Net: ~7 commits of staging-deploy work (DigitalOcean + Raspberry Pi) fully discarded within 2.5 months (`6f28ebc`, Jun 11).
- **Failure rates:** staging deploy 21% (28 runs), prod deploy 21% (19 runs), Pi 100% (4 runs). `deploy.yml` was patched 6 times; `deploy-staging.yml` 5 times, then deleted.
- Deploy logic lives inline in workflow YAML — it can't be tested locally, so every fix required a real deploy to validate.

### Cluster B — Merge-before-verify

Friction never appears as review comments (there are literally **zero reviews or PR comments across all 31 PRs**) — it appears as post-merge CI failures and next-morning fix bursts.

**Evidence:**
- **PR #17** (`claude/reverent-boyd`, animations) was merged **6 seconds** after creation → staging deploy failed 4 consecutive times over the next ~3.5 hours until the icon-library swap fixed the build.
- **PR #20** (`claude/strange-borg`) failed CI on its first push (TypeScript return-type error in ApiClient), fixed 3 minutes later.
- **Ship-then-harden:** email confirmation shipped at 22:49 (`508e861`); next morning, 4 fixes in 51 minutes — broken local-dev links (`dd085e6`), expired-token resend flow (`40c622d`), double-click idempotency race (`b911a8f`), full audit sweep (`bd44981`).
- `npm run lint` exists in `frontend/package.json` but **is not run in CI**; there's no frontend unit-test framework at all. 27 of 30 merged PRs were self-merged in under 16 minutes, most under 3.

### Cluster C — Config/env plumbing drift

Every settings change needed an immediate follow-up commit because the change didn't propagate across all the places config lives.

**Evidence:**
- **Email transport was reworked 3× in 5 days** (background SMTP `3834146` → Mailtrap SMTP `05deb19` → Mailtrap HTTP API `c152468`). `EmailService.cs` was rewritten 4 times in 5 days.
- Two literal **"." commit messages** (`0be909e`, `805da75`) — tiny compose/appsettings follow-ups minutes after the "real" commit, because env plumbing was forgotten the first time.
- `5a9293d` fixed `ASPNETCORE_ENVIRONMENT` in compose 5 minutes after the email-template commit.
- **Residual drift is still in the tree today:** `API/appsettings.Production.json` has SMTP-shaped `EmailSettings` (SmtpHost/SmtpPort/…) while the code uses the Mailtrap HTTP API (`ApiBaseUrl` + `ApiToken`).
- The rules that make this dangerous are undocumented: `StartupValidator.cs` hard-fails on an `EncryptionSettings:Key` that isn't exactly 16 chars, a JWT secret under 32 chars, and (outside Development) missing Stripe/Mailtrap secrets. A session that doesn't know this ships a config that crash-loops in prod only.

### Cluster D — i18n tax

**Evidence:**
- `frontend/src/locales/bg/translation.json` (27 edits) and `en/translation.json` (25 edits) are the **two most-modified files in the repo** — every feature pays this tax. Both are 969 lines, kept in parity by hand, with no automated check.
- `frontend/src/i18n.ts` ships `debug: true` unconditionally — it logs in production builds.

### Cluster E — Project memory invisible to sessions (root cause multiplier)

**Evidence:**
- `CLAUDE.md` and `.claude/` were gitignored on Mar 27 (`a211238`). Consequence: **every session — especially remote/web sessions like this one — starts blind.** No command reference, no tripwire list, no conventions. This is why the `git pull` bug got fixed twice, why the StartupValidator rules keep surprising, why config sweeps get missed.
- The ignore didn't even fully work: `.claude/settings.local.json` was already tracked, leaked into history, and had to be deleted 3 days later — twice, once per branch (`0dfb80d`, `4144e3f`).
- **`/docs/` and `/Data/` are themselves gitignored** — any documentation written into `docs/` silently never reaches git. This is almost certainly how the README ended up linking to 7 documents that don't exist in the tree (this audit initially fell into the same trap: its deliverables were written to `docs/` and `git add` refused them).
- **README rot misleads sessions:** the README references `docs/` (7 linked documents incl. MIGRATIONS.md), `Data/*.sql` seeds, and `scraper/` — none exist in the tree. Cleanup itself showed friction: two same-subject commits 42 seconds apart (`f5ddbde`, `55a6432`) because the first pass missed occurrences. `frontend/README.md` is still the untouched Vite template.

### Cluster F — Branch/PR hygiene

**Evidence:**
- Two Claude branches opened PRs **42 seconds apart** (Mar 30); PR #19 was a stale 1-file leftover that sat open **73 days** before being closed unmerged.
- dev/main were synced by **committing the same fix twice** (both the `settings.local.json` removal and the `git reset --hard` fix exist as duplicate commit pairs) instead of merging.
- `claude/festive-clarke` was merged straight into dev twice with no PR; `claude/reverent-boyd` was kept alive and re-merged 3× in one night.

---

## Proposals

Priority order: **1. CLAUDE.md → 2. CI hardening → 3. skills → 4. hygiene automations.** The CLAUDE.md fixes the root-cause multiplier (Cluster E) and makes every other item cheaper.

### 1. CLAUDE.md (Cluster E → feeds all others)

A complete, ready-to-use file ships alongside this report at **`CLAUDE.md.template`** (repo root). Copy it to the repo root:

```bash
cp CLAUDE.md.template CLAUDE.md   # stays gitignored, per your preference
```

Since `CLAUDE.md` is gitignored, it only helps sessions on machines where the copy exists. **Remote/web sessions will still never see it.** If you keep hitting friction in web sessions, reconsider tracking it (you can keep `.claude/settings.local.json` ignored — that's the file that actually leaked). The template is maintained at the repo root (not in `docs/` — see below) so it survives in git and can be re-copied anywhere.

### 2. CI hardening (Clusters B, D)

**2a. Add lint to CI** — the script already exists, it's just never run. In `.github/workflows/ci.yml`, in the frontend job after typecheck:

```yaml
      - name: Lint
        run: npm run lint
        working-directory: frontend
```

**2b. i18n parity check** — create `scripts/check-i18n-parity.mjs`:

```js
#!/usr/bin/env node
// Fails if en/bg translation files don't have identical key sets.
import { readFileSync } from 'node:fs';

const load = (l) =>
  JSON.parse(readFileSync(`frontend/src/locales/${l}/translation.json`, 'utf8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );

const en = new Set(flatten(load('en')));
const bg = new Set(flatten(load('bg')));
const missingInBg = [...en].filter((k) => !bg.has(k));
const missingInEn = [...bg].filter((k) => !en.has(k));

if (missingInBg.length || missingInEn.length) {
  if (missingInBg.length) console.error('Missing in bg:', missingInBg.join(', '));
  if (missingInEn.length) console.error('Missing in en:', missingInEn.join(', '));
  process.exit(1);
}
console.log(`i18n parity OK (${en.size} keys)`);
```

CI step (frontend job): `- run: node scripts/check-i18n-parity.mjs`

**2c. Branch protection** (repo settings, can't be done from code): require the CI check to pass before merging to `main` and `dev`. This single setting would have prevented the PR #17 six-second merge that broke staging for 3.5 hours. With auto-merge enabled you lose almost no speed: open PR → enable auto-merge → it lands when CI is green.

**2d. Quick win:** make i18next debug dev-only in `frontend/src/i18n.ts`: `debug: import.meta.env.DEV`.

### 3. Skills (`.claude/skills/<name>/SKILL.md`)

Ready to paste. Each lives at `.claude/skills/<name>/SKILL.md` (gitignored, so keep master copies wherever you keep the CLAUDE.md copy).

#### 3a. `preflight` (Cluster B)

```markdown
---
name: preflight
description: Run the full verification gate before any push or merge in AirProV2_API. Use before pushing commits, creating a PR, or merging. Catches what CI would catch, locally, first.
---

Run all of these; all must pass before pushing:

1. Backend: `dotnet build AirProV2_API.sln --configuration Release` then
   `dotnet test AirProV2_API.sln` (69 xUnit tests; no DB/services needed — InMemory + mocks).
2. Frontend (from `frontend/`): `npm run typecheck`, `npm run lint`, `npm run build`.
   Note: `build` does NOT typecheck (tsc was removed from build for perf) — typecheck is a separate, mandatory step.
3. If any locale file changed: `node scripts/check-i18n-parity.mjs`.
4. If any compose/workflow/appsettings file changed: also run the config-sync skill checklist.

Only push when everything is green. Never merge a PR that hasn't had CI complete —
PR #17 was merged in 6 seconds and broke staging for 3.5 hours.
```

#### 3b. `config-sync` (Cluster C)

```markdown
---
name: config-sync
description: Checklist for changing any configuration/setting in AirProV2_API (a *Settings class, env var, connection string, secret). Config lives in 6 places; changing one without the others causes crash-loops that only appear at deploy time.
---

When adding, renaming, or removing any setting, sweep ALL of:

1. The settings class in `API/` and its binding in `API/Infrastructure/` DI extensions.
2. `API/appsettings.json`, `appsettings.Development.json`, `appsettings.Production.json`
   (Production drifts — it still had SMTP keys months after the code moved to the Mailtrap API).
3. `API/appsettings.Development.local.json.example` (auto-loaded last in Program.cs; devs copy it).
4. `docker-compose.local.yml` AND `docker-compose.prod.yml` env sections (double-underscore form,
   e.g. `EmailSettings__ApiToken`). History shows compose is the #1 forgotten spot ("." commits).
5. Root `.env.example` if it's a prod secret (compose.prod reads `${VAR}` from `.env`).
6. `API/Infrastructure/StartupValidator.cs` — if the setting is required, add validation;
   if validation exists, respect its rules (EncryptionSettings:Key exactly 16 chars,
   JwtSettings:SecretKey ≥ 32 chars, Stripe + Mailtrap required outside Development).

Then verify: `docker compose -f docker-compose.local.yml config -q` and
`docker compose -f docker-compose.prod.yml config -q` (with a dummy .env if needed).
Finally remind the user of any GitHub Actions secret that must be added/rotated by hand.
```

#### 3c. `i18n-sync` (Cluster D)

```markdown
---
name: i18n-sync
description: Add or change user-facing strings in the AirProV2_API frontend. Every UI string goes through i18next with both en and bg locales updated together.
---

1. Never hardcode UI strings in components — use `t('section.key')`.
2. Add every new key to BOTH `frontend/src/locales/en/translation.json` and
   `frontend/src/locales/bg/translation.json`, in the same nested position.
   bg is the fallback language and the primary market — bg copy is not optional.
3. Match the existing nesting conventions (per-page/per-feature sections) rather than inventing
   new top-level groups.
4. Verify with `node scripts/check-i18n-parity.mjs` before finishing.
5. When removing a feature, remove its keys from both files in the same commit.
```

#### 3d. `deploy-doctor` (Cluster A)

```markdown
---
name: deploy-doctor
description: Preflight for any change to deployment - .github/workflows/deploy.yml, docker-compose.prod.yml, Dockerfiles, nginx configs. Deploy failures are only visible in prod, so validate everything that can be validated locally first.
---

Checklist for deploy-affecting changes:

1. `docker compose -f docker-compose.prod.yml config -q` must pass (use a dummy `.env` with all
   keys from `.env.example`).
2. Grep the workflow for `git pull` — it must never appear. The convention is
   `git fetch origin main && git checkout main && git reset --hard origin/main`
   (the pull-on-dirty-server bug was fixed twice, staging Mar 27 and prod Mar 30 2026).
3. Port ownership: prod frontend binds host :80. Before `up -d`, the script must stop/remove
   any container already bound there (a Jun 11 prod deploy died on "port 80 already allocated"
   after a successful 6-minute build).
4. Compose project name is `airpro-prod` (`-p airpro-prod`); never launch prod services under a
   different project name or containers will collide instead of being recreated.
5. Remember the prod box is small — frontend builds run on the server. Keep `tsc` out of
   `npm run build` (typecheck belongs in CI) and be suspicious of dependencies that balloon the
   module graph (Phosphor icons → 943-second builds on a 1-CPU box).
6. There is no staging environment anymore (deleted Jun 2026). The only pre-prod validation is
   what you run locally — so run it.
```

### 4. Hygiene automations (Clusters E, F)

- **SessionStart hook** for web sessions: since `.claude/` is gitignored, the practical alternative is Claude Code's repo-setup path for web (`/session-start-hook` skill can generate one) — it lets remote sessions install the .NET 10 SDK / run `npm ci` up front instead of tripping mid-task.
- **Branch cleanup ritual:** delete `claude/*` branches right after merge (PR #19 sat 73 days; `reverent-boyd` was re-merged 3× in one night). One-liner: `git push origin --delete <branch>` after each merge, or turn on GitHub's "Automatically delete head branches".
- **Stop syncing dev/main with duplicate commits** — the duplicate pairs on Mar 30 (`0dfb80d`/`4144e3f`, `bd0c6be`/`4a68312`) mean `git log` can't tell you whether a fix is on a branch. Merge `dev → main` (you already do this via PRs #21/25/27/29/31 — just make it the only mechanism).
- **PR babysitting instead of instant self-merge:** when a Claude session opens a PR, ask it to watch the PR (`subscribe_pr_activity`) — it will fix CI failures itself and you merge when green. This replaces the 6-second self-merge with a loop that would have absorbed the entire PR #17 incident.
- **README fixes** (small but they actively mislead sessions): remove the dead links to `docs/`, `Data/*.sql` and any remaining scraper references on all branches; replace `frontend/README.md` (still the Vite template) with two lines pointing at the root README.

---

## What was *not* a problem

Worth knowing what to keep doing:

- **Backend tests are excellent session fuel** — 69 tests runnable with only the .NET SDK (InMemory + NSubstitute, no DB/SMTP/Stripe needed). Current CI is 0/8 failures since the June rework.
- **Zero TODO/FIXME debt** in the codebase; no revert commits ever needed.
- The big Claude-authored features (auth flows, security audit, backend refactor) all landed and stuck — no rework of the code itself, only of the plumbing around it.
