/* Burs tanitim sitesi — hareket katmani
   1) kaydirirken belirme  2) okuma ilerleme cubugu  3) fare isigi
   Hareket azaltma tercihi acikken hicbiri calismaz. */
(function () {
  "use strict";

  var kok = document.documentElement;
  kok.classList.remove("js-yok");

  var azalt = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) Kaydirirken belirme ---------- */
  // Belirecek ogeleri isaretle (sayfa basindaki ilk blok haric — o hemen gorunsun)
  var adaylar = document.querySelectorAll(
    "section > .sar > *, .sar > section > *, .vitrin, .bakis-kart, .soz, .galeri figure, .adimlar li, .kanit, .tablo-sar, .kutu, .not"
  );

  var ilkBolum = document.querySelector("header");
  Array.prototype.forEach.call(adaylar, function (el) {
    if (ilkBolum && ilkBolum.contains(el)) return;      // hero icindekiler beklemesin
    if (el.classList.contains("bel")) return;
    el.classList.add("bel");
  });

  if (azalt || !("IntersectionObserver" in window)) {
    // Hareket istenmiyorsa ya da destek yoksa: her sey acik kalsin
    Array.prototype.forEach.call(document.querySelectorAll(".bel"), function (el) {
      el.classList.add("gorundu");
    });
  } else {
    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) {
          g.target.classList.add("gorundu");
          gozcu.unobserve(g.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    Array.prototype.forEach.call(document.querySelectorAll(".bel"), function (el) {
      gozcu.observe(el);
    });

    // Kardes ogelere sirali gecikme ver (en fazla 3 kademe)
    Array.prototype.forEach.call(
      document.querySelectorAll(".bakis, .galeri, .serit"),
      function (kap) {
        Array.prototype.forEach.call(kap.children, function (c, i) {
          if (i > 0 && i < 4) c.classList.add("bel-" + i);
        });
      }
    );
  }

  /* ---------- 2) Okuma ilerleme cubugu ---------- */
  if (!azalt) {
    var cubuk = document.createElement("div");
    cubuk.className = "ilerleme";
    cubuk.setAttribute("aria-hidden", "true");
    document.body.appendChild(cubuk);

    var bekliyor = false;
    function ilerlemeCiz() {
      var h = document.documentElement;
      var b = document.body;
      var ust = window.pageYOffset || h.scrollTop || b.scrollTop || 0;
      var yuk = Math.max(h.scrollHeight, b.scrollHeight);
      // Bazi gomulu/onizleme baglamlarinda h.clientHeight tum belge yuksekligine
      // esit olabiliyor; bu durumda gercek gorunur alan innerHeight'tir.
      var gorunen = window.innerHeight || h.clientHeight;
      if (gorunen >= yuk && h.clientHeight) gorunen = Math.min(gorunen, h.clientHeight);
      var toplam = yuk - gorunen;
      var oran = toplam > 0 ? Math.min(1, Math.max(0, ust / toplam)) : 0;
      cubuk.style.setProperty("--ilerleme", oran.toFixed(4));
      bekliyor = false;
    }
    window.addEventListener("scroll", function () {
      if (!bekliyor) { bekliyor = true; requestAnimationFrame(ilerlemeCiz); }
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!bekliyor) { bekliyor = true; requestAnimationFrame(ilerlemeCiz); }
    }, { passive: true });
    requestAnimationFrame(ilerlemeCiz);
  }

  /* ---------- 3) Fare isigi ---------- */
  var ince = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (!azalt && ince) {
    var isik = document.createElement("div");
    isik.className = "fare-isik";
    isik.setAttribute("aria-hidden", "true");
    document.body.appendChild(isik);

    var hx = 0, hy = 0, sx = 0, sy = 0, calisiyor = false;

    document.addEventListener("pointermove", function (e) {
      hx = e.clientX; hy = e.clientY;
      if (!document.body.classList.contains("fare-var")) {
        document.body.classList.add("fare-var");
      }
      if (!calisiyor) { calisiyor = true; requestAnimationFrame(yumusat); }
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      document.body.classList.remove("fare-var");
    });

    function yumusat() {
      sx += (hx - sx) * 0.085;          // gecikmeli takip = yumusak his
      sy += (hy - sy) * 0.085;
      isik.style.setProperty("--fx", sx.toFixed(1) + "px");
      isik.style.setProperty("--fy", sy.toFixed(1) + "px");
      if (Math.abs(hx - sx) > 0.5 || Math.abs(hy - sy) > 0.5) {
        requestAnimationFrame(yumusat);
      } else {
        calisiyor = false;
      }
    }
  }
})();
