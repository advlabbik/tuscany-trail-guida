# La Guida del Tuscany Trail 2027

Minisito della guida TT 2027, al posto del Canva. Una pagina sola (`index.html`), nessuna build, GitHub Pages da `main`.

Live: https://advlabbik.github.io/tuscany-trail-guida/

## Cosa c'è

- **14 capitoli numerati** più «Prima di tutto il resto». Indice, cassetto indice (telefono) e binario laterale (schermi larghi) si costruiscono da soli dalle `section.cap`: titolo in `data-titolo`, riga di sommario in `data-sommario`, numero in `data-n`. Per aggiungere o rinominare un capitolo basta toccare la sezione.
- **Ricerca** (tasto Cerca, oppure `/` o Ctrl+K). Indicizza paragrafi, voci d'elenco e titoli dentro le `section.cap`: tutto quello che sta fuori da una sezione non si trova. Porta al paragrafo e lo evidenzia.
- **Lista da spuntare** al capitolo 10, ricordata dal browser (`localStorage` chiave `tt-guida-lista`).
- **Countdown** alle due aperture (1/11 ore 18, 3/12 ore 12) e **modulo lista** in fondo al capitolo 13.
- **Stampa o salva in PDF** dal piè di pagina, con un foglio di stile di stampa.

Testo fedele al PDF Canva «Tuscany Trail 2027 LA GUIDA», con una correzione, cioè **Newbie + Detour Elba = 300 km** (il PDF diceva 260, superato il 21/9/2026).

Foto estratte dal PDF, in `foto/` in due misure (lato lungo 1600 e 900 px, `-800` nel nome).

## Tracciamento e modulo

- Su **advlabbik.github.io** il GA4 `G-9CFZLTETEL` lo carica la pagina stessa (solo su quell'host).
- Su un sottodominio di **tuscanytrail.it** (zona Cloudflare) il tracciamento lo inietta Zaraz, come su `elba.tuscanytrail.it`, e il gtag della pagina si spegne da solo.
- Il **modulo lista** (worker `tt-subscribe` → Brevo lista 18, `source: "guida"`) si accende solo su `*.tuscanytrail.it`. Altrove al suo posto c'è il bottone verso tuscanytrail.it.

### Per portarla su un dominio nostro (es. `guida.tuscanytrail.it`)

1. DNS in Cloudflare, CNAME `guida` → `advlabbik.github.io`.
2. Dominio personalizzato nelle impostazioni Pages del repo (crea il file `CNAME`).
3. Aggiungere l'origine a `ALLOWED_ORIGINS` del worker `tt-subscribe`, altrimenti il modulo risponde errore.
4. Aggiornare `og:url` e `og:image` in testa a `index.html`.

## Anteprima locale

`python -m http.server 8651` nella cartella, poi http://localhost:8651
