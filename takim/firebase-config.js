/* Firebase bağlantısı. BOŞKEN sayfa "test modu"nda çalışır (oylar yalnız bu cihazda, localStorage).
   Canlıya almak için (bkz. KURULUM.md): Firebase konsolundan web uygulaması ayarlarını buraya yaz.
   Örnek:
   window.TAKIM_FIREBASE = {
     apiKey: "AIza...", authDomain: "nwp-takim.firebaseapp.com", projectId: "nwp-takim",
     storageBucket: "nwp-takim.appspot.com", messagingSenderId: "123", appId: "1:123:web:abc"
   };
   apiKey burada herkese açık olur; bu normaldir — güvenlik Firestore kurallarıyla (firestore.rules) sağlanır. */
window.TAKIM_FIREBASE = null;
