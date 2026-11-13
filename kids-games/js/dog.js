'use strict';
/* 🐶 הכלב שלי – מאכילים, מלטפים וזורקים כדור */
const DOG_YUM = ['יאמי!', 'הב הב! טעים!', 'אממ, טעים!', 'עוד!'];
const DOG_YUCK = ['איכס! אני לא אוהב את זה', 'פו! לא רוצה'];
registerGame({
  lines: [...DOG_YUM, ...DOG_YUCK, 'הכלב שבע! תודה!', 'הוא רוצה לשחק! תזרקי לו את הכדור', 'הב הב! הבאתי את הכדור!', 'הכלב שוב רעב!', 'הכלב מאושר!'],
  id: 'dog', name: 'הכלב שלי', emoji: '🐶', color: '#f4a259', say: 'הכלב שלי רעב! בואי נביא לו אוכל',
  mount(root, s) {
    const FOODS = [['🦴', 1, 'עצם'], ['🍖', 1, 'בשר'], ['🥩', 1, 'סטייק'], ['🍗', 1, 'עוף'], ['🥕', 1, 'גזר'], ['🍎', 1, 'תפוח'], ['🧀', 1, 'גבינה'], ['🥦', 0, 'ברוקולי'], ['🍋', 0, 'לימון']];
    const FULL = 5;
    const B = '#e8b77a', L = '#fff1dc', E = '#a8683a';
    const dogSVG = `<svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg">
      <g class="tail"><path d="M200,256 Q250,240 254,186" stroke="${B}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="254" cy="184" r="11" fill="${L}"/></g>
      <ellipse cx="150" cy="248" rx="74" ry="70" fill="${B}"/>
      <ellipse cx="150" cy="236" rx="40" ry="48" fill="${L}"/>
      <ellipse cx="94" cy="300" rx="30" ry="20" fill="${B}"/><ellipse cx="206" cy="300" rx="30" ry="20" fill="${B}"/>
      <rect x="116" y="262" width="26" height="56" rx="13" fill="${B}"/><rect x="158" y="262" width="26" height="56" rx="13" fill="${B}"/>
      <ellipse cx="129" cy="316" rx="18" ry="10" fill="${L}"/><ellipse cx="171" cy="316" rx="18" ry="10" fill="${L}"/>
      <g class="head">
        <path d="M100,192 Q150,206 200,192" stroke="#ff4d6d" stroke-width="12" fill="none" stroke-linecap="round"/>
        <circle cx="150" cy="206" r="10" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>
        <ellipse cx="150" cy="128" rx="76" ry="68" fill="${B}"/>
        <g class="ears"><path d="M86,82 Q44,92 54,176 Q76,184 96,126 Z" fill="${E}"/><path d="M214,82 Q256,92 246,176 Q224,184 204,126 Z" fill="${E}"/></g>
        <ellipse cx="178" cy="114" rx="24" ry="22" fill="#d39a5c"/>
        <g class="eo"><circle cx="122" cy="116" r="12" fill="#2b2133"/><circle cx="126" cy="111" r="4.5" fill="#fff"/><circle cx="178" cy="116" r="12" fill="#2b2133"/><circle cx="182" cy="111" r="4.5" fill="#fff"/></g>
        <g class="eh" stroke="#2b2133" stroke-width="6" fill="none" stroke-linecap="round"><path d="M108,120 Q122,104 136,120"/><path d="M164,120 Q178,104 192,120"/></g>
        <path d="M108,96 Q120,90 132,95 M168,95 Q180,90 192,96" stroke="${E}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="150" cy="160" rx="38" ry="28" fill="${L}"/>
        <ellipse cx="150" cy="146" rx="15" ry="10" fill="#3b2a2a"/><ellipse cx="145" cy="143" rx="5" ry="3" fill="#fff" opacity=".6"/>
        <g class="mc"><path d="M134,164 Q142,174 150,164 Q158,174 166,164" stroke="#3b2a2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M146,170 Q150,186 156,170 Z" fill="#ff7aa8"/></g>
        <g class="mo"><ellipse cx="150" cy="174" rx="20" ry="17" fill="#5a1e2a"/><ellipse cx="150" cy="183" rx="12" ry="7" fill="#ff7aa8"/></g>
        <ellipse cx="100" cy="152" rx="12" ry="7" fill="#ff8fab" opacity=".45"/><ellipse cx="200" cy="152" rx="12" ry="7" fill="#ff8fab" opacity=".45"/>
      </g></svg>`;

    root.innerHTML = `<div class="dg"><div class="dg-top">${'<i>🦴</i>'.repeat(FULL)}</div>
      <div class="dg-stage"><div class="dog">${dogSVG}</div></div><div class="dg-food"></div></div>`;
    const dog = $('.dog', root), stageEl = $('.dg-stage', root), foodRow = $('.dg-food', root), meter = $$('.dg-top i', root);
    let full = 0, busy = false, mode = 'eat';

    const head = () => $('.head', dog);
    const setFull = n => { full = n; meter.forEach((m, i) => m.classList.toggle('on', i < n)); };

    function give(f, fromEl) {
      if (busy || mode !== 'eat') return false;
      busy = true;
      const [emo, likes, name] = f;
      // האוכל עף לפה
      const a = center(fromEl), m = center(head());
      const fly = el('span', 'ballfly', emo); fly.style.transition = 'all .6s cubic-bezier(.3,.2,.6,1)'; fly.style.left = (a.x - 30) + 'px'; fly.style.top = (a.y - 30) + 'px'; fly.style.position = 'fixed';
      document.body.appendChild(fly);
      requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.left = (m.x - 30) + 'px'; fly.style.top = (m.y + 10) + 'px'; fly.style.transform = 'scale(.6)'; }));
      dog.classList.add('open');
      s.later(() => {
        fly.remove();
        if (likes) {
          Sound.munch(); dog.classList.remove('open');
          s.later(() => { dog.classList.add('open'); Sound.munch(); }, 250);
          s.later(() => {
            dog.classList.remove('open'); dog.classList.add('happy', 'wag');
            setFull(full + 1); Sound.ding(full * 2);
            const c = center(head()); FX.burst(c.x, c.y, ['💖', '✨'], 7, 30);
            Voice.say(pick(DOG_YUM));
            s.later(() => { dog.classList.remove('happy', 'wag'); busy = false; if (full >= FULL) fullDog(); }, 550);
          }, 450);
        } else {
          dog.classList.remove('open'); dog.classList.add('yuck'); Sound.wrong();
          const c = center(head()); FX.text(c.x, c.y - 80, 'איכס! 😝', '#2ec27e');
          Voice.say(pick(DOG_YUCK));
          s.later(() => { dog.classList.remove('yuck'); busy = false; }, 900);
        }
      }, 650);
      return true;
    }

    FOODS.forEach(f => {
      const b = el('div', 'food', f[0]); foodRow.appendChild(b);
      draggable(b, {
        onTap: () => give(f, b),
        onDrop: (x, y) => { if (!hit(dog, x, y, 10)) return false; b.style.transition = 'none'; b.style.transform = ''; give(f, b); return true; }
      });
    });

    // ליטוף
    dog.addEventListener('pointerdown', () => {
      if (busy || mode === 'fetch') return;
      Sound.init(); Sound.bark(); dog.classList.add('happy', 'wag');
      const c = center(head()); FX.burst(c.x, c.y - 30, ['💖', '💕'], 6, 30);
      s.later(() => dog.classList.remove('happy', 'wag'), 800);
    });

    function fullDog() {
      mode = 'full'; busy = true;
      Voice.say('הכלב שבע! תודה!'); Sound.chime();
      dog.classList.add('happy', 'wag', 'jump');
      const c = center(dog); FX.confetti(c.x, c.y, 40); Stars.add(c.x, c.y, 1);
      s.later(() => { Sound.burp(); FX.text(c.x, c.y - 120, 'בורפ! 😅', '#9b5de5'); }, 1500);
      s.later(() => {
        dog.classList.remove('jump', 'happy', 'wag');
        mode = 'fetch'; busy = false;
        const ball = el('button', 'ballbtn', '🎾'); stageEl.appendChild(ball);
        Voice.say('הוא רוצה לשחק! תזרקי לו את הכדור');
        ball.onclick = () => throwBall(ball);
      }, 2800);
    }

    function throwBall(ball) {
      if (busy) return; busy = true;
      Sound.whoosh();
      ball.style.animation = 'none'; ball.style.transition = 'all .9s cubic-bezier(.3,.2,.6,1)';
      requestAnimationFrame(() => { ball.style.transform = 'translate(-120vw,-30vh) rotate(-720deg)'; });
      s.later(() => { dog.style.transition = 'transform .9s cubic-bezier(.5,0,.5,1)'; dog.style.transform = 'translateX(-120vw)'; Sound.bark(); }, 300);
      s.later(() => {
        ball.remove();
        dog.style.transition = 'none'; dog.style.transform = 'translateX(120vw)';
        const mb = el('span', 'mouthball', '🎾'); head(); dog.appendChild(mb);
        mb.style.position = 'absolute';
        requestAnimationFrame(() => requestAnimationFrame(() => { dog.style.transition = 'transform 1s cubic-bezier(.3,1.2,.5,1)'; dog.style.transform = ''; }));
      }, 1400);
      s.later(() => {
        Sound.bark(); dog.classList.add('happy', 'wag');
        const c = center(dog); FX.burst(c.x, c.y, ['💖', '⭐', '🎾'], 12, 36);
        Voice.say('הב הב! הבאתי את הכדור!');
      }, 2500);
      s.later(() => celebrate({ emoji: '🐶', title: 'הכלב מאושר!', stars: 2, again: () => {
        $$('.mouthball', dog).forEach(e => e.remove()); dog.style.transform = ''; dog.classList.remove('happy', 'wag');
        setFull(0); mode = 'eat'; busy = false; Voice.say('הכלב שוב רעב!');
      } }), 3900);
    }
  }
});
