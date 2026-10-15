/* Proje takımı, ana sayfanın içinde (içkin): takim/index.html'in gövdesi #takim-ic'in gölge köküne basılır, takim.css gölgeye
   uyarlanır (:root/html → :host, body → .govde), sonra takim.js IC modunda içe aktarılır. Ayrı sayfa, iframe yok; aynı belge, aynı kaydırma.
   Gölge kök: ana sitenin CSS'i takıma, takımınki ana siteye sızmaz; id'ler çakışmaz. */
(async () => {
  const host = document.getElementById('takim-ic'); if (!host || host.shadowRoot) return;
  /* 120fps (15 Eki): ağır kurulum (fetch + gölge kök + takim.js) ana sayfanın ilk boyamasından sonra, boşta */
  /* yük (15 Eki, e7 ölçümü): ~1,4 MB JSON + klipler ana sayfa açılışında inmesin → gövde #takim-ic'e ~2 ekran kala kurulur (hash ile gelindiyse hemen) */
  if ('IntersectionObserver' in window && !/^#(takim|tk-)/.test(location.hash)) await new Promise(r => { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); r(); } }, { rootMargin: '200% 0px' }); io.observe(host); });
  await new Promise(r => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 1200 }) : setTimeout(r, 200)));
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
/* içkin mod ekleri — YALNIZ yapısal / host'a özgü (görünüm takim.css PARİTE bloğunda, 14 Eki). host contain:paint → fixed çalışmaz:
   ray / panel / ilerleme = yükseklik-0 YAPIŞKAN kabuk + mutlak iç kutu (.yan-balon kalıbı); imleç/damla host'a göre mutlak (takim.js ofsetler) */
:host{display:block;position:relative;isolation:isolate;contain:paint}
.govde{position:relative;padding:0!important;overflow:clip}
@media (min-width:1000px){.govde{padding-left:var(--ray)!important}}
@media (min-width:1180px){.govde{padding-right:var(--panel)!important}}
.takim-main > section{content-visibility:auto;contain-intrinsic-size:auto 900px}   /* görünmeyen bölümler yerleşim/boyamaya girmez; açılış hep render */
@media (max-width:860px){.takim-main > section{contain-intrinsic-size:auto 1700px}}
.govde.hepsi-acik .takim-main > section{content-visibility:visible}   /* hedefe kaydırırken üstteki bölümler gerçek boyuna açılır, hedef kaçmaz */
.geri,.atla{display:none!important}                                    /* ana sayfaya dönüş bağlantısı ana sayfanın içinde anlamsız */
.ust{top:var(--tk-ust,52px)} .ust-ad{margin-left:0}                   /* aşama şeridi ana menünün altına yapışır */
#perde,#odak-yazi,#ipucu,#imlec,.damla{position:absolute}
#donus{display:none!important}                                         /* dönüş için ana sitenin bulutu */
.ilerleme{position:sticky;top:var(--tk-ust,52px);left:auto;right:auto;height:4px;margin-bottom:-4px}
.ray{position:sticky;top:var(--tk-ust,52px);left:auto;bottom:auto;height:0;width:0;overflow:visible;border:0;background:none}
.ray-ic{inset:auto;left:calc(-1 * var(--ray));top:0;width:var(--ray);height:calc(100dvh - var(--tk-ust,52px));border-right:1px solid var(--cizgi-2);background:color-mix(in srgb,var(--kagit) 75%,transparent)}
.panel{position:sticky;top:var(--tk-ust,52px);right:auto;bottom:auto;height:0;width:0;overflow:visible;margin-left:auto;border:0;background:none}
.panel-ic{inset:auto;right:calc(-1 * var(--panel));top:0;width:var(--panel);height:calc(100dvh - var(--tk-ust,52px));border-left:1px solid var(--cizgi-2);background:color-mix(in srgb,var(--kagit) 75%,transparent)}
@media (max-width:999px){.ust{position:sticky;top:var(--tk-ust,52px);backdrop-filter:none;z-index:30} .ust-ic{display:none} .serit{border-top:0;padding-top:2px} .detay{border-radius:0}}   /* mobil: yalnız aşama şeridi yapışkan — nerede olduğunu anlama, tek dokunuşla yer değiştirme */
/* sade: filigran rakamlar, 'radyosonde ▸' öneki ve test rozeti içkin görünümde yok */
.blok[data-hpa]::after{display:none} .ust-ad .prompt{display:none} #mod-rozet{display:none!important}
.govde{background:linear-gradient(to bottom,var(--onceki,var(--kagit)) 0,var(--kagit) 200px)}   /* üstteki bölümden yumuşak geçiş */
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
    e.preventDefault(); govde.classList.add('hepsi-acik'); clearTimeout(govde._hz); 
    const y = h.getBoundingClientRect().top + scrollY - 70;
    if (window.__lenis) window.__lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' });
    const t0 = performance.now(); setTimeout(() => { if (window.__girdi > t0) return; const d = h.getBoundingClientRect().top - 70; if (Math.abs(d) > 4) { if (window.__lenis) window.__lenis.scrollTo(scrollY + d, { duration: .45 }); else scrollBy({ top: d, behavior: 'smooth' }); } }, 1400);   /* geç yüklenen görseller kaydırdıysa ince ayar */
  });

  window.TAKIM_IC = { kok, host, govde };
  /* Firebase yapılandırması (klasik betik) → sonra takım betiği */
  await new Promise(r => { const f = document.createElement('script'); f.src = 'takim/firebase-config.js?v=' + V; f.onload = f.onerror = r; document.head.append(f); });
  await import('./takim.js?v=' + V);
})();
