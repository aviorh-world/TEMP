'use strict';
/* 🚗 המכונית שלי – נוסעים, עוצרים ברמזור, אוספים יהלומים. אין תאונות ואין פסילות. */
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function drawCar(ctx, x, y, w, h, color, face = true) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; rrect(ctx, -w / 2 + 5, -h / 2 + 8, w, h, w * .38); ctx.fill();
  ctx.fillStyle = '#2b2b38';
  [[-1, -.34], [1, -.34], [-1, .2], [1, .2]].forEach(([sx, sy]) => { rrect(ctx, sx * w / 2 - 5, sy * h, 10, h * .17, 4); ctx.fill(); });
  ctx.fillStyle = color; rrect(ctx, -w / 2, -h / 2, w, h, w * .38); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; rrect(ctx, -w * .38, -h * .46, w * .2, h * .3, w * .1); ctx.fill();
  ctx.fillStyle = '#c9eeff'; rrect(ctx, -w * .36, -h * .24, w * .72, h * .22, w * .14); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.12)'; rrect(ctx, -w * .34, 0, w * .68, h * .26, w * .16); ctx.fill();
  ctx.fillStyle = '#c9eeff'; rrect(ctx, -w * .3, h * .3, w * .6, h * .1, w * .06); ctx.fill();
  ctx.fillStyle = '#fff6a8'; [[-.3], [.3]].forEach(([sx]) => { ctx.beginPath(); ctx.arc(sx * w, -h * .44, w * .1, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#ff5d5d'; [[-.3], [.3]].forEach(([sx]) => { rrect(ctx, sx * w - w * .1, h * .44, w * .2, h * .04, 2); ctx.fill(); });
  if (face) {
    [-1, 1].forEach(sx => {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx * w * .16, -h * .14, w * .11, 0, 7); ctx.fill();
      ctx.fillStyle = '#3b2f4a'; ctx.beginPath(); ctx.arc(sx * w * .16, -h * .16, w * .06, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx * w * .16 + w * .02, -h * .18, w * .022, 0, 7); ctx.fill();
    });
    ctx.strokeStyle = '#3b2f4a'; ctx.lineWidth = Math.max(2, w * .04); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -h * .1, w * .09, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

registerGame({
  lines: ['לחצי על הכפתור הירוק כדי לנסוע!', 'כל הכבוד! עצרת ברמזור האדום', 'רמזור! צריך לעצור', 'ירוק! סעים!', 'עשרה יהלומים!', 'עשרים יהלומים!', 'אספת את כל היהלומים! סעי לקו הסיום', 'הגעת לקו הסיום!', 'ביפ ביפ! יש מכונית מלפנים', 'באדום עוצרים ומחכים', 'מחכים לירוק'],
  id: 'cars', name: 'המכונית שלי', emoji: '🚗', color: '#2ec27e', say: 'המכונית שלי! בחרי מכונית',
  mount(root, s) {
    const CAR_COLORS = ['#ff4d6d', '#3a86ff', '#ffc300', '#9b5de5', '#ff8c1a', '#2ec27e'];
    const NPC_COLORS = ['#ff9f1c', '#8ecae6', '#cdb4db', '#90be6d', '#f28482', '#bdb2ff', '#ffd6a5'];
    const GOAL = 30;

    root.innerHTML = `<div class="cr"><canvas></canvas>
      <div class="cr-hud"><div class="cr-gems">💎 <b>0</b>/${GOAL}</div><div class="cr-light"><i></i><i></i><i></i></div></div>
      <div class="cr-msg"></div>
      <button class="cr-btn cr-left" aria-label="שמאלה">⬅️</button><button class="cr-btn cr-right" aria-label="ימינה">➡️</button>
      <div class="cr-pedals"><button class="cr-stop">✋<span>עצור</span></button><button class="cr-go">🚀<span>סע!</span></button></div>
    </div>`;
    const wrap = $('.cr', root), cv = $('canvas', root), ctx = cv.getContext('2d');
    const gemsEl = $('.cr-gems', root), lightEl = $('.cr-light', root), msgEl = $('.cr-msg', root);
    const goBtn = $('.cr-go', root), stopBtn = $('.cr-stop', root);

    let W, H, roadW, roadX, laneW, carY, cw, ch, DPR;
    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      roadW = Math.min(W * .62, 480); laneW = roadW / 3; roadX = (W - roadW) / 2;
      cw = Math.min(laneW * .56, 64, H * .13); ch = cw * 1.7;
      carY = Math.max(H * .4, Math.min(H * .62, H - 140 - ch / 2)); // לא מתחת לכפתורים במסך נמוך
    }
    resize(); s.on(window, 'resize', resize);
    const laneX = l => roadX + laneW * (l + .5);

    // מצב המשחק
    let myColor = CAR_COLORS[0], running = false;
    let dist = 0, speed = 0, lane = 1, px = 0, stopped = true, turbo = false;
    let lights = [], npcs = [], gems = [], parts = [], finish = null;
    let nextLight, nextGem, nextNpc, gemCount = 0, streak = 0, lastHonk = 0, t = 0, won = false;
    const CRUISE = () => H * .55, FAST = () => H * 1.05, ACC = () => H * 1.1, BR = () => H * 1.5;

    let msgT = 0;
    function msg(text, ms = 1800) {
      msgEl.textContent = text; msgEl.classList.add('on'); clearTimeout(msgT);
      msgT = s.later(() => msgEl.classList.remove('on'), ms);
    }

    // ===== בחירת מכונית =====
    function carPicker() {
      const p = el('div', 'picker carpick', `<h3>איזו מכונית? 🚗</h3><div class="opts"></div>`);
      CAR_COLORS.forEach((c, i) => {
        const b = el('button', 'opt'); b.style.setProperty('--c', c); b.style.setProperty('--i', i);
        const m = document.createElement('canvas'); m.width = 220; m.height = 220; const mc = m.getContext('2d');
        mc.translate(110, 110); mc.rotate(-Math.PI / 2); drawCar(mc, 0, 0, 100, 170, c);
        b.appendChild(m); b.onclick = () => { Sound.vroom(); myColor = c; p.remove(); begin(); };
        $('.opts', p).appendChild(b);
      });
      wrap.appendChild(p);
    }

    function begin() {
      dist = 0; speed = 0; lane = 1; px = laneX(1); stopped = true; turbo = false;
      lights = []; npcs = []; gems = []; parts = []; finish = null; won = false;
      gemCount = 0; streak = 0; gemsEl.querySelector('b').textContent = 0;
      nextLight = H * 2.6; nextGem = H * .6; nextNpc = H * 1.5;
      running = true; goBtn.classList.add('hint');
      msg('לחצי על 🚀 כדי לנסוע!', 2600); Voice.say('לחצי על הכפתור הירוק כדי לנסוע!');
    }

    // ===== שליטה =====
    function press(btn, down, up) {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); btn.classList.add('down'); try { btn.setPointerCapture(e.pointerId); } catch (_) {} down(); });
      const u = () => { btn.classList.remove('down'); up && up(); };
      btn.addEventListener('pointerup', u); btn.addEventListener('pointercancel', u);
    }
    press(goBtn, go, () => turbo = false);
    press(stopBtn, brake);
    press($('.cr-left', root), () => changeLane(-1));
    press($('.cr-right', root), () => changeLane(1));
    s.on(window, 'keydown', e => {
      if (e.repeat && e.key !== 'ArrowUp') return;
      if (e.key === 'ArrowLeft') changeLane(-1); else if (e.key === 'ArrowRight') changeLane(1);
      else if (e.key === 'ArrowUp') go(); else if (e.key === 'ArrowDown' || e.key === ' ') brake();
    });
    s.on(window, 'keyup', e => { if (e.key === 'ArrowUp') turbo = false; });
    // הקשה על הכביש: צד שמאל/ימין מחליף נתיב
    cv.addEventListener('pointerdown', e => { if (!running) return; Sound.init(); const r = cv.getBoundingClientRect(); changeLane(e.clientX - r.left < (r.width / 2) ? -1 : 1); });

    function activeLight() { return lights.find(L => L.state !== 'green' && L.d - dist > -ch && L.triggered); }

    function go() {
      if (!running) return;
      goBtn.classList.remove('hint');
      if (stopped) { stopped = false; Sound.vroom(); }
      turbo = true;
      const L = activeLight();
      if (L && L.state === 'red') { msg('מחכים לירוק 🙂'); Voice.say('מחכים לירוק'); }
    }
    function brake() {
      if (!running) return;
      stopped = true; turbo = false; stopBtn.classList.remove('hint');
      const L = lights.find(L => L.triggered && L.state !== 'green' && !L.rewarded && L.d - dist > 0 && L.d - dist < H * 1.3);
      if (L) {
        L.rewarded = true; msg('כל הכבוד! עצרת ברמזור ⭐'); Voice.say('כל הכבוד! עצרת ברמזור האדום');
        const c = center(lightEl); Stars.add(c.x, c.y, 1); Sound.chime();
      }
    }
    function changeLane(dir) {
      if (!running) return;
      const nl = lane + dir; if (nl < 0 || nl > 2) { Sound.boing(); return; }
      const blocked = npcs.some(c => c.lane === nl && Math.abs(c.d - dist) < ch * 1.25);
      if (blocked) { Sound.honk(); msg('בִּיפּ בִּיפּ! יש שם מכונית 🚙'); return; }
      lane = nl; Sound.tone(500 + dir * 80, .1, { type: 'triangle', vol: .1 });
    }

    // ===== יצירת עצמים =====
    function spawn() {
      while (dist + H * 1.3 > nextLight) {
        lights.push({ d: nextLight, state: 'green', t: 0, wait: 0, triggered: false });
        nextLight += H * rand(4.2, 5.6);
      }
      while (dist + H * 1.2 > nextGem) {
        const l = randi(0, 2), n = randi(3, 5);
        const nearLight = lights.some(L => Math.abs(L.d - nextGem) < H * .5);
        if (!nearLight) for (let i = 0; i < n; i++) gems.push({ lane: l, d: nextGem + i * ch * .9, c: pick(['#4cc9f0', '#ff70a6', '#b388ff', '#2ee8b6']) });
        nextGem += H * rand(.9, 1.4);
      }
      if (dist + H * 1.2 > nextNpc) {
        if (npcs.length < 3) {
          const l = randi(0, 2), d = dist + H * 1.15;
          if (!npcs.some(c => c.lane === l && Math.abs(c.d - d) < ch * 3) && !lights.some(L => Math.abs(L.d - d) < ch * 2))
            npcs.push({ lane: l, d, v: H * rand(.28, .38), speed: 0, c: pick(NPC_COLORS) });
        }
        nextNpc = dist + H * rand(1.4, 2.6);
      }
      if (gemCount >= GOAL && !finish) finish = { d: dist + H * 1.1 };
    }

    // ===== עדכון =====
    function update(dt) {
      t += dt;
      spawn();
      const front = dist + ch / 2;

      // רמזורים
      lights.forEach(L => {
        const ahead = L.d - front;
        if (!L.triggered && ahead < H * .95) {
          L.triggered = true; L.state = 'yellow'; L.t = 0; Sound.tone(880, .15, { type: 'square', vol: .06 });
          msg('🚦 רמזור! צריך לעצור', 2000); Voice.say('רמזור! צריך לעצור'); stopBtn.classList.add('hint');
        }
        if (!L.triggered) return;
        L.t += dt;
        if (L.state === 'yellow' && L.t > .8) { L.state = 'red'; L.t = 0; }
        if (L.state === 'red') {
          if (speed < 6) L.wait += dt;
          if (L.wait > 2.4 || L.t > 9) {
            L.state = 'green'; stopBtn.classList.remove('hint'); Sound.chime();
            if (stopped) { msg('🟢 ירוק! סעים!', 2000); Voice.say('ירוק! סעים!'); goBtn.classList.add('hint'); }
            else msg('🟢 ירוק!', 1500);
          }
          if (speed < 4 && !L.rewarded && !L.told && ahead < ch) { L.told = true; msg('🔴 באדום עוצרים ומחכים'); Voice.say('באדום עוצרים ומחכים'); }
        }
      });
      const AL = lights.find(L => L.triggered && L.d - dist > -ch * .5 && L.d - dist < H * 1.2);
      if (AL) { lightEl.classList.add('on'); lightEl.dataset.s = AL.state; } else lightEl.classList.remove('on');

      // מהירות היעד
      let target = stopped ? 0 : (turbo ? FAST() : CRUISE());
      let cap = Infinity;
      lights.forEach(L => {
        if (L.state === 'green') return;
        const gap = L.d - front - 8;
        if (gap > -4) cap = Math.min(cap, Math.sqrt(2 * BR() * Math.max(0, gap)));
      });
      npcs.forEach(c => {
        if (Math.abs(laneX(c.lane) - px) > laneW * .6) return;
        const gap = (c.d - ch / 2) - front - ch * .25;
        if (gap > -ch) {
          cap = Math.min(cap, c.speed + Math.sqrt(2 * BR() * Math.max(0, gap)));
          if (gap < ch * 1.2 && speed > c.speed + 10 && t - lastHonk > 3) { lastHonk = t; Sound.honk(); msg('בִּיפּ בִּיפּ! עברי נתיב ⬅️➡️'); Voice.say('ביפ ביפ! יש מכונית מלפנים'); }
        }
      });
      target = Math.min(target, cap);
      if (speed < target) speed = Math.min(target, speed + ACC() * dt);
      else speed = Math.max(target, speed - BR() * 1.6 * dt);
      speed = Math.min(speed, cap);
      dist += speed * dt;

      // תזוזה בין נתיבים
      const tx = laneX(lane), step = laneW * 5 * dt;
      px = Math.abs(tx - px) < step ? tx : px + Math.sign(tx - px) * step;

      // מכוניות אחרות
      npcs.forEach(c => {
        let cc = c.v;
        lights.forEach(L => { if (L.state === 'green') return; const gap = L.d - (c.d + ch / 2) - 8; if (gap > -4) cc = Math.min(cc, Math.sqrt(2 * BR() * Math.max(0, gap))); });
        npcs.forEach(o => { if (o !== c && o.lane === c.lane && o.d > c.d) { const gap = o.d - c.d - ch * 1.3; cc = Math.min(cc, o.speed + Math.max(0, gap) * 2); } });
        c.speed += Math.max(-BR() * dt * 1.6, Math.min(ACC() * dt, cc - c.speed));
        c.d += c.speed * dt;
      });
      npcs = npcs.filter(c => c.d > dist - H * .6 && c.d < dist + H * 2);
      lights = lights.filter(L => L.d > dist - H * .6);

      // יהלומים
      gems = gems.filter(g => {
        if (g.d < dist - H * .5) { streak = 0; return false; }
        if (Math.abs(g.d - dist) < ch * .55 && Math.abs(laneX(g.lane) - px) < laneW * .45) {
          gemCount++; streak++;
          Sound.ding(Math.min(streak, 12));
          for (let i = 0; i < 8; i++) parts.push({ x: laneX(g.lane), y: carY - (g.d - dist), vx: rand(-160, 160), vy: rand(-220, -40), life: .6, c: g.c });
          const b = gemsEl.querySelector('b'); b.textContent = Math.min(gemCount, GOAL);
          gemsEl.classList.remove('bump'); void gemsEl.offsetWidth; gemsEl.classList.add('bump');
          if (gemCount % 10 === 0 && gemCount < GOAL) {
            msg(`💎 ${gemCount} יהלומים!`); Voice.say(gemCount === 10 ? 'עשרה יהלומים!' : 'עשרים יהלומים!');
            const c = center(gemsEl); Stars.add(c.x, c.y, 1);
          }
          if (gemCount === GOAL) { msg('🏁 עוד קצת לקו הסיום!', 2500); Voice.say('אספת את כל היהלומים! סעי לקו הסיום'); }
          return false;
        }
        return true;
      });
      parts = parts.filter(p => (p.life -= dt) > 0);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; });

      if (finish && !won && dist > finish.d) {
        won = true; running = false; stopped = true;
        s.later(() => celebrate({ emoji: '🏁', title: 'הגעת לקו הסיום!', again: () => { carPicker(); } }), 900);
      }
    }

    // ===== ציור =====
    const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const sy = d => carY - (d - dist);

    function draw() {
      ctx.fillStyle = '#7ed957'; ctx.fillRect(0, 0, W, H);
      const band = 90;
      ctx.fillStyle = '#8be36a';
      for (let i = Math.floor((dist - carY) / band) - 1; i < (dist + H) / band + 1; i++) if (i % 2 === 0) ctx.fillRect(0, sy(i * band) - band, W, band);
      // עצים ופרחים בצדדים
      const TILE = 110;
      for (let i = Math.floor((dist - (H - carY) - 100) / TILE); i < (dist + carY + 100) / TILE; i++) {
        for (const side of [0, 1]) {
          const r = hash(i * 2 + side), r2 = hash(i * 7 + side * 3);
          const room = roadX - 30; if (room < 30) continue;
          const x = side ? roadX + roadW + 22 + r2 * room : 8 + r2 * room;
          const y = sy(i * TILE);
          if (r < .45) {
            ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 8, 26, 22, 0, 0, 7); ctx.fill();
            ctx.fillStyle = '#3fae49'; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill();
            ctx.fillStyle = '#58c862'; ctx.beginPath(); ctx.arc(x - 7, y - 7, 15, 0, 7); ctx.fill();
            if (r < .15) { ctx.fillStyle = '#ff4d4d'; [[8, -6], [-10, 8], [12, 10]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a, y + b, 4, 0, 7); ctx.fill(); }); }
          } else if (r < .8) {
            const fc = ['#ff70a6', '#ffd60a', '#fff', '#b388ff'][Math.floor(r2 * 4)];
            for (let k = 0; k < 5; k++) { ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(x + Math.cos(k * 1.256) * 7, y + Math.sin(k * 1.256) * 7, 6, 0, 7); ctx.fill(); }
            ctx.fillStyle = '#ffc300'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
          }
        }
      }
      // כביש
      ctx.fillStyle = '#6b6f7a'; ctx.fillRect(roadX, 0, roadW, H);
      const seg = 28;
      for (let i = Math.floor((dist - (H - carY)) / seg) - 1; i < (dist + carY) / seg + 1; i++) {
        ctx.fillStyle = i % 2 ? '#fff' : '#ff4d4d';
        ctx.fillRect(roadX - 12, sy(i * seg) - seg, 12, seg); ctx.fillRect(roadX + roadW, sy(i * seg) - seg, 12, seg);
      }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      const dash = 46;
      for (let l = 1; l < 3; l++) for (let i = Math.floor((dist - (H - carY)) / (dash * 2)) - 1; i < (dist + carY) / (dash * 2) + 1; i++)
        ctx.fillRect(roadX + laneW * l - 3, sy(i * dash * 2) - dash, 6, dash);

      // קו סיום
      if (finish) {
        const y = sy(finish.d), sq = roadW / 12;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) { ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff'; ctx.fillRect(roadX + c * sq, y - sq * (r + 1), sq, sq); }
        ctx.font = `${sq * 2}px serif`; ctx.textAlign = 'center'; ctx.fillText('🏁', roadX - 30, y); ctx.fillText('🏁', roadX + roadW + 30, y);
      }
      // רמזורים
      lights.forEach(L => {
        const y = sy(L.d);
        ctx.fillStyle = '#fff'; ctx.fillRect(roadX, y - 6, roadW, 10);
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        for (let i = 0; i < 9; i++) ctx.fillRect(roadX + 8 + i * (roadW - 16) / 9, y - 50, (roadW - 16) / 18, 36);
        const bx = roadX + roadW + 16, bw = 34, bh = 92;
        ctx.fillStyle = '#555'; ctx.fillRect(bx + bw / 2 - 4, y - 10, 8, 40);
        ctx.fillStyle = '#2d2d3a'; rrect(ctx, bx, y - bh - 10, bw, bh, 10); ctx.fill();
        ['red', 'yellow', 'green'].forEach((st, i) => {
          const on = L.state === st, col = st === 'red' ? '#ff3b3b' : st === 'yellow' ? '#ffd60a' : '#2ee86b';
          ctx.fillStyle = on ? col : '#4a4a58';
          if (on) { ctx.shadowColor = col; ctx.shadowBlur = 18; }
          ctx.beginPath(); ctx.arc(bx + bw / 2, y - bh - 10 + 16 + i * 29, 11, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
        });
      });
      // יהלומים
      gems.forEach(g => {
        const x = laneX(g.lane), y = sy(g.d); if (y < -40 || y > H + 40) return;
        const k = 1 + Math.sin(t * 6 + g.d) * .08, r = laneW * .17 * k;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(4, r + 6, r * .8, r * .25, 0, 0, 7); ctx.fill();
        ctx.fillStyle = g.c; ctx.beginPath(); ctx.moveTo(-r, -r * .3); ctx.lineTo(-r * .5, -r); ctx.lineTo(r * .5, -r); ctx.lineTo(r, -r * .3); ctx.lineTo(0, r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(-r * .5, -r); ctx.lineTo(0, -r * .3); ctx.lineTo(-r, -r * .3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(-r, -r * .3); ctx.lineTo(r, -r * .3); ctx.lineTo(0, r); ctx.closePath(); ctx.fill();
        if (Math.sin(t * 4 + g.d) > .7) { ctx.fillStyle = '#fff'; ctx.font = `${r}px serif`; ctx.textAlign = 'center'; ctx.fillText('✨', r * .7, -r * .8); }
        ctx.restore();
      });
      npcs.forEach(c => drawCar(ctx, laneX(c.lane), sy(c.d), cw, ch, c.c));
      // המכונית שלי
      const tilt = (laneX(lane) - px) / laneW * -.25;
      ctx.save(); ctx.translate(px, carY); ctx.rotate(tilt);
      if (speed > CRUISE() * 1.2) { ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 3; i++) { ctx.fillRect(-cw * .6 + i * cw * .5, ch * .55 + (t * 600 + i * 30) % 40, 4, 18); } }
      drawCar(ctx, 0, 0, cw * 1.06, ch * 1.06, myColor);
      ctx.restore();
      parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / .6); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
    }

    s.onFrame(dt => { if (running) update(dt); draw(); });
    px = laneX(1);
    carPicker();
  }
});
