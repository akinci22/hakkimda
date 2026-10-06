/* /takim/ v3 — tek dosya, derleme yok.
   Bölümler: yardımcılar · arka uç (yerel/Firebase) · veri · etkileşim çekirdeği (sözlük, ipucu, panel, detay) · render · süsler (ray, imleç, yumuşak kaydırma). */
/* içkin mod (ana sayfa): takim/ic.js bu dosyayı window.TAKIM_IC = {kok: gölge kök, host: #takim-ic, govde: .govde} ile içe aktarır.
   O zaman sorgular gölge kökte çalışır, durum sınıfları host'a yazılır, yollar takim/ önekli olur; ray/panel/imleç/yumuşak tekerlek kapalıdır. Bağımsız /takim/ sayfasında IC null. */
const IC = window.TAKIM_IC || null;
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
async function yukle() {
  await Promise.all(['anket', 'metinler', 'kufur', 'bolumler', 'sayilar', 'takimlar', 'gercekcilik', 'karne', 'sozluk'].map(async a => { try { veri[a] = await (await fetch(`${TABAN}veri/${a}.json?v=10`)).json(); } catch (e) { veri[a] = null; } }));
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
function panelNot(baslik, kisa, uzun, ipucu) {
  const pn = $('#p-not'); if (!pn) return; pn.classList.add('canli'); pn.querySelector('.panel-ust').textContent = 'Not · ' + (baslik || '');
  $('#p-not-m').textContent = kisa || ''; const U = $('#p-not-uzun'); U.replaceChildren(...maddeler(uzun, 3).map(p => el('p', { class: 'md' }, p)));
  const ip = $('#p-not-ip'); if (ip) ip.hidden = !ipucu;
  if (dokunmatik || innerWidth < 1180) { const A = $('#alt-not'); if (A && !ipucu) { $('#alt-not-b').textContent = baslik || ''; $('#alt-not-m').textContent = kisa || ''; A.hidden = false; clearTimeout(A._z); A._z = setTimeout(() => { A.hidden = true; }, 6000); } }
}
function ipucuGoster(baslik, metin, x, y) {
  const k = $('#ipucu'); k.replaceChildren(el('b', {}, baslik), metin); k.hidden = false;
  const w = Math.min(320, innerWidth - 24); let lx = x + 18, ly = y + 18; if (lx + w > innerWidth - 8) lx = x - w - 18; if (ly + 140 > innerHeight) ly = y - 150;
  const g = IC ? GOVDE.getBoundingClientRect() : { left: 0, top: 0 }; k.style.left = (Math.max(8, lx) - g.left) + 'px'; k.style.top = (Math.max(8, ly) - g.top) + 'px';   /* içkin: gövdeye göre (host contain:paint → fixed çalışmaz) */
  panelNot(baslik, metin, '', false);
}
const NOT_VARSAYILAN = ['Not · üzerine gel', 'Altı noktalı terimlere, kartlara ve ray üstündeki seviyelere gelince açıklaması burada belirir.'];
let notZ; function notSifirla() { clearTimeout(notZ); notZ = setTimeout(() => { const pn = $('#p-not'); if (!pn || pn.classList.contains('canli')) return; pn.querySelector('.panel-ust').textContent = NOT_VARSAYILAN[0]; $('#p-not-m').textContent = NOT_VARSAYILAN[1]; $('#p-not-uzun').replaceChildren(); const ip = $('#p-not-ip'); if (ip) ip.hidden = true; }, 6000); }
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
  const pan = (!IC && vw >= 1180) ? $('.panel') : null, sag = pan ? pan.getBoundingClientRect().left : vw;   /* bağımsız sayfada sağ panelin üstüne yazılmaz */
  const ub = $('.ust') ? $('.ust').getBoundingClientRect() : null, U = Math.max(0, ub && ub.top < 4 ? ub.bottom : 0);   /* yapışkan aşama çubuğunun altına yerleşir, üstüne binmez */
  const B = 36, cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, genis = Math.min(980, sag - 2 * B);
  const bolge = [
    { ad: 'sag', w: sag - r.right - 2 * B, h: vh - U - 2 * B, x: r.right + B, yan: true },
    { ad: 'sol', w: r.left - 2 * B, h: vh - U - 2 * B, x: B, yan: true },
    { ad: 'alt', w: genis, h: vh - r.bottom - 2 * B, y: r.bottom + B },
    { ad: 'ust', w: genis, h: r.top - U - 2 * B, y: U + B },
  ].map(b => Object.assign(b, { puan: Math.max(0, b.w) * Math.max(0, b.h) * (b.w < 300 || b.h < 160 ? .15 : 1) * (b.yan && b.w >= 380 ? 1.6 : 1) })).sort((a, b) => b.puan - a.puan)[0];
  k.style.setProperty('--oy', bolge.w < 400 ? '.74' : bolge.w < 540 ? '.86' : '1');   /* dar bölgede punto biraz küçülür, yine büyük */
  k.style.width = Math.max(220, bolge.w) + 'px'; k.style.maxHeight = Math.max(120, bolge.h) + 'px';
  const kh = k.offsetHeight, kw = k.offsetWidth; let x, y;
  if (bolge.yan) { x = bolge.x; y = Math.max(U + B, Math.min(Math.max(U + B, cy - kh / 2), vh - B - kh)); }
  else { x = Math.min(Math.max(B, cx - kw / 2), sag - B - kw); y = bolge.ad === 'alt' ? bolge.y : Math.max(U + B, r.top - B - kh); }
  k.style.left = (x - g.left) + 'px'; k.style.top = (y - g.top) + 'px';
}
function odakGoster(e, d, goster = true) {
  if (dokunmatik || azalt) return;
  clearTimeout(odakTemiz); odakEl = e; const k = odakKutu();
  k.querySelector('.oy-ust').textContent = d.ust || ''; k.querySelector('.oy-baslik').textContent = d.baslik || ''; k.querySelector('.oy-kisa').textContent = d.kisa || '';
  k.querySelector('.oy-uzun').replaceChildren(...maddeler(d.uzun, 4).map(p => el('p', { class: 'md' }, p)));
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
addEventListener('scroll', () => { if (odakEl) { GOVDE.classList.remove('odak', 'odak-son'); odakEl.classList.remove('odakli'); odakGizle(); } }, { passive: true });   /* kaydırmada odak biter: tam ekran blur kaydırma karelerini yemesin */
/* kart etkileşimi: üzerinde dur → kararır + arka plan bulanır + "ne öğrenirsin" satırı; tıkla → ayrıntı (sayfa gibi döner) */
let odakZ, odakZ2, odakBirak;
function etkilesim(e, al) {
  e.classList.add('etk'); if (!e.querySelector('.etk-ipucu')) e.append(el('span', { class: 'etk-ipucu' }, dokunmatik ? 'dokun: uzun hâli' : 'tıkla: uzun hâli · bekle: karar')); if (!e.querySelector('.etk-roz')) e.append(el('span', { class: 'etk-roz', 'aria-hidden': 'true' }));   /* sözsüz işaret: köşede açılır-ok (›), yazı yok */
  if (dokunmatik && !e.querySelector('.etk-on')) { try { const d = al(); const ilk = cumleler(String(d.uzun || '').replace(/\n+/g, ' ')).find(c => !/^(Kaynak|Güven)\s*:/i.test(c)) || ''; const cek = ilk.replace(/^[^:]{0,24}:\s*/, '').slice(0, 30); if (ilk && ilk !== d.kisa && !e.textContent.includes(cek)) e.append(el('span', { class: 'etk-on' }, ilk.length > 120 ? ilk.slice(0, 117).replace(/\s\S*$/, '') + '…' : ilk)); } catch (err) { } }   /* dokunmadan bilgi: ayrıntının ilk cümlesi kartta */
  if (!dokunmatik && !azalt) {
    /* Akın 6 Eki: beklerken yalnız kararma; kararma bitince çok hızlı bulanıklık + yazı. Kartlar arası geçişte perde sönmez, yazı anında değişir (kasma/yanıp sönme yok). */
    e.addEventListener('pointerenter', () => { clearTimeout(odakZ); clearTimeout(odakZ2); clearTimeout(odakBirak); clearTimeout(notZ); const d = al(); panelNot(d.baslik, d.kisa, d.uzun, true);
      $$('.odakli').forEach(x => { if (x !== e) x.classList.remove('odakli'); });
      if (GOVDE.classList.contains('odak-son')) { e.classList.add('odakli'); odakGoster(e, d); return; }
      odakZ = setTimeout(() => { GOVDE.classList.add('odak'); e.classList.add('odakli'); odakGoster(e, d, false); }, 300);
      odakZ2 = setTimeout(() => { GOVDE.classList.add('odak-son'); const k = $('#odak-yazi'); if (k && odakEl === e) k.classList.add('acik'); }, 1350); });
    e.addEventListener('pointerleave', () => { clearTimeout(odakZ); clearTimeout(odakZ2); const pn = $('#p-not'); if (pn) pn.classList.remove('canli'); notSifirla();
      odakBirak = setTimeout(() => { GOVDE.classList.remove('odak', 'odak-son'); e.classList.remove('odakli'); odakGizle(); }, 220); });
  }
  if (!azalt && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { e.classList.add('kesfet'); io.disconnect(); } }, { threshold: .6 }); io.observe(e); }
  e.addEventListener('click', ev => { if (ev.target.closest('a,input,select,textarea,.cip,.oy,.sec')) return; kocKapat(); detayAc(al()); });
  e.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target === e) detayAc(al()); });
}
/* ayrıntı = zihin haritası: ortada tıklanan kart (kök), çevresinde dallar; dala tıkla → açılır, cümleleri alt budak olur; köke tıkla → geri */
const cumleler = t => String(t || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?…])\s+(?=[A-ZÇĞİÖŞÜ0-9"(])/).filter(Boolean);
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
  const par = String(d.uzun || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
  const kay = [...(d.kaynaklar || []), ...(d.link ? [{ ad: d.linkAd || 'bağlantı →', url: d.link }] : [])].filter(k => k && k.url);
  const dallarL = Array.isArray(d.dallar) ? d.dallar : [];
  H.append(el('div', { class: 'dm-ic' },
    el('p', { class: 'dm-ust' }, d.ust || ''),
    el('h3', { id: 'detay-baslik', class: 'dm-baslik' }, d.baslik || ''),
    d.kisa ? el('p', { class: 'dm-kisa' }, d.kisa) : null,
    par.length ? el('div', { class: 'dm-uzun' }, ...par.map((p, i) => el('p', { style: `--g:${200 + i * 80}ms` }, p))) : null,
    dallarL.length ? el('ol', { class: 'dm-dal' }, ...dallarL.map(b => el('li', {}, el('b', {}, b.baslik), (b.alt || []).length ? ' ' + b.alt.join(' ') : ''))) : null,
    kay.length ? el('p', { class: 'dm-kaynak' }, el('span', {}, kay.length > 1 ? 'Kaynaklar: ' : 'Kaynak: '), ...kay.flatMap((k, i) => [i ? ' · ' : '', el('a', { href: yol(k.url), target: /^https?:/.test(k.url) ? '_blank' : null, rel: 'noopener', onclick: k.url.startsWith('#') ? (e) => { e.preventDefault(); D.close(); git(k.url.slice(1)); } : null }, k.ad || k.url)])) : null,
    el('button', { class: 'detay-alt', type: 'button', onclick: () => D.close() }, '✕ Kapat')));
  terimSar(H); durum.etkilesim++;
  D.classList.add('metin'); D.classList.toggle('dar', innerWidth < 860); D.scrollTop = 0; D._ciz = null;
  if (typeof D.showModal === 'function') { if (!D.open) D.showModal(); } else D.setAttribute('open', '');
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
  if (typeof D.showModal === 'function') { if (!D.open) D.showModal(); } else D.setAttribute('open', '');
  requestAnimationFrame(() => requestAnimationFrame(cizgiler));
  D._ciz = cizgiler;
}
const DETAYLAR = {
  skewt: { ust: 'nasıl okunur', baslik: 'Skew-T diyagramı', kisa: 'Sondajın resmi: basınç yukarı doğru azalır, sıcaklık ekseni 45° eğiktir.', uzun: `Kırmızı çizgi sıcaklık (T), yeşil çizgi çiy noktası (Td). İkisi birbirine yaklaşınca hava doymuş, bulut var demektir; 28 Nisan'da 850 hPa civarında tam bu oluyor. Kesikli çizgiler Ömer'in Python'da adım adım (Runge-Kutta) kurduğu profil; düz çizgiler Kartal'dan kalkan gerçek radyosonde. Fark, dersteki denklemin doymuş hava varsayımından geliyor.\nSayfanın kendisi de bu diyagramdır: soldaki ray basınç ekseni, balon senin konumun, sağdaki panel okumalar.`, link: '../#arastirma', linkAd: 'Bulut projesinin tamamı →' },
  daniel: { ust: 'vaka', baslik: 'Storm Daniel ve İstanbul seli', kisa: '5-6 Eylül 2023: Başakşehir ve Küçükçekmece\'de saatte 100 mm\'yi aşan yağış, can kaybı.', uzun: 'Yunanistan üzerinde kesilmiş bir alçak basınç (cut-off low) günlerce yerinde kaldı; Teselya\'ya rekor yağış bıraktı, sonra Libya\'da Derne barajlarını yıktı. İstanbul\'daki sel aynı sistemin kuzeydoğu kanadında, Marmara üstünde gelişen konvektif hücrelerden geldi.\nSorumuz: yüksek çözünürlüklü bir hava tahmini bu yağışı nerede ve ne kadar yanlış koydu; olasılıklı düzeltme ve yapay zekâ bu hatayı ne kadar azaltır. Uydu kareleri NASA Worldview\'den, kamu malı.' },
  grid: { ust: 'neden önemli', baslik: '28 km\'lik kutu', kisa: 'Küresel model İstanbul\'u 50 kutuya böler ve her kutuya tek bir değer verir.', uzun: 'Boğaz, tepeler, deniz etkisi, şehir ısı adası: hepsi tek kutunun içinde kaybolur. Model Ayazağa ile Kadıköy\'e aynı sıcaklığı verebilir. Bu yüzden "tahmin düzeltme" diye bir iş var: kutunun değerini o kutudaki gerçek istasyonlara göre düzeltmek.\nBasamak 1\'de bu kutu için günlük hatayı ölçüyoruz; basamak 2-4\'te düzeltiyoruz. Yapay zekâ modelleri (GraphCast, AIFS) de aynı 0,25° gridde çalışır; onların da düzeltmeye ihtiyacı var.' }
};

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
  const v = $('#acilis-vaat'); if (v) v.textContent = M.vaat || '';
  const al = $('#acilis-alt'); if (al) al.textContent = M.alt || '';
  const ip = $('#acilis-ipucu'); if (ip && M.ipucu) ip.textContent = M.ipucu;
  const bn = $('#balon-not'); if (bn) bn.textContent = M.balonNot || '';   /* hPa metaforu bir kez, açılışta açıklanır */
  const Z = M.zaman || M.sayilar || [];
  $('#acilis-sayilar').replaceChildren(...Z.map(s => { const d = el('button', { class: 'sayi', type: 'button' }, el('b', {}, s.s), el('span', {}, s.e)); if (s.detay) etkilesim(d, () => ({ ust: 'ne kadar zaman', baslik: s.s + ' · ' + s.e, kisa: s.e, uzun: s.detay })); return d; }));
  const A = $('#arananlar'); if (A && Array.isArray(M.arananlar)) {   /* ilk 7 bölüm görünür, kalanı tek düğmeyle açılır (telefonda 3-4 satır tutmasın) */
    const cip = a => el('button', { class: 'ar', type: 'button', 'data-k': a.k, onclick: () => bolumeGit(a.k) }, a.ad);
    const ilk = M.arananlar.slice(0, 7), kalan = M.arananlar.slice(7);
    const daha = kalan.length ? el('button', { class: 'ar ar-daha', type: 'button', 'aria-expanded': 'false', onclick: (e) => { e.currentTarget.replaceWith(...kalan.map(cip)); } }, `+${kalan.length} bölüm`) : null;
    A.replaceChildren(el('span', { class: 'ar-ust' }, M.arananBaslik || 'Aranıyor:'), ...ilk.map(cip), daha); }
  girisKur();
  $$('figure[data-detay]').forEach(f => etkilesim(f, () => DETAYLAR[f.dataset.detay]));
}
/* kitle: "meteorolojide okuyorum / başka bölümdeyim" — ton aynı; bölüm kartlarının sırası, atölyelerin açıklığı ve 5 soru seti değişir */
function girisKur() {
  const G = veri.metinler.giris, S = $('#giris-sec'); if (!G || !S) { const g = $('#giris'); if (g) g.hidden = true; return; }
  $('#giris-soru').textContent = G.soru || '';
  S.replaceChildren(...G.secenekler.map(o => el('button', { class: 'giris-b', type: 'button', role: 'radio', 'aria-checked': String(durum.kitle === o.id), 'data-id': o.id, onclick: () => kitleSec(o.id) }, el('b', {}, o.etiket), o.alt ? el('span', {}, o.alt) : null)));
}
let testSetSec = null;
function kitleSec(id, sessiz) {
  durum.kitle = id; ls('takim-kitle', id); KOKEL.dataset.kitle = id;
  $$('.giris-b').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === id)));
  katliAyarla('anlatilar', id === 'mto' || !!KIME);
  bolumler();
  if (testSetSec && durum.test.toplam === 0) testSetSec(id === 'dis' ? 'misafir' : 'mto');
  if (!sessiz) { durum.etkilesim++; setTimeout(() => git(id === 'dis' ? 'bolumler' : 'olay'), 250); }
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
  ['merdiven', 'anlatilar', 'derin'].forEach(g => { const b = $(`#${g}-ac`); if (b) b.addEventListener('click', () => { const ac = b.getAttribute('aria-expanded') !== 'true'; katliAyarla(g, ac); durum.etkilesim++; }); });
  katliAyarla('derin', !!KIME); katliAyarla('merdiven', !!KIME); katliAyarla('anlatilar', !!KIME || durum.kitle === 'mto');
}
/* resmî görünüm: KHŞM ve hocalar için kuruluş özeti (yalnız ?kime=… ile görünür) */
function resmi() {
  const R = veri.metinler.resmi, H = veri.metinler.hoca; if (!KIME || !R || !$('#resmi')) return;
  $('#resmi-baslik').textContent = R.baslik || ''; $('#resmi-alt').textContent = R.alt || '';
  $('#resmi-satirlar').replaceChildren(...(R.satirlar || []).flatMap(x => [el('dt', {}, x.k), el('dd', {}, yerDoldur(x.m))]));
  if (H) { $('#hoca-baslik').textContent = H.baslik || ''; $('#hoca-alt').textContent = H.alt || ''; $('#hoca-maddeler').replaceChildren(...(H.maddeler || []).map(x => el('li', {}, x))); }
}
function olay() {
  const O = veri.metinler.olay; if (!O) return; $('#olay-baslik').textContent = O.baslik;
  $('#olay-kartlar').replaceChildren(...O.satirlar.map(s => { const k = el('button', { class: 'olay-k', type: 'button' }, el('span', { class: 'k' }, s.k), el('p', { class: 'm' }, s.m)); etkilesim(k, () => ({ ust: 'olay ne · ' + s.k, baslik: s.k, kisa: s.m, uzun: s.detay })); return k; }));
}
function sana() {
  const S = veri.metinler.sana; if (!S || !$('#sana-kartlar')) return; $('#sana-baslik').textContent = S.baslik; $('#sana-alt').textContent = S.alt;
  $('#sana-kartlar').replaceChildren(...S.kartlar.map(k => { const b = el('button', { class: 'sana-k', type: 'button' }, el('span', { class: 'k' }, k.k), el('span', { class: 'bolum' }, k.bolum), el('p', { class: 'm' }, k.m), el('p', { class: 'kazanc' }, '→ ' + k.kazanc), el('span', { class: 'devam' }, 'tıkla → örnek görevler, neden burası, yük')); etkilesim(b, () => ({ ust: 'sana ne var · ' + k.bolum, baslik: k.k, kisa: k.m, uzun: k.detay })); return b; }));
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
}
function grupSec(id) { durum.grup = id; ls('takim-grup', id); KOKEL.dataset.grup = id; $$('.kapi').forEach(k => k.setAttribute('aria-checked', String(k.dataset.id === id))); sonKart(); panelSen(); durum.etkilesim++; }
function vizyon() {
  const V = veri.metinler.vizyon;
  const kv = el('div', { class: 'kart kart-vurgu' }, el('b', {}, V.vizyon.b), el('p', {}, V.vizyon.m)); etkilesim(kv, () => ({ ust: 'olay ne', baslik: V.vizyon.b, kisa: V.vizyon.m, uzun: V.vizyon.detay }));
  const km = el('div', { class: 'kart' }, el('b', {}, V.misyon.b), el('p', {}, V.misyon.m)); etkilesim(km, () => ({ ust: 'olay ne', baslik: V.misyon.b, kisa: V.misyon.m, uzun: V.misyon.detay }));
  $('#vizyon-kartlar').replaceChildren(kv, km);
  $('#kollar').replaceChildren(...V.kollar.map(k => { const e = el('div', { class: 'kart' }, el('b', {}, k.b), el('p', {}, k.m)); etkilesim(e, () => ({ ust: 'iki kol', baslik: k.b, kisa: k.m, uzun: [k.detay, k.hirsli ? 'Daha çok istiyorsan: ' + k.hirsli : '', k.rahat ? 'Az vaktin varsa: ' + k.rahat : ''].filter(Boolean).join('\n') })); return e; }));   /* v2: kart yüzünde iki ses yok, ayrıntıda */
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
  $('#basamaklar').replaceChildren(...M.basamaklar.map((b, i) => { const e = el('button', { class: 'bs', type: 'button', role: 'tab', 'aria-selected': 'false', 'data-i': i, onclick: () => basamakSec(i) }, el('span', { class: 'n' }, '0' + b.n), el('span', { class: 'ad' }, b.b), el('span', { class: 'z' }, b.zaman)); ipucuBagla(e, () => ({ baslik: b.b, metin: b.kavram + ' · ' + b.video })); return e; }));
  basamakSec(0, true);
  if (!azalt && 'IntersectionObserver' in window) { let acilan = 0; const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; const t = setInterval(() => { const r = svg.querySelector(`.md-basamak[data-i="${acilan}"]`); if (!r) { clearInterval(t); return; } r.classList.add('acik'); acilan++; }, 140); io.disconnect(); }, { threshold: .4 }); io.observe(svg); } else $$('.md-basamak', svg).forEach(r => r.classList.add('acik'));
}
function basamakSec(i, sessiz) {
  const b = veri.metinler.merdiven.basamaklar[i]; if (!b) return;
  $$('.bs').forEach(x => x.setAttribute('aria-selected', String(+x.dataset.i === i))); $$('.md-basamak').forEach(x => x.classList.toggle('secili', +x.dataset.i === i));
  const fig = $('#md-figur'); if (fig) fig.setAttribute('transform', `translate(${10 + i * 96 + 70},${300 - (i + 1) * 44})`);
  const D = $('#basamak-detay');
  D.replaceChildren(el('h3', {}, `0${b.n} · ${b.b}`), ...[['kavram', b.kavram], ['video', b.video], ['dayanak', b.ref], ['zaman', b.zaman]].map(([k, v]) => el('div', { class: 'bd-satir' }, el('span', {}, k), el('span', {}, v))), b.detay ? el('p', { class: 'bd-uzun' }, b.detay) : null, ses(b.hirsli, b.rahat));
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
  const medya = (m) => { if (!m) return null; if (m.tip === 'video') return el('div', { class: 'medya' }, el('video', { src: yol(m.src), poster: yol(m.poster), autoplay: true, muted: true, loop: true, playsinline: true, preload: 'metadata', 'aria-label': m.alt || '' }));
    if (m.tip === 'serit') return el('div', { class: 'medya serit' }, ...m.src.map(s => el('img', { src: yol(s), alt: '', loading: 'lazy', decoding: 'async' }))); return el('div', { class: 'medya' }, el('img', { src: yol(m.src), alt: m.alt || '', loading: 'lazy', decoding: 'async' })); };
  $('#mumkun-kartlar').replaceChildren(...M.kartlar.map(k => { const e = el('div', { class: 'kart', tabindex: 0 }, medya(k.medya), el('b', {}, k.b), el('p', {}, k.m), k.ref ? el('a', { class: 'ref', href: yol('../' + k.ref) }, 'portfolyoda gör →') : null); etkilesim(e, () => ({ ust: 'neden mümkün', baslik: k.b, kisa: k.m, uzun: k.detay, link: k.ref ? yol('../' + k.ref) : null, linkAd: 'portfolyoda gör →' })); return e; }));
  const vids = $$('#mumkun-kartlar video'); vids.forEach(v => { v.muted = true; });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(x => { const v = x.target; if (x.isIntersecting) { v.play && v.play().catch(() => { }); } else v.pause(); }), { rootMargin: '0px', threshold: .15 }); vids.forEach(v => io.observe(v)); } else vids.forEach(v => v.play && v.play().catch(() => { }));   /* ekran dışı klip oynamaz */
}
const BULUTLAR = [['g20', 'Cirrus uncinus · 20 Nis'], ['g15', 'Altocumulus · 15 Nis'], ['g28', 'Cumulus humilis · 28 Nis'], ['g13', 'Altostratus · 13 Nis'], ['g16', 'Stratus · 16 Nis'], ['g03', 'Nimbostratus · 3 May']];
function deste() {
  const K = veri.anket.kaydir; $('#kaydir-baslik').textContent = K.baslik; $('#kaydir-mizah').textContent = K.mizah_giris;
  const D = $('#deste'); const kartlar = [...K.kartlar]; let i = 0;
  const ciz = () => {
    D.replaceChildren();
    if (i >= kartlar.length) { const y = durum.eslesme.toplam ? Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam) : 0; D.append(el('div', { class: 'deste-bitti' }, el('b', { class: 'eslesme' }, `Eşleşme: %${y}`), el('span', {}, K.son.baslik), el('span', { class: 'not' }, y >= 70 ? 'Süper eşleşme. Bu bir tanışma uygulaması olsa şu an bildirim gelirdi.' : y >= 40 ? 'Makul. Ortada buluşuruz.' : 'Zor bir kitlesin; tam da videoları senin için çekiyoruz.'))); $('#dg-evet').disabled = $('#dg-hayir').disabled = true; sonKart(); panelSen(); return; }
    for (let j = Math.min(i + 2, kartlar.length - 1); j >= i; j--) {
      const k = kartlar[j]; const derin = j - i; const bulut = BULUTLAR[j % BULUTLAR.length];
      const c = el('article', { class: 'kartd', style: `transform:translateY(${derin * 10}px) scale(${1 - derin * .04});z-index:${10 - derin};background-image:url('${yol('../g/bulut/')}${bulut[0]}.jpg')`, 'aria-hidden': String(derin > 0) }, el('span', { class: 'kno' }, el('span', {}, `${j + 1}/${kartlar.length}`), el('i', {}, `☁ ${bulut[1]}`)), el('p', { class: 'kmetin' }, k.metin), el('span', { class: 'damga d-evet' }, 'KATILIYORUM'), el('span', { class: 'damga d-hayir' }, 'HAYIR'));
      if (derin === 0) surukle(c); D.append(c);
    }
  };
  const karar = (evet) => {
    const k = kartlar[i]; if (!k) return; const ust = D.querySelector('.kartd'); if (ust) ust.classList.add(evet ? 'ucar-sag' : 'ucar-sol');
    const uyum = (k.id === 'k5') ? !evet : evet; durum.eslesme.toplam++; if (uyum) durum.eslesme.evet++; durum.etkilesim++;
    $('#deste-tepki').textContent = evet ? k.evet : k.hayir; arka.oyVer(k.id, { secim: evet ? 'evet' : 'hayir', grup: durum.grup }).catch(() => { });
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
        durum.test.toplam++; if (dogru) durum.test.dogru++; durum.etkilesim++; arka.oyVer(s.id, { secim: String(oi), grup: durum.grup }).catch(() => { });
        if (durum.test.toplam === T[set].length) { const d = durum.test.dogru; $('#test-sonuc').textContent = d === 5 ? '5/5. Anlatıcı koltuğu senin.' : d >= 3 ? `${d}/5. İyi; eksikleri ilk üç video kapatır.` : `${d}/5. Tam da bu yüzden videolar var. Utanma, kimse görmedi.`; sonKart(); panelSen(); }
      } }, o));
      arka.oyAl(s.id).then(v => { if (!v) return; const oi = +v.secim; if (!(oi >= 0)) return; const dogru = oi === s.dogru; secenekler[oi].classList.add(dogru ? 'dogru' : 'yanlis'); secenekler[s.dogru].classList.add('dogru'); secenekler.forEach(b => b.disabled = true); ac.textContent = (dogru ? '✓ ' : '✗ ') + s.aciklama + ' (daha önce cevapladın)'; ac.hidden = false; durum.test.toplam++; if (dogru) durum.test.dogru++; if (durum.test.toplam === T[set].length) { $('#test-sonuc').textContent = `${durum.test.dogru}/5 · daha önce çözdün; cevaplar kayıtlı.`; sonKart(); panelSen(); } }).catch(() => { });
      return el('div', { class: 'soru' }, el('h3', {}, `${qi + 1}. ${s.soru}`), el('div', { class: 'secenekler' }, ...secenekler), ac, sur);
    }));
    terimSar($('#test-sorular'));
  };
  $$('.test-sec .sec').forEach(b => b.onclick = () => ciz(b.dataset.set)); testSetSec = ciz; ciz(durum.kitle === 'dis' ? 'misafir' : 'mto');   /* v2: set, girişteki kitle seçimine göre */
}
/* oy kilidi: her anket cihaz başına bir kez (test modunda localStorage, canlıda Firebase anonim kimlik + create-only kural) */
const kilitSatiri = () => el('p', { class: 'oy-kilit' }, '✓ Oyun kaydedildi · bu cihazdan bir kez · değiştirilemez');
const sozlerKutusu = (sozler) => sozler && sozler.length ? el('div', { class: 'sozler' }, el('span', { class: 'sozler-ust' }, 'Oy verenlerin kendi cümleleri'), ...sozler.slice(0, 12).map(t => el('span', { class: 'soz' }, '“' + t + '”'))) : null;
function cokluSoru(s) {
  const secili = new Set(); let diger = '';
  const cipler = s.secenekler.map(o => el('button', { class: 'cip', type: 'button', 'aria-pressed': 'false', onclick: (e) => { if (s.tip === 'single') { secili.clear(); cipler.forEach(c => c.setAttribute('aria-pressed', 'false')); } if (secili.has(o)) { secili.delete(o); e.currentTarget.setAttribute('aria-pressed', 'false'); } else { secili.add(o); e.currentTarget.setAttribute('aria-pressed', 'true'); } gonder.disabled = secili.size === 0 && !diger; } }, o));
  const gonder = el('button', { class: 'gonder', type: 'button', disabled: true }, 'Gönder');
  const alt = el('div', { class: 'coklu-alt' }); if (s.diger) alt.append(el('input', { type: 'text', maxlength: 120, placeholder: 'Diğer…', oninput: (e) => { diger = e.target.value.trim(); gonder.disabled = secili.size === 0 && !diger; } })); alt.append(gonder);
  const sonuc = el('div', { class: 'oylar', hidden: true }); const kutu = el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'secenekler' }, ...cipler), alt, sonuc);
  const goster = (sayim, n, sozler) => { sonuc.hidden = false; sonuc.replaceChildren(...s.secenekler.map(o => { const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; return el('div', { class: 'oy' + (secili.has(o) ? ' benim' : ''), role: 'img', 'aria-label': `${o}: %${y}` }, el('span', { class: 'cubuk', style: `width:${y}%` }), el('span', {}, o), el('span', { class: 'yuzde' }, `%${y}`)); }), el('p', { class: 'oy-toplam' }, `${n} kişi oy verdi`), sozlerKutusu(sozler), kilitSatiri()); kutu.classList.add('oylandi'); };
  gonder.onclick = async () => { gonder.disabled = true; cipler.forEach(c => c.disabled = true); const inp = alt.querySelector('input'); if (inp) inp.disabled = true; try { await arka.oyVer(s.id, { secim: [...secili], diger: diger || undefined, grup: durum.grup }); } catch (e) { } if (s.id === 'c4') durum.roller = [...secili]; durum.etkilesim++; arka.dinle(s.id, goster); sonKart(); panelSen(); };
  arka.oyAl(s.id).then(v => { if (v) { [].concat(v.secim).forEach(x => secili.add(x)); cipler.forEach(c => { c.disabled = true; c.setAttribute('aria-pressed', String(secili.has(c.textContent))); }); gonder.disabled = true; const inp = alt.querySelector('input'); if (inp) inp.disabled = true; if (s.id === 'c4') durum.roller = [...secili]; arka.dinle(s.id, goster); } });
  return kutu;
}
function coklu() { $('#coklu-sorular').replaceChildren(...veri.anket.coklu.map(cokluSoru)); }
function canliSoru(s) {
  let benim = null; const n0 = el('p', { class: 'oy-toplam' }, 'Oy ver, yüzdeyi gör.');
  const dugmeler = s.secenekler.map(o => el('button', { class: 'oy', type: 'button', onclick: async () => { if (benim) return; benim = o; dugmeler.forEach(d => { d.disabled = true; d.classList.toggle('benim', d === dugmeler[s.secenekler.indexOf(o)]); }); try { await arka.oyVer(s.id, { secim: o, grup: durum.grup }); } catch (e) { } durum.etkilesim++; arka.dinle(s.id, goster); } }, el('span', { class: 'cubuk' }), el('span', {}, o), el('span', { class: 'yuzde' }, '')));
  const goster = (sayim, n) => { dugmeler.forEach((d, i) => { const o = s.secenekler[i]; const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; d.querySelector('.cubuk').style.width = y + '%'; d.querySelector('.yuzde').textContent = `%${y} · ${c}`; }); n0.textContent = `${n} oy · ✓ seninki kaydedildi, bu cihazdan bir kez`; kutu.classList.add('oylandi'); };
  arka.oyAl(s.id).then(v => { if (v) { benim = v.secim; dugmeler.forEach((d, i) => { d.disabled = true; d.classList.toggle('benim', s.secenekler[i] === benim); }); arka.dinle(s.id, goster); } });
  const kutu = el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'oylar' }, ...dugmeler), n0); return kutu;
}
function canli() { $('#canli-sorular').replaceChildren(...veri.anket.canli.map(canliSoru)); }
function anlatilar() {
  const A = veri.anket.anlatilar; $('#anlatilar-baslik').textContent = A.baslik;
  $('#anlatilar-adimlar').replaceChildren(...A.adimlar.map(a => { const li = el('li', { tabindex: 0 }, el('b', {}, a.b), el('span', {}, a.a)); etkilesim(li, () => ({ ust: 'atmosfer anlatıları · adım ' + a.n, baslik: a.b, kisa: a.a, uzun: a.detay })); return li; }));
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
    etkilesim(k, () => ({ ust: 'başka bölümdensen · ' + b.bolum.replace(/\s*\(.*?\)\s*/g, ' ').replace(/ (Mühendisliği|Programı)$/, '').trim().toLowerCase(), baslik: b.bolum, kisa: b.yuz || b.ortakIs || '',
      uzun: [b.detay, b.senin ? `Senin dersin: ${b.senin}.` : '', b.bizim ? `Bizdeki karşılığı: ${b.bizim}.` : '', b.ortakIs ? `Birlikte yapılabilecek: ${b.ortakIs}.` : '', (b.projeler || []).length ? 'Fikirler: ' + b.projeler.join(' · ') + '.' : ''].filter(Boolean).join('\n'),
      kaynaklar: [...(b.kaynak ? [{ ad: 'İTÜ ders planı', url: b.kaynak }] : []), { ad: 'Bu bana uyar → bize katıl', url: '#son' }] })); return k; }));
  $('#bolum-not').textContent = 'Kaynak: İTÜ ders planları ve bölüm siteleri. Tam tablo "Meraklısına" bölümünde.';
}
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
  $('#son-cta').replaceChildren(...S.cta.map((c, i) => el('a', { class: i === 0 ? 'birincil' : '', href: c.href }, c.etiket)));
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
  addEventListener('scroll', () => { if (donusY != null && !b.hidden && Math.abs(scrollY - donusY) < 200) gizle(); }, { passive: true });
}
function gitEl(h, pay = 70) { if (!h) return; const y = h.getBoundingClientRect().top + scrollY - pay; if (Math.abs(y - scrollY) > innerHeight) donusGoster(scrollY);
  if (IC) { if (window.__lenis) window.__lenis.scrollTo(y); else scrollTo({ top: y, behavior: 'smooth' }); return; } kaydirHedef(y); }
function ustPay() { const u = $('.ust'); if (!u) return 70; const t = parseFloat(getComputedStyle(u).top) || 0; return Math.max(70, t + u.offsetHeight + 16); }   /* yapışık hâldeki alt kenar: sticky top + yükseklik (şerit henüz yapışmamışken de doğru) */   /* iniş: yapışkan şeridin gerçek alt kenarı + 16 px (içkinde ana menü + şerit) */
function git(id) { let h = KOK.getElementById(id); if (!h) return; const pay = ustPay();
  if (h.dataset.katli && !h.getClientRects().length) katliAyarla(h.dataset.katli, true);   /* katlı bir bölüme gidiliyorsa önce aç */
  { const o = h.previousElementSibling; if (o && o.classList.contains('asama-baslik') && o.getClientRects().length) h = o; }   /* aşamanın başlığı görünsün */
  if (Math.abs(h.getBoundingClientRect().top - pay) > innerHeight) donusGoster(scrollY);
  if (IC) { GOVDE.classList.add('hepsi-acik'); clearTimeout(GOVDE._hz); GOVDE._hz = setTimeout(() => GOVDE.classList.remove('hepsi-acik'), 2500); }   /* content-visibility: üstteki bölümler gerçek boyuna açılsın, hedef kaçmasın */
  const y = h.getBoundingClientRect().top + scrollY - pay; if (IC) { icGit(h, y); return; } kaydirHedef(y); }
/* içkin uzun atlama: Lenis kaydırması yarıda kesilebiliyor (content-visibility açılınca hedef kayar) → bitince yeniden ölç, hedefe 4 px yaklaşana kadar en çok 5 tur */
function icGit(h, y, tur = 0) { const L = window.__lenis; let bitti = false; const sonra = () => { if (bitti) return; bitti = true; const d = h.getBoundingClientRect().top - ustPay(); if (Math.abs(d) > 4) { if (tur < 2) icGit(h, scrollY + d, tur + 1); else if (window.__lenis) window.__lenis.scrollTo(scrollY + d, { immediate: true, force: true }); else scrollTo(0, scrollY + d); } };
  if (L && !azalt) { const uzak = Math.abs(y - scrollY); L.scrollTo(y, { force: true, lock: true, duration: tur ? .35 : Math.min(1.1, .45 + uzak / 9000), onComplete: () => setTimeout(sonra, 60) }); setTimeout(sonra, 2600); }
  else { scrollTo({ top: y, behavior: azalt ? 'auto' : 'smooth' }); setTimeout(sonra, 900); } }
function ilerleme() {
  const bar = $('#ilerleme-bar'), roz = $('#surpriz'), rm = $('#surpriz-metin'), balon = $('#ray-balon'), ybIc = $('#yan-balon .yb-ic'); const bloklar = $$('main > section[data-asama], .takim-main > section[data-asama]');
  let yukSon = -1;   /* --yuk/--yukp kökte: her yazım tüm sayfayı yeniden stiller → yalnız %1'lik adımlarda yazılır (renk farkı gözle seçilmez) */
  const g = () => { const h = KOKEL; let p;
    /* akıcılık: önce tüm okumalar (yerleşim), sonra yazımlar → kare başına zorunlu yeniden yerleşim yok */
    let aktif = 0; for (const b of bloklar) { if (!b.getClientRects().length) continue; if (b.getBoundingClientRect().top < innerHeight * .45) aktif = +b.dataset.asama; }   /* katlı (görünmez) bölümler sayılmaz */
    const kalan = bloklar.filter(b => b.getClientRects().length && b.getBoundingClientRect().top > innerHeight).length;
    inisKontrol();
    if (IC) { const r = KOKEL.getBoundingClientRect(); p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); }   /* içkin: bölümün görünür alandaki ilerlemesi */
    else { const d = document.documentElement; p = Math.min(1, Math.max(0, d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight))); }
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    const yuk = 1 - p;                                                   /* iniş: sayfa başı tropopoz (yuk=1), sonu yüzey (yuk=0) */
    if (!IC) { const yq = Math.round(yuk * 100); if (yq !== yukSon) { yukSon = yq; h.style.setProperty('--yuk', (yq / 100).toFixed(2)); h.style.setProperty('--yukp', yq + '%'); } }   /* içkin: zemin sabit, değişken yazılmaz (yeniden boyama yok) */
    if (balon) balon.style.top = (18 + p * 72).toFixed(1) + '%';
    const P = basincTen(yuk * .7), km = yukseklik(P) / 1000, T = 15 - 6.5 * km;   /* .7 → 1000…200 hPa aralığı */
    const ok = `${Math.round(P)} hPa · ${km.toFixed(1)} km`; const io = $('#im-okuma'); if (io && !inisDurum) io.textContent = ok; const mb = $('#mb-okuma'); if (mb) mb.textContent = ok; const bn = $('#bb-not'); if (bn) bn.textContent = `${km.toFixed(0)} km · ${Math.round(P)} hPa · ` + (p < .02 ? 'balon tam şişkin' : p < .5 ? 'balon küçülüyor' : 'balon neredeyse yerde');
    const ph = $('#p-hpa'); if (ph) { ph.textContent = Math.round(P) + ' hPa'; $('#p-km').textContent = km.toFixed(1).replace('.', ',') + ' km'; $('#p-t').textContent = Math.round(T) + ' °C'; }
    if (ybIc) { ybIc.style.transform = `translateY(-50%) scale(${(1 - p * .55).toFixed(3)})`; ybIc.style.opacity = p > .965 ? '0' : '1'; }   /* sağdaki balon: indikçe küçülür, yere yaklaşınca sahneyi zemindeki paraşüte bırakır */
    if (aktif !== durum.asama) { durum.asama = aktif; h.dataset.asama = aktif; const [ad, m] = ASAMA_ADI[aktif]; $('#p-asama').textContent = aktif; $('#p-ad').textContent = ad; $('#p-m').textContent = m; $$('#serit button').forEach(b => { const n = +b.dataset.asama; b.classList.toggle('aktif', n === aktif); b.classList.toggle('gecti', n < aktif); }); }
    if (roz && rm) { if (kalan === 0) { roz.classList.add('acildi'); rm.textContent = 'Yerdesin: sana göre rol ↓'; roz.querySelector('.kilit').textContent = '🪂'; } else rm.textContent = `Yere inince: sana göre rol · ${kalan} seviye kaldı`; }
    };
  let gRaf = 0; const gK = () => { if (!gRaf) gRaf = requestAnimationFrame(() => { gRaf = 0; g(); }); };   /* kare başına en çok bir kez */
  addEventListener('scroll', gK, { passive: true }); addEventListener('resize', gK); g();
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
function gorunme() {
  const hedefler = $$('main .sar > *:not(.seviye), header.acilis .acilis-ic > *, .asama-baslik'); hedefler.forEach(h => h.classList.add('gel'));
  if (azalt || !('IntersectionObserver' in window)) { hedefler.forEach(h => h.classList.add('goster')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('goster'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); hedefler.forEach(h => io.observe(h));
}
function imlec() {
  if (dokunmatik || azalt || IC) return; const I = $('#imlec'); GOVDE.classList.add('imlec-aktif'); I.style.display = 'block';
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const ciz = () => { if (I.classList.contains('donus')) { raf = 0; return; } x += (tx - x) * .35; y += (ty - y) * .35; I.style.transform = `translate(${x - 14}px,${y - 14}px)`; if (Math.abs(tx - x) + Math.abs(ty - y) > .3) raf = requestAnimationFrame(ciz); else raf = 0; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (I.classList.contains('donus')) return; I.classList.remove('gizli'); const h = e.target.closest('a,button,[role=button],summary,input,textarea,select,label,.kartd,.oy,.cip,.bk,.md-basamak,.etk,.terim,.tik,.hpa'); I.classList.toggle('kod', !!h); if (!raf) raf = requestAnimationFrame(ciz); }, { passive: true });
  addEventListener('pointerdown', e => { for (let i = 0; i < 3; i++) { const d = el('span', { class: 'damla', style: `left:${e.clientX - 6 + i * 6}px;top:${e.clientY + 6}px;animation-delay:${i * 60}ms` }); GOVDE.append(d); setTimeout(() => d.remove(), 800); } });
  document.addEventListener('pointerleave', () => I.classList.add('gizli')); document.addEventListener('pointerenter', () => I.classList.remove('gizli'));
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
function detayKur() { const D = $('#detay'); if (!D) return; $('#detay-kapat').addEventListener('click', () => D.close()); D.addEventListener('click', e => { if (e.target === D || (D.classList.contains('metin') && (e.target.id === 'detay-ic' || e.target.id === 'harita'))) D.close(); });   /* metin görünümü: yazının dışındaki boşluğa tıklayınca kapanır */ addEventListener('resize', () => { if (D.open) { D.classList.toggle('dar', innerWidth < 860); D._ciz && D._ciz(); } }); }
/* iniş: fırlatma noktası ekrana girince imleç balonu oraya uçar, "bize katıl" yazar; tıklanır. Nokta ekrandan çıkınca imleç geri gelir. */
let inisDurum = false;
function inisKontrol() {
  const pad = $('#firlatma'), I = $('#imlec'); if (!pad || !I || dokunmatik || azalt || IC) return;
  const r = pad.getBoundingClientRect(); const gorunur = r.top > 60 && r.bottom < innerHeight - 10;
  if (gorunur && !inisDurum) { inisDurum = true; I.classList.add('donus'); I.classList.remove('gizli', 'kod'); GOVDE.classList.remove('imlec-aktif'); GOVDE.classList.add('inis'); $('#im-okuma').textContent = 'bize katıl →'; }
  if (inisDurum) { const r2 = pad.getBoundingClientRect(); I.style.transform = `translate(${r2.left + r2.width / 2 - 14}px,${r2.top - 34}px)`; }
  if (!gorunur && inisDurum) { inisDurum = false; I.classList.remove('donus'); GOVDE.classList.remove('inis'); GOVDE.classList.add('imlec-aktif'); }
}
function katilYerlestir() {   /* "Bize katıl" tam fırlatma noktasının üstünde: paraşüt oraya iner */
  const Z = $('#zemin'), pad = $('#firlatma'), k = $('#katil'); if (!Z || !pad || !k) return; const z = Z.getBoundingClientRect(), r = pad.getBoundingClientRect(); if (!z.width) return;
  k.style.setProperty('--kx', ((r.left + r.width / 2 - z.left) / z.width * 100).toFixed(2) + '%'); k.style.setProperty('--ky', ((r.top + r.height * .55 - z.top) / z.height * 100).toFixed(2) + '%');
}
function inisKur() { const Z = $('#zemin svg'); if (Z) { const ayar = () => { Z.setAttribute('viewBox', innerWidth < 700 ? '430 40 770 280' : '0 0 1200 320'); requestAnimationFrame(katilYerlestir); }; ayar(); addEventListener('resize', ayar); setTimeout(katilYerlestir, 600); }
  const I = $('#imlec'); if (!I) return; I.addEventListener('click', () => { if (inisDurum) git('baloncuk'); }); }

/* ---------------- BAŞLAT ---------------- */
(async () => {
  await yukle();
  if (!veri.anket || !veri.metinler) { GOVDE.insertAdjacentHTML('afterbegin', '<p class="bos" style="margin:16px">Veri yüklenemedi (veri/*.json). Sayfayı bir sunucu üzerinden aç.</p>'); return; }
  if (durum.grup) KOKEL.dataset.grup = durum.grup;
  if (durum.kitle) KOKEL.dataset.kitle = durum.kitle;
  if (KIME) KOKEL.dataset.kime = KIME;
  await arkaKur();
  asamaYukle();
  acilis(); resmi(); olay(); sesYerlestir(); akis(); kapi(); vizyon(); merdiven(); karne(); mumkun(); deste(); test(); bolumler(); gercek(); neden(); coklu(); canli(); anlatilar(); baloncuk(); merak(); sonKart(); panelSen();
  katliKur(); maddele(KOK); terimSar(KOK); sadeKur(); detayKur(); ray(); gorunme(); ilerleme(); imlec(); inisKur(); kocKur(); asamaNe(); altNotKur(); yumusakKaydirma(); donusKur();
  if (dokunmatik) $$('.devam').forEach(d => { d.textContent = d.textContent.replace(/tıkla/g, 'dokun'); });
})();
