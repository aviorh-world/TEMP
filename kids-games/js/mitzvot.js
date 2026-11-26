'use strict';
/* 💖 מעשים טובים – נוני מסתובבת בשכונה; בכל תחנה מישהו צריך עזרה, בוחרים מה לעשות ואוספים לבבות.
   כל תחנה היא מצווה אחרת: חסד, כיבוד זקנים, ביקור חולים, צדקה, צער בעלי חיים, הכנסת אורחים, ברכה, כיבוד הורים. */
const MITZ = (() => {
  // [סצנה, מצב, [נכון, תווית], [לא נכון, תווית], [לא נכון, תווית], משפט הצלחה, שם המצווה]
  const S = [
    ['🌧️🐰', 'יורד גשם, והארנב שכח מטרייה', ['☂️', 'לתת מטרייה'], ['🍦', 'גלידה'], ['🎈', 'בלון'], 'נתת לחבר מטרייה, עכשיו הוא לא נרטב!', 'חסד – עוזרים לחבר'],
    ['👵🛍️', 'סבתא דובה סוחבת שקיות כבדות', ['💪', 'לעזור לסחוב'], ['🏃', 'לרוץ הלאה'], ['📺', 'לראות טלוויזיה'], 'עזרת לסבתא לסחוב, והיא אמרה תודה!', 'כיבוד זקנים'],
    ['🤒🛏️', 'החתול חולה ושוכב במיטה', ['🍲', 'להביא מרק חם'], ['🥁', 'לתופף חזק'], ['⚽', 'לשחק כדור'], 'ביקרת את החבר החולה והבאת לו מרק!', 'ביקור חולים'],
    ['🏦🪙', 'יש פה קופת צדקה לעזור לאנשים', ['🪙', 'לשים מטבע'], ['🍬', 'לשים סוכרייה'], ['🧸', 'לשים דובי'], 'שמת מטבע בקופה, ועזרת למי שצריך!', 'צדקה'],
    ['❄️🐦🐦', 'קר בחוץ, והציפורים רעבות', ['🌾', 'לתת גרעינים'], ['🍫', 'לתת שוקולד'], ['📢', 'לצעוק עליהן'], 'האכלת את הציפורים, והן מצייצות משמחה!', 'צער בעלי חיים'],
    ['🚪🐻🐼', 'באו אורחים לבקר', ['🍪', 'להגיש עוגיות'], ['🚫', 'לסגור את הדלת'], ['🙈', 'להתחבא'], 'קיבלת את האורחים יפה והגשת להם עוגיות!', 'הכנסת אורחים'],
    ['🍎🙏', 'רוצים לאכול תפוח. מה עושים קודם?', ['🙏', 'לברך: בורא פרי העץ'], ['🙉', 'לאכול מהר'], ['🗑️', 'לזרוק'], 'בירכת בורא פרי העץ, עכשיו אפשר לאכול!', 'ברכה לפני האוכל'],
    ['🍽️👩', 'אמא עורכת את השולחן לשבת', ['🤲', 'לעזור לאמא'], ['😴', 'ללכת לישון'], ['🎮', 'לשחק לבד'], 'עזרת לאמא לערוך את השולחן, היא ממש שמחה!', 'כיבוד הורים']
  ];
  const lines = () => ['מעשים טובים! בואי נעזור לכולם בשכונה', 'איך אפשר לעזור?', 'זה לא כל כך יעזור, נסי משהו אחר', 'מצווה!', 'כל הכבוד! עשית המון מעשים טובים!', 'את ילדה טובה!',
    ...S.flatMap(x => [x[1], x[5], x[6]])];
  return { S, lines };
})();

registerGame({
  id: 'mitzvot', name: 'מעשים טובים', emoji: '💖', color: '#f15bb5', say: 'מעשים טובים! בואי נעזור לכולם בשכונה',
  lines: MITZ.lines,
  mount(root, s) {
    const { S } = MITZ;
    const ROUNDS = 6;
    let order = shuffle(S), round = 0, busy = true, hearts = 0;
    root.innerHTML = `<div class="mt"><div class="mt-top"><div class="mt-box">💝 <b>0</b></div><div class="sh-dots">${'<i></i>'.repeat(ROUNDS)}</div></div>
      <div class="mt-scene"><canvas class="mt-noni"></canvas><div class="mt-sc"></div></div>
      <div class="mt-text"></div><div class="mt-opts"></div><div class="mt-done"></div></div>`;
    const sc = $('.mt-sc', root), text = $('.mt-text', root), opts = $('.mt-opts', root), doneEl = $('.mt-done', root), box = $('.mt-box b', root), noni = $('.mt-noni', root);
    const nc = noni.getContext('2d'); noni.width = noni.height = 200; let t = 0, happy = false;
    s.onFrame(dt => { t += dt; nc.clearRect(0, 0, 200, 200); drawNoni(nc, 100, 186 - Math.abs(Math.sin(t * 3)) * (happy ? 18 : 6), 110, { t, dir: 1, happy }); });

    function start() {
      busy = true; happy = false;
      const [scene, sit, good, bad1, bad2] = order[round];
      sc.innerHTML = scene.match(/\p{Extended_Pictographic}️?/gu).map((e, i) => `<span style="--i:${i}">${e}</span>`).join('');
      sc.classList.remove('turn'); void sc.offsetWidth; sc.classList.add('turn');
      text.textContent = sit; doneEl.textContent = ''; doneEl.classList.remove('on');
      opts.innerHTML = shuffle([[...good, 1], [...bad1, 0], [...bad2, 0]]).map(([e, l, ok]) => `<button class="fl-o" data-ok="${ok}"><span>${e}</span>${l}</button>`).join('');
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say(round === 0 ? ['מעשים טובים! בואי נעזור לכולם בשכונה', sit, 'איך אפשר לעזור?'] : [sit, 'איך אפשר לעזור?']);
      s.later(() => busy = false, 600);
      $$('.fl-o', opts).forEach(b => b.onclick = () => choose(b, b.dataset.ok === '1'));
    }
    function choose(b, ok) {
      if (busy) return; Sound.init();
      if (!ok) { Sound.wrong(); b.classList.add('no'); Voice.say('זה לא כל כך יעזור, נסי משהו אחר'); return; }
      busy = true; happy = true; b.classList.add('yes');
      const [, , , , , well, name] = order[round];
      Sound.chime(); const c = center(b); FX.burst(c.x, c.y, ['💖', '💗', '✨'], 14, 36);
      // הלב עף לקופת המעשים הטובים
      const bx = center($('.mt-box', root)); s.later(() => { hearts++; box.textContent = hearts; Sound.coin(); FX.burst(bx.x, bx.y, ['💖'], 5, 28); }, 700);
      doneEl.innerHTML = `<b>${name}</b><br>${well}`; doneEl.classList.add('on');
      Voice.say(['מצווה!', well, name]);
      s.later(() => { round++; if (round < ROUNDS) start(); else { const c2 = center(sc); Stars.add(c2.x, c2.y, 2); celebrate({ emoji: '💝', title: 'כל הכבוד! עשית המון מעשים טובים!', stars: 3, again: () => { order = shuffle(S); round = 0; start(); } }); } }, 7200);
    }
    start();
  }
});
