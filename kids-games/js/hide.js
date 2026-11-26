'use strict';
/* 🙈 מחבואים – החיות מתחבאות, והקריינית שואלת איפה כל אחת */
const HIDE = (() => {
  // [שם, מין דקדוקי, אימוג׳י]
  const ANIMALS = [['ארנב', 'm', '🐰'], ['חתול', 'm', '🐱'], ['כלב', 'm', '🐶'], ['דובי', 'm', '🐻'], ['פנדה', 'f', '🐼'], ['צפרדע', 'f', '🐸'], ['אפרוח', 'm', '🐥'], ['שועל', 'm', '🦊']];
  const where = ([n, g]) => `איפה ${g === 'f' ? 'מתחבאת' : 'מתחבא'} ה${n}?`;
  const found = ([n]) => `מצאת את ה${n}!`;
  const notMe = ([n]) => `זה לא אני, אני ה${n}`;
  const lines = () => [...ANIMALS.flatMap(a => [where(a), found(a), notMe(a)]), 'אין כאן אף אחד', 'קוקו! מצאת אותי!', 'מחבואים! החיות מתחבאות...', 'אחת, שתיים, שלוש, מוכנה או לא, הנה אני באה!', 'מצאת את כולם!', 'עוד פעם!'];
  return { ANIMALS, where, found, notMe, lines };
})();

registerGame({
  id: 'hide', name: 'מחבואים', emoji: '🙈', color: '#8ac926', say: 'מחבואים! החיות מתחבאות...',
  lines: HIDE.lines,
  mount(root, s) {
    const { ANIMALS, where, found, notMe } = HIDE;
    const SPOTS = [['🌳', 14, 46], ['🎁', 40, 78], ['☁️', 34, 16], ['🏠', 66, 44], ['🌷', 88, 80], ['🧺', 12, 82], ['🚗', 64, 78], ['🌲', 90, 42]];
    const ROUNDS = 5;
    let round = 0, target = null, busy = true, hid = [];
    root.innerHTML = `<div class="hd"><div class="hd-top"><div class="hd-ask"></div><div class="sh-dots">${'<i></i>'.repeat(ROUNDS)}</div></div><div class="hd-scene"></div></div>`;
    const scene = $('.hd-scene', root), ask = $('.hd-ask', root);

    function hideAll() {
      busy = true;
      const n = Math.min(3 + Math.floor(round / 2), 5);
      const spots = shuffle(SPOTS.map((_, i) => i));
      const who = shuffle(ANIMALS).slice(0, n);
      hid = SPOTS.map(() => null); who.forEach((a, i) => hid[spots[i]] = a);
      target = pick(who);
      // כל חיה מוחבאת מציצה טיפה – מלמעלה, מימין או משמאל – ומתנועעת מדי פעם, כדי שיהיה מה לחפש
      // במסך גבוה (טלפון לאורך) – פריסה של 2 טורים, כדי שהמחבואים לא יעלו זה על זה
      const tall = scene.clientHeight > scene.clientWidth * 1.15;
      const PORTRAIT = [[72, 36], [28, 62], [30, 11], [26, 36], [74, 87], [26, 87], [72, 62], [74, 11]];
      // במסך נמוך (טלפון לרוחב) – רשת מסודרת של 4 טורים ו־2 שורות
      const short = !tall && scene.clientHeight < 320;
      const SHORT = [[12, 28], [37, 74], [37, 28], [63, 28], [88, 74], [12, 74], [63, 74], [88, 28]];
      scene.innerHTML = SPOTS.map(([e, x0, y0], i) => { const [x, y] = tall ? PORTRAIT[i] : short ? SHORT[i] : [x0, y0]; return `<button class="hd-spot ${hid[i] ? 'has pk-' + pick(['top', 'left', 'right']) : ''}" data-i="${i}" style="left:${x}%;top:${y}%;--wd:${rand(0, 3).toFixed(1)}s"><span class="hd-an">${hid[i] ? hid[i][2] : ''}</span><span class="hd-cover">${e}</span></button>`; }).join('');
      ask.innerHTML = `<span class="who">${target[2]}</span> איפה?`;
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      // החיות רצות להתחבא
      scene.classList.add('peek');
      s.later(() => { scene.classList.remove('peek'); Sound.whoosh(); }, 1600);
      s.later(() => { Voice.say(where(target)); busy = false; }, 2100);
      $$('.hd-spot', scene).forEach(b => b.onclick = () => look(+b.dataset.i, b));
    }

    function look(i, b) {
      if (busy || b.classList.contains('open')) return;
      Sound.init(); b.classList.add('open'); Sound.boing();
      const a = hid[i], c = center(b);
      if (a === target) {
        busy = true; Sound.chime();
        praise(c.x, c.y, [found(a)]);
        b.classList.add('win');
        s.later(() => {
          round++; Stars.add(c.x, c.y, 1);
          if (round < ROUNDS) { Voice.say('עוד פעם!'); s.later(hideAll, 900); }
          else celebrate({ emoji: '🙈', title: 'מצאת את כולם!', stars: 3, again: () => { round = 0; hideAll(); } });
        }, 2600);
      } else if (a) {
        Voice.say([notMe(a), where(target)]);
        FX.burst(c.x, c.y, ['😄'], 3, 26);
        s.later(() => b.classList.remove('open'), 2400);
      } else {
        Voice.say('אין כאן אף אחד');
        s.later(() => b.classList.remove('open'), 1300);
      }
    }
    Voice.say(['מחבואים! החיות מתחבאות...', 'אחת, שתיים, שלוש, מוכנה או לא, הנה אני באה!']);
    s.later(hideAll, 3400);
  }
});
