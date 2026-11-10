'use strict';
/* 🧠 משחק הזיכרון – 16 או 24 קלפים צבעוניים */
registerGame({
  id: 'memory', name: 'משחק הזיכרון', emoji: '🧠', color: '#9b5de5', say: 'משחק הזיכרון! כמה קלפים?',
  mount(root, s) {
    const FACES = ['🦄', '🐶', '🐱', '🐰', '🦋', '🌈', '🍓', '🍦', '🐸', '🐼', '🌻', '🚗', '🐠', '🍉', '🐞', '🎈', '🐥', '🍭'];
    const FC = ['#ffe3f1', '#e1f3ff', '#fff4c7', '#e3fbe0', '#efe4ff', '#ffe6d5'];
    const BC = ['#ff70a6', '#4cc9f0', '#ffc300', '#2ec27e', '#9b5de5', '#ff8c1a'];

    function chooser() {
      root.innerHTML = `<div class="mem"><div class="picker"><h3>כמה קלפים? 🃏</h3><div class="opts">
        <button class="opt" data-n="16" style="--c:#4cc9f0;--i:0"><span class="oe">🟦</span>16</button>
        <button class="opt" data-n="24" style="--c:#ff70a6;--i:1"><span class="oe">🟪</span>24</button></div></div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); play(+b.dataset.n); });
    }

    function play(n) {
      root.innerHTML = '<div class="mem"><div class="mem-grid"></div></div>';
      const grid = $('.mem-grid', root), wrap = $('.mem', root);
      const faces = shuffle(FACES).slice(0, n / 2);
      const deck = shuffle(faces.flatMap((f, i) => [{ f, fc: FC[i % FC.length] }, { f, fc: FC[i % FC.length] }]));
      let open = [], lock = false, found = 0;

      function layout() {
        const W = wrap.clientWidth - 24, H = wrap.clientHeight - 24, land = W >= H;
        let cols = n === 16 ? 4 : (land ? 6 : 4), rows = n / cols;
        const gap = Math.max(8, Math.min(W, H) * .022);
        const cs = Math.floor(Math.min((W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows, 170));
        grid.style.gridTemplateColumns = `repeat(${cols},${cs}px)`;
        grid.style.setProperty('--cs', cs + 'px'); grid.style.setProperty('--gap', gap + 'px');
      }
      layout(); s.on(window, 'resize', layout);

      deck.forEach((d, i) => {
        const c = el('button', 'card3d', `<div class="in"><div class="b"></div><div class="f">${d.f}</div></div>`);
        c.style.setProperty('--i', i); c.style.setProperty('--bc', BC[i % BC.length]); c.style.setProperty('--fc', d.fc);
        c.onclick = () => flip(c, d);
        grid.appendChild(c);
      });

      function flip(c, d) {
        if (lock || c.classList.contains('up')) return;
        Sound.init(); Sound.tone(500 + open.length * 200, .1, { type: 'triangle', vol: .15 });
        c.classList.add('up'); open.push([c, d]);
        if (open.length < 2) return;
        lock = true;
        const [[a, da], [b, db]] = open; open = [];
        if (da.f === db.f) {
          s.later(() => {
            a.classList.add('done'); b.classList.add('done'); Sound.ding(found); Sound.sparkle(.1);
            const p = center(b); FX.burst(p.x, p.y, ['✨', '⭐', '💖'], 10, 30);
            found++; lock = false;
            if (found % 3 === 0 && found < n / 2) Voice.say(pick(['יופי!', 'מצאת!', 'כל הכבוד!']));
            if (found === n / 2) s.later(() => celebrate({ emoji: '🧠', title: 'מצאת את כולם!', stars: n === 24 ? 4 : 3, again: chooser }), 700);
          }, 380);
        } else {
          s.later(() => { a.classList.remove('up'); b.classList.remove('up'); lock = false; }, 1000);
        }
      }
    }
    chooser();
  }
});
