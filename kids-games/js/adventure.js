'use strict';
/* 🍄 ההרפתקה של נוני – עולם שגולל הצידה: בורות, פטריות ותותים, קופסאות מתנה, חלזונות חביבים.
   אין פסילות: נפילה לבור = ענן מחזיר אחורה; חילזון רק דוחף בעדינות. 3 שלבים, בסוף הבית של נוני. */
const ADV = {
  LEVELS: [{ n: 'שלב ראשון', e: '🌳', len: 90, pit: [2, 2], sky: ['#9fdcff', '#e6f7ff'], hill: '#7dd87a' },
    { n: 'שלב שני', e: '🌅', len: 120, pit: [1, 2], sky: ['#ffb38a', '#ffe3c2'], hill: '#c79bf0' },
    { n: 'שלב שלישי', e: '🍭', len: 150, pit: [2, 2], sky: ['#ff9ed2', '#ffe6f5'], hill: '#ffd166' }],
  lines: ['ההרפתקה של נוני! בחרי שלב', 'שלב ראשון', 'שלב שני', 'שלב שלישי', 'עזרי לנוני להגיע הביתה!', 'לחצי על החץ הגדול כדי לקפוץ',
    'קפצי מעל הבור!', 'אופס! הענן החזיר אותך', 'הענן עזר לך לעבור!', 'פטרייה!', 'מצאת תות בקופסה!', 'קפצי מתחת לקופסה!', 'חילזון! קפצי מעליו', 'קפצת על החילזון!', 'חצי דרך!',
    'הגעת הביתה! כל הכבוד!', 'עברת שלב!', 'סיימת את כל ההרפתקה!']
};

registerGame({
  id: 'adventure', name: 'ההרפתקה של נוני', emoji: '🍄', color: '#ef8354', say: 'ההרפתקה של נוני! בחרי שלב',
  lines: ADV.lines,
  mount(root, s) {
    const { LEVELS } = ADV;
    const ROWS = 9, GR = 7;            // שורות; שורת הקרקע העליונה
    let gen = 0;   // כל שלב חדש מקבל מספר; לולאות של שלבים קודמים נעצרות

    function chooser() {
      gen++;
      root.innerHTML = `<div class="picker"><h3>🍄 ההרפתקה של נוני</h3><div class="opts">
        ${LEVELS.map((l, i) => `<button class="opt" data-i="${i}" style="--c:${['#7dd87a', '#ffb38a', '#ff9ed2'][i]};--i:${i}"><span class="oe">${l.e}</span>${l.n}${Store.get('advDone', 0) > i ? '<small>✔️</small>' : ''}</button>`).join('')}</div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); play(+b.dataset.i); });
      Voice.say('ההרפתקה של נוני! בחרי שלב');
    }

    function genLevel(lv) {
      const L = LEVELS[lv].len, g = Array.from({ length: ROWS }, () => new Uint8Array(L));
      const items = [], snails = []; let firstPit = -1, firstGift = -1, firstSnail = -1;
      const ground = (c, top = GR) => { for (let r = top; r < ROWS; r++) g[r][c] = 1; };
      let c = 0;
      for (; c < 8; c++) ground(c);
      while (c < L - 14) {
        const k = pick(lv === 0 ? ['flat', 'pit', 'plat', 'gift', 'flat', 'pit'] : ['flat', 'pit', 'plat', 'gift', 'step', 'pit', 'snail']);
        if (k === 'flat' || k === 'snail') {
          const n = randi(4, 7); for (let i = 0; i < n; i++) ground(c + i);
          if (k === 'snail' || (lv === 0 && Math.random() < .35)) { snails.push({ x: c + n / 2, y: GR, dir: -1, hid: 0, min: c + .5, max: c + n - .5 }); if (firstSnail < 0) firstSnail = c; }
          else for (let i = 1; i < n - 1; i += 2) items.push({ x: c + i + .5, y: GR - .6, k: 'mush' });
          c += n;
        } else if (k === 'pit') {
          const w = randi(...LEVELS[lv].pit);
          for (let i = 0; i < w; i++) items.push({ x: c + i + .5, y: GR - 2.4 - Math.sin((i + .5) / w * Math.PI) * 1.2, k: 'berry' });
          if (firstPit < 0) firstPit = c;
          c += w; for (let i = 0; i < 3; i++) ground(c + i); c += 3;
        } else if (k === 'plat') {
          const n = 7; for (let i = 0; i < n; i++) ground(c + i);
          for (let i = 1; i <= 4; i++) g[GR - 3][c + i] = 2;
          g[GR - 3][c + 2] = 3; if (firstGift < 0) firstGift = c;
          items.push({ x: c + 1.5, y: GR - 3.6, k: 'mush' }, { x: c + 4.5, y: GR - 3.6, k: 'mush' });
          c += n;
        } else if (k === 'gift') {
          const n = 5; for (let i = 0; i < n; i++) ground(c + i);
          g[GR - 3][c + 2] = 3; if (firstGift < 0) firstGift = c; c += n;
        } else if (k === 'step') {
          for (let i = 0; i < 2; i++) ground(c + i);
          for (let i = 2; i < 6; i++) { ground(c + i, GR - 1); items.push({ x: c + i + .5, y: GR - 1.6, k: 'mush' }); }
          for (let i = 6; i < 8; i++) ground(c + i);
          c += 8;
        }
      }
      for (; c < L; c++) ground(c);
      return { g, L, items, snails, house: L - 6, firstPit, firstGift, firstSnail };
    }

    function play(lv) {
      const my = ++gen;
      const LV = LEVELS[lv], M = genLevel(lv);
      root.innerHTML = `<div class="ad"><canvas></canvas>
        <div class="ad-hud"><span class="lvl">${LV.e} ${LV.n}</span><span class="cnt">🍄 <b>0</b></span><span class="cnt">🍓 <b>0</b></span></div>
        <div class="ad-prog"><i></i><span>🏠</span></div>
        <div class="ad-move"><button class="cr-btn ad-l" aria-label="שמאלה">⬅️</button><button class="cr-btn ad-r" aria-label="ימינה">➡️</button></div>
        <button class="ad-jump" aria-label="קפיצה">⬆️</button></div>`;
      const wrap = $('.ad', root), cv = $('canvas', root), ctx = cv.getContext('2d');
      const [mushEl, berryEl] = $$('.ad-hud .cnt b', root), progEl = $('.ad-prog i', root);
      let W, H, T, DPR, OY = 0;
      function resize() {
        DPR = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight;
        cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        T = Math.min(H / ROWS, W / 10); OY = (H - ROWS * T) * .55;   // במסך צר: אריחים קטנים יותר, העולם בתחתית ושמיים מעליו
      }
      resize(); s.on(window, 'resize', resize);

      const hero = { x: 2, y: GR, vx: 0, vy: 0, w: .7, h: .9, on: true, dir: 1, squash: 1, safe: 2 };
      const fails = {};
      let dir = 0, jumpHeld = false, jumpQueued = false, t = 0, cam = 0, mush = 0, berry = 0, won = false, cloudT = 0, said = {}, parts = [], pops = [];

      // ===== שליטה =====
      const hold = (btn, d) => {
        btn.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); dir = d; btn.classList.add('down'); try { btn.setPointerCapture(e.pointerId); } catch (_) {} });
        const up = () => { if (dir === d) dir = 0; btn.classList.remove('down'); };
        btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
      };
      hold($('.ad-l', root), -1); hold($('.ad-r', root), 1);
      const jb = $('.ad-jump', root);
      jb.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); jumpHeld = true; jumpQueued = true; jb.classList.add('down'); try { jb.setPointerCapture(e.pointerId); } catch (_) {} });
      ['pointerup', 'pointercancel'].forEach(ev => jb.addEventListener(ev, () => { jumpHeld = false; jb.classList.remove('down'); }));
      // נגיעה בלוח: צד ימין/שמאל = הליכה, נגיעה נוספת = קפיצה
      cv.addEventListener('pointerdown', e => { Sound.init(); const r = cv.getBoundingClientRect(); if (dir !== 0) { jumpQueued = true; jumpHeld = true; } else dir = e.clientX - r.left < r.width / 2 ? -1 : 1; });
      ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { jumpHeld = false; }));
      s.on(window, 'keydown', e => {
        if (e.key === 'ArrowLeft') dir = -1; else if (e.key === 'ArrowRight') dir = 1;
        else if ((e.key === 'ArrowUp' || e.key === ' ') && !e.repeat) { jumpQueued = true; jumpHeld = true; }
      });
      s.on(window, 'keyup', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dir = 0; if (e.key === 'ArrowUp' || e.key === ' ') jumpHeld = false; });

      const solid = (c, r) => c < 0 || (r >= 0 && r < ROWS && c < M.L && M.g[r][c] > 0);
      const scr = (x, y) => { const r = cv.getBoundingClientRect(); return [r.left + (x - cam) * T, r.top + OY + y * T]; };

      function update(dt) {
        t += dt; cloudT = Math.max(0, cloudT - dt);
        if (won) { hero.squash += (1 - hero.squash) * .2; return; }
        const RUN = 5.8, G = 32, JV = 13.8;
        hero.vx += (dir * RUN - hero.vx) * Math.min(1, dt * (hero.on ? 10 : 5));
        if (dir) hero.dir = dir;
        if (jumpQueued && hero.on) { hero.vy = -JV; hero.on = false; hero.squash = 1.25; Sound.tone(330, .18, { to: 700, vol: .12 }); }
        jumpQueued = false;
        if (!jumpHeld && hero.vy < -4) hero.vy *= .6;     // לחיצה קצרה = קפיצה נמוכה
        hero.vy = Math.min(hero.vy + G * dt, 20);
        // ציר X
        hero.x += hero.vx * dt;
        const top = hero.y - hero.h, bot = hero.y - .02;
        for (const r of [Math.floor(top), Math.floor(bot)]) {
          if (hero.vx > 0 && solid(Math.floor(hero.x + hero.w / 2), r)) { hero.x = Math.floor(hero.x + hero.w / 2) - hero.w / 2 - .001; hero.vx = 0; }
          if (hero.vx < 0 && solid(Math.floor(hero.x - hero.w / 2), r)) { hero.x = Math.floor(hero.x - hero.w / 2) + 1 + hero.w / 2 + .001; hero.vx = 0; }
        }
        // ציר Y
        hero.y += hero.vy * dt;
        const cl = Math.floor(hero.x - hero.w / 2 + .06), cr = Math.floor(hero.x + hero.w / 2 - .06);
        const wasOn = hero.on; hero.on = false;
        if (hero.vy >= 0) {
          const r = Math.floor(hero.y);
          if (solid(cl, r) || solid(cr, r)) { hero.y = r; if (!wasOn && hero.vy > 6) hero.squash = .72; hero.vy = 0; hero.on = true; if (M.g[GR] && solid(Math.floor(hero.x), r)) hero.safe = hero.x; }
        } else {
          const r = Math.floor(hero.y - hero.h);
          for (const c of [cl, cr]) if (solid(c, r)) {
            hero.y = r + 1 + hero.h; hero.vy = 0;
            if (M.g[r][c] === 3) { // קופסת מתנה – קופץ תות
              M.g[r][c] = 4; berry++; berryEl.textContent = berry; Sound.chime();
              pops.push({ x: c + .5, y: r - .2, life: 1 });
              const [px, py] = scr(c + .5, r); FX.burst(px, py, ['🍓', '✨'], 8, 30);
              Voice.say(berry === 1 ? 'מצאת תות בקופסה!' : pick(PRAISE));
            } else Sound.tone(160, .08, { vol: .1 });
            break;
          }
        }
        hero.squash += (1 - hero.squash) * Math.min(1, dt * 9);
        // בור – ענן מחזיר
        if (hero.y > ROWS + 1.5) {
          const key = Math.round(hero.safe);
          fails[key] = (fails[key] || 0) + 1;
          hero.y = 2; hero.vy = 0; hero.vx = 0; cloudT = 1.6; Sound.boing();
          if (fails[key] >= 2) {
            // אחרי שתי נפילות באותו בור – הענן מעביר לצד השני
            let c = Math.floor(hero.safe); while (c < M.L - 1 && solid(c, GR)) c++; while (c < M.L - 1 && !solid(c, GR)) c++;
            hero.x = c + 1.5; hero.safe = hero.x; Voice.say('הענן עזר לך לעבור!');
          } else {
            hero.x = Math.max(1.5, hero.safe - 1.2); Voice.say('אופס! הענן החזיר אותך');
            // מוודאים שנוחתים על קרקע
            while (hero.x > 1 && !solid(Math.floor(hero.x), GR) && !solid(Math.floor(hero.x), GR - 1)) hero.x -= 1;
          }
        }
        // חלזונות
        M.snails.forEach(sn => {
          sn.hid = Math.max(0, sn.hid - dt);
          if (!sn.hid) { sn.x += sn.dir * .9 * dt; if (sn.x < sn.min || sn.x > sn.max) sn.dir *= -1; }
          const dx = hero.x - sn.x, dy = hero.y - sn.y;
          if (Math.abs(dx) < .7 && dy > -.8 && dy < .2) {
            if (hero.vy > 1 && dy < -.25) {
              sn.hid = 2.5; hero.vy = -10; hero.on = false; Sound.tone(500, .15, { to: 900, vol: .12 });
              const [px, py] = scr(sn.x, sn.y - .5); FX.burst(px, py, ['⭐', '💖'], 8, 28);
              if (!said.stomp) { said.stomp = 1; Voice.say('קפצת על החילזון!'); } else if (Math.random() < .4) praise(px, py);
            } else if (!sn.hid && Math.abs(hero.vx) > .2 || Math.abs(dx) < .5) {
              hero.vx = Math.sign(dx || -sn.dir) * 4; hero.x += Math.sign(dx || -sn.dir) * .05; if (t - (sn.bumpT || 0) > 1) { sn.bumpT = t; Sound.boing(); }
            }
          }
        });
        // איסוף
        M.items = M.items.filter(it => {
          if (Math.abs(it.x - hero.x) > .7 || Math.abs(it.y - (hero.y - .45)) > .8) return true;
          const [px, py] = scr(it.x, it.y);
          if (it.k === 'mush') { mush++; mushEl.textContent = mush; Sound.ding(mush % 12); if (mush === 1) Voice.say('פטרייה!'); else if (mush % 8 === 0) praise(px, py); }
          else { berry++; berryEl.textContent = berry; Sound.ding((berry + 5) % 12); }
          for (let i = 0; i < 6; i++) parts.push({ x: it.x, y: it.y, vx: rand(-3, 3), vy: rand(-5, -1), life: .5, c: it.k === 'mush' ? '#ff6b6b' : '#ff4d8d' });
          return false;
        });
        parts = parts.filter(p => (p.life -= dt) > 0); parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 14 * dt; });
        pops = pops.filter(p => (p.life -= dt) > 0); pops.forEach(p => p.y -= dt * 2);
        // רמזים קוליים בפעם הראשונה
        if (!said.pit && M.firstPit > 0 && hero.x > M.firstPit - 3) { said.pit = 1; Voice.say('קפצי מעל הבור!'); }
        if (!said.gift && M.firstGift > 0 && hero.x > M.firstGift) { said.gift = 1; Voice.say('קפצי מתחת לקופסה!'); }
        if (!said.snail && M.firstSnail > 0 && hero.x > M.firstSnail - 3) { said.snail = 1; Voice.say('חילזון! קפצי מעליו'); }
        if (!said.half && hero.x > M.L / 2) { said.half = 1; Voice.say('חצי דרך!'); }
        progEl.style.width = Math.min(100, hero.x / M.house * 100) + '%';
        const view = W / T; cam += (Math.max(0, Math.min(M.L - view, hero.x - view * .38)) - cam) * Math.min(1, dt * 6);
        if (hero.x >= M.house) win();
      }

      function win() {
        won = true; Sound.tada(); Store.set('advDone', Math.max(Store.get('advDone', 0), lv + 1));
        const [x, y] = scr(hero.x, hero.y - 1); FX.confetti(x, y, 80); FX.rain(['🎈', '⭐', '🍓', '🍄'], 30, 2.2);
        Voice.say(['הגעת הביתה! כל הכבוד!', pick(PRAISE)]); Stars.add(x, y, lv + 1);
        s.later(() => {
          if (lv < 2) celebrate({ emoji: '🏠', title: 'עברת שלב!', stars: 3, again: () => play(lv + 1) });
          else celebrate({ emoji: '🏆', title: 'סיימת את כל ההרפתקה!', stars: 3, again: chooser });
        }, 2400);
      }

      function draw() {
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, LV.sky[0]); g.addColorStop(1, LV.sky[1]);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // רקע בשכבות
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        for (let i = 0; i < 8; i++) { const x = ((i * 260 - cam * T * .2) % (W + 300) + W + 300) % (W + 300) - 150, y = H * (.12 + (i % 3) * .08); ctx.beginPath(); ctx.ellipse(x, y, 60, 20, 0, 0, 7); ctx.ellipse(x + 30, y - 12, 36, 18, 0, 0, 7); ctx.fill(); }
        ctx.fillStyle = LV.hill; ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, OY + ROWS * T * .62 - Math.sin((x + cam * T * .4) / 140) * H * .08 - Math.sin((x + cam * T * .4) / 53) * H * .02);
        ctx.lineTo(W, H); ctx.fill(); ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(0, OY);
        // אריחים
        const c0 = Math.max(0, Math.floor(cam) - 1), c1 = Math.min(M.L, Math.ceil(cam + W / T) + 1);
        for (let c = c0; c < c1; c++) for (let r = 0; r < ROWS; r++) {
          const v = M.g[r][c]; if (!v) continue;
          const x = (c - cam) * T, y = r * T;
          if (v === 1) {
            ctx.fillStyle = '#b5774a'; ctx.fillRect(x, y, T + 1, r === ROWS - 1 ? H : T + 1);   // השורה התחתונה ממשיכה עד תחתית המסך
            ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.beginPath(); ctx.arc(x + T * .3, y + T * .6, T * .08, 0, 7); ctx.arc(x + T * .72, y + T * .35, T * .06, 0, 7); ctx.fill();
            if (r === 0 || !M.g[r - 1][c]) { ctx.fillStyle = '#5cc64b'; ctx.fillRect(x, y, T + 1, T * .28); ctx.fillStyle = '#4bb33b'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + T * (k + .5) / 4, y + T * .28, T * .09, 0, Math.PI); ctx.fill(); } }
          } else {
            ctx.fillStyle = v === 2 ? '#ff9ec7' : v === 3 ? '#ffd23f' : '#d9d0e6';
            rrect(ctx, x + 2, y + 2, T - 4, T - 4, T * .18); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 3; ctx.stroke();
            if (v === 3) { ctx.fillStyle = '#000'; ctx.font = `${T * .7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎁', x + T / 2, y + T / 2 + Math.sin(t * 5) * 2); ctx.textBaseline = 'alphabetic'; }
            if (v === 2) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x + T * .15, y + T * .15, T * .3, T * .12); }
          }
        }
        // הבית (אימוג׳ים בקנבס מקבלים את השקיפות של צבע המילוי – מאפסים לאטום)
        ctx.fillStyle = '#000'; ctx.globalAlpha = 1;
        const hx = (M.house - cam) * T;
        if (hx > -T * 4 && hx < W + T * 4) {
          ctx.font = `${T * 2.6}px serif`; ctx.textAlign = 'center'; ctx.fillText('🏠', hx + T, GR * T - T * .1);
          ctx.font = `${T}px serif`; ctx.fillText('🎈', hx - T * .4, GR * T - T * 2.6 + Math.sin(t * 2) * 4); ctx.fillText('🎈', hx + T * 2.4, GR * T - T * 2.9 + Math.cos(t * 2) * 4);
        }
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        M.items.forEach(it => { const x = (it.x - cam) * T; if (x < -T || x > W + T) return; ctx.font = `${T * .7}px serif`; ctx.fillText(it.k === 'mush' ? '🍄' : '🍓', x, it.y * T + Math.sin(t * 4 + it.x) * T * .06); });
        pops.forEach(p => { ctx.globalAlpha = p.life; ctx.font = `${T * .8}px serif`; ctx.fillText('🍓', (p.x - cam) * T, p.y * T); }); ctx.globalAlpha = 1;
        M.snails.forEach(sn => {
          const x = (sn.x - cam) * T; if (x < -T || x > W + T) return;
          ctx.save(); ctx.translate(x, sn.y * T - T * .38); if (sn.dir > 0) ctx.scale(-1, 1);
          ctx.font = `${T * .8}px serif`; ctx.fillText(sn.hid ? '🐚' : '🐌', 0, 0); ctx.restore();
        });
        ctx.textBaseline = 'alphabetic';
        parts.forEach(p => { ctx.globalAlpha = p.life / .5; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc((p.x - cam) * T, p.y * T, 4, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
        // נוני (+ ענן אחרי נפילה)
        const nx = (hero.x - cam) * T, ny = hero.y * T;
        if (cloudT > 0) drawCloud(ctx, nx - T * .8, ny - T * .05, T * 1.6, T * .4, '#fff');
        drawNoni(ctx, nx, ny, T * .95, { squash: hero.squash, dir: hero.dir, t, happy: won });
        ctx.restore();
      }

      s.onFrame(dt => { if (my !== gen) return; update(dt); draw(); });
      Voice.say([LV.n, 'עזרי לנוני להגיע הביתה!', 'לחצי על החץ הגדול כדי לקפוץ']);
      wrap._dbg = () => ({ x: hero.x, y: hero.y, on: hero.on, L: M.L, house: M.house, won, g: M.g, mush, berry });  // לבדיקות אוטומטיות
    }
    chooser();
  }
});
