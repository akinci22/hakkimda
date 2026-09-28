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

  var hepsi = document.querySelectorAll(".gel, .grafik");
  function ac(e) { e.classList.add("var"); if (e.classList.contains("grafik")) e.classList.add("ac"); }
  if (azalt || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(hepsi, ac);
  } else {
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) { if (g.isIntersecting) { ac(g.target); go.unobserve(g.target); } });
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

  // Öne çıkarılan kartları: fare/parmak yatay gezdikçe sıradaki kareye geç
  Array.prototype.forEach.call(document.querySelectorAll(".hl"), function (k) {
    var im = k.querySelectorAll(".hl-kutu img"), cb = k.querySelectorAll(".hl-cubuk i"), son = 0;
    function goster(i) { if (i === son) return; im[son].classList.remove("on"); cb[son] && cb[son].classList.remove("on");
      im[i].classList.add("on"); cb[i] && cb[i].classList.add("on"); son = i;
      if (!im[i].src && im[i].dataset.src) im[i].src = im[i].dataset.src; }
    k.addEventListener("pointermove", function (e) {
      var r = k.getBoundingClientRect();
      goster(Math.min(im.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * im.length))));
    }, { passive: true });
    k.addEventListener("pointerleave", function () { goster(0); });
    k.addEventListener("pointerenter", function () {   // ilk dokunuşta hepsini yükle
      Array.prototype.forEach.call(im, function (x) { if (!x.src && x.dataset.src) x.src = x.dataset.src; });
    }, { once: true });
  });

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
