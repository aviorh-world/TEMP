'use strict';
/* 🦷 מצחצחים שיניים – משחה, צחצוח עם האצבע עד שהלכלוך נעלם, שטיפה וחיוך מבריק */
registerGame({
  id: 'teeth', name: 'מצחצחים שיניים', emoji: '🦷', color: '#4ea8de', say: 'בואי נצחצח שיניים!',
  lines: ['בואי נצחצח שיניים!', 'קודם שימי משחה על המברשת', 'עכשיו מצחצחים! קדימה ואחורה', 'עוד קצת, יש עוד לכלוך', 'עכשיו שוטפים את הפה', 'איזה שיניים מבריקות!',
    'מצחצחים פעמיים ביום, בבוקר ובערב', 'החבר הבא!', 'את מצחצחת אלופה!'],
  mount(root, s) {
    const FRIENDS = ['🐊', '🦁', '🐴'];
    let n = 0, step = 'paste', dirt = [], foam = 0;
    root.innerHTML = `<div class="th"><div class="th-who"></div>
      <div class="th-mouth"><svg viewBox="0 0 400 260"></svg></div>
      <div class="th-tools"><button class="tb th-paste" style="--c:#4ea8de">🧴</button><div class="th-brush">🪥</div><button class="tb th-cup" style="--c:#4ea8de">🥛</button></div></div>`;
    const svg = $('svg', root), mouth = $('.th-mouth', root), who = $('.th-who', root), brush = $('.th-brush', root);
    const TEETH = [];
    for (let i = 0; i < 6; i++) TEETH.push({ x: 62 + i * 46, y: 52, w: 40, h: 62 });       // למעלה
    for (let i = 0; i < 6; i++) TEETH.push({ x: 62 + i * 46, y: 150, w: 40, h: 58 });      // למטה

    function draw() {
      svg.innerHTML = `<path d="M20,40 Q200,-10 380,40 Q400,140 380,220 Q200,280 20,220 Q0,140 20,40Z" fill="#c2185b"/>
        <path d="M60,130 Q200,170 340,130 Q300,215 200,222 Q100,215 60,130Z" fill="#ff6f91"/>
        ${TEETH.map(t => `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="12" fill="#fffdf6" stroke="#e7dfcf" stroke-width="3"/>`).join('')}
        ${dirt.map(d => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${d.c}" opacity="${d.v.toFixed(2)}"/>`).join('')}
        ${Array.from({ length: Math.round(foam) }, (_, i) => `<circle cx="${70 + (i * 53) % 270}" cy="${70 + (i * 37) % 130}" r="${10 + i % 3 * 4}" fill="#fff" opacity=".85"/>`).join('')}
        ${step === 'shine' ? TEETH.map((t, i) => i % 3 === 0 ? `<text x="${t.x + 28}" y="${t.y + 18}" font-size="26">✨</text>` : '').join('') : ''}`;
    }
    function friend() {
      step = 'paste'; foam = 0; brush.classList.remove('pasted');
      dirt = TEETH.flatMap(t => Array.from({ length: randi(1, 2) }, () => ({ x: t.x + rand(10, t.w - 10), y: t.y + rand(12, t.h - 12), r: rand(7, 11), c: pick(['#c9a227', '#a1887f', '#8bc34a']), v: 1 })));
      who.textContent = FRIENDS[n % FRIENDS.length]; who.classList.remove('bounce'); void who.offsetWidth; who.classList.add('bounce');
      draw(); hint();
      Voice.say(n === 0 ? ['בואי נצחצח שיניים!', 'קודם שימי משחה על המברשת'] : 'קודם שימי משחה על המברשת');
    }
    const hint = () => { $('.th-paste', root).classList.toggle('next', step === 'paste'); $('.th-cup', root).classList.toggle('next', step === 'rinse'); brush.classList.toggle('next', step === 'brush'); };

    $('.th-paste', root).onclick = () => {
      Sound.init(); if (step !== 'paste') return;
      Sound.pop(); brush.classList.add('pasted'); step = 'brush'; hint(); Voice.say('עכשיו מצחצחים! קדימה ואחורה');
    };
    // צחצוח: מזיזים את האצבע (או את המברשת) על השיניים, והלכלוך שמתחת נעלם
    let brushing = false, lastSaid = 0, moves = 0;
    const toSvg = e => { const m = svg.getScreenCTM().inverse(), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(m); return [q.x, q.y]; };
    function scrub(e) {
      if (step !== 'brush') return;
      const [x, y] = toSvg(e);
      brush.style.left = e.clientX - mouth.getBoundingClientRect().left + 'px'; brush.style.top = e.clientY - mouth.getBoundingClientRect().top + 'px';
      let any = false;
      dirt.forEach(d => { if (d.v > 0 && Math.hypot(d.x - x, d.y - y) < 36) { d.v = Math.max(0, d.v - .12); any = true; } });
      if (any) { foam = Math.min(14, foam + .25); if (++moves % 6 === 0) Sound.noise(.08, { freq: 3000, vol: .12 }); }
      draw();
      if (dirt.every(d => d.v <= 0)) { step = 'rinse'; brushing = false; mouth.classList.remove('brushing'); hint(); Sound.chime(); Voice.say([pick(PRAISE), 'עכשיו שוטפים את הפה']); }
      else if (Date.now() - lastSaid > 9000 && dirt.filter(d => d.v > 0).length < dirt.length * .4) { lastSaid = Date.now(); Voice.say('עוד קצת, יש עוד לכלוך'); }
    }
    mouth.addEventListener('pointerdown', e => { Sound.init(); if (step !== 'brush') return; brushing = true; mouth.classList.add('brushing'); try { mouth.setPointerCapture(e.pointerId); } catch (_) {} scrub(e); });
    mouth.addEventListener('pointermove', e => { if (brushing) scrub(e); });
    ['pointerup', 'pointercancel'].forEach(ev => mouth.addEventListener(ev, () => { brushing = false; mouth.classList.remove('brushing'); }));

    $('.th-cup', root).onclick = () => {
      Sound.init(); if (step !== 'rinse') return;
      step = 'shine'; hint(); Sound.whoosh(); FX.rain(['💧'], 24, 1.2);
      const fade = () => { foam = Math.max(0, foam - 1); draw(); if (foam > 0) s.later(fade, 60); };
      fade();
      s.later(() => {
        draw(); Sound.tada(); const c = center(mouth); FX.burst(c.x, c.y, ['✨', '⭐', '😁'], 12, 38);
        Voice.say(n === 0 ? ['איזה שיניים מבריקות!', 'מצחצחים פעמיים ביום, בבוקר ובערב'] : 'איזה שיניים מבריקות!'); Stars.add(c.x, c.y, 1); n++;
      }, 900);
      s.later(() => {
        if (n % 3 === 0) celebrate({ emoji: '🦷', title: 'את מצחצחת אלופה!', stars: 3, again: friend });
        else { Voice.say('החבר הבא!'); s.later(friend, 900); }
      }, 4600);
    };
    friend();
  }
});
