'use strict';
/* ☁️ מגדל העננים – נוני קופצת לבד מענן לענן; זזים ימינה/שמאלה, אוספים כוכבים וגביעים עד הטירה.
   אין נפילה החוצה: בלון תופס ומחזיר לענן האחרון. */

// נוני – דמות מקורית: כדור פרוותי ורוד עם שתי מחושים, עיניים גדולות ולחיים
function drawNoni(ctx, x, y, s, { squash = 1, dir = 1, t = 0, color = '#ff8fc8', happy = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1 / Math.sqrt(squash), squash);
  const r = s / 2, blink = (t % 3.2) > 3.05;
  // רגליים
  ctx.fillStyle = '#ff6fae';
  [-1, 1].forEach(k => { ctx.beginPath(); ctx.ellipse(k * r * .45, -r * .08, r * .32, r * .18, 0, 0, 7); ctx.fill(); });
  // מחושים
  ctx.strokeStyle = '#ff6fae'; ctx.lineWidth = Math.max(2, r * .1); ctx.lineCap = 'round';
  [-1, 1].forEach(k => {
    ctx.beginPath(); ctx.moveTo(k * r * .3, -r * 1.7); ctx.quadraticCurveTo(k * r * .45, -r * 2.15, k * r * .7, -r * 2.25); ctx.stroke();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(k * r * .72, -r * 2.25, r * .17, 0, 7); ctx.fill();
  });
  // גוף
  const g = ctx.createRadialGradient(-r * .3, -r * 1.3, r * .2, 0, -r * .95, r * 1.1);
  g.addColorStop(0, '#ffd0ea'); g.addColorStop(1, color);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -r * .95, r, r * .92, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(0, -r * .62, r * .55, r * .38, 0, 0, 7); ctx.fill();
  // עיניים
  [-1, 1].forEach(k => {
    const ex = k * r * .36 + dir * r * .06, ey = -r * 1.12;
    if (blink || happy) { ctx.strokeStyle = '#3b2f4a'; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.arc(ex, ey + r * .04, r * .15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); return; }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, r * .22, r * .26, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3b2f4a'; ctx.beginPath(); ctx.arc(ex + dir * r * .06, ey + r * .03, r * .13, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + dir * r * .06 + r * .05, ey - r * .04, r * .05, 0, 7); ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,90,140,.45)'; [-1, 1].forEach(k => { ctx.beginPath(); ctx.ellipse(k * r * .62, -r * .82, r * .15, r * .09, 0, 0, 7); ctx.fill(); });
  ctx.strokeStyle = '#3b2f4a'; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.arc(dir * r * .05, -r * .86, r * .17, .15 * Math.PI, .85 * Math.PI); ctx.stroke();
  ctx.restore();
}
function drawCloud(ctx, x, y, w, h, tint = '#fff') {
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .9, w * .48, h * .35, 0, 0, 7); ctx.fill();
  ctx.fillStyle = tint;
  ctx.beginPath(); rrect(ctx, x, y, w, h, h / 2); ctx.fill();
  [[.25, .1, .32], [.55, -.05, .4], [.8, .15, .28]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(x + w * a, y + h * b, h * c * 1.6, 0, 7); ctx.fill(); });
}

registerGame({
  id: 'tower', name: 'מגדל העננים', emoji: '☁️', color: '#7b9cff', say: 'מגדל העננים! קפצי למעלה עד הטירה',
  lines: ['מגדל העננים! קפצי למעלה עד הטירה', 'לחצי על החצים כדי לזוז ימינה ושמאלה', 'גביע!', 'עוד גביע!', 'אופס! הבלון תפס אותך', 'קפיצת קשת!',
    'חצי מהמגדל!', 'כמעט למעלה!', 'הגעת לטירה! ניצחת!', 'כוכב!'],
  mount(root, s) {
    root.innerHTML = `<div class="tw"><canvas></canvas>
      <div class="tw-hud"><div class="tw-trophies"></div><div class="tw-stars">⭐ <b>0</b></div></div>
      <div class="tw-meter"><i></i><span>🏰</span></div>
      <button class="cr-btn cr-left tw-l" aria-label="שמאלה">⬅️</button><button class="cr-btn cr-right tw-r" aria-label="ימינה">➡️</button></div>`;
    const wrap = $('.tw', root), cv = $('canvas', root), ctx = cv.getContext('2d');
    const meter = $('.tw-meter i', root), trophEl = $('.tw-trophies', root), starsEl = $('.tw-stars b', root);
    let W, H, DPR;
    const N = 60, TROPHY_EVERY = 10;
    let plats = [], items = [], hero, cam = 0, dirHold = 0, t = 0, won = false, balloonT = 0, trophies = 0, starsN = 0, said = {}, parts = [];

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    const GAP = () => H * .15, PW = () => Math.max(110, Math.min(W * .28, 190)), G = () => H * 2.6, V0 = () => Math.sqrt(2 * G() * H * .31), SZ = () => Math.max(44, H * .075);

    function build() {
      plats = [{ i: 0, x: 0, w: W, y: 0, floor: true }]; items = [];
      let px = W / 2 - PW() / 2;
      for (let i = 1; i <= N; i++) {
        const w = PW() * (i > 40 ? .85 : 1);
        px = Math.max(8, Math.min(W - w - 8, px + rand(-W * .42, W * .42)));
        const p = { i, x: px, w, y: i * GAP(), move: i > 25 && i % 4 === 0 ? rand(.6, 1) * (Math.random() < .5 ? -1 : 1) : 0, spring: i % 13 === 7 };
        plats.push(p);
        if (i % TROPHY_EVERY === 0) items.push({ p, dx: w / 2, kind: 'trophy' });
        else if (Math.random() < .45) items.push({ p, dx: rand(.2, .8) * w, kind: 'star' });
      }
      plats.push({ i: N + 1, x: 0, w: W, y: (N + 1) * GAP(), top: true });
      hero = { x: W / 2, y: 0, vx: 0, vy: V0(), squash: 1, dir: 1, last: plats[0] };
      cam = 0; won = false; trophies = 0; starsN = 0; said = {}; starsEl.textContent = 0;
      trophEl.innerHTML = Array.from({ length: N / TROPHY_EVERY }, () => '<i>🏆</i>').join('');
    }
    function rebuildOnResize() { resize(); if (!won) build(); }
    s.on(window, 'resize', rebuildOnResize);

    // שליטה: כפתורים, נגיעה בחצי המסך, מקלדת
    const hold = (btn, d) => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); dirHold = d; btn.classList.add('down'); try { btn.setPointerCapture(e.pointerId); } catch (_) {} });
      const up = () => { if (dirHold === d) dirHold = 0; btn.classList.remove('down'); };
      btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
    };
    hold($('.tw-l', root), -1); hold($('.tw-r', root), 1);
    let cvPtr = null;
    cv.addEventListener('pointerdown', e => { Sound.init(); cvPtr = e.pointerId; try { cv.setPointerCapture(cvPtr); } catch (_) {} const r = cv.getBoundingClientRect(); dirHold = e.clientX - r.left < r.width / 2 ? -1 : 1; });
    cv.addEventListener('pointermove', e => { if (e.pointerId !== cvPtr) return; const r = cv.getBoundingClientRect(); dirHold = e.clientX - r.left < r.width / 2 ? -1 : 1; });
    ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, e => { if (e.pointerId === cvPtr) { cvPtr = null; dirHold = 0; } }));
    s.on(window, 'keydown', e => { if (e.key === 'ArrowLeft') dirHold = -1; if (e.key === 'ArrowRight') dirHold = 1; });
    s.on(window, 'keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dirHold = 0; });

    const sy = y => H * .9 - (y - cam);

    function update(dt) {
      t += dt;
      if (won) { hero.squash += (1 - hero.squash) * .2; return; }
      const VX = W * .8;
      hero.vx += (dirHold * VX - hero.vx) * Math.min(1, dt * 7);
      if (dirHold) hero.dir = dirHold;
      hero.x += hero.vx * dt;
      if (hero.x < -20) hero.x = W + 20; if (hero.x > W + 20) hero.x = -20;   // יוצאים מצד אחד, נכנסים מהשני
      const prevY = hero.y;
      hero.vy -= G() * dt; hero.y += hero.vy * dt;
      hero.squash += (1 - hero.squash) * Math.min(1, dt * 10);
      balloonT = Math.max(0, balloonT - dt);
      plats.forEach(p => { if (p.move) { p.x += p.move * W * .18 * dt; if (p.x < 6 || p.x + p.w > W - 6) p.move *= -1; } });
      // נחיתה על ענן = קפיצה אוטומטית
      if (hero.vy < 0) for (const p of plats) {
        if (prevY >= p.y && hero.y <= p.y && hero.x > p.x - SZ() * .35 && hero.x < p.x + p.w + SZ() * .35) {
          hero.y = p.y; hero.last = p; hero.squash = .7;
          const boost = p.spring;
          hero.vy = V0() * (boost ? 1.55 : 1);
          Sound.tone(boost ? 400 : 300 + Math.min(p.i, 60) * 8, boost ? .35 : .12, { type: 'sine', to: boost ? 1200 : 600, vol: .12 });
          if (boost) { Voice.say('קפיצת קשת!'); FX.burst(...scr(hero.x, hero.y), ['🌈', '✨'], 8, 30); }
          if (p.top) win();
          break;
        }
      }
      cam = Math.max(cam, hero.y - H * .42);
      // נפילה – בלון מחזיר לענן האחרון
      if (hero.y < cam - H * .12) {
        const p = hero.last; hero.y = p.y + 4; hero.x = p.x + p.w / 2; hero.vy = V0(); hero.vx = 0; balloonT = 1.4;
        cam = Math.min(cam, p.y - H * .1); Voice.say('אופס! הבלון תפס אותך'); Sound.boing();
      }
      // איסוף
      items = items.filter(it => {
        const ix = it.p.x + it.dx, iy = it.p.y + SZ() * .9;
        if (Math.hypot(ix - hero.x, iy - (hero.y + SZ() * .5)) > SZ() * .9) return true;
        const [sx, sy2] = scr(ix, iy);
        if (it.kind === 'trophy') {
          trophies++; $$('i', trophEl)[trophies - 1]?.classList.add('on');
          Sound.chime(); FX.burst(sx, sy2, ['🏆', '⭐', '✨'], 12, 36); Stars.add(sx, sy2, 1);
          Voice.say(trophies === 1 ? 'גביע!' : ['עוד גביע!', pick(PRAISE)]);
        } else {
          starsN++; starsEl.textContent = starsN; Sound.ding(starsN % 12);
          for (let i = 0; i < 6; i++) parts.push({ x: ix, y: iy, vx: rand(-120, 120), vy: rand(60, 220), life: .5 });
          if (starsN % 10 === 0) praise(sx, sy2);
        }
        return false;
      });
      parts = parts.filter(p => (p.life -= dt) > 0); parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 500 * dt; });
      const f = hero.last.i / (N + 1);
      meter.style.height = Math.min(100, f * 100) + '%';
      if (f >= .5 && !said.half) { said.half = 1; Voice.say('חצי מהמגדל!'); }
      if (f >= .85 && !said.near) { said.near = 1; Voice.say('כמעט למעלה!'); }
    }
    const scr = (x, y) => { const r = cv.getBoundingClientRect(); return [r.left + x, r.top + sy(y)]; };

    function win() {
      won = true; Sound.tada();
      const [x, y] = scr(hero.x, hero.y); FX.confetti(x, y - 60, 80); FX.rain(['🌈', '⭐', '🏆', '💖'], 40, 2.5);
      Voice.say('הגעת לטירה! ניצחת!');
      s.later(() => celebrate({ emoji: '🏰', title: 'הגעת לטירה! ניצחת!', stars: 3, again: build }), 2200);
    }

    function draw() {
      const f = Math.min(1, cam / ((N + 1) * GAP()));
      const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
      const c1 = f < .5 ? mix([159, 220, 255], [255, 195, 160], f * 2) : mix([255, 195, 160], [58, 50, 130], (f - .5) * 2);
      const c2 = f < .5 ? mix([230, 247, 255], [255, 230, 240], f * 2) : mix([255, 230, 240], [110, 90, 190], (f - .5) * 2);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${c1})`); g.addColorStop(1, `rgb(${c2})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (f > .45) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, (f - .45) * 3)})`; for (let i = 0; i < 40; i++) { const x = (i * 97.3) % W, y = ((i * 61.7 - cam * .2) % H + H) % H; ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3), 0, 7); ctx.fill(); } }
      // עננים ברקע
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 6; i++) { const y = ((i * 233 - cam * .3) % (H + 200) + H + 200) % (H + 200) - 100, x = (i * 173) % W; ctx.beginPath(); ctx.ellipse(x, y, 70, 22, 0, 0, 7); ctx.fill(); }
      // עננים לקפיצה
      plats.forEach(p => {
        const y = sy(p.y); if (y < -60 || y > H + 60) return;
        if (p.floor) { ctx.fillStyle = '#8fdb7e'; ctx.fillRect(0, y, W, H); return; }
        if (p.top) {
          drawCloud(ctx, 0, y - 10, W, 34, '#fff7fb');
          ctx.font = `${H * .16}px serif`; ctx.textAlign = 'center'; ctx.fillText('🏰', W / 2, y - 8);
          ctx.font = `${H * .1}px serif`; ctx.fillText('🌈', W * .2, y - 20); ctx.fillText('🌈', W * .8, y - 20);
          return;
        }
        drawCloud(ctx, p.x, y - 8, p.w, 26, p.spring ? '#ffe3f6' : '#fff');
        if (p.spring) { ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.fillText('🌈', p.x + p.w / 2, y - 8); }
      });
      ctx.fillStyle = '#000';
      items.forEach(it => {
        const y = sy(it.p.y + SZ() * .9); if (y < -60 || y > H + 60) return;
        const bob = Math.sin(t * 4 + it.dx) * 5;
        ctx.font = `${it.kind === 'trophy' ? SZ() * 1.1 : SZ() * .7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.kind === 'trophy' ? '🏆' : '⭐', it.p.x + it.dx, y + bob); ctx.textBaseline = 'alphabetic';
      });
      parts.forEach(p => { ctx.globalAlpha = p.life / .5; ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(p.x, sy(p.y), 4, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      // נוני
      const hy = sy(hero.y);
      ctx.fillStyle = '#000';
      if (balloonT > 0) { ctx.font = `${SZ()}px serif`; ctx.textAlign = 'center'; ctx.fillText('🎈', hero.x, hy - SZ() * 2.3); ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hero.x, hy - SZ() * 2.2); ctx.lineTo(hero.x, hy - SZ() * 1.5); ctx.stroke(); }
      drawNoni(ctx, hero.x, hy, SZ(), { squash: hero.squash, dir: hero.dir, t, happy: won });
    }

    wrap._dbg = () => ({ x: hero.x, y: hero.y, vy: hero.vy, last: hero.last.i, W, won, trophies, plats: plats.map(p => [p.i, p.x, p.w, p.y]) });  // לבדיקות אוטומטיות
    wrap._steer = d => { dirHold = d; };
    build();
    s.onFrame(dt => { update(dt); draw(); });
    Voice.say(['מגדל העננים! קפצי למעלה עד הטירה', 'לחצי על החצים כדי לזוז ימינה ושמאלה']);
  }
});
