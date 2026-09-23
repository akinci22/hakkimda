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

  /* ---------- 4) Gorseller yuklendikce yumusak acilsin ---------- */
  (function gorselAc() {
    function ac(im) { im.classList.add("yuklendi"); }
    Array.prototype.forEach.call(document.images, function (im) {
      if (im.complete && im.naturalWidth) ac(im);
      else {
        im.addEventListener("load", function () { ac(im); }, { once: true });
        im.addEventListener("error", function () { ac(im); }, { once: true });
      }
    });
    // Sonradan eklenenler icin
    if (window.MutationObserver) {
      new MutationObserver(function (kayitlar) {
        kayitlar.forEach(function (k) {
          Array.prototype.forEach.call(k.addedNodes, function (n) {
            if (n.tagName === "IMG") {
              if (n.complete && n.naturalWidth) ac(n);
              else n.addEventListener("load", function () { ac(n); }, { once: true });
            }
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  })();

  /* ---------- 11) Video: tiklayinca yukle (gizlilik + hiz) ---------- */
  (function videoKur() {
    document.querySelectorAll(".video-kapak").forEach(function (d) {
      d.addEventListener("click", function () {
        var id = d.dataset.video, basla = d.dataset.basla || 0;
        var kutu = d.parentNode;
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + id +
                "?start=" + basla + "&autoplay=1&rel=0&modestbranding=1";
        f.title = "Hocamın konuşması";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
        f.allowFullscreen = true;
        f.setAttribute("loading", "lazy");
        kutu.appendChild(f);
        d.remove();
      });
    });
  })();

  /* ---------- 12) Grafikler goruse girince canlansin ---------- */
  (function grafikKur() {
    var g = document.querySelectorAll(".grafik");
    if (!g.length) return;
    if (azalt || !("IntersectionObserver" in window)) {
      g.forEach(function (k) { k.classList.add("ac"); });
      return;
    }
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("ac"); go.unobserve(x.target); }
      });
    }, { threshold: 0.25 });
    g.forEach(function (k) { go.observe(k); });
    if (azalt) return;

  /* ---------- 5) Basliklarda kelime kelime giris ---------- */
  (function baslikAyir() {
    var basliklar = document.querySelectorAll("h1, h2");
    Array.prototype.forEach.call(basliklar, function (b) {
      if (b.dataset.ayrildi) return;
      // sadece duz metin iceren basliklari ayir
      if (b.children.length) return;
      var metin = b.textContent.trim();
      if (!metin || metin.length > 90) return;
      b.dataset.ayrildi = "1";
      b.textContent = "";
      metin.split(/\s+/).forEach(function (k, i) {
        var sp = document.createElement("span");
        sp.className = "kelime";
        sp.textContent = k;
        sp.style.transitionDelay = (i * 55) + "ms";
        b.appendChild(sp);
        b.appendChild(document.createTextNode(" "));
      });
    });

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".kelime").forEach(function (k) { k.classList.add("ac"); });
      return;
    }
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (g.isIntersecting) {
          g.target.querySelectorAll(".kelime").forEach(function (k) { k.classList.add("ac"); });
          go.unobserve(g.target);
        }
      });
    }, { threshold: 0.3 });
    Array.prototype.forEach.call(basliklar, function (b) { go.observe(b); });
  })();

  /* ---------- 6) Tablo satirlari sirayla girsin ---------- */
  (function tabloGiris() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("tbody tr").forEach(function (t) { t.classList.add("ac"); });
      return;
    }
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (!g.isIntersecting) return;
        var satirlar = g.target.querySelectorAll("tbody tr");
        Array.prototype.forEach.call(satirlar, function (tr, i) {
          setTimeout(function () { tr.classList.add("ac"); }, i * 70);
        });
        go.unobserve(g.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll("table").forEach(function (t) { go.observe(t); });
  })();

  /* ---------- 7) Sayilar sayarak gelsin ---------- */
  (function sayacKur() {
    var hucreler = Array.prototype.filter.call(
      document.querySelectorAll("td.sayi, .kunye dd"),
      function (h) { return /^[\d.,]+$/.test(h.textContent.trim()) && h.textContent.trim().length > 2; }
    );
    if (!hucreler.length || !("IntersectionObserver" in window)) return;

    function say(el) {
      var ham = el.textContent.trim();
      var hedef = parseFloat(ham.replace(/\./g, "").replace(",", "."));
      if (!isFinite(hedef)) return;
      var ondalik = ham.indexOf(",") > -1;
      var basla = null, sure = 900;
      el.classList.add("sayac");
      function adim(t) {
        if (!basla) basla = t;
        var o = Math.min(1, (t - basla) / sure);
        var yum = 1 - Math.pow(1 - o, 3);
        var d = hedef * yum;
        el.textContent = ondalik
          ? d.toFixed(2).replace(".", ",")
          : Math.round(d).toLocaleString("tr-TR");
        if (o < 1) requestAnimationFrame(adim);
        else el.textContent = ham;
      }
      requestAnimationFrame(adim);
    }

    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (g.isIntersecting) { say(g.target); go.unobserve(g.target); }
      });
    }, { threshold: 0.5 });
    hucreler.forEach(function (h) { go.observe(h); });
  })();

  /* ---------- 8) Vitrin kartlarinda fare egimi ---------- */
  (function kartEgimi() {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    document.querySelectorAll(".vitrin").forEach(function (k) {
      k.addEventListener("pointermove", function (e) {
        var r = k.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        k.style.setProperty("--eY", (x * 2.2).toFixed(2) + "deg");
        k.style.setProperty("--eX", (-y * 1.6).toFixed(2) + "deg");
      }, { passive: true });
      k.addEventListener("pointerleave", function () {
        k.style.setProperty("--eY", "0deg");
        k.style.setProperty("--eX", "0deg");
      });
    });
  })();

  /* ---------- 9) Bolum ayraci parlamasi ---------- */
  (function ayraclar() {
    if (!("IntersectionObserver" in window)) return;
    var go = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add("gorundu"); go.unobserve(g.target); }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll("section").forEach(function (b) { go.observe(b); });
  })();

  /* ---------- 10) Uste don dugmesi ---------- */
  (function usteDon() {
    var d = document.createElement("button");
    d.className = "uste";
    d.type = "button";
    d.setAttribute("aria-label", "Sayfanın başına dön");
    d.innerHTML = "&uarr;";
    document.body.appendChild(d);
    d.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    var bekle = false;
    function bak() {
      var ust = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      d.classList.toggle("gorunur", ust > 700);
      bekle = false;
    }
    window.addEventListener("scroll", function () {
      if (!bekle) { bekle = true; requestAnimationFrame(bak); }
    }, { passive: true });
    bak();
  })();

})();
})();
