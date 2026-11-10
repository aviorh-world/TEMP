'use strict';
/* ✏️ אותיות – ינשוף מדבר, מראה אות מקווקוות, והילדה מציירת עליה עם האצבע */
registerGame({
  id: 'letters', name: 'אותיות', emoji: '✏️', color: '#7b61ff', say: 'בואי נלמד אותיות!',
  mount(root, s) {
    // [אות, שם עם ניקוד, מילה, אימוג׳י]
    const L = [
      ['א', 'אָלֶף', 'אריה', '🦁'], ['ב', 'בֵּית', 'בננה', '🍌'], ['ג', 'גִּימֶל', 'גמל', '🐫'], ['ד', 'דָּלֶת', 'דג', '🐟'],
      ['ה', 'הֵא', 'הר', '⛰️'], ['ו', 'וָו', 'ורד', '🌹'], ['ז', 'זַיִן', 'זברה', '🦓'], ['ח', 'חֵית', 'חתול', '🐱'],
      ['ט', 'טֵית', 'טלפון', '📱'], ['י', 'יוּד', 'יד', '✋'], ['כ', 'כָּף', 'כדור', '⚽'], ['ל', 'לָמֶד', 'לב', '❤️'],
      ['מ', 'מֵם', 'מטריה', '☂️'], ['נ', 'נוּן', 'נר', '🕯️'], ['ס', 'סָמֶךְ', 'סוס', '🐴'], ['ע', 'עַיִן', 'עוגה', '🎂'],
      ['פ', 'פֵּא', 'פרפר', '🦋'], ['צ', 'צָדִי', 'צב', '🐢'], ['ק', 'קוֹף', 'קוף', '🐒'], ['ר', 'רֵישׁ', 'רכבת', '🚂'],
      ['ש', 'שִׁין', 'שמש', '☀️'], ['ת', 'תָּו', 'תפוח', '🍎']
    ];
    const FINAL = { 'ך': 'כָּף סוֹפִית', 'ם': 'מֵם סוֹפִית', 'ן': 'נוּן סוֹפִית', 'ף': 'פֵּא סוֹפִית', 'ץ': 'צָדִי סוֹפִית' };
    const info = ch => { const r = L.find(x => x[0] === ch); return r ? { ch, name: r[1], word: r[2], emo: r[3] } : { ch, name: FINAL[ch] || ch, word: '', emo: '' }; };
    const FONT = '"Varela Round", "Arial Hebrew", Arial, sans-serif';
    const ROUND = 5, NEED = .7;

    let kidName = Store.get('kidname', 'אורי');

    /* ---------- מסך בחירה ---------- */
    function chooser() {
      root.innerHTML = `<div class="picker"><h3>🦉 מה נלמד היום?</h3><div class="opts">
        <button class="opt" data-k="abc" style="--c:#7b61ff;--i:0"><span class="oe" style="color:#7b61ff;font-weight:bold">אב</span>אותיות</button>
        <button class="opt" data-k="name" style="--c:#ff70a6;--i:1"><span class="oe">👧</span><span class="nm"></span></button></div>
        <button class="lt-rename">✏️ לשנות שם</button></div>`;
      $('.nm', root).textContent = kidName;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); b.dataset.k === 'abc' ? play(shuffle(L.map(x => x[0])).slice(0, ROUND), false) : play([...kidName.replace(/\s/g, '')], true); });
      $('.lt-rename', root).onclick = () => {
        const n = (prompt('מה השם? (בעברית)', kidName) || '').trim();
        if (n && /^[א-ת ]{1,12}$/.test(n)) { kidName = n; Store.set('kidname', n); $('.nm', root).textContent = n; }
      };
      Voice.say('מה נלמד היום? אותיות, או השם שלך?');
    }

    /* ---------- משחק ---------- */
    function play(seq, isName) {
      root.innerHTML = `<div class="lt">
        <div class="lt-top"><div class="lt-owl">🦉</div><div class="lt-bubble"></div></div>
        ${isName ? `<div class="lt-name">${seq.map((c, i) => `<span data-i="${i}">${c}</span>`).join('')}</div>` : `<div class="sh-dots">${seq.map(() => '<i></i>').join('')}</div>`}
        <div class="lt-board"><canvas class="lt-bg"></canvas><canvas class="lt-ink"></canvas><div class="lt-word"></div></div>
        <div class="lt-ctrl"><button class="lt-say" aria-label="שוב">🔊</button><button class="lt-clear" aria-label="מחק">🧽</button><button class="lt-next" aria-label="הבא">⏭️</button></div>
      </div>`;
      const board = $('.lt-board', root), bg = $('.lt-bg', root), ink = $('.lt-ink', root), wordEl = $('.lt-word', root);
      const bubble = $('.lt-bubble', root), owl = $('.lt-owl', root);
      const bctx = bg.getContext('2d'), ictx = ink.getContext('2d');
      const check = document.createElement('canvas'), cctx = check.getContext('2d', { willReadFrequently: true });
      let idx = 0, cur = null, S = 0, DPR = 1, pts = [], fs = 0, done = false, hue = 0, lastP = null, drawId = null, idleT = 0, saidHalf = false, moves = 0;

      function talk(text, voice = text) {
        bubble.textContent = text; bubble.classList.remove('bounce'); void bubble.offsetWidth; bubble.classList.add('bounce');
        owl.classList.remove('talk'); void owl.offsetWidth; owl.classList.add('talk');
        Voice.say(voice);
      }

      function size() {
        const r = board.getBoundingClientRect();
        S = Math.floor(Math.min(r.width, r.height)); DPR = Math.min(2, window.devicePixelRatio || 1);
        [bg, ink].forEach(c => { c.width = S * DPR; c.height = S * DPR; c.style.width = c.style.height = S + 'px'; });
        bctx.setTransform(DPR, 0, 0, DPR, 0, 0); ictx.setTransform(DPR, 0, 0, DPR, 0, 0);
        check.width = check.height = S;
      }

      // מיקום האות במרכז הלוח
      function place(ctx, ch) {
        ctx.font = `${fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.direction = 'rtl';
        const m = ctx.measureText(ch);
        return S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
      }

      function drawLetter(filled) {
        const ch = cur.ch;
        bctx.clearRect(0, 0, S, S);
        // קווי מחברת עדינים
        bctx.strokeStyle = 'rgba(123,97,255,.10)'; bctx.lineWidth = 2;
        for (let y = S * .2; y < S; y += S * .2) { bctx.beginPath(); bctx.moveTo(S * .05, y); bctx.lineTo(S * .95, y); bctx.stroke(); }
        const y = place(bctx, ch);
        if (filled) {
          const g = bctx.createLinearGradient(0, 0, S, S);
          ['#ff70a6', '#ffc300', '#2ec27e', '#3a86ff', '#9b5de5'].forEach((c, i) => g.addColorStop(i / 4, c));
          bctx.fillStyle = g; bctx.fillText(ch, S / 2, y);
          bctx.lineWidth = 4; bctx.strokeStyle = '#fff'; bctx.setLineDash([]); bctx.strokeText(ch, S / 2, y);
        } else {
          bctx.fillStyle = '#efeaff'; bctx.fillText(ch, S / 2, y);
          bctx.setLineDash([S * .025, S * .02]); bctx.lineCap = 'round'; bctx.lineWidth = Math.max(3, S * .009);
          bctx.strokeStyle = '#7b61ff'; bctx.strokeText(ch, S / 2, y); bctx.setLineDash([]);
        }
      }

      // נקודות דגימה בתוך האות – לפיהן בודקים כמה כוסה
      function buildMask() {
        cctx.clearRect(0, 0, S, S); cctx.fillStyle = '#000';
        const y = place(cctx, cur.ch); cctx.fillText(cur.ch, S / 2, y);
        const d = cctx.getImageData(0, 0, S, S).data, step = Math.max(3, Math.round(S / 120));
        pts = [];
        for (let yy = 0; yy < S; yy += step) for (let xx = 0; xx < S; xx += step) if (d[(yy * S + xx) * 4 + 3] > 140) pts.push([xx, yy]);
        // מסכה מורחבת לזיהוי שרבוט מחוץ לאות
        cctx.clearRect(0, 0, S, S); cctx.lineWidth = S * .09; cctx.lineJoin = 'round'; cctx.strokeStyle = '#000';
        cctx.fillText(cur.ch, S / 2, y); cctx.strokeText(cur.ch, S / 2, y);
        cur.wide = cctx.getImageData(0, 0, S, S).data;
        cctx.clearRect(0, 0, S, S);
      }

      function coverage() {
        const d = cctx.getImageData(0, 0, S, S).data;
        let hitN = 0; for (const [x, y] of pts) if (d[(y * S + x) * 4 + 3] > 0) hitN++;
        let inkN = 0, out = 0; const step = 6;
        for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) { const i = (y * S + x) * 4 + 3; if (d[i] > 0) { inkN++; if (cur.wide[i] === 0) out++; } }
        return { cov: pts.length ? hitN / pts.length : 0, out: inkN ? out / inkN : 0 };
      }

      function clearInk() { ictx.clearRect(0, 0, S, S); cctx.clearRect(0, 0, S, S); saidHalf = false; }

      function start() {
        done = false; cur = info(seq[idx]); size();
        fs = Math.round(S * .74); buildMask(); drawLetter(false); clearInk();
        wordEl.className = 'lt-word'; wordEl.textContent = '';
        if (isName) $$('.lt-name span', root).forEach((e, i) => { e.classList.toggle('cur', i === idx); });
        const intro = isName
          ? (idx === 0 ? `בואי נכתוב את השם ${kidName}! האות הראשונה היא ${cur.name}` : `עכשיו האות ${cur.name}`)
          : `זו האות ${cur.name}. ${cur.name} כמו ${cur.word}! ציירי אותה עם האצבע`;
        talk(isName ? intro : `${cur.ch} – ${cur.name}, כמו ${cur.word} ${cur.emo}`, intro);
        resetIdle();
      }

      function resetIdle() {
        clearTimeout(idleT);
        idleT = s.later(() => { if (!done) { talk('ציירי על הקווים עם האצבע ☝️', 'ציירי על הקווים עם האצבע'); owl.classList.add('wiggle'); } }, 9000);
      }

      function success() {
        done = true; clearTimeout(idleT);
        drawLetter(true); ictx.clearRect(0, 0, S, S);
        Sound.tada();
        const r = board.getBoundingClientRect(); FX.confetti(r.left + r.width / 2, r.top + r.height / 2, 50);
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, ['⭐', '✨', '💖'], 12, 40);
        const praise = pick(['כל הכבוד!', 'וואו! מושלם!', 'איזה יופי!', 'מעולה!']);
        if (isName) {
          const sp = $$('.lt-name span', root)[idx]; sp.classList.remove('cur'); sp.classList.add('ok');
          talk(`${praise} ${cur.name} ✔️`, `${praise} ${cur.name}`);
        } else {
          wordEl.innerHTML = `<span>${cur.emo}</span>${cur.word}`; wordEl.classList.add('on');
          talk(`${praise} ${cur.ch} כמו ${cur.word} ${cur.emo}`, `${praise} ${cur.name}, כמו ${cur.word}`);
          $$('.sh-dots i', root)[idx].classList.add('on');
        }
        Stars.add(r.left + r.width / 2, r.top + r.height / 3, 1);
        s.later(next, 3600);
      }

      function next() {
        idx++;
        if (idx < seq.length) { start(); return; }
        if (isName) {
          talk(`${kidName}! כתבת את השם שלך! 🎉`, `וואו! כתבת את השם שלך! ${kidName}!`);
          const n = $('.lt-name', root); n.classList.add('win');
          s.later(() => celebrate({ emoji: '👧', title: `${kidName}, את כותבת!`, stars: 3, again: chooser }), 3000);
        } else celebrate({ emoji: '🦉', title: 'למדת אותיות!', stars: 3, again: chooser });
      }

      // ציור עם האצבע
      const pos = e => { const r = ink.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      function seg(a, b) {
        const w = Math.max(22, S * .075);
        hue = (hue + 4) % 360;
        ictx.strokeStyle = `hsl(${hue} 90% 60%)`; ictx.lineWidth = w; ictx.lineCap = ictx.lineJoin = 'round';
        ictx.beginPath(); ictx.moveTo(a[0], a[1]); ictx.lineTo(b[0], b[1]); ictx.stroke();
        cctx.strokeStyle = '#000'; cctx.lineWidth = w; cctx.lineCap = cctx.lineJoin = 'round';
        cctx.beginPath(); cctx.moveTo(a[0], a[1]); cctx.lineTo(b[0], b[1]); cctx.stroke();
      }
      ink.addEventListener('pointerdown', e => {
        if (done || drawId !== null) return;
        Sound.init(); drawId = e.pointerId; try { ink.setPointerCapture(drawId); } catch (_) {}
        lastP = pos(e); seg(lastP, [lastP[0] + .1, lastP[1]]); owl.classList.remove('wiggle'); resetIdle();
      });
      ink.addEventListener('pointermove', e => {
        if (e.pointerId !== drawId || done) return;
        const p = pos(e); seg(lastP, p); lastP = p;
        if (++moves % 12 === 0) {
          Sound.tone(500 + Math.random() * 500, .06, { type: 'triangle', vol: .05 });
          const { cov } = coverage();
          if (cov > .4 && !saidHalf) { saidHalf = true; talk('יופי! ממשיכים... ✨', pick(['יופי! ממשיכים', 'כמעט!', 'ממש טוב!'])); }
          if (cov >= NEED) finishStroke();
        }
      });
      const up = e => { if (e.pointerId !== drawId) return; drawId = null; finishStroke(); };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      function finishStroke() {
        if (done) return;
        const { cov, out } = coverage();
        if (out > .45 && cov > .3) { Sound.wrong(); talk('אופס, נסי לצייר רק על האות 🙂', 'אופס, נסי לצייר רק על האות'); clearInk(); return; }
        if (cov >= NEED) { drawId = null; success(); }
      }

      $('.lt-say', root).onclick = () => { Sound.tap(); if (cur) Voice.say(isName ? `האות ${cur.name}` : `${cur.name}, כמו ${cur.word}`); };
      $('.lt-clear', root).onclick = () => { Sound.whoosh(); if (!done) clearInk(); };
      $('.lt-next', root).onclick = () => { Sound.tap(); if (!done) { clearTimeout(idleT); next(); } };
      s.on(window, 'resize', () => { if (cur && !done) { size(); fs = Math.round(S * .74); buildMask(); drawLetter(false); clearInk(); } });

      const ready = document.fonts && document.fonts.load ? document.fonts.load(`100px ${FONT}`, 'אבג') : Promise.resolve();
      ready.catch(() => {}).then(() => { if (s.alive) requestAnimationFrame(start); });
    }
    chooser();
  }
});
