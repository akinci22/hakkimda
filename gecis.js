/* gecis.js — bölüm ayrıklığı (Akın 8 Eki): bir bölüm biter → boşluk → konsepte uygun çizgi animasyonu kendi kendine çizilir → boşluk → yeni bölüm.
   Hem ana sayfa (main > section) hem takım sayfası (gölge kök içindeki .blok) kullanır: window.gecisKur(kok, secici, tema, ayar).
   tema: (section) => tema adı | null (null = ayırıcı konmaz). Hareket azaltmada çizim animasyonu yok, ikon sabit durur. */
(function () {
  const TEMA = {
    bulut: '<path d="M38 80h46a16 16 0 0 0 2-32 24 24 0 0 0-46-6 18 18 0 0 0-2 38z"/><path d="M46 90l-4 10M62 90l-4 10M78 90l-4 10"/>',
    rota: '<path d="M18 96c20-30 10-50 36-54s24 30 48 10"/><circle cx="102" cy="48" r="7"/><path d="M102 55v14"/><circle cx="18" cy="96" r="4"/>',
    pusula: '<circle cx="60" cy="60" r="40"/><path d="M60 22v8M60 90v8M22 60h8M90 60h8"/><path d="M72 48l-8 20-16 8 8-20z"/>',
    kitap: '<path d="M60 36c-10-8-24-10-38-8v60c14-2 28 0 38 8 10-8 24-10 38-8V28c-14-2-28 0-38 8z"/><path d="M60 36v60"/>',
    kamera: '<rect x="18" y="38" width="84" height="56" rx="6"/><circle cx="60" cy="66" r="16"/><path d="M44 38l6-10h20l6 10"/><circle cx="60" cy="66" r="6"/>',
    dalga: '<path d="M14 60c8-20 16-20 24 0s16 20 24 0 16-20 24 0 16 20 24 0"/><path d="M14 82c8-14 16-14 24 0s16 14 24 0 16-14 24 0 16 14 24 0" opacity=".5"/>',
    izobar: '<ellipse cx="60" cy="60" rx="14" ry="10"/><path d="M28 60c0-18 14-30 32-30s32 12 32 30-14 30-32 30-32-12-32-30z"/><path d="M14 60c0-26 20-44 46-44s46 18 46 44-20 44-46 44-46-18-46-44z" opacity=".55"/>',
    balon: '<ellipse cx="60" cy="42" rx="24" ry="28"/><path d="M52 68l-4 20M68 68l4 20M60 70v18"/><rect x="50" y="88" width="20" height="14" rx="2"/>',
    devre: '<circle cx="24" cy="40" r="6"/><circle cx="96" cy="40" r="6"/><circle cx="60" cy="88" r="6"/><circle cx="60" cy="36" r="6"/><path d="M30 40h24M66 36h24M28 45l27 38M92 45l-27 38"/>',
    kase: '<path d="M22 60h76a38 38 0 0 1-76 0z"/><path d="M48 46c-2-6 2-8 0-14M62 46c-2-6 2-8 0-14M76 46c-2-6 2-8 0-14"/>',
    saat: '<circle cx="60" cy="60" r="38"/><path d="M60 36v26l16 10"/>',
    mesaj: '<rect x="18" y="34" width="84" height="54" rx="4"/><path d="M18 40l42 30 42-30"/>',
    ucak: '<path d="M18 70l84-28-16 20 10 22-18-8-12 14-6-18z"/>',
    sinek: '<path d="M20 70h80M48 70c0-30 8-40 12-40s12 10 12 40M60 30v-8"/><path d="M60 70v18"/>',
    fakulte: '<path d="M16 50l44-22 44 22H16z"/><path d="M28 50v34M48 50v34M72 50v34M92 50v34M16 84h88"/>'
  };
  const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function kur(kok, secici, tema, ayar) {
    ayar = ayar || {}; const liste = Array.from((kok || document).querySelectorAll(secici));
    liste.forEach(function (s, i) {
      if (s.nextElementSibling && s.nextElementSibling.classList && s.nextElementSibling.classList.contains('gecis')) return;
      const t = tema ? tema(s, i, liste) : 'izobar'; if (!t || !TEMA[t]) return;
      const g = document.createElement('div'); g.className = 'gecis' + (ayar.sinif ? ' ' + ayar.sinif : ''); g.setAttribute('aria-hidden', 'true'); g.dataset.tema = t;
      let ad = ''; try { ad = ayar.etiket ? ayar.etiket(s, i, liste) || '' : ''; } catch (e) { }
      g.innerHTML = '<span class="gecis-ip ust"></span><svg viewBox="0 0 120 120" focusable="false">' + TEMA[t] + '</svg><span class="gecis-ip alt"></span>' + (ad ? '<span class="gecis-ad">' + ad.replace(/[<>&]/g, '') + '</span>' : '');
      s.insertAdjacentElement('afterend', g);
    });
    const hepsi = Array.from((kok || document).querySelectorAll('.gecis'));
    if (azalt || !('IntersectionObserver' in window)) { hepsi.forEach(function (g) { g.classList.add('canli'); }); return hepsi.length; }
    /* 120 fps (15 Eki): çizim (stroke-dashoffset, ana iş parçacığında boyanır) kaydırma sürerken başlamaz; kaydırma durunca (140 ms) aynen çizilir */
    const bekleyen = new Set(); let dur = 0;
    function uygula() { bekleyen.forEach(function (g) { if (g.__gorunur) { g.classList.add('canli', 'gorundu'); } }); bekleyen.clear(); }
    addEventListener('scroll', function () { clearTimeout(dur); dur = setTimeout(uygula, 140); }, { passive: true });
    const io = new IntersectionObserver(function (es) { es.forEach(function (e) { const g = e.target; g.__gorunur = e.isIntersecting;
      if (!e.isIntersecting) { g.classList.remove('canli'); bekleyen.delete(g); return; }
      bekleyen.add(g); clearTimeout(dur); dur = setTimeout(uygula, 140); }); }, { threshold: 0.3 });
    hepsi.forEach(function (g) { io.observe(g); });
    return hepsi.length;
  }
  window.gecisKur = kur; window.gecisTema = TEMA;
})();

/* Geçmiş bekçisi (27 Eki 2026, Akın: "mobilde geri en yakın bir geriye gitmeli"): Chrome'un geçmiş müdahalesi, kullanıcı dokunuşu
   olmadan ya da aynı dokunuşla ikinci kez eklenen basamağı sistem geri tuşunda/kenar kaydırmada ATLAR (siteden bile çıkarır).
   Kural: her dokunuş (fare basışı, parmak kalkışı, tuş) en çok BİR basamak ekler; dokunuşsuz basamak eklenmez → pushState atar,
   çağıranların hepsi try/catch içinde (basamak eklenmedi sayar). Geri/ileri gezinti de dokunuşu harcar. */
(function () {
  if (window.__adimKur) return; window.__adimKur = 1;
  let etkin = 0, itildi = 0;
  const isaret = e => { if (!e.isTrusted) return;
    if (e.type === 'pointerdown' && e.pointerType !== 'mouse') return;            /* parmak: etkinlik kalkışta (kaydırma dokunuş sayılmaz) */
    if (e.type === 'pointerup' && e.pointerType === 'mouse') return;
    if (e.type === 'keydown' && (e.key === 'Escape' || e.repeat)) return;
    etkin = performance.now(); };
  ['pointerdown', 'pointerup', 'keydown'].forEach(t => addEventListener(t, isaret, true));
  ['popstate', 'hashchange'].forEach(t => addEventListener(t, () => { itildi = performance.now(); }, true));
  const it = history.pushState.bind(history);
  history.pushState = function (s, t, u) {
    if (!(etkin > itildi)) { window.__adimRed = (window.__adimRed || 0) + 1; try { window.__adimIz = String(new Error().stack || '').split('\n').slice(2, 5).join(' ← '); } catch (e) { }
      throw new Error('adim-yok: dokunuşsuz ya da aynı dokunuşla ikinci basamak'); }
    itildi = performance.now(); return it(s, t, u);
  };
  window.adimSerbest = () => etkin > itildi;
})();

/* Konum geçmişi (18 Eki 2026, Akın): sayfa içi atlamalar (menü, içindekiler, aşama şeridi, iç bağlantılar) tarayıcı geçmişine
   bir basamak olarak yazılır. Telefonun geri tuşu / fare geri tuşu bir önceki konuma döner; açık pencere ya da iç içe ekran
   varsa önce onlar birer birer kapanır (kendi basamakları var), sayfanın başına ya da siteden dışarı atlamaz.
   Her basamak {yer:1, y, id}: y = o basamaktan ayrılırken (ya da kaydırma durunca) bulunulan konum. Hem ana sayfa hem /takim/ kullanır. */
(function () {
  if (window.__yerKur) return; window.__yerKur = 1;
  try { history.scrollRestoration = 'manual'; } catch (e) { }
  const st = () => history.state || {};
  const yaz = (ek) => { try { history.replaceState(Object.assign({}, st(), ek), ''); } catch (e) { } };
  if (!st().yer && !st().tkDetay && !st().fv && !st().buyuk) yaz({ yer: 1, y: scrollY });
  let bekle = 0;   /* kaydırma durunca bu basamağın konumu güncellenir (geri dönünce tam kaldığın yer) */
  addEventListener('scroll', () => { clearTimeout(bekle); bekle = setTimeout(() => { if (st().yer && !acikPencere()) yaz({ y: Math.round(scrollY) }); }, 250); }, { passive: true });
  function acikPencere() {
    if (document.querySelector('dialog[open], .fv.acik, .buyut:not([hidden]), .kat-acik.acik')) return true;
    const ic = document.querySelector('#takim-ic'); const r = ic && ic.shadowRoot; return !!(r && r.querySelector('dialog[open]'));
  }
  window.yerAtla = function (id) {   /* bir atlamadan HEMEN ÖNCE çağrılır */
    if (acikPencere() || performance.now() - (window.__yerTik || 0) < 400) return;   /* aynı tıklamayı bağlantı dinleyicisi zaten yazdı */
    yaz({ yer: 1, y: Math.round(scrollY) });
    try { history.pushState({ yer: 1, y: null, id: id || '' }, ''); } catch (e) { }
  };
  function bul(id) {
    if (!id) return null; let h = document.getElementById(id);
    if (!h) { const ic = document.querySelector('#takim-ic'); h = ic && ic.shadowRoot && ic.shadowRoot.getElementById(id); }
    return h;
  }
  function kaydir(y) {
    y = Math.max(0, Math.round(y));
    if (window.__lenis) { window.__lenis.scrollTo(y, { duration: .55, force: true }); return; }
    /* dokunmatik (Lenis yok): tarayıcı geri gezintisinde kendi parça kaydırmasını da yapar; bir kare sonra ve oturunca yeniden yazılır */
    scrollTo({ top: y, behavior: 'instant' }); requestAnimationFrame(() => scrollTo({ top: y, behavior: 'instant' })); setTimeout(() => { if (Math.abs(scrollY - y) > 4) scrollTo({ top: y, behavior: 'instant' }); }, 120);
  }
  addEventListener('popstate', e => {
    window.__girdi = performance.now();   /* geri/ileri bir kullanıcı eylemi: önceki atlamanın bekleyen düzeltmeleri (hareket.js duzelt, takım icGit) iptal */
    const s = e.state; if (!s || !s.yer) return;
    if (acikPencere()) return;                /* pencere kapanıyor: konuma dokunma, pencereyi kapatan kod halleder */
    if (s.y != null) { kaydir(s.y); return; }
    const h = bul(s.id); if (h) kaydir(h.getBoundingClientRect().top + scrollY - 70);
  });
  /* ana sayfa bağlantıları: <a href="#..."> tıklanınca önce basamak; tarayıcının kendi hash basamağı eklenirse birleştirilir */
  document.addEventListener('click', ev => {
    const a = ev.target.closest && ev.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1); if (!id || !document.getElementById(id)) return;
    if (acikPencere()) return;
    window.__yerTik = performance.now();
    const n0 = history.length, url0 = location.href;
    yaz({ yer: 1, y: Math.round(scrollY) });
    setTimeout(() => {
      if (location.href !== url0 && history.length > n0) yaz({ yer: 1, y: null, id });   /* tarayıcı hash basamağını zaten ekledi */
      else { try { history.pushState({ yer: 1, y: null, id }, ''); } catch (e) { } }
    }, 0);
  }, true);
})();
