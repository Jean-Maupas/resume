# maupas.org — CV site

SvelteKit + TypeScript + Neon PostgreSQL, deployed on Vercel.

## Quick start

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH
psql $DATABASE_URL < migrations/001_init.sql
DATABASE_URL=... npx tsx migrations/seed.ts
npm run dev
```

## Generating the admin password hash

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('yourpassword', 12))"
```

Paste the output into `.env` as `ADMIN_PASSWORD_HASH`.

## Generating JWT_SECRET

```bash
openssl rand -base64 32
```

## Routes

| Path | Description |
|---|---|
| `/` | Public CV viewer — add `?profile=clinical_research` etc. |
| `/api/cv/docx` | Download DOCX — add `?profile=` for filtered version |
| `/admin` | Dashboard (password protected) |
| `/admin/cv` | Monaco editor + upload/download + version history |
| `/admin/submissions` | Job application tracker |
| `/admin/login` | Auth |

## Profile tags

| Tag | Use case |
|---|---|
| `clinical_research` | CDM, biometrics, CDISC, TLF submissions |
| `data_science` | R/Python, statistical analysis, visualisation |
| `software_engineering` | APIs, SDLC, system development |
| `information_systems` | EDC/CTMS architecture, business analysis |

## Deployment (Vercel)

1. Push to GitHub (`Jean-Maupas/resume`)
2. Import in Vercel, set environment variables from `.env.example`
3. Deploy

## Updating the CV

Three equivalent methods — all create a new version row and leave history intact:

1. **Admin UI editor** — `/admin/cv`, edit in Monaco, save
2. **File upload** — `/admin/cv`, upload a `.yaml` file
3. **CLI re-seed** — edit `resume.yaml` locally, run `migrations/seed.ts` with `--force`
