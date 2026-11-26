'use strict';
/* 🛒 החנות – לקוח מבקש כמה פריטים, היא סופרת לסל, ביפ בקופה והלקוח משלם */
const SHOP = (() => {
  // [אימוג׳י, צורות 1-5 עם התאמת מין ומספר]
  const ITEMS = [
    ['🍎', ['תפוח אחד', 'שני תפוחים', 'שלושה תפוחים', 'ארבעה תפוחים', 'חמישה תפוחים']],
    ['🍌', ['בננה אחת', 'שתי בננות', 'שלוש בננות', 'ארבע בננות', 'חמש בננות']],
    ['🥕', ['גזר אחד', 'שני גזרים', 'שלושה גזרים', 'ארבעה גזרים', 'חמישה גזרים']],
    ['🍐', ['אגס אחד', 'שני אגסים', 'שלושה אגסים', 'ארבעה אגסים', 'חמישה אגסים']],
    ['🥚', ['ביצה אחת', 'שתי ביצים', 'שלוש ביצים', 'ארבע ביצים', 'חמש ביצים']],
    ['🍋', ['לימון אחד', 'שני לימונים', 'שלושה לימונים', 'ארבעה לימונים', 'חמישה לימונים']]
  ];
  const NUMS = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
  const lines = () => ['החנות פתוחה!', 'אני רוצה', 'וגם', ...ITEMS.flatMap(i => i[1]), 'זה יותר מדי, תוציאי אחד', 'בדיוק!', 'ביפ!', 'תודה רבה! להתראות!', 'הלקוח הבא!', 'את מוכרת מצוינת!', 'גררי את הפריטים לסל', ...NUMS];
  return { ITEMS, NUMS, lines };
})();

registerGame({
  id: 'shop', name: 'החנות', emoji: '🛒', color: '#f9844a', say: 'החנות פתוחה!',
  lines: SHOP.lines,
  mount(root, s) {
    const { ITEMS, NUMS } = SHOP;
    const CUSTOMERS = ['🐻', '🐰', '🐼', '🦊', '🐸', '🐷', '🐨', '🐵'];
    const PER = 5;
    let served = 0, order = [], basket = {}, busy = true;
    root.innerHTML = `<div class="sp"><div class="sp-top"><div class="sp-cust"><span class="sp-an"></span><div class="sp-bubble"></div></div><div class="sp-coins">🪙 <b>0</b></div></div>
      <div class="sp-mid"><div class="sp-basket"><div class="sp-in"></div><span class="sp-bk">🧺</span></div><div class="sp-reg">🧾</div></div>
      <div class="sp-shelf">${ITEMS.map(([e], i) => `<div class="food sp-item" data-i="${i}">${e}</div>`).join('')}</div></div>`;
    const an = $('.sp-an', root), bubble = $('.sp-bubble', root), inEl = $('.sp-in', root), bk = $('.sp-basket', root), coinsEl = $('.sp-coins b', root);
    let coins = 0;

    const count = i => basket[i] || 0;
    function paintBasket() {
      inEl.innerHTML = Object.entries(basket).flatMap(([i, n]) => Array.from({ length: n }, () => `<span data-i="${i}">${ITEMS[i][0]}</span>`)).join('');
      $$('span', inEl).forEach(sp => sp.onclick = () => { Sound.tap(); const i = +sp.dataset.i; basket[i]--; if (!basket[i]) delete basket[i]; paintBasket(); paintOrder(); });
    }
    function paintOrder() {
      bubble.innerHTML = order.map(([i, n]) => `<span class="${count(i) === n ? 'ok' : ''}">${ITEMS[i][0].repeat(n)}<b>${count(i)}/${n}</b></span>`).join('');
    }
    function nextCustomer() {
      busy = true; basket = {}; paintBasket();
      const lv = Math.min(served, 4), types = lv >= 2 ? 2 : 1, max = Math.min(2 + lv, 5);
      order = shuffle(ITEMS.map((_, i) => i)).slice(0, types).map(i => [i, randi(1, max)]);
      an.textContent = pick(CUSTOMERS); an.parentNode.classList.remove('bye'); an.parentNode.classList.add('enter');
      paintOrder();
      const say = ['אני רוצה', ITEMS[order[0][0]][1][order[0][1] - 1]];
      if (order[1]) say.push('וגם', ITEMS[order[1][0]][1][order[1][1] - 1]);
      s.later(() => { Voice.say(served === 0 ? say.concat('גררי את הפריטים לסל') : say); busy = false; }, 700);
    }
    function add(i, from) {
      if (busy) return false;
      const want = (order.find(o => o[0] === i) || [])[1] || 0;
      if (count(i) >= want) {
        Sound.wrong(); bk.classList.remove('shake'); void bk.offsetWidth; bk.classList.add('shake');
        Voice.say('זה יותר מדי, תוציאי אחד'); return false;
      }
      basket[i] = count(i) + 1; paintBasket(); paintOrder();
      Sound.pop(); Voice.say(NUMS[count(i) - 1]);
      const c = center(bk); FX.burst(c.x, c.y - 30, ['✨'], 4, 22);
      if (order.every(([k, n]) => count(k) === n)) pay();
      return true;
    }
    function pay() {
      busy = true;
      s.later(() => { Sound.tone(1600, .12, { type: 'square', vol: .08 }); Voice.say(['בדיוק!', 'ביפ!']); $('.sp-reg', root).classList.add('beep'); }, 500);
      s.later(() => {
        $('.sp-reg', root).classList.remove('beep');
        const total = order.reduce((t, o) => t + o[1], 0), c = center($('.sp-reg', root));
        for (let k = 0; k < total; k++) s.later(() => { coins++; coinsEl.textContent = coins; Sound.coin(); FX.burst(c.x, c.y, ['🪙'], 2, 30); }, k * 160);
        Voice.say('תודה רבה! להתראות!');
      }, 1500);
      s.later(() => { an.parentNode.classList.remove('enter'); an.parentNode.classList.add('bye'); served++; const c = center(an); Stars.add(c.x, c.y, 1); }, 3300);
      s.later(() => {
        if (served % PER === 0) celebrate({ emoji: '🛒', title: 'את מוכרת מצוינת!', stars: 3, again: nextCustomer });
        else { Voice.say('הלקוח הבא!'); s.later(nextCustomer, 900); }
      }, 4300);
    }
    $$('.sp-item', root).forEach(it => draggable(it, {
      onTap: () => add(+it.dataset.i, it),
      onDrop: (x, y) => { if (!hit(bk, x, y, 40)) return false; it.style.transition = 'none'; it.style.transform = ''; add(+it.dataset.i, it); return true; }
    }));
    $('.sp', root)._dbg = () => ({ order, basket, busy, served });  // לבדיקות אוטומטיות
    Voice.say('החנות פתוחה!');
    s.later(nextCustomer, 1300);
  }
});
