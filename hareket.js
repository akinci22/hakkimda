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
    function oynat() { if (zam) return; basla(); zam = setInterval(function () { if (hazir.length < 2 || m.matches(":hover") || (m._tut || 0) > Date.now()) return; i = (i + 1) % hazir.length;
      if (!sabit) { kare.src = hazir[i]; return; }
      kare.classList.add("sol"); setTimeout(function () { kare.src = hazir[i]; kare.classList.remove("sol"); }, 450); }, sabit ? 2600 : 110); }
    function dur() { clearInterval(zam); zam = null; }
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
      if (!im || im.classList.contains("montaj-kare") || im.closest("a, button, header, nav, .buyut") || im.classList.contains("av") || im.classList.contains("ikon")) return;
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
    var l = new Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, smoothWheel: true });
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
  function yaziGoster(k) {   // büyüyen fotoğrafın altında: paylaşırken yazdığım yazı (varsa, data-yazi) ve imza
    var r = k.getBoundingClientRect(), t = hedef && (hedef.getAttribute("data-yazi") || (kaynak(hedef) || {}).getAttribute && kaynak(hedef).getAttribute("data-yazi")) || "";
    yz.firstChild.textContent = t; yz.firstChild.style.display = t ? "" : "none";
    yz.style.left = r.left + "px"; yz.style.width = r.width + "px"; yz.style.top = Math.min(innerHeight - 90, r.bottom + 10) + "px"; yz.classList.add("acik");
  }
  function perde(ac, hizli, hemen) {
    pd.style.background = hizli ? "rgba(10,20,40,.12)" : "#000";
    pd.style.transition = !ac ? "opacity .4s ease, backdrop-filter .4s" : hizli ? "opacity .35s ease-out, backdrop-filter .45s ease-out"
      : hemen ? "opacity .35s ease-out, backdrop-filter .35s ease-out" : "opacity 1.5s cubic-bezier(.75,0,.9,.55), backdrop-filter .9s ease-out";
    pd.style.opacity = ac ? "1" : "0"; var b = !ac ? "blur(0px)" : hizli ? "blur(18px) saturate(1.35) brightness(1.05)" : "blur(14px)";
    pd.style.backdropFilter = b; pd.style.webkitBackdropFilter = b;
  }
  function kaynak(el) { if (el.closest(".montaj-ic")) return el.closest(".montaj").querySelector(".montaj-kare");
    return el.matches("video.gif") ? el : (el.querySelector(".hl-kutu img.on") || el.querySelector("video.gif") || el.querySelector("img")); }
  function kapat() { clearTimeout(zam); zam = null; clearTimeout(cik); cik = null; yz.classList.remove("acik"); if (!kat) return; var k = kat; kat = null; perde(false);
    k.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1), opacity .45s"; k.style.transform = k._ilk; k.style.opacity = "0";
    setTimeout(function () { k.remove(); }, 460); }
  function buyut() {
    var hz = !!hedef.closest("#projeler");
    var el = kaynak(hedef); if (!el) return;
    var r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    var oran = (el.videoWidth || el.naturalWidth || r.width) / (el.videoHeight || el.naturalHeight || r.height);
    var w = Math.min(vw * (dokun ? .94 : hz ? .48 : .62), vh * (dokun ? .8 : hz ? .58 : .72) * oran), h = w / oran;
    var k = el.tagName === "VIDEO" ? el.cloneNode(true) : new Image();
    if (k.tagName === "IMG") k.src = el.currentSrc || el.src;
    else { k.muted = true; k.loop = true; k.preload = "auto"; k.currentTime = el.currentTime || 0; }
    k.className = "buyuk-kat";
    k.style.cssText = "position:fixed;z-index:9999;left:" + (vw - w) / 2 + "px;top:" + (vh - h) / 2 + "px;width:" + w + "px;height:" + h +
      "px;object-fit:contain;background:#000;border-radius:10px;box-shadow:0 30px 90px rgba(0,0,0,.6);pointer-events:none;will-change:transform;transform-origin:0 0";
    var s = r.width / w, ilk = "translate(" + (r.left - (vw - w) / 2) + "px," + (r.top - (vh - h) / 2) + "px) scale(" + s + ")";
    k._ilk = ilk; k.style.transform = ilk; document.body.appendChild(k); kat = k; k._hz = hz; if (!hz) perde(true, false, true);
    if (k.play) { var p = k.play(); if (p && p.catch) p.catch(function () {}); }
    if (hz) {   // YolHava: 1) hemen, yerinde, dikkat çekecek kadar (%15) büyür; 2) imleç 2 sn kalırsa hızla ortada son boyuna
      var dx = r.left - (vw - w) / 2 - r.width * .075, dy = r.top - (vh - h) / 2 - r.height * .075;
      k._evre1 = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        k.style.transition = "transform .6s cubic-bezier(.2,.8,.3,1)"; k.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + s * 1.15 + ")"; }); });
      setTimeout(function () { if (kat !== k) return; k._evre1 = false; perde(true, true);
        k.style.transition = "transform .45s cubic-bezier(.3,.7,.2,1)"; k.style.transform = "none"; }, 2000);
    } else {   // fotoğraf/hikâye: önce çevre hızla kararır, sonra yavaşça büyümeye başlar; 1,5 sn kalınırsa hızlanıp tamamlanır
      var ara = "translate(" + (r.left - (vw - w) / 2) * .6 + "px," + (r.top - (vh - h) / 2) * .6 + "px) scale(" + (s + (1 - s) * .35) + ")";
      setTimeout(function () { if (kat !== k) return; k.style.transition = "transform 1.15s cubic-bezier(.4,0,.6,1)"; k.style.transform = ara; }, 350);
      setTimeout(function () { if (kat !== k) return; k.style.transition = "transform .55s cubic-bezier(.3,.7,.2,1)"; k.style.transform = "none";
        setTimeout(function () { if (kat === k) yaziGoster(k); }, 560); }, 1500);
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
    zam = setTimeout(buyut, 60); }
  }, { passive: true });
  var yut = false;
  document.addEventListener("click", function (e) {
    if (yut) { yut = false; e.preventDefault(); e.stopPropagation(); return; }   // uzun basışın ardından gelen tık
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
    document.addEventListener("touchend", function () { if (bas) { clearTimeout(bas); bas = null; } }, { passive: true });
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
  var sira = ["projeler", "yemek", "naplist", "yayin", "temsilcilik", "fotograf"];
  var b = document.createElement("div"); b.className = "hava-bulut"; b.setAttribute("aria-hidden", "true");
  var isin = ""; for (var a = 0; a < 360; a += 30) isin += '<line x1="0" y1="-17" x2="0" y2="-25" transform="rotate(' + a + ')"/>';
  var yag = ""; for (var r = 0; r < 6; r++) yag += '<line x1="' + (30 + r * 8) + '" y1="44" x2="' + (27 + r * 8) + '" y2="52" style="animation-delay:' + (r * .13) + 's"/>';
  b.innerHTML = '<svg viewBox="0 0 100 64" width="100" height="64"><g class="hb-jel">' +
    '<g class="hb-gunes" transform="translate(66 24)"><g class="hb-isin">' + isin + '</g><circle r="12"/></g>' +
    '<path class="hb-bulut" d="M22 44h52a12 12 0 0 0 0-24 16 16 0 0 0-30-6 12 12 0 0 0-20 8 11 11 0 0 0-2 22z"/>' +
    '<polygon class="hb-simsek" points="50,40 43,52 49,52 45,62 57,48 51,48 55,40"/>' +
    '<g class="hb-yagmur">' + yag + '</g></g></svg><span class="hb-ad"></span>';
  var adlar = ["YolHava", "İTÜ Yemek", "Naplist", "Canlı yayın", "Temsilcilik", "Fotoğraf", "İletişim"], ad = b.querySelector(".hb-ad");
  document.body.appendChild(b);
  var kok = document.documentElement, bk = false;
  function ciz() {
    bk = false;
    var top = kok.scrollHeight - innerHeight, p = top > 0 ? Math.min(1, scrollY / top) : 0, ev = 0;
    for (var i = 0; i < sira.length; i++) { var s = document.getElementById(sira[i]); if (s && s.getBoundingClientRect().top < innerHeight * .5) ev = i; }
    if (p > .965) ev = 6;
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
    var p = Math.max(0, Math.min(1, (x - a) / (z - a))); scrollTo(0, p * (kok.scrollHeight - innerHeight)); }
  b.addEventListener("pointerdown", function (e) {
    tut = true; b.setPointerCapture(e.pointerId); b.classList.add("tutuldu"); sonX = e.clientX; sonT = performance.now(); hiz = 0;
    vs -= .12; basla(); e.preventDefault();                     // dokununca balon gibi içe göçer
  });
  b.addEventListener("pointermove", function (e) { if (!tut) return; var t = performance.now(), dt = Math.max(8, t - sonT);
    hiz = hiz * .6 + ((e.clientX - sonX) / dt * 1000) * .4; sonX = e.clientX; sonT = t; git(e.clientX); });
  function birak() { if (!tut) return; tut = false; b.classList.remove("tutuldu"); vk += hiz / 400; basla(); }
  b.addEventListener("pointerup", birak); b.addEventListener("pointercancel", birak);
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
    bag.classList.add("cizgi"); var son = -1e9;
    linkler.forEach(function (a) {
      var x = window.hizaX(Math.max(0, Math.min(1, hedefY(a) / top))), w = a.offsetWidth;
      x = Math.max(x, son + w / 2 + 6); x = Math.min(x, innerWidth - w / 2 - 8); son = x + w / 2;
      a.style.left = (x - w / 2) + "px";
    });
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


/* Kampüs / sokak ızgarası: imleç bir fotoğrafta 2 sn durursa o fotoğraf üstteki büyük çerçevede görünür (döngü 6 sn bekler). */
(function () {
  var zam = null;
  document.querySelectorAll(".foto-ayrac").forEach(function (iz) {
    var m = iz.previousElementSibling; while (m && !(m.classList && m.classList.contains("montaj"))) m = m.previousElementSibling;
    if (!m) return; var kare = m.querySelector(".montaj-kare");
    iz.addEventListener("pointerover", function (e) { var im = e.target.closest("img"); clearTimeout(zam); if (!im) return;
      zam = setTimeout(function () { m._tut = Date.now() + 6000; kare.classList.add("sol");
        setTimeout(function () { kare.src = im.currentSrc || im.src; kare.classList.remove("sol"); }, 300); }, 2000); });
    iz.addEventListener("pointerleave", function () { clearTimeout(zam); });
  });
})();
