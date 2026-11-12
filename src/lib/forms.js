/* ==========================================================================
   KAWSAH — Forms provider abstraction
   --------------------------------------------------------------------------
   ONE switch controls how every form submits: CONFIG.forms.provider =
   "netlify" | "apps_script" | "mailerlite". The <LeadForm> component renders
   the correct markup; initLeadForms() (client) handles submission uniformly.
   Switching providers requires NO UI/markup changes.
   ========================================================================== */
import { CONFIG, isSet } from "../config/config.js";

export const PROVIDER = CONFIG.forms?.provider || "netlify";

/** Server-side: describe the active provider for markup rendering. */
export function getFormMeta() {
  const provider = PROVIDER;
  const f = CONFIG.forms || {};
  let endpoint = "";
  if (provider === "apps_script") endpoint = f.apps_script?.endpoint || "";
  if (provider === "mailerlite") endpoint = f.mailerlite?.formActionUrl || "";
  return {
    provider,
    isNetlify: provider === "netlify",
    endpoint,
    endpointReady: provider === "netlify" ? true : isSet(endpoint),
    fallbackEmail: CONFIG.contact?.email || "",
  };
}

/* --------------------------- client submission -------------------------- */
/**
 * Attach unified submit handling to every <form data-kawsah-form>.
 * Import + call once from the global client script.
 */
export function initLeadForms(track) {
  if (typeof document === "undefined") return;
  const forms = document.querySelectorAll("form[data-kawsah-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      const provider = form.getAttribute("data-provider") || "netlify";
      const endpoint = form.getAttribute("data-endpoint") || "";
      const formName = form.getAttribute("name") || form.getAttribute("data-form-name") || "form";

      // Honeypot: silently accept and drop bot submissions.
      const honey = form.querySelector('input[name="bot-field"]');
      if (honey && honey.value) {
        e.preventDefault();
        showSuccess(form);
        return;
      }

      // Provider needs an endpoint but none configured → don't submit to a
      // broken URL. Fall back to email and let the user know.
      if ((provider === "apps_script" || provider === "mailerlite") && !endpoint) {
        e.preventDefault();
        showConfigNotice(form);
        return;
      }

      e.preventDefault();
      const data = new FormData(form);
      try {
        if (provider === "netlify") {
          await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString(),
          });
        } else if (provider === "apps_script") {
          await fetch(endpoint, { method: "POST", body: data, mode: "no-cors" });
        } else if (provider === "mailerlite") {
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString(),
            mode: "no-cors",
          });
        }
        if (typeof track === "function") {
          track("form_submitted", { form_name: formName, provider });
        }
        showSuccess(form);
      } catch (_) {
        // Network/opaque errors: still show success for no-cors providers, but
        // for netlify surface a gentle retry.
        if (provider === "netlify") showError(form);
        else showSuccess(form);
      }
    });
  });
}

function showSuccess(form) {
  const msg = form.parentElement && form.parentElement.querySelector("[data-form-success]");
  form.style.display = "none";
  if (msg) msg.hidden = false;
}
function showError(form) {
  let err = form.querySelector("[data-form-error]");
  if (!err) {
    err = document.createElement("p");
    err.setAttribute("data-form-error", "");
    err.className = "form-error";
    form.appendChild(err);
  }
  err.textContent = "Something went wrong sending that. Please try again or email us directly.";
}
function showConfigNotice(form) {
  let note = form.querySelector("[data-form-error]");
  if (!note) {
    note = document.createElement("p");
    note.setAttribute("data-form-error", "");
    note.className = "form-error";
    form.appendChild(note);
  }
  note.textContent = "This form isn't connected yet. Please email us in the meantime.";
}

export default { PROVIDER, getFormMeta, initLeadForms };
