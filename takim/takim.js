/* /takim/ — tek dosya, derleme yok. Bölümler: veri yükleme · arka uç (yerel/Firebase) · render · etkileşim · süsler (imleç, izobar, ilerleme). */
const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => Array.from(k.querySelectorAll(s));
const azalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dokunmatik = matchMedia('(pointer: coarse)').matches;
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return v; } catch (e) { return null; } };
const el = (tag, attrs = {}, ...cocuklar) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v === true ? '' : v); } for (const c of cocuklar.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); return e; };
const kacir = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rastgele = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const veri = {};
const durum = { grup: ls('takim-grup') || '', eslesme: { evet: 0, toplam: 0 }, test: { dogru: 0, toplam: 0, set: 'mto' }, roller: [], etkilesim: 0 };

/* ---------------- ARKA UÇ ---------------- */
class Yerel {
  constructor() { this.uid = ls('takim-uid') || ls('takim-uid', 'yerel-' + rastgele()); this.d = {}; this.bd = []; this.mod = 'yerel'; }
  async oyAl(id) { try { return JSON.parse(ls('oy:' + id) || 'null'); } catch (e) { return null; } }
  async oyVer(id, data) { if (await this.oyAl(id)) throw new Error('var'); ls('oy:' + id, JSON.stringify({ ...data, pollId: id, uid: this.uid, ts: Date.now() })); (this.d[id] || []).forEach(f => f()); }
  dinle(id, cb) { const f = async () => { const v = await this.oyAl(id); const sayim = {}; if (v) [].concat(v.secim).forEach(s => sayim[s] = (sayim[s] || 0) + 1); cb(sayim, v ? 1 : 0); }; (this.d[id] = this.d[id] || []).push(f); f(); return () => { this.d[id] = this.d[id].filter(x => x !== f); }; }
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
  /* canliSayac: tüm oyları okur; 1.000+ oyda getCountFromServer(query(..., where('secim','==',opt))) ile değiştir. */
  dinle(id, cb) { const q = this.F.query(this.F.collection(this.db, 'votes'), this.F.where('pollId', '==', id)); return this.F.onSnapshot(q, snap => { const sayim = {}; let n = 0; snap.forEach(d => { n++; [].concat(d.data().secim).forEach(s => sayim[s] = (sayim[s] || 0) + 1); }); cb(sayim, n); }, () => cb({}, 0)); }
  async balonEkle(b) { const d = { uid: this.uid, metin: b.metin, gorunum: b.gorunum, gizli: false, ts: this.F.serverTimestamp() }; for (const k of ['ad', 'org', 'unvan', 'grup']) if (b[k]) d[k] = b[k]; await this.F.addDoc(this.F.collection(this.db, 'bubbles'), d); }
  balonDinle(cb) { const q = this.F.query(this.F.collection(this.db, 'bubbles'), this.F.where('gizli', '==', false), this.F.orderBy('ts', 'desc'), this.F.limit(60)); return this.F.onSnapshot(q, snap => { const l = []; snap.forEach(d => l.push({ id: d.id, ...d.data(), ts: d.data().ts?.toMillis?.() || 0 })); cb(l); }, () => cb([])); }
}
let arka;
async function arkaKur() {
  const cfg = window.TAKIM_FIREBASE;
  if (cfg && cfg.apiKey) { try { const b = new Bulut(cfg); await b.init(); arka = b; return; } catch (e) { console.warn('Firebase başlatılamadı, yerel moda düşüldü', e); } }
  arka = new Yerel(); $('#mod-rozet').hidden = false;
}

/* ---------------- VERİ ---------------- */
async function yukle() {
  await Promise.all(['anket', 'metinler', 'kufur', 'bolumler', 'sayilar', 'takimlar', 'gercekcilik', 'karne'].map(async a => { try { veri[a] = await (await fetch(`veri/${a}.json?v=1`)).json(); } catch (e) { veri[a] = null; } }));
}
const sayiBul = id => (veri.sayilar || []).find(s => s.id === id);
const yerDoldur = s => String(s || '').replace(/\{\{S:([\w-]+)\}\}/g, (_, id) => { const k = sayiBul(id); return k ? k.sayi : '…'; }).replace(/\s{2,}/g, ' ').trim();

/* ---------------- RENDER ---------------- */
function ses(hirsli, rahat) {
  return el('div', { class: 'ses' }, el('p', { class: 's-h' }, el('span', { class: 'prompt p-h' }, 'T · hırslı ▸ '), yerDoldur(hirsli)), el('p', { class: 's-r' }, el('span', { class: 'prompt p-r' }, 'Td · rahat ▸ '), yerDoldur(rahat)));
}
function sesYerlestir() {
  const M = veri.metinler;
  const harita = { acilis: [M.acilis.hirsli, M.acilis.rahat], bolumler: [M.bolumler.hirsli, M.bolumler.rahat], gercekcilik: [M.gercekcilik.hirsli, M.gercekcilik.rahat] };
  $$('.ses[data-ses]').forEach(k => { const p = harita[k.dataset.ses]; if (p) k.replaceWith(ses(p[0], p[1])); });
}
function acilis() {
  const M = veri.metinler.acilis;
  $('#acilis-sayilar').replaceChildren(...M.sayilar.map(s => el('div', { class: 'sayi' }, el('b', {}, s.s), el('span', {}, s.e))));
}
function kapi() {
  const K = veri.anket.kapi; $('#kapi-soru').textContent = K.soru;
  const ikon = { pasif: '☁', orta: '⛅', hirsli: '⚡' };
  $('#kapi-kartlar').replaceChildren(...K.secenekler.map(s => el('button', { class: 'kapi', type: 'button', role: 'radio', 'aria-checked': String(durum.grup === s.id), 'data-id': s.id, onclick: () => grupSec(s.id) }, el('span', { class: 'k-ikon' }, `${ikon[s.id]} ${s.id}`), el('b', {}, s.etiket), el('span', {}, s.alt))));
}
function grupSec(id) { durum.grup = id; ls('takim-grup', id); document.documentElement.dataset.grup = id; $$('.kapi').forEach(k => k.setAttribute('aria-checked', String(k.dataset.id === id))); sonKart(); durum.etkilesim++; }
function vizyon() {
  const V = veri.metinler.vizyon;
  $('#vizyon-kartlar').replaceChildren(el('div', { class: 'kart kart-vurgu' }, el('b', {}, V.vizyon.b), el('p', {}, V.vizyon.m)), el('div', { class: 'kart' }, el('b', {}, V.misyon.b), el('p', {}, V.misyon.m)));
  $('#kollar').replaceChildren(...V.kollar.map(k => el('div', { class: 'kart' }, el('b', {}, k.b), el('p', {}, k.m), ses(k.hirsli, k.rahat))));
}
function merdiven() {
  const M = veri.metinler.merdiven; $('#merdiven-baslik').textContent = M.baslik; $('#merdiven-alt').textContent = M.alt;
  $('#merdiven-kural').replaceChildren(...M.kural.map(k => el('li', {}, k)));
  const svg = $('#merdiven-svg'); const NS = 'http://www.w3.org/2000/svg'; svg.replaceChildren();
  const g = (t, a) => { const n = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); return n; };
  M.basamaklar.forEach((b, i) => {
    const x = 10 + i * 96, y = 300 - (i + 1) * 44;
    const r = g('rect', { x, y, width: 94, height: 330 - y - 6, rx: 6, class: 'md-basamak', 'data-i': i }); r.addEventListener('click', () => basamakSec(i)); svg.append(r);
    const t1 = g('text', { x: x + 8, y: y + 18, class: 'md-no' }); t1.textContent = '0' + b.n; svg.append(t1);
    const t2 = g('text', { x: x + 8, y: y + 36, class: 'md-ad' }); t2.textContent = b.kisa || (b.b.length > 11 ? b.b.slice(0, 11) + '…' : b.b); svg.append(t2);
  });
  const fig = g('g', { class: 'md-figur', id: 'md-figur' }); fig.innerHTML = '<circle cx="0" cy="-16" r="6"/><rect x="-5" y="-9" width="10" height="14" rx="3"/>'; svg.append(fig);
  $('#basamaklar').replaceChildren(...M.basamaklar.map((b, i) => el('button', { class: 'bs', type: 'button', role: 'tab', 'aria-selected': 'false', 'data-i': i, onclick: () => basamakSec(i) }, el('span', { class: 'n' }, '0' + b.n), el('span', { class: 'ad' }, b.b), el('span', { class: 'z' }, b.zaman))));
  basamakSec(0, true);
  if (!azalt && 'IntersectionObserver' in window) { let acilan = 0; const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; const t = setInterval(() => { const r = svg.querySelector(`.md-basamak[data-i="${acilan}"]`); if (!r) { clearInterval(t); return; } r.classList.add('acik'); acilan++; }, 140); io.disconnect(); }, { threshold: .4 }); io.observe(svg); } else $$('.md-basamak', svg).forEach(r => r.classList.add('acik'));
}
function basamakSec(i, sessiz) {
  const b = veri.metinler.merdiven.basamaklar[i]; if (!b) return;
  $$('.bs').forEach(x => x.setAttribute('aria-selected', String(+x.dataset.i === i)));
  $$('.md-basamak').forEach(x => x.classList.toggle('secili', +x.dataset.i === i));
  const fig = $('#md-figur'); if (fig) fig.setAttribute('transform', `translate(${10 + i * 96 + 70},${300 - (i + 1) * 44})`);
  const D = $('#basamak-detay');
  D.replaceChildren(el('h3', {}, `0${b.n} · ${b.b}`), ...[['kavram', b.kavram], ['video', b.video], ['dayanak', b.ref], ['zaman', b.zaman]].map(([k, v]) => el('div', { class: 'bd-satir' }, el('span', {}, k), el('span', {}, v))), ses(b.hirsli, b.rahat));
  if (!sessiz) durum.etkilesim++;
}
function mumkun() {
  const M = veri.metinler.mumkun; $('#mumkun-baslik').textContent = M.baslik;
  const medya = (m) => { if (!m) return null; if (m.tip === 'video') return el('div', { class: 'medya' }, el('video', { src: m.src, poster: m.poster, autoplay: true, muted: true, loop: true, playsinline: true, preload: 'metadata', 'aria-label': m.alt || '' }));
    if (m.tip === 'serit') return el('div', { class: 'medya serit' }, ...m.src.map(s => el('img', { src: s, alt: '', loading: 'lazy', decoding: 'async' })));
    return el('div', { class: 'medya' }, el('img', { src: m.src, alt: m.alt || '', loading: 'lazy', decoding: 'async' })); };
  $('#mumkun-kartlar').replaceChildren(...M.kartlar.map(k => el('div', { class: 'kart' }, medya(k.medya), el('b', {}, k.b), el('p', {}, k.m), k.ref ? el('a', { class: 'ref', href: '../' + k.ref }, 'portfolyoda gör →') : null)));
  $$('#mumkun-kartlar video').forEach(v => { v.muted = true; v.play && v.play().catch(() => { }); });
}

/* --- deste --- */
const BULUTLAR = [['g20', 'Cirrus uncinus · 20 Nis'], ['g15', 'Altocumulus · 15 Nis'], ['g28', 'Cumulus humilis · 28 Nis'], ['g13', 'Altostratus · 13 Nis'], ['g16', 'Stratus · 16 Nis'], ['g03', 'Nimbostratus · 3 May']];
function deste() {
  const K = veri.anket.kaydir; $('#kaydir-baslik').textContent = K.baslik; $('#kaydir-mizah').textContent = K.mizah_giris;
  const D = $('#deste'); const kartlar = [...K.kartlar]; let i = 0;
  const ciz = () => {
    D.replaceChildren();
    if (i >= kartlar.length) { const y = durum.eslesme.toplam ? Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam) : 0; D.append(el('div', { class: 'deste-bitti' }, el('b', { class: 'eslesme' }, `Eşleşme: %${y}`), el('span', {}, K.son.baslik), el('span', { class: 'not' }, y >= 70 ? 'Süper eşleşme. Bu bir tanışma uygulaması olsa şu an bildirim gelirdi.' : y >= 40 ? 'Makul. Ortada buluşuruz.' : 'Zor bir kitlesin; tam da videoları senin için çekiyoruz.'))); $('#dg-evet').disabled = $('#dg-hayir').disabled = true; sonKart(); return; }
    for (let j = Math.min(i + 2, kartlar.length - 1); j >= i; j--) {
      const k = kartlar[j]; const derin = j - i;
      const bulut = BULUTLAR[j % BULUTLAR.length];
      const c = el('article', { class: 'kartd', style: `transform:translateY(${derin * 10}px) scale(${1 - derin * .04});z-index:${10 - derin};background-image:url('../g/bulut/${bulut[0]}.jpg')`, 'aria-hidden': String(derin > 0) }, el('span', { class: 'kno' }, el('span', {}, `${j + 1}/${kartlar.length}`), el('i', {}, `☁ ${bulut[1]}`)), el('p', { class: 'kmetin' }, k.metin), el('span', { class: 'damga d-evet' }, 'KATILIYORUM'), el('span', { class: 'damga d-hayir' }, 'HAYIR'));
      if (derin === 0) surukle(c); D.append(c);
    }
  };
  const karar = (evet) => {
    const k = kartlar[i]; if (!k) return; const ust = D.querySelector('.kartd'); if (ust) ust.classList.add(evet ? 'ucar-sag' : 'ucar-sol');
    const uyum = (k.id === 'k5') ? !evet : evet; durum.eslesme.toplam++; if (uyum) durum.eslesme.evet++; durum.etkilesim++;
    $('#deste-tepki').textContent = evet ? k.evet : k.hayir;
    arka.oyVer(k.id, { secim: evet ? 'evet' : 'hayir', grup: durum.grup }).catch(() => { });
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
  ciz();
}

/* --- test --- */
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
        ac.textContent = (dogru ? '✓ ' : '✗ ') + s.aciklama; ac.hidden = false; if (s.surpriz) { sur.textContent = '// ' + s.surpriz; sur.hidden = false; }
        durum.test.toplam++; if (dogru) durum.test.dogru++; durum.etkilesim++;
        arka.oyVer(s.id, { secim: String(oi), grup: durum.grup }).catch(() => { });
        if (durum.test.toplam === T[set].length) { const d = durum.test.dogru; $('#test-sonuc').textContent = d === 5 ? '5/5. Anlatıcı koltuğu senin.' : d >= 3 ? `${d}/5. İyi; eksikleri ilk üç video kapatır.` : `${d}/5. Tam da bu yüzden videolar var. Utanma, kimse görmedi.`; sonKart(); }
      } }, o));
      return el('div', { class: 'soru' }, el('h3', {}, `${qi + 1}. ${s.soru}`), el('div', { class: 'secenekler' }, ...secenekler), ac, sur);
    }));
  };
  $$('.test-sec .sec').forEach(b => b.onclick = () => ciz(b.dataset.set));
  ciz('mto');
}

/* --- çoklu --- */
function cokluSoru(s) {
  const secili = new Set(); let diger = '';
  const cipler = s.secenekler.map(o => el('button', { class: 'cip', type: 'button', 'aria-pressed': 'false', onclick: (e) => { if (s.tip === 'single') { secili.clear(); cipler.forEach(c => c.setAttribute('aria-pressed', 'false')); } if (secili.has(o)) { secili.delete(o); e.currentTarget.setAttribute('aria-pressed', 'false'); } else { secili.add(o); e.currentTarget.setAttribute('aria-pressed', 'true'); } gonder.disabled = secili.size === 0 && !diger; } }, o));
  const gonder = el('button', { class: 'gonder', type: 'button', disabled: true }, 'Gönder');
  const alt = el('div', { class: 'coklu-alt' }); if (s.diger) { const inp = el('input', { type: 'text', maxlength: 120, placeholder: 'Diğer…', oninput: (e) => { diger = e.target.value.trim(); gonder.disabled = secili.size === 0 && !diger; } }); alt.append(inp); } alt.append(gonder);
  const sonuc = el('div', { class: 'oylar', hidden: true }); const kutu = el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'secenekler' }, ...cipler), alt, sonuc);
  const goster = (sayim, n) => { sonuc.hidden = false; sonuc.replaceChildren(...s.secenekler.map(o => { const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; return el('div', { class: 'oy' + (secili.has(o) ? ' benim' : ''), role: 'img', 'aria-label': `${o}: %${y}` }, el('span', { class: 'cubuk', style: `width:${y}%` }), el('span', {}, o), el('span', { class: 'yuzde' }, `%${y}`)); }), el('p', { class: 'oy-toplam' }, `${n} kişi`)); };
  gonder.onclick = async () => { gonder.disabled = true; cipler.forEach(c => c.disabled = true); alt.querySelector('input') && (alt.querySelector('input').disabled = true); try { await arka.oyVer(s.id, { secim: [...secili], diger: diger || undefined, grup: durum.grup }); } catch (e) { } if (s.id === 'c4') durum.roller = [...secili]; durum.etkilesim++; arka.dinle(s.id, goster); sonKart(); };
  arka.oyAl(s.id).then(v => { if (v) { [].concat(v.secim).forEach(x => secili.add(x)); cipler.forEach(c => { c.disabled = true; c.setAttribute('aria-pressed', String(secili.has(c.textContent))); }); gonder.disabled = true; alt.querySelector('input') && (alt.querySelector('input').disabled = true); if (s.id === 'c4') durum.roller = [...secili]; arka.dinle(s.id, goster); } });
  return kutu;
}
function coklu() { $('#coklu-sorular').replaceChildren(...veri.anket.coklu.map(cokluSoru)); }

/* --- canlı --- */
function canliSoru(s) {
  let benim = null; const n0 = el('p', { class: 'oy-toplam' }, 'Oy ver, yüzdeyi gör.');
  const dugmeler = s.secenekler.map(o => el('button', { class: 'oy', type: 'button', onclick: async () => { if (benim) return; benim = o; dugmeler.forEach(d => { d.disabled = true; d.classList.toggle('benim', d === dugmeler[s.secenekler.indexOf(o)]); }); try { await arka.oyVer(s.id, { secim: o, grup: durum.grup }); } catch (e) { } durum.etkilesim++; arka.dinle(s.id, goster); } }, el('span', { class: 'cubuk' }), el('span', {}, o), el('span', { class: 'yuzde' }, '')));
  const goster = (sayim, n) => { dugmeler.forEach((d, i) => { const o = s.secenekler[i]; const c = sayim[o] || 0; const y = n ? Math.round(100 * c / n) : 0; d.querySelector('.cubuk').style.width = y + '%'; d.querySelector('.yuzde').textContent = `%${y} · ${c}`; }); n0.textContent = `${n} oy`; };
  arka.oyAl(s.id).then(v => { if (v) { benim = v.secim; dugmeler.forEach((d, i) => { d.disabled = true; d.classList.toggle('benim', s.secenekler[i] === benim); }); arka.dinle(s.id, goster); } });
  return el('div', { class: 'soru' }, el('h3', {}, s.soru), el('div', { class: 'oylar' }, ...dugmeler), n0);
}
function canli() { $('#canli-sorular').replaceChildren(...veri.anket.canli.map(canliSoru)); }
function anlatilar() {
  const A = veri.anket.anlatilar; $('#anlatilar-baslik').textContent = A.baslik;
  $('#anlatilar-adimlar').replaceChildren(...A.adimlar.map(a => el('li', {}, el('b', {}, a.b), el('span', {}, a.a))));
  $('#anlatilar-sorular').replaceChildren(...A.sorular.map(canliSoru));
}

/* --- bölümler / gerçekçilik / neden şimdi --- */
const IKONLAR = {
  UCK: '<path d="M3 16l9-2 9 2M12 14V5l3 2M12 5L9 7M8 20h8"/>', UZB: '<circle cx="12" cy="12" r="4"/><path d="M2 12c0-2 4-3 10-3s10 1 10 3-4 3-10 3S2 14 2 12zM12 2v3M12 19v3"/>',
  BLG: '<rect x="5" y="5" width="14" height="14" rx="1"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>', YZV: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M8 7l2 4M8 17l2-4M14 12h2"/>',
  MAT: '<path d="M6 4h12L10 12l8 8H6"/>', FIZ: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
  CEV: '<path d="M12 21c-5 0-8-4-8-9 0-4 3-8 8-9 5 1 8 5 8 9 0 5-3 9-8 9zM12 21V9M12 13l-4-3M12 16l4-3"/>', EHB: '<path d="M12 21V9M6 9a8 8 0 0 1 12 0M3 6a12 12 0 0 1 18 0M9 9a4 4 0 0 1 6 0"/>',
  KON: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', GEO: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'
};
function ikon(k) { const t = document.createElement('template'); t.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${IKONLAR[k] || '<circle cx="12" cy="12" r="8"/>'}</svg>`; return t.content.firstChild; }
function karne() {
  const K = veri.karne; const S = $('#karne-svg'), O = $('#karne-ozet'); if (!K || !S) return;
  const NS = 'http://www.w3.org/2000/svg'; const g = (t, a, txt) => { const n = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); if (txt !== undefined) n.textContent = txt; return n; };
  const G = K.gunler, W = 720, H = 260, L = 42, R = 12, T = 18, B = 40, ih = H - T - B, iw = W - L - R;
  const err = G.map(d => d.tahmin1 - d.gercek); const mx = Math.max(1, ...err.map(Math.abs)); const y0 = T + ih / 2; const sc = (ih / 2 - 6) / mx;
  S.replaceChildren();
  [-mx, -mx / 2, 0, mx / 2, mx].forEach(v => { const y = y0 - v * sc; S.append(g('line', { x1: L, x2: W - R, y1: y, y2: y, class: v === 0 ? 'sifir' : 'eksen' })); S.append(g('text', { x: L - 6, y: y + 3, 'text-anchor': 'end' }, (v > 0 ? '+' : '') + v.toFixed(1) + '°')); });
  const bw = iw / G.length;
  G.forEach((d, i) => { const e = err[i]; const h = Math.abs(e) * sc; const x = L + i * bw + 1;
    const r = g('rect', { x, y: e >= 0 ? y0 - h : y0, width: Math.max(2, bw - 2), height: h, class: 'cubuk ' + (e >= 0 ? 'c-art' : 'c-eksi') }); r.append(g('title', {}, `${d.t}: tahmin ${d.tahmin1}° · gerçekleşen ${d.gercek}° · fark ${e >= 0 ? '+' : ''}${e.toFixed(1)}°`)); S.append(r);
    if (i % 5 === 0) S.append(g('text', { x: x + bw / 2, y: H - B + 14, 'text-anchor': 'middle' }, d.t.slice(8, 10) + '.' + d.t.slice(5, 7))); });
  S.append(g('text', { x: L, y: H - 6 }, 'kırmızı: model sıcak verdi · yeşil-mavi: soğuk verdi · günlük Tmax, GFS'));
  const z = K.ozet;
  O.replaceChildren(...[[`${z.bias1 >= 0 ? '+' : ''}${z.bias1.toFixed(2)}°`, 'bias (sistematik sapma), 1 gün önce'], [`${z.mae1.toFixed(2)}°`, 'MAE (ortalama mutlak hata), 1 gün önce'], [z.mae3 != null ? `${z.mae3.toFixed(2)}°` : '—', 'MAE, 3 gün önce: ufuk uzadıkça hata büyür'], [`${z.n} gün`, K.istasyon]].map(([s, e]) => el('div', { class: 'sk' }, el('b', {}, s), el('span', {}, e))),
    el('p', { class: 'not' }, K.kaynak + ' · ', el('a', { href: K.kaynakUrl, target: '_blank', rel: 'noopener' }, 'Open-Meteo'), ` · üretim ${K.uretim}`),
    ses('Bu grafiği 40 satır Python ile sen de çıkarırsın. Gözlemle (MGM) karşılaştırınca 2209 başvurusunun ilk şekli hazır.', 'Bakması bile yeter: model bazen sıcak, bazen soğuk verir; ikisinin ortalaması sıfıra yakınsa "bias" düşüktür. Bu kadar.'));
}
function bolumler() {
  const M = veri.metinler.bolumler; $('#bolumler-baslik').textContent = M.baslik; $('#bolumler-alt').textContent = M.alt;
  const B = veri.bolumler || [];
  if (!B.length) { $('#bolum-kartlar').replaceChildren(el('div', { class: 'bos' }, '// 10 bölümün ders planı karşılaştırması derleniyor — yakında burada.')); return; }
  $('#bolum-kartlar').replaceChildren(...B.map(b => { const k = el('button', { class: 'bk', type: 'button', 'aria-expanded': 'false', onclick: () => { const a = k.getAttribute('aria-expanded') === 'true'; k.setAttribute('aria-expanded', String(!a)); durum.etkilesim++; } },
    el('span', { class: 'bk-ad' }, ikon(b.k), b.bolum, el('span', { class: 'bk-k' }, b.k)),
    el('div', { class: 'es' }, el('span', {}, 'senin'), el('span', {}, b.senin), el('span', {}, 'bizim'), el('span', {}, b.bizim), el('span', {}, 'ortak'), el('span', {}, b.ortakIs)),
    el('div', { class: 'bk-detay' }, ...(b.projeler || []).map(p => el('span', {}, '→ ' + p)), b.hocaSayisi ? el('span', {}, `${b.hocaSayisi} ilgili hoca · ${b.projeSayisi || 0} ortak proje fikri`) : null)); return k; }));
  $('#bolum-not').textContent = 'Kaynak: İTÜ ders planları ve bölüm siteleri. Tam tablo "Meraklısına" bölümünde.';
}
function gercek() {
  const M = veri.metinler.gercekcilik; $('#gercek-baslik').textContent = M.baslik; $('#gercek-alt').textContent = M.alt; $('#gercek-not').textContent = M.tablo_not;
  const G = veri.gercekcilik || []; const T = $('#gercek-tablo');
  if (!G.length) { T.replaceWith(el('div', { class: 'bos', id: 'gercek-tablo' }, '// Takım yaşı ve bütçe tablosu kaynaklarıyla derleniyor.')); return; }
  yasCubuklari(G);
  T.replaceChildren(el('thead', {}, el('tr', {}, ...['Takım', 'Kuruluş', 'Yaş', 'Bütçe (yıllık)', 'İlk büyük derece', 'Kaynak'].map(h => el('th', {}, h)))),
    el('tbody', {}, ...G.map(g => el('tr', { class: g.biz ? 'biz' : '' }, el('td', {}, (g.dogrulandi === false ? '⚠ ' : '') + g.takim), el('td', {}, g.kurulus || '—'), el('td', {}, g.yas || '—'), el('td', {}, g.butce || '—'), el('td', {}, g.ilkDerece || '—'), el('td', {}, g.kaynakUrl ? el('a', { href: g.kaynakUrl, target: '_blank', rel: 'noopener' }, g.kaynakAdi || 'kaynak') : '—')))));
}
function yasCubuklari(G) {
  const S = $('#yas-svg'); if (!S) return; const NS = 'http://www.w3.org/2000/svg';
  const g = (t, a, txt) => { const n = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); if (txt !== undefined) n.textContent = txt; return n; };
  const satir = G.filter(x => x.kurulus && /^\d{4}$/.test(String(x.kurulus))).map(x => ({ ad: x.takim.replace(/^İTÜ /, '').replace(/ (Takımı|Roket Grubu|Team|Ar-Ge)$/, ''), yas: Math.max(0, 2026 - +x.kurulus), derece: (String(x.ilkDerece || '').match(/\b(20\d\d)\b/) || [])[1], biz: !!x.biz, kurulus: +x.kurulus })).sort((a, b) => b.yas - a.yas);
  const SAT = 30, W = 720, H = Math.max(120, 34 + satir.length * SAT), L = 150, R = 60, iw = W - L - R, mx = Math.max(5, ...satir.map(s => s.yas)); S.setAttribute('viewBox', `0 0 ${W} ${H}`); S.replaceChildren();
  [0, 5, 10, 15, 20].filter(v => v <= mx).forEach(v => { const x = L + v / mx * iw; S.append(g('line', { x1: x, x2: x, y1: 16, y2: H - 10, stroke: 'rgba(31,42,46,.14)' })); S.append(g('text', { x, y: 11, 'text-anchor': 'middle' }, v + ' yıl')); });
  satir.forEach((s, i) => { const y = 26 + i * SAT; const bw = Math.max(3, s.yas / mx * iw); S.append(g('text', { x: L - 8, y: y + 12, 'text-anchor': 'end', class: 'ad' }, s.ad));
    S.append(g('rect', { x: L, y, width: bw, height: 16, class: 'cubuk' + (s.biz ? ' biz' : '') }));
    if (s.derece && s.derece > s.kurulus) { const dx = L + (s.derece - s.kurulus) / mx * iw; S.append(g('path', { d: `M${dx} ${y + 1} l-4 -7 h8 z`, class: 'derece' })); S.append(g('text', { x: dx + 7, y: y - 1, class: 'derece' }, `ilk derece ${s.derece - s.kurulus}. yılda`)); }
    S.append(g('text', { x: L + bw + 6, y: y + 12 }, s.biz ? '0 · başlıyoruz' : `${s.yas} yıl`)); });
  S.append(g('text', { x: L, y: H - 2 }, 'çubuk: kuruluştan bugüne · üçgen: kaynaklı ilk büyük derece'));
}
function neden() {
  const M = veri.metinler.nedensimdi; $('#neden-baslik').textContent = M.baslik;
  const S = (veri.sayilar || []).filter(s => s.sayi).slice(0, 8);
  $('#sayi-kartlar').replaceChildren(...(S.length ? S.map(s => el('div', { class: 'sk' }, el('b', {}, s.sayi), el('span', {}, s.etiket), s.kaynakUrl ? el('a', { href: s.kaynakUrl, target: '_blank', rel: 'noopener' }, s.kaynakAdi || 'kaynak') : null)) : [el('div', { class: 'bos' }, '// Sayı kartları kaynaklarıyla derleniyor.')]));
  $('#neden-kartlar').replaceChildren(...M.kartlar.map(k => el('div', { class: 'kart' }, el('b', {}, k.b), el('p', {}, yerDoldur(k.m)), ses(k.hirsli, k.rahat))));
}

/* --- baloncuk --- */
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
  arka.balonDinle(l => {
    if (!l.length) { G.replaceChildren(el('div', { class: 'gok-bos' }, 'Henüz kimse bir şey söylemedi.\nİlk baloncuk seninki olsun.')); return; }
    G.replaceChildren(...l.slice(0, 40).map((b, i) => {
      const yeni = !ilk && !gorulen.has(b.id); gorulen.add(b.id);
      const kim = [b.gorunum === 'isim' && b.ad ? b.ad : 'anonim', b.org, b.unvan, b.grup].filter(Boolean).join(' · ');
      const h = [...(b.id || String(i))].reduce((a, c) => a + c.charCodeAt(0), 0);
      return el('div', { class: 'balon' + (yeni ? ' yeni' : ''), style: `left:${(h * 7) % 70}%;top:${(h * 13) % 78}%;--dx:${(h % 30) - 15}px;--dy:${(h % 22) - 11}px;--sure:${14 + h % 10}s` }, el('span', {}, b.metin), el('span', { class: 'kim' }, kim));
    }));
    l.forEach(b => gorulen.add(b.id)); ilk = false;
  });
}

/* --- meraklısına & son --- */
function merak() {
  const M = veri.metinler.meraklisina; $('#merak-baslik').textContent = M.baslik; $('#merak-alt').textContent = M.alt;
  const T = veri.takimlar || [], B = veri.bolumler || [], S = veri.sayilar || [], G = veri.gercekcilik || [];
  const det = (b, ...c) => el('details', { class: 'merak' }, el('summary', {}, b), el('div', {}, ...c));
  $('#merak-icerik').replaceChildren(
    det('İTÜ proje takımları ve amblemleri', T.length ? el('div', { class: 'amblemler' }, ...T.filter(t => t.logoUrl).map(t => el('a', { class: 'amblem', href: t.resmiSite || '#', target: '_blank', rel: 'noopener' }, el('img', { src: t.logoUrl, alt: t.takim + ' amblemi', loading: 'lazy', width: 56, height: 56 }), el('span', {}, t.takim)))) : el('p', { class: 'bos' }, '// Takım listesi derleniyor.'), T.length ? el('p', { class: 'not' }, 'Amblemler tanıtım amaçlı, kaynak linkiyle; itiraz hâlinde kaldırılır.') : null),
    det('Bölüm bölüm ders karşılaştırması (tam)', B.length ? el('div', { class: 'tablo-sar' }, el('table', { class: 'tablo' }, el('thead', {}, el('tr', {}, ...['Bölüm', 'Senin dersin', 'Bizim dersimiz', 'Ortak iş', 'Hoca', 'Proje'].map(h => el('th', {}, h)))), el('tbody', {}, ...B.map(b => el('tr', {}, el('td', {}, b.bolum), el('td', {}, b.senin), el('td', {}, b.bizim), el('td', {}, b.ortakIs), el('td', {}, b.hocaSayisi ?? '—'), el('td', {}, b.projeSayisi ?? '—')))))) : el('p', { class: 'bos' }, '// Derleniyor.')),
    det('Kaynaklar', el('ul', { class: 'kaynaklar' }, ...[...S, ...G].filter(x => x.kaynakUrl).map(x => el('li', {}, el('a', { href: x.kaynakUrl, target: '_blank', rel: 'noopener' }, x.kaynakAdi || x.kaynakUrl), ' — ', x.etiket || x.takim || '')), ...(S.length + G.length ? [] : [el('li', {}, 'Derleniyor.')]))),
    det('Bu sayfa nasıl çalışır', el('p', {}, 'Düz HTML/CSS/JS, derleme yok. Oylar Firebase Firestore\'da anonim cihaz kimliğiyle (bir cihaz bir oy). Mesajlar anında yayınlanır; küfür ve bağlantı istemcide filtrelenir, uygunsuz mesaj sonradan gizlenir. Kaynak kodu GitHub\'da.'))
  );
}
function sonKart() {
  const S = veri.anket.son_kart; const K = $('#son-kart'); const kural = S.kurallar.find(k => k.kosul === durum.grup) || null;
  const satirlar = [];
  if (durum.eslesme.toplam) satirlar.push(`kaydırma eşleşmesi %${Math.round(100 * durum.eslesme.evet / durum.eslesme.toplam)}`);
  if (durum.test.toplam) satirlar.push(`bilgi testi ${durum.test.dogru}/${durum.test.toplam}`);
  if (durum.roller.length) satirlar.push('rol: ' + durum.roller.join(', '));
  K.replaceChildren(...[el('p', { class: 'yorum' }, S.baslik), kural ? el('p', { class: 'rol' }, kural.rol) : el('p', { class: 'kilitli' }, 'kapıyı seçince (01) burada sana göre bir rol çıkar'), el('p', {}, kural ? kural.metin : 'Yukarıdaki üç kapıdan biri yeter.'), satirlar.length ? el('p', { class: 'kilitli' }, satirlar.join(' · ')) : null].filter(Boolean));
  const M = veri.metinler.kapanis; $('#son-ozet').replaceChildren(ses(M.hirsli, M.rahat));
  $('#son-cta').replaceChildren(...S.cta.map((c, i) => el('a', { class: i === 0 ? 'birincil' : '', href: c.href }, c.etiket)));
}

/* ---------------- SÜSLER ---------------- */
function ilerleme() {
  const bar = $('#ilerleme-bar'), roz = $('#surpriz'), rm = $('#surpriz-metin'), balon = $('#ray-balon'); const bloklar = $$('main > section');
  const g = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); bar.style.width = (p * 100).toFixed(1) + '%';
    if (balon) balon.style.top = (90 - p * 80).toFixed(1) + '%';
    const kalan = bloklar.filter(b => b.getBoundingClientRect().top > innerHeight).length;
    if (kalan === 0) { roz.classList.add('acildi'); rm.textContent = 'Tropopoz: sana göre rol ↓'; roz.querySelector('.kilit').textContent = '🪂'; } else rm.textContent = `Tropopozda: sana göre rol · ${kalan} seviye kaldı`; };
  addEventListener('scroll', g, { passive: true }); g();
}
function gorunme() {
  const hedefler = $$('main .sar > *:not(.seviye), header.acilis .acilis-ic > *'); hedefler.forEach(h => h.classList.add('gel'));
  if (azalt || !('IntersectionObserver' in window)) { hedefler.forEach(h => h.classList.add('goster')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('goster'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); hedefler.forEach(h => io.observe(h));
}
function imlec() {
  if (dokunmatik || azalt) return; const I = $('#imlec'); document.body.classList.add('imlec-aktif'); I.style.display = 'block';
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const ciz = () => { x += (tx - x) * .35; y += (ty - y) * .35; I.style.transform = `translate(${x - 14}px,${y - 14}px)`; if (Math.abs(tx - x) + Math.abs(ty - y) > .3) raf = requestAnimationFrame(ciz); else raf = 0; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; I.classList.remove('gizli'); const h = e.target.closest('a,button,[role=button],summary,input,textarea,select,label,.kartd,.oy,.cip,.bk,.md-basamak'); I.classList.toggle('kod', !!h); if (!raf) raf = requestAnimationFrame(ciz); }, { passive: true });
  addEventListener('pointerdown', e => { for (let i = 0; i < 3; i++) { const d = el('span', { class: 'damla', style: `left:${e.clientX - 6 + i * 6}px;top:${e.clientY + 6}px;animation-delay:${i * 60}ms` }); document.body.append(d); setTimeout(() => d.remove(), 800); } });
  document.addEventListener('pointerleave', () => I.classList.add('gizli')); document.addEventListener('pointerenter', () => I.classList.remove('gizli'));
}
function izobar() {
  if (azalt) return; const c = $('#izobar'); const ctx = c.getContext('2d'); let W, H, t = 0, son = 0, calis = true;
  const boyut = () => { const d = Math.min(1.5, devicePixelRatio || 1); W = c.width = innerWidth * d; H = c.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); }; boyut(); addEventListener('resize', boyut);
  const N = 7; const faz = Array.from({ length: N }, (_, i) => i * 1.7);
  const kare = (ts) => { if (!calis) return; requestAnimationFrame(kare); if (ts - son < 42) return; son = ts; t += .004; const w = innerWidth, h = innerHeight; ctx.clearRect(0, 0, w, h); ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) { ctx.beginPath(); const y0 = h * (i + 1) / (N + 1); for (let x = 0; x <= w; x += 12) { const y = y0 + Math.sin(x / 180 + t * 3 + faz[i]) * 22 + Math.sin(x / 61 - t * 2 + faz[i] * 2) * 9; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = i % 3 === 0 ? 'rgba(240,179,92,.16)' : 'rgba(106,209,227,.14)'; ctx.stroke(); } };
  requestAnimationFrame(kare); document.addEventListener('visibilitychange', () => { calis = !document.hidden; if (calis) requestAnimationFrame(kare); });
}

/* ---------------- BAŞLAT ---------------- */
(async () => {
  await yukle();
  if (!veri.anket || !veri.metinler) { document.body.insertAdjacentHTML('afterbegin', '<p class="bos" style="margin:16px">Veri yüklenemedi (veri/*.json). Sayfayı bir sunucu üzerinden aç.</p>'); return; }
  if (durum.grup) document.documentElement.dataset.grup = durum.grup;
  await arkaKur();
  acilis(); sesYerlestir(); kapi(); vizyon(); merdiven(); karne(); mumkun(); deste(); test(); bolumler(); gercek(); neden(); coklu(); canli(); anlatilar(); baloncuk(); merak(); sonKart();
  gorunme(); ilerleme(); imlec();
})();
