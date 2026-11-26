'use strict';
/* 😊 איך הוא מרגיש? – מצב קצר, בוחרים רגש, ומקבלים טיפ קטן איך להתמודד */
const FEEL = (() => {
  // [שם, פרצוף, זכר, נקבה, טיפ]
  const F = {
    happy: ['שמח', '😀', 'הוא שמח', 'היא שמחה', 'כששמחים, כיף לשתף חברים'],
    sad: ['עצוב', '😢', 'הוא עצוב', 'היא עצובה', 'כשעצובים, חיבוק עוזר להרגיש יותר טוב'],
    angry: ['כועס', '😠', 'הוא כועס', 'היא כועסת', 'כשכועסים, נושמים עמוק ומספרים מה קרה'],
    surprised: ['מופתע', '😮', 'הוא מופתע', 'היא מופתעת', 'הפתעה! לפעמים הפתעות הן ממש כיף'],
    scared: ['מפחד', '😨', 'הוא מפחד', 'היא מפחדת', 'כשמפחדים, אפשר לקרוא לאמא או לאבא']
  };
  // [סצנה, משפט, רגש, נקבה?]
  const SC = [
    ['🐻🎁🎂', 'הדובי קיבל מתנה ליום ההולדת', 'happy'],
    ['🐰🎈💨', 'הבלון של הארנב עף לשמיים', 'sad'],
    ['🐱⚽🙅', 'מישהו לקח לחתול את הכדור בלי לשאול', 'angry'],
    ['🐶🎉🎊', 'כל החברים באו להפתיע את הכלב', 'surprised'],
    ['🐥⛈️🌩️', 'יש רעם חזק בחוץ, והאפרוח לבד', 'scared'],
    ['🐸🍦💧', 'הגלידה של הצפרדע נפלה על הרצפה', 'sad', 1],
    ['🐼🎨🏆', 'הפנדה ציירה ציור יפה וכולם מחאו כפיים', 'happy', 1],
    ['🦊🧱💥', 'מישהו הפיל לשועל את המגדל שהוא בנה', 'angry'],
    ['🐵🎩🐇', 'הקוף ראה ארנב קופץ מתוך כובע', 'surprised'],
    ['🐻🌑👻', 'החושך בחדר, והדובי שמע רעש מוזר', 'scared']
  ];
  const lines = () => ['איך הוא מרגיש?', 'איך היא מרגישה?', 'נסי שוב, תסתכלי על מה שקרה', 'את חברה אמיתית!', ...SC.map(x => x[1]),
    ...Object.values(F).flatMap(f => [f[2], f[3], f[4]])];
  return { F, SC, lines };
})();

registerGame({
  id: 'feelings', name: 'איך הוא מרגיש?', emoji: '😊', color: '#ffb4a2', say: 'איך הוא מרגיש?',
  lines: FEEL.lines,
  mount(root, s) {
    const { F, SC } = FEEL;
    const ROUNDS = 6;
    let order = shuffle(SC), round = 0, busy = true;
    root.innerHTML = `<div class="fl"><div class="sh-dots">${'<i></i>'.repeat(ROUNDS)}</div>
      <div class="fl-scene"></div><div class="fl-text"></div><div class="fl-q"></div><div class="fl-opts"></div><div class="fl-tip"></div></div>`;
    const scene = $('.fl-scene', root), text = $('.fl-text', root), q = $('.fl-q', root), opts = $('.fl-opts', root), tip = $('.fl-tip', root);

    function start() {
      busy = true;
      const [sc, sent, feel, fem] = order[round], f = F[feel];
      scene.innerHTML = [...sc].filter(ch => ch.trim()).length ? sc.match(/\p{Extended_Pictographic}(️)?/gu).map((e, i) => `<span style="--i:${i}">${e}</span>`).join('') : sc;
      text.textContent = sent; q.textContent = fem ? 'איך היא מרגישה?' : 'איך הוא מרגיש?'; tip.textContent = ''; tip.classList.remove('on');
      const choices = shuffle([feel, ...shuffle(Object.keys(F).filter(k => k !== feel)).slice(0, 2)]);
      opts.innerHTML = choices.map(k => `<button class="fl-o" data-k="${k}"><span>${F[k][1]}</span>${fem ? F[k][3].replace('היא ', '') : F[k][0]}</button>`).join('');
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say([sent, fem ? 'איך היא מרגישה?' : 'איך הוא מרגיש?']);
      s.later(() => busy = false, 600);
      $$('.fl-o', opts).forEach(b => b.onclick = () => answer(b, b.dataset.k === feel, f, fem));
    }
    function answer(b, ok, f, fem) {
      if (busy) return; Sound.init();
      if (!ok) { Sound.wrong(); b.classList.add('no'); Voice.say('נסי שוב, תסתכלי על מה שקרה'); return; }
      busy = true; b.classList.add('yes'); Sound.chime();
      const c = center(b); FX.burst(c.x, c.y, ['💖', '✨'], 10, 32);
      tip.textContent = f[1] + ' ' + f[4]; tip.classList.add('on');
      Voice.say([pick(PRAISE), fem ? f[3] : f[2], f[4]]);
      s.later(() => { round++; if (round < ROUNDS) start(); else celebrate({ emoji: '🤗', title: 'את חברה אמיתית!', stars: 3, again: () => { order = shuffle(SC); round = 0; start(); } }); }, 6200);
    }
    start();
  }
});
