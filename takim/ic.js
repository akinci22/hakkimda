/* Proje takımı, ana sayfanın içinde (içkin): takim/index.html'in gövdesi #takim-ic'in gölge köküne basılır, takim.css gölgeye
   uyarlanır (:root/html → :host, body → .govde), sonra takim.js IC modunda içe aktarılır. Ayrı sayfa, iframe yok; aynı belge, aynı kaydırma.
   Gölge kök: ana sitenin CSS'i takıma, takımınki ana siteye sızmaz; id'ler çakışmaz. */
(async () => {
  const host = document.getElementById('takim-ic'); if (!host || host.shadowRoot) return;
  const V = new URL(import.meta.url).searchParams.get('v') || '1';
  const al = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u); return r.text(); };
  let html, css; const akisP = al('takim/akis.css?v=' + V).catch(() => '');   /* akıcılık kuralları: en sona eklenir */
  try { [html, css] = await Promise.all([al('takim/index.html?v=' + V), al('takim/takim.css?v=' + V)]); }
  catch (e) { host.innerHTML = '<p style="padding:24px;font:600 1rem monospace">Takım bölümü yüklenemedi. <a href="takim/">Ayrı sayfada aç →</a></p>'; return; }

  /* yazı tipleri ana belgeye (gölge içindeki @import bazı tarayıcılarda geç kalır) */
  if (!document.querySelector('link[href*="Barlow+Condensed"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.append(l);
  }

  /* gövde: script/link dışındaki her şey; <main> → .takim-main (ana belgede ikinci main olmasın) */
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('[src],[href],[poster]').forEach(e => {
    for (const a of ['src', 'href', 'poster']) {
      const u = e.getAttribute(a); if (!u) continue;
      if (u.startsWith('../')) e.setAttribute(a, u.slice(3));
      else if (/^(g|veri)\//.test(u)) e.setAttribute(a, 'takim/' + u);
    }
  });
  const govde = document.createElement('div'); govde.className = 'govde';
  Array.from(doc.body.children).forEach(c => {
    if (c.tagName === 'SCRIPT' || c.tagName === 'LINK') return;
    if (c.tagName === 'MAIN') { const d = document.createElement('div'); d.className = 'takim-main'; while (c.firstChild) d.append(c.firstChild); govde.append(d); return; }
    govde.append(c);
  });

  /* CSS uyarlama */
  let s = css
    .replace(/:root\b/g, ':host')
    .replace(/(^|[^\w.#-])html\[data-(asama|grup|kime|kitle|derin)="([^"]+)"\]/g, '$1:host([data-$2="$3"])')
    .replace(/(^|[^\w.#-])html\.(sade|gomulu)\b/g, '$1:host(.$2)')
    .replace(/(^|[^\w.#-])html(?=[\s{,])/g, '$1:host')
    .replace(/(^|[^\w.#-])body(?=[\s{,.:])/g, '$1.govde');
  s += `
/* içkin mod ekleri */
:host{display:block;position:relative;isolation:isolate;contain:paint}
.govde{position:relative;padding:0!important;overflow:clip}
.govde::before{display:none}   /* dev izobar deseni içkin modda yok: her kaydırmada yeniden boyanıyordu */
.takim-main > section{content-visibility:auto;contain-intrinsic-size:auto 900px}   /* görünmeyen bölümler yerleşim/boyamaya girmez; açılış hep render */
@media (max-width:860px){.takim-main > section{contain-intrinsic-size:auto 1700px}}
.govde.hepsi-acik .takim-main > section{content-visibility:visible}   /* hedefe kaydırırken üstteki bölümler gerçek boyuna açılır, hedef kaçmaz */
.ray,.panel,#imlec,.ilerleme,.surpriz,.mobil-balon,.geri,.atla,.damla{display:none!important}
.ust{top:var(--tk-ust,52px)} .ust-ad{margin-left:0}
#perde,#odak-yazi,#ipucu{position:absolute}
.yan-balon{display:block} #donus{display:none!important}   /* içkin: sağda sürekli balon; dönüş için ana sitenin bulutu */   /* :host contain:paint → fixed burada çalışmaz; takim.js içkin modda gövdeye göre konumlar */
.govde,.govde a,.govde button{cursor:auto}
/* içkin görünüm: krem-beyaz, yumuşak köşeler ve gölgeler (ana sitenin lacivertinden ayrışan açık tema) */
:host{--kagit:#f8f5ee!important;--kagit-2:#efeadf!important;--panel-bg:#ffffff!important;--cizgi:rgba(31,42,46,.10);--cizgi-2:rgba(31,42,46,.18);--golge:0 1px 2px rgba(31,42,46,.05),0 10px 28px rgba(31,42,46,.08)}
.govde{background:var(--kagit)} .govde::before{opacity:.5}
.kart,.olay-k,.akis-k,.soru,.bk,.kapi,.ses,.sk,.adimlar li,.son-kart,.balon-form,.basamak-detay,.bs,details.merak,.cerceve,.vaka,.karne-svg,.yas-svg,.panel-kutu,.kartd,.deste-bitti,.gok,.koc,.dugum{border-radius:14px;border-color:rgba(31,42,46,.12)}
.kart,.olay-k,.akis-k,.soru,.bk,.kapi,.sk,.adimlar li,.balon-form,.basamak-detay,.bs,details.merak,.cerceve,.vaka{box-shadow:0 1px 2px rgba(31,42,46,.05),0 10px 28px rgba(31,42,46,.08)}
.ses{border-radius:12px;box-shadow:0 1px 2px rgba(31,42,46,.04)} .cip,.oy,.dg,.sec,.gonder,.cta a,.katil,.sade-dugme,.detay-alt{border-radius:999px} .cta a,.dg,.katil{box-shadow:0 2px 8px rgba(31,42,46,.12)}
.etk:hover{box-shadow:0 2px 4px rgba(31,42,46,.06),0 16px 36px rgba(31,42,46,.14)}
.ust{background:rgba(248,245,238,.88);border-bottom:1px solid rgba(31,42,46,.1)}
.detay{border-radius:18px;border-color:rgba(31,42,46,.12);box-shadow:0 30px 80px rgba(31,42,46,.25)}
@media (max-width:999px){.ust{position:static;backdrop-filter:none} .detay{border-radius:0}}
/* sade: filigran rakamlar, 'radyosonde ▸' öneki ve test rozeti içkin görünümde yok */
.blok[data-hpa]::after{display:none} .ust-ad .prompt{display:none} #mod-rozet{display:none!important}
.govde{background:linear-gradient(to bottom,var(--onceki,var(--kagit)) 0,var(--kagit) 200px)}
`;
  s += '\n' + (await akisP).replace(/(^|[^\w.#-])html(?=[\s{,])/g, '$1:host');
  const st = document.createElement('style'); st.textContent = s;

  const kok = host.attachShadow({ mode: 'open' }); kok.append(st, govde);
  host.dataset.asama = '0';
  /* ana menünün yüksekliği: takımın aşama şeridi onun altına yapışsın */
  const menu = document.querySelector('.menu'); const ustAyar = () => host.style.setProperty('--tk-ust', (menu ? menu.offsetHeight : 52) + 'px'); ustAyar(); addEventListener('resize', ustAyar);
  /* gölge içi #bağlantılar: belge çapası gölgeyi görmez → kendimiz kaydırırız */
  kok.addEventListener('click', e => {
    const a = e.composedPath().find(n => n.tagName === 'A' && n.getAttribute && /^#./.test(n.getAttribute('href') || '')); if (!a) return;
    const h = kok.getElementById(a.getAttribute('href').slice(1)); if (!h) return;
    e.preventDefault(); govde.classList.add('hepsi-acik'); clearTimeout(govde._hz); govde._hz = setTimeout(() => govde.classList.remove('hepsi-acik'), 2500);
    const y = h.getBoundingClientRect().top + scrollY - 70;
    if (window.__lenis) window.__lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' });
    setTimeout(() => { const d = h.getBoundingClientRect().top - 70; if (Math.abs(d) > 4) { if (window.__lenis) window.__lenis.scrollTo(scrollY + d, { duration: .45 }); else scrollBy({ top: d, behavior: 'smooth' }); } }, 1400);   /* geç yüklenen görseller kaydırdıysa ince ayar */
  });

  window.TAKIM_IC = { kok, host, govde };
  /* Firebase yapılandırması (klasik betik) → sonra takım betiği */
  await new Promise(r => { const f = document.createElement('script'); f.src = 'takim/firebase-config.js?v=' + V; f.onload = f.onerror = r; document.head.append(f); });
  await import('./takim.js?v=' + V);
})();
