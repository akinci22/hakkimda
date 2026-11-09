/* ING 201A süreç portfolyosu — arayüz. Veri: veri.js (KAYNAKLAR), adimlar.js (DERS, ADIMLAR), yorumlar.js (YORUMLAR). */
(function () {
  "use strict";
  var D = window.DERS, A = window.ADIMLAR || [], K = window.KAYNAKLAR || [], Y = window.YORUMLAR || {};
  var dil = "en";
  try { dil = localStorage.getItem("ing201a-dil") || "en"; } catch (e) { /* tarayıcı depolaması kapalı */ }

  var UI = {
    atla: { en: "Skip to the steps", tr: "Adımlara geç" },
    mYol: { en: "Steps", tr: "Adımlar" }, mKaynak: { en: "Sources", tr: "Kaynaklar" }, mNasil: { en: "About this page", tr: "Bu sayfa hakkında" },
    portfoy: { en: "Portfolio ↗", tr: "Portföyüm ↗" },
    baslik: { en: "Research process portfolio", tr: "Araştırma süreci portfolyosu" },
    gYol: { en: "See the steps", tr: "Adımları gör" }, gKaynak: { en: "See the sources", tr: "Kaynakları gör" },
    gYorum: { en: "Instructor comments (Google Doc) ↗", tr: "Hoca yorumları (Google Doc) ↗" },
    yolBaslik: { en: "Assignments, step by step", tr: "Ödevler, adım adım" },
    yolAc: { en: "Each step shows what was asked, what I did and the instructor's comments. Open a step for the details.", tr: "Her adımda ne istendiği, ne yaptığım ve hocanın yorumları var. Ayrıntı için adımı aç." },
    kaynakBaslik: { en: "My sources", tr: "Kaynaklarım" },
    kaynakAc: { en: "Four peer-reviewed journal articles. Open one to read the full text and to see which part each piece of evidence comes from.", tr: "Dört hakemli dergi makalesi. Tam metni okumak ve her kanıtın hangi kısımdan geldiğini görmek için birini aç." },
    nasilBaslik: { en: "About this page", tr: "Bu sayfa hakkında" },
    okuma: {
      en: ["Steps: what the instructor asked, what I did, and the instructor's comments for each assignment.",
           "Sources: the full text of each article, with the parts I used highlighted.",
           "Comments: the instructor can write on any step in the linked Google Doc; they appear on this page."],
      tr: ["Adımlar: her ödevde hocanın istediği, benim yaptığım ve hocanın yorumları.",
           "Kaynaklar: her makalenin tam metni; kullandığım kısımlar vurgulu.",
           "Yorumlar: hoca bağlantıdaki Google Doc'ta istediği adıma yazabilir; yorumlar bu sayfada görünür."]
    },
    durum: { gecti: { en: "done in class", tr: "geçti" }, "bu-hafta": { en: "this week", tr: "bu hafta" }, gelecek: { en: "upcoming", tr: "gelecek" } },
    istenen: { en: "What the instructor asked", tr: "Hocanın istediği" },
    benim: { en: "What I did", tr: "Benim yaptığım" },
    kaynaklarim: { en: "Sources used in this step", tr: "Bu adımda kullandığım kaynaklar" },
    yorumlar: { en: "Instructor comments", tr: "Hoca yorumları" },
    yorumYok: { en: "No comments yet.", tr: "Henüz yorum yok." },
    yorumYaz: { en: "Comment on this step ↗", tr: "Bu adıma yorum yaz ↗" },
    yorumNot: { en: "Opens the Google Doc in my course folder. Write under the heading", tr: "Ders klasörümdeki Google Doc açılır. Şu başlığın altına yazılır:" },
    eksik: { en: "to be added", tr: "eklenecek" },
    belge: { en: "From", tr: "Kaynak belge" },
    adim: { en: "Step", tr: "Adım" },
    neYapiyor: { en: "What the study does", tr: "Çalışma ne yapıyor" },
    guven: { en: "Why it is a reliable source (CRAAP facts)", tr: "Neden güvenilir (CRAAP olguları)" },
    nerede: { en: "Where things are in the article", tr: "Makalede ne nerede" },
    kanitim: { en: "Evidence I used from this article", tr: "Bu makaleden kullandığım kanıt" },
    kanitYok: { en: "This part fills in from my note-taking form: each piece of evidence (A1, A2, B1, B2) is shown here and highlighted in the full text below.", tr: "Bu kısım not alma formumdan dolar: her kanıt (A1, A2, B1, B2) burada görünür ve aşağıdaki tam metinde vurgulanır." },
    tamMetin: { en: "Full text", tr: "Tam metin" },
    disaridan: { en: "This article is published under the publisher's copyright, so it is not copied here. It is free to read at the publisher:", tr: "Bu makale yayıncının telif hakkı altında; bu yüzden buraya kopyalanmadı. Yayıncıda ücretsiz okunuyor:" },
    metindeGoster: { en: "Show in text", tr: "Metinde göster" },
    sayfa: { en: "p.", tr: "s." },
    ne: { en: "What", tr: "Ne" }, bolum: { en: "Section", tr: "Bölüm" }, yer: { en: "Page", tr: "Sayfa" }, capa: { en: "Words in the article", tr: "Makaledeki ifade" },
    lisans: { en: "Licence", tr: "Lisans" },
    alinti: { en: "In the article", tr: "Makalede" }, notum: { en: "My note", tr: "Notum" }, dusuncem: { en: "My thoughts", tr: "Düşüncem" }, tur: { en: "Type", tr: "Tür" },
    yukleniyor: { en: "Loading the article…", tr: "Makale açılıyor…" },
    pdfHata: { en: "The PDF could not be shown here.", tr: "PDF burada gösterilemedi." },
    pdfAc: { en: "Open the PDF ↗", tr: "PDF'i aç ↗" },
    isaretler: { en: "Dashed boxes: where each part of the article is · yellow: evidence I used", tr: "Kesik çizgili kutu: makalenin bölümleri · sarı: kullandığım kanıt" }
  };
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

  /* ---------- sayfa ---------- */
  function cizSayfa() {
    document.documentElement.lang = dil;
    document.querySelectorAll("[data-t]").forEach(function (n) { var k = n.getAttribute("data-t"); if (UI[k]) n.textContent = t(UI[k]); });
    document.getElementById("dil").textContent = dil === "en" ? "TR" : "EN";
    document.getElementById("eyebrow").textContent = D.kod + " · " + t(D.ad) + " · CRN " + D.crn + " · " + t(D.donem);
    document.getElementById("altbaslik").textContent = D.ogrenci + " · " + t(D.bolum);
    document.getElementById("yorumBag").href = D.yorumDoc;
    document.getElementById("altYazi").textContent = D.ogrenci + " · " + D.kod + " · " + t(D.donem);

    var ok = document.getElementById("okuma"); ok.innerHTML = "";
    t(UI.okuma).forEach(function (s, i) { ok.appendChild(el("li", null, [el("b", { text: "0" + (i + 1) }), el("span", { text: s })])); });

    var nt = document.getElementById("notlar"); nt.innerHTML = "";
    D.notlar.forEach(function (n) { nt.appendChild(el("div", { class: "not" }, [el("b", { text: dil === "tr" ? "%" + n.pay : n.pay + "%" }), el("span", { text: t(n.ad) })])); });

    var ol = document.getElementById("adimListe"); ol.innerHTML = "";
    A.forEach(function (a, i) {
      var b = el("button", { class: "satir", type: "button", "aria-haspopup": "dialog", onclick: function () { ac("adim", a.id); } }, [
        el("span", { class: "hafta", text: a.hafta + " · " + t(a.tarih) }),
        el("span", { class: "ad" }, [document.createTextNode(t(UI.adim) + " " + (i + 1) + " · " + t(a.ad)), a.puan ? el("small", { text: t(a.puan) }) : null]),
        el("span", { class: "etiket " + a.durum, text: t(UI.durum[a.durum]) }),
        el("span", { class: "ok", "aria-hidden": "true", text: "›" })
      ]);
      ol.appendChild(el("li", null, [b]));
    });

    var g = document.getElementById("kaynakIzgara"); g.innerHTML = "";
    K.forEach(function (k) {
      g.appendChild(el("button", { class: "kaynak-kart", type: "button", "aria-haspopup": "dialog", onclick: function () { ac("kaynak", k.id); } }, [
        el("p", { class: "eyebrow", lang: "en", text: k.dergi + " · " + k.yil }),
        el("h3", { text: k.kisa }),
        el("p", { text: t(k.ozet) }),
        el("div", { class: "alt-satir" }, [el("span", { text: (k.pdf ? t(UI.tamMetin) + " · " + k.sayfa + " " + (dil === "tr" ? "sayfa" : "pages") : "DOI ↗") }), el("span", { text: "›" })])
      ]));
    });

    var n = document.getElementById("nasilIc"); n.innerHTML = "";
    var kutular = dil === "tr" ? [
      ["Yapay zekâ kullanımı", ["Bu sayfanın düzeni, kaynak künyeleri, makalede bölümlerin sayfa yerleri ve okuma araçları yapay zekâ desteğiyle hazırlandı. ING 201A YZ politikası kaynak bulma ve anlamada bu desteğe izin veriyor.", "Sayfada “benim” diye gösterilen her iddia, not, analiz ve paragraf benim yazdığımdır; paragraflar sınıfta elle yazılır."]],
      ["Paragraflarım neden burada yok", ["Paragraflarım ve yazım Turnitin'le kontrol ediliyor. Web'de yayımlanırsa kendi metnim benzerlik olarak çıkabilir; bu yüzden ders klasörümde duruyor, hoca oradan görebilir."]],
      ["Makalelerin tam metni", ["Tam metni gösterilen üç makale Creative Commons Attribution (CC BY) lisanslı; lisans ve yazarları her makalenin sayfasında. Yayıncı telifli olan makale buraya kopyalanmadı, bağlantısı var.", "Görseller sayfanın hızlı açılması için sıkıştırıldı; metin değiştirilmedi."]],
      ["Yorumlar nasıl görünür", ["Hoca yorumunu bağlantıdaki Google Doc'a, ilgili adımın başlığı altına yazar. Yorumlar bu sayfadaki adıma taşınır. Son güncelleme: " + (window.YORUM_GUNCEL || "") + "."]]
    ] : [
      ["Use of AI", ["The layout of this page, the source records (citations, where each section is) and the reading tools were prepared with AI assistance. The ING 201A AI policy allows AI to support finding and understanding sources.", "Every claim, note, analysis and paragraph shown as mine is written by me; paragraphs are written by hand in class."]],
      ["Why my paragraphs are not here", ["My paragraphs and my essay are checked with Turnitin. If they were published on the web, my own text could appear as a match, so they stay in my course folder, where the instructor can see them."]],
      ["Full text of the articles", ["The three articles shown in full are licensed under Creative Commons Attribution (CC BY); the licence and the authors are given on each article's page. The article under publisher copyright is not copied here; it is linked.", "Images were compressed so the page opens quickly; the text is unchanged."]],
      ["How comments appear", ["The instructor writes a comment in the linked Google Doc, under the heading of the step. Comments are then shown on that step here. Last update: " + (window.YORUM_GUNCEL || "") + "."]]
    ];
    kutular.forEach(function (k) {
      n.appendChild(el("div", { class: "kutu" }, [el("h3", { text: k[0] })].concat(k[1].map(function (p) { return el("p", { text: p }); }))));
    });
  }

  /* ---------- panel ---------- */
  var panel = document.getElementById("panel"), govde = document.getElementById("panelGovde"), acik = null;
  document.getElementById("kapat").addEventListener("click", function () { kapat(true); });
  panel.addEventListener("click", function (e) { if (e.target === panel) kapat(true); });
  panel.addEventListener("close", function () { if (acik) { acik = null; if (location.hash) history.replaceState(null, "", location.pathname + location.search); } });
  window.addEventListener("popstate", function () { if (panel.open && !location.hash) { acik = null; panel.close(); } else hashAc(); });

  function kapat(gecmis) {
    if (!panel.open) return;
    acik = null; panel.close();
    if (gecmis && location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  function ac(tur, id, gecmisYok) {
    acik = { tur: tur, id: id };
    govde.innerHTML = ""; govde.scrollTop = 0;
    if (tur === "adim") cizAdim(id); else cizKaynak(id);
    if (!panel.open) panel.showModal();
    if (!gecmisYok && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
  }
  function hashAc() {
    var h = location.hash.replace("#", "");
    if (!h) return;
    if (A.some(function (a) { return a.id === h; })) ac("adim", h, true);
    else if (K.some(function (k) { return k.id === h; })) ac("kaynak", h, true);
  }
  function blok(no, baslik, kids) {
    return el("section", { class: "blok" }, [el("h3", null, [el("span", { class: "no", text: no }), document.createTextNode(baslik)])].concat(kids));
  }

  function yorumBlok(no, anahtar, baslikMetni) {
    var liste = (Y[anahtar] || []);
    var kids = [];
    if (!liste.length) kids.push(el("p", { class: "bos", text: t(UI.yorumYok) }));
    else kids.push(el("div", { class: "yorumlar" }, liste.map(function (y) { return el("div", { class: "yorum" }, [document.createTextNode(y.metin), y.tarih ? el("small", { text: y.tarih }) : null]); })));
    kids.push(el("a", { class: "bag dolu", href: D.yorumDoc, target: "_blank", rel: "noopener", text: t(UI.yorumYaz) }));
    kids.push(el("p", { class: "belge", text: t(UI.yorumNot) + " “" + baslikMetni + "”" }));
    return blok(no, t(UI.yorumlar), kids);
  }

  function cizAdim(id) {
    var i = A.findIndex(function (a) { return a.id === id; }), a = A[i];
    document.getElementById("panelEyebrow").removeAttribute("lang"); document.getElementById("panelEyebrow").textContent = a.hafta + " · " + t(a.tarih) + (a.puan ? " · " + t(a.puan) : "");
    document.getElementById("panelBaslik").textContent = t(UI.adim) + " " + (i + 1) + " · " + t(a.ad);
    govde.appendChild(blok("01", t(UI.istenen), [
      el("ul", null, t(a.istenen).map(function (s) { return el("li", { text: s }); })),
      el("p", { class: "belge", text: t(UI.belge) + ": " + a.belge })
    ]));
    var benim = el("ul", { class: "benim" });
    if (!a.benim.length) benim.appendChild(el("li", { class: "eksik", "data-eksik": t(UI.eksik), text: dil === "tr" ? "Bu adım daha gelmedi." : "This step has not happened yet." }));
    a.benim.forEach(function (b) {
      if (b.tur === "eksik") benim.appendChild(el("li", { class: "eksik", "data-eksik": t(UI.eksik), text: t(b) }));
      else if (b.tur === "bag") benim.appendChild(el("li", null, [el("a", { href: D[b.url] || b.url, target: "_blank", rel: "noopener", text: t(b) + " ↗" })]));
      else benim.appendChild(el("li", { text: t(b) }));
    });
    govde.appendChild(blok("02", t(UI.benim), [benim]));
    if (a.kaynaklar && a.kaynaklar.length) {
      govde.appendChild(blok("03", t(UI.kaynaklarim), [el("div", { class: "cipler" }, a.kaynaklar.map(function (kid) {
        var k = K.find(function (x) { return x.id === kid; });
        return el("button", { class: "bag", type: "button", onclick: function () { ac("kaynak", kid); }, text: k ? k.kisa : kid });
      }))]));
    }
    var docBaslik = "Step " + (i + 1) + " · " + a.hafta.replace("W", "Week ") + " · " + a.ad.en;
    govde.appendChild(yorumBlok(a.kaynaklar ? "04" : "03", id, docBaslik));
  }

  function cizKaynak(id) {
    var k = K.find(function (x) { return x.id === id; });
    var pe = document.getElementById("panelEyebrow"); pe.textContent = k.dergi + " · " + k.yil; pe.setAttribute("lang", "en");
    document.getElementById("panelBaslik").textContent = k.kisa;
    govde.appendChild(el("section", { class: "blok" }, [
      el("p", { class: "apa", html: k.apa.replace(/(https:\/\/doi\.org\/\S+)/, '<a href="$1" target="_blank" rel="noopener">$1</a>') }),
      el("p", { class: "belge", text: t(UI.lisans) + ": " + k.lisans.ad }),
    ]));
    govde.appendChild(blok("01", t(UI.neYapiyor), [el("p", { text: t(k.ozet) })]));
    var craap = dil === "tr" ? [
      ["Currency · güncellik", k.yil + " · " + k.atif + " atıf (OpenAlex, 2 Kas 2026)"],
      ["Authority · yetke", "hakemli dergi: " + k.dergi],
      ["Accuracy · doğruluk", "yöntem ve veri bölümü, kaynakça var"],
      ["Purpose · amaç", "araştırma makalesi" + (k.pdf ? ", açık erişim" : ", yayıncıda ücretsiz")]
    ] : [
      ["Currency", k.yil + " · cited " + k.atif + " times (OpenAlex, 2 Nov 2026)"],
      ["Authority", "peer-reviewed journal: " + k.dergi],
      ["Accuracy", "methods and data sections, reference list"],
      ["Purpose", "research article" + (k.pdf ? ", open access" : ", free to read at the publisher")]
    ];
    govde.appendChild(blok("02", t(UI.guven), [el("div", { class: "tablo-kab" }, [el("table", null, [el("tbody", null, craap.map(function (r) { return el("tr", null, [el("th", { scope: "row", text: r[0] }), el("td", { text: r[1] })]); }))])])]));

    var tb = el("tbody");
    k.yerler.forEach(function (y, yi) {
      var hucre = el("td");
      y.capalar.forEach(function (c, ci) {
        hucre.appendChild(el("div", { class: "capa", text: "“" + c.metin + "”" }));
        if (k.pdf && c.yer) hucre.appendChild(el("button", { class: "bag git", type: "button", text: t(UI.metindeGoster) + " · " + t(UI.sayfa) + " " + c.yer.s, onclick: function () { gotur(c.yer.s, "c" + yi + "-" + ci); } }));
      });
      tb.appendChild(el("tr", null, [el("th", { scope: "row", text: dil === "tr" ? y.ne_tr : y.ne_en }), el("td", { text: y.bolum }), el("td", { text: y.sayfa }), hucre]));
    });
    govde.appendChild(blok("03", t(UI.nerede), [el("div", { class: "tablo-kab" }, [el("table", null, [
      el("thead", null, [el("tr", null, [el("th", { text: t(UI.ne) }), el("th", { text: t(UI.bolum) }), el("th", { text: t(UI.yer) }), el("th", { text: t(UI.capa) })])]), tb])])]));

    var kn = [];
    if (!k.kanit.length) kn.push(el("p", { class: "not-kutu", text: t(UI.kanitYok) }));
    k.kanit.forEach(function (e, ei) {
      var dl = el("dl");
      [[UI.tur, e.tur], [UI.notum, e.not], [UI.dusuncem, e.dusunce]].forEach(function (r) { if (r[1]) { dl.appendChild(el("dt", { text: t(r[0]) })); dl.appendChild(el("dd", { text: r[1] })); } });
      kn.push(el("div", { class: "kanit" }, [
        el("span", { class: "lbl", text: e.etiket + (e.yer ? " · " + t(UI.sayfa) + " " + e.yer.s : "") }),
        e.alinti ? el("blockquote", { text: "“" + e.alinti + "”" }) : null,
        dl,
        (k.pdf && e.yer) ? el("button", { class: "bag git", type: "button", text: t(UI.metindeGoster), onclick: function () { gotur(e.yer.s, "k" + ei); } }) : null
      ]));
    });
    govde.appendChild(blok("04", t(UI.kanitim), kn));

    if (k.pdf) {
      var gor = el("div", { class: "pdf-gorunum", id: "pdfGor" }, [el("p", { class: "yukleniyor", text: t(UI.yukleniyor) })]);
      govde.appendChild(blok("05", t(UI.tamMetin), [
        el("div", { class: "pdf-arac" }, [el("span", { text: t(UI.isaretler) }), el("a", { class: "bag", href: k.pdf, target: "_blank", rel: "noopener", text: t(UI.pdfAc) })]),
        gor
      ]));
      pdfCiz(k, gor);
    } else {
      govde.appendChild(blok("05", t(UI.tamMetin), [el("p", { class: "not-kutu" }, [document.createTextNode(t(UI.disaridan) + " "), el("a", { href: k.doi, target: "_blank", rel: "noopener", text: k.doi + " ↗" })])]));
    }
    govde.appendChild(yorumBlok("06", "kaynaklar", "Sources"));
  }

  /* ---------- PDF görüntüleyici (PDF.js, sayfalar görünür olunca çizilir) ---------- */
  var gozcu = null;
  function pdfCiz(k, kap) {
    if (!window.pdfjsLib) { kap.innerHTML = ""; kap.appendChild(el("p", { class: "not-kutu" }, [document.createTextNode(t(UI.pdfHata) + " "), el("a", { href: k.pdf, target: "_blank", rel: "noopener", text: t(UI.pdfAc) })])); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var isaretler = {};
    function ekle(s, kutular, sinif, anahtar, etiket) { (isaretler[s] = isaretler[s] || []).push({ k: kutular, c: sinif, a: anahtar, e: etiket }); }
    k.yerler.forEach(function (y, yi) { y.capalar.forEach(function (c, ci) { if (c.yer) ekle(c.yer.s, c.yer.k, "capa", "c" + yi + "-" + ci); }); });
    k.kanit.forEach(function (e, ei) { if (e.yer) ekle(e.yer.s, e.yer.k, "kanit-v", "k" + ei, e.etiket); });
    pdfjsLib.getDocument(k.pdf).promise.then(function (pdf) {
      kap.innerHTML = "";
      if (gozcu) gozcu.disconnect();
      gozcu = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (g) { if (g.isIntersecting && !g.target.dataset.cizildi) { g.target.dataset.cizildi = "1"; sayfaCiz(pdf, g.target); } });
      }, { root: govde, rootMargin: "600px 0px" });
      for (var s = 1; s <= pdf.numPages; s++) {
        var d = el("div", { class: "sayfa", id: "sayfa-" + s, "data-s": String(s), style: "aspect-ratio: 595 / 790" }, [el("span", { class: "sno", text: s + " / " + pdf.numPages })]);
        (isaretler[s] || []).forEach(function (m) {
          m.k.forEach(function (r, ri) {
            d.appendChild(el("div", { class: "isaret " + m.c, "data-a": m.a, style: "left:" + (r[0] * 100) + "%;top:" + (r[1] * 100) + "%;width:" + ((r[2] - r[0]) * 100) + "%;height:" + ((r[3] - r[1]) * 100) + "%" }));
            if (ri === 0 && m.e) d.appendChild(el("span", { class: "isaret-etiket", text: m.e, style: "left:" + (r[0] * 100) + "%;top:" + (r[1] * 100) + "%" }));
          });
        });
        kap.appendChild(d); gozcu.observe(d);
      }
    }).catch(function () {
      kap.innerHTML = ""; kap.appendChild(el("p", { class: "not-kutu" }, [document.createTextNode(t(UI.pdfHata) + " "), el("a", { href: k.pdf, target: "_blank", rel: "noopener", text: t(UI.pdfAc) })]));
    });
  }
  function sayfaCiz(pdf, d) {
    pdf.getPage(Number(d.dataset.s)).then(function (p) {
      var v1 = p.getViewport({ scale: 1 });
      d.style.aspectRatio = v1.width + " / " + v1.height;
      var olcek = Math.min(2.5, (d.clientWidth || 800) / v1.width * (window.devicePixelRatio || 1));
      var v = p.getViewport({ scale: olcek });
      var c = document.createElement("canvas"); c.width = Math.floor(v.width); c.height = Math.floor(v.height);
      c.setAttribute("aria-label", "page " + d.dataset.s);
      d.insertBefore(c, d.firstChild);
      p.render({ canvasContext: c.getContext("2d"), viewport: v });
    });
  }
  function gotur(s, anahtar) {
    var d = document.getElementById("sayfa-" + s);
    if (!d) return;
    d.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    d.querySelectorAll('[data-a="' + anahtar + '"]').forEach(function (m) { m.classList.remove("parla"); void m.offsetWidth; m.classList.add("parla"); });
  }

  /* ---------- dil ---------- */
  document.getElementById("dil").addEventListener("click", function () {
    dil = dil === "en" ? "tr" : "en";
    try { localStorage.setItem("ing201a-dil", dil); } catch (e) { /* depolama kapalı */ }
    cizSayfa();
    if (panel.open && acik) ac(acik.tur, acik.id, true);
  });

  cizSayfa();
  hashAc();
})();
