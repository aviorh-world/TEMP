'use strict';
/* 🧩 פאזל – 4, 9 או 16 חלקים. תמונות: דפי הצביעה (בצבעים שהיא צבעה) ותמונות מוכנות */
const PUZZLE = {
  lines: ['פאזל! כמה חלקים?', 'בחרי תמונה', 'גררי כל חלק למקום שלו', 'מתאים!', 'כמעט! נסי מקום אחר', 'עוד חלק אחד!', 'הפאזל מוכן!', 'איזה יופי של פאזל!']
};

registerGame({
  id: 'puzzle', name: 'פאזל', emoji: '🧩', color: '#43aa8b', say: 'פאזל! כמה חלקים?',
  lines: PUZZLE.lines,
  mount(root, s) {
    // תמונות מוכנות: סצנות של אימוג׳ים על רקע צבעוני
    const SCENES = [
      { n: 'חווה', bg: ['#bfe9ff', '#9be15d', .56], items: [['☀️', 82, 16, 15], ['☁️', 26, 14, 13], ['🏠', 22, 52, 24], ['🌳', 52, 46, 20], ['🐄', 72, 72, 20], ['🐔', 34, 82, 13], ['🌻', 90, 52, 13]] },
      { n: 'ים', bg: ['#7fd8ff', '#f7deae', .78], items: [['🐳', 30, 30, 26], ['🐠', 76, 22, 14], ['🐙', 62, 56, 18], ['🦀', 22, 86, 14], ['🐚', 80, 88, 11], ['🐟', 40, 60, 12]] },
      { n: 'חלל', bg: ['#2b1f6b', '#1b1446', 1], items: [['🚀', 30, 56, 26], ['🪐', 72, 28, 22], ['🌙', 18, 16, 14], ['⭐', 50, 14, 10], ['👽', 74, 74, 18], ['✨', 52, 44, 10]] },
      { n: 'יום הולדת', bg: ['#ffe3f1', '#ffc8e1', 1], items: [['🎂', 50, 62, 28], ['🎈', 18, 24, 18], ['🎈', 82, 26, 18], ['🎁', 20, 78, 16], ['🎉', 50, 18, 16], ['🧁', 80, 78, 14]] }
    ];
    const pics = () => {
      const saved = Store.get('coloring', {});
      const pages = COLORING.PAGES.map(p => ({ kind: 'page', p, fills: saved[p.id], name: p.name, mine: (saved[p.id] || []).some(f => f && f !== '#ffffff') }));
      // ציורים שהיא צבעה קודם
      return pages.filter(x => x.mine).concat(SCENES.map(sc => ({ kind: 'scene', sc, name: sc.n })), pages.filter(x => !x.mine));
    };

    // ציור התמונה על קנבס ריבועי
    function render(pic, size) {
      const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
      if (pic.kind === 'scene') {
        const [a, b, split] = pic.sc.bg;
        x.fillStyle = a; x.fillRect(0, 0, size, size * split); x.fillStyle = b; x.fillRect(0, size * split, size, size);
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#000';
        pic.sc.items.forEach(([e, px, py, z]) => { x.font = `${size * z / 100}px serif`; x.fillText(e, size * px / 100, size * py / 100); });
        return Promise.resolve(c);
      }
      // דף צביעה: האזורים שלא נצבעו מקבלים צבעים שמחים
      let i = 0; const P = PALETTE.map(q => q[1]).slice(0, 11);
      const body = pic.p.svg.replace(/class="r"/g, () => { const f = (pic.fills || [])[i]; const col = f && f !== '#ffffff' ? f : P[(i * 7 + 3) % P.length]; i++; return `class="r" fill="${col}"`; });
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}"><style>.r,.ln{stroke:#3b2f4a;stroke-width:5;stroke-linejoin:round;stroke-linecap:round}.ln,.ln path{fill:none}.fix{fill:#3b2f4a}</style><rect width="400" height="400" fill="#fff8ee"/>${body}</svg>`;
      return new Promise(res => {
        const img = new Image();
        img.onload = () => { x.drawImage(img, 0, 0, size, size); res(c); };
        img.onerror = () => res(c);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
    }

    let N = 3;
    function chooseSize() {
      root.innerHTML = `<div class="picker"><h3>🧩 כמה חלקים?</h3><div class="opts">
        ${[[2, '4', '#06d6a0'], [3, '9', '#ffd166'], [4, '16', '#ef476f']].map(([n, t, c], i) => `<button class="opt" data-n="${n}" style="--c:${c};--i:${i}"><span class="oe pz-grid g${n}">${'<i></i>'.repeat(n * n)}</span>${t}</button>`).join('')}</div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); N = +b.dataset.n; choosePic(); });
      Voice.say('פאזל! כמה חלקים?');
    }
    async function choosePic() {
      root.innerHTML = `<div class="picker lt-words"><h3>🖼️ בחרי תמונה</h3><div class="lt-wgrid pz-pics"></div></div>`;
      const grid = $('.pz-pics', root);
      const list = pics();
      for (const [i, pic] of list.entries()) {
        const b = el('button', 'lt-wc'); b.style.setProperty('--i', i);
        const c = await render(pic, 160); c.className = 'pz-thumb'; b.appendChild(c);
        b.appendChild(el('span', 'ww', pic.name + (pic.mine ? ' ✨' : '')));
        b.onclick = () => { Sound.pop(); play(pic); };
        if (!s.alive) return; grid.appendChild(b);
      }
      Voice.say('בחרי תמונה');
    }

    async function play(pic) {
      root.innerHTML = `<div class="pzl"><div class="pz-board"><canvas class="pz-ghost"></canvas><div class="pz-cells"></div></div><div class="pz-tray"></div></div>`;
      const wrap = $('.pzl', root), board = $('.pz-board', root), tray = $('.pz-tray', root), cells = $('.pz-cells', root), ghost = $('.pz-ghost', root);
      const land = wrap.clientWidth > wrap.clientHeight;
      wrap.classList.toggle('land', land);
      const avail = land ? Math.min(wrap.clientHeight - 24, wrap.clientWidth * .55) : Math.min(wrap.clientWidth - 24, wrap.clientHeight * .58);
      const S = Math.floor(avail / N) * N, cs = S / N;
      board.style.width = board.style.height = S + 'px';
      const full = await render(pic, Math.max(600, S * 2));
      if (!s.alive) return;
      ghost.width = ghost.height = S; ghost.getContext('2d').drawImage(full, 0, 0, S, S);
      ghost.style.opacity = { 2: .35, 3: .25, 4: .18 }[N];
      cells.style.gridTemplateColumns = `repeat(${N},1fr)`;
      cells.innerHTML = Array.from({ length: N * N }, (_, i) => `<i data-i="${i}"></i>`).join('');
      let left = N * N;
      const order = shuffle(Array.from({ length: N * N }, (_, i) => i));
      // גודל החלקים מחושב לפי המקום במגש, כך שכולם נכנסים בלי לגלוש מעל הלוח
      const tr = tray.getBoundingClientRect(), GAP = 10;
      let ts = Math.min(cs, land ? 120 : 100);
      while (ts > 28) { const per = Math.max(1, Math.floor((tr.width - 12 + GAP) / (ts + GAP))); if (Math.ceil(N * N / per) * (ts + GAP) <= tr.height - 12) break; ts -= 2; }
      order.forEach((k, j) => {
        const pc = document.createElement('canvas'), q = full.width / N;
        pc.width = pc.height = cs * 2; pc.getContext('2d').drawImage(full, (k % N) * q, Math.floor(k / N) * q, q, q, 0, 0, cs * 2, cs * 2);
        const piece = el('div', 'pz-piece'); piece.appendChild(pc); piece.dataset.k = k;  // data-k לבדיקות אוטומטיות
        piece.style.width = piece.style.height = ts + 'px'; piece.style.setProperty('--r', randi(-12, 12) + 'deg'); piece.style.setProperty('--i', j);
        tray.appendChild(piece);
        draggable(piece, {
          onDrop: (x, y) => {
            const r = board.getBoundingClientRect();
            const cx = r.left + ((k % N) + .5) * cs, cy = r.top + (Math.floor(k / N) + .5) * cs;
            if (Math.hypot(x - cx, y - cy) > cs * .55) {
              if (hit(board, x, y, 0)) { Sound.wrong(); if (Math.random() < .5) Voice.say('כמעט! נסי מקום אחר'); }
              return false;
            }
            // נכנס למקום
            piece.remove();
            const cell = $(`i[data-i="${k}"]`, cells); const done = document.createElement('canvas'); done.width = done.height = cs * 2;
            done.getContext('2d').drawImage(pc, 0, 0); cell.appendChild(done); cell.classList.add('ok');
            left--; Sound.ding(N * N - left);
            FX.burst(cx, cy, ['✨', '⭐'], 6, 26);
            if (left === 1) Voice.say('עוד חלק אחד!');
            else if (left > 0 && (N * N - left) % 3 === 0) praise(cx, cy - 30);
            else if (left > 0) Voice.say('מתאים!');
            if (left === 0) {
              board.classList.add('done'); Sound.tada();
              const c = center(board); FX.confetti(c.x, c.y, 70); Voice.say(['הפאזל מוכן!', pick(PRAISE)]);
              s.later(() => celebrate({ emoji: '🧩', title: 'איזה יופי של פאזל!', stars: N, again: chooseSize }), 2200);
            }
            return true;
          }
        });
      });
      Voice.say('גררי כל חלק למקום שלו');
    }
    chooseSize();
  }
});
