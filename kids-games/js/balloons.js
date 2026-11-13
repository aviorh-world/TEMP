'use strict';
/* 🎈 בלונים – מפוצצים וסופרים עד 10 */
registerGame({
  lines: ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'ספרת עד עשר!'],
  id: 'balloons', name: 'בלונים', emoji: '🎈', color: '#ff5d8f', say: 'בלונים! פוצצי בלונים ונספור יחד',
  mount(root, s) {
    const NUMS = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
    const INSIDE = ['🐥', '🐰', '🦋', '⭐', '🍭', '🐱', '🌸', '🐶'];
    root.innerHTML = `<div class="bl">
      <div class="cl" style="top:8%;animation-duration:44s;animation-delay:-12s"></div>
      <div class="cl" style="top:28%;animation-duration:60s;animation-delay:-40s;scale:.7"></div>
      <div class="bl-num">${NUMS.map((_, i) => `<span>${i + 1}</span>`).join('')}</div></div>`;
    const area = $('.bl', root), nums = $$('.bl-num span', root);
    let count = 0, paused = false;

    const balloonSVG = c => `<svg viewBox="0 0 100 170"><path d="M50,118 Q46,140 54,150 Q60,160 48,170" stroke="#888" stroke-width="2" fill="none"/>
      <path d="M50,4 C78,4 94,28 94,54 C94,86 70,110 50,114 C30,110 6,86 6,54 C6,28 22,4 50,4Z" fill="${c}"/>
      <path d="M44,113 L56,113 L53,120 L47,120Z" fill="${c}"/>
      <ellipse cx="32" cy="34" rx="9" ry="15" transform="rotate(25 32 34)" fill="#fff" opacity=".45"/></svg>`;

    function spawn() {
      if (paused || $$('.bln', area).length >= 9) return;
      const col = pick(COLORS), b = el('div', 'bln');
      const inside = Math.random() < .2 ? pick(INSIDE) : '';
      b.innerHTML = `<div class="sw">${balloonSVG(col.c)}${inside ? `<span class="inner">${inside}</span>` : ''}</div>`;
      b.style.left = rand(2, 84) + '%'; b.style.animationDuration = rand(6, 9.5) + 's';
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
      if (inside) {
        const f = el('span', 'faller', inside); f.style.left = (x - 30) + 'px'; f.style.top = (y - 30) + 'px';
        FX.layer.appendChild(f); setTimeout(() => f.remove(), 1900);
      }
      count++;
      nums[count - 1].classList.add('on');
      const big = el('div', 'bignum', count); big.style.setProperty('--c', col.c); area.appendChild(big);
      s.later(() => big.remove(), 1000);
      Voice.say(NUMS[count - 1]);
      if (count === 10) {
        paused = true;
        s.later(() => celebrate({ emoji: '🎈', title: 'ספרת עד עשר!', again: reset }), 1100);
      }
    }
    function reset() { count = 0; paused = false; nums.forEach(n => n.classList.remove('on')); }

    for (let i = 0; i < 4; i++) s.later(spawn, i * 350);
    s.every(spawn, 850);
  }
});
