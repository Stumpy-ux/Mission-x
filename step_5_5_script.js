/* ====== Coded By Stumpyux (Iain) ====== */

/* ===================================================================
   Step 5.5 — Submitting Your Report
   ===================================================================*/

const REPORT_KEY = "fixit_report";
const MIN_DISPLAY_MS = 2200;
const QUOTE_READ_MS = 2500; // time to actually read the quote before moving on
const QUOTE_API_URL = "https://api.quotable.io/random";
const LOGO_SVG_URL = "assets/fixit-logo-spinner.svg";

/* Several fallbacks, incase api call fails */
const FALLBACK_QUOTES = [
  { text: "Every issue reported is a community improved.", author: "FixIt" },
  {
    text: "Small fixes, done together, add up to a better street.",
    author: "FixIt",
  },
  {
    text: "The best time to report a problem was yesterday. The next best time is now.",
    author: "FixIt",
  },
  {
    text: "A community that speaks up is a community that gets fixed.",
    author: "FixIt",
  },
  {
    text: "Progress starts with someone noticing — thank you for noticing.",
    author: "FixIt",
  },
];

function randomFallbackQuote() {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

/* ---- Load the logo artwork and put it into the spinner stage ----
   The logo stays its own standalone, editable .svg file on disc */
async function loadSpinnerLogo() {
  const stage = document.getElementById("spinnerStage");
  try {
    const response = await fetch(LOGO_SVG_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    stage.innerHTML = await response.text();
  } catch (error) {
    console.error(
      "Could not load the logo SVG (if you're opening this file directly " +
        "from disk, fetch() of local files is blocked — serve the page over " +
        "http/https instead).",
      error,
    );
  }
}

/* ---- Shared report state (same object every step page uses) ------- */
function getReport() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_KEY)) || {};
  } catch (error) {
    console.error("Could not read saved report, starting fresh.", error);
    return {};
  }
}

function saveReport(partial) {
  const updated = { ...getReport(), ...partial };
  localStorage.setItem(REPORT_KEY, JSON.stringify(updated));
  return updated;
}

/* ---- The "submit to the backend" stand-in ---- */
async function submitReport() {
  const report = getReport();
  console.log("Submitting report (placeholder — no backend yet):", report);
  await wait(800);
  return true;
}

/* ---- Real API call: an inspirational quote ------*/
  
async function fetchQuote() {
  try {
    const response = await fetch(`${QUOTE_API_URL}?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const text = data.content || data.q;
    const author = data.author || data.a;
    if (!text) throw new Error("Unexpected response shape");
    return { text, author: author || "Unknown" };
  } catch (error) {
    console.error("Quote fetch failed, using a fallback quote.", error);
    return randomFallbackQuote();
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateReferenceNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `FX-${digits}`;
}

function showQuote(quote) {
  document.getElementById("quoteText").textContent = `“${quote.text}”`;
  document.getElementById("quoteAuthor").textContent = `— ${quote.author}`;
}

/* ---- Run submission + quote fetch together, then move on ---------- */
async function run() {
  const [quote] = await Promise.all([
    fetchQuote(),
    submitReport(),
    wait(MIN_DISPLAY_MS),
  ]);

  showQuote(quote);

  const referenceNumber = generateReferenceNumber();
  saveReport({ referenceNumber, submittedAt: new Date().toISOString() });

  await wait(QUOTE_READ_MS); // give the user time to actually read the quote

  window.location.href = "Step_6_index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadSpinnerLogo();
  run();
});
