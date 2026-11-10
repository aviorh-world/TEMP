'use strict';
/* ===== כלים כלליים ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const center = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
function hit(e, x, y, pad = 24) { const r = e.getBoundingClientRect(); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; }

const Store = {
  get(k, d) { try { const v = localStorage.getItem('kg_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('kg_' + k, JSON.stringify(v)); } catch (e) {} }
};

const COLORS = [
  { n: 'אדום', c: '#ff4d4d' }, { n: 'כחול', c: '#3a86ff' }, { n: 'צהוב', c: '#ffd60a' }, { n: 'ירוק', c: '#2ec27e' },
  { n: 'סגול', c: '#9b5de5' }, { n: 'כתום', c: '#ff8c1a' }, { n: 'ורוד', c: '#ff70a6' }
];

/* ===== צלילים (מסונתזים, בלי קבצים) ===== */
const Sound = {
  ctx: null, master: null, on: Store.get('sound', true),
  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = .7; this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state !== 'running') this.ctx.resume();
    } catch (e) {}
  },
  ok() { return this.on && this.ctx; },
  tone(f, d, { type = 'sine', vol = .25, at = 0, to = null, attack = .01 } = {}) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .05);
  },
  noise(d, { vol = .3, at = 0, freq = 1000, q = 1, type = 'bandpass', to = null } = {}) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime + at, len = Math.max(1, Math.floor(c.sampleRate * d));
    const buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + d); f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + d + .02);
  },
  tap() { this.tone(700, .07, { type: 'triangle', vol: .12 }); },
  pop() { this.tone(450, .12, { to: 1500, vol: .3 }); this.noise(.07, { freq: 2500, vol: .25 }); },
  ding(n = 0) { const f = 880 * Math.pow(2, n / 12); this.tone(f, .4, { type: 'triangle', vol: .22 }); this.tone(f * 2, .25, { vol: .06, at: .02 }); },
  chime() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .45, { type: 'triangle', at: i * .09, vol: .2 })); },
  tada() { this.chime(); [523, 659, 784, 1047].forEach(f => this.tone(f, 1.1, { type: 'triangle', at: .45, vol: .12 })); this.sparkle(.5); },
  sparkle(at = 0) { for (let i = 0; i < 6; i++) this.tone(rand(1800, 3200), .15, { at: at + i * .06, vol: .06 }); },
  wrong() { this.tone(440, .16, { type: 'triangle', vol: .14 }); this.tone(349, .26, { type: 'triangle', vol: .14, at: .16 }); },
  boing() { this.tone(160, .35, { to: 520, vol: .22 }); },
  whoosh() { this.noise(.45, { freq: 300, to: 3000, vol: .25, q: .8 }); },
  munch() { for (let i = 0; i < 3; i++) this.noise(.08, { at: i * .11, freq: 650, vol: .4, type: 'lowpass' }); },
  coin() { this.tone(988, .08, { type: 'square', vol: .07 }); this.tone(1319, .3, { type: 'square', vol: .07, at: .08 }); },
  honk() { [0, .22].forEach(a => { this.tone(420, .15, { type: 'square', vol: .08, at: a }); this.tone(530, .15, { type: 'square', vol: .06, at: a }); }); },
  vroom() { this.tone(70, .6, { type: 'sawtooth', to: 190, vol: .1 }); },
  bark() { [0, .2].forEach(a => { this.tone(620, .12, { type: 'square', to: 330, vol: .1, at: a }); this.noise(.1, { at: a, freq: 900, vol: .18 }); }); },
  burp() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime, d = 1.0;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(115, t); o.frequency.linearRampToValueAtTime(72, t + d);
    const lfo = c.createOscillator(); lfo.frequency.value = 26; const lg = c.createGain(); lg.gain.value = .5;
    const am = c.createGain(); am.gain.value = .5; lfo.connect(lg); lg.connect(am.gain);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(950, t); f.frequency.linearRampToValueAtTime(380, t + d); f.Q.value = 5;
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.7, t + .05); g.gain.setValueAtTime(.7, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(am); am.connect(f); f.connect(g); g.connect(this.master);
    o.start(t); lfo.start(t); o.stop(t + d + .05); lfo.stop(t + d + .05);
  }
};

/* ===== קריינות בעברית (אם יש קול עברי במכשיר) ===== */
const Voice = {
  he: null,
  find() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices();
    this.he = vs.find(v => /^(he|iw)/i.test(v.lang)) || null;
    this.loaded = vs.length > 0;
    return this.he;
  },
  say(t) {
    if (!Sound.on || !('speechSynthesis' in window)) return;
    if (!this.he) this.find();
    if (this.loaded && !this.he) return; // אין קול עברי - לא מקריאים בקול זר
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t); u.lang = 'he-IL'; if (this.he) u.voice = this.he;
      u.rate = .95; u.pitch = 1.2; speechSynthesis.speak(u);
    } catch (e) {}
  }
};
if ('speechSynthesis' in window) { Voice.find(); speechSynthesis.onvoiceschanged = () => Voice.find(); }

/* ===== אפקטים ===== */
const FX = {
  layer: null,
  init() { this.layer = el('div', 'fx-layer'); document.body.appendChild(this.layer); },
  confetti(x, y, n = 40) {
    const cs = ['#ff4d8d', '#ffd23f', '#3a86ff', '#2ec27e', '#9b5de5', '#ff8c1a', '#4cc9f0'];
    for (let i = 0; i < n; i++) {
      const p = el('i', 'confetti');
      p.style.cssText = `left:${x}px;top:${y}px;background:${pick(cs)};--dx:${rand(-45, 45)}vmin;--up:${rand(-40, -15)}vmin;--dy:${rand(20, 70)}vmin;--r:${rand(-720, 720)}deg;animation-duration:${rand(1.1, 1.9)}s`;
      if (Math.random() < .3) p.style.borderRadius = '50%';
      this.layer.appendChild(p); setTimeout(() => p.remove(), 2000);
    }
  },
  burst(x, y, items = ['✨', '⭐', '💖'], n = 9, size = 34) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-.3, .3), d = rand(70, 150);
      const p = el('span', 'particle', pick(items));
      p.style.cssText = `left:${x}px;top:${y}px;--s:${size * rand(.7, 1.2)}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${rand(-180, 180)}deg`;
      this.layer.appendChild(p); setTimeout(() => p.remove(), 1100);
    }
  },
  text(x, y, t, c) {
    const p = el('div', 'ftext', t); p.style.left = x + 'px'; p.style.top = y + 'px'; if (c) p.style.setProperty('--c', c);
    this.layer.appendChild(p); setTimeout(() => p.remove(), 1400);
  },
  rain(items, n = 30, dur = 3) {
    for (let i = 0; i < n; i++) {
      const p = el('span', 'rainfx', pick(items));
      p.style.cssText = `left:${rand(0, 100)}vw;--s:${rand(22, 48)}px;--r:${rand(-360, 360)}deg;animation-duration:${rand(dur * .6, dur * 1.2)}s;animation-delay:${rand(0, dur * .5)}s`;
      this.layer.appendChild(p); setTimeout(() => p.remove(), dur * 1900);
    }
  }
};

/* ===== כוכבים (נשמרים במכשיר) ===== */
const Stars = {
  n: Store.get('stars', 0),
  render() { $$('#mstars b,#gstars b').forEach(b => b.textContent = this.n); },
  add(x, y, k = 1) {
    const target = $('#game').classList.contains('on') ? $('#gstars') : $('#mstars');
    for (let i = 0; i < k; i++) {
      setTimeout(() => {
        const s = el('span', 'flystar', '⭐'); s.style.left = x + 'px'; s.style.top = y + 'px'; FX.layer.appendChild(s);
        requestAnimationFrame(() => requestAnimationFrame(() => { const c = center(target); s.style.left = c.x + 'px'; s.style.top = c.y + 'px'; s.style.fontSize = '24px'; }));
        setTimeout(() => {
          s.remove(); this.n++; Store.set('stars', this.n); this.render();
          target.classList.remove('bump'); void target.offsetWidth; target.classList.add('bump'); Sound.coin();
        }, 820);
      }, i * 180);
    }
  }
};

/* ===== גרירה עם אצבע/עכבר ===== */
function draggable(node, { onDrop, onTap, onStart } = {}) {
  let sx = 0, sy = 0, id = null, moved = false;
  node.style.touchAction = 'none';
  node.addEventListener('pointerdown', e => {
    if (id !== null || node.dataset.locked) return;
    id = e.pointerId; try { node.setPointerCapture(id); } catch (_) {}
    sx = e.clientX; sy = e.clientY; moved = false;
    node.style.animation = 'none'; node.style.transition = 'none'; node.classList.add('dragging');
    Sound.tap(); onStart && onStart(node);
  });
  node.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.hypot(dx, dy) > 10) moved = true;
    node.style.transform = `translate(${dx}px,${dy}px) scale(1.15)`;
  });
  const end = e => {
    if (e.pointerId !== id) return;
    id = null; node.classList.remove('dragging');
    if (!moved && onTap) { node.style.transform = ''; onTap(node); return; }
    const ok = onDrop ? onDrop(e.clientX, e.clientY, node) : false;
    if (!ok) { node.style.transition = 'transform .4s cubic-bezier(.3,1.6,.5,1)'; node.style.transform = ''; }
  };
  node.addEventListener('pointerup', end);
  node.addEventListener('pointercancel', end);
}

/* ===== "מרחב" של משחק: טיימרים שנעצרים ביציאה ===== */
function makeScope() {
  const s = { alive: true, timers: new Set(), cleanups: [], raf: 0 };
  s.later = (fn, ms) => { const t = setTimeout(() => { s.timers.delete(t); if (s.alive) fn(); }, ms); s.timers.add(t); return t; };
  s.every = (fn, ms) => { const t = setInterval(() => { if (s.alive) fn(); }, ms); s.timers.add(t); return t; };
  s.wait = ms => new Promise(r => s.later(r, ms));
  s.onFrame = fn => {
    let last = performance.now();
    const loop = now => { if (!s.alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; fn(dt, now); s.raf = requestAnimationFrame(loop); };
    s.raf = requestAnimationFrame(loop);
  };
  s.on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); s.cleanups.push(() => t.removeEventListener(ev, fn, opt)); };
  s.dispose = () => {
    s.alive = false; s.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); cancelAnimationFrame(s.raf);
    s.cleanups.forEach(f => f()); try { speechSynthesis.cancel(); } catch (e) {}
  };
  return s;
}

/* ===== מסך "כל הכבוד" ===== */
function celebrate({ emoji = '🏆', title = 'כל הכבוד!', stars = 3, again, color = '#ffd23f' } = {}) {
  const o = el('div', 'celebrate');
  o.style.setProperty('--c', color);
  o.innerHTML = `<div class="ce">${emoji}</div><h2>${title}</h2>
    <div class="cstars">${Array.from({ length: stars }, (_, i) => `<span style="--i:${i}">⭐</span>`).join('')}</div>
    <div class="cbtns"><button class="again" aria-label="עוד פעם">🔁</button><button class="tohome" aria-label="לתפריט">🏠</button></div>`;
  document.body.appendChild(o);
  Sound.tada(); Voice.say(title);
  FX.confetti(innerWidth / 2, innerHeight * .35, 90);
  setTimeout(() => FX.confetti(innerWidth * .2, innerHeight * .3, 40), 400);
  setTimeout(() => FX.confetti(innerWidth * .8, innerHeight * .3, 40), 700);
  setTimeout(() => { const c = center($('.cstars', o)); Stars.add(c.x, c.y, stars); }, 900);
  const close = () => o.remove();
  $('.again', o).onclick = () => { Sound.tap(); close(); again && again(); };
  $('.tohome', o).onclick = () => { Sound.tap(); close(); App.menu(); };
  App.overlay = o;
}

/* ===== רישום משחקים ===== */
const GAMES = [];
function registerGame(g) { GAMES.push(g); }
