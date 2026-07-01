# AirPro Management System (v2)

**AirPro** is a SaaS platform for HVAC (air‑conditioning) service companies in Bulgaria. It manages installation/montage jobs, inventory, employees, subscriptions, and payments — with a dark‑mode, glassmorphism‑styled UI.

- **Backend**: .NET 10 ASP.NET Core Web API (`API/`)
- **Frontend**: React 19 + TypeScript + Vite (`frontend/`)
- **Database**: PostgreSQL 16 (EF Core, code‑first)
- **Domain**: airprobg.com

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start (Local Development)](#-quick-start-local-development)
  - [Option A — Full Docker stack (recommended)](#option-a--full-docker-stack-recommended)
  - [Option B — Hybrid (infra in Docker, app on host)](#option-b--hybrid-infra-in-docker-app-on-host)
- [Default Login Credentials](#-default-login-credentials-dev-only)
- [Ports & URLs](#-ports--urls)
- [Project Structure](#-project-structure)
- [Database Migrations](#-database-migrations)
- [Seeding Real Catalog Data](#-seeding-real-catalog-data)
- [Running Tests](#-running-tests)
- [Environment Variables](#-environment-variables)
- [Further Documentation](#-further-documentation)

---

## 🛠 Tech Stack

### Backend (`API/`)
| Area | Technology |
|---|---|
| Runtime / Language | .NET 10, C# (nullable enabled) |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 10 (code‑first) |
| Database | PostgreSQL 16 |
| Auth | JWT + ASP.NET Core Identity |
| Validation | FluentValidation 12 |
| Mapping | Mapster 10 (entity ↔ DTO) |
| Object storage | MinIO 6 (S3‑compatible) |
| Payments | Stripe.net 47 |
| Email | Mailtrap HTTP API (HTTPS, no SMTP) |
| Column encryption | EntityFrameworkCore.EncryptColumn |
| API docs | Scalar (interactive) + OpenAPI |
| Tests | xUnit, NSubstitute, FluentAssertions, EF Core InMemory |

### Frontend (`frontend/`)
| Area | Technology |
|---|---|
| Framework / Language | React 19, TypeScript 5.9 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4, Shadcn UI (Radix) |
| Data fetching | TanStack React Query v5 |
| Forms / Validation | React Hook Form + Zod |
| Routing | React Router DOM v7 |
| i18n | i18next (English + Bulgarian) |
| Charts | Recharts |
| Animation / Icons | `motion` v12, `lucide-react` |
| PWA | vite-plugin-pwa (Workbox) |

### Infrastructure
- **Docker / Docker Compose** for local infra and full‑stack runs
- **PostgreSQL**, **MinIO** (file storage), **pgAdmin** (DB UI)
---

## ✅ Prerequisites

Install these before you start:

- **.NET 10 SDK** — https://dotnet.microsoft.com/download
- **Node.js 20+** and npm — https://nodejs.org
- **Docker Desktop** — https://www.docker.com/products/docker-desktop

Verify:
```bash
dotnet --version   # 10.x
node --version     # v20+ 
docker --version
```

---

## 🚀 Quick Start (Local Development)

There are two ways to run the project locally. **Option A is the simplest** — one command brings up the whole stack. **Option B** is best when you're actively developing the backend and want hot reload on the host.

### Option A — Full Docker stack (recommended)

Runs everything (PostgreSQL, MinIO, pgAdmin, backend, frontend) in Docker. The backend runs in `Development` mode, so dev seed data and accounts are created automatically. All secrets are baked into the compose file — **no `.env` needed**.

```bash
# From the repository root
docker compose -f docker-compose.local.yml up --build -d
```

Then open:
- **Frontend** → http://localhost:3000
- **Backend API / Scalar docs** → http://localhost:5209/scalar

Reset everything (wipe data and reseed fresh):
```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up --build -d
```

> ⚠️ Do **not** run `docker-compose.prod.yml` locally — that is the production stack (`Production` env, no dev seeds, requires a real `.env`).

### Option B — Hybrid (infra in Docker, app on host)

Best for active backend work (faster rebuilds, hot reload).

**1. Start infrastructure only** (Postgres, pgAdmin, MinIO):
```bash
docker compose up -d postgres pgadmin minio
```

**2. Backend** (separate terminal) — reads `appsettings.Development.json` + user‑secrets:
```bash
cd API
dotnet user-secrets set "EncryptionSettings:Key" "AirProDev2026Key"   # one‑time, exactly 16 chars
dotnet restore
dotnet run            # http://localhost:5209
# or: dotnet watch run   (auto‑restart on file change)
```
Migrations are applied automatically on startup (`context.Database.Migrate()`), and dev seed data is created in `Development`.

**3. Frontend** (separate terminal):
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

---

## 🔑 Default Login Credentials (dev only)

These accounts are seeded automatically in **Development** (both run options). They are **never** created in production. All three demo companies are on the **Free** plan; each has one Manager (owner) plus exactly two `User` employees (the Free-tier limit — Managers don't count toward it). Each company has its own inventory and montages assigned to its employees.

| Email | Password | Role | Company |
|---|---|---|---|
| `admin@airprov2.com` | `Admin@Dev123!` | Admin | — |
| `manager@airprov2.com` | `Manager@Dev123!` | Manager | АйрПро ЕООД (София) |
| `ivan.dimitrov@airprov2.com` | `Manager@Dev123!` | Manager | Климат Сървис ООД (Пловдив) |
| `atanas.petrov@airprov2.com` | `Manager@Dev123!` | Manager | Техно Климат ЕТ (Варна) |
| `petar.ivanov@airprov2.com` | `User@Dev123!` | User | АйрПро ЕООД |
| `stoyan.kolev@airprov2.com` | `User@Dev123!` | User | АйрПро ЕООД |
| `nikolay.todorov@airprov2.com` | `User@Dev123!` | User | Климат Сървис ООД |
| `dimitar.marinov@airprov2.com` | `User@Dev123!` | User | Климат Сървис ООД |
| `kiril.todorov@airprov2.com` | `User@Dev123!` | User | Техно Климат ЕТ |
| `vasil.marinov@airprov2.com` | `User@Dev123!` | User | Техно Климат ЕТ |

> Passwords come from the `SEED_ADMIN_PASSWORD` / `SEED_MANAGER_PASSWORD` / `SEED_USER_PASSWORD` env vars; the values above are the defaults (used by `docker-compose.local.yml`).

---

## 🔌 Ports & URLs

| Service | URL / Port |
|---|---|
| Frontend (Vite dev — Option B) | http://localhost:5173 |
| Frontend (Docker — Option A) | http://localhost:3000 |
| Backend API | http://localhost:5209 (host) / `8080` (in‑container) |
| API docs (Scalar) | http://localhost:5209/scalar |
| OpenAPI JSON | http://localhost:5209/openapi/v1.json |
| PostgreSQL | `localhost:5432` (db `AirProV2`, user `user`, pass `12345`) |
| pgAdmin | http://localhost:8888 |
| MinIO API / Console | http://localhost:9000 / http://localhost:9001 (`minioadmin` / `minioadmin123`) |

---

## 📁 Project Structure

```
AirProV2_API/
├── API/                     # .NET 10 ASP.NET Core Web API (backend)
│   ├── Controllers/         # Thin controllers (extend ApiControllerBase)
│   ├── Services/            # Business logic (interface + impl per feature)
│   ├── Data/                # DbContext, Entities, Migrations, Seeds
│   ├── DTOs/ Mappings/      # API contracts + Mapster config
│   └── Program.cs           # Entry point + DI wiring
├── API.Tests/               # xUnit test project (runs in CI)
├── frontend/                # React 19 + TS + Vite (frontend)
│   └── src/                 # components, pages, services, context, locales
├── scraper/                 # Python data scraper (AC catalog + error codes)
├── Data/                    # SQL seed files + Docker volume data
├── docs/                    # Architecture & ops documentation
├── docker-compose.yml       # Dev infrastructure (postgres, pgadmin, minio)
├── docker-compose.local.yml # Full local stack (infra + backend + frontend)
├── docker-compose.prod.yml  # Production stack
├── .env.example             # Environment variable template (production)
└── AirProV2_API.sln         # Solution (API + API.Tests)
```

---

## 🗃 Database Migrations

Migrations are **applied automatically on startup**. To manage them manually:

```bash
cd API
dotnet ef migrations add <MigrationName>   # create a new migration
dotnet ef database update                  # apply pending migrations
dotnet ef database update <MigrationName>  # roll back to a migration
```

> Use the **Expand‑Contract** pattern for breaking changes (add new → migrate data → drop old). See [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md).

---

## 📦 Seeding Real Catalog Data

Reference data (roles, a starter set of air conditioners, error codes) is seeded automatically. To replace the starter/dummy catalog with the **real, scraped dataset**, load the SQL seed files in [`Data/`](Data/):

```bash
# Air conditioners (real Bulgarian‑retailer models)
docker exec -i -e PGPASSWORD=12345 dev_postgres_container \
  psql -U user -d AirProV2 -f - < Data/scraped_air_conditioners_insert.sql
```

These files are **idempotent** (`ON CONFLICT (id) DO NOTHING`) and safe to re‑run.

To **regenerate** them (or scrape fresh data from Technomarket / Technopolis / manufacturer sites), use the Python scraper in [`scraper/`](scraper/) — it produces SQL that maps exactly to the `air_conditioners` and `error_codes` tables. See [`scraper/README.md`](scraper/README.md) for usage, flags, and the legal/ToS notes.

---

## 🧪 Running Tests

**Backend** (xUnit — also runs in CI on every PR):
```bash
dotnet test AirProV2_API.sln
# filter:        dotnet test --filter "FullyQualifiedName~LoginDtoValidatorTests"
```

**Frontend** (type‑check + production build — the CI gate):
```bash
cd frontend
npm run typecheck
npm run build
```

**Scraper** (Python, no network — runs against fixtures):
```bash
cd scraper && python -m pytest
```

---

## ⚙️ Environment Variables

For **local development** you do **not** need a `.env` — Option A bakes values into `docker-compose.local.yml`, and Option B uses `appsettings.Development.json` + user‑secrets.

For **production**, copy [`.env.example`](.env.example) and fill in real secrets. Key requirements:

- `JWT_SECRET` — 64+ character random string
- `ENCRYPTION_KEY` — **exactly 16 characters**
- `DB_USER` / `DB_PASSWORD` / `DB_NAME` — PostgreSQL
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` — object storage
- `STRIPE_*` — payments
- `MAILTRAP_API_TOKEN` — transactional email
- `WEBSITE_URL` — used in email + Stripe redirect links
- `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` — first‑boot admin account

Config priority: `appsettings.json` → `appsettings.Production.json` → environment variables. The app **fails fast at startup** if `JWT_SECRET` < 32 chars or `ENCRYPTION_KEY` ≠ 16 chars.

---

## 📚 Further Documentation

Detailed docs live in [`docs/`](docs/):

| Doc | Contents |
|---|---|
| [SOFTWARE_OVERVIEW.md](docs/SOFTWARE_OVERVIEW.md) | Features, tech stack, high‑level logic |
| [CODE_LOGIC.md](docs/CODE_LOGIC.md) | Backend/frontend structure, API patterns, implementation deep‑dive |
| [LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) | Detailed local setup guide |
| [MIGRATIONS.md](docs/MIGRATIONS.md) | EF Core migration procedures |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [PRODUCTION_OPS.md](docs/PRODUCTION_OPS.md) | Production operations & recovery |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | End‑user documentation |

---
