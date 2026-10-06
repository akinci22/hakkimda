/* Rapor tam metni: başlık + altındakiler bir bölüm kartına toplanır; 3+ cümlelik paragraflar cümle maddelerine bölünür. */
(function () {
  document.body.classList.add('tam');
  var m = document.querySelector('.belge-metin'); if (!m) return;
  var cum = function (t) { return t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜ0-9"(])/).filter(Boolean); };
  Array.prototype.slice.call(m.querySelectorAll(':scope > p')).forEach(function (p) {
    if (p.querySelector('table,img,em:only-child')) return; var c = cum(p.textContent); if (c.length < 3 || p.children.length > 2) return;
    var ul = document.createElement('ul'); ul.className = 'cumle'; c.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); }); p.replaceWith(ul);
  });
  var kart = null, dugum = Array.prototype.slice.call(m.childNodes);
  dugum.forEach(function (n) {
    if (n.nodeType === 1 && /^H[12]$/.test(n.tagName)) { kart = document.createElement('section'); kart.className = 'bolum-kart'; m.insertBefore(kart, n); }
    if (kart && n !== kart) kart.appendChild(n);
  });
})();
