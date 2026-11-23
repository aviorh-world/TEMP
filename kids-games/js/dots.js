'use strict';
/* 🔢 חברי את הנקודות – 1 עד 10, הקריינית סופרת, ובסוף מתגלה ציור */
const DOTS = (() => {
  const NUMS = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
  // נקודות בציור 400x400 (מסודרות לפי הסדר), צבע מילוי ושם
  const star = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 72 : 170; return [200 + r * Math.cos(a), 215 + r * Math.sin(a)]; });
  const PICS = [
    { n: 'כוכב', e: '⭐', c: '#ffd60a', pts: star },
    { n: 'בית', e: '🏠', c: '#ff8c69', pts: [[80, 360], [80, 190], [40, 190], [200, 50], [360, 190], [320, 190], [320, 360], [240, 360], [240, 270], [160, 270]] },
    { n: 'לב', e: '❤️', c: '#ff4d6d', pts: [[200, 360], [80, 250], [45, 160], [80, 85], [150, 75], [200, 130], [250, 75], [320, 85], [355, 160], [320, 250]] },
    { n: 'דג', e: '🐟', c: '#4cc9f0', pts: [[50, 200], [120, 110], [220, 95], [300, 170], [370, 110], [350, 200], [370, 290], [300, 230], [220, 305], [120, 290]] },
    { n: 'סירה', e: '⛵', c: '#3a86ff', pts: [[60, 270], [340, 270], [290, 350], [110, 350], [60, 270], [190, 270], [190, 60], [310, 240], [200, 240], [200, 270]] },
    { n: 'עץ', e: '🌲', c: '#2ec27e', pts: [[170, 370], [170, 310], [70, 310], [140, 220], [90, 220], [200, 60], [310, 220], [260, 220], [330, 310], [230, 310]] },
    { n: 'גלידה', e: '🍦', c: '#ff9ec4', pts: [[200, 380], [120, 190], [90, 170], [100, 120], [150, 90], [200, 60], [250, 90], [300, 120], [310, 170], [280, 190]] },
    { n: 'יהלום', e: '💎', c: '#b388ff', pts: [[200, 370], [50, 170], [110, 80], [160, 80], [200, 130], [240, 80], [290, 80], [350, 170], [250, 170], [150, 170]] }
  ];
  const lines = () => [...NUMS, 'חברי את הנקודות לפי המספרים!', 'מתחילים באחת', 'חפשי את המספר', 'מה יצא לנו?',
    ...PICS.map(p => `זה ${p.n}!`), 'יצא ציור יפה!', 'איזה ציורים יפים!'];
  return { NUMS, PICS, lines };
})();

registerGame({
  id: 'dots', name: 'חברי את הנקודות', emoji: '🔢', color: '#06d6a0', say: 'חברי את הנקודות לפי המספרים!',
  lines: DOTS.lines,
  mount(root, s) {
    const { NUMS, PICS } = DOTS;
    let order = shuffle(PICS.map((_, i) => i)), round = 0;
    root.innerHTML = `<div class="dt"><div class="sh-dots">${order.slice(0, 5).map(() => '<i></i>').join('')}</div><div class="dt-stage"></div></div>`;
    const stage = $('.dt-stage', root);

    function start() {
      const pic = PICS[order[round]];
      let next = 0, busy = false, wrong = 0;
      stage.innerHTML = `<svg class="dt-svg" viewBox="0 0 400 400">
        <polygon class="dt-fill" points="${pic.pts.map(p => p.join(',')).join(' ')}" fill="${pic.c}"/>
        <polyline class="dt-line" points="" />
        ${pic.pts.map(([x, y], i) => `<g class="dt-dot" data-i="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="24" class="hit"/><circle r="11" class="d"/><text y="-20">${i + 1}</text></g>`).join('')}
      </svg><div class="dt-reveal"></div>`;
      const svg = $('svg', stage), line = $('.dt-line', svg), dotsEls = $$('.dt-dot', svg);
      const mark = () => dotsEls.forEach((d, i) => { d.classList.toggle('done', i < next); d.classList.toggle('next', i === next); });
      mark();
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say(round === 0 ? ['חברי את הנקודות לפי המספרים!', 'מתחילים באחת'] : 'מתחילים באחת');

      dotsEls.forEach((d, i) => d.addEventListener('pointerdown', e => {
        e.preventDefault(); Sound.init();
        if (busy) return;
        if (i !== next) {
          if (i < next) return;
          Sound.boing(); d.classList.remove('wrong'); void d.getBBox(); d.classList.add('wrong');
          if (++wrong % 2 === 1) Voice.say(['חפשי את המספר', NUMS[next]]);
          return;
        }
        next++;
        line.setAttribute('points', pic.pts.slice(0, next).map(p => p.join(',')).join(' '));
        Sound.ding(next); Voice.say(NUMS[next - 1]); mark();
        FX.burst(e.clientX, e.clientY, ['✨'], 5, 22);
        if (next === pic.pts.length) {
          busy = true;
          line.setAttribute('points', pic.pts.concat([pic.pts[0]]).map(p => p.join(',')).join(' '));
          s.later(() => { Voice.say('מה יצא לנו?'); }, 900);
          s.later(() => {
            svg.classList.add('filled'); Sound.tada();
            const rv = $('.dt-reveal', stage); rv.textContent = pic.e; rv.classList.add('on');
            const c = center(stage); FX.confetti(c.x, c.y, 50); Voice.say([`זה ${pic.n}!`, pick(['יצא ציור יפה!', ...PRAISE.slice(0, 4)])]);
            Stars.add(c.x, c.y, 1);
          }, 2200);
          s.later(() => {
            round++;
            if (round < 5) start();
            else celebrate({ emoji: '🖍️', title: 'איזה ציורים יפים!', stars: 3, again: () => { order = shuffle(order); round = 0; start(); } });
          }, 5600);
        }
      }));
    }
    start();
  }
});
