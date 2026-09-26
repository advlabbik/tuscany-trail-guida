# La Guida del Tuscany Trail 2027

Minisito della guida TT 2027, al posto del Canva. Una pagina sola (`index.html`), nessuna build, GitHub Pages da `main`.

Live: https://advlabbik.github.io/tuscany-trail-guida/

## Cosa c'è

- **14 capitoli numerati** più «Prima di tutto il resto». Indice, cassetto indice (telefono) e binario laterale (schermi larghi) si costruiscono da soli dalle `section.cap`: titolo in `data-titolo`, riga di sommario in `data-sommario`, numero in `data-n`. Per aggiungere o rinominare un capitolo basta toccare la sezione.
- **Ricerca** (tasto Cerca, oppure `/` o Ctrl+K). Indicizza paragrafi, voci d'elenco e titoli dentro le `section.cap`: tutto quello che sta fuori da una sezione non si trova. Porta al paragrafo e lo evidenzia.
- **Countdown** alle due aperture (1/11 ore 11, 3/12 ore 12) e, in fondo al capitolo 13, il **bottone verso tuscanytrail.it** per entrare in lista.
- **Stampa o salva in PDF** dal piè di pagina, con un foglio di stile di stampa.

Testo fedele al PDF Canva «Tuscany Trail 2027 LA GUIDA», con una correzione, cioè **Newbie + Detour Elba = 300 km** (il PDF diceva 260, superato il 21/9/2026).

Foto estratte dal PDF, in `foto/` in due misure (lato lungo 1600 e 900 px, `-800` nel nome).

## Stile

Lo stile è quello del sito nuovo del Tuscany Trail (repo `ttrefactor`), non uno suo:

- `tema/` (token, `guide.css` con le classi del testo, font) **viene da ttrefactor e non si modifica qui**. Si corregge là e si riesporta con `pnpm export:guide-theme ../tuscany-trail-guida/tema`: ogni file porta in testa il commit da cui viene. La vetrina delle classi è in ttrefactor, `pnpm dev` → `/styleguide/guida`.
- `chrome.css` è la cornice di questo minisito (barra, copertina, indice, cassetto, ricerca, piè di pagina) e usa solo i token.
- Niente `style=""` nell'HTML: il lettore di bas-guides, dove la guida finirà, lo vieta. Il valore delle barre sta in `data-v` e lo copia in `--v` `guida.js`.

Il testo resta parola per parola quello del PDF: il restyling tocca classi e CSS, mai il copy.

## Tracciamento

- Su **advlabbik.github.io** il GA4 `G-9CFZLTETEL` lo carica la pagina stessa (solo su quell'host).
- Su un sottodominio di **tuscanytrail.it** (zona Cloudflare) il tracciamento lo inietta Zaraz, come su `elba.tuscanytrail.it`, e il gtag della pagina si spegne da solo.
- Il **modulo lista** che c'era in fondo al capitolo 13 è stato tolto: su bas-guides chi legge oltre l'anteprima ha già lasciato l'email, e il lettore vieta i moduli verso altri indirizzi. Resta il bottone verso tuscanytrail.it. (Il modulo mandava `source: "guida"`, che il worker `tt-subscribe` non riconosce: acceso, avrebbe scritto le iscrizioni in `tuscanytrail:unknown`.)

### Per portarla su un dominio nostro (es. `guida.tuscanytrail.it`)

1. DNS in Cloudflare, CNAME `guida` → `advlabbik.github.io`.
2. Dominio personalizzato nelle impostazioni Pages del repo (crea il file `CNAME`).
3. Aggiornare `og:url` e `og:image` in testa a `index.html`.

## Anteprima locale

`python -m http.server 8651` nella cartella, poi http://localhost:8651

## Pacchetto per bas-guides

`npm install` una volta, poi `npm run pacchetto`: crea `pacchetto/it/` e `pacchetto/en/`
(copertina, capitoli, foto usate, `guide.pdf` stampato con Chrome). È la cartella da
caricare nell'amministrazione di bas-guides, una per lingua. Lo script si ferma se il
testo del pacchetto non è parola per parola quello della guida, o se manca una foto.
Serve Google Chrome installato (oppure `CHROME_PATH`).
