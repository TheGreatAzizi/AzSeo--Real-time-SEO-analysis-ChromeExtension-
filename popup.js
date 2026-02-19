// ═══════════════════════════════════════════════════════
//  AzSeo — Popup Script v1
//  https://github.com/TheGreatAzizi | https://x.com/the_azzi
// ═══════════════════════════════════════════════════════

const CIRC = 2 * Math.PI * 52; // stroke-dasharray for r=52

// ─── SVG Icons ──────────────────────────────────────────
const ICON = {
  ok:   `<svg viewBox="0 0 16 16" fill="none" stroke="#22d97e" stroke-width="2" stroke-linecap="round"><polyline points="3,8 6.5,11.5 13,5"/></svg>`,
  warn: `<svg viewBox="0 0 16 16" fill="none" stroke="#f5c542" stroke-width="2" stroke-linecap="round"><line x1="8" y1="4" x2="8" y2="9"/><circle cx="8" cy="12" r="0.8" fill="#f5c542"/></svg>`,
  fail: `<svg viewBox="0 0 16 16" fill="none" stroke="#ff4060" stroke-width="2" stroke-linecap="round"><line x1="4.5" y1="4.5" x2="11.5" y2="11.5"/><line x1="11.5" y1="4.5" x2="4.5" y2="11.5"/></svg>`,
  info: `<svg viewBox="0 0 16 16" fill="none" stroke="#4d9fff" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><line x1="8" y1="7.5" x2="8" y2="11.5"/><circle cx="8" cy="5.2" r="0.5" fill="#4d9fff"/></svg>`,
};

const PTS_COLOR = { ok: '#22d97e', warn: '#f5c542', fail: '#ff4060', info: '#4d9fff' };

// ─── Score Calculator ────────────────────────────────────
function calculateScore(seo) {
  const checks = [];
  let total = 0;

  const add = (id, status, title, detail, pts, max, impact = 50) => {
    checks.push({ id, status, title, detail, pts, max, impact });
    total += pts;
  };

  // ── 1. Title [15]
  if (!seo.title.text) {
    add('title', 'fail', 'Missing <title> tag', 'The page title is crucial for SEO — it appears in SERPs and browser tabs.', 0, 15, 95);
  } else if (seo.title.length < 30) {
    add('title', 'warn', `Title too short (${seo.title.length} chars)`, `"${seo.title.text.slice(0,48)}" — Ideal range is 30–60 characters.`, 8, 15, 70);
  } else if (seo.title.length > 60) {
    add('title', 'warn', `Title too long (${seo.title.length} chars)`, `"${seo.title.text.slice(0,48)}…" — Google truncates titles over 60 chars.`, 9, 15, 60);
  } else {
    add('title', 'ok', `Title optimized (${seo.title.length} chars)`, `"${seo.title.text.slice(0,55)}"`, 15, 15, 95);
  }

  // ── 2. Meta Description [12]
  if (!seo.metaDescription.exists) {
    add('desc', 'fail', 'Missing meta description', 'A compelling description directly impacts click-through rates in search results.', 0, 12, 85);
  } else if (seo.metaDescription.length < 70) {
    add('desc', 'warn', `Description too short (${seo.metaDescription.length} chars)`, 'Aim for 70–160 characters to fill the SERP snippet.', 6, 12, 65);
  } else if (seo.metaDescription.length > 160) {
    add('desc', 'warn', `Description too long (${seo.metaDescription.length} chars)`, 'Google will truncate descriptions over 160 characters.', 7, 12, 55);
  } else {
    add('desc', 'ok', `Meta description optimized (${seo.metaDescription.length} chars)`, `"${seo.metaDescription.text.slice(0,60)}…"`, 12, 12, 85);
  }

  // ── 3. H1 [10]
  if (seo.headings.h1.length === 0) {
    add('h1', 'fail', 'No H1 heading found', 'Every page needs exactly one H1 containing your primary keyword.', 0, 10, 80);
  } else if (seo.headings.h1.length > 1) {
    add('h1', 'warn', `Multiple H1 tags (${seo.headings.h1.length})`, `First: "${seo.headings.h1[0].slice(0,40)}" — Use only one H1 per page.`, 6, 10, 60);
  } else {
    add('h1', 'ok', 'Single H1 heading', `"${seo.headings.h1[0].slice(0,52)}"`, 10, 10, 80);
  }

  // ── 4. HTTPS [10]
  if (seo.https.secure) {
    add('https', 'ok', 'HTTPS enabled', 'Secure connection is a confirmed Google ranking signal.', 10, 10, 90);
  } else {
    add('https', 'fail', 'Site is not HTTPS', 'Google deprioritizes HTTP sites. Get a free SSL cert via Let\'s Encrypt.', 0, 10, 90);
  }

  // ── 5. Images Alt [8]
  if (seo.images.total === 0) {
    add('img', 'info', 'No images found', 'No image alt text to evaluate on this page.', 8, 8, 30);
  } else if (seo.images.withoutAlt === 0) {
    add('img', 'ok', `All ${seo.images.total} images have alt text`, 'Great! Alt text helps crawlers index images and improves accessibility.', 8, 8, 65);
  } else {
    const ratio = seo.images.withoutAlt / seo.images.total;
    const pts = Math.round(8 * (1 - ratio));
    add('img', ratio > 0.5 ? 'fail' : 'warn', `${seo.images.withoutAlt}/${seo.images.total} images missing alt`, `${seo.images.withAlt} images have alt text; ${seo.images.withoutAlt} do not.`, pts, 8, 65);
  }

  // ── 6. Canonical [7]
  if (seo.canonical.exists) {
    add('canonical', 'ok', 'Canonical tag present', `<link rel="canonical" href="${seo.canonical.url.slice(0,40)}…">`, 7, 7, 70);
  } else {
    add('canonical', 'warn', 'No canonical tag', 'Without canonical, duplicate content may dilute your rankings.', 0, 7, 70);
  }

  // ── 7. Open Graph [6]
  const ogCount = Object.values(seo.openGraph).filter(Boolean).length;
  if (ogCount >= 3) {
    add('og', 'ok', `Open Graph tags complete (${ogCount}/4)`, 'og:title, og:description, og:image all present. 🎉', 6, 6, 50);
  } else if (ogCount > 0) {
    const missing = ['title','description','image','url'].filter(k => !seo.openGraph[k]).join(', ');
    add('og', 'warn', `Open Graph incomplete (${ogCount}/4)`, `Missing: og:${missing}`, ogCount * 2, 6, 50);
  } else {
    add('og', 'fail', 'No Open Graph tags', 'OG tags control how your page looks when shared on social media.', 0, 6, 50);
  }

  // ── 8. Viewport [5]
  if (seo.viewport.exists) {
    add('viewport', 'ok', 'Viewport meta tag set', `${seo.viewport.content || 'width=device-width, initial-scale=1'}`, 5, 5, 75);
  } else {
    add('viewport', 'fail', 'No viewport meta tag', 'Missing viewport breaks mobile rendering — a key mobile-first ranking factor.', 0, 5, 75);
  }

  // ── 9. Lang [5]
  if (seo.lang.exists) {
    add('lang', 'ok', `Language declared: ${seo.lang.value}`, 'Helps search engines serve the right content to the right audience.', 5, 5, 45);
  } else {
    add('lang', 'warn', 'No lang attribute on <html>', 'Add lang="en" (or your locale) to the HTML element.', 0, 5, 45);
  }

  // ── 10. Structured Data [5]
  if (seo.structuredData.count > 0) {
    const types = seo.structuredData.types.slice(0, 3).join(', ');
    add('schema', 'ok', `${seo.structuredData.count} Schema.org block${seo.structuredData.count > 1 ? 's' : ''}`, `Types: ${types || 'Unknown'}`, 5, 5, 60);
  } else {
    add('schema', 'warn', 'No structured data found', 'Add JSON-LD schema to unlock Rich Snippets in Google results.', 0, 5, 60);
  }

  // ── 11. Word Count [5]
  if (seo.content.wordCount >= 300) {
    add('content', 'ok', `Good content length (${seo.content.wordCount.toLocaleString()} words)`, 'Longer, in-depth content tends to rank better in search results.', 5, 5, 55);
  } else if (seo.content.wordCount >= 100) {
    add('content', 'warn', `Thin content (${seo.content.wordCount} words)`, 'Aim for at least 300 words for pages targeting search traffic.', 2, 5, 55);
  } else {
    add('content', 'fail', `Very little content (${seo.content.wordCount} words)`, 'This page may be considered thin content and ignored by crawlers.', 0, 5, 55);
  }

  // ── 12. Favicon [4]
  if (seo.favicon.exists) {
    add('favicon', 'ok', 'Favicon found', 'Displayed in browser tabs, bookmarks, and some SERP listings.', 4, 4, 30);
  } else {
    add('favicon', 'warn', 'No favicon detected', 'A favicon improves brand recognition and professionalism.', 0, 4, 30);
  }

  // ── 13. H2 Structure [3]
  if (seo.headings.h2 >= 2) {
    add('h2', 'ok', `${seo.headings.h2} H2 headings found`, `H3s: ${seo.headings.h3}, H4s: ${seo.headings.h4} — solid heading hierarchy.`, 3, 3, 40);
  } else if (seo.headings.h2 === 1) {
    add('h2', 'warn', 'Only one H2 found', 'Multiple H2s improve content structure and keyword distribution.', 1, 3, 40);
  } else {
    add('h2', 'warn', 'No H2 headings', 'Use H2s to break content into scannable sections.', 0, 3, 40);
  }

  // ── 14. Twitter Card [3]
  if (seo.twitterCard.exists) {
    add('twitter', 'ok', `Twitter Card: ${seo.twitterCard.type || 'found'}`, 'Controls preview appearance when shared on Twitter/X.', 3, 3, 35);
  } else {
    add('twitter', 'warn', 'No Twitter Card meta', 'Add twitter:card, twitter:title, twitter:description for better sharing.', 0, 3, 35);
  }

  // ── 15. Lazy Loading [2]
  if (seo.images.total > 0 && seo.performance.hasLazyImages) {
    add('lazy', 'ok', 'Lazy loading detected', 'loading="lazy" improves page speed — a ranking factor.', 2, 2, 40);
  } else if (seo.images.total > 3) {
    add('lazy', 'warn', 'No lazy loading on images', 'Add loading="lazy" to below-the-fold images to improve Core Web Vitals.', 0, 2, 40);
  }

  return { score: Math.min(100, Math.round(total)), checks };
}

// ─── Verdict ─────────────────────────────────────────────
function getVerdict(score) {
  if (score >= 90) return { label: 'Excellent', desc: 'This page is well-optimized. Keep monitoring and refining content quality.', color: '#22d97e', grade: 'A+', dialColor: '#22d97e' };
  if (score >= 80) return { label: 'Great', desc: 'Strong SEO foundation. A few small improvements will push you into excellent territory.', color: '#22d97e', grade: 'A', dialColor: '#22d97e' };
  if (score >= 65) return { label: 'Good', desc: 'Solid SEO with room for improvement. Address the warnings to boost your ranking potential.', color: '#00e5cc', grade: 'B', dialColor: '#00e5cc' };
  if (score >= 50) return { label: 'Fair', desc: 'Average SEO health. Several important factors need attention to compete effectively.', color: '#f5c542', grade: 'C', dialColor: '#f5c542' };
  if (score >= 30) return { label: 'Poor', desc: 'Significant SEO issues detected. Start with the critical items in the Tips tab.', color: '#ff7a35', grade: 'D', dialColor: '#ff7a35' };
  return { label: 'Critical', desc: 'This page has major SEO problems that likely prevent it from ranking in search results.', color: '#ff4060', grade: 'F', dialColor: '#ff4060' };
}

// ─── Generate Tips ────────────────────────────────────────
function generateTips(seo, checks) {
  const tips = [];
  const byId = {};
  checks.forEach(c => byId[c.id] = c);

  const tip = (priority, title, body, impact) => tips.push({ priority, title, body, impact });

  if (byId.https?.status === 'fail')
    tip('crit', 'Enable HTTPS / SSL', 'HTTPS is a confirmed Google ranking signal and builds user trust. Get a free certificate from Let\'s Encrypt or enable it via your hosting provider\'s control panel.', 95);
  if (byId.title?.status === 'fail')
    tip('crit', 'Add a <title> tag', 'Every page must have a unique, descriptive title between 30–60 characters containing your primary keyword. This is the single most impactful on-page SEO element.', 95);
  if (byId.desc?.status === 'fail')
    tip('crit', 'Write a meta description', 'Craft a compelling 70–160 character description with your keyword. While not a direct ranking factor, it dramatically affects CTR from search results.', 85);
  if (byId.h1?.status === 'fail')
    tip('crit', 'Add a single H1 heading', 'Place your primary keyword in one H1 tag near the top of the page. It signals the page\'s main topic to both users and search engines.', 80);
  if (byId.viewport?.status === 'fail')
    tip('high', 'Add viewport meta tag', 'Insert <meta name="viewport" content="width=device-width, initial-scale=1"> to ensure proper mobile rendering. Mobile-first indexing makes this essential.', 75);
  if (byId.canonical?.status !== 'ok')
    tip('high', 'Implement canonical URLs', 'Add <link rel="canonical" href="https://yoursite.com/page"> to consolidate link equity and prevent duplicate content penalties across paginated or parameter-driven URLs.', 70);
  if (byId.og?.status !== 'ok')
    tip('high', 'Complete Open Graph tags', `Add og:title, og:description, og:image, and og:url. These tags control how your page previews when shared on Facebook, LinkedIn, and messaging apps — directly impacting traffic.`, 65);
  if (byId.img?.status === 'warn' || byId.img?.status === 'fail')
    tip('high', `Fix ${seo.images.withoutAlt} missing alt texts`, 'Write descriptive alt attributes for all images. This aids Google Image Search indexing, improves accessibility (WCAG compliance), and provides keyword context.', 65);
  if (byId.schema?.status !== 'ok')
    tip('med', 'Add JSON-LD structured data', 'Implement Schema.org markup (Article, Product, FAQPage, BreadcrumbList) to unlock Rich Snippets — significantly boosting SERP click-through rates.', 60);
  if (byId.twitter?.status !== 'ok')
    tip('med', 'Add Twitter Card meta tags', 'Include twitter:card, twitter:title, twitter:description, and twitter:image to control how your content renders when shared on X (Twitter).', 35);
  if (byId.content?.status !== 'ok')
    tip('med', 'Expand page content', `With only ${seo.content.wordCount} words, this page may be seen as "thin content." Aim for 600+ words with relevant keywords, headings, and genuinely useful information for users.`, 55);
  if (byId.h2?.status !== 'ok')
    tip('low', 'Improve heading hierarchy', 'Add multiple H2 and H3 headings to break up content. This improves readability, helps search engines understand content structure, and creates natural keyword placement opportunities.', 40);
  if (byId.lang?.status !== 'ok')
    tip('low', 'Declare page language', 'Add lang="en" (or your locale) to the <html> element. This helps search engines serve the right language results and improves accessibility.', 45);
  if (byId.lazy?.status === 'warn')
    tip('low', 'Add lazy loading to images', 'Add loading="lazy" to images below the fold. This improves Core Web Vitals (LCP/CLS), which are direct Google ranking factors since 2021.', 40);
  if (!tips.length)
    tip('low', '🎉 Outstanding SEO health!', 'This page ticks all the key SEO boxes. Focus on content quality, earning authoritative backlinks, and monitoring Core Web Vitals in Google Search Console for continued growth.', 20);

  return tips;
}

// ─── Render: Checks ──────────────────────────────────────
function renderChecks(checks) {
  const list = document.getElementById('checksList');
  list.innerHTML = '';
  checks.forEach((c, i) => {
    const pts_color = PTS_COLOR[c.status];
    const div = document.createElement('div');
    div.className = `check-item ${c.status}`;
    div.style.animationDelay = `${i * 35}ms`;
    div.innerHTML = `
      <div class="check-icon">${ICON[c.status]}</div>
      <div class="check-body">
        <div class="check-title">${c.title}</div>
        <div class="check-detail">${c.detail}</div>
      </div>
      <div class="check-score">
        <div class="cs-pts" style="color:${pts_color}">${c.pts}</div>
        <div class="cs-max">/${c.max}pts</div>
      </div>`;
    list.appendChild(div);
  });
}

// ─── Render: Overview ────────────────────────────────────
function renderOverview(seo, checks) {
  const wrap = document.getElementById('overviewWrap');
  wrap.innerHTML = '';

  const pass = checks.filter(c => c.status === 'ok').length;
  const warn = checks.filter(c => c.status === 'warn').length;
  const fail = checks.filter(c => c.status === 'fail').length;
  const totalPts = checks.reduce((s,c)=>s+c.max,0);
  const earnPts  = checks.reduce((s,c)=>s+c.pts,0);

  // Score label
  const sl = document.createElement('div');
  sl.className = 'ov-section';
  sl.textContent = 'Results Summary';
  wrap.appendChild(sl);

  // Main 3 cards
  const g1 = document.createElement('div');
  g1.className = 'ov-grid';
  [
    { lbl:'Passed', val: pass, cls:'c-ok', sub:`${checks.length} total checks` },
    { lbl:'Warnings', val: warn, cls:'c-warn', sub:'Improvements available' },
    { lbl:'Failed', val: fail, cls:'c-fail', sub:'Need attention' },
  ].forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'ov-card';
    card.style.animationDelay = `${i*40}ms`;
    card.innerHTML = `<div class="ov-lbl">${item.lbl}</div><div class="ov-val ${item.cls}">${item.val}</div><div class="ov-sub">${item.sub}</div>`;
    g1.appendChild(card);
  });
  wrap.appendChild(g1);

  // Score progress bar
  const barRow = document.createElement('div');
  barRow.className = 'ov-bar-row';
  barRow.innerHTML = `
    <div class="ov-bar-label"><span>Points earned</span><span style="color:var(--cyan)">${earnPts} / ${totalPts}</span></div>
    <div class="ov-bar-track"><div class="ov-bar-fill" id="barFill1" style="background:var(--cyan)"></div></div>`;
  wrap.appendChild(barRow);

  // Content stats
  const s2 = document.createElement('div');
  s2.className = 'ov-section';
  s2.textContent = 'Page Statistics';
  wrap.appendChild(s2);

  const g2 = document.createElement('div');
  g2.className = 'ov-grid';
  [
    { lbl:'Word Count', val: seo.content.wordCount.toLocaleString(), cls: seo.content.wordCount>=300?'c-ok':seo.content.wordCount>=100?'c-warn':'c-fail', sub:'words on page' },
    { lbl:'Images', val: seo.images.total, cls:'', sub:`${seo.images.withAlt} with alt` },
    { lbl:'Links', val: seo.links.total, cls:'', sub:`${seo.links.internal} int. / ${seo.links.external} ext.` },
    { lbl:'H1 / H2 / H3', val: `${seo.headings.h1.length}/${seo.headings.h2}/${seo.headings.h3}`, cls:'c-cyan', sub:'heading structure' },
    { lbl:'Schemas', val: seo.structuredData.count, cls: seo.structuredData.count>0?'c-ok':'c-fail', sub:'JSON-LD blocks' },
    { lbl:'OG Tags', val: `${Object.values(seo.openGraph).filter(Boolean).length}/4`, cls: Object.values(seo.openGraph).filter(Boolean).length>=3?'c-ok':'c-warn', sub:'of 4 expected' },
  ].forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'ov-card';
    card.style.animationDelay = `${i*35+120}ms`;
    card.innerHTML = `<div class="ov-lbl">${item.lbl}</div><div class="ov-val ${item.cls}">${item.val}</div><div class="ov-sub">${item.sub}</div>`;
    g2.appendChild(card);
  });
  wrap.appendChild(g2);

  // Feature flags
  const s3 = document.createElement('div');
  s3.className = 'ov-section';
  s3.textContent = 'Feature Flags';
  wrap.appendChild(s3);

  const flags = [
    { name:'HTTPS', on: seo.https.secure },
    { name:'Canonical', on: seo.canonical.exists },
    { name:'Viewport', on: seo.viewport.exists },
    { name:'lang attr', on: seo.lang.exists },
    { name:'Favicon', on: seo.favicon.exists },
    { name:'Twitter Card', on: seo.twitterCard.exists },
    { name:'Schema.org', on: seo.structuredData.count > 0 },
    { name:'Lazy Images', on: seo.performance.hasLazyImages },
  ];
  const flagGrid = document.createElement('div');
  flagGrid.className = 'ov-flags';
  flags.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'flag';
    el.style.animationDelay = `${i*30+200}ms`;
    el.innerHTML = `<div class="flag-ic ${f.on?'ok':'off'}">${f.on?'✓':'✕'}</div><span class="flag-name">${f.name}</span>`;
    flagGrid.appendChild(el);
  });
  wrap.appendChild(flagGrid);

  // Animate bar
  setTimeout(() => {
    const bf = document.getElementById('barFill1');
    if (bf) bf.style.width = `${(earnPts/totalPts)*100}%`;
  }, 200);
}

// ─── Render: Tips ────────────────────────────────────────
function renderTips(tips) {
  const list = document.getElementById('tipsList');
  list.innerHTML = '';
  const priCfg = {
    crit: { cls:'pri-crit', label:'CRITICAL' },
    high: { cls:'pri-high', label:'HIGH' },
    med:  { cls:'pri-med',  label:'MEDIUM' },
    low:  { cls:'pri-low',  label:'LOW' },
  };
  const impactColor = (v) => v >= 80 ? '#ff4060' : v >= 60 ? '#f5c542' : v >= 40 ? '#4d9fff' : '#22d97e';
  tips.forEach((t, i) => {
    const cfg = priCfg[t.priority];
    const el = document.createElement('div');
    el.className = 'tip-item';
    el.style.animationDelay = `${i*45}ms`;
    el.innerHTML = `
      <div class="tip-head">
        <span class="tip-pri ${cfg.cls}">${cfg.label}</span>
        <span class="tip-title">${t.title}</span>
      </div>
      <div class="tip-body">${t.body}</div>
      <div class="tip-impact">
        <span class="impact-label">SEO Impact</span>
        <div class="impact-track"><div class="impact-fill" style="background:${impactColor(t.impact)}" data-w="${t.impact}"></div></div>
      </div>`;
    list.appendChild(el);
  });
  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.impact-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 300);
}

// ─── Render all ───────────────────────────────────────────
function renderResults(seo) {
  const { score, checks } = calculateScore(seo);
  const tips    = generateTips(seo, checks);
  const verdict = getVerdict(score);

  // Dial animation
  const dialFill = document.getElementById('dialFill');
  const offset = CIRC - (score / 100) * CIRC;
  setTimeout(() => {
    dialFill.style.strokeDashoffset = offset;
    dialFill.style.stroke = verdict.dialColor;
    dialFill.style.filter = `drop-shadow(0 0 8px ${verdict.dialColor})`;
  }, 80);

  // Count up
  let cur = 0;
  const step = Math.max(1, Math.ceil(score / 45));
  const interval = setInterval(() => {
    cur = Math.min(cur + step, score);
    document.getElementById('dialNum').textContent = cur;
    if (cur >= score) clearInterval(interval);
  }, 28);

  // Grade badge
  const badge = document.getElementById('gradeBadge');
  badge.textContent = verdict.grade;
  badge.style.color = verdict.color;
  badge.style.borderColor = verdict.color + '44';

  // Verdict text
  document.getElementById('scoreVerdict').textContent = verdict.label;
  document.getElementById('scoreVerdict').style.color = verdict.color;
  document.getElementById('scoreDesc').textContent = verdict.desc;

  // Stat pills
  const pass = checks.filter(c=>c.status==='ok').length;
  const warn = checks.filter(c=>c.status==='warn').length;
  const fail = checks.filter(c=>c.status==='fail').length;
  const pills = document.getElementById('statPills');
  pills.innerHTML = `
    <div class="pill"><div class="pill-dot ok"></div>${pass} passed</div>
    <div class="pill"><div class="pill-dot warn"></div>${warn} warnings</div>
    <div class="pill"><div class="pill-dot fail"></div>${fail} failed</div>`;

  // Points display
  const totalPts = checks.reduce((s,c)=>s+c.max,0);
  const earnPts  = checks.reduce((s,c)=>s+c.pts,0);
  document.getElementById('ptsDisplay').innerHTML = `<strong>${earnPts}</strong>/${totalPts} pts`;

  // Status dot
  document.getElementById('statusDot').className = 'dot';
  document.getElementById('statusText').textContent = 'ready';

  // Render panels
  renderChecks(checks);
  renderOverview(seo, checks);
  renderTips(tips);

  // Show
  document.getElementById('loading').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

// ─── Tab Switching ────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
  });
});

// ─── Main Runner ──────────────────────────────────────────
async function runAnalysis() {
  // Reset
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('results').style.display  = 'none';
  document.getElementById('error').style.display    = 'none';
  document.getElementById('statusDot').className    = 'dot scanning';
  document.getElementById('statusText').textContent = 'scanning';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || /^(chrome|about|edge|brave):/.test(tab.url)) {
      throw new Error('Open a regular webpage to analyze its SEO.');
    }

    // Display URL
    try {
      const u = new URL(tab.url);
      document.getElementById('urlBar').innerHTML =
        `<span class="proto">${u.protocol}//</span><span class="host">${u.hostname}${u.pathname.length > 1 ? u.pathname.slice(0,24) : ''}</span>`;
    } catch { document.getElementById('urlBar').textContent = tab.url.slice(0,40); }

    // Inject content script
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => {});

    const seoData = await new Promise((res, rej) => {
      chrome.tabs.sendMessage(tab.id, { action: 'analyzeSEO' }, (r) => {
        if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
        else res(r);
      });
    });

    renderResults(seoData);
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('errorMsg').textContent = err.message;
    document.getElementById('statusDot').className = 'dot error';
    document.getElementById('statusText').textContent = 'error';
  }
}

document.getElementById('rescanBtn').addEventListener('click', runAnalysis);
runAnalysis();
