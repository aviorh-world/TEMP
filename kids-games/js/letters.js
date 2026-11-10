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

    // השם נשמר עם ניקוד בשביל ההקראה (אוֹרִי = Ori), ומוצג בלי ניקוד
    let nameSay = Store.get('kidname2', 'אוֹרִי');
    const plain = t => t.replace(/[֑-ׇ]/g, '');
    let kidName = plain(nameSay);
    const GUIDES = [1, .5, .22, .06];          // הקווקוו הולך ונעלם
    const WORD_NEED = [.68, .64, .58, .5];

    /* ---------- מסך בחירה ---------- */
    function chooser() {
      root.innerHTML = `<div class="picker"><h3>🦉 מה נלמד היום?</h3><div class="opts">
        <button class="opt" data-k="abc" style="--c:#7b61ff;--i:0"><span class="oe" style="color:#7b61ff;font-weight:bold">אב</span>אותיות</button>
        <button class="opt" data-k="name" style="--c:#ff70a6;--i:1"><span class="oe">👧</span><span class="nm"></span></button></div>
        <button class="lt-rename">✏️ לשנות שם</button></div>`;
      $('.nm', root).textContent = kidName;
      $$('.opt', root).forEach(b => b.onclick = () => {
        Sound.pop();
        if (b.dataset.k === 'abc') play(shuffle(L.map(x => x[0])).slice(0, ROUND).map(ch => ({ kind: 'letter', ch })), false);
        else play([...kidName.replace(/\s/g, '')].map(ch => ({ kind: 'letter', ch }))
          .concat(GUIDES.map((g, i) => ({ kind: 'word', ch: kidName, guide: g, need: WORD_NEED[i], pass: i }))), true);
      });
      $('.lt-rename', root).onclick = () => {
        const n = (prompt('מה השם? בעברית. אפשר עם ניקוד כדי שההקראה תהיה נכונה (למשל אוֹרִי)', nameSay) || '').trim();
        if (n && /^[֑-ׇא-ת ]{1,20}$/.test(n) && plain(n).trim()) { nameSay = n; kidName = plain(n); Store.set('kidname2', n); $('.nm', root).textContent = kidName; }
      };
      Voice.say(`מה נלמד היום? אותיות, או לכתוב ${nameSay}?`);
    }

    /* ---------- משחק ---------- */
    function play(seq, isName) {
      const nLetters = seq.filter(x => x.kind === 'letter').length;
      root.innerHTML = `<div class="lt">
        <div class="lt-top"><div class="lt-owl">🦉</div><div class="lt-bubble"></div></div>
        ${isName ? `<div class="lt-name">${[...kidName.replace(/\s/g, '')].map((c, i) => `<span data-i="${i}">${c}</span>`).join('')}</div>
          <div class="lt-pass">${GUIDES.map(() => '<i>✏️</i>').join('')}</div>`
        : `<div class="sh-dots">${seq.map(() => '<i></i>').join('')}</div>`}
        <div class="lt-board"><canvas class="lt-bg"></canvas><canvas class="lt-ink"></canvas><div class="lt-word"></div></div>
        <div class="lt-ctrl"><button class="lt-say" aria-label="שוב">🔊</button><button class="lt-clear" aria-label="מחק">🧽</button><button class="lt-next" aria-label="הבא">⏭️</button></div>
      </div>`;
      const board = $('.lt-board', root), bg = $('.lt-bg', root), ink = $('.lt-ink', root), wordEl = $('.lt-word', root);
      const bubble = $('.lt-bubble', root), owl = $('.lt-owl', root), lt = $('.lt', root);
      const bctx = bg.getContext('2d'), ictx = ink.getContext('2d');
      const check = document.createElement('canvas'), cctx = check.getContext('2d', { willReadFrequently: true });
      let idx = 0, step = null, cur = null, W = 0, H = 0, DPR = 1, pts = [], fs = 0, done = false, hue = 0, lastP = null, drawId = null, idleT = 0, saidHalf = false, moves = 0;

      function talk(text, voice = text) {
        bubble.textContent = text; bubble.classList.remove('bounce'); void bubble.offsetWidth; bubble.classList.add('bounce');
        owl.classList.remove('talk'); void owl.offsetWidth; owl.classList.add('talk');
        Voice.say(voice);
      }

      // אות בודדת: לוח ריבועי. כל השם: לוח רחב
      function size() {
        const r = board.getBoundingClientRect();
        if (step.kind === 'word') { W = Math.floor(Math.min(r.width - 12, 1000)); H = Math.floor(Math.min(r.height - 12, W * .6)); }
        else { W = H = Math.floor(Math.min(r.width - 12, r.height - 12)); }
        DPR = Math.min(2, window.devicePixelRatio || 1);
        [bg, ink].forEach(c => { c.width = W * DPR; c.height = H * DPR; c.style.width = W + 'px'; c.style.height = H + 'px'; });
        bctx.setTransform(DPR, 0, 0, DPR, 0, 0); ictx.setTransform(DPR, 0, 0, DPR, 0, 0);
        check.width = W; check.height = H;
        if (step.kind === 'word') {
          bctx.font = `100px ${FONT}`; bctx.direction = 'rtl';
          const w100 = bctx.measureText(cur.ch).width || 100;
          fs = Math.round(Math.min(H * .66, W * .86 / w100 * 100));
        } else fs = Math.round(W * .74);
      }

      function place(ctx) {
        ctx.font = `${fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.direction = 'rtl';
        const m = ctx.measureText(cur.ch);
        return H / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
      }

      function drawLetter(filled) {
        const ch = cur.ch, guide = step.guide == null ? 1 : step.guide;
        bctx.clearRect(0, 0, W, H);
        bctx.strokeStyle = 'rgba(123,97,255,.10)'; bctx.lineWidth = 2;
        for (let y = H * .2; y < H; y += H * .2) { bctx.beginPath(); bctx.moveTo(W * .04, y); bctx.lineTo(W * .96, y); bctx.stroke(); }
        const y = place(bctx);
        if (filled) {
          const g = bctx.createLinearGradient(0, 0, W, H);
          ['#ff70a6', '#ffc300', '#2ec27e', '#3a86ff', '#9b5de5'].forEach((c, i) => g.addColorStop(i / 4, c));
          bctx.fillStyle = g; bctx.fillText(ch, W / 2, y);
          bctx.lineWidth = 4; bctx.strokeStyle = '#fff'; bctx.setLineDash([]); bctx.strokeText(ch, W / 2, y);
        } else {
          bctx.globalAlpha = guide;
          bctx.fillStyle = '#efeaff'; bctx.fillText(ch, W / 2, y);
          bctx.setLineDash([fs * .035, fs * .028]); bctx.lineCap = 'round'; bctx.lineWidth = Math.max(3, fs * .012);
          bctx.strokeStyle = '#7b61ff'; bctx.strokeText(ch, W / 2, y); bctx.setLineDash([]);
          bctx.globalAlpha = 1;
        }
      }

      // נקודות דגימה בתוך האות – לפיהן בודקים כמה כוסה
      function buildMask() {
        cctx.clearRect(0, 0, W, H); cctx.fillStyle = '#000';
        const y = place(cctx); cctx.fillText(cur.ch, W / 2, y);
        const d = cctx.getImageData(0, 0, W, H).data, st = Math.max(3, Math.round(fs / 90));
        pts = [];
        for (let yy = 0; yy < H; yy += st) for (let xx = 0; xx < W; xx += st) if (d[(yy * W + xx) * 4 + 3] > 140) pts.push([xx, yy]);
        // מסכה מורחבת לזיהוי שרבוט מחוץ לאות (רחבה יותר כשהקווקוו חלש)
        const lenient = step.kind === 'word' ? 1 + (1 - step.guide) * .8 : 1;
        cctx.clearRect(0, 0, W, H); cctx.lineWidth = fs * .12 * lenient; cctx.lineJoin = 'round'; cctx.strokeStyle = '#000';
        cctx.fillText(cur.ch, W / 2, y); cctx.strokeText(cur.ch, W / 2, y);
        cur.wide = cctx.getImageData(0, 0, W, H).data;
        cctx.clearRect(0, 0, W, H);
        ink._pts = pts; // לבדיקות אוטומטיות
      }

      function coverage() {
        const d = cctx.getImageData(0, 0, W, H).data;
        let hitN = 0; for (const [x, y] of pts) if (d[(y * W + x) * 4 + 3] > 0) hitN++;
        let inkN = 0, out = 0; const st = 6;
        for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st) { const i = (y * W + x) * 4 + 3; if (d[i] > 0) { inkN++; if (cur.wide[i] === 0) out++; } }
        return { cov: pts.length ? hitN / pts.length : 0, out: inkN ? out / inkN : 0 };
      }
      const need = () => step.need || NEED;

      function clearInk() { ictx.clearRect(0, 0, W, H); cctx.clearRect(0, 0, W, H); saidHalf = false; }

      function start() {
        done = false; step = seq[idx];
        cur = step.kind === 'word' ? { ch: step.ch } : info(step.ch);
        lt.classList.toggle('wordmode', step.kind === 'word');
        size(); buildMask(); drawLetter(false); clearInk();
        wordEl.className = 'lt-word'; wordEl.textContent = '';
        if (step.kind === 'word') {
          $$('.lt-name span', root).forEach(e => { e.classList.remove('cur'); e.classList.add('ok'); });
          $$('.lt-pass i', root).forEach((e, i) => { e.classList.toggle('on', i < step.pass); e.classList.toggle('cur', i === step.pass); });
          const lines = [
            [`עכשיו כל השם ${kidName} במסך אחד! ✍️`, `ועכשיו נכתוב את כל השם ${nameSay}, במסך אחד!`],
            ['שוב! הקווים קצת יותר חלשים 👀', 'עוד פעם! הפעם הקווים קצת יותר חלשים'],
            ['עוד פעם... הקווים כמעט נעלמו! 🙈', 'עוד פעם! הקווים כמעט נעלמו'],
            [`ועכשיו לבד! כתבי ${kidName} 💪`, `ועכשיו לבד! כתבי ${nameSay}. את יכולה!`]
          ][step.pass];
          talk(lines[0], lines[1]);
        } else if (isName) {
          $$('.lt-name span', root).forEach((e, i) => e.classList.toggle('cur', i === idx));
          const intro = idx === 0 ? `בואי נכתוב את השם ${nameSay}! האות הראשונה היא ${cur.name}` : `עכשיו האות ${cur.name}`;
          talk(intro.replace(nameSay, kidName), intro);
        } else {
          talk(`${cur.ch} – ${cur.name}, כמו ${cur.word} ${cur.emo}`, `זו האות ${cur.name}. ${cur.name} כמו ${cur.word}! ציירי אותה עם האצבע`);
        }
        resetIdle();
      }

      function resetIdle() {
        clearTimeout(idleT);
        idleT = s.later(() => {
          if (done) return;
          if (step.kind === 'word' && step.guide < .3) talk(`כתבי ${kidName} עם האצבע ☝️`, `כתבי ${nameSay} עם האצבע`);
          else talk('ציירי על הקווים עם האצבע ☝️', 'ציירי על הקווים עם האצבע');
          owl.classList.add('wiggle');
        }, 9000);
      }

      function success() {
        done = true; clearTimeout(idleT);
        drawLetter(true); ictx.clearRect(0, 0, W, H);
        Sound.tada();
        const r = board.getBoundingClientRect(); FX.confetti(r.left + r.width / 2, r.top + r.height / 2, 50);
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, ['⭐', '✨', '💖'], 12, 40);
        const praise = pick(['כל הכבוד!', 'וואו! מושלם!', 'איזה יופי!', 'מעולה!']);
        if (step.kind === 'word') {
          $$('.lt-pass i', root)[step.pass].classList.add('on');
          if (step.pass < GUIDES.length - 1) talk(`${praise} ${kidName}! ✔️`, `${praise} ${nameSay}!`);
        } else if (isName) {
          const sp = $$('.lt-name span', root)[idx]; sp.classList.remove('cur'); sp.classList.add('ok');
          talk(`${praise} ${cur.name} ✔️`, `${praise} ${cur.name}`);
        } else {
          wordEl.innerHTML = `<span>${cur.emo}</span>${cur.word}`; wordEl.classList.add('on');
          talk(`${praise} ${cur.ch} כמו ${cur.word} ${cur.emo}`, `${praise} ${cur.name}, כמו ${cur.word}`);
          $$('.sh-dots i', root)[idx].classList.add('on');
        }
        Stars.add(r.left + r.width / 2, r.top + r.height / 3, 1);
        s.later(next, 3400);
      }

      function next() {
        idx++;
        if (idx < seq.length) { start(); return; }
        if (isName) {
          talk(`${kidName}! כתבת את השם שלך לבד! 🎉`, `וואו! כתבת את השם שלך לבד! ${nameSay}!`);
          lt.classList.remove('wordmode'); $('.lt-name', root).classList.add('win');
          s.later(() => celebrate({ emoji: '👧', title: `${kidName}, את כותבת!`, stars: 3, again: chooser }), 3200);
        } else celebrate({ emoji: '🦉', title: 'למדת אותיות!', stars: 3, again: chooser });
      }

      // ציור עם האצבע
      const pos = e => { const r = ink.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      function seg(a, b) {
        const w = Math.max(16, fs * (step.kind === 'word' ? .13 : .1));
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
          if (cov > need() * .6 && !saidHalf) { saidHalf = true; talk('יופי! ממשיכים... ✨', pick(['יופי! ממשיכים', 'כמעט!', 'ממש טוב!'])); }
          if (cov >= need()) finishStroke();
        }
      });
      const up = e => { if (e.pointerId !== drawId) return; drawId = null; finishStroke(); };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      function finishStroke() {
        if (done) return;
        const { cov, out } = coverage();
        if (out > .45 && cov > .3) { Sound.wrong(); talk(step.kind === 'word' ? 'אופס, ננסה שוב 🙂' : 'אופס, נסי לצייר רק על האות 🙂', step.kind === 'word' ? 'אופס, ננסה שוב' : 'אופס, נסי לצייר רק על האות'); clearInk(); return; }
        if (cov >= need()) { drawId = null; success(); }
      }

      $('.lt-say', root).onclick = () => {
        Sound.tap(); if (!cur) return;
        Voice.say(step.kind === 'word' ? nameSay : isName ? `האות ${cur.name}` : `${cur.name}, כמו ${cur.word}`);
      };
      $('.lt-clear', root).onclick = () => { Sound.whoosh(); if (!done) clearInk(); };
      $('.lt-next', root).onclick = () => { Sound.tap(); if (!done) { clearTimeout(idleT); next(); } };
      s.on(window, 'resize', () => { if (cur && !done) { size(); buildMask(); drawLetter(false); clearInk(); } });

      const ready = document.fonts && document.fonts.load ? document.fonts.load(`100px ${FONT}`, 'אבג') : Promise.resolve();
      ready.catch(() => {}).then(() => { if (s.alive) requestAnimationFrame(start); });
    }
    chooser();
  }
});
