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


/* 🏎️ מרוץ מכוניות – 6 מכוניות, בערך 2 דקות, שני רמזורים. אין תאונות: מאטים מאחורי מכונית ועוקפים מהצד. */
const CAR_LINES = {
  start: 'החזיקי את הטיל כדי לנסוע מהר!', go: 'יוצאים לדרך!', count: ['שלוש', 'שתיים', 'אחת'],
  passed: 'עקפת!', first: 'את במקום הראשון!', half: 'חצי מהדרך!', near: 'עוד קצת לקו הסיום!',
  places: ['ניצחת! מקום ראשון!', 'מקום שני! כל הכבוד!', 'מקום שלישי! כל הכבוד!', 'סיימת את המרוץ! כל הכבוד!'],
  light: 'רמזור! צריך לעצור', green: 'ירוק! סעים!', stoppedWell: 'כל הכבוד! עצרת ברמזור האדום', wait: 'מחכים לירוק',
  redStop: 'באדום עוצרים ומחכים', beep: 'ביפ ביפ! יש מכונית מלפנים'
};
registerGame({
  lines: () => Object.values(CAR_LINES).flat(),
  id: 'cars', name: 'מרוץ מכוניות', emoji: '🏎️', color: '#2ec27e', say: 'מרוץ מכוניות! בחרי מכונית',
  mount(root, s) {
    const CAR_COLORS = ['#ff4d6d', '#3a86ff', '#ffc300', '#9b5de5', '#ff8c1a', '#2ec27e'];
    const RIVALS = [['🐻', '#c08552'], ['🐰', '#cdb4db'], ['🦊', '#ff9f1c'], ['🐸', '#90be6d'], ['🐼', '#bdb2ff']];
    const L = CAR_LINES;

    root.innerHTML = `<div class="cr"><canvas></canvas>
      <div class="cr-hud"><div class="cr-place"><b>6</b><span>/6</span></div><div class="cr-track"><div class="cr-bar"></div><i class="flag">🏁</i></div>
        <div class="cr-gems">💎 <b>0</b></div><div class="cr-light"><i></i><i></i><i></i></div></div>
      <div class="cr-msg"></div><div class="cr-count"></div>
      <button class="cr-btn cr-left" aria-label="שמאלה">⬅️</button><button class="cr-btn cr-right" aria-label="ימינה">➡️</button>
      <div class="cr-pedals"><button class="cr-stop">✋<span>עצור</span></button><button class="cr-go">🚀<span>מהר!</span></button></div>
    </div>`;
    const wrap = $('.cr', root), cv = $('canvas', root), ctx = cv.getContext('2d');
    const gemsEl = $('.cr-gems', root), lightEl = $('.cr-light', root), msgEl = $('.cr-msg', root), countEl = $('.cr-count', root);
    const placeEl = $('.cr-place', root), barEl = $('.cr-bar', root);
    const goBtn = $('.cr-go', root), stopBtn = $('.cr-stop', root);

    let W, H, roadW, roadX, laneW, carY, cw, ch, DPR;
    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      roadW = Math.min(W * .62, 480); laneW = roadW / 3; roadX = (W - roadW) / 2;
      cw = Math.min(laneW * .56, 64, H * .13); ch = cw * 1.7;
      carY = Math.max(H * .45, Math.min(H * .66, H - 140 - ch / 2)); // לא מתחת לכפתורים במסך נמוך
    }
    resize(); s.on(window, 'resize', resize);
    const laneX = l => roadX + laneW * (l + .5);

    // יחידות מהירות ביחס לגובה המסך, כך שהמרוץ נמשך כ־2 דקות בכל מסך
    const CRUISE = () => H * .68, FAST = () => H * 1.0, ACC = () => H * .5, BR = () => H * 1.5, BOOST = () => H * .22;
    const TRACK = () => H * 104;

    let myColor = CAR_COLORS[0], running = false, started = false;
    let dist = 0, speed = 0, lane = 1, px = 0, stopped = false, turbo = false, boostT = 0;
    let lights = [], rivals = [], gems = [], parts = [], finished = 0, place = 6, lastPassMsg = 0;
    let gemCount = 0, streak = 0, lastHonk = 0, t = 0, done = false, saidHalf = false, saidNear = false, nextGem = 0;

    let msgT = 0;
    function msg(text, ms = 1800) {
      msgEl.textContent = text; msgEl.classList.add('on'); clearTimeout(msgT);
      msgT = s.later(() => msgEl.classList.remove('on'), ms);
    }

    // ===== בחירת מכונית =====
    function carPicker() {
      running = false; started = false;
      const p = el('div', 'picker carpick', `<h3>איזו מכונית? 🏎️</h3><div class="opts"></div>`);
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
      dist = 0; speed = 0; lane = 1; px = laneX(1); stopped = false; turbo = false; boostT = 0;
      lights = [.34, .68].map(f => ({ d: TRACK() * f, state: 'green', t: 0, wait: 0, triggered: false }));
      // הקו: אורי מתחילה אחרונה, כדי שיהיה את מי לעקוף
      const grid = [[0, 1.5], [2, 1.5], [1, 3], [0, 4.5], [2, 4.5]];
      const bases = shuffle([.62, .7, .78, .86, .92]);
      // לכל מתחרה מרחק והמתנה משלו, כדי שלא ייצרו "קיר" על כל הנתיבים
      rivals = RIVALS.map(([e, c], i) => ({ e, c, lane: grid[i][0], x: laneX(grid[i][0]), d: grid[i][1] * ch * 1.2, speed: 0, base: bases[i], cool: 0, fin: 0, far: 1.8 + i * .7, slow: .5 + i * .03 }));
      gems = []; parts = []; finished = 0; place = 6; done = false; saidHalf = saidNear = false;
      gemCount = 0; streak = 0; gemsEl.querySelector('b').textContent = 0; nextGem = H * 1.2;
      running = true; started = false;
      countdown();
    }

    function countdown() {
      const steps = ['3', '2', '1', 'סעים! 🏁'];
      steps.forEach((txt, i) => s.later(() => {
        countEl.textContent = txt; countEl.classList.remove('on'); void countEl.offsetWidth; countEl.classList.add('on');
        if (i < 3) { Voice.say(L.count[i]); Sound.tone(520, .2, { type: 'square', vol: .08 }); }
        else { Voice.say(L.go); Sound.tone(1040, .4, { type: 'square', vol: .1 }); Sound.vroom(); started = true; goBtn.classList.add('hint'); }
      }, i * 1000));
      s.later(() => { countEl.classList.remove('on'); msg('החזיקי 🚀 כדי לנסוע מהר!', 2600); }, 4200);
      s.later(() => { if (running && !done) Voice.say(L.start); }, 4400);
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
    // משחק מהמסך עצמו: החלקה ימינה/שמאלה מחליפה נתיב, החזקה על הכביש נוסעת מהר, נגיעה קצרה בצד מחליפה נתיב
    let cvp = null;
    cv.addEventListener('pointerdown', e => {
      if (!running) return; e.preventDefault(); Sound.init(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      const q = cvp = { id: e.pointerId, sx: e.clientX, x: e.clientX, t: performance.now(), swiped: false, held: false };
      s.later(() => { if (cvp === q && !q.swiped && Math.abs(q.x - q.sx) < 25) { q.held = true; go(); } }, 260);
    });
    cv.addEventListener('pointermove', e => {
      const q = cvp; if (!q || q.id !== e.pointerId) return; q.x = e.clientX;
      const dx = e.clientX - q.sx;
      if (Math.abs(dx) > 40) { changeLane(Math.sign(dx)); q.swiped = true; q.sx = e.clientX; }
    });
    ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, e => {
      const q = cvp; if (!q || q.id !== e.pointerId) return; cvp = null;
      if (q.held) turbo = false;
      else if (!q.swiped && performance.now() - q.t < 260) { const r = cv.getBoundingClientRect(); changeLane(e.clientX - r.left < r.width / 2 ? -1 : 1); }
    }));

    function go() {
      if (!running || !started) return;
      goBtn.classList.remove('hint');
      if (stopped) { stopped = false; Sound.vroom(); }
      turbo = true;
      const AL = lights.find(L => L.triggered && L.state === 'red' && L.d > dist);
      if (AL) { msg('מחכים לירוק 🙂'); Voice.say(L.wait); }
    }
    function brake() {
      if (!running || !started) return;
      stopped = true; turbo = false; stopBtn.classList.remove('hint');
      const LL = lights.find(x => x.triggered && x.state !== 'green' && !x.rewarded && x.d - dist > 0 && x.d - dist < H * 1.3);
      if (LL) {
        LL.rewarded = true; msg('כל הכבוד! עצרת ברמזור ⭐'); Voice.say(L.stoppedWell);
        const c = center(lightEl); Stars.add(c.x, c.y, 1); Sound.chime();
      }
    }
    function changeLane(dir) {
      if (!running || !started || done) return;
      const nl = lane + dir; if (nl < 0 || nl > 2) { Sound.boing(); return; }
      if (rivals.some(r => r.lane === nl && Math.abs(r.d - dist) < ch * 1.15)) { Sound.honk(); msg('בִּיפּ בִּיפּ! יש שם מכונית 🚙'); return; }
      lane = nl; Sound.tone(500 + dir * 80, .1, { type: 'triangle', vol: .1 });
    }

    // ===== עזר =====
    const lightCap = (front) => {
      let cap = Infinity;
      lights.forEach(LL => { if (LL.state === 'green') return; const gap = LL.d - front - 8; if (gap > -4) cap = Math.min(cap, Math.sqrt(2 * BR() * Math.max(0, gap))); });
      return cap;
    };
    const follow = (aheadSpeed, gap) => aheadSpeed + Math.sqrt(2 * BR() * Math.max(0, gap));

    function spawnGems() {
      while (dist + H * 1.3 > nextGem && nextGem < TRACK() - H) {
        const l = randi(0, 2), n = randi(3, 5);
        if (!lights.some(LL => Math.abs(LL.d - nextGem) < H * .6))
          for (let i = 0; i < n; i++) gems.push({ lane: l, d: nextGem + i * ch * .9, c: pick(['#4cc9f0', '#ff70a6', '#b388ff', '#2ee8b6']) });
        nextGem += H * rand(1.4, 2.2);
      }
    }

    // ===== עדכון =====
    function update(dt) {
      t += dt;
      if (!started) return;
      spawnGems();
      const front = dist + ch / 2, TR = TRACK();

      // רמזורים
      lights.forEach(LL => {
        const ahead = LL.d - front;
        if (!LL.triggered && ahead < H * .95 && ahead > 0) {
          LL.triggered = true; LL.state = 'yellow'; LL.t = 0; Sound.tone(880, .15, { type: 'square', vol: .06 });
          msg('🚦 רמזור! צריך לעצור', 2000); Voice.say(L.light); stopBtn.classList.add('hint');
        }
        if (!LL.triggered) return;
        LL.t += dt;
        if (LL.state === 'yellow' && LL.t > .8) { LL.state = 'red'; LL.t = 0; }
        if (LL.state === 'red') {
          if (speed < 6) LL.wait += dt;
          if (LL.wait > 2.2 || LL.t > 8) {
            LL.state = 'green'; stopBtn.classList.remove('hint'); Sound.chime();
            msg('🟢 ירוק! סעים!', 2000); Voice.say(L.green);
            if (stopped) goBtn.classList.add('hint');
          }
          if (speed < 4 && !LL.rewarded && !LL.told && ahead < ch) { LL.told = true; msg('🔴 באדום עוצרים ומחכים'); Voice.say(L.redStop); }
        }
      });
      const AL = lights.find(LL => LL.triggered && LL.d - dist > -ch * .5 && LL.d - dist < H * 1.2);
      if (AL) { lightEl.classList.add('on'); lightEl.dataset.s = AL.state; } else lightEl.classList.remove('on');

      // השחקנית
      boostT = Math.max(0, boostT - dt);
      let target = done ? CRUISE() * .5 : stopped ? 0 : (turbo ? FAST() : CRUISE()) + (boostT > 0 ? BOOST() : 0);
      let cap = done ? Infinity : lightCap(front);
      rivals.forEach(r => {
        if (Math.abs(r.x - px) > laneW * .6) return;
        const gap = (r.d - ch / 2) - front - ch * .25;
        if (gap > -ch) {
          cap = Math.min(cap, follow(r.speed, gap));
          if (gap < ch * 1.2 && speed > r.speed + 10 && t - lastHonk > 3.5) { lastHonk = t; Sound.honk(); msg('בִּיפּ בִּיפּ! עקפי מהצד ⬅️➡️'); Voice.say(L.beep); }
        }
      });
      target = Math.min(target, cap);
      if (speed < target) speed = Math.min(target, speed + ACC() * dt);   // תאוצה הדרגתית
      else speed = Math.max(target, speed - BR() * 1.6 * dt);
      speed = Math.min(speed, cap);
      dist += speed * dt;
      const tx = laneX(lane), step = laneW * 5 * dt;
      px = Math.abs(tx - px) < step ? tx : px + Math.sign(tx - px) * step;

      // המתחרים
      const near = dist > TR * .75;
      rivals.forEach(r => {
        const gapToMe = r.d - dist;
        let tg = r.base * H;
        if (gapToMe > H * r.far) tg = Math.min(tg, H * (near ? r.slow - .08 : r.slow));  // מחכים לה כשהם רחוק מלפנים
        else if (near && gapToMe > 0) tg = Math.min(tg, H * r.slow);        // בסוף קל יותר לעקוף
        else if (near) tg = Math.min(tg, Math.max(speed * .95, H * .3));    // ובסוף לא עוקפים אותה בחזרה
        else if (gapToMe < 0 && gapToMe > -H * 2.5) tg = Math.min(Math.max(tg, speed * 1.04), r.base * H * 1.15);  // דו־קרב: מי שקרוב מאחור לוחץ
        else if (gapToMe < -H * 3) tg *= 1.12;                             // מי שנשאר הרחק מאחור מתקרב
        if (r.fin) tg = Math.max(0, H * .3 * (1 - (r.d - TR) / (H * 1.5)));
        let rc = r.fin ? Infinity : lightCap(r.d + ch / 2);
        const others = rivals.filter(o => o !== r).map(o => ({ x: o.x, lane: o.lane, d: o.d, speed: o.speed }))
          .concat([{ x: px, lane, d: dist, speed }]);
        let blocked = null;
        others.forEach(o => {
          if (Math.abs(o.x - r.x) > laneW * .6 || o.d <= r.d) return;
          const gap = o.d - r.d - ch * 1.3;
          rc = Math.min(rc, follow(o.speed, gap));
          if (gap < ch * 1.5 && o.speed < tg - 5) blocked = o;
        });
        // מתחרה חסום מנסה לעקוף בנתיב פנוי
        r.cool -= dt;
        // מתחרה שהיא תקועה מאחוריו זז הצידה, כדי שגם מי שרק נוסעת תוכל לעקוף
        const meBehind = Math.abs(px - r.x) < laneW * .6 && r.d - dist > 0 && r.d - dist < ch * 2.2 && speed > 5;
        if ((blocked || meBehind) && r.cool <= 0 && !r.fin) {
          const opts = shuffle([r.lane - 1, r.lane + 1].filter(l => l >= 0 && l <= 2));
          for (const nl of opts) {
            if (others.every(o => o.lane !== nl || Math.abs(o.d - r.d) > ch * 1.8) && Math.abs(laneX(nl) - px) + Math.abs(dist - r.d) > ch) { r.lane = nl; break; }
          }
          r.cool = 1.4;
        }
        tg = Math.min(tg, rc);
        r.speed += Math.max(-BR() * 1.6 * dt, Math.min(ACC() * .9 * dt, tg - r.speed));
        r.speed = Math.max(0, Math.min(r.speed, rc));
        r.d += r.speed * dt;
        const rx = laneX(r.lane), rs = laneW * 3 * dt;
        r.x = Math.abs(rx - r.x) < rs ? rx : r.x + Math.sign(rx - r.x) * rs;
        if (!r.fin && r.d >= TR) r.fin = ++finished;
      });

      // יהלומים = דחיפה קטנה קדימה
      gems = gems.filter(g => {
        if (g.d < dist - H * .5) { streak = 0; return false; }
        if (Math.abs(g.d - dist) < ch * .55 && Math.abs(laneX(g.lane) - px) < laneW * .45) {
          gemCount++; streak++; boostT = 1.3;
          Sound.ding(Math.min(streak, 12));
          for (let i = 0; i < 8; i++) parts.push({ x: laneX(g.lane), y: carY - (g.d - dist), vx: rand(-160, 160), vy: rand(-220, -40), life: .6, c: g.c });
          gemsEl.querySelector('b').textContent = gemCount;
          gemsEl.classList.remove('bump'); void gemsEl.offsetWidth; gemsEl.classList.add('bump');
          return false;
        }
        return true;
      });
      parts = parts.filter(p => (p.life -= dt) > 0);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; });

      // מקום ומרחק
      if (!done) {
        const np = 1 + rivals.filter(r => r.d > dist).length;
        if (np < place && t - lastPassMsg > 2.5) {
          lastPassMsg = t;
          if (np === 1) { msg('🥇 את במקום הראשון!', 2200); Voice.say(L.first); } else { msg('עקפת! 🎉', 1400); Voice.say(L.passed); }
          Sound.sparkle();
        }
        if (np !== place) { place = np; placeEl.querySelector('b').textContent = place; placeEl.classList.remove('bump'); void placeEl.offsetWidth; placeEl.classList.add('bump'); }
        if (!saidHalf && dist > TR * .5) { saidHalf = true; msg('חצי מהדרך! 💪'); Voice.say(L.half); }
        if (!saidNear && dist > TR * .88) { saidNear = true; msg('🏁 עוד קצת לקו הסיום!'); Voice.say(L.near); }
        if (dist >= TR) finishRace();
      }
      renderTrack();
    }

    function renderTrack() {
      const TR = TRACK();
      let html = rivals.map(r => `<i style="left:${Math.min(100, r.d / TR * 100)}%">${r.e}</i>`).join('');
      html += `<i class="me" style="left:${Math.min(100, dist / TR * 100)}%;--c:${myColor}"></i>`;
      barEl.innerHTML = html;
    }

    function finishRace() {
      done = true; turbo = false;
      const myPlace = finished + 1;
      const medal = ['🥇', '🥈', '🥉'][myPlace - 1] || '🏁';
      const line = L.places[Math.min(myPlace, 4) - 1];
      Sound.tada(); const c = center(wrap); FX.confetti(c.x, c.y * .6, 70);
      msg(`${medal} ${line}`, 3000); Voice.say(line);
      s.later(() => celebrate({ emoji: medal, title: line, stars: myPlace <= 2 ? 3 : 2, again: carPicker }), 2600);
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

      // קו התחלה וקו סיום
      [0, TRACK()].forEach((fd, k) => {
        const y = sy(fd), sq = roadW / 12;
        if (y < -sq * 3 || y > H + sq * 3) return;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) { ctx.fillStyle = (r + c) % 2 ? '#222' : '#fff'; ctx.fillRect(roadX + c * sq, y - sq * (r + 1), sq, sq); }
        if (k) { ctx.font = `${sq * 2}px serif`; ctx.textAlign = 'center'; ctx.fillText('🏁', roadX - 30, y); ctx.fillText('🏁', roadX + roadW + 30, y); }
      });
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
      rivals.forEach(r => {
        const y = sy(r.d); if (y < -ch || y > H + ch) return;
        drawCar(ctx, r.x, y, cw, ch, r.c, false);
        ctx.font = `${cw * .62}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(r.e, r.x, y + ch * .1); ctx.textBaseline = 'alphabetic';
      });
      // המכונית שלי
      const tilt = (laneX(lane) - px) / laneW * -.25;
      ctx.save(); ctx.translate(px, carY); ctx.rotate(tilt);
      if (speed > CRUISE() * 1.2) { ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 3; i++) { ctx.fillRect(-cw * .6 + i * cw * .5, ch * .55 + (t * 600 + i * 30) % 40, 4, 18); } }
      drawCar(ctx, 0, 0, cw * 1.06, ch * 1.06, myColor);
      ctx.restore();
      parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / .6); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
    }

    wrap._dbg = () => ({ dist, TR: TRACK(), H, place, done, speed, lane, finished, gaps: rivals.map(r => [r.e, +((r.d - dist) / H).toFixed(1), +(r.speed / H).toFixed(2), r.lane, r.fin]), carsAhead: rivals.filter(r => Math.abs(r.x - px) < laneW * .6 && r.d > dist && r.d - dist < ch * 2.2).length });  // לבדיקות אוטומטיות
    s.onFrame(dt => { if (running) update(dt); draw(); });
    px = laneX(1);
    carPicker();
  }
});
