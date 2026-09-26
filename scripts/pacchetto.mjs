// Pacchetto per bas-guides, una cartella per lingua (vedi bas-guides,
// docs/superpowers/plans/2026-09-26-piano-1c-guide-html.md, «Contratto del pacchetto»).
//
//   npm run pacchetto            → pacchetto/it/ e pacchetto/en/
//
// Estrae copertina e capitoli dall'HTML così com'è scritto (JavaScript spento: niente
// countdown riempito, niente --v copiato), stampa il PDF con JavaScript acceso e tutte le
// foto caricate, e si ferma se il testo del pacchetto non è quello della guida.
import { execSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { paroleDelCorpo } from './testo.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'pacchetto');
const PORT = 8652;
const LINGUE = [{ lang: 'it', pagina: 'index.html' }, { lang: 'en', pagina: 'en/index.html' }];
const VIETATI = [/<script\b/i, /\sstyle\s*=/i, /\son[a-z]+\s*=/i, /<iframe\b/i, /<form\b/i];

const sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const sporco = execSync('git status --porcelain -- index.html en guida.js chrome.css tema foto', { cwd: ROOT }).toString().trim();

function fallisci(msg) { console.error(`\n✗ ${msg}`); process.exit(1); }

// Nel browser, a JavaScript spento: copertina e capitoli come stringhe.
function estrai() {
  const src = (img) => {
    const m = (img.getAttribute('src') || '').match(/(?:^|\/)foto\/([a-z0-9-]+)\.jpg$/);
    if (!m) throw new Error(`foto fuori da foto/ o non .jpg: ${img.getAttribute('src')}`);
    img.setAttribute('src', `foto/${m[1]}.jpg`);
    img.removeAttribute('srcset');
    return m[1];
  };
  const foto = new Set();
  // La classe `guida` resta: countdown e bottoni della copertina prendono lo stile da
  // `.guida .cd` e `.guida .btn` del tema, e nel guscio la copertina sta fuori da main.guida.
  const copertina = document.querySelector('section.copertina').cloneNode(true);
  copertina.querySelectorAll('nav.lingue').forEach((n) => n.remove());
  copertina.querySelectorAll('img').forEach((i) => foto.add(src(i)));

  const colonna = document.querySelector('main#guida > .colonna');
  const capitoli = [];
  for (const el of [...colonna.children]) {
    if (el.matches('section.cap')) capitoli.push(el.cloneNode(true));
    else if (el.matches('figure') && capitoli.length) capitoli[capitoli.length - 1].append(el.cloneNode(true));
    else if (el.matches('figure')) throw new Error('una foto prima del primo capitolo');
    // section.indice: la costruisce il guscio di bas-guides dal manifesto.
  }
  capitoli.forEach((c) => c.querySelectorAll('img').forEach((i) => foto.add(src(i))));
  // Il testo di riferimento: capitoli e foto fra i capitoli, nell'ordine della pagina.
  const riferimento = [...colonna.children].filter((el) => !el.matches('section.indice')).map((el) => el.outerHTML).join('\n');
  return {
    cover: copertina.outerHTML,
    content: capitoli.map((c) => c.outerHTML).join('\n\n'),
    riferimento,
    foto: [...foto],
  };
}

const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
try {
  await new Promise((r) => setTimeout(r, 600));
  rmSync(OUT, { recursive: true, force: true });
  for (const { lang, pagina } of LINGUE) {
    const dir = join(OUT, lang);
    mkdirSync(join(dir, 'foto'), { recursive: true });
    const url = `http://localhost:${PORT}/${pagina}?lang=${lang}`;

    const spento = await browser.newContext({ javaScriptEnabled: false });
    const p1 = await spento.newPage();
    await p1.goto(url, { waitUntil: 'domcontentloaded' });
    const { cover, content, riferimento, foto } = await p1.evaluate(estrai);
    await spento.close();

    for (const [nome, html] of [['cover.html', cover], ['content.html', content]]) {
      for (const re of VIETATI) if (re.test(html)) fallisci(`${lang}/${nome}: contiene ${re}`);
    }
    const attese = paroleDelCorpo(`<body>${riferimento}</body>`).join(' ');
    const trovate = paroleDelCorpo(`<body>${content}</body>`).join(' ');
    if (attese !== trovate) fallisci(`${lang}/content.html: il testo non è quello della guida`);

    for (const nome of foto) {
      const da = join(ROOT, 'foto', `${nome}.jpg`);
      if (!existsSync(da)) fallisci(`foto mancante: foto/${nome}.jpg`);
      copyFileSync(da, join(dir, 'foto', `${nome}.jpg`));
    }
    writeFileSync(join(dir, 'cover.html'), cover + '\n');
    writeFileSync(join(dir, 'content.html'), content + '\n');
    writeFileSync(join(dir, 'pacchetto.json'), JSON.stringify({
      formato: 1, lang, sorgente: `tuscany-trail-guida@${sha}${sporco ? ' con modifiche non salvate' : ''}`,
    }, null, 2) + '\n');

    // PDF: JavaScript acceso (le barre prendono --v), tutte le foto subito.
    const acceso = await browser.newContext();
    const p2 = await acceso.newPage();
    await p2.goto(url, { waitUntil: 'domcontentloaded' });
    await p2.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach((i) => { i.loading = 'eager'; });
      await Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? null : new Promise((ok) => {
        i.addEventListener('load', ok, { once: true }); i.addEventListener('error', ok, { once: true });
      }))));
    });
    const mancanti = await p2.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
    if (mancanti.length) fallisci(`${lang}: foto non caricate per la stampa: ${mancanti.join(', ')}`);
    await p2.pdf({ path: join(dir, 'guide.pdf'), format: 'A4', printBackground: true });
    await acceso.close();

    console.log(`✓ ${lang}: ${content.match(/<section class="cap"/g).length} capitoli, ${foto.length} foto → pacchetto/${lang}/`);
  }
} finally {
  await browser.close();
  server.kill();
}
