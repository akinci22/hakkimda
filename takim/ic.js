/* Proje takımı, ana sayfanın içinde (içkin): takim/index.html'in gövdesi #takim-ic'in gölge köküne basılır, takim.css gölgeye
   uyarlanır (:root/html → :host, body → .govde), sonra takim.js IC modunda içe aktarılır. Ayrı sayfa, iframe yok; aynı belge, aynı kaydırma.
   Gölge kök: ana sitenin CSS'i takıma, takımınki ana siteye sızmaz; id'ler çakışmaz. */
(async () => {
  const host = document.getElementById('takim-ic'); if (!host || host.shadowRoot) return;
  const V = new URL(import.meta.url).searchParams.get('v') || '1';
  const al = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u); return r.text(); };
  let html, css;
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
    .replace(/(^|[^\w.#-])html\[data-(asama|grup)="([^"]+)"\]/g, '$1:host([data-$2="$3"])')
    .replace(/(^|[^\w.#-])html\.(sade|gomulu)\b/g, '$1:host(.$2)')
    .replace(/(^|[^\w.#-])html(?=[\s{,])/g, '$1:host')
    .replace(/(^|[^\w.#-])body(?=[\s{,.:])/g, '$1.govde');
  s += `
/* içkin mod ekleri */
:host{display:block;position:relative;isolation:isolate;contain:paint}
.govde{position:relative;padding:0!important;overflow:clip}
.govde::before{position:absolute}
.ray,.panel,#imlec,.ilerleme,.surpriz,.mobil-balon,.geri,.atla,.damla{display:none!important}
.ust{top:var(--tk-ust,52px)} .ust-ad{margin-left:0}
#perde{position:absolute}
.govde,.govde a,.govde button{cursor:auto}
`;
  const st = document.createElement('style'); st.textContent = s;

  const kok = host.attachShadow({ mode: 'open' }); kok.append(st, govde);
  host.dataset.asama = '0';
  /* ana menünün yüksekliği: takımın aşama şeridi onun altına yapışsın */
  const menu = document.querySelector('.menu'); const ustAyar = () => host.style.setProperty('--tk-ust', (menu ? menu.offsetHeight : 52) + 'px'); ustAyar(); addEventListener('resize', ustAyar);
  /* gölge içi #bağlantılar: belge çapası gölgeyi görmez → kendimiz kaydırırız */
  kok.addEventListener('click', e => {
    const a = e.composedPath().find(n => n.tagName === 'A' && n.getAttribute && /^#./.test(n.getAttribute('href') || '')); if (!a) return;
    const h = kok.getElementById(a.getAttribute('href').slice(1)); if (!h) return;
    e.preventDefault(); const y = h.getBoundingClientRect().top + scrollY - 70;
    if (window.__lenis) window.__lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' });
  });

  window.TAKIM_IC = { kok, host, govde };
  /* Firebase yapılandırması (klasik betik) → sonra takım betiği */
  await new Promise(r => { const f = document.createElement('script'); f.src = 'takim/firebase-config.js?v=' + V; f.onload = f.onerror = r; document.head.append(f); });
  await import('./takim.js?v=' + V);
})();
