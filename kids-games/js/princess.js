'use strict';
/* 👸 הנסיכה שלי – הלבשה: שמלות, שיער, כתרים, אביזרים ורקעים */
const PR = (() => {
  let uid = 0;
  const HAIR_COLORS = [['#f6ecd0', '#cdb98a'], ['#ffd166', '#d9a53a'], ['#8d5a3b', '#5e3a24'], ['#e0603a', '#a8401f'], ['#2f2a3a', '#120f18'], ['#ff9ecf', '#e06aa8'], ['#b9a3ff', '#7d62d6']];
  const SKINS = ['#ffe3d3', '#f6c9a8', '#d9a07a', '#a86b45'];
  const EYES = ['#3a8dde', '#2ec27e', '#7a4a2a', '#8f5bff'];
  const DRESSES = [
    { n: 'שמלת קרח', shape: 'aline', c1: '#e3f7ff', c2: '#5cbcf0', pat: 'snow', cape: true, sleeve: 'sheer', belt: '#bfe9ff', shoe: '#bfe9ff' },
    { n: 'ורודה', shape: 'ball', c1: '#ffd6e9', c2: '#ff74b0', pat: 'hearts', sleeve: 'puff', belt: '#ff4d8d', shoe: '#ff4d8d' },
    { n: 'סגולה', shape: 'ball', c1: '#e8dbff', c2: '#9466ff', pat: 'stars', sleeve: 'puff', belt: '#ffd23f', shoe: '#9466ff' },
    { n: 'זהב', shape: 'ball', c1: '#fff6c2', c2: '#ffbf1f', pat: 'dots', sleeve: 'puff', belt: '#ff8c1a', shoe: '#ffbf1f' },
    { n: 'מנטה', shape: 'aline', c1: '#dcfff2', c2: '#3fcf9b', pat: 'flowers', sleeve: 'none', belt: '#ff9ecf', shoe: '#3fcf9b' },
    { n: 'קשת', shape: 'ball', rainbow: true, c1: '#fff', c2: '#c77dff', pat: 'stars', sleeve: 'puff', belt: '#fff', shoe: '#c77dff' },
    { n: 'אדומה', shape: 'aline', c1: '#ffd6d6', c2: '#ff4d6d', pat: 'dots', sleeve: 'puff', belt: '#ffd23f', shoe: '#ff4d6d' },
    { n: 'לילה', shape: 'ball', c1: '#b8c4ff', c2: '#3b3fb8', pat: 'stars', sleeve: 'none', belt: '#ffd23f', shoe: '#3b3fb8' }
  ];
  const HAIRS = ['braid', 'long', 'bun', 'curls', 'pigtails', 'bob'];
  const CROWNS = 7, ACCS = ['', 'wand', 'flake', 'bouquet', 'balloon', '🐰', '🦄', '🐱'];
  const BGS = [{ c: 'bg-ice', e: '🏰', d: ['❄️', '❄️', '⛄', '❄️', '🏔️', '✨'] }, { c: 'bg-garden', e: '🌷', d: ['🌸', '🌷', '🦋', '🌼', '🌸', '🐦'] },
    { c: 'bg-ball', e: '🎶', d: ['✨', '⭐', '🎶', '✨', '💫', '🕯️'] }, { c: 'bg-sea', e: '🏖️', d: ['🐚', '🌊', '⭐', '🐬', '🐚', '☀️'] }];

  const motif = {
    snow: '<g stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"><path d="M18,9V27M10,13.5L26,22.5M10,22.5L26,13.5"/></g>',
    stars: '<path d="M18,8 L20.4,15 L28,15 L22,19.6 L24.2,27 L18,22.6 L11.8,27 L14,19.6 L8,15 L15.6,15Z" fill="#fff" opacity=".75"/>',
    hearts: '<path d="M18,25 C12,21 9.5,18 9.5,15 C9.5,12.4 11.5,10.6 13.8,10.6 C15.6,10.6 17,11.6 18,13.2 C19,11.6 20.4,10.6 22.2,10.6 C24.5,10.6 26.5,12.4 26.5,15 C26.5,18 24,21 18,25Z" fill="#fff" opacity=".7"/>',
    dots: '<circle cx="9" cy="9" r="3" fill="#fff" opacity=".7"/><circle cx="27" cy="27" r="3" fill="#fff" opacity=".7"/>',
    flowers: '<g fill="#fff" opacity=".85"><circle cx="18" cy="13" r="3.4"/><circle cx="22.8" cy="16.5" r="3.4"/><circle cx="21" cy="22" r="3.4"/><circle cx="15" cy="22" r="3.4"/><circle cx="13.2" cy="16.5" r="3.4"/></g><circle cx="18" cy="18" r="2.6" fill="#ffd23f"/>'
  };
  const SKIRT = {
    ball: 'M116,252 C70,300 34,410 30,470 Q90,494 150,490 Q210,494 270,470 C266,410 230,300 184,252 Z',
    aline: 'M118,252 C100,330 80,420 66,474 Q150,496 234,474 C220,420 200,330 182,252 Z'
  };
  const HEM = { ball: 'M34,469 Q150,505 266,469', aline: 'M70,473 Q150,500 230,473' };
  const FOLDS = { ball: 'M150,262 L150,488 M128,262 Q100,380 92,482 M172,262 Q200,380 208,482', aline: 'M150,262 L150,492 M134,262 Q118,380 108,486 M166,262 Q182,380 192,486' };

  function flake(x, y, r, col = '#fff', w = 2.5) {
    let p = ''; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; p += `M${x - r * Math.cos(a)},${y - r * Math.sin(a)}L${x + r * Math.cos(a)},${y + r * Math.sin(a)}`; }
    return `<path d="${p}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r * .22}" fill="${col}"/>`;
  }
  function flower(x, y, r, c) {
    let s = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566; s += `<circle cx="${x + Math.cos(a) * r}" cy="${y + Math.sin(a) * r}" r="${r * .75}" fill="${c}"/>`; }
    return s + `<circle cx="${x}" cy="${y}" r="${r * .6}" fill="#ffd23f"/>`;
  }

  function svg(st, vb = '0 0 300 520', cls = 'princess') {
    const u = 'pr' + (++uid);
    const D = DRESSES[st.dress], [hc, hd] = HAIR_COLORS[st.hairColor], sk = SKINS[st.skin], ey = EYES[st.eyes], hs = HAIRS[st.hair];
    const fill = `url(#${u}g)`;
    const grad = D.rainbow
      ? `<linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ecf"/><stop offset=".25" stop-color="#ffd166"/><stop offset=".5" stop-color="#8ef0a5"/><stop offset=".75" stop-color="#7cc8ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient>`
      : `<linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${D.c1}"/><stop offset="1" stop-color="${D.c2}"/></linearGradient>`;
    const defs = `<defs>${grad}<pattern id="${u}p" width="36" height="36" patternUnits="userSpaceOnUse">${motif[D.pat] || ''}</pattern>
      <radialGradient id="${u}gl"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bfe9ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}au" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#ffbf1f"/></linearGradient></defs>`;

    // שיער מאחור
    let back = '';
    const cap = `<path d="M94,114 Q92,40 150,38 Q208,40 206,114 Z" fill="${hc}"/>`;
    if (hs === 'long') back = `<path d="M92,105 Q88,36 150,36 Q212,36 208,105 L228,300 Q190,320 150,312 Q110,320 72,300 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/>`;
    else if (hs === 'braid') back = cap;
    else if (hs === 'bun') back = cap + `<circle cx="150" cy="36" r="30" fill="${hc}" stroke="${hd}" stroke-width="2"/><path d="M132,28 Q150,14 168,28" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    else if (hs === 'curls') back = [[100, 80, 30], [150, 50, 36], [200, 80, 30], [90, 130, 27], [210, 130, 27], [92, 180, 25], [208, 180, 25], [102, 224, 23], [198, 224, 23], [116, 258, 18], [184, 258, 18]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}" stroke="${hd}" stroke-width="2"/>`).join('');
    else if (hs === 'pigtails') back = cap + `<ellipse cx="80" cy="176" rx="22" ry="56" transform="rotate(14 80 176)" fill="${hc}" stroke="${hd}" stroke-width="2"/><ellipse cx="220" cy="176" rx="22" ry="56" transform="rotate(-14 220 176)" fill="${hc}" stroke="${hd}" stroke-width="2"/>`;
    else if (hs === 'bob') back = `<path d="M90,110 Q86,38 150,38 Q214,38 210,110 L214,172 Q150,186 86,172 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/>`;

    // שמלה
    const cape = D.cape ? `<path d="M122,196 C82,280 40,420 18,506 Q150,524 282,506 C260,420 218,280 178,196 Z" fill="#d4f1ff" fill-opacity=".6" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
      <g opacity=".7">${flake(60, 470, 8)}${flake(240, 450, 7)}${flake(90, 380, 6)}${flake(214, 360, 6)}</g>` : '';
    const skirt = `<path d="${SKIRT[D.shape]}" fill="${fill}"/><path d="${SKIRT[D.shape]}" fill="url(#${u}p)"/>
      <path d="${FOLDS[D.shape]}" stroke="#000" stroke-opacity=".07" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="${HEM[D.shape]}" stroke="#fff" stroke-width="8" stroke-dasharray=".1 15" stroke-linecap="round" fill="none"/>`;
    const bodice = `<path d="M120,192 Q150,202 180,192 L185,256 Q150,266 115,256 Z" fill="${D.rainbow ? '#ff9ecf' : D.c2}"/>
      <path d="M120,192 Q150,202 180,192 L185,256 Q150,266 115,256 Z" fill="url(#${u}p)" opacity=".6"/>
      <path d="M126,206 Q150,214 174,206" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>
      <rect x="113" y="248" width="74" height="12" rx="6" fill="${D.belt}"/><circle cx="150" cy="254" r="7" fill="#fff" stroke="${D.belt}" stroke-width="2"/>
      <path d="M150,196 l5,7 l-5,7 l-5,-7Z" fill="#fff"/>`;
    const arms = `<g stroke="${sk}" stroke-width="17" stroke-linecap="round" fill="none"><path d="M116,202 Q96,250 102,296"/><path d="M184,202 Q206,250 200,296"/></g>
      <circle cx="102" cy="300" r="10" fill="${sk}"/><circle cx="200" cy="300" r="10" fill="${sk}"/>`;
    let sleeves = '';
    if (D.sleeve === 'puff') sleeves = `<ellipse cx="116" cy="202" rx="19" ry="15" fill="${D.rainbow ? '#ffd166' : D.c1}" stroke="${D.rainbow ? '#ff9ecf' : D.c2}" stroke-width="3"/><ellipse cx="184" cy="202" rx="19" ry="15" fill="${D.rainbow ? '#7cc8ff' : D.c1}" stroke="${D.rainbow ? '#c77dff' : D.c2}" stroke-width="3"/>`;
    if (D.sleeve === 'sheer') sleeves = `<g stroke="#d4f1ff" stroke-opacity=".7" stroke-width="21" stroke-linecap="round" fill="none"><path d="M116,202 Q96,250 102,290"/><path d="M184,202 Q206,250 200,290"/></g>`;
    const shoes = `<ellipse cx="132" cy="496" rx="15" ry="8" fill="${D.shoe}" stroke="rgba(0,0,0,.15)" stroke-width="2"/><ellipse cx="168" cy="496" rx="15" ry="8" fill="${D.shoe}" stroke="rgba(0,0,0,.15)" stroke-width="2"/>`;

    // ראש ופנים
    const head = `<rect x="139" y="150" width="22" height="48" fill="${sk}"/><ellipse cx="150" cy="196" rx="40" ry="12" fill="${sk}"/>
      <circle cx="98" cy="122" r="9" fill="${sk}"/><circle cx="202" cy="122" r="9" fill="${sk}"/>
      <ellipse cx="150" cy="112" rx="52" ry="56" fill="${sk}"/>
      <path d="M140,166 Q150,172 160,166" stroke="#000" stroke-opacity=".08" stroke-width="5" fill="none"/>`;
    const eye = (x, f) => `<ellipse cx="${x}" cy="122" rx="12" ry="14" fill="#fff"/><circle cx="${x}" cy="124" r="9.5" fill="${ey}"/><circle cx="${x}" cy="125" r="5" fill="#1f1830"/>
      <circle cx="${x + 3.5}" cy="119.5" r="3.2" fill="#fff"/><circle cx="${x - 3}" cy="129" r="1.6" fill="#fff"/>
      <path d="M${x - 13},117 Q${x},103 ${x + 13},117 M${x + f * 12},115 l${f * 6},-5" stroke="#2b2133" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const face = `<g class="blink">${eye(128, -1)}${eye(172, 1)}</g>
      <path d="M115,102 Q128,95 140,100 M160,100 Q172,95 185,102" stroke="${hd}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M147,137 Q150,141 153,137" stroke="#000" stroke-opacity=".22" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M139,148 Q150,160 161,148 Q150,152 139,148Z" fill="#e8577d" stroke="#c43c63" stroke-width="1.5" stroke-linejoin="round"/>
      <ellipse cx="114" cy="141" rx="11" ry="6.5" fill="#ff8fab" opacity=".45"/><ellipse cx="186" cy="141" rx="11" ry="6.5" fill="#ff8fab" opacity=".45"/>`;

    // שיער מקדימה
    const bangs = `<path d="M95,122 Q90,46 150,44 Q210,46 205,122 Q198,86 176,74 Q160,94 128,90 Q106,96 95,122 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/>
      <path d="M118,62 Q140,52 160,56" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    let front = '';
    if (hs === 'braid') {
      let b = '';
      for (let i = 0; i <= 9; i++) {
        const t = i / 9, x = (1 - t) * (1 - t) * 104 + 2 * (1 - t) * t * 82 + t * t * 122, y = (1 - t) * (1 - t) * 128 + 2 * (1 - t) * t * 220 + t * t * 334;
        const r = 17 - t * 7;
        b += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r}" ry="${r * .78}" transform="rotate(${i % 2 ? 28 : -28} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${hc}" stroke="${hd}" stroke-width="2"/>`;
      }
      front = b + `<path d="M116,342 Q122,362 112,372 M122,342 Q130,362 128,374" stroke="${hd}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="121" cy="340" r="6" fill="#8fd3ff"/>
        <path d="M95,124 Q88,44 154,42 Q214,46 206,118 Q196,82 168,74 Q134,68 116,88 Q102,100 95,124 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/>
        <path d="M104,94 Q116,48 166,48" stroke="#fff" stroke-opacity=".45" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    } else if (hs === 'long') {
      front = bangs + `<path d="M97,112 Q84,200 100,272 Q112,274 113,250 Q104,190 112,128 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/><path d="M203,112 Q216,200 200,272 Q188,274 187,250 Q196,190 188,128 Z" fill="${hc}" stroke="${hd}" stroke-width="2"/>`;
    } else if (hs === 'curls') {
      front = [[110, 70, 20], [134, 58, 22], [166, 58, 22], [190, 70, 20], [100, 96, 15], [200, 96, 15]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}" stroke="${hd}" stroke-width="2"/>`).join('');
    } else if (hs === 'pigtails') {
      front = bangs + `<circle cx="96" cy="126" r="9" fill="#ff70a6"/><circle cx="204" cy="126" r="9" fill="#ff70a6"/>`;
    } else front = bangs;

    // כתרים
    const crowns = [
      '',
      `<path d="M110,64 Q150,40 190,64" stroke="#e6f6ff" stroke-width="6" fill="none" stroke-linecap="round"/><g>${flake(150, 36, 15, '#bfe9ff', 4)}${flake(126, 50, 8, '#e6f6ff', 3)}${flake(174, 50, 8, '#e6f6ff', 3)}</g><circle cx="150" cy="36" r="4" fill="#fff"/>`,
      `<path d="M116,62 L120,30 L134,46 L150,22 L166,46 L180,30 L184,62 Z" fill="url(#${u}au)" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="120" cy="29" r="4.5" fill="#fff3a0"/><circle cx="150" cy="21" r="4.5" fill="#fff3a0"/><circle cx="180" cy="29" r="4.5" fill="#fff3a0"/>
        <circle cx="150" cy="50" r="6" fill="#ff4d8d"/><circle cx="131" cy="54" r="4" fill="#4cc9f0"/><circle cx="169" cy="54" r="4" fill="#2ec27e"/>`,
      [[104, 76], [114, 60], [130, 50], [150, 46], [170, 50], [186, 60], [196, 76]].map(([x, y], i) => flower(x, y, 6.5, ['#ff70a6', '#fff', '#b388ff'][i % 3])).join(''),
      `<g transform="translate(188 60) rotate(15)"><path d="M0,0 L-26,-16 Q-32,0 -26,16 Z M0,0 L26,-16 Q32,0 26,16 Z" fill="#ff70a6" stroke="#e0508a" stroke-width="2" stroke-linejoin="round"/><circle r="7" fill="#ff4d8d"/></g>`,
      `<path d="M114,62 Q150,44 186,62" stroke="#ffb3d1" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M150,52 C140,44 136,38 136,33 C136,28 140,25 144,25 C147,25 149,27 150,29 C151,27 153,25 156,25 C160,25 164,28 164,33 C164,38 160,44 150,52Z" fill="#ff4d8d" stroke="#fff" stroke-width="2"/>`,
      `<path d="M124,62 L126,40 L138,50 L150,34 L162,50 L174,40 L176,62 Z" fill="#e8eef7" stroke="#a9b6c8" stroke-width="2.5" stroke-linejoin="round"/><circle cx="150" cy="52" r="5" fill="#4cc9f0"/><circle cx="150" cy="34" r="3.5" fill="#4cc9f0"/>`
    ];
    // אביזרים
    const a = ACCS[st.acc];
    let acc = '';
    if (a === 'wand') acc = `<path d="M200,300 L234,236" stroke="#fff3b0" stroke-width="5" stroke-linecap="round"/><path d="M238,214 L242.7,226.5 L256,227 L245.6,235.3 L249.3,248 L238,240.6 L226.7,248 L230.4,235.3 L220,227 L233.3,226.5Z" fill="url(#${u}au)" stroke="#e0a800" stroke-width="2"/><circle cx="262" cy="214" r="3" fill="#fff"/><circle cx="222" cy="210" r="2" fill="#fff"/>`;
    else if (a === 'flake') acc = `<circle cx="226" cy="252" r="34" fill="url(#${u}gl)" opacity=".9"/>${flake(226, 252, 20, '#fff', 4)}${flake(226, 252, 10, '#bfe9ff', 3)}`;
    else if (a === 'bouquet') acc = `<g stroke="#3fae49" stroke-width="3"><path d="M200,300 L196,262 M200,300 L212,264 M200,300 L224,276"/></g>${flower(194, 258, 7, '#ff70a6')}${flower(214, 260, 7, '#fff')}${flower(226, 276, 7, '#b388ff')}`;
    else if (a === 'balloon') acc = `<path d="M200,296 Q226,240 238,190" stroke="#888" stroke-width="1.5" fill="none"/><path d="M238,192 C214,172 206,160 206,146 C206,134 215,126 224,126 C231,126 236,130 238,136 C240,130 245,126 252,126 C261,126 270,134 270,146 C270,160 262,172 238,192Z" fill="#ff4d6d"/><ellipse cx="220" cy="142" rx="5" ry="8" fill="#fff" opacity=".5"/>`;
    else if (a) acc = `<text x="248" y="508" font-size="58" text-anchor="middle">${a}</text>`;

    return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${defs}${back}${cape}${shoes}${skirt}${bodice}${arms}${sleeves}${head}${face}${front}${crowns[st.crown] || ''}${acc}</svg>`;
  }
  return { svg, DRESSES, HAIRS, HAIR_COLORS, SKINS, EYES, CROWNS, ACCS, BGS };
})();

registerGame({
  id: 'princess', name: 'הנסיכה שלי', emoji: '👸', color: '#ff70a6', say: 'הנסיכה שלי! בואי נלביש את הנסיכה',
  mount(root, s) {
    const def = { dress: 0, hair: 0, hairColor: 0, crown: 1, acc: 2, skin: 0, eyes: 0, bg: 0 };
    const st = Object.assign({}, def, Store.get('princess', {}));
    root.innerHTML = `<div class="pr"><div class="pr-stage"></div><div class="pr-panel">
      <div class="pr-tabs"></div><div class="pr-opts"></div>
      <div class="pr-actions"><button class="rand">🎲</button><button class="magic">✨ קסם</button></div></div></div>`;
    const stage = $('.pr-stage', root), opts = $('.pr-opts', root), tabsEl = $('.pr-tabs', root);
    let tab = 'dress';

    function paintStage(fx) {
      const bg = PR.BGS[st.bg];
      stage.className = 'pr-stage ' + bg.c;
      stage.innerHTML = bg.d.concat(bg.d).map((e, i) => `<span class="pr-deco" style="left:${(i * 37 + 7) % 92}%;top:${(i * 23 + 5) % 70}%;--s:${22 + (i * 13) % 26}px;--d:${-i * .7}s">${e}</span>`).join('') + PR.svg(st);
      Store.set('princess', st);
      if (fx) { const c = center(stage); FX.burst(c.x, c.y, ['✨', '💖', '⭐'], 10, 32); Sound.sparkle(); }
    }

    const TABS = [
      ['dress', '👗'], ['hair', '💇‍♀️'], ['crown', '👑'], ['acc', '🪄'], ['face', '🙂'], ['bg', '🏰']
    ];
    TABS.forEach(([k, e]) => {
      const b = el('button', '', e); b.dataset.k = k;
      b.onclick = () => { tab = k; Sound.tap(); paintTabs(); paintOpts(); };
      tabsEl.appendChild(b);
    });
    const paintTabs = () => $$('button', tabsEl).forEach(b => b.classList.toggle('on', b.dataset.k === tab));

    function opt(html, on, fn, i, extra = '') {
      const b = el('button', 'o ' + extra, html); if (on) b.classList.add('on'); b.style.setProperty('--i', i);
      b.onclick = () => { Sound.init(); fn(); paintStage(true); paintOpts(); };
      opts.appendChild(b); return b;
    }
    function paintOpts() {
      opts.innerHTML = '';
      if (tab === 'dress') PR.DRESSES.forEach((d, i) => opt(PR.svg(Object.assign({}, st, { dress: i, acc: 0 }), '30 180 240 330', ''), st.dress === i, () => { st.dress = i; Voice.say('שמלה ' + d.n); }, i));
      if (tab === 'hair') {
        PR.HAIRS.forEach((h, i) => opt(PR.svg(Object.assign({}, st, { hair: i, crown: 0 }), '50 0 200 240', ''), st.hair === i, () => st.hair = i, i));
        opts.appendChild(el('div', 'lbl', '🎨'));
        PR.HAIR_COLORS.forEach(([c, d], i) => opt('', st.hairColor === i, () => st.hairColor = i, i + 6, 'dot').style.background = `radial-gradient(circle at 35% 30%,#fff8 0 15%,transparent 16%),${c}`);
      }
      if (tab === 'crown') for (let i = 0; i < PR.CROWNS; i++) opt(i ? PR.svg(Object.assign({}, st, { crown: i }), '80 0 140 140', '') : '🚫', st.crown === i, () => st.crown = i, i);
      if (tab === 'acc') {
        const icons = ['🚫', '🪄', '❄️', '💐', '🎈', '🐰', '🦄', '🐱'];
        PR.ACCS.forEach((a, i) => opt(icons[i], st.acc === i, () => st.acc = i, i));
      }
      if (tab === 'face') {
        PR.SKINS.forEach((c, i) => opt('', st.skin === i, () => st.skin = i, i, 'dot').style.background = c);
        opts.appendChild(el('div', 'lbl', '👀'));
        PR.EYES.forEach((c, i) => opt(`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff"/><circle cx="20" cy="21" r="12" fill="${c}"/><circle cx="20" cy="22" r="6" fill="#1f1830"/><circle cx="24" cy="16" r="4" fill="#fff"/></svg>`, st.eyes === i, () => st.eyes = i, i + 4, 'dot'));
      }
      if (tab === 'bg') PR.BGS.forEach((b, i) => { const o = opt(b.e, st.bg === i, () => st.bg = i, i); o.classList.add(b.c); });
    }

    $('.magic', root).onclick = () => {
      Sound.init(); const p = $('svg.princess', stage);
      p.classList.remove('twirl'); void p.getBoundingClientRect(); p.classList.add('twirl');
      FX.rain(st.dress === 0 || st.bg === 0 ? ['❄️', '✨', '❄️', '💎'] : ['✨', '💖', '⭐', '🌸'], 40, 3);
      Sound.tada(); Voice.say(pick(['וואו! איזו נסיכה יפה!', 'קסם!', 'נסיכה מהממת!', 'איזה יופי של שמלה!']));
      const c = center(stage); FX.confetti(c.x, c.y * .7, 30);
      if (!s.starGiven) { s.starGiven = true; Stars.add(c.x, c.y, 1); }
    };
    $('.rand', root).onclick = () => {
      Sound.init(); Sound.boing();
      st.dress = randi(0, PR.DRESSES.length - 1); st.hair = randi(0, PR.HAIRS.length - 1); st.hairColor = randi(0, PR.HAIR_COLORS.length - 1);
      st.crown = randi(1, PR.CROWNS - 1); st.acc = randi(0, PR.ACCS.length - 1);
      paintStage(true); paintOpts();
    };
    paintTabs(); paintOpts(); paintStage();
  }
});
