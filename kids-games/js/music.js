'use strict';
/* 🎹 מוזיקה – פסנתר עם חיות, תופים, ושירים שמנגנים לפי הקליד שמנצנץ */
const MUSIC = (() => {
  // שירי עם ישנים (נחלת הכלל) – רק המנגינה
  const SONGS = [
    { n: 'יונתן הקטן', e: '🌳', notes: [4, 2, 2, 3, 1, 1, 0, 1, 2, 3, 4, 4, 4, 4, 2, 2, 3, 1, 1, 0, 2, 4, 4, 0] },
    { n: 'כוכב קטן', e: '⭐', notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1, 0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0] }
  ];
  const lines = () => ['פסנתר!', 'תופים!', 'שירים!', 'לחצי על הקליד שמנצנץ', 'איזה יופי ניגנת!', 'את מוזיקאית אמיתית!', 'בחרי שיר',
    ...SONGS.map(s => `בואי ננגן את ${s.n}!`), 'כמעט! הקליד שמנצנץ', 'חצי שיר! ממשיכים'];
  return { SONGS, lines };
})();

registerGame({
  id: 'music', name: 'מוזיקה', emoji: '🎹', color: '#f15bb5', say: 'מוזיקה! בואי ננגן',
  lines: MUSIC.lines,
  mount(root, s) {
    const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    const KEYS = [['#ff4d4d', '🐶'], ['#ff9f1c', '🐱'], ['#ffd60a', '🐥'], ['#2ec27e', '🐸'], ['#4cc9f0', '🐳'], ['#3a86ff', '🐘'], ['#9b5de5', '🦄'], ['#ff70a6', '🐷']];
    let mode = 'piano', song = null, pos = 0, played = 0;

    root.innerHTML = `<div class="mu"><div class="mu-tabs">
        <button data-m="piano" class="on">🎹</button><button data-m="drums">🥁</button><button data-m="songs">🎵</button></div>
      <div class="mu-stage"></div><div class="mu-notes"></div></div>`;
    const stage = $('.mu-stage', root), notesEl = $('.mu-notes', root);

    function note(i, len = .55) {
      if (!Sound.ok()) return;
      const f = NOTES[i];
      Sound.tone(f, len, { type: 'triangle', vol: .28, attack: .005 });
      Sound.tone(f * 2, len * .6, { type: 'sine', vol: .06 });
    }
    function floatNote(x, y, c) {
      const n = el('span', 'mu-fly', pick(['♪', '♫', '♬'])); n.style.left = x + 'px'; n.style.top = y + 'px'; n.style.color = c;
      FX.layer.appendChild(n); setTimeout(() => n.remove(), 1400);
    }

    function piano() {
      stage.innerHTML = `<div class="mu-piano">${KEYS.map(([c, e], i) => `<button class="key" data-i="${i}" style="--c:${c}"><span class="ke">${e}</span></button>`).join('')}</div>`;
      $$('.key', stage).forEach(k => k.addEventListener('pointerdown', ev => {
        ev.preventDefault(); Sound.init(); const i = +k.dataset.i;
        note(i); k.classList.remove('hit'); void k.offsetWidth; k.classList.add('hit');
        floatNote(ev.clientX, ev.clientY - 30, KEYS[i][0]);
        if (song) songTap(i, k, ev);
        else if (++played % 12 === 0) praise(ev.clientX, ev.clientY - 80);
      }));
    }

    function drums() {
      const PADS = [['🥁', '#ff4d4d', () => { Sound.tone(110, .35, { to: 50, vol: .6 }); Sound.noise(.05, { freq: 200, vol: .2 }); }],
        ['🪘', '#ff9f1c', () => { Sound.tone(220, .25, { to: 140, vol: .45 }); }],
        ['👏', '#ffd60a', () => { Sound.noise(.12, { freq: 1500, q: .8, vol: .5 }); Sound.noise(.08, { freq: 2500, vol: .3, at: .02 }); }],
        ['🔔', '#2ec27e', () => { Sound.tone(1320, .9, { type: 'sine', vol: .18 }); Sound.tone(1980, .6, { vol: .06 }); }],
        ['🎺', '#3a86ff', () => { Sound.tone(392, .35, { type: 'sawtooth', vol: .09 }); Sound.tone(523, .35, { type: 'sawtooth', vol: .07, at: .18 }); }],
        ['💥', '#9b5de5', () => { Sound.noise(.6, { freq: 6000, type: 'highpass', vol: .3 }); }]];
      stage.innerHTML = `<div class="mu-drums">${PADS.map(([e, c], i) => `<button class="pad" data-i="${i}" style="--c:${c}">${e}</button>`).join('')}</div>`;
      $$('.pad', stage).forEach(p => p.addEventListener('pointerdown', ev => {
        ev.preventDefault(); Sound.init(); PADS[+p.dataset.i][2]();
        p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit');
        FX.burst(ev.clientX, ev.clientY, ['✨', '💥', '⭐'], 5, 24);
        if (++played % 16 === 0) praise(ev.clientX, ev.clientY - 80);
      }));
    }

    function songs() {
      stage.innerHTML = `<div class="opts mu-songs">${MUSIC.SONGS.map((sg, i) => `<button class="opt" data-i="${i}" style="--c:#f15bb5;--i:${i}"><span class="oe">${sg.e}</span>${sg.n}</button>`).join('')}</div>`;
      $$('.opt', stage).forEach(b => b.onclick = () => { Sound.pop(); startSong(MUSIC.SONGS[+b.dataset.i]); });
      Voice.say('בחרי שיר');
    }
    function startSong(sg) {
      song = sg; pos = 0; piano(); mark();
      Voice.say([`בואי ננגן את ${sg.n}!`, 'לחצי על הקליד שמנצנץ']);
      notesEl.innerHTML = sg.notes.map(() => '<i></i>').join('');
    }
    function mark() {
      $$('.key', stage).forEach((k, i) => k.classList.toggle('next', song && i === song.notes[pos]));
      $$('i', notesEl).forEach((d, i) => d.classList.toggle('on', i < pos));
    }
    let wrongs = 0;
    function songTap(i, k, ev) {
      if (i !== song.notes[pos]) { if (++wrongs % 4 === 0) Voice.say('כמעט! הקליד שמנצנץ'); return; }
      pos++; mark();
      if (pos === Math.floor(song.notes.length / 2)) Voice.say('חצי שיר! ממשיכים');
      if (pos >= song.notes.length) {
        const c = center(stage); FX.confetti(c.x, c.y, 60); Sound.tada();
        const sg = song; song = null; mark(); notesEl.innerHTML = '';
        s.later(() => celebrate({ emoji: '🎶', title: pick(['איזה יופי ניגנת!', 'את מוזיקאית אמיתית!']), stars: 2, again: () => startSong(sg) }), 900);
      }
    }

    $$('.mu-tabs button', root).forEach(b => b.onclick = () => {
      Sound.tap(); mode = b.dataset.m; song = null; notesEl.innerHTML = '';
      $$('.mu-tabs button', root).forEach(x => x.classList.toggle('on', x === b));
      if (mode === 'piano') { piano(); Voice.say('פסנתר!'); } else if (mode === 'drums') { drums(); Voice.say('תופים!'); } else { songs(); }
    });
    piano();
  }
});
