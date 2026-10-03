# /takim/ — Firebase kurulumu (Ömer için, ~5 dakika, ücretsiz)

Anahtar girilmeden sayfa **test modunda** çalışır: oylar ve mesajlar yalnız o cihazda (localStorage) tutulur, üst barda "test modu" rozeti görünür. Canlı anket için:

1. https://console.firebase.google.com → **Proje ekle** → ad: `nwp-takim` → Google Analytics **kapalı** → Oluştur.
2. Soldan **Build → Authentication → Başlayın** → Sign-in method → **Anonymous** → Etkinleştir → Kaydet.
3. **Build → Firestore Database → Veritabanı oluştur** → konum `eur3 (europe-west)` → **Production mode** → Oluştur.
4. Firestore → **Rules** sekmesi → içeriği sil, `takim/firestore.rules` dosyasının içeriğini yapıştır → **Publish**.
5. Proje ayarları (dişli) → **Genel** → "Uygulamalarınız" → **Web (</>)** → takma ad `takim-site` → Hosting işaretleme → Kaydet → çıkan `firebaseConfig = {...}` nesnesini kopyala.
6. `takim/firebase-config.js` içinde `window.TAKIM_FIREBASE = null;` satırını `window.TAKIM_FIREBASE = { ...kopyaladığın nesne... };` yap.
7. Authentication → **Settings → Authorized domains** → `akinci22.github.io` ekle (localhost zaten var).
8. Push. Sayfayı aç: rozet kaybolmalı, bir oy ver, başka cihazdan yüzdeyi gör.

## Yönetim
- Uygunsuz baloncuk: Firestore → `bubbles` → belge → `gizli: true` yap (sayfa onu göstermez). Silmek de olur.
- Oyları dışa almak: Firestore → `votes` koleksiyonu; ya da Google Cloud Console → Firestore export.
- Ücretsiz katman: günde 50 bin okuma / 20 bin yazma. Bu sayfa için fazlasıyla yeter; `votes` dinleyicisi her anket için tüm oyları okur — 1.000 oyu geçerse `takim.js` içindeki `canliSayac` fonksiyonunu aggregation (count) sorgusuna çevir (not var).

## Güvenlik notu
`apiKey` gizli değildir; Firestore kuralları (yukarıdaki dosya) create-only oy, 200 karakter mesaj, alan beyaz listesi ve `uid` eşleşmesi zorunlu kılar. Güncelleme/silme istemciden kapalı.
