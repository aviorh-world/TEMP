'use strict';
/* 📖 סיפור אינטראקטיבי – "נוני והברווזון האבוד" (סיפור מקורי). הקריינית מספרת, ובשתי נקודות בוחרים מה קורה */
const STORY = (() => {
  // כל עמוד: [סצנה (אימוג׳ים), משפט, המשך] – המשך הוא מספר העמוד הבא, או רשימת בחירות [[אימוג׳י, תווית, עמוד]]
  const P = {
    1: ['☀️🌳🌷', 'נוני יצאה לטייל בפארק ביום שמש יפה.', 2],
    2: ['🌳🐥💧', 'פתאום היא שמעה קול קטן: קוואק, קוואק!', 3],
    3: ['🐥😢', 'זה היה ברווזון קטן שאיבד את אמא שלו. הוא היה עצוב מאוד.', 4],
    4: ['🤔', 'מה נוני תעשה?', [['🤗', 'לחבק אותו', 5], ['🍪', 'לתת לו עוגייה', 6]]],
    5: ['🤗🐥', 'נוני חיבקה את הברווזון, והוא הרגיש קצת יותר טוב.', 7],
    6: ['🍪🐥😊', 'נוני חילקה איתו את העוגייה שלה. איזה שיתוף!', 7],
    7: ['🧭', 'בואו נחפש את אמא ברווזה! לאן נלך?', [['🌊', 'לאגם', 8], ['🌲', 'ליער', 9]]],
    8: ['🌊🐟', 'באגם הם פגשו דג חביב. הדג אמר: ראיתי ברווזה גדולה ליד הגשר!', 10],
    9: ['🌲🦉', 'ביער הם פגשו ינשוף חכם. הינשוף אמר: אמא ברווזה מחפשת ליד הגשר!', 10],
    10: ['🌉🦆', 'הם הלכו יחד לגשר, ושם חיכתה אמא ברווזה!', 11],
    11: ['🦆💖🐥', 'אמא ברווזה שמחה מאוד ואמרה: תודה רבה נוני, עשית מעשה טוב!', 12],
    12: ['💖🌈', 'נוני הרגישה שמחה בלב. כשעוזרים לאחרים, גם לנו טוב. הסוף.', 0]
  };
  const lines = () => [...Object.values(P).map(p => p[1]), 'בואי נקרא סיפור!', 'מה תבחרי?', 'עוד פעם את הסיפור?'];
  return { P, lines };
})();

registerGame({
  id: 'story', name: 'סיפור: נוני והברווזון', emoji: '📖', color: '#9d8df1', say: 'בואי נקרא סיפור!',
  lines: STORY.lines,
  mount(root, s) {
    const { P } = STORY;
    root.innerHTML = `<div class="st"><div class="st-page"><canvas class="st-noni"></canvas><div class="st-scene"></div></div>
      <div class="st-text"></div><div class="st-ctrl"><button class="st-again" aria-label="שוב">🔊</button><div class="st-choices"></div><button class="st-next" aria-label="הלאה">▶️</button></div></div>`;
    const sceneEl = $('.st-scene', root), textEl = $('.st-text', root), choices = $('.st-choices', root), nextB = $('.st-next', root), noni = $('.st-noni', root);
    let page = 1, t = 0;
    // נוני מצוירת בפינה ומקפצת קלות
    const nc = noni.getContext('2d'); noni.width = noni.height = 220;
    s.onFrame(dt => { t += dt; nc.clearRect(0, 0, 220, 220); drawNoni(nc, 110, 200 - Math.abs(Math.sin(t * 2.4)) * 14, 120, { t, dir: -1, happy: page >= 11 }); });

    function show(n) {
      page = n; const [sc, sent, next] = P[n];
      sceneEl.innerHTML = sc.match(/\p{Extended_Pictographic}️?/gu).map((e, i) => `<span style="--i:${i}">${e}</span>`).join('');
      sceneEl.classList.remove('turn'); void sceneEl.offsetWidth; sceneEl.classList.add('turn');
      textEl.textContent = sent; Sound.whoosh();
      if (Array.isArray(next)) {
        nextB.style.visibility = 'hidden';
        choices.innerHTML = next.map(([e, l, to]) => `<button class="st-ch" data-to="${to}"><span>${e}</span>${l}</button>`).join('');
        $$('.st-ch', choices).forEach(b => b.onclick = () => { Sound.pop(); show(+b.dataset.to); });
        Voice.say([sent]);
      } else {
        choices.innerHTML = ''; nextB.style.visibility = '';
        Voice.say(sent);
        if (next === 0) {
          nextB.style.visibility = 'hidden';
          const c = center(sceneEl); FX.confetti(c.x, c.y, 60); Sound.tada(); Stars.add(c.x, c.y, 2);
          s.later(() => celebrate({ emoji: '📖', title: 'הסוף! איזה סיפור יפה', say: 'עוד פעם את הסיפור?', stars: 2, again: () => show(1) }), 5000);
        }
      }
    }
    nextB.onclick = () => { Sound.tap(); const nx = P[page][2]; if (typeof nx === 'number' && nx) show(nx); };
    $('.st-again', root).onclick = () => { Sound.tap(); Voice.say(P[page][1]); };
    show(1);
  }
});
