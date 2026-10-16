/* /takim/ v3 — tek dosya, derleme yok.
   Bölümler: yardımcılar · arka uç (yerel/Firebase) · veri · etkileşim çekirdeği (sözlük, ipucu, panel, detay) · render · süsler (ray, imleç, yumuşak kaydırma). */
/* içkin mod (ana sayfa): takim/ic.js bu dosyayı window.TAKIM_IC = {kok: gölge kök, host: #takim-ic, govde: .govde} ile içe aktarır.
   O zaman sorgular gölge kökte çalışır, durum sınıfları host'a yazılır, yollar takim/ önekli olur; ray/panel/imleç/yumuşak tekerlek kapalıdır. Bağımsız /takim/ sayfasında IC null. */
const IC = window.TAKIM_IC || null;
const PARITE = true;   /* 14 Eki (Akın): gömülü ve bağımsız birebir aynı → imleç/fırlatma gömülüde de açık, kâğıt/vurgu ısınması iki modda da kapalı */
const KOK = IC ? IC.kok : document;
const KOKEL = IC ? IC.host : document.documentElement;
const GOVDE = IC ? IC.govde : document.body;
const TABAN = IC ? 'takim/' : '';
const yol = u => (IC && typeof u === 'string') ? (u.startsWith('../') ? u.slice(3) : /^(g|veri)\//.test(u) ? TABAN + u : u) : u;
const $ = (s, k = KOK) => k.querySelector(s);
const $$ = (s, k = KOK) => Array.from(k.querySelectorAll(s));
const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dokunmatik = matchMedia('(pointer: coarse)').matches;
/* v2 (5 Eki): ?kime=khsm|hoca → resmî görünüm (kanıt açık, anket/baloncuk yok, kuruluş özeti üstte). İçkin modda ana sayfanın adresinden okunur. */
const KIME = (() => { try { const v = new URLSearchParams(location.search).get('kime') || ''; return /^(khsm|hoca)$/.test(v) ? v : ''; } catch (e) { return ''; } })();
/* gömülü mod: ana sayfadaki pencerede açılınca geri bağlantısı gizlenir, ana siteye giden bağlantılar üst pencereyi hedefler */
const gomulu = !IC && (new URLSearchParams(location.search).has('gomulu') || window.top !== window.self);
if (gomulu) { document.documentElement.classList.add('gomulu'); document.addEventListener('click', e => { const a = e.target.closest('a[href^="../"]'); if (a) a.target = '_top'; }, true); }
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return v; } catch (e) { return null; } };
const el = (tag, attrs = {}, ...cocuklar) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v === true ? '' : v); } for (const c of cocuklar.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); return e; };
const rastgele = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (t, a, txt) => { const n = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); if (txt !== undefined) n.textContent = txt; return n; };

const veri = {};
const durum = { grup: ls('takim-grup') || '', kitle: ls('takim-kitle') || '', eslesme: { evet: 0, toplam: 0 }, test: { dogru: 0, toplam: 0, set: 'mto' }, roller: [], etkilesim: 0, asama: 0 };

/* ---------------- ARKA UÇ ---------------- */
class Yerel {
  constructor() { this.uid = ls('takim-uid') || ls('takim-uid', 'yerel-' + rastgele()); this.d = {}; this.bd = []; this.mod = 'yerel'; }
  async oyAl(id) { try { return JSON.parse(ls('oy:' + id) || 'null'); } catch (e) { return null; } }
  async oyVer(id, data) { if (await this.oyAl(id)) throw new Error('var'); ls('oy:' + id, JSON.stringify({ ...data, pollId: id, uid: this.uid, ts: Date.now() })); (this.d[id] || []).forEach(f => f()); }
  dinle(id, cb) { const f = async () => { const v = await this.oyAl(id); const sayim = {}; if (v) [].concat(v.secim).forEach(s => sayim[s] = (sayim[s] || 0) + 1); cb(sayim, v ? 1 : 0, v && v.diger ? [v.diger] : []); }; (this.d[id] = this.d[id] || []).push(f); f(); return () => { this.d[id] = this.d[id].filter(x => x !== f); }; }
  async balonEkle(b) { const l = this._balonlar(); l.unshift({ ...b, uid: this.uid, ts: Date.now(), id: rastgele() }); ls('balonlar', JSON.stringify(l.slice(0, 60))); this.bd.forEach(f => f()); }
  _balonlar() { try { return JSON.parse(ls('balonlar') || '[]'); } catch (e) { return []; } }
  balonDinle(cb) { const f = () => cb(this._balonlar()); this.bd.push(f); f(); return () => { }; }
}
class Bulut {
  constructor(cfg) { this.cfg = cfg; this.mod = 'bulut'; }
  async init() {
    const S = 'https://www.gstatic.com/firebasejs/10.14.1/';
    const [{ initializeApp }, A, F] = await Promise.all([import(S + 'firebase-app.js'), import(S + 'firebase-auth.js'), import(S + 'firebase-firestore.js')]);
    this.F = F; const app = initializeApp(this.cfg); const auth = A.getAuth(app); this.db = F.getFirestore(app);
    await A.signInAnonymously(auth);
    await new Promise(r => A.onAuthStateChanged(auth, u => { if (u) { this.uid = u.uid; r(); } }));
  }
  async oyAl(id) { const s = await this.F.getDoc(this.F.doc(this.db, 'votes', id + '_' + this.uid)); return s.exists() ? s.data() : null; }
  async oyVer(id, data) { const ref = this.F.doc(this.db, 'votes', id + '_' + this.uid); const d = { pollId: id, uid: this.uid, secim: data.secim, ts: this.F.serverTimestamp() }; if (data.diger) d.diger = data.diger; if (data.grup) d.grup = data.grup; await this.F.setDoc(ref, d); }
  /* 1.000+ oyda getCountFromServer ile değiştir (KURULUM.md). */
  dinle(id, cb) { const q = this.F.query(this.F.collection(this.db, 'votes'), this.F.where('pollId', '==', id)); return this.F.onSnapshot(q, snap => { const sayim = {}; let n = 0; const sozler = []; snap.forEach(d => { n++; const v = d.data(); [].concat(v.secim).forEach(s => sayim[s] = (sayim[s] || 0) + 1); if (v.diger) sozler.push(String(v.diger).slice(0, 120)); }); cb(sayim, n, sozler); }, () => cb({}, 0, [])); }
  async balonEkle(b) { const d = { uid: this.uid, metin: b.metin, gorunum: b.gorunum, gizli: false, ts: this.F.serverTimestamp() }; for (const k of ['ad', 'org', 'unvan', 'grup']) if (b[k]) d[k] = b[k]; await this.F.addDoc(this.F.collection(this.db, 'bubbles'), d); }
  balonDinle(cb) { const q = this.F.query(this.F.collection(this.db, 'bubbles'), this.F.where('gizli', '==', false), this.F.orderBy('ts', 'desc'), this.F.limit(60)); return this.F.onSnapshot(q, snap => { const l = []; snap.forEach(d => l.push({ id: d.id, ...d.data(), ts: d.data().ts?.toMillis?.() || 0 })); cb(l); }, () => cb([])); }
}
let arka;
async function arkaKur() {
  const cfg = window.TAKIM_FIREBASE;
  if (cfg && cfg.apiKey) { try { const b = new Bulut(cfg); await b.init(); arka = b; return; } catch (e) { console.warn('Firebase başlatılamadı, yerel moda düşüldü', e); } }
  arka = new Yerel(); if (/[?&]test/.test(location.search)) $('#mod-rozet').hidden = false;
}

/* ---------------- VERİ ---------------- */
const VERI_V = '30';   /* veri damgası: canlıdaki değerden hep BÜYÜK (geriye düşürmek önbellekten eski JSON getirir); _araclar/damga.py --veri ile artar */
async function yukle() {
  await Promise.all(['anket', 'metinler', 'kufur', 'bolumler', 'sayilar', 'takimlar', 'gercekcilik', 'karne', 'sozluk', 'fakulteler', 'dersler', 'dunya', 'kaynaklar', 'p3/_index', 'mto-plan'].map(async a => { try { veri[a] = await (await fetch(`${TABAN}veri/${a}.json?v=${VERI_V}`)).json(); } catch (e) { veri[a] = null; } }));
}
const sayiBul = id => (veri.sayilar || []).find(s => s.id === id);
const yerDoldur = s => String(s || '').replace(/\{\{S:([\w-]+)\}\}/g, (_, id) => { const k = sayiBul(id); return k ? k.sayi : '…'; }).replace(/\s{2,}/g, ' ').trim();

/* ---------------- ETKİLEŞİM ÇEKİRDEĞİ ---------------- */
/* ipucu: imlecin yanında küçük kutu + sağ paneldeki "Not" kutusu aynı metni gösterir (bilgi veren hover) */
let ipucuZaman = 0;
/* sağ panel notu: üzerine gelinen/dokunulan şeyin başlığı, kısa ve UZUN hâli (boş alan dolu kalsın) */
/* Akın 6 Eki: anlatı paragraf değil madde — cümleler kısa maddelere, kaynak satırları dışarıda */
function maddeler(t, n) { return cumleler(yerDoldur(String(t || '').replace(/\n+/g, ' '))).filter(c => !/^(Kaynak|Güven)\s*:/i.test(c)).slice(0, n).map(c => c.length > 120 ? c.slice(0, 117).replace(/\s\S*$/, '') + '…' : c); }
/* Akın 6 Eki: kart metinleri — iki ve üstü cümle maddeye bölünür; tek kısa cümle "öz" olur, büyük yazılır */
function maddele(kok) {
  $$('.olay-k .m, .sana-k .m, .bk-yuz, .kart > p, .vaka p', kok).forEach(p => {
    if (p.dataset.md || p.children.length) return; p.dataset.md = '1'; const parca = cumleler(p.textContent);   /* yalnız tam cümleler maddeye ayrılır; noktalı virgülle bölmek yarım cümle bırakıyordu */
    if (parca.length > 1) { p.classList.add('maddeli'); p.replaceChildren(...parca.map(x => el('span', { class: 'md' }, x.replace(/\.\s*$/, '')))); }
    else p.classList.add('oz');
  });
}
/* 14 Eki (tur 9): ek = { satirlar: ['…', …] (2-4 kısa satır, her biri ayrı <p>; verilirse uzun metnin maddeleri yerine geçer), gorseller: [{src, ad, kaynak}] (benzer projelerin görselleri; yoksa satır görünmez) } */
function panelNot(baslik, kisa, uzun, ipucu, ek) {
  const pn = $('#p-not'); if (!pn) return; pn.classList.add('canli'); pn.querySelector('.panel-ust').textContent = 'Not · ' + (baslik || '');
  $('#p-not-m').textContent = kisa || ''; const U = $('#p-not-uzun');
  const satirlar = (ek && Array.isArray(ek.satirlar) && ek.satirlar.length) ? ek.satirlar.slice(0, 4).map(s => kisalt(s, 96)) : maddeler(uzun, 3);
  U.replaceChildren(...satirlar.map(p => el('p', { class: 'md' }, p)));
  panelGorselYaz(ek && ek.gorseller);
  const ip = $('#p-not-ip'); if (ip) ip.hidden = !ipucu;
  if (dokunmatik || innerWidth < 1180) { const A = $('#alt-not'); if (A && !ipucu) { const D = $('#detay'); if (D && (D.open || D.classList.contains('p3-acik'))) { if (A.parentNode !== D) D.append(A); } else if (A.parentNode !== GOVDE) GOVDE.append(A);   /* dialog top-layer'da: alt not onun içine taşınır ki görünsün; kapanınca gövdeye döner */
    $('#alt-not-b').textContent = baslik || ''; $('#alt-not-m').textContent = kisa || ''; A.hidden = false; clearTimeout(A._z); A._z = setTimeout(() => { A.hidden = true; }, 6000); } }
}
/* panel notunun altında 2-4 küçük görsel (alt yazı: ad · kaynak alanı); yüklenemeyen kaldırılır — boş kutu yok */
function panelGorselYaz(G) {
  const U = $('#p-not-uzun'); if (!U) return; let K = $('#p-not-gorsel');
  if (!K) { K = el('div', { id: 'p-not-gorsel', hidden: true }); U.after(K); }
  const L = (G || []).filter(g => g && g.src).slice(0, 4);
  K.replaceChildren(...L.map(g => { const f = el('figure', { class: 'pn-g' }, el('img', { src: yol(g.src), alt: g.ad || g.alt || '', loading: 'lazy', decoding: 'async', onerror: () => { f.remove(); if (!K.children.length) K.hidden = true; } }), el('figcaption', {}, [g.ad || g.alt || '', kaynakAlan(g.kaynak)].filter(Boolean).join(' · '))); return f; }));
  K.hidden = !L.length;
}
const kaynakAlan = u => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : ''; } catch (e) { return ''; } };
function ipucuGoster(baslik, metin, x, y) {
  const k = $('#ipucu'); k.replaceChildren(el('b', {}, baslik), metin); k.hidden = false;
  const w = Math.min(320, innerWidth - 24); let lx = x + 18, ly = y + 18; if (lx + w > innerWidth - 8) lx = x - w - 18; if (ly + 140 > innerHeight) ly = y - 150;
  const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; k.style.left = (Math.max(8, lx) - g.left) + 'px'; k.style.top = (Math.max(8, ly) - g.top) + 'px';   /* içkin: gövdeye göre (host contain:paint → fixed çalışmaz) */
  panelNot(baslik, metin, '', false);
}
const NOT_VARSAYILAN = ['Not · üzerine gel', 'Altı noktalı terimlere, kartlara ve ray üstündeki seviyelere gelince açıklaması burada belirir.'];
let notZ; function notSifirla() { clearTimeout(notZ); notZ = setTimeout(() => { const pn = $('#p-not'); if (!pn || pn.classList.contains('canli') || P3) return; pn.querySelector('.panel-ust').textContent = NOT_VARSAYILAN[0]; $('#p-not-m').textContent = NOT_VARSAYILAN[1]; $('#p-not-uzun').replaceChildren(); panelGorselYaz(null); const ip = $('#p-not-ip'); if (ip) ip.hidden = true; }, 6000); }   /* p3 ekranı açıkken panel o ekranın özetini tutar, sıfırlanmaz */
function ipucuGizle() { $('#ipucu').hidden = true; const pn = $('#p-not'); if (pn) pn.classList.remove('canli'); notSifirla(); }
function altNotKur() { const k = $('#alt-not-kapat'); if (k) k.addEventListener('click', () => { $('#alt-not').hidden = true; }); }
function ipucuBagla(e, al) {
  if (dokunmatik) { e.addEventListener('click', ev => { const { baslik, metin } = al(); ipucuGoster(baslik, metin, ev.clientX, ev.clientY); setTimeout(ipucuGizle, 3500); }); return; }
  let t; e.addEventListener('pointerenter', ev => { clearTimeout(t); t = setTimeout(() => { const { baslik, metin } = al(); ipucuGoster(baslik, metin, ev.clientX, ev.clientY); }, 350); });
  e.addEventListener('pointermove', ev => { if (!$('#ipucu').hidden) { const k = $('#ipucu'); const w = k.offsetWidth; let lx = ev.clientX + 18; if (lx + w > innerWidth - 8) lx = ev.clientX - w - 18; const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; k.style.left = (Math.max(8, lx) - g.left) + 'px'; k.style.top = (Math.min(innerHeight - k.offsetHeight - 8, ev.clientY + 18) - g.top) + 'px'; } });
  e.addEventListener('pointerleave', () => { clearTimeout(t); ipucuGizle(); });
}
/* sade dil: terimin yanına parantezle kısa karşılık. Sözlükteki "ad (karşılık)" parantezi varsa o; yoksa açıklamanın ilk cümlesi (≤64 harf). */
function kisaKarsilik(t) { const p = (t.ad || '').match(/\(([^)]+)\)/); if (p) return p[1]; const c = String(t.m || '').split(/(?<=[.!?])\s/)[0].replace(/\.$/, ''); return c.length > 64 ? c.slice(0, 61).replace(/\s\S*$/, '') + '…' : c; }
function sadeKur() {
  const ic = $('.ust-ic'); if (!ic) return; const kayit = ls('takim-sade'); let acik = kayit == null ? true : kayit === '1';
  const b = el('button', { class: 'sade-dugme', type: 'button', 'aria-pressed': String(acik), title: 'Terimlerin yanına kısa Türkçe karşılığını yazar' }, 'Sade dil');
  const uygula = () => { KOKEL.classList.toggle('sade', acik); b.setAttribute('aria-pressed', String(acik)); };
  b.addEventListener('click', () => { acik = !acik; ls('takim-sade', acik ? '1' : '0'); uygula(); durum.etkilesim++; });
  const r = $('#mod-rozet'); ic.insertBefore(b, r || null); uygula();
}
/* sözlük: metinde geçen terimleri (blok başına ilk geçiş) sarar */
function terimSar(kok) {
  const T = veri.sozluk?.terimler; if (!T) return;
  const anahtarlar = Object.keys(T).sort((a, b) => b.length - a.length);
  const kacir = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + anahtarlar.map(kacir).join('|') + ')(?=$|[^\\p{L}\\p{N}])', 'iu');
  const hedefler = $$('.alt, .kart p, .ses p, figcaption, .soru h3, .bd-satir span:last-child, .olay-k .m, .vaka p, .akis-k span, .adimlar span, .kapi > span, .bk .es span, .sk span, .son-kart p, .detay-uzun, .detay-kisa, .bd-uzun', kok);
  hedefler.forEach(h => {
    const gorulen = new Set(); const yuru = (n) => { if (n.nodeType === 3) { const m = n.nodeValue.match(re); if (!m) return; const key = m[2].toLowerCase(); if (gorulen.has(key)) return; const idx = m.index + m[1].length; const once = n.nodeValue.slice(0, idx), kelime = n.nodeValue.slice(idx, idx + m[2].length), sonra = n.nodeValue.slice(idx + m[2].length);
      const t = T[key]; const sp = el('span', { class: 'terim', 'data-terim': key, 'data-k': /^\s*\(/.test(sonra) ? '' : kisaKarsilik(t), tabindex: 0 }, el('span', { class: 'tk' }, kelime));   /* metinde zaten parantezli karşılık varsa sade dil ikinci kez yazmaz */ const f = document.createDocumentFragment(); f.append(once, sp, sonra); const son = f.lastChild; n.replaceWith(f); gorulen.add(key); ipucuBagla(sp, () => ({ baslik: t.ad, metin: t.m })); if (son && son.nodeType === 3) yuru(son); return; }
      if (n.nodeType === 1 && !n.classList.contains('terim') && n.tagName !== 'A' && n.tagName !== 'B') Array.from(n.childNodes).forEach(yuru); };
    yuru(h);
  });
}
/* odak yazısı (Akın 5 Eki): bulanıklık son dozuna ulaşırken açıklama ayrı panel/dialog yerine doğrudan perdenin ÜSTÜNDE, büyük ve okunaklı.
   Perdede karta oyuk açılır (clip-path) → kart içkin modda da net kalır (content-visibility bölümleri ayrı stacking context, z-index yetmez).
   Yazı kartın en geniş boş tarafına (sağ/sol öncelikli, yoksa alt/üst) yerleşir; dokunmatik ve azaltılmış harekette yok. */
let odakEl = null, odakRaf = 0, odakTemiz;
function odakKutu() { let k = $('#odak-yazi'); if (!k) { k = el('div', { id: 'odak-yazi', 'aria-hidden': 'true' }, el('p', { class: 'oy-ust' }), el('h3', { class: 'oy-baslik' }), el('p', { class: 'oy-kisa' }), el('div', { class: 'oy-uzun' })); GOVDE.append(k); } return k; }
function odakYerlestir() {
  const e = odakEl, k = $('#odak-yazi'), P = $('#perde'); if (!e || !k) return;
  const r = e.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
  const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 };   /* içkin: perde ve yazı gövdeye göre (absolute) konumlu */
  if (P) { /* Akın 6 Eki: oyuk kartın kendi yuvarlak köşesiyle birebir; sert dikdörtgen çerçeve kalmaz */
    const pr = P.getBoundingClientRect(), W = pr.width, H = pr.height, x1 = r.left - pr.left, y1 = r.top - pr.top, w = r.width, h = r.height;
    const rad = Math.min(parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0, w / 2, h / 2);
    P.style.clipPath = `path(evenodd,'M0 0H${W}V${H}H0Z M${x1 + rad} ${y1}H${x1 + w - rad}A${rad} ${rad} 0 0 1 ${x1 + w} ${y1 + rad}V${y1 + h - rad}A${rad} ${rad} 0 0 1 ${x1 + w - rad} ${y1 + h}H${x1 + rad}A${rad} ${rad} 0 0 1 ${x1} ${y1 + h - rad}V${y1 + rad}A${rad} ${rad} 0 0 1 ${x1 + rad} ${y1}Z')`; }
  const pan = (vw >= 1180) ? $('.panel-ic') : null, sag = pan ? pan.getBoundingClientRect().left : vw;   /* bağımsız sayfada sağ panelin üstüne yazılmaz */
  const ub = $('.ust') ? $('.ust').getBoundingClientRect() : null, U = Math.max(0, ub && ub.top < 4 ? ub.bottom : 0);   /* yapışkan aşama çubuğunun altına yerleşir, üstüne binmez */
  const rayEl = $('.ray'), rayR = rayEl && getComputedStyle(rayEl).display !== 'none' ? rayEl.getBoundingClientRect().right : 0, solK = Math.max(0, rayR);   /* 8 Eki: soldaki basınç rayının üstüne yazılmaz */
  const B = 36, cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, genis = Math.min(980, sag - solK - 2 * B);
  const bolge = [
    { ad: 'sag', w: sag - r.right - 2 * B, h: vh - U - 2 * B, x: r.right + B, yan: true },
    { ad: 'sol', w: r.left - solK - 2 * B, h: vh - U - 2 * B, x: solK + B, yan: true },
    { ad: 'alt', w: genis, h: vh - r.bottom - 2 * B, y: r.bottom + B },
    { ad: 'ust', w: genis, h: r.top - U - 2 * B, y: U + B },
  ].map(b => Object.assign(b, { puan: Math.max(0, b.w) * Math.max(0, b.h) * (b.w < 300 || b.h < 160 ? .15 : 1) * (b.yan && b.w >= 380 ? 1.6 : 1) })).sort((a, b) => b.puan - a.puan)[0];
  k.style.setProperty('--oy', bolge.w < 400 ? '1' : bolge.w < 540 ? '1.2' : '1.45');   /* Akın 6 Eki: tıklayınca yazılar çok daha büyük */   /* dar bölgede punto biraz küçülür, yine büyük */
  k.style.width = Math.max(220, bolge.w) + 'px'; k.style.maxHeight = Math.max(120, bolge.h) + 'px';
  for (let o = parseFloat(k.style.getPropertyValue('--oy')); o > .62 && k.scrollHeight > k.clientHeight + 2; o -= .08) k.style.setProperty('--oy', o.toFixed(2));   /* sığmazsa kademeli küçült */
  const kh = k.offsetHeight, kw = k.offsetWidth; let x, y;
  if (bolge.yan) { x = bolge.x; y = Math.max(U + B, Math.min(Math.max(U + B, cy - kh / 2), vh - B - kh)); }
  else { x = Math.min(Math.max(solK + B, cx - kw / 2), sag - B - kw); y = bolge.ad === 'alt' ? bolge.y : Math.max(U + B, r.top - B - kh); }
  k.style.left = (x - g.left) + 'px'; k.style.top = (y - g.top) + 'px';
}
function odakGoster(e, d, goster = true) {
  if (dokunmatik || azalt) return;
  clearTimeout(odakTemiz); odakEl = e; const k = odakKutu();
  k.querySelector('.oy-ust').textContent = d.ust || ''; k.querySelector('.oy-baslik').textContent = d.baslik || ''; k.querySelector('.oy-kisa').textContent = d.kisa || '';
  /* 8 Eki: yapılı kartlarda ayrık bloklar; düz metinde de etiketli kısa bloklar (en çok 3 blok × 2 madde, madde ≤ 110 harf) — paragraf yığını yok */
  const kisaBlok = Array.isArray(d.bloklar) && d.bloklar.length ? d.bloklar : metinBloklar(d.uzun).filter(b => b.tip !== 'satir' || !/^(Kaynak|Güven)$/i.test(b.etiket)).slice(0, 3).map(b => b.tip === 'madde' ? { ...b, kisaGoster: true, maddeler: b.maddeler.slice(0, 2).map(x => x.length > 110 ? x.slice(0, 107).replace(/\s\S*$/, '') + '…' : x) } : b);
  k.querySelector('.oy-uzun').replaceChildren(...(kisaBlok.length ? blokCiz(kisaBlok, true) : maddeler(d.uzun, 4).map(p => el('p', { class: 'md' }, p))));
  k.classList.remove('acik'); odakYerlestir();
  const t0 = performance.now(); cancelAnimationFrame(odakRaf);
  const dongu = () => { if (odakEl !== e) return; odakYerlestir(); if (performance.now() - t0 < 520) odakRaf = requestAnimationFrame(dongu); };   /* kart .35 sn büyürken oyuk onu izler */
  odakRaf = requestAnimationFrame(dongu);
  if (goster) requestAnimationFrame(() => { if (odakEl === e) k.classList.add('acik'); });   /* perde .7 sn'de dolar, yazı .18 sn gecikmeyle .5 sn'de gelir: bulanıklık tamamlanırken yazı yerinde */
}
function odakGizle() {
  odakEl = null; cancelAnimationFrame(odakRaf); const k = $('#odak-yazi'); if (k) k.classList.remove('acik');
  clearTimeout(odakTemiz); odakTemiz = setTimeout(() => { const P = $('#perde'); if (P && !odakEl) P.style.clipPath = ''; }, 750);   /* perde sönerken oyuk kalır, kart bir an bile bulanmaz */
}
let odakKaydirMuaf = 0;   /* 7 Eki: hızlı kaydırıp hemen karta gelince Lenis'in sönümleme karesi (lerp) birkaç yüz ms daha 'scroll' ateşler; bu, daha yeni başlayan odağı anında iptal ediyordu (özellikle sayfanın altındaki SSS gibi uzun kaydırma gereken bölümlerde) → kart üstüne gelişten kısa bir süre sonrasına kadar kalıntı kaydırma odağı iptal etmez */
/* 120fps (15 Eki): sayfadaki tek scroll dinleyicisi — passive, yalnız bayrak; işler kare başına bir kez rAF'ta */
const BOSTA = []; let bostaZ = 0; const bostaCalis = () => { bostaZ = 0; BOSTA.splice(0).forEach(f => f()); };
function kaydirmaBitince(f) { BOSTA.push(f); if (!bostaZ) bostaZ = setTimeout(bostaCalis, 260); }   /* süs animasyonları (rozet sezdirme, başlık harfleri) kaydırma durunca başlar: kayarken kare bütçesi kaydırmanın */
const KAYDIRMA = new Set(); let kayBusRaf = 0; addEventListener('scroll', () => { if (bostaZ) { clearTimeout(bostaZ); bostaZ = setTimeout(bostaCalis, 260); } if (!kayBusRaf) kayBusRaf = requestAnimationFrame(() => { kayBusRaf = 0; KAYDIRMA.forEach(f => f()); }); }, { passive: true });
KAYDIRMA.add(() => { if (odakEl && performance.now() > odakKaydirMuaf) { GOVDE.classList.remove('odak', 'odak-son'); odakEl.classList.remove('odakli'); odakGizle(); } });   /* kaydırmada odak biter: tam ekran blur kaydırma karelerini yemesin */
/* kart etkileşimi: üzerinde dur → kararır + arka plan bulanır + "ne öğrenirsin" satırı; tıkla → ayrıntı (sayfa gibi döner) */
const kaynakAl = (...o) => { const g = new Set(); return o.flatMap(x => !x ? [] : [...(x.kaynaklar || []), ...(x.kaynakUrl ? [{ ad: x.kaynakAdi || 'kaynak', url: x.kaynakUrl }] : []), ...(typeof x.kaynak === 'string' && /^https?:/.test(x.kaynak) ? [{ ad: 'kaynak', url: x.kaynak }] : [])]).filter(k => k && k.url && !g.has(k.url) && g.add(k.url)); };   /* 8 Eki: her bilgi kaynağıyla */
const kaynakMini = (L, on = 'Kaynak: ') => { L = (L || []).filter(k => k && k.url); return L.length ? el('span', { class: 'kaynak-mini' }, on, ...L.flatMap((k, i) => [i ? ' · ' : '', el('a', { href: k.url, target: '_blank', rel: 'noopener' }, k.ad || 'kaynak')])) : null; };
let odakZ, odakZ2, odakBirak, sonKapanis = -1e9; const ISRAR_SN = 3;   /* 8 Eki: son kapanıştan 3 sn içinde yeni kart → 3 sn ısrar */
function etkilesim(e, al) {
  e.classList.add('etk'); if (!e.querySelector('.etk-roz')) e.append(el('span', { class: 'etk-roz', 'aria-hidden': 'true' }));   /* sözsüz işaret: köşede açılır-ok (›), yazı yok */
  if (dokunmatik && !e.querySelector('.etk-on')) { try { const d = al(); const ilk = cumleler(String(d.uzun || '').replace(/\n+/g, ' ')).find(c => !/^(Kaynak|Güven)\s*:/i.test(c)) || ''; const cek = ilk.replace(/^[^:]{0,24}:\s*/, '').slice(0, 30); if (ilk && ilk !== d.kisa && !e.textContent.includes(cek)) e.append(el('span', { class: 'etk-on' }, ilk.length > 120 ? ilk.slice(0, 117).replace(/\s\S*$/, '') + '…' : ilk)); } catch (err) { } }   /* dokunmadan bilgi: ayrıntının ilk cümlesi kartta */
  if (!dokunmatik && !azalt) {
    /* Akın 8 Eki: imleç gelince HEMEN açılır; karttan çıkınca HEMEN kapanır. Az önce (3 sn içinde) bir kart kapandıysa yeni kart 3 sn ısrar ister:
       kartlar arasında gezinirken aç-kapa aç-kapa olmaz, kullanıcı imleci düşünmek zorunda kalmaz. */
    e.addEventListener('pointerenter', () => { clearTimeout(odakZ); clearTimeout(odakZ2); clearTimeout(odakBirak); clearTimeout(notZ); odakKaydirMuaf = performance.now() + 900; const d = al(); panelNot(d.baslik, d.kisa, d.uzun, true, d.ozet);
      if (d.p3) p3PanelGorselleri(d.p3).then(G => { if (G.length && e.matches(':hover') && !P3) panelGorselYaz(G); });   /* 14 Eki tur 9: bölüm kartında benzerini yapan projelerin görselleri */
      $$('.odakli').forEach(x => { if (x !== e) x.classList.remove('odakli'); });
      const ac = () => { if (!e.matches(':hover')) return; e.classList.remove('bekliyor'); GOVDE.classList.add('odak'); e.classList.add('odakli'); odakGoster(e, d, false);
        odakZ2 = setTimeout(() => { GOVDE.classList.add('odak-son'); const k = $('#odak-yazi'); if (k && odakEl === e) k.classList.add('acik'); }, 240); };
      const israr = performance.now() - sonKapanis < ISRAR_SN * 1000; e.classList.toggle('bekliyor', israr);
      if (israr) odakZ = setTimeout(ac, ISRAR_SN * 1000); else ac(); });
    e.addEventListener('pointerleave', () => { clearTimeout(odakZ); clearTimeout(odakZ2); e.classList.remove('bekliyor'); const pn = $('#p-not'); if (pn) pn.classList.remove('canli'); notSifirla();
      if (GOVDE.classList.contains('odak')) sonKapanis = performance.now();
      GOVDE.classList.remove('odak', 'odak-son'); e.classList.remove('odakli'); odakGizle(); });
  } else if (!dokunmatik) {   /* tur 9: hareket azaltmada odak/bulanıklık yok ama panel notu (ve bölüm görselleri) yine gelir — hareketsiz */
    e.addEventListener('pointerenter', () => { clearTimeout(notZ); const d = al(); panelNot(d.baslik, d.kisa, d.uzun, true, d.ozet); if (d.p3) p3PanelGorselleri(d.p3).then(G => { if (G.length && e.matches(':hover') && !P3) panelGorselYaz(G); }); });
    e.addEventListener('pointerleave', () => { const pn = $('#p-not'); if (pn) pn.classList.remove('canli'); notSifirla(); });
  }
  if (!azalt && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); kaydirmaBitince(() => e.classList.add('kesfet')); } }, { threshold: .6 }); io.observe(e); }
  e.addEventListener('click', ev => { if (ev.target.closest('a,input,select,textarea,.cip,.oy,.sec')) return; kocKapat(); ACAN = e; detayAc(al()); });
  e.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target === e) { ACAN = e; detayAc(al()); } });
}
/* ayrıntı = zihin haritası: ortada tıklanan kart (kök), çevresinde dallar; dala tıkla → açılır, cümleleri alt budak olur; köke tıkla → geri */
const cumleler = t => String(t || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜ0-9"(])/).filter(Boolean);
/* ======== 8 Eki (Akın): ayrıntı ve odak yazısı paragraf DEĞİL, ayrık bloklar: eşleşme (sol → sağ), güncel örnek kutusu, numaralı işler, kısa maddeler, tek satır. ======== */
function metinBloklar(uzun) {   /* düz metin ("Etiket: a · b", "1) ... 2) ...", cümleler) → bloklar; her paragraf ayrı blok, her cümle ayrı madde */
  const B = [];
  for (const p0 of String(uzun || '').split(/\n+/).map(p => p.trim()).filter(Boolean)) {
    if (/^(Kaynak|Güven)\s*:/i.test(p0)) { B.push({ tip: 'satir', etiket: p0.split(':')[0].trim(), m: p0.slice(p0.indexOf(':') + 1).trim() }); continue; }
    const m = p0.match(/^([^:.!?]{2,40}):\s+(.+)$/s); const baslik = m ? m[1].trim() : '', govde = m ? m[2] : p0;
    let L = govde.split(/\s(?=\(?\d{1,2}\)\s)/).map(x => x.replace(/^\(?\d{1,2}\)\s*/, '').replace(/[;,]\s*$/, '').trim()).filter(Boolean);
    if (L.length <= 1) L = govde.split(/\s·\s/).map(x => x.trim()).filter(Boolean);
    if (L.length <= 1) L = cumleler(govde);
    if (L.length === 1 && baslik) B.push({ tip: 'satir', etiket: baslik, m: L[0] });
    else B.push({ tip: 'madde', baslik, maddeler: L });
  }
  return B;
}
function blokCiz(bloklar, kisa) {   /* kisa: odak yazısı (üzerine gelince) — az ve ferah; tam: tıklayınca ayrıntı */
  const out = [];
  for (const bl of bloklar || []) {
    const bas = bl.baslik ? el('div', { class: 'blk-b' }, bl.baslik) : null;
    if (bl.tip === 'eslesme') { const S = kisa ? bl.satirlar.slice(0, 2) : bl.satirlar;
      out.push(el('div', { class: 'blk blk-es' }, bas, el('div', { class: 'es-izgara' }, ...S.flatMap(s => [el('span', { class: 'sol' }, s.sol), el('span', { class: 'ok', 'aria-hidden': 'true' }, '→'), el('span', { class: 'sag' }, s.sag), (!kisa && s.not) ? el('span', { class: 'not' }, s.not) : null])))); }
    else if (bl.tip === 'ornek') out.push(el('div', { class: 'blk blk-or' }, bas, el('div', { class: 'or-kutu' }, bl.ust ? el('span', { class: 'or-ust' }, bl.ust) : null, el('b', {}, bl.b), kisa ? null : el('ul', { class: 'blk-md' }, ...(bl.maddeler || []).map(x => el('li', {}, x))), (!kisa && bl.link) ? el('a', { class: 'or-link', href: bl.link.url, target: '_blank', rel: 'noopener' }, bl.link.ad + ' →') : null)));
    else if (bl.tip === 'madde') { if (kisa && !bl.kisaGoster) continue; out.push(el('div', { class: 'blk' }, bas, el('ul', { class: 'blk-md' }, ...(bl.maddeler || []).slice(0, kisa ? 3 : 99).map(x => el('li', {}, x))))); }
    else if (bl.tip === 'satir') out.push(el('div', { class: 'blk blk-satir' }, el('span', { class: 'blk-b' }, bl.etiket), el('span', {}, bl.m)));
  }
  return out;
}
function dallar(d) {
  if (Array.isArray(d.dallar) && d.dallar.length) return d.dallar;
  const par = String(d.uzun || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
  const kisalt = (t, n) => t.length > n ? t.slice(0, n - 3).replace(/\s\S*$/, '') + '…' : t;
  let L;
  if (par.length <= 1) {                                                 /* tek paragraf: her cümle bir dal (yaprak) */
    L = cumleler(par[0] || '').map(c => ({ baslik: c, alt: [] }));                                  /* tam cümle: üç nokta ile kesilmiş başlık yok */
  } else {                                                              /* çok paragraf: paragraf = dal, cümleleri = alt budak */
    L = par.map(p => { const c = cumleler(p); const ilk = c[0] || p; return { baslik: ilk, alt: c.slice(1) }; });
  }
  if (d.link) L.push({ baslik: d.linkAd || 'bağlantı →', link: yol(d.link), alt: ['Kaynağa git: ' + d.link.replace(/^https?:\/\//, '')] });
  return L;
}
const YUVALAR = [[79, 24], [79, 76], [21, 24], [21, 76], [50, 90], [50, 10]];   // kök etrafındaki dal yerleri (% x, % y)
/* v2 (Akın 5 Eki): ayrıntı beyaz kutuda değil, doğrudan bulanık zeminin ÜSTÜNDE büyük yazıyla; altta kaynak bağlantıları. */
function detayAc(d) {
  const D = $('#detay'); if (!D) return; GOVDE.classList.remove('odak'); $$('.odakli').forEach(x => x.classList.remove('odakli')); odakGizle();
  $('#detay-ust').textContent = d.ust || 'ayrıntı';
  const H = $('#harita'), S = $('#harita-cizgi'); if (S) S.replaceChildren(); H.replaceChildren(); D.classList.remove('dal-acik');
  let par = String(d.uzun || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
  const dar = innerWidth < 860;
  /* Akın 6 Eki akşam (mobil): uzun metin madde madde, ayrık; tek paragrafsa cümleleri madde olur. Kaynak/Güven satırları madde değil, en sonda küçük. */
  /* Akın 8 Eki: her genişlikte paragraf YOK — yapılı kartlarda bloklar (eşleşme, örnek, işler), düz metinde her paragraf ayrı blok, her cümle ayrı madde */
  const bloklar = Array.isArray(d.bloklar) && d.bloklar.length ? d.bloklar : metinBloklar(d.uzun);
  const kay = [...(d.kaynaklar || []), ...(d.link ? [{ ad: d.linkAd || 'bağlantı →', url: d.link }] : [])].filter(k => k && k.url);
  const dallarL = Array.isArray(d.dallar) ? d.dallar : [];
  /* 14 Eki: 3 fazlı proje ekranı — bölüm / fakülte-bölüm / ders kartları aynı bileşeni açar, yalnız filtre değişir (p3Kur) */
  p3Temizle(); D.classList.toggle('p3-acik', !!d.p3);
  if (d.p3) {
    H.append(el('div', { class: 'dm-ic p3-dm' }, p3Kur(d, D)));
    durum.etkilesim++;
    D.classList.add('metin'); D.classList.toggle('dar', innerWidth < 860); D.scrollTop = 0; D._ciz = null;
    if (typeof D.showModal === 'function') { if (!D.open) D.showModal(); } else D.setAttribute('open', '');   D.tabIndex = -1; requestAnimationFrame(() => D.focus({ preventScroll: true }));
    setTimeout(p3Odakla, 40);   /* D.focus'tan sonra: aktif ekranın başlığına odak */
    return;
  }
  H.append(el('div', { class: 'dm-ic' },
    el('p', { class: 'dm-ust' }, d.ust || ''),
    el('h3', { id: 'detay-baslik', class: 'dm-baslik' }, d.baslik || ''),
    d.kisa ? el('p', { class: 'dm-kisa' }, d.kisa) : null,
    bloklar.length ? el('div', { class: 'dm-uzun blok' }, ...blokCiz(bloklar, false).map((b, i) => { b.style.setProperty('--g', (120 + i * 70) + 'ms'); return b; })) : null,
    dallarL.length ? el('ol', { class: 'dm-dal' }, ...dallarL.map(b => el('li', {}, el('b', {}, b.baslik), (b.alt || []).length ? ' ' + b.alt.join(' ') : ''))) : null,
    kay.length ? el('p', { class: 'dm-kaynak' }, el('span', {}, kay.length > 1 ? 'Kaynaklar: ' : 'Kaynak: '), ...kay.flatMap((k, i) => [i ? ' · ' : '', el('a', { href: yol(k.url), target: /^https?:/.test(k.url) ? '_blank' : null, rel: 'noopener', onclick: k.url.startsWith('#') ? (e) => { e.preventDefault(); D.close(); git(k.url.slice(1)); } : null }, k.ad || k.url)])) : null,
    el('button', { class: 'detay-alt', type: 'button', onclick: () => D.close() }, '✕ Kapat')));
  terimSar(H); durum.etkilesim++;
  D.classList.add('metin'); D.classList.toggle('dar', innerWidth < 860); D.scrollTop = 0; D._ciz = null;
  if (typeof D.showModal === 'function') { if (!D.open) D.showModal(); } else D.setAttribute('open', '');   D.tabIndex = -1; requestAnimationFrame(() => D.focus({ preventScroll: true }));   /* 13 Eki: odak kaydırma kabında → ok tuşları PANELİ kaydırır (kapat düğmesi fixed; odak ondayken belge kayıyordu, ölçüldü) */
}
/* eski zihin haritası (v4); v2'de kullanılmıyor, geri dönüş için duruyor */
function detayAcHarita(d) {
  const D = $('#detay'); if (!D) return; GOVDE.classList.remove('odak'); $$('.odakli').forEach(x => x.classList.remove('odakli')); odakGizle(); D.classList.remove('metin');
  $('#detay-ust').textContent = d.ust || 'ayrıntı';
  const H = $('#harita'), S = $('#harita-cizgi'); H.replaceChildren(); S.replaceChildren(); D.classList.remove('dal-acik');
  const kok = el('button', { class: 'dugum kok', type: 'button', 'aria-label': 'Kök: ' + (d.baslik || '') }, el('span', { class: 'dugum-ust' }, 'kök'), el('h3', { id: 'detay-baslik' }, d.baslik || ''), el('p', {}, d.kisa || ''), el('span', { class: 'dugum-ip' }, dokunmatik ? 'aşağıdaki dallara dokun; açılır' : 'dallara tıkla'));
  H.append(kok);
  const L = dallar(d).slice(0, YUVALAR.length);
  const dalEl = L.map((b, i) => {
    const y = YUVALAR[i]; const n = el(b.link ? 'a' : 'button', { class: 'dugum dal', style: `--x:${y[0]}%;--y:${y[1]}%;--g:${i * 90}ms`, href: b.link || null, target: b.link && b.link.startsWith('http') ? '_blank' : null, rel: b.link ? 'noopener' : null, type: b.link ? null : 'button' },
      el('span', { class: 'dugum-no' }, String(i + 1).padStart(2, '0')), el('b', {}, b.baslik), el('ul', { class: 'budak' }, (b.alt || []).map((c, j) => el('li', { style: `--g:${j * 70}ms` }, c))), b.link ? null : el('span', { class: 'dal-geri' }, '← köke dön'));
    if (b.link) n.classList.add('bag');
    if (!b.link) n.addEventListener('click', () => { const acik = n.classList.contains('acik'); dalEl.forEach(x => x.classList.remove('acik')); if (!acik) { n.classList.add('acik'); D.classList.add('dal-acik'); if (D.classList.contains('dar')) setTimeout(() => n.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60); } else D.classList.remove('dal-acik'); durum.etkilesim++; cizgiler(); });
    return n;
  });
  H.append(...dalEl);
  H.append(el('button', { class: 'detay-alt', type: 'button', onclick: () => D.close() }, '✕ Kapat'));
  kok.addEventListener('click', () => { dalEl.forEach(x => x.classList.remove('acik')); D.classList.remove('dal-acik'); cizgiler(); });
  function cizgiler() {
    if (D.classList.contains('dar')) { S.replaceChildren(); return; }
    const R = S.getBoundingClientRect(); S.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`); S.replaceChildren();
    const kr = kok.getBoundingClientRect(), kx = kr.left - R.left + kr.width / 2, ky = kr.top - R.top + kr.height / 2;
    dalEl.forEach((n, i) => { const r = n.getBoundingClientRect(); const x = r.left - R.left + r.width / 2, y = r.top - R.top + r.height / 2; const mx = (kx + x) / 2;
      const p = svgEl('path', { d: `M${kx} ${ky} C${mx} ${ky} ${mx} ${y} ${x} ${y}`, class: n.classList.contains('acik') ? 'acik' : '' }); S.append(p); const u = p.getTotalLength(); p.style.setProperty('--u', u); p.style.animationDelay = (i * 90) + 'ms'; });
  }
  terimSar(H); durum.etkilesim++;
  D.classList.toggle('dar', innerWidth < 860); const yolP = $('#detay-yol'); if (yolP) { const dar = D.classList.contains('dar'); yolP.replaceChildren($('#detay-ust'), dar ? ' · dala dokun, açılır' : ' · dallara tıkla, köke dön · Esc kapatır'); }
  if (D.classList.contains('dar')) D.scrollTop = 0;
  if (typeof D.showModal === 'function') { if (!D.open) D.showModal(); } else D.setAttribute('open', '');   D.tabIndex = -1; requestAnimationFrame(() => D.focus({ preventScroll: true }));   /* 13 Eki: odak kaydırma kabında → ok tuşları PANELİ kaydırır (kapat düğmesi fixed; odak ondayken belge kayıyordu, ölçüldü) */
  requestAnimationFrame(() => requestAnimationFrame(cizgiler));
  D._ciz = cizgiler;
}
const DETAYLAR = {
  skewt: { ust: 'nasıl okunur', baslik: 'Skew-T diyagramı', kisa: 'Sondajın resmi: basınç yukarı doğru azalır, sıcaklık ekseni 45° eğiktir.', uzun: `Kırmızı çizgi sıcaklık (T), yeşil çizgi çiy noktası (Td). İkisi birbirine yaklaşınca hava doymuş, bulut var demektir; 28 Nisan'da 850 hPa civarında tam bu oluyor. Kesikli çizgiler Ömer'in Python'da adım adım (Runge-Kutta) kurduğu profil; düz çizgiler Kartal'dan kalkan gerçek radyosonde. Fark, dersteki denklemin doymuş hava varsayımından geliyor.\nSayfanın kendisi de bu diyagramdır: soldaki ray basınç ekseni, balon senin konumun, sağdaki panel okumalar.`, link: '../#arastirma', linkAd: 'Bulut projesinin tamamı →' },
  daniel: { ust: 'vaka', baslik: 'Storm Daniel ve İstanbul seli', kisa: '5-6 Eylül 2023: Başakşehir ve Küçükçekmece\'de saatte 100 mm\'yi aşan yağış, can kaybı.', uzun: 'Yunanistan üzerinde kesilmiş bir alçak basınç (cut-off low) günlerce yerinde kaldı; Teselya\'ya rekor yağış bıraktı, sonra Libya\'da Derne barajlarını yıktı. İstanbul\'daki sel aynı sistemin kuzeydoğu kanadında, Marmara üstünde gelişen konvektif hücrelerden geldi.\nSorumuz: yüksek çözünürlüklü bir hava tahmini bu yağışı nerede ve ne kadar yanlış koydu; olasılıklı düzeltme ve yapay zekâ bu hatayı ne kadar azaltır. Uydu kareleri NASA Worldview\'den, kamu malı.' },
  grid: { ust: 'neden önemli', baslik: '28 km\'lik kutu', kisa: 'Küresel model İstanbul\'u 50 kutuya böler ve her kutuya tek bir değer verir.', uzun: 'Boğaz, tepeler, deniz etkisi, şehir ısı adası: hepsi tek kutunun içinde kaybolur. Model Ayazağa ile Kadıköy\'e aynı sıcaklığı verebilir. Bu yüzden "tahmin düzeltme" diye bir iş var: kutunun değerini o kutudaki gerçek istasyonlara göre düzeltmek.\nBasamak 1\'de bu kutu için günlük hatayı ölçüyoruz; basamak 2-4\'te düzeltiyoruz. Yapay zekâ modelleri (GraphCast, AIFS) de aynı 0,25° gridde çalışır; onların da düzeltmeye ihtiyacı var.' }
};


/* ---------------- EELISA (12 Eki) — resmî bağ yok, yöntem feyzi ---------------- */
/* **kalın** işaretini güvenli düğümlere çevirir (innerHTML yok) */
function kalinla(t) { return yerDoldur(t).split(/\*\*(.+?)\*\*/g).map((p, i) => i % 2 ? el('b', {}, p) : p).filter(p => p !== ''); }
function eelisa() {
  const E = veri.metinler.eelisa; if (!E || !$('#eelisa')) return;
  const yaz = (id, t) => { const e = $(id); if (e) e.textContent = t || ''; };
  yaz('#eelisa-kapak-b', E.kapakB); yaz('#eelisa-kapak-m', E.kapakM);
  yaz('#eelisa-baslik', E.baslik); yaz('#eelisa-alt', E.alt);

  /* 1) sınır: ne DEĞİLİZ — en üstte, kaçırılmasın */
  const N = E.netlik;
  if (N) $('#ee-netlik').replaceChildren(
    el('p', { class: 'ee-n-ust' }, N.baslik),
    el('ul', { class: 'ee-n-liste' }, ...(N.maddeler || []).map(m => el('li', {}, ...kalinla(m)))));

  /* 2) ilkeler: onlarda ne var · bizde karşılığı ne */
  $('#ee-ilkeler').replaceChildren(...(E.ilkeler || []).map(i => {
    const k = el('article', { class: 'ee-k' },
      el('p', { class: 'ee-k-ust' }, i.ust),
      el('h3', {}, i.k),
      el('p', { class: 'ee-k-o' }, el('span', { class: 'ee-et' }, 'EELISA\'da'), ...kalinla(i.m)),
      el('p', { class: 'ee-k-b' }, el('span', { class: 'ee-et ee-et-b' }, 'Bizde'), ...kalinla(i.biz)));
    etkilesim(k, () => ({ ust: 'feyz · ' + i.ust, baslik: i.k, kisa: yerDoldur(i.m).replace(/\*\*/g, ''), uzun: 'EELISA\'da: ' + yerDoldur(i.m).replace(/\*\*/g, '') + '\nBizde: ' + yerDoldur(i.biz).replace(/\*\*/g, '') }));
    return k; }));

  /* 3) boşluk: bizim konumuz orada yok */
  const B = E.bosluk;
  if (B) $('#ee-bosluk').replaceChildren(el('h3', {}, B.baslik), el('p', {}, ...kalinla(B.m)), el('p', { class: 'ee-kucuk' }, B.kaynak));

  /* 4) fark tablosu: onlar / biz */
  const F = E.fark;
  if (F) $('#ee-fark').replaceChildren(el('h3', {}, F.baslik),
    el('div', { class: 'ee-f-liste' }, ...(F.satirlar || []).map(r => el('div', { class: 'ee-f' },
      el('p', { class: 'ee-f-k' }, r.k),
      el('p', { class: 'ee-f-o' }, r.e),
      el('p', { class: 'ee-f-b' }, r.b)))));

  /* 5) ileride ne olur — söz vermeden */
  const S = E.sonra;
  if (S) $('#ee-sonra').replaceChildren(el('h3', {}, S.baslik), el('p', {}, ...kalinla(S.m)));

  /* 6) kaynaklar */
  $('#ee-kaynak').replaceChildren(el('p', { class: 'ee-n-ust' }, 'Okuduğumuz kaynaklar'),
    el('ul', { class: 'ee-k-liste' }, ...(E.kaynaklar || []).map(x =>
      el('li', {}, el('a', { href: x.u, target: '_blank', rel: 'noopener' }, x.ad)))));
}

/* ---------------- GENELDEN ÖZELE (13 Eki, Akın): az yazı, tıkladıkça açılır ----------------
   Genel panel: ilk paragraf görünür, kalanı "devamı" altında.
   Bölüm paneli: yalnız projeler alt alta (ad · ortak ders · tek satır ne) → aç: NASIL (adımlar) · HANGİ DERS → EDİNİM ·
   KAYNAKLAR → kaynak aç: önizleme görseli + bağlantı. Yerleşik <details>: fare, dokunma, klavye (Tab + Enter/Space) aynı. */
function uzunKatla(par) {
  if (!par.length) return null;
  const ilk = el('p', { style: '--g:200ms' }, par[0]);
  if (par.length === 1) return el('div', { class: 'dm-uzun' }, ilk);
  return el('div', { class: 'dm-uzun' }, ilk, el('details', { class: 'dm-devam' }, el('summary', {}, 'devamı · ' + (par.length - 1) + ' parça'), ...par.slice(1).map(p => el('p', {}, p))));
}
function katDetay(baslik, icerik, sinif) { return el('details', { class: 'dp-kat ' + (sinif || '') }, el('summary', {}, baslik), el('div', { class: 'dp-kat-ic' }, icerik)); }
function kaynakKutu(slug) {
  const K = (veri.kaynaklar || {})[slug]; if (!K) return null;
  const dis = /^https?:/.test(K.url);
  return el('li', {}, el('details', { class: 'dp-k' }, el('summary', {}, el('b', {}, K.ad), K.lisans ? el('span', { class: 'dp-k-lis' }, K.lisans) : null),
    el('a', { class: 'dp-k-git', href: dis ? K.url : yol(K.url), target: dis ? '_blank' : null, rel: dis ? 'noopener' : null },
      K.gorsel ? el('img', { src: yol(K.gorsel), alt: K.ad + ' — önizleme', loading: 'lazy', decoding: 'async', width: 640, height: 400 }) : null,
      el('span', {}, (K.ac || 'Kaynağa git') + ' → ' + K.url.replace(/^https?:\/\//, '').replace(/\/$/, '')))));
}
function projeKatlar(P, ek) {
  const liste = el('ol', { class: 'dm-projeler' }, ...P.map((p, i) => el('li', { style: `--g:${160 + i * 70}ms` },
    el('details', { class: 'dm-proje' },
      el('summary', {}, el('span', { class: 'dp-no' }, String(i + 1).padStart(2, '0')),
        el('span', { class: 'dp-bas' }, el('b', {}, p.ad), p.ders ? el('span', { class: 'dp-ders' }, p.ders) : null),
        p.ne ? el('span', { class: 'dp-ne' }, p.ne) : null),
      el('div', { class: 'dp-ic' },
        (p.nasil || []).length ? katDetay('Nasıl yapılır', el('ol', { class: 'dp-adim' }, ...p.nasil.map(a => el('li', {}, a)))) : null,
        (p.edinim || []).length ? katDetay('Hangi ders → hangi edinim', el('ul', { class: 'dp-edinim' }, ...p.edinim.map(e => el('li', {}, el('b', {}, e[0]), el('span', {}, ' → ' + e[1]))))) : null,
        (p.kaynak || []).length ? katDetay('Kaynaklar', el('ul', { class: 'dp-kaynaklar' }, ...p.kaynak.map(kaynakKutu).filter(Boolean)), 'dp-kat-kaynak') : null)))));
  const ekK = (ek || []).map(kaynakKutu).filter(Boolean);
  return el('div', { class: 'dm-proje-sar' }, el('p', { class: 'dm-proje-ust' }, P.length + ' proje · satıra dokun, açılır'), liste,
    ekK.length ? el('details', { class: 'dp-kat dp-kat-obs' }, el('summary', {}, 'İTÜ ders planı'), el('div', { class: 'dp-kat-ic' }, el('ul', { class: 'dp-kaynaklar' }, ...ekK))) : null);
}

/* ---------------- AURA GİRİZGÂH (14 Eki v2) ----------------
   Oynatma: logotip ekranda (IO) + sekme önde + yazı tipi hazır (≤900 ms) → .oyna. Sekme arkadayken oynadıysa öne gelince yeniden.
   Tıklama / Enter / Space → tekrar. CSS'teki reduced-motion kuralı yalnız hareketi kaldırır; girizgâh her koşulda oynar (Akın). */
function auraKur() {
  const ad = $('.aura-ad'); if (!ad) return;
  ad.classList.add('hazir'); ad.tabIndex = 0; ad.setAttribute('title', 'Tekrar izlemek için tıkla');
  let gorunur = false, oynadi = false, gorunurkenOynadi = false, bekliyor = false;
  let wcZ = 0; const oyna = () => { ad.classList.remove('oyna'); void ad.offsetWidth; ad.classList.add('oyna', 'wc'); clearTimeout(wcZ); wcZ = setTimeout(() => ad.classList.remove('wc'), 3200);   /* will-change yalnız giriş + ilk parlama süresince */ oynadi = true; gorunurkenOynadi = document.visibilityState === 'visible'; };
  const dene = () => {
    if (oynadi || bekliyor || !gorunur || document.visibilityState !== 'visible') return;
    bekliyor = true; const f = document.fonts;
    Promise.race([f && f.ready ? f.ready : Promise.resolve(), new Promise(r => setTimeout(r, 900))]).then(() => { bekliyor = false; if (!oynadi && gorunur && document.visibilityState === 'visible') oyna(); });
  };
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { gorunur = es.some(e => e.isIntersecting); ad.classList.toggle('gorunmuyor', !gorunur); dene(); }, { threshold: .35 }); io.observe(ad); }
  else { gorunur = true; dene(); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') return; if (oynadi && !gorunurkenOynadi && gorunur) oyna(); else dene(); });
  ad.addEventListener('click', oyna);
  ad.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oyna(); } });
}

/* ---------------- RENDER ---------------- */
function ses(hirsli, rahat) {
  const k = el('div', { class: 'ses', tabindex: 0 }, el('p', { class: 's-h' }, el('span', { class: 'prompt p-h' }, 'Daha çok istiyorsan: '), yerDoldur(hirsli)), el('p', { class: 's-r' }, el('span', { class: 'prompt p-r' }, 'Az vaktin varsa: '), yerDoldur(rahat)));
  etkilesim(k, () => ({ ust: 'iki yol', baslik: 'Hangisi sana daha yakın?', kisa: 'Aynı şeyi iki şekilde anlattım. Sana yakın olanı oku, öbürünü geç.', uzun: `Daha çok istiyorsan: ${yerDoldur(hirsli)}\nAz vaktin varsa: ${yerDoldur(rahat)}\nAşağıda sana yakın olanı seçersen öbürü biraz silikleşir. Seçimin yalnız senin cihazında kalır.` })); return k;
}
function sesYerlestir() {
  const M = veri.metinler; const harita = { acilis: [M.acilis.hirsli, M.acilis.rahat], sana: M.sana ? [M.sana.hirsli, M.sana.rahat] : null, bolumler: [M.bolumler.hirsli, M.bolumler.rahat], gercekcilik: [M.gercekcilik.hirsli, M.gercekcilik.rahat] };
  $$('.ses[data-ses]').forEach(k => { const p = harita[k.dataset.ses]; if (p) k.replaceWith(ses(p[0], p[1])); });
}
/* açılış v2: paragraf yok — başlık, tek satır vaat, kitle seçimi, zaman rozetleri, aranan bölümler */
function acilis() {
  const M = veri.metinler.acilis;
  /* AURA logotipi + genelden özele kademeler (12 Eki) */
  const AU = veri.metinler.aura;
  if (AU) {
    const kd = $('#aura-kademe'); if (kd && Array.isArray(AU.kademe)) kd.replaceChildren(...AU.kademe.map(k => { const m = yerDoldur(k.m); let oz = m.split(/[;:.]/)[0].trim(); if (oz.length > 64) oz = oz.slice(0, 61).replace(/\s\S*$/, '') + '…';   /* 14 Eki: genelden özele — başlık + tek satır özet, açınca cümle; masaüstü açık, mobil kapalı */
      return el('li', {}, el('details', { class: 'aura-k', open: innerWidth >= 860 ? true : null }, el('summary', {}, el('b', {}, k.ust), el('span', { class: 'aura-k-oz' }, oz)), el('p', {}, m))); }));
  }
  const v = $('#acilis-vaat'); if (v) v.textContent = durum.kitle ? (M.vaat || '') : '';
  const al = $('#acilis-alt'); if (al) al.textContent = M.alt || '';
  const ip = $('#acilis-ipucu'); if (ip && M.ipucu) ip.textContent = M.ipucu;
  const bn = $('#balon-not'); if (bn) bn.textContent = M.balonNot || '';   /* hPa metaforu bir kez, açılışta açıklanır */
  const Z = M.zaman || M.sayilar || [];
  /* Akın 6 Eki akşam: zaman rozetleri açılışta değil, "ne kadar katılmak istersin?" bölümünün üstünde tek satır (az yer, net dil) */
  const ZS = $('#zaman-serit'); if (ZS) ZS.replaceChildren(el('span', { class: 'zs-ust' }, M.zamanBaslik || 'Kaç saat alır?'), ...Z.map(s => { const d = el('button', { class: 'zs', type: 'button' }, el('b', {}, s.s), el('span', {}, s.e)); if (s.detay) etkilesim(d, () => ({ kaynaklar: kaynakAl(s), ust: 'ne kadar zaman · ' + s.e, baslik: s.s, kisa: '', uzun: s.detay })); return d; }), M.zamanNot ? el('span', { class: 'zs-not' }, M.zamanNot) : null);
  const ES = $('#acilis-sayilar'); if (ES) ES.replaceChildren(...Z.map(s => { const d = el('button', { class: 'sayi', type: 'button' }, el('b', {}, s.s), el('span', {}, s.e)); if (s.detay) etkilesim(d, () => ({ kaynaklar: kaynakAl(s), ust: 'ne kadar zaman', baslik: s.s + ' · ' + s.e, kisa: s.e, uzun: s.detay })); return d; }));
  const A = $('#arananlar'); if (A && Array.isArray(M.arananlar)) {   /* ilk 7 bölüm görünür, kalanı tek düğmeyle açılır (telefonda 3-4 satır tutmasın) */
    const cip = a => el('button', { class: 'ar', type: 'button', 'data-k': a.k, onclick: () => bolumeGit(a.k) }, a.ad);
    const ilk = M.arananlar.slice(0, 7), kalan = M.arananlar.slice(7);
    const daha = kalan.length ? el('button', { class: 'ar ar-daha', type: 'button', 'aria-expanded': 'false', onclick: (e) => { e.currentTarget.replaceWith(...kalan.map(cip)); } }, `+${kalan.length} bölüm`) : null;
    A.replaceChildren(el('span', { class: 'ar-ust' }, M.arananBaslik || 'Aranıyor:'), ...ilk.map(cip), daha); }
  girisKur(); auraKur();
  $$('figure[data-detay]').forEach(f => etkilesim(f, () => DETAYLAR[f.dataset.detay]));
}
/* kitle: "meteorolojide okuyorum / başka bölümdeyim" — ton aynı; bölüm kartlarının sırası, atölyelerin açıklığı ve 5 soru seti değişir */
function girisKur() {
  const G = veri.metinler.giris, S = $('#giris-sec'); if (!G || !S) { const g = $('#giris'); if (g) g.hidden = true; return; }
  $('#giris-soru').textContent = G.soru || '';
  S.replaceChildren(...G.secenekler.map(o => el('button', { class: 'giris-b', type: 'button', role: 'radio', 'aria-checked': String(durum.kitle === o.id), 'data-id': o.id, onclick: () => kitleSec(o.id) }, el('b', {}, o.etiket), o.alt ? el('span', {}, o.alt) : null)));
  if (durum.kitle) kitleGoster(durum.kitle, true);
}
/* Akın 6 Eki akşam: seçimden hemen sonra, seçimin altında madde madde kısa anlatım (bölüm dışı: ajan tabanlı ortak iş, kendi alanında uzmanlaşma, çok disiplinli çevre;
   bölüm içi: ajan tabanlı tahmin). Sayfa başka yere kaymaz; "devam" düğmesi sıradaki bölüme götürür, "ayrıntı" uzun hâlini açar. */
function kitleGoster(id, sessiz) {
  const G = veri.metinler.giris, B = $('#kitle-blok'); if (!B) return; const K = G && G.kitle && G.kitle[id]; if (!K) { B.hidden = true; return; }
  const ayr = el('button', { class: 'kb-ayrinti', type: 'button' }, 'Ayrıntı ›');
  const dev = K.devam ? el('button', { class: 'kb-devam', type: 'button', onclick: () => { durum.etkilesim++; git(K.devam); } }, K.devamEtiket || 'Devam ↓') : null;
  B.replaceChildren(el('p', { class: 'kb-baslik' }, K.baslik || ''), el('ul', {}, ...(K.maddeler || []).map(m => el('li', {}, m))), el('div', { class: 'kb-dugmeler' }, dev, K.detay ? ayr : null));
  if (K.detay) { const d = () => ({ ust: 'sana göre · ' + (K.baslik || ''), baslik: K.baslik, kisa: (K.maddeler || [])[0] || '', uzun: K.detay }); ayr.addEventListener('click', () => { durum.etkilesim++; detayAc(d()); }); }
  const H = $('#acilis-h1'); if (H) { if (K.h1) H.innerHTML = K.h1; H.hidden = false; }   /* 7 Eki: ana başlık bölüm seçilince, kitleye göre */
  const V = $('#acilis-vaat'); if (V && K.vaat) V.textContent = K.vaat;
  B.hidden = false; B.classList.remove('flas'); if (!sessiz) { void B.offsetWidth; B.classList.add('flas'); }
}
let testSetSec = null;
function kitleSec(id, sessiz) {
  durum.kitle = id; ls('takim-kitle', id); KOKEL.dataset.kitle = id;
  $$('.giris-b').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === id)));
  katliAyarla('anlatilar', id === 'mto' || !!KIME);
  bolumler();
  if (testSetSec && durum.test.toplam === 0) testSetSec(id === 'dis' ? 'misafir' : 'mto');
  kitleGoster(id, sessiz);
  if (!sessiz) { durum.etkilesim++; const B = $('#kitle-blok'); if (B && !B.hidden) { const r = B.getBoundingClientRect(); if (r.bottom > innerHeight - 24) gitEl(B, Math.max(96, innerHeight - r.height - 40)); } }   /* blok ekran dışındaysa yalnız onu görünür et; sayfa başka bölüme atlamaz */
}
function bolumeGit(k) {
  const c = $(`#bolum-kartlar .bk[data-k="${k}"]`); if (!c) { git('bolumler'); return; }
  gitEl(c, 120); c.classList.remove('isaret'); void c.offsetWidth; c.classList.add('isaret'); setTimeout(() => c.classList.remove('isaret'), 2600);
}
/* katlanan bloklar: genel görünümde kapalı, kapak kartıyla açılır; resmî görünümde (kime) hepsi açık */
function katliAyarla(grup, acik) {
  $$(`section[data-katli="${grup}"]`).forEach(s => s.classList.toggle('acik', acik));
  if (grup === 'derin') { if (acik) KOKEL.dataset.derin = 'acik'; else delete KOKEL.dataset.derin; }
  const b = $(`#${grup}-ac`); if (b) b.setAttribute('aria-expanded', String(acik));
}
function katliKur() {
  const M = veri.metinler, A = veri.anket.anlatilar || {};
  const yaz = (id, t) => { const e = $(id); if (e) e.textContent = t || ''; };
  yaz('#merdiven-kapak-b', (M.merdiven && M.merdiven.baslik) || 'Ne yapacağız: 6 adım'); yaz('#merdiven-kapak-m', (M.merdiven && M.merdiven.kapak) || 'Hatayı ölçmekten yapay zekâya: adım adım yol haritası.');
  yaz('#anlatilar-kapak-b', A.baslik || 'Atmosfer Anlatıları'); yaz('#anlatilar-kapak-m', A.kapak || 'Öğrenci zor bir dersin kolay bir parçasını 10-20 dakikada anlatır; video kalır.');
  const D = M.derin || { baslik: 'Meraklısına: kanıt ve ayrıntı', alt: 'Kanıt, karne ve kaynaklar burada.', icerik: ['Canlı tahmin karnesi', 'Yapılmış işler', 'Takımların yaşı ve bütçesi', 'Kaynaklar ve tam tablolar'] };
  yaz('#derin-baslik', D.baslik); yaz('#derin-alt', D.alt); const L = $('#derin-icerik'); if (L) L.replaceChildren(...(D.icerik || []).map(x => el('li', {}, x)));
  ['merdiven', 'anlatilar', 'eelisa', 'derin'].forEach(g => { const b = $(`#${g}-ac`); if (b) b.addEventListener('click', () => { const ac = b.getAttribute('aria-expanded') !== 'true'; katliAyarla(g, ac); durum.etkilesim++; }); });
  katliAyarla('derin', !!KIME); katliAyarla('merdiven', !!KIME); katliAyarla('anlatilar', !!KIME || durum.kitle === 'mto');
}
/* resmî görünüm: KHŞM ve hocalar için kuruluş özeti (yalnız ?kime=… ile görünür) */
function resmi() {
  const R = veri.metinler.resmi, H = veri.metinler.hoca; if (!KIME || !R || !$('#resmi')) return;
  $('#resmi-baslik').textContent = R.baslik || ''; $('#resmi-alt').textContent = R.alt || '';
  $('#resmi-satirlar').replaceChildren(...(R.satirlar || []).flatMap(x => [el('dt', {}, x.k), el('dd', {}, yerDoldur(x.m), kaynakMini(kaynakAl(x), ' · '))]));
  if (H) { $('#hoca-baslik').textContent = H.baslik || ''; $('#hoca-alt').textContent = H.alt || ''; $('#hoca-maddeler').replaceChildren(...(H.maddeler || []).map(x => el('li', {}, x))); }
}
function sss() {
  const Q = veri.metinler.sss; if (!Q) return; $('#sss-baslik').textContent = Q.baslik; $('#sss-alt').textContent = Q.alt;
  $('#sss-kartlar').replaceChildren(...Q.sorular.map(q => { const k = el('button', { class: 'olay-k sss-k', type: 'button' }, el('span', { class: 'k' }, q.s), el('p', { class: 'm' }, q.c)); etkilesim(k, () => ({ kaynaklar: kaynakAl(q), ust: 'sık sorulan', baslik: q.s, kisa: q.c, uzun: q.d })); return k; }));
}
function olay() {
  const O = veri.metinler.olay; if (!O) return; $('#olay-baslik').textContent = O.baslik;
  $('#olay-kartlar').replaceChildren(...O.satirlar.map(s => { const k = el('button', { class: 'olay-k', type: 'button' }, el('span', { class: 'k' }, s.k), el('p', { class: 'm' }, s.m)); etkilesim(k, () => ({ kaynaklar: kaynakAl(s), ust: 'olay ne · ' + s.k, baslik: s.k, kisa: s.m, uzun: s.detay })); return k; }));
}
function sana() {
  const S = veri.metinler.sana; if (!S || !$('#sana-kartlar')) return; $('#sana-baslik').textContent = S.baslik; $('#sana-alt').textContent = S.alt;
  $('#sana-kartlar').replaceChildren(...S.kartlar.map(k => { const b = el('button', { class: 'sana-k', type: 'button' }, el('span', { class: 'k' }, k.k), el('span', { class: 'bolum' }, k.bolum), el('p', { class: 'm' }, k.m), el('p', { class: 'kazanc' }, '→ ' + k.kazanc), el('span', { class: 'devam' }, 'tıkla → örnek görevler, neden burası, yük')); etkilesim(b, () => ({ kaynaklar: kaynakAl(k), ust: 'sana ne var · ' + k.bolum, baslik: k.k, kisa: k.m, uzun: k.detay })); return b; }));
}
function akis() {
  const A = veri.metinler.akis; if (!A) return; $('#akis-baslik').textContent = A.baslik; $('#akis-alt').textContent = A.alt;
  $('#akis-kartlar').replaceChildren(...A.asamalar.map(a => el('li', {}, el('button', { class: 'akis-k', type: 'button', onclick: () => git(a.id) }, el('span', { class: 'n' }, a.n), el('b', {}, a.ad), el('span', {}, a.m)))));
  $('#serit').replaceChildren(...A.asamalar.map(a => el('button', { type: 'button', 'data-asama': a.n, onclick: () => git(a.id) }, el('b', {}, a.n + ' · ' + a.ad), el('span', {}, a.m))));
}
function kapi() {
  const K = veri.anket.kapi; $('#kapi-soru').textContent = K.soru; const ikon = { pasif: '☁', orta: '⛅', hirsli: '⚡' };
  $('#kapi-kartlar').replaceChildren(...K.secenekler.map(s => { const sat = [['ne yaparsın', s.ne], ['kazancın', s.kazanc], ['zaman', s.saat]].filter(x => x[1]);
    const k = el('button', { class: 'kapi', type: 'button', role: 'radio', 'aria-checked': String(durum.grup === s.id), 'data-id': s.id, onclick: () => grupSec(s.id) }, el('span', { class: 'k-ikon' }, ikon[s.id]), el('b', {}, s.etiket), s.alt ? el('span', { class: 'k-alt' }, s.alt) : null, sat.length ? el('dl', { class: 'k-satir' }, ...sat.flatMap(([a, b]) => [el('dt', {}, a), el('dd', {}, b)])) : null);
    ipucuBagla(k, () => ({ baslik: s.etiket, metin: s.detay || s.alt })); return k; }));
  const kn = $('#kapi-not'), kl = kaynakAl(...K.secenekler); if (kn && kl.length) kn.append(' ', kaynakMini(kl));   /* 8 Eki: kapı seçeneklerindeki dış bilgilerin kaynakları */
}
function grupSec(id) { durum.grup = id; ls('takim-grup', id); KOKEL.dataset.grup = id; $$('.kapi').forEach(k => k.setAttribute('aria-checked', String(k.dataset.id === id))); sonKart(); panelSen(); durum.etkilesim++; }
function vizyon() {
  const V = veri.metinler.vizyon;
  const kv = el('div', { class: 'kart kart-vurgu' }, el('b', {}, V.vizyon.b), el('p', {}, V.vizyon.m)); etkilesim(kv, () => ({ kaynaklar: kaynakAl(V.vizyon), ust: 'olay ne', baslik: V.vizyon.b, kisa: V.vizyon.m, uzun: V.vizyon.detay }));
  const km = el('div', { class: 'kart' }, el('b', {}, V.misyon.b), el('p', {}, V.misyon.m)); etkilesim(km, () => ({ kaynaklar: kaynakAl(V.misyon), ust: 'olay ne', baslik: V.misyon.b, kisa: V.misyon.m, uzun: V.misyon.detay }));
  $('#vizyon-kartlar').replaceChildren(kv, km);
  $('#kollar').replaceChildren(...V.kollar.map(k => { const e = el('div', { class: 'kart' }, el('b', {}, k.b), el('p', {}, k.m)); etkilesim(e, () => ({ kaynaklar: kaynakAl(k), ust: 'takımın kolları', baslik: k.b, kisa: k.m, uzun: [k.detay, k.hirsli ? 'Daha çok istiyorsan: ' + k.hirsli : '', k.rahat ? 'Az vaktin varsa: ' + k.rahat : ''].filter(Boolean).join('\n') })); return e; }));   /* v2: kart yüzünde iki ses yok, ayrıntıda */
}
function merdiven() {
  const M = veri.metinler.merdiven; $('#merdiven-baslik').textContent = M.baslik; $('#merdiven-alt').textContent = M.alt;
  $('#merdiven-kural').replaceChildren(...M.kural.map(k => el('li', {}, k)));
  const svg = $('#merdiven-svg'); svg.replaceChildren();
  M.basamaklar.forEach((b, i) => {
    const x = 10 + i * 96, y = 300 - (i + 1) * 44;
    const r = svgEl('rect', { x, y, width: 94, height: 330 - y - 6, rx: 6, class: 'md-basamak', 'data-i': i }); r.addEventListener('click', () => basamakSec(i)); svg.append(r);
    svg.append(svgEl('text', { x: x + 8, y: y + 18, class: 'md-no' }, '0' + b.n)); svg.append(svgEl('text', { x: x + 8, y: y + 36, class: 'md-ad' }, b.kisa || b.b));
  });
  const fig = svgEl('g', { class: 'md-figur', id: 'md-figur' }); fig.innerHTML = '<circle cx="0" cy="-16" r="6"/><rect x="-5" y="-9" width="10" height="14" rx="3"/>'; svg.append(fig);
  $('#basamaklar').replaceChildren(...M.basamaklar.map((b, i) => { const e = el('button', { class: 'bs', type: 'button', role: 'tab', 'aria-selected': 'false', 'data-i': i, onclick: () => basamakSec(i) }, el('span', { class: 'n' }, '0' + b.n), el('span', { class: 'ad' }, b.b), el('span', { class: 'z' }, b.zaman)); ipucuBagla(e, () => ({ baslik: b.b, metin: b.kavram + ' · ' + (b.cikti || b.video) })); return e; }));
  basamakSec(0, true);
  if (!azalt && 'IntersectionObserver' in window) { let acilan = 0; const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; const t = setInterval(() => { const r = svg.querySelector(`.md-basamak[data-i="${acilan}"]`); if (!r) { clearInterval(t); return; } r.classList.add('acik'); acilan++; }, 140); io.disconnect(); }, { threshold: .4 }); io.observe(svg); } else $$('.md-basamak', svg).forEach(r => r.classList.add('acik'));
}
function basamakSec(i, sessiz) {
  const b = veri.metinler.merdiven.basamaklar[i]; if (!b) return;
  $$('.bs').forEach(x => x.setAttribute('aria-selected', String(+x.dataset.i === i))); $$('.md-basamak').forEach(x => x.classList.toggle('secili', +x.dataset.i === i));
  const fig = $('#md-figur'); if (fig) fig.setAttribute('transform', `translate(${10 + i * 96 + 70},${300 - (i + 1) * 44})`);
  const D = $('#basamak-detay');
  D.replaceChildren(el('h3', {}, `0${b.n} · ${b.b}`), ...[['kavram', b.kavram], ['çıktı', b.cikti || b.video], ['dayanak', b.ref], ['zaman', b.zaman]].map(([k, v]) => el('div', { class: 'bd-satir' }, el('span', {}, k), el('span', {}, v))), b.detay ? el('p', { class: 'bd-uzun' }, b.detay) : null, ses(b.hirsli, b.rahat));
  terimSar(D); if (!sessiz) durum.etkilesim++;
}
function karne() {
  const K = veri.karne; const S = $('#karne-svg'), O = $('#karne-ozet'); if (!K || !S) return;
  const G = K.gunler, W = 720, H = 260, L = 44, R = 12, T = 18, B = 40, ih = H - T - B, iw = W - L - R;
  const err = G.map(d => d.tahmin1 - d.gercek); const mx = Math.max(1, ...err.map(Math.abs)); const y0 = T + ih / 2; const sc = (ih / 2 - 6) / mx; S.replaceChildren();
  [-mx, -mx / 2, 0, mx / 2, mx].forEach(v => { const y = y0 - v * sc; S.append(svgEl('line', { x1: L, x2: W - R, y1: y, y2: y, class: v === 0 ? 'sifir' : 'eksen' })); S.append(svgEl('text', { x: L - 6, y: y + 3, 'text-anchor': 'end' }, (v > 0 ? '+' : '') + v.toFixed(1) + '°')); });
  const bw = iw / G.length;
  G.forEach((d, i) => { const e = err[i]; const h = Math.abs(e) * sc; const x = L + i * bw + 1; const r = svgEl('rect', { x, y: e >= 0 ? y0 - h : y0, width: Math.max(2, bw - 2), height: h, class: 'cubuk ' + (e >= 0 ? 'c-art' : 'c-eksi') });
    ipucuBagla(r, () => ({ baslik: d.t, metin: `1 gün önce tahmin ${d.tahmin1}° · gerçekleşen ${d.gercek}° · fark ${e >= 0 ? '+' : ''}${e.toFixed(1)}°` + (d.tahmin3 != null ? ` · 3 gün önce ${d.tahmin3}°` : '') + ` · yağış ${d.yagis} mm` })); S.append(r);
    if (i % 5 === 0) S.append(svgEl('text', { x: x + bw / 2, y: H - B + 14, 'text-anchor': 'middle' }, d.t.slice(8, 10) + '.' + d.t.slice(5, 7))); });
  S.append(svgEl('text', { x: L, y: H - 6 }, 'kırmızı: model sıcak verdi · yeşil-mavi: soğuk verdi · günlük Tmax, GFS · çubuğun üstünde dur'));
  const z = K.ozet;
  O.replaceChildren(...[[`${z.bias1 >= 0 ? '+' : ''}${z.bias1.toFixed(2)}°`, 'bias (sistematik sapma), 1 gün önce'], [`${z.mae1.toFixed(2)}°`, 'MAE (ortalama mutlak hata), 1 gün önce'], [z.mae3 != null ? `${z.mae3.toFixed(2)}°` : '—', 'MAE, 3 gün önce: ufuk uzadıkça hata büyür'], [`${z.n} gün`, K.istasyon]].map(([s, e]) => el('div', { class: 'sk' }, el('b', {}, s), el('span', {}, e))),
    el('p', { class: 'not' }, K.kaynak + ' · ', el('a', { href: K.kaynakUrl, target: '_blank', rel: 'noopener' }, 'Open-Meteo'), ` · üretim ${K.uretim}`),
    ses('Bu grafiği 40 satır Python ile sen de çıkarırsın. Gözlemle (MGM) karşılaştırınca 2209 başvurusunun ilk şekli hazır.', 'Bakması bile yeter: model bazen sıcak, bazen soğuk verir; ikisinin ortalaması sıfıra yakınsa bias düşüktür. Bu kadar.'));
}
function mumkun() {
  const M = veri.metinler.mumkun; $('#mumkun-baslik').textContent = M.baslik;
  $('#mumkun-kartlar').replaceChildren(...M.kartlar.map(k => { const e = el('div', { class: 'kart', tabindex: 0 }, medya(k.medya), el('b', {}, k.b), el('p', {}, k.m), k.ref ? el('a', { class: 'ref', href: yol('../' + k.ref) }, 'portfolyoda gör →') : null); etkilesim(e, () => ({ kaynaklar: kaynakAl(k), ust: 'neden mümkün', baslik: k.b, kisa: k.m, uzun: k.detay, link: k.ref ? yol('../' + k.ref) : null, linkAd: 'portfolyoda gör →' })); return e; }));
  const vids = $$('#mumkun-kartlar video'); vids.forEach(v => { v.muted = true; });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(x => { const v = x.target; if (x.isIntersecting) { v.play && v.play().catch(() => { }); } else v.pause(); }), { rootMargin: '0px', threshold: .15 }); vids.forEach(v => io.observe(v)); } else vids.forEach(v => v.play && v.play().catch(() => { }));   /* ekran dışı klip oynamaz */
}
const BULUTLAR = [['g20', 'Cirrus uncinus · 20 Nis'], ['g15', 'Altocumulus · 15 Nis'], ['g28', 'Cumulus humilis · 28 Nis'], ['g13', 'Altostratus · 13 Nis'], ['g16', 'Stratus · 16 Nis'], ['g03', 'Nimbostratus · 3 May']];
function deste() {
  const K = veri.anket.kaydir; $('#kaydir-baslik').textContent = K.baslik; $('#kaydir-mizah').textContent = K.mizah_giris;
  const D = $('#deste'); const kartlar = [...K.kartlar]; let i = 0;
  const ciz = () => {
    D.replaceChildren();
    if (i >= kartlar.length) { const y = durum.eslesme.toplam ? Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam) : 0; const oranlar = el('div', { class: 'oylar deste-oran' }, ...kartlar.map(k => { const sat = el('div', { class: 'oy', role: 'img' }, el('span', { class: 'cubuk' }), el('span', {}, k.metin), el('span', { class: 'yuzde' }, '…')); arka.dinle(k.id, (say, n) => { const y = n ? Math.round(100 * (say.evet || 0) / n) : 0; sat.querySelector('.cubuk').style.transform = `scaleX(${y / 100})`; sat.querySelector('.yuzde').textContent = `%${y} katılıyor`; sat.setAttribute('aria-label', `${k.metin}: %${y} katılıyor`); }); return sat; })); D.parentNode.querySelector('.deste-oran')?.remove(); D.after(oranlar); D.append(el('div', { class: 'deste-bitti' }, el('b', { class: 'eslesme' }, `Eşleşme: %${y}`), el('span', {}, K.son.baslik), el('span', { class: 'not' }, y >= 70 ? 'Süper eşleşme. Bu bir tanışma uygulaması olsa şu an bildirim gelirdi.' : y >= 40 ? 'Makul. Ortada buluşuruz.' : 'Zor bir kitlesin; tam da videoları senin için çekiyoruz.'))); $('#dg-evet').disabled = $('#dg-hayir').disabled = true; sonKart(); panelSen(); return; }
    for (let j = Math.min(i + 2, kartlar.length - 1); j >= i; j--) {
      const k = kartlar[j]; const derin = j - i; const bulut = BULUTLAR[j % BULUTLAR.length];
      const c = el('article', { class: 'kartd', style: `transform:translateY(${derin * 10}px) scale(${1 - derin * .04});z-index:${10 - derin};background-image:url('${yol('../g/bulut/')}${bulut[0]}.jpg')`, 'aria-hidden': String(derin > 0) }, el('span', { class: 'kno' }, el('span', {}, `${j + 1}/${kartlar.length}`), el('i', {}, `☁ ${bulut[1]}`)), el('p', { class: 'kmetin' }, k.metin), el('span', { class: 'damga d-evet' }, 'KATILIYORUM'), el('span', { class: 'damga d-hayir' }, 'HAYIR'));
      if (derin === 0) surukle(c); D.append(c);
    }
  };
  const karar = (evet) => {
    const k = kartlar[i]; if (!k) return; const ust = D.querySelector('.kartd'); if (ust) ust.classList.add(evet ? 'ucar-sag' : 'ucar-sol');
    const uyum = (k.id === 'k5') ? !evet : evet; durum.eslesme.toplam++; if (uyum) durum.eslesme.evet++; durum.etkilesim++;
    $('#deste-tepki').textContent = evet ? k.evet : k.hayir; const tepki = evet ? k.evet : k.hayir; arka.oyVer(k.id, { secim: evet ? 'evet' : 'hayir', grup: durum.grup }).catch(() => { }).finally(() => { const kapat = arka.dinle(k.id, (say, n) => { if (kartlar[i - 1] !== k) { if (typeof kapat === 'function') kapat(); return; } $('#deste-tepki').textContent = `${tepki} · %${n ? Math.round(100 * (say.evet || 0) / n) : 0} katılıyor`; }); });
    i++; setTimeout(ciz, azalt ? 0 : 320);
  };
  const surukle = (c) => {
    let x0 = 0, dx = 0, aktif = false;
    c.addEventListener('pointerdown', e => { aktif = true; x0 = e.clientX; c.classList.add('surukle'); c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => { if (!aktif) return; dx = e.clientX - x0; c.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; c.querySelector('.d-evet').style.opacity = Math.min(1, Math.max(0, dx / 80)); c.querySelector('.d-hayir').style.opacity = Math.min(1, Math.max(0, -dx / 80)); });
    const bitir = () => { if (!aktif) return; aktif = false; c.classList.remove('surukle'); if (Math.abs(dx) > 90) karar(dx > 0); else { c.style.transform = ''; c.querySelectorAll('.damga').forEach(d => d.style.opacity = 0); } dx = 0; };
    c.addEventListener('pointerup', bitir); c.addEventListener('pointercancel', bitir);
  };
  $('#dg-evet').onclick = () => karar(true); $('#dg-hayir').onclick = () => karar(false);
  document.addEventListener('keydown', e => { if (!D.closest('section').matches(':hover') && document.activeElement?.closest('#kaydir') == null) return; if (e.key === 'ArrowRight') karar(true); if (e.key === 'ArrowLeft') karar(false); });
  Promise.all(kartlar.map(k => arka.oyAl(k.id).catch(() => null))).then(onceki => { onceki.forEach((v, j) => { if (v && j === i) { const evet = v.secim === 'evet'; const uyum = (kartlar[j].id === 'k5') ? !evet : evet; durum.eslesme.toplam++; if (uyum) durum.eslesme.evet++; i++; } }); if (i > 0) $('#deste-tepki').textContent = i >= kartlar.length ? 'Bu desteyi daha önce bitirdin; kararların kayıtlı.' : `${i} kartı daha önce cevapladın, kaldığın yerden.`; ciz(); if (i > 0) { sonKart(); panelSen(); } });
}
function test() {
  const T = veri.anket.test; $('#test-baslik').textContent = T.baslik;
  const ciz = (set) => {
    durum.test = { dogru: 0, toplam: 0, set }; $('#test-sonuc').textContent = '';
    $$('.test-sec .sec').forEach(b => { const a = b.dataset.set === set; b.classList.toggle('aktif', a); b.setAttribute('aria-selected', String(a)); });
    $('#test-sorular').replaceChildren(...T[set].map((s, qi) => {
      const ac = el('p', { class: 'aciklama', hidden: true }); const sur = el('p', { class: 'surpriz-satir', hidden: true });
      const secenekler = s.secenekler.map((o, oi) => el('button', { class: 'cip', type: 'button', onclick: (e) => {
        if (secenekler.some(b => b.disabled)) return;
        const dogru = oi === s.dogru; e.currentTarget.classList.add(dogru ? 'dogru' : 'yanlis'); secenekler[s.dogru].classList.add('dogru'); secenekler.forEach(b => b.disabled = true);
        ac.textContent = (dogru ? '✓ ' : '✗ ') + s.aciklama; ac.hidden = false; if (s.surpriz) { sur.textContent = '▸ ' + s.surpriz; sur.hidden = false; }
        durum.test.toplam++; if (dogru) durum.test.dogru++; durum.etkilesim++; arka.oyVer(s.id, { secim: String(oi), grup: durum.grup }).catch(() => { }).finally(oranGoster);
        if (durum.test.toplam === T[set].length) { const d = durum.test.dogru; $('#test-sonuc').textContent = d === 5 ? '5/5. Anlatıcı koltuğu senin.' : d >= 3 ? `${d}/5. İyi; eksikleri ilk üç video kapatır.` : `${d}/5. Tam da bu yüzden videolar var. Utanma, kimse görmedi.`; sonKart(); panelSen(); }
      } }, o));
      arka.oyAl(s.id).then(v => { if (!v) return; const oi = +v.secim; if (!(oi >= 0)) return; const dogru = oi === s.dogru; secenekler[oi].classList.add(dogru ? 'dogru' : 'yanlis'); secenekler[s.dogru].classList.add('dogru'); secenekler.forEach(b => b.disabled = true); oranGoster(); ac.textContent = (dogru ? '✓ ' : '✗ ') + s.aciklama + ' (daha önce cevapladın)'; ac.hidden = false; durum.test.toplam++; if (dogru) durum.test.dogru++; if (durum.test.toplam === T[set].length) { $('#test-sonuc').textContent = `${durum.test.dogru}/5 · daha önce çözdün; cevaplar kayıtlı.`; sonKart(); panelSen(); } }).catch(() => { });
      const oranGoster = () => arka.dinle(s.id, (say, n) => secenekler.forEach((b, oi) => { const y = n ? Math.round(100 * (say[String(oi)] || 0) / n) : 0; let t = b.querySelector('.oran'); if (!t) { t = el('span', { class: 'oran' }); b.append(t); } t.textContent = ` · %${y}`; }));
      return el('div', { class: 'soru' }, el('h3', {}, `${qi + 1}. ${s.soru}`), el('div', { class: 'secenekler' }, ...secenekler), ac, sur);
    }));
    terimSar($('#test-sorular'));
  };
  $$('.test-sec .sec').forEach(b => b.onclick = () => ciz(b.dataset.set)); testSetSec = ciz; ciz(durum.kitle === 'dis' ? 'misafir' : 'mto');   /* v2: set, girişteki kitle seçimine göre */
}
/* oy kilidi: her anket cihaz başına bir kez (test modunda localStorage, canlıda Firebase anonim kimlik + create-only kural) */
const kilitSatiri = () => el('p', { class: 'oy-kilit' }, '✓ Oyun alındı · bu cihazdan bir kez · değiştirilemez');
const sozlerKutusu = (sozler) => sozler && sozler.length ? el('div', { class: 'sozler' }, el('span', { class: 'sozler-ust' }, 'Oy verenlerin kendi cümleleri'), ...sozler.slice(0, 12).map(t => el('span', { class: 'soz' }, '“' + t + '”'))) : null;
function cokluSoru(s) {
  const secili = new Set(); let diger = '';
  const cipler = s.secenekler.map(o => el('button', { class: 'cip', type: 'button', 'aria-pressed': 'false', onclick: (e) => { if (s.tip === 'single') { secili.clear(); cipler.forEach(c => c.setAttribute('aria-pressed', 'false')); } if (secili.has(o)) { secili.delete(o); e.currentTarget.setAttribute('aria-pressed', 'false'); } else { secili.add(o); e.currentTarget.setAttribute('aria-pressed', 'true'); } gonder.disabled = secili.size === 0 && !diger; } }, o));
  const gonder = el('button', { class: 'gonder', type: 'button', disabled: true }, 'Gönder');
  const alt = el('div', { class: 'coklu-alt' }); if (s.diger) alt.append(el('input', { type: 'text', maxlength: 120, placeholder: 'Diğer…', oninput: (e) => { diger = e.target.value.trim(); gonder.disabled = secili.size === 0 && !diger; } })); alt.append(gonder);
  const sonuc = el('div', { class: 'oylar', hidden: true }); const kutu = el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'secenekler' }, ...cipler), alt, sonuc);
  const goster = (sayim, n, sozler) => { sonuc.hidden = false; sonuc.replaceChildren(...s.secenekler.map(o => { const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; return el('div', { class: 'oy' + (secili.has(o) ? ' benim' : ''), role: 'img', 'aria-label': `${o}: %${y}` }, el('span', { class: 'cubuk', style: `width:${y}%` }), el('span', {}, o), el('span', { class: 'yuzde' }, `%${y}`)); }), el('p', { class: 'oy-toplam' }, 'Oranlar canlı güncellenir.'), sozlerKutusu(sozler), kilitSatiri()); kutu.classList.add('oylandi'); };
  gonder.onclick = async () => { gonder.disabled = true; cipler.forEach(c => c.disabled = true); const inp = alt.querySelector('input'); if (inp) inp.disabled = true; try { await arka.oyVer(s.id, { secim: [...secili], diger: diger || undefined, grup: durum.grup }); } catch (e) { } if (s.id === 'c4') durum.roller = [...secili]; durum.etkilesim++; arka.dinle(s.id, goster); sonKart(); panelSen(); };
  arka.oyAl(s.id).then(v => { if (v) { [].concat(v.secim).forEach(x => secili.add(x)); cipler.forEach(c => { c.disabled = true; c.setAttribute('aria-pressed', String(secili.has(c.textContent))); }); gonder.disabled = true; const inp = alt.querySelector('input'); if (inp) inp.disabled = true; if (s.id === 'c4') durum.roller = [...secili]; arka.dinle(s.id, goster); } });
  return kutu;
}
function coklu() { $('#coklu-sorular').replaceChildren(...veri.anket.coklu.map(cokluSoru)); }
function canliSoru(s) {
  let benim = null; const n0 = el('p', { class: 'oy-toplam' }, 'Oy ver, yüzdeyi gör.');
  const dugmeler = s.secenekler.map(o => el('button', { class: 'oy', type: 'button', onclick: async () => { if (benim) return; benim = o; dugmeler.forEach(d => { d.disabled = true; d.classList.toggle('benim', d === dugmeler[s.secenekler.indexOf(o)]); }); try { await arka.oyVer(s.id, { secim: o, grup: durum.grup }); } catch (e) { } durum.etkilesim++; arka.dinle(s.id, goster); } }, el('span', { class: 'cubuk' }), el('span', {}, o), el('span', { class: 'yuzde' }, '')));
  const goster = (sayim, n) => { dugmeler.forEach((d, i) => { const o = s.secenekler[i]; const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; d.querySelector('.cubuk').style.transform = `scaleX(${y / 100})`; d.querySelector('.yuzde').textContent = `%${y}`; }); n0.textContent = '✓ Seninki kaydedildi · oranlar canlı güncellenir'; kutu.classList.add('oylandi'); };
  arka.oyAl(s.id).then(v => { if (v) { benim = v.secim; dugmeler.forEach((d, i) => { d.disabled = true; d.classList.toggle('benim', s.secenekler[i] === benim); }); arka.dinle(s.id, goster); } });
  const kutu = el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'oylar' }, ...dugmeler), n0); return kutu;
}
function canli() { $('#canli-sorular').replaceChildren(...veri.anket.canli.map(canliSoru)); }
function anlatilar() {
  const A = veri.anket.anlatilar; $('#anlatilar-baslik').textContent = A.baslik;
  $('#anlatilar-adimlar').replaceChildren(...A.adimlar.map(a => { const li = el('li', { tabindex: 0 }, el('b', {}, a.b), el('span', {}, a.a)); etkilesim(li, () => ({ kaynaklar: kaynakAl(a), ust: 'atmosfer anlatıları · adım ' + a.n, baslik: a.b, kisa: a.a, uzun: a.detay })); return li; }));
  $('#anlatilar-sorular').replaceChildren(...(KIME ? [] : A.sorular.map(canliSoru)));
}
const IKONLAR = {
  UCK: '<path d="M3 16l9-2 9 2M12 14V5l3 2M12 5L9 7M8 20h8"/>', UZB: '<circle cx="12" cy="12" r="4"/><path d="M2 12c0-2 4-3 10-3s10 1 10 3-4 3-10 3S2 14 2 12zM12 2v3M12 19v3"/>',
  BLG: '<rect x="5" y="5" width="14" height="14" rx="1"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>', YZV: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M8 7l2 4M8 17l2-4M14 12h2"/>',
  MAT: '<path d="M6 4h12L10 12l8 8H6"/>', MTO: '<path d="M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5-1.5A3.5 3.5 0 0 0 7 17z"/><path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2"/>',
  MET: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9"/>', END: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 4-4V8M6 16V10a4 4 0 0 1 4-4h6"/>',
  GEM: '<path d="M3 15h18l-3 5H6zM12 3v12M12 4l6 8h-6"/>', INS: '<path d="M2 18h20M4 18V10M20 18V10M4 10c4-5 12-5 16 0M8 18v-5M12 18v-6M16 18v-5"/>', FIZ: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
  CEV: '<path d="M12 21c-5 0-8-4-8-9 0-4 3-8 8-9 5 1 8 5 8 9 0 5-3 9-8 9zM12 21V9M12 13l-4-3M12 16l4-3"/>', EHB: '<path d="M12 21V9M6 9a8 8 0 0 1 12 0M3 6a12 12 0 0 1 18 0M9 9a4 4 0 0 1 6 0"/>',
  KON: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', GEO: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'
};
function ikon(k) { const t = document.createElement('template'); t.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${IKONLAR[k] || '<circle cx="12" cy="12" r="8"/>'}</svg>`; return t.content.firstChild; }
function bolumler() {
  const M = veri.metinler.bolumler; $('#bolumler-baslik').textContent = M.baslik; $('#bolumler-alt').textContent = M.alt;
  let B = (veri.bolumler || []).slice();
  if (!B.length) { $('#bolum-kartlar').replaceChildren(el('div', { class: 'bos' }, 'Bölümlerin ders planı karşılaştırması derleniyor.')); return; }
  const biz = B.filter(x => x.k === 'MTO'), oteki = B.filter(x => x.k !== 'MTO'); B = durum.kitle === 'mto' ? [...biz, ...oteki] : [...oteki, ...biz];   /* meteorolojiden gelen önce kendi kartını görür */
  /* v2 (Akın 5 Eki): kart yüzünde paragraf yok — bölüm adı + büyük yazıyla tek, pratik örnek; dersler ve fikirler ayrıntıda */
  $('#bolum-kartlar').replaceChildren(...B.map(b => { const k = el('button', { class: 'bk', type: 'button', 'data-k': b.k }, el('span', { class: 'bk-ad' }, ikon(b.k), b.bolum), el('p', { class: 'bk-yuz' }, b.yuz || b.ortakIs || ''));
    const f = b.k === 'MTO' ? { tur: 'plan', k: 'MTO' } : { tur: 'bolum', k: b.k };   /* 15 Eki (tur9 §F): Meteoroloji kartı → E0 ders planı (yarıyıl › ders › projeler) */
    etkilesim(k, () => ({ p3: f, ozet: { satirlar: p3Ozet(f) }, ust: 'başka bölümdensen · ' + b.bolum.replace(/\s*\(.*?\)\s*/g, ' ').replace(/ (Mühendisliği|Programı)$/, '').trim().toLowerCase(), baslik: b.bolum, kisa: b.yuz || b.ortakIs || '',
      uzun: [b.detay, b.senin ? `Senin dersin: ${b.senin}.` : '', b.bizim ? `Bizdeki karşılığı: ${b.bizim}.` : '', b.ortakIs ? `Birlikte yapılabilecek: ${b.ortakIs}.` : '', (b.projeler || []).length ? 'Fikirler: ' + b.projeler.join(' · ') + '.' : ''].filter(Boolean).join('\n'),
      kaynaklar: [...(b.kaynak ? [{ ad: 'İTÜ ders planı', url: b.kaynak }] : []), { ad: 'Bu bana uyar → bize katıl', url: '#son' }] })); return k; }));
  $('#bolum-not').textContent = 'Kaynak: İTÜ ders planları ve bölüm siteleri. Tam tablo "Meraklısına" bölümünde.';
}
const ORNEK_TUR = { girisim: 'girişim', universite: 'üniversite', takim: 'öğrenci takımı' };
function gercek() {
  const M = veri.metinler.gercekcilik; $('#gercek-baslik').textContent = M.baslik; $('#gercek-alt').textContent = M.alt; $('#gercek-not').textContent = M.tablo_not;
  const G = veri.gercekcilik || []; const T = $('#gercek-tablo');
  if (!G.length) { T.replaceWith(el('div', { class: 'bos', id: 'gercek-tablo' }, 'Takım yaşı ve bütçe tablosu kaynaklarıyla derleniyor.')); return; }
  yasCubuklari(G);
  T.replaceChildren(el('thead', {}, el('tr', {}, ...['Takım', 'Kuruluş', 'Yaş', 'Bütçe (yıllık)', 'İlk büyük derece', 'Kaynak'].map(h => el('th', {}, h)))),
    el('tbody', {}, ...G.map(g => el('tr', { class: g.biz ? 'biz' : '' }, el('td', {}, (g.dogrulandi === false ? '⚠ ' : '') + g.takim), el('td', {}, g.kurulus || '—'), el('td', {}, g.yas || '—'), el('td', {}, g.butce || '—'), el('td', {}, g.ilkDerece || '—'), el('td', {}, g.kaynakUrl ? el('a', { href: g.kaynakUrl, target: '_blank', rel: 'noopener' }, g.kaynakAdi || 'kaynak') : '—')))));
}
function yasCubuklari(G) {
  const S = $('#yas-svg'); if (!S) return;
  const satir = G.filter(x => x.kurulus && /^\d{4}$/.test(String(x.kurulus))).map(x => ({ ad: x.takim.replace(/^İTÜ /, '').replace(/ (Takımı|Roket Grubu|Team|Ar-Ge)$/, ''), yas: Math.max(0, 2026 - +x.kurulus), derece: (String(x.ilkDerece || '').match(/\b(20\d\d)\b/) || [])[1], biz: !!x.biz, kurulus: +x.kurulus, ilk: x.ilkDerece, kaynak: x.kaynakAdi })).sort((a, b) => b.yas - a.yas);
  const SAT = 30, W = 720, H = Math.max(120, 34 + satir.length * SAT), L = 150, R = 60, iw = W - L - R, mx = Math.max(5, ...satir.map(s => s.yas)); S.setAttribute('viewBox', `0 0 ${W} ${H}`); S.replaceChildren();
  [0, 5, 10, 15, 20].filter(v => v <= mx).forEach(v => { const x = L + v / mx * iw; S.append(svgEl('line', { x1: x, x2: x, y1: 16, y2: H - 10, stroke: 'rgba(31,42,46,.14)' })); S.append(svgEl('text', { x, y: 11, 'text-anchor': 'middle' }, v + ' yıl')); });
  satir.forEach((s, i) => { const y = 26 + i * SAT; const bw = Math.max(3, s.yas / mx * iw); S.append(svgEl('text', { x: L - 8, y: y + 12, 'text-anchor': 'end', class: 'ad' }, s.ad));
    const r = svgEl('rect', { x: L, y, width: bw, height: 16, class: 'cubuk' + (s.biz ? ' biz' : '') }); ipucuBagla(r, () => ({ baslik: s.ad, metin: s.biz ? 'Biz: kuruluş 2026. Hedef 2209 + AI Weather Quest.' : `Kuruluş ${s.kurulus} · ${s.yas} yıl · ilk büyük derece: ${s.ilk || 'kaynak yok'} · kaynak: ${s.kaynak || '—'}` })); S.append(r);
    if (s.derece && s.derece > s.kurulus) { const dx = L + (s.derece - s.kurulus) / mx * iw; S.append(svgEl('path', { d: `M${dx} ${y + 1} l-4 -7 h8 z`, class: 'derece' })); S.append(svgEl('text', { x: dx + 7, y: y - 1, class: 'derece' }, `ilk derece ${s.derece - s.kurulus}. yılda`)); }
    S.append(svgEl('text', { x: L + bw + 6, y: y + 12 }, s.biz ? '0 · başlıyoruz' : `${s.yas} yıl`)); });
  S.append(svgEl('text', { x: L, y: H - 2 }, 'çubuk: kuruluştan bugüne · üçgen: kaynaklı ilk büyük derece · çubuğun üstünde dur'));
}
function neden() {
  const M = veri.metinler.nedensimdi; $('#neden-baslik').textContent = M.baslik; const na = $('#neden-alt'); if (na) na.textContent = M.alt || '';
  /* v2: üstte üç kilit kart (kredi · diploma · network), sade başlık; basınca bulanık zeminin üstünde ayrıntı + kaynak. Takvim ve sayı kartları "meraklısına"da. */
  const kilit = (M.kartlar || []).slice(0, 3), takvim = M.takvim || (M.kartlar || [])[3];
  $('#neden-kartlar').replaceChildren(...kilit.map((k, i) => { const e = el('div', { class: 'kart kilit-k', tabindex: 0 }, el('span', { class: 'kk-no', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), el('b', {}, k.b), el('p', {}, yerDoldur(k.m)));
    etkilesim(e, () => ({ ust: (M.baslik || 'neden şimdi').toLowerCase(), baslik: k.b, kisa: yerDoldur(k.m), uzun: yerDoldur(k.detay || ''), kaynaklar: k.kaynaklar || [] })); return e; }));
  const TK = $('#takvim-kart'); if (TK && takvim) { const e = el('div', { class: 'kart' }, el('b', {}, takvim.b), el('p', {}, yerDoldur(takvim.m))); etkilesim(e, () => ({ ust: 'takvim', baslik: takvim.b, kisa: yerDoldur(takvim.m), uzun: yerDoldur(takvim.detay || ''), kaynaklar: takvim.kaynaklar || [] })); TK.replaceChildren(e); }
  nedenSayilar();
}
function nedenSayilar() {
  const S = (veri.sayilar || []).filter(s => s.sayi).slice(0, 8);
  $('#sayi-kartlar').replaceChildren(...(S.length ? S.map(s => { const e = el('div', { class: 'sk', tabindex: 0 }, el('b', {}, s.sayi), el('span', {}, s.etiket), s.kaynakUrl ? el('a', { href: s.kaynakUrl, target: '_blank', rel: 'noopener' }, s.kaynakAdi || 'kaynak') : null); etkilesim(e, () => ({ ust: 'sayı · güven: ' + (s.guven || '—'), baslik: s.sayi, kisa: s.etiket, uzun: `Kaynak: ${s.kaynakAdi || '—'}. Güven: ${s.guven === 'yuksek' ? 'yüksek — resmî sayfa 3 Ekim 2026\'da açılıp teyit edildi' : s.guven === 'orta' ? 'orta — ikincil kaynak ya da yeniden açılmadı' : '—'}.`, link: s.kaynakUrl, linkAd: 'kaynağı aç →' })); return e; }) : [el('div', { class: 'bos' }, 'Sayı kartları kaynaklarıyla derleniyor.')]));
}
let kufurVeri;
const sadele = s => s.toLowerCase().replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/İ/g, 'i');
function temizMi(metin) {
  const K = kufurVeri || { kokler: [], istisnalar: [], kaliplar: [] }; const m = ' ' + sadele(metin) + ' ';
  for (const kal of K.kaliplar) { try { if (new RegExp(kal, 'i').test(metin)) return false; } catch (e) { } }
  let t = m; for (const i of K.istisnalar) t = t.split(sadele(i)).join(' ');
  return !K.kokler.some(k => t.includes(sadele(k)));
}
function baloncuk() {
  const B = veri.anket.baloncuk; kufurVeri = veri.kufur; $('#baloncuk-baslik').textContent = B.baslik; $('#baloncuk-alt').textContent = B.alt;
  $('#balon-gorunum').replaceChildren(...B.gorunum.map((g, i) => el('label', {}, el('input', { type: 'radio', name: 'gorunum', value: g.id, checked: i === 0, onchange: () => { $('#balon-ad').hidden = g.id !== 'isim'; } }), g.etiket)));
  $('#rol-soru').textContent = B.rol.soru;
  $('#rol-org').replaceChildren(...B.rol.orglar.map((o, i) => el('option', { value: i === B.rol.orglar.length - 1 ? '' : o }, o))); $('#rol-org').value = '';
  $('#rol-unvan').replaceChildren(...B.rol.roller.map((o, i) => el('option', { value: i === B.rol.roller.length - 1 ? '' : o }, o))); $('#rol-unvan').value = '';
  const ta = $('#balon-metin'); ta.addEventListener('input', () => $('#balon-sayac').textContent = `${ta.value.length}/200`);
  $('#balon-form').addEventListener('submit', async e => {
    e.preventDefault(); const metin = ta.value.trim(); const T = $('#balon-tepki');
    if (metin.length < 3) { T.textContent = 'Biraz daha uzun olsun.'; return; }
    if (!temizMi(metin)) { T.textContent = B.kufur_mesaji; return; }
    const gorunum = $('input[name=gorunum]:checked').value; const ad = gorunum === 'isim' ? $('#balon-ad').value.trim().slice(0, 40) : '';
    const b = { metin, gorunum, grup: durum.grup || undefined, ad: ad || undefined, org: $('#rol-org').value || undefined, unvan: $('#rol-unvan').value || undefined };
    try { await arka.balonEkle(b); T.textContent = B.tesekkur; ta.value = ''; $('#balon-sayac').textContent = '0/200'; durum.etkilesim++; } catch (err) { T.textContent = 'Gönderilemedi. Bir daha dene.'; }
  });
  const G = $('#gok'); let ilk = true; const gorulen = new Set();
  const tohum = (B.seed || []).filter(x => x.onay === 'tamam').map((x, i) => ({ id: 'tohum-' + i, gorunum: 'isim', ...x, ts: 0 }));   /* ilk baloncuk: kurucunun kendi cümlesi — yalnız Akın onayladıysa (onay: "tamam"); yalnız ekranda, veritabanına yazılmaz */
  arka.balonDinle(l0 => { const l = [...l0, ...tohum.filter(t => !l0.some(x => x.metin === t.metin))];
    if (!l.length) { G.replaceChildren(el('div', { class: 'gok-bos' }, 'Henüz kimse bir şey söylemedi.\nİlk baloncuk seninki olsun.')); return; }
    G.replaceChildren(...l.slice(0, 40).map((b, i) => { const yeni = !ilk && !gorulen.has(b.id); gorulen.add(b.id);
      const kim = [b.gorunum === 'isim' && b.ad ? b.ad : 'anonim', b.org, b.unvan, b.grup].filter(Boolean).join(' · '); const h = [...(b.id || String(i))].reduce((a, c) => a + c.charCodeAt(0), 0);
      return el('div', { class: 'balon' + (yeni ? ' yeni' : ''), style: `left:${(h * 7) % 70}%;top:${(h * 13) % 78}%;--dx:${(h % 30) - 15}px;--dy:${(h % 22) - 11}px;--sure:${14 + h % 10}s` }, el('span', {}, b.metin), el('span', { class: 'kim' }, kim)); }));
    l.forEach(b => gorulen.add(b.id)); ilk = false;
  });
}
function merak() {
  const M = veri.metinler.meraklisina; $('#merak-baslik').textContent = M.baslik; $('#merak-alt').textContent = M.alt;
  const T = veri.takimlar || [], B = veri.bolumler || [], S = veri.sayilar || [], G = veri.gercekcilik || [];
  const det = (b, ...c) => el('details', { class: 'merak' }, el('summary', {}, b), el('div', {}, ...c));
  $('#merak-icerik').replaceChildren(
    det('İTÜ proje takımları ve amblemleri', T.length ? el('div', { class: 'amblemler' }, ...T.filter(t => t.logoUrl).map(t => el('a', { class: 'amblem', href: t.resmiSite || '#', target: '_blank', rel: 'noopener' }, el('img', { src: t.logoUrl, alt: t.takim + ' amblemi', loading: 'lazy', width: 56, height: 56 }), el('span', {}, t.takim)))) : el('p', { class: 'bos' }, 'Takım listesi derleniyor.'), T.length ? el('ul', { class: 'kaynaklar' }, ...T.map(t => el('li', {}, t.resmiSite ? el('a', { href: t.resmiSite, target: '_blank', rel: 'noopener' }, t.takim) : t.takim, t.tekSatir ? ' — ' + t.tekSatir : '', t.durum ? ` (${t.durum})` : ''))) : null, T.length ? el('p', { class: 'not' }, 'Amblemler tanıtım amaçlı, kaynak linkiyle; itiraz hâlinde kaldırılır.') : null),
    det('Bölüm bölüm ders karşılaştırması (tam)', B.length ? el('div', { class: 'tablo-sar' }, el('table', { class: 'tablo' }, el('thead', {}, el('tr', {}, ...['Bölüm', 'Senin dersin', 'Bizim dersimiz', 'Ortak iş', 'Hoca', 'Proje'].map(h => el('th', {}, h)))), el('tbody', {}, ...B.map(b => el('tr', {}, el('td', {}, b.bolum), el('td', {}, b.senin), el('td', {}, b.bizim), el('td', {}, b.ortakIs), el('td', {}, b.hocaSayisi ?? '—'), el('td', {}, b.projeSayisi ?? '—')))))) : el('p', { class: 'bos' }, 'Derleniyor.')),
    det('Kaynaklar', el('ul', { class: 'kaynaklar' }, ...[...S, ...G].filter(x => x.kaynakUrl).map(x => el('li', {}, el('a', { href: x.kaynakUrl, target: '_blank', rel: 'noopener' }, x.kaynakAdi || x.kaynakUrl), ' — ', x.etiket || x.takim || '')), ...(S.length + G.length ? [] : [el('li', {}, 'Derleniyor.')]))),
    det('Sözlük: altı noktalı terimler', el('ul', { class: 'kaynaklar' }, ...Object.values(veri.sozluk?.terimler || {}).map(t => el('li', {}, el('b', {}, t.ad + ': '), t.m)))),
    det('Bu sayfa nasıl çalışır', el('p', {}, 'Düz HTML/CSS/JS, derleme yok. Oylar Firebase Firestore\'da anonim cihaz kimliğiyle (bir cihaz bir oy). Mesajlar anında yayınlanır; küfür ve bağlantı istemcide filtrelenir, uygunsuz mesaj sonradan gizlenir. Uydu kareleri NASA GIBS, karne Open-Meteo. Kaynak kodu GitHub\'da.'))
  );
}
function sonKart() {
  const S = veri.anket.son_kart; const K = $('#son-kart'); const kural = S.kurallar.find(k => k.kosul === durum.grup) || null;
  const satirlar = [];
  if (durum.eslesme.toplam) satirlar.push(`kaydırma eşleşmesi %${Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam)}`);
  if (durum.test.toplam) satirlar.push(`bilgi testi ${durum.test.dogru}/${durum.test.toplam}`);
  if (durum.roller.length) satirlar.push('rol: ' + durum.roller.join(', '));
  K.replaceChildren(...[el('p', { class: 'yorum' }, S.baslik), kural ? el('p', { class: 'rol' }, kural.rol) : el('p', { class: 'kilitli' }, "aşama 2'de sana yakın olanı seçince burada sana göre bir rol çıkar"), el('p', {}, kural ? kural.metin : 'Üç seçenekten biri yeter.'), satirlar.length ? el('p', { class: 'kilitli' }, satirlar.join(' · ')) : null].filter(Boolean));
  const M = veri.metinler.kapanis; $('#son-ozet').replaceChildren(ses(M.hirsli, M.rahat));
  $('#son-cta').replaceChildren(...S.cta.map((c, i) => { const a = el('a', { class: i === 0 ? 'birincil' : '', href: c.href }, c.etiket); if (c.href === '#baloncuk') a.addEventListener('click', () => setTimeout(() => $('#balon-metin')?.focus({ preventScroll: true }), 900)); return a; }));
}

/* ---------------- PANEL · RAY · AŞAMA ---------------- */
/* v2 sırası (Akın 5 Eki): önce çekim (kısaca · neden şimdi · sen · başka bölüm), sonra ne yapıyoruz, kanıt katlı, anketler sonda. metinler.json "asamalar" varsa onu kullanır. */
const ASAMA_ADI = { 0: ['Başlangıç', 'Kısaca: ne yapıyoruz, sana ne var, kaç saat.'], 1: ['Neden şimdi', 'Kredi, diploma, network.'], 2: ['Sen', 'Hangisi sana yakın?'], 3: ['Başka bölüm', 'Senin dersin ↔ bizim işimiz.'], 4: ['Ne yapıyoruz', 'İki kol, 6 adım, atölyeler.'], 5: ['Meraklısına', 'Kanıt, karne, kaynaklar.'], 6: ['Anketler', 'Kaydır, 5 soru, oy ver.'], 7: ['Söz senin', 'Baloncuk, bize katıl.'] };
function asamaYukle() { const A = veri.metinler.asamalar;
  if (A) { Object.entries(A).forEach(([n, v]) => { if (!Array.isArray(v)) return; ASAMA_ADI[n] = [v[0], v[1] || '']; if (v[2]) ASAMA_NE[n] = v[2]; }); $$('.asama-baslik').forEach(h => { const v = A[h.dataset.asama]; const b = h.querySelector('b'); if (v && b) b.textContent = v[0]; }); }
  const pa = $('#p-ad'), pm = $('#p-m'); if (pa) pa.textContent = ASAMA_ADI[0][0]; if (pm) pm.textContent = ASAMA_ADI[0][1]; }
const basincTen = p => 1000 * Math.pow(0.1, p);                       /* 0→1000 hPa, 1→100 hPa (log) */
const yukseklik = P => 44330 * (1 - Math.pow(P / 1013.25, 0.1903));  /* standart atmosfer, m */
function panelSen() { const s = []; s.push(durum.grup ? `Seçimin: ${(veri.anket.kapi.secenekler.find(x => x.id === durum.grup) || {}).etiket || durum.grup}.` : 'Henüz seçim yapmadın (300 hPa).'); if (durum.eslesme.toplam) s.push(`Eşleşme %${Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam)}.`); if (durum.test.toplam) s.push(`Test ${durum.test.dogru}/${durum.test.toplam}.`); if (durum.roller.length) s.push('Rol: ' + durum.roller.join(', ') + '.'); const p = $('#p-sen'); if (p) p.textContent = s.join(' '); }
/* kaldığın yere dön (Akın 5 Eki): şerit/akış/ray ile uzağa atlayınca, eski yere tek tıkla dönüş. İçkin modda ana sitenin "Kaldığın yere dön" bulutu kullanılır. */
let donusY = null;
function donusGoster(y) {
  if (IC) { if (window.__geriGoster) window.__geriGoster(y); return; }
  const b = $('#donus'); if (!b) return; donusY = y; setTimeout(() => { if (donusY == null) return; b.hidden = false; requestAnimationFrame(() => b.classList.add('acik')); }, 900);
}
function donusKur() {
  const b = $('#donus'); if (!b || IC) return; const gizle = () => { donusY = null; b.classList.remove('acik'); setTimeout(() => { if (!b.classList.contains('acik')) b.hidden = true; }, 350); };
  b.addEventListener('click', () => { if (donusY == null) return; const y = donusY; gizle(); kaydirHedef(y); });
  KAYDIRMA.add(() => { if (donusY != null && !b.hidden && Math.abs(scrollY - donusY) < 200) gizle(); });
}
function gitEl(h, pay = 70) { if (!h) return; const y = h.getBoundingClientRect().top + scrollY - pay; if (Math.abs(y - scrollY) > innerHeight) donusGoster(scrollY);
  if (IC) { if (window.__lenis) window.__lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); return; } kaydirHedef(y); }
function ustPay() { const u = $('.ust'); if (!u) return 70; const t = parseFloat(getComputedStyle(u).top) || 0; return Math.max(70, t + u.offsetHeight + 16); }   /* yapışık hâldeki alt kenar: sticky top + yükseklik (şerit henüz yapışmamışken de doğru) */   /* iniş: yapışkan şeridin gerçek alt kenarı + 16 px (içkinde ana menü + şerit) */
if(!window.__girdiKur){window.__girdiKur=1;window.__girdi=0;var __g=function(){window.__girdi=performance.now();};['wheel','touchstart','touchmove'].forEach(function(t){addEventListener(t,__g,{passive:true,capture:true});});addEventListener('keydown',function(e){if(/^(Arrow|Page|Home|End| )/.test(e.key)||e.key===' ')__g();},true);}   /* 7 Eki: kullanıcı kaydırmaya başladıysa gecikmeli 'iniş düzeltmeleri' onu yukarı geri çekmesin */
function git(id) { let h = KOK.getElementById(id); if (!h) return; const pay = ustPay();
  if (h.dataset.katli && !h.getClientRects().length) katliAyarla(h.dataset.katli, true);   /* katlı bir bölüme gidiliyorsa önce aç */
  { const o = h.previousElementSibling; if (o && o.classList.contains('asama-baslik') && o.getClientRects().length) h = o; }   /* aşamanın başlığı görünsün */
  if (Math.abs(h.getBoundingClientRect().top - pay) > innerHeight) donusGoster(scrollY);
  { GOVDE.classList.add('hepsi-acik'); clearTimeout(GOVDE._hz); }   /* sınıf kalır: kaldırılınca bölümler yer tutucu boyuna döner, sayfa zıplıyordu */   /* content-visibility: üstteki bölümler gerçek boyuna açılsın, hedef kaçmasın */
  const y = h.getBoundingClientRect().top + scrollY - pay; if (IC || window.__lenis) { icGit(h, y, 0, performance.now()); return; } kaydirHedef(y); }   /* 15 Eki: bağımsız sayfada da Lenis var; iniş sırasında üstteki içerik boy değiştirirse (geçiş şeritleri, geç gelen görseller) bitince yeniden ölçüp düzeltir (qa20: aşama 1 payı −55 → +) */
/* içkin uzun atlama: Lenis kaydırması yarıda kesilebiliyor (content-visibility açılınca hedef kayar) → bitince yeniden ölç, hedefe 4 px yaklaşana kadar en çok 5 tur */
function icGit(h, y, tur = 0, t0 = performance.now()) { const L = window.__lenis; let bitti = false; const sonra = () => { if (bitti) return; bitti = true; if (window.__girdi > t0) return; const d = h.getBoundingClientRect().top - ustPay(); if (Math.abs(d) > 4) { if (tur < 2) icGit(h, scrollY + d, tur + 1, t0); else if (window.__lenis) window.__lenis.scrollTo(scrollY + d, { immediate: true, force: true }); else scrollTo(0, scrollY + d); } };
  if (L && !azalt) { const uzak = Math.abs(y - scrollY); L.scrollTo(y, { force: true, duration: tur ? .35 : Math.min(1.1, .45 + uzak / 9000), onComplete: () => setTimeout(sonra, 60) }); setTimeout(sonra, 2600); }
  else { scrollTo({ top: y, behavior: azalt ? 'auto' : 'smooth' }); setTimeout(sonra, 900); } }
function ilerleme() {
  const bar = $('#ilerleme-bar'), roz = $('#surpriz'), rm = $('#surpriz-metin'), balon = $('#ray-balon'), ybIc = $('#yan-balon .yb-ic'); const bloklar = $$('main > section[data-asama], .takim-main > section[data-asama]');
  let yukSon = -1, pSon = '', rayH = 0, yukBekle = false; const yukYaz = () => { yukBekle = false; KOKEL.style.setProperty('--yuk', (yukSon / 100).toFixed(2)); KOKEL.style.setProperty('--yukp', yukSon + '%'); }; const ustte = new Set(), altta = new Set();
  if ('IntersectionObserver' in window) {   /* aktif aşama (üst %45 çizgisinin üstü) ve kalan (görünür alanın altı) → IO; geri çağrı her sınır geçişinde konumu verir */
    const io1 = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting || (e.boundingClientRect.height && e.boundingClientRect.top < 0)) ustte.add(e.target); else ustte.delete(e.target); }); gK(); }, { rootMargin: '0px 0px -55% 0px' });
    const io2 = new IntersectionObserver(es => { es.forEach(e => { if (!e.isIntersecting && e.boundingClientRect.height && e.boundingClientRect.top > 0) altta.add(e.target); else altta.delete(e.target); }); gK(); });
    bloklar.forEach(b => { io1.observe(b); io2.observe(b); });
  }
  bloklar.forEach(b => altta.add(b));   /* ilk IO geri çağrısına dek hepsi 'kalan' sayılır (rozet erken açılmasın) */   /* --yuk/--yukp kökte: her yazım tüm sayfayı yeniden stiller → yalnız %1'lik adımlarda yazılır (renk farkı gözle seçilmez) */
  const g = () => { const h = KOKEL; let p;
    /* akıcılık: önce tüm okumalar (yerleşim), sonra yazımlar → kare başına zorunlu yeniden yerleşim yok */
    let aktif = 0; for (const b of bloklar) if (ustte.has(b)) aktif = +b.dataset.asama;   /* katlı (görünmez) bölümler sayılmaz — konumlar IO'dan, kaydırmada rect ölçümü yok */
    const kalan = altta.size;
    inisKontrol();
    if (IC) { const r = KOKEL.getBoundingClientRect(); p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); }   /* içkin: bölümün görünür alandaki ilerlemesi */
    else { const d = document.documentElement; p = Math.min(1, Math.max(0, d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight))); }
    const pq = p.toFixed(3); if (bar && pq !== pSon) { pSon = pq; bar.style.transform = `scaleX(${pq})`; }
    const yuk = 1 - p;                                                   /* iniş: sayfa başı tropopoz (yuk=1), sonu yüzey (yuk=0) */
    if (!IC && !PARITE) { const yq = Math.round(yuk * 100); if (yq !== yukSon) { const ilk = yukSon < 0; yukSon = yq; if (ilk) yukYaz(); else if (!yukBekle) { yukBekle = true; kaydirmaBitince(yukYaz); } }   /* kök renk değişkeni kayarken yazılmaz (her yazım tüm sayfayı yeniden stiller + renk geçişlerini tetikler); kaydırma durunca son değer yazılır, geçişler rengi yumuşatır */ }   /* içkin: zemin sabit, değişken yazılmaz (yeniden boyama yok) */
    if (balon) { if (!rayH) rayH = balon.parentNode.clientHeight || 0; balon.style.setProperty('--by', (p * .72 * rayH).toFixed(1) + 'px'); }   /* top yerine translate: yerleşim yok, yalnız birleştirme */
    const P = basincTen(yuk * .7), km = yukseklik(P) / 1000, T = 15 - 6.5 * km;   /* .7 → 1000…200 hPa aralığı */
    const ok = `${Math.round(P)} hPa · ${km.toFixed(1)} km`; const io = $('#im-okuma'); if (io && !inisDurum && io.textContent !== ok) io.textContent = ok; const mb = $('#mb-okuma'); if (mb && mb.textContent !== ok) mb.textContent = ok; const bn = $('#bb-not'); if (bn) metinYaz(bn, `${km.toFixed(0)} km · ${Math.round(P)} hPa · ` + (p < .02 ? 'balon tam şişkin' : p < .5 ? 'balon küçülüyor' : 'balon neredeyse yerde'));
    const ph = $('#p-hpa'); if (ph) { metinYaz(ph, Math.round(P) + ' hPa'); metinYaz($('#p-km'), km.toFixed(1).replace('.', ',') + ' km'); metinYaz($('#p-t'), Math.round(T) + ' °C'); }
    if (ybIc) { ybIc.style.transform = `translateY(-50%) scale(${(1 - p * .55).toFixed(3)})`; ybIc.style.opacity = p > .965 ? '0' : '1'; }   /* sağdaki balon: indikçe küçülür, yere yaklaşınca sahneyi zemindeki paraşüte bırakır */
    if (aktif !== durum.asama) { durum.asama = aktif; h.dataset.asama = aktif; const [ad, m] = ASAMA_ADI[aktif]; $('#p-asama').textContent = aktif; $('#p-ad').textContent = ad; $('#p-m').textContent = m; $$('#serit button').forEach(b => { const n = +b.dataset.asama; b.classList.toggle('aktif', n === aktif); b.classList.toggle('gecti', n < aktif); });
      const S = $('#serit'), ab = S && S.querySelector('button.aktif'); if (S && ab && S.scrollWidth > S.clientWidth + 4) S.scrollTo({ left: Math.max(0, ab.offsetLeft - S.clientWidth / 2 + ab.offsetWidth / 2), behavior: azalt ? 'auto' : 'smooth' }); }   /* mobil: yapışkan şeritte aktif aşama hep görünür (nerede olduğunu anlama) */
    if (roz && rm) { if (kalan === 0) { roz.classList.add('acildi'); rm.textContent = 'Yerdesin: sana göre rol ↓'; roz.querySelector('.kilit').textContent = '🪂'; } else metinYaz(rm, `Yere inince: sana göre rol · ${kalan} seviye kaldı`); }
    };
  let gRaf = 0; const gK = () => { if (!gRaf) gRaf = requestAnimationFrame(() => { gRaf = 0; g(); }); };   /* kare başına en çok bir kez */
  KAYDIRMA.add(g); addEventListener('resize', () => { rayH = 0; gK(); }); g();
}
function ray() {
  const SV = veri.sozluk?.seviyeler || {};
  $$('.ray .tik').forEach(t => { const s = SV[t.dataset.seviye]; if (s) ipucuBagla(t, () => ({ baslik: s.ad + ' · ' + s.yuk, metin: s.m })); t.addEventListener('click', () => git(t.dataset.hedef)); });
  $$('.seviye .hpa[data-seviye]').forEach(h => { const s = SV[h.dataset.seviye]; if (s) ipucuBagla(h, () => ({ baslik: s.ad + ' · ' + s.yuk, metin: s.m })); });
}
/* yumuşak tekerlek: hız sınırlı, yumuşatılmış kaydırma (fare/trackpad); dokunmatik ve hareket-azalt etkilenmez */
let hedefY = null, kayRaf = 0;
function kaydirHedef(y) { kaydirDur(); if (window.__lenis && !azalt) { window.__lenis.scrollTo(Math.max(0, y), { duration: .7 }); return; } scrollTo({ top: Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight)), behavior: azalt ? 'auto' : 'smooth' }); }   /* akıcılık: tarayıcının kendi yumuşak kaydırması (kompozitörde, ana iş parçacığını beklemez); eski rAF yolu kaydirAdim yedek */
let kayTakil = 0;
function kaydirDur() { if (kayRaf) cancelAnimationFrame(kayRaf); kayRaf = 0; hedefY = null; kayTakil = 0; }
function kaydirAdim() { if (hedefY == null) { kayRaf = 0; return; } const cur = scrollY; const fark = hedefY - cur; if (Math.abs(fark) < .6 || kayTakil > 6) { if (kayTakil <= 6) scrollTo(0, hedefY); kaydirDur(); return; } scrollTo(0, cur + fark * .11); kayTakil = Math.abs(scrollY - cur) < .3 ? kayTakil + 1 : 0; kayRaf = requestAnimationFrame(kaydirAdim); }
/* dokunmatikte kullanıcı parmağını koyunca otomatik kaydırma bırakılır (adres çubuğu yüksekliği değişince hedefe ulaşılamayıp takılmasın) */
addEventListener('touchstart', kaydirDur, { passive: true });
function yumusakKaydirma() {
  return;   /* akıcılık (6 Eki): tekerlek/klavye ele geçirilmez → tarayıcının yerel kaydırması (kompozitörde, 120 Hz'de takılmaz). Eski yol aşağıda duruyor. */
  if (dokunmatik || azalt || IC) return;
  addEventListener('wheel', e => { if (e.ctrlKey) return; const d = $('#detay'); if (d && d.open) return; if (e.target.closest('.tablo-sar, .serit, .panel, textarea')) return;
    if (gomulu) { const enAlt = scrollY >= document.documentElement.scrollHeight - innerHeight - 2; if ((e.deltaY < 0 && scrollY <= 0 && hedefY == null) || (e.deltaY > 0 && enAlt)) return; }   /* iframe'de uçlardayken dış sayfa kaysın */
    e.preventDefault(); const adim = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) * 1.1; const taban = hedefY == null ? scrollY : hedefY; kaydirHedef(taban + adim); }, { passive: false });
  addEventListener('keydown', e => { if (e.target.matches('input,textarea,select')) return; const h = innerHeight; const m = { ArrowDown: 80, ArrowUp: -80, PageDown: h * .85, PageUp: -h * .85, ' ': h * .85 }; if (e.key in m && !e.shiftKey) { e.preventDefault(); kaydirHedef((hedefY == null ? scrollY : hedefY) + m[e.key]); } });
}
function metinYaz(e, t) { if (e && e.textContent !== t) e.textContent = t; }   /* değişmeyen metni yeniden yazma = kaydırma karesinde yerleşim yok */
let KLIP_IO = null;
function klipTembel(v) {   /* 120fps/yük (15 Eki): klip ve posteri ekrana yaklaşınca iner; sonra aynı davranış — autoplay muted loop, kontrolsüz */
  v.muted = true; const yukle = () => { if (v.dataset.src) { if (v.dataset.poster) v.poster = v.dataset.poster; v.autoplay = true; v.src = v.dataset.src; delete v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => { }); } };
  if (!('IntersectionObserver' in window)) { yukle(); return v; }
  if (!KLIP_IO) KLIP_IO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { KLIP_IO.unobserve(e.target); e.target._yukle && e.target._yukle(); } }), { rootMargin: '600px 0px' });
  v._yukle = yukle; KLIP_IO.observe(v); return v;
}
function sonsuzDurdur() {   /* 120fps (15 Eki): görünür alandan uzak bölümlerde sonsuz animasyonlar paused (.gorunmuyor) — animasyon silinmez, görününce kaldığı yerden sürer */
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('gorunmuyor', !e.isIntersecting)), { rootMargin: '200px 0px' });
  $$('main > section, .takim-main > section').forEach(b => io.observe(b));
}
function gorunme() {
  const hedefler = $$('main .sar > *:not(.seviye), header.acilis .acilis-ic > *, .asama-baslik'); hedefler.forEach(h => h.classList.add('gel'));
  if (azalt || !('IntersectionObserver' in window)) { hedefler.forEach(h => h.classList.add('goster')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('goster'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); hedefler.forEach(h => io.observe(h));
}
const IMLEC_ACIK = false;   /* 15 Eki (tur 10, Akın): balon imleci yok — imleç tarayıcının varsayılanı, pointermove/rAF yükü sıfır; kod geri dönüş için duruyor */
function imlec() {
  if (!IMLEC_ACIK || dokunmatik || azalt) return; const I = $('#imlec'); GOVDE.classList.add('imlec-aktif'); I.style.display = 'block';   /* 14 Eki parite: gömülüde de */
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const ciz = () => { if (I.classList.contains('donus')) { raf = 0; return; } x += (tx - x) * .35; y += (ty - y) * .35; const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; I.style.transform = `translate(${x - 14 - g.left}px,${y - 14 - g.top}px)`; if (Math.abs(tx - x) + Math.abs(ty - y) > .3) raf = requestAnimationFrame(ciz); else raf = 0; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (I.classList.contains('donus')) return; if (IC) { const r = GOVDE.getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom) { I.classList.add('gizli'); return; } } I.classList.remove('gizli'); const h = e.target.closest('a,button,[role=button],summary,input,textarea,select,label,.kartd,.oy,.cip,.bk,.md-basamak,.etk,.terim,.tik,.hpa'); I.classList.toggle('kod', !!h); if (!raf) raf = requestAnimationFrame(ciz); }, { passive: true });
  addEventListener('pointerdown', e => { const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; for (let i = 0; i < 3; i++) { const d = el('span', { class: 'damla', style: `left:${e.clientX - 6 + i * 6 - g.left}px;top:${e.clientY + 6 - g.top}px;animation-delay:${i * 60}ms` }); GOVDE.append(d); setTimeout(() => d.remove(), 800); } });
  document.addEventListener('pointerleave', () => I.classList.add('gizli')); document.addEventListener('pointerenter', () => I.classList.remove('gizli'));
  if (IC) KAYDIRMA.add(() => { if (!raf && !I.classList.contains('donus') && !I.classList.contains('gizli')) raf = requestAnimationFrame(ciz); });   /* host kayınca balon yerinde kalsın */
}
/* 15 Eki (tur 10 §G-7): aşama/bölüm başlıkları görünür alana girince AURA kalıbıyla harf harf belirir (--i gecikme, yalnız opacity/transform, tek seferlik).
   Metin bütün kalır: başlığa aria-label, harf/kelime span'ları aria-hidden. Hareket azaltmada süre kısalır, KAPANMAZ (CSS'teki genel animation:none ezilir). */
function baslikCanlandir() {
  const H = $$('.asama-baslik b, section.blok h2').filter(h => !h.dataset.bh && h.textContent.trim() && !h.children.length);
  const MAX = 48, KELIME = matchMedia('(max-width:900px),(hover:none)').matches;
  H.forEach(h => {
    const t = h.textContent; h.dataset.bh = '1'; h.setAttribute('aria-label', t); let i = 0; const f = document.createDocumentFragment();
    t.split(/(\s+)/).forEach(k => { if (!k) return; if (/^\s+$/.test(k)) { f.append(k); return; } if (KELIME) { f.append(el('span', { class: 'bh-k bh-h', 'aria-hidden': 'true', style: `--i:${Math.min(i, MAX)}` }, k)); i += k.length; return; }   /* dokunmatik/dar: kelime kelime (aynı zamanlama) — harf başına katman açılışı mobilde kareyi yiyordu */
      const w = el('span', { class: 'bh-k', 'aria-hidden': 'true' }); for (const ch of k) w.append(el('span', { class: 'bh-h', style: `--i:${Math.min(i++, MAX)}` }, ch)); f.append(w); });
    h.replaceChildren(f); h.classList.add('bh');
  });
  const goster = h => kaydirmaBitince(() => h.classList.add('bh-oyna'));
  if (!('IntersectionObserver' in window)) { H.forEach(goster); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { goster(e.target); io.unobserve(e.target); } }), { threshold: .2 });
  H.forEach(h => io.observe(h));
}
/* 15 Eki (tur 10 §G-6): bölüm görselleri/klipler görünür alana girerken yumuşak belirme + hafif ölçek (IO; transform/opacity). Reduce'da süre kısa, kapanmaz. */
function gorselBelir() {
  const L = $$('.kart .medya, .dny-medya, .dny-kmedya, .cerceve > img, .cerceve > video, .kayan, .gridfig .kutu').filter(x => !x.classList.contains('gb'));
  L.forEach(x => x.classList.add('gb'));
  const ac = x => x.classList.add('gb-on');
  if (!('IntersectionObserver' in window)) { L.forEach(ac); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ac(e.target); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -4% 0px' });
  L.forEach(x => io.observe(x));
}
/* koç işareti: ilk ziyarette ilk karta 'buna dokun' eli */
function kocKapat() { const k = $('#koc'); if (k) { k.remove(); ls('takim-koc', '1'); } }
function kocKur() { return;   /* sözsüz etkileşim: öğretici kutu yok */
  if (ls('takim-koc') || azalt) return; const hedef = $('#olay-kartlar .etk'); if (!hedef) return;
  const k = el('div', { id: 'koc', class: 'koc', role: 'status' }, el('span', { class: 'koc-el' }, dokunmatik ? '👆' : '🖱'), el('span', { class: 'koc-m' }, (dokunmatik ? 'Buna dokun' : 'Buna tıkla') + ': kısa cümlenin uzun hâli açılır. Her kartta aynı.'), el('button', { type: 'button', class: 'koc-kapat', 'aria-label': 'Kapat', onclick: ev => { ev.stopPropagation(); kocKapat(); } }, '✕'));
  hedef.append(k);
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) k.classList.add('goster'); }, { threshold: .6 }); io.observe(hedef);
}
/* genelden özele: her aşama başlığının altında 'burada ne var' cümlesi */
const ASAMA_NE = { 1: 'Bu iş neden şimdi değerli: ders dışı kredi, diplomanın yetmemesi, seni hatırlayacak insanlar.', 2: 'Sana uyan yolu seç: izle, ara ara katıl ya da çekirdekte ol.', 3: 'Meteoroloji dışındaysan: senin dersinle bizim işimiz nerede buluşuyor.', 4: 'Ne yapacağız: iki kol, 6 adımlık yol haritası ve ders atölyeleri.', 5: 'Merak edene kanıt ve ayrıntı: canlı karne, yapılmış işler, kaynaklar.', 6: 'Oy ver: neyi görmek istersin. Her oy bir kez.', 7: 'Mesaj bırak, sana göre rolü gör, bize katıl.' };
function asamaNe() { $$('.asama-baslik').forEach(h => { const n = +h.dataset.asama; const t = ASAMA_NE[n]; if (t && !h.querySelector('.asama-ne')) h.append(el('span', { class: 'asama-ne' }, t)); }); }
/* ======== 11 Eki (Akın): AÇILAN KISMIN KAPANIŞI ========
   (1) Mobilde kapatma düğmesi görünmese de cihazın geri hareketi (yandan kaydırma / navigasyon barı) kapatır:
       açılışta geçmişe bir basamak eklenir, geri gelince dialog kapanır (sayfadan çıkılmaz).
   (2) Parmakla aşağı kaydırma: içerik en üstteyken aşağı çekilirse kapanır (ekran kartıyla aynı alışkanlık).
   (3) Açık kalıp 3 sn dokunulmazsa içerik kendiliğinden, yavaş ve akıcı biçimde aşağı iner (okuma sürer).
   (4) Kapanınca ana ekrana değil, EN SON AÇILAN karta/bölüme dönülür; tekerlek ya da parmak oradan devam eder. */
let ACAN = null;                       /* ayrıntıyı açan öğe: kapanışta oraya dönülür */
let GERI_BASAMAK = false;              /* geçmişe basamak eklendi mi */
let okRaf = 0, okSon = 0;              /* kendiliğinden iniş */

function okumaDur() { if (okRaf) cancelAnimationFrame(okRaf); okRaf = 0; }
function okumaBasla(D) {               /* 3 sn dokunulmazsa: her karede ~22 px/sn, dokununca durur */
  okumaDur(); if (azalt) return;
  let kay = null, kesirli = 0, oncekiT = 0;
  const adim = (t) => {
    if (!D.open) { okumaDur(); return; }
    if (performance.now() - okSon < 3000) { oncekiT = t; okRaf = requestAnimationFrame(adim); return; }   /* son dokunuştan 3 sn geçmedi */
    if (!kay) {   /* kaydırılacak kap: mobilde dialog'un kendisi, masaüstünde harita/metin alanı */
      const H = $('#harita');
      kay = D.classList.contains('dar') ? D : (H && H.scrollHeight - H.clientHeight > 2 ? H : D);
      kesirli = kay.scrollTop;
    }
    const son = kay.scrollHeight - kay.clientHeight;
    if (son <= 2 || kay.scrollTop >= son - 1) { okumaDur(); return; }                         /* sona geldi: dur */
    const dt = oncekiT ? Math.min(50, t - oncekiT) : 16; oncekiT = t;
    kesirli = Math.min(son, Math.max(kesirli, kay.scrollTop) + 26 * dt / 1000);               /* ~26 px/sn: yavaş, okurken rahat */
    kay.scrollTop = kesirli;                                                                  /* kesirli birikim: tam sayıya yuvarlanıp yerinde saymasın */
    okRaf = requestAnimationFrame(adim);
  };
  okRaf = requestAnimationFrame(adim);
}
function donusKart() {                 /* kapanışta en son açılan karta dön (ana ekrana değil) */
  const e = ACAN; if (!e || !e.getClientRects || !e.getClientRects().length) return;
  const r = e.getBoundingClientRect(); const pay = ustPay();
  if (r.top >= pay - 4 && r.bottom <= innerHeight - 8) return;                  /* zaten görünüyor: yerinden oynatma */
  const y = r.top + scrollY - Math.max(pay, (innerHeight - r.height) / 2);      /* kart ekranda ortalanır */
  if (IC && window.__lenis && !azalt) window.__lenis.scrollTo(Math.max(0, y), { duration: .6 });
  else kaydirHedef(y);
}
function kapanisKur() {
  const D = $('#detay'); if (!D) return;
  /* hangi yolla açılırsa açılsın, dönülecek öğe = en son tıklanan/dokunulan kart-düğme */
  (KOK.addEventListener ? KOK : document).addEventListener('pointerdown', e => {
    const t = e.target.closest && e.target.closest('.etk, .kart, .olay-k, .sana-k, .akis-k, .vaka, .bs, .zs, .sayi, .kartd, .adimlar li, figure[data-detay], .son-kart, button, li[tabindex]');
    if (t && !D.contains(t)) ACAN = t;
  }, true);

  /* -- açılış/kapanış kancası: showModal/close'u sarmalıyoruz (her açılış yolu buradan geçsin) -- */
  const ac0 = D.showModal && D.showModal.bind(D), kp0 = D.close.bind(D);
  let kapanisIslendi = false;   /* 14 Eki: tek kapı — close olayı kapandi()'yi yalnız sarmalı/popstate dışından gelen kapanışta (ör. tarayıcı) çağırır */
  if (ac0) D.showModal = function () { ac0(); acildi(); };
  D.close = function (v) { if (!D.open) { kp0(v); return; } kapanisIslendi = true; kapandi(); kp0(v); };
  D.addEventListener('close', () => { if (D.open) { kapanisIslendi = false; return; } if (!kapanisIslendi) kapandi(); kapanisIslendi = false; p3Temizle(); D.classList.remove('p3-acik'); const pn = $('#p-not'); if (pn) pn.classList.remove('canli'); notSifirla(); const A = $('#alt-not'); if (A && A.parentNode === D) { A.hidden = true; GOVDE.append(A); } });   /* tur 9: panel notu 6 sn sonra varsayılana döner, alt not gövdeye geri taşınır */   /* close olayı kuyruklu gelir: dialog o arada yeniden açıldıysa (kart→popstate kapanış→hemen kart) yeni açılışı bozma */
  /* Esc: tarayıcı cancel→dahili close ile sarmalı atlar, basamak ölü kalırdı → cancel'ı kesip kendi kapanışımızdan geçiriyoruz. Galeri büyütmesi açıksa yalnız o kapanır. */
  D.addEventListener('cancel', e => { e.preventDefault(); if (p3BuyukKapat()) return; D.close(); });

  function acildi() {
    okSon = performance.now(); okumaBasla(D);
    try { history.pushState({ tkDetay: 1 }, ''); GERI_BASAMAK = true; } catch (e) { GERI_BASAMAK = false; }   /* cihaz geri hareketi kapatsın */
  }
  function kapandi() {
    okumaDur();
    const n = (GERI_BASAMAK ? 1 : 0) + p3Basamak();   /* kapatma düğmesiyle kapatıldıysa eklenen basamakları (dialog + ekran yığını) birlikte geri al */
    GERI_BASAMAK = false; if (n) { try { history.go(-n); } catch (e) {} }
    setTimeout(donusKart, 60);
  }
  addEventListener('popstate', e => {
    const st = e.state;
    if (D.open && st && st.tkDetay && p3Derinlik() > 1) {   /* kendi basamağımız: yığında bir (ya da n) ekran geri; dialog açık kalır */
      const h = st.p3 || 1, d = p3Derinlik();
      if (h < d) { p3Geriye(h); return; }
      if (h > d) { try { history.go(d - h); } catch (err) {} return; }   /* ileri tuşu: yeniden kuramayız, geçmişi hizala */
      return;
    }
    GERI_BASAMAK = false; if (D.open) { kapanisIslendi = true; kp0(); } okumaDur(); setTimeout(donusKart, 60);
  });

  /* -- kullanıcı dokundu/kaydırdı: kendiliğinden iniş 3 sn daha beklesin -- */
  ['pointerdown', 'wheel', 'keydown', 'touchstart', 'touchmove'].forEach(t =>
    D.addEventListener(t, () => { okSon = performance.now(); }, { passive: true }));

  /* -- parmakla aşağı çekerek kapatma (mobil): içerik en üstteyken 90 px aşağı çekiş -- */
  let y0 = null, kayDik = false;
  D.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { y0 = null; return; }
    y0 = (D.scrollTop <= 0 && p3Derinlik() <= 1 && !p3BuyukAcik()) ? e.touches[0].clientY : null; kayDik = false;   /* metin kipinde kaydırma kabı dialog'un kendisi; aşağı çekerek kapatma yalnız 1. ekranda */
  }, { passive: true });
  D.addEventListener('touchmove', e => {
    if (y0 == null || e.touches.length !== 1) return;
    const d = e.touches[0].clientY - y0;
    if (d > 10) { kayDik = true; D.style.transform = 'translateY(' + Math.min(d * .45, 120) + 'px)'; D.style.opacity = String(Math.max(.55, 1 - d / 420)); }
  }, { passive: true });
  const birak = () => {
    if (y0 == null) return; const t = D.style.transform; y0 = null;
    const yuk = t ? parseFloat(t.replace(/[^0-9.\-]/g, '')) : 0;
    D.style.transition = 'transform .25s ease, opacity .25s ease';
    if (kayDik && yuk >= 40) { D.close(); }
    D.style.transform = ''; D.style.opacity = '';
    setTimeout(() => { D.style.transition = ''; }, 260);
  };
  D.addEventListener('touchend', birak, { passive: true });
  D.addEventListener('touchcancel', birak, { passive: true });
}
function detayKur() { const D = $('#detay'); if (!D) return; $('#detay-kapat').addEventListener('click', () => D.close()); D.addEventListener('click', e => { if (e.target === D || (D.classList.contains('metin') && (e.target.id === 'detay-ic' || e.target.id === 'harita'))) D.close(); });   /* metin görünümü: yazının dışındaki boşluğa tıklayınca kapanır */ addEventListener('resize', () => { if (D.open) { D.classList.toggle('dar', innerWidth < 860); D._ciz && D._ciz(); } }); }
/* iniş: fırlatma noktası ekrana girince imleç balonu oraya uçar, "bize katıl" yazar; tıklanır. Nokta ekrandan çıkınca imleç geri gelir. */
let inisDurum = false;
function inisKontrol() {
  const pad = $('#firlatma'), I = $('#imlec'); if (!IMLEC_ACIK || !pad || !I || dokunmatik || azalt) return;   /* imleç kapalı: "bize katıl" sabit .katil düğmesi (zemin üstünde) her zaman görünür, body.inis sınıfı hiç gelmez */
  const r = pad.getBoundingClientRect(); const gorunur = r.top > 60 && r.bottom < innerHeight - 10;
  if (gorunur && !inisDurum) { inisDurum = true; I.classList.add('donus'); I.classList.remove('gizli', 'kod'); GOVDE.classList.remove('imlec-aktif'); GOVDE.classList.add('inis'); $('#im-okuma').textContent = 'bize katıl →'; }
  if (inisDurum) { const r2 = pad.getBoundingClientRect(); const g2 = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; I.style.transform = `translate(${r2.left + r2.width / 2 - 14 - g2.left}px,${r2.top - 34 - g2.top}px)`; }
  if (!gorunur && inisDurum) { inisDurum = false; I.classList.remove('donus'); GOVDE.classList.remove('inis'); GOVDE.classList.add('imlec-aktif'); }
}
function katilYerlestir() {   /* "Bize katıl" tam fırlatma noktasının üstünde: paraşüt oraya iner */
  const Z = $('#zemin'), pad = $('#firlatma'), k = $('#katil'); if (!Z || !pad || !k) return; const z = Z.getBoundingClientRect(), r = pad.getBoundingClientRect(); if (!z.width) return;
  k.style.setProperty('--kx', ((r.left + r.width / 2 - z.left) / z.width * 100).toFixed(2) + '%'); k.style.setProperty('--ky', ((r.top + r.height * .55 - z.top) / z.height * 100).toFixed(2) + '%');
}
function inisKur() { const Z = $('#zemin svg'); if (Z) { const ayar = () => { Z.setAttribute('viewBox', innerWidth < 700 ? '430 40 770 280' : '0 0 1200 320'); requestAnimationFrame(katilYerlestir); }; ayar(); addEventListener('resize', ayar); setTimeout(katilYerlestir, 600); }
  const I = $('#imlec'); if (!I) return; I.addEventListener('click', () => { if (inisDurum) git('baloncuk'); }); }

/* 12 Eki (Akın): medya() artık modül düzeyinde — her bölüm kart görseli basabilsin (önce yalnız #mumkun içindeydi).
   tip: 'video' (mp4+poster, sessiz döngü) · 'serit' (yan yana küçük kareler) · varsayılan: tek fotoğraf. */
function medya(m, ek) {
  if (!m) return null;
  const sinif = 'medya' + (ek ? ' ' + ek : '');
  if (m.tip === 'video') return el('div', { class: sinif }, klipTembel(el('video', { 'data-src': yol(m.src), 'data-poster': yol(m.poster), muted: true, loop: true, playsinline: true, preload: 'none', 'aria-label': m.alt || '' })));
  if (m.tip === 'serit') return el('div', { class: sinif + ' serit' }, ...m.src.map(x => el('img', { src: yol(x), alt: '', loading: 'lazy', decoding: 'async' })));
  return el('div', { class: sinif }, el('img', { src: yol(m.src), alt: m.alt || '', loading: 'lazy', decoding: 'async' }));
}

/* ======== 12 Eki (Akın): DÜNYADA NE OLDU — diğer ülkelerdeki net örnekler ========
   Genelden özele üç kademe: ① blok özeti tek cümle + büyük görsel  ② üç kart (sayı + tek cümle)
   ③ karta dokun → ayrıntı, kaynak bağlantısıyla (ortak dialog #detay). Simetri: her blokta tam 3 kart.
   Veri: veri/dunya.json · görseller g/dunya/ (açık lisanslı; künye LISANS.json ve sayfa altında). */
function dunya() {
  const D = veri.dunya; const kap = $('#dunya-bloklar'); if (!D || !kap) return;
  $('#dunya-baslik').textContent = D.baslik || '';
  $('#dunya-alt').textContent = D.alt || '';
  const K = $('#dunya-kapanis'); if (K) K.textContent = D.kapanis || '';
  kap.replaceChildren(...(D.bloklar || []).map(b => {
    const kartlar = (b.kartlar || []).map(k => {
      const e = el('article', { class: 'dny-k' + (k.medya ? ' dny-k--medya' : ''), tabindex: 0 },
        medya(k.medya, 'dny-kmedya'),
        el('span', { class: 'dny-sayi' }, el('b', {}, k.sayi || ''), el('span', {}, k.sayiAlt || '')),
        el('b', { class: 'dny-b' }, k.b || ''),
        el('p', { class: 'dny-m' }, k.k || ''));
      etkilesim(e, () => ({ kaynaklar: (k.kaynaklar || []).filter(x => x && x.url), ust: 'dünyada ne oldu · ' + (b.ustbaslik || '').replace(/^\d+\s*·\s*/, ''), baslik: k.b, kisa: k.k, uzun: k.detay || '' }));
      return e;
    });
    return el('div', { class: 'dny-blok' },
      el('div', { class: 'dny-ust' },
        el('p', { class: 'dny-no' }, b.ustbaslik || ''),
        el('p', { class: 'dny-ozet' }, b.ozet || '')),
      medya(b.medya, 'dny-medya'),
      el('div', { class: 'dny-kartlar' }, ...kartlar),
      b.sonuc ? el('p', { class: 'dny-sonuc' }, b.sonuc) : null);
  }));
  kunye();
}
/* görsel künyesi: açık lisanslı görsellerin yazar/lisans bilgisi sayfa altında tek satır (lisans gereği) */
async function kunye() {
  const e = $('#dunya-kunye'); if (!e) return;
  try {
    const L = await (await fetch(yol('../g/dunya/LISANS.json'))).json();
    const kullanilan = new Set([...$$('.dny-medya img, .dny-kmedya img')].map(i => i.getAttribute('src').split('/').pop()));
    const tek = [...new Map(L.filter(x => kullanilan.has(x.dosya)).map(x => [x.yazar + x.lisans, x])).values()];
    if (!tek.length) { e.remove(); return; }
    e.replaceChildren(el('span', {}, 'Görseller: '), ...tek.flatMap((x, i) => [i ? ' · ' : '',
      el('a', { href: x.kaynak, target: '_blank', rel: 'noopener' }, (x.yazar || 'Wikimedia') + ' (' + x.lisans + ')')]));
  } catch (err) { e.remove(); }
}

/* ---------------- BAŞLAT ---------------- */
(async () => {
  await yukle();
  if (!veri.anket || !veri.metinler) { GOVDE.insertAdjacentHTML('afterbegin', '<p class="bos" style="margin:16px">Veri yüklenemedi (veri/*.json). Sayfayı bir sunucu üzerinden aç.</p>'); return; }
  if (durum.grup) KOKEL.dataset.grup = durum.grup;
  if (durum.kitle) KOKEL.dataset.kitle = durum.kitle;
  if (KIME) KOKEL.dataset.kime = KIME;
  await arkaKur();
  asamaYukle();
  acilis(); resmi(); olay(); sss(); sesYerlestir(); akis(); kapi(); vizyon(); merdiven(); karne(); mumkun(); deste(); test(); bolumler(); fakulteler(); derslerin(); mezun(); yzSor(); gercek(); neden(); dunya(); coklu(); canli(); anlatilar(); eelisa(); baloncuk(); merak(); sonKart(); panelSen();
  katliKur(); maddele(KOK); terimSar(KOK); sadeKur(); detayKur(); kapanisKur(); ray(); gorunme(); sonsuzDurdur(); ilerleme(); imlec(); inisKur(); kocKur(); asamaNe(); altNotKur(); yumusakKaydirma(); donusKur(); gecisler(); baslikCanlandir(); gorselBelir();
  if (dokunmatik) $$('.devam').forEach(d => { d.textContent = d.textContent.replace(/tıkla/g, 'dokun'); });
})();

/* ======== 8 Eki (Akın): bütün fakülteler → bölümler → ayrıntı. Veri: veri/fakulteler.json (Gemini → _araclar/gemini_al.py) ======== */
const FAK_IKON = {
  BBF: '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8M12 17v4M7 9h4M7 13h7"/>', DEF: '<path d="M3 17h18l-2 4H5zM12 3v14M12 5l7 8H5z"/>', EEF: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  FEF: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
  GIDB: '<path d="M2 16c2 1 4 1 6 0s4-1 6 0 4 1 6 0M4 14l2-6h12l2 6M12 8V3"/>', INS: '<path d="M2 20h20M4 20V9l8-5 8 5v11M9 20v-6h6v6"/>', ISL: '<path d="M3 20h18M5 20V10h4v10M10 20V5h4v15M15 20v-7h4v7"/>',
  KMF: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>', MDF: '<path d="M3 20L12 4l9 16H3z"/><path d="M8 20l4-7 4 7M12 13V9"/>', MKF: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  MIM: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-8h6v8M12 3v5"/>', TTF: '<path d="M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M14 4v16"/>', UUBF: '<path d="M3 16l9-2 9 2M12 14V5l3 2M12 5L9 7M8 20h8"/>',
  TMDK: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
};
const IKON_IZIN_ET = new Set(['path', 'circle', 'line', 'rect', 'polyline']), IKON_IZIN_NIT = new Set(['d', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'rx', 'ry', 'points', 'opacity', 'transform']);
function ikonGuvenli(k, ham) {   /* Gemini'den gelen SVG içi: yalnız izinli etiket/nitelik; aksi hâlde yerleşik ikon */
  const t = document.createElement('template'); t.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${IKONLAR[k] || FAK_IKON[k] || '<circle cx="12" cy="12" r="8"/>'}</svg>`; const yedek = t.content.firstChild;
  if (!ham || typeof ham !== 'string') return yedek;
  try { const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}" viewBox="0 0 24 24">${ham}</svg>`, 'image/svg+xml'); if (doc.querySelector('parsererror')) return yedek;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true'); let n = 0;
    for (const c of Array.from(doc.documentElement.children)) { if (!IKON_IZIN_ET.has(c.localName)) return yedek; const e = document.createElementNS(NS, c.localName); for (const a of Array.from(c.attributes)) if (IKON_IZIN_NIT.has(a.name)) e.setAttribute(a.name, a.value); svg.append(e); n++; }
    return n ? svg : yedek; } catch (e) { return yedek; }
}
function fakulteler() {
  const S = $('#fakulteler'); if (!S) return; const M = veri.metinler.fakulteler || {}; const F = (veri.fakulteler && veri.fakulteler.fakulteler) || [];
  $('#fak-baslik').textContent = M.baslik || 'Bütün fakülteler'; $('#fak-alt').textContent = M.alt || '';
  if (!F.length) { $('#fak-izgara').replaceChildren(el('div', { class: 'bos' }, 'Fakülte kartları derleniyor.')); return; }
  const IZ = $('#fak-izgara'), BL = $('#fak-bolumler'); let acik = ls('takim-fak') || '';
  const kartUzun = b => [
    (b.karsilastirma || []).length ? 'Senin dersin, bizdeki karşılığı: ' + b.karsilastirma.map(k => `${k.senin} → ${k.bizim} (${k.neden})`).join(' · ') : '',
    b.guncelOrnek ? `Güncel örnek: ${b.guncelOrnek.baslik}. ${b.guncelOrnek.metin}` : '',
    (b.isFikirleri || []).length ? 'Bugün başlanacak işler: ' + b.isFikirleri.map((f, i) => `${i + 1}) ${f.ad} (${(f.dersler || []).join(', ')}): ${f.ne} İlk adım: ${f.ilkAdim} Elde kalan: ${f.cikti}.`).join(' ') : '',
    b.detay || '', b.zaman ? `Zaman: ${b.zaman}` : ''].filter(Boolean).join('\n');
  const bolumCiz = f => {
    const hazir = f.bolumler.filter(b => b._durum === 'tamam').length;
    BL.replaceChildren(
      el('div', { class: 'fak-ust' }, el('button', { type: 'button', class: 'fak-geri', onclick: () => { acik = ''; ls('takim-fak', ''); BL.hidden = true; IZ.hidden = false; $$('.fk', IZ).forEach(x => x.setAttribute('aria-pressed', 'false')); gitEl(IZ, 120); } }, M.geri || '‹ fakülteler'),
        el('h3', {}, ikonGuvenli(f.kod), f.ad), el('span', { class: 'fak-sayac' }, `${f.bolumler.length} bölüm · ${hazir} ${M.hazir || 'hazır'}`)),
      el('div', { class: 'bolum-kartlar fak-bk' }, ...f.bolumler.map(b => {
        const tamam = b._durum === 'tamam' || b._durum === 'hatali'; const yuz = tamam ? (b.yuz || '') : (M.derleniyor || 'Hazırlanıyor.');
        const k = el('button', { class: 'bk fb' + (tamam ? '' : ' bekliyor'), type: 'button', 'data-k': b.k }, el('span', { class: 'bk-ad' }, ikonGuvenli(b.k, b.ikon), b.bolum, el('span', { class: 'bk-k' }, tamam ? (b.dogrulandi === false ? '⚠ ' : '') + b.k : (M.bekliyor || 'derleniyor'))), el('p', { class: 'bk-yuz' }, yuz));
        if (tamam) etkilesim(k, () => ({ ust: f.ad.toLowerCase() + ' · ' + b.bolum.toLowerCase(), baslik: b.bolum, kisa: b.yuz || '', uzun: kartUzun(b), p3: { tur: 'fakulte', fakulteKod: f.kod, k: b.k },
          kaynaklar: [...(b.guncelOrnek && b.guncelOrnek.kaynakUrl ? [{ ad: 'Güncel örnek: ' + (b.guncelOrnek.kaynakAdi || 'kaynak'), url: b.guncelOrnek.kaynakUrl }] : []), ...(b.kaynaklar || []).map(x => ({ ad: x.ad, url: x.url })), { ad: 'Bu bana uyar → bize katıl', url: '#son' }] }));
        return k; })));
    BL.hidden = false; IZ.hidden = true; maddele(BL); terimSar(BL);
  };
  IZ.replaceChildren(...F.map(f => { const hazir = f.bolumler.filter(b => b._durum === 'tamam').length;
    const k = el('button', { class: 'fk', type: 'button', 'aria-pressed': String(acik === f.kod), 'data-kod': f.kod }, ikonGuvenli(f.kod), el('b', {}, f.ad.replace(/ Fakültesi$/, '')), el('span', {}, `${f.bolumler.length} bölüm${hazir ? ` · ${hazir} ${M.hazir || 'hazır'}` : ''}`),
      el('span', { class: 'fk-ilerleme', style: `--p:${f.bolumler.length ? Math.round(hazir / f.bolumler.length * 100) : 0}%` }));
    k.addEventListener('click', () => { acik = f.kod; ls('takim-fak', f.kod); durum.etkilesim++; bolumCiz(f); gitEl(BL, 110); }); return k; }));
  const say = veri.fakulteler.sayac || {}; $('#fak-not').textContent = (M.not || '') + (say.toplam ? ` ${say.tamam}/${say.toplam} bölüm hazır.` : '');
  const ilk = F.find(f => f.kod === acik); if (ilk && acik) bolumCiz(ilk);   /* son bakılan fakülte açık kalsın */
}

/* ======== 8 Eki (Akın): hangi yapay zekâ → agentic mi → fark → 40 sn hızlı tur → asıl gereken ======== */
function yzSor() {
  const S = $('#yz'); const Y = veri.metinler.yz; if (!S) return; if (!Y) { S.hidden = true; return; }
  $('#yz-baslik').textContent = Y.baslik; $('#yz-alt').textContent = Y.alt; $('#yz-soru1').textContent = Y.soru1; $('#yz-soru2').textContent = Y.soru2; $('#yz-soru2-alt').textContent = Y.soru2alt || '';
  const sec = { ai: ls('takim-yz-ai') || '', ag: ls('takim-yz-ag') || '' };
  const dugmeler = (hedef, liste, anahtar, sonra) => $(hedef).replaceChildren(...liste.map(o => el('button', { class: 'giris-b yz-b', type: 'button', role: 'radio', 'aria-checked': String(sec[anahtar] === o.id), 'data-id': o.id,
    onclick: ev => { sec[anahtar] = o.id; ls('takim-yz-' + anahtar, o.id); durum.etkilesim++; $$(hedef + ' .yz-b').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === o.id))); sonra(o.id, ev.currentTarget); } }, el('b', {}, o.ad))));
  const fark = () => { const agentik = sec.ag && sec.ag !== 'hayir'; const K = Y.fark[agentik ? 'evet' : 'hayir'] || [];
    $('#yz-fark').replaceChildren(...K.map((k, i) => el('div', { class: 'kart yz-k', style: `--g:${i}` }, el('span', { class: 'kk-no', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), el('b', {}, k.b), el('p', {}, k.m))),
      el('button', { type: 'button', class: 'yz-tur-ac', onclick: () => { $('#yz-4').hidden = false; turKur(); gitEl($('#yz-4'), 90); } }, Y.turBaslik || '40 saniyede göster →'));
    $('#yz-3').hidden = false; };
  dugmeler('#yz-sec1', Y.araclar, 'ai', () => { $('#yz-2').hidden = false; if (!sec.ag) { const r = $('#yz-2').getBoundingClientRect(); if (r.bottom > innerHeight - 24) gitEl($('#yz-2'), Math.max(96, innerHeight - r.height - 60)); } });
  dugmeler('#yz-sec2', Y.agentic, 'ag', () => { fark(); const r = $('#yz-3').getBoundingClientRect(); if (r.bottom > innerHeight - 24) gitEl($('#yz-3'), 90); });
  if (sec.ai) $('#yz-2').hidden = false; if (sec.ai && sec.ag) fark();
  /* hızlı tur: gif gibi — büyük yazı ≤3 satır + gereken bilgiler çipleri, 2,8 sn'de bir ilerler; üstünde durunca bekler; hareket azaltmada liste */
  let turKuruldu = false;
  function turKur() {
    if (turKuruldu) return; turKuruldu = true; const T = Y.tur || []; const SH = $('#yz-tur-sahne'), BAR = $('#yz-tur-bar'); $('#yz-tur-baslik').textContent = Y.turBaslik || '';
    const kartlar = [...T.map(t => el('figure', { class: 'yz-kart' }, t.img ? el('img', { src: yol(t.img), alt: '', loading: 'lazy', decoding: 'async' }) : null, el('figcaption', {}, el('b', {}, t.b), el('span', { class: 'yz-gerek' }, 'gereken: '), el('span', { class: 'yz-cipler' }, ...(t.g || []).map(g => el('i', {}, g)))))),
      el('figure', { class: 'yz-kart son' }, el('figcaption', {}, el('b', {}, Y.son.b), el('em', {}, Y.son.m), el('p', {}, Y.son.d)))];
    SH.replaceChildren(...kartlar); BAR.replaceChildren(...kartlar.map(() => el('i')));
    let i = 0, z = null, duruk = azalt; const SURE = 2800;
    const asilGoster = () => { const A = $('#yz-asil'); if (A.hidden) { A.hidden = false; A.replaceChildren(el('b', {}, Y.asil.b), el('p', { class: 'buyuk' }, Y.asil.m), el('p', { class: 'alt' }, Y.asil.alt || '')); } };
    const goster = n => { i = (n + kartlar.length) % kartlar.length; kartlar.forEach((k, j) => k.classList.toggle('aktif', j === i)); $$('#yz-tur-bar i').forEach((b, j) => { b.classList.toggle('dolu', j < i); b.classList.toggle('akan', j === i && !duruk); b.style.setProperty('--sure', SURE + 'ms'); });
      if (i === kartlar.length - 1) asilGoster(); };
    const ileri = () => goster(i + 1); const basla = () => { clearInterval(z); if (!duruk) z = setInterval(() => { if (i < kartlar.length - 1) ileri(); else { clearInterval(z); duruk = true; $('#yz-tur-dur').textContent = '↻'; goster(i); } }, SURE); };
    $('#yz-tur-ileri').onclick = () => { ileri(); basla(); }; $('#yz-tur-geri').onclick = () => { goster(i - 1); basla(); };
    $('#yz-tur-dur').onclick = () => { if (i === kartlar.length - 1 && duruk) { duruk = false; $('#yz-tur-dur').textContent = '⏸'; goster(0); basla(); return; } duruk = !duruk; $('#yz-tur-dur').textContent = duruk ? '▶' : '⏸'; goster(i); basla(); };
    if (!dokunmatik) { SH.addEventListener('pointerenter', () => { clearInterval(z); $$('#yz-tur-bar i').forEach(b => b.classList.remove('akan')); }); SH.addEventListener('pointerleave', () => { if (!duruk) { goster(i); basla(); } }); }
    if (azalt) { SH.classList.add('liste'); kartlar.forEach(k => k.classList.add('aktif')); asilGoster(); return; }
    goster(0); if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { basla(); } else clearInterval(z); }, { threshold: .4 }); io.observe(SH); } else basla();
    let yzGor = true; if ('IntersectionObserver' in window) new IntersectionObserver(es => { yzGor = es[0].isIntersecting; }, { threshold: .4 }).observe(SH);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') clearInterval(z); else if (yzGor) basla(); });   /* 120fps: gizli sekmede zamanlayıcı dönmez */
  }
}

/* ======== 8 Eki (Akın): bölüm ayrıklığı — her bloktan sonra boşluk + konsepte uygun çizgi animasyonu (gecis.js ortak) ======== */
function gecisler() {
  if (!window.gecisKur) return;
  const TEMA = { mezun: 'pusula', derslerin: 'kitap', yz: 'devre', olay: 'izobar', akis: 'rota', neden: 'devre', kapi: 'pusula', bolumler: 'kitap', fakulteler: 'fakulte', vizyon: 'bulut', merdiven: 'sinek', anlatilar: 'dalga', karne: 'izobar', mumkun: 'balon', gercek: 'saat', meraklisina: 'kitap', sss: 'mesaj', kaydir: 'pusula', test: 'izobar', coklu: 'devre', canli: 'dalga', baloncuk: 'bulut', resmi: 'balon' };
  const ana = $('.takim-main') || $('main'); if (!ana) return;
  const etiket = s => { let n = s.nextElementSibling; while (n && (n.classList.contains('gecis') || n.hidden)) n = n.nextElementSibling; if (!n) return ''; const b = n.matches('.asama-baslik') ? n.querySelector('b') : n.querySelector('h2'); const t = b ? b.textContent.trim() : ''; return t ? '↓ ' + t.slice(0, 34) : ''; };
  window.gecisKur(ana, ':scope > section.blok:not(.kapak-blok):not([data-katli]):not(.son)', s => TEMA[s.id] || 'izobar', { sinif: 'takim-gecis', etiket });
}


/* ======== 8 Eki (Akın): bölüm içi öğrencilere derslerine göre projeler. Sınıf seç → ders kartları → ayrık bloklar (Takımda · işler: Ne / İlk adım / Elde kalan / Veri) ======== */
function derslerin() {
  const S = $('#derslerin'); if (!S) return; const M = veri.metinler.dersler || {}; const D = (veri.dersler && veri.dersler.dersler) || [];
  $('#ders-baslik').textContent = M.baslik || 'Derslerine göre projeler'; $('#ders-alt').textContent = M.alt || ''; $('#ders-not').textContent = M.not || '';
  const KK = $('#ders-kartlar'), YS = $('#yil-sec');
  if (!D.length) { KK.replaceChildren(el('div', { class: 'bos' }, M.bos || 'Ders kartları hazırlanıyor.')); YS.replaceChildren(); return; }
  const adTr = d => { const m = String(d.ad || '').match(/^(.*?)\s*\(([^)]+)\)\s*$/); return m && !/^[A-Z]{2,4}\s?\d/.test(m[2]) ? m[2] : d.ad; };   /* "Physics of Clouds (Bulut ve Yağış Fiziği)" → Türkçe adı */
  const yillar = (M.yillar || []).filter(y => D.some(d => d.yil === y.id));
  let secili = ls('takim-yil'); if (!yillar.some(y => y.id === secili)) secili = (yillar.find(y => y.id === '3') || yillar[0]).id;
  const kaynakca = d => (d.kaynakca || []).filter(x => x && x.url).map(x => ({ ad: [x.kisa, x.yayin].filter(Boolean).join(' · ') || x.baslik || x.url, url: x.url }));
  const ciz = () => {
    YS.replaceChildren(...yillar.map(y => el('button', { type: 'button', class: 'yil-b', role: 'tab', 'aria-selected': String(y.id === secili), onclick: () => { if (secili === y.id) return; secili = y.id; ls('takim-yil', y.id); durum.etkilesim++; ciz(); } }, y.ad, el('small', {}, String(D.filter(d => d.yil === y.id).length)))));
    KK.replaceChildren(...D.filter(d => d.yil === secili).map(d => {
      const k = el('button', { class: 'bk dk', type: 'button', 'data-k': d.kod }, el('span', { class: 'bk-ad' }, el('span', { class: 'dk-kod' }, d.kod), adTr(d)), el('p', { class: 'bk-yuz' }, d.yuz || ''));
      etkilesim(k, () => ({ ust: 'derslerine göre · ' + d.kod.toLowerCase(), baslik: adTr(d), kisa: d.yuz || '', p3: { tur: 'ders', dersKod: d.kod, kisaAd: d.kod },
        uzun: [d.baglanti, ...(d.isler || []).map((i, n) => `${n + 1}) ${i.ad}: ${i.ne} İlk adım: ${i.ilkAdim} Elde kalan: ${i.cikti}.`)].filter(Boolean).join(String.fromCharCode(10)),
        kaynaklar: [...kaynakca(d), ...(d.kaynaklar || []).filter(x => x && x.url), { ad: 'Bu bana uyar → bize katıl', url: '#son' }] }));
      return k; }));
    maddele(KK);
  };
  ciz();
  /* 15 Eki (tur9 §F): ders kartlarının üstünde ders planı girişi — yarıyıl yarıyıl bölüm dersleri, derse basınca o dersin projeleri (E0 → E1 → mevcut akış) */
  if (p3Plan().length && !$('#plan-giris')) {
    const b = el('button', { class: 'plan-giris', id: 'plan-giris', type: 'button' }, el('span', { class: 'plan-giris-ic' }, el('b', {}, M.planBaslik || 'Ders planı · yarıyıl yarıyıl'), el('span', {}, M.planAlt || 'Bölüm derslerinin tamamı; derse basınca o dersin proje önerileri.')), el('span', { class: 'p3-ok', 'aria-hidden': 'true' }));
    b.addEventListener('click', () => { ACAN = b; durum.etkilesim++; detayAc(p3PlanDetay()); });
    YS.after(b);
  }
}
function p3PlanDetay() { const P = veri['mto-plan'] || {}; return { ust: 'derslerine göre · ders planı' + (P.plan ? ' ' + P.plan : ''), baslik: 'Meteoroloji', kisa: 'Yarıyıl yarıyıl bölüm dersleri; derse basınca o dersin proje önerileri.', p3: { tur: 'plan', k: 'MTO' } }; }

/* ======== 8 Eki (Akın): takımın ana sorusu — mezun olunca yapay zekâyla ne değişecek, nasıl hazırlanırız. Kartlar (numaralı) + "Nasıl hazırlanıyoruz" adımları ======== */
function mezun() {
  const S = $('#mezun'); const M = veri.metinler.mezun; if (!S) return; if (!M) { S.hidden = true; return; }
  $('#mezun-baslik').textContent = M.baslik || ''; $('#mezun-alt').textContent = M.alt || '';
  $('#mezun-kartlar').replaceChildren(...(M.kartlar || []).map((k, i) => { const e = el('div', { class: 'kart kilit-k', tabindex: 0 }, el('span', { class: 'kk-no', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), el('b', {}, k.b), el('p', {}, k.m));
    etkilesim(e, () => ({ ust: (M.baslik || 'ana soru').toLowerCase(), baslik: k.b, kisa: k.m, uzun: k.detay || '', kaynaklar: (k.kaynaklar || []).filter(x => x && x.url) })); return e; }));
  const N = M.nasil; const NS = $('#mezun-nasil');
  if (N && (N.adimlar || []).length) NS.replaceChildren(el('p', { class: 'blk-b' }, N.baslik || 'Nasıl hazırlanıyoruz'), el('ol', { class: 'mezun-adim' }, ...N.adimlar.map(a => el('li', { tabindex: 0, onclick: ev => ev.currentTarget.classList.toggle('acik') }, el('b', {}, a.b), el('span', {}, a.m)))));
  else NS.replaceChildren();
}

/* 13 Eki (Akın): açık panelde klavye kaydırması tarayıcıya bırakılmaz. Ölçüm: odak dialog'un kendisindeyken bile Chrome
   ok tuşuyla paneli kaydırmadı (belge de kaymadı). Ok / PageUp-Down / Space / Home / End → panelin kendisi kayar.
   Space, düğme-summary-bağlantı üstündeyken etkinleştirme olarak kalır. */
(() => { const D = $('#detay'); if (!D) return; let hedef = null, t = 0;   /* hedef birikir: tuşu basılı tutunca her basış bir öncekinin ÜSTÜNE ekler (yoksa smooth kaydırma birbirini keser, adım başına 1 kare) */
  D.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.matches('input,textarea,select')) return;
    const h = D.clientHeight, m = { ArrowDown: 64, ArrowUp: -64, PageDown: h * .85, PageUp: -h * .85, ' ': e.shiftKey ? -h * .85 : h * .85, Home: -1e9, End: 1e9 };
    if (!(e.key in m)) return;
    if (e.key === ' ' && e.target.closest('summary,button,a')) return;
    const taban = (hedef != null) ? (performance.now() - t < 700 ? hedef : D.scrollTop) : D.scrollTop; hedef = Math.max(0, Math.min(taban + m[e.key], D.scrollHeight - D.clientHeight)); t = performance.now();
    e.preventDefault(); D.scrollTo({ top: hedef, behavior: azalt ? 'auto' : 'smooth' });
  });
})();

/* ======================================================================================================
   14 Eki (Akın): 3 FAZLI PROJE EKRANI — bölüm / fakülte→bölüm / ders kartı → dialog#detay içinde ekran yığını (spec: _3FAZ-NOTLAR/ui-spec.md).
   E1 liste → E2 proje → E3 örnekler / E3b örnek · E4 dersler / E4b ders · E5 yapılış / E5b adım · E6 galeri (+ büyütme).
   Genelden özele görsel dil: derinleştikçe çizgi incelir, girinti artar, yazı küçülür; "tıkla" yazısı yok, tıklanabilirlik › dairesi.
   Tarih: her alt ekran bir basamak ({tkDetay:1, p3:derinlik, id}); ‹ / kırıntı / mobil kenar kaydırma / Backspace → history.back() (tek mekanizma).
   Veri: veri/p3/_index.json açılışta (yukle); veri/p3/<id>.json, <id>.gorsel.json, veri/ders/<KOD>.json tembel (Map önbellek, index bayraklarıyla).
   Yoksa sessizce taban moduna düşer (index'teki taban{ne,adimlar,sonuc,senden,bizden}); eksik parça görünmez, boş kutu yok.
   Gömülü mod: sorgular KOK/$ üzerinden, yollar yol()/TABAN, KaTeX CSS gölge köke de <link> olarak girer; fixed yalnız top-layer dialog içinde (büyütme).
   ====================================================================================================== */
let P3 = null, p3Yukleniyor = false;
const P3_ONBELLEK = new Map();
const p3Derinlik = () => P3 ? P3.ekranlar.length : 0;
const p3Basamak = () => P3 ? P3.basamak : 0;
const p3BuyukAcik = () => !!(P3 && P3.buyuk);
const kodNorm = k => String(k || '').toUpperCase().replace(/\s+/g, '');
const kisalt = (t, n) => { t = String(t || ''); return t.length > n ? t.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : t; };
function obsUrl(kod, no) { const m = String(kod || '').trim().toUpperCase().match(/^([A-Z]{2,4})\s?(\d{3,4})/); if (!m) return null; return `https://obs.itu.edu.tr/public/DersKatalog/DersKatalogBilgiBransDersKodu?bransKodu=${m[1]}&dersNo=${no || m[2]}`; }   /* NO = koddaki sayı, E eki yok (BLG 202E → 202); ders dosyasında obsNo varsa o */
function p3Al(u) { if (!P3_ONBELLEK.has(u)) P3_ONBELLEK.set(u, fetch(`${TABAN}veri/${u}.json?v=${VERI_V}`).then(r => r.ok ? r.json() : null).catch(() => null)); return P3_ONBELLEK.get(u); }
function p3Index() { const I = veri['p3/_index']; return (I && Array.isArray(I.projeler)) ? I.projeler : []; }
/* ---- tur 9 (14 Eki): örnek görselleri (veri/p3/ornek-gorsel.json: {gorseller:{"<örnek url>":{src,ad,tur,...}}}; B hattı üretir, yoksa 404 → boş) ---- */
let P3_OG = null;
function p3OG() { return p3Al('p3/ornek-gorsel').then(j => { P3_OG = (j && j.gorseller && typeof j.gorseller === 'object') ? j.gorseller : {}; return P3_OG; }); }
const urlNorm = u => String(u || '').trim().toLowerCase().replace(/^http:/, 'https:').replace(/\/+$/, '').replace(/^https:\/\/www\./, 'https://');
function p3OGBul(url, OG = P3_OG) { if (!OG || !url) return null; let g = OG[url]; if (!g) { const n = urlNorm(url); for (const k in OG) if (urlNorm(k) === n) { g = OG[k]; break; } } return (g && g.src) ? g : null; }
/* bir index projesi için tek küçük görsel: hazır projede gorsel.json → gorseller[0] (video ise poster), yoksa örneklerden ilk eşleşen ekran görüntüsü */
async function p3ProjeGorsel(p) {
  if (p.gorsel) { const g = await p3Al('p3/' + p.id + '.gorsel'); const ilk = ((g && g.gorseller) || []).find(x => x && (x.poster || (x.src && !/\.(webm|mp4)(\?|$)/i.test(x.src)))); if (ilk) return { src: ilk.poster || ilk.src, ad: ilk.alt || p.ad, kaynak: ilk.kaynak || '' }; }
  const OG = P3_OG || await p3OG();
  for (const o of p.ornekler || []) { const g = p3OGBul(o && o.url, OG); if (g) return { src: g.src, ad: (g.ad || o.ad) + ' · ' + (p.ad || ''), kaynak: o.url }; }
  return null;
}
/* bölüm kartı paneli: o bölümün projelerinde benzerini yapanların görselleri (2-4): ornek-gorsel.json eşleşmesi + hazır projelerin gorsel.json → ornekler */
const P3_PANEL_ONBELLEK = new Map();
function p3PanelGorselleri(f) {
  const anahtar = JSON.stringify(f); if (P3_PANEL_ONBELLEK.has(anahtar)) return P3_PANEL_ONBELLEK.get(anahtar);
  const soz = (async () => {
    const L = p3Filtre(f), out = [], gorulen = new Set(); const OG = await p3OG();
    const ekle = g => { if (g && g.src && !gorulen.has(g.src) && out.length < 4) { gorulen.add(g.src); out.push(g); } };
    for (const p of L) for (const o of p.ornekler || []) { const g = p3OGBul(o && o.url, OG); if (g) ekle({ src: g.src, ad: kisalt(p.ad, 44), kaynak: o.url }); }   /* alt yazı: proje adı · kaynak alanı */
    for (const p of L) { if (out.length >= 4) break; if (!p.gorsel) continue; const g = await p3Al('p3/' + p.id + '.gorsel'); const O = (g && g.ornekler) || {}; for (const ad in O) for (const x of O[ad] || []) if (x && (x.poster || (x.src && !/\.(webm|mp4)(\?|$)/i.test(x.src)))) ekle({ src: x.poster || x.src, ad: kisalt(p.ad, 44), kaynak: x.kaynak || '' }); }
    return out;
  })();
  P3_PANEL_ONBELLEK.set(anahtar, soz); return soz;
}
/* panel özeti (2-4 kısa satır): bölüm filtresi → proje sayısı · ortak dersler · örnekler */
function p3Ozet(f, L) {
  if (f && f.tur === 'plan') {   /* 15 Eki (tur9 §F): ders planı özeti — ders · yarıyıl · proje sayısı */
    const Y = p3Plan(); if (!Y.length) return []; const ids = new Set(); let n = 0;
    Y.forEach(y => (y.dersler || []).forEach(d => { n++; p3PlanDersProjeler(d).forEach(p => ids.add(p.id)); }));
    return [n + ' bölüm dersi · ' + Y.length + ' yarıyıl', ids.size ? ids.size + ' proje önerisi' : '', 'Yarıyıl › ders › projeler'].filter(Boolean);
  }
  L = L || p3Filtre(f); if (!L.length) return [];
  const tekil = A => Array.from(new Set(A.filter(Boolean))); const kod = (p, yan) => ((p.dersler || {})[yan] || []).map(x => x && x.kod);
  const biz = tekil(L.flatMap(p => kod(p, 'bizim'))), sen = tekil(L.flatMap(p => kod(p, 'senin'))), orn = tekil(L.flatMap(p => (p.ornekler || []).map(o => o && o.ad)));
  return [L.length + ' proje' + (biz.length ? ' · ortak dersler ' + biz.slice(0, 3).join(', ') : ''), sen.length ? 'Senin derslerin: ' + sen.slice(0, 3).join(', ') : '', orn.length ? 'Benzerini yapanlar: ' + orn.slice(0, 3).join(', ') : ''].filter(Boolean);
}
/* aktif ekranın özeti sağ panele (darda alt nota): ekran değişince güncellenir */
function p3PanelGuncelle() {
  const S = P3; if (!S) return; const e = S.ekranlar[S.ekranlar.length - 1]; if (!e) return; const o = e.ozet || {};
  panelNot(o.baslik || e.ad, o.kisa || '', '', false, { satirlar: o.satirlar || [], gorseller: o.gorseller || [] });
  if (o.gorselSoz && !o.gorseller) o.gorselSoz.then(G => { if (P3 === S && S.ekranlar[S.ekranlar.length - 1] === e && G && G.length) { o.gorseller = G; panelGorselYaz(G); } });
}
/* adımın kazanımları: adim.kazanimlar ∪ nasil[].kazanim (ders+madde tekil) */
function p3Kazanimlar(a) { const g = new Set(), L = []; [...(a.kazanimlar || []), ...((a.nasil || []).map(x => x && typeof x === 'object' ? x.kazanim : null))].forEach(k => { if (!k || !k.ders) return; const id = k.ders + '|' + (k.madde || ''); if (!g.has(id)) { g.add(id); L.push(k); } }); return L; }
/* satırın sağına küçük görsel (yüklenemezse kaldırılır) */
function p3SatGorsel(sat, g) { if (!sat || !g || !g.src || sat.querySelector('.p3-sat-g')) return; const sp = el('span', { class: 'p3-sat-g' }, el('img', { src: yol(g.src), alt: g.ad || g.alt || '', loading: 'lazy', decoding: 'async', onerror: () => { sp.remove(); sat.classList.remove('gorselli'); } })); const ok = sat.querySelector('.p3-ok'); sat.classList.add('gorselli'); if (ok) sat.insertBefore(sp, ok); else sat.append(sp); }
/* 15 Eki (tur9 §F): İTÜ ders planı (veri/mto-plan.json → yariyillar[].dersler[]; projeKod = index'teki sahip.dersKod, TR/EN çifti aynı koda gider) */
function p3Plan() { const P = veri['mto-plan']; return (P && Array.isArray(P.yariyillar)) ? P.yariyillar : []; }
function p3PlanDersProjeler(d) { return p3Filtre({ tur: 'ders', dersKod: d.projeKod || d.kod }); }
const p3PlanMi = f => !!f && (f.tur === 'plan' || (f.k === 'MTO' && (f.tur === 'bolum' || f.tur === 'fakulte')) );   /* Meteoroloji'ye her giriş (bölüm kartı, fakülte→bölüm) ders planından başlar */
function p3Filtre(f) {
  const L = p3Index(); if (!f) return [];
  if (f.tur === 'plan') return [];
  if (f.tur === 'ders') { const n = kodNorm(f.dersKod), n3 = n.replace(/^([A-Z]+)(\d{3})\d$/, '$1$2'); let R = L.filter(p => p.kaynakTur === 'ders' && kodNorm(p.sahip.dersKod) === n); if (!R.length && n3 !== n) R = L.filter(p => p.kaynakTur === 'ders' && kodNorm(p.sahip.dersKod) === n3); return R; }   /* MTO 4901 → MTO 490 */
  if (f.tur === 'fakulte' && f.k !== 'MTO') return L.filter(p => p.kaynakTur === 'fakulte' && p.sahip.k === f.k);
  return L.filter(p => p.kaynakTur === 'bolum' && p.sahip.k === f.k);   /* fakülte→MTO kartı (F-UUBF-MTO-*) bölüm projelerinin kısa kopyası → bölüm projeleri gösterilir */
}
/* tam proje nesnesi: index satırı ∪ tembel <id>.json ∪ <id>.gorsel.json; yoksa taban */
async function p3Proje(p) {
  const [tam, g] = await Promise.all([p.durum === 'hazir' ? p3Al('p3/' + p.id) : null, p.gorsel ? p3Al('p3/' + p.id + '.gorsel') : null, p3OG()]);   /* örnek görselleri de hazır: E3/E3b eşzamanlı kullanır */
  const T = p.taban || {}, Y = (tam && tam.yapilis) || null;
  const adimlar = (Y && Array.isArray(Y.adimlar) && Y.adimlar.length) ? Y.adimlar : (T.adimlar || []).map(a => typeof a === 'string' ? { baslik: a } : a);
  return { p, tam, taban: !tam, id: p.id, ad: p.ad || '', amac: (tam && tam.amac) || p.amac || T.ne || '',
    dersler: (tam && tam.dersler) || p.dersler || { senin: [], bizim: [] },
    ornekler: ((tam && tam.ornekler) || p.ornekler || []).filter(o => o && o.ad),
    ortakDers: (tam && tam.ortakDers) || [],
    yapilis: { oz: (Y && Y.oz) || '', ayrinti: (Y && Y.ayrinti) || '', adimlar, hazir: !!Y },
    sonuc: (Y && Y.sonuc) || T.sonuc || '', senden: (Y && Y.senden) || T.senden || '', bizden: (Y && Y.bizden) || T.bizden || '',
    gorseller: (g && g.gorseller) || [], ornekGorsel: (g && g.ornekler) || {}, adimGorsel: (g && g.adimlar) || {},
    dersHazir: (p.dersHazir || []).map(kodNorm) };
}
/* ---- yığın çekirdeği ---- */
function p3Kur(d, D) {
  const f = d.p3, liste = p3Filtre(f);
  const kisaAd = f.kisaAd || kisalt(String(d.baslik || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(Mühendisliği|Müh\.|Programı|Bölümü)\s*$/i, '').trim(), 26) || 'bölüm';
  const geri = el('button', { class: 'p3-geri', type: 'button', 'aria-label': 'geri', onclick: () => p3Geri() }, '‹');
  const kirinti = el('nav', { class: 'p3-kirinti', 'aria-label': 'bulunduğun yer' });
  const yigin = el('div', { class: 'p3-yigin' });
  const kok = el('div', { class: 'p3' }, el('div', { class: 'p3-yol' }, geri, kirinti), yigin);
  P3 = { D, kok, kirinti, yigin, ekranlar: [], basamak: 0, buyuk: null, io: null };
  p3Jestler(yigin, D);
  if (p3PlanMi(f) && p3Plan().length) { const pf = { tur: 'plan', k: 'MTO' }; p3EkranAc({ ad: 'Meteoroloji', ozet: { baslik: 'Meteoroloji', kisa: kisalt(d.kisa || '', 120), satirlar: p3Ozet(pf) }, kur: sec => p3E0(sec, d) }, true); return kok; }
  p3EkranAc({ ad: kisaAd, ozet: { baslik: kisaAd, kisa: kisalt(d.kisa || (liste.length ? liste.length + ' proje' : ''), 120), satirlar: p3Ozet(f, liste), gorselSoz: p3PanelGorselleri(f) }, kur: sec => p3E1(sec, d, liste) }, true);
  return kok;
}
function p3Temizle() { if (!P3) return; p3BuyukKapat(); P3.kok.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) { } }); if (P3.io) P3.io.disconnect(); P3 = null; }
function p3Odakla() { if (!P3) return; const e = P3.ekranlar[P3.ekranlar.length - 1]; if (!e) return; const h = e.el.querySelector('.p3-baslik') || e.el; try { h.focus({ preventScroll: true }); } catch (err) { } }
function p3Videolar(kok, oynat) { kok.querySelectorAll('video').forEach(v => { if (!oynat) { try { v.pause(); } catch (e) { } return; } const r = v.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) { const p = v.play(); if (p && p.catch) p.catch(() => { }); } }); }
function p3VideoIzle(v) {   /* görünür olunca oynar, çıkınca durur; geride kalan ekrandakiler durur */
  if (!P3) return; if (!P3.io) P3.io = new IntersectionObserver(es => es.forEach(x => { const v = x.target; if (x.isIntersecting && !v.closest('.geride, .cikis, .gizli')) { const p = v.play(); if (p && p.catch) p.catch(() => { }); } else v.pause(); }), { threshold: .15 });
  P3.io.observe(v);
}
function p3EkranAc(t, ilk) {
  const S = P3; if (!S) return;
  const onceki = S.ekranlar[S.ekranlar.length - 1];
  if (onceki) onceki.scroll = S.D.scrollTop;   /* geri dönünce önceki ekranın kaydırma konumu geri gelir */
  const sec = el('section', { class: 'p3-ekr' + (ilk ? ' aktif' : ' giris'), 'data-ad': t.ad });
  const e = { ad: t.ad, el: sec, scroll: 0, veri: t.veri || null, ozet: t.ozet || null, onEk: t.onEk || '', onEkNo: t.onEkNo || '' };   /* onEk: kırıntıda bu ekranın önüne gelen ara parça (ör. "3. yarıyıl"; ayrı ekran değil) */
  const ic = t.kur(sec, e); if (Array.isArray(ic)) sec.append(...ic.filter(Boolean)); else if (ic) sec.append(ic);
  S.ekranlar.push(e); S.yigin.append(sec); p3PanelGuncelle();
  if (!ilk) { try { history.pushState({ tkDetay: 1, p3: S.ekranlar.length, id: (e.veri && e.veri.id) || '' }, ''); S.basamak++; } catch (err) { } }
  if (onceki) { onceki.el.classList.add('geride'); onceki.el.inert = true; p3Videolar(onceki.el, false); }
  p3KirintiCiz();
  if (!ilk) {
    S.D.scrollTop = 0; okSon = performance.now(); durum.etkilesim++;
    const bitir = () => { sec.classList.add('aktif'); sec.classList.remove('giris'); if (onceki && onceki.el.classList.contains('geride')) onceki.el.classList.add('gizli'); };
    if (azalt) bitir(); else requestAnimationFrame(() => requestAnimationFrame(() => { sec.classList.remove('giris'); setTimeout(bitir, 300); }));
    p3Odakla(); p3Videolar(sec, true);
  }
}
function p3Geriye(h) {   /* yığını h derinliğine indir (popstate'ten gelir) */
  const S = P3; if (!S) return; h = Math.max(1, h | 0);
  while (S.ekranlar.length > h) {
    const giden = S.ekranlar.pop(); S.basamak = Math.max(0, S.basamak - 1);
    const hedef = S.ekranlar[S.ekranlar.length - 1]; p3Videolar(giden.el, false);
    if (S.ekranlar.length !== h) { giden.el.remove(); continue; }   /* ara ekranlar animasyonsuz gider */
    hedef.el.inert = false; hedef.el.classList.remove('gizli', 'geride'); hedef.el.classList.add('geri-bas');
    giden.el.inert = true; giden.el.classList.remove('aktif'); giden.el.classList.add('cikis');
    S.D.scrollTop = hedef.scroll || 0;
    const bitir = () => { hedef.el.classList.remove('geri-bas'); giden.el.classList.add('cikti'); };
    if (azalt) { bitir(); giden.el.remove(); } else { requestAnimationFrame(() => requestAnimationFrame(bitir)); setTimeout(() => giden.el.remove(), 320); }
    p3Videolar(hedef.el, true);
  }
  p3KirintiCiz(); p3Odakla(); p3PanelGuncelle(); okSon = performance.now();
}
function p3Geri() { const S = P3; if (!S) return; if (S.ekranlar.length <= 1) { S.D.close(); return; } if (S.basamak >= 1) { try { history.back(); return; } catch (e) { } } p3Geriye(S.ekranlar.length - 1); }
function p3KirintiCiz() {
  const S = P3; if (!S) return; const n = S.ekranlar.length;
  S.kirinti.replaceChildren(...S.ekranlar.flatMap((e, i) => {
    const k = n - 1 - i;
    const p = k === 0 ? el('span', { class: 'p3-kr p3-kr-son', 'aria-current': 'page' }, e.ad)
      : el('button', { class: 'p3-kr', type: 'button', onclick: () => { if (S.basamak >= k) { try { history.go(-k); return; } catch (err) { } } p3Geriye(i + 1); } }, e.ad);
    const ayrac = () => el('span', { class: 'p3-kr-ayrac', 'aria-hidden': 'true' }, '›');
    /* ara parça (ör. "3. yarıyıl"): bir önceki ekrana döner, orada o yarıyılın katını açık bırakır */
    const ek = (e.onEk && i) ? el('button', { class: 'p3-kr-ek', type: 'button', onclick: () => { const h = S.ekranlar[i - 1]; const dt = h && e.onEkNo ? h.el.querySelector(`.p3-yy[data-no="${e.onEkNo}"]`) : null; if (dt) { dt.open = true; h.scroll = Math.max(0, dt.offsetTop - 60); } if (S.basamak >= k + 1) { try { history.go(-(k + 1)); return; } catch (err) { } } p3Geriye(i); } }, e.onEk) : null;
    return i ? [ayrac(), ek, ek ? ayrac() : null, p] : [p]; }));
  S.kok.querySelector('.p3-geri').classList.toggle('p3-geri-ilk', n === 1);
  requestAnimationFrame(() => { S.kirinti.scrollLeft = S.kirinti.scrollWidth; });   /* darda son parça görünür */
}
function p3Jestler(yigin, D) {
  /* mobil: sol kenardan (x<28) sağa 72 px kaydırma → geri (aşağı çekerek kapatma kapanisKur'da, yalnız 1. ekranda) */
  if (D._p3Jest) return; D._p3Jest = true;   /* dinleyiciler bir kez (D kalıcı); yığının kenar boşluğu da sayılsın diye dialog'a bağlı, P3 yokken etkisiz */
  let x0 = null, y0 = 0, tetik = false;
  D.addEventListener('touchstart', e => { if (!P3 || P3.ekranlar.length <= 1 || e.touches.length !== 1) { x0 = null; return; } const t = e.touches[0]; x0 = t.clientX < 28 ? t.clientX : null; y0 = t.clientY; tetik = false; }, { passive: true });
  D.addEventListener('touchmove', e => { if (x0 == null || tetik || !P3) return; const t = e.touches[0]; const dx = t.clientX - x0, dy = Math.abs(t.clientY - y0); if (dx > 72 && dy < 48) { tetik = true; x0 = null; p3Geri(); } }, { passive: true });
  D.addEventListener('touchend', () => { x0 = null; }, { passive: true });
  /* klavye: Esc büyütmeyi kapatır, Backspace / Alt+← bir ekran geri (yazı alanında değilse) */
  D.addEventListener('keydown', e => {
    if (!P3) return; const t = e.composedPath()[0];
    if (P3.buyuk) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); p3BuyukKapat(); return; } if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); P3.buyuk.gez(e.key === 'ArrowRight' ? 1 : -1); return; } }
    if (t && t.matches && t.matches('input,textarea,select,[contenteditable]')) return;
    if ((e.key === 'Backspace' && !e.altKey && !e.ctrlKey && !e.metaKey) || (e.altKey && e.key === 'ArrowLeft')) { if (P3.ekranlar.length > 1) { e.preventDefault(); p3Geri(); } }
  }, true);
}
/* ---- ortak parçalar ---- */
const p3Baslik = (t, ek) => el('h3', { class: 'p3-baslik' + (ek ? ' ' + ek : ''), tabindex: -1 }, t);
const p3Blok = (et, m) => m ? el('div', { class: 'p3-blok' }, el('span', { class: 'p3-etiket' }, et), el('p', {}, m)) : null;
const p3Ok = () => el('span', { class: 'p3-ok', 'aria-hidden': 'true' });
function p3Medya(g, buyuk, oynatDugmesi) {
  const src = yol(g.src), video = /\.(webm|mp4)(\?|$)/i.test(String(g.src));
  if (!video) return el('img', { src, alt: g.alt || '', loading: buyuk ? 'eager' : 'lazy', decoding: 'async' });
  /* 15 Eki (Akın): her klip GIF gibi — kendiliğinden oynar, durdurulamaz, sonsuz döngü, kontrol yok; hareket azaltmada da aynı (▶ düğmesi kaldırıldı). Görünmezken IntersectionObserver duraklatır. */
  const v = el('video', { src, poster: g.poster ? yol(g.poster) : null, muted: true, loop: true, playsinline: true, preload: 'metadata', autoplay: true, controlslist: 'nodownload noplaybackrate noremoteplayback', disablepictureinpicture: true, 'aria-label': g.alt || '' });
  v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.controls = false; v.disablePictureInPicture = true;
  v.addEventListener('pause', () => { if (v.ended || !v.isConnected || v.closest('.geride, .cikis, .gizli')) return; const r = v.getBoundingClientRect(); if (r.height > 0 && r.bottom > 0 && r.top < innerHeight) { const p = v.play(); if (p && p.catch) p.catch(() => { }); } });   /* kullanıcı duraklatamaz; görünürken hep oynar (görünmezken IO'nun duraklatması kalır) */
  p3VideoIzle(v); return v;
}
function p3MiniSerit(G) {   /* 3 mini görsel; basınca E6 galeri. Görsel yoksa şerit yok. */
  const T = (G || []).filter(g => g && g.src), L = T.slice(0, 3); if (!L.length) return null;
  return el('div', { class: 'p3-mini' }, ...L.map(g => el('button', { class: 'p3-mini-k', type: 'button', 'aria-label': (g.alt || 'görsel') + ' — galeri', onclick: () => p3EkranAc({ ad: 'Görseller', ozet: p3OzetE6(T), kur: s => p3E6(s, T) }) }, p3Medya(g), g.alt ? el('span', { class: 'p3-alt' }, g.alt) : null)));
}
function p3KodLink(kod, no) { const u = obsUrl(kod, no); return u ? el('a', { class: 'p3-kod', href: u, target: '_blank', rel: 'noopener', onclick: e => e.stopPropagation() }, kod + ' ↗') : el('span', { class: 'p3-kod' }, kod); }
/* ---- KaTeX (tembel; CSS belgeye + gömülüde gölge köke) ---- */
let katexSoz = null;
function katexYukle() {
  if (katexSoz) return katexSoz;
  const K = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min';
  const link = kok => { const hedef = kok === document ? document.head : kok; if (hedef.querySelector(`link[href="${K}.css"]`)) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = K + '.css'; hedef.append(l); };
  link(document); if (IC) link(KOK);   /* Shadow DOM belge CSS'ini görmez */
  katexSoz = new Promise(res => { if (window.katex) return res(window.katex); const s = document.createElement('script'); s.src = K + '.js'; s.async = true; s.onload = () => res(window.katex || null); s.onerror = () => res(null); document.head.append(s); });
  return katexSoz;
}
function p3TexCiz(e, K) { const tex = e.dataset.tex || ''; if (!K) return; try { K.render(tex, e, { throwOnError: false, displayMode: e.dataset.display === '1' }); } catch (err) { e.replaceChildren(el('code', {}, tex)); } }   /* yüklenemezse <code> yedeği zaten yerinde */
/* ---- E1 · liste (Faz 1) ---- */
/* ---- E0 · plan (15 Eki, tur9 §F): yarıyıl başlıkları (1-8) altında bölüm dersleri — kod ↗ OBS · ad · kredi · zorunlu/seçmeli · proje sayısı · › ; projesi olmayan ders listede ama soluk, tıklanmaz ---- */
function p3E0(sec, d) {
  const Y = p3Plan(), P = veri['mto-plan'] || {}, K = P.kaynak || {};
  const out = [el('p', { class: 'dm-ust' }, d.ust || ''), el('h3', { id: 'detay-baslik', class: 'dm-baslik p3-baslik', tabindex: -1 }, d.baslik || ''), d.kisa ? el('p', { class: 'dm-kisa p3-yuz' }, d.kisa) : null];
  if (!Y.length) { out.push(el('p', { class: 'p3-not' }, 'Ders planı derleniyor.')); return out; }
  const dar = innerWidth < 860;
  out.push(el('p', { class: 'p3-plan-ust' }, 'İTÜ ders planı' + (P.plan ? ' ' + P.plan : '') + ' · yalnız bölüm dersleri', K.url ? [' · ', el('a', { href: K.url, target: '_blank', rel: 'noopener' }, 'OBS ↗')] : null));
  out.push(el('div', { class: 'p3-plan' }, ...Y.map((y, i) => {
    const D = y.dersler || []; const nP = D.reduce((a, x) => a + p3PlanDersProjeler(x).length, 0);
    return el('details', { class: 'p3-yy', open: (!dar || i === 0) ? true : null, 'data-no': y.no },
      el('summary', { class: 'p3-yy-b' }, el('b', {}, y.no + '. yarıyıl'), el('span', { class: 'p3-yy-m' }, D.length + ' ders' + (nP ? ' · ' + nP + ' proje' : '')), el('span', { class: 'p3-ok p3-ok-k p3-yy-ok', 'aria-hidden': 'true' })),
      el('ol', { class: 'p3-liste p3-plan-liste' }, ...D.map(x => p3PlanSatir(x, y))));
  })));
  return out;
}
function p3PlanSatir(dr, y) {
  const L = p3PlanDersProjeler(dr), n = L.length, sec = dr.tur === 'secmeli';
  const ic = el('span', { class: 'p3-sat-ic' },
    el('span', { class: 'p3-kod-satir' }, p3KodLink(dr.kod, dr.obsNo), el('i', { class: 'p3-tur' + (sec ? ' p3-tur-sec' : '') }, sec ? 'seçmeli' : 'zorunlu'), dr.havuz ? el('i', { class: 'p3-tur p3-tur-havuz' }, String(dr.havuz)) : null),
    el('b', { class: 'p3-ad' }, dr.adTr || dr.ad || dr.kod),
    el('span', { class: 'p3-ders' }, [dr.kredi != null ? dr.kredi + ' kredi' : '', dr.akts != null ? dr.akts + ' AKTS' : '', n ? n + ' proje' : 'proje önerisi derleniyor'].filter(Boolean).join(' · ')));
  if (!n) return el('li', { class: 'p3-sat p3-sat-2 p3-sat-duz p3-plan-sat', 'data-kod': dr.kod }, ic, el('span', { class: 'p3-ok p3-ok-soluk', 'aria-hidden': 'true' }));
  return el('li', {}, el('button', { class: 'p3-sat p3-sat-2 p3-plan-sat', type: 'button', 'data-kod': dr.kod, onclick: () => p3PlanDersAc(dr, y, L) }, ic, p3Ok()));
}
function p3PlanDersAc(dr, y, L) {
  const ad = dr.adTr || dr.ad || dr.kod, sec = dr.tur === 'secmeli';
  const d = { ust: `${y.no}. yarıyıl · ${dr.kod} · ${sec ? 'seçmeli' : 'zorunlu'}`, ustEl: [y.no + '. yarıyıl · ', p3KodLink(dr.kod, dr.obsNo), ' · ' + (sec ? 'seçmeli' : 'zorunlu')], baslik: ad, kisa: (dr.adEn && dr.adEn !== ad) ? dr.adEn : '' };
  p3EkranAc({ ad: dr.kod, onEk: y.no + '. yarıyıl', onEkNo: String(y.no), ozet: { baslik: dr.kod, kisa: kisalt(ad, 120), satirlar: p3Ozet({ tur: 'ders', dersKod: dr.projeKod || dr.kod }, L) }, kur: s => p3E1(s, d, L) });
}
function p3E1(sec, d, liste) {
  const out = [el('p', { class: 'dm-ust' }, d.ustEl || d.ust || ''), el('h3', { id: 'detay-baslik', class: 'dm-baslik p3-baslik', tabindex: -1 }, d.baslik || ''), d.kisa ? el('p', { class: 'dm-kisa p3-yuz' }, d.kisa) : null];
  if (!liste.length) { out.push(el('p', { class: 'p3-not' }, 'Projeler derleniyor.')); return out; }
  out.push(el('ol', { class: 'p3-liste' }, ...liste.map((p, i) => {
    const ds = p.dersler || {}; const biz = (ds.bizim || []).map(x => x && x.kod).filter(Boolean), sen = (ds.senin || []).map(x => x && x.kod).filter(Boolean);
    const dersSatir = [biz.length ? 'bizde ' + biz.join(' · ') : '', sen.length ? 'sizde ' + sen.join(' · ') : ''].filter(Boolean).join('   ');
    const orn = (p.ornekler || []).filter(o => o && o.ad).slice(0, 4);
    const sat = el('button', { class: 'p3-sat', type: 'button', onclick: () => p3ProjeAc(p) },
      el('span', { class: 'p3-no' }, String(i + 1).padStart(2, '0')),
      el('span', { class: 'p3-sat-ic' },
        el('b', { class: 'p3-ad' }, p.ad || ''),
        dersSatir ? el('span', { class: 'p3-ders' }, dersSatir) : null,
        el('span', { class: 'p3-amac' }, p.amac || (p.taban && p.taban.ne) || ''),
        orn.length ? el('ul', { class: 'p3-ornek-mini' }, ...orn.map(o => el('li', {}, o.ad, ' ', el('i', { class: 'p3-tur' }, ORNEK_TUR[o.tur] || o.tur || '')))) : null),
      p3Ok());
    p3ProjeGorsel(p).then(g => { if (g && sat.isConnected) p3SatGorsel(sat, g); });   /* tur 9: sağda 1 küçük görsel (tembel; yoksa yok) */
    return el('li', {}, sat); })));
  return out;
}
async function p3ProjeAc(p) {
  if (!P3 || p3Yukleniyor) return; p3Yukleniyor = true; const S = P3;
  try { const pr = await p3Proje(p); if (P3 !== S) return; p3EkranAc({ ad: kisalt(pr.ad, 28), veri: pr, ozet: p3OzetE2(pr), kur: sec => p3E2(sec, pr) }); }
  finally { p3Yukleniyor = false; }
}
/* ekran özetleri (panel): 2-4 kısa satır */
function p3OzetE2(pr) { const k = p3DersListe(pr).map(x => x.kod); return { baslik: kisalt(pr.ad, 48), kisa: kisalt(pr.amac, 120), satirlar: [pr.ornekler.length ? 'Girişimler ve üniversiteler · ' + pr.ornekler.length + ' örnek' : '', k.length ? 'Ortak dersler · ' + k.join(', ') : '', pr.yapilis.adimlar.length ? 'Yapılış · ' + pr.yapilis.adimlar.length + ' adım' : ''].filter(Boolean) }; }
function p3OzetE3(pr) { return { baslik: 'Girişimler ve üniversiteler', kisa: pr.ornekler.length + ' örnek', satirlar: pr.ornekler.slice(0, 4).map(o => (ORNEK_TUR[o.tur] || o.tur || '') + ' · ' + o.ad) }; }
function p3OzetE3b(pr, o) { const A = o.ayrinti || {}; const g = (P3_OG && p3OGBul(o.url) ? 1 : 0) + ((pr.ornekGorsel[o.ad] || []).length); return { baslik: kisalt(o.ad, 48), kisa: ORNEK_TUR[o.tur] || o.tur || '', satirlar: [kisalt(o.ne, 96), A.neYaptilar ? 'Ne yaptılar · Nasıl · Ne edindiler · Biz nasıl katkı sağlarız' : '', [(A.referanslar || []).length ? (A.referanslar || []).length + ' referans' : '', g ? g + ' görsel' : ''].filter(Boolean).join(' · ')].filter(Boolean) }; }
function p3OzetE4(pr) { const L = p3DersListe(pr); return { baslik: 'Ortak dersler', kisa: L.length + ' ders', satirlar: L.slice(0, 4).map(d => d.kod + (d.ad ? ' · ' + d.ad : '')) }; }
function p3OzetE4b(d, ders) { const F = ((ders && ders.formuller) || []).filter(f => f && f.ad); return { baslik: d.kod, kisa: (ders && ders.ad) || d.ad || '', satirlar: F.length ? F.slice(0, 4).map(f => f.ad) : [kisalt(d.katki, 96) || 'Ders ayrıntısı derleniyor'].filter(Boolean) }; }
function p3OzetE5(pr) { const A = pr.yapilis.adimlar; const kaz = Array.from(new Set(A.flatMap(a => p3Kazanimlar(a).map(k => k.ders)))); return { baslik: 'Yapılış', kisa: A.length + ' adım', satirlar: [kisalt(pr.yapilis.oz, 96), ...A.slice(0, 2).map((a, i) => (i + 1) + '. ' + a.baslik), kaz.length ? 'Kazanımlar: ' + kaz.join(', ') : ''].filter(Boolean).slice(0, 4) }; }
function p3OzetE5b(pr, i) { const A = pr.yapilis.adimlar, a = A[i] || {}; const b = Math.max(0, Math.min(i - 1, A.length - 4)); return { baslik: (i + 1) + '. ' + kisalt(a.baslik, 40), kisa: kisalt(a.oz, 120), satirlar: A.slice(b, b + 4).map((x, j) => (b + j === i ? '▸ ' : '') + (b + j + 1) + '. ' + x.baslik) }; }
function p3OzetE6(L) { return { baslik: 'Görseller', kisa: L.length + ' görsel', satirlar: L.slice(0, 4).map(g => g.alt || g.src) }; }
/* ---- E2 · proje (Faz 2) ---- */
function p3E2(sec, pr) {
  const ornAd = pr.ornekler.slice(0, 3).map(o => o.ad).join(', ');
  const kodlar = p3DersListe(pr).map(x => x.kod);
  const a0 = pr.yapilis.adimlar[0] || null; const oz3 = pr.yapilis.oz || (a0 && (a0.oz || a0.baslik)) || '';
  const parca = (etiket, oz, ac) => el('button', { class: 'p3-parca', type: 'button', onclick: ac }, el('span', { class: 'p3-etiket' }, etiket), el('span', { class: 'p3-parca-oz' }, oz), p3Ok());
  return [p3Baslik(pr.ad), pr.amac ? el('p', { class: 'p3-amac-b' }, pr.amac) : null,
    p3MiniSerit(pr.gorseller),
    el('div', { class: 'p3-parcalar' },
      pr.ornekler.length ? parca('Girişimler ve üniversiteler', ornAd, () => p3EkranAc({ ad: 'Girişimler', veri: pr, ozet: p3OzetE3(pr), kur: s => p3E3(s, pr) })) : null,
      kodlar.length ? parca('Ortak dersler', kodlar.join(' · '), () => p3EkranAc({ ad: 'Ortak dersler', veri: pr, ozet: p3OzetE4(pr), kur: s => p3E4(s, pr) })) : null,
      (oz3 || pr.yapilis.adimlar.length) ? parca('Yapılış', oz3, () => p3EkranAc({ ad: 'Yapılış', veri: pr, ozet: p3OzetE5(pr), kur: s => p3E5(s, pr) })) : null),
    pr.sonuc ? el('p', { class: 'p3-sonuc' }, el('span', { class: 'p3-etiket' }, 'Elde kalan'), pr.sonuc) : null,
    (pr.senden || pr.bizden) ? el('div', { class: 'p3-cipler' }, pr.senden ? el('span', { class: 'p3-cip' }, el('i', {}, 'senden'), pr.senden) : null, pr.bizden ? el('span', { class: 'p3-cip' }, el('i', {}, 'bizden'), pr.bizden) : null) : null,
    pr.taban ? el('p', { class: 'p3-not' }, 'Ayrıntılar derleniyor.') : null];
}
/* ---- E3 · örnekler → E3b · örnek ---- */
/* örneğin görselleri: ornek-gorsel.json ekran görüntüsü (varsa, önce) + gorsel.json → ornekler["<ad>"] */
function p3OrnekGorseller(pr, o) {
  const g = p3OGBul(o.url); const L = (pr.ornekGorsel[o.ad] || []).filter(x => x && x.src);
  return g && !L.some(x => x.src === g.src) ? [{ src: g.src, tur: 'ekran', alt: (g.ad || o.ad) + ' — sayfa görüntüsü', kaynak: o.url, lisans: 'ekran görüntüsü' }, ...L] : L;
}
function p3E3(sec, pr) {
  return [p3Baslik('Girişimler ve üniversiteler'),
    el('ol', { class: 'p3-liste' }, ...pr.ornekler.map(o => { const sat = el('button', { class: 'p3-sat p3-sat-2', type: 'button', onclick: () => p3EkranAc({ ad: kisalt(o.ad, 22), veri: pr, ozet: p3OzetE3b(pr, o), kur: s => p3E3b(s, pr, o) }) },
      el('span', { class: 'p3-sat-ic' }, el('i', { class: 'p3-tur' }, ORNEK_TUR[o.tur] || o.tur || ''), el('b', { class: 'p3-ad' }, o.ad), o.ne ? el('span', { class: 'p3-amac' }, o.ne) : null), p3Ok());
      const g = p3OrnekGorseller(pr, o).find(x => x.poster || !/\.(webm|mp4)(\?|$)/i.test(x.src)); if (g) p3SatGorsel(sat, { src: g.poster || g.src, ad: g.alt || o.ad });   /* tur 9: satırda örnek görseli */
      return el('li', {}, sat); }))];
}
function p3E3b(sec, pr, o) {
  const A = o.ayrinti || null;
  return [p3Baslik(o.ad),
    el('p', { class: 'p3-ust-satir' }, el('i', { class: 'p3-tur' }, ORNEK_TUR[o.tur] || o.tur || ''), o.url ? el('a', { class: 'p3-dis', href: o.url, target: '_blank', rel: 'noopener', title: o.url }, o.ad + ' ↗') : null),
    (!A && o.ne) ? el('p', { class: 'p3-amac-b' }, o.ne) : null,
    A ? el('div', { class: 'p3-bloklar' }, p3Blok('Ne yaptılar', A.neYaptilar), p3Blok('Nasıl yaptılar', A.nasil), p3Blok('Ne edindiler', A.neEdindiler), p3Blok('Biz nasıl katkı sağlarız', A.bizNasilKatki)) : null,
    (A && (A.referanslar || []).filter(r => r && r.url).length) ? el('div', { class: 'p3-blok p3-refler' }, el('span', { class: 'p3-etiket' }, 'Referanslar'), el('ul', { class: 'p3-ref' }, ...A.referanslar.filter(r => r && r.url).map(r => el('li', {}, el('a', { href: r.url, target: '_blank', rel: 'noopener' }, (r.ad || r.url) + ' ↗'), r.tur ? el('i', { class: 'p3-tur' }, r.tur) : null)))) : null,
    p3MiniSerit(p3OrnekGorseller(pr, o))];
}
/* ---- E4 · dersler → E4b · ders ---- */
function p3DersListe(pr) {   /* bizim + senin, kod tekil; projeyeKatki ortakDers'ten */
  const g = new Set(), L = [];
  [['bizde', pr.dersler.bizim], ['sizde', pr.dersler.senin]].forEach(([yan, A]) => (A || []).forEach(x => { if (!x || !x.kod) return; const n = kodNorm(x.kod); if (g.has(n)) return; g.add(n);
    const od = pr.ortakDers.find(o => o && kodNorm(o.kod) === n) || null; L.push({ kod: x.kod, ad: x.ad || '', yan, katki: od ? (od.projeyeKatki || '') : '', od, hazir: pr.dersHazir.includes(n) }); }));
  return L;
}
function p3E4(sec, pr) {
  return [p3Baslik('Ortak dersler'),
    el('ol', { class: 'p3-liste' }, ...p3DersListe(pr).map(d => el('li', {}, el('button', { class: 'p3-sat p3-sat-2', type: 'button', onclick: () => p3DersAc(pr, d) },
      el('span', { class: 'p3-sat-ic' }, el('span', { class: 'p3-kod-satir' }, p3KodLink(d.kod), el('i', { class: 'p3-tur' }, d.yan)), d.ad ? el('b', { class: 'p3-ad' }, d.ad) : null, d.katki ? el('span', { class: 'p3-amac p3-kirp' }, d.katki) : null), p3Ok()))))];
}
async function p3DersAc(pr, d) {
  if (!P3 || p3Yukleniyor) return; p3Yukleniyor = true; const S = P3;
  try { const ders = d.hazir ? await p3Al('ders/' + kodNorm(d.kod)) : null; if (P3 !== S) return; p3EkranAc({ ad: d.kod, veri: pr, ozet: p3OzetE4b(d, ders), kur: s => p3E4b(s, pr, d, ders) }); }
  finally { p3Yukleniyor = false; }
}
function p3E4b(sec, pr, d, ders) {
  const kod = (ders && ders.kod) || d.kod, ad = (ders && ders.ad) || d.ad;
  const out = [el('h3', { class: 'p3-baslik p3-baslik-ders', tabindex: -1 }, p3KodLink(kod, ders && ders.obsNo), el('span', {}, ad))];
  if (!ders) { out.push(el('p', { class: 'p3-not' }, 'Ders ayrıntısı derleniyor.'), p3Blok('Bu projeye katkısı', d.katki)); return out; }   /* taban modu: kod ↗ + ad + tek küçük satır */
  if (ders.ozet) out.push(el('p', { class: 'p3-amac-b' }, ders.ozet));
  if ((ders.neOgrenirsin || []).length) out.push(el('div', { class: 'p3-blok' }, el('span', { class: 'p3-etiket' }, 'Ne öğrenirsin'), el('ul', { class: 'p3-madde' }, ...ders.neOgrenirsin.map(m => el('li', {}, m)))));
  const F = (ders.formuller || []).filter(f => f && f.tex);
  if (F.length) {
    katexYukle().then(K => { if (K) sec.querySelectorAll('[data-tex]').forEach(e => p3TexCiz(e, K)); });
    out.push(el('div', { class: 'p3-blok p3-formuller' }, el('span', { class: 'p3-etiket' }, 'Formüller'), ...F.map(f => {
      const fk = ((d.od && d.od.formulKullanimi) || []).find(x => x && x.formulAd === f.ad);
      return el('div', { class: 'p3-formul' }, el('b', { class: 'p3-formul-ad' }, f.ad || ''),
        el('div', { class: 'p3-tex', 'data-tex': f.tex, 'data-display': '1' }, el('code', {}, f.tex)),
        (f.terimler || []).length ? el('table', { class: 'p3-terim' }, el('tbody', {}, ...f.terimler.filter(t => Array.isArray(t) && t.length).map(t => el('tr', {}, el('td', { class: 'p3-tex-i', 'data-tex': t[0] }, el('code', {}, t[0])), el('td', {}, t[1] || ''), el('td', { class: 'p3-birim' }, t[2] || ''))))) : null,
        p3Blok('Sade anlatım', f.sade), p3Blok('Gerçek örnek', f.ornek), p3Blok('Bu projede nerede', (fk && fk.nerede) || f.nerede)); })));
  }
  out.push(p3Blok('Bu projeye katkısı', d.katki), p3MiniSerit((ders.gorseller || []).filter(g => g && g.src)));
  return out;
}
/* ---- E5 · yapılış → E5b · adım ---- */
function p3E5(sec, pr) {
  const Y = pr.yapilis, A = Y.adimlar;
  return [p3Baslik('Yapılış'), Y.oz ? el('p', { class: 'p3-oz-buyuk' }, Y.oz) : null, Y.ayrinti ? el('p', { class: 'p3-amac-b' }, Y.ayrinti) : null,
    A.length ? el('ol', { class: 'p3-liste' }, ...A.map((a, i) => Y.hazir
      ? el('li', {}, el('button', { class: 'p3-sat', type: 'button', onclick: () => p3AdimAc(pr, i) }, el('span', { class: 'p3-no' }, String(i + 1).padStart(2, '0')), el('span', { class: 'p3-sat-ic' }, el('b', { class: 'p3-ad' }, a.baslik || ''), a.oz ? el('span', { class: 'p3-amac' }, a.oz) : null, p3AdimMeta(a)), p3Ok()))
      : el('li', { class: 'p3-sat p3-sat-duz' }, el('span', { class: 'p3-no' }, String(i + 1).padStart(2, '0')), el('span', { class: 'p3-sat-ic' }, el('span', { class: 'p3-ad' }, a.baslik || ''))))) : null];   /* taban: satır tıklanmaz, › yok */
}
/* tur 9: E5 satırında küçük meta — "n alt madde · kazanım: MTO 302, BLG 202E" */
function p3AdimMeta(a) { const n = (a.nasil || []).length, K = Array.from(new Set(p3Kazanimlar(a).map(k => k.ders))); const m = [n ? n + ' alt madde' : '', K.length ? 'kazanım: ' + K.join(', ') : ''].filter(Boolean).join(' · '); return m ? el('span', { class: 'p3-adim-meta' }, m) : null; }
/* tur 9: alt adım satırları. Dizge → düz madde. Nesne → tıklanabilir satır: önce yalnız 'teknik'; basınca altında 'sade' + numaralı altAdimlar + kazanım çipi (ders kodu ↗ OBS). Hepsi birden açılabilir; aria-expanded. */
function p3Nasil(a) {
  const L = (a.nasil || []).filter(x => x); if (!L.length) return null;
  return el('div', { class: 'p3-blok p3-nasil-blok' }, el('span', { class: 'p3-etiket' }, 'Alt adımlar'), el('ol', { class: 'p3-alt-adim' }, ...L.map(x => {
    if (typeof x !== 'object') return el('li', {}, String(x));
    const id = 'p3n-' + rastgele(); const k = x.kazanim && x.kazanim.ders ? x.kazanim : null;
    const ac = el('div', { class: 'p3-nasil-ac', id, hidden: true },
      x.sade ? el('p', { class: 'p3-nasil-sade' }, x.sade) : null,
      (x.altAdimlar || []).length ? el('ol', { class: 'p3-nasil-alt' }, ...x.altAdimlar.map(y => el('li', {}, y))) : null,
      k ? el('p', { class: 'p3-kazanim' }, p3KodLink(k.ders), ' dersindeki ', el('q', {}, k.madde || ''), ' bilgisiyle') : null);
    const b = el('button', { class: 'p3-nasil-b', type: 'button', 'aria-expanded': 'false', 'aria-controls': id }, el('span', { class: 'p3-nasil-t' }, x.teknik || ''), el('span', { class: 'p3-ok p3-ok-k', 'aria-hidden': 'true' }));
    const li = el('li', { class: 'p3-nasil' }, b, ac);
    b.addEventListener('click', () => { const acik = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!acik)); ac.hidden = acik; li.classList.toggle('acik', !acik); durum.etkilesim++; });
    return li; })));
}
function p3AdimAc(pr, i) { p3EkranAc({ ad: (i + 1) + '. ' + kisalt(pr.yapilis.adimlar[i].baslik, 20), veri: pr, ozet: p3OzetE5b(pr, i), kur: s => p3E5b(s, pr, i) }); }
function p3E5b(sec, pr, i) {
  const A = pr.yapilis.adimlar, a = A[i] || {};
  const degistir = k => {   /* önceki/sonraki adım: yığında yer değiştirir (replaceState, aynı derinlik) */
    const j = i + k; if (j < 0 || j >= A.length || !P3) return; const S = P3, e = S.ekranlar[S.ekranlar.length - 1];
    p3Videolar(e.el, false); e.ad = (j + 1) + '. ' + kisalt(A[j].baslik, 20); e.ozet = p3OzetE5b(pr, j); e.el.replaceChildren(...p3E5b(e.el, pr, j).filter(Boolean));
    try { history.replaceState({ tkDetay: 1, p3: S.ekranlar.length, id: pr.id }, ''); } catch (err) { }
    p3KirintiCiz(); S.D.scrollTop = 0; p3Odakla(); p3PanelGuncelle(); p3Videolar(e.el, true); durum.etkilesim++; };
  const K = p3Kazanimlar(a);
  return [p3Baslik((i + 1) + '. ' + (a.baslik || '')), a.oz ? el('p', { class: 'p3-oz-buyuk' }, a.oz) : null, a.ayrinti ? el('p', { class: 'p3-amac-b' }, a.ayrinti) : null,
    p3Nasil(a),
    K.length ? el('div', { class: 'p3-blok' }, el('span', { class: 'p3-etiket' }, 'Dayandığı kazanımlar'), el('ul', { class: 'p3-madde p3-kazanimlar' }, ...K.map(k => el('li', {}, p3KodLink(k.ders), ' · ', k.madde || '')))) : null,
    p3MiniSerit(pr.adimGorsel[String(i + 1)]),
    el('div', { class: 'p3-adim-gez' }, i > 0 ? el('button', { class: 'p3-gez', type: 'button', onclick: () => degistir(-1) }, '‹ önceki adım') : el('span'), i < A.length - 1 ? el('button', { class: 'p3-gez', type: 'button', onclick: () => degistir(1) }, 'sonraki adım ›') : null)];
}
/* ---- E6 · galeri + büyütme ---- */
function p3Kunye(g) { const P = [g.kaynak ? el('a', { href: g.kaynak, target: '_blank', rel: 'noopener', onclick: e => e.stopPropagation() }, 'kaynak ↗') : null, g.lisans || null, g.yazar || null].filter(Boolean); return P.length ? el('span', { class: 'p3-kunye' }, ...P.flatMap((x, j) => j ? [' · ', x] : [x])) : null; }
function p3E6(sec, L) {
  return [p3Baslik('Görseller'), el('div', { class: 'p3-galeri' }, ...L.map((g, i) => el('figure', { class: 'p3-kutu' },
    el('div', { class: 'p3-kutu-m' }, p3Medya(g, true, true), el('button', { class: 'p3-buyut', type: 'button', 'aria-label': (g.alt || 'görsel') + ' — büyüt', onclick: () => p3Buyuk(L, i) })),
    el('figcaption', {}, g.alt ? el('span', { class: 'p3-alt' }, g.alt) : null, p3Kunye(g)))))];
}
function p3Buyuk(L, i) {   /* dialog içinde fixed katman (top layer); history'ye basamak eklemez; ‹ › ile gezinme, Esc / arka plan kapatır */
  const S = P3; if (!S) return; p3BuyukKapat();
  const acan = KOK.activeElement ?? document.activeElement;
  const govde = el('div', { class: 'p3-buyuk-ic' }), alt = el('p', { class: 'p3-buyuk-alt' });
  const kapat = el('button', { class: 'p3-buyuk-kapat', type: 'button', 'aria-label': 'kapat', onclick: () => p3BuyukKapat() }, '✕');
  const onc = el('button', { class: 'p3-buyuk-gez p3-onceki', type: 'button', 'aria-label': 'önceki', onclick: () => gez(-1) }, '‹'), snr = el('button', { class: 'p3-buyuk-gez p3-sonraki', type: 'button', 'aria-label': 'sonraki', onclick: () => gez(1) }, '›');
  let n = i;
  const ciz = () => { const g = L[n]; const m = p3Medya(g, true, true); govde.replaceChildren(m); alt.replaceChildren(g.alt || '', p3Kunye(g)); const v = m.tagName === 'VIDEO' ? m : (m.querySelector && m.querySelector('video')); if (v) { const p = v.play(); if (p && p.catch) p.catch(() => { }); } onc.hidden = snr.hidden = L.length < 2; };
  const gez = k => { n = (n + k + L.length) % L.length; ciz(); };
  const kap = el('div', { class: 'p3-buyuk', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'görsel büyütme' }, kapat, onc, govde, snr, alt);
  kap.addEventListener('click', e => { if (e.target === kap || e.target === govde) p3BuyukKapat(); });
  S.D.append(kap); S.buyuk = { kap, acan, gez }; ciz(); requestAnimationFrame(() => kapat.focus({ preventScroll: true }));
}
function p3BuyukKapat() { if (!P3 || !P3.buyuk) return false; const b = P3.buyuk; P3.buyuk = null; b.kap.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) { } }); b.kap.remove(); if (b.acan && b.acan.focus) { try { b.acan.focus({ preventScroll: true }); } catch (e) { } } return true; }
