/* ING 201A süreç portfolyosu — adımlar (elle yazılır; hocanın belgelerinden: Course schedule, Assignment 3 guide,
   Outline rubric, Week 6 slides, Weeks 7–8 guidance, Note-taking form).
   KURAL: "mine" alanına yalnız gerçek, doğrulanmış bilgi ya da "eksik" yer tutucu girer. Akın'ın iddia, ana fikir,
   not, analiz ya da paragraf metni buraya Claude tarafından YAZILMAZ; Akın verirse olduğu gibi eklenir. */
window.DERS = {
  kod: "ING 201A", ad: { en: "Essentials of Research Paper Writing", tr: "Araştırma Yazısının Temelleri" },
  crn: "10466", donem: { en: "Fall 2026", tr: "Güz 2026" },
  ogrenci: "Ömer Faruk Akıncı", bolum: { en: "Meteorological Engineering, ITU", tr: "Meteoroloji Mühendisliği, İTÜ" },
  portfoy: "https://akinci22.github.io/hakkimda/",
  yorumDoc: "https://docs.google.com/document/d/10y-ZT50qEaKJoG2HH4ANB6JbemDjF4vk_l0caCbBdy0/edit",
  formDoc: "https://docs.google.com/document/d/1IqKumXV-Uh3PlSqJFKRq39mokPzHMjH_sTRHjLNqcYI/edit",
  notlar: [
    { ad: { en: "Thesis + outline", tr: "Tez + outline" }, pay: 15 },
    { ad: { en: "Body paragraph 2 (midterm)", tr: "Gövde paragrafı 2 (ara sınav)" }, pay: 30 },
    { ad: { en: "Introduction + conclusion", tr: "Giriş + sonuç" }, pay: 10 },
    { ad: { en: "Synthesis essay upload", tr: "Sentez yazısı yükleme" }, pay: 5 },
    { ad: { en: "Final exam", tr: "Final sınavı" }, pay: 40 }
  ]
};

/* durum: gecti | bu-hafta | gelecek */
window.ADIMLAR = [
  {
    id: "s01", hafta: "W1", tarih: { en: "28 Sep – 2 Oct", tr: "28 Eyl – 2 Eki" }, durum: "gecti",
    ad: { en: "Topic and group", tr: "Konu ve grup" },
    puan: null,
    istenen: {
      en: ["Groups of three: one shared topic, three related but distinct subtopics (one per student), two body paragraphs per student.",
           "Assignment 1 (for Week 2): the group's best working topic and three possible research directions."],
      tr: ["Üç kişilik grup: ortak bir konu, birbirine bağlı ama farklı üç alt başlık (her öğrenciye bir), öğrenci başına iki gövde paragrafı.",
           "Ödev 1 (2. haftaya): grubun en iyi çalışma konusu ve üç olası araştırma yönü."]
    },
    belge: "Course schedule · Week 1",
    benim: [{ tur: "eksik", en: "Group topic and members", tr: "Grup konusu ve üyeler" }]
  },
  {
    id: "s02", hafta: "W2", tarih: { en: "5 – 9 Oct", tr: "5 – 9 Eki" }, durum: "gecti",
    ad: { en: "Narrowed topic, claim and subtopics", tr: "Daraltılmış konu, iddia ve alt başlıklar" },
    puan: null,
    istenen: {
      en: ["Mind map of the topic, search terms with Boolean operators, five articles from academic databases.",
           "Assignment 2 (for Week 3): narrowed topic, a tentative claim and three subdivisions — the group's own reasoning, not written by AI."],
      tr: ["Konunun zihin haritası, Boolean işleçli arama terimleri, akademik veri tabanlarından beş makale.",
           "Ödev 2 (3. haftaya): daraltılmış konu, geçici iddia ve üç alt başlık — grubun kendi düşüncesi, YZ yazmaz."]
    },
    belge: "Course schedule · Week 2 sample assignment",
    benim: [{ tur: "eksik", en: "Mind map and search terms", tr: "Zihin haritası ve arama terimleri" },
            { tur: "eksik", en: "Claim and subtopics (my own words)", tr: "İddia ve alt başlıklar (kendi cümlelerim)" }]
  },
  {
    id: "s03", hafta: "W3", tarih: { en: "12 – 16 Oct", tr: "12 – 16 Eki" }, durum: "gecti",
    ad: { en: "Sources and evidence", tr: "Kaynaklar ve kanıt" },
    puan: null,
    istenen: {
      en: ["Four academic sources for my own subtopic, read in full, not only the abstracts.",
           "Main idea of Paragraph A and evidence A1, A2 in keywords with an in-text citation.",
           "CRAAP quick check and a reading chart (section and page) for each source.",
           "Highlighted PDFs, named Surname_A1_Author_Year.pdf, with an “A1 evidence” comment next to each highlight."],
      tr: ["Kendi alt başlığım için dört akademik kaynak; yalnız özet değil, tamamı okunur.",
           "Paragraf A'nın ana fikri ve A1, A2 kanıtı: anahtar kelime + metin içi atıf.",
           "Her kaynak için CRAAP hızlı kontrolü ve okuma tablosu (bölüm ve sayfa).",
           "Vurgulu PDF'ler: Soyad_A1_Yazar_Yıl.pdf adıyla, her vurgunun yanında “A1 evidence” notu."]
    },
    belge: "Assignment 3 guide · Course schedule · Week 3",
    kaynaklar: ["yucel2014", "rojas2023", "hess2022", "patakchi2024"],
    benim: [{ tur: "bilgi", en: "Four peer-reviewed journal articles — see Sources below, with the full text and where each part is.", tr: "Dört hakemli dergi makalesi — aşağıdaki Kaynaklar bölümünde tam metin ve her kısmın yeri." },
            { tur: "eksik", en: "Reading charts and CRAAP checks", tr: "Okuma tabloları ve CRAAP kontrolleri" }]
  },
  {
    id: "s04", hafta: "W4", tarih: { en: "19 – 23 Oct", tr: "19 – 23 Eki" }, durum: "gecti",
    ad: { en: "Thesis and outline practice", tr: "Tez ve outline alıştırması" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["A working thesis and three subtopics built from the evidence.",
           "Two distinct paragraph points for each subtopic, with source evidence mapped to each point.",
           "Written in class with immediate feedback; nothing pre-written at home."],
      tr: ["Kanıttan kurulan çalışma tezi ve üç alt başlık.",
           "Her alt başlık için iki ayrı paragraf noktası; her noktaya kaynak kanıtı eşlenir.",
           "Sınıfta yazılır, anında geri bildirim; evde önceden yazılmaz."]
    },
    belge: "Course schedule · Week 4 slides",
    benim: [{ tur: "eksik", en: "Practice outline with feedback (photo)", tr: "Geri bildirimli alıştırma outline'ı (fotoğraf)" }]
  },
  {
    id: "s05", hafta: "W5", tarih: { en: "26 – 30 Oct", tr: "26 – 30 Eki" }, durum: "gecti",
    ad: { en: "Thesis and outline draft", tr: "Tez ve outline taslağı" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["Check that each subtopic has enough suitable evidence; find gaps, overlap and weak support.",
           "Paragraph B submission form completed before class.",
           "Draft written in class from research notes; the instructor marks the priority revisions."],
      tr: ["Her alt başlığın yeterli ve uygun kanıtı var mı; boşluk, örtüşme ve zayıf desteği bul.",
           "Paragraph B gönderim formu dersten önce doldurulur.",
           "Taslak sınıfta araştırma notlarıyla yazılır; hoca öncelikli düzeltmeleri işaretler."]
    },
    belge: "Course schedule · Week 5 · Outline guidelines",
    benim: [{ tur: "eksik", en: "Draft outline with the instructor's marks (photo)", tr: "Hocanın işaretlediği taslak outline (fotoğraf)" }]
  },
  {
    id: "s06", hafta: "W6", tarih: { en: "2 Nov", tr: "2 Kas" }, durum: "gecti",
    ad: { en: "Revised thesis and full outline", tr: "Düzeltilmiş tez ve tam outline" },
    puan: { en: "graded · 15%", tr: "notlu · %15" },
    istenen: {
      en: ["60 minutes in class, in pencil, on a printed template; draft with feedback and four printed sources allowed.",
           "Sources highlighted and uploaded to the “Final Sources” folder before the assessment — the evidence score depends on it.",
           "Rubric (15): topic 2 · thesis 2 · main body ideas 3 · supporting points 4 · academic sources 4."],
      tr: ["Sınıfta 60 dakika, kurşun kalemle, basılı şablonda; geri bildirimli taslak ve dört basılı kaynak serbest.",
           "Kaynaklar vurgulanıp değerlendirmeden önce “Final Sources” klasörüne yüklenir — kanıt puanı buna bağlı.",
           "Puanlama (15): konu 2 · tez 2 · ana fikirler 3 · destek noktaları 4 · akademik kaynaklar 4."]
    },
    belge: "Outline rubric · Example and reminders · Week 6 announcement",
    benim: [{ tur: "eksik", en: "My graded outline (photo taken at the end of the assessment)", tr: "Notlu outline'ım (değerlendirme sonunda çekilen fotoğraf)" },
            { tur: "bilgi", en: "Sources with the evidence highlighted and labelled A1, A2, B1, B2 are in the “Final Sources” folder (9 Nov): A1 Yucel & Onen (2014), A2 Rojas-Campos et al. (2023), B1 Hess & Boers (2022), B2 Patakchi Yousefi et al. (2024).", tr: "Kanıtı vurgulu ve A1, A2, B1, B2 etiketli kaynaklar “Final Sources” klasöründe (9 Kas): A1 Yucel & Onen (2014), A2 Rojas-Campos et al. (2023), B1 Hess & Boers (2022), B2 Patakchi Yousefi et al. (2024)." }]
  },
  {
    id: "s07", hafta: "W6–7", tarih: { en: "before 9 Nov", tr: "9 Kas'tan önce" }, durum: "bu-hafta",
    ad: { en: "Note-taking form (A1, A2, B1, B2)", tr: "Not alma formu (A1, A2, B1, B2)" },
    puan: { en: "the only homework", tr: "tek ev ödevi" },
    istenen: {
      en: ["For each piece of evidence: the APA citation, a note (direct quotation, paraphrase or summary) with an in-text citation, and my thoughts (max. 4 sentences) on how it supports the main idea.",
           "Written by me; it becomes the plan of the paragraph: main idea → topic sentence, note → evidence sentence, my thoughts → analysis."],
      tr: ["Her kanıt için: APA künyesi, metin içi atıflı not (doğrudan alıntı, açımlama ya da özet) ve kanıtın ana fikri nasıl desteklediğine dair düşüncem (en çok 4 cümle).",
           "Benim yazdığım form paragrafın planıdır: ana fikir → konu cümlesi, not → kanıt cümlesi, düşüncem → analiz."]
    },
    belge: "Note-taking submission form · Weeks 7–8 guidance",
    benim: [{ tur: "bag", en: "My note-taking form (Google Doc in my course folder)", tr: "Not alma formum (ders klasörümdeki Google Doc)", url: "formDoc" }]
  },
  {
    id: "s08", hafta: "W7", tarih: { en: "9 Nov", tr: "9 Kas" }, durum: "bu-hafta",
    ad: { en: "Paragraph A: Part A1 and Part A2", tr: "Paragraf A: A1 ve A2 kısmı" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["Part A1: topic sentence → my first reason → evidence A1 (paraphrase or summary + citation) → 1–2 sentences of analysis.",
           "Part A2: my second, different reason → evidence A2 → analysis → concluding sentence.",
           "Written separately, timed, by hand; written feedback on each part."],
      tr: ["A1 kısmı: konu cümlesi → ilk nedenim → A1 kanıtı (açımlama ya da özet + atıf) → 1–2 cümle analiz.",
           "A2 kısmı: ikinci, farklı nedenim → A2 kanıtı → analiz → sonuç cümlesi.",
           "Ayrı ayrı, süreli, el yazısıyla; her kısma yazılı geri bildirim."]
    },
    belge: "Weeks 7–8 guidance · Week 6 slides",
    benim: [{ tur: "eksik", en: "My paper with feedback — kept in my course folder, not published on the web", tr: "Geri bildirimli kâğıdım — ders klasörümde, web'de yayımlanmaz" }]
  },
  {
    id: "s09", hafta: "W8", tarih: { en: "23 Nov", tr: "23 Kas" }, durum: "gelecek",
    ad: { en: "Paragraph A rewritten with feedback", tr: "Geri bildirimle Paragraf A" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["Join Part A1 and Part A2 into one paragraph of about 250 words and improve it with the feedback.",
           "Bring the printed sources with the evidence highlighted, the note-taking form, the outline and the Week 7 paper."],
      tr: ["A1 ve A2'yi yaklaşık 250 kelimelik tek paragrafta birleştir, geri bildirimle iyileştir.",
           "Basılı ve kanıtı vurgulu kaynaklar, not formu, outline ve 7. hafta kâğıdı getirilir."]
    },
    belge: "Weeks 7–8 guidance",
    benim: []
  },
  {
    id: "s10", hafta: "W9", tarih: { en: "30 Nov – 4 Dec", tr: "30 Kas – 4 Ara" }, durum: "gelecek",
    ad: { en: "Midterm: Body Paragraph 2", tr: "Ara sınav: Gövde Paragrafı 2" },
    puan: { en: "graded · 30%", tr: "notlu · %30" },
    istenen: {
      en: ["Paragraph B for my own subtopic, written in class under Testing Office rules.",
           "Allowed: the outline, the academic sources and permitted research notes; no pre-written text."],
      tr: ["Kendi alt başlığım için Paragraf B, sınıfta, Testing Office kurallarıyla yazılır.",
           "Serbest: outline, akademik kaynaklar ve izinli araştırma notları; önceden yazılmış metin yok."]
    },
    belge: "Course schedule · Week 9",
    benim: []
  },
  {
    id: "s11", hafta: "W10–12", tarih: { en: "7 – 25 Dec", tr: "7 – 25 Ara" }, durum: "gelecek",
    ad: { en: "Introduction and conclusion", tr: "Giriş ve sonuç" },
    puan: { en: "graded · 10% · group", tr: "notlu · %10 · grup" },
    istenen: {
      en: ["The introduction gives the necessary context and leads to the thesis; the conclusion returns to the argument and states its significance.",
           "Written by the group in class in Week 12, in line with the six body paragraphs."],
      tr: ["Giriş gerekli bağlamı verip teze götürür; sonuç iddiaya döner ve önemini söyler.",
           "12. haftada grupça sınıfta, altı gövde paragrafıyla uyumlu yazılır."]
    },
    belge: "Course schedule · Weeks 10–12",
    benim: []
  },
  {
    id: "s12", hafta: "W13", tarih: { en: "by 31 Dec, 18:00", tr: "31 Ara, 18:00'e kadar" }, durum: "gelecek",
    ad: { en: "Final synthesis essay", tr: "Final sentez yazısı" },
    puan: { en: "5% upload · final exam 40%", tr: "%5 yükleme · final sınavı %40" },
    istenen: {
      en: ["The whole essay revised as one argument; citations and reference list checked against APA 7.",
           "Uploaded to Ninova and Turnitin; late submissions are not accepted."],
      tr: ["Yazının tamamı tek bir iddia olarak gözden geçirilir; atıflar ve kaynakça APA 7'ye göre denetlenir.",
           "Ninova ve Turnitin'e yüklenir; geç teslim kabul edilmez."]
    },
    belge: "Course schedule · Week 13 · Programme rules",
    benim: []
  }
];
