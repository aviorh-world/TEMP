'use strict';
/* 🔢 חברי את הנקודות – 1 עד 10, הקריינית סופרת, ובסוף מתגלה ציור */
const DOTS = (() => {
  const NUMS = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
  // נקודות בציור 400x400 (מסודרות לפי הסדר), צבע מילוי ושם
  const star = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 82 : 172; return [Math.round(200 + r * Math.cos(a)), Math.round(212 + r * Math.sin(a))]; });
  // כל הציורים מתוכננים עם מרחק של 55 לפחות בין נקודות, כדי שהמספרים לא יעלו זה על זה במסך קטן
  const PICS = [
    { n: 'כוכב', e: '⭐', c: '#ffd60a', pts: star },
    { n: 'בית', e: '🏠', c: '#ff8c69', pts: [[70, 360], [70, 190], [200, 60], [330, 190], [330, 360], [250, 360], [250, 270], [150, 270], [150, 360]] },
    { n: 'לב', e: '❤️', c: '#ff4d6d', pts: [[200, 360], [80, 250], [45, 160], [80, 85], [150, 75], [200, 130], [250, 75], [320, 85], [355, 160], [320, 250]] },
    { n: 'דג', e: '🐟', c: '#4cc9f0', pts: [[45, 200], [120, 110], [220, 92], [295, 160], [370, 100], [350, 200], [370, 300], [295, 240], [220, 308], [120, 290]] },
    { n: 'סירה', e: '⛵', c: '#3a86ff', pts: [[50, 260], [200, 260], [200, 50], [300, 225], [355, 260], [290, 350], [110, 350]] },
    { n: 'עץ', e: '🌲', c: '#2ec27e', pts: [[165, 370], [165, 310], [55, 310], [150, 215], [75, 215], [200, 55], [325, 215], [250, 215], [345, 310], [235, 310]] },
    { n: 'גלידה', e: '🍦', c: '#ff9ec4', pts: [[200, 385], [125, 205], [80, 150], [120, 78], [200, 48], [280, 78], [320, 150], [275, 205]] },
    { n: 'יהלום', e: '💎', c: '#8ecdf7', pts: [[200, 375], [40, 160], [105, 75], [200, 75], [295, 75], [360, 160]], deco: 'M40,160 H360 M105,75 L145,160 L200,75 L255,160 L295,75 M145,160 L200,375 L255,160' }
  ];
  const lines = () => [...NUMS, 'חברי את הנקודות לפי המספרים!', 'מתחילים באחת', 'חפשי את המספר', 'מה יצא לנו?', 'אפשר ללחוץ או להחליק עם האצבע',
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
      // המספר יוצא החוצה ממרכז הציור, כך שהוא לא נופל על הקו או על נקודה שכנה
      const cx = pic.pts.reduce((t, p) => t + p[0], 0) / pic.pts.length, cy = pic.pts.reduce((t, p) => t + p[1], 0) / pic.pts.length;
      const lab = ([x, y]) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; return [dx / d * 34, dy / d * 34 + 10]; };
      stage.innerHTML = `<svg class="dt-svg" viewBox="-30 -30 460 460">
        <polygon class="dt-fill" points="${pic.pts.map(p => p.join(',')).join(' ')}" fill="${pic.c}"/>
        ${pic.deco ? `<path class="dt-deco" d="${pic.deco}"/>` : ''}<polyline class="dt-line" points="" /><line class="dt-rubber" x1="0" y1="0" x2="0" y2="0" />
        ${pic.pts.map((pt, i) => { const [lx, ly] = lab(pt); return `<g class="dt-dot" data-i="${i}" transform="translate(${pt[0]} ${pt[1]})"><circle r="13" class="d"/><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}">${i + 1}</text></g>`; }).join('')}
      </svg><div class="dt-reveal"></div>`;
      const svg = $('svg', stage), line = $('.dt-line', svg), rubber = $('.dt-rubber', svg), dotsEls = $$('.dt-dot', svg);
      const mark = () => dotsEls.forEach((d, i) => { d.classList.toggle('done', i < next); d.classList.toggle('next', i === next); });
      mark();
      $$('.sh-dots i', root).forEach((d, i) => d.classList.toggle('on', i < round));
      Voice.say(round === 0 ? ['חברי את הנקודות לפי המספרים!', 'מתחילים באחת', 'אפשר ללחוץ או להחליק עם האצבע'] : 'מתחילים באחת');

      // נגיעה בנקודה, או החלקה מנקודה לנקודה – הקו נמשך אחרי האצבע ו"נתפס" בכל נקודה נכונה
      const toSvg = e => { const m = svg.getScreenCTM().inverse(), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(m); return [q.x, q.y]; };
      const nearest = ([x, y], r) => { let best = -1, bd = r; pic.pts.forEach(([px, py], i) => { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } }); return best; };
      let dragId = null;
      function connect(e) {
        next++;
        line.setAttribute('points', pic.pts.slice(0, next).map(p => p.join(',')).join(' '));
        Sound.ding(next); Voice.say(NUMS[next - 1]); mark();
        FX.burst(e.clientX, e.clientY, ['✨'], 5, 22);
        if (next === pic.pts.length) finish();
      }
      function wrongTap(i) {
        const d = dotsEls[i]; Sound.boing(); d.classList.remove('wrong'); void d.getBBox(); d.classList.add('wrong');
        if (++wrong % 2 === 1) Voice.say(['חפשי את המספר', NUMS[next]]);
      }
      function rubberTo(q) {
        if (!next || busy || !q) { rubber.style.display = 'none'; return; }
        const [x1, y1] = pic.pts[next - 1]; rubber.style.display = '';
        rubber.setAttribute('x1', x1); rubber.setAttribute('y1', y1); rubber.setAttribute('x2', q[0]); rubber.setAttribute('y2', q[1]);
      }
      rubberTo(null);
      svg.addEventListener('pointerdown', e => {
        e.preventDefault(); Sound.init(); if (busy) return;
        dragId = e.pointerId; try { svg.setPointerCapture(dragId); } catch (_) {}
        const q = toSvg(e), i = nearest(q, 42);
        if (i === next) connect(e); else if (i > next) wrongTap(i);
        rubberTo(q);
      });
      svg.addEventListener('pointermove', e => {
        if (e.pointerId !== dragId || busy) return;
        const q = toSvg(e);
        if (next < pic.pts.length && Math.hypot(pic.pts[next][0] - q[0], pic.pts[next][1] - q[1]) < 36) connect(e);
        rubberTo(busy ? null : q);
      });
      ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, e => { if (e.pointerId === dragId) { dragId = null; rubberTo(null); } }));

      function finish() {
        busy = true; rubberTo(null);
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
    }
    start();
  }
});
