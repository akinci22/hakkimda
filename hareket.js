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
      k._basla = basla; k._dur = dur;
      if (!dokunmatik) {
        k.addEventListener("pointerenter", function () { yukle(); goster((son + 1) % im.length); basla(); });
        k.addEventListener("pointerleave", function () { dur(true); });
      }
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
    for (var t = 0; t < 2; t++) L.forEach(function (u) { html += '<img src="' + u + '" alt="" loading="lazy" decoding="async" width="99" height="62">'; });
    ic.innerHTML = html;
    if (azalt) return;
    var hazir = [], y = 0, i = 0, zam = null;
    function yukle() { if (y >= L.length) return; var im = new Image(); im.onload = function () { hazir.push(im.src); yukle(); }; im.onerror = yukle; im.src = L[y++]; }
    function oynat() { if (zam) return; if (!y) yukle(); zam = setInterval(function () { if (hazir.length > 1) { i = (i + 1) % hazir.length; kare.src = hazir[i]; } }, 110); }
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
