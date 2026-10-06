/* Rapor tam metni: başlık + altındakiler bir bölüm kartına toplanır; 3+ cümlelik paragraflar cümle maddelerine bölünür. */
(function () {
  document.body.classList.add('tam');
  var m = document.querySelector('.belge-metin'); if (!m) return;
  var cum = function (t) { return t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜ0-9"(])/).filter(Boolean); };
  Array.prototype.slice.call(m.querySelectorAll(':scope > p')).forEach(function (p) {
    if (p.querySelector('table,img,em:only-child')) return; var c = cum(p.textContent); if (c.length < 3 || p.children.length > 2) return;
    var ul = document.createElement('ul'); ul.className = 'cumle'; c.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); }); p.replaceWith(ul);
  });
  /* başlık sırası: h1'den sonra doğrudan h3 gelirse h2 yapılır (erişilebilirlik) */
  var son = 1; Array.prototype.slice.call(m.querySelectorAll('h1,h2,h3,h4')).forEach(function (h) { var n = +h.tagName[1];
    if (n > son + 1) { var y = document.createElement('h' + (son + 1)); for (var i = 0; i < h.attributes.length; i++) y.setAttribute(h.attributes[i].name, h.attributes[i].value); y.innerHTML = h.innerHTML; h.replaceWith(y); n = son + 1; } son = n; });
  var kart = null, dugum = Array.prototype.slice.call(m.childNodes);
  dugum.forEach(function (n) {
    if (n.nodeType === 1 && /^H[12]$/.test(n.tagName)) { kart = document.createElement('section'); kart.className = 'bolum-kart'; m.insertBefore(kart, n); }
    if (kart && n !== kart) kart.appendChild(n);
  });
})();
