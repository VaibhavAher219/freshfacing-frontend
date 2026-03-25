"use client";

import Script from "next/script";

const bodyHTML = `
<!-- NAV -->
<nav>
  <a href="#" style="display:flex;align-items:center;gap:0.55rem;text-decoration:none;">
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="26" height="26" rx="5" fill="#5c7a5c"/>
      <path d="M7 8.5h12M7 13h7.5M7 17.5h9.5" stroke="#faf7f2" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="17.5" r="3" fill="#e8a830"/>
    </svg>
    <span class="logo">fresh<em>facing</em></span>
  </a>
  <div class="nav-links" id="nav-links">
    <a href="#pain">Why It Matters</a>
    <a href="#how">How It Works</a>
    <a href="#diy">DIY vs. Us</a>
    <a href="#pricing">Pricing</a>
    <a href="#claim" class="nav-claim">Already got your preview?</a>
    <a href="/scan" class="nav-cta">Get My New Site &rarr;</a>
  </div>
  <button class="hamburger" id="hamburger" onclick="toggleNav()" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">&#127807; New site. In an hour. From $20/mo.</div>
    <h1 class="hero-headline">
      Time for a<br>
      <span class="accent">fresh facing.</span>
    </h1>
    <p class="hero-sub">If your site looks like it was built in 2015, customers are already calling someone else. Drop your URL — we'll show you exactly what's wrong and build you a better one.</p>

    <div class="url-form" id="audit-form-wrap">
      <!-- STEP 1: URL entry -->
      <div id="step-url">
        <label class="url-form-label">See what's wrong with your site — free, instant</label>
        <div class="url-input-row">
          <input class="url-input" id="audit-url-input" type="text" placeholder="yourbusiness.com" autocomplete="off" />
          <button type="button" class="url-btn" id="audit-btn" onclick="window.location.href='/scan?url='+encodeURIComponent(document.getElementById('audit-url-input').value)">Scan My Site &rarr;</button>
        </div>
        <p class="form-note">No sign-up. Results in seconds.</p>
      </div>

      <!-- STEP 2: Scanning animation -->
      <div id="step-scanning" style="display:none; text-align:center; padding:1.5rem 0;">
        <div class="scan-spinner"></div>
        <div id="scan-status" style="font-size:0.82rem;color:var(--mid);margin-top:0.75rem;">Checking mobile compatibility...</div>
      </div>

      <!-- STEP 3: Results -->
      <div id="step-results" style="display:none;">
        <div class="audit-results-header">
          <div id="result-domain" style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;color:var(--mid);margin-bottom:0.25rem;"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;">Site Health Report</div>
            <div id="result-score" class="score-badge"></div>
          </div>
        </div>
        <div id="audit-items-list" class="audit-items" style="margin-bottom:1.25rem;"></div>
        <div style="background:var(--light);border-radius:6px;padding:1rem;margin-bottom:1rem;">
          <div style="font-size:0.78rem;font-weight:600;color:var(--ink);margin-bottom:0.4rem;">Want us to fix all of this?</div>
          <div style="font-size:0.78rem;color:var(--mid);margin-bottom:0.75rem;">We'll build you a free preview — no credit card, no commitment.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
            <input id="intake-first" type="text" placeholder="First name" style="background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:4px;padding:0.6rem 0.75rem;font-size:0.82rem;font-family:inherit;outline:none;" />
            <input id="intake-last" type="text" placeholder="Last name" style="background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:4px;padding:0.6rem 0.75rem;font-size:0.82rem;font-family:inherit;outline:none;" />
          </div>
          <input id="intake-business" type="text" placeholder="Business name" style="width:100%;background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:4px;padding:0.6rem 0.75rem;font-size:0.82rem;font-family:inherit;outline:none;margin-bottom:6px;box-sizing:border-box;" />
          <div style="display:flex;gap:0;flex-wrap:wrap;">
            <input class="email-input" id="result-email" type="email" placeholder="your@email.com" style="flex:1;min-width:0;border-right:none;border-radius:4px 0 0 4px;font-size:0.82rem;padding:0.65rem 0.85rem;" />
            <button type="button" class="email-btn" style="font-size:0.78rem;padding:0.65rem 1rem;border-radius:0 4px 4px 0;" onclick="submitEmail()">Get My Free Preview →</button>
          </div>
        </div>
        <div style="text-align:center;">
          <button onclick="resetAudit()" style="background:none;border:none;font-size:0.75rem;color:var(--mid);cursor:pointer;text-decoration:underline;">Check a different site</button>
        </div>
      </div>

      <!-- STEP 4: Confirmation -->
      <div id="step-confirm" style="display:none;text-align:center;padding:1.5rem 0;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">&#127807;</div>
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;margin-bottom:0.5rem;">You're on the list.</div>
        <div style="font-size:0.875rem;color:var(--mid);line-height:1.6;max-width:34ch;margin:0 auto 1rem;">We're building your site now. Check your inbox in about an hour — you'll get a live preview link.</div>
        <div style="font-size:0.75rem;color:var(--mid);">No cost. No commitment. Just look.</div>
      </div>
    </div>
  </div>

  <!-- Floating audit card -->
  <div class="hero-right">
    <div style="font-size:0.72rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--mid);margin-bottom:0.75rem;">What we find on most sites we check</div>
    <div class="site-audit-card">
      <div class="audit-topbar">
        <div class="audit-dots">
          <div class="dot dot-r"></div>
          <div class="dot dot-y"></div>
          <div class="dot dot-g"></div>
        </div>
        <div class="audit-url">yourbusiness.com</div>
      </div>
      <div class="audit-body">
        <div class="audit-title">
          Site Health Report
          <span class="score">Score: 24/100</span>
        </div>
        <div class="audit-items">
          <div class="audit-item fail">
            <span class="audit-icon">&#128241;</span>
            <span>Broken on mobile</span>
            <span class="audit-stat">63% of visits</span>
          </div>
          <div class="audit-item fail">
            <span class="audit-icon">&#128269;</span>
            <span>Not indexed by Google</span>
            <span class="audit-stat">0 pages found</span>
          </div>
          <div class="audit-item fail">
            <span class="audit-icon">&#129302;</span>
            <span>Invisible to AI search</span>
            <span class="audit-stat">ChatGPT, Perplexity</span>
          </div>
          <div class="audit-item fail">
            <span class="audit-icon">&#128279;</span>
            <span>Broken links detected</span>
            <span class="audit-stat">7 found</span>
          </div>
          <div class="audit-item warn">
            <span class="audit-icon">&#9889;</span>
            <span>Page load: 8.4 seconds</span>
            <span class="audit-stat">Avg: 2.1s</span>
          </div>
          <div class="audit-item warn">
            <span class="audit-icon">&#128222;</span>
            <span>No click-to-call button</span>
            <span class="audit-stat">&mdash;</span>
          </div>
          <div class="audit-item pass">
            <span class="audit-icon">&#9989;</span>
            <span>Domain is registered</span>
            <span class="audit-stat">Good</span>
          </div>
        </div>
        <div class="audit-footer">Your business is real. Your website isn't keeping up.</div>
      </div>
    </div>
  </div>
</section>

<!-- STATS STRIP -->
<div class="stats-strip">
  <div class="stats-inner">
    <div class="stat-block">
      <div class="stat-num">63%</div>
      <div class="stat-label">
        <strong>of local searches happen on mobile.</strong>
        If your site breaks on a phone, you're invisible to most of your market.
      </div>
    </div>
    <div class="stat-block">
      <div class="stat-num">46%</div>
      <div class="stat-label">
        <strong>of all Google searches are looking for local businesses.</strong>
        If your site isn't indexed, none of those people ever find you.
      </div>
    </div>
    <div class="stat-block">
      <div class="stat-num">3 sec</div>
      <div class="stat-label">
        <strong>is all you get before a visitor leaves.</strong>
        Most small business sites take 6–10 seconds to load. That's a customer lost.
      </div>
    </div>
    <div class="stat-block">
      <div class="stat-num">&uarr;AI</div>
      <div class="stat-label">
        <strong>ChatGPT, Perplexity, and Google AI are now recommending businesses.</strong>
        If your site isn't structured correctly, they can't find you either.
      </div>
    </div>
  </div>
</div>

<!-- SOCIAL PROOF -->
<div class="proof-strip">
  <div class="proof-inner">
    <div class="proof-item">
      <div class="proof-num">200+</div>
      <div class="proof-label">sites built</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-item">
      <div class="proof-num">&lt;1 hr</div>
      <div class="proof-label">avg build time</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-item">
      <div class="proof-num">4.9&#9733;</div>
      <div class="proof-label">owner satisfaction</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-item">
      <div class="proof-num">$0</div>
      <div class="proof-label">upfront cost</div>
    </div>
  </div>
</div>

<!-- PAIN -->
<section class="pain" id="pain">
  <div class="section-eyebrow">The honest stuff</div>
  <h2 class="section-title">You already know something's wrong.</h2>
  <p class="section-sub">You've just been too busy running your actual business to do anything about it. That's exactly why we exist.</p>

  <div class="pain-grid">
    <div class="pain-card">
      <div class="pain-icon">&#128241;</div>
      <h3>"It looks fine on my computer..."</h3>
      <p>Most of your customers find you on their phone. If your site squishes, overlaps, or doesn't load right on mobile — that's almost certainly what they're seeing. And they're not calling to tell you.</p>
      <span class="pain-stat">63% of local searches: mobile</span>
    </div>

    <div class="pain-card">
      <div class="pain-icon">&#128269;</div>
      <h3>"I thought I was on Google?"</h3>
      <p>Being on Google and being <em>found</em> on Google are very different things. Outdated site structure, missing metadata, and slow load times push you down — or out completely. AI search tools like ChatGPT work the same way.</p>
      <span class="pain-stat">Most SMB sites rank on page 4+</span>
    </div>

    <div class="pain-card">
      <div class="pain-icon">&#128279;</div>
      <h3>"I haven't touched it in years."</h3>
      <p>Links rot. Plugins break. Photos disappear. The email form stops working. Customers try to reach you and can't. You never find out because nobody tells you — they just leave.</p>
      <span class="pain-stat">Avg SMB site: 4+ broken elements</span>
    </div>

    <div class="pain-card">
      <div class="pain-icon">&#128012;</div>
      <h3>"It loads fine for me."</h3>
      <p>Your browser has the site cached. For a new visitor on a 4G connection, an unoptimized site can take 8–12 seconds. Google penalizes this directly. Customers don't wait. They bounce.</p>
      <span class="pain-stat">40% leave if it takes &gt;3 seconds</span>
    </div>

    <div class="pain-card">
      <div class="pain-icon">&#128295;</div>
      <h3>"I can never figure out how to update it."</h3>
      <p>GoDaddy, Wix, Squarespace — great for someone who wants to spend their Saturdays on a website. You want to update your hours, not learn CSS. We handle all of that.</p>
      <span class="pain-stat">Avg time to update a DIY site: 2+ hrs</span>
    </div>

    <div class="pain-card">
      <div class="pain-icon">&#128184;</div>
      <h3>"The agency wanted way too much."</h3>
      <p>$3,000 upfront. 6-week timeline. Discovery calls and mood boards. You just need a site that works and looks like you know what you're doing. That shouldn't cost a fortune or take forever.</p>
      <span class="pain-stat">Avg agency quote: $3–8K</span>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how" id="how">
  <div class="how-inner">
    <div class="section-eyebrow">No fluff</div>
    <h2 class="section-title">Here's exactly how it works.</h2>
    <p class="section-sub">We skip the discovery process. You drop your URL, we do the work, you see the result.</p>

    <div class="how-layout">
      <div class="how-steps">
        <div class="how-step">
          <div class="step-num">01</div>
          <div class="step-content">
            <h3>Drop your URL above.</h3>
            <p>Just enter your current website address and your email. That's the whole intake process. No forms, no calls, no "we'll get back to you in 3-5 business days."</p>
          </div>
        </div>
        <div class="how-step">
          <div class="step-num">02</div>
          <div class="step-content">
            <h3>We build your new site.</h3>
            <p>Within an hour, we design a complete replacement — custom to your business, your industry, and what your customers actually need to see. Mobile-first. Fast. Built for search engines and AI.</p>
          </div>
        </div>
        <div class="how-step">
          <div class="step-num">03</div>
          <div class="step-content">
            <h3>You get a live preview link.</h3>
            <p>We email you a live URL — just click it. See your business looking the way it should. No pressure. Take a day. Show your partner or your team.</p>
          </div>
        </div>
        <div class="how-step">
          <div class="step-num">04</div>
          <div class="step-content">
            <h3>Say yes and we take it from there.</h3>
            <p>Reply and it's live within 24 hours. We handle hosting, maintenance, and updates. You get back to running your business. We keep the site working. That's the whole deal.</p>
          </div>
        </div>
      </div>

      <!-- Before / after comparison cards -->
      <div class="comparison">
        <div>
          <div class="compare-label old">What you have</div>
          <div class="compare-card">
            <div class="compare-bar">
              <div class="bar-dot" style="background:#ff6b6b"></div>
              yourbusiness.godaddysites.com
            </div>
            <div class="compare-content">
              <div class="compare-rows">
                <div class="compare-row"><span class="metric">Mobile friendly</span><span class="value-bad">&#10007; Broken</span></div>
                <div class="compare-row"><span class="metric">Page speed</span><span class="value-bad">8.4 sec</span></div>
                <div class="compare-row"><span class="metric">Google indexed</span><span class="value-bad">&#10007; No</span></div>
                <div class="compare-row"><span class="metric">AI search visible</span><span class="value-bad">&#10007; No</span></div>
                <div class="compare-row"><span class="metric">Working links</span><span class="value-bad">3 of 10</span></div>
                <div class="compare-row"><span class="metric">Click-to-call</span><span class="value-bad">&#10007; Missing</span></div>
                <div class="compare-row"><span class="metric">Last updated</span><span class="value-bad">4 years ago</span></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="compare-label new">What we build you</div>
          <div class="compare-card new-card">
            <div class="compare-bar" style="background:#f0fff4;border-color:rgba(92,122,92,0.15)">
              <div class="bar-dot" style="background:#69db7c"></div>
              yourbusiness.com
            </div>
            <div class="compare-content">
              <div class="compare-rows">
                <div class="compare-row"><span class="metric">Mobile friendly</span><span class="value-good">&#10003; Perfect</span></div>
                <div class="compare-row"><span class="metric">Page speed</span><span class="value-good">&lt;1.5 sec</span></div>
                <div class="compare-row"><span class="metric">Google indexed</span><span class="value-good">&#10003; Yes</span></div>
                <div class="compare-row"><span class="metric">AI search visible</span><span class="value-good">&#10003; Structured</span></div>
                <div class="compare-row"><span class="metric">Working links</span><span class="value-good">All of them</span></div>
                <div class="compare-row"><span class="metric">Click-to-call</span><span class="value-good">&#10003; Front &amp; center</span></div>
                <div class="compare-row"><span class="metric">Maintenance</span><span class="value-good">We handle it</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PORTFOLIO / EXAMPLES -->
<section class="portfolio" id="portfolio">
  <div class="section-eyebrow">Real examples</div>
  <h2 class="section-title">Sites we've already built.</h2>
  <p class="section-sub">Not templates. Not mockups. Real sites for real businesses — built in under an hour.</p>

  <div class="portfolio-grid">
    <a href="/preview/demo-golden-needle" target="_blank" rel="noopener" class="portfolio-card">
      <div class="portfolio-browser">
        <div class="portfolio-topbar">
          <div class="audit-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
          <div class="portfolio-url">goldenneedletailorshop.com</div>
        </div>
        <div class="portfolio-img portfolio-golden-needle">
          <div class="portfolio-preview-content">
            <div class="preview-nav">GOLDEN <span style="color:#c8a96e;">NEEDLE</span></div>
            <div class="preview-hero-dark">
              <div class="preview-eyebrow">Downtown Kalamazoo &middot; Est. 1971</div>
              <div class="preview-headline">The art of<br><em style="color:#c8a96e;">the perfect fit</em><br>since 1971.</div>
            </div>
          </div>
          <div class="portfolio-hover-overlay">
            <span>View Live Preview &rarr;</span>
          </div>
        </div>
      </div>
      <div class="portfolio-info">
        <div class="portfolio-industry">Tailors &amp; Alterations</div>
        <h3>Golden Needle Tailor Shop</h3>
        <p>Serving Kalamazoo since 1971. We replaced a site with missing address, blank hours, and expired coupons with a premium presence that leads with their 53-year legacy.</p>
      </div>
    </a>

    <a href="/preview/demo-reese-hvac" target="_blank" rel="noopener" class="portfolio-card">
      <div class="portfolio-browser">
        <div class="portfolio-topbar">
          <div class="audit-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
          <div class="portfolio-url">reeseair.com</div>
        </div>
        <div class="portfolio-img portfolio-reese-air">
          <div class="portfolio-preview-content">
            <div class="preview-nav" style="background:#1a3a1a;color:#fff;">Reese Heating &amp; Air <span style="color:#c8a96e;font-size:0.6em;">EST. 1916</span></div>
            <div class="preview-hero-green">
              <div class="preview-headline" style="color:#fff;">Nashville's HVAC<br><em style="color:#c8a96e;">family since</em><br><em style="color:#c8a96e;">1916.</em></div>
            </div>
          </div>
          <div class="portfolio-hover-overlay">
            <span>View Live Preview &rarr;</span>
          </div>
        </div>
      </div>
      <div class="portfolio-info">
        <div class="portfolio-industry">HVAC &amp; Heating</div>
        <h3>Reese Heating &amp; Air</h3>
        <p>Nashville's oldest family-owned HVAC company — five generations since 1916. We built a site that puts their family photo and century of trust front and center.</p>
      </div>
    </a>
  </div>
</section>

<!-- INDUSTRIES -->
<section class="industries">
  <div class="section-eyebrow">We know your business</div>
  <h2 class="section-title">Built for businesses that do real work.</h2>
  <p class="section-sub">We specialize in the kinds of local businesses that deserve a better web presence than they've got.</p>

  <div class="industry-grid">
    <div class="industry-card">
      <div class="industry-icon">&#128295;</div>
      <h3>HVAC &amp; Heating</h3>
      <p>Emergency availability, service areas, and financing front and center — what customers actually search for.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#129463;</div>
      <h3>Dental Offices</h3>
      <p>New patient booking, insurance info, and a face for the practice that builds trust before they walk in.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#129697;</div>
      <h3>Tailors &amp; Alterations</h3>
      <p>Craft, trust, and before/after work — the things that turn a search into a phone call.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#128663;</div>
      <h3>Auto Repair</h3>
      <p>Services, estimates, and reviews that make customers pick up the phone instead of scrolling past.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#127968;</div>
      <h3>Flooring &amp; Tile</h3>
      <p>Visual work deserves a visual site. Gallery-first layouts that let the craftsmanship sell itself.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#9878;&#65039;</div>
      <h3>Law &amp; Accounting</h3>
      <p>Authority and trust on first impression. Clear services, credentials, and a frictionless contact path.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#127869;&#65039;</div>
      <h3>Restaurants &amp; Caf&eacute;s</h3>
      <p>Hours, menu, location, and photos — the four things every customer wants immediately.</p>
    </div>
    <div class="industry-card">
      <div class="industry-icon">&#127970;</div>
      <h3>Your Industry</h3>
      <p>If you run a local business and your website isn't working for you, drop your URL above. We'll take a look.</p>
    </div>
  </div>
</section>

<!-- DIY OBJECTION + CALCULATOR -->
<section id="diy" style="padding:7rem 3rem;background:var(--light);border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
  <div style="max-width:1280px;margin:0 auto;">

    <div class="section-eyebrow">Fair question</div>
    <h2 class="section-title">"Couldn't I just do this myself?"</h2>
    <p class="section-sub">Absolutely. Here's what that actually costs you.</p>

    <!-- RATE SLIDER -->
    <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:2.5rem;margin-bottom:2.5rem;box-shadow:0 4px 24px rgba(28,24,16,0.07);">
      <div style="display:flex;align-items:baseline;gap:0.75rem;margin-bottom:0.4rem;flex-wrap:wrap;">
        <span style="font-size:0.8rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);">Your hourly rate</span>
        <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:2rem;color:var(--ink);" id="rate-display">$75/hr</span>
      </div>
      <input type="range" id="rate-slider" min="25" max="300" value="75" step="5"
        style="width:100%;height:6px;appearance:none;background:linear-gradient(to right,var(--sage) 0%,var(--sage) 20%,var(--border) 20%);border-radius:3px;outline:none;cursor:pointer;margin-bottom:0.5rem;"
        oninput="updateCalc(this.value)">
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--mid);">
        <span>$25/hr</span><span>$300/hr</span>
      </div>
    </div>

    <!-- TASKS TABLE -->
    <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:2.5rem;box-shadow:0 4px 24px rgba(28,24,16,0.07);">
      <div style="display:grid;grid-template-columns:1fr auto auto;background:var(--ink);padding:0.85rem 1.5rem;gap:1rem;">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,247,242,0.5);">Task</div>
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,247,242,0.5);text-align:right;">Time</div>
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,247,242,0.5);text-align:right;min-width:80px;">Your cost</div>
      </div>

      <div id="task-rows">
        <!-- Populated by JS -->
      </div>

      <!-- TOTAL ROW -->
      <div style="display:grid;grid-template-columns:1fr auto auto;padding:1.25rem 1.5rem;gap:1rem;background:rgba(201,79,40,0.06);border-top:2px solid var(--rust);">
        <div style="font-weight:700;font-size:0.95rem;color:var(--ink);">Total DIY cost <span style="font-weight:400;font-size:0.8rem;color:var(--mid);">(first year)</span></div>
        <div style="font-weight:700;font-size:0.95rem;color:var(--rust);text-align:right;" id="total-hours">~24 hrs</div>
        <div style="font-weight:800;font-size:1.1rem;color:var(--rust);text-align:right;min-width:80px;" id="total-cost">$1,800</div>
      </div>
    </div>

    <!-- VS COMPARISON -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2.5rem;">
      <div style="background:#fff5f2;border:1.5px solid rgba(201,79,40,0.2);border-radius:10px;padding:2rem;text-align:center;">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--rust);margin-bottom:0.75rem;">DIY — Year 1</div>
        <div style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:2.5rem;color:var(--rust);line-height:1;" id="vs-diy">$1,800+</div>
        <div style="font-size:0.82rem;color:var(--mid);margin-top:0.4rem;">in lost billable time</div>
        <div style="font-size:0.78rem;color:var(--mid);margin-top:0.25rem;">+ platform fees + your headaches</div>
      </div>
      <div style="background:#f0fff4;border:1.5px solid rgba(92,122,92,0.25);border-radius:10px;padding:2rem;text-align:center;">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--sage);margin-bottom:0.75rem;">FreshFacing — Year 1</div>
        <div style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:2.5rem;color:var(--sage);line-height:1;">$199</div>
        <div style="font-size:0.82rem;color:var(--mid);margin-top:0.4rem;">hosting, maintenance, updates</div>
        <div style="font-size:0.78rem;color:var(--mid);margin-top:0.25rem;">+ 0 hours of your time</div>
      </div>
    </div>

    <!-- BOTTOM LINE -->
    <div style="background:var(--ink);border-radius:10px;padding:2.5rem;display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;">
      <div>
        <div style="font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,247,242,0.4);margin-bottom:0.5rem;">The bottom line</div>
        <p style="font-family:'Newsreader',serif;font-style:italic;font-size:1.15rem;color:var(--cream);line-height:1.55;max-width:50ch;">This is the best-looking website you'll ever have — and it'll take you <strong style="font-style:normal;color:var(--amber);">zero hours</strong> to get it.</p>
      </div>
      <a href="/scan" style="display:inline-block;padding:1rem 2rem;background:var(--amber);color:var(--ink);text-decoration:none;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.875rem;letter-spacing:0.05em;border-radius:5px;white-space:nowrap;flex-shrink:0;">Scan My Site Free &rarr;</a>
    </div>

  </div>
</section>

<!-- PRICING -->
<section class="pricing" id="pricing">
  <div class="pricing-inner">
    <div class="pricing-header">
      <div class="section-eyebrow">Honest pricing</div>
      <h2 class="section-title">One flat fee. We handle everything.</h2>
      <p class="section-sub">No setup fee. No surprise bills. Looking at your new site is always free — you only pay when you're ready to go live.</p>
    </div>

    <div class="plans-row">
      <div class="plan featured">
        <div class="plan-badge">Most Popular</div>
        <div class="plan-name">Monthly</div>
        <div class="plan-price"><sup>$</sup>20</div>
        <div class="plan-per">per month — cancel anytime</div>
        <div class="plan-save">&nbsp;</div>
        <ul class="plan-features">
          <li><strong>Custom website</strong> built from your existing site</li>
          <li><strong>Hosting included</strong> — fast, reliable, we handle it</li>
          <li><strong>Your own domain</strong> connected (or we help you get one)</li>
          <li><strong>SSL certificate</strong> — secure by default</li>
          <li><strong>Mobile-optimized</strong> — looks great on every device</li>
          <li><strong>1 content update/month</strong> — hours, staff, specials, anything</li>
          <li><strong>All maintenance</strong> — zero tech headaches for you</li>
        </ul>
        <a href="/scan" class="plan-btn primary">See My New Site Free &rarr;</a>
        <p style="text-align:center;font-size:0.72rem;color:var(--mid);margin-top:0.75rem;">No credit card to preview. Pay only to go live.</p>
      </div>

      <div class="plan">
        <div class="plan-badge" style="background:var(--amber);color:#fff;">Save $41</div>
        <div class="plan-name">Annual</div>
        <div class="plan-price"><sup>$</sup>199</div>
        <div class="plan-per">per year — 2 months free</div>
        <div class="plan-save">$16.58/mo billed once a year</div>
        <ul class="plan-features">
          <li><strong>Everything in Monthly</strong></li>
          <li><strong>Priority updates</strong> — moved to front of queue</li>
          <li><strong>Annual design refresh</strong> — we modernize your site each year</li>
          <li><strong>SEO health report</strong> — what's ranking, what's not</li>
          <li><strong>Google Business Profile sync</strong> — hours, photos, reviews</li>
          <li><strong>Dedicated support</strong> — email us, we actually reply</li>
        </ul>
        <a href="/scan" class="plan-btn ghost">See My New Site Free &rarr;</a>
        <p style="text-align:center;font-size:0.72rem;color:var(--mid);margin-top:0.75rem;">No credit card to preview. Pay only to go live.</p>
      </div>
    </div>

    <div style="display:flex;justify-content:center;gap:2rem;margin-top:2rem;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--mid);">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="var(--sage)" stroke-width="1"/><path d="M5 8l2 2 4-4" stroke="var(--sage)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        No setup fee
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--mid);">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="var(--sage)" stroke-width="1"/><path d="M5 8l2 2 4-4" stroke="var(--sage)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Cancel anytime
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--mid);">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="var(--sage)" stroke-width="1"/><path d="M5 8l2 2 4-4" stroke="var(--sage)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        No contracts
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--mid);">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="var(--sage)" stroke-width="1"/><path d="M5 8l2 2 4-4" stroke="var(--sage)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Free preview — no card needed
      </div>
    </div>
  </div>
</section>

<!-- CLAIM YOUR SITE -->
<section class="claim-section" id="claim">
  <div class="claim-inner">
    <div class="claim-badge">Already got your preview?</div>
    <h2 class="section-title" style="color:var(--cream);">Claim your new site.</h2>
    <p class="section-sub" style="color:rgba(250,247,242,0.6);margin-bottom:2.5rem;">We sent you an email with a preview of your new website. Ready to make it yours? Enter your business URL below and we'll take it from there.</p>
    <div class="claim-form">
      <input class="claim-input" id="claim-url" type="text" placeholder="yourbusiness.com" />
      <button class="claim-btn" onclick="claimSite()">Claim My Site &rarr;</button>
    </div>
    <div id="claim-plans" style="display:none;margin-top:2.5rem;">
      <p style="font-size:0.9rem;color:rgba(250,247,242,0.7);margin-bottom:1.5rem;text-align:center;">Choose your plan to go live:</p>
      <div class="claim-plans-row">
        <a href="#" class="claim-plan-card" onclick="event.preventDefault();startCheckoutWithUrl('monthly');">
          <div class="claim-plan-name">Monthly</div>
          <div class="claim-plan-price">$20<span>/mo</span></div>
          <div class="claim-plan-note">Cancel anytime</div>
          <ul style="font-size:0.75rem;color:var(--mid);margin:0.75rem 0 0;padding-left:1rem;text-align:left;line-height:1.7;">
            <li>Custom site + hosting</li>
            <li>Your own domain</li>
            <li>SSL + mobile-ready</li>
            <li>1 update/month</li>
            <li>All maintenance included</li>
          </ul>
        </a>
        <a href="#" class="claim-plan-card featured" onclick="event.preventDefault();startCheckoutWithUrl('annual');">
          <div class="claim-plan-best">Best Value — Save $41</div>
          <div class="claim-plan-name">Annual</div>
          <div class="claim-plan-price">$199<span>/yr</span></div>
          <div class="claim-plan-note">$16.58/mo — 2 months free</div>
          <ul style="font-size:0.75rem;color:var(--mid);margin:0.75rem 0 0;padding-left:1rem;text-align:left;line-height:1.7;">
            <li>Everything in Monthly</li>
            <li>Priority updates</li>
            <li>Annual design refresh</li>
            <li>SEO health report</li>
            <li>Google Business sync</li>
          </ul>
        </a>
      </div>
    </div>
    <p class="claim-note">Questions? Email us at <a href="mailto:hello@freshfacing.com" style="color:var(--amber);">hello@freshfacing.com</a></p>
  </div>
</section>

<!-- FAQ -->
<section class="faq" id="faq">
  <div class="faq-inner">
    <div class="section-eyebrow">Common questions</div>
    <h2 class="section-title">Before you ask.</h2>
    <p class="section-sub">We've heard them all. Here are the straight answers.</p>

    <div class="faq-grid">
      <div class="faq-item">
        <h3>Do I keep my domain?</h3>
        <p>Yes. You keep your existing domain name. We point it at your new site — no disruption, no downtime. If you don't have a domain yet, we'll help you pick one.</p>
      </div>
      <div class="faq-item">
        <h3>Can I edit the site myself?</h3>
        <p>You don't need to. That's the whole point. Need something changed? Just email us. One content update per month is included, and most requests are done the same day.</p>
      </div>
      <div class="faq-item">
        <h3>What happens if I cancel?</h3>
        <p>Nothing dramatic. Your site goes down, you keep your domain, and we part as friends. No cancellation fees. No penalties. No contracts to break.</p>
      </div>
      <div class="faq-item">
        <h3>What platform do you build on?</h3>
        <p>We build custom, lightweight sites — not WordPress, not Wix. That means faster load times, no plugin bloat, and nothing that breaks when you're not looking.</p>
      </div>
      <div class="faq-item">
        <h3>Is the site preview really free?</h3>
        <p>Completely. We build your preview with zero obligation. If you don't like it, you don't pay. We think once you see it, you'll want to keep it.</p>
      </div>
      <div class="faq-item">
        <h3>How is this only $20/month?</h3>
        <p>We've built systems that let us create high-quality sites fast. No agency overhead, no project managers, no 6-week timelines. Just great sites for businesses that need them.</p>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="cta-final" id="cta">
  <div class="cta-final-inner">
    <div class="cta-final-eyebrow">It's time.</div>
    <h2 class="cta-final-title">Get your<br>fresh facing.</h2>
    <p class="cta-final-sub">Drop your URL. We'll send you a new site in an hour. If you love it, it's $20 a month to keep it. If not, no hard feelings.</p>
    <div class="cta-form">
      <input class="cta-input" id="cta-url" type="text" placeholder="yourbusiness.com" />
      <button type="button" class="cta-submit" onclick="window.location.href='/scan?url='+encodeURIComponent(document.getElementById('cta-url').value)">Scan My Site Free &rarr;</button>
    </div>
    <p class="cta-footnote">Instant results. No sign-up. We'll email your new site preview in under an hour.</p>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="logo">fresh<em>facing</em>.com</div>
  <div class="footer-links">
    <a href="#pain">Why It Matters</a>
    <a href="#how">How It Works</a>
    <a href="#pricing">Pricing</a>
    <a href="mailto:hello@freshfacing.com">hello@freshfacing.com</a>
  </div>
  <div class="footer-copy">&copy; 2026 FreshFacing. All rights reserved.</div>
</footer>

<!-- STICKY MOBILE CTA -->
<div class="sticky-mobile-cta" id="sticky-cta">
  <a href="/scan">Get My New Site &rarr;</a>
</div>
`;

export default function HomePage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/js/main.js" strategy="afterInteractive" />
    </>
  );
}
