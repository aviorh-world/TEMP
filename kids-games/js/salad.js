'use strict';
/* 🥗 סלט ירקות – ירקות עפים באוויר, חותכים אותם בהחלקה (או בנגיעה). מתחיל מהר ומאט לאט לאט.
   כשכל הירקות לסלט נחתכו – נוני אוכלת ואומרת תודה. אין פסילות. */
const SALAD = {
  VEG: [['🍅', 'עגבנייה', 3, '#ff4d4d'], ['🥒', 'מלפפון', 2, '#7bc043'], ['🫑', 'פלפל', 2, '#3fae49'], ['🧅', 'בצל', 1, '#d9a1c9'], ['🥕', 'גזר', 2, '#ff9f1c']],
  NOT: ['🍩', '🧦', '🍬', '⚽'],
  lines: ['בואי נכין סלט ירקות!', 'חתכי את הירקות עם האצבע', 'צריך עגבניות, מלפפונים, פלפלים, בצל וגזר', 'עגבנייה!', 'מלפפון!', 'פלפל!', 'בצל!', 'גזר!',
    'זה לא לסלט', 'עוד קצת ירקות!', 'יש לנו מספיק מזה', 'הסלט מוכן!', 'יאמי! תודה על הסלט הטעים!', 'את טבחית מעולה!']
};

registerGame({
  id: 'salad', name: 'סלט ירקות', emoji: '🥗', color: '#55a630', say: 'בואי נכין סלט ירקות!',
  lines: SALAD.lines,
  mount(root, s) {
    const { VEG, NOT } = SALAD;
    root.innerHTML = `<div class="sl"><canvas></canvas><div class="sl-need"></div><div class="sl-bowl">🥣<div class="sl-in"></div></div></div>`;
    const wrap = $('.sl', root), cv = $('canvas', root), ctx = cv.getContext('2d'), needEl = $('.sl-need', root), bowlIn = $('.sl-in', root);
    let W, H, DPR;
    function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
    resize(); s.on(window, 'resize', resize);

    let items = [], halves = [], drops = [], trail = [], got = {}, t = 0, nextLaunch = .6, done = false, said = {};
    const need = () => VEG.filter(v => (got[v[0]] || 0) < v[2]);
    const paintNeed = () => { needEl.innerHTML = VEG.map(([e, , n]) => `<span class="${(got[e] || 0) >= n ? 'ok' : ''}">${e}<b>${Math.min(got[e] || 0, n)}/${n}</b></span>`).join(''); };
    paintNeed();
    // קצב: מתחיל מהר (1.25) ומאט עד 0.75 לאורך כ־40 שניות
    const pace = () => Math.max(.75, 1.25 - t / 80);
    const SZ = () => Math.max(56, Math.min(W, H) * .12);

    function launch() {
      const want = need();
      const useful = want.length && Math.random() < .78;
      const pick1 = useful ? pick(want) : Math.random() < .6 ? pick(VEG) : null;
      const e = pick1 ? pick1[0] : pick(NOT);
      const x = rand(W * .15, W * .85), vx = (W / 2 - x) * rand(.25, .55);
      const g = H * 1.1, vy = -Math.sqrt(2 * g * H * rand(.55, .78));
      items.push({ e, x, y: H + SZ(), vx, vy, g, r: rand(-2, 2), a: 0, veg: pick1, cut: false });
    }

    // חיתוך: קו האצבע שעובר דרך ירק (או נגיעה בו)
    let down = false, last = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function cutAlong(a, b) {
      for (const it of items) {
        if (it.cut) continue;
        const [ax, ay] = a, [bx, by] = b, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
        const k = Math.max(0, Math.min(1, ((it.x - ax) * dx + (it.y - ay) * dy) / L2));
        if (Math.hypot(ax + dx * k - it.x, ay + dy * k - it.y) < SZ() * .55) slice(it, Math.atan2(dy, dx));
      }
    }
    function slice(it, ang) {
      it.cut = true;
      const r = cv.getBoundingClientRect(), sx = r.left + it.x, sy = r.top + it.y;
      if (!it.veg) { Sound.boing(); if (!said.not || t - said.not > 6) { said.not = t; Voice.say('זה לא לסלט'); } it.vy = -Math.abs(it.vy) * .3; it.cut = false; it.bounced = true; return; }
      const [e, name, n, col] = it.veg;
      for (const side of [-1, 1]) halves.push({ e, x: it.x, y: it.y, vx: it.vx + Math.cos(ang + Math.PI / 2) * side * 140, vy: it.vy * .3 - 80, a: it.a, va: side * 4, side, life: 1.4 });
      for (let i = 0; i < 12; i++) drops.push({ x: it.x, y: it.y, vx: rand(-220, 220), vy: rand(-260, 60), life: .6, c: col });
      Sound.noise(.12, { freq: 2200, to: 600, vol: .35 }); Sound.ding((got[e] || 0) + 3);
      if ((got[e] || 0) < n) {
        got[e] = (got[e] || 0) + 1; paintNeed();
        const sp = el('span', '', e); bowlIn.appendChild(sp);
        if (!said[e]) { said[e] = 1; Voice.say(name + '!'); } else if (Math.random() < .25) praise(sx, sy);
        if (!need().length) finish();
        else if (need().length === 1 && !said.almost) { said.almost = 1; Voice.say('עוד קצת ירקות!'); }
      } else if (!said.enough || t - said.enough > 8) { said.enough = t; Voice.say('יש לנו מספיק מזה'); }
    }
    cv.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); down = true; last = pt(e); try { cv.setPointerCapture(e.pointerId); } catch (_) {} cutAlong(last, [last[0] + 1, last[1] + 1]); trail = [{ p: last, life: .25 }]; });
    cv.addEventListener('pointermove', e => { if (!down) return; const p = pt(e); cutAlong(last, p); trail.push({ p, life: .25 }); last = p; });
    ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { down = false; }));

    function finish() {
      done = true; items.forEach(it => it.cut = true);
      Sound.tada(); Voice.say('הסלט מוכן!');
      const c = center(wrap); FX.confetti(c.x, c.y, 60);
      s.later(() => {
        const eat = el('div', 'sl-eat', '<canvas width="260" height="260"></canvas><div class="sl-bubble">יאמי! תודה על הסלט הטעים! 😋</div>');
        wrap.appendChild(eat);
        const ec = $('canvas', eat).getContext('2d'); let tt = 0, bites = 0;
        s.onFrame(dt => { tt += dt; ec.clearRect(0, 0, 260, 260); drawNoni(ec, 130, 235, 150, { t: tt, squash: 1 + Math.sin(tt * 10) * .04, happy: tt > 2.8 }); });
        const chew = () => { if (bites++ < 5 && bowlIn.lastChild) { bowlIn.lastChild.remove(); Sound.munch(); s.later(chew, 420); } };
        s.later(chew, 500);
        s.later(() => Voice.say('יאמי! תודה על הסלט הטעים!'), 2900);
      }, 1400);
      s.later(() => { const c2 = center(wrap); Stars.add(c2.x, c2.y, 2); celebrate({ emoji: '🥗', title: 'את טבחית מעולה!', stars: 3, again: () => App.restart() }); }, 7200);
    }

    function update(dt) {
      t += dt; const k = pace(), d = dt * k;
      if (!done) { nextLaunch -= d; if (nextLaunch <= 0) { launch(); if (Math.random() < .35) launch(); nextLaunch = rand(.7, 1.15); } }
      items.forEach(it => { it.vy += it.g * d; it.x += it.vx * d; it.y += it.vy * d; it.a += it.r * d; });
      items = items.filter(it => !it.cut && it.y < H + SZ() * 2);
      halves.forEach(h => { h.vy += H * 1.1 * d; h.x += h.vx * d; h.y += h.vy * d; h.a += h.va * d; h.life -= dt; });
      halves = halves.filter(h => h.life > 0 && h.y < H + 80);
      drops.forEach(p => { p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); drops = drops.filter(p => p.life > 0);
      trail.forEach(q => q.life -= dt); trail = trail.filter(q => q.life > 0);
    }
    function draw() {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff8e1'); g.addColorStop(1, '#ffe0b2'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, H * i / 6, W, H / 12);   // מפת שולחן
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000';
      items.forEach(it => { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a); ctx.font = `${SZ()}px serif`; ctx.fillText(it.e, 0, 0); ctx.restore(); });
      halves.forEach(h => {
        ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a); ctx.beginPath(); ctx.rect(h.side < 0 ? -SZ() : 0, -SZ(), SZ(), SZ() * 2); ctx.clip();
        ctx.globalAlpha = Math.min(1, h.life * 1.5); ctx.font = `${SZ()}px serif`; ctx.fillText(h.e, 0, 0); ctx.restore();
      });
      ctx.globalAlpha = 1;
      drops.forEach(p => { ctx.globalAlpha = p.life / .6; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      if (trail.length > 1) { ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12;
        ctx.beginPath(); trail.forEach((q, i) => i ? ctx.lineTo(...q.p) : ctx.moveTo(...q.p)); ctx.stroke(); ctx.shadowBlur = 0; }
      ctx.textBaseline = 'alphabetic';
    }
    s.onFrame(dt => { update(dt); draw(); });
    wrap._dbg = () => ({ items: items.map(it => ({ x: it.x, y: it.y, veg: !!it.veg })), got, done, need: need().length });  // לבדיקות אוטומטיות
    Voice.say(['בואי נכין סלט ירקות!', 'חתכי את הירקות עם האצבע', 'צריך עגבניות, מלפפונים, פלפלים, בצל וגזר']);
  }
});
