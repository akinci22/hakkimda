/* kenar.js — Akın 8 Eki: portföyün sağ/sol boşluklarında konuyla ilgili görseller. Temaya uygun (grileştirilmiş, hafif sepya, bölümün vurgu rengiyle çerçeve),
   göze çarpmaz ama detay olarak belirgin. Yalnız geniş ekranda (≥1180px), yalnız BOŞ alana: her aday yer, bölümün içerik öğeleriyle (yazı, görsel, kart) çakışıyorsa atlanır.
   Dokunmaya kapalı (pointer-events:none), kaydırırken belirir, hareket azaltmada sabit. Takım bölümü (#takim) kendi düzenine sahip, dokunulmaz. */
(function () {
  const KENAR = {
    kisaca:      { tema: 'izobar', g: ['g/bulut/g13.jpg', 'g/itu/i05.jpg', 'g/bulut/g03.jpg'] },
    projeler:    { tema: 'rota',   g: ['g/gif/yh-siklon.jpg', 'g/gif/yolhava-izobar.jpg', 'g/gif/yolhava-kure.jpg', 'g/gif/yolhava-ruzgar.jpg'] },
    akademi:     { tema: 'kitap',  g: ['g/gif/akad-ispat-adim.jpg', 'g/gif/akad-konsol.jpg', 'g/gif/akad-ansiklopedi.jpg'] },
    yemek:       { tema: 'kase',   g: ['g/gif/yemek-menu.jpg', 'g/gif/yemek-su.jpg', 'g/gif/yemek-adim.jpg'] },
    naplist:     { tema: 'saat',   g: ['g/gif/naplist-balon.jpg', 'g/gif/naplist-tur.jpg', 'g/gif/naplist-icice.jpg'] },
    yayin:       { tema: 'dalga',  g: ['g/dmg/ben-kamera.jpg', 'g/havamet-salon.jpg', 'g/dmg/panel.jpg', 'g/havamet-obs.jpg'] },
    temsilcilik: { tema: 'devre',  g: ['g/gif/belge-istatistik.jpg', 'g/mto-kapak.jpg', 'g/itu/i18.jpg', 'g/gif/belge-tarihce.jpg'] },
    fotograf:    { tema: 'kamera', g: ['g/foto/f02.jpg', 'g/foto/f09.jpg', 'g/mezun/m03.jpg', 'g/foto/f21.jpg'] },
    yon:         { tema: 'pusula', g: ['g/bulut/skewt-28.jpg', 'g/bulut/g20.jpg', 'g/meteo/02_onsart_diyagrami.png'] },
    iletisim:    { tema: 'mesaj',  g: ['g/itu/i25.jpg'] }
  };
  const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICERIK = 'h1,h2,h3,h4,p,li,img,video,figure,table,blockquote,pre,dl,button,summary,.kart,.cip,.buton,.medya,.grafik,.kisaca-k,.sanat,.lightbox,canvas,iframe';
  let io;
  function rect(e) { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  const kesisir = (a, b, pay) => !(a.x + a.w + pay <= b.x || b.x + b.w + pay <= a.x || a.y + a.h + pay <= b.y || b.y + b.h + pay <= a.y);
  function temizle() { document.querySelectorAll('.kenar').forEach(k => k.remove()); }
  async function kur() {
    temizle();
    const vw = document.documentElement.clientWidth; if (vw < 1180) return 0;
    const W = vw >= 1700 ? 190 : vw >= 1440 ? 160 : 136, PAY = 28, KENAR_BOSLUK = vw >= 1700 ? 40 : 22;
    if (!io && !azalt && 'IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('canli'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .2 });
    let sayac = 0, sira = 0;
    for (const [id, K] of Object.entries(KENAR)) {
      const S = document.getElementById(id); if (!S) continue;
      if (getComputedStyle(S).position === 'static') S.style.position = 'relative';
      const sr = rect(S); if (sr.h < 420) continue;
      /* içerik = yazı taşıyan her yaprak öğe + medya + bağlantı/düğme (sınıf adından bağımsız); kenar görsellerinin kendisi hariç */
      const icerik = Array.from(S.querySelectorAll(ICERIK + ',a,svg,input,select,textarea,*:not(:has(*))')).filter(e => !e.closest('.kenar') && (e.matches('img,video,svg,canvas,iframe,input,select,textarea') || (e.textContent || '').trim().length > 0 || getComputedStyle(e).backgroundImage !== 'none')).map(rect).filter(r => r.w > 2 && r.h > 2);
      const yerlesen = [];
      /* aday yerler: iki yan × bölüm boyunca eşit aralıklı yükseklikler; sol/sağ sırayla, aynı yanda üst üste gelmez */
      const adaylar = [];
      const adim = Math.max(360, Math.min(620, sr.h / 4));
      for (let y = 120, i = 0; y + 260 < sr.h - 160; y += adim, i++) { const yan = (i + sira) % 2 ? 'sag' : 'sol'; adaylar.push({ yan, y }); adaylar.push({ yan: yan === 'sol' ? 'sag' : 'sol', y: y + adim / 2 }); }
      let gi = 0;
      for (const a of adaylar) {
        if (gi >= K.g.length || yerlesen.length >= 3) break;
        const src = K.g[gi]; const img = new Image(); img.decoding = 'async'; img.src = src;
        let dw = W, dh = Math.round(W * .72);
        try { await img.decode(); const o = img.naturalWidth / img.naturalHeight; if (o >= 1) { dw = W; dh = Math.round(W / o); } else { dh = Math.min(Math.round(W * 1.25), 260); dw = Math.round(dh * o); } } catch (e) { gi++; continue; }
        const kutu = { w: dw + 20, h: dh + 20 }; const x = a.yan === 'sol' ? sr.x + KENAR_BOSLUK : sr.x + sr.w - KENAR_BOSLUK - kutu.w; const r = { x, y: sr.y + a.y, w: kutu.w, h: kutu.h };
        if (r.y + r.h > sr.y + sr.h - 160) continue;   /* bölüm sonuna 160 px kala yok: sonraki bölümün yapışkan şeridi/başlığıyla çakışmasın */
        if (icerik.some(c => kesisir(r, c, PAY)) || yerlesen.some(c => kesisir(r, c, 60))) continue;
        const f = document.createElement('figure'); f.className = 'kenar kenar-' + a.yan; f.setAttribute('aria-hidden', 'true');
        f.style.cssText = `top:${a.y}px;${a.yan === 'sol' ? 'left' : 'right'}:${KENAR_BOSLUK}px;width:${kutu.w}px;--don:${((sayac % 3) - 1) * 2.6 + (a.yan === 'sol' ? -1 : 1)}deg`;
        img.alt = ''; img.loading = 'lazy'; f.append(img);
        if (window.gecisTema && window.gecisTema[K.tema] && yerlesen.length === 0) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 120 120'); s.setAttribute('class', 'kenar-cizgi'); s.innerHTML = window.gecisTema[K.tema]; f.append(s); }
        S.append(f); yerlesen.push(r); sayac++; gi++;
        if (io) io.observe(f); else f.classList.add('canli');
      }
      sira++;
    }
    return sayac;
  }
  let z; function yenile() { clearTimeout(z); z = setTimeout(() => { kur().then(n => { document.documentElement.dataset.kenar = n; }); }, 260); }
  /* bölüm yükseklikleri sonradan değişir (tembel yüklenen görsel/klip, açılan kutular): ResizeObserver 40 px'ten büyük değişimde yeniden yerleştirir */
  const boylar = new Map();
  function gozle() { if (!('ResizeObserver' in window)) return; const ro = new ResizeObserver(es => { let degisti = false; es.forEach(e => { const h = e.contentRect.height, o = boylar.get(e.target) || 0; if (Math.abs(h - o) > 40) { boylar.set(e.target, h); degisti = true; } }); if (degisti) yenile(); }); Object.keys(KENAR).forEach(id => { const S = document.getElementById(id); if (S) { boylar.set(S, S.getBoundingClientRect().height); ro.observe(S); } }); }
  function basla() { yenile(); gozle(); addEventListener('resize', yenile); if (document.fonts && document.fonts.ready) document.fonts.ready.then(yenile); setTimeout(yenile, 2500); setTimeout(yenile, 7000); }
  if (document.readyState === 'complete') basla(); else addEventListener('load', basla);
  window.kenarYenile = yenile;
})();
