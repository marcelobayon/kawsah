/* ==========================================================================
   KAWSAH — Destinations resolver
   Turns a short key (e.g. "mitig8", "kawsah.apply") into a concrete link
   object, reading URLs from the central CONFIG. Returns null when a URL is
   missing/TODO so callers can gracefully hide the link. Pure, UI-free.
   ========================================================================== */
import { CONFIG, isSet } from "../config/config.js";

const ext = (url, type) => (isSet(url) ? { url, external: true, destinationType: type } : null);
const int = (url, type = "internal") => ({ url, external: false, destinationType: type });

/** Map short keys → { url, external, destinationType } derived from CONFIG. */
export function partnerLinks() {
  const d = CONFIG.destinations;
  const c = CONFIG.contact;
  return {
    // Kawsah conversion links (external forms/booking)
    "kawsah.home": ext(d.kawsah?.url, "partner_kawsah"),
    "kawsah.apply": ext(c.applicationUrl, "kawsah_apply"),
    "kawsah.call": ext(c.bookingUrl, "kawsah_book"),

    // Ecosystem partners (external — resolved from CONFIG, may be blank/TODO)
    mitig8: ext(d.mitig8?.url, "partner_mitig8"),
    nonqm: ext(d.nonqm?.url, "partner_nonqm"),
    corporateCapitalMap: ext(d.corporateCapitalMap?.url, "partner_ccm"),
    northReserve: ext(d.northReserve?.url, "partner_northreserve"),
    stopLosingMortgages: ext(d.stopLosingMortgages?.url, "partner_slm"),

    // Community (external, optional)
    community: ext(CONFIG.community?.url, "community"),

    // Internal shortcuts
    "tool.routeFinder": int("/route-finder/", "internal_tool"),
    contact: int("/contact/", "internal"),
  };
}

/** Resolve a single key → link object or null (missing/disabled). */
export function resolveLink(key) {
  if (!key) return null;
  return partnerLinks()[key] || null;
}

/** Resolve a key but always return SOMETHING usable (falls back to /contact/). */
export function resolveLinkOrContact(key) {
  return resolveLink(key) || resolveLink("contact");
}

/** Human-readable partner names for copy. */
export const PARTNER_NAMES = {
  kawsah: () => CONFIG.destinations.kawsah?.name || "Kawsah",
  mitig8: () => CONFIG.destinations.mitig8?.name || "Mitig8 AI",
  nonqm: () => CONFIG.destinations.nonqm?.name || "NonQM Capital",
  corporateCapitalMap: () => CONFIG.destinations.corporateCapitalMap?.name || "Corporate Capital Map",
  northReserve: () => CONFIG.destinations.northReserve?.name || "NorthReserve",
  stopLosingMortgages: () => CONFIG.destinations.stopLosingMortgages?.name || "Stop Losing Mortgages",
};

export default { partnerLinks, resolveLink, resolveLinkOrContact, PARTNER_NAMES };
