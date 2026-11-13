'use strict';
/* 🖍️ דפי צביעה – בוחרים צבע ונוגעים באזור בציור כדי לצבוע אותו */
const PALETTE = [
  ['אדום', '#ff4d4d'], ['כתום', '#ff9f1c'], ['צהוב', '#ffd60a'], ['ירוק בהיר', '#9be15d'], ['ירוק', '#2ec27e'], ['תכלת', '#7fd8ff'],
  ['כחול', '#3a86ff'], ['סגול', '#9b5de5'], ['ורוד', '#ff70a6'], ['חום', '#a0612f'], ['בז׳', '#ffd6b8'], ['שחור', '#3b2f4a']
];
const COLORING = (() => {
  const cloud = (x, y, s = 1) => `<path class="r" transform="translate(${x} ${y}) scale(${s})" d="M0,0 a25,25 0 0,1 40,-22 a32,32 0 0,1 58,8 a24,24 0 0,1 8,44 h-100 a22,22 0 0,1 -6,-30 z"/>`;
  const heart = (x, y, s = 1) => `<path class="r" transform="translate(${x} ${y}) scale(${s})" d="M0,12 C-14,2 -18,-4 -18,-10 C-18,-16 -13,-20 -8,-20 C-4,-20 -1,-17 0,-14 C1,-17 4,-20 8,-20 C13,-20 18,-16 18,-10 C18,-4 14,2 0,12Z"/>`;
  const sun = (x, y, r) => `<g class="ln">${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${x + Math.cos(a) * (r + 8)},${y + Math.sin(a) * (r + 8)} L${x + Math.cos(a) * (r + 22)},${y + Math.sin(a) * (r + 22)}"/>`; }).join('')}</g><circle class="r" cx="${x}" cy="${y}" r="${r}"/>`;
  const eye = (x, y, r = 4) => `<circle class="fix" cx="${x}" cy="${y}" r="${r}"/>`;
  const petals = (cx, cy, d, rx, ry, n) => Array.from({ length: n }, (_, i) => { const a = i * 360 / n, t = a * Math.PI / 180; return `<ellipse class="r" cx="${(cx + Math.sin(t) * d).toFixed(1)}" cy="${(cy - Math.cos(t) * d).toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${(cx + Math.sin(t) * d).toFixed(1)} ${(cy - Math.cos(t) * d).toFixed(1)})"/>`; }).join('');
  const band = (cx, cy, r1, r2) => `<path class="r" d="M${cx - r2},${cy} A${r2},${r2} 0 0 1 ${cx + r2},${cy} L${cx + r1},${cy} A${r1},${r1} 0 0 0 ${cx - r1},${cy} Z"/>`;

  const PAGES = [
    { id: 'butterfly', name: 'פרפר', emo: '🦋', svg: `
      <path class="ln" d="M200,140 Q185,95 160,72 M200,140 Q215,95 240,72"/>
      <circle class="r" cx="160" cy="70" r="11"/><circle class="r" cx="240" cy="70" r="11"/>
      <path class="r" d="M195,170 C150,90 50,70 45,140 C40,200 120,215 195,200 Z"/>
      <path class="r" d="M205,170 C250,90 350,70 355,140 C360,200 280,215 205,200 Z"/>
      <path class="r" d="M195,212 C140,215 80,250 100,310 C120,350 180,300 197,240 Z"/>
      <path class="r" d="M205,212 C260,215 320,250 300,310 C280,350 220,300 203,240 Z"/>
      <circle class="r" cx="110" cy="140" r="24"/><circle class="r" cx="290" cy="140" r="24"/>
      <circle class="r" cx="160" cy="178" r="12"/><circle class="r" cx="240" cy="178" r="12"/>
      <circle class="r" cx="140" cy="275" r="17"/><circle class="r" cx="260" cy="275" r="17"/>
      <ellipse class="r" cx="200" cy="225" rx="16" ry="68"/>
      <circle class="r" cx="200" cy="145" r="24"/>${eye(192, 141)}${eye(208, 141)}<path class="ln" d="M193,153 Q200,159 207,153"/>
      ${heart(60, 340, 1.2)}${heart(340, 345, 1)}` },
    { id: 'house', name: 'בית', emo: '🏠', svg: `
      ${sun(335, 70, 32)}${cloud(50, 95, 1)}
      <path class="r" d="M0,335 Q200,305 400,335 V400 H0Z"/>
      <rect class="r" x="245" y="105" width="32" height="60"/>
      <rect class="r" x="110" y="190" width="180" height="150"/>
      <path class="r" d="M88,197 L200,100 L312,197 Z"/>
      <circle class="r" cx="200" cy="155" r="18"/>
      <rect class="r" x="178" y="262" width="46" height="78" rx="8"/>${eye(214, 302, 4)}
      <rect class="r" x="128" y="215" width="42" height="42" rx="4"/><rect class="r" x="232" y="215" width="42" height="42" rx="4"/>
      <path class="ln" d="M149,215 V257 M128,236 H170 M253,215 V257 M232,236 H274"/>
      <rect class="r" x="333" y="255" width="22" height="88"/><circle class="r" cx="344" cy="228" r="44"/>
      <circle class="r" cx="40" cy="355" r="10"/><circle class="r" cx="70" cy="365" r="10"/><circle class="r" cx="380" cy="372" r="10"/>` },
    { id: 'fish', name: 'דג', emo: '🐠', svg: `
      <circle class="r" cx="335" cy="85" r="15"/><circle class="r" cx="358" cy="50" r="10"/><circle class="r" cx="320" cy="40" r="7"/>
      <path class="r" d="M0,355 Q100,330 200,350 T400,345 V400 H0Z"/>
      <path class="r" d="M40,395 C20,350 60,330 40,290 C70,320 55,360 72,395Z"/><path class="r" d="M345,395 C325,355 365,335 350,300 C380,330 365,365 378,395Z"/>
      <path class="r" d="M150,140 C170,92 232,95 242,142 Z"/><path class="r" d="M170,258 C180,300 222,300 232,256 Z"/>
      <path class="r" d="M285,200 L362,138 L350,200 L362,262 Z"/>
      <path class="r" d="M68,200 C110,110 250,110 296,200 C250,290 110,290 68,200 Z"/>
      <path class="r" d="M168,129 C188,170 188,230 168,271 L194,276 C214,230 214,170 194,124 Z"/>
      <path class="r" d="M228,136 C244,172 244,228 228,264 L250,252 C262,222 262,178 250,148 Z"/>
      <circle class="r" cx="118" cy="185" r="17"/>${eye(121, 185, 7)}<path class="ln" d="M80,210 Q92,220 104,212"/>` },
    { id: 'flower', name: 'פרח', emo: '🌸', svg: `
      ${sun(345, 60, 28)}
      <path class="r" d="M193,300 L193,180 L207,180 L207,300Z"/>
      <path class="r" d="M200,268 C160,258 138,226 150,212 C176,218 196,240 200,268Z"/><path class="r" d="M200,240 C240,230 262,200 250,188 C224,194 204,214 200,240Z"/>
      ${petals(200, 130, 52, 30, 46, 6)}
      <circle class="r" cx="200" cy="130" r="34"/>${eye(190, 124)}${eye(210, 124)}<path class="ln" d="M190,140 Q200,148 210,140"/>
      <path class="r" d="M140,306 L260,306 L245,392 L155,392 Z"/><rect class="r" x="128" y="288" width="144" height="26" rx="8"/>
      ${heart(70, 300, 1.3)}` },
    { id: 'icecream', name: 'גלידה', emo: '🍦', svg: `
      <path class="r" d="M140,225 L260,225 L200,388 Z"/>
      <path class="ln" d="M155,255 L237,255 M166,285 L226,285 M177,315 L216,315 M188,345 L206,345"/>
      <circle class="r" cx="158" cy="205" r="48"/><circle class="r" cx="242" cy="205" r="48"/>
      <circle class="r" cx="200" cy="142" r="54"/>${eye(185, 140)}${eye(215, 140)}<path class="ln" d="M188,156 Q200,165 212,156"/>
      <rect class="r" x="168" y="105" width="18" height="7" rx="3" transform="rotate(-30 177 108)"/><rect class="r" x="220" y="110" width="18" height="7" rx="3" transform="rotate(25 229 113)"/>
      <rect class="r" x="140" y="200" width="18" height="7" rx="3" transform="rotate(40 149 203)"/><rect class="r" x="250" y="195" width="18" height="7" rx="3" transform="rotate(-20 259 198)"/>
      <path class="ln" d="M200,88 Q206,62 226,52"/><circle class="r" cx="200" cy="80" r="17"/>
      ${heart(60, 80, 1.4)}${heart(345, 300, 1.2)}${heart(60, 320, 1)}` },
    { id: 'car', name: 'מכונית', emo: '🚗', svg: `
      ${sun(60, 70, 30)}${cloud(250, 80, .9)}
      <rect class="r" x="0" y="318" width="400" height="82"/><path class="ln" d="M20,360 H70 M120,360 H170 M220,360 H270 M320,360 H370"/>
      <path class="r" d="M40,272 Q40,222 90,217 L130,217 L165,160 L275,160 L315,217 L352,222 Q372,227 372,272 Z"/>
      <path class="r" d="M142,214 L174,174 L214,174 L214,214Z"/><path class="r" d="M226,174 L266,174 L298,214 L226,214Z"/>
      <path class="ln" d="M220,220 V268 M232,238 H246"/>
      <circle class="r" cx="355" cy="242" r="11"/>
      <circle class="r" cx="110" cy="276" r="38"/><circle class="r" cx="300" cy="276" r="38"/>
      <circle class="r" cx="110" cy="276" r="14"/><circle class="r" cx="300" cy="276" r="14"/>` },
    { id: 'cat', name: 'חתול', emo: '🐱', svg: `
      <path class="r" d="M290,332 C362,322 372,250 332,230 C320,226 314,240 322,247 C346,266 340,305 290,312 Z"/>
      <ellipse class="r" cx="220" cy="300" rx="92" ry="70"/>
      <ellipse class="r" cx="180" cy="362" rx="24" ry="15"/><ellipse class="r" cx="252" cy="364" rx="24" ry="15"/>
      <path class="r" d="M108,135 L102,62 L156,104Z"/><path class="r" d="M232,135 L238,62 L184,104Z"/>
      <circle class="r" cx="170" cy="170" r="76"/>
      <path class="r" d="M114,118 L112,84 L138,104Z"/><path class="r" d="M226,118 L228,84 L202,104Z"/>
      <ellipse class="r" cx="143" cy="162" rx="14" ry="18"/><ellipse class="r" cx="197" cy="162" rx="14" ry="18"/>${eye(145, 165, 6)}${eye(199, 165, 6)}
      <path class="r" d="M160,190 L180,190 L170,202Z"/>
      <path class="ln" d="M170,202 Q160,215 150,208 M170,202 Q180,215 190,208 M140,196 L95,188 M140,204 L96,210 M200,196 L245,188 M200,204 L244,210"/>
      <circle class="r" cx="70" cy="335" r="40"/><path class="ln" d="M40,315 Q70,340 100,320 M35,340 Q70,365 105,345 M55,298 Q80,330 75,372"/>` },
    { id: 'rainbow', name: 'קשת', emo: '🌈', svg: `
      ${sun(345, 60, 28)}
      ${band(200, 300, 155, 178)}${band(200, 300, 132, 155)}${band(200, 300, 109, 132)}${band(200, 300, 86, 109)}${band(200, 300, 63, 86)}${band(200, 300, 40, 63)}
      ${cloud(10, 300, 1.15)}${cloud(268, 300, 1.15)}
      ${heart(200, 360, 1.6)}${heart(60, 80, 1.2)}${heart(130, 40, .9)}
      <path class="r" d="M0,400 V370 Q100,350 200,385 T400,370 V400Z"/>` }
  ];
  return { PAGES };
})();

registerGame({
  id: 'coloring', name: 'דפי צביעה', emoji: '🖍️', color: '#ff9f1c', say: 'דפי צביעה! בחרי ציור',
  lines: () => [...PALETTE.map(p => p[0]), 'בחרי צבע ונגעי בציור', 'איזה ציור צבעוני!', 'קסם!', 'איזה יופי!', 'בחרי ציור'],
  mount(root, s) {
    const { PAGES } = COLORING;
    const saved = Store.get('coloring', {});
    const svgOf = (pg, fills, cls = '') => {
      let i = 0;
      const body = pg.svg.replace(/class="r"/g, () => { const f = fills[i++] || '#ffffff'; return `class="r" data-i="${i - 1}" fill="${f}"`; });
      return `<svg class="cp ${cls}" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    };

    function chooser() {
      root.innerHTML = `<div class="picker lt-words"><h3>🖍️ מה נצבע?</h3><div class="lt-wgrid cp-grid">
        ${PAGES.map((p, i) => `<button class="lt-wc" data-i="${i}" style="--i:${i}">${svgOf(p, saved[p.id] || [], 'thumb')}<span class="ww">${p.name}</span></button>`).join('')}</div></div>`;
      $$('.lt-wc', root).forEach(b => b.onclick = () => { Sound.pop(); page(PAGES[+b.dataset.i]); });
      Voice.say('בחרי ציור');
    }

    function page(pg) {
      const fills = saved[pg.id] || [];
      root.innerHTML = `<div class="cpg"><div class="cp-stage">${svgOf(pg, fills)}</div>
        <div class="cp-bar"><div class="cp-pal">${PALETTE.map(([n, c], i) => `<button class="sw" data-i="${i}" style="--c:${c}" aria-label="${n}"></button>`).join('')}</div>
        <div class="cp-tools"><button class="tool erase" aria-label="מחק">🧽</button><button class="tool magic" aria-label="קסם">🪄</button><button class="tool save" aria-label="שמור">💾</button><button class="tool back" aria-label="ציורים">🖼️</button></div></div></div>`;
      const svg = $('svg.cp', root), regs = $$('.r', svg);
      let color = PALETTE[0][1], erasing = false, won = regs.every(r => r.getAttribute('fill') !== '#ffffff');
      const sws = $$('.sw', root);
      const pickSw = i => { sws.forEach((b, j) => b.classList.toggle('on', j === i)); $('.erase', root).classList.remove('on'); erasing = false; color = PALETTE[i][1]; };
      pickSw(0);
      sws.forEach((b, i) => b.onclick = () => { Sound.tap(); pickSw(i); Voice.say(PALETTE[i][0]); });
      $('.erase', root).onclick = e => { Sound.tap(); erasing = true; sws.forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); };

      const store = () => { saved[pg.id] = regs.map(r => r.getAttribute('fill')); Store.set('coloring', saved); };
      function paint(r, c) {
        r.setAttribute('fill', c); r.classList.remove('popf'); void r.getBBox(); r.classList.add('popf');
      }
      function checkDone() {
        if (won || !regs.every(r => r.getAttribute('fill') !== '#ffffff')) return;
        won = true;
        s.later(() => {
          const c = center(svg); FX.confetti(c.x, c.y, 60); Sound.tada();
          s.later(() => celebrate({ emoji: pg.emo, title: 'איזה ציור צבעוני!', stars: 2, again: chooser }), 900);
        }, 400);
      }
      svg.addEventListener('pointerdown', e => {
        const r = e.target.closest('.r'); if (!r) return;
        Sound.init();
        const c = erasing ? '#ffffff' : color;
        if (r.getAttribute('fill') === c) return;
        paint(r, c); store();
        Sound.tone(erasing ? 300 : 500 + Math.random() * 400, .12, { type: 'triangle', vol: .12 });
        if (!erasing) FX.burst(e.clientX, e.clientY, ['✨'], 4, 20);
        checkDone();
      });
      $('.magic', root).onclick = () => {
        Sound.sparkle(); Voice.say('קסם!');
        regs.filter(r => r.getAttribute('fill') === '#ffffff').forEach((r, i) => s.later(() => paint(r, pick(PALETTE.slice(0, 11))[1]), i * 70));
        s.later(() => { store(); checkDone(); }, regs.length * 70 + 100);
      };
      $('.back', root).onclick = () => { Sound.tap(); chooser(); };
      $('.save', root).onclick = () => { Sound.coin(); saveSVG(svg, pg.name); Voice.say('איזה יופי!'); };
      Voice.say('בחרי צבע ונגעי בציור');
    }
    chooser();
  }
});

/* שמירת ציור SVG כקובץ תמונה */
function saveSVG(svg, name) {
  try {
    const clone = svg.cloneNode(true); clone.setAttribute('width', 1000); clone.setAttribute('height', 1000);
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    st.textContent = '.r,.ln{stroke:#3b2f4a;stroke-width:5;stroke-linejoin:round;stroke-linecap:round}.ln{fill:none}.fix{fill:#3b2f4a}';
    clone.insertBefore(st, clone.firstChild);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 1000; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, 1000, 1000); x.drawImage(img, 0, 0); URL.revokeObjectURL(url);
      downloadCanvas(c, name);
    };
    img.src = url;
  } catch (e) {}
}
function downloadCanvas(c, name) {
  try { const a = document.createElement('a'); a.download = `${name}.png`; a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
}
