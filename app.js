/* Dhara prototype: application.
   Vanilla JS single-page app with hash routing. No network calls. */
'use strict';

(function () {
  const D = window.DHARA;

  /* ------------------------------------------------------------------
     Utilities
  ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const TODAY = iso(new Date());
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const addYears = (s, n) => { const d = parse(s); d.setFullYear(d.getFullYear() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  const bnNum = (s) => String(s).replace(/\d/g, (d) => BN_DIGITS[d]);
  const enNum = (s) => String(s).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));
  function fmt(s, lang) {
    if (!s) return '';
    const d = parse(s);
    if (lang === 'bn') return bnNum(d.getDate()) + ' ' + MONTHS_BN[d.getMonth()] + ' ' + bnNum(d.getFullYear());
    return d.getDate() + ' ' + MONTHS_EN[d.getMonth()] + ' ' + d.getFullYear();
  }
  const fmtShort = (s) => { const d = parse(s); return d.getDate() + ' ' + MONTHS_EN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
  const resolveDate = (d) => (d === 'today' ? TODAY : d);
  function daysLeftText(n) {
    if (n === 0) return 'Today';
    if (n === 1) return '1 day left';
    if (n > 1) return n + ' days left';
    if (n === -1) return '1 day ago';
    return Math.abs(n) + ' days ago';
  }
  function announce(msg) { const l = $('#live'); l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); }

  const ICON = {
    check: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3L2 20h20L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.6v.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    q: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.6 2.6 0 115 1c-.8.8-2.5 1.4-2.5 3M12 17v.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    upload: '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* Semantic badge: colour is always paired with an icon and words. */
  function sem(kind, text) {
    const ic = { green: ICON.check, amber: ICON.warn, red: ICON.flag, blue: ICON.clock, grey: ICON.info }[kind] || '';
    return `<span class="sbadge s-${kind}">${ic}<span>${text}</span></span>`;
  }

  /* ------------------------------------------------------------------
     Corpus helpers
  ------------------------------------------------------------------ */
  const sec = (sid) => D.sections[sid];
  function versionOn(sid, date) {
    const s = sec(sid);
    if (!s || date < D.act.commenced) return null;
    for (const v of s.versions) {
      const from = v.from || D.act.commenced;
      if (date >= from && (!v.to || date <= v.to)) return v;
    }
    return null;
  }
  const versionIndexOn = (sid, date) => { const v = versionOn(sid, date); return v ? sec(sid).versions.indexOf(v) : -1; };
  function rangeText(v, lang) {
    const from = v.from ? fmt(v.from, lang) : (lang === 'bn' ? 'তারিখ অজানা' : 'Date unknown');
    const to = v.to ? fmt(v.to, lang) : (lang === 'bn' ? 'বর্তমান' : 'present');
    return from + ' – ' + to;
  }
  function markup(text, sid) {
    return text.split('\n').map((p) => '<p>' + esc(p).replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (m, k, t) => `<span class="cite-span" data-span="${sid}:${k}">${t}</span>`) + '</p>').join('');
  }
  const plain = (t) => t.replace(/\[\[\w+\|([^\]]+)\]\]/g, '$1');
  const secLabel = (sid, lang) => (lang === 'bn' ? 'ধারা ' + sec(sid).numBn : 'Section ' + sec(sid).num);
  const secTitle = (sid, lang) => sec(sid)[lang === 'bn' ? 'title_bn' : 'title_en'];

  function lineageBadge(l) {
    if (l === 'high') return sem('green', 'Lineage: high confidence');
    if (l === 'medium') return sem('blue', 'Lineage: medium confidence');
    return sem('amber', 'Lineage: not recoverable');
  }
  function validityBadge(sid, v) {
    const s = sec(sid);
    if (s.lineage === 'none') return sem('amber', 'In force · history unverified');
    if (v.to) return sem('blue', 'Earlier version · replaced ' + fmtShort(addDays(v.to, 1)));
    return sem('green', 'In force · current version');
  }

  /* ------------------------------------------------------------------
     Phases and gating
  ------------------------------------------------------------------ */
  const PH = {
    1: { name: 'Phase 1', tag: 'Funded', title: 'Statutory foundation', release: 'v1.0', strip: 'Funded by this grant. Built and released within the six-month pilot.' },
    2: { name: 'Phase 2', tag: 'Planned', title: 'Case law and precedent', release: 'v1.5', strip: 'Planned for release v1.5. Not funded by this grant. Content is illustrative.' },
    3: { name: 'Phase 3', tag: 'Planned', title: 'Professional workspace', release: 'v2.0', strip: 'Planned for release v2.0. Not funded by this grant. Shown to explain where the work leads.' },
    4: { name: 'Phase 4', tag: 'Mockup', title: 'Institutional and judicial', release: 'v4.0', strip: 'Static mockup of release v4.0. Not funded by this grant. Not interactive.' }
  };
  const badge = (p, sm) => `<span class="pbadge p${p}${sm ? ' sm' : ''}">Phase ${p}${sm ? '' : ' · ' + PH[p].tag}</span>`;

  function gatePage(p, inner) {
    return `<div class="gated gated-page" data-phase="${p}">
      <div class="gate-note gate-note-page" role="note">
        ${badge(p)}
        <div class="gate-note-text"><strong>Planned, not in this phase.</strong> ${PH[p].title} is scheduled for release ${PH[p].release}. It is not funded by this grant.</div>
        <a class="btn" href="#/research">Go to Research <span class="muted-inline">(Phase 1)</span></a>
      </div>
      <div class="gate-body">${inner}</div>
    </div>`;
  }
  const gateInline = (p, inner) => `<span class="gated gated-inline" data-phase="${p}"><span class="gate-body">${inner}</span><span class="gate-note">Planned, not in this phase</span></span>`;
  const gateBlock = (p, inner) => `<div class="gated gated-block" data-phase="${p}"><div class="gate-note">Planned, not in this phase</div><div class="gate-body">${inner}</div></div>`;

  function applyGates() {
    $$('.gated').forEach((el) => {
      const off = state.p1Only && el.dataset.phase !== '1';
      el.classList.toggle('is-gated', off);
      const body = el.querySelector(':scope > .gate-body');
      if (body) body.inert = off;
    });
  }

  function page(o) {
    return gatePage(o.phase, `<div class="view v-p${o.phase}">
      <div class="phase-strip ps-${o.phase}">${badge(o.phase)}<span><strong>${PH[o.phase].title}.</strong> ${PH[o.phase].strip}</span></div>
      <header class="view-head">
        <h1 tabindex="-1">${o.title}${o.bn ? ` <span class="h1-bn" lang="bn">${o.bn}</span>` : ''}</h1>
        ${o.lead ? `<p class="lead">${o.lead}</p>` : ''}
      </header>
      <div class="vbody">${o.body}</div>
    </div>`);
  }

  /* ------------------------------------------------------------------
     State
  ------------------------------------------------------------------ */
  const state = {
    role: 'advocate',
    p1Only: false,
    research: { q: '', date: TODAY, lang: 'bn', result: null, history: [], running: false, autoRun: false, saved: false },
    code: { sid: 's5', date: TODAY, vIdx: 1, mode: 'text', lang: 'en' },
    prec: { q: 'Landlord kept part of the deposit for repainting and gave no written statement' },
    matterTab: 'overview',
    draft: { tpl: 'notice', date: TODAY, paras: null },
    cal: { y: parse(TODAY).getFullYear(), m: parse(TODAY).getMonth() },
    lim: { type: 'rc', date: '2025-11-20', result: null },
    docs: { status: null, file: null },
    triage: {},
    cz: { q: '', date: TODAY, result: null }
  };

  /* ------------------------------------------------------------------
     Modules and roles
  ------------------------------------------------------------------ */
  const MODULES = {
    research: { href: '#/research', label: 'Research', bn: 'আইনি গবেষণা', phase: 1 },
    code: { href: '#/code', label: 'Provision browser', bn: 'ধারা ব্রাউজার', phase: 1 },
    public: { href: '#/public', label: 'Public Bangla search', bn: 'নাগরিক সেবা', phase: 1 },
    precedent: { href: '#/precedent', label: 'Precedent search', bn: 'নজির অনুসন্ধান', phase: 2 },
    triage: { href: '#/triage', label: 'Grievance triage', bn: 'অভিযোগ বাছাই', phase: 2 },
    dashboard: { href: '#/', label: 'Dashboard', bn: 'ড্যাশবোর্ড', phase: 3 },
    matters: { href: '#/matters', label: 'Matters', bn: 'মামলা', phase: 3 },
    draft: { href: '#/draft', label: 'Drafting', bn: 'খসড়া', phase: 3 },
    calendar: { href: '#/calendar', label: 'Calendar and limitation', bn: 'ক্যালেন্ডার ও তামাদি', phase: 3 },
    documents: { href: '#/documents', label: 'Documents', bn: 'নথি', phase: 3 },
    causelist: { href: '#/causelist', label: 'Cause list', bn: 'কার্যতালিকা', phase: 3 },
    bench: { href: '#/bench', label: 'Bench tools', bn: 'বিচারকের সরঞ্জাম', phase: 4 },
    analytics: { href: '#/analytics', label: 'Analytics', bn: 'বিশ্লেষণ', phase: 4 },
    intake: { href: '#/intake', label: 'Case intake', bn: 'মামলা গ্রহণ', phase: 4 }
  };
  const ROLE_NAV = {
    advocate: ['research', 'code', 'public', 'precedent', 'triage', 'dashboard', 'matters', 'draft', 'calendar', 'documents', 'analytics', 'intake'],
    judge: ['research', 'code', 'precedent', 'dashboard', 'causelist', 'bench', 'analytics'],
    officer: ['research', 'code', 'public', 'triage', 'dashboard', 'intake'],
    citizen: ['public']
  };
  const ROLE_NAME = { advocate: 'Advocate', judge: 'Judge', officer: 'Legal officer', citizen: 'Citizen' };

  /* ------------------------------------------------------------------
     Router
  ------------------------------------------------------------------ */
  let lastHash = null;
  let suppressHash = null;
  function parseHash() {
    const h = (location.hash || '#/').replace(/^#/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    return { name: parts[0] || 'dashboard', id: parts[1] || null, query: Object.fromEntries(new URLSearchParams(qs || '')) };
  }
  function go(hash) {
    if (location.hash !== hash) { suppressHash = hash; location.hash = hash; }
    render(true);
  }
  window.addEventListener('hashchange', () => {
    if (suppressHash && location.hash === suppressHash) { suppressHash = null; return; }
    suppressHash = null;
    render(true);
  });

  const VIEWS = {};
  const ENTER = {};
  const AFTER = {};

  function render(fromNav) {
    const r = parseHash();
    const isNew = location.hash !== lastHash;
    lastHash = location.hash;

    if (r.name === 'public') state.role = 'citizen';
    else if (state.role === 'citizen') state.role = 'advocate';
    $('#role-select').value = state.role;
    document.body.classList.toggle('is-citizen', state.role === 'citizen');
    closeNav();

    const allowed = ROLE_NAV[state.role] || [];
    const mod = MODULES[r.name];
    if (isNew && ENTER[r.name]) ENTER[r.name](r);
    let html;
    if (!mod) html = viewNotFound();
    else if (!allowed.includes(r.name)) html = viewNoAccess(r.name);
    else html = VIEWS[r.name](r);

    $('#main').innerHTML = html;
    renderSidebar(mod && allowed.includes(r.name) ? r.name : null);
    if (mod && allowed.includes(r.name) && AFTER[r.name]) AFTER[r.name](r);
    applyGates();
    document.title = (mod ? mod.label + ' · ' : '') + 'Dhara';

    if (fromNav && isNew) {
      window.scrollTo(0, 0);
      if (!tour.active) { const h = $('#main h1'); if (h) h.focus({ preventScroll: true }); }
    }
  }

  /* Re-render the current view, keeping keyboard focus where it was. */
  function rerender() {
    const id = document.activeElement && document.activeElement.id;
    const y = window.scrollY;
    render(false);
    window.scrollTo(0, y);
    if (id) { const el = document.getElementById(id); if (el) el.focus({ preventScroll: true }); }
  }

  /* ------------------------------------------------------------------
     Sidebar and header
  ------------------------------------------------------------------ */
  function renderSidebar(active) {
    const items = ROLE_NAV[state.role] || [];
    const groups = [1, 2, 3, 4].map((p) => ({ p, mods: items.filter((k) => MODULES[k].phase === p) })).filter((g) => g.mods.length);
    $('#sidebar').innerHTML = `
      <nav aria-label="Modules">
        ${groups.map((g) => `
          <div class="nav-group gated" data-phase="${g.p}">
            <div class="gate-note">Planned, not in this phase</div>
            <div class="gate-body">
              <p class="nav-phase">${badge(g.p, true)}<span>${PH[g.p].title}</span></p>
              <ul>
                ${g.mods.map((k) => `<li><a href="${MODULES[k].href}" class="nav-link${k === active ? ' active' : ''}"${k === active ? ' aria-current="page"' : ''}>
                  <span class="nav-en">${MODULES[k].label}</span><span class="nav-bn" lang="bn">${MODULES[k].bn}</span></a></li>`).join('')}
              </ul>
            </div>
          </div>`).join('')}
      </nav>
      <div class="side-foot">
        <p>Signed in as <strong>${ROLE_NAME[state.role]}</strong></p>
        <p class="side-legend"><span class="pbadge p1 sm">Phase 1</span> funded by this grant. Phases 2 to 4 are planned.</p>
      </div>`;
  }

  function setP1(on) {
    state.p1Only = !!on;
    document.body.classList.toggle('p1-only', state.p1Only);
    const t = $('#p1-toggle');
    t.setAttribute('aria-checked', String(state.p1Only));
    applyGates();
    measureHeader();
    announce(state.p1Only ? 'Showing Phase 1 only. Planned features are dimmed.' : 'Showing the complete platform.');
  }

  function setRole(role) {
    state.role = role;
    if (role === 'citizen') go('#/public');
    else go('#/');
  }

  function openNav() { document.body.classList.add('nav-open'); $('#scrim').hidden = false; $('#menu-btn').setAttribute('aria-expanded', 'true'); const a = $('#sidebar a'); if (a) a.focus(); }
  function closeNav() { if (!document.body.classList.contains('nav-open')) return; document.body.classList.remove('nav-open'); $('#scrim').hidden = true; $('#menu-btn').setAttribute('aria-expanded', 'false'); }

  function measureHeader() {
    document.documentElement.style.setProperty('--hdr', $('#app-header').offsetHeight + 'px');
  }

  /* Segmented control (toggle buttons). */
  function seg(name, opts, value, label) {
    return `<div class="seg" role="group" aria-label="${esc(label)}">${opts.map(([v, t, lang]) =>
      `<button type="button" id="seg-${name}-${v}" class="seg-btn${v === value ? ' on' : ''}" data-action="seg" data-name="${name}" data-val="${v}" aria-pressed="${v === value}"${lang ? ` lang="${lang}"` : ''}>${t}</button>`).join('')}</div>`;
  }

  /* ------------------------------------------------------------------
     Research engine (stands in for temporal hybrid retrieval)
  ------------------------------------------------------------------ */
  function kwMatch(text, words) {
    return words.some((w) => {
      if (/^[a-z]/.test(w)) {
        const prefix = w.endsWith('*');
        const core = w.replace('*', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('\\b' + core + (prefix ? '' : '\\b'), 'i').test(text);
      }
      return text.includes(w);
    });
  }
  function classify(q) {
    const t = q.toLowerCase();
    for (const k of ['predict', 'penalty', 'forum', 'deposit']) if (kwMatch(t, D.keywords[k])) return k;
    return 'none';
  }

  let resSeq = 0;
  function computeAnswer(q, date, lang) {
    const kind = classify(q);
    const all = Object.keys(D.sections);
    const inForce = all.filter((sid) => versionOn(sid, date));
    const totalVersions = all.reduce((n, sid) => n + sec(sid).versions.length, 0);
    const base = { id: ++resSeq, q, date, lang, kind, inForce: inForce.length, setAside: totalVersions - inForce.length, retrieved: [], cites: [], sources: [], sentences: [], historical: [], lowconf: [] };
    if (kind === 'predict') return Object.assign(base, { state: 'predict' });
    if (date < D.act.commenced) return Object.assign(base, { state: 'refusal', reason: 'notInForce' });
    if (kind === 'none') return Object.assign(base, { state: 'refusal', reason: 'noBasis' });

    const topic = D.topics[kind];
    const retrieved = topic.retrieve.filter((sid) => versionOn(sid, date));
    const facts = {}; const used = {};
    retrieved.forEach((sid) => { used[sid] = versionOn(sid, date); facts[sid] = used[sid].facts || {}; });
    const cites = []; const idx = new Map();
    const sentences = topic.sentences.map((st) => {
      const nums = st.cites.map((key) => {
        if (!idx.has(key)) { const [sid, span] = key.split(':'); cites.push({ n: cites.length + 1, key, sid, span }); idx.set(key, cites.length); }
        return idx.get(key);
      });
      return { text: st[lang](facts), nums };
    });
    const citedSids = [...new Set(cites.map((c) => c.sid))];
    const sources = citedSids.map((sid) => ({ sid, v: used[sid], nums: cites.filter((c) => c.sid === sid).map((c) => c.n) }));
    const historical = sources.filter((x) => x.v.to).map((x) => ({ sid: x.sid, next: sec(x.sid).versions[sec(x.sid).versions.indexOf(x.v) + 1] }));
    const lowconf = sources.filter((x) => sec(x.sid).lineage === 'none');
    const st = lowconf.length ? 'lowconf' : historical.length ? 'historical' : 'normal';
    return Object.assign(base, {
      state: st, retrieved, cites, sources, sentences, historical, lowconf,
      key: topic['key_' + lang](facts), keyEn: topic.key_en(facts)
    });
  }

  const OUTCOME = {
    normal: { sem: 'green', en: 'Current law', dot: 'Current law' },
    historical: { sem: 'blue', en: 'Earlier version', dot: 'Earlier version' },
    lowconf: { sem: 'amber', en: 'History unverified', dot: 'History unverified' },
    refusal: { sem: 'red', en: 'Refused: no legal basis', dot: 'Refused' },
    predict: { sem: 'grey', en: 'Out of scope', dot: 'Out of scope' }
  };
  const outcomeBadge = (o) => sem(OUTCOME[o].sem, OUTCOME[o].en);

  const LL = {
    en: {
      question: 'Your question',
      applies: (d) => `Law applied: as it stood on <strong>${fmt(d)}</strong>`,
      state: { normal: 'Answered from the current law', historical: 'Answered from an earlier version of the law', lowconf: 'Answered, but amendment history is unverified', refusal: 'No answer: not enough legal basis', predict: 'Out of scope: not a legal research question' },
      verified: (n, r) => `All ${n} citations checked against ${r} retrieved sections`,
      grounded: 'This answer is grounded only in these sections',
      versionUsed: 'Version used',
      timelines: 'Version timeline: which text applied on your date',
      hist: 'This section was amended after your selected date. The current law is different.',
      low: 'Amendment history for this section could not be verified. Current text was used.',
      lowDetail: (sids) => `${sids.map((s) => 'Section ' + sec(s).num).join(', ')} was substituted at some point, but the date and the earlier wording could not be recovered. If your dispute is old, check the official Code.`,
      disclaimer: 'Research aid, not legal advice. Confirm against the official text before relying on it.'
    },
    bn: {
      question: 'আপনার প্রশ্ন',
      applies: (d) => `প্রযোজ্য আইন: <strong>${fmt(d, 'bn')}</strong> তারিখে বলবৎ আইন`,
      state: { normal: 'বর্তমান আইন থেকে উত্তর', historical: 'আইনের পূর্ববর্তী সংস্করণ থেকে উত্তর', lowconf: 'উত্তর দেওয়া হয়েছে, তবে সংশোধনের ইতিহাস যাচাই হয়নি', refusal: 'উত্তর নেই: যথেষ্ট আইনি ভিত্তি পাওয়া যায়নি', predict: 'পরিধির বাইরে: এটি আইনি গবেষণার প্রশ্ন নয়' },
      verified: (n, r) => `উদ্ধৃত ${bnNum(n)}টি উৎসই উদ্ধারকৃত ${bnNum(r)}টি ধারার সঙ্গে মিলিয়ে যাচাই করা হয়েছে`,
      grounded: 'এই উত্তর কেবল নিচের ধারাগুলোর ওপর ভিত্তি করে',
      versionUsed: 'ব্যবহৃত সংস্করণ',
      timelines: 'সংস্করণের সময়রেখা: আপনার তারিখে কোন পাঠ প্রযোজ্য',
      hist: 'আপনার নির্বাচিত তারিখের পরে এই ধারা সংশোধিত হয়েছে। বর্তমান আইন ভিন্ন।',
      low: 'এই ধারার সংশোধনের ইতিহাস যাচাই করা যায়নি। বর্তমান পাঠ ব্যবহার করা হয়েছে।',
      lowDetail: (sids) => `${sids.map((s) => 'ধারা ' + sec(s).numBn).join(', ')} কোনো এক সময়ে প্রতিস্থাপিত হয়েছিল, কিন্তু সেই তারিখ ও পূর্বের পাঠ উদ্ধার করা যায়নি। বিরোধটি পুরনো হলে সরকারি কোড মিলিয়ে নিন।`,
      disclaimer: 'এটি গবেষণা সহায়তা, আইনি পরামর্শ নয়। নির্ভর করার আগে সরকারি পাঠ মিলিয়ে নিন।'
    }
  };

  /* Version timeline: 2006 to 2026, one coloured segment per version, marker at the chosen date. */
  const TL_START = Date.UTC(2006, 0, 1), TL_END = Date.UTC(2027, 0, 1);
  const pct = (s) => { const [y, m, d] = s.split('-').map(Number); return Math.max(0, Math.min(100, ((Date.UTC(y, m - 1, d) - TL_START) / (TL_END - TL_START)) * 100)); };
  function timelineHTML(sid, date, usedVid, opts = {}) {
    const s = sec(sid);
    const segs = s.versions.map((v) => {
      const from = v.from || D.act.commenced;
      const to = v.to ? addDays(v.to, 1) : '2027-01-01';
      const cls = s.lineage === 'none' ? 'seg-unknown' : v.to ? 'seg-old' : 'seg-current';
      return { from, to, cls, v, label: v.short_en, range: rangeText(v) };
    });
    if (s.repealed) segs.push({ from: s.repealed, to: '2027-01-01', cls: 'seg-repealed', label: 'Repealed', range: 'from ' + fmt(s.repealed) });
    const aria = `${secLabel(sid)} versions: ` + segs.map((g) => `${g.label}, ${g.range}`).join('; ') + `. Selected date ${fmt(date)}.`;
    const mp = pct(date);
    return `<div class="tl" role="img" aria-label="${esc(aria)}">
      <div class="tl-head"><strong>${secLabel(sid)}</strong> <span class="muted">${secTitle(sid)}</span></div>
      <div class="tl-track">
        ${segs.map((g) => {
          const l = pct(g.from), w = pct(g.to) - l;
          const used = g.v && g.v.vid === usedVid;
          return `<div class="tl-seg ${g.cls}${used ? ' is-used' : ''}" style="left:${l}%;width:${w}%" title="${esc(g.label + ': ' + g.range)}"><span>${esc(g.label)}${used && !opts.noUsed ? ' · used' : ''}</span></div>`;
        }).join('')}
        <div class="tl-marker${mp > 78 ? ' flip' : ''}" style="left:${mp}%"><span class="tl-marker-label">${fmtShort(date)}</span></div>
      </div>
      <div class="tl-axis" aria-hidden="true">${[2006, 2010, 2014, 2018, 2022, 2026].map((y) => `<span style="left:${pct(y + '-01-01')}%">${y}</span>`).join('')}</div>
    </div>`;
  }
  const tlLegend = () => `<p class="tl-legend"><span class="lg lg-current"></span>Current version <span class="lg lg-old"></span>Earlier version <span class="lg lg-unknown"></span>History not verified <span class="lg lg-repealed"></span>Repealed <span class="lg lg-marker"></span>Your selected date</p>`;

  /* ------------------------------------------------------------------
     View: Research (Phase 1, deepest)
  ------------------------------------------------------------------ */
  VIEWS.research = function () {
    const s = state.research;
    const chips = D.examples.map((ex, i) => `<button type="button" class="ex-chip" data-action="example" data-i="${i}" aria-label="Example: ${esc(ex.q)}. Law as of ${fmt(resolveDate(ex.date))}. Expected outcome: ${OUTCOME[ex.kind].dot}.">
      <span class="dot d-${ex.kind}" aria-hidden="true"></span>
      <span class="ex-text"><span class="ex-q"${/[a-z]/i.test(ex.q) ? '' : ' lang="bn"'}>${esc(ex.q)}</span><span class="ex-meta">${esc(ex.label)}</span></span>
    </button>`).join('');

    return page({
      phase: 1, title: 'Research', bn: 'আইনি গবেষণা',
      lead: 'Ask in Bangla or English. Dhara answers only from the law in force on the date you choose, and cites every sentence.',
      body: `
      <section class="card q-card" data-tour="qbox" aria-label="Ask a question">
        <label for="q" class="field-label">Your question <span lang="bn" class="muted">· আপনার প্রশ্ন</span></label>
        <textarea id="q" rows="3" lang="bn" placeholder="যেমন: জামানত ফেরত দেওয়ার সময়সীমা কত দিন?" data-input="rq">${esc(s.q)}</textarea>
        <p class="field-error" id="q-error" hidden>Please type a question first.</p>
        <div class="q-row">
          <div class="field asof-field" data-tour="asof">
            <label for="asof" class="field-label">Show the law as it stood on</label>
            <div class="date-row">
              <input type="date" id="asof" value="${s.date}" min="2000-01-01" max="2030-12-31" data-change="rdate" aria-describedby="asof-hint">
              <button type="button" class="btn ghost sm" id="asof-today" data-action="rtoday">Today</button>
            </div>
            <p class="hint" id="asof-hint">Today unless you change it. For a dispute, choose the date it arose.</p>
          </div>
          <div class="field">
            <span class="field-label" id="rlang-label">Answer in</span>
            ${seg('rlang', [['bn', 'বাংলা', 'bn'], ['en', 'English']], s.lang, 'Answer language')}
          </div>
          <div class="field field-submit">
            <button type="button" class="btn primary big" id="ask-btn" data-action="ask">Search the law <span lang="bn">· খুঁজুন</span></button>
          </div>
        </div>
      </section>

      <section class="examples" data-tour="chips" aria-labelledby="ex-h">
        <h2 id="ex-h" class="h-small">Try an example: each loads a question and a date</h2>
        <div class="chips">${chips}</div>
        <p class="dot-legend" aria-hidden="true">
          <span><span class="dot d-normal"></span>Current law</span>
          <span><span class="dot d-historical"></span>Earlier version</span>
          <span><span class="dot d-lowconf"></span>History unverified</span>
          <span><span class="dot d-refusal"></span>Refused</span>
          <span><span class="dot d-predict"></span>Out of scope</span>
        </p>
      </section>

      <div id="pipeline" class="pipeline-wrap" aria-live="polite">${s.result ? pipelineHTML(s.result, 3) : ''}</div>
      <div id="result">${s.result ? resultHTML(s.result) : emptyResult()}</div>
      <div id="history">${historyHTML()}</div>`
    });
  };
  AFTER.research = function () {
    if (state.research.autoRun) { state.research.autoRun = false; ask(); }
  };

  const emptyResult = () => `<div class="empty card"><p class="empty-title">Your cited answer will appear here.</p><p class="muted">Pick an example above, or type a question and press <em>Search the law</em>. Try the first two examples one after the other: same question, two dates, two different answers.</p></div>`;

  function pipelineSteps(r) {
    const n = r.retrieved.length, c = r.cites.length;
    return [
      { title: `Filtering to sections in force on ${fmt(r.date)}`,
        detail: r.date < D.act.commenced ? 'The Act was not yet in force on this date. Nothing passes the filter.' : `${r.inForce} sections in force. ${r.setAside} other versions set aside before any ranking.` },
      { title: 'Searching by word and meaning, in Bangla and English',
        detail: r.state === 'predict' ? 'The question asks for a prediction. Outside Dhara’s scope.' : n ? `${n} relevant section${n > 1 ? 's' : ''} found.` : 'No section passed the relevance threshold.' },
      { title: 'Verifying each citation',
        detail: c ? `${c} of ${c} citations found in the retrieved sections, word for word.` : 'Nothing can be cited, so no answer is given.' }
    ];
  }
  function pipelineHTML(r, stage) {
    return `<ol class="pipeline" aria-label="Retrieval steps">${pipelineSteps(r).map((st, i) => {
      const cls = i < stage ? 'done' : i === stage ? 'active' : 'wait';
      return `<li class="pstep is-${cls}">
        <span class="pstep-icon" aria-hidden="true">${i < stage ? ICON.check : '<span class="pstep-num">' + (i + 1) + '</span>'}</span>
        <span class="pstep-text"><span class="pstep-title">${st.title}</span>${i < stage ? `<span class="pstep-detail">${st.detail}</span>` : ''}</span>
        <span class="sr-only">${cls === 'done' ? 'Done.' : cls === 'active' ? 'In progress.' : 'Waiting.'}</span>
      </li>`;
    }).join('')}</ol>`;
  }

  function resultHTML(r) {
    const L = LL[r.lang];
    const head = `<p class="ans-state">${sem(OUTCOME[r.state].sem, L.state[r.state])}</p>
      <p class="kicker">${L.question}</p>
      <blockquote class="q-restated"${/[a-z]/i.test(r.q) ? '' : ' lang="bn"'}>${esc(r.q)}</blockquote>
      <p class="applies">${ICON.cal}<span>${L.applies(r.date)}</span></p>`;

    if (r.state === 'predict') return predictHTML(r, head);
    if (r.state === 'refusal') return refusalHTML(r, head);

    const notices = [];
    if (r.historical.length) {
      notices.push(`<div class="notice n-blue" role="note">${ICON.clock}<div><strong>${L.hist}</strong>${r.historical.map((h) => `<p>${h.next['changeSummary_' + r.lang]}</p>`).join('')}</div></div>`);
    }
    if (r.lowconf.length) {
      notices.push(`<div class="notice n-amber" role="note">${ICON.warn}<div><strong>${L.low}</strong><p>${L.lowDetail(r.lowconf.map((x) => x.sid))}</p></div></div>`);
    }
    const alt = r.date === TODAY ? '2023-08-14' : TODAY;
    const sentences = r.sentences.map((s) => `<span class="sent">${esc(s.text)}${s.nums.map((n) => {
      const c = r.cites[n - 1];
      return `<button type="button" class="cite-chip" id="cite-${n}" data-action="cite" data-key="${c.key}" aria-label="Citation ${n}: ${secLabel(c.sid)}. Show the supporting words.">${n}</button>`;
    }).join('')}</span>`).join(' ');

    return `<div class="result-grid">
      <section class="card answer ans-${r.state}" data-tour="answer" aria-label="Answer">
        <div data-tour="answer-core">
        ${head}
        ${notices.join('')}
        <div class="answer-text"${r.lang === 'bn' ? ' lang="bn"' : ''}>${sentences}</div>
        <p class="verify">${ICON.check}<span>${L.verified(r.cites.length, r.retrieved.length)}</span></p>
        </div>

        <div class="grounded">
          <h3>${L.grounded}</h3>
          <ul>${r.sources.map((x) => `<li>
            <span class="cite-nums">${x.nums.map((n) => `<span class="cite-ref">${n}</span>`).join('')}</span>
            <span><a href="#src-${x.sid}" data-action="goto-src" data-sid="${x.sid}"><strong>${secLabel(x.sid, r.lang)}</strong> · ${secTitle(x.sid, r.lang)}</a>
            <span class="vrange">${L.versionUsed}: ${rangeText(x.v, r.lang)} · <code>${x.v.vid}</code></span></span>
          </li>`).join('')}</ul>
        </div>

        <div class="timelines" data-tour="timeline">
          <h3>${L.timelines}</h3>
          ${r.sources.map((x) => timelineHTML(x.sid, r.date, x.v.vid)).join('')}
          ${tlLegend()}
        </div>

        <div class="answer-actions">
          <button type="button" class="btn" id="compare-btn" data-action="compare" data-date="${alt}">${ICON.cal} Ask the same question for ${fmt(alt)}</button>
          ${gateInline(3, `<button type="button" class="btn ghost" id="save-btn" data-action="save-matter">${state.research.saved ? 'Saved to Rahman v. Shapla' : 'Save to a matter'} ${badge(3, true)}</button>`)}
          ${gateInline(2, `<a class="btn ghost" href="#/precedent">Find judgments on these sections ${badge(2, true)}</a>`)}
        </div>
        <p class="disclaimer"${r.lang === 'bn' ? ' lang="bn"' : ''}>${L.disclaimer}</p>
      </section>

      <aside class="sources" aria-label="Source sections" data-tour="sources">
        <h2 class="h-small">Sources <span class="muted">· click a numbered chip to see the exact words</span></h2>
        ${r.sources.map((x) => sourceCard(x, r)).join('')}
      </aside>
    </div>`;
  }

  function sourceCard(x, r) {
    const s = sec(x.sid), v = x.v;
    return `<article class="card src-card" id="src-${x.sid}" tabindex="-1" aria-label="${secLabel(x.sid)}, ${secTitle(x.sid)}">
      <header>
        <h3><span class="sec-no">${secLabel(x.sid, r.lang)}</span> <span${r.lang === 'bn' ? ' lang="bn"' : ''}>${secTitle(x.sid, r.lang)}</span></h3>
        <p class="src-act">${r.lang === 'bn' ? D.act.title_bn : D.act.title_en}</p>
        <div class="badges">${validityBadge(x.sid, v)}${lineageBadge(s.lineage)}</div>
      </header>
      <div class="legal-text"${r.lang === 'bn' ? ' lang="bn"' : ''}>${markup(v[r.lang], x.sid)}</div>
      <details class="prov">
        <summary>Where this came from</summary>
        <dl>
          <dt>Official source</dt><dd><code>${D.sourceBase}${x.sid}</code> <span class="muted">(demo address)</span></dd>
          <dt>Version used</dt><dd>${v.label}: ${rangeText(v)}</dd>
          <dt>Date taken from</dt><dd>${v.footnote ? `<blockquote class="footnote">${esc(v.footnote)}</blockquote>` : '<span class="muted">Original text; no amendment footnote.</span>'}<p class="muted small">${esc(v.dateBasis)}</p></dd>
          <dt>Stable identifier</dt><dd><code>${v.vid}</code></dd>
        </dl>
      </details>
      <a class="link-arrow" href="#/code/${x.sid}?d=${r.date}">Open in provision browser ${ICON.arrow}</a>
    </article>`;
  }

  function predictHTML(r, head) {
    const bn = r.lang === 'bn';
    const suggest = bn ? 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?' : 'How many days does a landlord have to return a security deposit?';
    return `<div class="result-grid single">
      <section class="card answer ans-predict" data-tour="answer" aria-label="Answer">
        ${head}
        <div class="panel p-neutral" role="note">
          <h3>${ICON.info} ${bn ? 'ধারা একটি গবেষণা সহায়ক, ভবিষ্যদ্বক্তা নয়।' : 'Dhara is a research assistant, not a predictor.'}</h3>
          <p${bn ? ' lang="bn"' : ''}>${bn ? 'কে মামলায় জিতবে বা বিচারক কী সিদ্ধান্ত দেবেন, ধারা তা অনুমান করে না। নির্দিষ্ট তারিখে আইন কী বলত, তা নির্দিষ্ট ধারাসহ দেখাতে পারে।' : 'It does not forecast who will win a case or what a judge will decide. It can show you what the law said on a given date, with the exact section.'}</p>
          <p class="muted">${bn ? 'এর বদলে একটি আইনি প্রশ্ন করে দেখুন:' : 'Try a legal question instead:'}</p>
          <button type="button" class="btn" data-action="suggest" data-q="${esc(suggest)}"${bn ? ' lang="bn"' : ''}>${esc(suggest)}</button>
        </div>
      </section>
    </div>`;
  }

  function refusalHTML(r, head) {
    const bn = r.lang === 'bn';
    const why = r.reason === 'notInForce'
      ? (bn ? `${fmt(r.date, 'bn')} তারিখে এই আইন বলবৎ ছিল না (আইনটি ${fmt(D.act.commenced, 'bn')} থেকে কার্যকর)।` : `The Act was not in force on ${fmt(r.date)}. It came into force on ${fmt(D.act.commenced)}.`)
      : (bn ? `${fmt(r.date, 'bn')} তারিখে বলবৎ ${bnNum(r.inForce)}টি ধারা খোঁজা হয়েছে। কোনোটিই এই প্রশ্নের উত্তর দেওয়ার মতো যথেষ্ট প্রাসঙ্গিক নয়, তাই কোনো উত্তর দেওয়া হলো না।` : `Dhara searched the ${r.inForce} sections in force on ${fmt(r.date)}. None of them addresses this question closely enough to cite, so no answer is given.`);
    return `<div class="result-grid single">
      <section class="card answer ans-refusal" data-tour="answer" aria-label="Answer">
        ${head}
        <div class="panel p-red" role="alert">
          <h3>${ICON.stop} ${bn ? 'যথেষ্ট আইনি ভিত্তি পাওয়া যায়নি।' : 'Not enough legal basis found.'}</h3>
          <p${bn ? ' lang="bn"' : ''}>${why}</p>
          <p${bn ? ' lang="bn"' : ''}><strong>${bn ? 'ধারা কখনো কোনো ধারা নম্বর বানিয়ে বলে না।' : 'Dhara never invents a section number.'}</strong> ${bn ? 'প্রশ্নটি অন্যভাবে লিখুন, অথবা ধারা ব্রাউজারে আইনটি দেখুন।' : 'Rephrase the question, or browse the Act in the provision browser.'}</p>
          <a class="btn" href="#/code">Open the provision browser</a>
        </div>
      </section>
    </div>`;
  }

  function historyHTML() {
    const h = state.research.history;
    if (!h.length) return '';
    return `<section class="card history" data-tour="history" aria-labelledby="hist-h">
      <h2 id="hist-h" class="h-small">Questions asked in this session <span class="muted">· same question, different dates, different answers</span></h2>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th scope="col">Question</th><th scope="col">Law as of</th><th scope="col">Outcome</th><th scope="col">Answer</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${h.map((e, i) => `<tr>
          <td${/[a-z]/i.test(e.q) ? '' : ' lang="bn"'}>${esc(e.q)}</td>
          <td class="nowrap">${fmt(e.date)}</td>
          <td>${outcomeBadge(e.state)}</td>
          <td><strong>${esc(e.key || '—')}</strong></td>
          <td><button type="button" class="btn ghost sm" id="hist-${i}" data-action="hist-rerun" data-i="${i}">Ask again</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>`;
  }

  let runToken = 0;
  async function ask() {
    const s = state.research;
    const q = s.q.trim();
    const err = $('#q-error');
    if (!q) { if (err) err.hidden = false; const t = $('#q'); if (t) t.focus(); return null; }
    if (err) err.hidden = true;
    const token = ++runToken;
    const r = computeAnswer(q, s.date, s.lang);
    s.saved = false;
    const pipe = $('#pipeline'), out = $('#result');
    if (!pipe || !out) return null;
    out.innerHTML = '';
    const stepMs = 500;
    for (let stage = 0; stage < 3; stage++) {
      pipe.innerHTML = pipelineHTML(r, stage);
      await wait(stepMs);
      if (token !== runToken) return null;
    }
    pipe.innerHTML = pipelineHTML(r, 3);
    s.result = r;
    s.history.unshift({ q: r.q, date: r.date, lang: r.lang, state: r.state, key: r.state === 'refusal' ? 'No answer' : r.state === 'predict' ? 'Not answered' : r.keyEn });
    s.history = s.history.slice(0, 8);
    out.innerHTML = resultHTML(r);
    $('#history').innerHTML = historyHTML();
    applyGates();
    announce('Answer ready. ' + LL.en.state[r.state] + '.');
    return r;
  }

  function highlightCite(key) {
    $$('.cite-span.hl').forEach((e) => e.classList.remove('hl'));
    $$('.cite-chip.active').forEach((e) => { e.classList.remove('active'); e.setAttribute('aria-pressed', 'false'); });
    $$('.src-card.is-focus').forEach((e) => e.classList.remove('is-focus'));
    const span = $(`.src-card .cite-span[data-span="${key}"]`);
    $$(`.cite-chip[data-key="${key}"]`).forEach((c) => { c.classList.add('active'); c.setAttribute('aria-pressed', 'true'); });
    if (!span) return;
    span.classList.add('hl');
    const card = span.closest('.src-card');
    card.classList.add('is-focus');
    const det = card.querySelector('details'); // keep provenance closed so the text stays in view
    if (det) det.open = false;
    const aside = card.closest('.sources');
    const behavior = reduceMotion() ? 'auto' : 'smooth';
    if (aside && getComputedStyle(aside).position === 'sticky' && aside.scrollHeight > aside.clientHeight + 4) {
      const ar = aside.getBoundingClientRect();
      const top = span.getBoundingClientRect().top - ar.top + aside.scrollTop - aside.clientHeight / 3;
      aside.scrollTo({ top, behavior });
      if (ar.top < 0 || ar.bottom > window.innerHeight + 40) aside.scrollIntoView({ block: 'nearest', behavior });
    } else {
      span.scrollIntoView({ block: 'center', behavior });
    }
    const sid = key.split(':')[0];
    announce(`Supporting words highlighted in ${secLabel(sid)}: ${span.textContent}`);
  }

  function runExample(i) {
    const ex = D.examples[i];
    const s = state.research;
    s.q = ex.q; s.date = resolveDate(ex.date);
    if (ex.lang) s.lang = ex.lang; else if (!/[a-z]/i.test(ex.q)) s.lang = 'bn';
    syncResearchInputs();
    return ask();
  }
  function syncResearchInputs() {
    const s = state.research;
    const q = $('#q'), d = $('#asof');
    if (q) q.value = s.q;
    if (d) d.value = s.date;
    $$('[data-name="rlang"]').forEach((b) => { const on = b.dataset.val === s.lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  /* ------------------------------------------------------------------
     View: Provision browser (Phase 1, deep)
  ------------------------------------------------------------------ */
  ENTER.code = function (r) {
    const c = state.code;
    if (r.id && sec(r.id)) c.sid = r.id;
    if (r.query.d) c.date = r.query.d;
    syncCodeVersion();
  };
  function syncCodeVersion() {
    const c = state.code, s = sec(c.sid);
    const i = versionIndexOn(c.sid, c.date);
    c.vIdx = i >= 0 ? i : (c.date < D.act.commenced ? 0 : s.versions.length - 1);
    if (s.lineage === 'none') c.mode = 'text';
  }

  function wordDiff(a, b) {
    const A = a.match(/\S+|\s+/g) || [], B = b.match(/\S+|\s+/g) || [];
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push(esc(A[i])); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { if (A[i].trim()) out.push(`<del><span class="sr-only">removed: </span>${esc(A[i])}</del>`); i++; }
      else { out.push(B[j].trim() ? `<ins><span class="sr-only">added: </span>${esc(B[j])}</ins>` : esc(B[j])); j++; }
    }
    while (i < n) { if (A[i].trim()) out.push(`<del><span class="sr-only">removed: </span>${esc(A[i])}</del>`); i++; }
    while (j < m) { out.push(B[j].trim() ? `<ins><span class="sr-only">added: </span>${esc(B[j])}</ins>` : esc(B[j])); j++; }
    return out.join('');
  }
  function diffHTML(prev, cur) {
    const P = plain(prev).split('\n'), C = plain(cur).split('\n');
    return C.map((c, k) => `<p>${wordDiff(P[k] || '', c)}</p>`).join('');
  }

  VIEWS.code = function () {
    const c = state.code, s = sec(c.sid), v = s.versions[c.vIdx];
    const lang = c.lang;
    const inForceIdx = versionIndexOn(c.sid, c.date);
    const noLineage = s.lineage === 'none';
    const prev = c.vIdx > 0 ? s.versions[c.vIdx - 1] : null;
    const chap = D.chapters.find((ch) => ch.sections.includes(c.sid));

    let dateNote = '';
    if (inForceIdx < 0) {
      if (c.date < D.act.commenced) dateNote = sem('amber', `The Act was not yet in force on ${fmt(c.date)}. Showing the first version.`);
      else if (s.repealed) dateNote = sem('red', `Not in force on ${fmt(c.date)}: repealed with effect from ${fmt(s.repealed)}. Showing the last version before repeal.`);
    } else if (inForceIdx !== c.vIdx) {
      dateNote = sem('grey', `You are viewing ${v.label}. The version in force on ${fmt(c.date)} is ${s.versions[inForceIdx].label}.`);
    } else {
      dateNote = noLineage ? sem('amber', `Current text shown. Whether it was in force on ${fmt(c.date)} cannot be verified.`) : sem(v.to ? 'blue' : 'green', `${v.label} was in force on ${fmt(c.date)}.`);
    }

    const versions = s.versions.map((ver, i) => ({ ver, i })).reverse();
    const relatedJ = D.judgments.filter((j) => j.sections.some((x) => x.replace(/\(.*/, '') === c.sid));
    const relatedM = D.matters.filter((m) => m.provisions.some((p) => p.sid === c.sid));

    let textBody;
    if (c.mode === 'changes' && !noLineage) {
      textBody = prev
        ? `<p class="diff-legend"><span><del>struck through in red</del> removed</span><span><ins>green</ins> added</span><span class="muted">Comparing ${prev.label} with ${v.label}</span></p>
           <div class="legal-text diff"${lang === 'bn' ? ' lang="bn"' : ''}>${diffHTML(prev[lang], v[lang])}</div>`
        : `<div class="notice n-grey" role="note">${ICON.info}<div><strong>This is the first version.</strong><p>There is no earlier text to compare it with. Select a later version to see what changed.</p></div></div>
           <div class="legal-text"${lang === 'bn' ? ' lang="bn"' : ''}>${markup(v[lang], c.sid)}</div>`;
    } else {
      textBody = `<div class="legal-text"${lang === 'bn' ? ' lang="bn"' : ''}>${markup(v[lang], c.sid)}</div>`;
    }

    return page({
      phase: 1, title: 'Provision browser', bn: 'ধারা ব্রাউজার',
      lead: 'Every section, every version, with the dates each was in force and where those dates came from.',
      body: `
      <div class="code-layout">
        <nav class="card toc" aria-label="Sections of the Act">
          <p class="toc-act">${D.act.title_en}</p>
          <p class="toc-act-bn" lang="bn">${D.act.title_bn}</p>
          <p class="muted small">${D.act.number}</p>
          ${D.chapters.map((ch) => `<h3 class="toc-ch">${ch.en}</h3><ul>${ch.sections.map((sid) => {
            const x = sec(sid);
            const tag = x.repealed ? sem('red', 'Repealed') : x.lineage === 'none' ? sem('amber', 'No history') : `<span class="muted small">${x.versions.length} versions</span>`;
            return `<li><a href="#/code/${sid}" class="toc-link${sid === c.sid ? ' active' : ''}"${sid === c.sid ? ' aria-current="page"' : ''}><span><strong>§${x.num}</strong> ${x.title_en}</span>${tag}</a></li>`;
          }).join('')}</ul>`).join('')}
          <p class="muted small toc-note">Other sections of this fictional Act are left out of the demo.</p>
        </nav>

        <div class="code-main">
          <nav aria-label="Breadcrumb" class="crumbs"><ol>
            <li>Bangladesh Code <span class="muted">(demo)</span></li>
            <li>${D.act.short_en}</li>
            <li>${chap.en.split(' · ')[0]}</li>
            <li aria-current="page">Section ${s.num}</li>
          </ol></nav>

          <header class="sec-head">
            <h2 class="sec-title">Section ${s.num} · ${s.title_en}</h2>
            <p class="sec-title-bn" lang="bn">ধারা ${s.numBn} · ${s.title_bn}</p>
            <div class="badges">${lineageBadge(s.lineage)}${s.repealed ? sem('red', 'Repealed ' + fmtShort(s.repealed)) : ''}</div>
          </header>

          <div class="card controls">
            <div class="field">
              <label for="code-date" class="field-label">Show the version in force on</label>
              <div class="date-row"><input type="date" id="code-date" value="${c.date}" min="2000-01-01" max="2030-12-31" data-change="cdate">
              <button type="button" class="btn ghost sm" id="code-today" data-action="ctoday">Today</button></div>
            </div>
            <div class="field">
              <span class="field-label">View</span>
              <div class="seg" role="group" aria-label="Text or changes">
                <button type="button" id="seg-cmode-text" class="seg-btn${c.mode === 'text' ? ' on' : ''}" data-action="seg" data-name="cmode" data-val="text" aria-pressed="${c.mode === 'text'}">Text</button>
                <button type="button" id="seg-cmode-changes" class="seg-btn${c.mode === 'changes' ? ' on' : ''}" data-action="seg" data-name="cmode" data-val="changes" aria-pressed="${c.mode === 'changes'}"${noLineage ? ' disabled aria-disabled="true" aria-describedby="nolineage-warn"' : ''}>Changes</button>
              </div>
            </div>
            <div class="field">
              <span class="field-label">Language</span>
              ${seg('clang', [['bn', 'বাংলা', 'bn'], ['en', 'English']], c.lang, 'Text language')}
            </div>
            <p class="date-note">${dateNote}</p>
          </div>

          ${noLineage ? `<div class="notice n-amber big" role="note" id="nolineage-warn">${ICON.warn}<div>
            <strong>No recoverable history for this section.</strong>
            <p>${esc(s.lineageNote)} The current text is shown and marked as unverified. The Changes view is turned off because there is no earlier version to compare.</p>
            <p class="small">Dhara marks this as “date unknown” rather than guessing a date.</p></div></div>` : ''}

          <section class="card" data-tour="versions" aria-labelledby="vh-h">
            <h3 id="vh-h" class="card-h">Version history</h3>
            <ol class="vlist">${versions.map(({ ver, i }) => `<li><button type="button" id="vbtn-${i}" class="vitem${i === c.vIdx ? ' is-sel' : ''}" data-action="code-ver" data-i="${i}" aria-pressed="${i === c.vIdx}">
              <span class="vitem-top"><strong>${ver.label}</strong>${noLineage ? sem('amber', 'Date unknown') : s.repealed && i === s.versions.length - 1 ? sem('red', 'Repealed') : ver.to ? sem('blue', 'Superseded') : sem('green', 'Current')}</span>
              <span class="vitem-range">${ICON.cal} ${rangeText(ver)}</span>
              <span class="vitem-by">${ver.amendedBy ? 'Amended by ' + esc(ver.amendedBy) : 'Original text as enacted'}</span>
            </button></li>`).join('')}</ol>
            ${timelineHTML(c.sid, c.date, v.vid, { noUsed: true })}
            ${tlLegend()}
          </section>

          <section class="card text-card" data-tour="text" aria-labelledby="txt-h">
            <h3 id="txt-h" class="card-h">${c.mode === 'changes' && prev ? 'What changed in ' + v.label : 'Text of ' + v.label} <span class="muted small">· ${rangeText(v)}</span></h3>
            ${textBody}
          </section>

          <section class="card" aria-labelledby="meta-h">
            <h3 id="meta-h" class="card-h">Record details</h3>
            <div class="table-wrap"><table class="meta">
              <tr><th scope="row">Stable identifier</th><td><code>${v.vid}</code></td></tr>
              <tr><th scope="row">In force from</th><td>${v.from ? fmt(v.from) : '<span class="muted">Date unknown</span>'}</td></tr>
              <tr><th scope="row">In force until</th><td>${v.to ? fmt(v.to) : s.repealed ? fmt(addDays(s.repealed, -1)) + ' (repealed)' : '<span class="muted">Still in force</span>'}</td></tr>
              <tr><th scope="row">Amending Act</th><td>${v.amendedBy ? esc(v.amendedBy) : '<span class="muted">None: original text</span>'}</td></tr>
              <tr><th scope="row">Previous version</th><td>${prev ? `<button type="button" class="linklike" id="prev-ver" data-action="code-ver" data-i="${c.vIdx - 1}"><code>${prev.vid}</code></button>` : noLineage ? '<span class="muted">Not recoverable</span>' : '<span class="muted">None</span>'}</td></tr>
              <tr><th scope="row">Lineage confidence</th><td>${lineageBadge(s.lineage)}<p class="muted small">${esc(s.lineageNote)}</p></td></tr>
              <tr><th scope="row">Footnote the date came from</th><td>${v.footnote ? `<blockquote class="footnote">${esc(v.footnote)}</blockquote>` : s.repealed && c.vIdx === s.versions.length - 1 ? `<blockquote class="footnote">${esc(s.repealFootnote)}</blockquote>` : '<span class="muted">Original text; no amendment footnote.</span>'}<p class="muted small">${esc(v.dateBasis)}</p></td></tr>
              <tr><th scope="row">Official source</th><td><code>${D.sourceBase}${c.sid}</code> <span class="muted small">(demo address)</span></td></tr>
            </table></div>
          </section>

          <div class="related-grid">
            ${gateBlock(2, `<section class="card related"><h3 class="card-h">Judgments interpreting this section ${badge(2, true)}</h3>
              ${relatedJ.length ? `<ul class="plain-list">${relatedJ.map((j) => `<li><a href="#/precedent/${j.id}">${esc(j.name)}</a> <span class="muted small">${j.court}, ${j.year}</span> ${treatBadge(j.treatment)}</li>`).join('')}</ul>` : '<p class="muted">None in the demo.</p>'}
            </section>`)}
            ${gateBlock(3, `<section class="card related"><h3 class="card-h">Your matters citing this section ${badge(3, true)}</h3>
              ${relatedM.length ? `<ul class="plain-list">${relatedM.map((m) => `<li><a href="#/matters/${m.id}">${esc(m.title)}</a> <span class="muted small">${esc(m.stage)}</span></li>`).join('')}</ul>` : '<p class="muted">None.</p>'}
            </section>`)}
          </div>
        </div>
      </div>`
    });
  };

  /* ------------------------------------------------------------------
     View: Dashboard (Phase 3, per role)
  ------------------------------------------------------------------ */
  const matter = (id) => D.matters.find((m) => m.id === id);
  function urgency(n) {
    if (n <= 3) return sem('red', daysLeftText(n));
    if (n <= 10) return sem('amber', daysLeftText(n));
    return sem('grey', daysLeftText(n));
  }
  function stat(n, label) { return `<div class="stat card"><span class="stat-n">${n}</span><span class="stat-l">${label}</span></div>`; }

  function amendAlert(forJudge) {
    return `<section class="card alert-card" data-tour="alert" aria-labelledby="alert-h">
      <p class="alert-kicker">${sem('blue', 'Amendment alert')}</p>
      <h2 id="alert-h" class="card-h">Section 5 was amended after the cause of action in ${forJudge ? 'RC 214/2026 on today’s list' : 'an open matter'}</h2>
      <p>Section 5 (return of security deposit) changed with effect from <strong>1 January 2024</strong>: seven days became five. <a href="${forJudge ? '#/bench' : '#/matters/m1'}">Tahmina Rahman v. Shapla Properties</a> arose on <strong>14 August 2023</strong>, so the earlier seven-day version governs. ${forJudge ? 'The respondent’s written submission cites the current five-day text.' : 'Your draft reply quotes the right period; the opposing notice does not.'}</p>
      <div class="btn-row">
        <a class="btn" href="#/code/s5?d=2023-08-14">Compare both versions</a>
        <button type="button" class="btn ghost" data-action="rerun" data-q="জামানত ফেরত দেওয়ার সময়সীমা কত দিন?" data-date="2023-08-14" data-lang="bn">Ask in Research</button>
      </div>
    </section>`;
  }
  function recentResearch() {
    return `<section class="card" aria-labelledby="rr-h"><h2 id="rr-h" class="card-h">Recent research questions</h2>
      <ul class="rr-list">${D.recentResearch.map((r) => `<li>
        <div><p class="rr-q" lang="bn">${esc(r.q)}</p><p class="muted small">Law as of ${fmt(resolveDate(r.date))} · ${r.when}</p></div>
        <div class="rr-right">${outcomeBadge(r.outcome)}<strong>${esc(r.answer)}</strong>
        <button type="button" class="btn ghost sm" data-action="rerun" data-q="${esc(r.q)}" data-date="${resolveDate(r.date)}" data-lang="bn">Ask again</button></div>
      </li>`).join('')}</ul></section>`;
  }

  VIEWS.dashboard = function () {
    if (state.role === 'judge') return dashJudge();
    if (state.role === 'officer') return dashOfficer();
    const hearings = D.matters.filter((m) => m.hearing && m.hearing.date === TODAY).sort((a, b) => a.hearing.time.localeCompare(b.hearing.time));
    const deadlines = D.deadlines.map((d) => Object.assign({ n: diffDays(TODAY, d.date) }, d)).sort((a, b) => a.n - b.n);
    return page({
      phase: 3, title: 'Good morning', bn: 'শুভ সকাল',
      lead: `${fmt(TODAY)} · Chambers of a practising advocate (demo)`,
      body: `
      <div class="stats">
        ${stat(hearings.length, 'Hearings today')}
        ${stat(deadlines.filter((d) => d.n <= 7).length, 'Deadlines in the next 7 days')}
        ${stat(D.matters.length, 'Active matters')}
        ${stat(12, 'Research questions this week')}
      </div>
      ${amendAlert(false)}
      <div class="grid-2">
        <section class="card" data-tour="hearings" aria-labelledby="hh">
          <h2 id="hh" class="card-h">Today’s hearings</h2>
          <ul class="hearing-list">${hearings.map((m) => `<li>
            <span class="h-time">${m.hearing.time}</span>
            <div><a href="#/matters/${m.id}"><strong>${esc(m.title)}</strong></a>
            <p class="muted small">${esc(m.court)} · ${esc(m.caseNo)}</p><p class="small">${esc(m.hearing.purpose)}</p></div>
          </li>`).join('')}</ul>
        </section>
        <section class="card" aria-labelledby="dh">
          <h2 id="dh" class="card-h">Deadlines approaching</h2>
          <ul class="deadline-list">${deadlines.map((d) => `<li>
            <div><strong>${esc(d.label)}</strong><p class="muted small"><a href="#/matters/${d.matter}">${esc(matter(d.matter).title)}</a> · ${fmt(d.date)}</p></div>
            ${urgency(d.n)}
          </li>`).join('')}</ul>
        </section>
      </div>
      ${recentResearch()}`
    });
  };

  function dashJudge() {
    return page({
      phase: 3, title: 'Today’s bench', bn: 'আজকের এজলাস',
      lead: `${fmt(TODAY)} · Court of the Rent Controller, Dhaka Zone 3 (demo)`,
      body: `
      <div class="stats">${stat(D.causeList.length, 'Cases on today’s list')}${stat(2, 'Orders to sign')}${stat(3, 'Judgments reserved')}${stat(1, 'ADR-eligible on today’s list')}</div>
      ${amendAlert(true)}
      <div class="grid-2">
        <section class="card" data-tour="hearings" aria-labelledby="cl-h"><h2 id="cl-h" class="card-h">Today’s cause list</h2>
          <ul class="hearing-list">${D.causeList.slice(0, 4).map((c) => `<li><span class="h-time">#${c.no}</span><div><strong>${esc(c.parties)}</strong><p class="muted small">${c.caseNo} · ${esc(c.stage)}</p>${c.flag ? `<p>${sem(c.flagKind, esc(c.flag))}</p>` : ''}</div></li>`).join('')}</ul>
          <a class="link-arrow" href="#/causelist">Full cause list ${ICON.arrow}</a>
        </section>
        <section class="card" aria-labelledby="bt-h"><h2 id="bt-h" class="card-h">Bench tools ${badge(4, true)}</h2>
          <p>Bundle summary, issues for determination and authorities with treatment flags for RC 214/2026.</p>
          <a class="link-arrow" href="#/bench">Open bench tools ${ICON.arrow}</a>
        </section>
      </div>
      ${recentResearch()}`
    });
  }
  function dashOfficer() {
    return page({
      phase: 3, title: 'Legal aid desk', bn: 'আইনগত সহায়তা ডেস্ক',
      lead: `${fmt(TODAY)} · District legal aid office (demo)`,
      body: `
      <div class="stats">${stat(D.grievances.length, 'New grievances to triage')}${stat(3, 'Intake appointments today')}${stat(1, 'Limitation alerts')}${stat(2, 'Referred to mediation this week')}</div>
      <div class="grid-2">
        <section class="card" data-tour="hearings" aria-labelledby="gq-h"><h2 id="gq-h" class="card-h">Grievance queue</h2>
          <ul class="hearing-list">${D.grievances.map((g) => `<li><span class="h-time">${g.id}</span><div><p lang="bn">${esc(g.text)}</p><p>${sem(g.limitKind, esc(g.limitation))}</p></div></li>`).join('')}</ul>
          <a class="link-arrow" href="#/triage">Open triage ${ICON.arrow}</a>
        </section>
        <section class="card alert-card" data-tour="alert" aria-labelledby="la-h"><p class="alert-kicker">${sem('amber', 'Limitation alert')}</p>
          <h2 id="la-h" class="card-h">G-1046: twelve days left to apply</h2>
          <p>Section 12(2) allows one year from the cause of action. The applicant’s deposit became returnable almost a year ago. Section 12’s amendment history is unverified, so confirm the period against the official Code.</p>
          <a class="btn" href="#/code/s12">Open section 12</a>
        </section>
      </div>
      ${recentResearch()}`
    });
  }

  /* ------------------------------------------------------------------
     View: Precedent search (Phase 2)
  ------------------------------------------------------------------ */
  function treatBadge(t) {
    if (t === 'Followed') return sem('green', 'Followed');
    if (t === 'Distinguished') return sem('amber', 'Distinguished');
    return sem('red', 'Overruled');
  }
  ENTER.precedent = function () { /* keep query */ };
  VIEWS.precedent = function (r) {
    if (r.id) return judgmentView(D.judgments.find((j) => j.id === r.id) || D.judgments[0]);
    const res = D.judgments.slice().sort((a, b) => b.score - a.score);
    return page({
      phase: 2, title: 'Precedent search', bn: 'নজির অনুসন্ধান',
      lead: 'Describe the facts. Dhara finds judgments that interpreted the same sections, and shows whether each is still good law.',
      body: `
      <section class="card q-card">
        <label for="prec-q" class="field-label">Facts of your matter</label>
        <div class="search-row"><input type="search" id="prec-q" value="${esc(state.prec.q)}" data-input="pq">
        <button type="button" class="btn primary" data-action="prec-search">Search judgments</button></div>
        <p class="hint">Searches ${D.judgments.length} fictional judgments linked to the demo Act.</p>
      </section>
      <section aria-labelledby="pr-h" data-tour="prec-results">
        <h2 id="pr-h" class="h-small">${res.length} judgments, closest first</h2>
        <ul class="result-list">${res.map((j) => `<li class="card prec-item">
          <div class="prec-main">
            <a href="#/precedent/${j.id}" class="prec-name">${esc(j.name)}</a>
            <p class="muted small">${j.court} · ${j.year} · ${j.cite}</p>
            <p><strong>Held:</strong> ${esc(j.held)}</p>
            <p class="small">Interprets: ${j.sections.map((x) => `<a href="#/code/${x.replace(/\(.*/, '')}" class="chip-link">Section ${x.replace(/^s/, '')}</a>`).join(' ')}</p>
          </div>
          <div class="prec-side">${treatBadge(j.treatment)}<span class="muted small">Match ${Math.round(j.score * 100)}%</span></div>
        </li>`).join('')}</ul>
      </section>`
    });
  };

  function citeGraph(j) {
    const W = 680, H = 300;
    const secs = j.sections.map((x) => x.replace(/\(.*/, '')).filter((v, i, a) => a.indexOf(v) === i);
    const nodes = [{ id: 'self', x: 340, y: 150, label: j.name.split(' v. ')[0] + ' v. …', sub: j.year + ' (this case)', kind: 'self' }];
    const edges = [];
    secs.forEach((sid, i) => { const y = 150 + (i - (secs.length - 1) / 2) * 90; nodes.push({ id: sid, x: 90, y, label: 'Section ' + sec(sid).num, sub: sec(sid).title_en.split(' ').slice(0, 3).join(' '), kind: 'stat' }); edges.push({ from: 'self', to: sid, label: 'interprets', kind: 'grey' }); });
    j.cites.forEach((c, i) => { const t = D.judgments.find((x) => x.id === c.id); const y = 150 + (i - (j.cites.length - 1) / 2) * 100; nodes.push({ id: c.id, x: 590, y, label: t.name.split(' v. ')[0] + ' v. …', sub: String(t.year), kind: 'case' }); edges.push({ from: 'self', to: c.id, label: c.rel.toLowerCase(), kind: c.rel === 'Overrules' ? 'red' : 'green' }); });
    j.citedBy.forEach((c, i) => { nodes.push({ id: 'cb' + i, x: 340 + i * 160, y: 268, label: c.name.split(' v. ')[0] + ' v. …', sub: c.name.match(/\((\d{4})\)/)?.[1] || '', kind: 'case' }); edges.push({ from: 'cb' + i, to: 'self', label: c.rel.toLowerCase(), kind: c.rel.startsWith('Overruled') ? 'red' : 'green' }); });
    const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const col = { grey: 'var(--ink-3)', red: 'var(--red)', green: 'var(--green)' };
    return `<svg viewBox="0 0 ${W} ${H}" class="graph" role="img" aria-label="Citation graph: ${esc(edges.map((e) => `${N[e.from].label} ${e.label} ${N[e.to].label}`).join('; '))}">
      <defs>${['grey', 'red', 'green'].map((k) => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col[k]}"/></marker>`).join('')}</defs>
      ${edges.map((e) => { const a = N[e.from], b = N[e.to]; const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); const sx = a.x + (dx / len) * 72, sy = a.y + (dy / len) * 26, ex = b.x - (dx / len) * 76, ey = b.y - (dy / len) * 28; return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${col[e.kind]}" stroke-width="2"${e.kind === 'grey' ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#ah-${e.kind})"/><text x="${(sx + ex) / 2}" y="${(sy + ey) / 2 - 6}" class="g-edge" fill="${col[e.kind]}">${e.label}</text>`; }).join('')}
      ${nodes.map((n) => `<g class="g-node g-${n.kind}"><rect x="${n.x - 74}" y="${n.y - 24}" width="148" height="48" rx="8"/><text x="${n.x}" y="${n.y - 3}" class="g-label">${esc(n.label)}</text><text x="${n.x}" y="${n.y + 14}" class="g-sub">${esc(n.sub)}</text></g>`).join('')}
    </svg>`;
  }

  function judgmentView(j) {
    return page({
      phase: 2, title: j.name, lead: `${j.court} · ${j.year} · ${j.cite}`,
      body: `
      <p><a href="#/precedent" class="link-arrow back">← Back to results</a></p>
      <div class="grid-2 wide-left">
        <section class="card" aria-labelledby="jt-h">
          <div class="badges">${treatBadge(j.treatment)}${j.sections.map((x) => `<a href="#/code/${x.replace(/\(.*/, '')}" class="chip-link">Section ${x.replace(/^s/, '')}</a>`).join('')}</div>
          <h2 id="jt-h" class="card-h">Judgment</h2>
          <p class="muted"><strong>Facts:</strong> ${esc(j.facts)}</p>
          <div class="judgment-text">${j.paragraphs.map((p, i) => i === j.passageIndex
            ? `<p class="passage" data-tour="passage"><span class="para-no">${i + 1}</span><mark>${esc(p)}</mark><span class="passage-note">${ICON.info} Passage relevant to your search</span></p>`
            : `<p><span class="para-no">${i + 1}</span>${esc(p)}</p>`).join('')}</div>
        </section>
        <section class="card" aria-labelledby="cg-h" data-tour="graph">
          <h2 id="cg-h" class="card-h">Citation graph</h2>
          ${citeGraph(j)}
          <p class="muted small">Dashed: sections interpreted. Green: followed or follows. Red: overruled or overrules.</p>
        </section>
      </div>`
    });
  }

  /* ------------------------------------------------------------------
     View: Matters (Phase 3)
  ------------------------------------------------------------------ */
  ENTER.matters = function () { state.matterTab = 'overview'; };
  VIEWS.matters = function (r) {
    if (r.id) return matterView(matter(r.id) || D.matters[0]);
    return page({
      phase: 3, title: 'Matters', bn: 'মামলা',
      lead: 'Every matter with its parties, court, stage, next hearing, research and drafts in one place.',
      body: `<section class="card"><div class="table-wrap"><table class="tbl">
        <thead><tr><th scope="col">Matter</th><th scope="col">Court</th><th scope="col">Stage</th><th scope="col">Next hearing</th></tr></thead>
        <tbody>${D.matters.map((m) => {
          const n = m.hearing ? diffDays(TODAY, m.hearing.date) : null;
          return `<tr><td><a href="#/matters/${m.id}"><strong>${esc(m.title)}</strong></a><p class="muted small">${esc(m.caseNo)}</p></td>
          <td>${esc(m.court)}</td><td>${esc(m.stage)}</td>
          <td class="nowrap">${m.hearing ? `${fmt(m.hearing.date)}<p class="muted small">${n === 0 ? 'Today, ' + m.hearing.time : 'In ' + n + ' days'}</p>` : '<span class="muted">Not listed</span>'}</td></tr>`;
        }).join('')}</tbody></table></div></section>`
    });
  };

  function matterView(m) {
    const tabs = [['overview', 'Overview'], ['documents', 'Documents'], ['chronology', 'Chronology'], ['research', 'Research'], ['drafts', 'Drafts']];
    const t = state.matterTab;
    let body = '';
    if (t === 'overview') {
      body = `<div class="grid-2">
        <div><h3 class="card-h">Summary</h3><p>${esc(m.summary)}</p>
          <table class="meta"><tr><th scope="row">Client</th><td>${esc(m.client)}</td></tr><tr><th scope="row">Other side</th><td>${esc(m.opponent)}</td></tr>
          <tr><th scope="row">Court</th><td>${esc(m.court)}</td></tr><tr><th scope="row">Cause of action</th><td>${fmt(m.causeDate)}</td></tr>
          <tr><th scope="row">Next hearing</th><td>${m.hearing ? fmt(m.hearing.date) + ', ' + m.hearing.time + ' · ' + esc(m.hearing.purpose) : 'Not listed'}</td></tr></table></div>
        <div><h3 class="card-h">Governing provisions, as of the cause of action</h3>
          <ul class="prov-list">${m.provisions.map((p) => { const s = sec(p.sid); const v = versionOn(p.sid, m.causeDate); const st = !v ? sem('red', 'Not in force') : s.lineage === 'none' ? sem('amber', 'Unverified') : v.to ? sem('blue', 'Earlier version applies') : sem('green', 'Current version'); return `<li><a href="#/code/${p.sid}?d=${m.causeDate}"><strong>Section ${s.num}</strong> · ${s.title_en}</a> ${st}<p class="small muted">${esc(p.note)}</p></li>`; }).join('')}</ul></div>
      </div>`;
    } else if (t === 'documents') {
      body = `<ul class="doc-list">${m.documents.map((d) => `<li><span class="doc-ico" aria-hidden="true">📄</span><div><strong>${esc(d.name)}</strong><p class="muted small">${d.kind} · ${d.pages} page${d.pages > 1 ? 's' : ''}</p></div></li>`).join('')}</ul>
        <a class="link-arrow" href="#/documents">Add a document ${ICON.arrow}</a>`;
    } else if (t === 'chronology') {
      body = `<ol class="chrono">${m.chronology.slice().sort((a, b) => a.date.localeCompare(b.date)).map((c) => `<li class="${c.legal ? 'is-legal' : ''}"><span class="chrono-date">${fmt(c.date)}</span><span class="chrono-text">${esc(c.text)}${c.legal ? ' ' + sem('blue', 'Legal event') : ''}</span></li>`).join('')}</ol>`;
    } else if (t === 'research') {
      body = m.research.length ? `<p class="muted">Questions already asked on this matter, with the date of law used.</p><ul class="rr-list">${m.research.map((r) => `<li><div><p class="rr-q" lang="bn">${esc(r.q)}</p><p class="muted small">Law as of ${fmt(r.date)}</p></div>
        <div class="rr-right">${outcomeBadge(r.outcome)}<strong>${esc(r.answer)}</strong><button type="button" class="btn ghost sm" data-action="rerun" data-q="${esc(r.q)}" data-date="${r.date}" data-lang="${r.lang}">Ask again</button></div></li>`).join('')}</ul>` : '<p class="muted">No research yet on this matter.</p>';
    } else {
      body = m.drafts.length ? `<ul class="rr-list">${m.drafts.map((d) => `<li><div><strong>${esc(d.title)}</strong><p class="muted small">Updated ${fmt(d.updated)} · ${d.cites} citations</p></div>
        <div class="rr-right">${d.flagged ? sem('red', d.flagged + ' citation flagged') : sem('green', 'All citations in force')}<a class="btn ghost sm" href="#/draft">Open</a></div></li>`).join('')}</ul>` : '<p class="muted">No drafts yet.</p>';
    }
    return page({
      phase: 3, title: esc(m.title), lead: `${esc(m.caseNo)} · ${esc(m.court)} · Stage: ${esc(m.stage)}`,
      body: `<p><a href="#/matters" class="link-arrow back">← All matters</a></p>
      <section class="card" data-tour="tabs">
        <div class="tabs" role="tablist" aria-label="Matter sections">${tabs.map(([k, l]) => `<button type="button" role="tab" id="tab-${k}" aria-selected="${k === t}" aria-controls="tabpanel" tabindex="${k === t ? 0 : -1}" class="tab${k === t ? ' on' : ''}" data-action="mtab" data-tab="${k}">${l}</button>`).join('')}</div>
        <div class="tabpanel" id="tabpanel" role="tabpanel" aria-labelledby="tab-${t}">${body}</div>
      </section>`
    });
  }

  /* ------------------------------------------------------------------
     View: Drafting (Phase 3) with live citation checks
  ------------------------------------------------------------------ */
  const CITE_RE = /\b([Ss]ection\s+(\d+)(?:\s*\((\d+)\))?)|(ধারা\s*([০-৯]+)(?:\s*\(([০-৯]+)\))?)/g;
  function checkCite(num, date) {
    const sid = 's' + num, s = sec(sid);
    if (!s) return { cls: 'cm-none', kind: 'grey', label: 'Not found', tip: `Section ${num} is not in the demo corpus for this Act.` };
    const v = versionOn(sid, date);
    if (!v) {
      if (s.repealed && date >= s.repealed) return { cls: 'cm-bad', kind: 'red', label: 'Repealed', tip: `This section was repealed in ${s.repealed.slice(0, 4)}. Did you mean the current version?` };
      return { cls: 'cm-bad', kind: 'red', label: 'Not yet in force', tip: `Not in force on ${fmt(date)}.` };
    }
    if (s.lineage === 'none') return { cls: 'cm-warn', kind: 'amber', label: 'History unverified', tip: 'In force, but its amendment history could not be verified. Current text used.' };
    return { cls: 'cm-ok', kind: 'green', label: 'In force', tip: `In force on ${fmt(date)}. ${v.to ? 'Earlier version (' + v.short_en + '), replaced ' + fmt(addDays(v.to, 1)) + '.' : 'Current version since ' + fmt(v.from) + '.'}` };
  }
  /* Also catch a period quoted from section 5 that does not match the version in force. */
  function checkPeriod(num, para, date) {
    if (num !== '5') return null;
    const v = versionOn('s5', date); if (!v) return null;
    const seven = /\bseven days\b|সাত দিন/.test(para), five = /\bfive days\b|পাঁচ দিন/.test(para);
    if (seven && five) return null;
    const says = seven ? 7 : five ? 5 : null;
    if (says && says !== v.facts.days) return { cls: 'cm-warn', kind: 'amber', label: 'Period does not match', tip: `The draft says ${says} days, but on ${fmt(date)} section 5 says ${v.facts.days} days. Check which date governs.` };
    return null;
  }
  function scanCites(paras, date) {
    const out = [];
    paras.forEach((p, pi) => {
      p.replace(CITE_RE, (m, en, n1, sub1, bn, n2, sub2) => {
        const num = n1 || enNum(n2); const sub = sub1 || (sub2 ? enNum(sub2) : '');
        const r = checkPeriod(num, p, date) || checkCite(num, date);
        out.push(Object.assign({ text: m, num, sub, para: pi }, r));
        return m;
      });
    });
    return out;
  }
  function markDraft(paras, date) {
    let k = 0;
    return paras.map((p) => {
      let html = '', last = 0;
      p.replace(CITE_RE, (m, en, n1, sub1, bn, n2, sub2, off) => {
        const num = n1 || enNum(n2);
        const r = checkPeriod(num, p, date) || checkCite(num, date);
        html += esc(p.slice(last, off)) + `<span class="cm ${r.cls}" data-tip="${esc(r.tip)}" id="cm-${k++}">${esc(m)}</span>`;
        last = off + m.length;
        return m;
      });
      html += esc(p.slice(last));
      return `<p>${html || '<br>'}</p>`;
    }).join('');
  }
  function draftParas() { if (!state.draft.paras) state.draft.paras = D.templates[state.draft.tpl].paras.slice(); return state.draft.paras; }
  function citePanel(paras, date) {
    const list = scanCites(paras, date);
    const count = (k) => list.filter((x) => x.kind === k).length;
    return `<p class="small muted">Checked against the law in force on <strong>${fmt(date)}</strong></p>
      <p class="cite-sum">${sem('green', count('green') + ' in force')}${count('amber') ? sem('amber', count('amber') + ' to check') : ''}${count('red') ? sem('red', count('red') + ' repealed') : ''}</p>
      <ul class="cite-check-list">${list.map((c) => `<li>${sem(c.kind, c.label)}<div><strong>${esc(c.text)}</strong><p class="small">${esc(c.tip)}</p>${c.kind === 'red' ? '<p class="small">Deposits are now governed by <a href="#/code/s5">section 5</a>.</p>' : ''}</div></li>`).join('')}</ul>`;
  }

  VIEWS.draft = function () {
    const d = state.draft, paras = draftParas();
    const tplBtns = Object.entries(D.templates).map(([k, t]) => `<button type="button" id="tpl-${k}" class="tpl-card${k === d.tpl ? ' on' : ''}" data-action="tpl" data-tpl="${k}" aria-pressed="${k === d.tpl}"><strong>${t.name}</strong><span lang="bn">${t.bn}</span></button>`).join('');
    return page({
      phase: 3, title: 'Drafting', bn: 'খসড়া',
      lead: 'Every statutory citation in a draft is checked against the dated corpus as you write.',
      body: `
      <div class="tpl-row" role="group" aria-label="Templates">${tplBtns}</div>
      <div class="card controls">
        <div class="field"><label for="draft-date" class="field-label">Check citations against the law on</label>
          <div class="date-row"><input type="date" id="draft-date" value="${d.date}" data-change="ddate">
          <button type="button" class="btn ghost sm" id="draft-coa" data-action="draft-coa">Use cause-of-action date (14 Aug 2023)</button>
          <button type="button" class="btn ghost sm" id="draft-today" data-action="draft-today">Today</button></div></div>
      </div>
      <div class="draft-grid">
        <section class="card editor-card" aria-labelledby="ed-h">
          <h2 id="ed-h" class="card-h">${D.templates[d.tpl].name} <span class="muted small">· Rahman v. Shapla Properties · edit freely</span></h2>
          <div id="editor" class="editor legal-text" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Draft text" spellcheck="false" data-input="editor">${markDraft(paras, d.date)}</div>
          <p class="cm-legend small"><span class="cm cm-ok">in force</span><span class="cm cm-warn">check</span><span class="cm cm-bad">repealed</span> Hover a citation for details. The full list is on the right.</p>
        </section>
        <aside class="card" aria-labelledby="cp-h"><h2 id="cp-h" class="card-h">Citation check</h2><div id="cite-panel" aria-live="polite">${citePanel(paras, d.date)}</div></aside>
      </div>`
    });
  };
  function readEditor() {
    const ed = $('#editor'); if (!ed) return draftParas();
    const kids = Array.from(ed.children).filter((c) => /^(P|DIV)$/.test(c.tagName));
    const paras = kids.length ? kids.map((c) => c.textContent) : ed.innerText.split('\n');
    state.draft.paras = paras;
    return paras;
  }
  function rewrapEditor() {
    const ed = $('#editor'); if (!ed) return;
    ed.innerHTML = markDraft(readEditor(), state.draft.date);
    $('#cite-panel').innerHTML = citePanel(state.draft.paras, state.draft.date);
  }

  /* ------------------------------------------------------------------
     View: Calendar and limitation (Phase 3)
  ------------------------------------------------------------------ */
  function allEvents() {
    const ev = [];
    D.matters.forEach((m) => { if (m.hearing) ev.push({ date: m.hearing.date, kind: 'hearing', label: m.title.split(' v. ')[0] + ': ' + m.hearing.purpose, matter: m.id }); });
    D.deadlines.forEach((d) => ev.push({ date: d.date, kind: 'deadline', label: d.label, matter: d.matter }));
    D.extraEvents.forEach((e) => ev.push(e));
    return ev;
  }
  const LIM_TYPES = {
    rc: { label: 'Tenancy dispute before the Rent Controller', sid: 's12', sub: '(2)', basis: 'One year from the date the cause of action arose.' },
    s9: { label: 'Criminal complaint for a withheld deposit', sid: 's9', sub: '(2)', basis: 'Ninety days from the date the deposit became returnable.' }
  };
  function computeLimitation(type, date) {
    const t = LIM_TYPES[type];
    const v = versionOn(t.sid, date);
    if (!v) return { error: `Section ${sec(t.sid).num} was not in force on ${fmt(date)}.` };
    const expiry = type === 'rc' ? addYears(date, 1) : addDays(date, 90);
    return { type, date, expiry, n: diffDays(TODAY, expiry), v, period: type === 'rc' ? 'One year' : 'Ninety days' };
  }
  function limResultHTML(r) {
    if (!r) return '';
    if (r.error) return `<div class="notice n-red" role="alert">${ICON.stop}<div><strong>${r.error}</strong></div></div>`;
    const t = LIM_TYPES[r.type], s = sec(t.sid);
    const status = r.n < 0 ? sem('red', 'Time-barred: expired ' + Math.abs(r.n) + ' days ago') : r.n <= 30 ? sem('amber', daysLeftText(r.n)) : sem('green', daysLeftText(r.n));
    return `<div class="lim-result" role="status">
      <dl class="lim-dl">
        <dt>Limitation period</dt><dd><strong>${r.period}</strong></dd>
        <dt>Expires on</dt><dd><strong>${fmt(r.expiry)}</strong> ${status}</dd>
        <dt>Governing section</dt><dd><a href="#/code/${t.sid}?d=${r.date}">Section ${s.num}${t.sub}</a>, ${s.title_en}<p class="muted small">${t.basis} Version in force on ${fmt(r.date)}: <code>${r.v.vid}</code></p></dd>
      </dl>
      ${s.lineage === 'none' ? `<div class="notice n-amber" role="note">${ICON.warn}<div><strong>Amendment history for this section could not be verified.</strong><p>Current text was used to compute this period.</p></div></div>` : s.lineage === 'medium' ? `<p class="small">${sem('blue', 'Medium confidence')} The amendment date for this section was inferred.</p>` : ''}
    </div>`;
  }
  VIEWS.calendar = function () {
    const { y, m } = state.cal;
    const first = new Date(y, m, 1, 12), days = new Date(y, m + 1, 0).getDate();
    const ev = allEvents();
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push('<div class="cal-cell empty" aria-hidden="true"></div>');
    for (let d = 1; d <= days; d++) {
      const ds = y + '-' + pad(m + 1) + '-' + pad(d);
      const e = ev.filter((x) => x.date === ds);
      const isToday = ds === TODAY;
      cells.push(`<div class="cal-cell${isToday ? ' today' : ''}"><span class="cal-d">${d}${isToday ? ' <span class="today-tag">Today</span>' : ''}</span>${e.map((x) => {
        const n = diffDays(TODAY, x.date);
        const cls = x.kind === 'hearing' ? 'ev-hearing' : n <= 3 ? 'ev-red' : 'ev-amber';
        return `<a href="#/matters/${x.matter}" class="ev ${cls}"><span class="ev-kind">${x.kind === 'hearing' ? 'Hearing' : 'Deadline'}</span> ${esc(x.label)}</a>`;
      }).join('')}</div>`);
    }
    const upcoming = ev.filter((x) => x.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);
    const L = state.lim;
    return page({
      phase: 3, title: 'Calendar and limitation', bn: 'ক্যালেন্ডার ও তামাদি',
      lead: 'Hearings and deadlines across matters, and limitation periods computed from the version of the law in force on the relevant date.',
      body: `
      <div class="cal-layout">
        <section class="card" aria-labelledby="cal-h">
          <div class="cal-head"><button type="button" class="btn ghost sm" id="cal-prev" data-action="cal" data-d="-1" aria-label="Previous month">←</button>
            <h2 id="cal-h" class="card-h">${MONTHS_EN[m]} ${y}</h2>
            <button type="button" class="btn ghost sm" id="cal-next" data-action="cal" data-d="1" aria-label="Next month">→</button></div>
          <div class="cal-grid" aria-label="${MONTHS_EN[m]} ${y}">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => `<div class="cal-wd">${w}</div>`).join('')}
            ${cells.join('')}
          </div>
          <p class="small muted cal-legend"><span class="ev ev-hearing">Hearing</span><span class="ev ev-amber">Deadline</span><span class="ev ev-red">Deadline within 3 days</span></p>
        </section>
        <div class="cal-side">
          <section class="card" data-tour="limit" aria-labelledby="lim-h">
            <h2 id="lim-h" class="card-h">Limitation calculator</h2>
            <div class="field"><label for="lim-type" class="field-label">Claim type</label>
              <select id="lim-type" data-change="limtype">${Object.entries(LIM_TYPES).map(([k, t]) => `<option value="${k}"${k === L.type ? ' selected' : ''}>${t.label}</option>`).join('')}</select></div>
            <div class="field"><label for="lim-date" class="field-label">${L.type === 's9' ? 'Date the deposit became returnable' : 'Cause-of-action date'}</label>
              <input type="date" id="lim-date" value="${L.date}" data-change="limdate"></div>
            <button type="button" class="btn primary" id="lim-go" data-action="lim">Calculate</button>
            <div id="lim-out">${limResultHTML(L.result)}</div>
          </section>
          <section class="card" aria-labelledby="up-h"><h2 id="up-h" class="card-h">Coming up</h2>
            <ul class="deadline-list">${upcoming.map((x) => `<li><div><strong>${esc(x.label)}</strong><p class="muted small">${fmt(x.date)}</p></div>${x.kind === 'hearing' ? sem('grey', 'Hearing') : urgency(diffDays(TODAY, x.date))}</li>`).join('')}</ul>
          </section>
        </div>
      </div>`
    });
  };

  /* ------------------------------------------------------------------
     View: Documents (Phase 3, light)
  ------------------------------------------------------------------ */
  function extractionHTML(name) {
    return `<section class="card extract" aria-labelledby="ex-doc-h">
      <h2 id="ex-doc-h" class="card-h">${esc(name)}</h2>
      <div class="grid-2">
        <div><h3 class="h-small">Parties</h3><ul class="plain-list"><li><strong>Shapla Properties Ltd.</strong> · landlord, sender</li><li><strong>Tahmina Rahman</strong> · tenant, recipient</li></ul>
          <h3 class="h-small">Dates</h3><ul class="plain-list"><li>7 Aug 2023 · possession handed back</li><li>2 Sep 2023 · notice issued; Tk 38,000 deducted</li></ul></div>
        <div><h3 class="h-small">Sections cited</h3><ul class="plain-list"><li>Section 5(2) ${sem('green', 'In force on 2 Sep 2023')}</li><li>Section 7 ${sem('red', 'Repealed in 2018')}</li></ul>
          <h3 class="h-small">Issues raised</h3><ul class="plain-list"><li>Deduction for repainting: is it ordinary wear and tear?</li><li>No written statement of deductions (section 5(2))</li><li>Notice relies on a repealed section</li></ul></div>
      </div>
    </section>`;
  }
  VIEWS.documents = function () {
    const s = state.docs;
    return page({
      phase: 3, title: 'Documents', bn: 'নথি',
      lead: 'Drop in a filing or notice. Dhara reads it and pulls out parties, dates, sections cited and the issues raised.',
      body: `
      <label class="dropzone card" id="dropzone" for="file-in">
        ${ICON.upload}
        <span class="dz-title">Drop a PDF or image here, or choose a file</span>
        <span class="muted small">Simulated. Nothing leaves your computer and the file is not read.</span>
        <input type="file" id="file-in" class="sr-only" data-change="file">
      </label>
      <div id="doc-status" role="status" aria-live="polite">${s.status ? `<p class="doc-status">${s.status}</p>` : ''}</div>
      ${s.file && !s.status ? extractionHTML(s.file) : ''}
      <h2 class="h-small">Example already processed</h2>
      ${extractionHTML('Landlord’s legal notice, 2 Sep 2023.pdf')}`
    });
  };
  async function processFile(name) {
    const s = state.docs;
    s.file = name;
    const steps = ['Reading the document…', 'Finding parties and dates…', 'Checking cited sections against the dated corpus…'];
    for (const st of steps) {
      s.status = st;
      const el = $('#doc-status'); if (!el) return;
      el.innerHTML = `<p class="doc-status">${esc(name)}: ${st}</p>`;
      await wait(600);
    }
    s.status = null;
    if (parseHash().name === 'documents') rerender();
    announce('Document processed.');
  }

  /* ------------------------------------------------------------------
     View: Cause list (Phase 3, judge)
  ------------------------------------------------------------------ */
  VIEWS.causelist = function () {
    return page({
      phase: 3, title: 'Cause list', bn: 'কার্যতালিকা',
      lead: `${fmt(TODAY)} · Court of the Rent Controller, Dhaka Zone 3 (demo)`,
      body: `<section class="card"><div class="table-wrap"><table class="tbl">
        <thead><tr><th scope="col">No.</th><th scope="col">Case</th><th scope="col">Parties</th><th scope="col">Stage</th><th scope="col">Flag</th></tr></thead>
        <tbody>${D.causeList.map((c) => `<tr><td>${c.no}</td><td class="nowrap">${c.caseNo}</td><td>${c.matter ? `<a href="#/bench">${esc(c.parties)}</a>` : esc(c.parties)}</td><td>${esc(c.stage)}</td><td>${c.flag ? sem(c.flagKind, esc(c.flag)) : '<span class="muted">None</span>'}</td></tr>`).join('')}</tbody>
      </table></div></section>`
    });
  };

  /* ------------------------------------------------------------------
     View: Bench tools (Phase 4, static)
  ------------------------------------------------------------------ */
  VIEWS.bench = function () {
    return page({
      phase: 4, title: 'Bench tools', bn: 'বিচারকের সরঞ্জাম',
      lead: 'RC 214/2026 · Tahmina Rahman v. Shapla Properties Ltd.',
      body: `<div class="mockup-mark" aria-hidden="true">Static mockup</div>
      <div class="grid-2">
        <section class="card"><h2 class="card-h">Case bundle summary</h2>
          <p>Application for return of a Tk 60,000 deposit. Tk 38,000 retained for repainting. Possession handed back on 7 Aug 2023. Application filed 20 May 2024.</p>
          <p class="muted small">Bundle: 11 documents, 64 pages.</p></section>
        <section class="card"><h2 class="card-h">Issues for determination</h2>
          <ol class="plain-ol"><li>Which version of section 5 governs: seven days or five?</li><li>Was the deduction lawful without a written statement?</li><li>Is the application within one year under section 12(2)?</li></ol></section>
        <section class="card"><h2 class="card-h">Authorities cited</h2>
          <table class="tbl"><thead><tr><th scope="col">Side</th><th scope="col">Authority</th><th scope="col">Status</th></tr></thead><tbody>
          <tr><td>Applicant</td><td>Nurjahan Properties v. Kamal Hossain (2021)</td><td>${sem('green', 'Good law')}</td></tr>
          <tr><td>Applicant</td><td>Section 5(1), version of 2006</td><td>${sem('blue', 'Correct version for 2023')}</td></tr>
          <tr><td>Respondent</td><td>Bright Homes v. Farid Uddin (2013)</td><td>${sem('red', 'Overruled 2021')}</td></tr>
          <tr><td>Respondent</td><td>Section 7</td><td>${sem('red', 'Repealed 2018')}</td></tr></tbody></table></section>
        <section class="card"><h2 class="card-h">Consistency note</h2>
          <p>In two earlier orders of this court (RC 88/2025 and RC 131/2025) a written statement under section 5(2) was treated as mandatory. Both are consistent with the Appellate Division’s 2021 ruling.</p>
          <p class="muted small">For the judge’s own reference. Dhara does not predict outcomes or profile judges.</p></section>
      </div>`
    });
  };

  /* ------------------------------------------------------------------
     View: Analytics (Phase 4, static, CSS bars)
  ------------------------------------------------------------------ */
  VIEWS.analytics = function () {
    const A = D.analytics;
    const maxP = Math.max(...A.pendency.map((p) => p.value));
    const maxT = Math.max(...A.trend.map((t) => Math.max(t.filed, t.disposed)));
    return page({
      phase: 4, title: 'Court analytics', bn: 'আদালত বিশ্লেষণ',
      lead: `${A.court}. Figures are invented for illustration.`,
      body: `<div class="mockup-mark" aria-hidden="true">Static mockup</div>
      <div class="grid-2" data-tour="analytics">
        <section class="card"><h2 class="card-h">Pending cases by type</h2>
          <ul class="hbars">${A.pendency.map((p) => `<li><span class="hb-label">${p.label}</span><span class="hb-track"><span class="hb-bar" style="width:${(p.value / maxP) * 100}%"></span></span><span class="hb-val">${p.value.toLocaleString('en-IN')}</span></li>`).join('')}</ul></section>
        <section class="card"><h2 class="card-h">Age of pending cases</h2>
          <ul class="hbars">${A.age.map((p) => `<li><span class="hb-label">${p.label}</span><span class="hb-track"><span class="hb-bar alt" style="width:${p.value * 2.5}%"></span></span><span class="hb-val">${p.value}%</span></li>`).join('')}</ul></section>
        <section class="card"><h2 class="card-h">ADR-eligible matters flagged</h2>
          <p class="big-n">${A.adr.flagged.toLocaleString('en-IN')} <span class="muted small">of ${A.adr.of.toLocaleString('en-IN')} pending</span></p>
          <ul class="plain-list">${A.adr.top.map((t) => `<li>${t}</li>`).join('')}</ul></section>
        <section class="card"><h2 class="card-h">Filed and disposed, by quarter</h2>
          <div class="vbars">${A.trend.map((t) => `<div class="vb-group"><div class="vb-pair"><span class="vb filed" style="height:${(t.filed / maxT) * 100}%" title="Filed ${t.filed}"></span><span class="vb disposed" style="height:${(t.disposed / maxT) * 100}%" title="Disposed ${t.disposed}"></span></div><span class="vb-label">${t.q}</span></div>`).join('')}</div>
          <p class="small vb-legend"><span class="lg-filed"></span>Filed <span class="lg-disposed"></span>Disposed</p></section>
      </div>`
    });
  };

  /* ------------------------------------------------------------------
     View: Grievance triage (Phase 2) and Case intake (Phase 4)
  ------------------------------------------------------------------ */
  VIEWS.triage = function () {
    return page({
      phase: 2, title: 'Grievance triage', bn: 'অভিযোগ বাছাই',
      lead: 'Grievances from the public layer, routed to the applicable law and forum, with limitation status and ADR eligibility.',
      body: `<ul class="result-list">${D.grievances.map((g) => {
        const routed = state.triage[g.id];
        return `<li class="card triage-item">
          <div class="triage-main"><p class="muted small">${g.id} · received ${fmt(g.received)}</p><p class="triage-text" lang="bn">${esc(g.text)}</p>
          <dl class="triage-dl"><dt>Applicable law</dt><dd>${esc(g.law)}</dd><dt>Suggested forum</dt><dd>${esc(g.forum)}</dd><dt>Limitation</dt><dd>${sem(g.limitKind, esc(g.limitation))}</dd><dt>Mediation</dt><dd>${g.adr ? sem('green', 'ADR eligible') : sem('grey', 'Not suggested')}</dd></dl></div>
          <div class="triage-side">${routed ? sem('green', 'Routed') : `<button type="button" class="btn" id="route-${g.id}" data-action="route" data-id="${g.id}">Accept routing</button>`}</div>
        </li>`;
      }).join('')}</ul>`
    });
  };
  VIEWS.intake = function () {
    return page({
      phase: 4, title: 'Case intake', bn: 'মামলা গ্রহণ',
      lead: 'Structured intake for legal aid offices, with eligibility screening configured by the legal aid body.',
      body: `<div class="mockup-mark" aria-hidden="true">Static mockup</div>
      <div class="grid-2"><section class="card"><h2 class="card-h">Applicant</h2>
        <div class="field"><label class="field-label" for="in-name">Name</label><input id="in-name" value="Rupa Begum" disabled></div>
        <div class="field"><label class="field-label" for="in-issue">Issue</label><input id="in-issue" value="Deposit of Tk 30,000 not returned" disabled></div>
        <div class="field"><label class="field-label" for="in-date">Date of problem</label><input id="in-date" value="${fmt(matter('m4').causeDate)}" disabled></div></section>
      <section class="card"><h2 class="card-h">Screening</h2><ul class="plain-list">
        <li>${sem('green', 'Matches')} Tenancy deposit: sections 5 and 12</li><li>${sem('amber', 'Urgent')} Limitation expires in 9 days</li><li>${sem('grey', 'Pending')} Eligibility rules of the legal aid body</li></ul></section></div>`
    });
  };

  /* ------------------------------------------------------------------
     View: Citizen (Phase 1, separate layout, plain Bangla)
  ------------------------------------------------------------------ */
  const CZ_EX = [
    { q: 'বাড়ি ছেড়ে দিয়েছি, কিন্তু বাড়িওয়ালা জামানতের টাকা ফেরত দিচ্ছেন না।', date: addDays(TODAY, -30) },
    { q: '২০২৩ সালে বাসা ছেড়েছি, জামানতের টাকা এখনো পাইনি।', date: '2023-08-07' },
    { q: 'বাড়িওয়ালা জামানত আটকে রাখলে কী শাস্তি হয়?', date: addDays(TODAY, -10) },
    { q: 'আমি কি মামলায় জিতব?', date: TODAY }
  ];
  function citizenAnswer(q, date) {
    const kind = classify(q);
    if (kind === 'predict') return { kind: 'predict' };
    if (kind === 'none') return { kind: 'none' };
    if (date < D.act.commenced) return { kind: 'old' };
    const v5 = versionOn('s5', date), v9 = versionOn('s9', date);
    const days = v5.facts.days;
    const returnable = addDays(date, days);
    if (kind === 'penalty') {
      const deadline = addDays(returnable, 90);
      return { kind: 'penalty', days, amt: v9.facts.amt, returnable, deadline, left: diffDays(TODAY, deadline), old: !!v5.to || !!v9.to, date };
    }
    const deadline = addYears(returnable, 1);
    return { kind: 'deposit', days, returnable, deadline, left: diffDays(TODAY, deadline), old: !!v5.to, date };
  }
  function czCard(n, title, body, src) {
    return `<section class="cz-card"><h2><span class="cz-n">${bnNum(n)}</span>${title}</h2>${body}${src ? `<p class="cz-src">সূত্র: ${src}</p>` : ''}</section>`;
  }
  function czDeadline(a) {
    if (a.left < 0) return `<p class="cz-big cz-red">${ICON.stop} সময় পেরিয়ে গেছে বলে মনে হচ্ছে।</p><p>শেষ তারিখ ছিল ${fmt(a.deadline, 'bn')}। তবু দেরি না করে একজন আইনজীবী বা নিকটের আইনগত সহায়তা অফিসের সঙ্গে কথা বলুন।</p>`;
    return `<p class="cz-big">শেষ তারিখ: <strong>${fmt(a.deadline, 'bn')}</strong></p><p>${a.left <= 30 ? `<span class="cz-amber-text">${ICON.warn} হাতে আছে মাত্র ${bnNum(a.left)} দিন। দেরি করবেন না।</span>` : `হাতে আছে ${bnNum(a.left)} দিন।`}</p>`;
  }
  function czAnswerHTML(a) {
    if (!a) return '';
    if (a.kind === 'predict') return `<div class="cz-panel cz-neutral" role="note"><h2>${ICON.info} মামলায় কে জিতবে, তা আমরা বলতে পারি না।</h2><p>সেটি ঠিক করেন আদালত। আমরা জানাতে পারি আপনার ক্ষেত্রে আইন কী বলে, কোথায় যেতে হবে আর কী কাগজ লাগবে।</p><button type="button" class="btn big" data-action="cz-ex" data-i="0">যেমন: জামানতের টাকা ফেরত পাচ্ছি না</button></div>`;
    if (a.kind === 'none') return `<div class="cz-panel cz-red" role="alert"><h2>${ICON.stop} দুঃখিত, এই প্রশ্নের উত্তর দেওয়ার মতো আইনি তথ্য আমাদের কাছে নেই।</h2><p>আমরা অনুমান করে উত্তর দিই না। নিকটের আইনগত সহায়তা অফিসে যোগাযোগ করুন।</p></div>`;
    if (a.kind === 'old') return `<div class="cz-panel cz-red" role="alert"><h2>${ICON.stop} ওই তারিখে এই আইন চালু ছিল না।</h2><p>আইনটি চালু হয়েছে ${fmt(D.act.commenced, 'bn')} থেকে।</p></div>`;
    const docs = `<ul class="cz-checklist"><li>ভাড়ার চুক্তিপত্রের কপি (যদি থাকে)</li><li>জামানত দেওয়ার রসিদ বা প্রমাণ</li></ul><p class="cz-sub">সঙ্গে রাখলে ভালো:</p><ul class="cz-checklist light"><li>বাসা ছাড়ার তারিখের প্রমাণ, যেমন চাবি বুঝিয়ে দেওয়ার কাগজ বা মেসেজ</li><li>বাড়িওয়ালার সঙ্গে কথাবার্তার মেসেজ বা চিঠি</li></ul>`;
    const unverified = `<p class="cz-note">${ICON.warn} এই নিয়মটি আগে কখনো বদলেছিল কি না, তা পুরোপুরি যাচাই করা যায়নি। তাই বর্তমান নিয়ম দেখানো হলো।</p>`;
    const oldNote = a.old ? `<p class="cz-note cz-blue">${ICON.clock} আপনার ঘটনার সময় যে নিয়ম চালু ছিল, সেটিই দেখানো হলো। পরে আইন বদলেছে, এখনকার নিয়ম ভিন্ন।</p>` : '';
    if (a.kind === 'penalty') {
      return `<div class="cz-answer">
        <p class="cz-date-line">${ICON.cal} আপনার দেওয়া তারিখ (${fmt(a.date, 'bn')}) অনুযায়ী আইন দেখানো হলো।</p>
        ${czCard(1, 'আইন কী বলে', `<p class="cz-big">কোনো কারণ ছাড়া জামানত আটকে রাখলে বাড়িওয়ালার <strong>${bnNum(a.amt.toLocaleString('en-IN'))} টাকা</strong> পর্যন্ত জরিমানা হতে পারে।</p>${oldNote}`, 'আবাসিক ভাড়া আইন, ধারা ৯')}
        ${czCard(2, 'কোথায় যাবেন', '<p>আদালতে লিখিত অভিযোগ করতে হবে। টাকা ফেরত চাইতে চাইলে এলাকার ভাড়া নিয়ন্ত্রকের অফিসেও আবেদন করতে পারেন। এটি বাড়ি ভাড়া নিয়ে ঝামেলা মেটানোর সরকারি অফিস।</p>', 'ধারা ৯ ও ধারা ১২')}
        ${czCard(3, 'কত দিনের মধ্যে', `<p>বাসা ছাড়ার ${bnNum(a.days)} দিন পর টাকা ফেরত পাওয়ার কথা। তার পর থেকে ৯০ দিনের মধ্যে অভিযোগ করতে হবে।</p>${czDeadline(a)}`, 'ধারা ৫ ও ধারা ৯')}
        ${czCard(4, 'কী কী কাগজ লাগবে', docs, 'ধারা ১২')}
      </div>`;
    }
    return `<div class="cz-answer">
      <p class="cz-date-line">${ICON.cal} আপনার দেওয়া তারিখ (${fmt(a.date, 'bn')}) অনুযায়ী আইন দেখানো হলো।</p>
      ${czCard(1, 'আইন কী বলে', `<p class="cz-big">বাসা ছেড়ে চাবি বুঝিয়ে দেওয়ার <strong>${bnNum(a.days)} দিনের মধ্যে</strong> বাড়িওয়ালাকে জামানতের টাকা ফেরত দিতে হবে।</p><p>কিছু টাকা কাটলে, প্রতিটি কাটার লিখিত হিসাব আপনাকে দিতে হবে।</p>${oldNote}`, 'আবাসিক ভাড়া আইন, ধারা ৫')}
      ${czCard(2, 'কোথায় যাবেন', '<p class="cz-big">আপনার এলাকার <strong>ভাড়া নিয়ন্ত্রকের অফিসে</strong> আবেদন করুন।</p><p>এটি বাড়ি ভাড়া নিয়ে ঝামেলা মেটানোর সরকারি অফিস।</p>' + unverified, 'ধারা ১২')}
      ${czCard(3, 'কত দিনের মধ্যে', `<p>টাকা ফেরত পাওয়ার শেষ দিন (${fmt(a.returnable, 'bn')}) থেকে ১ বছরের মধ্যে আবেদন করতে হবে।</p>${czDeadline(a)}`, 'ধারা ১২')}
      ${czCard(4, 'কী কী কাগজ লাগবে', docs, 'ধারা ১২')}
    </div>`;
  }
  VIEWS.public = function () {
    const c = state.cz;
    return gatePage(1, `<div class="citizen" data-tour="citizen">
      <header class="cz-head">
        <div class="cz-brand"><span class="cz-mark" aria-hidden="true">ধা</span><span><span class="cz-name">ধারা</span><span class="cz-tag">সবার জন্য আইন · বিনামূল্যে</span></span></div>
        ${badge(1)}
      </header>
      <div class="cz-main" lang="bn">
        <h1 tabindex="-1">আপনার সমস্যার কথা লিখুন</h1>
        <p class="cz-lead">সহজ ভাষায় লিখুন। আমরা জানাব আইন কী বলে, কোথায় যেতে হবে, কত দিনের মধ্যে, আর কী কাগজ লাগবে।</p>
        <div class="cz-form">
          <label for="cz-q" class="sr-only">আপনার সমস্যা</label>
          <textarea id="cz-q" rows="3" placeholder="যেমন: বাসা ছেড়ে দিয়েছি, কিন্তু বাড়িওয়ালা জামানতের টাকা ফেরত দিচ্ছেন না।" data-input="czq">${esc(c.q)}</textarea>
          <div class="cz-row">
            <div><label for="cz-date" class="cz-label">ঘটনাটি কবে ঘটেছে? (বাসা কবে ছেড়েছেন)</label>
              <input type="date" id="cz-date" value="${c.date}" data-change="czdate"><p class="cz-hint">ঠিক জানা না থাকলে আনুমানিক তারিখ দিন।</p></div>
            <button type="button" class="btn primary big cz-go" id="cz-go" data-action="cz-ask">উত্তর দেখুন</button>
          </div>
          <p class="cz-ex-h">অন্যরা যা জানতে চেয়েছেন:</p>
          <div class="cz-ex">${CZ_EX.map((e, i) => `<button type="button" class="cz-chip" data-action="cz-ex" data-i="${i}">${esc(e.q)}</button>`).join('')}</div>
        </div>
        <div id="cz-answer" aria-live="polite">${czAnswerHTML(c.result)}</div>
        <p class="cz-foot">এটি আইনি পরামর্শ নয়। প্রতিটি উত্তর সরকারি আইনের নির্দিষ্ট ধারা থেকে নেওয়া। চিরকাল বিনামূল্যে।</p>
      </div>
    </div>`);
  };
  function czAsk() {
    const c = state.cz;
    if (!c.q.trim()) { $('#cz-q').focus(); return; }
    c.result = citizenAnswer(c.q, c.date);
    $('#cz-answer').innerHTML = czAnswerHTML(c.result);
    announce('উত্তর দেখানো হলো');
  }

  /* ------------------------------------------------------------------
     Fallback views
  ------------------------------------------------------------------ */
  function viewNoAccess(name) {
    const m = MODULES[name];
    return `<div class="view"><header class="view-head"><h1 tabindex="-1">${m ? m.label : 'Page'} is not part of the ${ROLE_NAME[state.role].toLowerCase()} workspace</h1>
      <p class="lead">Each role sees the tools for its own work. Switch role in the header, or go to <a href="#/research">Research</a>.</p></header></div>`;
  }
  function viewNotFound() {
    return `<div class="view"><header class="view-head"><h1 tabindex="-1">Page not found</h1><p class="lead"><a href="#/research">Go to Research</a></p></header></div>`;
  }

  /* ------------------------------------------------------------------
     Event handling
  ------------------------------------------------------------------ */
  const ACTIONS = {
    seg(el) {
      const { name, val } = el.dataset;
      if (name === 'rlang') { state.research.lang = val; syncResearchInputs(); if (state.research.result && state.research.result.q === state.research.q.trim()) { const r = computeAnswer(state.research.result.q, state.research.result.date, val); state.research.result = r; $('#result').innerHTML = resultHTML(r); applyGates(); } return; }
      if (name === 'cmode') { if (el.disabled) return; state.code.mode = val; rerender(); return; }
      if (name === 'clang') { state.code.lang = val; rerender(); }
    },
    ask() { ask(); },
    example(el) { runExample(Number(el.dataset.i)); },
    rtoday() { state.research.date = TODAY; syncResearchInputs(); },
    cite(el) { highlightCite(el.dataset.key); },
    'goto-src'(el, e) { e.preventDefault(); const c = $('#src-' + el.dataset.sid); if (c) { c.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' }); c.focus({ preventScroll: true }); } },
    compare(el) { state.research.date = el.dataset.date; syncResearchInputs(); ask(); },
    suggest(el) { state.research.q = el.dataset.q; syncResearchInputs(); ask(); },
    'hist-rerun'(el) { const h = state.research.history[Number(el.dataset.i)]; Object.assign(state.research, { q: h.q, date: h.date, lang: h.lang }); syncResearchInputs(); ask(); },
    'save-matter'(el) { state.research.saved = true; el.firstChild.textContent = 'Saved to Rahman v. Shapla '; announce('Saved to the matter Rahman v. Shapla Properties.'); },
    rerun(el) { Object.assign(state.research, { q: el.dataset.q, date: el.dataset.date, lang: el.dataset.lang || 'bn', autoRun: true }); go('#/research'); },
    'code-ver'(el) { const i = Number(el.dataset.i); const v = sec(state.code.sid).versions[i]; state.code.vIdx = i; if (v.from) state.code.date = v.from; rerender(); },
    ctoday() { state.code.date = TODAY; syncCodeVersion(); rerender(); },
    mtab(el) { state.matterTab = el.dataset.tab; rerender(); },
    tpl(el) { state.draft.tpl = el.dataset.tpl; state.draft.paras = null; rerender(); },
    'draft-coa'() { state.draft.date = '2023-08-14'; readEditor(); rerender(); },
    'draft-today'() { state.draft.date = TODAY; readEditor(); rerender(); },
    cal(el) { let { y, m } = state.cal; m += Number(el.dataset.d); if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } state.cal = { y, m }; rerender(); },
    lim() { const L = state.lim; L.result = computeLimitation(L.type, L.date); $('#lim-out').innerHTML = limResultHTML(L.result); },
    'prec-search'() { rerender(); announce(D.judgments.length + ' judgments found.'); },
    route(el) { state.triage[el.dataset.id] = true; rerender(); announce('Grievance routed.'); },
    'cz-ask'() { czAsk(); },
    'cz-ex'(el) { const e = CZ_EX[Number(el.dataset.i)]; state.cz.q = e.q; state.cz.date = e.date; $('#cz-q').value = e.q; $('#cz-date').value = e.date; czAsk(); }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (a && ACTIONS[a.dataset.action]) { ACTIONS[a.dataset.action](a, e); return; }
    if (e.target.closest('.nav-link') && window.innerWidth <= 960) closeNav();
  });

  let edTimer = null;
  document.addEventListener('input', (e) => {
    const t = e.target.closest('[data-input]'); if (!t) return;
    const k = t.dataset.input;
    if (k === 'rq') { state.research.q = t.value; const err = $('#q-error'); if (err) err.hidden = true; }
    if (k === 'pq') state.prec.q = t.value;
    if (k === 'czq') state.cz.q = t.value;
    if (k === 'editor') { clearTimeout(edTimer); edTimer = setTimeout(() => { const p = readEditor(); $('#cite-panel').innerHTML = citePanel(p, state.draft.date); }, 250); }
  });
  document.addEventListener('focusout', (e) => { if (e.target.id === 'editor') rewrapEditor(); });

  document.addEventListener('change', (e) => {
    const t = e.target.closest('[data-change]'); if (!t) return;
    const k = t.dataset.change, v = t.value;
    if (k === 'rdate' && v) state.research.date = v;
    if (k === 'cdate' && v) { state.code.date = v; syncCodeVersion(); rerender(); }
    if (k === 'ddate' && v) { state.draft.date = v; readEditor(); rerender(); }
    if (k === 'limtype') { state.lim.type = v; state.lim.result = null; rerender(); }
    if (k === 'limdate' && v) state.lim.date = v;
    if (k === 'czdate' && v) state.cz.date = v;
    if (k === 'file' && t.files[0]) processFile(t.files[0].name);
  });

  document.addEventListener('keydown', (e) => {
    if (tour.active) return tourKey(e);
    if (e.key === 'Escape') { closeNav(); hideTip(); }
    // Ctrl/Cmd + Enter submits the research question.
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.id === 'q') ask();
    if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'cz-q') { e.preventDefault(); czAsk(); }
    if (e.key === 'Enter' && e.target.id === 'prec-q') ACTIONS['prec-search']();
    // Arrow keys move between matter tabs.
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.getAttribute('role') === 'tab') {
      const tabs = $$('[role="tab"]'); const i = tabs.indexOf(e.target);
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      n.click(); const nn = document.getElementById(n.id); if (nn) nn.focus();
    }
  });

  /* Drag and drop for the document view. */
  document.addEventListener('dragover', (e) => { const z = e.target.closest && e.target.closest('#dropzone'); if (z) { e.preventDefault(); z.classList.add('over'); } });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest && e.target.closest('#dropzone'); if (z) z.classList.remove('over'); });
  document.addEventListener('drop', (e) => { const z = e.target.closest && e.target.closest('#dropzone'); if (z) { e.preventDefault(); z.classList.remove('over'); const f = e.dataTransfer.files[0]; processFile(f ? f.name : 'Dropped file.pdf'); } });

  /* Shared tooltip for [data-tip]. */
  const tip = $('#tip');
  function showTip(el) {
    tip.textContent = el.dataset.tip; tip.hidden = false;
    const r = el.getBoundingClientRect(), tw = Math.min(320, window.innerWidth - 24);
    tip.style.maxWidth = tw + 'px';
    const left = Math.max(12, Math.min(r.left, window.innerWidth - tip.offsetWidth - 12));
    let top = r.bottom + 8;
    if (top + tip.offsetHeight > window.innerHeight - 8) top = r.top - tip.offsetHeight - 8;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
    el.setAttribute('aria-describedby', 'tip');
  }
  function hideTip() { tip.hidden = true; }
  document.addEventListener('mouseover', (e) => { const el = e.target.closest('[data-tip]'); if (el) showTip(el); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tip]')) hideTip(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el); else hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* Header controls */
  $('#role-select').addEventListener('change', (e) => setRole(e.target.value));
  $('#p1-toggle').addEventListener('click', () => setP1(!state.p1Only));
  $('#menu-btn').addEventListener('click', () => (document.body.classList.contains('nav-open') ? closeNav() : openNav()));
  $('#scrim').addEventListener('click', closeNav);
  $('#tour-btn').addEventListener('click', () => tourStart());
  window.addEventListener('resize', () => { measureHeader(); if (tour.active) tourPosition(); });

  /* ------------------------------------------------------------------
     Guided tour
  ------------------------------------------------------------------ */
  const tour = { active: false, i: 0, el: null, busy: false };
  const visible = (sel) => { const el = $(sel); if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < window.innerWidth ? el : null; };
  const sidebarOr = (fallback) => () => visible('#sidebar') || $(fallback);
  function resetResearch() { Object.assign(state.research, { q: '', date: TODAY, lang: 'bn', result: null }); }

  const STEPS = [
    { route: '#/', role: 'advocate', target: '.brand', title: 'This is Dhara',
      body: '<p>One place where judges, advocates and legal officers research the law, work a matter, draft and manage a case, with every legal statement traced to a dated source.</p><p>The tour shows the whole platform first. At the end it shows the part this grant pays for.</p>' },
    { target: sidebarOr('#main'), title: 'Every module carries a phase',
      body: '<p>Modules are grouped by release. <strong>Phase 1</strong> is funded by this grant. Phases 2 to 4 are planned and are shown so you can see where the work leads.</p><p>Planned screens are deliberately muted. The difference is intentional.</p>' },
    { target: '#role-field', title: 'One platform for the whole sector',
      body: '<p>Switch between advocate, judge, legal officer and citizen. Each sees the tools for their own work. The citizen view is a separate, plain-Bangla product.</p>' },
    { route: '#/', target: '[data-tour="hearings"]', title: 'An advocate’s morning · Phase 3',
      body: '<p>Today’s hearings, and deadlines counted in days. Red is three days or fewer; amber is within ten. Every colour is paired with words.</p>' },
    { target: '[data-tour="alert"]', title: 'The law changed under an open matter',
      body: '<p>Section 5 was amended in 2024. This matter arose in 2023, so the older seven-day rule governs.</p><p>Dhara can say this only because every provision carries the dates it was in force. That is the foundation the grant builds.</p>' },
    { route: '#/research', before: () => { resetResearch(); rerender(); }, target: '[data-tour="qbox"]', title: 'Research · Phase 1, funded',
      body: '<p>Ask in Bangla or English, and choose the answer language separately.</p>' },
    { target: '[data-tour="asof"]', title: 'The date is part of the question',
      body: '<p>A dispute is decided by the law as it stood on the day it arose. Pick that date here. It defaults to today.</p><p>No other system in the country does this.</p>' },
    { target: '[data-tour="chips"]', title: 'Example questions',
      body: '<p>Each example loads a question and a date in one click. The coloured dot, with its label, shows the kind of answer to expect.</p>' },
    { before: () => runExample(0), target: '[data-tour="answer-core"]', title: 'A cited answer, built in three visible steps',
      body: '<p>Dhara kept only sections in force on the date, searched them by word and by meaning, then checked every citation against what it retrieved.</p><p>Each sentence ends in a numbered citation chip.</p>' },
    { before: () => { highlightCite('s5:ret'); return wait(reduceMotion() ? 0 : 450); }, target: '#src-s5', title: 'Click a citation, see the exact words',
      body: '<p>The supporting phrase lights up in yellow inside the source section. Every sentence can be checked against the law in one click.</p>' },
    { target: '[data-tour="timeline"]', title: 'Which version was used',
      body: '<p>Each coloured bar is one version of the section, from 2006 to 2026. The vertical line is your date. The outlined bar is the version this answer used.</p>' },
    { before: () => runExample(1), target: '[data-tour="answer-core"]', title: 'Same question, 14 August 2023',
      body: '<p><strong>Seven days, not five.</strong> The blue notice says the section was amended after that date.</p><p>A general chatbot would give the 2026 answer to a 2023 dispute, and an advocate would file on the wrong law.</p>' },
    { target: '[data-tour="history"]', title: 'Two dates, two answers',
      body: '<p>The session log keeps both answers side by side: same words, different law.</p>' },
    { before: () => runExample(5), target: '[data-tour="answer"]', title: 'It refuses rather than guesses',
      body: '<p>When the law in the corpus does not support an answer, Dhara says so in red. It never invents a section number.</p><p>Ask who will win, and it explains that it is a research assistant, not a predictor.</p>' },
    { route: '#/code/s5?d=2023-08-14', before: () => { state.code.mode = 'text'; rerender(); }, target: '[data-tour="versions"]', title: 'Provision browser · Phase 1, funded',
      body: '<p>Every version of every section, with its dates, the Act that amended it, and the footnote each date was taken from.</p>' },
    { before: () => { state.code.vIdx = 1; state.code.mode = 'changes'; rerender(); }, target: '[data-tour="text"]', title: 'Exactly what changed',
      body: '<p>A word-level comparison: struck through in red was removed, green was added. One word changed the outcome of the dispute.</p>' },
    { route: '#/precedent/j4', target: '[data-tour="passage"]', title: 'Precedent · Phase 2, planned',
      body: '<p>Judgments linked to the sections they interpret, with the relevant passage highlighted and whether each is still good law.</p>' },
    { route: '#/matters/m1', before: () => { state.matterTab = 'chronology'; rerender(); }, target: '[data-tour="tabs"]', title: 'Matters · Phase 3, planned',
      body: '<p>Each matter keeps its documents, a fact chronology, the research already done and its drafts. Legal events are dated against the corpus.</p>' },
    { route: '#/draft', before: () => { state.draft.tpl = 'notice'; state.draft.paras = null; state.draft.date = TODAY; rerender(); }, target: '.cm-bad', title: 'Drafting with live checks · Phase 3',
      body: '<p>Every citation in a draft is checked against the dated corpus: green in force, amber to check, red repealed.</p><p>This one was repealed in 2018. Drafting is only safe once Phase 1 exists.</p>' },
    { route: '#/calendar', before: () => { state.lim.type = 'rc'; state.lim.date = '2025-11-20'; state.lim.result = computeLimitation('rc', '2025-11-20'); rerender(); }, target: '[data-tour="limit"]', title: 'Limitation · Phase 3, planned',
      body: '<p>Enter a cause-of-action date and claim type. Dhara returns the period, the expiry date and the governing section, with its confidence.</p>' },
    { route: '#/analytics', target: '[data-tour="analytics"]', title: 'Institutional tools · Phase 4, mockup',
      body: '<p>Court analytics and bench tools for judges: pendency, case age, matters suitable for mediation. Shown as static mockups only.</p>' },
    { route: '#/public', before: () => { const e = CZ_EX[0]; Object.assign(state.cz, { q: e.q, date: e.date }); rerender(); czAsk(); }, target: '#cz-answer', title: 'Free public search in Bangla · Phase 1, funded',
      body: '<p>A separate, plain-language product for citizens: what the law says, where to go, by when, and what papers to bring. No jargon. Free permanently.</p>' },
    { route: '#/', role: 'advocate', p1: false, target: '#p1-toggle', title: 'That is the whole platform',
      body: '<p>Twelve modules, four phases, the whole legal sector.</p><p>Now the question for this committee: <strong>which part does this grant pay for?</strong> Press Next to switch on “Show Phase 1 only”.</p>' },
    { p1: true, target: sidebarOr('#scopebar'), title: 'This is what the grant funds',
      body: '<p>Everything dimmed is planned, not in this phase.</p><p>What stays lit is Phase 1: research, the provision browser and free public search, built on the full Bangladesh Code with dates on every version.</p>' },
    { route: '#/research', p1: true, before: () => runExample(1), target: null, title: 'Phase 1: the foundation everything else needs',
      body: '<ul class="tour-list"><li>The full Bangladesh Code at provision level, in Bangla and English</li><li>Dates on every version, with the footnote each came from</li><li>Cited research that refuses rather than guesses</li><li>Free Bangla public search, an open corpus and a public API</li><li>Handed over to the ICT Division</li></ul><p><strong>BDT 4,85,000 · six months.</strong></p><p>Drafting from superseded law is worse than not drafting at all. That is why this layer comes first.</p>' }
  ];

  function tourStart() {
    tour.active = true; tour.returnFocus = document.activeElement;
    document.body.classList.add('touring');
    $('#tour-block').hidden = false; $('#tour-card').hidden = false;
    setP1(false);
    tourShow(0);
  }
  function tourEnd() {
    tour.active = false;
    document.body.classList.remove('touring');
    ['#tour-block', '#tour-spot', '#tour-card'].forEach((s) => { $(s).hidden = true; });
    $('#tour-block').classList.remove('dim');
    $('#tour-btn').focus();
  }
  async function tourShow(i) {
    if (i < 0 || i >= STEPS.length) return;
    tour.i = i; tour.busy = true;
    const st = STEPS[i];
    const card = $('#tour-card');
    card.classList.add('loading');
    $('#tour-step').textContent = `Step ${i + 1} of ${STEPS.length}`;
    $('#tour-back').disabled = i === 0;
    $('#tour-next').textContent = i === STEPS.length - 1 ? 'Finish' : 'Next';
    $('#tour-title').textContent = st.title;
    $('#tour-body').innerHTML = st.body;
    if (st.p1 !== undefined) { if (state.p1Only !== st.p1) setP1(st.p1); } else if (state.p1Only) setP1(false);
    const roleChanged = st.role && state.role !== st.role;
    if (roleChanged) state.role = st.role;
    if (st.route && location.hash !== st.route) go(st.route);
    else if (roleChanged) rerender();
    if (st.before) await st.before();
    if (tour.i !== i || !tour.active) return;
    const el = typeof st.target === 'function' ? st.target() : st.target ? $(st.target) : null;
    tour.el = el;
    if (el) tourScroll(el);
    await frame();
    tourPosition();
    card.classList.remove('loading');
    tour.busy = false;
    $('#tour-next').focus({ preventScroll: true });
  }
  /* Bring the target into view below the sticky header; tall targets align to the top. */
  function tourScroll(el) {
    if (el.closest('.sources, .toc, .sidebar, .app-header, .scopebar')) { el.scrollIntoView({ block: 'nearest', behavior: 'auto' }); return; }
    const r = el.getBoundingClientRect();
    const hdr = $('#app-header').offsetHeight, avail = window.innerHeight - hdr;
    const y = r.height > avail - 200 ? window.scrollY + r.top - hdr - 16 : window.scrollY + r.top - hdr - (avail - r.height) / 3;
    window.scrollTo(0, Math.max(0, y));
  }
  function tourPosition() {
    const el = tour.el, spot = $('#tour-spot'), card = $('#tour-card'), block = $('#tour-block');
    const vw = window.innerWidth, vh = window.innerHeight, P = 8, G = 16;
    const cw = Math.min(400, vw - 2 * G);
    card.style.width = cw + 'px';
    const ch = card.offsetHeight;
    if (!el) {
      spot.hidden = true; block.classList.remove('dim');
      card.style.left = (vw - cw - G) + 'px'; card.style.top = (vh - ch - G) + 'px';
      return;
    }
    block.classList.remove('dim');
    const r = el.getBoundingClientRect();
    const top = Math.max(r.top - P, 4), left = Math.max(r.left - P, 4);
    const bottom = Math.min(r.bottom + P, vh - 4), right = Math.min(r.right + P, vw - 4);
    spot.hidden = false;
    Object.assign(spot.style, { top: top + 'px', left: left + 'px', width: Math.max(0, right - left) + 'px', height: Math.max(0, bottom - top) + 'px' });
    let ct, cl = Math.max(G, Math.min(left, vw - cw - G));
    if (vw < 640) { ct = vh - ch - G; cl = G; }
    else if (bottom + G + ch < vh) ct = bottom + G;
    else if (top - G - ch > 0) ct = top - G - ch;
    else if (right + G + cw < vw) { ct = Math.max(G, Math.min(top, vh - ch - G)); cl = right + G; }
    else if (left - G - cw > 0) { ct = Math.max(G, Math.min(top, vh - ch - G)); cl = left - G - cw; }
    else { ct = vh - ch - G; cl = vw - cw - G; }
    card.style.left = cl + 'px'; card.style.top = ct + 'px';
  }
  function tourNext() { if (tour.i >= STEPS.length - 1) tourEnd(); else tourShow(tour.i + 1); }
  function tourBack() { if (tour.i > 0) tourShow(tour.i - 1); }
  function tourKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); tourEnd(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); tourNext(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); tourBack(); return; }
    if (e.key === 'Tab') {
      const f = $$('#tour-card button:not([disabled])');
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  $('#tour-next').addEventListener('click', tourNext);
  $('#tour-back').addEventListener('click', tourBack);
  $('#tour-exit').addEventListener('click', tourEnd);
  window.addEventListener('scroll', () => { if (tour.active && !tour.busy) tourPosition(); }, { passive: true });

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  measureHeader();
  if (!location.hash) history.replaceState(null, '', '#/');
  render(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHeader);
})();
