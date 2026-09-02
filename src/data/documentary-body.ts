/**
 * The documentary service page, in the languages the site indexes.
 *
 * The CMS record for `documentary-production-egypt` holds the wrong text in
 * every language except English: someone translated the *commercial* service
 * body into it, so a page about documentary production opened with "Beyond the
 * hero film: campaigns designed for every screen" and went on to describe TV
 * spots and performance assets. English is correct; the error was translated
 * faithfully into eight languages and is now indexable in all of them.
 *
 * This is the English body, translated. It is applied only while the CMS text
 * is still wrong — see `documentaryBodyFor` — so fixing the CMS retires this
 * file on its own rather than being masked by it.
 *
 * The block structure is shared and the translations are text only, in the same
 * order, so a language cannot drift out of shape from the others.
 */

const STRUCTURE = [
  "p", "p", "p",
  "h2", "li", "li", "li", "li", "li", "li", "li", "p",
  "h2", "h3", "p", "h3", "p", "h3", "p", "h3", "p", "h3", "p", "h3", "p",
  "h2", "p", "p", "p",
  "h2", "h3", "p", "h3", "p", "h3", "p",
  "h2", "p", "p", "li", "li", "li", "li", "li", "li", "li", "p",
  "h2", "p", "p",
  "h2", "h3", "p", "h3", "p", "h3", "p", "h3", "p",
  "h2", "p", "li", "li", "li", "li", "li", "li", "li", "li", "li",
  "h2", "h3", "p", "h3", "p", "h3", "p", "h3", "p",
  "h2", "p",
] as const;

/**
 * A word that must appear early in a genuine documentary body. The commercial
 * copy sitting in the CMS opens on campaigns and hero films and reaches none of
 * these in its first paragraphs, which is what makes the check reliable.
 */
const DOCUMENTARY_MARKER: Record<string, RegExp> = {
  ar: /وثائق/,
  fr: /documentaire/i,
  de: /dokumentar/i,
  es: /documental/i,
  it: /documentari/i,
  pt: /document[áa]ri/i,
  ru: /документальн/i,
  tr: /belgesel/i,
};

const AR: readonly string[] = [
  "قصص حقيقية. بحث دقيق. صناعة سينمائية.",
  "الفيلم الوثائقي يبدأ بسؤال، لا بقائمة لقطات. نساعدك في تحديد الزاوية، والبحث في الموضوع، وتقييم إمكانية الوصول، وبناء هيكل إنتاجي قادر على الاستجابة للواقع دون أن يفقد اتجاهه التحريري.",
  "تستطيع Global Untold Story أن تقود إنتاجاً وثائقياً كاملاً أو أن تنضم عند مرحلة بعينها. نطاق عملنا يشمل البحث والتطوير، والمعالجات ومواد العرض، والتحضير، والمقابلات، والإنتاج الميداني، ودمج الأرشيف، والمونتاج، والرسوم، والصوت، والتوطين، والتسليم النهائي.",

  "الصيغ الوثائقية التي نعمل بها",
  "الأفلام الوثائقية الطويلة والقصيرة",
  "المسلسلات الوثائقية والتلفزيون الواقعي",
  "الأفلام القائمة على المقابلات والشهادات",
  "وثائقيات التاريخ والثقافة والتراث والآثار",
  "قصص السفر والوجهات والبيئة والاهتمام الإنساني",
  "الوثائقيات المؤسسية والصناعية",
  "المحتوى الوثائقي المرتبط بعلامة تجارية",
  "الصيغة وطاقم العمل ومسار الإنتاج تُشكَّل حول الموضوع، والجمهور المستهدف، وشروط الوصول، ومتطلبات التوزيع، ومرحلة الإنتاج الحالية.",

  "خدماتنا في الإنتاج الوثائقي",
  "البحث وتطوير القصة",
  "نحدد السؤال المحوري، ونضبط الزاوية التحريرية، ونرسم خريطة الأشخاص والأماكن والأدلة اللازمة لرواية القصة. يشمل الدعم البحث الخلفي، وتنظيم المصادر، وحصر المشاركين، والمقابلات التمهيدية، وأقواس السرد، وبنية الحلقات، ودراسة جدوى الإنتاج.",
  "المعالجات وملفات العرض والتخطيط الإنتاجي",
  "نجهّز المواد اللازمة لتوحيد رؤية أصحاب المصلحة ودفع المشروع نحو الموافقة أو التكليف أو الإنتاج. يشمل ذلك الملخصات القصيرة، والملخصات السردية، والمعالجات، وملفات العرض، ومخططات الحلقات، والمراجع البصرية، وتخطيط النموذج الأولي، والجداول الزمنية، وأطر الميزانية.",
  "المقابلات والسرد عبر المشاركين",
  "يُخطَّط البحث عن المشاركين وتصميم المقابلات حول الدور الذي يؤديه كل صوت داخل السرد الأوسع. ندعم التواصل معهم، والمقابلات التمهيدية، وصياغة الأسئلة، وتهيئة المشاركين، والمقابلات متعددة اللغات، والترجمة الفورية، والإخراج أمام الكاميرا.",
  "الإنتاج الميداني في مصر",
  "تعمل فرق الإنتاج الميداني لدينا على المقابلات، والتصوير الرصدي، والمشاهد التي يقودها مقدم، والإعدادات البصرية المضبوطة، والتصوير في مواقع متعددة. ننسّق طاقم العمل والكاميرا والصوت والمواقع والوصول والتصاريح والنقل ومسار العمل اليومي الذي يتطلبه الموجز.",
  "الأرشيف والرسوم والشرح البصري",
  "الأرشيف والخرائط والخطوط الزمنية والشرح البصري تضيف سياقاً لا توفره اللقطات الجديدة وحدها. ندعم البحث الأرشيفي وتنظيمه، والتنسيق المبدئي للحقوق، والدمج التحريري، والرسوم المتحركة الوثائقية، والخرائط المتحركة، والإنفوجرافيك، والتصور ثنائي أو ثلاثي الأبعاد حين يتطلب الموضوع ذلك.",
  "مونتاج الأفلام الوثائقية والصوت والتوطين",
  "ما بعد الإنتاج يجمع المقابلات والرصد والأرشيف والتعليق والرسوم والصوت في قصة واحدة متماسكة. تشمل خدماتنا المونتاج السردي، والمونتاج الأولي والنهائي، والتصحيح اللوني، وتصميم الصوت ومزجه، والعناوين، والمسترنغ، والترجمات، والتعليق الصوتي، والدبلجة، وحزم التسليم متعددة اللغات.",

  "وثائقيات علم المصريات والآثار والتراث",
  "التراث الأثري والثقافي في مصر يتطلب تخطيطاً متخصصاً، وحساسية تاريخية، وتنسيقاً دقيقاً لإمكانية الوصول.",
  "ندعم الإنتاجات الوثائقية التي تتناول علم المصريات، والآثار، والمتاحف، والمعالم، وتاريخ التنقيب، والتراث الثقافي.",
  "بحسب المشروع، قد يشمل الدعم تنسيق الخبراء والمشاركين، وتخطيط الوصول إلى المواقع التراثية، والتصاريح، وطواقم الإنتاج المحلية، والبحث الأرشيفي، والمقابلات، والخرائط، والرسوم، وإعادة البناء البصري، والتوطين.",

  "أعمال وثائقية مختارة",
  "فيلم عمليات أباتشي مصر الوثائقي",
  "إنتاج وثائقي على مدى أيام يغطي التجهيز الميداني للحفر الاستكشافي، وإجراءات الصحة والسلامة، ومقابلات القيادة في القاهرة، والتصوير الجوي، والتصوير المتسارع.",
  "إنتاج فيلم وثائقي لمنظمة العمل الدولية في صعيد مصر",
  "إنتاج وثائقي يركز على البيئات الزراعية والمجتمعات في صعيد مصر.",
  "وثائقي إنجازات الداخلة للزراعة الذكية",
  "فيلم وثائقي يتابع تقنيات المياه الذكية، والمعرفة الزراعية، والشراكات المحلية في واحة الداخلة، جامعاً بين النشاط الميداني والبنية التحتية والمقابلات والمشهد الصحراوي الأوسع.",

  "التصوير الوثائقي في مصر للفرق الدولية",
  "الإنتاجات الدولية تحتاج شريكاً محلياً يفهم الموجز التحريري والواقع العملي للتصوير في مصر معاً.",
  "يمكننا تقديم خدمات وثائقية منفردة، أو تعزيز فريق إنتاج زائر، أو تنسيق الهيكل الإنتاجي المحلي بالكامل.",
  "منتجون ومنسقون وباحثون محليون",
  "تنسيق المشاركين والخبراء والمترجمين",
  "البحث عن المواقع وتخطيط الوصول وتنسيق التصاريح",
  "أطقم الكاميرا والإضاءة والصوت الوثائقية",
  "المعدات والنقل والإقامة واللوجستيات الميدانية",
  "التوثيق والتواصل الإنتاجي باللغة العربية",
  "دعم ما بعد الإنتاج والتوطين",
  "الوصول النهائي والتصاريح تظل خاضعة للجهات المختصة والمؤسسات وأصحاب الملكية ومتطلبات المواقع. التخطيط المبكر يمنح وقتاً أطول لتقييم الجدوى والقيود والبدائل العملية.",

  "النزاهة التحريرية ورعاية المشاركين",
  "قد يتضمن الإنتاج الوثائقي شهادات شخصية، واختلافاً تاريخياً، ومشاركين في أوضاع هشة، وموضوعات حساسة ثقافياً.",
  "نتعامل بعناية مع التواصل مع المشاركين، والموافقة المستنيرة، والترجمة، واستخدام الأرشيف، وإعادة البناء البصري، ونعمل مع فرق التحرير والشؤون القانونية والامتثال لدى العميل كلما تطلب الأمر مراجعة متخصصة.",

  "كيف نبني المشروع الوثائقي",
  "01 — الاستكشاف",
  "توضيح الموضوع، والجمهور المستهدف، والسؤال التحريري، ومتطلبات الوصول، ومرحلة الإنتاج الحالية.",
  "02 — التطوير",
  "البحث في القصة، وحصر المشاركين، وتقييم الجدوى، وتحديد المعالجة أو المقاربة الإنتاجية.",
  "03 — الإنتاج",
  "إعداد الجدول الزمني وطاقم العمل والمواقع والأذونات ومسار العمل الميداني، ثم تصوير المقابلات والمواد الرصدية والتغطية البصرية المطلوبة.",
  "04 — الإنهاء والتسليم",
  "تشكيل القصة في المونتاج، وإتمام الصورة والصوت، وتوطين النسخ المطلوبة، وتجهيز النسخ الرئيسية النهائية للتسليم.",

  "ما الذي يجب أن يتضمنه موجز مشروعك الوثائقي",
  "وجود معالجة مكتملة مفيد لكنه ليس ضرورياً. لكي نفهم المشروع ونجهّز المقاربة الإنتاجية المناسبة، شاركنا ما هو متاح لديك حالياً:",
  "الملخص أو المعالجة أو الموجز الإنتاجي",
  "الصيغة والمدة المستهدفة والجمهور",
  "المرحلة الحالية: بحث، أو تطوير، أو مكلَّف، أو قيد الإنتاج",
  "تواريخ التصوير المقترحة والمواقع",
  "الطاقم المسافر والمناصب المحلية المطلوبة",
  "متطلبات المشاركين والخبراء والوصول والتصاريح",
  "نطاق الأرشيف وما بعد الإنتاج والتوطين",
  "متطلبات التسليم",
  "المؤشرات المتاحة عن الميزانية",

  "الأسئلة الشائعة",
  "هل يمكنكم إدارة إنتاج وثائقي كامل في مصر؟",
  "نعم. تستطيع Global Untold Story دعم العملية من التطوير والبحث حتى الإنتاج الميداني وما بعد الإنتاج والتوطين والتسليم النهائي. ويمكن كذلك التعاقد على خدمات منفردة.",
  "هل يمكنكم دعم طاقم وثائقي دولي؟",
  "نعم. يمكننا بناء دعم محلي حول إنتاج زائر، يشمل البحث والمنسقين والمشاركين والتصاريح والأطقم والمعدات والمواقع والترجمة واللوجستيات الميدانية.",
  "هل يمكنكم تنسيق تصاريح التصوير والمواقع الحساسة؟",
  "يمكننا تنسيق الطلبات والمستندات الداعمة والتواصل بشأن المواقع المعنية. تظل الموافقة النهائية وإمكانية الوصول خاضعة للجهات المسؤولة والمؤسسات وأصحاب الملكية ومتطلبات إدارة الموقع.",
  "هل يمكنكم الانضمام أثناء مرحلة البحث أو ما بعد الإنتاج؟",
  "نعم. يمكننا الانضمام عند مرحلة بعينها، تشمل البحث ودراسة الجدوى، وتطوير المعالجة، والإنتاج الميداني المحلي، وتنسيق الأرشيف، والمونتاج، والرسوم، والصوت، أو التوطين.",

  "لنتحدث عن مشروعك الوثائقي",
  "شاركنا الموضوع، والصيغة المستهدفة، ومرحلة الإنتاج، والمواقع المقترحة، والنطاق المطلوب. سنراجع الموجز ونحدد الخطوات العملية التالية للتطوير أو الإنتاج في مصر.",
];

const FR: readonly string[] = [
  "Des histoires vraies. Documentées avec rigueur. Réalisées avec un regard de cinéma.",
  "Un documentaire commence par une question, pas par une liste de plans. Nous aidons à définir l'angle, à documenter le sujet, à évaluer les accès et à bâtir une structure de production capable de répondre au réel sans perdre sa direction éditoriale.",
  "Global Untold Story peut mener une production documentaire complète ou intervenir à une étape précise. Notre périmètre couvre la recherche et le développement, les notes d'intention et supports de présentation, la préparation, les entretiens, le tournage de terrain, l'intégration d'archives, le montage, les graphismes, le son, la localisation et la livraison finale.",

  "Les formats documentaires que nous produisons",
  "Longs et courts métrages documentaires",
  "Séries documentaires et télévision factuelle",
  "Films portés par des entretiens et des témoignages",
  "Documentaires d'histoire, de culture, de patrimoine et d'archéologie",
  "Récits de voyage, de destination, d'environnement et d'intérêt humain",
  "Documentaires d'entreprise, industriels et institutionnels",
  "Contenus documentaires de marque",
  "Le format, l'équipe et le déroulé sont construits autour du sujet, du public visé, des conditions d'accès, des exigences de diffusion et de l'étape de production en cours.",

  "Nos services de production documentaire",
  "Recherche et développement du récit",
  "Nous identifions la question centrale, définissons l'angle éditorial et cartographions les personnes, les lieux et les éléments nécessaires au récit. L'accompagnement peut inclure la recherche documentaire, l'organisation des sources, l'identification des intervenants, les pré-entretiens, les arcs narratifs, la structure des épisodes et l'étude de faisabilité.",
  "Notes d'intention, présentations et planification",
  "Nous préparons les documents nécessaires pour aligner les parties prenantes et faire avancer le projet vers la validation, la commande ou la production : accroches, synopsis, notes d'intention, dossiers de présentation, séquenciers, références visuelles, planification d'une preuve de concept, calendriers et cadres budgétaires.",
  "Entretiens et récits portés par les intervenants",
  "La recherche d'intervenants et la conception des entretiens se pensent à partir du rôle que chaque voix joue dans le récit d'ensemble. Nous accompagnons la prise de contact, les pré-entretiens, l'élaboration des questions, la préparation des intervenants, les entretiens multilingues, l'interprétation et la direction face caméra.",
  "Tournage de terrain en Égypte",
  "Nos équipes de terrain couvrent les entretiens, le tournage d'observation, les séquences présentées, les dispositifs visuels maîtrisés et les tournages multi-sites. Nous coordonnons l'équipe, l'image, le son, les décors, les accès, les autorisations, les transports et le déroulé quotidien qu'exige le brief.",
  "Archives, graphismes et explication visuelle",
  "Archives, cartes, chronologies et explication visuelle apportent un contexte que les images tournées ne peuvent donner seules. Nous prenons en charge la recherche et l'organisation d'archives, la coordination préliminaire des droits, l'intégration au montage, le motion design documentaire, les cartes animées, les infographies et la visualisation 2D ou 3D lorsque le sujet l'exige.",
  "Montage documentaire, son et localisation",
  "La postproduction réunit entretiens, observation, archives, narration, graphismes et son en un récit cohérent. Nos prestations comprennent le montage narratif, le montage offline et online, l'étalonnage, le design sonore et le mixage, les titrages, le mastering, le sous-titrage, la voix off, le doublage et les packages de livraison multilingues.",

  "Documentaires d'égyptologie, d'archéologie et de patrimoine",
  "Le patrimoine archéologique et culturel égyptien exige une préparation spécialisée, une sensibilité historique et des accès soigneusement coordonnés.",
  "Nous accompagnons les productions documentaires consacrées à l'égyptologie, à l'archéologie, aux musées, aux monuments, à l'histoire des fouilles et au patrimoine culturel.",
  "Selon le projet, l'accompagnement peut comprendre la coordination d'experts et d'intervenants, la planification des accès aux sites patrimoniaux, les autorisations, les équipes locales, la recherche d'archives, les entretiens, les cartes, les graphismes, les reconstitutions visuelles et la localisation.",

  "Travaux documentaires sélectionnés",
  "Documentaire sur les opérations d'Apache Egypt",
  "Une production documentaire de plusieurs jours couvrant la préparation du terrain pour un forage d'exploration, les procédures de santé et de sécurité, des entretiens avec la direction au Caire, des prises de vue aériennes et du time-lapse.",
  "Film documentaire OIT et Haute-Égypte",
  "Une production documentaire consacrée aux milieux agricoles et aux communautés de Haute-Égypte.",
  "Documentaire engazaat sur l'agriculture intelligente à Dakhla",
  "Un documentaire qui suit les technologies intelligentes de l'eau, le savoir agricole et les partenariats locaux dans l'oasis de Dakhla, entre activité de terrain, infrastructures, entretiens et grand paysage désertique.",

  "Tourner un documentaire en Égypte avec une équipe internationale",
  "Les productions internationales ont besoin d'un partenaire local qui comprenne à la fois le brief éditorial et les réalités pratiques du tournage en Égypte.",
  "Nous pouvons fournir des prestations documentaires ponctuelles, renforcer une équipe de production en déplacement ou coordonner l'ensemble de la structure de production locale.",
  "Producteurs, fixeurs et documentalistes locaux",
  "Coordination des intervenants, des experts et des interprètes",
  "Repérages, planification des accès et coordination des autorisations",
  "Équipes image, lumière et son spécialisées documentaire",
  "Matériel, transport, hébergement et logistique de terrain",
  "Documentation et communication de production en arabe",
  "Accompagnement en postproduction et en localisation",
  "Les accès et autorisations définitifs restent soumis aux autorités compétentes, aux institutions, aux propriétaires et aux exigences propres à chaque lieu. Anticiper laisse plus de temps pour évaluer la faisabilité, les restrictions et les solutions de repli.",

  "Intégrité éditoriale et respect des intervenants",
  "Une production documentaire peut mettre en jeu des témoignages personnels, des désaccords historiques, des intervenants vulnérables et des sujets culturellement sensibles.",
  "Nous abordons avec soin la relation aux intervenants, le consentement, la traduction, l'usage des archives et la reconstitution visuelle, en travaillant avec les équipes éditoriales, juridiques et de conformité du client chaque fois qu'un examen spécialisé s'impose.",

  "Comment nous structurons un projet documentaire",
  "01 — Comprendre",
  "Clarifier le sujet, le public visé, la question éditoriale, les besoins d'accès et l'étape de production en cours.",
  "02 — Développer",
  "Documenter le récit, identifier les intervenants, évaluer la faisabilité et arrêter la note d'intention ou l'approche de production.",
  "03 — Produire",
  "Préparer le calendrier, l'équipe, les décors, les autorisations et le déroulé de terrain, puis tourner les entretiens, la matière d'observation et la couverture visuelle nécessaire.",
  "04 — Finaliser et livrer",
  "Construire le récit au montage, terminer l'image et le son, localiser les versions requises et préparer les masters de livraison.",

  "Ce qu'il faut mettre dans votre brief documentaire",
  "Une note d'intention aboutie est utile mais pas indispensable. Pour comprendre le projet et préparer la bonne approche de production, transmettez-nous ce dont vous disposez aujourd'hui :",
  "Synopsis, note d'intention ou brief de production",
  "Format, durée envisagée et public",
  "Étape actuelle : recherche, développement, commande ou production en cours",
  "Dates de tournage envisagées et lieux",
  "Équipe en déplacement et postes locaux nécessaires",
  "Besoins en intervenants, experts, accès et autorisations",
  "Périmètre archives, postproduction et localisation",
  "Exigences de livraison",
  "Indications budgétaires disponibles",

  "Questions fréquentes",
  "Pouvez-vous gérer une production documentaire complète en Égypte ?",
  "Oui. Global Untold Story peut accompagner le processus du développement et de la recherche jusqu'au tournage de terrain, à la postproduction, à la localisation et à la livraison finale. Chaque prestation peut aussi être commandée séparément.",
  "Pouvez-vous accompagner une équipe documentaire internationale ?",
  "Oui. Nous pouvons construire un dispositif local autour d'une production en déplacement : recherche, fixeurs, intervenants, autorisations, équipes, matériel, décors, traduction et logistique de terrain.",
  "Pouvez-vous coordonner les autorisations de tournage et les lieux sensibles ?",
  "Nous pouvons coordonner les demandes, les pièces justificatives et les échanges pour les lieux concernés. L'accord final et l'accès restent soumis aux autorités responsables, aux institutions, aux propriétaires et aux règles de gestion du site.",
  "Pouvez-vous intervenir pendant la recherche ou la postproduction ?",
  "Oui. Nous pouvons rejoindre le projet à une étape précise : recherche et faisabilité, développement de la note d'intention, tournage local, coordination des archives, montage, graphismes, son ou localisation.",

  "Parlons de votre documentaire",
  "Transmettez-nous le sujet, le format visé, l'étape de production, les lieux envisagés et le périmètre attendu. Nous étudierons le brief et identifierons les prochaines étapes concrètes pour le développement ou la production en Égypte.",
];

const DE: readonly string[] = [
  "Wahre Geschichten. Sorgfältig recherchiert. Filmisch umgesetzt.",
  "Ein Dokumentarfilm beginnt mit einer Frage, nicht mit einer Einstellungsliste. Wir helfen dabei, den Blickwinkel zu bestimmen, das Thema zu recherchieren, Zugänge einzuschätzen und eine Produktionsstruktur aufzubauen, die auf die Wirklichkeit reagieren kann, ohne ihre redaktionelle Richtung zu verlieren.",
  "Global Untold Story kann eine vollständige Dokumentarproduktion führen oder in einer bestimmten Phase einsteigen. Unser Leistungsumfang reicht von Recherche und Entwicklung, Exposés und Pitch-Unterlagen über Vorbereitung, Interviews, Dreh im Feld, Archivintegration, Schnitt, Grafik und Ton bis zu Lokalisierung und finaler Auslieferung.",

  "Dokumentarische Formate, die wir umsetzen",
  "Lange und kurze Dokumentarfilme",
  "Dokumentarserien und Factual TV",
  "Interview- und protagonistengetragene Filme",
  "Dokumentationen zu Geschichte, Kultur, Kulturerbe und Archäologie",
  "Reise-, Destinations-, Umwelt- und Human-Interest-Geschichten",
  "Unternehmens-, Industrie- und institutionelle Dokumentationen",
  "Dokumentarische Markeninhalte",
  "Format, Crew und Ablauf richten sich nach dem Thema, dem angestrebten Publikum, den Zugangsbedingungen, den Auswertungsanforderungen und der aktuellen Produktionsphase.",

  "Unsere Leistungen in der Dokumentarproduktion",
  "Recherche und Stoffentwicklung",
  "Wir bestimmen die zentrale Frage, schärfen den redaktionellen Blickwinkel und erfassen die Menschen, Orte und Belege, die die Geschichte braucht. Dazu können Hintergrundrecherche, Quellenordnung, Protagonistensuche, Vorgespräche, Erzählbögen, Folgenstrukturen und Machbarkeitsprüfung gehören.",
  "Exposés, Pitches und Produktionsplanung",
  "Wir erstellen die Unterlagen, die Beteiligte auf einen Stand bringen und ein Projekt Richtung Freigabe, Beauftragung oder Produktion bewegen: Loglines, Synopsen, Exposés, Pitch-Decks, Folgenübersichten, visuelle Referenzen, Proof-of-Concept-Planung, Zeitpläne und Budgetrahmen.",
  "Interviews und protagonistengetragenes Erzählen",
  "Protagonistenrecherche und Interviewkonzeption folgen der Rolle, die jede Stimme im größeren Erzählbogen spielt. Wir unterstützen Ansprache, Vorgespräche, Fragenentwicklung, Vorbereitung der Beteiligten, mehrsprachige Interviews, Dolmetschen und Regie vor der Kamera.",
  "Dreh im Feld in Ägypten",
  "Unsere Feldteams arbeiten an Interviews, beobachtendem Dreh, moderierten Sequenzen, kontrolliert gestalteten Bildaufbauten und Drehs an mehreren Orten. Wir koordinieren Crew, Kamera, Ton, Motive, Zugänge, Genehmigungen, Transport und den täglichen Ablauf, den das Briefing verlangt.",
  "Archiv, Grafik und visuelle Erklärung",
  "Archiv, Karten, Zeitleisten und visuelle Erklärung liefern Kontext, den neu gedrehtes Material allein nicht hergibt. Wir unterstützen Archivrecherche und -ordnung, die vorbereitende Rechteklärung, die redaktionelle Einbindung, dokumentarisches Motion Design, animierte Karten, Infografiken sowie 2D- oder 3D-Visualisierung, wo das Thema es verlangt.",
  "Dokumentarschnitt, Ton und Lokalisierung",
  "Die Postproduktion führt Interviews, Beobachtung, Archiv, Sprechertext, Grafik und Ton zu einer stimmigen Geschichte zusammen. Unsere Leistungen umfassen Erzählschnitt, Offline- und Online-Schnitt, Farbkorrektur, Sounddesign und Mischung, Titel, Mastering, Untertitel, Voice-over, Synchronisation und mehrsprachige Auslieferungspakete.",

  "Dokumentationen zu Ägyptologie, Archäologie und Kulturerbe",
  "Das archäologische und kulturelle Erbe Ägyptens verlangt fachkundige Planung, historische Sensibilität und sorgfältig abgestimmte Zugänge.",
  "Wir begleiten Dokumentarproduktionen zu Ägyptologie, Archäologie, Museen, Denkmälern, Grabungsgeschichte und Kulturerbe.",
  "Je nach Projekt kann die Unterstützung die Koordination von Fachleuten und Protagonisten, die Zugangsplanung an Kulturerbestätten, Genehmigungen, lokale Produktionsteams, Archivrecherche, Interviews, Karten, Grafik, visuelle Rekonstruktionen und Lokalisierung umfassen.",

  "Ausgewählte dokumentarische Arbeiten",
  "Dokumentation über die Betriebe von Apache Egypt",
  "Eine mehrtägige Dokumentarproduktion über die Feldvorbereitung einer Explorationsbohrung, Arbeits- und Sicherheitsabläufe, Interviews mit der Führungsebene in Kairo, Luftaufnahmen und Zeitraffer.",
  "ILO und Oberägypten: dokumentarische Filmproduktion",
  "Eine Dokumentarproduktion über landwirtschaftliche Räume und Gemeinschaften in Oberägypten.",
  "engazaat Dakhla: Dokumentation über intelligente Landwirtschaft",
  "Ein Dokumentarfilm über intelligente Wassertechnik, landwirtschaftliches Wissen und lokale Partnerschaften in der Oase Dakhla — zwischen Feldarbeit, Infrastruktur, Interviews und weiter Wüstenlandschaft.",

  "Dokumentarisch drehen in Ägypten mit internationalen Teams",
  "Internationale Produktionen brauchen einen Partner vor Ort, der das redaktionelle Briefing ebenso versteht wie die praktischen Bedingungen des Drehs in Ägypten.",
  "Wir können einzelne dokumentarische Leistungen erbringen, ein anreisendes Team verstärken oder die gesamte lokale Produktionsstruktur koordinieren.",
  "Lokale Produzenten, Fixer und Rechercheure",
  "Koordination von Protagonisten, Fachleuten und Dolmetschern",
  "Motivsuche, Zugangsplanung und Genehmigungskoordination",
  "Kamera-, Licht- und Tonteams für dokumentarische Arbeit",
  "Technik, Transport, Unterkunft und Feldlogistik",
  "Dokumentation und Produktionskommunikation auf Arabisch",
  "Unterstützung in Postproduktion und Lokalisierung",
  "Endgültige Zugänge und Genehmigungen bleiben den zuständigen Behörden, Institutionen, Eigentümern und den Anforderungen des jeweiligen Ortes vorbehalten. Frühe Planung schafft mehr Zeit, Machbarkeit, Einschränkungen und gangbare Alternativen zu prüfen.",

  "Redaktionelle Integrität und Umgang mit Protagonisten",
  "Dokumentarische Arbeit kann persönliche Zeugnisse, historischen Streit, schutzbedürftige Protagonisten und kulturell heikle Themen berühren.",
  "Wir gehen mit Ansprache, Einwilligung, Übersetzung, Archivnutzung und visueller Rekonstruktion sorgfältig um und arbeiten mit den Redaktions-, Rechts- und Compliance-Teams des Kunden zusammen, wo immer eine fachliche Prüfung nötig ist.",

  "Wie wir ein Dokumentarprojekt aufbauen",
  "01 — Verstehen",
  "Thema, angestrebtes Publikum, redaktionelle Frage, Zugangsbedarf und aktuelle Produktionsphase klären.",
  "02 — Entwickeln",
  "Die Geschichte recherchieren, Protagonisten erfassen, Machbarkeit prüfen und Exposé oder Produktionsansatz festlegen.",
  "03 — Produzieren",
  "Zeitplan, Crew, Motive, Genehmigungen und Feldablauf vorbereiten, dann Interviews, beobachtendes Material und die nötige Bildabdeckung drehen.",
  "04 — Fertigstellen und ausliefern",
  "Die Geschichte im Schnitt formen, Bild und Ton fertigstellen, die verlangten Fassungen lokalisieren und die finalen Master für die Auslieferung vorbereiten.",

  "Was in Ihr Dokumentar-Briefing gehört",
  "Ein fertiges Exposé ist hilfreich, aber nicht Voraussetzung. Damit wir das Projekt verstehen und den richtigen Produktionsansatz vorbereiten können, senden Sie uns, was gerade vorliegt:",
  "Synopsis, Exposé oder Produktionsbriefing",
  "Format, angestrebte Länge und Publikum",
  "Aktuelle Phase: Recherche, Entwicklung, beauftragt oder in Produktion",
  "Geplante Drehtermine und Drehorte",
  "Anreisende Crew und benötigte lokale Positionen",
  "Bedarf an Protagonisten, Fachleuten, Zugängen und Genehmigungen",
  "Umfang von Archiv, Postproduktion und Lokalisierung",
  "Auslieferungsanforderungen",
  "Vorhandene Budgetangaben",

  "Häufige Fragen",
  "Können Sie eine vollständige Dokumentarproduktion in Ägypten übernehmen?",
  "Ja. Global Untold Story kann den Weg von Entwicklung und Recherche über den Dreh im Feld bis zu Postproduktion, Lokalisierung und finaler Auslieferung begleiten. Einzelne Leistungen sind ebenso beauftragbar.",
  "Können Sie ein internationales Dokumentarteam unterstützen?",
  "Ja. Wir können die lokale Unterstützung um eine anreisende Produktion herum aufbauen — Recherche, Fixer, Protagonisten, Genehmigungen, Crews, Technik, Motive, Übersetzung und Feldlogistik.",
  "Können Sie Drehgenehmigungen und sensible Orte koordinieren?",
  "Wir können Anträge, Nachweise und die Kommunikation für die betreffenden Orte koordinieren. Freigabe und Zugang bleiben den zuständigen Behörden, Institutionen, Eigentümern und dem Standortmanagement vorbehalten.",
  "Können Sie während der Recherche oder Postproduktion einsteigen?",
  "Ja. Wir können in einer bestimmten Phase dazukommen — Recherche und Machbarkeit, Exposéentwicklung, lokaler Dreh, Archivkoordination, Schnitt, Grafik, Ton oder Lokalisierung.",

  "Sprechen wir über Ihren Dokumentarfilm",
  "Schildern Sie Thema, angestrebtes Format, Produktionsphase, geplante Drehorte und den benötigten Umfang. Wir sehen uns das Briefing an und benennen die konkreten nächsten Schritte für Entwicklung oder Produktion in Ägypten.",
];

const ES: readonly string[] = [
  "Historias reales. Investigadas con rigor. Realizadas con mirada de cine.",
  "Un documental empieza con una pregunta, no con una lista de planos. Ayudamos a definir el enfoque, investigar el tema, evaluar los accesos y construir una estructura de producción capaz de responder a la realidad sin perder su dirección editorial.",
  "Global Untold Story puede dirigir una producción documental completa o incorporarse en una etapa concreta. Nuestro alcance abarca investigación y desarrollo, tratamientos y materiales de presentación, preproducción, entrevistas, rodaje de campo, integración de archivo, montaje, gráficos, sonido, localización y entrega final.",

  "Formatos documentales que producimos",
  "Largometrajes y cortometrajes documentales",
  "Series documentales y televisión factual",
  "Películas construidas sobre entrevistas y testimonios",
  "Documentales de historia, cultura, patrimonio y arqueología",
  "Relatos de viaje, destino, medioambiente e interés humano",
  "Documentales corporativos, industriales e institucionales",
  "Contenido documental de marca",
  "El formato, el equipo y el flujo de trabajo se construyen alrededor del tema, el público previsto, las condiciones de acceso, los requisitos de distribución y la etapa de producción en curso.",

  "Nuestros servicios de producción documental",
  "Investigación y desarrollo del relato",
  "Identificamos la pregunta central, definimos el enfoque editorial y trazamos las personas, los lugares y las evidencias que el relato necesita. El acompañamiento puede incluir investigación de contexto, organización de fuentes, mapeo de participantes, preentrevistas, arcos narrativos, estructura de episodios y estudio de viabilidad.",
  "Tratamientos, presentaciones y planificación de producción",
  "Preparamos los materiales necesarios para alinear a las partes implicadas y llevar el proyecto hacia la aprobación, el encargo o la producción: loglines, sinopsis, tratamientos, dosieres de presentación, escaletas de episodios, referencias visuales, planificación de prueba de concepto, calendarios y marcos presupuestarios.",
  "Entrevistas y narración a través de los participantes",
  "La búsqueda de participantes y el diseño de las entrevistas se planifican según el papel que cada voz cumple en el relato general. Damos apoyo en el contacto inicial, las preentrevistas, la elaboración de preguntas, la preparación de los participantes, las entrevistas multilingües, la interpretación y la dirección ante la cámara.",
  "Rodaje de campo en Egipto",
  "Nuestros equipos de campo trabajan en entrevistas, rodaje de observación, secuencias conducidas por un presentador, montajes visuales controlados y rodajes en varias localizaciones. Coordinamos el equipo, la cámara, el sonido, las localizaciones, los accesos, los permisos, el transporte y el flujo diario de producción que exige el brief.",
  "Archivo, gráficos y explicación visual",
  "El archivo, los mapas, las cronologías y la explicación visual aportan un contexto que el material nuevo no puede dar por sí solo. Damos apoyo en la investigación y organización de archivo, la coordinación preliminar de derechos, la integración en el montaje, el motion graphics documental, los mapas animados, las infografías y la visualización 2D o 3D cuando el tema lo requiere.",
  "Montaje documental, sonido y localización",
  "La postproducción reúne entrevistas, observación, archivo, narración, gráficos y sonido en un relato coherente. Nuestros servicios incluyen montaje narrativo, montaje offline y online, etalonaje, diseño y mezcla de sonido, rótulos, masterización, subtitulado, voz en off, doblaje y paquetes de entrega multilingües.",

  "Documentales de egiptología, arqueología y patrimonio",
  "El patrimonio arqueológico y cultural egipcio exige una planificación especializada, sensibilidad histórica y accesos cuidadosamente coordinados.",
  "Acompañamos producciones documentales sobre egiptología, arqueología, museos, monumentos, historia de las excavaciones y patrimonio cultural.",
  "Según el proyecto, el apoyo puede incluir la coordinación de expertos y participantes, la planificación de accesos a yacimientos patrimoniales, los permisos, los equipos de producción locales, la investigación de archivo, las entrevistas, los mapas, los gráficos, las reconstrucciones visuales y la localización.",

  "Trabajos documentales seleccionados",
  "Documental sobre las operaciones de Apache Egypt",
  "Una producción documental de varios días sobre la preparación del terreno para una perforación exploratoria, los procedimientos de seguridad y salud, entrevistas con la dirección en El Cairo, tomas aéreas y time-lapse.",
  "Producción documental de la OIT en el Alto Egipto",
  "Una producción documental centrada en los entornos agrícolas y las comunidades del Alto Egipto.",
  "Documental engazaat sobre agricultura inteligente en Dakhla",
  "Un documental que sigue la tecnología inteligente del agua, el conocimiento agrícola y las alianzas locales en el oasis de Dakhla, combinando actividad de campo, infraestructuras, entrevistas y el paisaje desértico más amplio.",

  "Rodar documental en Egipto con equipos internacionales",
  "Las producciones internacionales necesitan un socio local que entienda tanto el brief editorial como la realidad práctica de rodar en Egipto.",
  "Podemos prestar servicios documentales concretos, reforzar a un equipo de producción desplazado o coordinar toda la estructura de producción local.",
  "Productores, fixers e investigadores locales",
  "Coordinación de participantes, expertos e intérpretes",
  "Localización de escenarios, planificación de accesos y coordinación de permisos",
  "Equipos de cámara, iluminación y sonido para documental",
  "Material, transporte, alojamiento y logística de campo",
  "Documentación y comunicación de producción en árabe",
  "Apoyo en postproducción y localización",
  "Los accesos y permisos definitivos siguen sujetos a las autoridades competentes, las instituciones, los propietarios y los requisitos de cada localización. Planificar con antelación da más margen para evaluar la viabilidad, las restricciones y las alternativas realistas.",

  "Integridad editorial y cuidado de los participantes",
  "La producción documental puede implicar testimonios personales, desacuerdos históricos, participantes vulnerables y temas culturalmente sensibles.",
  "Abordamos con cuidado la comunicación con los participantes, el consentimiento, la traducción, el uso de archivo y la reconstrucción visual, y trabajamos con los equipos editoriales, jurídicos y de cumplimiento del cliente siempre que se requiere una revisión especializada.",

  "Cómo estructuramos un proyecto documental",
  "01 — Descubrir",
  "Clarificar el tema, el público previsto, la pregunta editorial, las necesidades de acceso y la etapa de producción actual.",
  "02 — Desarrollar",
  "Investigar el relato, mapear a los participantes, evaluar la viabilidad y definir el tratamiento o el enfoque de producción.",
  "03 — Producir",
  "Preparar el calendario, el equipo, las localizaciones, los permisos y el flujo de campo, y después rodar las entrevistas, el material de observación y la cobertura visual necesaria.",
  "04 — Terminar y entregar",
  "Dar forma al relato en el montaje, terminar imagen y sonido, localizar las versiones requeridas y preparar los másteres finales para la entrega.",

  "Qué incluir en tu brief documental",
  "Tener un tratamiento acabado ayuda, pero no es imprescindible. Para entender el proyecto y preparar el enfoque de producción adecuado, comparte lo que tengas disponible ahora mismo:",
  "Sinopsis, tratamiento o brief de producción",
  "Formato, duración prevista y público",
  "Etapa actual: investigación, desarrollo, encargado o en producción",
  "Fechas de rodaje previstas y localizaciones",
  "Equipo desplazado y puestos locales necesarios",
  "Necesidades de participantes, expertos, accesos y permisos",
  "Alcance de archivo, postproducción y localización",
  "Requisitos de entrega",
  "Orientación presupuestaria disponible",

  "Preguntas frecuentes",
  "¿Pueden gestionar una producción documental completa en Egipto?",
  "Sí. Global Untold Story puede acompañar el proceso desde el desarrollo y la investigación hasta el rodaje de campo, la postproducción, la localización y la entrega final. También se pueden contratar servicios por separado.",
  "¿Pueden dar apoyo a un equipo documental internacional?",
  "Sí. Podemos montar el apoyo local alrededor de una producción desplazada: investigación, fixers, participantes, permisos, equipos, material, localizaciones, traducción y logística de campo.",
  "¿Pueden coordinar permisos de rodaje y localizaciones sensibles?",
  "Podemos coordinar las solicitudes, la documentación de apoyo y la comunicación con las localizaciones implicadas. La aprobación final y el acceso siguen sujetos a las autoridades responsables, las instituciones, los propietarios y las normas de gestión del emplazamiento.",
  "¿Pueden incorporarse durante la investigación o la postproducción?",
  "Sí. Podemos incorporarnos en una etapa concreta: investigación y viabilidad, desarrollo del tratamiento, rodaje local, coordinación de archivo, montaje, gráficos, sonido o localización.",

  "Hablemos de tu documental",
  "Cuéntanos el tema, el formato previsto, la etapa de producción, las localizaciones propuestas y el alcance necesario. Revisaremos el brief e identificaremos los siguientes pasos concretos para el desarrollo o la producción en Egipto.",
];

const IT: readonly string[] = [
  "Storie vere. Documentate con rigore. Realizzate con sguardo cinematografico.",
  "Un documentario comincia con una domanda, non con una lista di inquadrature. Aiutiamo a definire il taglio, documentare il soggetto, valutare gli accessi e costruire una struttura produttiva capace di rispondere alla realtà senza perdere la propria direzione editoriale.",
  "Global Untold Story può guidare una produzione documentaria completa o inserirsi in una fase precisa. Il nostro perimetro comprende ricerca e sviluppo, trattamenti e materiali di presentazione, preparazione, interviste, riprese sul campo, integrazione di archivio, montaggio, grafica, suono, localizzazione e consegna finale.",

  "I formati documentari che produciamo",
  "Lungometraggi e cortometraggi documentari",
  "Serie documentarie e televisione factual",
  "Film costruiti su interviste e testimonianze",
  "Documentari di storia, cultura, patrimonio e archeologia",
  "Racconti di viaggio, destinazione, ambiente e interesse umano",
  "Documentari aziendali, industriali e istituzionali",
  "Contenuti documentari di marca",
  "Formato, troupe e flusso di lavoro si costruiscono intorno al soggetto, al pubblico previsto, alle condizioni di accesso, ai requisiti di distribuzione e alla fase di produzione in corso.",

  "I nostri servizi di produzione documentaria",
  "Ricerca e sviluppo del racconto",
  "Individuiamo la domanda centrale, definiamo il taglio editoriale e mappiamo le persone, i luoghi e gli elementi necessari al racconto. Il supporto può comprendere ricerca di contesto, organizzazione delle fonti, individuazione dei protagonisti, pre-interviste, archi narrativi, struttura delle puntate e studio di fattibilità.",
  "Trattamenti, presentazioni e pianificazione produttiva",
  "Prepariamo i materiali necessari ad allineare gli interlocutori e a portare il progetto verso l'approvazione, la commissione o la produzione: logline, sinossi, trattamenti, dossier di presentazione, scalette delle puntate, riferimenti visivi, pianificazione di un proof of concept, calendari e quadri di budget.",
  "Interviste e racconto affidato ai protagonisti",
  "La ricerca dei protagonisti e la progettazione delle interviste seguono il ruolo che ogni voce ha nel racconto complessivo. Sosteniamo il primo contatto, le pre-interviste, la costruzione delle domande, la preparazione dei protagonisti, le interviste multilingue, l'interpretariato e la direzione davanti alla camera.",
  "Riprese sul campo in Egitto",
  "Le nostre squadre sul campo coprono interviste, riprese di osservazione, sequenze condotte da un presentatore, allestimenti visivi controllati e riprese in più località. Coordiniamo troupe, camera, suono, location, accessi, permessi, trasporti e il flusso quotidiano richiesto dal brief.",
  "Archivio, grafica e spiegazione visiva",
  "Archivio, mappe, linee del tempo e spiegazione visiva aggiungono un contesto che il girato nuovo da solo non può dare. Sosteniamo ricerca e organizzazione d'archivio, il coordinamento preliminare dei diritti, l'integrazione in montaggio, la motion graphic documentaria, le mappe animate, le infografiche e la visualizzazione 2D o 3D quando il soggetto lo richiede.",
  "Montaggio documentario, suono e localizzazione",
  "La postproduzione riunisce interviste, osservazione, archivio, voce narrante, grafica e suono in un racconto coerente. I nostri servizi comprendono montaggio narrativo, montaggio offline e online, correzione colore, sound design e missaggio, titoli, mastering, sottotitoli, voice-over, doppiaggio e pacchetti di consegna multilingue.",

  "Documentari di egittologia, archeologia e patrimonio",
  "Il patrimonio archeologico e culturale egiziano richiede pianificazione specialistica, sensibilità storica e accessi coordinati con cura.",
  "Accompagniamo produzioni documentarie su egittologia, archeologia, musei, monumenti, storia degli scavi e patrimonio culturale.",
  "A seconda del progetto, il supporto può comprendere il coordinamento di esperti e protagonisti, la pianificazione degli accessi ai siti del patrimonio, i permessi, le troupe locali, la ricerca d'archivio, le interviste, le mappe, la grafica, le ricostruzioni visive e la localizzazione.",

  "Lavori documentari selezionati",
  "Documentario sulle operazioni di Apache Egypt",
  "Una produzione documentaria di più giorni sulla preparazione del campo per una perforazione esplorativa, le procedure di salute e sicurezza, le interviste alla dirigenza al Cairo, le riprese aeree e il time-lapse.",
  "Produzione documentaria OIL e Alto Egitto",
  "Una produzione documentaria dedicata agli ambienti agricoli e alle comunità dell'Alto Egitto.",
  "Documentario engazaat sull'agricoltura intelligente a Dakhla",
  "Un documentario che segue la tecnologia idrica intelligente, il sapere agricolo e le collaborazioni locali nell'oasi di Dakhla, tra attività sul campo, infrastrutture, interviste e il più ampio paesaggio desertico.",

  "Girare un documentario in Egitto con troupe internazionali",
  "Le produzioni internazionali hanno bisogno di un partner locale che comprenda sia il brief editoriale sia la realtà pratica delle riprese in Egitto.",
  "Possiamo fornire singoli servizi documentari, rafforzare una troupe in trasferta o coordinare l'intera struttura produttiva locale.",
  "Produttori, fixer e ricercatori locali",
  "Coordinamento di protagonisti, esperti e interpreti",
  "Ricerca location, pianificazione degli accessi e coordinamento dei permessi",
  "Troupe di camera, luci e suono per il documentario",
  "Attrezzature, trasporti, alloggi e logistica sul campo",
  "Documentazione e comunicazione di produzione in arabo",
  "Supporto in postproduzione e localizzazione",
  "Accessi e permessi definitivi restano soggetti alle autorità competenti, alle istituzioni, ai proprietari e ai requisiti di ciascun luogo. Pianificare per tempo lascia più margine per valutare fattibilità, limiti e alternative praticabili.",

  "Integrità editoriale e cura dei protagonisti",
  "Una produzione documentaria può toccare testimonianze personali, controversie storiche, protagonisti vulnerabili e temi culturalmente delicati.",
  "Affrontiamo con attenzione il rapporto con i protagonisti, il consenso, la traduzione, l'uso dell'archivio e la ricostruzione visiva, lavorando con i team editoriali, legali e di compliance del cliente ogni volta che serve una verifica specialistica.",

  "Come strutturiamo un progetto documentario",
  "01 — Capire",
  "Chiarire il soggetto, il pubblico previsto, la domanda editoriale, le esigenze di accesso e la fase di produzione attuale.",
  "02 — Sviluppare",
  "Documentare il racconto, mappare i protagonisti, valutare la fattibilità e definire il trattamento o l'approccio produttivo.",
  "03 — Produrre",
  "Preparare calendario, troupe, location, autorizzazioni e flusso sul campo, poi girare interviste, materiale di osservazione e la copertura visiva necessaria.",
  "04 — Finire e consegnare",
  "Dare forma al racconto in montaggio, completare immagine e suono, localizzare le versioni richieste e preparare i master finali per la consegna.",

  "Cosa mettere nel brief del tuo documentario",
  "Un trattamento già pronto è utile ma non indispensabile. Per capire il progetto e preparare l'approccio produttivo giusto, condividi quello che hai a disposizione adesso:",
  "Sinossi, trattamento o brief di produzione",
  "Formato, durata prevista e pubblico",
  "Fase attuale: ricerca, sviluppo, commissionato o in produzione",
  "Date di ripresa previste e location",
  "Troupe in trasferta e ruoli locali necessari",
  "Esigenze di protagonisti, esperti, accessi e permessi",
  "Perimetro di archivio, postproduzione e localizzazione",
  "Requisiti di consegna",
  "Indicazioni di budget disponibili",

  "Domande frequenti",
  "Potete gestire una produzione documentaria completa in Egitto?",
  "Sì. Global Untold Story può seguire il percorso dallo sviluppo e dalla ricerca fino alle riprese sul campo, alla postproduzione, alla localizzazione e alla consegna finale. I singoli servizi possono anche essere commissionati separatamente.",
  "Potete supportare una troupe documentaria internazionale?",
  "Sì. Possiamo costruire il supporto locale intorno a una produzione in trasferta: ricerca, fixer, protagonisti, permessi, troupe, attrezzature, location, traduzione e logistica sul campo.",
  "Potete coordinare permessi di ripresa e luoghi sensibili?",
  "Possiamo coordinare le richieste, la documentazione di supporto e le comunicazioni per i luoghi interessati. L'approvazione finale e l'accesso restano soggetti alle autorità responsabili, alle istituzioni, ai proprietari e alle regole di gestione del sito.",
  "Potete inserirvi durante la ricerca o la postproduzione?",
  "Sì. Possiamo entrare in una fase precisa: ricerca e fattibilità, sviluppo del trattamento, riprese locali, coordinamento dell'archivio, montaggio, grafica, suono o localizzazione.",

  "Parliamo del tuo documentario",
  "Raccontaci il soggetto, il formato previsto, la fase di produzione, le location proposte e il perimetro richiesto. Esamineremo il brief e individueremo i prossimi passi concreti per lo sviluppo o la produzione in Egitto.",
];

const PT: readonly string[] = [
  "Histórias verdadeiras. Investigadas com rigor. Realizadas com olhar de cinema.",
  "Um documentário começa com uma pergunta, não com uma lista de planos. Ajudamos a definir o ângulo, a investigar o tema, a avaliar os acessos e a construir uma estrutura de produção capaz de responder à realidade sem perder a sua direção editorial.",
  "A Global Untold Story pode conduzir uma produção documental completa ou entrar numa fase específica. O nosso âmbito abrange investigação e desenvolvimento, tratamentos e materiais de apresentação, preparação, entrevistas, rodagem de terreno, integração de arquivo, montagem, grafismo, som, localização e entrega final.",

  "Formatos documentais que produzimos",
  "Longas e curtas-metragens documentais",
  "Séries documentais e televisão factual",
  "Filmes construídos sobre entrevistas e testemunhos",
  "Documentários de história, cultura, património e arqueologia",
  "Histórias de viagem, destino, ambiente e interesse humano",
  "Documentários empresariais, industriais e institucionais",
  "Conteúdo documental de marca",
  "O formato, a equipa e o fluxo de trabalho são construídos em torno do tema, do público previsto, das condições de acesso, dos requisitos de distribuição e da fase de produção em curso.",

  "Os nossos serviços de produção documental",
  "Investigação e desenvolvimento da narrativa",
  "Identificamos a pergunta central, definimos o ângulo editorial e mapeamos as pessoas, os lugares e os elementos necessários à narrativa. O apoio pode incluir investigação de contexto, organização de fontes, mapeamento de participantes, pré-entrevistas, arcos narrativos, estrutura de episódios e estudo de viabilidade.",
  "Tratamentos, apresentações e planeamento de produção",
  "Preparamos os materiais necessários para alinhar as partes envolvidas e levar o projeto até à aprovação, à encomenda ou à produção: loglines, sinopses, tratamentos, dossiês de apresentação, alinhamentos de episódios, referências visuais, planeamento de prova de conceito, calendários e enquadramentos orçamentais.",
  "Entrevistas e narrativa conduzida pelos participantes",
  "A procura de participantes e o desenho das entrevistas partem do papel que cada voz desempenha na narrativa mais ampla. Apoiamos o primeiro contacto, as pré-entrevistas, a construção das perguntas, a preparação dos participantes, as entrevistas multilingues, a interpretação e a direção diante da câmara.",
  "Rodagem de terreno no Egito",
  "As nossas equipas de terreno trabalham em entrevistas, filmagem de observação, sequências conduzidas por um apresentador, montagens visuais controladas e rodagens em várias localizações. Coordenamos equipa, câmara, som, localizações, acessos, licenças, transportes e o fluxo diário de produção exigido pelo briefing.",
  "Arquivo, grafismo e explicação visual",
  "Arquivo, mapas, cronologias e explicação visual acrescentam um contexto que as imagens novas não conseguem dar sozinhas. Apoiamos a investigação e organização de arquivo, a coordenação preliminar de direitos, a integração na montagem, o motion graphics documental, os mapas animados, as infografias e a visualização 2D ou 3D quando o tema o exige.",
  "Montagem documental, som e localização",
  "A pós-produção reúne entrevistas, observação, arquivo, narração, grafismo e som numa narrativa coerente. Os nossos serviços incluem montagem narrativa, montagem offline e online, correção de cor, desenho e mistura de som, títulos, masterização, legendagem, voz off, dobragem e pacotes de entrega multilingues.",

  "Documentários de egiptologia, arqueologia e património",
  "O património arqueológico e cultural egípcio exige planeamento especializado, sensibilidade histórica e acessos cuidadosamente coordenados.",
  "Acompanhamos produções documentais sobre egiptologia, arqueologia, museus, monumentos, história das escavações e património cultural.",
  "Consoante o projeto, o apoio pode incluir a coordenação de especialistas e participantes, o planeamento de acessos a sítios patrimoniais, as licenças, as equipas locais, a investigação de arquivo, as entrevistas, os mapas, o grafismo, as reconstituições visuais e a localização.",

  "Trabalhos documentais selecionados",
  "Documentário sobre as operações da Apache Egypt",
  "Uma produção documental de vários dias sobre a preparação do terreno para uma perfuração exploratória, os procedimentos de saúde e segurança, entrevistas com a direção no Cairo, filmagem aérea e time-lapse.",
  "Produção documental da OIT no Alto Egito",
  "Uma produção documental centrada nos ambientes agrícolas e nas comunidades do Alto Egito.",
  "Documentário engazaat sobre agricultura inteligente em Dakhla",
  "Um documentário que segue a tecnologia inteligente da água, o conhecimento agrícola e as parcerias locais no oásis de Dakhla, combinando atividade de terreno, infraestruturas, entrevistas e a paisagem desértica mais ampla.",

  "Filmar documentário no Egito com equipas internacionais",
  "As produções internacionais precisam de um parceiro local que compreenda tanto o briefing editorial como a realidade prática de filmar no Egito.",
  "Podemos prestar serviços documentais isolados, reforçar uma equipa de produção deslocada ou coordenar toda a estrutura de produção local.",
  "Produtores, fixers e investigadores locais",
  "Coordenação de participantes, especialistas e intérpretes",
  "Pesquisa de localizações, planeamento de acessos e coordenação de licenças",
  "Equipas de câmara, iluminação e som para documentário",
  "Equipamento, transporte, alojamento e logística de terreno",
  "Documentação e comunicação de produção em árabe",
  "Apoio em pós-produção e localização",
  "Os acessos e licenças finais continuam sujeitos às autoridades competentes, às instituições, aos proprietários e aos requisitos de cada local. Planear cedo dá mais tempo para avaliar viabilidade, restrições e alternativas exequíveis.",

  "Integridade editorial e cuidado com os participantes",
  "A produção documental pode envolver testemunhos pessoais, divergência histórica, participantes vulneráveis e temas culturalmente sensíveis.",
  "Tratamos com cuidado a comunicação com os participantes, o consentimento, a tradução, o uso de arquivo e a reconstituição visual, trabalhando com as equipas editoriais, jurídicas e de conformidade do cliente sempre que é necessária uma revisão especializada.",

  "Como estruturamos um projeto documental",
  "01 — Descobrir",
  "Clarificar o tema, o público previsto, a pergunta editorial, as necessidades de acesso e a fase de produção atual.",
  "02 — Desenvolver",
  "Investigar a narrativa, mapear participantes, avaliar a viabilidade e definir o tratamento ou a abordagem de produção.",
  "03 — Produzir",
  "Preparar o calendário, a equipa, as localizações, as autorizações e o fluxo de terreno, e depois filmar entrevistas, material de observação e a cobertura visual necessária.",
  "04 — Terminar e entregar",
  "Dar forma à narrativa na montagem, concluir imagem e som, localizar as versões necessárias e preparar os masters finais para entrega.",

  "O que incluir no briefing do seu documentário",
  "Ter um tratamento acabado ajuda, mas não é indispensável. Para percebermos o projeto e prepararmos a abordagem de produção certa, partilhe o que tiver disponível neste momento:",
  "Sinopse, tratamento ou briefing de produção",
  "Formato, duração prevista e público",
  "Fase atual: investigação, desenvolvimento, encomendado ou em produção",
  "Datas de rodagem previstas e localizações",
  "Equipa deslocada e funções locais necessárias",
  "Necessidades de participantes, especialistas, acessos e licenças",
  "Âmbito de arquivo, pós-produção e localização",
  "Requisitos de entrega",
  "Indicações de orçamento disponíveis",

  "Perguntas frequentes",
  "Conseguem gerir uma produção documental completa no Egito?",
  "Sim. A Global Untold Story pode acompanhar o processo desde o desenvolvimento e a investigação até à rodagem de terreno, à pós-produção, à localização e à entrega final. Os serviços podem também ser contratados separadamente.",
  "Conseguem apoiar uma equipa documental internacional?",
  "Sim. Podemos montar o apoio local em torno de uma produção deslocada: investigação, fixers, participantes, licenças, equipas, equipamento, localizações, tradução e logística de terreno.",
  "Conseguem coordenar licenças de filmagem e locais sensíveis?",
  "Podemos coordenar os pedidos, a documentação de apoio e a comunicação para os locais em causa. A aprovação final e o acesso continuam sujeitos às autoridades responsáveis, às instituições, aos proprietários e às regras de gestão do local.",
  "Conseguem entrar durante a investigação ou a pós-produção?",
  "Sim. Podemos entrar numa fase específica: investigação e viabilidade, desenvolvimento do tratamento, rodagem local, coordenação de arquivo, montagem, grafismo, som ou localização.",

  "Vamos falar do seu documentário",
  "Partilhe o tema, o formato pretendido, a fase de produção, as localizações propostas e o âmbito necessário. Analisaremos o briefing e identificaremos os próximos passos concretos para desenvolvimento ou produção no Egito.",
];

const RU: readonly string[] = [
  "Подлинные истории. Тщательно исследованные. Снятые кинематографично.",
  "Документальный фильм начинается с вопроса, а не со списка планов. Мы помогаем определить угол зрения, изучить тему, оценить доступ и выстроить производственную структуру, способную реагировать на действительность, не теряя редакционного направления.",
  "Global Untold Story может вести документальное производство целиком или подключиться на конкретном этапе. В наш объём входят исследование и разработка, тритменты и питчинговые материалы, подготовка, интервью, полевые съёмки, работа с архивом, монтаж, графика, звук, локализация и финальная сдача.",

  "Документальные форматы, с которыми мы работаем",
  "Полнометражные и короткометражные документальные фильмы",
  "Документальные сериалы и фактическое телевидение",
  "Фильмы, построенные на интервью и свидетельствах",
  "Документальные проекты об истории, культуре, наследии и археологии",
  "Истории о путешествиях, направлениях, экологии и человеческих судьбах",
  "Корпоративные, промышленные и институциональные документальные фильмы",
  "Брендированный документальный контент",
  "Формат, съёмочная группа и порядок работы выстраиваются вокруг темы, целевой аудитории, условий доступа, требований дистрибуции и текущего этапа производства.",

  "Наши услуги документального производства",
  "Исследование и разработка истории",
  "Мы формулируем ключевой вопрос, определяем редакционный угол и составляем карту людей, мест и свидетельств, нужных для рассказа. Поддержка может включать фоновое исследование, систематизацию источников, поиск героев, предварительные беседы, драматургические арки, структуру серий и оценку осуществимости.",
  "Тритменты, питчи и производственное планирование",
  "Мы готовим материалы, которые собирают всех участников вокруг одного понимания и продвигают проект к утверждению, заказу или производству: логлайны, синопсисы, тритменты, питч-презентации, планы серий, визуальные референсы, планирование пилотного образца, графики и бюджетные рамки.",
  "Интервью и повествование через героев",
  "Поиск героев и построение интервью планируются исходя из роли каждого голоса в общем повествовании. Мы поддерживаем первичный контакт, предварительные беседы, разработку вопросов, подготовку героев, многоязычные интервью, перевод и режиссуру перед камерой.",
  "Полевые съёмки в Египте",
  "Наши полевые команды работают с интервью, наблюдательной съёмкой, эпизодами с ведущим, выстроенными визуальными постановками и съёмками в нескольких локациях. Мы координируем группу, камеру, звук, локации, доступ, разрешения, транспорт и ежедневный рабочий порядок, которого требует бриф.",
  "Архив, графика и визуальное объяснение",
  "Архив, карты, хронологии и визуальное объяснение дают контекст, который новый материал в одиночку дать не может. Мы поддерживаем архивное исследование и его систематизацию, предварительное согласование прав, редакционную интеграцию, документальный моушн-дизайн, анимированные карты, инфографику и 2D- или 3D-визуализацию, когда этого требует тема.",
  "Документальный монтаж, звук и локализация",
  "Постпродакшн сводит интервью, наблюдение, архив, закадровый текст, графику и звук в цельную историю. В наши услуги входят драматургический монтаж, черновой и чистовой монтаж, цветокоррекция, саунд-дизайн и сведение, титры, мастеринг, субтитры, закадровое озвучание, дубляж и многоязычные пакеты сдачи.",

  "Документальные фильмы о египтологии, археологии и наследии",
  "Археологическое и культурное наследие Египта требует специализированного планирования, исторической деликатности и тщательно согласованного доступа.",
  "Мы сопровождаем документальные производства, посвящённые египтологии, археологии, музеям, памятникам, истории раскопок и культурному наследию.",
  "В зависимости от проекта поддержка может включать координацию экспертов и героев, планирование доступа к объектам наследия, разрешения, местные съёмочные группы, архивное исследование, интервью, карты, графику, визуальные реконструкции и локализацию.",

  "Избранные документальные работы",
  "Документальный фильм об операциях Apache Egypt",
  "Многодневное документальное производство о подготовке площадки к разведочному бурению, процедурах охраны труда и безопасности, интервью с руководством в Каире, аэросъёмке и таймлапсе.",
  "Документальное производство МОТ в Верхнем Египте",
  "Документальное производство, посвящённое сельскохозяйственной среде и сообществам Верхнего Египта.",
  "Документальный фильм engazaat об умном земледелии в Дахле",
  "Документальный фильм об умных водных технологиях, аграрных знаниях и местных партнёрствах в оазисе Дахла, объединяющий полевую работу, инфраструктуру, интервью и широкий пустынный ландшафт.",

  "Документальные съёмки в Египте для международных команд",
  "Международным производствам нужен местный партнёр, который понимает и редакционный бриф, и практические реалии съёмок в Египте.",
  "Мы можем оказать отдельные документальные услуги, усилить приезжающую группу или координировать всю местную производственную структуру.",
  "Местные продюсеры, фиксеры и исследователи",
  "Координация героев, экспертов и переводчиков",
  "Поиск локаций, планирование доступа и координация разрешений",
  "Операторские, световые и звуковые группы для документального кино",
  "Техника, транспорт, размещение и полевая логистика",
  "Документация и производственная коммуникация на арабском языке",
  "Поддержка на постпродакшне и в локализации",
  "Окончательный доступ и разрешения остаются в ведении компетентных органов, учреждений, собственников и требований конкретной площадки. Раннее планирование даёт больше времени оценить осуществимость, ограничения и рабочие альтернативы.",

  "Редакционная добросовестность и бережность к героям",
  "Документальное производство может затрагивать личные свидетельства, исторические разногласия, уязвимых героев и культурно чувствительные темы.",
  "Мы внимательно подходим к общению с героями, согласию, переводу, использованию архива и визуальной реконструкции и работаем с редакционными, юридическими и комплаенс-командами клиента всякий раз, когда нужна специализированная проверка.",

  "Как мы выстраиваем документальный проект",
  "01 — Понять",
  "Прояснить тему, целевую аудиторию, редакционный вопрос, потребности в доступе и текущий этап производства.",
  "02 — Разработать",
  "Исследовать историю, составить карту героев, оценить осуществимость и определить тритмент или производственный подход.",
  "03 — Снять",
  "Подготовить график, группу, локации, разрешения и полевой порядок работы, затем снять интервью, наблюдательный материал и нужное визуальное покрытие.",
  "04 — Завершить и сдать",
  "Собрать историю на монтаже, довести изображение и звук, локализовать требуемые версии и подготовить финальные мастера к сдаче.",

  "Что включить в бриф документального проекта",
  "Готовый тритмент полезен, но не обязателен. Чтобы мы поняли проект и подготовили верный производственный подход, пришлите то, что есть у вас сейчас:",
  "Синопсис, тритмент или производственный бриф",
  "Формат, предполагаемый хронометраж и аудитория",
  "Текущий этап: исследование, разработка, заказ получен или производство идёт",
  "Предполагаемые даты съёмок и локации",
  "Приезжающая группа и нужные местные позиции",
  "Требования к героям, экспертам, доступу и разрешениям",
  "Объём архива, постпродакшна и локализации",
  "Требования к сдаче",
  "Имеющиеся бюджетные ориентиры",

  "Частые вопросы",
  "Можете ли вы вести полное документальное производство в Египте?",
  "Да. Global Untold Story может сопровождать процесс от разработки и исследования до полевых съёмок, постпродакшна, локализации и финальной сдачи. Отдельные услуги также можно заказать по отдельности.",
  "Можете ли вы поддержать международную документальную группу?",
  "Да. Мы можем выстроить местную поддержку вокруг приезжающего производства: исследование, фиксеры, герои, разрешения, съёмочные группы, техника, локации, перевод и полевая логистика.",
  "Можете ли вы координировать съёмочные разрешения и чувствительные объекты?",
  "Мы можем координировать заявки, сопроводительные документы и переписку по соответствующим объектам. Окончательное согласование и доступ остаются в ведении ответственных органов, учреждений, собственников и требований управляющих площадкой.",
  "Можете ли вы подключиться на этапе исследования или постпродакшна?",
  "Да. Мы можем подключиться на конкретном этапе: исследование и оценка осуществимости, разработка тритмента, местные полевые съёмки, координация архива, монтаж, графика, звук или локализация.",

  "Обсудим ваш документальный проект",
  "Расскажите о теме, предполагаемом формате, этапе производства, планируемых локациях и нужном объёме. Мы изучим бриф и назовём конкретные следующие шаги для разработки или производства в Египте.",
];

const TR: readonly string[] = [
  "Gerçek hikâyeler. Titizlikle araştırılmış. Sinema diliyle çekilmiş.",
  "Bir belgesel çekim listesiyle değil, bir soruyla başlar. Bakış açısını belirlemeye, konuyu araştırmaya, erişimi değerlendirmeye ve editoryal yönünü kaybetmeden gerçekliğe yanıt verebilen bir yapım yapısı kurmaya yardımcı oluruz.",
  "Global Untold Story eksiksiz bir belgesel yapımını yürütebilir ya da belirli bir aşamada dahil olabilir. Kapsamımız araştırma ve geliştirmeyi, tritman ve sunum materyallerini, hazırlığı, röportajları, saha çekimlerini, arşiv entegrasyonunu, kurguyu, grafiği, sesi, yerelleştirmeyi ve nihai teslimi içerir.",

  "Ürettiğimiz belgesel formatları",
  "Uzun ve kısa metraj belgesel filmler",
  "Belgesel diziler ve gerçeklik televizyonu",
  "Röportaj ve tanıklık üzerine kurulu filmler",
  "Tarih, kültür, miras ve arkeoloji belgeselleri",
  "Seyahat, destinasyon, çevre ve insan hikâyeleri",
  "Kurumsal, endüstriyel ve kamusal belgeseller",
  "Marka odaklı belgesel içerik",
  "Format, ekip ve iş akışı; konu, hedeflenen izleyici, erişim koşulları, dağıtım gereksinimleri ve mevcut yapım aşaması etrafında kurulur.",

  "Belgesel yapım hizmetlerimiz",
  "Araştırma ve hikâye geliştirme",
  "Merkezî soruyu belirler, editoryal bakış açısını tanımlar ve hikâyenin ihtiyaç duyduğu insanları, mekânları ve kanıtları haritalandırırız. Destek; arka plan araştırmasını, kaynakların düzenlenmesini, katılımcı haritalamasını, ön görüşmeleri, anlatı yaylarını, bölüm yapısını ve yapılabilirlik değerlendirmesini kapsayabilir.",
  "Tritmanlar, sunumlar ve yapım planlaması",
  "Paydaşları aynı noktada buluşturmak ve projeyi onaya, siparişe ya da yapıma taşımak için gereken materyalleri hazırlarız: logline'lar, sinopsisler, tritmanlar, sunum dosyaları, bölüm planları, görsel referanslar, konsept kanıtı planlaması, takvimler ve bütçe çerçeveleri.",
  "Röportajlar ve katılımcı odaklı anlatım",
  "Katılımcı araştırması ve röportaj tasarımı, her sesin geniş anlatı içindeki rolüne göre planlanır. İlk temas, ön görüşmeler, soru geliştirme, katılımcı hazırlığı, çok dilli röportajlar, tercüme ve kamera önü yönetimi konularında destek veririz.",
  "Mısır'da saha çekimi",
  "Saha ekiplerimiz röportajlar, gözlemsel çekim, sunucu eşliğindeki sekanslar, kontrollü görsel kurulumlar ve çok mekânlı çekimler üzerinde çalışır. Ekibi, kamerayı, sesi, mekânları, erişimi, izinleri, ulaşımı ve brifin gerektirdiği günlük iş akışını koordine ederiz.",
  "Arşiv, grafik ve görsel anlatım",
  "Arşiv, haritalar, zaman çizelgeleri ve görsel anlatım, yeni çekilen görüntünün tek başına veremeyeceği bağlamı ekler. Arşiv araştırması ve düzenlenmesi, ön hak koordinasyonu, kurguya entegrasyon, belgesel motion grafik, animasyonlu haritalar, infografikler ve konu gerektirdiğinde 2B veya 3B görselleştirme konularında destek veririz.",
  "Belgesel kurgusu, ses ve yerelleştirme",
  "Post prodüksiyon; röportajı, gözlemi, arşivi, dış sesi, grafiği ve sesi tek bir tutarlı hikâyede birleştirir. Hizmetlerimiz arasında anlatı kurgusu, offline ve online kurgu, renk düzenleme, ses tasarımı ve miksaj, jenerik, mastering, altyazı, seslendirme, dublaj ve çok dilli teslim paketleri yer alır.",

  "Mısırbilim, arkeoloji ve miras belgeselleri",
  "Mısır'ın arkeolojik ve kültürel mirası uzmanlık gerektiren planlama, tarihsel duyarlılık ve dikkatle koordine edilmiş erişim ister.",
  "Mısırbilim, arkeoloji, müzeler, anıtlar, kazı tarihi ve kültürel mirası konu alan belgesel yapımlara eşlik ederiz.",
  "Projeye göre destek; uzman ve katılımcı koordinasyonunu, miras alanlarına erişim planlamasını, izinleri, yerel yapım ekiplerini, arşiv araştırmasını, röportajları, haritaları, grafiği, görsel canlandırmaları ve yerelleştirmeyi kapsayabilir.",

  "Seçilmiş belgesel çalışmaları",
  "Apache Egypt operasyonları belgeseli",
  "Arama sondajı için saha hazırlığını, iş sağlığı ve güvenliği prosedürlerini, Kahire'deki yönetim röportajlarını, hava çekimlerini ve time-lapse'i kapsayan çok günlü bir belgesel yapımı.",
  "ILO ve Yukarı Mısır belgesel film yapımı",
  "Yukarı Mısır'daki tarımsal ortamlara ve topluluklara odaklanan bir belgesel yapımı.",
  "engazaat Dakhla akıllı tarım belgeseli",
  "Dakhla Vahası'nda akıllı su teknolojisini, tarımsal bilgiyi ve yerel ortaklıkları izleyen; saha faaliyetini, altyapıyı, röportajları ve geniş çöl manzarasını bir araya getiren bir belgesel.",

  "Uluslararası ekiplerle Mısır'da belgesel çekimi",
  "Uluslararası yapımların, hem editoryal brifi hem de Mısır'da çekim yapmanın pratik gerçeklerini bilen bir yerel ortağa ihtiyacı vardır.",
  "Tek tek belgesel hizmetleri sunabilir, gelen bir yapım ekibini güçlendirebilir ya da yerel yapım yapısının tamamını koordine edebiliriz.",
  "Yerel yapımcılar, fikser ve araştırmacılar",
  "Katılımcı, uzman ve tercüman koordinasyonu",
  "Mekân araştırması, erişim planlaması ve izin koordinasyonu",
  "Belgesel için kamera, ışık ve ses ekipleri",
  "Ekipman, ulaşım, konaklama ve saha lojistiği",
  "Arapça dokümantasyon ve yapım iletişimi",
  "Post prodüksiyon ve yerelleştirme desteği",
  "Nihai erişim ve izinler ilgili mercilere, kurumlara, mülk sahiplerine ve mekân gereksinimlerine bağlı kalır. Erken planlama; yapılabilirliği, kısıtları ve uygulanabilir alternatifleri değerlendirmek için daha çok zaman bırakır.",

  "Editoryal dürüstlük ve katılımcı özeni",
  "Belgesel yapımı kişisel tanıklıkları, tarihsel anlaşmazlıkları, kırılgan katılımcıları ve kültürel açıdan hassas konuları içerebilir.",
  "Katılımcı iletişimini, rızayı, çeviriyi, arşiv kullanımını ve görsel canlandırmayı özenle ele alır; uzman incelemesi gerektiğinde müşterinin editoryal, hukuk ve uyum ekipleriyle birlikte çalışırız.",

  "Bir belgesel projesini nasıl kurguluyoruz",
  "01 — Anlama",
  "Konuyu, hedeflenen izleyiciyi, editoryal soruyu, erişim ihtiyaçlarını ve mevcut yapım aşamasını netleştirmek.",
  "02 — Geliştirme",
  "Hikâyeyi araştırmak, katılımcıları haritalandırmak, yapılabilirliği değerlendirmek ve tritmanı ya da yapım yaklaşımını belirlemek.",
  "03 — Üretim",
  "Takvimi, ekibi, mekânları, izinleri ve saha akışını hazırlamak; ardından röportajları, gözlemsel malzemeyi ve gereken görsel kapsamı çekmek.",
  "04 — Bitirme ve teslim",
  "Hikâyeyi kurguda biçimlendirmek, görüntü ve sesi tamamlamak, istenen sürümleri yerelleştirmek ve teslim için nihai masterları hazırlamak.",

  "Belgesel brifinizde neler olmalı",
  "Tamamlanmış bir tritman işe yarar ama şart değil. Projeyi anlamamız ve doğru yapım yaklaşımını hazırlamamız için elinizde şu an ne varsa paylaşın:",
  "Sinopsis, tritman ya da yapım brifi",
  "Format, hedeflenen süre ve izleyici",
  "Mevcut aşama: araştırma, geliştirme, sipariş alınmış ya da yapımda",
  "Öngörülen çekim tarihleri ve mekânlar",
  "Gelen ekip ve ihtiyaç duyulan yerel pozisyonlar",
  "Katılımcı, uzman, erişim ve izin gereksinimleri",
  "Arşiv, post prodüksiyon ve yerelleştirme kapsamı",
  "Teslim gereksinimleri",
  "Mevcut bütçe yönlendirmesi",

  "Sıkça sorulan sorular",
  "Mısır'da eksiksiz bir belgesel yapımını yürütebilir misiniz?",
  "Evet. Global Untold Story süreci geliştirme ve araştırmadan saha çekimine, post prodüksiyona, yerelleştirmeye ve nihai teslime kadar destekleyebilir. Hizmetler ayrı ayrı da sipariş edilebilir.",
  "Uluslararası bir belgesel ekibine destek verebilir misiniz?",
  "Evet. Gelen bir yapımın çevresinde yerel desteği kurabiliriz: araştırma, fikser, katılımcılar, izinler, ekipler, ekipman, mekânlar, çeviri ve saha lojistiği.",
  "Çekim izinlerini ve hassas mekânları koordine edebilir misiniz?",
  "İlgili mekânlar için başvuruları, destekleyici belgeleri ve yazışmayı koordine edebiliriz. Nihai onay ve erişim, sorumlu mercilere, kurumlara, mülk sahiplerine ve alan yönetimi kurallarına bağlı kalır.",
  "Araştırma ya da post prodüksiyon aşamasında dahil olabilir misiniz?",
  "Evet. Belirli bir aşamada dahil olabiliriz: araştırma ve yapılabilirlik, tritman geliştirme, yerel saha çekimi, arşiv koordinasyonu, kurgu, grafik, ses ya da yerelleştirme.",

  "Belgeselinizi konuşalım",
  "Konuyu, hedeflenen formatı, yapım aşamasını, öngörülen mekânları ve gereken kapsamı paylaşın. Brifi inceleyip Mısır'da geliştirme ya da yapım için somut sonraki adımları belirleyelim.",
];

const BODIES: Record<string, readonly string[]> = {
  ar: AR, fr: FR, de: DE, es: ES, it: IT, pt: PT, ru: RU, tr: TR,
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toHtml(blocks: readonly string[]): string {
  const parts: string[] = [];
  let openList = false;
  blocks.forEach((text, i) => {
    const tag = STRUCTURE[i];
    if (tag === "li" && !openList) { parts.push("<ul>"); openList = true; }
    if (tag !== "li" && openList) { parts.push("</ul>"); openList = false; }
    parts.push(`<${tag}>${escapeHtml(text)}</${tag}>`);
  });
  if (openList) parts.push("</ul>");
  return parts.join("");
}

/**
 * The corrected body for a locale, or undefined when it is not needed.
 *
 * `current` is whatever the CMS returned. If it already reads as a documentary
 * page in that language, the CMS has been fixed and its text wins — this file
 * gets out of the way permanently, without anyone having to remember to delete
 * it.
 */
export function documentaryBodyFor(locale: string, current?: string | null): string | undefined {
  const blocks = BODIES[locale];
  if (!blocks) return undefined;

  const marker = DOCUMENTARY_MARKER[locale];
  const opening = (current || "").replace(/<[^>]+>/g, " ").slice(0, 600);
  if (marker && marker.test(opening)) return undefined;

  return toHtml(blocks);
}

/** Exposed so a test can assert every translation matches the structure. */
export const DOCUMENTARY_STRUCTURE_LENGTH = STRUCTURE.length;
export const DOCUMENTARY_BODIES = BODIES;
