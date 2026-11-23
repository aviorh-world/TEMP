'use strict';
/* 🩺 רופאה לחיות – כל חיה מגיעה עם בעיה, מטפלים בכלים לפי הסדר (הכלי הנכון מנצנץ) */
const DOCTOR = (() => {
  const TOOLS = { thermo: '🌡️', pill: '💊', cream: '🧴', band: '🩹', soap: '🧼', shower: '🚿', steth: '🩺', spoon: '🥄', scarf: '🧣', tea: '🍵' };
  const CASES = [
    { k: 'fever', say: 'אוי, יש לי חום...', look: 'fever', steps: [['thermo', 'בואי נמדוד חום עם המדחום', 'יש חום! עכשיו תרופה'], ['pill', '', 'החום ירד!']] },
    { k: 'bump', say: 'אאוץ׳! נפלתי וקיבלתי מכה', look: 'bump', steps: [['cream', 'בואי נמרח משחה', 'עכשיו פלסטר'], ['band', '', 'הפלסטר במקום!']] },
    { k: 'dirty', say: 'התלכלכתי בבוץ!', look: 'dirty', steps: [['soap', 'בואי נסבן עם סבון', 'עכשיו מקלחת'], ['shower', '', 'איזה נקי!']] },
    { k: 'tummy', say: 'כואבת לי הבטן', look: 'sad', steps: [['steth', 'בואי נקשיב עם הסטטוסקופ', 'עכשיו כפית סירופ'], ['spoon', '', 'הבטן כבר לא כואבת!']] },
    { k: 'cold', say: 'אפצ׳י! אני מצונן', look: 'cold', steps: [['scarf', 'בואי נשים צעיף חם', 'ועכשיו תה חם'], ['tea', '', 'איזה חמים ונעים!']] }
  ];
  const lines = () => ['ברוכה הבאה למרפאה!', 'תודה דוקטורית! עכשיו הרבה יותר טוב לי!', 'הנה מדבקה בשבילך!', 'הבא בתור!', 'חפשי את מה שמנצנץ', 'את רופאה מצוינת!',
    ...CASES.flatMap(c => [c.say, ...c.steps.flatMap(s => [s[1], s[2]]).filter(Boolean)])];
  return { TOOLS, CASES, lines };
})();

registerGame({
  id: 'doctor', name: 'רופאה לחיות', emoji: '🩺', color: '#4cc9f0', say: 'ברוכה הבאה למרפאה!',
  lines: DOCTOR.lines,
  mount(root, s) {
    const { TOOLS, CASES } = DOCTOR;
    const ANIMALS = ['bear', 'cat', 'bunny', 'panda'];
    const PER = 4;
    let n = 0, cur = null, step = 0, busy = true, wrongs = 0;
    root.innerHTML = `<div class="dc"><div class="dc-top">${'<i>❤️</i>'.repeat(PER)}</div>
      <div class="dc-room"><div class="dc-bubble"></div><div class="dc-pat"><div class="dc-an animal"></div><div class="dc-fx"></div></div><div class="dc-bed"></div></div>
      <div class="dc-tools">${Object.entries(TOOLS).map(([k, e]) => `<div class="food dc-tool" data-k="${k}">${e}</div>`).join('')}</div></div>`;
    const pat = $('.dc-pat', root), an = $('.dc-an', root), fx = $('.dc-fx', root), bubble = $('.dc-bubble', root), hearts = $$('.dc-top i', root);

    const talk = (txt, v) => { bubble.textContent = txt; bubble.classList.remove('bounce'); void bubble.offsetWidth; bubble.classList.add('bounce'); Voice.say(v || txt); };
    function looks(l) {
      pat.className = 'dc-pat ' + (l || '');
      fx.innerHTML = l === 'fever' ? '<span class="sweat">💧</span><span class="hot">🤒</span>'
        : l === 'bump' ? '<span class="bumpm"></span>'
        : l === 'dirty' ? Array.from({ length: 7 }, (_, i) => `<span class="mud" style="left:${18 + (i * 37) % 64}%;top:${30 + (i * 23) % 55}%"></span>`).join('')
        : l === 'cold' ? '<span class="sneeze">🤧</span>' : l === 'sad' ? '<span class="hot">😣</span>' : '';
    }
    const hint = () => $$('.dc-tool', root).forEach(t => t.classList.toggle('next', !busy && cur && t.dataset.k === cur.steps[step][0]));

    function nextPatient() {
      busy = true; cur = pick(CASES.filter(c => !cur || c.k !== cur.k)); step = 0;
      an.innerHTML = animalSVG(pick(ANIMALS)); looks(cur.look);
      pat.classList.add('enter');
      s.later(() => {
        talk(cur.say, [cur.say, cur.steps[0][1]]);
        busy = false; hint();
      }, 700);
    }

    function use(k, fromEl) {
      if (busy || !cur) return false;
      Sound.init();
      if (k !== cur.steps[step][0]) {
        Sound.boing(); fromEl.classList.remove('shake'); void fromEl.offsetWidth; fromEl.classList.add('shake');
        if (++wrongs % 2 === 1) Voice.say('חפשי את מה שמנצנץ');
        return false;
      }
      busy = true; hint();
      const a = center(fromEl), m = center(an);
      const fly = el('span', 'ballfly', TOOLS[k]); fly.style.position = 'fixed'; fly.style.transition = 'all .6s cubic-bezier(.3,.2,.6,1)';
      fly.style.left = (a.x - 30) + 'px'; fly.style.top = (a.y - 30) + 'px'; document.body.appendChild(fly);
      requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.left = (m.x - 30) + 'px'; fly.style.top = (m.y - 30) + 'px'; fly.style.transform = 'scale(1.3) rotate(-15deg)'; }));
      s.later(() => {
        fly.remove(); effect(k);
        const [, , after] = cur.steps[step];
        step++;
        if (step < cur.steps.length) {
          talk(after); Sound.ding(4); busy = false; hint();
        } else {
          looks(''); pat.classList.add('happy');
          an.classList.add('happy');
          Sound.chime(); talk(after, [after, 'תודה דוקטורית! עכשיו הרבה יותר טוב לי!']);
          const c = center(an); FX.burst(c.x, c.y, ['💖', '⭐', '✨'], 14, 38);
          hearts[n % PER].classList.add('on'); n++;
          s.later(() => { const c2 = center(an); const st = el('div', 'dc-sticker', pick(['⭐', '🌈', '🦄', '🍭', '🏅'])); fx.appendChild(st); Voice.say('הנה מדבקה בשבילך!'); Stars.add(c2.x, c2.y, 1); }, 3200);
          s.later(() => {
            pat.classList.remove('happy', 'enter'); an.classList.remove('happy');
            if (n % PER === 0) celebrate({ emoji: '👩‍⚕️', title: 'את רופאה מצוינת!', stars: 3, again: () => { hearts.forEach(h => h.classList.remove('on')); nextPatient(); } });
            else { Voice.say('הבא בתור!'); s.later(nextPatient, 900); }
          }, 5200);
        }
      }, 650);
      return true;
    }

    function effect(k) {
      const c = center(an);
      if (k === 'thermo') { const b = el('div', 'dc-temp', '39°'); fx.appendChild(b); Sound.tone(880, .3, { type: 'square', vol: .06 }); s.later(() => b.remove(), 2200); }
      if (k === 'pill' || k === 'spoon' || k === 'tea') { Sound.munch(); an.classList.add('open'); s.later(() => an.classList.remove('open'), 500); }
      if (k === 'cream') FX.burst(c.x, c.y - 60, ['🤍', '✨'], 6, 26);
      if (k === 'band') { $$('.bumpm', fx).forEach(b => b.classList.add('covered')); Sound.pop(); }
      if (k === 'soap') { for (let i = 0; i < 12; i++) { const b = el('span', 'bub', '🫧'); b.style.left = rand(10, 85) + '%'; b.style.top = rand(15, 85) + '%'; fx.appendChild(b); } Sound.sparkle(); }
      if (k === 'shower') { FX.rain(['💧'], 30, 1.4); Sound.whoosh(); s.later(() => { $$('.bub,.mud', fx).forEach(b => b.remove()); }, 600); }
      if (k === 'steth') { Sound.tone(70, .15, { vol: .4 }); Sound.tone(70, .15, { vol: .4, at: .3 }); FX.burst(c.x, c.y, ['💓'], 4, 26); }
      if (k === 'scarf') { const sc = el('div', 'dc-scarf', '🧣'); fx.appendChild(sc); Sound.pop(); $$('.sneeze', fx).forEach(x => x.remove()); }
    }

    $$('.dc-tool', root).forEach(t => draggable(t, {
      onTap: () => use(t.dataset.k, t),
      onDrop: (x, y) => { if (!hit(an, x, y, 20)) return false; t.style.transition = 'none'; t.style.transform = ''; use(t.dataset.k, t); return true; }
    }));
    Voice.say('ברוכה הבאה למרפאה!');
    s.later(nextPatient, 1500);
  }
});
