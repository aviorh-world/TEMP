'use strict';
/* 🔴🔵 עקבי אחרי הצבעים – הכפתורים נדלקים ברצף, והיא חוזרת עליו. טעות = מראים שוב, בלי לאבד */
registerGame({
  id: 'simon', name: 'עקבי אחרי הצבעים', emoji: '🚦', color: '#ff595e', say: 'עקבי אחרי הצבעים! תסתכלי ותקשיבי',
  lines: ['עקבי אחרי הצבעים! תסתכלי ותקשיבי', 'תורך!', 'נכון!', 'עכשיו רצף ארוך יותר', 'בואי נראה שוב', 'איזה זיכרון!', 'תסתכלי טוב...'],
  mount(root, s) {
    const PADS = [['#ff4d4d', '🐞', 330], ['#3a86ff', '🐳', 392], ['#ffd60a', '🐥', 494], ['#2ec27e', '🐸', 587]];
    const GOAL = 7;
    let seq = [], pos = 0, busy = true;
    root.innerHTML = `<div class="sm"><div class="sm-top"><div class="sm-status"></div><div class="sh-dots">${Array.from({ length: GOAL - 1 }, () => '<i></i>').join('')}</div></div>
      <div class="sm-board">${PADS.map(([c, e], i) => `<button class="sm-pad" data-i="${i}" style="--c:${c}"><span>${e}</span></button>`).join('')}</div></div>`;
    const pads = $$('.sm-pad', root), status = $('.sm-status', root);

    function flash(i, ms = 420) {
      const p = pads[i]; p.classList.add('lit'); Sound.tone(PADS[i][2], ms / 1000, { type: 'triangle', vol: .25 });
      s.later(() => p.classList.remove('lit'), ms);
    }
    function show(again) {
      busy = true; status.textContent = '👀'; pos = 0;
      if (again) Voice.say('בואי נראה שוב');
      const gap = Math.max(420, 760 - seq.length * 45);
      seq.forEach((k, i) => s.later(() => flash(k, gap * .65), 900 + i * gap));
      s.later(() => { busy = false; status.textContent = '👆 ' + 'תורך!'; Voice.say('תורך!'); }, 900 + seq.length * gap + 200);
    }
    function grow() {
      seq.push(randi(0, 3));
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < seq.length - 2));
      show(false);
    }
    pads.forEach((p, i) => p.addEventListener('pointerdown', e => {
      e.preventDefault(); Sound.init(); if (busy) return;
      flash(i, 260);
      if (i !== seq[pos]) { busy = true; Sound.wrong(); s.later(() => show(true), 700); return; }
      pos++;
      if (pos === seq.length) {
        busy = true;
        const c = center(p);
        if (seq.length >= GOAL) {
          FX.confetti(c.x, c.y, 60); Sound.tada();
          s.later(() => celebrate({ emoji: '🧠', title: 'איזה זיכרון!', stars: 3, again: () => { seq = [randi(0, 3)]; grow(); } }), 900);
          return;
        }
        Sound.chime(); praise(c.x, c.y - 40, ['עכשיו רצף ארוך יותר']);
        s.later(grow, 1800);
      }
    }));
    $('.sm', root)._dbg = () => ({ seq, busy });  // לבדיקות אוטומטיות
    seq = [randi(0, 3)];
    s.later(grow, 1400);
  }
});
