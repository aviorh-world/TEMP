# חיבור ה־AI של פיצי TV (פעם אחת, כ־20 דקות)

השרת הקטן (`worker.js`) מחזיק את המפתחות שלך, והמשתמשים לא מזינים כלום.
הוא רץ חינם על Cloudflare (עד 100,000 בקשות ביום).

## 1. מפתח Claude
1. נכנסים ל־https://console.anthropic.com ונרשמים.
2. **Billing**: מוסיפים קרדיט (5$ זה הרבה, ראו עלויות למטה).
3. **Settings ← Limits**: מגדירים תקרת הוצאה חודשית, למשל 10$. זו רשת הביטחון: מעבר לה אי אפשר לחייב אותך.
4. **API Keys ← Create Key**: מעתיקים את המפתח (מתחיל ב־`sk-ant-`).

## 2. מפתח YouTube (חינם)
1. נכנסים ל־https://console.cloud.google.com ויוצרים פרויקט חדש.
2. **APIs & Services ← Library**: מחפשים **YouTube Data API v3** ולוחצים **Enable**.
3. **Credentials ← Create credentials ← API key**: מעתיקים את המפתח (מתחיל ב־`AIza`).
4. ליד המפתח: **Edit ← API restrictions ← Restrict key** ובוחרים רק YouTube Data API v3.

## 3. השרת ב־Cloudflare (חינם)
1. נכנסים ל־https://dash.cloudflare.com ונרשמים.
2. **Workers & Pages ← Create ← Create Worker**, נותנים שם `pitzi-ai` ולוחצים **Deploy**.
3. **Edit code**: מוחקים את מה שיש, מדביקים את כל התוכן של `worker.js`, ולוחצים **Deploy**.
4. **Storage & Databases ← KV ← Create**, בשם `pitzi`.
   - כאן נשמרות המגבלות היומיות ותוצאות חיפוש. בלי KV השרת עובד, אבל בלי מגבלות.
5. נכנסים ל־Worker ← **Settings**:
   - **Bindings ← Add ← KV namespace**: בשדה Variable name כותבים `PZ` ובוחרים את `pitzi`.
   - **Variables and Secrets ← Add**:
     - `ANTHROPIC_API_KEY`: סוג **Secret**, ומדביקים את מפתח Claude.
     - `YOUTUBE_API_KEY`: סוג **Secret**, ומדביקים את מפתח YouTube.
     - לא חובה: `DAILY_PER_USER` (ברירת מחדל 15 בקשות למשתמש ביום) ו־`DAILY_TOTAL` (ברירת מחדל 300 לכולם יחד ביום).
6. מעתיקים את כתובת ה־Worker, למשל `https://pitzi-ai.yourname.workers.dev`.
   - פותחים אותה בדפדפן. אמור להופיע `{"ok":true,"app":"pitzi-ai"}`.

## 4. חיבור האפליקציה
שולחים לי את הכתובת, או עורכים בעצמכם שורה אחת ב־`pitzi-tv/index.html`:
```js
const AI_URL = 'https://pitzi-ai.yourname.workers.dev';
```

## עלויות (הערכה)
- **Claude Haiku 5.5:** בערך 0.2–0.5 סנט לבקשה, כלומר כ־2–5 דולר ל־1,000 בקשות. ההערכה מבוססת על המחירון ועל גודל הבקשות. כדאי לבדוק בלוח הבקרה של Anthropic אחרי כמה ימים.
- **YouTube:** חינם, עד 10,000 יחידות ביום.
  - כל בקשת הוספה עולה בערך 200 יחידות, כלומר בערך 50 בקשות הוספה ביום לכל המשתמשים יחד.
  - חיפושים שחוזרים על עצמם (כמו "פפה") נשמרים 3 ימים ולא עולים יחידות.
  - כשיהיו הרבה משתמשים, מבקשים מגוגל הגדלת מכסה. זה חינם, דרך טופס **YouTube API Services – Audit and Quota Extension**.
- **Cloudflare:** חינם.
  - בתוכנית החינמית אפשר לשמור לכל היותר 1,000 עדכונים ביום ב־KV, מה שמספיק לבערך 250 בקשות AI ביום.
  - מעבר לזה: תוכנית Workers בתשלום, 5$ לחודש.
