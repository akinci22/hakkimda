/* ING 201A süreç portfolyosu — dergi makalesi düzeni (v2). Veri: veri.js (KAYNAKLAR), adimlar.js (DERS, ADIMLAR), yorumlar.js (YORUMLAR).
   Telif: tam metin yalnız CC BY makalelerde (k.pdf dolu); makale özetleri kopyalanmaz, yalnız kısa çapa ifadeleri. */
(function () {
  "use strict";
  var D = window.DERS, A = window.ADIMLAR || [], K = window.KAYNAKLAR || [], Y = window.YORUMLAR || {};
  var dil = "en";
  try { dil = localStorage.getItem("ing201a-dil") || "en"; } catch (e) { /* depolama kapalı */ }

  var UI = {
    atla: { en: "Skip to the article", tr: "Makaleye geç" },
    ustAd: { en: "Research Process Portfolio", tr: "Araştırma Süreci Portfolyosu" },
    portfoy: { en: "Portfolio ↗", tr: "Portföyüm ↗" },
    icindekiler: { en: "Contents", tr: "İçindekiler" },
    ozetBaslik: { en: "Summary", tr: "Özet" }, anahtar: { en: "Keywords:", tr: "Anahtar kelimeler:" },
    bilgiBaslik: { en: "Page information", tr: "Sayfa bilgisi" }, atifBaslik: { en: "Cite this page", tr: "Bu sayfaya atıf" },
    gYorum: { en: "Instructor comments ↗", tr: "Hoca yorumları ↗" },
    pdfAc: { en: "Open PDF ↗", tr: "PDF'i aç ↗" },
    tur: { en: "Course portfolio · Research writing", tr: "Ders portfolyosu · Araştırma yazısı" },
    baslik: { en: "Research process portfolio: assignments, sources and evidence in ING 201A", tr: "Araştırma süreci portfolyosu: ING 201A'da ödevler, kaynaklar ve kanıt" },
    kurum: { en: "Department of Meteorological Engineering, Istanbul Technical University, Istanbul, Türkiye", tr: "Meteoroloji Mühendisliği Bölümü, İstanbul Teknik Üniversitesi, İstanbul, Türkiye" },
    ozet: {
      en: "This page documents my work in ING 201A, Essentials of Research Paper Writing (Fall 2026, CRN 10466). Section 3 lists the assignment sequence with what each step required and what I submitted; Section 4 presents the four peer-reviewed articles I use, with the location of each part of the article and the full text where the licence allows it. Instructor comments are collected in Section 5 and under each step. My paragraph texts are kept in my course folder rather than on the web.",
      tr: "Bu sayfa ING 201A, Araştırma Yazısının Temelleri (Güz 2026, CRN 10466) dersindeki çalışmamı belgeler. Bölüm 3 ödev sırasını, her adımda isteneni ve teslim ettiğimi verir; Bölüm 4 kullandığım dört hakemli makaleyi, makalenin her kısmının yerini ve lisansın izin verdiği yerde tam metni sunar. Hoca yorumları Bölüm 5'te ve her adımın altında toplanır. Paragraf metinlerim web'de değil, ders klasörümde durur."
    },
    anahtarMetin: { en: "research process; academic sources; evidence; numerical weather prediction; precipitation post-processing; deep learning; flood forecasting", tr: "araştırma süreci; akademik kaynak; kanıt; sayısal hava tahmini; yağış son işlemesi; derin öğrenme; taşkın tahmini" },
    b1: { en: "Introduction", tr: "Giriş" }, b2: { en: "Research process", tr: "Araştırma süreci" }, b3: { en: "Assignments", tr: "Ödevler" },
    b4: { en: "Sources", tr: "Kaynaklar" }, b5: { en: "Instructor comments", tr: "Hoca yorumları" }, b6: { en: "Statements", tr: "Beyanlar" }, kaynakca: { en: "References", tr: "Kaynakça" },
    giris1: {
      en: "The course builds one synthesis essay in a group of three: each student researches one subtopic and writes two body paragraphs, and the group writes the introduction and conclusion. All graded writing is done in class, by hand. The steps below follow the course schedule.",
      tr: "Ders üç kişilik grupta tek bir sentez yazısı kurar: her öğrenci bir alt başlığı araştırır ve iki gövde paragrafı yazar, giriş ve sonucu grup yazar. Notlu bütün yazılar sınıfta, elle yazılır. Aşağıdaki adımlar ders planını izler."
    },
    giris2: { en: "Each step in Section 3 has three parts: the requirement (from the instructor's documents), my submission, and the instructor's comment.", tr: "Bölüm 3'teki her adım üç kısımdan oluşur: gereklilik (hocanın belgelerinden), teslimim ve hocanın yorumu." },
    t1: { en: "Assessment components.", tr: "Değerlendirme bileşenleri." }, t2: { en: "Assignment sequence. Select a row to go to the step.", tr: "Ödev sırası. Adıma gitmek için satırı seç." },
    t3: { en: "The four sources and their reliability (CRAAP facts).", tr: "Dört kaynak ve güvenilirlikleri (CRAAP olguları)." },
    tYer: { en: "Location of content in", tr: "İçeriğin yeri:" },
    s1: { en: "Figure 1.", tr: "Şekil 1." },
    sekilAc: { en: "The research and writing sequence of the course. Filled: weeks passed; ringed: this week; open: upcoming.", tr: "Dersin araştırma ve yazım sırası. Dolu: geçen haftalar; halkalı: bu hafta; boş: gelecek." },
    bilesen: { en: "Component", tr: "Bileşen" }, agirlik: { en: "Weight", tr: "Ağırlık" }, hafta: { en: "Week", tr: "Hafta" },
    adim: { en: "Step", tr: "Adım" }, gorev: { en: "Task", tr: "Görev" }, not: { en: "Grade", tr: "Not" }, durum: { en: "Status", tr: "Durum" },
    durumlar: { gecti: { en: "Past", tr: "Geçti" }, "bu-hafta": { en: "This week", tr: "Bu hafta" }, gelecek: { en: "Upcoming", tr: "Gelecek" } },
    gereklilik: { en: "Requirement", tr: "Gereklilik" }, belgeler: { en: "Documents", tr: "Belgeler" }, teslim: { en: "My submission", tr: "Teslimim" },
    yorum: { en: "Instructor", tr: "Hoca" }, yorumYok: { en: "No comment yet.", tr: "Henüz yorum yok." }, yorumEkle: { en: "Add a comment ↗", tr: "Yorum ekle ↗" },
    eksik: { en: "not yet added", tr: "henüz eklenmedi" }, gelmedi: { en: "this step has not taken place yet", tr: "bu adım henüz gelmedi" },
    kaynak: { en: "Source", tr: "Kaynak" }, yil: { en: "Year", tr: "Yıl" }, dergi: { en: "Journal (peer-reviewed)", tr: "Dergi (hakemli)" }, atifSay: { en: "Citations", tr: "Atıf" }, erisim: { en: "Full text here", tr: "Tam metin burada" },
    evet: { en: "yes", tr: "evet" }, hayir: { en: "publisher link", tr: "yayıncı bağlantısı" },
    t3not: { en: "Citation counts from OpenAlex on 2 November 2026. All four articles have methods and data sections and a reference list.", tr: "Atıf sayıları OpenAlex'ten, 2 Kasım 2026. Dört makalenin de yöntem ve veri bölümü ile kaynakçası var." },
    calisma: { en: "Study", tr: "Çalışma" }, lisans: { en: "Licence", tr: "Lisans" },
    kisim: { en: "Part", tr: "Kısım" }, bolum: { en: "Section", tr: "Bölüm" }, sayfa: { en: "Page", tr: "Sayfa" }, ifade: { en: "Words in the article", tr: "Makaledeki ifade" }, gor: { en: "View", tr: "Gör" },
    kanitBaslik: { en: "Evidence used", tr: "Kullandığım kanıt" },
    kanitYok: { en: "Filled from my note-taking form: each piece of evidence (A1, A2, B1, B2) appears here with its page and is highlighted in the full text.", tr: "Not alma formumdan dolar: her kanıt (A1, A2, B1, B2) sayfasıyla burada görünür ve tam metinde vurgulanır." },
    tamMetin: { en: "Read the full text", tr: "Tam metni oku" }, yayinci: { en: "Full text at the publisher ↗", tr: "Yayıncıda tam metin ↗" },
    telif: { en: "Published under the publisher's copyright; not reproduced here.", tr: "Yayıncı telifi altında; burada çoğaltılmadı." },
    tur2: { en: "Type", tr: "Tür" }, notum: { en: "My note", tr: "Notum" }, dusuncem: { en: "My thoughts", tr: "Düşüncem" },
    yorumGenel: { en: "The instructor can comment in a Google Doc in my course folder, under the heading of each step. Comments are copied to this page.", tr: "Hoca, ders klasörümdeki Google Doc'ta her adımın başlığı altına yorum yazabilir. Yorumlar bu sayfaya aktarılır." },
    genel: { en: "General", tr: "Genel" }, kaynaklarY: { en: "On the sources", tr: "Kaynaklar üzerine" },
    beyanYZ: { en: "Use of AI", tr: "Yapay zekâ kullanımı" },
    beyanYZm: { en: "The layout of this page, the source records (citations, location of each section) and the reading tool were prepared with AI assistance. The ING 201A AI policy allows AI to support finding and understanding sources. Every claim, note, analysis and paragraph presented as mine is written by me; paragraphs are written by hand in class.", tr: "Bu sayfanın düzeni, kaynak kayıtları (künyeler, bölümlerin yeri) ve okuma aracı yapay zekâ desteğiyle hazırlandı. ING 201A YZ politikası kaynak bulma ve anlamada bu desteğe izin verir. Benim diye sunulan her iddia, not, analiz ve paragraf benim yazdığımdır; paragraflar sınıfta elle yazılır." },
    beyanMetin: { en: "Availability of my writing", tr: "Yazılarımın erişimi" },
    beyanMetinm: { en: "My paragraphs and the final essay are checked with Turnitin. To avoid my own text being matched to this page, they are not published here; they are available to the instructor in my course folder.", tr: "Paragraflarım ve final yazım Turnitin'le kontrol edilir. Kendi metnimin bu sayfayla eşleşmemesi için burada yayımlanmaz; hoca ders klasörümden görebilir." },
    beyanLisans: { en: "Reproduced articles", tr: "Çoğaltılan makaleler" },
    beyanLisansm: { en: "Three articles are reproduced in full under Creative Commons Attribution licences (Yucel & Onen, 2014: CC BY 3.0; Hess & Boers, 2022 and Patakchi Yousefi et al., 2024: CC BY 4.0). Images were compressed for faster loading; the text is unchanged. The article published under publisher copyright is linked, not copied.", tr: "Üç makale Creative Commons Attribution lisanslarıyla tam olarak çoğaltıldı (Yucel & Onen, 2014: CC BY 3.0; Hess & Boers, 2022 ve Patakchi Yousefi et al., 2024: CC BY 4.0). Görseller hızlı açılması için sıkıştırıldı; metin değiştirilmedi. Yayıncı telifli makaleye yalnız bağlantı verildi." },
    ders: { en: "Course", tr: "Ders" }, crn: { en: "CRN", tr: "CRN" }, donem: { en: "Term", tr: "Dönem" }, ogrenci: { en: "Student", tr: "Öğrenci" }, guncel: { en: "Comments updated", tr: "Yorumlar güncel" }, kaynakSay: { en: "Sources", tr: "Kaynak" },
    okNot: { en: "Marked in the text:", tr: "Metinde işaretli:" }, okCapa: { en: "parts of the article (Table)", tr: "makalenin kısımları (tablo)" }, okKanit: { en: "evidence I used", tr: "kullandığım kanıt" },
    yukleniyor: { en: "Loading the article…", tr: "Makale açılıyor…" }, pdfHata: { en: "The PDF could not be displayed here.", tr: "PDF burada gösterilemedi." },
    figDugum: {
      en: [["Topic", "W1"], ["Claim", "W2"], ["Sources", "W3"], ["Thesis &", "outline", "W4–6"], ["Note-taking", "form", "W6–7"], ["Paragraph A", "W7–8"], ["Paragraph B", "W9"], ["Intro &", "conclusion", "W10–12"], ["Final", "essay", "W13"]],
      tr: [["Konu", "H1"], ["İddia", "H2"], ["Kaynaklar", "H3"], ["Tez ve", "outline", "H4–6"], ["Not alma", "formu", "H6–7"], ["Paragraf A", "H7–8"], ["Paragraf B", "H9"], ["Giriş ve", "sonuç", "H10–12"], ["Final", "yazısı", "H13"]]
    }
  };
  var FIG_DURUM = ["gecti", "gecti", "gecti", "gecti", "bu-hafta", "bu-hafta", "gelecek", "gelecek", "gelecek"];
  function t(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[dil] != null ? o[dil] : o.en; }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function tablo(no, baslik, basliklar, satirlar, dipnot) {
    var tb = el("tbody");
    satirlar.forEach(function (s) { tb.appendChild(s); });
    return el("div", { class: "tablo-kap" }, [
      el("p", { class: "baslik" }, [el("b", { text: (dil === "tr" ? "Tablo " : "Table ") + no + ". " }), document.createTextNode(baslik)]),
      el("div", { class: "kaydir" }, [el("table", null, [el("thead", null, [el("tr", null, basliklar.map(function (b) { return el("th", { scope: "col", text: b }); }))]), tb])]),
      dipnot ? el("p", { class: "not-dipnot", text: dipnot }) : null
    ]);
  }
  function h2(no, metin, id) { return el("h2", { class: "bb", id: id }, [el("span", { class: "no", text: no }), document.createTextNode(metin)]); }

  /* ---------- Şekil 1 ---------- */
  function sekil() {
    var dug = t(UI.figDugum), n = dug.length, W = 900, H = 150, x0 = 50, adim = (W - 2 * x0) / (n - 1), y = 44;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="fig1"><title id="fig1">' + t(UI.sekilAc) + '</title>';
    s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + (W - x0) + '" y2="' + y + '" stroke="var(--cizgi)" stroke-width="2"/>';
    var sonGecti = FIG_DURUM.lastIndexOf("gecti");
    s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + (x0 + adim * (sonGecti + 1)) + '" y2="' + y + '" stroke="var(--metin)" stroke-width="2"/>';
    dug.forEach(function (d, i) {
      var x = x0 + adim * i, du = FIG_DURUM[i];
      if (du === "gecti") s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="var(--metin)"/>';
      else if (du === "bu-hafta") s += '<circle cx="' + x + '" cy="' + y + '" r="13" fill="none" stroke="var(--vurgu)" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="var(--vurgu)"/>';
      else s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="var(--kagit)" stroke="var(--metin-3)" stroke-width="2"/>';
      var satir = d.slice(0, -1), hf = d[d.length - 1];
      s += '<text x="' + x + '" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--metin-3)">' + hf + '</text>';
      satir.forEach(function (m, j) { s += '<text x="' + x + '" y="' + (82 + j * 17) + '" text-anchor="middle" font-size="14" font-weight="' + (du === "bu-hafta" ? 700 : 400) + '" fill="' + (du === "gelecek" ? "var(--metin-2)" : "var(--metin)") + '">' + m + '</text>'; });
    });
    return s + "</svg>";
  }

  /* ---------- makale ---------- */
  function ciz() {
    document.documentElement.lang = dil;
    document.querySelectorAll("[data-t]").forEach(function (n) { var k = n.getAttribute("data-t"); if (UI[k]) n.textContent = t(UI[k]); });
    document.getElementById("dil").textContent = dil === "en" ? "TR" : "EN";
    document.getElementById("tur").textContent = t(UI.tur);
    document.getElementById("baslik").textContent = t(UI.baslik);
    document.getElementById("kurum").innerHTML = "<sup>1</sup> " + t(UI.kurum);
    document.getElementById("ozetMetin").textContent = t(UI.ozet);
    document.getElementById("anahtarMetin").textContent = t(UI.anahtarMetin);
    document.getElementById("yorumBag").href = D.yorumDoc;
    document.getElementById("altYazi").textContent = "© 2026 " + D.ogrenci + " · " + D.kod + " · " + t(D.donem);

    var bl = document.getElementById("bilgiListe"); bl.innerHTML = "";
    [[UI.ders, D.kod + " — " + t(D.ad)], [UI.crn, D.crn], [UI.donem, t(D.donem)], [UI.ogrenci, D.ogrenci], [UI.kaynakSay, String(K.length)], [UI.guncel, window.YORUM_GUNCEL || "—"]]
      .forEach(function (r) { bl.appendChild(el("dt", { text: t(r[0]) })); bl.appendChild(el("dd", { text: r[1] })); });
    document.getElementById("atifMetin").innerHTML = "Akıncı, Ö. F. (2026). <i>Research process portfolio: ING 201A</i> [Web page]. https://akinci22.github.io/hakkimda/ing201a/";

    var g = document.getElementById("govde"); g.innerHTML = "";
    var ic = [];

    /* 1 Giriş */
    var b1 = el("section", { class: "bolum", "aria-labelledby": "b1" }, [h2("1", t(UI.b1), "b1"), el("p", { text: t(UI.giris1) }), el("p", { text: t(UI.giris2) })]);
    b1.appendChild(tablo("1", t(UI.t1), [t(UI.bilesen), t(UI.agirlik), t(UI.hafta)], D.notlar.map(function (n, i) {
      var hf = ["W6", "W9", "W12", "W13", dil === "tr" ? "final dönemi" : "final period"][i];
      return el("tr", null, [el("td", { text: t(n.ad) }), el("td", { class: "sayi", text: dil === "tr" ? "%" + n.pay : n.pay + "%" }), el("td", { text: hf })]);
    })));
    g.appendChild(b1); ic.push(["b1", "1 " + t(UI.b1)]);

    /* 2 Süreç — Şekil 1 */
    var fig = el("figure", null, [el("div", { class: "sekil", html: sekil() }), el("figcaption", null, [el("b", { text: t(UI.s1) + " " }), document.createTextNode(t(UI.sekilAc))])]);
    g.appendChild(el("section", { class: "bolum", "aria-labelledby": "b2" }, [h2("2", t(UI.b2), "b2"), fig])); ic.push(["b2", "2 " + t(UI.b2)]);

    /* 3 Ödevler */
    var b3 = el("section", { class: "bolum", "aria-labelledby": "b3" }, [h2("3", t(UI.b3), "b3")]);
    b3.appendChild(tablo("2", t(UI.t2), [t(UI.adim), t(UI.hafta), t(UI.gorev), t(UI.not), t(UI.durum)], A.map(function (a, i) {
      return el("tr", { class: "tikla", tabindex: "0", onclick: function () { git(a.id); }, onkeydown: function (e) { if (e.key === "Enter") git(a.id); } }, [
        el("td", { class: "sayi", text: "3." + (i + 1) }), el("td", { class: "sayi", text: a.hafta }), el("td", { text: t(a.ad) }),
        el("td", { text: a.puan ? t(a.puan) : "—" }), el("td", null, [el("span", { class: "durum " + a.durum, text: t(UI.durumlar[a.durum]) })])
      ]);
    })));
    A.forEach(function (a, i) {
      var dl = el("dl", { class: "etiketli" });
      dl.appendChild(el("dt", { text: t(UI.gereklilik) }));
      dl.appendChild(el("dd", null, [el("ul", null, t(a.istenen).map(function (s) { return el("li", { text: s }); }))]));
      dl.appendChild(el("dt", { text: t(UI.belgeler) })); dl.appendChild(el("dd", { class: "kaynakbelge", text: a.belge }));
      var tes = el("dd");
      if (!a.benim.length) tes.appendChild(el("span", { class: "eksik", text: t(UI.gelmedi) }));
      a.benim.forEach(function (b) {
        if (b.tur === "eksik") tes.appendChild(el("div", null, [document.createTextNode(t(b) + " "), el("span", { class: "eksik", text: t(UI.eksik) })]));
        else if (b.tur === "bag") tes.appendChild(el("div", null, [el("a", { href: D[b.url] || b.url, target: "_blank", rel: "noopener", text: t(b) + " ↗" })]));
        else tes.appendChild(el("div", { text: t(b) }));
      });
      if (a.kaynaklar) tes.appendChild(el("div", null, a.kaynaklar.map(function (kid, j) {
        var k = K.find(function (x) { return x.id === kid; });
        return el("span", null, [document.createTextNode(j ? "; " : "("), el("a", { href: "#k-" + kid, text: k ? k.kisa : kid }), document.createTextNode(j === a.kaynaklar.length - 1 ? ")" : "")]);
      })));
      dl.appendChild(el("dt", { text: t(UI.teslim) })); dl.appendChild(tes);
      dl.appendChild(el("dt", { text: t(UI.yorum) })); dl.appendChild(yorumDd(a.id));
      b3.appendChild(el("section", { id: a.id, "aria-labelledby": "h-" + a.id }, [
        el("h3", { id: "h-" + a.id }, [el("span", { class: "no", text: "3." + (i + 1) }), document.createTextNode(t(a.ad)),
          el("span", { class: "meta", text: a.hafta + " · " + t(a.tarih) + (a.puan ? " · " + t(a.puan) : "") + " · " + t(UI.durumlar[a.durum]) })]),
        dl
      ]));
    });
    g.appendChild(b3); ic.push(["b3", "3 " + t(UI.b3)]);

    /* 4 Kaynaklar */
    var b4 = el("section", { class: "bolum", "aria-labelledby": "b4" }, [h2("4", t(UI.b4), "b4")]);
    b4.appendChild(tablo("3", t(UI.t3), [t(UI.kaynak), t(UI.yil), t(UI.dergi), t(UI.atifSay), t(UI.erisim)], K.map(function (k) {
      return el("tr", { class: "tikla", tabindex: "0", onclick: function () { git("k-" + k.id); }, onkeydown: function (e) { if (e.key === "Enter") git("k-" + k.id); } }, [
        el("th", { scope: "row", text: k.kisa }), el("td", { class: "sayi", text: String(k.yil) }), el("td", { class: "italik", text: k.dergi }),
        el("td", { class: "sayi", text: String(k.atif) }), el("td", { text: k.pdf ? t(UI.evet) + " · " + k.lisans.ad : t(UI.hayir) })
      ]);
    }), t(UI.t3not)));
    K.forEach(function (k, i) {
      var no = "4." + (i + 1), s = el("section", { id: "k-" + k.id, "aria-labelledby": "h-k-" + k.id });
      s.appendChild(el("h3", { id: "h-k-" + k.id }, [el("span", { class: "no", text: no }), document.createTextNode(k.kisa), el("span", { class: "meta", text: k.dergi + " · " + k.yil + " · " + t(UI.lisans) + ": " + k.lisans.ad })]));
      s.appendChild(el("p", { class: "referans", html: k.apa.replace(/(https:\/\/doi\.org\/\S+)/, '<a href="$1" target="_blank" rel="noopener">$1</a>') }));
      s.appendChild(el("dl", { class: "etiketli" }, [el("dt", { text: t(UI.calisma) }), el("dd", { text: t(k.ozet) })]));
      s.appendChild(tablo(String(4 + i), t(UI.tYer) + " " + k.kisa + ".", [t(UI.kisim), t(UI.bolum), t(UI.sayfa), t(UI.ifade), ""], k.yerler.map(function (y, yi) {
        var ifade = el("td"), gor = el("td");
        y.capalar.forEach(function (c, ci) {
          ifade.appendChild(el("div", { class: "italik", text: "“" + c.metin + "”" }));
          if (k.pdf && c.yer) gor.appendChild(el("div", null, [el("button", { class: "dugme kucuk", type: "button", "aria-label": t(UI.gor) + " " + c.yer.s, text: (dil === "tr" ? "s. " : "p. ") + c.yer.s + " →", onclick: function () { okuyucuAc(k.id, c.yer.s, "c" + yi + "-" + ci); } })]));
        });
        return el("tr", null, [el("th", { scope: "row", text: dil === "tr" ? y.ne_tr : y.ne_en }), el("td", { text: y.bolum }), el("td", { class: "sayi", text: y.sayfa }), ifade, gor]);
      })));
      s.appendChild(el("p", { class: "kanit-baslik" }, [el("b", { text: t(UI.kanitBaslik) })]));
      if (!k.kanit.length) s.appendChild(el("p", { class: "kutu-not", text: t(UI.kanitYok) }));
      k.kanit.forEach(function (e, ei) {
        var d = el("div", { class: "kanit" }, [el("span", { class: "etk", text: e.etiket + (e.yer ? " · " + (dil === "tr" ? "s. " : "p. ") + e.yer.s : "") })]);
        if (e.alinti) d.appendChild(el("blockquote", { text: "“" + e.alinti + "”" }));
        var dl2 = el("dl", { class: "etiketli" });
        [[UI.tur2, e.tur], [UI.notum, e.not], [UI.dusuncem, e.dusunce]].forEach(function (r) { if (r[1]) { dl2.appendChild(el("dt", { text: t(r[0]) })); dl2.appendChild(el("dd", { text: r[1] })); } });
        d.appendChild(dl2);
        if (k.pdf && e.yer) d.appendChild(el("button", { class: "dugme kucuk", type: "button", text: t(UI.gor), onclick: function () { okuyucuAc(k.id, e.yer.s, "k" + ei); } }));
        s.appendChild(d);
      });
      s.appendChild(el("div", { class: "dugme-satir" }, k.pdf
        ? [el("button", { class: "dugme dolu", type: "button", text: t(UI.tamMetin) + " (" + k.sayfa + (dil === "tr" ? " sayfa)" : " pages)"), onclick: function () { okuyucuAc(k.id); } }), el("a", { class: "dugme", href: k.doi, target: "_blank", rel: "noopener", text: "DOI ↗" })]
        : [el("a", { class: "dugme dolu", href: k.doi, target: "_blank", rel: "noopener", text: t(UI.yayinci) }), el("span", { class: "not-dipnot", text: t(UI.telif) })]));
      b4.appendChild(s);
    });
    g.appendChild(b4); ic.push(["b4", "4 " + t(UI.b4)]);
    K.forEach(function (k, i) { ic.push(["k-" + k.id, "4." + (i + 1) + " " + k.kisa, true]); });

    /* 5 Yorumlar */
    g.appendChild(el("section", { class: "bolum", "aria-labelledby": "b5" }, [h2("5", t(UI.b5), "b5"), el("p", { text: t(UI.yorumGenel) }),
      el("dl", { class: "etiketli" }, [el("dt", { text: t(UI.genel) }), yorumDd("genel"), el("dt", { text: t(UI.kaynaklarY) }), yorumDd("kaynaklar")])]));
    ic.push(["b5", "5 " + t(UI.b5)]);

    /* 6 Beyanlar */
    g.appendChild(el("section", { class: "bolum beyan", "aria-labelledby": "b6" }, [h2("6", t(UI.b6), "b6"),
      el("h3", { text: t(UI.beyanYZ) }), el("p", { text: t(UI.beyanYZm) }),
      el("h3", { text: t(UI.beyanMetin) }), el("p", { text: t(UI.beyanMetinm) }),
      el("h3", { text: t(UI.beyanLisans) }), el("p", { text: t(UI.beyanLisansm) })]));
    ic.push(["b6", "6 " + t(UI.b6)]);

    /* Kaynakça */
    g.appendChild(el("section", { class: "bolum", "aria-labelledby": "kc" }, [el("h2", { class: "bb", id: "kc", text: t(UI.kaynakca) }),
      el("ol", { class: "kaynakca" }, K.slice().sort(function (a, b) { return a.apa.localeCompare(b.apa); }).map(function (k) {
        return el("li", { html: k.apa.replace(/(https:\/\/doi\.org\/\S+)/, '<a href="$1" target="_blank" rel="noopener">$1</a>') });
      }))]));
    ic.push(["kc", t(UI.kaynakca)]);

    var il = document.getElementById("icListe"); il.innerHTML = "";
    ic.forEach(function (x) { il.appendChild(el("li", x[2] ? { class: "alt-oge" } : null, [el("a", { href: "#" + x[0], "data-hedef": x[0], text: x[1] })])); });
    izle();
  }

  function yorumDd(anahtar) {
    var dd = el("dd"), liste = Y[anahtar] || [];
    if (!liste.length) dd.appendChild(el("span", { class: "eksik", text: t(UI.yorumYok) }));
    liste.forEach(function (y) { dd.appendChild(el("div", { class: "yorum" }, [document.createTextNode(y.metin), y.tarih ? el("small", { text: y.tarih }) : null])); });
    dd.appendChild(el("div", null, [el("a", { class: "yorum-bag", href: D.yorumDoc, target: "_blank", rel: "noopener", text: t(UI.yorumEkle) })]));
    return dd;
  }
  function git(id) { var n = document.getElementById(id); if (n) { n.scrollIntoView({ block: "start" }); history.replaceState(null, "", "#" + id); } }

  /* içindekiler: etkin bölüm */
  var izleyici = null;
  function izle() {
    if (izleyici) izleyici.disconnect();
    var linkler = Array.prototype.slice.call(document.querySelectorAll("#icListe a"));
    izleyici = new IntersectionObserver(function (g) {
      g.forEach(function (x) {
        if (x.isIntersecting) linkler.forEach(function (a) { a.classList.toggle("etkin", a.getAttribute("data-hedef") === x.target.id); });
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    linkler.forEach(function (a) { var n = document.getElementById(a.getAttribute("data-hedef")); if (n) izleyici.observe(n); });
  }

  /* ---------- tam metin okuyucu (PDF.js) ---------- */
  var ok = document.getElementById("okuyucu"), okG = document.getElementById("okGovde"), aktifPdf = null, gozcu = null, sayfaGozcu = null;
  document.getElementById("kapat").addEventListener("click", function () { ok.close(); });
  ok.addEventListener("click", function (e) { if (e.target === ok) ok.close(); });

  function okuyucuAc(id, sayfa, anahtar) {
    var k = K.find(function (x) { return x.id === id; });
    if (!k || !k.pdf) return;
    document.getElementById("okTur").textContent = k.dergi + " · " + k.yil + " · " + k.lisans.ad;
    document.getElementById("okTur").setAttribute("lang", "en");
    document.getElementById("okBaslik").textContent = k.kisa;
    document.getElementById("okPdf").href = k.pdf;
    document.getElementById("okNot").innerHTML = "";
    document.getElementById("okNot").append(t(UI.okNot), el("span", { class: "ornek c" }), t(UI.okCapa), el("span", { class: "ornek k" }), t(UI.okKanit));
    if (!ok.open) ok.showModal();
    if (aktifPdf === k.id) { if (sayfa) gotur(sayfa, anahtar); return; }
    aktifPdf = k.id; okG.innerHTML = ""; okG.appendChild(el("p", { class: "yukleniyor", text: t(UI.yukleniyor) }));
    if (!window.pdfjsLib) { okG.innerHTML = ""; okG.appendChild(el("p", { class: "yukleniyor", text: t(UI.pdfHata) })); aktifPdf = null; return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var isaret = {};
    function ekle(s, kutular, sinif, a, e) { (isaret[s] = isaret[s] || []).push({ k: kutular, c: sinif, a: a, e: e }); }
    k.yerler.forEach(function (y, yi) { y.capalar.forEach(function (c, ci) { if (c.yer) ekle(c.yer.s, c.yer.k, "capa", "c" + yi + "-" + ci); }); });
    k.kanit.forEach(function (e, ei) { if (e.yer) ekle(e.yer.s, e.yer.k, "kanit-v", "k" + ei, e.etiket); });
    var belge = null;
    pdfjsLib.getDocument(k.pdf).promise.then(function (pdf) { belge = pdf; return pdf.getPage(1); }).then(function (p1) {
      var pdf = belge, v1 = p1.getViewport({ scale: 1 }), oran = v1.width + " / " + v1.height;
      okG.innerHTML = "";
      if (gozcu) gozcu.disconnect(); if (sayfaGozcu) sayfaGozcu.disconnect();
      gozcu = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting && !x.target.dataset.cizildi) { x.target.dataset.cizildi = "1"; sayfaCiz(pdf, x.target); } }); }, { root: okG, rootMargin: "800px 0px" });
      sayfaGozcu = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting) document.getElementById("okSayfa").textContent = (dil === "tr" ? "Sayfa " : "Page ") + x.target.dataset.s + " / " + pdf.numPages; }); }, { root: okG, rootMargin: "-45% 0px -45% 0px" });
      for (var s = 1; s <= pdf.numPages; s++) {
        var d = el("div", { class: "sayfa", id: "sayfa-" + s, "data-s": String(s), style: "aspect-ratio: " + oran }, [el("span", { class: "sno", text: s + " / " + pdf.numPages })]);
        (isaret[s] || []).forEach(function (m) {
          m.k.forEach(function (r, ri) {
            d.appendChild(el("div", { class: "isaret " + m.c, "data-a": m.a, style: "left:" + (r[0] * 100) + "%;top:" + (r[1] * 100) + "%;width:" + ((r[2] - r[0]) * 100) + "%;height:" + ((r[3] - r[1]) * 100) + "%" }));
            if (ri === 0 && m.e) d.appendChild(el("span", { class: "isaret-etiket", text: m.e, style: "left:" + (r[0] * 100) + "%;top:" + (r[1] * 100) + "%" }));
          });
        });
        okG.appendChild(d); gozcu.observe(d); sayfaGozcu.observe(d);
      }
      if (sayfa) setTimeout(function () { gotur(sayfa, anahtar); }, 60);
    }).catch(function () { okG.innerHTML = ""; okG.appendChild(el("p", { class: "yukleniyor", text: t(UI.pdfHata) })); aktifPdf = null; });
  }
  function sayfaCiz(pdf, d) {
    pdf.getPage(Number(d.dataset.s)).then(function (p) {
      var v1 = p.getViewport({ scale: 1 });
      d.style.aspectRatio = v1.width + " / " + v1.height;
      var olcek = Math.min(2.6, (d.clientWidth || 820) / v1.width * (window.devicePixelRatio || 1));
      var v = p.getViewport({ scale: olcek }), c = document.createElement("canvas");
      c.width = Math.floor(v.width); c.height = Math.floor(v.height); c.setAttribute("aria-label", "page " + d.dataset.s);
      d.insertBefore(c, d.firstChild);
      p.render({ canvasContext: c.getContext("2d"), viewport: v });
    });
  }
  function gotur(s, anahtar) {
    var d = document.getElementById("sayfa-" + s);
    if (!d) return;
    d.scrollIntoView({ block: "start" });
    [450, 1300].forEach(function (ms) { setTimeout(function () { d.scrollIntoView({ block: "start" }); }, ms); });
    if (anahtar) d.querySelectorAll('[data-a="' + anahtar + '"]').forEach(function (m) { m.classList.remove("parla"); void m.offsetWidth; m.classList.add("parla"); });
  }

  document.getElementById("dil").addEventListener("click", function () {
    dil = dil === "en" ? "tr" : "en";
    try { localStorage.setItem("ing201a-dil", dil); } catch (e) { /* depolama kapalı */ }
    ciz();
  });

  ciz();
  if (location.hash) { var h = document.getElementById(location.hash.slice(1)); if (h) setTimeout(function () { h.scrollIntoView({ block: "start" }); }, 50); }
})();
