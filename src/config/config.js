/* ==========================================================================
   KAWSAH — CENTRAL CONFIGURATION (single source of truth)
   --------------------------------------------------------------------------
   Change a URL, phone number, GA4 ID, product mode, or form provider HERE and
   it updates everywhere. Do not scatter these values through the codebase.

   Anything not yet finalized is marked TODO_CONFIGURE. Links that resolve to
   TODO_CONFIGURE are treated as "not set" and hidden gracefully at render
   time (see src/lib/destinations.js) — no broken links ever ship.
   ========================================================================== */

export const TODO = "TODO_CONFIGURE";

/** true when a config value has been set to something real. */
export const isSet = (v) => typeof v === "string" && v.trim() !== "" && v !== TODO;

export const CONFIG = {
  /* ---- Brand ---------------------------------------------------------- */
  brand: {
    name: "Kawsah",
    legalName: "Kawsah",
    // NOTE: keep this domain in sync with `site` in astro.config.mjs.
    domain: "https://www.kawsah.com",
    tagline: "Your Path to Homeownership",
    // Longer promise used in hero / marketing copy.
    promise: "Understand your options. Know your next move. Get connected when you're ready.",
    founded: 2018,
    description:
      "Kawsah is a mortgage intelligence and homeownership navigation platform. Understand your options, find your next step, and connect to the right financing path when you're ready.",
    logo: "/logo.png",
    ogImage: "/logo.png", // Replace with a dedicated 1200x630 OG image when available.
  },

  /* ---- Contact / conversion (your money links live here) -------------- */
  contact: {
    email: "info@kawsah.com",
    phoneDisplay: "(801) 996-4233",
    phoneHref: "tel:+18019964233",
    // Where "Apply" CTAs go. On-site Netlify-backed intake form at /apply
    // (replaced the Typeform link — free tier capped submissions at ~10/mo).
    applicationUrl: "/apply",
    // Where "Book a call" CTAs go:
    bookingUrl: "https://calendly.com/kawsah/15min",
    // Physical location powers LocalBusiness schema. Leave TODO to omit address.
    address: {
      city: "Salt Lake City",
      region: "UT",
      country: "US",
      streetAddress: TODO,
      postalCode: TODO,
    },
  },

  /* ---- Licensing / compliance ---------------------------------------- */
  license: {
    originator: "Marcelo Bayon",
    nmls: "1851997",
    // Your sponsoring company + its NMLS (required on most MLO disclosures).
    companyName: "RoBUS Mortgage",
    companyNmls: "1687346",
    equalHousing: true,
  },

  /* ---- Analytics (GA4) ------------------------------------------------ */
  analytics: {
    ga4Id: "G-ZSMNF2D2R6",
    enabled: true,
  },

  /* ---- Forms provider (switch in ONE place) --------------------------
     provider: "netlify" | "apps_script" | "mailerlite"
     Switching providers requires NO UI changes — see src/lib/forms.js. */
  forms: {
    provider: "netlify",
    netlify: {
      // Netlify Forms needs no endpoint; submissions are captured automatically.
    },
    apps_script: {
      // Paste your Google Apps Script Web App URL (…/exec).
      endpoint: TODO,
    },
    mailerlite: {
      // Classic embedded form POST action, e.g. https://assets.mailerlite.com/jsonp/XXXX/forms/YYYY/subscribe
      formActionUrl: TODO,
    },
  },

  /* ---- Products (pricing/mode placeholders) --------------------------
     mode: "free" | "paid". price: null until finalized. Switch free<->paid
     by changing `mode` here; pages re-render accordingly (no redesign). */
  products: {
    houseHunting:       { mode: "free", price: null, checkoutUrl: "" },
    purchasePlaybook:   { mode: "free", price: null, checkoutUrl: "" },
    homebuyerBundle:    { mode: "paid", price: null, checkoutUrl: "" },
    professionalBundle: { mode: "paid", price: null, checkoutUrl: "" },
  },

  /* ---- Community ------------------------------------------------------ */
  community: {
    // External community/forum URL (Circle, Skool, Discord, etc.). Hidden until set.
    url: TODO,
  },

  /* ---- Social profiles (shown in footer + Organization sameAs) -------- */
  social: {
    facebook: "https://www.facebook.com/kawsah",
    instagram: "https://www.instagram.com/kawsah/",
    youtube: "https://www.youtube.com/channel/UCgYcKVeMn6DJ_bkvp519onA",
    linkedin: "https://www.linkedin.com/company/kawsah",
    twitter: "https://twitter.com/kawsah1",
    tumblr: "https://kawsah.tumblr.com/",
  },

  /* ---- Ecosystem destinations (cross-graph routing) ------------------
     Change any partner URL here; every link + route CTA follows. */
  destinations: {
    kawsah: {
      name: "Kawsah",
      url: "https://www.kawsah.com",
      // Convenience mirrors of contact.* so route data can point at "kawsah":
      applyUrl: "/apply",
      callUrl: "https://calendly.com/kawsah/15min",
    },
    mitig8: {
      name: "Mitig8 AI",
      url: "https://www.mitig8.cloud",
      blurb: "Self-employed income analysis (tax-return income, add-backs, qualifying-income scenarios).",
    },
    nonqm: {
      name: "NonQM Capital",
      url: "https://www.nonqmcapital.net",
      blurb: "Alternative financing: bank statement, DSCR, bridge, foreign national, investment, 5–10 unit.",
    },
    corporateCapitalMap: {
      name: "Corporate Capital Map",
      url: "https://corporatecapitalmap.com",
      blurb: "Business and working capital to grow a company (not a mortgage on a property).",
    },
    northReserve: {
      name: "NorthReserve",
      url: "https://www.northreserve.org",
      blurb: "Personal financial readiness — spending, reserves, and your broader financial position.",
    },
    stopLosingMortgages: {
      name: "Stop Losing Mortgages",
      url: "https://stoplosingmortgages.com",
      blurb: "For lenders who want professional Mitig8 software.",
    },
  },
};

export default CONFIG;
