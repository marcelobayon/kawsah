/* ==========================================================================
   Unit tests for the pure calculator + route-engine functions.
   Run: npm test   (node scripts/test-calc.mjs)
   These import the SAME modules the UI imports — no mocks.
   ========================================================================== */
import {
  calculateMortgagePayment,
  calculateAffordability,
  calculateCashToClose,
  calculateRefiBreakeven,
  calculateDTI,
  calculateDownPayment,
} from "../src/lib/calc-network.js";
import { findKawsahRoute } from "../src/lib/routeEngine.js";

let pass = 0;
let fail = 0;
const results = [];
function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    results.push(`  ok   ${name}`);
  } else {
    fail++;
    results.push(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const between = (v, lo, hi) => typeof v === "number" && v >= lo && v <= hi;

/* ---- Mortgage payment -------------------------------------------------- */
const mp = calculateMortgagePayment({ loanAmount: 300000, annualRatePct: 6.5, termYears: 30 });
check("mortgage: 300k/6.5%/30y P&I ≈ 1896", between(mp.principalAndInterest, 1895, 1898), `got ${mp.principalAndInterest}`);
const mpFull = calculateMortgagePayment({
  loanAmount: 300000, annualRatePct: 6.5, termYears: 30,
  propertyTaxAnnual: 3600, homeInsuranceAnnual: 1200, hoaMonthly: 50, pmiMonthly: 100,
});
// taxes 3600/yr=300, ins 1200/yr=100, hoa 50, pmi 100 => +550/mo
check("mortgage: PITI adds taxes/ins/hoa/pmi", between(mpFull.totalMonthly, mp.principalAndInterest + 549, mp.principalAndInterest + 551), `got ${mpFull.totalMonthly}`);
const zero = calculateMortgagePayment({ loanAmount: 120000, annualRatePct: 0, termYears: 10 });
check("mortgage: 0% rate = principal/months", zero.principalAndInterest === 1000, `got ${zero.principalAndInterest}`);

/* ---- DTI --------------------------------------------------------------- */
const dti = calculateDTI({ monthlyIncome: 8000, monthlyDebts: 500, proposedHousingPayment: 2000 });
check("dti: back-end 31.25%", between(dti.backEndPct, 31.2, 31.3), `got ${dti.backEndPct}`);
check("dti: front-end 25%", between(dti.frontEndPct, 24.9, 25.1), `got ${dti.frontEndPct}`);
check("dti: zero income safe", calculateDTI({ monthlyIncome: 0 }).backEnd === 0);

/* ---- Cash to close ----------------------------------------------------- */
const ctc = calculateCashToClose({ purchasePrice: 400000, downPaymentPct: 5, closingCostPct: 3 });
check("cash-to-close: 400k @5% + 3% = 32000", ctc.totalCashToClose === 32000, `got ${ctc.totalCashToClose}`);
const ctc2 = calculateCashToClose({ purchasePrice: 400000, downPaymentAmount: 80000, closingCostPct: 3, sellerCredits: 5000 });
check("cash-to-close: amount + seller credit", ctc2.totalCashToClose === 80000 + 12000 - 5000, `got ${ctc2.totalCashToClose}`);
check("cash-to-close: never negative", calculateCashToClose({ purchasePrice: 100000, downPaymentPct: 0, closingCostPct: 0, sellerCredits: 999999 }).totalCashToClose === 0);

/* ---- Refi break-even --------------------------------------------------- */
const refi = calculateRefiBreakeven({ currentPayment: 2000, newPayment: 1800, closingCosts: 6000 });
check("refi: break-even 30 months", refi.breakevenMonths === 30, `got ${refi.breakevenMonths}`);
const refiNo = calculateRefiBreakeven({ currentPayment: 1800, newPayment: 1900, closingCosts: 6000 });
check("refi: no savings → null break-even", refiNo.breakevenMonths === null && refiNo.savesMoney === false);
const refiDerived = calculateRefiBreakeven({ currentPayment: 2100, newLoanAmount: 300000, newRatePct: 6.5, newTermYears: 30, closingCosts: 5000 });
check("refi: derives new payment from terms", between(refiDerived.newPayment, 1895, 1898), `got ${refiDerived.newPayment}`);

/* ---- Affordability ----------------------------------------------------- */
const aff = calculateAffordability({ annualIncome: 120000, monthlyDebts: 500, downPayment: 40000, annualRatePct: 6.5, termYears: 30 });
check("affordability: sensible price range", between(aff.estimatedPrice, 450000, 650000), `got ${aff.estimatedPrice}`);
check("affordability: loan = price - down", aff.estimatedLoan === aff.estimatedPrice - 40000, `got ${aff.estimatedLoan}`);
check("affordability: exposes assumptions", Array.isArray(aff.assumptions) && aff.assumptions.length >= 3);
check("affordability: zero income → 0 payment", calculateAffordability({ annualIncome: 0, monthlyDebts: 0, downPayment: 0 }).maxMonthlyPayment === 0);

/* ---- Down payment ------------------------------------------------------ */
check("down payment: 20% of 500k = 100k", calculateDownPayment({ price: 500000, pct: 20 }).amount === 100000);
check("down payment: amount → pct", calculateDownPayment({ price: 500000, amount: 50000 }).pct === 10);

/* ---- Route engine ------------------------------------------------------ */
check("route: business → CCM", findKawsahRoute({ goal: "business" }).primaryRoute === "CORPORATE_CAPITAL_MAP_BUSINESS");
check("route: CCM CTA points to corporatecapitalmap", /corporatecapitalmap/.test(findKawsahRoute({ goal: "business" }).primary.url));
check("route: self-employed + tax returns → Mitig8", findKawsahRoute({ selfEmployed: "yes", incomeDoc: "tax_returns" }).primaryRoute === "MITIG8_SELF_EMPLOYED");
check("route: self-employed + alt docs → NonQM bank statement", findKawsahRoute({ selfEmployed: "yes", incomeDoc: "alternative" }).primaryRoute === "NONQM_BANK_STATEMENT");
check("route: refinance → Kawsah refinance", findKawsahRoute({ goal: "refinance" }).primaryRoute === "KAWSAH_REFINANCE");
check("route: investment → NonQM investment", findKawsahRoute({ goal: "investment" }).primaryRoute === "NONQM_INVESTMENT");
check("route: financial readiness → NorthReserve", findKawsahRoute({ challenge: "financial_readiness" }).primaryRoute === "NORTHRESERVE_FINANCIAL_READINESS");
check("route: purchase + first-time → FTB", findKawsahRoute({ goal: "purchase", firstTime: "yes" }).primaryRoute === "KAWSAH_FIRST_TIME_BUYER");
check("route: purchase + shopping → house hunting", findKawsahRoute({ goal: "purchase", stage: "shopping" }).primaryRoute === "KAWSAH_HOUSE_HUNTING");
check("route: 5-10 units → NonQM small multifamily", findKawsahRoute({ units: "5_10" }).primaryRoute === "NONQM_5_TO_10_UNIT");
check("route: empty ctx → playbook", findKawsahRoute({}).primaryRoute === "KAWSAH_PURCHASE_PLAYBOOK");
const r = findKawsahRoute({ goal: "purchase", firstTime: "yes" });
check("route: has resolved primary url", typeof r.primary.url === "string" && r.primary.url.length > 0);
check("route: returns disclaimer", typeof r.disclaimer === "string" && r.disclaimer.length > 20);
check("route: secondary routes resolve", Array.isArray(r.secondaryRoutes) && r.secondaryRoutes.every((s) => s.url));

/* ---- report ------------------------------------------------------------ */
console.log("\nKawsah calculator + route-engine tests\n" + "-".repeat(40));
console.log(results.join("\n"));
console.log("-".repeat(40));
console.log(`${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
