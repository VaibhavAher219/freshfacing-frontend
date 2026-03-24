// ═══════════════════════════════════════
// FreshFacing — Main JavaScript
// ═══════════════════════════════════════

// === Nav Toggle (mobile hamburger) ===
function toggleNav() {
  document.getElementById("nav-links").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("open");
}

// === Audit Scanner (Real API) ===

const scanMessages = [
  "Connecting to site...",
  "Checking mobile compatibility...",
  "Testing page load speed...",
  "Looking for SSL certificate...",
  "Checking Google index status...",
  "Scanning for AI search structure...",
  "Checking contact & call buttons...",
  "Reviewing content freshness...",
  "Calculating your score...",
];

function cleanUrl(raw) {
  let u = raw.trim().toLowerCase();
  if (!u.startsWith("http")) u = "https://" + u;
  try {
    return new URL(u).hostname.replace("www.", "");
  } catch (e) {
    return raw.trim();
  }
}

function buildFullUrl(raw) {
  let u = raw.trim();
  if (!u.startsWith("http")) u = "https://" + u;
  return u;
}

function show(id) {
  ["step-url", "step-scanning", "step-results", "step-confirm"].forEach((s) => {
    document.getElementById(s).style.display = s === id ? "" : "none";
  });
}

function runAudit() {
  const raw = document.getElementById("audit-url-input").value;
  if (!raw.trim()) {
    document.getElementById("audit-url-input").focus();
    return;
  }
  const domain = cleanUrl(raw);
  const fullUrl = buildFullUrl(raw);
  show("step-scanning");

  // Start scanning animation
  let i = 0;
  const statusEl = document.getElementById("scan-status");
  const interval = setInterval(() => {
    if (i < scanMessages.length) {
      statusEl.textContent = scanMessages[i++];
    }
  }, 800);

  // Call Google PageSpeed Insights API (free, no key needed)
  const apiUrl =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" +
    encodeURIComponent(fullUrl) +
    "&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=MOBILE";

  fetch(apiUrl)
    .then((r) => r.json())
    .then((data) => {
      clearInterval(interval);
      const results = parsePageSpeedResults(data, fullUrl);
      renderResults(domain, results);
      show("step-results");
    })
    .catch((err) => {
      clearInterval(interval);
      // Fallback: if API fails, show what we can determine
      const results = buildFallbackResults(fullUrl);
      renderResults(domain, results);
      show("step-results");
    });
}

function parsePageSpeedResults(data, url) {
  const results = [];
  const lhr = data.lighthouseResult || {};
  const categories = lhr.categories || {};
  const audits = lhr.audits || {};

  // 1. Mobile-friendly (from SEO + viewport audit)
  const seoScore = categories.seo ? categories.seo.score * 100 : null;
  const viewport = audits["viewport"] ? audits["viewport"].score === 1 : false;
  const fontSizes = audits["font-size"]
    ? audits["font-size"].score === 1
    : true;
  const mobilePassed = viewport && fontSizes;
  results.push({
    passed: mobilePassed,
    severity: "fail",
    pass_text: "Renders correctly on mobile",
    fail_text: "Broken or hard to use on smartphones",
    statText: mobilePassed ? "✓ Looks good" : "63% of visits are mobile",
  });

  // 2. Page speed
  const perfScore = categories.performance
    ? Math.round(categories.performance.score * 100)
    : 0;
  const fcp = audits["first-contentful-paint"]
    ? audits["first-contentful-paint"].numericValue
    : 0;
  const speedSec = (fcp / 1000).toFixed(1);
  const speedPassed = fcp < 3000;
  results.push({
    passed: speedPassed,
    severity: "fail",
    pass_text: "Loads in " + speedSec + " seconds",
    fail_text:
      "Takes " + speedSec + " seconds to load — visitors leave after 3",
    statText: speedSec + " sec",
  });

  // 3. HTTPS
  const isHttps = audits["is-on-https"]
    ? audits["is-on-https"].score === 1
    : url.startsWith("https");
  results.push({
    passed: isHttps,
    severity: "warn",
    pass_text: "SSL certificate active",
    fail_text: 'No SSL — browsers warn visitors it\'s "not secure"',
    statText: isHttps ? "Active" : "Missing",
  });

  // 4. SEO / Indexing
  const seoPassed = seoScore !== null ? seoScore >= 70 : false;
  const robotsTxt = audits["robots-txt"]
    ? audits["robots-txt"].score === 1
    : false;
  const isCrawlable = audits["is-crawlable"]
    ? audits["is-crawlable"].score === 1
    : true;
  const indexable = isCrawlable && robotsTxt;
  results.push({
    passed: indexable || seoPassed,
    severity: "fail",
    pass_text: "Site is indexable by Google",
    fail_text: "Google may not be able to find your pages",
    statText: seoPassed ? "SEO: " + seoScore + "/100" : "Needs work",
  });

  // 5. AI search visibility (structured data)
  const structuredData = audits["structured-data-item"]
    ? audits["structured-data-item"].score === 1
    : false;
  // Most small sites don't have structured data
  results.push({
    passed: structuredData,
    severity: "warn",
    pass_text: "Structured data present for AI search",
    fail_text: "ChatGPT & Perplexity can't recommend your business",
    statText: structuredData ? "Structured" : "Not structured",
  });

  // 6. Broken links (from link audit if available)
  const linkAudit = audits["link-text"]
    ? audits["link-text"].score === 1
    : true;
  const crawlableAnchors = audits["crawlable-anchors"]
    ? audits["crawlable-anchors"].score === 1
    : true;
  const linksPassed = linkAudit && crawlableAnchors;
  results.push({
    passed: linksPassed,
    severity: "fail",
    pass_text: "Links are properly configured",
    fail_text: "Links are misconfigured — visitors may hit dead ends",
    statText: linksPassed ? "Good" : "Issues found",
  });

  // 7. Tap targets (click-to-call proxy)
  const tapTargets = audits["tap-targets"]
    ? audits["tap-targets"].score === 1
    : true;
  results.push({
    passed: tapTargets,
    severity: "warn",
    pass_text: "Mobile tap targets properly sized",
    fail_text: "Buttons and links too small to tap on mobile",
    statText: tapTargets ? "Good" : "Too small",
  });

  // 8. Image optimization (as content quality proxy)
  const images = audits["uses-optimized-images"]
    ? audits["uses-optimized-images"].score === 1
    : audits["offscreen-images"]
      ? audits["offscreen-images"].score === 1
      : true;
  results.push({
    passed: images,
    severity: "warn",
    pass_text: "Images are optimized",
    fail_text: "Unoptimized images slow your site and frustrate visitors",
    statText: images ? "Optimized" : "Needs work",
  });

  return results;
}

function buildFallbackResults(url) {
  // Minimal fallback when API is unavailable — check what we can client-side
  const isHttps = url.startsWith("https");
  return [
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Could not fully test mobile compatibility",
      statText: "Test needed",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Could not measure page speed remotely",
      statText: "Test needed",
    },
    {
      passed: isHttps,
      severity: "warn",
      pass_text: "URL uses HTTPS",
      fail_text: "Site doesn't use HTTPS — visitors see a security warning",
      statText: isHttps ? "Active" : "Missing",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Google indexing status unknown — we'll check manually",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "AI search visibility needs manual review",
      statText: "Pending",
    },
    {
      passed: true,
      severity: "warn",
      pass_text: "Full link check requires manual scan",
      fail_text: "",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Tap target sizing needs device test",
      statText: "Pending",
    },
    {
      passed: false,
      severity: "warn",
      pass_text: "",
      fail_text: "Image optimization check pending",
      statText: "Pending",
    },
  ];
}

function renderResults(domain, results) {
  document.getElementById("result-domain").textContent = domain;

  const failures = results.filter(
    (r) => !r.passed && r.severity === "fail",
  ).length;
  const warnings = results.filter(
    (r) => !r.passed && r.severity === "warn",
  ).length;
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const score = Math.max(5, Math.round((passed / total) * 100));

  const scoreBadge = document.getElementById("result-score");
  scoreBadge.textContent = "Score: " + score + "/100";
  scoreBadge.className =
    "score-badge " +
    (score < 45 ? "score-bad" : score < 70 ? "score-mid" : "score-ok");

  const list = document.getElementById("audit-items-list");
  list.innerHTML = results
    .map((r) => {
      const cls = r.passed ? "pass" : r.severity === "fail" ? "fail" : "warn";
      const icon = r.passed
        ? "\u2705"
        : r.severity === "fail"
          ? "\u274C"
          : "\u26A0\uFE0F";
      const text = r.passed ? r.pass_text : r.fail_text;
      return (
        '<div class="audit-item ' +
        cls +
        '">' +
        '<span class="audit-icon">' +
        icon +
        "</span>" +
        "<span>" +
        text +
        "</span>" +
        '<span class="audit-stat">' +
        r.statText +
        "</span>" +
        "</div>"
      );
    })
    .join("");
}

function submitEmail() {
  const email = document.getElementById("result-email").value;
  const firstName = (document.getElementById("intake-first") || {}).value || "";
  const lastName = (document.getElementById("intake-last") || {}).value || "";
  const businessName =
    (document.getElementById("intake-business") || {}).value || "";
  const url = buildFullUrl(document.getElementById("audit-url-input").value);

  if (!firstName.trim()) {
    document.getElementById("intake-first").focus();
    return;
  }
  if (!businessName.trim()) {
    document.getElementById("intake-business").focus();
    return;
  }
  if (!email || !email.includes("@")) {
    document.getElementById("result-email").focus();
    return;
  }

  const btn = document.querySelector(".email-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Building…";
  }

  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      email,
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
    }),
  })
    .then((r) => r.json())
    .then(({ job_id }) => {
      if (!job_id) {
        show("step-confirm");
        return;
      }

      const confirmEl = document.getElementById("step-confirm");
      if (confirmEl) {
        confirmEl.innerHTML =
          '<div class="confirm-headline">We\'re on it.</div>' +
          '<p class="confirm-sub">Your preview will appear right here when it\'s ready.</p>' +
          '<div id="gen-status" style="margin-top:20px;display:flex;gap:6px;justify-content:center;">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:#5c7a5c;animation:ff-pulse 1.2s ease-in-out 0s infinite;"></div>' +
          '<div style="width:8px;height:8px;border-radius:50%;background:#5c7a5c;animation:ff-pulse 1.2s ease-in-out 0.2s infinite;"></div>' +
          '<div style="width:8px;height:8px;border-radius:50%;background:#5c7a5c;animation:ff-pulse 1.2s ease-in-out 0.4s infinite;"></div>' +
          "</div>" +
          "<style>@keyframes ff-pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}</style>";
      }
      show("step-confirm");

      const poll = setInterval(() => {
        fetch("/api/jobs/" + job_id)
          .then((r) => r.json())
          .then((job) => {
            if (job.status === "done" && job.public_url) {
              clearInterval(poll);
              if (confirmEl) {
                confirmEl.innerHTML =
                  '<div class="confirm-headline" style="margin-bottom:12px;">Your new site is ready.</div>' +
                  '<div style="border:2px solid #5c7a5c;border-radius:8px;overflow:hidden;">' +
                  '<iframe src="' +
                  job.public_url +
                  '" style="width:100%;height:480px;border:none;" loading="lazy"></iframe>' +
                  "</div>" +
                  '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">' +
                  '<a href="' +
                  job.public_url +
                  '" target="_blank" style="flex:1;min-width:120px;display:block;padding:12px;border:1.5px solid #5c7a5c;border-radius:6px;color:#5c7a5c;font-weight:600;font-size:13px;text-decoration:none;text-align:center;">Full Screen →</a>' +
                  "<button onclick=\"claimSite('" +
                  url +
                  "','" +
                  email +
                  "','" +
                  job_id +
                  "','" +
                  job.public_url +
                  '\')" style="flex:2;min-width:160px;padding:12px;background:#5c7a5c;border:none;border-radius:6px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;">Claim This Site — $20/mo →</button>' +
                  "</div>";
              }
            } else if (job.status === "failed") {
              clearInterval(poll);
              const el = document.getElementById("gen-status");
              if (el)
                el.textContent =
                  "Something went wrong — our team has been notified.";
            }
          });
      }, 5000);
    })
    .catch(() => show("step-confirm"));
}

function claimSite(url, email, jobId, publicUrl) {
  fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, email, job_id: jobId, public_url: publicUrl }),
  })
    .then((r) => r.json())
    .then(({ checkout_url }) => {
      if (checkout_url) window.location.href = checkout_url;
    });
}

function resetAudit() {
  document.getElementById("audit-url-input").value = "";
  show("step-url");
}

// === DIY Calculator ===
const tasks = [
  {
    name: "Researching which platform to use",
    note: "Wix vs Squarespace vs WordPress vs Webflow...",
    hours: 2,
  },
  {
    name: "Learning the website builder",
    note: "Getting past the frustration stage",
    hours: 6,
  },
  {
    name: "Setting up hosting & domain",
    note: "DNS records, nameservers, SSL certificates",
    hours: 2,
  },
  {
    name: "Designing the site",
    note: "Fonts, colors, layout, spacing, mobile view",
    hours: 8,
  },
  {
    name: "Writing copy & gathering photos",
    note: "What do I even say? What photos do I use?",
    hours: 3,
  },
  {
    name: "Fixing what breaks on mobile",
    note: "Because it never looks right the first time",
    hours: 2,
  },
  {
    name: "Annual maintenance & updates",
    note: "Per year, ongoing — every time you need a change",
    hours: 4,
  },
];
const totalHours = tasks.reduce((s, t) => s + t.hours, 0);

function fmt(n) {
  return "$" + n.toLocaleString();
}

function updateCalc(rate) {
  rate = parseInt(rate);
  const pct = ((rate - 25) / (300 - 25)) * 100;
  const slider = document.getElementById("rate-slider");
  slider.style.background =
    "linear-gradient(to right, var(--sage) 0%, var(--sage) " +
    pct +
    "%, var(--border) " +
    pct +
    "%)";

  document.getElementById("rate-display").textContent = "$" + rate + "/hr";

  // Update task rows
  document.querySelectorAll(".task-cost").forEach((el, i) => {
    if (i < tasks.length) {
      el.textContent = fmt(Math.round(tasks[i].hours * rate));
    }
  });

  const total = Math.round(totalHours * rate);
  document.getElementById("total-cost").textContent = fmt(total);
  document.getElementById("total-hours").textContent =
    "~" + totalHours + " hrs";
  document.getElementById("vs-diy").textContent = fmt(total) + "+";
}

function buildRows() {
  const container = document.getElementById("task-rows");
  container.innerHTML = tasks
    .map(
      (t) =>
        '<div class="task-row">' +
        '<div class="task-name">' +
        t.name +
        "<small>" +
        t.note +
        "</small></div>" +
        '<div class="task-hours">~' +
        t.hours +
        " hr" +
        (t.hours !== 1 ? "s" : "") +
        "</div>" +
        '<div class="task-cost">' +
        fmt(t.hours * 75) +
        "</div>" +
        "</div>",
    )
    .join("");
}

// === Pricing Toggle ===
function initPricingToggle() {
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  if (!toggleBtns.length) return;

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// === Claim Your Site ===
function claimSite() {
  const url = document.getElementById("claim-url").value;
  if (!url.trim()) {
    document.getElementById("claim-url").focus();
    return;
  }
  // Show plan selection
  document.getElementById("claim-plans").style.display = "block";
  // Smooth scroll to plans
  document
    .getElementById("claim-plans")
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

// === Init on DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  // Nav: close menu on link click (mobile)
  document.querySelectorAll("#nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      document.getElementById("nav-links").classList.remove("open");
      document.getElementById("hamburger").classList.remove("open");
    });
  });

  // Audit: Enter key to scan
  const auditInput = document.getElementById("audit-url-input");
  if (auditInput) {
    auditInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runAudit();
    });
  }

  // DIY Calculator: build rows and set initial rate
  buildRows();
  updateCalc(75);

  // Pricing toggle
  initPricingToggle();

  // Claim: Enter key
  const claimInput = document.getElementById("claim-url");
  if (claimInput) {
    claimInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") claimSite();
    });
  }

  // Sticky mobile CTA: show after scrolling past hero
  const stickyCta = document.getElementById("sticky-cta");
  if (stickyCta) {
    let lastScroll = 0;
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        const heroHeight = document.querySelector(".hero")
          ? document.querySelector(".hero").offsetHeight
          : 600;
        if (scrollY > heroHeight && scrollY > lastScroll) {
          stickyCta.style.transform = "translateY(0)";
        } else if (scrollY <= heroHeight) {
          stickyCta.style.transform = "translateY(100%)";
        }
        lastScroll = scrollY;
      },
      { passive: true },
    );
    // Start hidden
    stickyCta.style.transform = "translateY(100%)";
    stickyCta.style.transition = "transform 0.3s ease";
  }
});
