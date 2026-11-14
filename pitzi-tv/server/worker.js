/* =====================================================================
   פיצי TV – שרת AI קטן (Cloudflare Worker)
   מחזיק את המפתחות שלך, כך שהמשתמשים לא צריכים להזין כלום.

   הגדרות (Cloudflare → Workers → pitzi-ai → Settings → Variables and Secrets):
     ANTHROPIC_API_KEY   (Secret)  – מפתח Claude מ-console.anthropic.com
     YOUTUBE_API_KEY     (Secret)  – מפתח YouTube Data API v3 מ-Google Cloud
     ALLOWED_ORIGIN      (Text)    – https://aviorh-world.github.io   (ברירת מחדל)
     DAILY_PER_USER      (Text)    – כמה בקשות AI למשתמש ביום (ברירת מחדל 15)
     DAILY_TOTAL         (Text)    – תקרה לכל המשתמשים יחד ביום (ברירת מחדל 300)
   KV (לא חובה, אבל מומלץ – מגבלות + שמירת חיפושים):
     Bindings → KV namespace → Variable name: PZ

   הקוד קורא ל-Claude ולי-YouTube ב-fetch ישיר, כי Worker שמודבק בלוח הבקרה
   של Cloudflare הוא קובץ יחיד בלי התקנת חבילות.
   ===================================================================== */

const MODEL = 'claude-haiku-5-5';          // המודל הזול של Claude: ~$0.10 / $0.50 למיליון טוקנים
const SEARCH_CACHE_SEC = 3 * 24 * 3600;    // חיפוש ביוטיוב נשמר 3 ימים (חוסך מכסה)
const MAX_BODY = 1_500_000;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || 'https://aviorh-world.github.io').split(',').map(s => s.trim());
    const okOrigin = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const cors = {
      'access-control-allow-origin': okOrigin ? origin : allowed[0],
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
      'vary': 'origin',
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, app: 'pitzi-ai' });
    if (request.method !== 'POST' || url.pathname !== '/ai') return json({ error: 'not_found' }, 404);
    if (!okOrigin) return json({ error: 'forbidden', message: 'האתר הזה לא מורשה' }, 403);
    if (!env.ANTHROPIC_API_KEY || !env.YOUTUBE_API_KEY) return json({ error: 'config', message: 'השרת עוד לא הוגדר (חסרים מפתחות)' }, 500);

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: 'too_big', message: 'הבקשה גדולה מדי' }, 413);
    let body; try { body = JSON.parse(raw); } catch { return json({ error: 'bad_json' }, 400); }
    const text = String(body.request || '').trim().slice(0, 600);
    if (!text) return json({ error: 'empty', message: 'כתבו מה לבקש' }, 400);

    /* ---- מגבלות שימוש ---- */
    const device = String(body.device || '').replace(/[^\w-]/g, '').slice(0, 40) || 'anon';
    const ip = request.headers.get('cf-connecting-ip') || 'ip';
    const day = new Date().toISOString().slice(0, 10);
    const perUser = +env.DAILY_PER_USER || 15, total = +env.DAILY_TOTAL || 300;
    if (env.PZ) {
      const [u, i, t] = await Promise.all([env.PZ.get(`u:${day}:${device}`), env.PZ.get(`i:${day}:${ip}`), env.PZ.get(`t:${day}`)]);
      if (+t >= total) return json({ error: 'limit', message: 'ה־AI עמוס היום. נסו שוב מחר 🙏' }, 429);
      if (+u >= perUser || +i >= perUser * 3) return json({ error: 'limit', message: `הגעתם ל־${perUser} בקשות ל־AI היום. נתראה מחר 🙂` }, 429);
      const ttl = { expirationTtl: 2 * 86400 };
      ctx.waitUntil(Promise.all([env.PZ.put(`u:${day}:${device}`, String(+u + 1), ttl), env.PZ.put(`i:${day}:${ip}`, String(+i + 1), ttl), env.PZ.put(`t:${day}`, String(+t + 1), ttl)]));
    }

    try {
      return json(await handle(text, body, env, ctx));
    } catch (e) {
      return json({ error: 'failed', message: e.userMessage || 'משהו השתבש. נסו שוב בעוד רגע' }, 502);
    }
  },
};

/* =====================================================================
   הזרימה: תכנון → חיפוש ביוטיוב → סינון לפי פרופיל המשפחה
   ===================================================================== */
async function handle(text, body, env, ctx) {
  const p = body.profile || {};
  const family = `Child: ${String(p.name || 'a child').slice(0, 40)}, age ${+p.age || 4}. Family guidelines (written by the parent, may be in Hebrew): ${String(p.text || '').slice(0, 1500) || '(none given – use common sense for a young child; prefer Hebrew content)'}`;
  const tabs = (Array.isArray(body.tabs) ? body.tabs : []).slice(0, 60).map(t => `${String(t.e || '').slice(0, 8)} ${String(t.name || '').slice(0, 40)} (${+t.count || 0})`).join(', ') || '(none yet)';
  const minMin = Math.min(20, Math.max(0, +body.minMin || 0));
  const have = new Set(Array.isArray(body.have) ? body.have.slice(0, 20000) : []);

  const plan = await claude(env, {
    effort: 'low', maxTokens: 4000, schema: PLAN_SCHEMA,
    user: `${family}\nExisting tabs: ${tabs}\n\nParent request: """${text}"""\n\nDecide the action. For "add": write 1-2 YouTube search queries that will surface good candidates (use "channel" type when the parent names a show/channel and its official channel is the best source; write queries in the language the content should be in), choose the tab (existing name if it fits), and max_videos (what the parent asked for, default 12, max 40). For "remove": searches = []. For anything else use "other" and explain in reply what you can do (add or remove videos).`,
  });

  if (plan.action === 'other') return { action: 'other', reply: plan.reply };

  if (plan.action === 'remove') {
    const libList = (Array.isArray(body.library) ? body.library : []).slice(0, 5000)
      .map(r => Array.isArray(r) ? r.map(x => String(x ?? '').replace(/[\t\n]/g, ' ').slice(0, 120)) : null).filter(r => r && /^[\w-]{11}$/.test(r[0]));
    if (!libList.length) return { action: 'other', reply: 'אין עדיין סרטונים ברשימה.' };
    const r = await claude(env, {
      effort: 'medium', maxTokens: 16000, schema: REMOVE_SCHEMA,
      user: `${family}\nParent request: """${text}"""\nFrom the library below (id<TAB>title<TAB>channel<TAB>tab), list the ids that should be removed to satisfy the request. Only ids that clearly match.\n\n${libList.map(r => r.join('\t')).join('\n')}`,
    });
    const ids = new Set(libList.map(r => r[0]));
    return { action: 'remove', remove: r.remove.filter(id => ids.has(id)), note: r.note };
  }

  /* add */
  const max = Math.min(40, Math.max(1, plan.max_videos || 12));
  let cands = (await ytCandidates(env, ctx, plan.searches || []))
    .filter(c => !have.has(c.id) && c.sec >= minMin * 60 && c.sec <= 3 * 3600).slice(0, 120);
  if (!cands.length) return { action: 'add', tab_name: plan.tab_name, tab_emoji: plan.tab_emoji, picks: [], note: 'לא נמצאו סרטונים חדשים מתאימים. נסו לנסח אחרת.' };
  const r = await claude(env, {
    effort: 'medium', maxTokens: 12000, schema: PICK_SCHEMA,
    user: `${family}\nParent request: """${text}"""\nPick up to ${max} videos that best fit the request AND are clearly suitable. Prefer madeForKids=true and official channels; skip duplicates/re-uploads of the same episode, compilations of unknown origin, and anything doubtful.\n\nCandidates (JSON):\n${JSON.stringify(cands.map(c => ({ id: c.id, title: c.title, channel: c.channel, minutes: Math.round(c.sec / 60), madeForKids: c.kids, desc: c.desc })))}`,
  });
  const byId = Object.fromEntries(cands.map(c => [c.id, c]));
  const picks = r.selected.filter(s => byId[s.id]).slice(0, max).map(s => ({ id: s.id, t: (s.title || byId[s.id].title).slice(0, 120), ch: byId[s.id].channel, d: byId[s.id].sec }));
  return { action: 'add', tab_name: plan.tab_name, tab_emoji: plan.tab_emoji, picks, note: r.note };
}

/* =====================================================================
   Claude (Messages API, פלט JSON לפי סכמה)
   ===================================================================== */
const SYS = `You curate a closed, parent-approved video library for a young child's YouTube player app. The parent writes requests in Hebrew.
Be strict about suitability for the child's age and the family guidelines: no scary, violent, crude or adult content, no clickbait/pranks/"challenge" junk unless the parent explicitly asks, no misleading "kids" channels, prefer official channels and Hebrew when the family prefers it. Reply-to-parent text must be short, friendly Hebrew.`;

async function claude(env, { user, schema, effort = 'medium', maxTokens = 8000 }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL, max_tokens: maxTokens, system: SYS,
      messages: [{ role: 'user', content: user }],
      output_config: { effort, format: { type: 'json_schema', schema } },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('claude ' + r.status + ' ' + (j.error?.message || '')), { userMessage: r.status === 429 || r.status === 529 ? 'ה־AI עמוס כרגע, נסו שוב בעוד דקה' : 'שגיאה מה־AI, נסו שוב' });
  if (j.stop_reason === 'refusal') throw Object.assign(new Error('refusal'), { userMessage: 'ה־AI סירב לבקשה הזאת' });
  if (j.stop_reason === 'max_tokens') throw Object.assign(new Error('max_tokens'), { userMessage: 'הבקשה גדולה מדי, נסו בקשה קטנה יותר' });
  const txt = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  try { return JSON.parse(txt); } catch { throw Object.assign(new Error('bad json'), { userMessage: 'ה־AI החזיר תשובה לא תקינה, נסו שוב' }); }
}

const PLAN_SCHEMA = { type: 'object', additionalProperties: false, required: ['action', 'reply', 'tab_name', 'tab_emoji', 'searches', 'max_videos'], properties: {
  action: { type: 'string', enum: ['add', 'remove', 'other'] },
  reply: { type: 'string', description: 'Short Hebrew message to the parent' },
  tab_name: { type: 'string', description: 'Hebrew tab name for added videos; reuse an existing tab name when it fits' },
  tab_emoji: { type: 'string' },
  searches: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['query', 'type'], properties: { query: { type: 'string' }, type: { type: 'string', enum: ['videos', 'channel'] } } } },
  max_videos: { type: 'integer' } } };
const PICK_SCHEMA = { type: 'object', additionalProperties: false, required: ['selected', 'note'], properties: {
  selected: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'title'], properties: { id: { type: 'string' }, title: { type: 'string', description: 'Short clean title for a child-facing card, same language as the video, no hashtags/emoji spam' } } } },
  note: { type: 'string', description: 'Short Hebrew note to the parent: what was chosen and what was filtered out and why' } } };
const REMOVE_SCHEMA = { type: 'object', additionalProperties: false, required: ['remove', 'note'], properties: { remove: { type: 'array', items: { type: 'string' } }, note: { type: 'string' } } };

/* =====================================================================
   YouTube Data API – עם שמירת חיפושים ב-KV (חיפוש עולה 100 יחידות מתוך 10,000 ביום)
   ===================================================================== */
async function yt(env, path, params) {
  const u = new URL('https://www.googleapis.com/youtube/v3/' + path);
  for (const [k, v] of Object.entries({ ...params, key: env.YOUTUBE_API_KEY })) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { referer: 'https://aviorh-world.github.io/' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('youtube ' + r.status + ' ' + (j.error?.message || '')), { userMessage: r.status === 403 ? 'המכסה היומית של יוטיוב נגמרה. נסו שוב מחר' : 'שגיאה מיוטיוב, נסו שוב' });
  return j;
}
async function searchIds(env, ctx, s) {
  const key = `s:${s.type}:${s.query.trim().toLowerCase()}`.slice(0, 480);
  if (env.PZ) { const hit = await env.PZ.get(key, 'json'); if (hit) return hit; }
  let ids = [];
  if (s.type === 'channel') {
    const c = await yt(env, 'search', { part: 'snippet', type: 'channel', q: s.query, maxResults: 1 });
    const ch = c.items?.[0]?.id?.channelId;
    if (ch) { const p = await yt(env, 'playlistItems', { part: 'contentDetails', playlistId: 'UU' + ch.slice(2), maxResults: 50 }); ids = (p.items || []).map(it => it.contentDetails.videoId); }
  } else {
    const r = await yt(env, 'search', { part: 'snippet', type: 'video', q: s.query, maxResults: 30, safeSearch: 'strict', videoEmbeddable: 'true', relevanceLanguage: 'he', regionCode: 'IL' });
    ids = (r.items || []).map(it => it.id.videoId);
  }
  if (env.PZ && ids.length) ctx.waitUntil(env.PZ.put(key, JSON.stringify(ids), { expirationTtl: SEARCH_CACHE_SEC }));
  return ids;
}
const isoSec = s => { const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || ''); return m ? (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : 0; };
async function ytCandidates(env, ctx, searches) {
  const ids = new Set();
  for (const s of searches.slice(0, 2)) if (s && s.query) for (const id of await searchIds(env, ctx, s)) ids.add(id);
  const out = [], list = [...ids];
  for (let i = 0; i < list.length; i += 50) {
    const r = await yt(env, 'videos', { part: 'snippet,contentDetails,status', id: list.slice(i, i + 50).join(',') });
    for (const v of r.items || []) {
      if (v.status?.embeddable === false || v.status?.privacyStatus !== 'public') continue;
      out.push({ id: v.id, title: v.snippet.title, channel: v.snippet.channelTitle, sec: isoSec(v.contentDetails.duration), kids: !!v.status.madeForKids, desc: (v.snippet.description || '').slice(0, 160) });
    }
  }
  return out;
}
