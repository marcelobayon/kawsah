/* ==========================================================================
   KAWSAH — Featured asset groupings (read from the route matrix)
   Thin helpers so pages can surface routes without duplicating data.
   ========================================================================== */
import { getRoute } from "./routes.js";

export const FEATURED_CALCULATORS = [
  "KAWSAH_AFFORDABILITY",
  "KAWSAH_MORTGAGE_PAYMENT",
  "KAWSAH_CASH_TO_CLOSE",
  "KAWSAH_REFI_BREAKEVEN",
];

export const HOMEOWNER_TOOLS = [
  "KAWSAH_HOME_MANAGEMENT",
  "KAWSAH_HOME_INVENTORY",
  "KAWSAH_SMART_HOME",
  "KAWSAH_MEAL_PLANNING",
  "KAWSAH_RECIPE_DASHBOARD",
  "KAWSAH_LIFE_WIKI",
];

export const FIRST_TIME_JOURNEY = [
  "NORTHRESERVE_FINANCIAL_READINESS",
  "KAWSAH_AFFORDABILITY",
  "KAWSAH_CASH_TO_CLOSE",
  "KAWSAH_HOUSE_HUNTING",
  "KAWSAH_PURCHASE_PLAYBOOK",
];

export function routes(ids) {
  return ids.map(getRoute).filter(Boolean);
}

export default { FEATURED_CALCULATORS, HOMEOWNER_TOOLS, FIRST_TIME_JOURNEY, routes };
