/* Rapor tam metni → akademik makale düzeni: ön kısım (başlık, yazar, Özet), İçindekiler, bölümler (kaydırdıkça açılır), Kaynakça. */
(function () {
  document.body.classList.add('tam');
  var m = document.querySelector('.belge-metin'); if (!m) return;
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var duz = function (n) { return +((n.tagName || '').match(/^H(\d)$/) || [0, 0])[1]; };
  var bas = document.querySelector('.belge-bas'), baslik = bas && bas.querySelector('h1'), oz = bas && bas.querySelector('.belge-ozet');
  var ust = $$('h1,h2,h3,h4', m).reduce(function (a, h) { return Math.min(a, duz(h)); }, 9);
  var kagit = document.createElement('div'); kagit.className = 'kagit';
  /* ön kısım */
  var on = document.createElement('header'); on.className = 'on';
  on.innerHTML = '<p class="tur">Araştırma raporu</p><h1></h1><p class="yazar">Ömer Faruk Akıncı</p><p class="kurum">İstanbul Teknik Üniversitesi, İklim Bilimi ve Meteoroloji Mühendisliği</p><p class="tarih">2026</p><div class="eylem-sat"><a href="../">← Kısa özet</a><button type="button" class="yaz">Yazdır</button></div>';
  on.querySelector('h1').textContent = baslik ? baslik.textContent : document.title;
  on.querySelector('.yaz').addEventListener('click', function () { $$('.bolum').forEach(function (s) { s.classList.add('acik'); }); window.print(); });
  kagit.appendChild(on);
  /* Özet: kısa tanım + ilk ana başlıktan önceki notlar */
  var ozet = document.createElement('section'); ozet.className = 'ozet'; ozet.setAttribute('aria-label', 'Özet');
  ozet.innerHTML = '<h2>Özet</h2>';
  if (oz) { var p = document.createElement('p'); p.textContent = oz.textContent; ozet.appendChild(p); }
  while (m.firstChild && duz(m.firstChild) !== ust) {
    var n = m.firstChild;
    if (n.nodeType === 1 && n.tagName === 'P' && n.querySelector('em:only-child')) { n.className = 'kunye'; n.textContent = n.textContent; }
    ozet.appendChild(n);
  }
  /* bölümler */
  var govde = document.createElement('div'), ic = null, liste = [];
  $$(':scope > *', m).forEach(function (n) {
    if (duz(n) === ust) {
      var s = document.createElement('section'); s.className = 'bolum'; s.id = n.id || ('b' + liste.length);
      var h = document.createElement('h2'); h.className = 'bb'; h.innerHTML = n.innerHTML; s.appendChild(h);
      var d = document.createElement('div'); d.className = 'ic'; d.appendChild(document.createElement('div')); s.appendChild(d); ic = d.firstChild;
      if (/kaynak/i.test(h.textContent)) s.classList.add('kaynakca');
      liste.push({ s: s, h: h, alt: [] }); govde.appendChild(s); n.remove(); return;
    }
    if (!ic) { ozet.appendChild(n); return; }
    if (duz(n) === ust + 1 && n.id) liste[liste.length - 1].alt.push(n);
    ic.appendChild(n);
  });
  var konu = liste.filter(function (x) { return !x.s.classList.contains('kaynakca'); }).map(function (x) { return x.h.textContent.replace(/^[\d.)\s]+/, '').replace(/\s*\(.*?\)/g, '').trim(); }).slice(0, 6);
  if (konu.length) { var an = document.createElement('p'); an.className = 'anahtar'; an.innerHTML = '<b>Konular:</b> '; an.appendChild(document.createTextNode(konu.join(' · '))); ozet.appendChild(an); }
  kagit.appendChild(ozet);
  /* kaynakça: yoksa metindeki dış bağlantılardan derlenir; her durumda en sona */
  var kay = liste.filter(function (x) { return x.s.classList.contains('kaynakca'); })[0];
  if (!kay) {
    var gor = {}, ul = document.createElement('ul');
    $$('a.dis', govde).forEach(function (a) {
      var u = a.href.replace(/\/$/, ''); if (gor[u]) return; gor[u] = 1;
      var li = document.createElement('li'), ad = document.createElement('span'), l = document.createElement('a');
      ad.textContent = a.textContent.trim() + '. '; l.className = 'dis'; l.target = '_blank'; l.rel = 'noopener'; l.href = a.href; l.textContent = u.replace(/^https?:\/\//, '');
      li.appendChild(ad); li.appendChild(l); ul.appendChild(li);
    });
    if (ul.children.length) {
      var s = document.createElement('section'); s.className = 'bolum kaynakca'; s.id = 'kaynakca';
      s.innerHTML = '<h2 class="bb">Kaynakça</h2><div class="ic"><div></div></div>'; s.querySelector('.ic>div').appendChild(ul);
      kay = { s: s, h: s.firstChild, alt: [] }; liste.push(kay);
    }
  }
  if (kay) { liste.splice(liste.indexOf(kay), 1); liste.push(kay); govde.appendChild(kay.s); }
  /* içindekiler */
  var tc = document.createElement('nav'); tc.className = 'icindekiler'; tc.setAttribute('aria-label', 'İçindekiler'); tc.innerHTML = '<h2>İçindekiler</h2>';
  var ol = document.createElement('ol');
  liste.forEach(function (x) {
    var li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + x.s.id; a.textContent = x.h.textContent; li.appendChild(a);
    if (x.alt.length) {
      var o2 = document.createElement('ol'), w = document.createElement('div');
      x.alt.forEach(function (h) { var l2 = document.createElement('li'), a2 = document.createElement('a'); a2.href = '#' + h.id; a2.textContent = h.textContent; l2.appendChild(a2); w.appendChild(l2); });
      o2.appendChild(w); li.appendChild(o2);
    }
    ol.appendChild(li);
  });
  tc.appendChild(ol); kagit.appendChild(tc); kagit.appendChild(govde);
  var eski = document.querySelector('.belge-toc'); if (eski) eski.remove();
  m.replaceWith(kagit);
  /* açılış: kaydırınca, başlığa tıklayınca, bağlantıyla gelince */
  var ac = function (s) { s.classList.add('acik'); };
  liste.forEach(function (x) { x.h.addEventListener('click', function () { x.s.classList.toggle('acik'); }); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { ac(e.target); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -25% 0px' });
    liste.forEach(function (x) { io.observe(x.s); });
  } else liste.forEach(function (x) { ac(x.s); });
  var git = function (id) {
    var t = id && document.getElementById(decodeURIComponent(id)); if (!t) return;
    var s = t.closest('.bolum'); if (s) ac(s);
    setTimeout(function () { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  };
  kagit.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    e.preventDefault(); git(a.getAttribute('href').slice(1)); history.replaceState(null, '', a.getAttribute('href'));
  });
  if (location.hash) git(location.hash.slice(1));
})();
