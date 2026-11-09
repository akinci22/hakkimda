/* ING 201A — "hocanın görmek istedikleri": yazının yapısı genelden özele (sentez yazısı → tez → alt başlık → paragraf → kanıt → kaynak).
   Gereklilikler hocanın belgelerinden (Outline Guidelines, Grading Rubric – Outline, Thesis Statement Guide, Example and Reminders,
   Assignment 3 guide, Week 6 slides, Weeks 7–8 guidance, Course schedule) kısa olarak aktarılır.
   "benim" alanı: Akın'ın kendi metni (tez, alt başlık, ana fikir, kanıt satırı) Claude tarafından YAZILMAZ; Akın verince eklenir. */
window.YAPI = [
  {
    id: "y-essay", seviye: 0, ad: { en: "Synthesis essay", tr: "Sentez yazısı" },
    ne: { en: "One essay written by a group of three: an introduction, six body paragraphs (two per student) and a conclusion, built on academic sources.", tr: "Üç kişilik grubun tek yazısı: giriş, altı gövde paragrafı (öğrenci başına iki) ve sonuç; akademik kaynaklara dayanır." },
    kontrol: { en: ["Every body paragraph connects to the thesis.", "Citations and the reference list follow APA 7.", "The final text is uploaded to Ninova and Turnitin by 31 Dec, 18:00 (5%)."], tr: ["Her gövde paragrafı teze bağlanır.", "Atıflar ve kaynakça APA 7'ye uyar.", "Son metin 31 Ara 18:00'e kadar Ninova ve Turnitin'e yüklenir (%5)."] },
    belge: "Course schedule · Outline Guidelines",
    bag: ["y-konu", "y-tez", "y-kaynak", "y-giris"], adim: ["s01", "s12"],
    benim: [{ tur: "eksik", en: "Group topic and members", tr: "Grup konusu ve üyeler" }]
  },
  {
    id: "y-konu", seviye: 1, ust: "y-essay", ad: { en: "Topic and research question", tr: "Konu ve araştırma sorusu" },
    ne: { en: "A broad area narrowed to a specific research focus, and the question the whole essay answers.", tr: "Geniş bir alanın belirli bir araştırma odağına daraltılması ve yazının bütün olarak cevapladığı soru." },
    kontrol: { en: ["Clear, specific, manageable, researchable, supported by academic sources.", "A question such as “Under which conditions …?” or “To what extent …?” leads to a claim that early evidence can support."], tr: ["Net, belirli, yönetilebilir, araştırılabilir, akademik kaynakla desteklenebilir.", "“Hangi koşullarda …?” ya da “Ne ölçüde …?” gibi bir soru, erken kanıtla desteklenebilen bir iddiaya götürür."] },
    rubrik: { en: "Topic & Focus — 2 points", tr: "Konu ve odak — 2 puan" },
    belge: "Outline Guidelines (Step 1) · Assignment 3 guide (Step 1) · Rubric",
    bag: ["y-tez"], adim: ["s01", "s02"],
    benim: [{ tur: "eksik", en: "Research question (my wording)", tr: "Araştırma sorusu (benim cümlem)" }]
  },
  {
    id: "y-tez", seviye: 1, ust: "y-essay", ad: { en: "Thesis statement", tr: "Tez cümlesi" },
    ne: { en: "One sentence: the topic, the claim (with its limit or condition) and the three subtopics in parallel form. It answers the research question.", tr: "Tek cümle: konu, iddia (sınırı ya da koşuluyla) ve paralel biçimde üç alt başlık. Araştırma sorusunun cevabıdır." },
    kontrol: { en: ["A claim, not an announcement (“This paper is about …” is not a thesis).", "Defensible: someone could disagree; not a fact or a definition.", "Stays within what the sources show; no “all”, “always”, “completely”.", "Specific words; subtopics in parallel form and in the same order as the outline."], tr: ["Duyuru değil iddia (“Bu yazı … hakkındadır” tez değildir).", "Savunulabilir: biri itiraz edebilir; olgu ya da tanım değil.", "Kaynakların gösterdiğinin içinde kalır; “hep”, “her zaman”, “tamamen” yok.", "Belirli kelimeler; alt başlıklar paralel ve outline'daki sırayla."] },
    rubrik: { en: "Working Thesis & Direction — 2 points", tr: "Çalışma tezi ve yön — 2 puan" },
    belge: "Thesis Statement Guide · Example and Reminders · Rubric",
    bag: ["y-konu", "y-alt"], adim: ["s04", "s05", "s06"],
    benim: [{ tur: "eksik", en: "My group's thesis (as written in the graded outline)", tr: "Grubumun tezi (notlu outline'da yazdığım gibi)" }]
  },
  {
    id: "y-alt", seviye: 2, ust: "y-tez", ad: { en: "Subtopics (one per student)", tr: "Alt başlıklar (her öğrenciye bir)" },
    ne: { en: "The three areas named in the thesis. In the outline they are Roman numerals (I, II, III); each student develops one subtopic in two body paragraphs.", tr: "Tezde adı geçen üç alan. Outline'da Roma rakamıdır (I, II, III); her öğrenci bir alt başlığı iki gövde paragrafında geliştirir." },
    kontrol: { en: ["Three distinct, relevant ideas in a logical order.", "Connected but different: all support the same claim, no two do the same job.", "Each one is big enough for two paragraphs."], tr: ["Üç ayrı, ilgili fikir, mantıklı sırayla.", "Bağlı ama farklı: hepsi aynı iddiayı destekler, ikisi aynı işi yapmaz.", "Her biri iki paragrafa yetecek büyüklükte."] },
    rubrik: { en: "Main Body Ideas & Organization — 3 points", tr: "Ana fikirler ve düzen — 3 puan" },
    belge: "Outline Guidelines (Steps 3, 5) · Rubric",
    bag: ["y-tez", "y-paragraf"], adim: ["s02", "s06"],
    benim: [{ tur: "eksik", en: "My subtopic, in the same words as the thesis", tr: "Alt başlığım, tezdeki kelimelerle" }]
  },
  {
    id: "y-paragraf", seviye: 3, ust: "y-alt", ad: { en: "Body paragraphs A and B", tr: "Gövde paragrafları A ve B" },
    ne: { en: "Capital letters in the outline. A and B have different jobs: e.g. A shows the effect or the mechanism, B shows when or why it changes.", tr: "Outline'da büyük harfler. A ile B farklı iş yapar: ör. A etkiyi ya da mekanizmayı, B ne zaman ya da neden değiştiğini gösterir." },
    kontrol: { en: ["Test: “The main job of this paragraph is to …”.", "Paragraph A: practice in Weeks 7–8 (about 250 words). Paragraph B: midterm, Week 9 (30%).", "Each paragraph has two pieces of evidence from two different sources."], tr: ["Sınama: “Bu paragrafın asıl işi …”.", "Paragraf A: 7–8. hafta alıştırma (~250 kelime). Paragraf B: ara sınav, 9. hafta (%30).", "Her paragrafta iki farklı kaynaktan iki kanıt."] },
    rubrik: { en: "Supporting Points — 4 points (outline)", tr: "Destek noktaları — 4 puan (outline)" },
    belge: "Example and Reminders · Weeks 7–8 guidance · Course schedule",
    bag: ["y-alt", "y-ic"], adim: ["s07", "s08", "s09", "s10"],
    benim: [{ tur: "eksik", en: "Main idea of Paragraph A (note-taking form)", tr: "Paragraf A'nın ana fikri (not alma formu)" }, { tur: "eksik", en: "Main idea of Paragraph B (note-taking form)", tr: "Paragraf B'nin ana fikri (not alma formu)" }]
  },
  {
    id: "y-ic", seviye: 4, ust: "y-paragraf", ad: { en: "Inside a paragraph: point → evidence → analysis", tr: "Paragrafın içi: nokta → kanıt → analiz" },
    ne: { en: "Topic sentence → support 1 (my reason) → evidence A1 → analysis → support 2 → evidence A2 → analysis → concluding sentence.", tr: "Konu cümlesi → destek 1 (benim nedenim) → A1 kanıtı → analiz → destek 2 → A2 kanıtı → analiz → sonuç cümlesi." },
    kontrol: { en: ["The topic sentence makes a claim about the main idea; it is not a finding from a source.", "The reason comes before the evidence and is in my own words.", "Evidence is paraphrased or summarised with (Author, year); setting, numbers and certainty are kept.", "Analysis (1–2 sentences) explains why the evidence supports the reason; it does not repeat the finding.", "Transitions and academic phrases; not “says” or “talks about”."], tr: ["Konu cümlesi ana fikir hakkında iddia kurar; kaynaktan bir bulgu değildir.", "Neden kanıttan önce gelir ve benim sözümdür.", "Kanıt açımlanır ya da özetlenir, (Yazar, yıl) ile; yer, sayı ve kesinlik korunur.", "Analiz (1–2 cümle) kanıtın nedeni neden desteklediğini açıklar; bulguyu tekrarlamaz.", "Geçiş ve akademik ifade; “says”, “talks about” yok."] },
    rubrik: { en: "Paragraph checklist (Weeks 7–8)", tr: "Paragraf kontrol listesi (7–8. hafta)" },
    belge: "Week 6 slides · Weeks 7–8 guidance",
    bag: ["y-paragraf", "y-kanit"], adim: ["s07", "s08"],
    benim: [{ tur: "eksik", en: "My Part A1 / A2 papers — in my course folder, not on the web (Turnitin)", tr: "A1 / A2 kâğıtlarım — ders klasörümde, web'de değil (Turnitin)" }]
  },
  {
    id: "y-kanit", seviye: 5, ust: "y-ic", ad: { en: "Evidence and its source", tr: "Kanıt ve kaynağı" },
    ne: { en: "Numbers (1, 2) in the outline: what a source shows, in keywords with (Author, year). Each piece of evidence comes from one source and points to a highlighted sentence in that source.", tr: "Outline'da rakamlar (1, 2): kaynağın gösterdiği şey, anahtar kelimeyle ve (Yazar, yıl) ile. Her kanıt tek bir kaynaktan gelir ve o kaynaktaki işaretli bir cümleyi gösterir." },
    kontrol: { en: ["Keywords, not sentences; say what the source shows, not only the author's name.", "Four different academic sources for A1, A2, B1, B2.", "In the PDF: highlight only the sentences used, add an “A1 evidence” comment; file name Surname_A1_Author_Year.pdf.", "Note-taking form row: APA citation · type (quotation / paraphrase / summary) · note with citation · my thoughts (max. 4 sentences)."], tr: ["Cümle değil anahtar kelime; yalnız yazar adı değil, kaynağın gösterdiği.", "A1, A2, B1, B2 için dört farklı akademik kaynak.", "PDF'te: yalnız kullanılan cümleler işaretli, yanında “A1 evidence” notu; dosya adı Soyad_A1_Yazar_Yıl.pdf.", "Not alma formu satırı: APA künyesi · tür (alıntı / açımlama / özet) · atıflı not · düşüncem (en çok 4 cümle)."] },
    rubrik: { en: "Supporting Points — 4 points · Potential Academic Sources — 4 points", tr: "Destek noktaları — 4 puan · Akademik kaynaklar — 4 puan" },
    belge: "Assignment 3 guide (Steps 2, 5) · Note-taking form · Example and Reminders",
    bag: ["y-ic", "y-kaynak"], adim: ["s03", "s06", "s07"],
    benim: [{ tur: "eksik", en: "Evidence lines A1, A2, B1, B2 (my keywords)", tr: "A1, A2, B1, B2 kanıt satırları (benim anahtar kelimelerim)" }]
  },
  {
    id: "y-kaynak", seviye: 1, ust: "y-essay", ad: { en: "Academic sources", tr: "Akademik kaynaklar" },
    ne: { en: "At least four highly reliable scholarly sources per student (at least nine for the group), read in full and checked with CRAAP.", tr: "Öğrenci başına en az dört, grupta en az dokuz güvenilir akademik kaynak; tamamı okunur, CRAAP ile denetlenir." },
    kontrol: { en: ["Peer-reviewed articles, academic books or institutional research reports; no theses or dissertations.", "CRAAP: currency, relevance, authority, accuracy, purpose.", "A reading chart for each source: purpose, context, method, finding, interpretation, with section and page."], tr: ["Hakemli makale, akademik kitap ya da kurumsal araştırma raporu; tez/dissertation yok.", "CRAAP: güncellik, ilgi, yetke, doğruluk, amaç.", "Her kaynak için okuma tablosu: amaç, bağlam, yöntem, bulgu, yorum — bölüm ve sayfayla."] },
    rubrik: { en: "Potential Academic Sources — 4 points", tr: "Akademik kaynaklar — 4 puan" },
    belge: "Outline Guidelines · Assignment 3 guide (Steps 3–4) · Rubric",
    bag: ["y-kanit"], adim: ["s03", "s06"],
    benim: [{ tur: "bilgi", en: "Four peer-reviewed research articles — Section 5; marked PDFs in the “Final Sources” folder.", tr: "Dört hakemli araştırma makalesi — Bölüm 5; işaretli PDF'ler “Final Sources” klasöründe." }]
  },
  {
    id: "y-giris", seviye: 1, ust: "y-essay", ad: { en: "Introduction and conclusion", tr: "Giriş ve sonuç" },
    ne: { en: "Written by the group in class in Week 12 (10%).", tr: "12. haftada grupça sınıfta yazılır (%10)." },
    kontrol: { en: ["The introduction gives the necessary context and leads to the thesis.", "The conclusion returns to the central argument and states its significance."], tr: ["Giriş gerekli bağlamı verip teze götürür.", "Sonuç ana iddiaya döner ve önemini söyler."] },
    rubrik: { en: "Graded in Week 12 — 10%", tr: "12. hafta notu — %10" },
    belge: "Course schedule · Weeks 10–12",
    bag: ["y-tez"], adim: ["s11"],
    benim: []
  }
];

/* Kanıt → kaynak eşlemesi: yuva (A1…B2) Akın'ın kararıdır; burada boş. "bulgular": kaynakta seçilebilecek veriler (başvuru bilgisi, Akın'ın notu değil). */
window.KANIT_YUVA = [
  { yuva: "A1", paragraf: "A" }, { yuva: "A2", paragraf: "A" }, { yuva: "B1", paragraf: "B" }, { yuva: "B2", paragraf: "B" }
];
window.BULGULAR = {
  yucel2014: [{ en: "25 heavy-rainfall events (2000–2011), 34 rain gauges, western Black Sea", tr: "25 şiddetli yağış olayı (2000–2011), 34 yağış ölçer, Batı Karadeniz", s: "1, 10" },
              { en: "Direct effect of data assimilation on model rainfall: up to 12%", tr: "Veri özümsemenin model yağışına doğrudan etkisi: %12'ye kadar", s: "1" }],
  rojas2023: [{ en: "4 stations in Germany, regional ensemble model, 2011–2017", tr: "Almanya'da 4 istasyon, bölgesel ansambl model, 2011–2017", s: "2" },
              { en: "Neural networks beat the classical method for hourly amounts at all stations", tr: "Sinir ağları saatlik miktarda tüm istasyonlarda klasik yöntemi geçti", s: "7" }],
  hess2022: [{ en: "Heavy-rainfall forecast skill improved by factors of two to above six", tr: "Şiddetli yağış tahmin becerisi 2 kattan 6 kattan fazlasına arttı", s: "1" },
             { en: "A linear (ridge) correction gave no improvement", tr: "Doğrusal (ridge) düzeltme iyileşme getirmedi", s: "8" }],
  patakchi2024: [{ en: "Correction reduced the forecast–satellite gap by 49%, 33% and 12% (ME, RMSE, correlation)", tr: "Düzeltme tahmin–uydu farkını %49, %33, %12 azalttı (ortalama hata, RMSE, korelasyon)", s: "1" },
                 { en: "Soil moisture agreed best with the uncorrected forecast; reference quality matters", tr: "Toprak nemi en iyi düzeltilmemiş tahminle uyuştu; referansın kalitesi önemli", s: "1, 15" }]
};
