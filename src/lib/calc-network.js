/* ==========================================================================
   KAWSAH — Calculator Network (pure, deterministic, UI-free)
   --------------------------------------------------------------------------
   Every function here is a PURE function of its inputs: no DOM, no globals,
   no side effects. UI components import and call these; tests import and call
   these (see scripts/test-calc.mjs). Calculation logic must never live inside
   a component.

   IMPORTANT: These produce ESTIMATES for education/planning. They are not loan
   offers, approvals, or guarantees. Callers must display the disclaimer.
   ========================================================================== */

/* ---- helpers ------------------------------------------------------------ */
const num = (v, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v.replace(/[^0-9.\-]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const clampMin = (n, min = 0) => (n < min ? min : n);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const roundWhole = (n) => Math.round(n);

/** Monthly amortization factor per $1 of loan (P&I). */
export function monthlyFactor(annualRatePct, termYears) {
  const r = num(annualRatePct) / 100 / 12;
  const n = clampMin(num(termYears), 0) * 12;
  if (n <= 0) return 0;
  if (r === 0) return 1 / n;
  const p = Math.pow(1 + r, n);
  return (r * p) / (p - 1);
}

/* ==========================================================================
   1) Mortgage payment (P&I, plus optional taxes/insurance/HOA/PMI = PITI)
   ========================================================================== */
export function calculateMortgagePayment(input = {}) {
  const loanAmount = clampMin(num(input.loanAmount));
  const annualRatePct = clampMin(num(input.annualRatePct, 6.5));
  const termYears = clampMin(num(input.termYears, 30));
  const factor = monthlyFactor(annualRatePct, termYears);

  const principalAndInterest = round2(loanAmount * factor);
  const monthlyTax = round2(clampMin(num(input.propertyTaxAnnual)) / 12);
  const monthlyInsurance = round2(clampMin(num(input.homeInsuranceAnnual)) / 12);
  const hoaMonthly = round2(clampMin(num(input.hoaMonthly)));
  const pmiMonthly = round2(clampMin(num(input.pmiMonthly)));
  const totalMonthly = round2(
    principalAndInterest + monthlyTax + monthlyInsurance + hoaMonthly + pmiMonthly
  );

  return {
    loanAmount,
    annualRatePct,
    termYears,
    principalAndInterest,
    monthlyTax,
    monthlyInsurance,
    hoaMonthly,
    pmiMonthly,
    totalMonthly,
  };
}

/* ==========================================================================
   2) Debt-to-income ratios (front-end and back-end)
   ========================================================================== */
export function calculateDTI(input = {}) {
  const monthlyIncome = clampMin(num(input.monthlyIncome));
  const monthlyDebts = clampMin(num(input.monthlyDebts));
  const housing = clampMin(num(input.proposedHousingPayment));
  if (monthlyIncome <= 0) {
    return { frontEnd: 0, backEnd: 0, frontEndPct: 0, backEndPct: 0, monthlyIncome, monthlyDebts };
  }
  const frontEnd = housing / monthlyIncome;
  const backEnd = (housing + monthlyDebts) / monthlyIncome;
  return {
    monthlyIncome,
    monthlyDebts,
    proposedHousingPayment: housing,
    frontEnd: round2(frontEnd),
    backEnd: round2(backEnd),
    frontEndPct: round2(frontEnd * 100),
    backEndPct: round2(backEnd * 100),
  };
}

/* ==========================================================================
   3) Affordability — estimate a purchase price from income assumptions
   Solves PITI = maxDTI*income - debts for price, where taxes & insurance
   scale with price. PMI/HOA excluded from the base estimate (noted).
   ========================================================================== */
export function calculateAffordability(input = {}) {
  const annualIncome = clampMin(num(input.annualIncome));
  const monthlyIncome = annualIncome / 12;
  const monthlyDebts = clampMin(num(input.monthlyDebts));
  const downPayment = clampMin(num(input.downPayment));
  const annualRatePct = clampMin(num(input.annualRatePct, 6.5));
  const termYears = clampMin(num(input.termYears, 30));
  const maxBackEndDTI = clampMin(num(input.maxBackEndDTI, 0.43));
  const propertyTaxRateAnnual = clampMin(num(input.propertyTaxRateAnnual, 0.011)); // 1.1%/yr of price
  const insuranceRateAnnual = clampMin(num(input.insuranceRateAnnual, 0.0035)); // 0.35%/yr of price

  const maxMonthlyPayment = round2(clampMin(maxBackEndDTI * monthlyIncome - monthlyDebts));
  const factor = monthlyFactor(annualRatePct, termYears);

  // maxPITI = price*(tax/12 + ins/12 + factor) - down*factor
  const perPrice = propertyTaxRateAnnual / 12 + insuranceRateAnnual / 12 + factor;
  let estimatedPrice = 0;
  if (perPrice > 0) {
    estimatedPrice = (maxMonthlyPayment + downPayment * factor) / perPrice;
  }
  estimatedPrice = clampMin(roundWhole(estimatedPrice));
  const estimatedLoan = clampMin(roundWhole(estimatedPrice - downPayment));

  return {
    annualIncome,
    monthlyIncome: round2(monthlyIncome),
    monthlyDebts,
    downPayment,
    annualRatePct,
    termYears,
    maxBackEndDTI,
    maxMonthlyPayment,
    estimatedPrice,
    estimatedLoan,
    assumptions: [
      `Back-end DTI capped at ${round2(maxBackEndDTI * 100)}%.`,
      `Property tax estimated at ${round2(propertyTaxRateAnnual * 100)}%/yr and insurance at ${round2(
        insuranceRateAnnual * 100
      )}%/yr of price.`,
      `${round2(annualRatePct)}% rate over ${termYears} years.`,
      "Excludes PMI, HOA dues, and loan-program-specific limits.",
    ],
  };
}

/* ==========================================================================
   4) Cash to close — down payment + closing costs + prepaids - credits
   ========================================================================== */
export function calculateCashToClose(input = {}) {
  const purchasePrice = clampMin(num(input.purchasePrice));
  const downPaymentPct = clampMin(num(input.downPaymentPct)); // e.g. 5 for 5%
  const downPaymentAmountInput = num(input.downPaymentAmount, NaN);
  const downPayment = Number.isFinite(downPaymentAmountInput)
    ? clampMin(downPaymentAmountInput)
    : roundWhole(purchasePrice * (downPaymentPct / 100));

  const closingCostPct = clampMin(num(input.closingCostPct, 3)); // % of price
  const closingCosts = roundWhole(purchasePrice * (closingCostPct / 100));
  const prepaids = clampMin(num(input.prepaidsEstimate)); // taxes/insurance escrow setup
  const sellerCredits = clampMin(num(input.sellerCredits));
  const earnestMoney = clampMin(num(input.earnestMoneyPaid));

  const totalCashToClose = clampMin(
    roundWhole(downPayment + closingCosts + prepaids - sellerCredits - earnestMoney)
  );

  return {
    purchasePrice,
    downPayment,
    downPaymentPctEffective: purchasePrice > 0 ? round2((downPayment / purchasePrice) * 100) : 0,
    closingCostPct,
    closingCosts,
    prepaids,
    sellerCredits,
    earnestMoney,
    totalCashToClose,
    assumptions: [
      `Closing costs estimated at ${round2(closingCostPct)}% of purchase price.`,
      "Prepaids (escrow setup) vary by location and closing date.",
      "Actual figures come from a Loan Estimate; this is a planning estimate only.",
    ],
  };
}

/* ==========================================================================
   5) Refinance break-even — months to recover refinance costs
   ========================================================================== */
export function calculateRefiBreakeven(input = {}) {
  const closingCosts = clampMin(num(input.closingCosts));
  let currentPayment = clampMin(num(input.currentPayment));
  let newPayment = num(input.newPayment, NaN);

  // If newPayment not supplied, derive it from loan terms.
  if (!Number.isFinite(newPayment)) {
    const p = calculateMortgagePayment({
      loanAmount: input.newLoanAmount,
      annualRatePct: input.newRatePct,
      termYears: input.newTermYears,
    });
    newPayment = p.principalAndInterest;
  }
  newPayment = clampMin(newPayment);

  const monthlySavings = round2(currentPayment - newPayment);
  let breakevenMonths = null;
  let breakevenYears = null;
  if (monthlySavings > 0) {
    breakevenMonths = Math.ceil(closingCosts / monthlySavings);
    breakevenYears = round2(breakevenMonths / 12);
  }

  return {
    currentPayment,
    newPayment,
    closingCosts,
    monthlySavings,
    breakevenMonths, // null when refinance does not lower the payment
    breakevenYears,
    savesMoney: monthlySavings > 0,
    assumptions: [
      "Compares monthly payments only; does not model total interest, term reset, or tax effects.",
      "Break-even assumes you keep the loan past the break-even point.",
    ],
  };
}

/* ==========================================================================
   6) Down payment helper
   ========================================================================== */
export function calculateDownPayment(input = {}) {
  const price = clampMin(num(input.price));
  const amountInput = num(input.amount, NaN);
  const pctInput = num(input.pct, NaN);
  if (Number.isFinite(amountInput)) {
    return {
      price,
      amount: clampMin(roundWhole(amountInput)),
      pct: price > 0 ? round2((amountInput / price) * 100) : 0,
    };
  }
  const pct = Number.isFinite(pctInput) ? pctInput : 20;
  return { price, pct: round2(pct), amount: clampMin(roundWhole(price * (pct / 100))) };
}

/* ==========================================================================
   Route engine re-exports (navigation/education, NOT eligibility)
   Implemented in ./routeEngine.js and surfaced here so kawsah-tools.json can
   list them alongside the calculators.
   ========================================================================== */
export { findKawsahRoute, findMortgageRoute } from "./routeEngine.js";

export default {
  monthlyFactor,
  calculateMortgagePayment,
  calculateDTI,
  calculateAffordability,
  calculateCashToClose,
  calculateRefiBreakeven,
  calculateDownPayment,
};
