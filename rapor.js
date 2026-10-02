/* Araştırma yazıları v2: kart aç/kapa, hepsini aç, #bağlantı ile açılış, sayıların sayarak gelmesi. */
(function () {
  var bolumler = Array.prototype.slice.call(document.querySelectorAll('.r-bolum'));
  function ac(b, acik, kaydir) {
    b.classList.toggle('acik', acik);
    var k = b.querySelector('.r-kart'); if (k) k.setAttribute('aria-expanded', acik ? 'true' : 'false');
    if (acik && kaydir) {
      var r = b.getBoundingClientRect();
      if (r.top < 60 || r.top > innerHeight * .55) setTimeout(function () { b.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    }
    if (acik && history.replaceState) history.replaceState(null, '', '#' + b.id);
  }
  bolumler.forEach(function (b) {
    var k = b.querySelector('.r-kart');
    if (k) k.addEventListener('click', function () { ac(b, !b.classList.contains('acik'), true); guncelle(); });
  });
  var hepsi = document.querySelector('[data-hepsi]');
  function guncelle() {
    if (!hepsi) return;
    var tum = bolumler.every(function (b) { return b.classList.contains('acik'); });
    hepsi.textContent = tum ? 'Hepsini kapat' : 'Hepsini aç';
  }
  if (hepsi) hepsi.addEventListener('click', function () {
    var tum = bolumler.every(function (b) { return b.classList.contains('acik'); });
    bolumler.forEach(function (b) { ac(b, !tum, false); }); guncelle();
  });
  var h = decodeURIComponent(location.hash.slice(1));
  if (h) { var hb = document.getElementById(h); if (hb && hb.classList.contains('r-bolum')) { ac(hb, true, false); setTimeout(function () { hb.scrollIntoView({ block: 'start' }); }, 50); } }

  // hero sayıları sayarak gelsin (yalnız düz sayılarda: 50.380, %100, 181 ...)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-say]').forEach(function (el) {
    var ham = el.getAttribute('data-say'), m = ham.match(/^([^\d]*)([\d.]+)(,\d+)?(.*)$/);
    if (!m || /\d/.test(m[4]) || /\d/.test(m[1])) return;
    var hedef = parseInt(m[2].replace(/\./g, ''), 10); if (!isFinite(hedef) || hedef < 10) return;
    var t0 = null, sure = 1100;
    function bicim(n) { return m[1] + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (m[3] || '') + m[4]; }
    function adim(t) { if (!t0) t0 = t; var u = Math.min(1, (t - t0) / sure); u = 1 - Math.pow(1 - u, 3);
      el.textContent = u < 1 ? bicim(Math.round(hedef * u)) : ham; if (u < 1) requestAnimationFrame(adim); }
    el.textContent = bicim(0); requestAnimationFrame(adim);
  });
})();
