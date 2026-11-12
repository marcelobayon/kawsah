/* ==========================================================================
   Kawsah project audit — checks the whole project against the Route Matrix
   and the analytics/SEO/config contracts. Run: npm run audit
   Reports findings; exits non-zero if any hard failures remain.
   ========================================================================== */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { ROUTES, getRoute, routeTargetHref, resolveNext } from "../src/data/routes.js";
import { resolveLink } from "../src/lib/destinations.js";

const ROOT = new URL("../", import.meta.url).pathname;
const findings = [];
const note = (sev, area, msg) => findings.push({ sev, area, msg });

function walk(dir, exts) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}
const srcFiles = walk(join(ROOT, "src"), [".astro", ".js"]);
const srcText = srcFiles.map((f) => readFileSync(f, "utf8")).join("\n");
// For emission checks, exclude files that only DECLARE event names rather than
// fire them: analytics.js (the EVENTS constant map) and src/data/* (routes.js
// carries a ga4Event field per route). Otherwise declared-but-never-fired
// events would be masked.
const emitText = srcFiles
  .filter((f) => !f.endsWith("lib/analytics.js") && !f.includes("/src/data/"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
const pageFiles = existsSync(join(ROOT, "src/pages")) ? readdirSync(join(ROOT, "src/pages")) : [];
const pageSlugs = pageFiles.filter((f) => f.endsWith(".astro")).map((f) => "/" + f.replace(/\.astro$/, "").replace(/^index$/, "") + (f === "index.astro" ? "" : "/"));

/* ---- 1. Route matrix integrity ---------------------------------------- */
const REQUIRED = [
  "KAWSAH_PURCHASE","KAWSAH_REFINANCE","KAWSAH_FIRST_TIME_BUYER","KAWSAH_HOUSE_HUNTING",
  "KAWSAH_AFFORDABILITY","KAWSAH_MORTGAGE_PAYMENT","KAWSAH_CASH_TO_CLOSE","KAWSAH_REFI_BREAKEVEN",
  "KAWSAH_PURCHASE_PLAYBOOK","KAWSAH_HOME_MANAGEMENT","KAWSAH_HOME_INVENTORY","KAWSAH_SMART_HOME",
  "KAWSAH_MEAL_PLANNING","KAWSAH_RECIPE_DASHBOARD","KAWSAH_LIFE_WIKI","KAWSAH_COMMUNITY",
  "KAWSAH_HOMEBUYER_BUNDLE","NORTHRESERVE_FINANCIAL_READINESS","NORTHRESERVE_EXPENSE_TRACKING",
  "NORTHRESERVE_FINANCIAL_PREP","MITIG8_SELF_EMPLOYED","MITIG8_INCOME_ANALYSIS","MITIG8_ADD_BACKS",
  "NONQM_ALTERNATIVE_FINANCING","NONQM_BANK_STATEMENT","NONQM_INVESTMENT","NONQM_DSCR","NONQM_BRIDGE",
  "NONQM_FOREIGN_NATIONAL","NONQM_5_TO_10_UNIT","CORPORATE_CAPITAL_MAP_BUSINESS","KAWSAH_REALTOR_PRO",
  "KAWSAH_LENDER_PRO","KAWSAH_PRO_BUNDLE",
];
for (const id of REQUIRED) if (!getRoute(id)) note("FAIL", "routes", `Required route missing: ${id}`);

for (const r of ROUTES) {
  if (!r.primaryCTA) note("FAIL", "routes", `${r.id}: missing primaryCTA`);
  if (!r.ga4Event) note("FAIL", "routes", `${r.id}: missing ga4Event`);
  if (!r.webmcpFunction) note("FAIL", "routes", `${r.id}: missing webmcpFunction`);
  if (!r.nextQuestion) note("FAIL", "routes", `${r.id}: missing nextQuestion`);
  // destination resolves
  const t = routeTargetHref(r);
  if (!t || !t.url) note("FAIL", "routes", `${r.id}: primary destination does not resolve`);
  if (r.page && !pageSlugs.includes(r.page)) note("FAIL", "routes", `${r.id}: page ${r.page} has no matching src/pages file`);
  if (!r.page && r.ecosystemKey && !resolveLink(r.ecosystemKey)) note("WARN", "routes", `${r.id}: ecosystem ${r.ecosystemKey} URL not configured (hidden)`);
  // transition resolves
  const nx = resolveNext(r);
  if (!nx || !nx.href) note("FAIL", "routes", `${r.id}: next transition does not resolve`);
  else if (nx.href.startsWith("/") && !pageSlugs.includes(nx.href) && !nx.href.startsWith("/apply")) {
    if (!pageSlugs.includes(nx.href)) note("WARN", "transition", `${r.id}: next → ${nx.href} (verify page exists)`);
  }
}

/* ---- 2. Analytics vocabulary emitted somewhere ------------------------ */
const VOCAB = [
  "page_view","calculator_viewed","calculator_started","calculator_completed","calculator_cta_clicked",
  "tool_viewed","tool_started","tool_completed","tool_cta_clicked",
  "route_started","route_question_answered","route_completed","route_recommendation_viewed","route_cta_clicked",
  "ecosystem_referral_clicked","application_cta_clicked","booking_cta_clicked",
  "product_viewed","checkout_started","purchase_completed",
  "community_join_clicked","professional_route_started","form_submitted",
];
const AUTO = new Set(["page_view"]); // via gtag config
const DEFERRABLE = new Set(["purchase_completed", "checkout_started"]); // need real checkout config
for (const ev of VOCAB) {
  if (AUTO.has(ev)) continue;
  const emitted = emitText.includes(`"${ev}"`) || emitText.includes(`'${ev}'`);
  if (!emitted) {
    if (DEFERRABLE.has(ev)) note("INFO", "analytics", `${ev}: not emitted (deferred until checkout/pricing is configured)`);
    else note("FAIL", "analytics", `${ev}: declared in event vocabulary but never emitted`);
  }
}

/* ---- 3. WebMCP manifest completeness ---------------------------------- */
const manifestPath = join(ROOT, "public/kawsah-tools.json");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const listed = new Set((manifest.tools || []).map((t) => t.name));
  const planned = new Set((manifest.plannedFunctions || []).map((t) => (typeof t === "string" ? t : t.name)));
  const routeFns = new Set(ROUTES.map((r) => r.webmcpFunction).filter(Boolean));
  for (const fn of routeFns) {
    if (!listed.has(fn) && !planned.has(fn))
      note("FAIL", "webmcp", `Route function "${fn}" is not in kawsah-tools.json (as implemented tool or plannedFunctions)`);
  }
} else note("FAIL", "webmcp", "public/kawsah-tools.json missing (run gen-data)");

/* ---- 4. Hard-coded URLs outside config -------------------------------- */
for (const f of srcFiles) {
  if (f.endsWith("config/config.js")) continue;
  const txt = readFileSync(f, "utf8");
  const m = txt.match(/https?:\/\/[^\s"'`)]+/g) || [];
  for (const u of m) {
    if (/schema\.org|w3\.org|googletagmanager|google\.com\/gtag/.test(u)) continue;
    note("FAIL", "config", `Hard-coded URL in ${f.replace(ROOT, "")}: ${u}`);
  }
}

/* ---- 5. SEO: unique titles/descriptions in built pages ---------------- */
const dist = join(ROOT, "dist");
if (existsSync(dist)) {
  const htmls = walk(dist, [".html"]);
  const titles = new Map(), descs = new Map();
  for (const f of htmls) {
    const h = readFileSync(f, "utf8");
    const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
    const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    const rel = f.replace(dist, "");
    if (t) titles.set(t, (titles.get(t) || []).concat(rel));
    if (d) descs.set(d, (descs.get(d) || []).concat(rel));
    if (!t) note("WARN", "seo", `${rel}: missing <title>`);
    if (!d) note("WARN", "seo", `${rel}: missing meta description`);
    if (!/rel="canonical"/.test(h)) note("WARN", "seo", `${rel}: missing canonical`);
  }
  for (const [t, fs] of titles) if (fs.length > 1) note("WARN", "seo", `Duplicate <title> "${t}" on: ${fs.join(", ")}`);
  for (const [d, fs] of descs) if (fs.length > 1) note("WARN", "seo", `Duplicate description on: ${fs.join(", ")}`);
} else note("INFO", "seo", "dist/ not built yet — run build then re-audit for SEO checks");

/* ---- report ----------------------------------------------------------- */
const order = { FAIL: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => order[a.sev] - order[b.sev]);
const counts = findings.reduce((m, f) => ((m[f.sev] = (m[f.sev] || 0) + 1), m), {});
console.log("\nKawsah project audit\n" + "=".repeat(56));
if (!findings.length) console.log("No findings. Clean.");
for (const f of findings) console.log(`[${f.sev}] ${f.area.padEnd(11)} ${f.msg}`);
console.log("=".repeat(56));
console.log(`FAIL: ${counts.FAIL || 0}  WARN: ${counts.WARN || 0}  INFO: ${counts.INFO || 0}  (routes audited: ${ROUTES.length})`);
process.exit((counts.FAIL || 0) > 0 ? 1 : 0);
