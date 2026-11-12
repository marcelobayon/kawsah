/* ==========================================================================
   Lightweight internal link checker. Scans the built site (dist/) and verifies
   every internal href/src resolves to a real file. Also flags any unresolved
   TODO_CONFIGURE placeholder that leaked into a link.
   Run AFTER a build: npm run build && npm run check:links
   ========================================================================== */
import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;

if (!existsSync(DIST)) {
  console.error("check-links: dist/ not found. Run `npm run build` first.");
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (extname(p) === ".html") out.push(p);
  }
  return out;
}

function resolvesInDist(link) {
  let path = link.split("#")[0].split("?")[0];
  if (!path) return true; // pure hash/query on same page
  if (!path.startsWith("/")) return true; // relative (rare here) — skip
  const rel = path.replace(/^\//, "");
  const candidates = [];
  if (path.endsWith("/")) {
    candidates.push(join(DIST, rel, "index.html"));
  } else if (extname(path)) {
    candidates.push(join(DIST, rel));
  } else {
    candidates.push(join(DIST, rel + ".html"));
    candidates.push(join(DIST, rel, "index.html"));
  }
  return candidates.some((c) => existsSync(c));
}

const htmlFiles = walk(DIST);
const attrRe = /(?:href|src)\s*=\s*"([^"]*)"/gi;
const broken = [];
const todos = [];
let internalChecked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = file.replace(DIST, "/");
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    const link = m[1].trim();
    if (link.includes("TODO_CONFIGURE")) todos.push({ file: rel, link });
    if (
      link.startsWith("http://") ||
      link.startsWith("https://") ||
      link.startsWith("mailto:") ||
      link.startsWith("tel:") ||
      link.startsWith("data:") ||
      link.startsWith("//") ||
      link.startsWith("#") ||
      link === ""
    ) {
      continue;
    }
    internalChecked++;
    if (!resolvesInDist(link)) broken.push({ file: rel, link });
  }
}

console.log("\nKawsah internal link check\n" + "-".repeat(40));
console.log(`pages scanned:     ${htmlFiles.length}`);
console.log(`internal links:    ${internalChecked}`);
console.log(`broken links:      ${broken.length}`);
console.log(`TODO placeholders: ${todos.length}`);
if (broken.length) {
  console.log("\nBROKEN:");
  for (const b of broken) console.log(`  ${b.file}  ->  ${b.link}`);
}
if (todos.length) {
  console.log("\nTODO_CONFIGURE in links (expected until you set config values):");
  for (const t of todos) console.log(`  ${t.file}  ->  ${t.link}`);
}
console.log("-".repeat(40) + "\n");
process.exit(broken.length > 0 ? 1 : 0);
