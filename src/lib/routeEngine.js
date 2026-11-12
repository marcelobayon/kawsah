/* ==========================================================================
   KAWSAH — Route Engine (pure, deterministic, UI-free)
   --------------------------------------------------------------------------
   Maps a user's stated circumstances to ONE primary next step (plus a few
   secondary options) drawn from the route matrix. It is a NAVIGATION and
   EDUCATION engine. It NEVER says a user qualifies for a loan or makes an
   underwriting decision — it points to the right pathway to explore.

   Context is a plain object; every key is optional. Order of checks encodes
   priority so a single most-relevant route is chosen and the user's PRIMARY
   intent is preserved (e.g. business financing beats "self-employed").
   ========================================================================== */
import { getRoute, routeTargetHref } from "../data/routes.js";

export const CONTEXT_SHAPE = {
  goal: "purchase|refinance|investment|business|financial_readiness|not_sure",
  firstTime: "yes|no",
  stage: "planning|shopping|ready",
  selfEmployed: "yes|no",
  incomeDoc: "tax_returns|alternative|na",
  challenge: "affordability|cash|income_docs|financial_readiness|timing|property_type|business_capital|none",
  foreignNational: "yes|no",
  units: "1_4|5_10",
  homeowner: "yes|no",
};

export const SHARED_DISCLAIMER =
  "This points you to an educational pathway based on your answers. It is not a determination that you qualify for any loan, and it is not financial, legal, or tax advice. A lender or qualified professional will need to verify your specific details.";

const GENERIC_QUESTIONS = [
  "What documentation should I prepare for my situation?",
  "What loan structures fit my goals and timeline?",
];

/** Decide the primary routeId and up to two secondary routeIds. */
function decide(ctx = {}) {
  const g = ctx.goal;
  const ch = ctx.challenge;

  if (g === "business" || ch === "business_capital")
    return { primary: "CORPORATE_CAPITAL_MAP_BUSINESS", secondary: [] };

  if (g === "financial_readiness" || ch === "financial_readiness")
    return {
      primary: "NORTHRESERVE_FINANCIAL_READINESS",
      secondary: ["NORTHRESERVE_EXPENSE_TRACKING", "KAWSAH_AFFORDABILITY"],
    };

  if (ctx.foreignNational === "yes")
    return { primary: "NONQM_FOREIGN_NATIONAL", secondary: ["KAWSAH_AFFORDABILITY"] };

  if (ctx.units === "5_10")
    return { primary: "NONQM_5_TO_10_UNIT", secondary: ["NONQM_DSCR"] };

  if (ch === "timing")
    return { primary: "NONQM_BRIDGE", secondary: ["KAWSAH_CASH_TO_CLOSE"] };

  if (g === "investment")
    return { primary: "NONQM_INVESTMENT", secondary: ["NONQM_DSCR"] };

  if (g === "refinance")
    return { primary: "KAWSAH_REFINANCE", secondary: ["KAWSAH_REFI_BREAKEVEN"] };

  if (ctx.selfEmployed === "yes") {
    if (ctx.incomeDoc === "alternative")
      return { primary: "NONQM_BANK_STATEMENT", secondary: ["MITIG8_SELF_EMPLOYED"] };
    return {
      primary: "MITIG8_SELF_EMPLOYED",
      secondary: ["MITIG8_INCOME_ANALYSIS", "NONQM_BANK_STATEMENT"],
    };
  }

  if (ch === "cash")
    return { primary: "KAWSAH_CASH_TO_CLOSE", secondary: ["KAWSAH_AFFORDABILITY"] };

  if (ch === "affordability")
    return {
      primary: "KAWSAH_AFFORDABILITY",
      secondary: ["KAWSAH_FIRST_TIME_BUYER", "NORTHRESERVE_FINANCIAL_READINESS"],
    };

  if (ctx.homeowner === "yes" && (g === "not_sure" || !g))
    return { primary: "KAWSAH_HOME_MANAGEMENT", secondary: ["KAWSAH_HOME_INVENTORY"] };

  if (g === "purchase") {
    if (ctx.firstTime === "yes")
      return {
        primary: "KAWSAH_FIRST_TIME_BUYER",
        secondary: ["KAWSAH_AFFORDABILITY", "NORTHRESERVE_FINANCIAL_READINESS"],
      };
    if (ctx.stage === "shopping")
      return {
        primary: "KAWSAH_HOUSE_HUNTING",
        secondary: ["KAWSAH_AFFORDABILITY", "KAWSAH_CASH_TO_CLOSE"],
      };
    if (ctx.stage === "ready")
      return { primary: "KAWSAH_PURCHASE", secondary: ["KAWSAH_CASH_TO_CLOSE"] };
    return {
      primary: "KAWSAH_AFFORDABILITY",
      secondary: ["KAWSAH_FIRST_TIME_BUYER"],
    };
  }

  // Default: help them orient.
  return {
    primary: "KAWSAH_PURCHASE_PLAYBOOK",
    secondary: ["NORTHRESERVE_FINANCIAL_READINESS", "KAWSAH_AFFORDABILITY"],
  };
}

function summarize(routeId) {
  const route = getRoute(routeId);
  if (!route) return null;
  const target = routeTargetHref(route);
  return {
    routeId: route.id,
    title: route.title,
    url: target.url,
    external: target.external,
    destination: route.primaryDestination,
  };
}

/**
 * Deterministic router. Returns a structured RouteResult with a resolved,
 * always-working primary CTA and up to two secondary options.
 */
export function findKawsahRoute(ctx = {}) {
  const { primary, secondary } = decide(ctx);
  const route = getRoute(primary);
  if (!route) {
    return { ok: false, error: "No route matched.", disclaimer: SHARED_DISCLAIMER };
  }
  const target = routeTargetHref(route);
  const secondaryRoutes = (secondary || [])
    .map(summarize)
    .filter(Boolean)
    .filter((s) => s.routeId !== primary);

  return {
    ok: true,
    primaryRoute: route.id, // alias used in spec sample
    routeId: route.id,
    lifecycleStage: route.lifecycleStage,
    intentCategory: ctx.goal || "general",
    recommendedTool: route.title,
    nextQuestion: route.nextQuestion,
    primaryCTA: route.primaryCTA,
    primary: {
      label: route.primaryCTA,
      url: target.url,
      external: target.external,
      routeId: route.id,
      destination: route.primaryDestination,
    },
    secondaryRoutes,
    questionsForProfessional: GENERIC_QUESTIONS,
    assumptions: [
      "Routing is based only on the answers you provided.",
      "Categories are educational starting points, not eligibility determinations.",
    ],
    disclaimer: SHARED_DISCLAIMER,
  };
}

/** Alias kept for the WebMCP manifest / spreadsheet naming. */
export const findMortgageRoute = findKawsahRoute;

export default findKawsahRoute;
