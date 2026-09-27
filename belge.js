/* Belge + sunum etkileşimi (28 Eyl 2026): içindekiler vurgusu, yazdır, sunum klavye gezintisi ve tam ekran. */
(function () {
  var yazdir = document.querySelector('[data-yazdir]');
  if (yazdir) yazdir.addEventListener('click', function () { window.print(); });

  // İçindekiler: okunan başlığı vurgula
  var toc = document.querySelectorAll('.belge-toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    var harita = {};
    toc.forEach(function (a) { harita[decodeURIComponent(a.hash.slice(1))] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        toc.forEach(function (a) { a.classList.remove('aktif'); });
        var a = harita[e.target.id]; if (a) a.classList.add('aktif');
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    document.querySelectorAll('.belge-metin h1[id], .belge-metin h2[id]').forEach(function (h) { io.observe(h); });
  }

  // Sunum
  var deste = document.querySelector('[data-deste]');
  if (!deste) return;
  var sl = Array.prototype.slice.call(deste.querySelectorAll('.slayt'));
  var cubuk = document.querySelector('[data-ilerleme]');
  var sira = 0;
  function simdiki() {
    var orta = window.innerHeight / 2, en = 0, fark = 1e9;
    sl.forEach(function (s, i) { var r = s.getBoundingClientRect(); var d = Math.abs(r.top + r.height / 2 - orta); if (d < fark) { fark = d; en = i; } });
    return en;
  }
  function git(i) {
    sira = Math.max(0, Math.min(sl.length - 1, i));
    sl[sira].scrollIntoView({ behavior: 'smooth', block: document.body.classList.contains('sunuyor') ? 'center' : 'start' });
  }
  function guncelle() { sira = simdiki(); if (cubuk) cubuk.style.width = ((sira + 1) / sl.length * 100) + '%'; }
  (document.body.classList.contains('sunuyor') ? deste : window).addEventListener('scroll', guncelle, { passive: true });
  deste.addEventListener('scroll', guncelle, { passive: true });
  window.addEventListener('scroll', guncelle, { passive: true });
  guncelle();
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (['ArrowRight', 'PageDown', ' '].indexOf(e.key) >= 0) { e.preventDefault(); git(simdiki() + 1); }
    else if (['ArrowLeft', 'PageUp'].indexOf(e.key) >= 0) { e.preventDefault(); git(simdiki() - 1); }
    else if (e.key === 'Home') git(0);
    else if (e.key === 'End') git(sl.length - 1);
    else if (e.key === 'Escape' && document.body.classList.contains('sunuyor')) cik();
  });
  var tam = document.querySelector('[data-tam]');
  function cik() { document.body.classList.remove('sunuyor'); if (document.fullscreenElement) document.exitFullscreen().catch(function () {}); }
  if (tam) tam.addEventListener('click', function () {
    var i = simdiki();
    document.body.classList.add('sunuyor');
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
    setTimeout(function () { git(i); }, 60);
  });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement) document.body.classList.remove('sunuyor'); });
})();

/* ---------- Görseller kaydırdıkça büyüsün (28 Eyl 2026) ---------- */
(function buyuKur() {
  var sec = '.galeri img, .serit img, .adim-gorsel, .kapak, .kanit, .belge-metin figure img, .yh-fig img';
  var el = document.querySelectorAll(sec);
  el.forEach(function (x) { x.classList.add('buyu'); });
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  if (!('IntersectionObserver' in window)) { el.forEach(function (x) { x.classList.add('acik'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('acik'); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  el.forEach(function (x) { io.observe(x); });
})();
