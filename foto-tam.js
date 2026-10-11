/* Beyaz fotoğraf sahnesi — telefon tam ekran görüntüleyici + PC flaş/geçiş düzeni (11 Eki, Akın).
   - Telefon: ızgaradaki fotoğrafa BASINCA tam ekran beyaz görünüm açılır (kalan her yer beyaz).
     Kaydırma sırasında dokunma açmaz (parmak kaydıysa ya da sayfa yeni kaydıysa iptal).
     İki parmakla yakınlaştırma + tek parmakla kaydırma (yakınken). Boş yere dokun ya da geri tuşu → kapanır.
     Girişte/çıkışta kısa ölçek+saydamlık animasyonu.
   - PC: flaş yalnız YAVAŞ gezerken; hızlı geçişte yalnız fotoğraf değişir (beyazdan beliriş, kayma yok).
   - Kaydırma kilidi: açık olan EN ÜST katman kaydırılır, altındaki sayfa kaydırılmaz. */
(function () {
  var kap = document.querySelector(".sokak-sahne"); if (!kap) return;
  var dokun = matchMedia("(hover: none)").matches || matchMedia("(pointer: coarse)").matches;

  /* ---------- PC: flaş yalnız yavaş gezerken ---------- */
  // hareket.js'teki patlat() beyaz-mod'da her geçişte flaş atıyor. Hızlı geçişte flaşı tamamen bastır:
  // .flas ögesine 'ac' sınıfı eklenmesini izleyip, son geçişten bu yana 900 ms geçmemişse hemen kaldır.
  if (!dokun) {
    var sonGecis = 0;
    var bak = setInterval(function () {
      var f = document.querySelector(".flas"); if (!f) return; clearInterval(bak);
      new MutationObserver(function () {
        if (!f.classList.contains("ac")) return;
        var t = performance.now(), hizli = t - sonGecis < 900; sonGecis = t;
        if (hizli) { f.classList.remove("ac"); f.style.opacity = "0"; }   // hızlı geçerken yalnız fotoğraf değişir
      }).observe(f, { attributes: true, attributeFilter: ["class"] });
    }, 200);
    setTimeout(function () { clearInterval(bak); }, 8000);
  }

  /* ---------- Kaydırma kilidi: yalnız en üst katman ---------- */
  var kilit = 0;
  function kilitle() { if (kilit++ === 0) document.documentElement.classList.add("fv-acik"); }
  function kilitAc() { if (--kilit <= 0) { kilit = 0; document.documentElement.classList.remove("fv-acik"); } }

  if (!dokun) return;   // aşağısı yalnız dokunmatik

  /* ---------- Tam ekran beyaz görüntüleyici ---------- */
  var fv = null, fvIm = null, acik = false, kaynaklar = [], sira = 0, acilisT = 0;
  var ol = 1, tx = 0, ty = 0;   // ölçek + kaydırma

  function yaz() {   // yalnız kullanıcı yakınlaştırınca/kaydırınca devreye girer; açılış animasyonunu CSS yapar
    if (ol === 1 && !tx && !ty) { fvIm.style.transform = ""; return; }
    fvIm.style.transform = "scale(" + ol + ") translate(" + (tx / ol) + "px," + (ty / ol) + "px)"; }

  function kur() {
    fv = document.createElement("div"); fv.className = "fv"; fv.setAttribute("role", "dialog");
    fv.setAttribute("aria-label", "Fotoğraf tam ekran"); fv.hidden = true;
    fv.innerHTML = '<img alt=""><button class="fv-kapat" type="button" aria-label="Geri">&#8592;</button>';
    document.body.appendChild(fv); fvIm = fv.querySelector("img");
    fv.querySelector(".fv-kapat").addEventListener("click", function (e) { e.stopPropagation(); kapat(); });

    // tek parmak: yakınken kaydır, yakın değilken boşa dokunma = kapat
    var p = {}, bas = null, basOl = 1, basUz = 0, basTX = 0, basTY = 0, oynadi = false, orta0 = null;
    function uz(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function noktalar() { var k = []; for (var id in p) k.push(p[id]); return k; }

    fv.addEventListener("pointerdown", function (e) {
      if (performance.now() - acilisT < 320) return;   // açılışı tetikleyen dokunuşun devamı sayılmaz
      p[e.pointerId] = { x: e.clientX, y: e.clientY }; oynadi = false;
      var n = noktalar();
      if (n.length === 2) { basUz = uz(n[0], n[1]); basOl = ol; basTX = tx; basTY = ty;
        orta0 = { x: (n[0].x + n[1].x) / 2, y: (n[0].y + n[1].y) / 2 }; fv.classList.add("yakin"); }
      else if (n.length === 1) { bas = { x: e.clientX, y: e.clientY }; basTX = tx; basTY = ty; }
    });

    fv.addEventListener("pointermove", function (e) {
      if (!p[e.pointerId]) return; p[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = noktalar();
      if (n.length >= 2) {   // iki parmak: yakınlaştır
        oynadi = true;
        var y = uz(n[0], n[1]); if (!basUz) return;
        ol = Math.min(6, Math.max(1, basOl * (y / basUz)));
        var orta = { x: (n[0].x + n[1].x) / 2, y: (n[0].y + n[1].y) / 2 };
        tx = basTX + (orta.x - orta0.x); ty = basTY + (orta.y - orta0.y);
        yaz();
      } else if (n.length === 1 && bas) {
        var dx = e.clientX - bas.x, dy = e.clientY - bas.y;
        if (Math.abs(dx) + Math.abs(dy) > 8) oynadi = true;
        if (ol > 1.02) { tx = basTX + dx; ty = basTY + dy; fv.classList.add("yakin"); yaz(); }
      }
    });

    function biti(e) {
      if (!p[e.pointerId]) return;   // takip edilmeyen (açılış) dokunuşu yok say
      delete p[e.pointerId];
      var n = noktalar();
      if (n.length === 0) {
        fv.classList.remove("yakin");
        if (ol <= 1.02) { ol = 1; tx = 0; ty = 0; yaz(); }
        if (!oynadi) kapat();   // dokun-bırak, kaydırma değil → geri çık
      }
      if (n.length < 2) { basUz = 0; if (n.length === 1) { bas = { x: n[0].x, y: n[0].y }; basTX = tx; basTY = ty; } }
    }
    fv.addEventListener("pointerup", biti); fv.addEventListener("pointercancel", biti);

    // çift dokunma: yakınlaştır / sıfırla
    var sonDokun = 0;
    fv.addEventListener("click", function () {
      var t = performance.now(); if (t - acilisT < 320) return;
      if (t - sonDokun < 300) { ol = ol > 1.4 ? 1 : 2.4; tx = 0; ty = 0; yaz(); }
      sonDokun = t;
    });
  }

  function ac(im) {
    if (!fv) kur();
    kaynaklar = [].slice.call(kap.querySelectorAll(".ss-yan img, .ss-sira img"));
    sira = Math.max(0, kaynaklar.indexOf(im));
    fvIm.src = im.dataset.src || im.currentSrc || im.src; fvIm.alt = im.alt || "";
    ol = 1; tx = 0; ty = 0; yaz();
    fv.hidden = false; acik = true; acilisT = performance.now(); kilitle();
    requestAnimationFrame(function () { fv.classList.add("ac"); });
    try { history.pushState({ fv: 1 }, ""); } catch (x) {}   // geri tuşu kapatsın
  }

  function kapat(geriden) {
    if (!acik) return; acik = false;
    fv.classList.remove("ac"); fv.classList.add("kapanis");
    setTimeout(function () { fv.hidden = true; fv.classList.remove("kapanis"); }, 240);
    kilitAc();
    if (!geriden) { try { if (history.state && history.state.fv) history.back(); } catch (x) {} }
  }
  addEventListener("popstate", function () { if (acik) kapat(true); });

  /* ---------- ızgarada dokunma: kaydırırken açmasın ---------- */
  var kaydi = 0;
  addEventListener("scroll", function () { kaydi = Date.now(); }, { passive: true });
  var bx = 0, by = 0, hedef = null, iptal = false;
  kap.addEventListener("touchstart", function (e) {
    if (acik || e.touches.length !== 1) { hedef = null; return; }
    var im = e.target.closest && e.target.closest(".ss-yan img, .ss-sira img");
    hedef = im || null; iptal = false; bx = e.touches[0].clientX; by = e.touches[0].clientY;
  }, { passive: true });
  kap.addEventListener("touchmove", function (e) {
    if (!hedef || !e.touches.length) return;
    var t = e.touches[0];
    if (Math.abs(t.clientX - bx) + Math.abs(t.clientY - by) > 12) iptal = true;   // parmak kaydı → açma
  }, { passive: true });
  kap.addEventListener("touchend", function (e) {
    var im = hedef; hedef = null;
    if (!im || iptal || acik) return;
    if (Date.now() - kaydi < 220) return;   // sayfa henüz kayıyordu → açma
    e.preventDefault(); e.stopPropagation(); ac(im);
  });
  // hareket.js'in .buyut lightbox'ı bu fotoğraflarda devreye girmesin
  kap.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".ss-yan img, .ss-sira img")) { e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
