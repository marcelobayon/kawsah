/* ==========================================================================
   Small client-side helpers shared by calculator pages. Formatting + input
   reading only — all math stays in calc-network.js (pure + tested).
   ========================================================================== */
export const num = (v, f = NaN) => {
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : f;
};
export const readNum = (form, name, f = 0) =>
  num(form.elements[name] ? form.elements[name].value : "", f);

export const fmtMoney = (n, dp = 0) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: dp, minimumFractionDigits: dp })
    : "—";

export const fmtPct = (n, dp = 1) => (Number.isFinite(n) ? `${n.toFixed(dp)}%` : "—");

export const debounce = (fn, ms = 700) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

export const setText = (id, v) => {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
};

const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
export const setList = (id, items) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = (items || []).map((i) => `<li>${esc(i)}</li>`).join("");
};
