'use strict';
/* 🐍 הנחש הרעב – אוכלים 20 תפוחים והנחש גדל עד שמנצחים. לא מסוכן: יוצאים מהקיר ונכנסים מהצד השני,
   ומותר לעבור על עצמו. שליטה בהחלקה על המסך, בחצים או במקלדת. */
registerGame({
  id: 'snake', name: 'הנחש הרעב', emoji: '🐍', color: '#38b000', say: 'הנחש הרעב! תאכלי עשרים תפוחים כדי שהנחש יגדל',
  lines: ['הנחש הרעב! תאכלי עשרים תפוחים כדי שהנחש יגדל', 'החליקי לכיוון שאת רוצה', 'חמישה תפוחים!', 'עשרה תפוחים! חצי דרך', 'חמישה עשר תפוחים! עוד קצת', 'עוד תפוח אחד!',
    'הנחש גדול מספיק! ניצחת!', 'יאמי!', 'קראנץ׳!'],
  mount(root, s) {
    const GOAL = 20;
    root.innerHTML = `<div class="sn"><div class="sn-hud"><span>🍎 <b>0</b>/${GOAL}</span></div><canvas></canvas>
      <div class="mz-pad sn-pad"><button data-d="0">⬆️</button><div><button data-d="3">⬅️</button><button data-d="2">⬇️</button><button data-d="1">➡️</button></div></div></div>`;
    const wrap = $('.sn', root), cv = $('canvas', root), ctx = cv.getContext('2d'), cnt = $('.sn-hud b', root);
    let W, H, DPR, C, cols, rows, ox, oy;
    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      C = Math.floor(Math.min(W / 12, H / 12)); cols = Math.floor(W / C); rows = Math.floor(H / C); ox = (W - cols * C) / 2; oy = (H - rows * C) / 2;
    }
    resize(); s.on(window, 'resize', resize);

    const D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    let snake, dir, want, apple, eaten = 0, acc = 0, t = 0, done = false, chew = 0, parts = [];
    function reset() {
      const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
      snake = [[cx, cy], [cx - 1, cy], [cx - 2, cy]]; dir = 1; want = 1; eaten = 0; done = false; cnt.textContent = 0;
      placeApple();
    }
    function placeApple() {
      let p; do { p = [randi(1, cols - 2), randi(1, rows - 2)]; } while (snake.some(q => q[0] === p[0] && q[1] === p[1]));
      apple = p;
    }
    const turn = d => { if (done) return; if ((d + 2) % 4 !== dir || snake.length === 1) want = d; Sound.init(); };
    // שליטה: החלקה בכל מקום על המסך, כפתורי חצים, מקלדת
    let sw = null;
    wrap.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; sw = { x: e.clientX, y: e.clientY }; });
    wrap.addEventListener('pointermove', e => {
      if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) { turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); sw = { x: e.clientX, y: e.clientY }; }
    });
    ['pointerup', 'pointercancel'].forEach(ev => wrap.addEventListener(ev, () => sw = null));
    $$('.sn-pad button', root).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); turn(+b.dataset.d); }));
    s.on(window, 'keydown', e => { const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (d != null) { e.preventDefault(); turn(d); } });

    function step() {
      dir = want;
      const [hx, hy] = snake[0];
      const nh = [(hx + D[dir][0] + cols) % cols, (hy + D[dir][1] + rows) % rows];   // עוברים דרך הקיר לצד השני
      snake.unshift(nh);
      if (nh[0] === apple[0] && nh[1] === apple[1]) {
        eaten++; cnt.textContent = eaten; chew = .35;
        Sound.munch(); Sound.ding(eaten % 12);
        const r = cv.getBoundingClientRect(), px = r.left + ox + (apple[0] + .5) * C, py = r.top + oy + (apple[1] + .5) * C;
        for (let i = 0; i < 10; i++) parts.push({ x: ox + (apple[0] + .5) * C, y: oy + (apple[1] + .5) * C, vx: rand(-120, 120), vy: rand(-160, 40), life: .6 });
        const say = { 5: 'חמישה תפוחים!', 10: 'עשרה תפוחים! חצי דרך', 15: 'חמישה עשר תפוחים! עוד קצת', 19: 'עוד תפוח אחד!' }[eaten];
        if (say) { Voice.say(say); FX.burst(px, py, ['⭐', '✨'], 10, 30); } else if (Math.random() < .3) Voice.say(pick(['יאמי!', 'קראנץ׳!']));
        if (eaten >= GOAL) return win(px, py);
        placeApple();
      } else snake.pop();
    }
    function win(px, py) {
      done = true; Sound.tada(); FX.confetti(px, py, 80); FX.rain(['🍎', '⭐', '💚'], 30, 2.2);
      Voice.say('הנחש גדול מספיק! ניצחת!'); Stars.add(px, py, 3);
      s.later(() => celebrate({ emoji: '🐍', title: 'הנחש גדול מספיק! ניצחת!', stars: 3, again: reset }), 2600);
    }

    function draw() {
      ctx.fillStyle = '#c7f0a0'; ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if ((x + y) % 2) { ctx.fillStyle = '#b5e88a'; ctx.fillRect(ox + x * C, oy + y * C, C, C); }
      // תפוח
      const bob = Math.sin(t * 5) * C * .05, ax = ox + (apple[0] + .5) * C, ay = oy + (apple[1] + .5) * C + bob;
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(ax, oy + (apple[1] + .9) * C, C * .3, C * .1, 0, 0, 7); ctx.fill();
      ctx.font = `${C * .85}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText('🍎', ax, ay);
      // נחש: גוף מעוגל עם פסים
      const pos = snake.map(([x, y]) => [ox + (x + .5) * C, oy + (y + .5) * C]);
      for (let i = pos.length - 1; i >= 0; i--) {
        const [x, y] = pos[i], k = i / Math.max(1, pos.length - 1), r = C * (.46 - k * .12);
        ctx.fillStyle = i % 2 ? '#2b9348' : '#55a630'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        if (i > 0) { const [px, py] = pos[i - 1]; if (Math.abs(px - x) <= C * 1.1 && Math.abs(py - y) <= C * 1.1) { ctx.strokeStyle = i % 2 ? '#2b9348' : '#55a630'; ctx.lineWidth = r * 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(px, py); ctx.stroke(); } }
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .3, r * .3, 0, 7); ctx.fill();
      }
      // ראש עם עיניים, לחיים ולשון
      const [hx, hy] = pos[0], [dx, dy] = D[dir], R = C * .55;
      ctx.fillStyle = '#70e000'; ctx.beginPath(); ctx.arc(hx, hy, R, 0, 7); ctx.fill();
      const nx = -dy, ny = dx;
      [-1, 1].forEach(sd => {
        const ex = hx + dx * R * .25 + nx * sd * R * .42, ey = hy + dy * R * .25 + ny * sd * R * .42;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, R * .3, 0, 7); ctx.fill();
        ctx.fillStyle = '#1b1b2f'; ctx.beginPath(); ctx.arc(ex + dx * R * .1, ey + dy * R * .1, R * .16, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,120,160,.5)'; ctx.beginPath(); ctx.arc(hx - dx * R * .15 + nx * sd * R * .62, hy - dy * R * .15 + ny * sd * R * .62, R * .14, 0, 7); ctx.fill();
      });
      if (chew > 0 || Math.sin(t * 4) > .6) { ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = Math.max(2, C * .06); ctx.beginPath(); ctx.moveTo(hx + dx * R * .9, hy + dy * R * .9); ctx.lineTo(hx + dx * R * 1.35 + nx * R * .15, hy + dy * R * 1.35 + ny * R * .15); ctx.moveTo(hx + dx * R * 1.2, hy + dy * R * 1.2); ctx.lineTo(hx + dx * R * 1.35 - nx * R * .15, hy + dy * R * 1.35 - ny * R * .15); ctx.stroke(); }
      parts.forEach(p => { ctx.globalAlpha = p.life / .6; ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      ctx.textBaseline = 'alphabetic';
    }

    s.onFrame(dt => {
      t += dt; chew = Math.max(0, chew - dt);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.life -= dt; }); parts = parts.filter(p => p.life > 0);
      if (!done) { acc += dt; const every = Math.max(.2, .36 - eaten * .006); while (acc > every) { acc -= every; step(); if (done) break; } }
      draw();
    });
    reset();
    wrap._dbg = () => ({ head: snake[0], apple, dir, eaten, done, cols, rows });  // לבדיקות אוטומטיות
    Voice.say(['הנחש הרעב! תאכלי עשרים תפוחים כדי שהנחש יגדל', 'החליקי לכיוון שאת רוצה']);
  }
});
