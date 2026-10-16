/* C04 (16 Eki 2026): alt sayfalarda (belgeler/, sunumlar/) ana sayfayla aynı yumuşak tekerlek — hareket.js'teki Lenis ayarının aynısı.
   Dokunmatikte kapalı; "az hareket"te kapanmaz, daha çabuk oturur. Sunum kipindeki kendi kaydırıcısı (.deste) Lenis'e girmez. */
(function () {
  if (window.__lenis || matchMedia("(pointer: coarse)").matches) return;
  var azalt = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
  s.onload = function () {
    if (!window.Lenis || window.__lenis) return;
    document.querySelectorAll(".deste, [data-kendi-kaydirma]").forEach(function (e) { e.setAttribute("data-lenis-prevent", ""); });
    document.documentElement.style.scrollBehavior = "auto";
    var l = window.__lenis = new Lenis({ duration: azalt ? .7 : 1.2, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }, lerp: azalt ? .14 : .09, wheelMultiplier: .9, smoothWheel: true });
    function r(t) { l.raf(t); requestAnimationFrame(r); }
    requestAnimationFrame(r);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      var h; try { h = document.querySelector(a.getAttribute("href")); } catch (x) { return; }
      if (h) { e.preventDefault(); l.scrollTo(h, { offset: -70 }); }
    });
  };
  document.head.appendChild(s);
})();
