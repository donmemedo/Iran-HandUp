<div dir="rtl">

# دست‌یار | HandUp Iran

پلتفرم کمک هدفمند، شفاف و قابل ردیابی. خیر، خیریه دارای مجوز و مددجو در یک چرخه شفاف به هم وصل می‌شوند: نیاز تأیید می‌شود، کمک جمع می‌شود، به کالا یا خدمت تبدیل می‌گردد و رسید و گزارش مصرف منتشر می‌شود.

</div>

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · framer-motion · next-themes |
| Backend | FastAPI · SQLModel · SQLite (dev) / PostgreSQL (compose) · JWT (PBKDF2) |
| Infra | Docker Compose (db + api + web) |
| i18n | `fa` (RTL, default) and `en` (LTR) — locale-prefixed routes, Persian UX-writing vocabulary |

## Quick start (Docker)

```bash
cp .env.example .env        # optional: set JWT_SECRET
docker compose up --build
```

- Web: http://localhost:3035 (redirects to `/fa`)
- API: http://localhost:8035 · Docs: http://localhost:8035/docs

## Local development

```bash
# backend  → http://localhost:8035
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8035

# frontend → http://localhost:3035
cd frontend
npm install
npm run dev
```

`frontend/.env.local` points the browser at `http://localhost:8035`.

For a production-like local run: `npm run build && npx next start -p 3035`
(Next prints a warning because `output: "standalone"` is enabled for the Docker image — it still serves correctly; inside Docker the entrypoint is `node server.js`.)

## Demo account

`admin@handup.ir` / `handup1234` (seeded together with 9 campaigns, 6 categories and 4 partner charities).

## API

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` · `/api/auth/login` | returns a JWT |
| GET | `/api/auth/me` | current user |
| GET | `/api/campaigns` | `q`, `category`, `city`, `urgent`, `featured`, `sort`, `limit`, `offset` |
| GET | `/api/campaigns/{slug}` | detail + updates + recent donations |
| POST | `/api/campaigns` | auth required |
| POST | `/api/campaigns/{slug}/donate` | auth optional (anonymous giving allowed) |
| GET | `/api/campaigns/{slug}/updates` | transparency reports |
| GET | `/api/me/donations` | auth required |
| GET | `/api/categories` · `/api/organizations` · `/api/stats` · `/api/health` | public |

## Design notes

- Light/dark via `next-themes` (`class` strategy), full system-preference support, no flash on load.
- Brand palette: coral `#FF5C38` → violet `#7C5CFF` → teal `#14B8A6`, aurora mesh backgrounds, glassmorphism, scroll-reveal motion, `prefers-reduced-motion` respected.
- Fully responsive from 320px; RTL/LTR mirrored with logical properties.
- Self-hosted variable fonts (Vazirmatn for fa, Inter for en) — no external font requests at runtime.
- Persian copy follows the UX-writing vocabulary reference (پویش، پیش‌خوان، دیدگاه، مبلغ، حساب کاربری …).

## Roadmap

- [x] Web app (fa/en, light/dark, responsive)
- [x] Docker Compose
- [ ] PWA: service worker, offline shell, install prompt
- [ ] APK via Capacitor / TWA
- [ ] IPA via Capacitor (Xcode build)
- [ ] Real payment gateway (Zarinpal / IDPay), charity panel, CSR panel, QR donation cards
