# Kawsah — Mortgage Intelligence + Financing Route Graph

Kawsah is a static website (built with [Astro](https://astro.build)) designed to move a visitor
from *"I don't know what to do"* to *"I understand my next step."* It's not a brochure — it's a
**route graph**: every guide, calculator, and template gives an answer and then points to the next
step, connecting to a wider ecosystem (NorthReserve, Mitig8, NonQM Capital, Corporate Capital Map)
when appropriate.

Built as **static HTML per route** (not a single-page app), so every page ships real,
crawlable SEO — unique title, meta description, canonical URL, Open Graph tags, and JSON‑LD — in
the page source. Deploys to Netlify with zero configuration changes.

---

## 1. Requirements

- **Node.js 18 or newer** (built and tested on Node 22).
- npm (ships with Node).

## 2. Install

```bash
npm install
```

## 3. Run locally

```bash
npm run dev
```

Then open the URL it prints (default `http://localhost:4321`).

## 4. Build for production

```bash
npm run build
```

This runs a small pre-build step (`scripts/gen-data.mjs`, which regenerates the machine‑readable
data files) and then outputs the finished static site to **`dist/`**.

Preview the production build locally:

```bash
npm run preview
```

## 5. Deploy to Netlify

**A `netlify.toml` is included** — build command `npm run build`, publish directory `dist`.
Two ways to deploy:

**Option A — Git (recommended).** Push this project to GitHub/GitLab/Bitbucket, then in Netlify
choose *Add new site → Import an existing project* and pick the repo. Netlify reads `netlify.toml`
and builds automatically on every push. Nothing else to configure.

**Option B — Drag & drop.** Run `npm run build`, then drag the resulting **`dist/`** folder onto
the Netlify dashboard. (A prebuilt `dist/` is included in this package so you can do this
immediately, without building.)

Because every route is a real file, **no SPA redirect is needed** and each page is crawlable.
`dist/404.html` is served automatically as the 404 page.

---

## 6. Where to change things

Almost everything you'll want to edit lives in **one file**:
**`src/config/config.js`**. Change a value there and it updates across the whole site.

| You want to change… | Edit | Notes |
|---|---|---|
| Application URL ("Apply") | `config.js` → `contact.applicationUrl` | Currently your Typeform |
| Booking URL ("Book a call") | `config.js` → `contact.bookingUrl` | Currently your Calendly |
| Phone / email | `config.js` → `contact.phoneDisplay`, `contact.phoneHref`, `contact.email` | |
| Address (for local SEO) | `config.js` → `contact.address` | Street/zip are `TODO_CONFIGURE` |
| Company name + NMLS | `config.js` → `license.companyName`, `license.companyNmls` | `TODO_CONFIGURE` until you add them |
| **GA4 measurement ID** | `config.js` → `analytics.ga4Id` | Currently `G-ZSMNF2D2R6` |
| **Forms provider** | `config.js` → `forms.provider` | `"netlify"` \| `"apps_script"` \| `"mailerlite"` |
| Apps Script / MailerLite endpoints | `config.js` → `forms.apps_script.endpoint`, `forms.mailerlite.formActionUrl` | |
| **Product pricing** | `config.js` → `products.<name>.price` | `null` until you set it |
| **Free vs. paid mode** | `config.js` → `products.<name>.mode` | `"free"` (lead form) or `"paid"` (checkout) |
| Product checkout URLs | `config.js` → `products.<name>.checkoutUrl` | |
| Ecosystem partner URLs | `config.js` → `destinations.<name>.url` | Mitig8, NonQM, NorthReserve, etc. |
| Community URL | `config.js` → `community.url` | Hidden until set; shows a waitlist form meanwhile |
| Production domain | `config.js` → `brand.domain` **and** `astro.config.mjs` → `SITE` | Keep both in sync (drives canonicals + sitemap) |

Any value left as `TODO_CONFIGURE` is treated as "not set": the related link is **hidden
gracefully** rather than shipping a broken URL.

Other locations:

- **Routes / the route graph** — `src/data/routes.js` (the full intent→route matrix). Add or edit a
  route here and it participates everywhere. `src/lib/routeEngine.js` decides which route a set of
  answers maps to. `src/data/nav.js` controls the navigation menus.
- **Calculator math** — `src/lib/calc-network.js`. Pure, UI‑free, and unit‑tested. UI components
  call these functions; they never contain math themselves.
- **WebMCP manifest** — generated to `public/kawsah-tools.json` by `scripts/gen-data.mjs` (source of
  truth for the tool list is that script). `public/llms.txt` and `public/data/routes.json` are
  generated the same way.
- **SEO metadata** — per page, in each `src/pages/*.astro` file's frontmatter (`title`,
  `description`, `jsonLd`, `breadcrumbs`). The shared `<head>` lives in `src/components/BaseHead.astro`.
- **Forms** — `src/lib/forms.js` (provider abstraction) and `src/components/LeadForm.astro` (markup).
  Switching `forms.provider` requires **no markup changes**.
- **Design / colors** — `src/styles/global.css` (brand tokens are defined at the top under `:root`).

---

## 7. Project structure

```
kawsah/
├─ netlify.toml            # Netlify build config (no SPA redirect needed)
├─ astro.config.mjs        # Astro + sitemap; SITE domain
├─ package.json
├─ public/                 # served as-is at site root
│  ├─ robots.txt           # references the sitemap
│  ├─ llms.txt             # generated — AI/agent guide to the site
│  ├─ kawsah-tools.json    # generated — WebMCP-style tool manifest
│  ├─ data/routes.json     # generated — full route matrix
│  ├─ logo.png  favicon.svg  site.webmanifest
├─ scripts/
│  ├─ gen-data.mjs         # prebuild: regenerates the 3 generated files above
│  ├─ test-calc.mjs        # unit tests for calculators + route engine
│  └─ check-links.mjs      # internal link checker (run after a build)
└─ src/
   ├─ config/config.js     # ⭐ single source of truth (URLs, GA4, products, forms)
   ├─ data/                # routes.js (matrix), nav.js, assets.js
   ├─ lib/                 # calc-network.js, routeEngine.js, destinations.js,
   │                       #   analytics.js, forms.js, calc-ui.js
   ├─ components/          # Header, Footer, BaseHead, RouteCard, ToolLanding, …
   ├─ layouts/             # Base.astro, Page.astro
   ├─ styles/global.css    # design system (brand tokens)
   └─ pages/               # every route (index, calculators, tools, bundles, 404…)
```

---

## 8. Analytics & privacy

GA4 is wired centrally (`src/lib/analytics.js`). Clicks are tracked by adding `data-ga-*`
attributes to links/buttons — no inline handlers. Events include `route_started`,
`calculator_completed`, `ecosystem_referral_clicked`, `application_cta_clicked`, and more.

**Privacy is enforced in code.** The analytics layer forwards only a fixed allow‑list of
**categorical** parameters (e.g. `intent_category`, `lifecycle_stage`, `destination_brand`) and
additionally strips any key that looks financial or identifying. It will **never** send income,
debts, balances, payments, prices, DTI, tax data, SSNs, or loan numbers to GA4 — calculators run
entirely in the browser and their inputs are never transmitted.

To disable analytics entirely, set `analytics.enabled = false` in `config.js`.

---

## 9. Forms — switching providers

Set `forms.provider` in `config.js` to one of:

- **`"netlify"`** (default) — works out of the box on Netlify. Submissions appear in your Netlify
  dashboard under *Forms*. No endpoint needed.
- **`"apps_script"`** — set `forms.apps_script.endpoint` to your Google Apps Script Web App URL
  (`…/exec`).
- **`"mailerlite"`** — set `forms.mailerlite.formActionUrl` to your MailerLite embedded‑form action
  URL.

The form markup and submit handling are identical across providers, so switching is a one‑line
change. If a provider is selected but its endpoint isn't set, the form still renders and points
people to your email instead of submitting to a broken URL.

---

## 10. Testing

```bash
npm test            # unit tests: calculators + route engine (no build needed)
npm run build       # production build
npm run check:links # internal link checker (run after a build)
```

---

## 11. Configuration still to provide

These ship as clearly‑marked placeholders and should be filled in when you have them:

- **Company name + company NMLS** (`license.companyName`, `license.companyNmls`) — most MLO
  disclosures require your sponsoring company. Shown in the footer once set.
- **Street address + ZIP** (`contact.address`) — improves local SEO structured data.
- **Product prices + checkout URLs** (`products.*`) — pages show "Pricing coming soon" and a
  waitlist form until set. Flip `mode` to `"paid"` and add a `checkoutUrl` to sell.
- **Community URL** (`community.url`) — a waitlist form shows until you point it at your community.
- **A dedicated Open Graph image** — social previews currently use the logo
  (`brand.ogImage`); a 1200×630 image will look better when shared.
- **Apps Script / MailerLite endpoints** — only if you switch off Netlify Forms.

---

## 12. Known limitations

- **External integrations are configuration, not code.** Applications go to your Typeform, booking
  to your Calendly, and ecosystem CTAs to their partner sites. Kawsah links to them; it doesn't
  reimplement them.
- **Homeowner/template "dashboards"** (House Hunting, Home Inventory, etc.) are presented as
  Notion‑style templates you deliver in the customer's own workspace (via the lead form). They are
  positioned honestly as such — the site doesn't claim to store or secure user data.
- **Calculators are estimates**, clearly disclaimed as such throughout. They are not loan offers,
  approvals, rates, or guarantees.
- **The WebMCP manifest is a manifest**, not a live API. The calculator/route functions are
  architected (pure, UI‑free) so they *can* be exposed to compatible systems later; no endpoints
  are faked.
- The Google Analytics script will not load in offline/sandbox previews (it needs the public
  internet) — it loads normally on the deployed site.

---

*Kawsah provides mortgage education and homeownership navigation. Nothing on the site is a loan
offer, approval, or a guarantee of eligibility, savings, rates, or closing times.
Marcelo Bayon, Mortgage Loan Originator, NMLS #1851997.*
