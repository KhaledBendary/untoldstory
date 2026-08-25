import { DEFAULT_LOCALE, LOCALE_CODES, type Locale } from "@/lib/i18n";

/**
 * Titles and descriptions for the six hand-written pages.
 *
 * Detail pages (services, work, insights) get theirs from the CMS, which
 * returns translated copy per `?locale=`. These six have no CMS record — the
 * `/about` and `/home` endpoints return English regardless of locale — so
 * their metadata lives here, one entry per language.
 *
 * The brand name stays in Latin script everywhere: it is the registered name
 * people search for, including in the CJK and Cyrillic markets.
 */

export type PageKey = "home" | "about" | "services" | "work" | "insights" | "contact";
export type PageMeta = { title: string; description: string };

const EN: Record<PageKey, PageMeta> = {
  home: {
    title: "Film & Video Production, Egypt & MENA | Global Untold Story",
    description: "Full-cycle film, advertising and content production across Egypt, UAE and Saudi Arabia. Offices in Egyptian Media Production City, Dubai and Jeddah.",
  },
  about: {
    title: "About Global Untold Story — Creative Production Studio",
    description: "An international creative production studio working across film, advertising, documentary, television, live production, post and original IP.",
  },
  services: {
    title: "Services — 13 Production Crafts | Global Untold Story",
    description: "On-ground production in Egypt, commercial advertising, documentary, corporate video, live broadcast, post-production, CGI and localization.",
  },
  work: {
    title: "Portfolio — Film & Advertising Work | Global Untold Story",
    description: "Selected commercials, documentaries, corporate films, live productions and photography created for brands and institutions worldwide.",
  },
  insights: {
    title: "Insights — Notes From the Field | Global Untold Story",
    description: "Production insights, practical guides and field notes across film, commercials, documentaries, corporate video and MENA production.",
  },
  contact: {
    title: "Contact — Start Your Production | Global Untold Story",
    description: "Get a quote from Global Untold Story. Offices in Egyptian Media Production City, Business Bay Dubai and Jeddah. Email bendary@globaluntoldstory.com.",
  },
};

const AR: Record<PageKey, PageMeta> = {
  home: {
    title: "إنتاج أفلام وفيديو في مصر والمنطقة | Global Untold Story",
    description: "إنتاج متكامل للأفلام والإعلانات والمحتوى في مصر والإمارات والسعودية. مكاتبنا في مدينة الإنتاج الإعلامي ودبي وجدة.",
  },
  about: {
    title: "من نحن — استوديو إنتاج إبداعي | Global Untold Story",
    description: "استوديو إنتاج إبداعي دولي يعمل في الأفلام والإعلانات والأفلام الوثائقية والتلفزيون والبث المباشر وما بعد الإنتاج والملكية الفكرية الأصلية.",
  },
  services: {
    title: "خدماتنا — ثلاث عشرة حرفة إنتاجية | Global Untold Story",
    description: "إنتاج ميداني في مصر، إعلانات تجارية، أفلام وثائقية، فيديو مؤسسي، بث مباشر، ما بعد الإنتاج، الجرافيك المتحرك والتوطين.",
  },
  work: {
    title: "أعمالنا — أفلام وإعلانات | Global Untold Story",
    description: "مختارات من الإعلانات والأفلام الوثائقية والأفلام المؤسسية والإنتاج المباشر والتصوير لعلامات تجارية ومؤسسات حول العالم.",
  },
  insights: {
    title: "مقالاتنا — ملاحظات من الميدان | Global Untold Story",
    description: "رؤى إنتاجية وأدلة عملية وملاحظات ميدانية في الأفلام والإعلانات والأفلام الوثائقية والفيديو المؤسسي والإنتاج في الشرق الأوسط.",
  },
  contact: {
    title: "اتصل بنا — ابدأ إنتاجك | Global Untold Story",
    description: "احصل على عرض سعر من Global Untold Story. مكاتبنا في مدينة الإنتاج الإعلامي والخليج التجاري بدبي وجدة. راسلنا على bendary@globaluntoldstory.com.",
  },
};

const DE: Record<PageKey, PageMeta> = {
  home: {
    title: "Film- und Videoproduktion in Ägypten | Global Untold Story",
    description: "Komplette Film-, Werbe- und Contentproduktion in Ägypten, den VAE und Saudi-Arabien. Büros in Media Production City, Dubai und Dschidda.",
  },
  about: {
    title: "Über uns — Kreatives Produktionsstudio | Global Untold Story",
    description: "Ein internationales Kreativproduktionsstudio für Film, Werbung, Dokumentarfilm, Fernsehen, Live-Produktion, Postproduktion und eigene Formate.",
  },
  services: {
    title: "Leistungen — 13 Produktionsgewerke | Global Untold Story",
    description: "Produktionsservice in Ägypten, Werbefilm, Dokumentarfilm, Unternehmensvideo, Live-Übertragung, Postproduktion, CGI und Lokalisierung.",
  },
  work: {
    title: "Portfolio — Film und Werbung | Global Untold Story",
    description: "Ausgewählte Werbespots, Dokumentarfilme, Unternehmensfilme, Live-Produktionen und Fotografie für Marken und Institutionen weltweit.",
  },
  insights: {
    title: "Einblicke — Notizen aus der Praxis | Global Untold Story",
    description: "Produktionswissen, praktische Leitfäden und Erfahrungen aus Film, Werbung, Dokumentarfilm, Unternehmensvideo und Produktion im Nahen Osten.",
  },
  contact: {
    title: "Kontakt — Projekt starten | Global Untold Story",
    description: "Angebot von Global Untold Story anfordern. Büros in Media Production City, Business Bay Dubai und Dschidda. E-Mail: bendary@globaluntoldstory.com.",
  },
};

const ES: Record<PageKey, PageMeta> = {
  home: {
    title: "Producción de cine y vídeo en Egipto | Global Untold Story",
    description: "Producción integral de cine, publicidad y contenido en Egipto, Emiratos y Arabia Saudí. Oficinas en Media Production City, Dubái y Yeda.",
  },
  about: {
    title: "Quiénes somos — Estudio creativo | Global Untold Story",
    description: "Estudio internacional de producción creativa dedicado al cine, la publicidad, el documental, la televisión, el directo, la postproducción y la IP propia.",
  },
  services: {
    title: "Servicios — 13 oficios de producción | Global Untold Story",
    description: "Producción local en Egipto, publicidad comercial, documental, vídeo corporativo, directo, postproducción, CGI y localización.",
  },
  work: {
    title: "Portafolio — Cine y publicidad | Global Untold Story",
    description: "Selección de anuncios, documentales, películas corporativas, producciones en directo y fotografía para marcas e instituciones de todo el mundo.",
  },
  insights: {
    title: "Ideas — Notas desde el rodaje | Global Untold Story",
    description: "Conocimiento de producción, guías prácticas y notas de campo sobre cine, publicidad, documental, vídeo corporativo y producción en Oriente Medio.",
  },
  contact: {
    title: "Contacto — Empieza tu producción | Global Untold Story",
    description: "Pide presupuesto a Global Untold Story. Oficinas en Media Production City, Business Bay Dubái y Yeda. Escríbenos a bendary@globaluntoldstory.com.",
  },
};

const FR: Record<PageKey, PageMeta> = {
  home: {
    title: "Production de films et vidéos, Égypte | Global Untold Story",
    description: "Production complète de films, publicités et contenus en Égypte, aux Émirats et en Arabie saoudite. Bureaux à Media Production City, Dubaï et Djeddah.",
  },
  about: {
    title: "À propos — Studio de production | Global Untold Story",
    description: "Studio international de production créative : film, publicité, documentaire, télévision, direct, postproduction et formats originaux.",
  },
  services: {
    title: "Services — 13 métiers de production | Global Untold Story",
    description: "Production sur place en Égypte, publicité, documentaire, vidéo d'entreprise, direct, postproduction, CGI et localisation.",
  },
  work: {
    title: "Portfolio — Films et publicité | Global Untold Story",
    description: "Sélection de publicités, documentaires, films d'entreprise, productions en direct et photographies réalisés pour des marques et institutions du monde entier.",
  },
  insights: {
    title: "Analyses — Notes de terrain | Global Untold Story",
    description: "Savoir-faire, guides pratiques et notes de terrain sur le film, la publicité, le documentaire et la production au Moyen-Orient.",
  },
  contact: {
    title: "Contact — Lancez votre production | Global Untold Story",
    description: "Demandez un devis à Global Untold Story. Bureaux à Media Production City, Business Bay Dubaï et Djeddah. Écrivez à bendary@globaluntoldstory.com.",
  },
};

const IT: Record<PageKey, PageMeta> = {
  home: {
    title: "Produzione video e cinema in Egitto | Global Untold Story",
    description: "Produzione completa di film, pubblicità e contenuti in Egitto, Emirati e Arabia Saudita. Sedi a Media Production City, Dubai e Gedda.",
  },
  about: {
    title: "Chi siamo — Studio di produzione | Global Untold Story",
    description: "Uno studio internazionale di produzione creativa dedicato a cinema, pubblicità, documentario, televisione, diretta, postproduzione e format originali.",
  },
  services: {
    title: "Servizi — 13 mestieri di produzione | Global Untold Story",
    description: "Produzione sul posto in Egitto, pubblicità, documentario, video aziendale, diretta, postproduzione, CGI e localizzazione.",
  },
  work: {
    title: "Portfolio — Cinema e pubblicità | Global Untold Story",
    description: "Selezione di spot, documentari, film aziendali, produzioni dal vivo e fotografia realizzati per marchi e istituzioni in tutto il mondo.",
  },
  insights: {
    title: "Approfondimenti — Note dal campo | Global Untold Story",
    description: "Competenze di produzione, guide pratiche e note dal campo su cinema, pubblicità, documentario, video aziendale e produzione in Medio Oriente.",
  },
  contact: {
    title: "Contatti — Avvia la produzione | Global Untold Story",
    description: "Richiedi un preventivo a Global Untold Story. Sedi a Media Production City, Business Bay Dubai e Gedda. Scrivi a bendary@globaluntoldstory.com.",
  },
};

const PT: Record<PageKey, PageMeta> = {
  home: {
    title: "Produção de filme e vídeo no Egito | Global Untold Story",
    description: "Produção completa de filmes, publicidade e conteúdo no Egito, Emirados e Arábia Saudita. Escritórios em Media Production City, Dubai e Jidá.",
  },
  about: {
    title: "Sobre nós — Estúdio de produção | Global Untold Story",
    description: "Um estúdio internacional de produção criativa dedicado a cinema, publicidade, documentário, televisão, directo, pós-produção e formatos próprios.",
  },
  services: {
    title: "Serviços — 13 ofícios de produção | Global Untold Story",
    description: "Produção local no Egito, publicidade, documentário, vídeo corporativo, transmissão ao vivo, pós-produção, CGI e localização.",
  },
  work: {
    title: "Portfólio — Cinema e publicidade | Global Untold Story",
    description: "Seleção de anúncios, documentários, filmes corporativos, produções ao vivo e fotografia criados para marcas e instituições de todo o mundo.",
  },
  insights: {
    title: "Perspetivas — Notas de bastidores | Global Untold Story",
    description: "Conhecimento de produção, guias práticos e notas de campo sobre cinema, publicidade, documentário, vídeo corporativo e produção no Médio Oriente.",
  },
  contact: {
    title: "Contacto — Comece a sua produção | Global Untold Story",
    description: "Peça um orçamento à Global Untold Story. Escritórios em Media Production City, Business Bay Dubai e Jidá. Escreva para bendary@globaluntoldstory.com.",
  },
};

const TR: Record<PageKey, PageMeta> = {
  home: {
    title: "Mısır'da film ve video prodüksiyonu | Global Untold Story",
    description: "Mısır, BAE ve Suudi Arabistan'da uçtan uca film, reklam ve içerik prodüksiyonu. Ofislerimiz Media Production City, Dubai ve Cidde'de.",
  },
  about: {
    title: "Hakkımızda — Yaratıcı prodüksiyon | Global Untold Story",
    description: "Film, reklam, belgesel, televizyon, canlı yayın, post prodüksiyon ve özgün format alanlarında çalışan uluslararası bir yaratıcı prodüksiyon stüdyosu.",
  },
  services: {
    title: "Hizmetler — 13 prodüksiyon dalı | Global Untold Story",
    description: "Mısır'da saha prodüksiyonu, reklam filmi, belgesel, kurumsal video, canlı yayın, post prodüksiyon, CGI ve yerelleştirme.",
  },
  work: {
    title: "Portföy — Film ve reklam işleri | Global Untold Story",
    description: "Dünya genelinde markalar ve kurumlar için üretilen seçili reklam filmleri, belgeseller, kurumsal filmler, canlı prodüksiyonlar ve fotoğraf çalışmaları.",
  },
  insights: {
    title: "Görüşler — Sahadan notlar | Global Untold Story",
    description: "Film, reklam, belgesel, kurumsal video ve Orta Doğu prodüksiyonu üzerine üretim bilgisi, pratik rehberler ve saha notları.",
  },
  contact: {
    title: "İletişim — Prodüksiyona başlayın | Global Untold Story",
    description: "Global Untold Story'den teklif alın. Ofislerimiz Media Production City, Business Bay Dubai ve Cidde'de. E-posta: bendary@globaluntoldstory.com.",
  },
};

const RU: Record<PageKey, PageMeta> = {
  home: {
    title: "Кино- и видеопроизводство в Египте | Global Untold Story",
    description: "Полный цикл производства фильмов, рекламы и контента в Египте, ОАЭ и Саудовской Аравии. Офисы в Media Production City, Дубае и Джидде.",
  },
  about: {
    title: "О нас — креативная студия | Global Untold Story",
    description: "Международная студия креативного производства: кино, реклама, документальные фильмы, телевидение, прямые эфиры, постпродакшн и собственные форматы.",
  },
  services: {
    title: "Услуги — 13 направлений | Global Untold Story",
    description: "Продакшн-сервис в Египте, рекламные ролики, документальное кино, корпоративное видео, прямые трансляции, постпродакшн, CGI и локализация.",
  },
  work: {
    title: "Портфолио — кино и реклама | Global Untold Story",
    description: "Избранные рекламные ролики, документальные и корпоративные фильмы, прямые трансляции и фотосъёмка для брендов и организаций по всему миру.",
  },
  insights: {
    title: "Статьи — заметки со съёмок | Global Untold Story",
    description: "Опыт производства, практические руководства и заметки со съёмок: кино, реклама, документальные фильмы, корпоративное видео и продакшн на Ближнем Востоке.",
  },
  contact: {
    title: "Контакты — начать проект | Global Untold Story",
    description: "Запросите смету у Global Untold Story. Офисы в Media Production City, Business Bay Дубай и Джидде. Пишите на bendary@globaluntoldstory.com.",
  },
};

const ZH: Record<PageKey, PageMeta> = {
  home: {
    title: "埃及及中东影视制作 | Global Untold Story",
    description: "在埃及、阿联酋和沙特提供电影、广告与内容的全流程制作服务。办公室设于埃及传媒制作城、迪拜和吉达。",
  },
  about: {
    title: "关于我们——创意制作公司 | Global Untold Story",
    description: "一家国际创意制作公司，业务涵盖电影、广告、纪录片、电视、现场直播、后期制作与原创节目版权。",
  },
  services: {
    title: "服务——十三项制作专长 | Global Untold Story",
    description: "埃及本地制作、商业广告、纪录片、企业视频、现场直播、后期制作、CGI 与本地化服务。",
  },
  work: {
    title: "作品集——影视与广告 | Global Untold Story",
    description: "为全球品牌与机构制作的广告片、纪录片、企业影片、现场直播与摄影作品精选。",
  },
  insights: {
    title: "洞察——来自现场的笔记 | Global Untold Story",
    description: "关于电影、广告、纪录片、企业视频与中东制作的行业经验、实用指南与现场笔记。",
  },
  contact: {
    title: "联系我们——启动您的项目 | Global Untold Story",
    description: "向 Global Untold Story 索取报价。办公室位于埃及传媒制作城、迪拜商业湾和吉达。邮箱：bendary@globaluntoldstory.com。",
  },
};

const JA: Record<PageKey, PageMeta> = {
  home: {
    title: "エジプト・中東の映像制作 | Global Untold Story",
    description: "エジプト、UAE、サウジアラビアで映画・広告・コンテンツの一貫制作を行います。拠点はエジプト・メディアプロダクションシティ、ドバイ、ジッダ。",
  },
  about: {
    title: "会社概要——クリエイティブ制作会社 | Global Untold Story",
    description: "映画、広告、ドキュメンタリー、テレビ、ライブ制作、ポストプロダクション、オリジナル企画を手がける国際的なクリエイティブ制作スタジオです。",
  },
  services: {
    title: "サービス——13の制作領域 | Global Untold Story",
    description: "エジプトでの現地制作、広告、ドキュメンタリー、企業向け映像、生中継、ポストプロダクション、CGI、ローカライズ。",
  },
  work: {
    title: "実績——映像と広告 | Global Untold Story",
    description: "世界のブランドや団体向けに制作したCM、ドキュメンタリー、企業映像、ライブ制作、写真作品を厳選して紹介します。",
  },
  insights: {
    title: "インサイト——現場からのノート | Global Untold Story",
    description: "映画、CM、ドキュメンタリー、企業映像、中東での制作に関する知見、実践ガイド、現場からのノート。",
  },
  contact: {
    title: "お問い合わせ——制作を始める | Global Untold Story",
    description: "Global Untold Story にお見積りをご依頼ください。拠点はメディアプロダクションシティ、ドバイ・ビジネスベイ、ジッダ。bendary@globaluntoldstory.com",
  },
};

const KO: Record<PageKey, PageMeta> = {
  home: {
    title: "이집트·중동 영상 제작 | Global Untold Story",
    description: "이집트, UAE, 사우디아라비아에서 영화·광고·콘텐츠의 전 과정을 제작합니다. 이집트 미디어 프로덕션 시티, 두바이, 제다에 사무소가 있습니다.",
  },
  about: {
    title: "회사 소개 — 크리에이티브 제작사 | Global Untold Story",
    description: "영화, 광고, 다큐멘터리, 방송, 라이브 제작, 후반작업, 자체 포맷 개발을 아우르는 국제 크리에이티브 제작 스튜디오입니다.",
  },
  services: {
    title: "서비스 — 13개 제작 분야 | Global Untold Story",
    description: "이집트 현지 제작, 광고, 다큐멘터리, 기업 영상, 생중계, 후반작업, CGI, 현지화 서비스.",
  },
  work: {
    title: "포트폴리오 — 영상과 광고 | Global Untold Story",
    description: "전 세계 브랜드와 기관을 위해 제작한 광고, 다큐멘터리, 기업 영상, 라이브 제작, 사진 작업을 선별해 소개합니다.",
  },
  insights: {
    title: "인사이트 — 현장의 기록 | Global Untold Story",
    description: "영화, 광고, 다큐멘터리, 기업 영상, 중동 제작에 관한 노하우와 실무 가이드, 현장 기록.",
  },
  contact: {
    title: "문의 — 제작 시작하기 | Global Untold Story",
    description: "Global Untold Story에 견적을 문의하세요. 미디어 프로덕션 시티, 두바이 비즈니스베이, 제다에 사무소가 있습니다. bendary@globaluntoldstory.com",
  },
};

const PL: Record<PageKey, PageMeta> = {
  home: {
    title: "Produkcja filmowa w Egipcie | Global Untold Story",
    description: "Pełna produkcja filmów, reklam i treści w Egipcie, ZEA i Arabii Saudyjskiej. Biura w Media Production City, Dubaju i Dżuddzie.",
  },
  about: {
    title: "O nas — studio produkcji kreatywnej | Global Untold Story",
    description: "Międzynarodowe studio produkcji kreatywnej działające w obszarze filmu, reklamy, dokumentu, telewizji, transmisji na żywo i postprodukcji.",
  },
  services: {
    title: "Usługi — 13 obszarów produkcji | Global Untold Story",
    description: "Produkcja na miejscu w Egipcie, reklama, dokument, wideo korporacyjne, transmisje na żywo, postprodukcja, CGI i lokalizacja.",
  },
  work: {
    title: "Portfolio — film i reklama | Global Untold Story",
    description: "Wybrane reklamy, filmy dokumentalne i korporacyjne, produkcje na żywo oraz fotografia zrealizowane dla marek i instytucji na całym świecie.",
  },
  insights: {
    title: "Wiedza — notatki z planu | Global Untold Story",
    description: "Wiedza produkcyjna, praktyczne poradniki i notatki z planu dotyczące filmu, reklamy, dokumentu, wideo korporacyjnego i produkcji na Bliskim Wschodzie.",
  },
  contact: {
    title: "Kontakt — rozpocznij produkcję | Global Untold Story",
    description: "Poproś o wycenę w Global Untold Story. Biura w Media Production City, Business Bay w Dubaju i Dżuddzie. E-mail: bendary@globaluntoldstory.com.",
  },
};

const SW: Record<PageKey, PageMeta> = {
  home: {
    title: "Utayarishaji wa filamu Misri | Global Untold Story",
    description: "Utayarishaji kamili wa filamu, matangazo na maudhui nchini Misri, Falme za Kiarabu na Saudi Arabia. Ofisi Media Production City, Dubai na Jeddah.",
  },
  about: {
    title: "Kuhusu sisi — studio ya utayarishaji | Global Untold Story",
    description: "Studio ya kimataifa ya utayarishaji wa ubunifu inayofanya kazi katika filamu, matangazo, filamu za uhalisia, televisheni, matangazo ya moja kwa moja na uhariri.",
  },
  services: {
    title: "Huduma — fani 13 za utayarishaji | Global Untold Story",
    description: "Utayarishaji wa ndani nchini Misri, matangazo ya biashara, filamu za uhalisia, video za kampuni, matangazo ya moja kwa moja, uhariri, CGI na tafsiri.",
  },
  work: {
    title: "Kazi zetu — filamu na matangazo | Global Untold Story",
    description: "Matangazo, filamu za uhalisia, filamu za kampuni, matukio ya moja kwa moja na upigaji picha tuliyotayarisha kwa chapa na taasisi duniani kote.",
  },
  insights: {
    title: "Maarifa — maelezo kutoka uwandani | Global Untold Story",
    description: "Maarifa ya utayarishaji, miongozo ya vitendo na maelezo ya uwandani kuhusu filamu, matangazo, filamu za uhalisia na utayarishaji Mashariki ya Kati.",
  },
  contact: {
    title: "Wasiliana nasi — anza mradi wako | Global Untold Story",
    description: "Omba bei kutoka Global Untold Story. Ofisi Media Production City, Business Bay Dubai na Jeddah. Barua pepe bendary@globaluntoldstory.com.",
  },
};

const BY_LOCALE: Record<Locale, Record<PageKey, PageMeta>> = {
  en: EN, ar: AR, de: DE, es: ES, fr: FR, it: IT, pt: PT,
  tr: TR, ru: RU, zh: ZH, ja: JA, ko: KO, pl: PL, sw: SW,
};

/** Every locale is populated; the fallback guards against a bad `locale` string. */
export function pageMeta(key: PageKey, locale: string): PageMeta {
  return BY_LOCALE[locale as Locale]?.[key] ?? BY_LOCALE[DEFAULT_LOCALE][key];
}

/** Used by the build check to prove no language silently falls back. */
export const COVERED_LOCALES = LOCALE_CODES.filter((code) => Boolean(BY_LOCALE[code]));
