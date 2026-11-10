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
