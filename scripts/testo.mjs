// Testo del <body>, una parola per riga: per confrontare il copy prima e dopo una modifica.
//   node scripts/testo.mjs index.html > /tmp/dopo.txt
import { readFileSync } from 'node:fs';

const ENTITA = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export function paroleDelCorpo(html) {
  let b = html.slice(html.indexOf('<body'));
  b = b.replace(/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  b = b.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITA[e] ?? m);
  return b.split(/\s+/).filter(Boolean);
}

if (process.argv[2]) console.log(paroleDelCorpo(readFileSync(process.argv[2], 'utf8')).join('\n'));
