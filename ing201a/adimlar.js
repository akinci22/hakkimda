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
  tubitak: "https://claude.ai/artifact/TV6b7csevp6awGLjiZSyy7",
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
    id: "s07", hafta: "W6–7", tarih: { en: "before 9 Nov", tr: "9 Kas'tan önce" }, durum: "gecti",
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
    id: "s08", hafta: "W7", tarih: { en: "9 Nov", tr: "9 Kas" }, durum: "gecti",
    ad: { en: "Paragraph A: Part A1 and Part A2", tr: "Paragraf A: A1 ve A2 kısmı" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["MEAL plan: Main idea (topic sentence) · Evidence (a specific finding with a citation) · Analysis (1–2 sentences after each piece of evidence) · Link (concluding sentence). Before each piece of evidence comes my own reason.",
           "Part A1 (20 min): topic sentence → support 1, my first reason → evidence A1 (paraphrase or summary + (Author, year)) → analysis (So what? How? How far?).",
           "Part A2 (20 min): transition + support 2, my second reason → evidence A2 → analysis starting with old information (“this finding”, “such variation”) → concluding sentence that links back to the main idea.",
           "By hand, in pencil; on the desk only the note-taking form, the topic outline and the sources; no AI tools. Written feedback on each part.",
           "After class: a photo of the paper goes to the “6. Body Paragraph 1” folder on Google Drive, and the paper itself comes to the Week 8 class."],
      tr: ["MEAL planı: Main idea (konu cümlesi) · Evidence (atıflı, belirli bir bulgu) · Analysis (her kanıttan sonra 1–2 cümle) · Link (sonuç cümlesi). Her kanıttan önce benim kendi nedenim gelir.",
           "A1 kısmı (20 dk): konu cümlesi → destek 1, ilk nedenim → A1 kanıtı (açımlama ya da özet + (Yazar, yıl)) → analiz (So what? How? How far?).",
           "A2 kısmı (20 dk): geçiş + destek 2, ikinci nedenim → A2 kanıtı → eski bilgiyle başlayan analiz (“this finding”, “such variation”) → ana fikre bağlayan sonuç cümlesi.",
           "El yazısıyla, kurşun kalemle; masada yalnız not alma formu, outline ve kaynaklar; YZ aracı yok. Her kısma yazılı geri bildirim.",
           "Ders sonrası: kâğıdın fotoğrafı Google Drive'daki “6. Body Paragraph 1” klasörüne yüklenir, kâğıdın kendisi 8. hafta dersine getirilir."]
    },
    belge: "Week 7 slides (Writing Part A1 and Part A2) · Weeks 7–8 guidance · Week 6 slides",
    benim: [{ tur: "bilgi", en: "Parts A1 and A2 written in class on 9 November.", tr: "A1 ve A2 kısımları 9 Kasım'da sınıfta yazıldı." },
            { tur: "eksik", en: "Photo of my paper with feedback in “6. Body Paragraph 1” (course folder, not on the web)", tr: "Geri bildirimli kâğıdımın fotoğrafı “6. Body Paragraph 1” klasöründe (ders klasörü, web'de değil)" }]
  },
  {
    id: "s09", hafta: "W8", tarih: { en: "23 Nov", tr: "23 Kas" }, durum: "gelecek",
    ad: { en: "Paragraph A rewritten with feedback", tr: "Geri bildirimle Paragraf A" },
    puan: { en: "ungraded", tr: "notsuz" },
    istenen: {
      en: ["Join Part A1 and Part A2 into one paragraph of about 250 words and improve it with the feedback; timed, by hand.",
           "Bring the printed sources with the evidence highlighted, the note-taking form, the outline and the Week 7 paper with the instructor's feedback.",
           "Check before handing in: every sentence has a job (topic sentence, reason, evidence, analysis); each piece of evidence has a citation and an analysis after it; no “this” without a noun; transitions between the two supports."],
      tr: ["A1 ve A2'yi yaklaşık 250 kelimelik tek paragrafta birleştir, geri bildirimle iyileştir; süreli, el yazısıyla.",
           "Basılı ve kanıtı vurgulu kaynaklar, not formu, outline ve hocanın geri bildirimli 7. hafta kâğıdı getirilir.",
           "Teslimden önce kontrol: her cümlenin bir işi var (konu cümlesi, neden, kanıt, analiz); her kanıtın atfı ve arkasından analizi var; isimsiz “this” yok; iki destek arasında geçiş var."]
    },
    belge: "Weeks 7–8 guidance · Week 7 slides",
    benim: []
  },
  {
    id: "s10", hafta: "W9", tarih: { en: "30 Nov – 4 Dec", tr: "30 Kas – 4 Ara" }, durum: "gelecek",
    ad: { en: "Midterm: Body Paragraph 2", tr: "Ara sınav: Gövde Paragrafı 2" },
    puan: { en: "graded · 30%", tr: "notlu · %30" },
    istenen: {
      en: ["Paragraph B for my own subtopic, written in the Week 9 class, starting at 14:00, under Testing Office rules.",
           "Structure: topic sentence → major support → minor support (evidence, paraphrased, not copied) → citation (APA 7, narrative or parenthetical) → analysis (1–2 sentences) → concluding sentence; about 250 words.",
           "Two major supports, each backed by evidence from an academic source and followed by analysis; one clear idea connected to the thesis; no punctuation, grammar or spelling mistakes.",
           "Bring: the sources, printed (articles preferred); a printed dictionary and thesaurus if wished. Not allowed: mobile phones, electronic reference tools, pre-written text."],
      tr: ["Kendi alt başlığım için Paragraf B, 9. hafta dersinde, saat 14:00'te başlar, Testing Office kurallarıyla.",
           "Yapı: konu cümlesi → ana destek → ikincil destek (kanıt; açımlanır, kopyalanmaz) → atıf (APA 7, anlatı ya da parantez içi) → analiz (1–2 cümle) → sonuç cümlesi; yaklaşık 250 kelime.",
           "İki ana destek; her biri akademik kaynaktan kanıtla desteklenir ve arkasından analiz gelir; teze bağlı tek bir açık fikir; noktalama, dilbilgisi ve yazım hatası yok.",
           "Getirilecek: basılı kaynaklar (tercihen makale); istenirse basılı sözlük ve eş anlamlılar sözlüğü. Yasak: cep telefonu, elektronik başvuru aracı, önceden yazılmış metin."]
    },
    belge: "Course schedule · Week 9 · Midterm announcement · Extended Guidelines for Body Paragraph Writing",
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

/* Hocanın istedikleri → sayfadaki yeri → durum (tamam | benim | gelecek). "benim" = Akın'ın yapacağı kısım. */
window.GEREKLER = [
  { hedef: "b4", yer: "5", durum: "tamam",
    en: "Four academic sources for my subtopic, read in full; reliability (CRAAP facts)", tr: "Alt başlığım için dört akademik kaynak, tam okunmuş; güvenilirlik (CRAAP olguları)" },
  { hedef: "t-yuva", yer: "3", durum: "tamam",
    en: "Evidence highlighted and labelled A1, A2, B1, B2 in “Final Sources” (Surname_A1_Author_Year.pdf)", tr: "Kanıt vurgulu ve A1, A2, B1, B2 etiketli, “Final Sources” klasöründe (Soyad_A1_Yazar_Yıl.pdf)" },
  { hedef: "s06", yer: "4.6", durum: "tamam",
    en: "Revised thesis and full outline, in class (graded, 15%)", tr: "Düzeltilmiş tez ve tam outline, sınıfta (notlu, %15)" },
  { hedef: "s07", yer: "4.7", durum: "benim",
    en: "Note-taking form: citation, note and my thoughts for A1, A2, B1, B2", tr: "Not alma formu: A1, A2, B1, B2 için künye, not ve düşüncem" },
  { hedef: "s08", yer: "4.8", durum: "benim",
    en: "Parts A1 and A2 (MEAL plan); photo of the paper in “6. Body Paragraph 1”", tr: "A1 ve A2 kısımları (MEAL planı); kâğıdın fotoğrafı “6. Body Paragraph 1” klasöründe" },
  { hedef: "s09", yer: "4.9", durum: "gelecek",
    en: "Paragraph A rewritten with feedback (about 250 words); bring the Week 7 paper", tr: "Geri bildirimle Paragraf A (yaklaşık 250 kelime); 7. hafta kâğıdı getirilir" },
  { hedef: "s10", yer: "4.10", durum: "gelecek",
    en: "Midterm: Body Paragraph 2, Week 9, 14:00; printed sources, no phones (30%)", tr: "Ara sınav: Gövde Paragrafı 2, 9. hafta, 14:00; basılı kaynak, telefon yok (%30)" },
  { hedef: "kc", yer: "Ref.", durum: "tamam",
    en: "APA 7 citations and reference list", tr: "APA 7 atıflar ve kaynakça" },
  { hedef: "b6", yer: "7", durum: "tamam",
    en: "Use of AI stated under the course AI policy", tr: "Ders YZ politikasına göre YZ kullanımı beyanı" }
];
