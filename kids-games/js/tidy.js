'use strict';
/* 🧸 מסדרים את החדר – צעצועים לקופסה, בגדים לארון, ספרים למדף */
const TIDY = (() => {
  const BINS = [['toy', '🧺', 'קופסת הצעצועים', 'צעצועים לקופסה'], ['cloth', '🚪', 'הארון', 'בגדים לארון'], ['book', '📚', 'המדף', 'ספרים למדף']];
  const ITEMS = [['🧸', 'toy', 'דובי'], ['🚗', 'toy', 'מכונית'], ['⚽', 'toy', 'כדור'], ['🧩', 'toy', 'פאזל'], ['🪀', 'toy', 'יויו'], ['🦆', 'toy', 'ברווז'],
    ['👕', 'cloth', 'חולצה'], ['👗', 'cloth', 'שמלה'], ['🧦', 'cloth', 'גרביים'], ['👟', 'cloth', 'נעל'], ['🧢', 'cloth', 'כובע'], ['👖', 'cloth', 'מכנסיים'],
    ['📕', 'book', 'ספר אדום'], ['📗', 'book', 'ספר ירוק'], ['📘', 'book', 'ספר כחול'], ['📙', 'book', 'ספר כתום']];
  const lines = () => ['בואי נסדר את החדר!', ...BINS.map(b => b[3]), ...BINS.map(b => `זה הולך ל${b[2]}`), ...ITEMS.map(i => i[2]), 'איזה חדר נקי!', 'עוד קצת ונגמר!', 'החדר מסודר! כל הכבוד!'];
  return { BINS, ITEMS, lines };
})();

registerGame({
  id: 'tidy', name: 'מסדרים את החדר', emoji: '🧸', color: '#ffb703', say: 'בואי נסדר את החדר!',
  lines: TIDY.lines,
  mount(root, s) {
    const { BINS, ITEMS } = TIDY;
    const COUNTS = [6, 8, 10];
    let round = 0, left = 0;
    root.innerHTML = `<div class="td"><div class="sh-dots">${COUNTS.map(() => '<i></i>').join('')}</div>
      <div class="td-floor"></div>
      <div class="td-bins">${BINS.map(([k, e, n]) => `<div class="td-bin" data-k="${k}"><span class="be">${e}</span><span class="bn">${n.replace('ה', '')}</span><span class="bc"></span></div>`).join('')}</div></div>`;
    const floor = $('.td-floor', root);

    function start() {
      const n = COUNTS[round];
      const byK = k => shuffle(ITEMS.filter(i => i[1] === k));
      // מערבבים מכל סוג באופן שווה
      const pool = shuffle([].concat(...['toy', 'cloth', 'book'].map(k => byK(k).slice(0, Math.ceil(n / 3))))).slice(0, n);
      left = n; floor.innerHTML = ''; $$('.td-bin .bc', root).forEach(c => c.textContent = '');
      floor.classList.remove('clean');
      // פיזור על רשת עם תזוזה קטנה – בלי חפצים שמסתירים זה את זה
      const cols = n > 8 ? 4 : 3, rows = Math.ceil(n / cols), cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i));
      pool.forEach(([e, k, name], i) => {
        const it = el('div', 'td-item', e), cIdx = cells[i];
        it.style.left = (4 + (cIdx % cols) * (82 / (cols - 1 || 1)) + rand(-4, 4)) + '%';
        it.style.top = (6 + Math.floor(cIdx / cols) * (64 / Math.max(1, rows - 1)) + rand(-4, 4)) + '%'; it.style.setProperty('--r', randi(-35, 35) + 'deg'); it.style.setProperty('--i', i);
        floor.appendChild(it);
        draggable(it, {
          onTap: () => Voice.say(name),
          onDrop: (x, y) => {
            const bin = $$('.td-bin', root).find(b => hit(b, x, y, 24));
            if (!bin) return false;
            if (bin.dataset.k !== k) {
              Sound.wrong(); bin.classList.remove('shake'); void bin.offsetWidth; bin.classList.add('shake');
              Voice.say(`זה הולך ל${BINS.find(b => b[0] === k)[2]}`);
              return false;
            }
            it.remove(); left--;
            bin.classList.remove('ok'); void bin.offsetWidth; bin.classList.add('ok');
            $('.bc', bin).textContent += e;
            const c = center(bin); Sound.ding(n - left);
            if (left === 2) { FX.burst(c.x, c.y, ['✨'], 6, 24); Voice.say('עוד קצת ונגמר!'); }
            else if (left > 0) { if ((n - left) % 2 === 0) praise(c.x, c.y - 30, [name]); else { Voice.say(name); FX.burst(c.x, c.y, ['✨'], 6, 24); } }
            if (left === 0) done();
            return true;
          }
        });
      });
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say(round === 0 ? ['בואי נסדר את החדר!', ...BINS.map(b => b[3])] : 'בואי נסדר את החדר!');
    }
    function done() {
      floor.classList.add('clean'); Sound.tada();
      const c = center(floor); FX.rain(['✨', '⭐', '🫧'], 30, 2); Voice.say('איזה חדר נקי!'); Stars.add(c.x, c.y, 1);
      s.later(() => {
        round++;
        if (round < COUNTS.length) start();
        else celebrate({ emoji: '🧹', title: 'החדר מסודר! כל הכבוד!', stars: 3, again: () => { round = 0; start(); } });
      }, 2600);
    }
    start();
  }
});
