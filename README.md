# Repair Risk Review — Demo MVP

VIN-based vehicle repair-risk intelligence platform demo for **RepairRiskReview.com**, powered by My Road Armor.

## Quick start

```bash
cd repair-risk-review
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

| Item | Value |
|------|--------|
| Demo VIN | `3GNAXUEV3L6123456` |
| Mileage | `112450` |
| ZIP | `48304` (Cold/Snow) |
| Admin email | `admin@repairriskreview.com` |
| Admin password | `Demo123!` |

## Expected demo score (database-driven)

```
Class 6 base       60
Mileage 112,450   +10
Age 6 years        +5
Cold/Snow          +3
Model/engine       -4
─────────────────────
Final              74 / 100  HIGH  · Grade B-
12-mo exposure     $1,540
24-mo exposure     $3,180
Worst case         $5,900
```

## End-to-end flow

1. Landing → enter VIN  
2. Analysis animation (3–5s)  
3. Score preview + lead capture  
4. Full multi-section report  
5. Download PDF  
6. Admin dashboard (`/admin`)

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind  
- File-backed JSON data store (`data/db.json`) for reliable local demo (no external VIN APIs)  
- Omega class guide imported into underwriter rules (584 rules)  
- Version 1 scoring / climate / exposure tables loaded from configuration  
- Client-side PDF via jsPDF  

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run db:setup` | Seed `data/db.json` |
| `npm run db:seed` | Re-seed data |
| `npm run build` | Production build (Netlify uses this) |

## Deploy to Netlify

1. Push the `repair-risk-review` folder (or repo root if this is the root).
2. In Netlify: **Add new site → Import from Git**.
3. Build settings are already in `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node:** `20`
   - **Plugin:** `@netlify/plugin-nextjs`
4. Import env vars from `.env.netlify` (Site settings → Environment variables):
   - Set `NEXT_PUBLIC_SITE_URL` to your live Netlify URL after the first deploy.
5. Deploy.

Demo data persists via **Netlify Blobs** on production (local file store in `data/db.json` for development).
