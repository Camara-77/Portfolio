// Liste les notes vocales présentes dans public/audio/ et écrit
// src/app/data/audio-manifest.ts. Lancé automatiquement avant
// `npm start` et `npm run build` (prestart / prebuild).
import { readdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'public', 'audio');
const out = join(import.meta.dirname, '..', 'src', 'app', 'data', 'audio-manifest.ts');

const files = existsSync(dir)
  ? readdirSync(dir).filter((f) => /\.(mp3|m4a|ogg|wav)$/i.test(f)).sort().map((f) => `audio/${f}`)
  : [];

const content = `// Généré par scripts/audio-manifest.mjs — ne pas modifier à la main.
export const AUDIO_FILES: readonly string[] = ${JSON.stringify(files)};
`;
if (!existsSync(out) || readFileSync(out, 'utf8') !== content) writeFileSync(out, content);
console.log(`Notes vocales : ${files.length ? files.join(', ') : 'aucune'}`);
