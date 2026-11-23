'use strict';
/* 🔍 מצאי את ההבדלים – שתי תמונות, 3-5 הבדלים גדולים, רמז אם נתקעים */
const DIFF = (() => {
  // [אימוג׳י, x%, y%, גודל]
  const SCENES = [
    { n: 'בחווה', bg: 'linear-gradient(#bfe9ff 0 55%,#9be15d 55%)', items: [['☀️', 86, 14, 11], ['☁️', 22, 13, 10], ['🏠', 16, 46, 18], ['🌳', 42, 40, 15], ['🐄', 64, 62, 14], ['🐔', 86, 74, 9], ['🐷', 30, 76, 11], ['🌻', 90, 47, 9], ['🐑', 52, 84, 9], ['🐤', 10, 82, 7]] },
    { n: 'בים', bg: 'linear-gradient(#7fd8ff,#2f8fd8 70%,#f7deae 70%)', items: [['🐳', 26, 26, 18], ['🐠', 72, 20, 10], ['🐙', 52, 52, 13], ['🦀', 20, 82, 10], ['🐚', 82, 84, 8], ['⭐', 58, 86, 8], ['🐡', 86, 48, 9], ['🫧', 10, 50, 7], ['🐟', 40, 30, 8]] },
    { n: 'בחלל', bg: 'radial-gradient(circle at 70% 30%,#4b3a8f,#1b1446)', items: [['🚀', 24, 50, 18], ['🪐', 74, 26, 16], ['🌙', 14, 14, 10], ['⭐', 46, 14, 7], ['👽', 70, 70, 12], ['🛸', 46, 78, 11], ['☄️', 90, 60, 9], ['🌍', 90, 14, 9], ['✨', 52, 46, 7]] },
    { n: 'בפארק', bg: 'linear-gradient(#cdefff 0 50%,#8fdb7e 50%)', items: [['🎈', 14, 22, 11], ['🌳', 80, 34, 17], ['🐶', 34, 68, 12], ['⚽', 56, 80, 9], ['🌷', 90, 80, 8], ['🦋', 44, 26, 8], ['🪁', 64, 14, 10], ['🚲', 66, 60, 12], ['🐦', 26, 40, 7], ['🌼', 12, 84, 7]] },
    { n: 'במסיבה', bg: 'linear-gradient(#ffe3f1,#ffd1e8)', items: [['🎂', 50, 58, 18], ['🎁', 18, 72, 12], ['🎈', 16, 22, 12], ['🎈', 84, 24, 12], ['🍰', 82, 74, 10], ['🥤', 32, 52, 8], ['🧁', 68, 46, 8], ['🎉', 50, 16, 11], ['🍭', 92, 52, 8]] },
    { n: 'ביער', bg: 'linear-gradient(#2b3a67 0 45%,#3f7d4e 45%)', items: [['🦉', 22, 26, 13], ['🌙', 80, 14, 11], ['🍄', 30, 78, 10], ['🦔', 58, 80, 10], ['🦊', 76, 60, 13], ['🌲', 48, 40, 16], ['⭐', 56, 10, 7], ['🐇', 12, 62, 10], ['🌲', 92, 40, 12]] }
  ];
  const COUNTS = [3, 3, 3, 4, 4, 5];
  const NUM = { 1: 'אחד', 2: 'שניים', 3: 'שלושה', 4: 'ארבעה', 5: 'חמישה' };
  const lines = () => [
    'מצאי את ההבדלים בין שתי התמונות!', 'יש שלושה הבדלים', 'יש ארבעה הבדלים', 'יש חמישה הבדלים',
    ...SCENES.map(s => `בואי נחפש הבדלים ${s.n}`), ...[1, 2, 3, 4].map(n => `עוד ${NUM[n]}!`),
    'מצאת את כל ההבדלים!', 'פה זה אותו דבר, נסי במקום אחר', 'רמז! תסתכלי על מה שמנצנץ', 'את בלשית אמיתית!', 'מצאת הבדל!'
  ];
  return { SCENES, COUNTS, NUM, lines };
})();

registerGame({
  id: 'diff', name: 'מצאי את ההבדלים', emoji: '🔍', color: '#ef476f', say: 'מצאי את ההבדלים בין שתי התמונות!',
  lines: DIFF.lines,
  mount(root, s) {
    const { SCENES, COUNTS, NUM } = DIFF;
    const SWAP = ['🍎', '🌸', '🐞', '🍓', '💎', '🐥', '🌈', '🍩'];
    let round = 0;
    root.innerHTML = `<div class="df"><div class="df-top"><div class="sh-dots">${SCENES.map(() => '<i></i>').join('')}</div><div class="df-found"></div></div>
      <div class="df-panels"><div class="df-p a"></div><div class="df-p b"></div></div></div>`;
    const wrap = $('.df', root), pa = $('.df-p.a', root), pb = $('.df-p.b', root), foundEl = $('.df-found', root);

    function layout() {
      const box = $('.df-panels', root).getBoundingClientRect(), land = box.width > box.height * 1.1;
      wrap.classList.toggle('land', land);
      const w = land ? Math.min((box.width - 30) / 2, (box.height - 16) * 4 / 3) : Math.min(box.width - 20, (box.height - 30) / 2 * 4 / 3);
      [pa, pb].forEach(p => { p.style.width = w + 'px'; p.style.height = w * .75 + 'px'; p.style.setProperty('--u', w / 100 + 'px'); });
    }
    layout(); s.on(window, 'resize', layout);

    let diffs = [], left = 0, idleT = 0, lastWrong = 0, busy = false;
    function start() {
      const sc = SCENES[round], n = COUNTS[round];
      const chosen = shuffle(sc.items.map((_, i) => i)).slice(0, n);
      const kinds = ['gone', 'swap', 'big', 'color'];
      diffs = chosen.map((i, k) => ({ i, kind: kinds[(k + round) % 4], found: false, x: sc.items[i][1], y: sc.items[i][2] }));
      left = n;
      const html = (side) => sc.items.map(([e, x, y, z], i) => {
        const d = side === 'b' && diffs.find(q => q.i === i);
        if (d && d.kind === 'gone') return '';
        let em = e, st = '';
        if (d && d.kind === 'swap') em = SWAP.find(q => q !== e && !sc.items.some(it => it[0] === q)) || '🍎';
        if (d && d.kind === 'big') st = 'transform:translate(-50%,-50%) scale(1.6);';
        if (d && d.kind === 'color') st = 'filter:hue-rotate(160deg) saturate(1.6);';
        return `<span class="it" style="left:${x}%;top:${y}%;font-size:calc(var(--u)*${z});${st}">${em}</span>`;
      }).join('');
      [pa, pb].forEach(p => { p.style.background = sc.bg; });
      pa.innerHTML = html('a'); pb.innerHTML = html('b');
      [pa, pb].forEach(p => { p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce'); });
      paintFound();
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say([`בואי נחפש הבדלים ${sc.n}`, `יש ${NUM[n]} הבדלים`]);
      busy = false; resetIdle();
    }
    const paintFound = () => { foundEl.innerHTML = diffs.map(d => `<i class="${d.found ? 'on' : ''}">🔍</i>`).join(''); };

    function resetIdle() {
      clearTimeout(idleT);
      idleT = s.later(() => {
        const d = diffs.find(q => !q.found); if (!d) return;
        Voice.say('רמז! תסתכלי על מה שמנצנץ');
        [pa, pb].forEach(p => { const h = el('i', 'df-hint'); h.style.left = d.x + '%'; h.style.top = d.y + '%'; p.appendChild(h); s.later(() => h.remove(), 4000); });
        resetIdle();
      }, 14000);
    }

    function tap(e, panel) {
      if (busy) return;
      Sound.init();
      const r = panel.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
      const d = diffs.filter(q => !q.found).map(q => ({ q, dd: Math.hypot(q.x - x, (q.y - y) * .75) })).sort((a, b) => a.dd - b.dd)[0];
      if (d && d.dd < 11) {
        const q = d.q; q.found = true; left--;
        [pa, pb].forEach(p => { $$('.df-hint', p).forEach(h => h.remove()); const c = el('i', 'df-circle'); c.style.left = q.x + '%'; c.style.top = q.y + '%'; p.appendChild(c); });
        Sound.ding(5 - left); paintFound(); resetIdle();
        const pr = left ? [`עוד ${NUM[left]}!`] : null;
        if (left) praise(e.clientX, e.clientY, pr);
        else {
          busy = true; clearTimeout(idleT);
          FX.burst(e.clientX, e.clientY, ['⭐', '✨', '💖'], 12, 36); Sound.chime(); Voice.say('מצאת את כל ההבדלים!');
          const c = center(pb); Stars.add(c.x, c.y, 1); FX.confetti(c.x, c.y, 50);
          s.later(() => {
            round++;
            if (round < SCENES.length) start();
            else celebrate({ emoji: '🕵️‍♀️', title: 'את בלשית אמיתית!', stars: 3, again: () => { round = 0; start(); } });
          }, 2600);
        }
      } else {
        Sound.boing(); panel.classList.remove('shake'); void panel.offsetWidth; panel.classList.add('shake');
        if (Date.now() - lastWrong > 5000) { lastWrong = Date.now(); Voice.say('פה זה אותו דבר, נסי במקום אחר'); }
      }
    }
    pa.addEventListener('pointerdown', e => tap(e, pa));
    pb.addEventListener('pointerdown', e => tap(e, pb));
    start();
  }
});
