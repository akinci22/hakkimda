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
    const io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('canli', e.isIntersecting); if (e.isIntersecting) e.target.classList.add('gorundu'); }); }, { threshold: 0.3 });
    hepsi.forEach(function (g) { io.observe(g); });
    return hepsi.length;
  }
  window.gecisKur = kur; window.gecisTema = TEMA;
})();
