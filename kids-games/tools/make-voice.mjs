// מקליט מראש את כל המשפטים של המשחקים בקול אנושי (ElevenLabs) ושומר ל-audio/
//
//   ELEVENLABS_API_KEY=... node tools/make-voice.mjs            ← מקליט רק משפטים חדשים
//   ELEVENLABS_API_KEY=... node tools/make-voice.mjs --voices   ← רשימת קולות עבריים לבחירה
//   VOICE_ID=... MODEL=eleven_v3 node tools/make-voice.mjs --force   ← מקליט הכול מחדש
//
// רשימת המשפטים נלקחת מהמשחקים עצמם (allLines() בדפדפן), כך שכל משפט חדש בקוד מוקלט אוטומטית.
// דורש Playwright (כבר מותקן בסביבת הפיתוח) ו-curl.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO = path.join(ROOT, 'audio');
const KEY = process.env.ELEVENLABS_API_KEY || 'placeholder';   // בסביבת הענן הפרוקסי מוסיף את המפתח האמיתי
const MODEL = process.env.MODEL || 'eleven_v3';
const VOICE_FILE = path.join(AUDIO, 'voice.json');
const args = new Set(process.argv.slice(2));

// הגייה: מילים שמנוע הקול עלול לקרוא לא נכון. אפשר להוסיף כאן עוד.
const PRON = {
  'אורי': 'אוֹרִי',
  'אבא': 'אַבָּא', 'אמא': 'אִמָּא',
  'וו': 'וָו', 'הא': 'הֵא', 'פא': 'פֵּא', 'זין': 'זַיִן', 'כף': 'כָּף', 'מם': 'מֵם', 'עין': 'עַיִן', 'צדי': 'צָדִי', 'ריש': 'רֵישׁ', 'שין': 'שִׁין', 'תו': 'תָּו',
  'בז׳': 'בֶּז׳', 'סעים': 'סָעִים'
};
// משפטים שלמים עם הגייה מיוחדת ("שבע" = 7, אבל "הכלב שבע" = full)
const PHRASE = { 'שבע': 'שֶׁבַע', 'הכלב שבע! תודה!': 'הַכֶּלֶב שָׂבֵעַ! תודה!' };
function ttsText(line) {
  if (PHRASE[line]) return PHRASE[line];
  let t = line;
  for (const [w, r] of Object.entries(PRON)) if (r) t = t.replace(new RegExp(`(?<![\\u05d0-\\u05ea])${w}(?![\\u05d0-\\u05ea])`, 'g'), r);
  return t;
}

function api(method, url, body, out) {
  const a = ['-sS', '--fail-with-body', '-X', method, url, '-H', `xi-api-key: ${KEY}`, '-H', 'Content-Type: application/json'];
  if (body) a.push('--data-binary', JSON.stringify(body));
  if (out) a.push('-o', out);
  return execFileSync('curl', a, { maxBuffer: 64 << 20 }).toString();
}

if (args.has('--voices')) {
  const r = JSON.parse(api('GET', 'https://api.elevenlabs.io/v1/shared-voices?language=he&page_size=30&sort=usage_character_count_1y'));
  for (const v of r.voices || []) console.log(`${v.voice_id}  ${v.public_owner_id}  ${v.gender || ''} ${v.age || ''}  ${v.name} – ${(v.description || '').slice(0, 70)}`);
  console.log('\nלבחירה: VOICE_ID=<id> PUBLIC_OWNER=<owner> node tools/make-voice.mjs --force');
  process.exit(0);
}

// אילו משפטים יש במשחקים
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
const lines = await page.evaluate(() => allLines());
await browser.close();
console.log(`${lines.length} משפטים`);

fs.mkdirSync(AUDIO, { recursive: true });
const prev = fs.existsSync(VOICE_FILE) ? JSON.parse(fs.readFileSync(VOICE_FILE, 'utf8')) : {};
const voice = process.env.VOICE_ID || prev.voice_id || 'cgSgspJ2msm6clMCkdW9';
if (process.env.PUBLIC_OWNER) { // קול מהספרייה הציבורית צריך להוסיף לחשבון פעם אחת
  try { api('POST', `https://api.elevenlabs.io/v1/voices/add/${process.env.PUBLIC_OWNER}/${voice}`, { new_name: 'kids-games-he' }); } catch (e) { console.log('(הקול כבר בחשבון?)', String(e.stdout || e.message).slice(0, 200)); }
}
fs.writeFileSync(VOICE_FILE, JSON.stringify({ voice_id: voice, model: MODEL }, null, 2));

const manifest = {};
let made = 0, failed = 0;
for (const line of lines) {
  const text = ttsText(line);
  const file = createHash('sha1').update(`${voice}|${MODEL}|${text}`).digest('hex').slice(0, 14) + '.mp3';
  const full = path.join(AUDIO, file);
  if (!fs.existsSync(full) || args.has('--force')) {
    try {
      api('POST', `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
        text, model_id: MODEL, language_code: 'he',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true }
      }, full);
      made++; process.stdout.write('.');
    } catch (e) {
      failed++; try { fs.unlinkSync(full); } catch {}
      console.log(`\n✗ ${line}: ${String(e.stdout || e.message).slice(0, 300)}`);
      if (failed > 3 && made === 0) { console.log('עוצר – בדקו את המפתח, הקול והמודל.'); process.exit(1); }
      continue;
    }
  }
  manifest[line] = file;
}
// מחיקת קבצים שכבר לא בשימוש
const used = new Set(Object.values(manifest));
for (const f of fs.readdirSync(AUDIO)) if (f.endsWith('.mp3') && !used.has(f)) fs.unlinkSync(path.join(AUDIO, f));
fs.writeFileSync(path.join(AUDIO, 'manifest.js'),
  '/* נוצר אוטומטית ע״י tools/make-voice.mjs – מיפוי משפט → קובץ קול */\nwindow.VOICE_MANIFEST = ' + JSON.stringify(manifest, null, 1) + ';\n');
console.log(`\nהוקלטו ${made} חדשים, ${Object.keys(manifest).length} בסך הכול, ${failed} נכשלו.`);
