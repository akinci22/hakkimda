# DESIGN.md — akinci22.github.io/hakkimda (portföy + takım sayfası)

Bu dosya sitenin tasarım sistemidir. Kod yazan her ajan (Claude, Gemini/Antigravity, alt ajanlar) yeni bir
bölüm, kart ya da bileşen eklerken **önce bunu okur, sonra kodlar**. Kaynak: `ortak.css` (:root), `akis.css`,
`index.html` içi stiller; kurallar Akın'ın 28 Eyl – 14 Eki 2026 arasındaki kararlarından derlendi.
Biçim: awesome-design-md standardı (9 bölüm).

---

## 1. Görsel tema ve atmosfer

- **Kimlik:** beyaz/açık gri kâğıt üstünde sakin, editoryal bir öğrenci portföyü. "Apple estetiği": çok boşluk, az yazı,
  büyük başlık, küçük mono etiketler. Sayfa bir sohbet gibi akar (kısa mesaj balonları + görsel).
- **Ton:** ciddi ama sıcak. Hiçbir yerde "süper", "muhteşem", abartı yok. Doğal dil; söylenmeyen şey yazılmaz.
- **Doku:** `body::before` ince grain (opacity .022, overlay) bandingi kırar. Düz, cansız yüzey yok ama **bulanık
  animasyonlu fon da yok** (blur ≥ 46 px fon ve scroll-driven opacity YASAK; `akis.css` hepsini kapatır).
- **Her proje bölümü kendi temasını taşır** (`.t-yolhava`, `.t-yemek`, `.t-naplist`, `.t-yayin`, `.t-foto` …):
  `--zemin / --yazi / --vurgu / --cerceve` dörtlüsü. Koyu zeminli bölüm (canlı yayın, fotoğraf) kasıtlıdır,
  "kopyala-yapıştır kazası" değil; ama koyu zeminde **eyebrow/etiket kontrastı** mutlaka ≥ 4.5:1 olmalı.

## 2. Renk paleti ve rolleri

| Değişken | Açık | Koyu | Rol |
|---|---|---|---|
| `--kagit` | `#eef1f5` | `#0d1520` | sayfa zemini (`theme-color` ile aynı) |
| `--yuzey` | `#ffffff` | `#141e2b` | kart / balon yüzeyi |
| `--yuzey-2` | `#e4e9f0` | `#1c2937` | ikincil yüzey, hover zemini |
| `--murekkep` | `#16202e` | `#e8eef5` | ana metin |
| `--murekkep-2` | `#48586c` | `#a8b6c7` | ikincil metin, özetler |
| `--murekkep-3` | `#76849a` | `#8d9cb1` | etiketler, mono eyebrow |
| `--izohips` | `#1d7a8c` | `#4db6c9` | **tek vurgu**: bağlantı, odak halkası, seçili kart |
| `--izohips-acik` | `#e2f0f2` | `#13323a` | vurgu zemini |
| `--kehribar` | `#b06a1f` | `#e0a05c` | ikincil sıcak vurgu (yalnız sayı/rozet) |
| `--cizgi` / `--cizgi-ince` | `#ccd5e0` / `#dde3ea` | `#2a3a4c` / `#1f2c3a` | ayraç, kart kenarı |
| `--golge` | `0 1px 2px rgba(22,32,46,.06), 0 8px 24px -12px rgba(22,32,46,.14)` | siyah tabanlı | **mürekkep tonlu** gölge (saf siyah değil) |

- Mor/mavi "AI gradyanı", neon, doygunluğu %80'i aşan renk **yok**. Tek vurgu rengi var; ikincisi (kehribar)
  yalnız sayılar ve rozetler için.
- Fotoğraflar **lacivert çerçeve** (`.cer`) ile basılır; proje temasına göre ton değişir.
- Koyu mod: `prefers-color-scheme: dark` + `html[data-theme]`; `color-scheme` buna uyar.

## 3. Tipografi

- `--serif` **Fraunces** (opsz 9..144, 400/600, italik) → h1–h3, büyük italik vurgu panelleri (`.yan-anim`).
- `--sans` **Source Sans 3** (400/600) → gövde, balonlar, kart özetleri.
- `--mono` **JetBrains Mono** (400/600) → eyebrow'lar (`01 · Uygulamalar — 1/3`), düğmeler (`.bag`), etiketler, sayılar.
- Ölçek: `h1 clamp(2.1rem, 3.2vw + 1.2rem, 3.5rem)` · `h2 clamp(1.5rem, 1.9vw + .95rem, 2.25rem)` ·
  `h3 clamp(1.12rem, .55vw + .95rem, 1.32rem)`; başlıklarda `letter-spacing -.015…-.022em`, `text-wrap: balance`.
- Gövde satır arası 1.55–1.6; paragraf genişliği ≤ 46–65 ch. Sayılarda `tabular-nums`.
- Tırnak `“ ”`, üç nokta `…`, sayı+birim arasında `&nbsp;`. Türkçe karakterler tam; "ı/İ" dönüşümüne dikkat.
- Başlıklar **cümle düzeni** (Title Case değil): "Neler yaptım", "Bölümümün canlı yayınları".

## 4. Bileşen stilleri

- **Mesaj balonu** (`.sohbet .msj`): tek kısa cümle, ASLA paragraf; altına görsel/infografik gelebilir. Avatar 42 px yuvarlak.
- **Düğme** (`.bag`): mono yazı, 5 px köşe, 1 px `--cizgi` kenar; hover: kenar+yazı `--izohips`, `translateY(-1px)`,
  ışık süpürmesi (`::before`); basınca `translateY(0)`. Dolu sürüm bölüm vurgu rengiyle (`.pr-bag`).
- **İçindekiler satırı** (kapalı kart): kalın ad + gri özet + sağda `›`; tıklanabilirlik görsel (kenar/ok), "TIKLA" yazısı YOK.
- **Kart** (`.vitrin`, `.bakis-kart`): beyaz yüzey, yumuşak mürekkep gölgesi, hover'da hafif yükselme; kart yüzünde en çok 2 satır,
  gerisi ayrıntıda. Kartlar arası imleç kuralı: gelince hemen aç, çıkınca hemen kapat, 3 sn ısrar (`ISRAR_SN`).
- **Klip** (`video.gif`): YouTube hariç her görsel sessiz, döngülü, otomatik oynayan mp4 — poster + width/height zorunlu,
  `autoplay` YOK (IntersectionObserver oynatır), düğme/kontrol ASLA. `.gif-kart` + `figcaption`.
- **Sayaç kutuları**: sol dikey çizgi + büyük Fraunces sayı + küçük açıklama (`1×`, `5`, `4` örneği).
- **Büyütme kutusu** (`.buyut`): koyu lacivert perde, beyaz 6 px çerçeveli görsel, 48 px yuvarlak düğmeler, ok tuşları + kaydırma.
- **Hava bulutu** (`.hava-bulut`): sürüklenebilir bölüm göstergesi; sabit konumlu, üst şeritle çakışmaz.
- **Etiket/çip** (`.etiket`): küçük mono, büyük harf, `.1em` aralık; pill değil, köşeli-yumuşak.

## 5. Yerleşim ilkeleri

- Kapsayıcı `.sar{max-width:min(1440px, 92–94vw)}` (index.html'deki inline override ile birlikte değişir).
- Bölüm dikey boşluğu `clamp(56px, 7vw, 104px)`; bloklar arası 20–26 px; madde arası 14 px.
- **Genelden özele:** önce "Kısaca" kapıları, sonra bölüm, sonra `<details class="derin">` / panel. Her seferinde daha ayrıntı,
  kolay geri. Uzun listeler kapalı gelir, basınca açılır; hiyerarşi yazıyla değil çizgi incelerek/girinti artarak gösterilir.
- **Simetri kuralı:** ızgara satırı ya dolar ya son satır ortalanır; boş sağ alan kalırsa oraya büyük italik Fraunces animasyon paneli
  (`.gif-yan` + `.yan-anim`). 4'lü bilgi kutusu 2×2.
- Her bölüm sonunda **"Bu işin çıkması için gerekenler"** (kısa giriş + madde).
- Mobil: seçim kartları tek sütun, yapışkan şerit, küçük ölçek; `100dvh` (asla `100vh`).

## 6. Derinlik ve katmanlar

- Üç katman: zemin (`--kagit`) → yüzey (`--yuzey`, mürekkep gölgesi) → sabit öğeler (başlık çubuğu, bulut, yukarı oku).
- z-index ölçeği: sabit başlık 50 · `.tam-ekran` 80 · bulut/perde 9990 · `.buyut` 9999 · `.fv` 10050. Yeni öğe eklerken bu ölçeğe otur.
- Gölgeler tek ışık kaynağı (üstten), hover'da gölge büyür ama saydamlık değişmez. **Görsel asla yarı saydam kalmaz** ("silik" yasak).

## 7. Yapılacaklar / yapılmayacaklar

**Yap**
- Kısa cümle + görsel; ayrık, etiketli bloklar ("Ne: / Nasıl: / Neden:"); madde madde.
- Her `<img>`'e `width`/`height` + `alt` (süs ise `alt=""`), klasör altı için `loading="lazy"`.
- Her etkileşimli öğeye hover + active + `:focus-visible` (2 px `--izohips` halka, 3 px ofset).
- `prefers-reduced-motion` sayfa geçişlerini kapatır; klipler yine oynar (Akın kararı, 13 Eki).
- Yeni sabit konumlu öğe: `.ray-ic`/`.panel-ic` yapışkan kabuk kalıbı (gömülü takım sayfasında `position:fixed` çalışmaz).

**Yapma**
- Tema, zemin rengi ya da yazı tipi değiştirme (lacivert "AURA gece" teması reddedildi, 8 Eki).
- Paragraf yığını; "TIKLA" etiketi; katlama (accordion) yerine kapalı kart + panel.
- Blur'lu fon, scroll-driven opacity, `transition: all`, `outline: none` (halkasız), `user-scalable=no`.
- PDF gömme, boş OBS şablonu, hoca/personel adı, ders kaydı/transkript sözü, zaman damgalı alıntı.
- Üç eşit kartlı "özellik satırı", mor gradyan, Lucide ikon seti, "Elevate/Seamless" tarzı klişe.
- Anketlerde oy sayısı (yalnız oran). "Hoca değil arkadaş" kıyası.

## 8. Duyarlı davranış

- Kırılımlar: ≤ 600 (telefon, tek sütun, dokunma) · 601–1239 (tablet) · ≥ 1240 (`.sar` tam genişlik, 3 sütun).
- Telefonda: başlık çubuğu yatay kaydırılır, bulut başlık altına iner, kart yüzü 2 satır, ayrıntı tam ekran panel (`100dvh`,
  `overscroll-behavior: contain`), geri tuşu/aşağı kaydırma kapatır, 3 sn sonra 26 px/sn akıcı iniş.
- `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent` tüm bağlantı/düğmelerde.
- Dokunma hedefi ≥ 44 px; küçük ok/çip hedefleri padding ile büyütülür.

## 9. Ajan yönergesi (prompt kılavuzu)

Yeni içerik/bileşen eklerken şu sırayla:
1. `DESIGN.md` + ilgili bölümün temasını (`.t-…`) oku; yeni renk/yazı tipi **ekleme**.
2. Metni "Ne / Nasıl / Neden" ya da madde bloklarına böl; balon = tek cümle.
3. Görseli `.cer` çerçeve ya da `video.gif` klip olarak koy; `width/height/alt/poster` eksiksiz.
4. Bölümü `_araclar/qa_tasarim.py` ile 390 + 1440 px'te çek; taşma 0, konsol hata 0, odak görünür olmalı; ekran görüntüsüne
   **gerçekten bak** (Playwright döngüsü: kur → aç → bak → düzelt).
5. Vercel Web Interface Guidelines listesiyle (web-design-guidelines skill) dosya:satır denetimi; sonra `?v=` damgasını tazele.
6. Commit dosya dosya (`git add <dosya>`), `git add -A` YOK (aynı depoda başka oturumlar çalışıyor).
