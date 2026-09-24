/* La Guida del Tuscany Trail 2027 — logica comune alle due lingue.
   La lingua la dice <html lang>: index.html è "it", en/index.html è "en". */
(function(){
  var LANG=document.documentElement.lang==='en'?'en':'it';
  var T={
    it:{min:' min',cercaVuoto:'Scrivi una parola, per esempio una di queste.',uno:'Un risultato.',tanti:' risultati.',nessuno:'Nessun risultato. Prova con un\'altra parola.'},
    en:{min:' min',cercaVuoto:'Type a word, for example one of these.',uno:'One result.',tanti:' results.',nessuno:'No results. Try another word.'}
  }[LANG];

  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var caps=$$('section.cap');

  /* ---------- lingua: il tasto IT/EN porta allo stesso capitolo ---------- */
  var KEYL='tt-guida-lang';
  $$('[data-lingua]').forEach(function(a){
    a.addEventListener('click',function(){
      try{localStorage.setItem(KEYL,a.getAttribute('data-lingua'))}catch(_){}
      var att=$('#binario a.attivo');
      a.href=a.getAttribute('href').split('#')[0]+(location.hash||(att?att.getAttribute('href'):''));
    });
  });

  /* ---------- indice, cassetto e binario costruiti dai capitoli ---------- */
  function minuti(el){var p=(el.textContent||'').trim().split(/\s+/).length;return Math.max(1,Math.round(p/200))}
  var vi=$('#voci-indice'),cl=$('#cassetto-lista'),bl=$('#binario ol');
  caps.forEach(function(c){
    var n=c.dataset.n,t=c.dataset.titolo,id=c.id;
    var li=document.createElement('li');
    li.innerHTML='<a href="#'+id+'"><span class="vi-num"></span><span class="vi-tit"></span><span class="vi-min">'+minuti(c)+T.min+'</span><span class="vi-som"></span></a>';
    li.querySelector('.vi-num').textContent=n||'—';
    li.querySelector('.vi-tit').textContent=t;li.querySelector('.vi-som').textContent=c.dataset.sommario||'';
    vi.appendChild(li);
    [cl,bl].forEach(function(lista){
      var l=document.createElement('li');l.innerHTML='<a href="#'+id+'" data-cap="'+id+'"><b>'+(n||'·')+'</b><span></span></a>';
      l.querySelector('span').textContent=t;lista.appendChild(l);
    });
  });

  /* ---------- barra in alto, progresso, capitolo attivo ---------- */
  var barra=$('#barra'),bin=$('#binario'),prog=$('#progresso'),cop=$('.copertina'),main=$('#guida');
  function scorri(){
    var y=window.scrollY,su=y>cop.offsetHeight-80;
    barra.classList.toggle('su',su);bin.classList.toggle('su',su);
    var tot=main.offsetTop+main.offsetHeight-window.innerHeight;
    prog.style.width=Math.max(0,Math.min(100,(y-main.offsetTop)/(tot-main.offsetTop)*100))+'%';
    var att=null;
    for(var i=0;i<caps.length;i++){if(caps[i].getBoundingClientRect().top<window.innerHeight*.35)att=caps[i].id}
    $$('[data-cap]').forEach(function(a){a.classList.toggle('attivo',a.dataset.cap===att)});
  }
  /* Una volta per fotogramma e non a ogni evento: lo scroll ne manda decine al
     secondo, e ognuno rileggeva la posizione di 15 capitoli. */
  var inCoda=false;
  function scorriPoi(){if(inCoda)return;inCoda=true;requestAnimationFrame(function(){inCoda=false;scorri()})}
  window.addEventListener('scroll',scorriPoi,{passive:true});window.addEventListener('resize',scorriPoi);scorri();

  /* ---------- cassetto indice ---------- */
  var cas=$('#cassetto'),velo=$('#velo'),cerca=$('#cerca'),campo=$('#cerca-campo');
  /* Il fuoco. Chi apre il cassetto o la ricerca da tastiera deve restarci dentro
     finché non chiude (Tab gira fra i controlli del pannello), e alla chiusura
     tornare al bottone da cui è partito: prima, con Esc, restava su un link del
     cassetto ormai invisibile. Il cassetto chiuso non è raggiungibile col Tab
     perché chrome.css gli dà visibility: hidden. */
  var daDove=null;
  function pannelloAperto(){return cerca.classList.contains('aperto')?cerca:cas.classList.contains('aperto')?cas:null}
  function apriIndice(){daDove=document.activeElement;cas.classList.add('aperto');velo.classList.add('aperto');cas.setAttribute('aria-hidden','false');var a=$('a.attivo',cas)||$('a',cas);a&&a.focus({preventScroll:true})}
  /* ridai=false quando dopo la chiusura il fuoco va altrove: su un capitolo scelto
     dal cassetto, su un risultato della ricerca. */
  function chiudiTutto(ridai){
    var eraAperto=pannelloAperto();
    cas.classList.remove('aperto');velo.classList.remove('aperto');cas.setAttribute('aria-hidden','true');cerca.classList.remove('aperto');document.body.style.overflow='';
    if(eraAperto&&ridai!==false&&daDove&&daDove.focus)daDove.focus({preventScroll:true});
    daDove=null;
  }
  $$('[data-apri-indice]').forEach(function(b){b.addEventListener('click',apriIndice)});
  $$('[data-chiudi-tutto]').forEach(function(b){b.addEventListener('click',function(){chiudiTutto()})});
  cas.addEventListener('click',function(e){if(e.target.closest('a'))chiudiTutto(false)});
  document.addEventListener('keydown',function(e){
    var pan=pannelloAperto();if(!pan||e.key!=='Tab')return;
    var f=$$('a[href],button,input',pan).filter(function(x){return x.offsetParent!==null});if(!f.length)return;
    var primo=f[0],ultimo=f[f.length-1];
    if(e.shiftKey&&document.activeElement===primo){e.preventDefault();ultimo.focus()}
    else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primo.focus()}
    else if(!pan.contains(document.activeElement)){e.preventDefault();primo.focus()}
  });

  /* ---------- ricerca ---------- */
  function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’`]/g,"'")}
  var indice=[];
  caps.forEach(function(c){
    var nome=(c.dataset.n?c.dataset.n+' · ':'')+c.dataset.titolo;
    $$('p,li,h3',c).forEach(function(el){
      if(el.tagName==='P'&&el.closest('li'))return; /* i paragrafi dentro la linea del tempo li prende il li */
      if(el.closest('.cd')||el.closest('form'))return;
      if(el.tagName==='LI'&&el.querySelector('li'))return;
      var t=el.textContent.replace(/\s+/g,' ').trim();if(t.length<3)return;
      indice.push({el:el,t:t,n:norm(t),cap:nome});
    });
  });
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function evidenzia(t,termini){
    /* posizioni nel testo normalizzato: stessa lunghezza del testo originale per le lettere latine */
    var n=norm(t),r=[];
    termini.forEach(function(q){var i=0;while((i=n.indexOf(q,i))>-1){r.push([i,i+q.length]);i+=q.length}});
    r.sort(function(a,b){return a[0]-b[0]});
    var out='',p=0;r.forEach(function(x){if(x[0]<p)return;out+=esc(t.slice(p,x[0]))+'<mark>'+esc(t.slice(x[0],x[1]))+'</mark>';p=x[1]});
    return out+esc(t.slice(p));
  }
  function ritaglio(t,termini){
    var n=norm(t),i=n.indexOf(termini[0]);if(t.length<=220)return t;
    var a=Math.max(0,i-80),b=Math.min(t.length,a+220);
    return (a>0?'… ':'')+t.slice(a,b).replace(/^\S*\s/,a>0?'':'$&')+(b<t.length?' …':'');
  }
  var ris=$('#risultati'),info=$('#cerca-info'),sug=$('#suggerimenti'),sel=-1,timer;
  function cercaOra(){
    var q=norm(campo.value.trim());ris.innerHTML='';sel=-1;
    if(q.length<2){info.textContent=T.cercaVuoto;sug.hidden=false;return}
    sug.hidden=true;
    var termini=q.split(/\s+/).filter(function(x){return x.length>1});
    var trovati=indice.filter(function(x){return termini.every(function(k){return x.n.indexOf(k)>-1})});
    /* prima i titoli, poi il resto nell'ordine della guida */
    trovati.sort(function(a,b){return (b.el.tagName==='H3')-(a.el.tagName==='H3')});
    info.textContent=trovati.length?(trovati.length===1?T.uno:trovati.length+T.tanti):T.nessuno;
    trovati.slice(0,60).forEach(function(x){
      var li=document.createElement('li'),a=document.createElement('a');a.href='#';
      a.innerHTML='<span class="ris-cap">'+esc(x.cap)+'</span><span class="ris-txt">'+evidenzia(ritaglio(x.t,termini),termini)+'</span>';
      a.addEventListener('click',function(e){e.preventDefault();vai(x,termini)});
      li.appendChild(a);ris.appendChild(li);
    });
  }
  function vai(x,termini){
    chiudiTutto(false);
    var el=x.el,orig=el.innerHTML,conControlli=!!el.querySelector('input,button');
    /* evidenzia le parole cercate dentro il paragrafo, poi rimette tutto com'era.
       Non sulle voci della lista da spuntare: rifare l'HTML staccherebbe le caselle. */
    if(!conControlli)try{
      var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodi=[],nd;while(nd=tw.nextNode())nodi.push(nd);
      nodi.forEach(function(tn){var h=evidenzia(tn.nodeValue,termini);if(h.indexOf('<mark>')>-1){var s=document.createElement('span');s.innerHTML=h;tn.parentNode.replaceChild(s,tn)}});
    }catch(_){}
    el.scrollIntoView({behavior:'smooth',block:'center'});
    /* Il fuoco sul blocco trovato: chi usa la tastiera riparte da lì, non dalla
       cima della pagina. */
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');
    el.focus({preventScroll:true});
    el.classList.remove('lampo');void el.offsetWidth;el.classList.add('lampo');
    setTimeout(function(){if(!conControlli)el.innerHTML=orig;el.classList.remove('lampo')},4000);
    var q=campo.value.trim();
    try{if(window.gtag)gtag('event','search',{search_term:q,language:LANG})}catch(_){}
    try{if(window.zaraz)zaraz.track('search',{search_term:q,language:LANG})}catch(_){}
  }
  function apriCerca(){if(!pannelloAperto())daDove=document.activeElement;cas.classList.remove('aperto');velo.classList.remove('aperto');cerca.classList.add('aperto');document.body.style.overflow='hidden';setTimeout(function(){campo.focus();campo.select()},30);cercaOra()}
  $$('[data-apri-cerca]').forEach(function(b){b.addEventListener('click',apriCerca)});
  campo.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(cercaOra,120)});
  $$('button',sug).forEach(function(b){b.addEventListener('click',function(){campo.value=b.textContent;cercaOra();campo.focus()})});
  campo.addEventListener('keydown',function(e){
    var voci=$$('a',ris);if(!voci.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+voci.length)%voci.length;voci.forEach(function(a,i){a.classList.toggle('sel',i===sel)});voci[sel].scrollIntoView({block:'nearest'})}
    if(e.key==='Enter'){e.preventDefault();(voci[sel]||voci[0]).click()}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')chiudiTutto();
    var scrivendo=/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName);
    if(!scrivendo&&(e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){e.preventDefault();apriCerca()}
  });

  /* ---------- countdown alla prossima apertura, in copertina e in fondo ----------
     Ora italiana (a novembre e dicembre +01:00). Passata una tappa si passa alla
     successiva, passate tutte i riquadri spariscono. Il gancio compare solo dove
     c'è [data-cd-gancio], cioè in copertina. */
  (function(){
    var boxes=$$('[data-countdown]');if(!boxes.length)return;
    var tappe=[
      {t:Date.parse('2026-11-01T11:00:00+01:00'),
       it:{l:'1 novembre, ore 11 · aprono i bundle',g:'Tuscany Trail più una seconda avventura della Bike Adventure Series. Le quote per ogni combinazione sono limitate, e quando una combinazione finisce sparisce.'},
       en:{l:'1 November, 11am · the bundles open',g:'Tuscany Trail plus a second Bike Adventure Series adventure. Each combination has a limited number of places, and when a combination is gone, it\'s gone.'}},
      {t:Date.parse('2026-12-03T12:00:00+01:00'),
       it:{l:'3 dicembre · aprono le iscrizioni singole',g:'Data e fascia di partenza si scelgono all\'iscrizione, e le giornate più richieste finiscono per prime.'},
       en:{l:'3 December · single entries open',g:'Start date and time slot are chosen at sign up, and the most popular days go first.'}}
    ];
    var timer,pad=function(n){return String(n).padStart(2,'0')};
    function tick(){
      /* Scheda in background: niente da aggiornare. Al ritorno riparte subito
         (visibilitychange più sotto), senza aspettare il secondo successivo. */
      if(document.hidden)return;
      var now=Date.now(),tappa=null;
      for(var i=0;i<tappe.length;i++){if(tappe[i].t>now){tappa=tappe[i];break}}
      boxes.forEach(function(box){
        if(!tappa){box.hidden=true;return}
        var ms=tappa.t-now,testi=tappa[LANG],g=$('[data-cd-gancio]',box);
        $('[data-cd-label]',box).textContent=testi.l;
        if(g)g.textContent=testi.g;
        $('[data-k="d"]',box).textContent=Math.floor(ms/864e5);
        $('[data-k="h"]',box).textContent=pad(Math.floor(ms/36e5)%24);
        $('[data-k="m"]',box).textContent=pad(Math.floor(ms/6e4)%60);
        $('[data-k="s"]',box).textContent=pad(Math.floor(ms/1e3)%60);
        box.hidden=false;
      });
      if(!tappa)clearInterval(timer);
    }
    tick();timer=setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
  })();

  /* ---------- barre: data-v → --v ----------
     Il valore delle barre stava in style="--v:62". Nel lettore di bas-guides la
     CSP vieta lo stile in linea, quindi il valore sta in data-v e lo copia qui lo
     script: setProperty passa, perché è CSSOM e non un attributo. Senza
     JavaScript la barra resta vuota, ma il numero è scritto accanto. */
  $$('[data-v]').forEach(function(el){el.style.setProperty('--v',el.getAttribute('data-v'))});

  /* ---------- stampa ----------
     Le foto hanno loading="lazy": in stampa quelle mai raggiunte scorrendo
     uscivano vuote (2 su 17 caricate, misurato). Il bottone del piè di pagina
     le carica tutte e aspetta che arrivino prima di aprire la stampa; con
     Ctrl+P si fa lo stesso in beforeprint, ma lì il browser non aspetta, quindi
     è un tentativo e basta. Il gestore sta qui e non in un onclick nell'HTML:
     il lettore di bas-guides vieta gli script in linea. */
  function fotoTutte(){
    return Promise.all($$('img').map(function(i){
      i.loading='eager';
      if(i.complete&&i.naturalWidth)return null;
      return new Promise(function(ok){i.addEventListener('load',ok,{once:true});i.addEventListener('error',ok,{once:true})});
    }));
  }
  window.addEventListener('beforeprint',fotoTutte);
  $$('[data-stampa]').forEach(function(b){b.addEventListener('click',function(){
    b.disabled=true;
    var basta=new Promise(function(ok){setTimeout(ok,8000)});
    Promise.race([fotoTutte(),basta]).then(function(){b.disabled=false;window.print()});
  })});
})();
