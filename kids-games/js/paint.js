'use strict';
/* 🎨 ציור חופשי – מכחול, קשת, מדבקות, מחק, ביטול ושמירה */
registerGame({
  id: 'paint', name: 'ציור', emoji: '🎨', color: '#2ec4b6', say: 'ציור! ציירי מה שבא לך',
  lines: ['איזה ציור יפה!', 'קשת!', 'מדבקות!', 'דף חדש'],
  mount(root, s) {
    const STICKERS = ['⭐', '💖', '🌸', '🦋', '🐶', '🐱', '🌈', '☀️', '🍓', '🎈', '🦄', '🐠'];
    const SIZES = [8, 18, 34];
    root.innerHTML = `<div class="pt"><div class="pt-stage"><canvas></canvas></div>
      <div class="cp-bar">
        <div class="cp-pal">${PALETTE.map(([n, c], i) => `<button class="sw" data-i="${i}" style="--c:${c}" aria-label="${n}"></button>`).join('')}
          <button class="sw rbw" aria-label="קשת"></button></div>
        <div class="pt-stk">${STICKERS.map(e => `<button class="stk">${e}</button>`).join('')}</div>
        <div class="cp-tools">
          ${SIZES.map((z, i) => `<button class="tool size" data-i="${i}" aria-label="עובי"><i style="width:${8 + i * 8}px;height:${8 + i * 8}px"></i></button>`).join('')}
          <button class="tool stick" aria-label="מדבקות">⭐</button><button class="tool erase" aria-label="מחק">🧽</button>
          <button class="tool undo" aria-label="בטל">↩️</button><button class="tool trash" aria-label="דף חדש">🗑️</button><button class="tool save" aria-label="שמור">💾</button>
        </div></div></div>`;
    const stage = $('.pt-stage', root), cv = $('canvas', root), ctx = cv.getContext('2d'), pt = $('.pt', root);
    let W = 0, H = 0, DPR = 1, tool = 'pen', color = PALETTE[0][1], size = 1, sticker = '⭐', hue = 0, last = null, id = null, hist = [];

    function resize() {
      const old = W ? cv.toDataURL() : null;
      const r = stage.getBoundingClientRect(); W = Math.floor(r.width); H = Math.floor(r.height);
      DPR = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      if (old) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, W, H); im.src = old; }
    }
    resize(); s.on(window, 'resize', resize);

    const sws = $$('.sw', root), sizes = $$('.size', root);
    function setTool(t) {
      tool = t;
      sws.forEach(b => b.classList.toggle('on', (t === 'pen' && b.dataset.i == PALETTE.findIndex(p => p[1] === color)) || (t === 'rainbow' && b.classList.contains('rbw'))));
      $('.erase', root).classList.toggle('on', t === 'erase');
      $('.stick', root).classList.toggle('on', t === 'sticker');
      pt.classList.toggle('stickers', t === 'sticker');
    }
    sws.forEach(b => b.onclick = () => {
      Sound.tap();
      if (b.classList.contains('rbw')) { setTool('rainbow'); Voice.say('קשת!'); return; }
      color = PALETTE[+b.dataset.i][1]; setTool('pen'); Voice.say(PALETTE[+b.dataset.i][0]);
    });
    sizes.forEach(b => b.onclick = () => { Sound.tap(); size = +b.dataset.i; sizes.forEach(x => x.classList.toggle('on', x === b)); if (tool === 'erase' || tool === 'sticker') setTool('pen'); });
    sizes[1].classList.add('on');
    $('.erase', root).onclick = () => { Sound.tap(); setTool('erase'); };
    $('.stick', root).onclick = () => { Sound.tap(); setTool(tool === 'sticker' ? 'pen' : 'sticker'); if (tool === 'sticker') Voice.say('מדבקות!'); };
    $$('.stk', root).forEach(b => b.onclick = () => { Sound.pop(); sticker = b.textContent; $$('.stk', root).forEach(x => x.classList.toggle('on', x === b)); });
    $$('.stk', root)[0].classList.add('on');
    setTool('pen');

    const snap = () => { try { hist.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (hist.length > 15) hist.shift(); } catch (e) {} };
    $('.undo', root).onclick = () => { Sound.tap(); const im = hist.pop(); if (im) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(im, 0, 0); ctx.restore(); } };
    $('.trash', root).onclick = () => { Sound.whoosh(); snap(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); Voice.say('דף חדש'); };
    $('.save', root).onclick = () => {
      Sound.coin(); Voice.say('איזה ציור יפה!');
      const c = center(stage); FX.burst(c.x, c.y, ['⭐', '💖', '✨'], 10, 34);
      if (!s.starGiven) { s.starGiven = true; Stars.add(c.x, c.y, 1); }
      const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; out.getContext('2d').drawImage(cv, 0, 0);
      downloadCanvas(out, 'הציור שלי');
    };

    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function line(a, b) {
      const w = SIZES[size] * (tool === 'erase' ? 1.8 : 1);
      ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = w;
      if (tool === 'rainbow') { hue = (hue + 5) % 360; ctx.strokeStyle = `hsl(${hue} 90% 58%)`; }
      else ctx.strokeStyle = tool === 'erase' ? '#fff' : color;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    cv.addEventListener('pointerdown', e => {
      if (id !== null) return;
      Sound.init(); snap();
      const p = pos(e);
      if (tool === 'sticker') {
        const z = 34 + size * 22;
        ctx.font = `${z}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sticker, p[0], p[1]);
        Sound.pop(); FX.burst(e.clientX, e.clientY, ['✨'], 5, 22); return;
      }
      id = e.pointerId; try { cv.setPointerCapture(id); } catch (_) {}
      last = p; line(p, [p[0] + .1, p[1]]);
    });
    cv.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const p = pos(e); line(last, p); last = p;
      if (Math.random() < .08) Sound.tone(400 + Math.random() * 600, .05, { type: 'triangle', vol: .04 });
    });
    const up = e => { if (e.pointerId === id) id = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
});
