'use strict';
/* 📖 סיפור אינטראקטיבי – "נוני והברווזון האבוד" (סיפור מקורי).
   כל עמוד הוא ציור מלא ומונפש על כל המסך (קנבס), עם קריינות ושתי נקודות בחירה. */
const STORY = (() => {
  // [סצנה, משפט, המשך]: המשך = עמוד הבא, או בחירות [[סמל, תווית, עמוד]]
  const P = {
    1: ['park', 'נוני יצאה לטייל בפארק ביום שמש יפה.', 2],
    2: ['hear', 'פתאום היא שמעה קול קטן: קוואק, קוואק!', 3],
    3: ['sad', 'זה היה ברווזון קטן שאיבד את אמא שלו. הוא היה עצוב מאוד.', 4],
    4: ['think', 'מה נוני תעשה?', [['🤗', 'לחבק אותו', 5], ['🍪', 'לתת לו עוגייה', 6]]],
    5: ['hug', 'נוני חיבקה את הברווזון, והוא הרגיש קצת יותר טוב.', 7],
    6: ['cookie', 'נוני חילקה איתו את העוגייה שלה. איזה שיתוף!', 7],
    7: ['cross', 'בואו נחפש את אמא ברווזה! לאן נלך?', [['🌊', 'לאגם', 8], ['🌲', 'ליער', 9]]],
    8: ['lake', 'באגם הם פגשו דג חביב. הדג אמר: ראיתי ברווזה גדולה ליד הגשר!', 10],
    9: ['forest', 'ביער הם פגשו ינשוף חכם. הינשוף אמר: אמא ברווזה מחפשת ליד הגשר!', 10],
    10: ['bridge', 'הם הלכו יחד לגשר, ושם חיכתה אמא ברווזה!', 11],
    11: ['reunite', 'אמא ברווזה שמחה מאוד ואמרה: תודה רבה נוני, עשית מעשה טוב!', 12],
    12: ['end', 'נוני הרגישה שמחה בלב. כשעוזרים לאחרים, גם לנו טוב. הסוף.', 0]
  };
  const lines = () => [...Object.values(P).map(p => p[1]), 'בואי נקרא סיפור!', 'עוד פעם את הסיפור?'];
  return { P, lines };
})();

/* ===== ציורים לסיפור ===== */
const SD = {
  sky(c, W, H, top, bot) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); },
  sun(c, x, y, r, t) {
    c.save(); c.translate(x, y); c.rotate(t * .25);
    c.fillStyle = 'rgba(255,214,10,.35)'; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(r * 1.15, -r * .14); c.lineTo(r * 1.7, 0); c.lineTo(r * 1.15, r * .14); c.fill(); }
    c.restore();
    const g = c.createRadialGradient(x - r * .3, y - r * .3, r * .2, x, y, r); g.addColorStop(0, '#fff6a8'); g.addColorStop(1, '#ffc300');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = '#7a4b00'; [-1, 1].forEach(k => { c.beginPath(); c.arc(x + k * r * .32, y - r * .1, r * .09, 0, 7); c.fill(); });
    c.strokeStyle = '#7a4b00'; c.lineWidth = r * .07; c.lineCap = 'round'; c.beginPath(); c.arc(x, y + r * .05, r * .38, .2 * Math.PI, .8 * Math.PI); c.stroke();
    c.fillStyle = 'rgba(255,120,120,.4)'; [-1, 1].forEach(k => { c.beginPath(); c.arc(x + k * r * .55, y + r * .18, r * .13, 0, 7); c.fill(); });
  },
  cloud(c, x, y, s, a = .95) { c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x, y, s, s * .38, 0, 0, 7); c.ellipse(x - s * .45, y + s * .05, s * .45, s * .3, 0, 0, 7); c.ellipse(x + s * .2, y - s * .25, s * .5, s * .42, 0, 0, 7); c.fill(); },
  clouds(c, W, H, t) { for (let i = 0; i < 4; i++) { const x = ((i * W * .37 + t * 18 * (1 + i * .2)) % (W + 300)) - 150; SD.cloud(c, x, H * (.1 + (i % 2) * .1), W * (.07 + (i % 3) * .02)); } },
  hills(c, W, H, y0, col1, col2) {
    c.fillStyle = col1; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 10) c.lineTo(x, y0 - Math.sin(x / W * 5 + 1) * H * .05); c.lineTo(W, H); c.fill();
    c.fillStyle = col2; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 10) c.lineTo(x, y0 + H * .07 - Math.sin(x / W * 3.4 + 2) * H * .03); c.lineTo(W, H); c.fill();
  },
  tree(c, x, y, s, t, ph = 0) {
    const sway = Math.sin(t * 1.4 + ph) * s * .04;
    c.fillStyle = '#8b5a2b'; c.beginPath(); c.moveTo(x - s * .09, y); c.lineTo(x - s * .06, y - s * .55); c.lineTo(x + s * .06, y - s * .55); c.lineTo(x + s * .09, y); c.fill();
    [['#3fae49', 0, -.78, .38], ['#58c862', -.25, -.62, .28], ['#4cbb55', .26, -.64, .3], ['#6ad46f', .05, -.98, .26]].forEach(([col, dx, dy, r]) => { c.fillStyle = col; c.beginPath(); c.arc(x + dx * s + sway, y + dy * s, r * s, 0, 7); c.fill(); });
    c.fillStyle = '#ff4d6d'; [[-.15, -.7], [.18, -.85], [.05, -.55]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx * s + sway, y + dy * s, s * .04, 0, 7); c.fill(); });
  },
  pine(c, x, y, s, t, ph = 0) {
    const sway = Math.sin(t * 1.2 + ph) * s * .03;
    c.fillStyle = '#6d4c2f'; c.fillRect(x - s * .06, y - s * .25, s * .12, s * .25);
    [['#1f7a3a', .5, .0], ['#2a8f47', .4, .3], ['#37a556', .3, .55]].forEach(([col, w, k]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w * s + sway * k, y - s * (.2 + k * .5)); c.lineTo(x + sway * (k + 1), y - s * (.75 + k * .5)); c.lineTo(x + w * s + sway * k, y - s * (.2 + k * .5)); c.fill(); });
  },
  flower(c, x, y, s, col, t, ph) {
    const sw = Math.sin(t * 2 + ph) * s * .15;
    c.strokeStyle = '#3fae49'; c.lineWidth = s * .12; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y - s * .6, x + sw, y - s); c.stroke();
    c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i * 1.2566 + t * .3; c.beginPath(); c.arc(x + sw + Math.cos(a) * s * .28, y - s + Math.sin(a) * s * .28, s * .22, 0, 7); c.fill(); }
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x + sw, y - s, s * .17, 0, 7); c.fill();
  },
  flowers(c, W, H, y, t) { const cols = ['#ff70a6', '#ffd60a', '#fff', '#b388ff', '#ff8c69']; for (let i = 0; i < 9; i++) SD.flower(c, W * (.05 + i * .11) + (i % 2) * 14, y + (i % 3) * H * .03, H * .05, cols[i % 5], t, i); },
  butterfly(c, x, y, s, t, col = '#ff70a6') {
    const f = Math.abs(Math.sin(t * 12)) * .8 + .2;
    c.fillStyle = col; [-1, 1].forEach(k => { c.beginPath(); c.ellipse(x + k * s * .35 * f, y - s * .1, s * .35 * f, s * .3, 0, 0, 7); c.ellipse(x + k * s * .25 * f, y + s * .22, s * .22 * f, s * .2, 0, 0, 7); c.fill(); });
    c.fillStyle = '#3b2f4a'; c.beginPath(); c.ellipse(x, y, s * .06, s * .3, 0, 0, 7); c.fill();
  },
  duck(c, x, y, s, t, { baby = true, mood = 'ok', dir = 1, bob = true } = {}) {
    const by = bob ? Math.sin(t * 4) * s * .03 : 0;
    c.save(); c.translate(x, y + by); c.scale(dir, 1);
    const body = baby ? '#ffd93d' : '#fffaf0', wing = baby ? '#f4c430' : '#e8e0d0';
    c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(0, s * .02, s * .55, s * .1, 0, 0, 7); c.fill();
    c.fillStyle = '#ff9f1c'; [-1, 1].forEach(k => { c.beginPath(); c.ellipse(k * s * .18, -s * .02, s * .14, s * .06, 0, 0, 7); c.fill(); });
    c.fillStyle = body; c.beginPath(); c.ellipse(-s * .05, -s * .32, s * .5, s * .32, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-s * .5, -s * .4); c.lineTo(-s * .72, -s * .55); c.lineTo(-s * .5, -s * .22); c.fill();     // זנב
    c.fillStyle = wing; c.beginPath(); c.ellipse(-s * .12, -s * .32, s * .26, s * .16, -.3 + Math.sin(t * 6) * .08, 0, 7); c.fill();
    c.fillStyle = body; c.beginPath(); c.arc(s * .28, -s * .72, s * .27, 0, 7); c.fill();
    if (!baby) { c.fillStyle = '#7cc8ff'; c.beginPath(); c.arc(s * .2, -s * .95, s * .07, 0, 7); c.fill(); }   // סרט קטן לאמא
    c.fillStyle = '#ff9f1c'; c.beginPath(); c.ellipse(s * .56, -s * .66, s * .16, s * .07, .1, 0, 7); c.fill();
    if (mood === 'happy') { c.strokeStyle = '#3b2f4a'; c.lineWidth = s * .04; c.beginPath(); c.arc(s * .34, -s * .76, s * .06, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else { c.fillStyle = '#3b2f4a'; c.beginPath(); c.arc(s * .35, -s * .77, s * .05, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(s * .37, -s * .79, s * .018, 0, 7); c.fill(); }
    if (mood === 'sad') { c.strokeStyle = '#3b2f4a'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(s * .26, -s * .88); c.lineTo(s * .4, -s * .85); c.stroke();
      c.fillStyle = '#4cc9f0'; const dy = (t * 60) % (s * .5); c.beginPath(); c.ellipse(s * .38, -s * .68 + dy, s * .035, s * .055, 0, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,120,150,.45)'; c.beginPath(); c.arc(s * .24, -s * .64, s * .05, 0, 7); c.fill();
    c.restore();
  },
  heart(c, x, y, s, col = '#ff4d8d') { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * .35); c.bezierCurveTo(x - s * .6, y - s * .1, x - s * .3, y - s * .6, x, y - s * .25); c.bezierCurveTo(x + s * .3, y - s * .6, x + s * .6, y - s * .1, x, y + s * .35); c.fill(); },
  hearts(c, W, H, t, x0, y0) { for (let i = 0; i < 6; i++) { const p = (t * .5 + i / 6) % 1; SD.heart(c, x0 + Math.sin(p * 9 + i) * W * .05, y0 - p * H * .35, H * (.035 + i % 2 * .015), ['#ff4d8d', '#ff70a6', '#ff99c8'][i % 3]); } },
  bubble(c, x, y, txt, s) { c.font = `bold ${s}px "Varela Round", sans-serif`; const w = c.measureText(txt).width + s; c.fillStyle = '#fff'; c.beginPath(); rrect(c, x - w / 2, y - s, w, s * 1.6, s * .6); c.fill(); c.beginPath(); c.moveTo(x - s * .3, y + s * .55); c.lineTo(x, y + s * 1.1); c.lineTo(x + s * .3, y + s * .55); c.fill(); c.fillStyle = '#3b2f4a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y - s * .2); c.textBaseline = 'alphabetic'; },
  pond(c, x, y, w, h, t) {
    c.fillStyle = '#5bc0eb'; c.beginPath(); c.ellipse(x, y, w, h, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const r = ((t * 30 + i * 40) % 160); c.globalAlpha = 1 - r / 160; c.beginPath(); c.ellipse(x - w * .3 + i * w * .2, y, r * .6, r * .18, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
    c.strokeStyle = '#2a8f47'; c.lineWidth = 5; for (let i = 0; i < 6; i++) { const rx = x - w * .95 + i * 8; c.beginPath(); c.moveTo(rx, y + h * .2); c.quadraticCurveTo(rx - 6 + Math.sin(t * 2 + i) * 4, y - h * .5, rx + Math.sin(t * 2 + i) * 6, y - h * .9); c.stroke(); }
  },
  fish(c, x, y, s, a, col = '#ff8c42') {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * .5, s * .28, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-s * .4, 0); c.lineTo(-s * .75, -s * .25); c.lineTo(-s * .75, s * .25); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(s * .25, -s * .06, s * .09, 0, 7); c.fill(); c.fillStyle = '#3b2f4a'; c.beginPath(); c.arc(s * .27, -s * .06, s * .05, 0, 7); c.fill();
    c.strokeStyle = '#3b2f4a'; c.lineWidth = s * .03; c.beginPath(); c.arc(s * .3, s * .06, s * .07, .2, 2.4); c.stroke();
    c.restore();
  },
  owl(c, x, y, s, t) {
    c.fillStyle = '#8d6e63'; c.beginPath(); c.ellipse(x, y, s * .4, s * .5, 0, 0, 7); c.fill();
    c.fillStyle = '#d7ccc8'; c.beginPath(); c.ellipse(x, y + s * .12, s * .26, s * .3, 0, 0, 7); c.fill();
    c.fillStyle = '#8d6e63'; [-1, 1].forEach(k => { c.beginPath(); c.moveTo(x + k * s * .2, y - s * .4); c.lineTo(x + k * s * .38, y - s * .62); c.lineTo(x + k * s * .34, y - s * .3); c.fill(); });
    const blink = (t % 3.4) > 3.2;
    [-1, 1].forEach(k => {
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x + k * s * .16, y - s * .2, s * .14, 0, 7); c.fill();
      if (blink) { c.strokeStyle = '#3b2f4a'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(x + k * s * .16 - s * .1, y - s * .2); c.lineTo(x + k * s * .16 + s * .1, y - s * .2); c.stroke(); }
      else { c.fillStyle = '#3b2f4a'; c.beginPath(); c.arc(x + k * s * .16, y - s * .2, s * .07, 0, 7); c.fill(); }
    });
    c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(x - s * .05, y - s * .08); c.lineTo(x + s * .05, y - s * .08); c.lineTo(x, y + s * .02); c.fill();
  },
  bridge(c, x, y, w, h) {
    c.strokeStyle = '#8b5a2b'; c.lineWidth = h * .18; c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x, y - h * 1.3, x + w / 2, y); c.stroke();
    c.lineWidth = h * .06; for (let i = 0; i <= 8; i++) { const k = i / 8, bx = x - w / 2 + w * k, byy = y - Math.sin(k * Math.PI) * h * .65; c.beginPath(); c.moveTo(bx, byy); c.lineTo(bx, byy - h * .5); c.stroke(); }
    c.beginPath(); c.moveTo(x - w / 2, y - h * .5); c.quadraticCurveTo(x, y - h * 1.8, x + w / 2, y - h * .5); c.stroke();
  },
  rainbow(c, x, y, r, a) { ['#ff4d4d', '#ff9f1c', '#ffd60a', '#2ec27e', '#3a86ff', '#9b5de5'].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = a; c.lineWidth = r * .06; c.beginPath(); c.arc(x, y, r - i * r * .06, Math.PI, 0); c.stroke(); }); c.globalAlpha = 1; },
  cookie(c, x, y, s) { c.fillStyle = '#d9a066'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.fillStyle = '#5d3a1a'; [[-.4, -.3], [.3, -.4], [0, .2], [.45, .3], [-.35, .35]].forEach(([a, b]) => { c.beginPath(); c.arc(x + a * s, y + b * s, s * .12, 0, 7); c.fill(); }); },
  sign(c, x, y, s) {
    c.fillStyle = '#8b5a2b'; c.fillRect(x - s * .04, y - s, s * .08, s);
    [[-1, '#5bc0eb', 'אגם', -.85], [1, '#2a8f47', 'יער', -.62]].forEach(([d, col, txt, yy]) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(x, y + yy * s - s * .09); c.lineTo(x + d * s * .42, y + yy * s - s * .09); c.lineTo(x + d * s * .52, y + yy * s); c.lineTo(x + d * s * .42, y + yy * s + s * .09); c.lineTo(x, y + yy * s + s * .09); c.fill();
      c.fillStyle = '#fff'; c.font = `bold ${s * .1}px "Varela Round", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x + d * s * .24, y + yy * s); c.textBaseline = 'alphabetic';
    });
  }
};

registerGame({
  id: 'story', name: 'סיפור: נוני והברווזון', emoji: '📖', color: '#9d8df1', say: 'בואי נקרא סיפור!',
  lines: STORY.lines,
  mount(root, s) {
    const { P } = STORY;
    root.innerHTML = `<div class="st2"><canvas></canvas><div class="st2-box"><div class="st2-text"></div>
      <div class="st-ctrl"><button class="st-again" aria-label="שוב">🔊</button><div class="st-choices"></div><button class="st-next" aria-label="הלאה">▶️</button></div></div></div>`;
    const wrap = $('.st2', root), cv = $('canvas', root), c = cv.getContext('2d');
    const textEl = $('.st2-text', root), choices = $('.st-choices', root), nextB = $('.st-next', root);
    let W, H, DPR, page = 1, t = 0, pt = 0;
    function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; cv.width = W * DPR; cv.height = H * DPR; c.setTransform(DPR, 0, 0, DPR, 0, 0); }
    resize(); s.on(window, 'resize', resize);
    const ease = (a, b, k) => a + (b - a) * (1 - Math.pow(1 - Math.min(1, k), 3));

    // ציור הסצנה של כל עמוד (pt = זמן מתחילת העמוד, לאנימציות כניסה)
    function scene() {
      const sc = P[page][0], G = H * .52, S = Math.min(W, H);   // האופק גבוה, כדי שהדמויות יעמדו מעל תיבת הטקסט
      const day = () => { SD.sky(c, W, H, '#8fd3ff', '#e6f7ff'); SD.sun(c, W * .84, H * .16, S * .07, t); SD.clouds(c, W, H, t); SD.hills(c, W, H, G, '#9be15d', '#7dd87a'); };
      const noni = (x, y, sz, opt = {}) => drawNoni(c, x, y, sz, Object.assign({ t, dir: 1 }, opt));
      if (['park', 'hear', 'sad', 'think', 'hug', 'cookie'].includes(sc)) {
        day(); SD.tree(c, W * .12, G + H * .05, S * .42, t, 0); SD.tree(c, W * .9, G + H * .07, S * .36, t, 2);
        SD.flowers(c, W, H, H * .93, t);
        if (sc === 'park') {
          SD.butterfly(c, W * .5 + Math.sin(t) * W * .2, H * .45 + Math.sin(t * 2) * H * .05, S * .06, t);
          SD.butterfly(c, W * .3 + Math.cos(t * .8) * W * .15, H * .38 + Math.cos(t * 1.7) * H * .05, S * .05, t, '#9b5de5');
          noni(ease(-W * .1, W * .45, pt / 3), G + H * .14 - Math.abs(Math.sin(t * 6)) * H * .02, S * .2);
        } else {
          const dx = W * .62, dy = G + H * .16;
          if (sc === 'hear') { c.fillStyle = '#4bb33b'; c.beginPath(); c.arc(dx + S * .02, dy - S * .05, S * .14, 0, 7); c.arc(dx + S * .14, dy - S * .03, S * .11, 0, 7); c.fill();
            SD.duck(c, dx + S * .1, dy, S * .16, t, { mood: 'sad', dir: -1 }); if (Math.sin(t * 3) > 0) SD.bubble(c, dx + S * .05, dy - S * .3, 'קוואק! קוואק!', S * .045);
            noni(W * .3, G + H * .14, S * .2, { dir: 1 }); c.font = `${S * .06}px serif`; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('❗', W * .3, G - H * .12 - Math.abs(Math.sin(t * 5)) * 8); }
          if (sc === 'sad') { SD.duck(c, dx, dy, S * .24, t, { mood: 'sad', dir: -1 }); noni(W * .32, G + H * .14, S * .2); c.fillStyle = 'rgba(120,150,200,.35)'; SD.cloud(c, dx, dy - S * .42, S * .1, .9); }
          if (sc === 'think') { SD.duck(c, dx, dy, S * .22, t, { mood: 'sad', dir: -1 }); noni(W * .32, G + H * .14, S * .2);
            c.font = `bold ${S * .09}px "Varela Round", sans-serif`; c.fillStyle = '#9b5de5'; c.textAlign = 'center'; for (let i = 0; i < 3; i++) c.fillText('?', W * .3 + (i - 1) * S * .08, G - H * .1 - ((t * 40 + i * 30) % 60)); }
          if (sc === 'hug') { const k = Math.min(1, pt / 1.5); noni(ease(W * .3, W * .5, k), G + H * .14, S * .22, { happy: k >= 1 }); SD.duck(c, ease(dx, W * .58, k), dy, S * .2, t, { mood: k >= 1 ? 'happy' : 'sad', dir: -1 }); if (k >= 1) SD.hearts(c, W, H, t, W * .54, G); }
          if (sc === 'cookie') { const k = Math.min(1, pt / 2); noni(W * .36, G + H * .14, S * .2, { happy: true }); SD.duck(c, dx, dy, S * .2, t, { mood: k >= 1 ? 'happy' : 'ok', dir: -1 });
            SD.cookie(c, ease(W * .42, dx - S * .1, k), ease(G, dy - S * .12, k) - Math.sin(k * Math.PI) * H * .12, S * .045); }
        }
      } else if (sc === 'cross') {
        day(); SD.pine(c, W * .9, G + H * .06, S * .4, t, 1); SD.pine(c, W * .8, G + H * .04, S * .3, t, 2); SD.pond(c, W * .14, G + H * .1, W * .14, H * .05, t);
        SD.sign(c, W * .5, G + H * .1, S * .5); noni(W * .32, G + H * .2, S * .18); SD.duck(c, W * .68, G + H * .2, S * .14, t, { dir: -1 });
      } else if (sc === 'lake') {
        SD.sky(c, W, H, '#9fe3ff', '#e9fbff'); SD.sun(c, W * .15, H * .14, S * .06, t); SD.clouds(c, W, H, t);
        SD.hills(c, W, H, G - H * .1, '#9be15d', '#8fdb7e'); SD.pond(c, W * .55, G + H * .12, W * .4, H * .14, t);
        const jp = (t % 3) / 3, fx = W * .4 + jp * W * .3, fy = G + H * .1 - Math.sin(jp * Math.PI) * H * .25;
        if (jp < .95) SD.fish(c, fx, fy, S * .1, Math.cos(jp * Math.PI) * -.9);
        if ((t % 3) / 3 > .4 && (t % 3) / 3 < .9) SD.bubble(c, W * .55, G - H * .22, 'ליד הגשר!', S * .045);
        noni(W * .14, G + H * .2, S * .18); SD.duck(c, W * .26, G + H * .2, S * .13, t, { dir: 1 });
      } else if (sc === 'forest') {
        SD.sky(c, W, H, '#b8e0c8', '#e8f7ec');
        for (let i = 0; i < 7; i++) SD.pine(c, W * (i / 6), G + H * .05 + (i % 2) * H * .04, S * (.45 + (i % 3) * .08), t, i);
        c.fillStyle = '#5c8a3a'; c.fillRect(0, G + H * .08, W, H);
        c.strokeStyle = '#6d4c2f'; c.lineWidth = S * .025; c.beginPath(); c.moveTo(W * .48, H * .4); c.lineTo(W * .78, H * .38); c.stroke();
        SD.owl(c, W * .66, H * .3, S * .18, t);
        if (Math.sin(t * 1.5) > -.2) SD.bubble(c, W * .66, H * .12, 'ליד הגשר!', S * .045);
        for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(255,240,120,${.5 + Math.sin(t * 3 + i) * .4})`; c.beginPath(); c.arc(W * (.1 + i * .11) + Math.sin(t + i) * 20, H * (.5 + (i % 3) * .08) + Math.cos(t * 1.3 + i) * 15, 4, 0, 7); c.fill(); }
        noni(W * .25, G + H * .2, S * .18); SD.duck(c, W * .37, G + H * .2, S * .13, t, { dir: 1 });
      } else if (['bridge', 'reunite', 'end'].includes(sc)) {
        day();
        c.fillStyle = '#5bc0eb'; c.fillRect(0, G + H * .06, W, H * .1); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3;
        for (let i = 0; i < 8; i++) { const x = ((i * W / 7 + t * 40) % (W + 60)) - 30; c.beginPath(); c.arc(x, G + H * .11, 12, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
        c.fillStyle = '#7dd87a'; c.fillRect(0, G + H * .16, W, H);
        SD.bridge(c, W * .5, G + H * .08, W * .5, H * .14);
        SD.flowers(c, W, H, H * .96, t);
        if (sc === 'end') { SD.rainbow(c, W * .5, G, Math.min(W, H * 1.6) * .48, Math.min(1, pt / 2)); }
        const k = Math.min(1, pt / 2.2);
        if (sc === 'bridge') {
          SD.duck(c, W * .5, G - H * .02 - Math.sin(t * 2) * 3, S * .24, t, { baby: false, mood: 'sad', dir: -1 });
          noni(ease(-W * .05, W * .2, k), G + H * .3, S * .17); SD.duck(c, ease(W * .05, W * .32, k), G + H * .3, S * .12, t, { dir: 1 });
        } else {
          SD.duck(c, W * .5, G + H * .28, S * .26, t, { baby: false, mood: 'happy', dir: -1 });
          SD.duck(c, W * .38, G + H * .29, S * .14, t, { mood: 'happy', dir: 1 });
          noni(W * .2, G + H * .3, S * .18, { happy: true });
          SD.hearts(c, W, H, t, W * .44, G + H * .1);
          if (sc === 'end') for (let i = 0; i < 12; i++) { const p = (t * .3 + i / 12) % 1; c.fillStyle = ['#ff4d8d', '#ffd23f', '#3a86ff', '#2ec27e'][i % 4]; c.fillRect(W * ((i * 73) % 100) / 100, p * H, 8, 12); }
        }
      }
    }

    function show(n) {
      page = n; pt = 0; const [, sent, next] = P[n];
      textEl.textContent = sent; textEl.classList.remove('bounce'); void textEl.offsetWidth; textEl.classList.add('bounce');
      Sound.whoosh();
      if (Array.isArray(next)) {
        nextB.style.visibility = 'hidden';
        choices.innerHTML = next.map(([e, l, to]) => `<button class="st-ch" data-to="${to}"><span>${e}</span>${l}</button>`).join('');
        $$('.st-ch', choices).forEach(b => b.onclick = () => { Sound.pop(); show(+b.dataset.to); });
      } else { choices.innerHTML = ''; nextB.style.visibility = next === 0 ? 'hidden' : ''; }
      Voice.say(sent);
      if (next === 0) {
        const cc = center(wrap); s.later(() => { FX.confetti(cc.x, cc.y * .6, 70); Sound.tada(); Stars.add(cc.x, cc.y, 2); }, 1500);
        s.later(() => celebrate({ emoji: '📖', title: 'הסוף! איזה סיפור יפה', say: 'עוד פעם את הסיפור?', stars: 2, again: () => show(1) }), 7000);
      }
    }
    nextB.onclick = () => { Sound.tap(); const nx = P[page][2]; if (typeof nx === 'number' && nx) show(nx); };
    $('.st-again', root).onclick = () => { Sound.tap(); Voice.say(P[page][1]); };
    s.onFrame(dt => { t += dt; pt += dt; scene(); });
    show(1);
  }
});
