'use strict';
/* 🎈 בלונים – בוחרים לספור עד 10, 20 או 100, מפוצצים בלונים והקריינית סופרת */
const BALLOONS = (() => {
  // מספרים בעברית (ספירה בלשון נקבה, כמו שסופרים): אחת, שתיים ... מאה
  const ONES = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
  const TEENS = ['אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
  const TENS = { 2: 'עשרים', 3: 'שלושים', 4: 'ארבעים', 5: 'חמישים', 6: 'שישים', 7: 'שבעים', 8: 'שמונים', 9: 'תשעים' };
  function he(n) {
    if (n <= 10) return ONES[n - 1];
    if (n < 20) return TEENS[n - 11];
    if (n === 100) return 'מאה';
    const t = Math.floor(n / 10), o = n % 10;
    return o ? `${TENS[t]} ו${ONES[o - 1]}` : TENS[t];
  }
  const GOALS = [[10, 'עשר'], [20, 'עשרים'], [100, 'מאה']];
  const lines = () => [...Array.from({ length: 100 }, (_, i) => he(i + 1)), 'עד כמה נספור?', ...GOALS.map(g => `ספרת עד ${g[1]}!`)];
  return { he, GOALS, lines };
})();

registerGame({
  id: 'balloons', name: 'בלונים', emoji: '🎈', color: '#ff5d8f', say: 'בלונים! פוצצי בלונים ונספור יחד',
  lines: BALLOONS.lines,
  mount(root, s) {
    const { he, GOALS } = BALLOONS;
    const INSIDE = ['🐥', '🐰', '🦋', '⭐', '🍭', '🐱', '🌸', '🐶'];
    let goal = 10, count = 0, paused = true, area, ten, bar, big0;

    function chooser() {
      paused = true;
      root.innerHTML = `<div class="picker"><h3>🎈 עד כמה נספור?</h3><div class="opts">
        ${GOALS.map(([n], i) => `<button class="opt" data-n="${n}" style="--c:${['#ff70a6', '#4cc9f0', '#ffc300'][i]};--i:${i}"><span class="oe">${['🎈', '🎈🎈', '🎈🎈🎈'][i]}</span><b style="font-size:1.4em">${n}</b></button>`).join('')}</div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); start(+b.dataset.n); });
      Voice.say('עד כמה נספור?');
    }

    function start(n) {
      goal = n; count = 0; paused = false;
      root.innerHTML = `<div class="bl">
        <div class="cl" style="top:8%;animation-duration:44s;animation-delay:-12s"></div>
        <div class="cl" style="top:28%;animation-duration:60s;animation-delay:-40s;scale:.7"></div>
        ${goal > 10 ? `<div class="bl-goal"><div class="bl-bar"><i></i></div><b class="bl-of">0 / ${goal}</b></div>` : ''}
        <div class="bl-num"></div></div>`;
      area = $('.bl', root); bar = $('.bl-bar i', root); big0 = $('.bl-of', root);
      paintTen();
      for (let i = 0; i < 4; i++) s.later(spawn, i * 300);
    }
    // שורת עשר המספרים הנוכחית (1-10, 11-20, ...)
    function paintTen() {
      const base = Math.floor(Math.min(count, goal - 1) / 10) * 10;
      $('.bl-num', area).innerHTML = Array.from({ length: Math.min(10, goal - base) }, (_, i) => `<span class="${base + i + 1 <= count ? 'on' : ''}">${base + i + 1}</span>`).join('');
    }

    const balloonSVG = c => `<svg viewBox="0 0 100 170"><path d="M50,118 Q46,140 54,150 Q60,160 48,170" stroke="#888" stroke-width="2" fill="none"/>
      <path d="M50,4 C78,4 94,28 94,54 C94,86 70,110 50,114 C30,110 6,86 6,54 C6,28 22,4 50,4Z" fill="${c}"/>
      <path d="M44,113 L56,113 L53,120 L47,120Z" fill="${c}"/>
      <ellipse cx="32" cy="34" rx="9" ry="15" transform="rotate(25 32 34)" fill="#fff" opacity=".45"/></svg>`;

    function spawn() {
      if (paused || !area || $$('.bln', area).length >= (goal === 100 ? 13 : 9)) return;
      const col = pick(COLORS), b = el('div', 'bln');
      const inside = Math.random() < .2 ? pick(INSIDE) : '';
      b.innerHTML = `<div class="sw">${balloonSVG(col.c)}${inside ? `<span class="inner">${inside}</span>` : ''}</div>`;
      b.style.left = rand(2, 84) + '%'; b.style.animationDuration = rand(goal === 100 ? 5 : 6, goal === 100 ? 8 : 9.5) + 's';
      b.querySelector('.sw').style.animationDelay = rand(-2, 0) + 's';
      b.addEventListener('animationend', e => { if (e.target === b) b.remove(); });
      b.addEventListener('pointerdown', e => { e.preventDefault(); pop(b, col, inside); });
      area.appendChild(b);
    }

    function pop(b, col, inside) {
      if (b.dataset.popped || paused) return; b.dataset.popped = 1;
      Sound.init(); Sound.pop();
      const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.width * .55;
      b.remove();
      FX.burst(x, y, ['✨', '💥', '⭐'], 8, 28);
      for (let i = 0; i < 10; i++) {
        const p = el('span', 'particle', '●'); p.style.cssText = `left:${x}px;top:${y}px;color:${col.c};--s:22px;--dx:${rand(-120, 120)}px;--dy:${rand(-120, 120)}px;--r:0deg`;
        FX.layer.appendChild(p); setTimeout(() => p.remove(), 1000);
      }
      if (inside) { const f = el('span', 'faller', inside); f.style.left = (x - 30) + 'px'; f.style.top = (y - 30) + 'px'; FX.layer.appendChild(f); setTimeout(() => f.remove(), 1900); }
      count++;
      paintTen();
      if (bar) { bar.style.width = count / goal * 100 + '%'; big0.textContent = `${count} / ${goal}`; }
      const big = el('div', 'bignum', count); big.style.setProperty('--c', col.c); area.appendChild(big);
      s.later(() => big.remove(), 1000);
      Voice.say(he(count));
      if (count === goal) {
        paused = true;
        const g = GOALS.find(q => q[0] === goal);
        s.later(() => celebrate({ emoji: '🎈', title: `ספרת עד ${goal}!`, say: `ספרת עד ${g[1]}!`, stars: goal === 100 ? 5 : goal === 20 ? 4 : 3, again: chooser }), 1100);
      } else if (count % 10 === 0) {   // כל עשרה – חגיגה קטנה
        FX.confetti(x, y, 40); Sound.chime(); Stars.add(x, y, 1);
      }
    }
    s.every(spawn, 700);
    chooser();
  }
});
