/* ==========================================================================
   Build step: generate machine-readable data files from the app's own source
   of truth (src/data/routes.js + src/config/config.js) so they never drift.
   Runs automatically before `astro build` (see package.json "prebuild").
   Outputs:
     public/data/routes.json   — the full route matrix (section 42)
     public/kawsah-tools.json  — WebMCP-style tool manifest (section 29)
     public/llms.txt           — llms.txt guide for AI systems
   ========================================================================== */
import { writeFileSync } from "node:fs";
import { toMatrixJSON, ROUTES } from "../src/data/routes.js";
import { CONFIG, isSet } from "../src/config/config.js";

const pub = new URL("../public/", import.meta.url);
const out = (rel) => new URL(rel, pub);
const now = new Date().toISOString();

/* ---- routes.json ------------------------------------------------------- */
const matrix = {
  name: "Kawsah Route Matrix",
  generatedAt: now,
  brand: CONFIG.brand.name,
  domain: CONFIG.brand.domain,
  count: ROUTES.length,
  columns: [
    "userIntent", "asset", "routeId", "type", "lifecycleStage", "audience",
    "nextQuestion", "destination", "page", "ecosystemKey", "primaryCTA",
    "secondaryCTA", "ga4Event", "webmcpFunction", "monetization", "nextEcosystemNode",
  ],
  routes: toMatrixJSON(),
};
writeFileSync(out("data/routes.json"), JSON.stringify(matrix, null, 2) + "\n");

/* ---- kawsah-tools.json (WebMCP-ready manifest) ------------------------- */
const manifest = {
  name: "Kawsah Tools",
  version: "1.0.0",
  description:
    "Educational mortgage-planning tools. Estimates only — not loan offers, approvals, or eligibility determinations. Functions live in src/lib/calc-network.js and are UI-free/pure so they can be exposed to compatible systems later.",
  homepage: CONFIG.brand.domain,
  tools: [
    {
      name: "calculateAffordability",
      description: "Estimate a home purchase price from user-provided income, debts, down payment, and rate assumptions.",
      inputs: ["annualIncome", "monthlyDebts", "downPayment", "annualRatePct", "termYears", "maxBackEndDTI"],
    },
    {
      name: "calculateMortgagePayment",
      description: "Estimate a monthly mortgage payment (principal & interest, optionally taxes, insurance, HOA, PMI).",
      inputs: ["loanAmount", "annualRatePct", "termYears", "propertyTaxAnnual", "homeInsuranceAnnual", "hoaMonthly", "pmiMonthly"],
    },
    {
      name: "calculateCashToClose",
      description: "Estimate cash needed to close: down payment plus closing costs and prepaids, less credits.",
      inputs: ["purchasePrice", "downPaymentPct", "downPaymentAmount", "closingCostPct", "prepaidsEstimate", "sellerCredits", "earnestMoneyPaid"],
    },
    {
      name: "calculateRefiBreakeven",
      description: "Estimate the number of months required to recover refinance closing costs from monthly savings.",
      inputs: ["currentPayment", "newPayment", "closingCosts", "newLoanAmount", "newRatePct", "newTermYears"],
    },
    {
      name: "calculateDTI",
      description: "Estimate front-end and back-end debt-to-income ratios from monthly income, debts, and housing payment.",
      inputs: ["monthlyIncome", "monthlyDebts", "proposedHousingPayment"],
    },
    {
      name: "calculateDownPayment",
      description: "Convert between a down payment percentage and dollar amount for a given price.",
      inputs: ["price", "pct", "amount"],
    },
    {
      name: "findKawsahRoute",
      description: "Identify the appropriate educational/financing-navigation route from a user's stated intent. Navigation only; never an eligibility decision.",
      inputs: ["goal", "firstTime", "stage", "selfEmployed", "incomeDoc", "challenge", "foreignNational", "units", "homeowner"],
    },
  ],
  disclaimer:
    "All tools produce estimates for education and planning. Results depend on assumptions and do not represent loan offers, approvals, rates, or guarantees.",
};
// Planned functions: every webmcpFunction referenced by a route that isn't an
// implemented tool above. Listed so the manifest matches the route matrix,
// clearly marked "planned" — nothing is faked as a live endpoint.
const IMPLEMENTED = new Set(manifest.tools.map((t) => t.name));
const PLANNED_DESC = {
  houseHuntingWorkspace: "Organize and compare candidate homes in a workspace.",
  findFinancialReadinessRoute: "Route a user to financial-readiness resources based on their obstacle.",
  expenseTracking: "Structured expense-tracking workspace.",
  calculateQualifyingIncome: "Estimate qualifying income for self-employed borrowers (specialized — see Mitig8).",
  findInvestmentRoute: "Route investment-property scenarios to the right financing pathway.",
  findBusinessCapitalRoute: "Route business-capital needs to the right funding pathway.",
  homeownerToolRoute: "Route homeowners to the right post-close tool.",
  lifeManagementRoute: "Route to household / life-organization tools.",
  findHomeownerRoute: "Route across the homeowner lifecycle.",
  findProfessionalRoute: "Route real-estate professionals to the right toolkit.",
};
manifest.plannedFunctions = [...new Set(ROUTES.map((r) => r.webmcpFunction).filter(Boolean))]
  .filter((fn) => !IMPLEMENTED.has(fn))
  .sort()
  .map((fn) => ({ name: fn, status: "planned", description: PLANNED_DESC[fn] || "Planned ecosystem navigation function; not yet implemented." }));

writeFileSync(out("kawsah-tools.json"), JSON.stringify(manifest, null, 2) + "\n");

/* ---- llms.txt ---------------------------------------------------------- */
const line = (label, href, note) => `- [${label}](${href})${note ? `: ${note}` : ""}`;
const pages = ROUTES.filter((r) => r.page).map((r) => line(r.title, r.page, r.intent));
const ecosystem = Object.entries(CONFIG.destinations)
  .filter(([k]) => k !== "kawsah")
  .filter(([, d]) => isSet(d.url))
  .map(([, d]) => line(d.name, d.url, d.blurb || ""));

const llms = `# ${CONFIG.brand.name}
> ${CONFIG.brand.tagline}

${CONFIG.brand.description}

Kawsah is a mortgage intelligence + financing route graph. Every tool leads to a clear next step. Tools produce estimates only and are not loan offers, approvals, or eligibility determinations.

## Start here
${line("Find My Path (route finder)", "/route-finder/", "answer a few questions, get one best next step")}
${isSet(CONFIG.contact.applicationUrl) ? line("Apply", CONFIG.contact.applicationUrl, "start a mortgage application") : ""}
${isSet(CONFIG.contact.bookingUrl) ? line("Book a call", CONFIG.contact.bookingUrl, "15-minute call") : ""}

## Pages & guides
${pages.join("\n")}

## Ecosystem (cross-graph routing)
${ecosystem.join("\n")}

## Machine-readable data
- [Route matrix](/data/routes.json)
- [Tool manifest](/kawsah-tools.json)

## Contact
${CONFIG.license.originator}, Mortgage Loan Originator, NMLS #${CONFIG.license.nmls}
Email: ${CONFIG.contact.email} · Phone: ${CONFIG.contact.phoneDisplay}
`.replace(/\n{3,}/g, "\n\n");
writeFileSync(out("llms.txt"), llms);

console.log(
  `gen-data: wrote public/data/routes.json (${matrix.count} routes), public/kawsah-tools.json (${manifest.tools.length} tools), public/llms.txt`
);
