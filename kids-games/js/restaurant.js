'use strict';
/* 🍔 המסעדה – חיה מזמינה, מרכיבים את המנה בדיוק כמו בבועה */
const REST_ORDER = ['שלום! אני רעב. אפשר בבקשה את מה שבבועה?', 'היי! הנה ההזמנה שלי', 'אפשר בבקשה המבורגר? תסתכלי בבועה', 'אני כל כך רעב! מה יש לאכול?'];
const REST_WRONG = ['לא הזמנתי את זה', 'אופס, תסתכלי בבועה'];
const REST_THANKS = ['יאמי! תודה!', 'טעים מאוד! תודה רבה!', 'וואו, איזה טעים!', 'תודה! את השפית הכי טובה!'];
registerGame({
  lines: [...REST_ORDER, ...REST_WRONG, ...REST_THANKS, 'כל הכבוד, שפית!'],
  id: 'restaurant', name: 'המסעדה', emoji: '🍔', color: '#ff8a5b', say: 'המסעדה! בואי נכין לחיות אוכל',
  mount(root, s) {
    const ANIMALS = ['🐻', '🐰', '🐼', '🦊', '🐸', '🐷', '🐨', '🐯', '🐵', '🐮', '🦁', '🐱', '🐹', '🐧'];
    const NAMES = { cheese: 'גבינה', lettuce: 'חסה', tomato: 'עגבנייה' };
    const DRINKS = { drink_o: ['#ffa62b', 'מיץ תפוזים'], drink_p: ['#ff6fae', 'מיץ תות'], drink_b: ['#4cc9f0', 'מיץ כחול'] };
    const PER_ROUND = 5;

    root.innerHTML = `<div class="rs">
      <div class="rs-street">
        <div class="rs-sign">🍔 המסעדה שלי</div>
        <div class="rs-count">${'<i>😋</i>'.repeat(PER_ROUND)}</div>
        <div class="rs-cust left"><div class="rs-bubble hide"></div><div class="rs-animal"></div></div>
      </div>
      <div class="rs-counter"><div class="rs-plate"></div></div>
      <div class="rs-trays"></div>
    </div>`;
    const cust = $('.rs-cust', root), animal = $('.rs-animal', root), bubble = $('.rs-bubble', root);
    const plate = $('.rs-plate', root), trays = $('.rs-trays', root);

    const layer = (t, drop) => `<div class="L L-${t}${drop ? ' drop' : ''}"></div>`;
    const burger = (ls, dropLast) => `<div class="burger">${ls.map((t, i) => layer(t, dropLast && i === ls.length - 1)).join('')}</div>`;
    const drink = k => `<div class="side drinkwrap"><div class="drink" style="--d:${DRINKS[k][0]}"></div></div>`;
    const fries = () => `<div class="side"><span class="fries">🍟</span></div>`;

    // מגשי מרכיבים
    const ITEMS = [
      ['patty', burger(['patty'])], ['cheese', burger(['cheese'])], ['lettuce', burger(['lettuce'])], ['tomato', burger(['tomato'])],
      ['fries', '<span class="fries">🍟</span>'], ['drink_o', drink('drink_o')], ['drink_p', drink('drink_p')], ['drink_b', drink('drink_b')]
    ];
    ITEMS.forEach(([k, html]) => {
      const b = el('button', 'tray', html); b.dataset.k = k;
      b.onclick = () => add(k, b);
      trays.appendChild(b);
    });

    let served = 0, order = null, built = new Set(), busy = true, lastAdded = null;

    function newOrder() {
      const extras = shuffle(['cheese', 'lettuce', 'tomato']).slice(0, randi(0, Math.min(3, served + 1)));
      const mid = shuffle(['patty', ...extras]);
      return {
        mid,
        fries: served > 0 && Math.random() < .5,
        drink: served > 1 || Math.random() < .5 ? pick(Object.keys(DRINKS)) : null
      };
    }
    const needed = () => [...order.mid, ...(order.fries ? ['fries'] : []), ...(order.drink ? [order.drink] : [])];
    const complete = () => needed().every(k => built.has(k));

    function renderPlate(drop) {
      const ls = ['bb', ...order.mid.filter(k => built.has(k))];
      if (complete()) ls.push('bt');
      plate.innerHTML = burger(ls, drop === 'burger') +
        (order.fries && built.has('fries') ? fries() : '') +
        (order.drink && built.has(order.drink) ? drink(order.drink) : '');
      if (drop && drop !== 'burger') { const last = plate.lastElementChild; if (last) last.classList.add('bounce'); }
    }

    function sayOrder() { Voice.say(pick(REST_ORDER)); }

    function nextCustomer() {
      order = newOrder(); built = new Set(); busy = true;
      plate.classList.remove('serve'); plate.style.transition = 'none'; renderPlate();
      plate.style.opacity = 0; requestAnimationFrame(() => { plate.style.transition = ''; plate.style.opacity = 1; });
      animal.textContent = pick(ANIMALS);
      bubble.classList.add('hide');
      cust.style.transition = 'none'; cust.className = 'rs-cust left walk'; void cust.offsetWidth; cust.style.transition = '';
      cust.classList.remove('left');
      s.later(() => {
        cust.classList.remove('walk');
        bubble.innerHTML = burger(['bb', ...order.mid, 'bt']) + (order.fries ? fries() : '') + (order.drink ? drink(order.drink) : '');
        bubble.classList.remove('hide'); bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
        Sound.boing(); sayOrder(); busy = false;
      }, 950);
    }

    function add(k, btn) {
      Sound.init();
      if (busy) return;
      if (built.has(k)) { Sound.tap(); return; }
      if (!needed().includes(k)) {
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        bubble.classList.remove('shake'); void bubble.offsetWidth; bubble.classList.add('shake');
        Sound.wrong();
        if (Math.random() < .5) Voice.say(pick(REST_WRONG));
        return;
      }
      built.add(k); lastAdded = k;
      const isLayer = order.mid.includes(k);
      // השכבה החדשה נוחתת – מסמנים רק אותה
      renderPlate(isLayer ? null : 'side');
      if (isLayer) {
        const idx = order.mid.filter(x => built.has(x)).indexOf(k) + 1;
        const L = $$('.burger .L', plate)[idx]; if (L) L.classList.add('drop');
      }
      Sound.ding(built.size * 2);
      const c = center(plate); FX.burst(c.x, c.y - 40, ['✨'], 5, 26);
      if (complete()) serve();
    }

    function serve() {
      busy = true;
      s.later(() => { const bt = $('.L-bt', plate); if (bt) bt.classList.add('drop'); Sound.chime(); }, 10);
      s.later(() => { Sound.whoosh(); plate.classList.add('serve'); }, 800);
      s.later(() => {
        bubble.innerHTML = `<span class="happy">😋💖</span>`;
        Voice.say(pick(REST_THANKS));
        const c = center(animal); FX.burst(c.x, c.y, ['💖', '🪙', '⭐'], 12, 38);
        Stars.add(c.x, c.y, 1);
        served++;
        const dots = $$('.rs-count i', root); const d = dots[(served - 1) % PER_ROUND]; if (d) d.classList.add('on');
      }, 1500);
      s.later(() => { bubble.classList.add('hide'); cust.classList.add('walk', 'away'); }, 3100);
      s.later(() => {
        if (served % PER_ROUND === 0) {
          celebrate({ emoji: '👩‍🍳', title: 'כל הכבוד, שפית!', again: () => { $$('.rs-count i', root).forEach(i => i.classList.remove('on')); nextCustomer(); } });
        } else nextCustomer();
      }, 3900);
    }

    order = newOrder(); renderPlate(); s.later(nextCustomer, 400);
  }
});
