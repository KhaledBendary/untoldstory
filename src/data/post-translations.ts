import type { Locale } from "@/lib/i18n";

/**
 * Translations for the articles that live in this repo rather than the CMS.
 *
 * Most insights come from the CMS, which serves them per locale. Two do not —
 * they are static posts here, so every language was showing them in English.
 * `npm run seo:translations` reported them as the only untranslated pages left
 * in the seven newly indexed locales, seven times each.
 *
 * Only the languages the site indexes are translated. zh, ja, ko, pl and sw are
 * noindex precisely because they have no translated bodies; adding partial
 * copy for them here would give the impression they are ready when they are
 * not.
 *
 * If one of these articles moves into the CMS, the CMS copy wins — this is
 * consulted only on the static fallback path.
 */

export type PostTranslation = {
  title: string;
  excerpt: string;
  body: string[];
};

type TranslatedLocale = Exclude<Locale, "en">;

export const POST_TRANSLATIONS: Record<string, Partial<Record<TranslatedLocale, PostTranslation>>> = {
  "tv-commercial-production-in-egypt": {
    ar: {
      title: "إنتاج الإعلانات التلفزيونية في مصر: الدليل الكامل 2026",
      excerpt:
        "أنواع الإعلانات، ومسار العمل، والقطاعات، والاتجاهات، والتكلفة في مصر — الدليل الكامل لعام 2026.",
      body: [
        "تظل مصر مركز الإنتاج الأول في العالم العربي: طواقم عمل عميقة الخبرة، ومواقع تصوير من الطراز العالمي، وصناعة إعلان ناضجة تجعلها موطناً طبيعياً لإنتاج الإعلانات التلفزيونية.",
        "الإعلانات تأتي بأشكال كثيرة: الإعلان التلفزيوني الكلاسيكي بمدة ثلاثين ثانية، والأفلام المصممة للمنصات الرقمية أولاً، والنسخ القصيرة الموجهة للأداء، وعروض المنتجات، وأفلام هوية العلامة. لكل صيغة قواعدها الخاصة، وأفضل الحملات تُصمَّم منذ اليوم الأول كعائلة متكاملة من المواد.",
        "مسار العمل منضبط: تطوير الفكرة والنص، ثم لوحات القصة والتصور المسبق، فاختيار الممثلين، والإدارة الفنية، والتصوير، ثم ما بعد الإنتاج — المونتاج والتصحيح اللوني والصوت والرسوم المتحركة وإعداد النسخ والتوطين لكل سوق تصل إليه الحملة.",
        "الميزانيات تختلف باختلاف الطموح: الممثلون والمواقع وبناء الديكورات وتعقيد ما بعد الإنتاج هي المحركات الأساسية. المهم هو القدرة على التوقع — ميزانية تفصيلية صادقة تُعتمد قبل التصوير، بلا مفاجآت بعده.",
        "ملامح 2026 واضحة: تصور مسبق وما بعد إنتاج بمساعدة الذكاء الاصطناعي، وأنظمة بصرية متحركة للعلامات، وحملات تُبنى كمنظومات متعددة الصيغ لا كإعلان واحد. ونحن نبني لهذا بالضبط.",
      ],
    },
    fr: {
      title: "Production de spots TV en Égypte : le guide complet 2026",
      excerpt:
        "Formats, méthode de travail, secteurs, tendances et budgets de la production publicitaire en Égypte — le guide complet 2026.",
      body: [
        "L'Égypte reste la première puissance de production du monde arabe : des équipes techniques expérimentées, des décors naturels d'exception et une industrie publicitaire mature en font un terrain naturel pour la production de spots TV.",
        "Les films publicitaires prennent bien des formes : le spot TV classique de trente secondes, les films pensés d'abord pour le digital, les déclinaisons courtes orientées performance, les démonstrations produit et les films de marque. Chaque format a sa grammaire, et les meilleures campagnes sont conçues dès le premier jour comme une famille d'éléments.",
        "La méthode est rigoureuse : développement du concept et du script, storyboards et prévisualisation, casting, direction artistique, tournage, puis postproduction — montage, étalonnage, son, motion design, versionnage et localisation pour chaque marché touché par la campagne.",
        "Les budgets varient selon l'ambition : les comédiens, les décors, les constructions et la complexité de la postproduction en sont les principaux moteurs. Ce qui compte, c'est la prévisibilité — un budget détaillé et honnête validé avant le tournage, sans surprise après.",
        "Les lignes de force de 2026 sont nettes : prévisualisation et postproduction assistées par l'IA, systèmes de marque animés, et campagnes construites comme des écosystèmes multiformats plutôt que comme un spot isolé. C'est précisément ce que nous produisons.",
      ],
    },
    de: {
      title: "TV-Werbeproduktion in Ägypten: der komplette Leitfaden 2026",
      excerpt:
        "Formate, Ablauf, Branchen, Trends und Budgets der Werbeproduktion in Ägypten — der komplette Leitfaden 2026.",
      body: [
        "Ägypten bleibt das Produktionszentrum der arabischen Welt: erfahrene Crews, Motive von Weltrang und eine gereifte Werbebranche machen das Land zur natürlichen Heimat für TV-Werbeproduktion.",
        "Werbefilme gibt es in vielen Formen: der klassische 30-Sekünder, digital-first gedachte Filme, performanceorientierte Cutdowns, Produktdemos und Markenfilme. Jedes Format hat seine eigene Grammatik, und die besten Kampagnen werden vom ersten Tag an als Familie von Assets angelegt.",
        "Der Ablauf ist diszipliniert: Konzept- und Drehbuchentwicklung, Storyboards und Previsualisierung, Casting, Art Direction, Dreh, dann Postproduktion — Schnitt, Farbkorrektur, Ton, Motion Design, Versionierung und Lokalisierung für jeden Markt, den die Kampagne erreicht.",
        "Budgets richten sich nach dem Anspruch: Darsteller, Motive, Szenenbau und die Komplexität der Post sind die wesentlichen Treiber. Entscheidend ist Planbarkeit — ein detailliertes, ehrliches Budget, das vor dem Dreh freigegeben wird und danach keine Überraschungen bereithält.",
        "Die Linien für 2026 sind klar: KI-gestützte Previsualisierung und Post, bewegungsgeführte Markensysteme und Kampagnen, die als multiformatige Ökosysteme statt als einzelner Spot gebaut werden. Genau dafür produzieren wir.",
      ],
    },
    es: {
      title: "Producción de spots de televisión en Egipto: guía completa 2026",
      excerpt:
        "Formatos, flujo de trabajo, sectores, tendencias y presupuestos de la producción publicitaria en Egipto: la guía completa de 2026.",
      body: [
        "Egipto sigue siendo la gran potencia de producción del mundo árabe: equipos técnicos con enorme experiencia, localizaciones de primer nivel y una industria publicitaria madura lo convierten en un destino natural para la producción de spots de televisión.",
        "Los anuncios adoptan muchas formas: el clásico spot de treinta segundos, piezas pensadas primero para digital, cortes orientados a rendimiento, demostraciones de producto y films de marca. Cada formato tiene su propia gramática, y las mejores campañas se diseñan desde el primer día como una familia de piezas.",
        "El flujo de trabajo es disciplinado: desarrollo del concepto y el guion, storyboards y previsualización, casting, dirección de arte, rodaje y después postproducción — montaje, etalonaje, sonido, motion graphics, versionado y localización para cada mercado al que llega la campaña.",
        "Los presupuestos varían según la ambición: el reparto, las localizaciones, la construcción de decorados y la complejidad de la post son los principales motores. Lo que importa es la previsibilidad: un presupuesto detallado y honesto aprobado antes del rodaje, sin sorpresas después.",
        "Las líneas de 2026 están claras: previsualización y postproducción asistidas por IA, sistemas de marca basados en movimiento y campañas construidas como ecosistemas multiformato en lugar de un único spot. Para eso producimos exactamente.",
      ],
    },
    it: {
      title: "Produzione di spot televisivi in Egitto: la guida completa 2026",
      excerpt:
        "Formati, flusso di lavoro, settori, tendenze e budget della produzione pubblicitaria in Egitto: la guida completa 2026.",
      body: [
        "L'Egitto resta la principale potenza produttiva del mondo arabo: troupe di grande esperienza, location di livello internazionale e un'industria pubblicitaria matura ne fanno una sede naturale per la produzione di spot televisivi.",
        "Gli spot assumono molte forme: il classico trenta secondi televisivo, film pensati prima di tutto per il digitale, tagli orientati alla performance, dimostrazioni di prodotto e film di marca. Ogni formato ha la sua grammatica, e le campagne migliori nascono fin dal primo giorno come una famiglia di materiali.",
        "Il flusso di lavoro è rigoroso: sviluppo del concept e della sceneggiatura, storyboard e previsualizzazione, casting, direzione artistica, riprese e poi postproduzione — montaggio, correzione colore, suono, motion graphics, versioning e localizzazione per ogni mercato che la campagna raggiunge.",
        "I budget variano con l'ambizione: interpreti, location, costruzioni scenografiche e complessità della post sono i fattori principali. Ciò che conta è la prevedibilità: un preventivo dettagliato e onesto approvato prima delle riprese, senza sorprese dopo.",
        "Le direttrici del 2026 sono chiare: previsualizzazione e postproduzione assistite dall'IA, sistemi di marca guidati dal movimento e campagne costruite come ecosistemi multiformato anziché come un singolo spot. È esattamente ciò per cui produciamo.",
      ],
    },
    pt: {
      title: "Produção de anúncios de televisão no Egito: o guia completo de 2026",
      excerpt:
        "Formatos, fluxo de trabalho, setores, tendências e orçamentos da produção publicitária no Egito — o guia completo de 2026.",
      body: [
        "O Egito continua a ser a grande potência de produção do mundo árabe: equipas técnicas com enorme experiência, cenários de nível mundial e uma indústria publicitária madura fazem dele uma casa natural para a produção de anúncios de televisão.",
        "Os anúncios assumem muitas formas: o clássico spot de trinta segundos, filmes pensados primeiro para o digital, cortes orientados ao desempenho, demonstrações de produto e filmes de marca. Cada formato tem a sua gramática, e as melhores campanhas são concebidas desde o primeiro dia como uma família de peças.",
        "O fluxo de trabalho é disciplinado: desenvolvimento do conceito e do guião, storyboards e pré-visualização, casting, direção de arte, rodagem e depois pós-produção — montagem, correção de cor, som, motion graphics, versionamento e localização para cada mercado que a campanha alcança.",
        "Os orçamentos variam com a ambição: elenco, localizações, construção de cenários e complexidade da pós são os principais motores. O que importa é a previsibilidade — um orçamento detalhado e honesto aprovado antes da rodagem, sem surpresas depois.",
        "As linhas de 2026 são claras: pré-visualização e pós-produção assistidas por IA, sistemas de marca guiados pelo movimento e campanhas construídas como ecossistemas multiformato em vez de um único anúncio. É exatamente para isso que produzimos.",
      ],
    },
    ru: {
      title: "Производство телевизионной рекламы в Египте: полное руководство 2026",
      excerpt:
        "Форматы, порядок работы, отрасли, тенденции и бюджеты рекламного производства в Египте — полное руководство на 2026 год.",
      body: [
        "Египет остаётся главным производственным центром арабского мира: опытные съёмочные группы, локации мирового уровня и зрелая рекламная индустрия делают его естественным домом для производства телевизионной рекламы.",
        "Реклама бывает разной: классический тридцатисекундный ролик, фильмы, задуманные прежде всего для цифровых площадок, короткие перемонтажи под перформанс, демонстрации продукта и имиджевые фильмы. У каждого формата своя грамматика, и лучшие кампании с первого дня проектируются как семейство материалов.",
        "Порядок работы строгий: разработка идеи и сценария, раскадровки и превизуализация, кастинг, художественная постановка, съёмка, затем постпродакшн — монтаж, цветокоррекция, звук, моушн-дизайн, версионирование и локализация под каждый рынок, которого касается кампания.",
        "Бюджеты зависят от амбиций: актёры, локации, декорации и сложность постпродакшна — основные факторы. Важна предсказуемость: подробная и честная смета, утверждённая до съёмок, без сюрпризов после.",
        "Линии 2026 года очевидны: превизуализация и постпродакшн с помощью ИИ, брендовые системы, построенные на движении, и кампании как мультиформатные экосистемы, а не единичный ролик. Именно для этого мы и работаем.",
      ],
    },
    tr: {
      title: "Mısır'da TV reklam prodüksiyonu: 2026 kapsamlı rehberi",
      excerpt:
        "Mısır'da reklam prodüksiyonunun formatları, iş akışı, sektörleri, eğilimleri ve bütçeleri — 2026 kapsamlı rehberi.",
      body: [
        "Mısır, Arap dünyasının prodüksiyon merkezi olmayı sürdürüyor: derin deneyime sahip ekipler, dünya standartlarında mekânlar ve olgunlaşmış bir reklam sektörü burayı TV reklam prodüksiyonu için doğal bir ev yapıyor.",
        "Reklamlar pek çok biçimde gelir: klasik otuz saniyelik TV spotu, önce dijital için tasarlanmış filmler, performans odaklı kısa kesimler, ürün tanıtımları ve marka filmleri. Her formatın kendi dili vardır ve en iyi kampanyalar daha ilk günden bir materyal ailesi olarak tasarlanır.",
        "İş akışı disiplinlidir: konsept ve senaryo geliştirme, storyboard ve ön görselleştirme, oyuncu seçimi, sanat yönetimi, çekim ve ardından post prodüksiyon — kurgu, renk düzenleme, ses, motion grafik, sürümleme ve kampanyanın ulaştığı her pazar için yerelleştirme.",
        "Bütçeler hedefe göre değişir: oyuncular, mekânlar, dekor yapımı ve postun karmaşıklığı temel belirleyicilerdir. Önemli olan öngörülebilirliktir — çekimden önce onaylanan ayrıntılı ve dürüst bir bütçe, sonrasında sürpriz yok.",
        "2026'nın çizgileri net: yapay zekâ destekli ön görselleştirme ve post, hareket temelli marka sistemleri ve tek bir spot yerine çok formatlı ekosistem olarak kurulan kampanyalar. Tam da bunun için üretiyoruz.",
      ],
    },
  },

  "corporate-video-production-in-cairo": {
    ar: {
      title: "إنتاج أفلام الشركات في القاهرة: ما يجب أن تعرفه كل علامة تجارية",
      excerpt:
        "لماذا صار فيلم الشركة ضرورة، وكيف يغيّر الإنتاج المتكامل من مدينة الإنتاج الإعلامي قواعد اللعبة.",
      body: [
        "لم يعد فيلم الشركة رفاهية. تواصل القيادة، وبناء صورة جهة العمل، والتدريب على السلامة، وعلاقات المستثمرين، ودعم فرق المبيعات — كلها تتحرك أسرع حين تُروى على الشاشة.",
        "تمنحك القاهرة ميزة فريدة: مدينة الإنتاج الإعلامي المصرية تجمع الاستوديوهات وطواقم العمل والمعدات ومرافق ما بعد الإنتاج في منظومة واحدة — وهناك يقع مقرنا.",
        "الفارق بين فيلم شركة يُنسى وآخر يترك أثراً هو الحكاية. العمليات والمصانع والمنشآت تصبح سينمائية حين تُصوَّر بقصد واضح: بشر حقيقيون، ومقياس حقيقي، وضوء حقيقي.",
        "الشريك المتكامل يأخذك من استراتيجية الرسالة إلى الإنتاج ثم التسليم بنسخ متعددة وتوطينها — فريق واحد، ومعيار واحد، وجهة مسؤولية واحدة.",
      ],
    },
    fr: {
      title: "Production de films d'entreprise au Caire : ce que toute marque doit savoir",
      excerpt:
        "Pourquoi le film d'entreprise compte, et comment une production intégrée depuis la Media Production City change la donne.",
      body: [
        "Le film d'entreprise n'est plus un supplément. Communication dirigeante, marque employeur, formation à la sécurité, relations investisseurs et aide à la vente : tout avance plus vite en images.",
        "Le Caire offre un avantage unique : l'Egyptian Media Production City réunit studios, équipes, matériel et moyens de postproduction dans un même écosystème — et c'est là que nous sommes installés.",
        "Ce qui sépare un film d'entreprise oubliable d'un film puissant, c'est le récit. Les opérations, les usines et les sites deviennent cinématographiques dès qu'ils sont filmés avec intention : des gens réels, une échelle réelle, une lumière réelle.",
        "Un partenaire intégré vous accompagne de la stratégie de message jusqu'à la livraison multiversion et à la localisation — une seule équipe, un seul standard, un seul interlocuteur responsable.",
      ],
    },
    de: {
      title: "Corporate-Video-Produktion in Kairo: was jede Marke wissen sollte",
      excerpt:
        "Warum Corporate Video zählt und wie eine durchgängige Produktion aus der Media Production City die Rechnung verändert.",
      body: [
        "Corporate Video ist längst kein Extra mehr. Führungskommunikation, Employer Branding, Sicherheitsunterweisung, Investor Relations und Vertriebsunterstützung kommen im Film schneller voran.",
        "Kairo bietet einen besonderen Vorteil: Die Egyptian Media Production City bündelt Studios, Crews, Technik und Postproduktion in einem Ökosystem — und dort sitzen wir.",
        "Was einen vergessenen von einem starken Unternehmensfilm trennt, ist die Erzählung. Betriebe, Werke und Anlagen werden filmisch, sobald sie mit Absicht gedreht werden: echte Menschen, echter Maßstab, echtes Licht.",
        "Ein durchgängiger Partner begleitet Sie von der Botschaftsstrategie über die Produktion bis zur Auslieferung in mehreren Fassungen und deren Lokalisierung — ein Team, ein Standard, ein Ansprechpartner in der Verantwortung.",
      ],
    },
    es: {
      title: "Producción de vídeo corporativo en El Cairo: lo que toda marca debe saber",
      excerpt:
        "Por qué importa el vídeo corporativo y cómo una producción integral desde la Media Production City cambia la ecuación.",
      body: [
        "El vídeo corporativo ha dejado de ser un extra. La comunicación directiva, la marca empleadora, la formación en seguridad, las relaciones con inversores y el apoyo a ventas avanzan más rápido en imagen.",
        "El Cairo ofrece una ventaja única: la Egyptian Media Production City concentra estudios, equipos técnicos, material y postproducción en un mismo ecosistema, y ahí es donde estamos.",
        "Lo que separa un vídeo corporativo olvidable de uno poderoso es el relato. Las operaciones, las fábricas y las instalaciones se vuelven cinematográficas cuando se filman con intención: personas reales, escala real, luz real.",
        "Un socio integral te acompaña desde la estrategia de mensaje hasta la entrega en múltiples versiones y su localización: un solo equipo, un solo estándar, un solo responsable.",
      ],
    },
    it: {
      title: "Produzione di video aziendali al Cairo: ciò che ogni marca deve sapere",
      excerpt:
        "Perché il video aziendale conta e come una produzione integrale dalla Media Production City cambia l'equazione.",
      body: [
        "Il video aziendale non è più un accessorio. Comunicazione della leadership, employer branding, formazione sulla sicurezza, relazioni con gli investitori e supporto alle vendite avanzano tutti più rapidamente per immagini.",
        "Il Cairo offre un vantaggio unico: l'Egyptian Media Production City concentra studi, troupe, attrezzature e postproduzione in un solo ecosistema — ed è lì che abbiamo sede.",
        "Ciò che separa un video aziendale dimenticabile da uno potente è il racconto. Operazioni, stabilimenti e impianti diventano cinematografici quando vengono filmati con intenzione: persone vere, scala vera, luce vera.",
        "Un partner integrale vi accompagna dalla strategia del messaggio fino alla consegna in più versioni e alla loro localizzazione — una sola squadra, un solo standard, un solo responsabile.",
      ],
    },
    pt: {
      title: "Produção de vídeo corporativo no Cairo: o que toda a marca precisa de saber",
      excerpt:
        "Por que o vídeo corporativo importa e como uma produção integral a partir da Media Production City muda a equação.",
      body: [
        "O vídeo corporativo deixou de ser um extra. Comunicação de liderança, marca empregadora, formação em segurança, relações com investidores e apoio às vendas avançam todos mais depressa em imagem.",
        "O Cairo oferece uma vantagem única: a Egyptian Media Production City concentra estúdios, equipas, equipamento e pós-produção num só ecossistema — e é aí que estamos.",
        "O que separa um vídeo corporativo esquecível de um poderoso é a narrativa. Operações, fábricas e instalações tornam-se cinematográficas quando são filmadas com intenção: pessoas reais, escala real, luz real.",
        "Um parceiro integral acompanha-o desde a estratégia da mensagem até à entrega em várias versões e à sua localização — uma equipa, um padrão, um único responsável.",
      ],
    },
    ru: {
      title: "Производство корпоративного видео в Каире: что нужно знать каждому бренду",
      excerpt:
        "Почему корпоративное видео важно и как производство полного цикла из Media Production City меняет расклад.",
      body: [
        "Корпоративное видео перестало быть необязательным. Обращения руководства, бренд работодателя, обучение технике безопасности, отношения с инвесторами и поддержка продаж — всё это движется быстрее в кадре.",
        "Каир даёт особое преимущество: Egyptian Media Production City собирает студии, съёмочные группы, технику и постпродакшн в одной экосистеме — и мы находимся именно там.",
        "Разницу между забываемым и сильным корпоративным фильмом делает история. Производства, заводы и объекты становятся кинематографичными, когда их снимают осмысленно: настоящие люди, настоящий масштаб, настоящий свет.",
        "Партнёр полного цикла ведёт вас от стратегии сообщения через производство к сдаче в нескольких версиях и их локализации — одна команда, один стандарт, одна точка ответственности.",
      ],
    },
    tr: {
      title: "Kahire'de kurumsal video prodüksiyonu: her markanın bilmesi gerekenler",
      excerpt:
        "Kurumsal video neden önemli ve Media Production City'den yürütülen uçtan uca prodüksiyon dengeyi nasıl değiştirir.",
      body: [
        "Kurumsal video artık lüks değil. Yönetim iletişimi, işveren markası, iş güvenliği eğitimi, yatırımcı ilişkileri ve satış desteği — hepsi görüntüyle daha hızlı ilerliyor.",
        "Kahire eşsiz bir avantaj sunuyor: Egyptian Media Production City stüdyoları, ekipleri, ekipmanı ve post prodüksiyonu tek bir ekosistemde topluyor — ve biz oradayız.",
        "Unutulan bir kurumsal filmi güçlü olandan ayıran şey anlatıdır. Operasyonlar, fabrikalar ve tesisler niyetle çekildiklerinde sinematik hâle gelir: gerçek insanlar, gerçek ölçek, gerçek ışık.",
        "Uçtan uca bir iş ortağı sizi mesaj stratejisinden prodüksiyona, oradan çok sürümlü teslimata ve yerelleştirmeye taşır — tek ekip, tek standart, tek sorumluluk noktası.",
      ],
    },
  },
  "how-to-choose-a-media-production-agency-in-egypt": {
    ar: {
      title: "كيف تختار شركة إنتاج إعلامي في مصر؟",
      excerpt: "دليل عملي لاختيار شريك إنتاج يفهم أهداف العلامة التجارية ويحوّلها إلى محتوى مؤثر، من الفكرة الأولى حتى النسخة النهائية.",
      body: [
        "تُعد مصر من أكثر أسواق الإنتاج حيوية وتنافسية في المنطقة؛ فهي تجمع طواقم خبيرة، وتنوّعاً واسعاً في المواقع، ومواهب إبداعية قادرة على تنفيذ أعمال بمستوى عالٍ. لكن كثرة الخيارات تجعل اختيار شركة الإنتاج الإعلامي قراراً تجارياً واستراتيجياً، لا مجرد قرار متعلق بالتصوير.",
        "قد تبدو جودة الكاميرا أو الإضاءة أو حجم الإنتاج مؤشرات مهمة، لكنها لا تكفي وحدها. الشريك المناسب يفهم أن الإنتاج ليس صناعة صور جميلة فحسب، بل صياغة رسالة واضحة وملائمة لجمهورها وقابلة لتحقيق هدفها.",
        "اختيار الشريك الخطأ قد يفضي إلى فيلم جذاب بلا اتجاه واضح للعلامة، أو محتوى يحصد المشاهدة ولا يخلق تفاعلاً أو تحويلاً، أو ميزانيات تُنفق على مواد لا تخدم نمواً طويل الأمد.",
        "أما الشريك المناسب فيبدأ كل مشروع بالنية: يربط المعالجة البصرية بأهداف العمل، وفهم الجمهور، ومتطلبات المنصة؛ سواء كان المطلوب فيلماً للعلامة أو إعلاناً أو محتوى رقمياً مصمماً للمنصات أولاً.",
        "<h2>ابدأ بالهدف، لا بصيغة الفيديو</h2>",
        "قبل مراجعة الأعمال السابقة أو طلب العروض، حدّد ما الذي يجب أن يحققه الفيديو: رفع الوعي، إطلاق منتج أو خدمة، تثبيت موقع العلامة، زيادة التفاعل والتحويل، أو بناء أصول محتوى طويلة الأجل. لكل هدف لغة إبداعية مختلفة، ولا يصلح ما ينجح في فيلم العلامة بالضرورة لحملة أداء رقمية.",
        "عندما لا يكون الهدف واضحاً، تصبح النصوص عامة، وتفقد الرسالة تركيزها، ويصعب تحديد معيار للنجاح. لذلك تبدأ شركة الإنتاج المحترفة بأسئلة عن العمل والجمهور قبل الحديث عن الكاميرات أو المواقع أو شكل اللقطة.",
        "<h2>الاستراتيجية أم التنفيذ فقط؟</h2>",
        "شركة التنفيذ فقط تركز غالباً على التصوير والمونتاج والموعد النهائي. قد تنجز عملاً جيد الشكل، لكنها لا تتحدى الفكرة ولا تسأل عن الهدف أو الجمهور. أما الشركة التي تقودها الاستراتيجية فتسأل: ماذا ينبغي أن يحقق هذا المحتوى؟ ثم تترجم الإجابة إلى قصة واتجاه بصري وخطة إنتاج.",
        "ابحث عن فريق يشارك في تطوير الفكرة، ويهتم بأهداف العلامة وجمهورها، ولا يجعل الحديث عن المعدات بديلاً عن الحديث عن الرسالة. المحتوى الناجح يخدم الغرض بعد يوم الإطلاق، لا يكتفي بتسليم ملف جميل.",
        "<h2>القصة هي ما يمنح الصورة معناها</h2>",
        "الجمهور لا يرتبط بالكاميرا أو المؤثرات بقدر ارتباطه بالمعنى. القصة القوية توضّح رسالة العلامة، وتخلق صلة عاطفية، وتجعل المحتوى قابلاً للتذكّر والمشاركة. لذلك تُبنى أفضل الأعمال حول فكرة مركزية توجه القرارات من التطوير حتى التسليم.",
        "لا تعني الحكاية مجرد تعليق صوتي أو نص؛ بل تعني بنية واضحة، وإيقاعاً مناسباً، وسبباً يدعو الجمهور إلى الاهتمام. عندما تخدم كل لقطة هذا الهدف، يتحول الفيلم من مادة بصرية إلى أصل حقيقي للعلامة.",
        "<h2>قيّم طريقة العمل لا معرض الأعمال فقط</h2>",
        "يعرض البورتفوليو ما تستطيع الشركة صنعه، بينما تكشف طريقة العمل كيف ولماذا تصل إلى تلك النتيجة. اطلب مساراً واضحاً يشمل فهم الموجز، وتحديد الرسالة، وتطوير الفكرة والسيناريو، والتصوّر المسبق، والتخطيط، والإنتاج، وما بعد الإنتاج، ثم إعداد النسخ والتوزيع.",
        "العملية الواضحة تقلل المخاطر، وتحمي الميزانية، وتمنع تعديلات غير ضرورية، وتبقي التوقعات واقعية. الإبداع مسألة ذوق، لكن المنهج هو ما يجعل الجودة قابلة للتكرار والتوسع.",
        "<h2>فريق متكامل ومسؤولية واحدة</h2>",
        "قد يبدو توزيع الكتابة والتصوير وما بعد الإنتاج بين عدة موردين مرناً أو أقل تكلفة في البداية، لكنه كثيراً ما يسبب اختلافاً في الرؤية، وتأخيرات في التسليم، وضعفاً في مسؤولية القرار. الشريك المتكامل يحافظ على الفكرة من أول جلسة حتى آخر نسخة، ويمنحك جهة اتصال ومسؤولية واضحتين.",
        "العلامات نادراً ما تحتاج إلى فيديو واحد فقط. هي تحتاج إلى نسخ للمنصات والحملات والأسواق المختلفة. وجود فريق واحد يضمن اتساق القصة والهوية البصرية عبر جميع هذه المخرجات.",
        "<h2>الخبرة المحلية مع منظور إقليمي</h2>",
        "المعرفة المحلية تؤثر في كل شيء: الوصول إلى المواقع والتصاريح، فهم السياق الثقافي، إدارة الطواقم، واختيار التفاصيل التي تجعل القصة صادقة. وفي الوقت نفسه، تحتاج كثير من العلامات إلى محتوى يعبر حدود مصر ويعمل في أسواق الشرق الأوسط وشمال أفريقيا. ابحث عن شريك يجمع بين الحس المحلي ومعايير التنفيذ الإقليمية والدولية.",
        "<h2>الشفافية هي جزء من جودة الإنتاج</h2>",
        "منذ البداية ينبغي أن يكون نطاق العمل، والمخرجات، والجدول الزمني، وجولات التعديل، وطريقة الاعتماد، وبنية الميزانية واضحة. التواصل المنتظم لا يقل أهمية عن الإبداع؛ فهو الذي يحمي المشروع عند تغيّر الظروف ويحول دون المفاجآت المكلفة.",
        "عند مقارنة الشركات، لا تكتفِ بالسؤال عن أعمال مشابهة. اسأل كيف عالجت المشكلة، ولماذا اتخذت قرارات محددة، وكيف قاست نجاح النتيجة. العلامة التي تبحث عن شريك طويل الأجل تحتاج إلى فريق يفكر كصاحب مصلحة: يحمي الهوية، ويتحدى الأفكار الضعيفة، ويبني محتوى قابلاً للاستمرار.",
        "في النهاية، أفضل شركة إنتاج إعلامي في مصر هي التي تمنحك وضوحاً قبل التصوير، وانسجاماً أثناء التنفيذ، وقيمة بعد التسليم. اختر شريكاً يجمع القصة والاستراتيجية والإدارة الدقيقة في رؤية واحدة تخدم أهداف علامتك.",
      ],
    },
  },
  "the-video-production-journey-from-idea-to-impact": {
    ar: {
      title: "من الفكرة إلى الأثر: لماذا تهم رحلة إنتاج الفيديو؟",
      excerpt: "الفيديو المؤثر لا يبدأ عند التصوير؛ بل يبدأ بفهم الهدف والجمهور، ثم يمر بمراحل إنتاج متكاملة تجعل القصة أقوى على الشاشة.",
      body: [
        "<h2>ما قبل الإنتاج: حيث تبدأ القصة</h2>",
        "مرحلة ما قبل الإنتاج هي الأساس. فيها نستكشف أهداف العلامة، ونفهم الجمهور، ونحدد الرسائل الرئيسية، ونضع المخطط السردي الذي يقود كل قرار لاحق.",
        "ليست هذه المرحلة مجرد ترتيب للمواعيد والموارد؛ إنها الاستراتيجية وهي تتحول إلى خطة عمل. عندما تكون القصة قوية على الورق، تكون فرصتها أكبر في أن تؤثر على الشاشة.",
        "<h2>الإنتاج: تحويل الفكرة إلى صورة</h2>",
        "في موقع التصوير نمنح النص حياة عبر تصوير سينمائي احترافي، وإضاءة مقصودة، وأداء صادق، وإخراج بصري يخدم المعنى. هنا تتحول الفكرة إلى مشاهد تمنح الجمهور سبباً للمشاهدة والاستمرار.",
        "كل عنصر، من اختيار العدسة إلى حركة الكاميرا، يجب أن يخدم روح الحكاية لا أن يكون زينة منفصلة عنها.",
        "<h2>ما بعد الإنتاج: بناء الإيقاع والمعنى</h2>",
        "في غرف المونتاج واستوديوهات الصوت تتحول المادة الخام إلى قصة مكتملة. يشمل ذلك المونتاج، والتصحيح اللوني، وتصميم الصوت، والرسوم المتحركة، وإعداد النسخ المناسبة لكل استخدام.",
        "في هذه المرحلة يتشكل الإيقاع العاطفي وتتضح الرسالة. ليست المهمة جمع اللقطات، بل اختيار اللحظة المناسبة والصوت المناسب والإيقاع الذي يجعل القصة مفهومة ومؤثرة.",
        "<h2>التوزيع: وضع القصة في مكانها الصحيح</h2>",
        "بعد الانتهاء من الفيلم، نحدد أين وكيف يمكن أن يحقق أكبر أثر: على منصات التواصل، أو الموقع الإلكتروني، أو عروض العلامة، أو القنوات التلفزيونية. توزيع المحتوى بوعي يضمن أن تصل الرسالة إلى جمهورها في السياق المناسب.",
        "<h2>لماذا تهم هذه الرحلة؟</h2>",
        "عندما تتكامل الحكاية مع الاستراتيجية والتنفيذ الاحترافي، يصبح الفيديو أكثر من مادة إعلامية. يتحول إلى محرك للتفاعل، وركيزة لهوية العلامة، وأداة تساعد على تحقيق نتائج ملموسة.",
        "صناعة الفيديو ليست مجرد تشغيل كاميرا؛ إنها تصميم تجربة تلامس الناس وتلهمهم وتدفعهم إلى التحرك. فريق Global Untold Story يرافق العلامات من بداية الفكرة إلى الأثر الذي تتركه، قصة بعد قصة.",
      ],
    },
  },
  "why-every-brand-needs-a-story-that-moves-people": {
    ar: {
      title: "لماذا تحتاج كل علامة تجارية إلى قصة تحرّك الناس؟",
      excerpt: "المحتوى وحده قد يمرّ سريعاً، أما القصة الواضحة فتمنح العلامة معنىً يلامس الجمهور ويظل في الذاكرة.",
      body: [
        "<h2>الفرق بين المحتوى والقصة</h2>",
        "ينتج معظم الناس اليوم محتوى باستمرار: فيديوهات ومنشورات ومقاطع قصيرة. لكن المحتوى وحده يُنسى بسهولة عندما لا يحمل فكرة أو شعوراً أو سبباً يدعو الناس إلى الاهتمام.",
        "القصة تفعل أكثر من عرض المعلومة؛ فهي تلمس المشاعر، وتكشف غاية العلامة، وتدعو الجمهور إلى المشاركة. لهذا يتذكر الناس ما شعروا به أكثر مما يتذكرون الحقائق المجردة.",
        "<h2>السرد كاستراتيجية للعلامة</h2>",
        "في Global Untold Story لا تبدأ المشاريع بالكاميرات، بل بالأسئلة: ما الذي نريد أن يفهمه الناس؟ لماذا يهمهم ذلك الآن؟ وما الإحساس الذي يجب أن يبقى معهم بعد انتهاء الفيلم؟",
        "الإجابات لا تنتج نصاً فحسب؛ بل تصنع اتجاهاً كاملاً للرسالة والصورة والإيقاع. وعندما تتفق هذه العناصر، يصبح المحتوى جزءاً من هوية العلامة بدلاً من أن يكون منشوراً عابراً.",
        "<h2>القصة تمنح العلامة وجهاً إنسانياً</h2>",
        "الناس لا يبنون علاقة مع الشعارات أو المواصفات وحدها؛ بل مع القيم والمواقف والأشخاص واللحظات التي تعكس ما تؤمن به العلامة. القصة الجيدة تجعل الرسالة مفهومة من دون أن تبدو كإعلان مباشر.",
        "وهذا لا يعني اختراع دراما من أجل الدراما. بل يعني العثور على الحقيقة الإنسانية داخل المنتج أو الخدمة أو المكان أو الأشخاص الذين يقفون وراءها، ثم تقديمها بصدق ودقة.",
        "<h2>من الانتباه إلى الأثر</h2>",
        "قد تجذب الصورة الجميلة الانتباه للحظة، لكن القصة هي التي تمنحها عمراً أطول. القصة الواضحة تساعد الجمهور على التذكر والمشاركة والثقة، وتمنح الفرق الداخلية أيضاً لغة موحدة للتواصل عن العلامة.",
        "عندما تصبح القصة جزءاً من الاستراتيجية، يمكن أن تمتد عبر فيلم العلامة والإعلان والمحتوى الرقمي وتجارب الفعاليات، مع الحفاظ على صوت واحد ومعنى واحد.",
        "كل علامة لديها قصة تستحق أن تُروى. والفرق الحقيقي هو اختيار الفكرة المناسبة وصياغتها بعناية وتنفيذها بطريقة تجعل الناس يشعرون بها، لا يكتفون بمشاهدتها.",
      ],
    },
  },
};

/** The translated fields for a post, or undefined when it has none. */
export function postTranslation(slug: string, locale: string): PostTranslation | undefined {
  return POST_TRANSLATIONS[slug]?.[locale as TranslatedLocale];
}
