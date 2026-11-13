'use strict';
/* ✏️ אותיות ומילים – ינשוף מדבר, מראה אות או מילה מקווקוות, והילדה מציירת עליה עם האצבע */
const LT = (() => {
  // [אות, שם האות (בלי ניקוד – כך הוא מוקלט), שם להצגה, מילה, אימוג׳י]
  const L = [
    ['א', 'אלף', 'אָלֶף', 'אריה', '🦁'], ['ב', 'בית', 'בֵּית', 'בננה', '🍌'], ['ג', 'גימל', 'גִּימֶל', 'גמל', '🐫'], ['ד', 'דלת', 'דָּלֶת', 'דג', '🐟'],
    ['ה', 'הא', 'הֵא', 'הר', '⛰️'], ['ו', 'וו', 'וָו', 'ורד', '🌹'], ['ז', 'זין', 'זַיִן', 'זברה', '🦓'], ['ח', 'חית', 'חֵית', 'חתול', '🐱'],
    ['ט', 'טית', 'טֵית', 'טלפון', '📱'], ['י', 'יוד', 'יוּד', 'יד', '✋'], ['כ', 'כף', 'כָּף', 'כדור', '⚽'], ['ל', 'למד', 'לָמֶד', 'לב', '❤️'],
    ['מ', 'מם', 'מֵם', 'מטריה', '☂️'], ['נ', 'נון', 'נוּן', 'נר', '🕯️'], ['ס', 'סמך', 'סָמֶךְ', 'סוס', '🐴'], ['ע', 'עין', 'עַיִן', 'עוגה', '🎂'],
    ['פ', 'פא', 'פֵּא', 'פרפר', '🦋'], ['צ', 'צדי', 'צָדִי', 'צב', '🐢'], ['ק', 'קוף', 'קוֹף', 'קוף', '🐒'], ['ר', 'ריש', 'רֵישׁ', 'רכבת', '🚂'],
    ['ש', 'שין', 'שִׁין', 'שמש', '☀️'], ['ת', 'תו', 'תָּו', 'תפוח', '🍎']
  ];
  const FINAL = { 'ך': ['כף סופית', 'כָּף סוֹפִית'], 'ם': ['מם סופית', 'מֵם סוֹפִית'], 'ן': ['נון סופית', 'נוּן סוֹפִית'], 'ף': ['פא סופית', 'פֵּא סוֹפִית'], 'ץ': ['צדי סופית', 'צָדִי סוֹפִית'] };
  // 10 מילים נפוצות עם איור
  const WORDS = [['בלון', '🎈'], ['אבא', '👨'], ['אמא', '👩'], ['שלום', '👋'], ['בית', '🏠'], ['כלב', '🐶'], ['חתול', '🐱'], ['שמש', '☀️'], ['פרח', '🌸'], ['אוטו', '🚗']];
  const PRAISE = ['כל הכבוד!', 'וואו! מושלם!', 'איזה יופי!', 'מעולה!'];
  const HALF = ['יופי! ממשיכים', 'כמעט!', 'ממש טוב!'];
  const DEFAULT_NAME = 'אורי';
  const nameLines = n => [`בואי נכתוב את השם ${n}!`, `ועכשיו נכתוב את כל השם ${n}, במסך אחד!`, `ועכשיו לבד! כתבי ${n}. את יכולה!`,
    `כתבי ${n} עם האצבע`, `וואו! כתבת את השם שלך לבד! ${n}!`, `${n}, את כותבת!`, n];
  function lines() {
    const out = ['מה נלמד היום?', 'איזו מילה נכתוב?', 'ציירי אותה עם האצבע', 'ציירי על הקווים עם האצבע', 'עוד פעם! הפעם הקווים קצת יותר חלשים',
      'עוד פעם! הקווים כמעט נעלמו', 'אופס, נסי לצייר רק על האות', 'אופס, ננסה שוב', 'למדת אותיות!', 'בואי נכתוב את המילה', 'כתבת', ...PRAISE, ...HALF, ...nameLines(DEFAULT_NAME)];
    const names = L.map(x => x[1]).concat(Object.values(FINAL).map(x => x[0]));
    L.forEach(([, n, , w]) => out.push(`זו האות ${n}`, `${n} כמו ${w}`));
    names.forEach(n => out.push(`האות ${n}`, `עכשיו האות ${n}`));
    WORDS.forEach(([w]) => out.push(`בואי נכתוב ${w}`, w, `כתבת ${w}!`));
    return out;
  }
  return { L, FINAL, WORDS, PRAISE, HALF, DEFAULT_NAME, lines };
})();

registerGame({
  id: 'letters', name: 'אותיות ומילים', emoji: '✏️', color: '#7b61ff', say: 'בואי נלמד אותיות!',
  lines: LT.lines,
  mount(root, s) {
    const { L, FINAL, WORDS, PRAISE, HALF } = LT;
    const info = ch => {
      const r = L.find(x => x[0] === ch);
      if (r) return { ch, name: r[1], show: r[2], word: r[3], emo: r[4] };
      const f = FINAL[ch]; return { ch, name: f ? f[0] : ch, show: f ? f[1] : ch, word: '', emo: '' };
    };
    const FONT = '"Varela Round", "Arial Hebrew", Arial, sans-serif';
    const ROUND = 5, NEED = .7;
    const plain = t => t.replace(/[֑-ׇ]/g, '');

    // השם מוצג ומוקלט בלי ניקוד; לקול של המכשיר (גיבוי) שומרים גרסה עם ניקוד: אוֹרִי = Ori
    let nameSay = Store.get('kidname2', 'אוֹרִי');
    let kidName = plain(nameSay);
    Voice.fix = Object.assign(Voice.fix || {}, { [kidName]: nameSay });
    const GUIDES = [1, .5, .22, .06];          // הקווקוו של השם הולך ונעלם
    const WORD_NEED = [.68, .64, .58, .5];
    const PIC_GUIDES = [1, .35], PIC_NEED = [.66, .6];

    /* ---------- מסך בחירה ---------- */
    function chooser() {
      root.innerHTML = `<div class="picker"><h3>🦉 מה נלמד היום?</h3><div class="opts">
        <button class="opt" data-k="abc" style="--c:#7b61ff;--i:0"><span class="oe" style="color:#7b61ff;font-weight:bold">אב</span>אותיות</button>
        <button class="opt" data-k="words" style="--c:#2ec27e;--i:1"><span class="oe">🎈</span>מילים</button>
        <button class="opt" data-k="name" style="--c:#ff70a6;--i:2"><span class="oe">👧</span><span class="nm"></span></button></div>
        <button class="lt-rename">✏️ לשנות שם</button></div>`;
      $('.nm', root).textContent = kidName;
      $$('.opt', root).forEach(b => b.onclick = () => {
        Sound.pop();
        const k = b.dataset.k;
        if (k === 'abc') play(shuffle(L.map(x => x[0])).slice(0, ROUND).map(ch => ({ kind: 'letter', ch })), 'abc');
        else if (k === 'words') wordPicker();
        else play([...kidName.replace(/\s/g, '')].map(ch => ({ kind: 'letter', ch }))
          .concat(GUIDES.map((g, i) => ({ kind: 'word', ch: kidName, guide: g, need: WORD_NEED[i], pass: i }))), 'name');
      });
      $('.lt-rename', root).onclick = () => {
        const n = (prompt('מה השם? בעברית. אפשר עם ניקוד כדי שגם קול המכשיר יקרא נכון (למשל אוֹרִי)', nameSay) || '').trim();
        if (n && /^[֑-ׇא-ת ]{1,20}$/.test(n) && plain(n).trim()) {
          nameSay = n; kidName = plain(n); Store.set('kidname2', n); Voice.fix[kidName] = nameSay; $('.nm', root).textContent = kidName;
        }
      };
      Voice.say('מה נלמד היום?');
    }

    /* ---------- בחירת מילה ---------- */
    function wordPicker() {
      const doneW = Store.get('wordsDone', {});
      root.innerHTML = `<div class="picker lt-words"><h3>🦉 איזו מילה נכתוב?</h3><div class="lt-wgrid">
        ${WORDS.map(([w, e], i) => `<button class="lt-wc" data-i="${i}" style="--i:${i}"><span class="we">${e}</span><span class="ww">${w}</span>${doneW[w] ? '<i>⭐</i>' : ''}</button>`).join('')}
        <button class="lt-wc mine" style="--i:10"><span class="we">✍️</span><span class="ww">מילה משלי</span></button></div></div>`;
      $$('.lt-wc', root).forEach(b => b.onclick = () => {
        Sound.pop();
        if (b.classList.contains('mine')) {
          const raw = (prompt('איזו מילה? (בעברית, עד 8 אותיות)', Store.get('lastWord', '')) || '').trim();
          const w = plain(raw).replace(/\s+/g, ' ');
          if (!w || !/^[א-ת ]{1,9}$/.test(w)) return;
          Store.set('lastWord', raw);
          if (raw !== w) Voice.fix[w] = raw;
          return playWord(w, '✍️', true);
        }
        const [w, e] = WORDS[+b.dataset.i]; playWord(w, e, false);
      });
      Voice.say('איזו מילה נכתוב?');
    }
    function playWord(w, emo, custom) {
      play(PIC_GUIDES.map((g, i) => ({ kind: 'word', ch: w, guide: g, need: PIC_NEED[i], pass: i, pic: emo, custom })), 'word');
    }

    /* ---------- משחק ---------- */
    function play(seq, mode) {
      const isName = mode === 'name';
      root.innerHTML = `<div class="lt">
        <div class="lt-top"><div class="lt-owl">🦉</div><div class="lt-bubble"></div></div>
        ${isName ? `<div class="lt-name">${[...kidName.replace(/\s/g, '')].map((c, i) => `<span data-i="${i}">${c}</span>`).join('')}</div>` : ''}
        ${mode === 'abc' ? `<div class="sh-dots">${seq.map(() => '<i></i>').join('')}</div>` : `<div class="lt-pass">${seq.filter(x => x.kind === 'word').map(() => '<i>✏️</i>').join('')}</div>`}
        <div class="lt-board"><canvas class="lt-bg"></canvas><canvas class="lt-ink"></canvas><div class="lt-pic"></div><div class="lt-word"></div></div>
        <div class="lt-ctrl"><button class="lt-say" aria-label="שוב">🔊</button><button class="lt-clear" aria-label="מחק">🧽</button><button class="lt-next" aria-label="הבא">⏭️</button></div>
      </div>`;
      const board = $('.lt-board', root), bg = $('.lt-bg', root), ink = $('.lt-ink', root), wordEl = $('.lt-word', root), picEl = $('.lt-pic', root);
      const bubble = $('.lt-bubble', root), owl = $('.lt-owl', root), lt = $('.lt', root);
      const bctx = bg.getContext('2d'), ictx = ink.getContext('2d');
      const check = document.createElement('canvas'), cctx = check.getContext('2d', { willReadFrequently: true });
      let idx = 0, step = null, cur = null, W = 0, H = 0, DPR = 1, pts = [], fs = 0, done = false, hue = 0, lastP = null, drawId = null, idleT = 0, saidHalf = false, moves = 0;

      // text = מה שמוצג בבועה, voice = מה שנאמר (משפט או רשימת משפטים מוקלטים)
      function talk(text, voice) {
        bubble.textContent = text; bubble.classList.remove('bounce'); void bubble.offsetWidth; bubble.classList.add('bounce');
        owl.classList.remove('talk'); void owl.offsetWidth; owl.classList.add('talk');
        Voice.say(voice || text);
      }

      // אות בודדת: לוח ריבועי. מילה: לוח רחב
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

      const wordSay = w => step.custom ? ['בואי נכתוב את המילה', w] : `בואי נכתוב ${w}`;

      function start() {
        done = false; step = seq[idx];
        cur = step.kind === 'word' ? { ch: step.ch } : info(step.ch);
        lt.classList.toggle('wordmode', step.kind === 'word');
        lt.classList.toggle('picmode', !!step.pic);
        picEl.textContent = step.pic || '';
        size(); buildMask(); drawLetter(false); clearInk();
        wordEl.className = 'lt-word'; wordEl.textContent = '';
        if (step.kind === 'word') {
          $$('.lt-name span', root).forEach(e => { e.classList.remove('cur'); e.classList.add('ok'); });
          $$('.lt-pass i', root).forEach((e, i) => { e.classList.toggle('on', i < step.pass); e.classList.toggle('cur', i === step.pass); });
          if (step.pic) {
            if (step.pass === 0) talk(`בואי נכתוב: ${step.ch} ${step.pic}`, wordSay(step.ch));
            else talk('עוד פעם! הקווים חלשים יותר 👀', 'עוד פעם! הפעם הקווים קצת יותר חלשים');
          } else {
            const lines = [
              [`עכשיו כל השם ${kidName} במסך אחד! ✍️`, `ועכשיו נכתוב את כל השם ${kidName}, במסך אחד!`],
              ['שוב! הקווים קצת יותר חלשים 👀', 'עוד פעם! הפעם הקווים קצת יותר חלשים'],
              ['עוד פעם... הקווים כמעט נעלמו! 🙈', 'עוד פעם! הקווים כמעט נעלמו'],
              [`ועכשיו לבד! כתבי ${kidName} 💪`, `ועכשיו לבד! כתבי ${kidName}. את יכולה!`]
            ][step.pass];
            talk(lines[0], lines[1]);
          }
        } else if (isName) {
          $$('.lt-name span', root).forEach((e, i) => e.classList.toggle('cur', i === idx));
          if (idx === 0) talk(`בואי נכתוב את השם ${kidName}! האות הראשונה: ${cur.show}`, [`בואי נכתוב את השם ${kidName}!`, `האות ${cur.name}`]);
          else talk(`עכשיו האות ${cur.show}`, `עכשיו האות ${cur.name}`);
        } else {
          talk(`${cur.ch} – ${cur.show}, כמו ${cur.word} ${cur.emo}`, [`זו האות ${cur.name}`, `${cur.name} כמו ${cur.word}`, 'ציירי אותה עם האצבע']);
        }
        resetIdle();
      }

      function resetIdle() {
        clearTimeout(idleT);
        idleT = s.later(() => {
          if (done) return;
          if (isName && step.kind === 'word' && step.guide < .3) talk(`כתבי ${kidName} עם האצבע ☝️`, `כתבי ${kidName} עם האצבע`);
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
        const praise = pick(PRAISE);
        const last = idx === seq.length - 1;
        if (step.kind === 'word') {
          $$('.lt-pass i', root)[step.pass].classList.add('on');
          if (step.pic && last) { wordEl.innerHTML = `<span>${step.pic}</span>${step.ch}`; wordEl.classList.add('on'); talk(`${praise} ${step.ch} ${step.pic}`, [praise, step.ch]); }
          else if (!last) talk(`${praise} ✔️`, praise);
        } else if (isName) {
          const sp = $$('.lt-name span', root)[idx]; sp.classList.remove('cur'); sp.classList.add('ok');
          talk(`${praise} ${cur.show} ✔️`, [praise, `האות ${cur.name}`]);
        } else {
          wordEl.innerHTML = `<span>${cur.emo}</span>${cur.word}`; wordEl.classList.add('on');
          talk(`${praise} ${cur.ch} כמו ${cur.word} ${cur.emo}`, [praise, `${cur.name} כמו ${cur.word}`]);
          $$('.sh-dots i', root)[idx].classList.add('on');
        }
        Stars.add(r.left + r.width / 2, r.top + r.height / 3, 1);
        s.later(next, 3400);
      }

      function next() {
        idx++;
        if (idx < seq.length) { start(); return; }
        if (isName) {
          talk(`${kidName}! כתבת את השם שלך לבד! 🎉`, `וואו! כתבת את השם שלך לבד! ${kidName}!`);
          lt.classList.remove('wordmode'); $('.lt-name', root).classList.add('win');
          s.later(() => celebrate({ emoji: '👧', title: `${kidName}, את כותבת!`, stars: 3, again: chooser }), 3200);
        } else if (mode === 'word') {
          const w = seq[0].ch, dw = Store.get('wordsDone', {}); dw[w] = 1; Store.set('wordsDone', dw);
          s.later(() => celebrate({ emoji: seq[0].pic, title: `כתבת ${w}!`, say: seq[0].custom ? ['כתבת', w] : `כתבת ${w}!`, stars: 2, again: wordPicker }), 1800);
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
          if (cov > need() * .6 && !saidHalf) { saidHalf = true; const h = pick(HALF); talk(h + ' ✨', h); }
          if (cov >= need()) finishStroke();
        }
      });
      const up = e => { if (e.pointerId !== drawId) return; drawId = null; finishStroke(); };
      ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
      function finishStroke() {
        if (done) return;
        const { cov, out } = coverage();
        if (out > .45 && cov > .3) {
          Sound.wrong();
          if (step.kind === 'word') talk('אופס, ננסה שוב 🙂', 'אופס, ננסה שוב'); else talk('אופס, נסי לצייר רק על האות 🙂', 'אופס, נסי לצייר רק על האות');
          clearInk(); return;
        }
        if (cov >= need()) { drawId = null; success(); }
      }

      $('.lt-say', root).onclick = () => {
        Sound.tap(); if (!cur) return;
        Voice.say(step.kind === 'word' ? step.ch : isName ? `האות ${cur.name}` : `${cur.name} כמו ${cur.word}`);
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
