# FreshFacing — Developer Spec

## What This Is

FreshFacing is an AI-powered website generation SaaS. A business owner enters their existing website URL, the pipeline scrapes it, and Claude + Gemini generate a brand-new premium site in ~3 minutes. The user previews it, pays $20/month, and the site goes live at `businessname.freshfacing.com` with watermark removed and a confirmation email sent automatically.

---

## Architecture Overview

```
User (browser)
    │
    ▼
freshfacing.com  ─────────────────────────  Vercel (Next.js)
    │                                              │
    │  POST /api/leads                             │
    ▼                                              │
Railway (Python HTTP server)  ◄────────────────────
    │
    ├── Firecrawl  (scrape)
    ├── Gemini     (image classification, text extraction, audit)
    ├── Exa        (competitor research, reviews, local market)
    ├── Anthropic  (Claude Opus 4.6 — generates full HTML site)
    ├── Cloudflare Pages  (deploys generated site)
    └── Supabase   (job tracking / cache)

Payment Flow:
    User clicks "Claim This Site"
    → Vercel /api/checkout → Stripe Checkout
    → Stripe webhook → Vercel /api/webhook/stripe
    → Railway /fulfill-payment
        ├── Removes watermark (redeploys to CF Pages)
        ├── Creates DNS CNAME via Cloudflare DNS API
        ├── Attaches custom domain to CF Pages project
        └── Sends confirmation email via Resend
```

---

## Repositories

| Repo                   | Purpose                                                        | Deployed On |
| ---------------------- | -------------------------------------------------------------- | ----------- |
| `freshfacing-frontend` | Next.js app (marketing, scan, checkout, webhook, dashboard)    | Vercel      |
| `freshfacing-pipeline` | Python HTTP server (AI pipeline, site generation, fulfillment) | Railway     |

---

## Frontend Structure (`freshfacing-frontend`)

```
src/app/
├── (marketing)/
│   └── page.tsx              — main landing + scan page
├── api/
│   ├── leads/route.ts        — receives form submission, calls Railway /generate
│   ├── checkout/route.ts     — creates Stripe checkout session
│   ├── checkout/verify/route.ts — verifies Stripe session on success page
│   ├── webhook/stripe/route.ts  — receives Stripe events, calls Railway /fulfill-payment
│   └── dashboard/route.ts    — aggregates CF Pages + Supabase + Stripe for /ff-ops
├── success/page.tsx          — post-payment success page
├── ff-ops/page.tsx           — internal admin dashboard (all leads + Stripe subs)
└── [slug]/                   — (unused — legacy route)

public/js/main.js             — scan UI, polling, intake form, iframe preview
```

---

## Pipeline Structure (`freshfacing-pipeline`)

```
src/
├── pipeline.py    — FreshFacingPipeline class
│                    Phase 1: Firecrawl scrape + image extraction
│                    Phase 1B-J: Gemini classification, text, audit, colors,
│                                Exa research, competitor intel, demographics
│                    Phase 2: Claude Opus 4.6 generates full HTML
│                    Phase 3: Deploy to Cloudflare Pages via wrangler
│
└── server.py      — HTTP server (BaseHTTPRequestHandler)
    Endpoints:
    POST /generate          — kick off pipeline, return job_id
    GET  /jobs/{id}         — poll status (running | done | failed)
    POST /fulfill-payment   — post-payment: remove watermark, DNS, email
    POST /claim-domain      — attach customer's own domain
    POST /test-scrape       — debug: phase 1 only
    GET  /                  — internal test UI
```

---

## User Flow (End to End)

1. User visits `freshfacing.com`, enters their URL
2. Frontend calls `/api/scan` (audit check), shows Site Health Report
3. User fills in name, business name, email → clicks **Get My Free Preview**
4. Frontend calls `POST /api/leads` → Railway `POST /generate` → pipeline starts
5. Frontend polls `GET /jobs/{id}` every 3s until done
6. On done: iframe preview shown inline, "Claim This Site — $20/mo" button appears
7. **Email 1 sent**: preview URL + claim link (via Resend)
8. User clicks claim → `GET /api/checkout?site={public_url}&plan=monthly`
9. Stripe Checkout session created → user pays
10. Stripe fires `checkout.session.completed` webhook to `www.freshfacing.com/api/webhook/stripe`
11. Webhook calls `POST Railway/fulfill-payment` with `{slug, email, public_url, session_id}`
12. Railway `_fulfill()`:
    - Redeploys site to CF Pages without watermark
    - Creates `{slug}.freshfacing.com` CNAME record via CF DNS API
    - Attaches custom domain to CF Pages project
    - **Email 2 sent**: live URL confirmation (via Resend)

---

## Environment Variables

### Vercel (freshfacing-frontend)

| Variable                    | Description                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`         | Stripe secret key (`sk_test_...` or `sk_live_...`)                                        |
| `STRIPE_PRICE_ID`           | Stripe monthly price ID (`price_...`)                                                     |
| `STRIPE_ANNUAL_PRICE_ID`    | Stripe annual price ID (`price_...`)                                                      |
| `STRIPE_WEBHOOK_SECRET`     | Stripe webhook signing secret (`whsec_...`)                                               |
| `SUPABASE_URL`              | Supabase project URL                                                                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT                                                                 |
| `RAILWAY_URL`               | Railway pipeline base URL (e.g. `https://freshfacing-pipeline-production.up.railway.app`) |
| `NEXT_PUBLIC_BASE_URL`      | Public base URL (e.g. `https://freshfacing.com`)                                          |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account ID (for dashboard API)                                                 |
| `CLOUDFLARE_API_TOKEN`      | Cloudflare token with Pages Edit permission                                               |

### Railway (freshfacing-pipeline)

| Variable                    | Description                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`         | Anthropic API key for Claude Opus 4.6                           |
| `CLOUDFLARE_API_TOKEN`      | Cloudflare token with Pages Edit permission                     |
| `CLOUDFLARE_DNS_TOKEN`      | Cloudflare token with Zone DNS Edit permission (separate token) |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account ID                                           |
| `CLOUDFLARE_ZONE_ID`        | Cloudflare zone ID for freshfacing.com                          |
| `EXA_API_KEY`               | Exa search API key                                              |
| `FIRECRAWL_API_KEY`         | Firecrawl scraping API key                                      |
| `RESEND_API_KEY`            | Resend email API key                                            |
| `SUPABASE_URL`              | Supabase project URL                                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT                                       |
| `FRONTEND_URL`              | `https://freshfacing.com`                                       |
| `FRESHFACING_DOMAIN`        | `freshfacing.com`                                               |
| `RAILWAY_STATIC_URL`        | Auto-set by Railway                                             |

---

## Switching to Stripe Live Mode

When ready to take real payments, update these in **Vercel**:

1. `STRIPE_SECRET_KEY` → replace `sk_test_...` with `sk_live_...`
2. `STRIPE_PRICE_ID` → replace test price ID with live price ID from Stripe dashboard
3. `STRIPE_ANNUAL_PRICE_ID` → same, for annual plan
4. `STRIPE_WEBHOOK_SECRET` → create a new webhook in Stripe dashboard pointing to `https://www.freshfacing.com/api/webhook/stripe` (live mode), copy the new `whsec_...` signing secret

In **Stripe dashboard**:

- Go to Developers → Webhooks → Add endpoint
- URL: `https://www.freshfacing.com/api/webhook/stripe`
- Event: `checkout.session.completed`
- Copy signing secret → paste into Vercel as `STRIPE_WEBHOOK_SECRET`

> The webhook URL must point to `www.freshfacing.com` (not `freshfacing.com`) because Stripe does not follow POST redirects.

---

## Deploying Changes

### Frontend (Vercel)

```bash
cd freshfacing-frontend
git add . && git commit -m "your message"
git push
vercel --prod --yes
```

> `git push` alone does not redeploy on Vercel due to protected git scopes. Always run `vercel --prod --yes` after pushing.

### Pipeline (Railway)

```bash
cd freshfacing-pipeline
git add . && git commit -m "your message"
git push
railway up --detach
```

> `railway deployment redeploy` restarts the old container — it does NOT pull new code. Always run `railway up --detach` to build from the latest source.

---

## Admin Dashboard

URL: `https://freshfacing.com/ff-ops`

Shows:

- All generated sites (sourced from Cloudflare Pages API + Supabase)
- All Stripe subscriptions
- Auto-refreshes every 60 seconds
- Manual refresh button

No authentication — keep the URL obscure.

---

## DNS Setup (Cloudflare)

The domain `freshfacing.com` is managed on Cloudflare. Key records:

| Type  | Name              | Target                            | Notes                            |
| ----- | ----------------- | --------------------------------- | -------------------------------- |
| A     | `freshfacing.com` | Vercel IPs                        | Proxied                          |
| CNAME | `www`             | `cname.vercel-dns.com`            | Proxied                          |
| CNAME | `*`               | `freshfacing-frontend.vercel.app` | DNS only — wildcard fallback     |
| CNAME | `{slug}`          | `freshfacing-{slug}.pages.dev`    | Added automatically per customer |

When a customer pays, the pipeline automatically creates the `{slug}` CNAME via the Cloudflare DNS API using `CLOUDFLARE_DNS_TOKEN`.

The `CLOUDFLARE_DNS_TOKEN` must have **Zone → DNS → Edit** permission scoped to `freshfacing.com`. The `CLOUDFLARE_API_TOKEN` must have **Cloudflare Pages → Edit** permission. These must be **separate tokens** — a single token with both permissions does not work reliably.

---

## Supabase Schema

Table: `leads`

| Column        | Type      | Notes                                                                |
| ------------- | --------- | -------------------------------------------------------------------- |
| `id`          | int       | auto                                                                 |
| `url`         | text      | normalized URL of scanned site                                       |
| `email`       | text      | NOT NULL (use `""` if unknown)                                       |
| `status`      | enum      | only valid value: `"new"`                                            |
| `audit_score` | int       | nullable                                                             |
| `notes`       | text      | JSON string — stores `job_id`, `slug`, `public_url`, `business_name` |
| `created_at`  | timestamp | auto                                                                 |
| `updated_at`  | timestamp | auto                                                                 |

The pipeline uses `notes` to store all metadata since the enum only allows `"new"`. Cache lookup checks `notes like %public_url%`.

---

## Third-Party Services

| Service          | Used For                                      | Where to find keys                           |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| Stripe           | Payments, subscriptions                       | dashboard.stripe.com → Developers → API Keys |
| Anthropic        | Claude Opus 4.6 site generation               | console.anthropic.com → API Keys             |
| Cloudflare Pages | Hosting generated sites                       | dash.cloudflare.com → Workers & Pages        |
| Cloudflare DNS   | Auto-creating subdomains                      | dash.cloudflare.com → API Tokens             |
| Resend           | Transactional email (`hello@freshfacing.com`) | resend.com → API Keys                        |
| Supabase         | Job tracking, lead storage                    | supabase.com → Project Settings → API        |
| Firecrawl        | Web scraping                                  | firecrawl.dev → Dashboard                    |
| Exa              | Competitor research, review mining            | exa.ai → API                                 |
| Railway          | Pipeline hosting                              | railway.com                                  |
| Vercel           | Frontend hosting                              | vercel.com                                   |

---

## Known Limitations / Further Work

- **Stripe test mode**: All current keys are test keys. Swap for live keys before real customers.
- **Railway auto-deploy**: Railway is not connected to GitHub. Must run `railway up --detach` after every pipeline push.
- **Gemini model**: Currently using `gemini-3-flash-preview` which may change — check Google AI Studio for stable model IDs.
- **Email sender domain**: `hello@freshfacing.com` is verified in Resend. If the domain changes, re-verify DKIM records.
- **Watermark removal**: `_redeploy_without_watermark` reads from `/app/output/{slug}.html`. If Railway restarts, the output directory is cleared — redeploy will fail silently for old slugs. Consider persisting output to R2 or Supabase storage.
- **Cache**: Cache is Supabase-based. If a URL is re-submitted and the Supabase row exists with `public_url` in notes, it returns the cached site instead of regenerating. Existing sites were manually seeded.
- **Custom domains**: Customer can request their own domain (e.g. `yourbusiness.com`) via the `/claim-domain` endpoint. CNAME instructions are sent by email but DNS change must be done by customer.
