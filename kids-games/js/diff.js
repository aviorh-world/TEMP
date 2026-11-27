'use strict';
/* 🔍 מצאי את ההבדלים – שני ציורים צבעוניים (מדפי הצביעה), 3-5 הבדלים: צבע שהשתנה או פרט שנעלם.
   רמז מנצנץ רק אחרי 35 שניות בלי הצלחה. */
const DIFF = (() => {
  const NUM = { 1: 'אחד', 2: 'שניים', 3: 'שלושה', 4: 'ארבעה', 5: 'חמישה' };
  const OF = { butterfly: 'של הפרפר', house: 'של הבית', fish: 'של הדג', flower: 'של הפרח', icecream: 'של הגלידה', car: 'של המכונית', cat: 'של החתול', rainbow: 'של הקשת' };
  const lines = () => ['מצאי את ההבדלים בין שתי התמונות!', 'יש שלושה הבדלים', 'יש ארבעה הבדלים', 'יש חמישה הבדלים',
    ...[1, 2, 3, 4].map(n => `עוד ${NUM[n]}!`),
    'מצאת את כל ההבדלים!', 'פה זה אותו דבר, נסי במקום אחר', 'רמז! תסתכלי על מה שמנצנץ', 'את בלשית אמיתית!'];
  return { NUM, OF, lines };
})();

registerGame({
  id: 'diff', name: 'מצאי את ההבדלים', emoji: '🔍', color: '#ef476f', say: 'מצאי את ההבדלים בין שתי התמונות!',
  lines: DIFF.lines,
  mount(root, s) {
    const { NUM, OF } = DIFF;
    const PAGES = shuffle(COLORING.PAGES).slice(0, 6), COUNTS = [3, 3, 4, 4, 5, 5];
    const COLS = PALETTE.map(p => p[1]).filter(c => c !== '#3b2f4a');
    let round = 0;
    root.innerHTML = `<div class="df"><div class="df-top"><div class="sh-dots">${PAGES.map(() => '<i></i>').join('')}</div><div class="df-found"></div></div>
      <div class="df-panels"><div class="df-p a"></div><div class="df-p b"></div></div></div>`;
    const wrap = $('.df', root), pa = $('.df-p.a', root), pb = $('.df-p.b', root), foundEl = $('.df-found', root);

    function layout() {
      const box = $('.df-panels', root).getBoundingClientRect(), land = box.width > box.height * 1.1;
      wrap.classList.toggle('land', land);
      const w = land ? Math.min((box.width - 30) / 2, box.height - 16) : Math.min(box.width - 20, (box.height - 30) / 2);
      [pa, pb].forEach(p => { p.style.width = w + 'px'; p.style.height = w + 'px'; });
    }
    layout(); s.on(window, 'resize', layout);

    let diffs = [], left = 0, idleT = 0, lastWrong = 0, busy = false;
    function svgOf(pg, fills, hidden) {
      let i = 0;
      const body = pg.svg.replace(/class="r"/g, () => { const k = i++; return `class="r" data-i="${k}" fill="${fills[k]}"${hidden.has(k) ? ' style="visibility:hidden"' : ''}`; });
      return `<svg class="cp df-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#fffaf2"/>${body}</svg>`;
    }

    function start() {
      busy = true;
      const pg = PAGES[round], n = COUNTS[round];
      const nReg = (pg.svg.match(/class="r"/g) || []).length;
      const fills = Array.from({ length: nReg }, (_, k) => COLS[(k * 5 + round * 3) % COLS.length]);
      pa.innerHTML = svgOf(pg, fills, new Set());
      // בוחרים אזורים בגודל סביר (לא רקע ענק ולא נקודה זעירה) ומשנים אותם בתמונה השנייה
      // מיקום כל אזור במסך (כולל הזזות transform), מתורגם לקואורדינטות 0-400 של הציור
      const sr = $('svg', pa).getBoundingClientRect(), sc = 400 / sr.width;
      const regs = $$('.r', pa).map((r, k) => { const q = r.getBoundingClientRect(); const b = { x: (q.left - sr.left) * sc, y: (q.top - sr.top) * sc, width: q.width * sc, height: q.height * sc }; return { k, b, area: b.width * b.height }; });
      const cand = shuffle(regs.filter(r => r.area > 500 && r.area < 40000));
      const chosen = [];
      for (const r of cand) { if (chosen.length >= n) break; const cx = r.b.x + r.b.width / 2, cy = r.b.y + r.b.height / 2; if (chosen.every(q => Math.hypot(q.x - cx, q.y - cy) > 60)) chosen.push({ k: r.k, x: cx, y: cy, rad: Math.max(34, Math.sqrt(r.area) / 2 + 14), area: r.area }); }
      const fillsB = fills.slice(), hidden = new Set();
      chosen.forEach((d, j) => {
        if (j % 2 === 1 && d.area < 12000) { hidden.add(d.k); d.kind = 'gone'; }
        else { const cur = fills[d.k]; fillsB[d.k] = COLS.find((c, q) => c !== cur && q === (COLS.indexOf(cur) + 4) % COLS.length) || '#fff'; d.kind = 'color'; }
      });
      pb.innerHTML = svgOf(pg, fillsB, hidden);
      diffs = chosen.map(d => Object.assign(d, { found: false })); left = diffs.length;
      [pa, pb].forEach(p => { p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce'); });
      paintFound();
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say(['מצאי את ההבדלים בין שתי התמונות!', `יש ${NUM[left]} הבדלים`]);
      s.later(() => busy = false, 500); resetIdle();
    }
    const paintFound = () => { foundEl.innerHTML = diffs.map(d => `<i class="${d.found ? 'on' : ''}">🔍</i>`).join(''); };

    function mark(cls, d, ms) {
      [pa, pb].forEach(p => { const c = el('i', cls); c.style.left = d.x / 4 + '%'; c.style.top = d.y / 4 + '%'; c.style.width = c.style.height = d.rad * 2 / 4 + '%'; p.appendChild(c); if (ms) s.later(() => c.remove(), ms); });
    }
    function resetIdle() {
      clearTimeout(idleT);
      idleT = s.later(() => { const d = diffs.find(q => !q.found); if (!d) return; Voice.say('רמז! תסתכלי על מה שמנצנץ'); mark('df-hint', d, 4000); resetIdle(); }, 35000);
    }
    function tap(e, panel) {
      if (busy) return; Sound.init();
      const r = $('svg', panel).getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 400, y = (e.clientY - r.top) / r.height * 400;
      const d = diffs.filter(q => !q.found).map(q => ({ q, dd: Math.hypot(q.x - x, q.y - y) - q.rad })).sort((a, b) => a.dd - b.dd)[0];
      if (d && d.dd < 12) {
        const q = d.q; q.found = true; left--;
        [pa, pb].forEach(p => $$('.df-hint', p).forEach(h => h.remove())); mark('df-circle', q);
        Sound.ding(5 - left); paintFound(); resetIdle();
        if (left) praise(e.clientX, e.clientY, [`עוד ${NUM[left]}!`]);
        else {
          busy = true; clearTimeout(idleT);
          FX.burst(e.clientX, e.clientY, ['⭐', '✨', '💖'], 12, 36); Sound.chime(); Voice.say('מצאת את כל ההבדלים!');
          const c = center(pb); Stars.add(c.x, c.y, 1); FX.confetti(c.x, c.y, 50);
          s.later(() => { round++; if (round < PAGES.length) start(); else celebrate({ emoji: '🕵️‍♀️', title: 'את בלשית אמיתית!', stars: 3, again: () => { round = 0; start(); } }); }, 2600);
        }
      } else {
        Sound.boing(); panel.classList.remove('shake'); void panel.offsetWidth; panel.classList.add('shake');
        if (Date.now() - lastWrong > 6000) { lastWrong = Date.now(); Voice.say('פה זה אותו דבר, נסי במקום אחר'); }
      }
    }
    pa.addEventListener('pointerdown', e => tap(e, pa));
    pb.addEventListener('pointerdown', e => tap(e, pb));
    wrap._dbg = () => ({ diffs: diffs.map(d => ({ x: d.x, y: d.y, found: d.found, kind: d.kind })) });  // לבדיקות אוטומטיות
    start();
  }
});
