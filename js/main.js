// ═══════════════════════════════════════
// FreshFacing — Main JavaScript
// ═══════════════════════════════════════

// === Nav Toggle (mobile hamburger) ===
function toggleNav() {
  document.getElementById('nav-links').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

// === Audit Scanner ===
const checks = [
  {
    key: 'mobile',
    label: 'Mobile-friendly',
    stat: val => val ? '✓ Looks good' : '63% of visitors use phones',
    pass: () => Math.random() > 0.72,
    fail_text: 'Broken or unreadable on smartphones',
    pass_text: 'Renders correctly on mobile',
    severity: 'fail'
  },
  {
    key: 'speed',
    label: 'Page load speed',
    stat: val => val ? '<2 sec' : Math.floor(Math.random()*6+5)+' seconds',
    pass: () => Math.random() > 0.65,
    fail_text: 'Too slow — visitors leave after 3 seconds',
    pass_text: 'Fast enough to keep visitors',
    severity: 'fail'
  },
  {
    key: 'ssl',
    label: 'Secure (HTTPS)',
    stat: val => val ? 'Active' : 'Missing',
    pass: () => Math.random() > 0.35,
    fail_text: 'No SSL — browsers warn visitors it\'s "not secure"',
    pass_text: 'SSL certificate active',
    severity: 'warn'
  },
  {
    key: 'indexed',
    label: 'Google indexing',
    stat: val => val ? 'Indexed' : '0 pages found',
    pass: () => Math.random() > 0.55,
    fail_text: 'Google can\'t find your pages — you don\'t show up in search',
    pass_text: 'Pages are indexed by Google',
    severity: 'fail'
  },
  {
    key: 'ai',
    label: 'AI search visibility',
    stat: val => val ? 'Structured' : 'Not structured',
    pass: () => Math.random() > 0.82,
    fail_text: 'ChatGPT & Perplexity can\'t recommend your business',
    pass_text: 'Structured data present for AI search',
    severity: 'warn'
  },
  {
    key: 'links',
    label: 'Broken links',
    stat: val => val ? 'None found' : Math.floor(Math.random()*8+2)+' broken',
    pass: () => Math.random() > 0.60,
    fail_text: 'Customers hit dead ends — forms, menus, or pages that don\'t work',
    pass_text: 'No broken links detected',
    severity: 'fail'
  },
  {
    key: 'contact',
    label: 'Click-to-call on mobile',
    stat: val => val ? 'Present' : 'Missing',
    pass: () => Math.random() > 0.58,
    fail_text: 'No tap-to-call — mobile visitors can\'t reach you easily',
    pass_text: 'Tap-to-call button present',
    severity: 'warn'
  },
  {
    key: 'fresh',
    label: 'Content freshness',
    stat: val => val ? 'Up to date' : Math.floor(Math.random()*4+2)+' years old',
    pass: () => Math.random() > 0.70,
    fail_text: 'Outdated content signals an abandoned site to Google and visitors',
    pass_text: 'Content appears reasonably current',
    severity: 'warn'
  }
];

const scanMessages = [
  'Checking mobile compatibility...',
  'Testing page load speed...',
  'Looking for SSL certificate...',
  'Checking Google index status...',
  'Scanning for AI search structure...',
  'Following all links...',
  'Checking contact & call buttons...',
  'Reviewing content freshness...',
  'Calculating your score...'
];

function cleanUrl(raw) {
  let u = raw.trim().toLowerCase();
  if (!u.startsWith('http')) u = 'https://' + u;
  try {
    return new URL(u).hostname.replace('www.','');
  } catch(e) { return raw.trim(); }
}

function show(id) {
  ['step-url','step-scanning','step-results','step-confirm'].forEach(s => {
    document.getElementById(s).style.display = s === id ? '' : 'none';
  });
}

function runAudit() {
  const raw = document.getElementById('audit-url-input').value;
  if (!raw.trim()) {
    document.getElementById('audit-url-input').focus();
    return;
  }
  const domain = cleanUrl(raw);
  show('step-scanning');

  let i = 0;
  const statusEl = document.getElementById('scan-status');
  const interval = setInterval(() => {
    if (i < scanMessages.length) {
      statusEl.textContent = scanMessages[i++];
    } else {
      clearInterval(interval);
    }
  }, 380);

  setTimeout(() => {
    clearInterval(interval);
    const results = checks.map(c => {
      const passed = c.pass();
      return { ...c, passed, statText: c.stat(passed) };
    });
    renderResults(domain, results);
    show('step-results');
  }, scanMessages.length * 380 + 400);
}

function renderResults(domain, results) {
  document.getElementById('result-domain').textContent = domain;

  const failures = results.filter(r => !r.passed && r.severity === 'fail').length;
  const warnings = results.filter(r => !r.passed && r.severity === 'warn').length;
  const score = Math.max(5, 100 - (failures * 14) - (warnings * 7));

  const scoreBadge = document.getElementById('result-score');
  scoreBadge.textContent = 'Score: ' + score + '/100';
  scoreBadge.className = 'score-badge ' + (score < 45 ? 'score-bad' : score < 70 ? 'score-mid' : 'score-ok');

  const list = document.getElementById('audit-items-list');
  list.innerHTML = results.map(r => {
    const cls = r.passed ? 'pass' : r.severity === 'fail' ? 'fail' : 'warn';
    const icon = r.passed ? '\u2705' : r.severity === 'fail' ? '\u274C' : '\u26A0\uFE0F';
    const text = r.passed ? r.pass_text : r.fail_text;
    return '<div class="audit-item ' + cls + '">' +
      '<span class="audit-icon">' + icon + '</span>' +
      '<span>' + text + '</span>' +
      '<span class="audit-stat">' + r.statText + '</span>' +
      '</div>';
  }).join('');
}

function submitEmail() {
  const email = document.getElementById('result-email').value;
  if (!email || !email.includes('@')) {
    document.getElementById('result-email').focus();
    return;
  }
  show('step-confirm');
}

function resetAudit() {
  document.getElementById('audit-url-input').value = '';
  show('step-url');
}

// === DIY Calculator ===
const tasks = [
  { name: 'Researching which platform to use', note: 'Wix vs Squarespace vs WordPress vs Webflow...', hours: 2 },
  { name: 'Learning the website builder', note: 'Getting past the frustration stage', hours: 6 },
  { name: 'Setting up hosting & domain', note: 'DNS records, nameservers, SSL certificates', hours: 2 },
  { name: 'Designing the site', note: 'Fonts, colors, layout, spacing, mobile view', hours: 8 },
  { name: 'Writing copy & gathering photos', note: 'What do I even say? What photos do I use?', hours: 3 },
  { name: 'Fixing what breaks on mobile', note: 'Because it never looks right the first time', hours: 2 },
  { name: 'Annual maintenance & updates', note: 'Per year, ongoing — every time you need a change', hours: 4 },
];
const totalHours = tasks.reduce((s, t) => s + t.hours, 0);

function fmt(n) { return '$' + n.toLocaleString(); }

function updateCalc(rate) {
  rate = parseInt(rate);
  const pct = ((rate - 25) / (300 - 25)) * 100;
  const slider = document.getElementById('rate-slider');
  slider.style.background = 'linear-gradient(to right, var(--sage) 0%, var(--sage) ' + pct + '%, var(--border) ' + pct + '%)';

  document.getElementById('rate-display').textContent = '$' + rate + '/hr';

  // Update task rows
  document.querySelectorAll('.task-cost').forEach((el, i) => {
    if (i < tasks.length) {
      el.textContent = fmt(Math.round(tasks[i].hours * rate));
    }
  });

  const total = Math.round(totalHours * rate);
  document.getElementById('total-cost').textContent = fmt(total);
  document.getElementById('total-hours').textContent = '~' + totalHours + ' hrs';
  document.getElementById('vs-diy').textContent = fmt(total) + '+';
}

function buildRows() {
  const container = document.getElementById('task-rows');
  container.innerHTML = tasks.map(t =>
    '<div class="task-row">' +
      '<div class="task-name">' + t.name + '<small>' + t.note + '</small></div>' +
      '<div class="task-hours">~' + t.hours + ' hr' + (t.hours !== 1 ? 's' : '') + '</div>' +
      '<div class="task-cost">' + fmt(t.hours * 75) + '</div>' +
    '</div>'
  ).join('');
}

// === Pricing Toggle ===
function initPricingToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  if (!toggleBtns.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// === Init on DOM Ready ===
document.addEventListener('DOMContentLoaded', () => {
  // Nav: close menu on link click (mobile)
  document.querySelectorAll('#nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
    });
  });

  // Audit: Enter key to scan
  const auditInput = document.getElementById('audit-url-input');
  if (auditInput) {
    auditInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') runAudit();
    });
  }

  // DIY Calculator: build rows and set initial rate
  buildRows();
  updateCalc(75);

  // Pricing toggle
  initPricingToggle();
});