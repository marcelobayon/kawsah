# Kawsah Brand Guide

*Your Path to Homeownership.* — established 2018.

This is the single reference for how Kawsah looks, sounds, and connects. The
website (`src/`) implements every token here; change a value in
`src/config/config.js` or `src/styles/global.css` and the site follows.

---

## 1. Brand essence

**What Kawsah is:** a mortgage‑intelligence and homeownership‑navigation
platform. Not a brochure — a **route graph** that turns every guide, calculator,
and template into a clear next step, and connects people to the right financing
path when they're ready.

**Promise:** *Understand your options. Know your next move. Get connected when
you're ready.*

**Tagline (short):** *Your Path to Homeownership.*

**One‑liner:** Kawsah helps home buyers and real‑estate professionals make
better decisions — so they can buy with confidence and a white‑glove experience.

### Mission
Help home buyers and real‑estate professionals make better decisions — a
white‑glove, jargon‑free path from *"I don't know what to do"* to *"I know my
next move."*

### Vision
An ecosystem of connected tools — Kawsah alongside NorthReserve, Mitig8, NonQM
Capital, and Corporate Capital Map — that guides every buyer and professional to
the right next step.

### Values
- **Clarity over jargon** — plain language, always.
- **Integrity** — honest recommendations; never a guarantee we can't make.
- **Tenacity** — we lean into the hard, non‑standard situations.
- **Perpetual improvement** — the tools get better every cycle.
- **White‑glove service** — the experience should feel personal and calm.

---

## 2. Ecosystem positioning (the micro‑graphs)

Kawsah is the **consumer‑facing hub**. It reads a person's intent and routes
them — by *intent*, not keyword — to the specialist graph that fits, then brings
them back.

| Graph | Use it for | Domain |
|---|---|---|
| **Kawsah** | Buying, refinancing, the whole journey + homeowner tools | kawsah.com |
| **NorthReserve** | Financial readiness — spending, reserves, broader position | northreserve.org |
| **Mitig8** | Self‑employed income analysis (tax returns, add‑backs) | mitig8.cloud |
| **NonQM Capital** | Alternative financing — bank statement, DSCR, bridge, foreign national, 5–10 unit | nonqmcapital.net |
| **Corporate Capital Map** | Business / working capital (not a mortgage) | corporatecapitalmap.com |
| **Stop Losing Mortgages** | Mitig8 software for lenders | stoplosingmortgages.com |

---

## 3. Logo

- **Primary lockup:** the K‑with‑a‑path monogram over the "KAWSAH" wordmark and
  the "Your Path to Homeownership" tagline (`public/logo.png`). Use on light /
  near‑white backgrounds. On the site it sits in a soft rounded card so its
  built‑in background reads as intentional.
- **App mark:** a simplified **K formed with a road** — a dark‑teal stem, a
  bright‑teal "road" upper arm with a dashed centerline, a mid‑teal lower arm.
  Used in the header, footer, and favicon as inline SVG (scales crisply).
- **Clear space:** keep at least the height of the K's stem clear on all sides.
- **Minimum size:** mark no smaller than 24px tall; full lockup no smaller than
  120px wide.
- **Don't:** recolor outside the palette, stretch, add effects, or place the
  lockup on a busy or low‑contrast background.

---

## 4. Color

| Token | Hex | Role |
|---|---|---|
| `--white` | `#FEFEFE` | Primary page background |
| `--paper` | `#F8F9F0` | Warm secondary background (alternating sections) |
| `--teal-900` | `#114844` | Deep teal — headings, primary buttons, footer |
| `--teal-700` | `#287A74` | Mid teal — links, secondary accents |
| `--teal-400` | `#0DB8AD` | Bright teal — accents, focus ring, accent buttons |
| `--ink` | `#0D1212` | Near‑black body text |

**Contrast rules (WCAG):**
- Body text: `--ink` on white/paper. Headings/links: `--teal-900` / `--teal-700`.
- **Bright teal `#0DB8AD` is never text on white** (fails contrast). Use it for
  accent‑button backgrounds (with `--ink` text), borders, focus rings, and small
  decorative marks only.
- Accent button = `--teal-400` bg + `--ink` text. Primary button = `--teal-900`
  bg + white text.

Derived surfaces: `--teal-50 #EAF6F4` (faint wash bands), hairline border
`rgba(17,72,68,0.14)`.

---

## 5. Typography

- **Display / headings:** a serif stack — `"Iowan Old Style", "Palatino
  Linotype", Palatino, Georgia, serif`. Editorial, trustworthy, premium.
- **Body / UI:** a system sans stack — `-apple-system, "Segoe UI", Roboto,
  Helvetica Neue, Arial, sans-serif`. Fast, no web‑font downloads.
- **Scale:** fluid `clamp()` steps from `--step--1` (~0.85rem) to `--step-5`
  (hero, ~4rem). Headings `line-height ~1.12`, body `1.6`.
- **Eyebrows:** uppercase, letter‑spaced, teal‑700, used above section headings.

---

## 6. Spacing, shape, motion

- **Container:** max 1140px (narrow variant 760px), fluid side gutter.
- **Radius:** cards 16px, small elements 10px, pills/buttons 999px.
- **Section rhythm:** generous vertical padding (`clamp(3rem, …, 5.5rem)`);
  alternate white / paper / faint‑teal‑wash backgrounds.
- **Motion:** subtle and purposeful (hover lift, arrow nudge). Respect
  `prefers-reduced-motion` — all of it turns off.

---

## 7. Components

- **Buttons:** Primary (deep‑teal/white), Accent (bright‑teal/ink), Outline
  (bordered), Ghost (text). Pill shape, comfortable tap targets.
- **Cards:** white, hairline border, 16px radius, soft shadow, hover lift.
- **Pills:** stage/type tags; `free` (green) and `paid` (amber) product states.
- **Route card / Next‑step banner:** every asset shows what it is and the single
  next step.
- **CTA band:** deep‑teal gradient, centered, roomy — the "get connected" moment.

---

## 8. Voice & tone

Kawsah sounds like a **calm, expert advisor** — the friend who happens to know
mortgages and tells you the truth.

- **Clear, not clever.** Short sentences. Plain words over industry jargon.
- **Always answer "what do I do next?"** Every page ends with one next step.
- **Honest.** Estimates are estimates. Never promise approval, savings, rates,
  or timelines. Educational, not a guarantee.
- **Warm and unhurried.** "No pressure, no obligation." Meet people where they
  are (the two doors: *I know what I want* / *help me figure it out*).
- **Avoid:** hype, fake urgency, "lowest rates," "guaranteed," dense mortgage
  acronyms without explanation.

---

## 9. Compliance in copy

- Show the originator + NMLS (`Marcelo Bayon, NMLS #1851997`) and, once set, the
  sponsoring company + company NMLS. Include *Equal Housing Opportunity*.
- Calculators and tools are **estimates for planning only** — not offers,
  approvals, rates, or guarantees.
- Don't state a specific loan program is available unless configured.

---

## 10. Social & contact

- Facebook /kawsah · Instagram @kawsah · YouTube (Kawsah) · LinkedIn /company/kawsah · X @kawsah1 · Tumblr kawsah.tumblr.com
- Email info@kawsah.com · Phone (801) 996‑4233
- **Payment methods** (for future paid products): Credit Card, PayPal, Venmo.

---

*All brand tokens live in `src/config/config.js` (identity, URLs, social) and
`src/styles/global.css` (`:root` color + type + spacing tokens).*
