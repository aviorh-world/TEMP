'use strict';
/* 🌀 מבוך – 3 שלבים. גוררים את העכבר עם האצבע (או חצים) עד הגבינה */
const MAZE = (() => {
  const LEVELS = [{ n: 5, name: 'שלב ראשון', e: '⭐' }, { n: 7, name: 'שלב שני', e: '⭐⭐' }, { n: 9, name: 'שלב שלישי', e: '⭐⭐⭐' }];
  const HEROES = [['🐭', '🧀', 'עזרי לעכבר להגיע לגבינה!'], ['🐰', '🥕', 'עזרי לארנב להגיע לגזר!'], ['🐶', '🦴', 'עזרי לכלב להגיע לעצם!']];
  const lines = () => ['מבוך! בחרי שלב', ...LEVELS.map(l => l.name), ...HEROES.map(h => h[2]), 'כמעט הגעת!', 'הגעת! מצאת את הדרך!', 'חצי דרך! ממשיכים',
    'גררי עם האצבע על השביל', 'עברת לשלב הבא!', 'סיימת את כל המבוכים!'];
  return { LEVELS, HEROES, lines };
})();

registerGame({
  id: 'maze', name: 'מבוך', emoji: '🌀', color: '#118ab2', say: 'מבוך! בחרי שלב',
  lines: MAZE.lines,
  mount(root, s) {
    const { LEVELS, HEROES } = MAZE;

    function chooser() {
      root.innerHTML = `<div class="picker"><h3>🌀 מבוך – בחרי שלב</h3><div class="opts">
        ${LEVELS.map((l, i) => `<button class="opt" data-i="${i}" style="--c:${['#06d6a0', '#ffd166', '#ef476f'][i]};--i:${i}"><span class="oe">${['🐭', '🐰', '🐶'][i]}</span>${l.name}<small>${l.e}${Store.get('mazeDone', 0) > i ? ' ✔️' : ''}</small></button>`).join('')}</div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); play(+b.dataset.i); });
      Voice.say('מבוך! בחרי שלב');
    }

    // יצירת מבוך אקראי (מעבר עומק) – לכל תא 4 קירות
    function gen(n) {
      const W = Array.from({ length: n * n }, () => [1, 1, 1, 1]); // למעלה, ימין, למטה, שמאל
      const seen = new Set([0]), st = [0], D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      while (st.length) {
        const c = st[st.length - 1], x = c % n, y = (c / n) | 0;
        const nb = D.map(([dx, dy], d) => [x + dx, y + dy, d]).filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !seen.has(b * n + a));
        if (!nb.length) { st.pop(); continue; }
        const [a, b, d] = pick(nb), k = b * n + a;
        W[c][d] = 0; W[k][(d + 2) % 4] = 0; seen.add(k); st.push(k);
      }
      return W;
    }

    function play(lv) {
      const { n, name } = LEVELS[lv], [hero, goalE, intro] = HEROES[lv];
      const walls = gen(n), goal = n * n - 1;
      let pos = 0, busy = false, saidHalf = false, saidNear = false, visited = new Set([0]);
      // מרחק מכל תא ליעד (לעידוד "כמעט הגעת")
      const distTo = (() => { const d = Array(n * n).fill(1e9), q = [goal]; d[goal] = 0; while (q.length) { const c = q.shift(); nbrs(c).forEach(k => { if (d[k] > d[c] + 1) { d[k] = d[c] + 1; q.push(k); } }); } return d; })();
      function nbrs(c) { const x = c % n, y = (c / n) | 0, out = []; if (!walls[c][0]) out.push(c - n); if (!walls[c][1]) out.push(c + 1); if (!walls[c][2]) out.push(c + n); if (!walls[c][3]) out.push(c - 1); return out; }
      const total = distTo[0];

      root.innerHTML = `<div class="mz"><div class="mz-top"><span class="lvl">${name}</span><span class="mz-goal">${hero} ➜ ${goalE}</span></div>
        <div class="mz-board"><svg class="mz-svg"></svg><div class="mz-hero">${hero}</div></div>
        <div class="mz-pad"><button data-d="0">⬆️</button><div><button data-d="3">⬅️</button><button data-d="2">⬇️</button><button data-d="1">➡️</button></div></div></div>`;
      const board = $('.mz-board', root), svg = $('.mz-svg', root), heroEl = $('.mz-hero', root);
      let S = 0, cell = 0;
      function draw() {
        const r = board.getBoundingClientRect(); S = Math.floor(Math.min(r.width, r.height) - 8); cell = S / n;
        svg.setAttribute('viewBox', `0 0 ${n} ${n}`); svg.style.width = svg.style.height = S + 'px';
        let p = '';
        walls.forEach((w, c) => { const x = c % n, y = (c / n) | 0;
          if (w[0]) p += `M${x},${y}h1`; if (w[3]) p += `M${x},${y}v1`;
          if (y === n - 1 && w[2]) p += `M${x},${y + 1}h1`; if (x === n - 1 && w[1]) p += `M${x + 1},${y}v1`; });
        svg.innerHTML = `<rect width="${n}" height="${n}" fill="#fffdf5" rx=".2"/>
          ${[...visited].map(c => `<circle cx="${c % n + .5}" cy="${((c / n) | 0) + .5}" r=".12" fill="#ffc8dd"/>`).join('')}
          <text x="${n - .5}" y="${n - .5}" font-size=".72" text-anchor="middle" dominant-baseline="central">${goalE}</text>
          <path d="${p}" stroke="#118ab2" stroke-width=".14" stroke-linecap="round" fill="none"/>`;
        heroEl.style.fontSize = cell * .72 + 'px';
        place();
      }
      function place() {
        const sr = svg.getBoundingClientRect(), br = board.getBoundingClientRect();
        heroEl.style.left = (sr.left - br.left + (pos % n + .5) * cell) + 'px';
        heroEl.style.top = (sr.top - br.top + (((pos / n) | 0) + .5) * cell) + 'px';
      }
      draw(); s.on(window, 'resize', draw);
      board._maze = () => ({ walls, n, pos });  // לבדיקות אוטומטיות

      function moveTo(k) {
        if (busy || k === pos) return;
        pos = k; visited.add(k); Sound.tone(600 + Math.random() * 200, .05, { type: 'triangle', vol: .08 });
        heroEl.classList.remove('hop'); void heroEl.offsetWidth; heroEl.classList.add('hop');
        draw();
        if (!saidHalf && distTo[pos] <= total / 2) { saidHalf = true; Voice.say('חצי דרך! ממשיכים'); }
        if (!saidNear && distTo[pos] <= 3 && pos !== goal) { saidNear = true; Voice.say('כמעט הגעת!'); }
        if (pos === goal) win();
      }
      function step(d) {
        if (busy) return; Sound.init();
        if (walls[pos][d]) { Sound.boing(); heroEl.classList.remove('shake'); void heroEl.offsetWidth; heroEl.classList.add('shake'); return; }
        moveTo(pos + [-n, 1, n, -1][d]);
      }
      // גרירה: הדמות הולכת לתא שמתחת לאצבע אם הוא שכן פתוח (או עד 2 צעדים בשביל)
      let dragging = false;
      const cellAt = e => { const r = svg.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / cell), y = Math.floor((e.clientY - r.top) / cell); return x >= 0 && y >= 0 && x < n && y < n ? y * n + x : -1; };
      function follow(e) {
        const k = cellAt(e); if (k < 0 || k === pos) return;
        if (nbrs(pos).includes(k)) return moveTo(k);
        const two = nbrs(pos).find(m => nbrs(m).includes(k)); if (two != null) { moveTo(two); moveTo(k); }
      }
      // החלקה (בלי לגרור בדיוק על השביל): הדמות נוסעת בכיוון ההחלקה עד פנייה או קיר
      let sw = null;
      function slide(d) {
        if (walls[pos][d]) { step(d); return; }
        let k = 0;
        const go = () => {
          if (busy || walls[pos][d] || k++ > n * n) return;
          moveTo(pos + [-n, 1, n, -1][d]);
          const open = [0, 1, 2, 3].filter(q => !walls[pos][q] && q !== (d + 2) % 4);
          if (open.length === 1 && open[0] === d) s.later(go, 110);
        };
        go();
      }
      board.addEventListener('pointerdown', e => { Sound.init(); dragging = true; sw = { x: e.clientX, y: e.clientY, p: pos }; try { board.setPointerCapture(e.pointerId); } catch (_) {} follow(e); });
      board.addEventListener('pointermove', e => { if (dragging) follow(e); });
      ['pointerup', 'pointercancel'].forEach(ev => board.addEventListener(ev, e => {
        dragging = false;
        if (sw && sw.p === pos) {
          const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) slide(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
        sw = null;
      }));
      $$('.mz-pad button', root).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); step(+b.dataset.d); }));
      s.on(window, 'keydown', e => { const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (d != null) step(d); });

      function win() {
        busy = true; Sound.tada();
        const c = center(heroEl); FX.confetti(c.x, c.y, 60); FX.burst(c.x, c.y, ['⭐', '💖', goalE], 12, 40);
        Voice.say(['הגעת! מצאת את הדרך!', pick(PRAISE)]); Stars.add(c.x, c.y, lv + 1);
        Store.set('mazeDone', Math.max(Store.get('mazeDone', 0), lv + 1));
        s.later(() => {
          if (lv < 2) celebrate({ emoji: goalE, title: 'עברת לשלב הבא!', stars: lv + 1, again: () => play(lv + 1) });
          else celebrate({ emoji: '🏆', title: 'סיימת את כל המבוכים!', stars: 3, again: chooser });
        }, 1800);
      }
      Voice.say([name, intro, 'גררי עם האצבע על השביל']);
    }
    chooser();
  }
});
