# RouterQA · דף המייל

דף אחד (`index.html`) ששולח פקודות RouterQA כמיילים אמיתיים מה-Gmail שלך לתיבת ה-SH, ומציג את התשובות. הכול רץ בדפדפן: אין שרת, ואין סודות בריפו.

## הגדרה חד-פעמית ב-Google Cloud (בערך 10 דקות)

1. נכנסים ל-[Google Cloud Console](https://console.cloud.google.com/) עם חשבון ה-Gmail שממנו שולחים, ויוצרים פרויקט חדש (למשל `routerqa-mail`).
2. **APIs & Services → Library** → מחפשים **Gmail API** → **Enable**.
3. **APIs & Services → OAuth consent screen** (נקרא גם Google Auth Platform):
   - User type: **External**. מצב: **Testing** (לא צריך אימות של Google לשימוש אישי).
   - שם האפליקציה: `RouterQA mail`, ומייל תמיכה: המייל שלך.
   - **Data access / Scopes:** מוסיפים `gmail.send` ו-`gmail.readonly`.
   - **Audience / Test users:** מוסיפים את כתובת ה-Gmail שלך.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins:** `https://aviorh-world.github.io` (ולבדיקה מקומית גם `http://localhost:8000`).
   - בלי Redirect URIs.
5. מעתיקים את ה-**Client ID** (מסתיים ב-`.apps.googleusercontent.com`). הוא לא סוד.

## הפעלה

1. פותחים את הדף: `https://aviorh-world.github.io/TEMP/routerqa/` (אחרי שהקוד ממוזג לענף ש-GitHub Pages מפרסם).
2. **הגדרות** → מדביקים Client ID, כתובת תיבת ה-SH, PIN, ואופציונלית רשימת סביבות וסוויטות.
3. **התחבר ל-Gmail** → מאשרים את שתי ההרשאות (שליחה וקריאה). Google יציג אזהרה "האפליקציה לא אומתה", כי היא במצב Testing. ממשיכים דרך **Advanced → Go to RouterQA mail**.

בדיקה מקומית: מתוך התיקייה מריצים `python3 -m http.server 8000` ופותחים `http://localhost:8000/`.

## מה חשוב לדעת

- **חיבור מחדש:** האסימון של Google תקף לשעה ונשמר בזיכרון בלבד. אחרי שעה, או אחרי פתיחה מחדש של הדף, צריך ללחוץ פעם אחת על "התחבר מחדש". במצב Testing, Google מבקש הסכמה מלאה מחדש בערך פעם בשבוע.
- **PIN:** נשמר ב-`localStorage` של הדפדפן (או נשאל בכל שליחה, לפי ההגדרות). ה-PIN נמצא בנושא של כל מייל, ולכן גם ב-Sent של Gmail (נקודה 13.1 באפיון).
- **הרשאת קריאה:** `gmail.readonly` נותנת גישה לכל התיבה. הדף מציג רק הודעות מכתובת ה-SH עם `replyMatch` בנושא, אבל ההגבלה היא בקוד, לא אצל Google.
- **שיוך תשובות ומעקב ריצה:** התשובה משויכת לפקודה לפי שרשור, מזהים משותפים בנושא, או סוג הפקודה. קוד ריצה למעקב STATUS מזוהה אוטומטית מתשובת "ריצה התחילה" (מילה כמו `code`/`קוד`/`run` ואחריה מזהה עם ספרה). אם הפורמט האמיתי של RouterQA שונה, צריך לעדכן את `extractCode` ואת `classify` בקובץ.
- **נעילה:** אחרי 30 דקות בלי פעילות הדף ננעל, חוץ מכשיש ריצה במעקב.
