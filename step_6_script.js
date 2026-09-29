/* ===================================================================
   Step 6 — Issue Reported Successfully
   ===================================================================*/

const REPORT_KEY = "fixit_report";
const COPY_RESET_MS = 1500;
const SCRIPT_VERSION = "step6-copy-v2";
console.log(`[FixIt] Step_6_script.js loaded (${SCRIPT_VERSION})`);

function getReport() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_KEY)) || {};
  } catch (error) {
    console.error("Could not read saved report.", error);
    return {};
  }
}

function saveReport(partial) {
  const updated = { ...getReport(), ...partial };
  localStorage.setItem(REPORT_KEY, JSON.stringify(updated));
  return updated;
}

function generateReferenceNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `FX-${digits}`;
}

/* ---- Copy-to-clipboard, with a fallback for browsers/contexts
   where navigator.clipboard isn't available (e.g. no HTTPS) -------- */
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Clipboard API copy failed, falling back.", error);
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error("Fallback copy failed.", error);
    return false;
  }
}


function showPageError(message) {
  console.error("[FixIt]", message);
  let banner = document.getElementById("fixitDebugBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "fixitDebugBanner";
    banner.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;z-index:9999;" +
      "background:#c0392b;color:#fff;font-family:monospace;" +
      "font-size:12px;padding:8px 10px;white-space:pre-wrap;";
    document.body.appendChild(banner);
  }
  banner.textContent += (banner.textContent ? "\n" : "") + message;
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    let report = getReport();

    if (!report.referenceNumber) {
      report = saveReport({
        referenceNumber: generateReferenceNumber(),
        submittedAt: report.submittedAt || new Date().toISOString(),
      });
    }

    const referenceText = document.getElementById("referenceText");
    const copyButton = document.getElementById("copyReferenceButton");

    if (!referenceText)
      showPageError(
        "referenceText element not found — check the id in Step_6_index.html.",
      );
    if (!copyButton)
      showPageError(
        "copyReferenceButton element not found — check the id in Step_6_index.html.",
      );

    if (referenceText) {
      referenceText.textContent = `Reference #${report.referenceNumber}`;
    }

    if (copyButton) {
      copyButton.addEventListener("click", () => {
        copyToClipboard(report.referenceNumber)
          .then((succeeded) => {
            copyButton.textContent = succeeded ? "Copied!" : "Couldn't copy";
            copyButton.classList.toggle("copied", succeeded);
          })
          .catch((error) => {
            copyButton.textContent = "Couldn't copy";
            showPageError(
              `Copy threw: ${error && error.message ? error.message : error}`,
            );
          })
          .finally(() => {
            window.clearTimeout(copyButton._resetTimer);
            copyButton._resetTimer = window.setTimeout(() => {
              copyButton.textContent = "Copy";
              copyButton.classList.remove("copied");
            }, COPY_RESET_MS);
          });
      });
    }
  } catch (error) {
    showPageError(
      `Step 6 script crashed: ${error && error.message ? error.message : error}`,
    );
  }
});
