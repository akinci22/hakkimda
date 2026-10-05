/* Montaj karesi değişimi: eski kare sola kayıp söner, sıradaki sağdan kayarak gelir */
function kaydirDegis(k, src, yon) {
  var yeni = new Image(); yeni.src = src; k.style.setProperty("--yon", yon < 0 ? -1 : 1);
  k.classList.add("cik");
  setTimeout(function () {
    function gel() { k.style.transition = "none"; k.classList.remove("cik"); k.classList.add("gir"); k.src = src;
      void k.offsetWidth; k.style.transition = ""; k.classList.remove("gir"); }
    var bitti = false; function bir() { if (!bitti) { bitti = true; gel(); } }
    if (yeni.complete) bir(); else { yeni.onload = bir; yeni.onerror = bir; setTimeout(bir, 350); }   // en çok 0,35 sn bekle
  }, k.classList.contains("hizli") ? 300 : 520);
}
/* Hareket katmanı v4 (28 Eyl 2026) — hafif ve kasmayan.
   Tek IntersectionObserver: .gel ögeleri bir kez belirir, grafikler (.grafik) bir kez çizilir.
   Kaydırmaya bağlı sürekli iş yok; ilerleme çubuğu rAF ile ve yalnız transform değiştirir. */
(function () {
  "use strict";
  var kok = document.documentElement;
  kok.classList.remove("js-yok");
  kok.classList.add("js");
  var azalt = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Eski sayfalardaki ögeleri de otomatik "gel" yap (hero hariç)
  var eski = document.querySelectorAll(".vitrin, .bakis-kart, .galeri figure, .adim-gorsel, .kanit, .tablo-sar, .kutu, .not, .grafik");
  Array.prototype.forEach.call(eski, function (e) { if (!e.closest("header")) e.classList.add("gel"); });

  // v6: grupların çocukları sırayla gelsin; başlıklar da kaysın
  var gruplar = document.querySelectorAll(".kartlar, .bilgi, .etiketler, .kisaca, .dosya, .baglar, .tur-satir>div, .kareler, .yayin-kare, .gif-izgara");
  Array.prototype.forEach.call(gruplar, function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.classList.add("gel"); c.style.transitionDelay = Math.min(i, 8) * 70 + "ms";
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("main h2, main h3, .bolum-no"), function (h) { h.classList.add("gel"); });

  // Sayılar görününce sayarak gelsin (yalnız düz sayılar: 52, 2.122, 96.225)
  function say(b) {
    var ham = b.dataset.say || b.textContent.trim();
    if (!/^[\d.]+$/.test(ham)) return;
    b.dataset.say = ham;
    var hedef = parseInt(ham.replace(/\./g, ""), 10), t0 = null, sure = 700;
    function ad(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / sure); k = 1 - Math.pow(1 - k, 3);
      b.textContent = Math.round(hedef * k).toLocaleString("tr-TR"); if (k < 1) requestAnimationFrame(ad); }
    requestAnimationFrame(ad);
  }

  var hepsi = document.querySelectorAll(".gel, .grafik");
  function ac(e) {
    if (e.classList.contains("var")) return;
    e.classList.add("var"); if (e.classList.contains("grafik")) e.classList.add("ac");
    if (!azalt) { var b = e.matches(".bilgi>div") ? e.querySelector("b") : null; if (b) say(b); }
  }
  function kapat(e) { e.classList.remove("var"); e.classList.remove("ac"); }
  if (azalt || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(hepsi, ac);
  } else {
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (g.isIntersecting) ac(g.target);
        else if (g.boundingClientRect.top > innerHeight || g.boundingClientRect.bottom < 0) kapat(g.target); // tekrar gelince yeniden oynasın
      });
    }, { rootMargin: "0px 0px 18% 0px", threshold: 0.01 });
    Array.prototype.forEach.call(hepsi, function (e) { go.observe(e); });
    // Emniyet: hızlı kaydırmada / bağlantı ile atlamada hiçbir şey görünmez kalmasın
    window.addEventListener("hashchange", function () { setTimeout(function () {
      Array.prototype.forEach.call(hepsi, function (e) { var r = e.getBoundingClientRect(); if (r.top < innerHeight) ac(e); });
    }, 350); });
  }

  // Öne çıkarılanlar: halkaya basınca o grubun fotoğrafları
  Array.prototype.forEach.call(document.querySelectorAll(".one button"), function (b, _, hepsiB) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".one button"), function (x) {
        var on = x === b;
        x.setAttribute("aria-pressed", on ? "true" : "false");
        var p = document.getElementById("one-" + x.dataset.one);
        if (p) p.hidden = !on;
      });
    });
  });

  // Öne çıkarılan kartları: fare üstünde bekledikçe kareler sırayla değişir; dokunmatikte ekrandayken kendiliğinden döner
  (function () {
    var dokunmatik = window.matchMedia && matchMedia("(hover: none)").matches;
    var kartlar = document.querySelectorAll(".hl");
    Array.prototype.forEach.call(kartlar, function (k) {
      var im = k.querySelectorAll(".hl-kutu img"), cb = k.querySelectorAll(".hl-cubuk i"), son = 0, zam = null;
      if (im.length < 2) return;
      function yukle() { Array.prototype.forEach.call(im, function (x) { if (x.dataset.src && x.getAttribute("src") !== x.dataset.src) x.src = x.dataset.src; }); }
      function goster(i) { if (i === son) return; im[son].classList.remove("on"); cb[son] && cb[son].classList.remove("on");
        im[i].classList.add("on"); cb[i] && cb[i].classList.add("on"); son = i; }
      function basla() { if (zam || azalt) return; yukle(); zam = setInterval(function () { goster((son + 1) % im.length); }, 700); }
      function dur(sifirla) { clearInterval(zam); zam = null; if (sifirla) goster(0); }
      k._basla = basla; k._dur = dur; k._git = function (n) { yukle(); goster(((son + n) % im.length + im.length) % im.length); };
      if (!dokunmatik) {   // imleç sağa/sola kaydıkça o kadar kare ilerler/geriler
        var x0 = null, ADIM = 28;
        k.addEventListener("pointerenter", function (e) { yukle(); x0 = e.clientX; });
        k.addEventListener("pointermove", function (e) { if (x0 === null) return; var d = e.clientX - x0;
          if (Math.abs(d) >= ADIM) { var n = Math.trunc(d / ADIM); x0 += n * ADIM; goster(((son + n) % im.length + im.length) % im.length); } });
        k.addEventListener("pointerleave", function () { x0 = null; });
      }
    });
    if (dokunmatik) Array.prototype.forEach.call(kartlar, function (k) {   // telefonda parmakla yana kaydır: kareler ilerler/geriler
      if (!k._basla) return; var x0 = null, sx = 0, sy = 0, yatay = null, tekrar = null;
      var im = k.querySelectorAll(".hl-kutu img");
      k.addEventListener("touchstart", function (e) { var t = e.touches[0]; x0 = sx = t.clientX; sy = t.clientY; yatay = null; }, { passive: true });
      k.addEventListener("touchmove", function (e) { if (x0 === null) return; var t = e.touches[0];
        if (yatay === null && Math.abs(t.clientX - sx) + Math.abs(t.clientY - sy) > 8) yatay = Math.abs(t.clientX - sx) > Math.abs(t.clientY - sy);
        if (!yatay) return; k._dur(false); clearTimeout(tekrar);
        var d = t.clientX - x0; if (Math.abs(d) >= 22) { var n = Math.trunc(d / 22); x0 += n * 22; k._git(n); } }, { passive: true });
      k.addEventListener("touchend", function () { x0 = null; if (yatay) tekrar = setTimeout(k._basla, 2500); }, { passive: true });
    });
    if (dokunmatik && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (gs) { gs.forEach(function (g) { var k = g.target; if (!k._basla) return;
        g.isIntersecting ? k._basla() : k._dur(false); }); }, { threshold: 0.6 });
      Array.prototype.forEach.call(kartlar, function (k) { io.observe(k); });
    }
  })();

  // Uygulama klipleri ("GIF"): yalnız ekrandayken yüklenip oynar, çıkınca durur
  (function () {
    var v = document.querySelectorAll("video.gif");
    if (!v.length) return;
    if (azalt || !("IntersectionObserver" in window)) { Array.prototype.forEach.call(v, function (x) { x.controls = true; }); return; }
    var io = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        var x = g.target;
        if (g.isIntersecting) { if (x.preload !== "auto") { x.preload = "auto"; x.load(); } var p = x.play(); if (p && p.catch) p.catch(function () {}); }
        else x.pause();
      });
    }, { rootMargin: "300px 0px", threshold: 0 });
    Array.prototype.forEach.call(v, function (x) { io.observe(x); });
  })();

  // Fotoğraf montajları: her grup (kampüs, sokak) kendi karelerini çok hızlı değiştirir (yalnız ekrandayken), altta sonsuz akan şerit
  Array.prototype.forEach.call(document.querySelectorAll(".montaj"), function (m) {
    var T = window.MONTAJ || {}, L = T[m.dataset.grup] || (Array.isArray(T) ? T : null);
    if (!L || !L.length) return;
    var kare = m.querySelector(".montaj-kare"), ic = m.querySelector(".montaj-ic"), html = "";
    var sabit = m.dataset.grup === "kampus";   // kampüs: şerit kaymaz, tek sıra; kareler yavaş, solup belirerek değişir
    for (var t = 0; t < (sabit ? 1 : 2); t++) L.forEach(function (u) { html += '<img src="' + u + '" alt="" loading="lazy" decoding="async" width="99" height="62">'; });
    ic.innerHTML = html;
    if (azalt) return;
    var hazir = [], y = 0, i = 0, zam = null;
    // bölüme yaklaşınca öncelikli ve 4 paralel yükle; yüklenen kare hemen döngüye girer
    function yukle() { if (y >= L.length) return; var im = new Image(); im.fetchPriority = "high"; im.decoding = "async";
      im.onload = function () { hazir.push(im.src); yukle(); }; im.onerror = yukle; im.src = L[y++]; }
    function basla() { if (!y) for (var p = 0; p < 4; p++) yukle(); }
    new IntersectionObserver(function (g, o) { if (g[0].isIntersecting) { basla(); o.disconnect(); } }, { rootMargin: "1500px 0px" }).observe(m);
    function oynat() { if (zam) return; basla(); zam = setInterval(function () { if (hazir.length < 2 || (!sabit && m.matches(":hover")) || (m._tut || 0) > Date.now()) return; i = (i + 1) % hazir.length;
      if (!sabit) { kare.src = hazir[i]; return; }
      kaydirDegis(kare, hazir[i]); }, sabit ? 2600 : 110); }
    function dur() { clearInterval(zam); zam = null; }
    if (sabit) m.addEventListener("pointerenter", function () {   // kampüs: imleç gelir gelmez sıradaki kayarak gelir
      if (hazir.length < 2) return; i = (i + 1) % hazir.length; kaydirDegis(kare, hazir[i]); });
    new IntersectionObserver(function (g) { g[0].isIntersecting ? oynat() : dur(); }).observe(m);
  });

  // Fotoğrafa basınca büyüt: tam ekran, ok tuşu / kaydırma ile sonraki-önceki, Esc ile kapat
  (function () {
    var kutu, resim, sayac, liste = [], i = 0;
    function kaynak(im) { return im.dataset.src || im.currentSrc || im.src; }
    function goster() { resim.src = kaynak(liste[i]); resim.alt = liste[i].alt || ""; sayac.textContent = (i + 1) + " / " + liste.length; }
    function git(d) { i = (i + d + liste.length) % liste.length; goster(); }
    function kapat() { kutu.hidden = true; document.body.style.overflow = ""; }
    function kur() {
      kutu = document.createElement("div"); kutu.className = "buyut"; kutu.hidden = true;
      kutu.innerHTML = '<img alt=""><button class="b-kapat" aria-label="Kapat">×</button>' +
        '<button class="b-onceki" aria-label="Önceki">‹</button><button class="b-sonraki" aria-label="Sonraki">›</button><span class="b-sayac"></span>';
      document.body.appendChild(kutu);
      resim = kutu.querySelector("img"); sayac = kutu.querySelector(".b-sayac");
      kutu.querySelector(".b-kapat").onclick = kapat;
      kutu.querySelector(".b-onceki").onclick = function (e) { e.stopPropagation(); git(-1); };
      kutu.querySelector(".b-sonraki").onclick = function (e) { e.stopPropagation(); git(1); };
      kutu.addEventListener("click", function (e) { if (e.target === kutu) kapat(); });
      document.addEventListener("keydown", function (e) { if (kutu.hidden) return;
        if (e.key === "Escape") kapat(); else if (e.key === "ArrowRight") git(1); else if (e.key === "ArrowLeft") git(-1); });
      var x0 = null;
      kutu.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      kutu.addEventListener("touchend", function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0;
        if (Math.abs(d) > 40) git(d < 0 ? 1 : -1); x0 = null; }, { passive: true });
    }
    document.addEventListener("click", function (e) {
      var im = e.target.closest && e.target.closest("img");
      var hl = e.target.closest && e.target.closest(".hl");
      if (hl) im = hl.querySelector(".hl-kutu img.on") || hl.querySelector(".hl-kutu img");
      if (!im || im.classList.contains("montaj-kare") || im.closest("a, button, header, nav, .buyut, .dmg-foto") || im.classList.contains("av") || im.classList.contains("ikon")) return;
      if (!im.closest("main")) return;
      var serit = im.closest(".montaj-ic"), grup = serit || hl || im.closest("section") || document.body;
      liste = Array.prototype.filter.call(grup.querySelectorAll("img"), function (x) {
        return !x.closest("a, button") && !x.classList.contains("montaj-kare") && (serit || !x.closest(".montaj")) && !x.classList.contains("av") && !x.classList.contains("ikon") && kaynak(x);
      });
      i = Math.max(0, liste.indexOf(im));
      if (!kutu) kur();
      goster(); kutu.hidden = false; document.body.style.overflow = "hidden";
    });
  })();

  // İlerleme çubuğu + üste dön
  var cubuk = document.createElement("div");
  cubuk.className = "ilerleme"; cubuk.setAttribute("aria-hidden", "true");
  document.body.appendChild(cubuk);
  var d = document.createElement("button");
  d.className = "uste"; d.type = "button"; d.setAttribute("aria-label", "Sayfanın başına dön"); d.innerHTML = "&uarr;";
  d.addEventListener("click", function () { scrollTo({ top: 0, behavior: azalt ? "auto" : "smooth" }); });
  document.body.appendChild(d);
  var bekle = false;
  function ciz() {
    var y = scrollY, top = kok.scrollHeight - innerHeight;
    cubuk.style.setProperty("--ilerleme", top > 0 ? Math.min(1, y / top).toFixed(4) : 0);
    d.classList.toggle("gorunur", y > 700);
    bekle = false;
  }
  addEventListener("scroll", function () { if (!bekle) { bekle = true; requestAnimationFrame(ciz); } }, { passive: true });
  ciz();
})();

/* Fare tekerleğinde ivmeli, yumuşak kaydırma (Lenis). Dokunmatikte ve "az hareket" tercihinde kapalı. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
  s.onload = function () {
    if (!window.Lenis) return;
    document.documentElement.style.scrollBehavior = "auto";
    var l = window.__lenis = new Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, smoothWheel: true });
    function r(t) { l.raf(t); requestAnimationFrame(r); }
    requestAnimationFrame(r);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      var h = document.querySelector(a.getAttribute("href"));
      if (h) { e.preventDefault(); l.scrollTo(h, { offset: -10 }); }
    });
  };
  document.head.appendChild(s);
})();

/* Öne çıkarılanlar ve klipler: imleç 2 sn kıpırdamazsa önce çok yavaş, sonra hızlanarak ekranın çoğunu kaplayacak kadar büyür.
   Beklerken tam kalite arka planda yüklenir. İmleç kıpırdayınca ya da çıkınca küçülür. */
(function () {
  var dokun = matchMedia("(hover: none)").matches;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hedef = null, zam = null, cik = null, kat = null, son = { x: 0, y: 0 }, kaydi = 0;
  addEventListener("scroll", function () { kaydi = Date.now(); if (kat && kat._evre1) { kapat(); hedef = null; } }, { passive: true });
  var pd = document.createElement("div");   // arka perde: büyürken kararıp bulanıklaşır, sonunda kapkara
  pd.style.cssText = "position:fixed;inset:0;z-index:9998;pointer-events:none;background:#000;opacity:0;backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px)";
  document.body.appendChild(pd);
  // hizli = YolHava klipleri: 1 sn bekler, hızlı büyür, arka kararmaz yalnız bokeh gibi bulanıklaşır
  var yz = document.createElement("div"); yz.className = "kat-yazi"; yz.innerHTML = "<b></b><span>Ömer Faruk Akıncı</span>"; document.body.appendChild(yz);
  function yaziGoster(k, R) {   // büyüyen fotoğrafın altında: paylaşırken yazdığım yazı (varsa, data-yazi) ve imza; R verilirse fotoğrafın ineceği yere göre
    var r = R || k.getBoundingClientRect(), t =hedef && (hedef.getAttribute("data-yazi") || (kaynak(hedef) || {}).getAttribute && kaynak(hedef).getAttribute("data-yazi")) || "";
    yz.firstChild.textContent = t; yz.firstChild.style.display = t ? "" : "none";
    yz.style.left = r.left + "px"; yz.style.width = r.width + "px"; yz.style.top = Math.min(innerHeight - 90, r.bottom + 10) + "px"; yz.classList.add("acik");
  }
  var ak = document.createElement("div"); ak.className = "kat-acik"; ak.innerHTML = "<h3></h3><div></div>"; document.body.appendChild(ak);
  function acikla(el, sol, x0, w, alt) {   // büyüyen klibin yanında: büyük, net başlık ve kısa açıklama (figcaption'dan)
    var f = el.closest("figure"), c = f && f.querySelector("figcaption"); if (!c) return;
    var b = c.querySelector("b"), bas = b ? b.textContent : "", ac = c.textContent.replace(bas, "").trim();
    var ul = c.querySelector("ul"); ac = (c.cloneNode(true)); var x = ac.querySelector("ul"); if (x) x.remove(); var y = ac.querySelector("b"); if (y) y.remove(); ac = ac.textContent.trim();
    ak.firstChild.textContent = bas || ac;
    if (ul) ak.lastChild.innerHTML = ul.outerHTML; else ak.lastChild.textContent = bas ? ac : "";
    var bas0 = sol ? x0 + w + innerWidth * .04 : innerWidth * .04, gen = sol ? innerWidth - (x0 + w) - innerWidth * .08 : x0 - innerWidth * .08;   // klibin boş kalan tarafı: küçük klipte de, büyümüşünde de
    if (alt != null) { ak.style.left = '5vw'; ak.style.width = '90vw'; ak.style.top = (alt + 16) + 'px'; ak.classList.add('alt'); }   // telefon: klibin altında
    else { ak.style.left = bas0 + "px"; ak.style.width = Math.max(220, gen) + "px"; ak.style.top = ''; ak.classList.remove('alt'); }
    ak.classList.add("acik");
  }
  function perde(ac, hizli, hemen) {
    if (hizli === "bokeh") {   // önce yalnız kararır; biraz bekleyince flu (bokeh) eklenir
      var kk = kat; pd.style.background = "rgba(0,0,0,.55)"; pd.style.transition = "opacity 1.8s cubic-bezier(.8,0,.95,.5), backdrop-filter .8s ease-out";   // kararma önce çok yavaş, sona doğru hızlı; sonra flu
      pd.style.opacity = "1"; pd.style.backdropFilter = pd.style.webkitBackdropFilter = "blur(0px)";
      setTimeout(function () { if (kat && kat === kk) pd.style.backdropFilter = pd.style.webkitBackdropFilter = "blur(16px) saturate(1.15)"; }, 1800); return; }
    pd.style.background = hizli ? "rgba(10,20,40,.12)" : "#000";
    pd.style.transition = !ac ? "opacity .4s ease, backdrop-filter .4s" : hizli ? "opacity .35s ease-out, backdrop-filter .45s ease-out"
      : hemen ? "opacity .35s ease-out, backdrop-filter .35s ease-out" : "opacity 1.5s cubic-bezier(.75,0,.9,.55), backdrop-filter .9s ease-out";
    pd.style.opacity = ac ? "1" : "0"; var b = !ac ? "blur(0px)" : hizli ? "blur(18px) saturate(1.35) brightness(1.05)" : "blur(14px)";
    pd.style.backdropFilter = b; pd.style.webkitBackdropFilter = b;
  }
  function kaynak(el) { if (el.closest(".montaj-ic")) return el.closest(".montaj").querySelector(".montaj-kare");
    return el.matches("video.gif") ? el : (el.querySelector(".hl-kutu img.on") || el.querySelector("video.gif") || el.querySelector("img")); }
  function kapat() { clearTimeout(zam); zam = null; clearTimeout(cik); cik = null; yz.classList.remove("acik"); ak.classList.remove("acik"); if (!kat) return; var k = kat; kat = null; perde(false);
    k.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1), opacity .45s"; k.style.transform = k._ilk; k.style.opacity = "0";
    setTimeout(function () { k.remove(); }, 460); }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && kat) kapat(); });   // Esc: büyüyen klip/fotoğraf kapanır
  function buyut() {
    var hz = hedef.matches("video.gif");   // klipler (fotoğraflar hariç): kararır + bokeh, sonra bulunduğu tarafa seri büyür, yanında büyük yazı
    var el = kaynak(hedef); if (!el) return;
    var r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    var oran = (el.videoWidth || el.naturalWidth || r.width) / (el.videoHeight || el.naturalHeight || r.height);
    var w = Math.min(vw * (dokun ? .94 : hz ? .5 : .62), vh * (dokun ? .8 : hz ? .72 : .72) * oran), h;
    if (hz) w = Math.min(Math.max(w, r.width * 1.3), vw * .96, vh * .92 * oran);   // klip en az %30 büyür
    h = w / oran;
    var k = el.tagName === "VIDEO" ? el.cloneNode(true) : new Image();
    if (k.tagName === "IMG") k.src = el.currentSrc || el.src;
    else { k.muted = true; k.loop = true; k.preload = "auto"; k.currentTime = el.currentTime || 0; }
    k.className = "buyuk-kat";
    var sol = r.left + r.width / 2 < vw / 2, x0 = hz && !dokun ? (sol ? vw * .04 : vw * .96 - w) : (vw - w) / 2;
    if (dokun) { w = Math.min(vw * .94, vh * .5 * oran); h = w / oran; x0 = (vw - w) / 2; }
    var y0 = dokun ? vh * .07 : (vh - h) / 2;   // telefonda üstte, altında açıklama
    k.style.cssText = "position:fixed;z-index:9999;left:" + x0 + "px;top:" + y0 + "px;width:" + w + "px;height:" + h +
      "px;object-fit:contain;background:#000;border-radius:10px;box-shadow:0 30px 90px rgba(0,0,0,.6);pointer-events:none;will-change:transform;transform-origin:0 0";
    var s = r.width / w, ilk = "translate(" + (r.left - x0) + "px," + (r.top - y0) + "px) scale(" + s + ")";
    k._ilk = ilk; k.style.transform = ilk; document.body.appendChild(k); kat = k; k._hz = hz; if (!hz) perde(true, false, true);
    if (k.play) { var p = k.play(); if (p && p.catch) p.catch(function () {}); }
    if (hz) {   // YolHava: 1) imlecin altındaki kalır, çevresi hızla kararır + "büyüteceğim" sinyali; 2) kararınca seri büyür, ortada orta boy
      k._evre1 = true; k.classList.add("sinyal"); perde(true, "bokeh");
      k._buyu = function () { if (kat !== k || !k._evre1) return; k._evre1 = false; k.classList.remove("sinyal");   // tıklayınca büyür
        pd.style.transition = "opacity .3s, backdrop-filter .3s"; pd.style.background = "rgba(0,0,0,.6)"; pd.style.opacity = "1"; pd.style.backdropFilter = pd.style.webkitBackdropFilter = "blur(18px) saturate(1.1)";   // büyürken yazı okunsun
        k.style.transition = "transform .28s cubic-bezier(.2,.9,.3,1)"; k.style.transform = "none";
        setTimeout(function () { if (kat === k) acikla(hedef, sol, x0, w, dokun ? y0 + h : null); }, 200); };
      if (dokun) setTimeout(k._buyu, 120);
      else setTimeout(function () { if (kat === k && k._evre1) acikla(hedef, sol, r.left, r.width, null); }, 1850);   // bulanıklık son dozuna gelirken (2 sn + .9 sn) açıklama tıklamadan, klibin boş tarafında
    } else {   // fotoğraf/hikâye: önce çevre hızla kararır, sonra yavaşça büyümeye başlar; 1,5 sn kalınırsa hızlanıp tamamlanır
      var ara = "translate(" + (r.left - (vw - w) / 2) * .6 + "px," + (r.top - (vh - h) / 2) * .6 + "px) scale(" + (s + (1 - s) * .35) + ")";
      setTimeout(function () { if (kat !== k) return; k.style.transition = "transform 1.15s cubic-bezier(.4,0,.6,1)"; k.style.transform = ara; }, 350);
      setTimeout(function () { if (kat === k) yaziGoster(k, { left: x0, width: w, bottom: y0 + h }); }, 420);   // perde bulanıklığı tamamlanır tamamlanmaz yazı, fotoğrafın ineceği yerin altında
      setTimeout(function () { if (kat !== k) return; k.style.transition = "transform .55s cubic-bezier(.3,.7,.2,1)"; k.style.transform = "none"; }, 1500);
    }
  }
  function on(el) {   // bekleme sırasında tam kaliteyi hazırla
    if (el.matches("video.gif")) { if (el.preload !== "auto") { el.preload = "auto"; el.load(); } }
    else el.querySelectorAll("img[data-src]").forEach(function (x) { if (x.getAttribute("src") !== x.dataset.src) x.src = x.dataset.src; });
  }
  // İmleç gelir gelmez yavaşça büyümeye başlar; imleç büyüyen görselin ya da kartın içinde kaldıkça sürer.
  // Kapanır: görselin dışına çıkınca ya da tıklayınca.
  function icinde(el, x, y) { if (!el) return false; var r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var x = e.clientX, y = e.clientY;
    if (kat) {
      var r1 = kat.getBoundingClientRect(), r2 = hedef ? hedef.getBoundingClientRect() : r1;   // kart ile büyük görsel arası boşluk da "içeride" sayılır
      if (x >= Math.min(r1.left, r2.left) && x <= Math.max(r1.right, r2.right) && y >= Math.min(r1.top, r2.top) && y <= Math.max(r1.bottom, r2.bottom)) {   // içerideyken kare kaydırmayı büyük görsele de yansıt
        var su = hedef && hedef.querySelector && hedef.querySelector(".hl-kutu img.on");
        if (su && kat.tagName === "IMG" && kat.src !== (su.currentSrc || su.src)) kat.src = su.currentSrc || su.src;
        clearTimeout(cik); cik = null; return;
      }
      if (kat._hz && !kat._evre1) { clearTimeout(cik); cik = null; return; }   // YolHava büyüdükten sonra: yalnız boşa tıklayınca kapanır
      if (!kat._hz) {   // fotoğraf: dışarı çıkınca 2 sn bekler (geri gelirsen açık kalır); hızlı kapatmak için boş yere tıkla
        if (!cik) cik = setTimeout(function () { cik = null; kapat(); hedef = null; }, 2000);
        return;
      }
      kapat(); hedef = null;
    }
    var el = e.target.closest && e.target.closest(".hl, video.gif, .montaj-ic img");
    if (el === hedef) return;
    if (el && el.closest(".montaj-ic")) { var mk = el.closest(".montaj").querySelector(".montaj-kare"); mk.src = el.currentSrc || el.src; }   // şeritteki kare önce büyük çerçevede görünür
    clearTimeout(zam); hedef = el;
    if (el) { on(el); if (Date.now() - kaydi < 350) { hedef = null; return; }   // tekerlek hızlı dönüyorsa tetikleme
    zam = setTimeout(function () { if (hedef === el) buyut(); }, 260); }   // görseller arasında geçerken yanlışlıkla açılmasın: imleç ~0,26 sn durmalı
  }, { passive: true });
  var yut = false;
  document.addEventListener("click", function (e) {
    if (yut) { yut = false; e.preventDefault(); e.stopPropagation(); return; }   // uzun basışın ardından gelen tık
    if (kat && kat._evre1 && kat._buyu) { kat._buyu(); e.preventDefault(); e.stopPropagation(); return; }   // klip: kararınca tıkla → büyür
    if (kat) { kapat(); hedef = null; if (dokun) { e.preventDefault(); e.stopPropagation(); } }
  }, true);
  if (dokun) {   // Telefon: basılı tut (0,45 sn) → büyür; herhangi bir yere dokun → kapanır. Kaydırma başlarsa iptal.
    var bas = null, bx = 0, by = 0;
    document.addEventListener("touchstart", function (e) {
      var el = e.target.closest && e.target.closest(".hl, video.gif"); if (!el || kat) return;
      var t = e.touches[0]; bx = t.clientX; by = t.clientY; on(el);
      bas = setTimeout(function () { bas = null; hedef = el; buyut(); yut = true; if (navigator.vibrate) navigator.vibrate(8); }, 450);
    }, { passive: true });
    document.addEventListener("touchmove", function (e) { if (!bas) return; var t = e.touches[0];
      if (Math.abs(t.clientX - bx) + Math.abs(t.clientY - by) > 10) { clearTimeout(bas); bas = null; } }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (!bas) return; clearTimeout(bas); bas = null;
      var el = e.target.closest && e.target.closest("video.gif"); if (!el || kat) return;   // klipte kısa dokunuş: hemen büyüt + açıklama
      hedef = el; on(el); buyut(); yut = true;
    }, { passive: true });
    document.addEventListener("contextmenu", function (e) { if (e.target.closest && e.target.closest(".hl, video.gif")) e.preventDefault(); });
  }
})();

/* Yükleme önceliği: önce ekrandaki klipler (yukarıdaki gözlemci). Kaydırma durunca yakındaki
   (yaklaşık iki ekran içindeki) klipler, ekrana yakın olandan başlayarak tek tek arka planda iner. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  var yakin = new Set(), dur = null, calisiyor = false;
  var io = new IntersectionObserver(function (gs) { gs.forEach(function (g) { g.isIntersecting ? yakin.add(g.target) : yakin.delete(g.target); }); planla(); },
    { rootMargin: "1800px 0px" });
  document.querySelectorAll("video.gif").forEach(function (v) { io.observe(v); });
  function planla() { clearTimeout(dur); dur = setTimeout(sira, 700); }
  addEventListener("scroll", planla, { passive: true });
  function sira() {
    if (calisiyor) return;
    var orta = innerHeight / 2, en = null, ed = 1e9;
    yakin.forEach(function (v) { if (v.preload === "auto") { yakin.delete(v); return; }
      var r = v.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - orta); if (d < ed) { ed = d; en = v; } });
    if (!en) return;
    calisiyor = true; yakin.delete(en); en.preload = "auto"; en.load();
    var bitti = function () { calisiyor = false; en.removeEventListener("canplaythrough", bitti); setTimeout(sira, 50); };
    en.addEventListener("canplaythrough", bitti); setTimeout(function () { if (calisiyor) bitti(); }, 4000);
  }
})();

/* İlerleme bulutu: üstteki çubuğun yerine bir kümülüs. Sayfa ilerledikçe sağa kayar ve biraz büyür;
   her bölümde hava değişir: bulut → güneş doğar → hüzmeler artar → şimşek → yağmur → güneş döner → yalnız güneş. */
(function () {
  var sira = ["projeler", "yemek", "naplist", "yayin", "temsilcilik", "fotograf", "takim"];
  var b = document.createElement("div"); b.className = "hava-bulut"; b.setAttribute("aria-hidden", "true");
  var isin = ""; for (var a = 0; a < 360; a += 30) isin += '<line x1="0" y1="-17" x2="0" y2="-25" transform="rotate(' + a + ')"/>';
  var yag = ""; for (var r = 0; r < 6; r++) yag += '<line x1="' + (30 + r * 8) + '" y1="44" x2="' + (27 + r * 8) + '" y2="52" style="animation-delay:' + (r * .13) + 's"/>';
  b.innerHTML = '<svg viewBox="0 0 100 64" width="100" height="64"><g class="hb-jel">' +
    '<g class="hb-gunes" transform="translate(66 24)"><g class="hb-isin">' + isin + '</g><circle r="12"/></g>' +
    '<path class="hb-bulut" d="M22 44h52a12 12 0 0 0 0-24 16 16 0 0 0-30-6 12 12 0 0 0-20 8 11 11 0 0 0-2 22z"/>' +
    '<polygon class="hb-simsek" points="50,40 43,52 49,52 45,62 57,48 51,48 55,40"/>' +
    '<g class="hb-yagmur">' + yag + '</g></g></svg><span class="hb-ad"></span>';
  var adlar = ["YolHava", "İTÜ Yemek", "Naplist", "Canlı yayın", "Temsilcilik", "Fotoğraf", "Proje takımı", "İletişim"], ad = b.querySelector(".hb-ad");
  document.body.appendChild(b);
  var kok = document.documentElement, bk = false;
  function ciz() {
    bk = false;
    var top = kok.scrollHeight - innerHeight, p = top > 0 ? Math.min(1, scrollY / top) : 0, ev = 0;
    for (var i = 0; i < sira.length; i++) { var s = document.getElementById(sira[i]); if (s && s.getBoundingClientRect().top < innerHeight * .5) ev = i; }
    if (p > .985) ev = 7;
    if (b.dataset.evre != ev) { b.dataset.evre = ev; ad.textContent = adlar[ev]; }
    b.style.transform = "translateX(" + (window.hizaX ? window.hizaX(p) - 61 : p * (innerWidth - 120)).toFixed(1) + "px)"; b.firstChild.style.transform = "scale(" + (.85 + p * .3).toFixed(3) + ")";
  }
  addEventListener("scroll", function () { if (!bk) { bk = true; requestAnimationFrame(ciz); } }, { passive: true });
  addEventListener("resize", ciz); ciz();

  // Bulutu tutup yana sürükle: sayfa o noktaya gider. Bulut su dolu balon gibi: hızlı çekince çok, yavaş çekince az esner; bırakınca yaylanarak oturur.
  var jel = b.querySelector(".hb-jel"), tut = false, sonX = 0, sonT = 0, hiz = 0, sx = 1, sy = 1, vs = 0, sk = 0, vk = 0, dongu = false;
  function fizik() {
    var hedefS = 1 + Math.min(.45, Math.abs(hiz) / 2400), hedefK = Math.max(-20, Math.min(20, -hiz / 70));
    if (!tut) { hedefS = 1; hedefK = 0; hiz *= .85; }
    vs = (vs + (hedefS - sx) * .18) * .78; sx += vs;          // yay + sönüm: bırakınca birkaç kez salınır
    vk = (vk + (hedefK - sk) * .16) * .8; sk += vk;
    sy = 1 / Math.sqrt(Math.max(.6, sx));                       // hacim korunur: uzarken incelir
    jel.style.transform = "skewX(" + sk.toFixed(2) + "deg) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
    if (tut || Math.abs(sx - 1) > .002 || Math.abs(vs) > .002 || Math.abs(sk) > .05) requestAnimationFrame(fizik); else { jel.style.transform = ""; dongu = false; }
  }
  function basla() { if (!dongu) { dongu = true; requestAnimationFrame(fizik); } }
  function git(x) { var a = window.hizaX ? window.hizaX(0) : 61, z = window.hizaX ? window.hizaX(1) : innerWidth - 61;
    var p = Math.max(0, Math.min(1, (x - a) / (z - a))), y = p * (kok.scrollHeight - innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); }   // Lenis açıkken düz scrollTo ezilir
  b.addEventListener("pointerdown", function (e) {
    tut = true; b.setPointerCapture(e.pointerId); b.classList.add("tutuldu"); sonX = e.clientX; sonT = performance.now(); hiz = 0;
    vs -= .12; basla(); e.preventDefault();                     // dokununca balon gibi içe göçer
  });
  b.addEventListener("pointermove", function (e) { if (!tut) return; var t = performance.now(), dt = Math.max(8, t - sonT);
    hiz = hiz * .6 + ((e.clientX - sonX) / dt * 1000) * .4; sonX = e.clientX; sonT = t; git(e.clientX); });
  function birak() { if (!tut) return; tut = false; b.classList.remove("tutuldu"); vk += hiz / 400; basla(); }
  b.addEventListener("pointerup", birak); b.addEventListener("pointercancel", function () { if (dokunId === null) birak(); });   // tarayıcı pointer'ı iptal etse de parmak hâlâ ekrandaysa dokunma yolu devam eder
  // telefon: tarayıcı parmağı sayfa kaydırması sanıp sürüklemeyi iptal etmesin (iOS Safari touch-action'a tam uymaz)
  b.addEventListener("touchstart", function (e) { e.preventDefault(); }, { passive: false });
  b.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  // Telefon yedeği: pointer yakalama çalışmasa da (bazı tarayıcılar, dokunma hedef kaydırması) belgedeki dokunma bulutun yakınındaysa sürükleme dokunma olaylarıyla yürür
  var dokunId = null, yalnizGoster = matchMedia('(hover:none)').matches;   // telefonda bulut dokunulamaz, yalnız gösterir (Akın 4 Eki)
  function yakin(t) { var r = b.getBoundingClientRect(); return t.clientX > r.left - 28 && t.clientX < r.right + 28 && t.clientY > r.top - 28 && t.clientY < r.bottom + 16; }
  document.addEventListener("touchstart", function (e) {
    if (yalnizGoster || dokunId !== null || document.documentElement.classList.contains("beyaz-mod")) return;
    var t = e.changedTouches[0]; if (!yakin(t)) return;
    dokunId = t.identifier; e.preventDefault(); if (tut) return;   // pointer yolu zaten tuttuysa yalnız kimliği not et (pointercancel gelirse dokunma yolu sürdürür)
    tut = true; b.classList.add("tutuldu"); sonX = t.clientX; sonT = performance.now(); hiz = 0; vs -= .12; basla();
  }, { passive: false });
  document.addEventListener("touchmove", function (e) {
    if (dokunId === null) return; var t = null; for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === dokunId) t = e.changedTouches[i];
    if (!t) return; e.preventDefault(); var n = performance.now(), dt = Math.max(8, n - sonT);
    hiz = hiz * .6 + ((t.clientX - sonX) / dt * 1000) * .4; sonX = t.clientX; sonT = n; git(t.clientX);
  }, { passive: false });
  function dokunBitti(e) { if (dokunId === null) return; for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === dokunId) { dokunId = null; birak(); } }
  document.addEventListener("touchend", dokunBitti); document.addEventListener("touchcancel", dokunBitti);
})();


/* Üst menü bir zaman çizgisi: her başlık, bölümün sayfadaki sırasına ve yerine göre bulutun yolu üzerinde durur.
   Menüden atlayınca solda "kaldığın yere dön" bulutu salınarak bekler. */
(function () {
  var kok = document.documentElement, bag = document.querySelector(".menu-bag"); if (!bag) return;
  var linkler = Array.prototype.slice.call(bag.querySelectorAll('a[href^="#"]'));
  function hedefY(a) { var h = document.querySelector(a.getAttribute("href")); return h ? h.getBoundingClientRect().top + scrollY - 64 : 0; }
  function genis() { return innerWidth >= 900; }
  window.hizaX = function (p) { var a = genis() ? 230 : 61, b = innerWidth - (genis() ? 70 : 61); return a + p * (b - a); };
  function diz() {
    var top = kok.scrollHeight - innerHeight;
    linkler.sort(function (x, y) { return hedefY(x) - hedefY(y); }).forEach(function (a) { bag.appendChild(a); });
    if (!genis()) { bag.classList.remove("cizgi"); linkler.forEach(function (a) { a.style.left = ""; }); return; }
    bag.classList.add("cizgi"); var son = -1e9, xs = [];
    linkler.forEach(function (a) {
      var x = window.hizaX(Math.max(0, Math.min(1, hedefY(a) / top))), w = a.offsetWidth;
      x = Math.max(x, son + w / 2 + 6); x = Math.min(x, innerWidth - w / 2 - 8); son = x + w / 2;
      xs.push(x);
    });
    /* sağ kenara yapışan son başlıklar öncekilerin üstüne binmesin: sağdan sola ikinci geçiş */
    for (var i = linkler.length - 2; i >= 0; i--) {
      var wi = linkler[i].offsetWidth, wn = linkler[i + 1].offsetWidth;
      xs[i] = Math.min(xs[i], xs[i + 1] - wn / 2 - wi / 2 - 6);
    }
    linkler.forEach(function (a, i) { a.style.left = (xs[i] - a.offsetWidth / 2) + "px"; });
  }
  addEventListener("load", diz); addEventListener("resize", diz); setTimeout(diz, 1500); setTimeout(diz, 5000); diz();

  var g = document.createElement("button"); g.type = "button"; g.className = "geri-bulut"; g.hidden = true;
  g.innerHTML = '<svg viewBox="0 0 100 60" width="96" height="58" aria-hidden="true"><path d="M22 46h52a12 12 0 0 0 0-24 16 16 0 0 0-30-6 12 12 0 0 0-20 8 11 11 0 0 0-2 22z"/>' +
    '<path class="gb-ok" d="M58 34H40m0 0 7-7m-7 7 7 7"/></svg><b>Kaldığın yere dön</b><small>henüz görmediğin şeyler var</small>';
  document.body.appendChild(g);
  var donY = null;
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2) return;
    var y = hedefY(a); if (Math.abs(y - scrollY) < innerHeight) return;
    donY = scrollY; setTimeout(function () { g.hidden = false; requestAnimationFrame(function () { g.classList.add("acik"); }); }, 900);
  }, true);
  function gizle() { g.classList.remove("acik"); setTimeout(function () { if (!g.classList.contains("acik")) g.hidden = true; }, 400); }
  g.addEventListener("click", function () { if (donY === null) return; var y = donY; donY = null; gizle();
    scrollTo({ top: y, behavior: "smooth" }); });
  addEventListener("scroll", function () { if (donY !== null && !g.hidden && Math.abs(scrollY - donY) < 200) { donY = null; gizle(); } }, { passive: true });
})();


/* Kampüs ızgarası: imleç bir fotoğrafa gelir gelmez o fotoğraf üstteki büyük çerçeveye hızlıca kayar (döngü 6 sn bekler). */
(function () {
  var zam = null;
  document.querySelectorAll(".foto-ayrac").forEach(function (iz) {
    var m = iz.previousElementSibling; while (m && !(m.classList && m.classList.contains("montaj"))) m = m.previousElementSibling;
    if (!m) return; var kare = m.querySelector(".montaj-kare");
    iz.addEventListener("pointerover", function (e) { var im = e.target.closest("img"); clearTimeout(zam); if (!im) return;
      var yon = e.clientX < (kare.getBoundingClientRect().left + kare.offsetWidth / 2) ? -1 : 1;
      zam = setTimeout(function () { m._tut = Date.now() + 6000; kare.classList.add("hizli"); kaydirDegis(kare, im.currentSrc || im.src, yon); }, 120); });
    iz.addEventListener("pointerleave", function () { clearTimeout(zam); });
  });
})();


/* Sokak ve şehir: ortada büyük dikey ana fotoğraf (aşağı kaydırdıkça yanlar bitene dek seninle gelir), sağda-solda küçükler.
   İmleç bir küçüğün üstüne gelince o hemen ortada görünür; imleç yoksa ana fotoğraf biraz daha hızlı sırayla değişir. Büyütme yok. */
(function () {
  var kap = document.querySelector(".sokak-sahne"), M0 = window.MONTAJ || {}, L = (M0.sokak || []).concat(M0.hl || []); if (!kap || !L || !L.length) return;
  var sol = "", sag = "";
  // Simetrik yerleşim: her satır 4 yuvalık. Seriler (aynı gönderi/yer) kendi satırında yan yana, tekler 4'erli satırda.
  // Satırlar çift çift eşlenir (seri–seri, tek–tek) ve sola/sağa aynı yüksekliğe konur: iki taraf ayna gibi.
  var gr = [], son = null;
  L.forEach(function (u, i) { var key = (M0.grup || [])[i]; if (key === undefined) key = "t" + i;
    if (!son || son.k !== key) { son = { k: key, ii: [] }; gr.push(son); } son.ii.push(i); });
  // 2-3-2-3 düzeni: kareler (gruplar bitişik) sırayla akar; her satır çifti solda ve sağda aynı sayıda: tam ayna simetri
  var duz = []; gr.forEach(function (g) { duz = duz.concat(g.ii); });
  function img(i) { return '<img src="' + L[i] + '" data-i="' + i + '" alt="" loading="lazy" decoding="async" width="420" height="600">'; }
  function sira(ii, n) { var h = ii.map(img).join(""); for (var z = ii.length; z < n; z++) h += "<i></i>"; return '<div class="ss-sira s' + n + '">' + h + '</div>'; }
  // dikeyler uçlarda ve büyük fotoğrafın yanında, yataylar ortada: 2'li satır [D,D], 3'lü satır [D,Y,D]
  var yon = M0.yon || [], V = duz.filter(function (i) { return yon[i] !== "h"; }), Hh = duz.filter(function (i) { return yon[i] === "h"; });
  function al(t) { var a = t === "h" ? Hh : V, b = t === "h" ? V : Hh; return a.length ? a.shift() : b.shift(); }
  for (var k = 0; V.length + Hh.length > 0; k++) { var tip = k % 2 ? ["v", "h", "v"] : ["v", "v"];
    [0, 1].forEach(function (yan) { var ii = []; tip.forEach(function (t) { var x = al(t); if (x !== undefined) ii.push(x); });
      if (yan === 0) sol += sira(ii, tip.length); else sag += sira(ii, tip.length); }); }
  kap.innerHTML = '<div class="ss-yan">' + sol + '</div><div class="ss-orta"><img class="ss-ana" src="' + L[0] + '" alt="Sokak fotoğrafı" width="420" height="600"></div><div class="ss-yan">' + sag + '</div>';
  var ana = kap.querySelector(".ss-ana"), k = kap.querySelectorAll(".ss-yan img"), i = 0, ust = false, gorunur = false;
  var bul = {}; Array.prototype.forEach.call(k, function (x) { bul[x.dataset.i] = x; });
  var flas = document.createElement("div"); flas.className = "flas"; flas.setAttribute("aria-hidden", "true"); document.body.appendChild(flas);
  var sonFlas = 0;
  function patlat(hizli) {                                      // flaş geçişle aynı sürede; üst üste hızlı geçişlerde neredeyse belli olmayan minik parlama
    var t = performance.now(), sik = t - sonFlas < 700; sonFlas = t;
    flas.style.setProperty("--fp", sik ? ".12" : ".5"); flas.style.setProperty("--fs", (sik ? .25 : hizli ? .35 : .55) + "s");
    flas.classList.remove("ac"); void flas.offsetWidth; flas.classList.add("ac"); }
  function goster(n, hizli, yon) { var once = i; i = (n + L.length) % L.length; if (i === once && !hizli) return; ana.classList.toggle("hizli", !!hizli);
    kaydirDegis(ana, L[i], yon || 1); if (document.documentElement.classList.contains("beyaz-mod")) patlat(hizli);
    Array.prototype.forEach.call(k, function (x) { x.classList.toggle("su", +x.dataset.i === i); }); }
  var bek = null;
  var sonPX = 0, yonIm = 1;
  kap.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { if (e.clientX !== sonPX) yonIm = e.clientX > sonPX ? 1 : -1; sonPX = e.clientX; } }, { passive: true });
  kap.addEventListener("pointerover", function (e) { var x = e.target.closest(".ss-yan img"); clearTimeout(bek); if (!x) return; ust = true;
    bek = setTimeout(function () { if (+x.dataset.i !== i) goster(+x.dataset.i, true, yonIm); }, 90); });   // imlecin gittiği yöne kayar; hızlı geçince hızlı değişir
  // parmakla / fareyle sürükle: hangi yöne çektiysen fotoğraf o yöne kayar, sıradaki gelir
  var sx = null, sy = 0;
  kap.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; }, { passive: true });
  kap.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.3) { ust = true; goster(dx < 0 ? i + 1 : i - 1, true, dx < 0 ? 1 : -1); setTimeout(function () { ust = false; }, 4000); } });
  kap.addEventListener("pointerleave", function () { ust = false; });
  new IntersectionObserver(function (g) { gorunur = g[0].isIntersecting; }).observe(kap);
  setInterval(function () { if (gorunur && !ust && !document.hidden) { var y = new Image(); y.src = L[(i + 1) % L.length]; goster(i + 1, false, 1); } }, 3200);
  goster(0, true);
  // sahneye 2 ekran kala tüm küçükleri yüklemeye başla: hızlı gelince (menüden atlayınca) bembeyaz boş sahne görünmesin
  new IntersectionObserver(function (g, o) { if (g[0].isIntersecting) { Array.prototype.forEach.call(k, function (x) { x.loading = "eager"; }); o.disconnect(); } },
    { rootMargin: "200% 0px" }).observe(kap);
})();


/* Bulut imleç: fare imleci gibi uçlu küçük bir bulut. Tıklanacak bir yerin üstünde ıslanıp koyulaşır ve "tıkla" der;
   beklemeye devam edersen yağmur yağdırır, daha da beklersen şimşek çakar. Yalnız fareli cihazlarda. */
(function () {
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var TIK = "a,button,[role=button],summary,label,select,video.gif,.hl,.ss-yan img,.montaj-ic img,.r-kart,.hava-bulut,.geri-bulut,.cer:not(.dmg-foto *),.gif-kart";
  var im = document.createElement("div"); im.className = "bulut-imlec"; im.setAttribute("aria-hidden", "true"); im.style.transform = "translate(-200px,-200px)";
  var yag = ""; for (var i = 0; i < 4; i++) yag += '<line x1="' + (12 + i * 5) + '" y1="25" x2="' + (10 + i * 5) + '" y2="31" style="animation-delay:' + i * .12 + 's"/>';
  // imleç = ucu ok gibi sivri bir şimşek; arkasında minik bir bulut
  im.innerHTML = '<svg class="bi-ana" viewBox="0 0 40 40" width="44" height="44">' +
    '<polygon class="bi-simsek-uc" points="1.5,1.5 13,3.5 9.2,7 17.5,9 12.8,11.8 20,17 5.5,10.2 9.6,7.8 2.5,6.2"/>' +
    '<g transform="rotate(-24 23 17)"><path class="bi-bulut" d="M14.5 22.5h14a4.4 4.4 0 0 0 1-8.7 5.8 5.8 0 0 0-11-1.8 4.6 4.6 0 0 0-6.6 3.6 3.5 3.5 0 0 0 2.6 6.9z"/></g>' +
    '<g class="bi-yag">' + yag + '</g></svg>' +
    '<svg class="bi-kamera" viewBox="0 0 40 40" width="52" height="52"><rect x="4" y="12" width="32" height="22" rx="4"/><rect x="14" y="7" width="12" height="6" rx="2"/><circle cx="20" cy="23" r="7" class="bk-lens"/><circle cx="20" cy="23" r="3.2" class="bk-ic"/><circle cx="31" cy="16" r="1.5" class="bk-flas"/></svg><span>tıkla</span>';
  document.body.appendChild(im); document.documentElement.classList.add("bulut-imlec-acik");
  var x = -100, y = -100, ciz = false, zam1 = null, zam2 = null, ust = null;
  function yaz() { ciz = false; im.style.transform = "translate(" + x + "px," + y + "px)"; }
  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return; x = e.clientX; y = e.clientY; if (!ciz) { ciz = true; requestAnimationFrame(yaz); }
    var t = e.target.closest && e.target.closest(TIK);
    if (t !== ust) { ust = t; clearTimeout(zam1); clearTimeout(zam2); im.classList.remove("yagmur", "simsek"); im.classList.toggle("islak", !!t);
      if (t) { zam2 = setTimeout(function () { im.classList.add("simsek"); }, 2600); } }
  }, { passive: true });
  document.addEventListener("pointerdown", function () { im.classList.add("bas"); setTimeout(function () { im.classList.remove("bas"); }, 180); });
  document.addEventListener("mouseleave", function () { im.style.opacity = "0"; });
  document.addEventListener("mouseenter", function () { im.style.opacity = ""; });
})();


/* Beyaz fotoğraf sahnesine gelince: tüm site beyaz, menü/bulut/düğmeler gizli (minimum arayüz), imleç fotoğraf makinesi */
(function () {
  var sahne = document.querySelector(".sokak-sahne"); if (!sahne || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (g) { document.documentElement.classList.toggle("beyaz-mod", g[0].isIntersecting); },
    { rootMargin: "-40% 0px -40% 0px" }).observe(sahne);
})();

/* TAM EKRAN (PC): tarayıcılar tıklamasız tam ekrana izin vermez; sayfadaki İLK tıklama tam ekranı açar,
   ayrıca sağ altta belirgin bir "Tam ekran" düğmesi durur. Esc ile çıkılır. */
(function () {
  if (!document.documentElement.requestFullscreen || matchMedia("(hover: none)").matches) return;
  var d = document.createElement("button"); d.type = "button"; d.className = "tam-ekran"; d.innerHTML = "⛶ Tam ekranda gez";
  document.body.appendChild(d);
  function ac() { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); }
  d.addEventListener("click", function (e) { e.stopPropagation(); document.fullscreenElement ? document.exitFullscreen() : ac(); });
  document.addEventListener("fullscreenchange", function () { d.classList.toggle("gizli", !!document.fullscreenElement); });
  ac();                                                        // açılışta dene (tarayıcı izin verirse F11 gibi açılır)
  document.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && !document.fullscreenElement) ac(); }, true);   // çıkılsa bile ilk tıklamada geri döner
  document.addEventListener("keydown", function (e) { if (!document.fullscreenElement && e.key !== "Escape") ac(); }, true);
})();

/* Her bölüme bir önceki bölümün zemin rengini ver: üst kenarda yumuşak geçiş için */
(function () {
  var b = document.querySelectorAll("section.blok, main > section, #takim, #iletisim");
  var onceki = getComputedStyle(document.body).backgroundColor;
  Array.prototype.forEach.call(b, function (s) {
    s.style.setProperty("--onceki", onceki);
    if (s.id === "iletisim") { var kendi = getComputedStyle(s).backgroundColor; s.style.backgroundImage = "linear-gradient(to bottom," + onceki + " 0," + kendi + " clamp(260px,38vh,520px))"; return; }
    if (s.id === "takim") { onceki = "#f8f5ee"; return; }   // proje takımı: krem (vitrin + içkin gövde aynı ton)
    var cs = getComputedStyle(s), z = cs.getPropertyValue("--zemin").trim() || cs.getPropertyValue("--kagit").trim() || cs.backgroundColor;
    if (z && z !== "rgba(0, 0, 0, 0)" && z !== "transparent") onceki = z;   // şeffafsa önceki renk sürer
  });
})();

/* "Bu işin çıkması için gerekenler": zihin haritası — ortada merkez, iki yana dallar, eğri bağlantılar; ekrana girince sırayla belirir */
(function () {
  document.querySelectorAll('.yetkin[data-harita]').forEach(function (y) {
    var h3 = y.querySelector('h3'), p = y.querySelector('p'), li = [].slice.call(y.querySelectorAll('li')); if (!p || !li.length) return;
    var sol = document.createElement('div'), sag = document.createElement('div'), hub = document.createElement('div'), map = document.createElement('div');
    sol.className = 'zh-yan sol'; sag.className = 'zh-yan sag'; hub.className = 'zh-hub'; map.className = 'zh';
    hub.innerHTML = '<b>Gerekenler</b><span>' + p.textContent + '</span>';
    li.forEach(function (l, i) { var d = document.createElement('div'); d.className = 'zh-dal'; d.style.setProperty('--i', i + 1); d.innerHTML = l.innerHTML; (i % 2 ? sag : sol).appendChild(d); });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'zh-cizgi');
    map.appendChild(svg); map.appendChild(sol); map.appendChild(hub); map.appendChild(sag);
    y.innerHTML = ''; y.appendChild(h3); y.appendChild(map);
    function ciz() {
      var r = map.getBoundingClientRect(), hr = hub.getBoundingClientRect(), html = '';
      svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
      var hy = hr.top - r.top + hr.height / 2;
      map.querySelectorAll('.zh-dal').forEach(function (d, i) {
        var b = d.getBoundingClientRect(), solda = d.parentNode.classList.contains('sol');
        var x1 = solda ? hr.left - r.left : hr.right - r.left, x2 = solda ? b.right - r.left : b.left - r.left, y2 = b.top - r.top + b.height / 2;
        html += '<path d="M' + x1 + ' ' + hy + ' C ' + (x1 + x2) / 2 + ' ' + hy + ', ' + (x1 + x2) / 2 + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" style="--i:' + (i + 1) + '"/>';
      });
      svg.innerHTML = html;
    }
    ciz(); addEventListener('resize', ciz);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (g, o) { if (g[0].isIntersecting) { ciz(); y.classList.add('zh-ac'); o.disconnect(); } }, { threshold: .2 }).observe(y);
    else y.classList.add('zh-ac');
  });
})();

/* Yön galerisi: telefonda dokununca açıklama açılır/kapanır (hover yok) */
(function () {
  document.querySelectorAll('.yg-kart').forEach(function (k) {
    k.addEventListener('click', function () { var ac = k.classList.contains('ac'); document.querySelectorAll('.yg-kart.ac').forEach(function (x) { x.classList.remove('ac'); }); if (!ac) k.classList.add('ac'); });
  });
})();


/* Naplist mini deneme: baloncuğu basılı tut (~0,5 sn) → menü açılır → yöne sürükle → bırak: ilerleme küçültür + halka dolar, zorluk büyütür, tarih rengi canlandırır, bitti soldurur */
(function () {
  var alan = document.querySelector('#np-deneme .np-alan'); if (!alan) return;
  var menu = alan.querySelector('.np-menu'), aktif = null, zam = null, acik = false, x0 = 0, y0 = 0, sec = null;
  function konum(e) { var r = alan.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function yon(dx, dy) { if (Math.hypot(dx, dy) < 34) return null; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); }
  alan.addEventListener('pointerdown', function (e) {
    var g = e.target.closest('.np-g'); if (!g) return; e.preventDefault(); aktif = g; g.setPointerCapture(e.pointerId); g.classList.add('tut');
    var k = konum(e); x0 = k[0]; y0 = k[1]; acik = false; sec = null;
    zam = setTimeout(function () { acik = true; menu.hidden = false; var W = alan.clientWidth, H = alan.clientHeight, cx = Math.max(150, Math.min(W - 150, g.offsetLeft)), cy = Math.max(112, Math.min(H - 112, g.offsetTop)); menu.style.left = cx + 'px'; menu.style.top = cy + 'px'; requestAnimationFrame(function () { menu.classList.add('ac'); }); }, 480);
  });
  alan.addEventListener('pointermove', function (e) {
    if (!aktif) return; var k = konum(e), dx = k[0] - x0, dy = k[1] - y0;
    if (!acik) { if (Math.hypot(dx, dy) > 10) { aktif.style.left = (aktif.offsetLeft + dx) + 'px'; aktif.style.top = (aktif.offsetTop + dy) + 'px'; x0 = k[0]; y0 = k[1]; } return; }   // menü açılmadan: baloncuğu taşı
    var y = yon(dx, dy); if (y !== sec) { sec = y; menu.querySelectorAll('i').forEach(function (i) { i.classList.toggle('sec', i.dataset.y === y); }); }
  });
  function birak() {
    clearTimeout(zam); if (!aktif) return; var g = aktif; aktif = null; g.classList.remove('tut'); menu.classList.remove('ac'); setTimeout(function () { menu.hidden = true; }, 220);
    if (!acik || !sec) return; var s = parseFloat(g.style.getPropertyValue('--s')) || 1, h = parseFloat(g.style.getPropertyValue('--halka')) || 0;
    if (sec === 'u') { h = Math.min(100, h + 34); g.style.setProperty('--halka', h); g.style.setProperty('--s', Math.max(.55, s - .18)); if (h >= 100) g.classList.add('bitti'); }
    else if (sec === 'd') g.style.setProperty('--s', Math.min(1.7, s + .2));
    else if (sec === 'r') { g.style.setProperty('--r', '#ff4d3d'); g.style.setProperty('--s', Math.min(1.7, s + .08)); }
    else { g.classList.add('bitti'); g.style.setProperty('--halka', 100); g.style.setProperty('--s', Math.max(.5, s - .3)); }
  }
  alan.addEventListener('pointerup', birak); alan.addEventListener('pointercancel', birak);
})();

/* Yön galerisi: bir karta gelince galeri bütünüyle bulanır, o kartın açıklaması galerinin üstünde büyük yazıyla
   (Akın 5 Eki: bulanıklık son dozuna gelince yazı doğrudan üstünde; kart içindeki küçük yazı yerine). Dokunmatikte .ac (dokununca) aynı yolu kullanır. */
(function () {
  var g = document.querySelector(".yon-galeri"); if (!g) return;
  var y = document.createElement("div"); y.className = "yg-yazi"; y.setAttribute("aria-hidden", "true"); y.innerHTML = "<b></b><span></span>"; g.appendChild(y);
  var acik = null;
  function goster(k) { var c = k.querySelector("figcaption"); if (!c) return; var b = c.querySelector("b"), s = c.querySelector("span");
    y.firstChild.textContent = b ? b.textContent : ""; y.lastChild.textContent = s ? s.textContent : c.textContent; g.classList.add("odak"); acik = k; }
  function gizle() { g.classList.remove("odak"); if (acik) acik.classList.remove("ac"); acik = null; }
  g.addEventListener("pointerover", function (e) { if (e.pointerType !== "mouse") return; var k = e.target.closest(".yg-kart"); if (k && k !== acik) goster(k); });
  g.addEventListener("pointerout", function (e) { if (e.pointerType !== "mouse") return; var k = e.target.closest(".yg-kart"); if (!k) return;
    var r = e.relatedTarget; if (r && r.closest && r.closest(".yg-kart")) return;   /* aynı karta ya da başka karta geçiş: pointerover halleder */
    gizle(); });
  new MutationObserver(function (ms) {   // yalnız kartların .ac değişimi; galerinin kendi .odak sınıfı sayılmaz
    if (!ms.some(function (m) { return m.target.classList && m.target.classList.contains("yg-kart"); })) return;
    var k = g.querySelector(".yg-kart.ac"); if (k) { if (k !== acik) goster(k); } else if (acik) gizle(); }).observe(g, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();

/* Çapa atlayışında iniş düzeltmesi: üstteki bölümler kaydırma sırasında boy alınca (geç yüklenen görsel/klip) hedef kısa düşüyordu
   (mobilde menü → #takim ilk tıklamada 574 px eksik). İniş bitince hedefin yerini yeniden ölçer, sapma varsa kısa bir kaydırmayla oturtur. */
(function () {
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2) return;
    var id = a.getAttribute("href").slice(1), h = document.getElementById(id); if (!h || a.closest("#takim-ic")) return;
    var ust = window.__lenis ? 10 : (parseFloat(getComputedStyle(h).scrollMarginTop) || 0);
    var ic = window.TAKIM_IC && window.TAKIM_IC.govde, host = document.getElementById("takim-ic");   // hedef takımın altındaysa: içkin bölümler gerçek boyuna açılır (content-visibility yer tutucusu hedefi kısa ölçtürüyordu)
    if (ic && host && (host.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING) && !host.contains(h)) { ic.classList.add("hepsi-acik"); clearTimeout(ic._hz2); ic._hz2 = setTimeout(function () { ic.classList.remove("hepsi-acik"); }, 4000); }
    function duzelt() { var d = h.getBoundingClientRect().top - ust; if (Math.abs(d) <= 4) return;
      if (window.__lenis) window.__lenis.scrollTo(scrollY + d, { duration: Math.abs(d) > innerHeight ? .9 : .45 }); else scrollBy({ top: d, behavior: Math.abs(d) > innerHeight ? "instant" : "smooth" }); }
    setTimeout(duzelt, 1400); setTimeout(duzelt, 2500); setTimeout(duzelt, 3600);
  }, true);
})();
