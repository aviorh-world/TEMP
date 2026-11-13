'use strict';
const App = {
  scope: null, overlay: null, cur: null,
  show(id) { $$('.screen').forEach(s => s.classList.toggle('on', s.id === id)); },
  menu() {
    this.stop();
    this.show('menu');
    const t = $('#tiles'); t.innerHTML = '';
    GAMES.forEach((g, i) => {
      const b = el('button', 'tile', `<span class="te">${g.emoji}</span><span class="tn">${g.name}</span>`);
      b.style.setProperty('--c', g.color); b.style.setProperty('--i', i);
      b.onclick = () => { Sound.init(); Sound.pop(); this.open(g); };
      t.appendChild(b);
    });
    Stars.render();
  },
  open(g) {
    this.stop();
    this.cur = g;
    $('#game').style.setProperty('--gc', g.color);
    $('#gtitle').textContent = g.emoji + ' ' + g.name;
    this.show('game'); Stars.render();
    const root = $('#groot'); root.innerHTML = '';
    this.scope = makeScope();
    Voice.say(g.say || g.name);
    g.mount(root, this.scope);
  },
  stop() {
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    if (this.scope) { this.scope.dispose(); this.scope = null; }
    if (this.cur && this.cur.unmount) this.cur.unmount();
    this.cur = null;
    $('#groot').innerHTML = '';
  },
  restart() { if (this.cur) this.open(this.cur); }
};

(function boot() {
  FX.init();
  // כותרת עם אותיות קופצות
  const word = 'המשחקים שלי', cs = ['#ff4d8d', '#ff8c1a', '#ffc300', '#2ec27e', '#3a86ff', '#9b5de5'];
  $('#title').innerHTML = [...word].map((ch, i) => ch === ' ' ? '<span class="sp"> </span>' : `<span style="--i:${i};--c:${cs[i % cs.length]}">${ch}</span>`).join('');

  $('#go').onclick = () => {
    Sound.init(); Sound.tada(); Voice.say('בואי נשחק!');
    FX.confetti(innerWidth / 2, innerHeight / 2, 70);
    $('#splash').classList.add('out');
    setTimeout(() => App.menu(), 550);
  };
  $('#home').onclick = () => { Sound.tap(); App.menu(); };
  const snd = $('#snd');
  const paint = () => snd.textContent = Sound.on ? '🔊' : '🔇';
  paint();
  snd.onclick = () => { Sound.on = !Sound.on; Store.set('sound', Sound.on); paint(); Sound.init(); Sound.tap(); };
  // מעבר לטלוויזיה רק אחרי תרגיל חשבון להורים
  $('#tv').onclick = () => { Sound.init(); Sound.tap(); parentGate(() => { location.href = '../kids-tv/'; }); };
  $('#fs').onclick = () => {
    const d = document, de = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (de.requestFullscreen || de.webkitRequestFullscreen).call(de);
    } catch (e) {}
  };
  // מונע זום בלחיצה כפולה ו"משיכה" של הדף בטאבלט
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());
  Stars.render();
})();

/* ===== שער הורים: תרגיל כפל שילדה בת 4 לא תפתור ===== */
function parentGate(onPass) {
  let a, b, typed = '';
  const o = el('div', 'gate');
  o.innerHTML = `<div class="gate-box"><button class="gate-x" aria-label="סגור">✕</button>
    <h3>🔒 להורים בלבד</h3><p>כמה זה?</p><div class="gate-q"></div><div class="gate-a"></div>
    <div class="gate-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="del">⌫</button><button data-k="0">0</button><button data-k="ok" class="ok">✓</button></div></div>`;
  document.body.appendChild(o);
  const q = $('.gate-q', o), ans = $('.gate-a', o), box = $('.gate-box', o);
  const fresh = () => { a = randi(6, 12); b = randi(6, 9); typed = ''; q.textContent = `${a} × ${b} = ?`; ans.textContent = ''; };
  const close = () => { o.remove(); document.removeEventListener('keydown', key); };
  const press = k => {
    if (k === 'del') typed = typed.slice(0, -1);
    else if (k === 'ok') {
      if (typed && +typed === a * b) { close(); onPass(); return; }
      Sound.wrong(); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); fresh(); return;
    } else if (typed.length < 3) typed += k;
    ans.textContent = typed;
  };
  const key = e => {
    if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok'); else if (e.key === 'Escape') close();
  };
  $$('.gate-keys button', o).forEach(btn => btn.onclick = () => { Sound.tap(); press(btn.dataset.k); });
  $('.gate-x', o).onclick = close;
  o.addEventListener('pointerdown', e => { if (e.target === o) close(); });
  document.addEventListener('keydown', key);
  fresh();
}
