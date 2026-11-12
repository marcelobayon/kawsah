/* ==========================================================================
   KAWSAH — Analytics (GA4) utility
   --------------------------------------------------------------------------
   Centralized event tracking. Runs client-side. The gtag base snippet is
   injected once in the <head> by src/layouts/Base.astro using CONFIG.analytics.

   PRIVACY (critical): we track CATEGORIES and BEHAVIOR only. We NEVER send
   income, debts, balances, payments, prices, DTI, tax data, SSNs, loan
   numbers, or any personally identifiable financial value. Enforced two ways:
     1) allowlist — only known categorical params are forwarded;
     2) denylist  — any key whose name looks financial/identifying is dropped.
   ========================================================================== */
import { CONFIG } from "../config/config.js";

/** Canonical event names (import these; don't type strings at call sites). */
export const EVENTS = {
  PAGE_VIEW: "page_view",

  CALCULATOR_VIEWED: "calculator_viewed",
  CALCULATOR_STARTED: "calculator_started",
  CALCULATOR_COMPLETED: "calculator_completed",
  CALCULATOR_CTA_CLICKED: "calculator_cta_clicked",

  TOOL_VIEWED: "tool_viewed",
  TOOL_STARTED: "tool_started",
  TOOL_COMPLETED: "tool_completed",
  TOOL_CTA_CLICKED: "tool_cta_clicked",

  ROUTE_STARTED: "route_started",
  ROUTE_QUESTION_ANSWERED: "route_question_answered",
  ROUTE_COMPLETED: "route_completed",
  ROUTE_RECOMMENDATION_VIEWED: "route_recommendation_viewed",
  ROUTE_CTA_CLICKED: "route_cta_clicked",

  ECOSYSTEM_REFERRAL_CLICKED: "ecosystem_referral_clicked",

  APPLICATION_CTA_CLICKED: "application_cta_clicked",
  BOOKING_CTA_CLICKED: "booking_cta_clicked",

  PRODUCT_VIEWED: "product_viewed",
  CHECKOUT_STARTED: "checkout_started",
  PURCHASE_COMPLETED: "purchase_completed",
  BUNDLE_VIEWED: "bundle_viewed",

  COMMUNITY_JOIN_CLICKED: "community_join_clicked",
  PROFESSIONAL_ROUTE_STARTED: "professional_route_started",

  FORM_SUBMITTED: "form_submitted",
};

/** Only these param keys are ever forwarded to GA4. All are categorical. */
const ALLOWED_PARAMS = new Set([
  "source_asset",
  "source_route",
  "destination_brand",
  "destination_route",
  "asset_type",
  "intent_category",
  "lifecycle_stage",
  "cta_label",
  "tool_name",
  "route_id",
  "product_id",
  "page_path",
  "provider",
  "form_name",
  "question_id",
  "answer_id",
  "value_category",
]);

/** Defense-in-depth: drop any key that looks financial or identifying. */
const DENY_SUBSTRINGS = [
  "income", "salary", "wage", "debt", "balance", "ssn", "social",
  "account", "routing", "loan_number", "loannumber", "amount", "price",
  "payment", "dti", "cash", "deposit", "networth", "net_worth",
  "credit_score", "creditscore", "tax", "email", "phone", "name", "address",
];

function sanitize(params = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    const key = String(k).toLowerCase();
    if (!ALLOWED_PARAMS.has(key)) continue;
    if (DENY_SUBSTRINGS.some((bad) => key.includes(bad))) continue;
    if (v === undefined || v === null || v === "") continue;
    // Force categorical strings; never pass through raw numbers.
    clean[key] = String(v).slice(0, 100);
  }
  return clean;
}

/** Send an event to GA4 (no-op when analytics is disabled or gtag absent). */
export function track(eventName, params = {}) {
  try {
    if (!CONFIG.analytics?.enabled || !CONFIG.analytics?.ga4Id) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", String(eventName), sanitize(params));
  } catch (_) {
    /* analytics must never break the page */
  }
}

/**
 * Delegated click tracking. Add attributes to any link/button:
 *   data-ga-event="ecosystem_referral_clicked"
 *   data-ga-brand="mitig8" data-ga-route="MITIG8_SELF_EMPLOYED"
 *   data-ga-asset="page" data-ga-intent="self_employed"
 *   data-ga-stage="financing" data-ga-cta="Analyze income"
 *   data-ga-tool="Self-Employed Explorer" data-ga-product="homebuyerBundle"
 */
const DATA_MAP = {
  gaBrand: "destination_brand",
  gaRoute: "destination_route",
  gaAsset: "asset_type",
  gaIntent: "intent_category",
  gaStage: "lifecycle_stage",
  gaCta: "cta_label",
  gaTool: "tool_name",
  gaProduct: "product_id",
  gaSourceAsset: "source_asset",
  gaSourceRoute: "source_route",
  gaProvider: "provider",
  gaForm: "form_name",
};

export function initClickTracking() {
  if (typeof document === "undefined") return;
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-ga-event]") : null;
      if (!el) return;
      const params = {};
      for (const [dataKey, param] of Object.entries(DATA_MAP)) {
        if (el.dataset && el.dataset[dataKey]) params[param] = el.dataset[dataKey];
      }
      track(el.dataset.gaEvent, params);
    },
    { capture: true }
  );
}

export default { EVENTS, track, initClickTracking };
