import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Legal page copy.
 *
 * Written against what this site actually does, not from a template: the
 * contact form fields in `src/lib/mail.ts`, the analytics tags in the locale
 * layout (GA4 G-G38ZL9GYXF and Meta Pixel 780471777947136), and the two hosts
 * involved — Vercel serves the site, the Laravel API on Hostinger stores
 * enquiries. If any of those change, this copy has to change with them.
 *
 * Not a substitute for review by a lawyer, particularly for visitors in the
 * EU and UK, where consent must be collected before analytics or advertising
 * tags load. This site loads both on arrival.
 */

export type LegalKey = "privacy" | "terms" | "cookies";

export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_UPDATED = "2026-08-30";

const EN: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    updated: "Last updated",
    intro:
      "This policy explains what Global Untold Story collects when you use globaluntoldstory.com, why, and what you can ask us to do about it.",
    sections: [
      {
        heading: "Who we are",
        body: [
          "Global Untold Story is a film, video and content production studio with offices in Egyptian Media Production City, Business Bay in Dubai, and Jeddah. We are the controller of the personal data described here.",
          "For anything in this policy, write to bendary@globaluntoldstory.com.",
        ],
      },
      {
        heading: "What you give us",
        body: [
          "The contact form asks for your name, email address, phone number, the service you are interested in, and your message. Only the name, email and message are required; the rest you can leave blank.",
          "We use it to answer you and to plan the work you are asking about. We do not sell it, and we do not use it for marketing you did not ask for.",
          "Your enquiry is emailed to us and stored in our project system so we can pick the conversation back up. We keep enquiries for three years, then delete them.",
        ],
      },
      {
        heading: "What is collected automatically",
        body: [
          "We use Google Analytics 4 to understand which pages people read and how they arrived. It records pages viewed, approximate location by country, device and browser, and referring site. Google receives this data as a processor.",
          "We use the Meta Pixel to measure whether our advertising reaches the right audiences. It records page views and can connect them to a Meta account if you are signed in to one.",
          "Both load when the page loads. If you would rather they did not run, the controls in the Cookies section stop them.",
        ],
      },
      {
        heading: "Who else sees it",
        body: [
          "Vercel hosts this website and processes the requests your browser makes, including your IP address.",
          "Hostinger hosts our content system, which stores form submissions, and relays the notification email.",
          "Google and Meta receive analytics and advertising data as described above. Google Workspace carries our email.",
          "That is the complete list. We do not share your data with anyone else unless the law requires it.",
        ],
      },
      {
        heading: "Where it goes",
        body: [
          "Our offices are in Egypt, the UAE and Saudi Arabia, and the services above operate internationally, so your data is processed outside your country. Google, Meta and Vercel use standard contractual clauses for transfers out of the EU and UK.",
        ],
      },
      {
        heading: "What you can ask for",
        body: [
          "You can ask for a copy of what we hold, ask us to correct it, or ask us to delete it. You can object to analytics and advertising tracking, and withdraw consent at any time.",
          "Write to bendary@globaluntoldstory.com and we will answer within thirty days. If you are in the EU or UK and are not satisfied, you can complain to your national data protection authority.",
        ],
      },
      {
        heading: "Children",
        body: [
          "This site is for people commissioning production work. It is not aimed at children, and we do not knowingly collect anything from anyone under sixteen.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "When this policy changes we update the date at the top. Material changes will be announced on the site itself.",
        ],
      },
    ],
  },

  terms: {
    eyebrow: "Terms",
    title: "Terms of Use",
    updated: "Last updated",
    intro:
      "These terms cover your use of globaluntoldstory.com. They do not cover production work, which is governed by the contract signed for that project.",
    sections: [
      {
        heading: "Using this site",
        body: [
          "You may read this site, and share links to it, for any lawful purpose.",
          "You may not copy the site wholesale, scrape it at a rate that degrades it for other people, attempt to reach parts of it you have not been given access to, or present it as your own work.",
        ],
      },
      {
        heading: "The work shown here",
        body: [
          "Films, photographs, campaigns and written material on this site belong to Global Untold Story or to the clients who commissioned them. Client names and logos belong to those clients and appear here to identify work we produced.",
          "Nothing here grants you a licence to reuse any of it. If you want to, ask.",
        ],
      },
      {
        heading: "Enquiries are not contracts",
        body: [
          "Sending the contact form starts a conversation. It does not create an agreement, reserve a date, or fix a price. Work begins when both sides sign a proposal.",
          "Any figures, timelines or availability mentioned on this site are indicative and depend on the specifics of a project.",
        ],
      },
      {
        heading: "Accuracy",
        body: [
          "We keep this site current, but portfolios, service descriptions and availability change. We do not warrant that everything here is complete or up to date at the moment you read it.",
        ],
      },
      {
        heading: "Links out",
        body: [
          "Where we link to other sites — social platforms, clients, partners — we do not control what they publish and are not responsible for it.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We provide this site as it is. To the extent the law allows, we are not liable for losses arising from using it or from being unable to reach it.",
          "Nothing here limits liability for death, personal injury, or fraud.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of the Arab Republic of Egypt, and its courts have jurisdiction over disputes about them.",
        ],
      },
    ],
  },

  cookies: {
    eyebrow: "Cookies",
    title: "Cookie Policy",
    updated: "Last updated",
    intro:
      "This page lists every cookie and similar technology this site uses, what each is for, and how to turn the optional ones off.",
    sections: [
      {
        heading: "What we set ourselves",
        body: [
          "Your language choice is remembered in the address you are reading — /ar for Arabic, no prefix for English — rather than in a cookie.",
          "The contact form issues a short-lived token to each visitor so we can tell a person filling in the form from an automated script. It carries nothing about you and expires quickly.",
        ],
      },
      {
        heading: "Google Analytics",
        body: [
          "Measurement ID G-G38ZL9GYXF. Sets _ga and _ga_* to count visits and tell a returning reader from a new one. They last up to two years.",
          "This tells us which work and which articles people actually read. It does not identify you by name.",
        ],
      },
      {
        heading: "Meta Pixel",
        body: [
          "Pixel ID 780471777947136. Sets _fbp, and reads the _fbc parameter when you arrive from a Meta advertisement. It lasts about three months.",
          "This measures whether our advertising is reaching people who are interested. If you are signed in to Facebook or Instagram in the same browser, Meta can connect the visit to that account.",
        ],
      },
      {
        heading: "Turning them off",
        body: [
          "Every browser can block or delete cookies — look for Privacy in its settings. Blocking them does not stop this site working; nothing here needs a cookie to function.",
          "Google publishes an opt-out add-on for Analytics at tools.google.com/dlpage/gaoptout. Meta's advertising controls are in your account settings under Ad Preferences.",
          "A browser set to Do Not Track or Global Privacy Control is a signal we intend to honour, and this policy will be updated when that is in place.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "If we add or remove a tag, this page changes with it and the date at the top moves.",
        ],
      },
    ],
  },
};

const AR: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "الخصوصية",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث",
    intro:
      "توضّح هذه السياسة ما تجمعه Global Untold Story عند استخدامك لموقع globaluntoldstory.com، ولماذا، وما يمكنك أن تطلبه بشأنه.",
    sections: [
      {
        heading: "من نحن",
        body: [
          "Global Untold Story استوديو لإنتاج الأفلام والفيديو والمحتوى، له مكاتب في مدينة الإنتاج الإعلامي بمصر، والخليج التجاري بدبي، وجدة. نحن المتحكم في البيانات الشخصية الموضّحة هنا.",
          "لأي أمر يخص هذه السياسة، راسلنا على bendary@globaluntoldstory.com.",
        ],
      },
      {
        heading: "ما تقدّمه لنا",
        body: [
          "يطلب نموذج التواصل اسمك وبريدك الإلكتروني ورقم هاتفك والخدمة التي تهمّك ورسالتك. الاسم والبريد والرسالة وحدها مطلوبة، وما عداها اختياري.",
          "نستخدمها للرد عليك وللتخطيط للعمل الذي تسأل عنه. لا نبيعها، ولا نستخدمها في تسويق لم تطلبه.",
          "يصلنا طلبك عبر البريد الإلكتروني ويُحفظ في نظام المشاريع لدينا حتى نتمكّن من متابعة المحادثة. نحتفظ بالطلبات ثلاث سنوات ثم نحذفها.",
        ],
      },
      {
        heading: "ما يُجمع تلقائياً",
        body: [
          "نستخدم Google Analytics 4 لمعرفة الصفحات التي تُقرأ وكيفية الوصول إليها. يسجّل الصفحات المعروضة والموقع التقريبي على مستوى الدولة والجهاز والمتصفح والموقع المُحيل. تتلقّى جوجل هذه البيانات بصفتها معالجاً.",
          "نستخدم Meta Pixel لقياس ما إذا كانت إعلاناتنا تصل إلى الجمهور المناسب. يسجّل مشاهدات الصفحات، ويمكنه ربطها بحساب Meta إن كنت مسجّل الدخول إليه.",
          "يعمل الاثنان عند تحميل الصفحة. إن كنت تفضّل ألا يعملا، فقسم الكوكيز يوضّح كيفية إيقافهما.",
        ],
      },
      {
        heading: "من يطّلع عليها أيضاً",
        body: [
          "تستضيف Vercel هذا الموقع وتعالج الطلبات التي يرسلها متصفحك، بما فيها عنوان IP الخاص بك.",
          "تستضيف Hostinger نظام المحتوى الذي يخزّن رسائل النموذج، وتُرسل بريد الإشعار.",
          "تتلقّى جوجل وMeta بيانات التحليلات والإعلانات كما هو موضّح أعلاه. ويحمل Google Workspace بريدنا الإلكتروني.",
          "هذه هي القائمة كاملة. لا نشارك بياناتك مع أي جهة أخرى إلا إذا ألزمنا القانون بذلك.",
        ],
      },
      {
        heading: "أين تُعالَج",
        body: [
          "مكاتبنا في مصر والإمارات والسعودية، والخدمات المذكورة أعلاه تعمل دولياً، لذا تُعالَج بياناتك خارج بلدك. تعتمد جوجل وMeta وVercel البنود التعاقدية القياسية لعمليات النقل خارج الاتحاد الأوروبي والمملكة المتحدة.",
        ],
      },
      {
        heading: "ما يمكنك طلبه",
        body: [
          "يمكنك طلب نسخة مما لدينا، أو تصحيحه، أو حذفه. ويمكنك الاعتراض على تتبّع التحليلات والإعلانات وسحب موافقتك في أي وقت.",
          "راسلنا على bendary@globaluntoldstory.com وسنرد خلال ثلاثين يوماً. وإن كنت في الاتحاد الأوروبي أو المملكة المتحدة ولم تقتنع بردّنا، يمكنك التقدّم بشكوى إلى هيئة حماية البيانات في بلدك.",
        ],
      },
      {
        heading: "الأطفال",
        body: [
          "هذا الموقع موجّه لمن يطلبون أعمال إنتاج. وهو غير موجّه للأطفال، ولا نجمع عن قصد أي بيانات ممن هم دون السادسة عشرة.",
        ],
      },
      {
        heading: "التغييرات",
        body: [
          "عند تعديل هذه السياسة نحدّث التاريخ في الأعلى. وسيُعلَن عن أي تغيير جوهري على الموقع نفسه.",
        ],
      },
    ],
  },

  terms: {
    eyebrow: "الشروط",
    title: "شروط الاستخدام",
    updated: "آخر تحديث",
    intro:
      "تغطّي هذه الشروط استخدامك لموقع globaluntoldstory.com. ولا تغطّي أعمال الإنتاج، التي يحكمها العقد الموقّع لكل مشروع.",
    sections: [
      {
        heading: "استخدام الموقع",
        body: [
          "يمكنك قراءة هذا الموقع ومشاركة روابطه لأي غرض مشروع.",
          "ولا يجوز نسخ الموقع بالكامل، أو سحب بياناته بمعدّل يضرّ بتجربة الآخرين، أو محاولة الوصول إلى أجزاء لم يُمنح لك الوصول إليها، أو تقديمه على أنه عملك.",
        ],
      },
      {
        heading: "الأعمال المعروضة",
        body: [
          "الأفلام والصور والحملات والمواد المكتوبة على هذا الموقع مملوكة لـGlobal Untold Story أو للعملاء الذين كلّفوا بها. وأسماء العملاء وشعاراتهم ملك لهم، وتظهر هنا للتعريف بالأعمال التي أنتجناها.",
          "لا شيء هنا يمنحك ترخيصاً بإعادة استخدام أيٍّ منها. وإن أردت ذلك، فاسألنا.",
        ],
      },
      {
        heading: "الطلبات ليست عقوداً",
        body: [
          "إرسال نموذج التواصل يبدأ محادثة. وهو لا ينشئ اتفاقاً، ولا يحجز موعداً، ولا يثبّت سعراً. ويبدأ العمل عند توقيع الطرفين على عرض.",
          "أي أرقام أو جداول زمنية أو مواعيد إتاحة مذكورة على هذا الموقع استرشادية وتعتمد على تفاصيل كل مشروع.",
        ],
      },
      {
        heading: "الدقة",
        body: [
          "نحرص على تحديث الموقع، لكن الأعمال ووصف الخدمات ومواعيد الإتاحة تتغيّر. ولا نضمن أن كل ما هنا كامل أو محدَّث في لحظة قراءتك له.",
        ],
      },
      {
        heading: "الروابط الخارجية",
        body: [
          "حين نضع روابط لمواقع أخرى — منصات التواصل أو العملاء أو الشركاء — فنحن لا نتحكّم فيما ينشرونه ولسنا مسؤولين عنه.",
        ],
      },
      {
        heading: "المسؤولية",
        body: [
          "نقدّم هذا الموقع كما هو. وفي الحدود التي يسمح بها القانون، لا نتحمّل مسؤولية أي خسائر تنشأ عن استخدامه أو عن تعذّر الوصول إليه.",
          "ولا شيء هنا يحدّ من المسؤولية عن الوفاة أو الإصابة الشخصية أو الاحتيال.",
        ],
      },
      {
        heading: "القانون الحاكم",
        body: [
          "تخضع هذه الشروط لقوانين جمهورية مصر العربية، ولمحاكمها الاختصاص في المنازعات المتعلقة بها.",
        ],
      },
    ],
  },

  cookies: {
    eyebrow: "الكوكيز",
    title: "سياسة ملفات تعريف الارتباط",
    updated: "آخر تحديث",
    intro:
      "تسرد هذه الصفحة كل ملفات تعريف الارتباط والتقنيات المشابهة التي يستخدمها الموقع، والغرض من كلٍّ منها، وكيفية إيقاف الاختياري منها.",
    sections: [
      {
        heading: "ما نضعه بأنفسنا",
        body: [
          "يُحفظ اختيارك للغة داخل الرابط الذي تقرأه — ‏/ar للعربية، وبدون بادئة للإنجليزية — لا في ملف تعريف ارتباط.",
          "يصدر نموذج التواصل رمزاً قصير الأجل لكل زائر حتى نميّز الشخص الذي يملأ النموذج عن البرامج الآلية. وهو لا يحمل أي بيانات عنك وينتهي سريعاً.",
        ],
      },
      {
        heading: "Google Analytics",
        body: [
          "معرّف القياس G-G38ZL9GYXF. يضع ‎_ga‎ و‎_ga_*‎ لعدّ الزيارات وتمييز القارئ العائد عن الجديد. وتستمر حتى سنتين.",
          "يخبرنا هذا بالأعمال والمقالات التي تُقرأ فعلاً. ولا يحدّد هويتك بالاسم.",
        ],
      },
      {
        heading: "Meta Pixel",
        body: [
          "معرّف البيكسل 780471777947136. يضع ‎_fbp‎، ويقرأ معامل ‎_fbc‎ عند وصولك من إعلان على Meta. ويستمر نحو ثلاثة أشهر.",
          "يقيس هذا ما إذا كانت إعلاناتنا تصل إلى المهتمين. وإن كنت مسجّل الدخول إلى فيسبوك أو إنستجرام في المتصفح نفسه، يمكن لـMeta ربط الزيارة بذلك الحساب.",
        ],
      },
      {
        heading: "كيفية إيقافها",
        body: [
          "يمكن لكل متصفح حظر ملفات تعريف الارتباط أو حذفها — ابحث عن الخصوصية في إعداداته. وحظرها لا يمنع الموقع من العمل؛ فلا شيء هنا يحتاج إليها ليعمل.",
          "تنشر جوجل إضافة لإيقاف Analytics على tools.google.com/dlpage/gaoptout. وتوجد ضوابط إعلانات Meta في إعدادات حسابك ضمن تفضيلات الإعلانات.",
          "والمتصفح المضبوط على Do Not Track أو Global Privacy Control يرسل إشارة ننوي احترامها، وستُحدَّث هذه السياسة عند تفعيل ذلك.",
        ],
      },
      {
        heading: "التغييرات",
        body: [
          "إذا أضفنا أداة تتبّع أو أزلناها، تتغيّر هذه الصفحة معها ويتحرّك التاريخ في الأعلى.",
        ],
      },
    ],
  },
};

/**
 * Locales without their own translation read the English text. A legal page in
 * a language nobody has reviewed is worse than an honest English one, so the
 * fallback is deliberate rather than a gap.
 */
const FR: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Confidentialité",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour",
    intro:
      "Cette politique explique ce que Global Untold Story collecte lorsque vous utilisez globaluntoldstory.com, pourquoi, et ce que vous pouvez nous demander.",
    sections: [
      { heading: "Qui nous sommes", body: [
        "Global Untold Story est un studio de production de films, de vidéos et de contenus, avec des bureaux à Egyptian Media Production City, à Business Bay (Dubaï) et à Djeddah. Nous sommes responsables du traitement des données décrites ici.",
        "Pour toute question relative à cette politique, écrivez à bendary@globaluntoldstory.com."] },
      { heading: "Ce que vous nous confiez", body: [
        "Le formulaire de contact demande votre nom, votre adresse e-mail, votre téléphone, le service qui vous intéresse et votre message. Seuls le nom, l\u2019e-mail et le message sont obligatoires.",
        "Nous les utilisons pour vous répondre et préparer le projet dont vous parlez. Nous ne les vendons pas et ne les utilisons pas pour une prospection que vous n\u2019avez pas demandée.",
        "Votre demande nous est envoyée par e-mail et conservée dans notre système de projets afin de reprendre la conversation. Nous gardons les demandes trois ans, puis les supprimons."] },
      { heading: "Ce qui est collecté automatiquement", body: [
        "Nous utilisons Google Analytics 4 pour savoir quelles pages sont lues et par quel chemin. Il enregistre les pages vues, une localisation approximative au niveau du pays, l\u2019appareil, le navigateur et le site référent. Google reçoit ces données en tant que sous-traitant.",
        "Nous utilisons le pixel Meta pour mesurer si nos publicités touchent les bonnes audiences. Il enregistre les pages vues et peut les relier à un compte Meta si vous y êtes connecté.",
        "Dans l\u2019Union européenne et au Royaume-Uni, aucun des deux ne se déclenche avant votre accord ; ailleurs ils se chargent avec la page. Vous pouvez refuser à tout moment."] },
      { heading: "Qui d\u2019autre y a accès", body: [
        "Vercel héberge ce site et traite les requêtes de votre navigateur, y compris votre adresse IP.",
        "Hostinger héberge notre système de contenu, qui stocke les messages du formulaire, et relaie l\u2019e-mail de notification.",
        "Google et Meta reçoivent les données décrites ci-dessus. Google Workspace assure notre messagerie.",
        "C\u2019est la liste complète. Nous ne partageons vos données avec personne d\u2019autre, sauf obligation légale."] },
      { heading: "Où elles sont traitées", body: [
        "Nos bureaux sont en Égypte, aux Émirats et en Arabie saoudite, et les services ci-dessus opèrent à l\u2019international : vos données sont donc traitées hors de votre pays. Google, Meta et Vercel s\u2019appuient sur les clauses contractuelles types pour les transferts hors UE et Royaume-Uni."] },
      { heading: "Ce que vous pouvez demander", body: [
        "Vous pouvez demander une copie de ce que nous détenons, sa rectification ou sa suppression. Vous pouvez vous opposer au suivi analytique et publicitaire et retirer votre consentement à tout moment.",
        "Écrivez à bendary@globaluntoldstory.com ; nous répondons sous trente jours. Dans l\u2019UE ou au Royaume-Uni, vous pouvez saisir votre autorité nationale de protection des données."] },
      { heading: "Mineurs", body: [
        "Ce site s\u2019adresse aux personnes qui commandent des productions. Il ne vise pas les enfants et nous ne collectons pas sciemment de données de personnes de moins de seize ans."] },
      { heading: "Modifications", body: [
        "Lorsque cette politique change, la date en haut est mise à jour. Toute modification importante sera annoncée sur le site."] },
    ],
  },
  terms: {
    eyebrow: "Conditions",
    title: "Conditions d\u2019utilisation",
    updated: "Dernière mise à jour",
    intro:
      "Ces conditions couvrent votre utilisation de globaluntoldstory.com. Elles ne couvrent pas les travaux de production, régis par le contrat signé pour chaque projet.",
    sections: [
      { heading: "Utiliser ce site", body: [
        "Vous pouvez consulter ce site et en partager les liens à toute fin licite.",
        "Vous ne pouvez pas le copier intégralement, l\u2019aspirer à un rythme qui en dégrade l\u2019accès pour autrui, tenter d\u2019atteindre des parties auxquelles vous n\u2019avez pas accès, ni le présenter comme votre travail."] },
      { heading: "Les travaux présentés", body: [
        "Les films, photographies, campagnes et textes de ce site appartiennent à Global Untold Story ou aux clients qui les ont commandés. Les noms et logos des clients leur appartiennent et figurent ici pour identifier des travaux que nous avons produits.",
        "Rien ici ne vous accorde de licence de réutilisation. Si vous le souhaitez, demandez-nous."] },
      { heading: "Une demande n\u2019est pas un contrat", body: [
        "Envoyer le formulaire ouvre une conversation. Cela ne crée pas d\u2019accord, ne réserve pas de date et ne fixe pas de prix. Le travail commence à la signature d\u2019une proposition par les deux parties.",
        "Les montants, délais ou disponibilités mentionnés sur ce site sont indicatifs et dépendent des spécificités du projet."] },
      { heading: "Exactitude", body: [
        "Nous tenons ce site à jour, mais les réalisations, descriptions de services et disponibilités évoluent. Nous ne garantissons pas que tout y soit complet ou à jour au moment de votre lecture."] },
      { heading: "Liens externes", body: [
        "Lorsque nous renvoyons vers d\u2019autres sites — réseaux sociaux, clients, partenaires — nous ne contrôlons pas ce qu\u2019ils publient et n\u2019en sommes pas responsables."] },
      { heading: "Responsabilité", body: [
        "Ce site est fourni en l\u2019état. Dans la limite permise par la loi, nous ne sommes pas responsables des pertes résultant de son utilisation ou de son indisponibilité.",
        "Rien ici ne limite la responsabilité en cas de décès, de dommage corporel ou de fraude."] },
      { heading: "Droit applicable", body: [
        "Ces conditions sont régies par le droit de la République arabe d\u2019Égypte, dont les tribunaux sont compétents pour les litiges s\u2019y rapportant."] },
    ],
  },
  cookies: {
    eyebrow: "Cookies",
    title: "Politique de cookies",
    updated: "Dernière mise à jour",
    intro:
      "Cette page liste chaque cookie et technologie similaire utilisés par ce site, leur rôle et la façon de désactiver ceux qui sont facultatifs.",
    sections: [
      { heading: "Ce que nous déposons nous-mêmes", body: [
        "Votre choix de langue est porté par l\u2019adresse que vous lisez — /fr pour le français, sans préfixe pour l\u2019anglais — et non par un cookie.",
        "Le formulaire de contact délivre un jeton de courte durée à chaque visiteur afin de distinguer une personne d\u2019un script automatisé. Il ne contient rien vous concernant et expire rapidement.",
        "Votre réponse à la bannière de consentement est conservée localement dans votre navigateur, afin de ne pas vous la reposer à chaque visite."] },
      { heading: "Google Analytics", body: [
        "Identifiant de mesure G-G38ZL9GYXF. Dépose _ga et _ga_* pour compter les visites et distinguer un lecteur qui revient d\u2019un nouveau. Durée maximale : deux ans.",
        "Cela nous indique quels travaux et quels articles sont réellement lus. Cela ne vous identifie pas nommément."] },
      { heading: "Pixel Meta", body: [
        "Identifiant 780471777947136. Dépose _fbp et lit le paramètre _fbc lorsque vous arrivez depuis une publicité Meta. Durée : environ trois mois.",
        "Cela mesure si nos publicités atteignent des personnes intéressées. Si vous êtes connecté à Facebook ou Instagram dans le même navigateur, Meta peut relier la visite à ce compte."] },
      { heading: "Les désactiver", body: [
        "Dans l\u2019Union européenne et au Royaume-Uni, rien ne se déclenche avant votre accord ; refuser suffit.",
        "Tout navigateur peut bloquer ou supprimer les cookies — cherchez Confidentialité dans ses réglages. Les bloquer n\u2019empêche pas ce site de fonctionner : rien ici n\u2019a besoin d\u2019un cookie.",
        "Google publie un module de désactivation d\u2019Analytics sur tools.google.com/dlpage/gaoptout. Les réglages publicitaires de Meta se trouvent dans les préférences de votre compte."] },
      { heading: "Modifications", body: [
        "Si nous ajoutons ou retirons une balise, cette page change avec elle et la date en haut est mise à jour."] },
    ],
  },
};

const DE: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Datenschutz",
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert",
    intro:
      "Diese Erklärung beschreibt, was Global Untold Story bei der Nutzung von globaluntoldstory.com erhebt, warum, und worum Sie uns bitten können.",
    sections: [
      { heading: "Wer wir sind", body: [
        "Global Untold Story ist ein Studio für Film-, Video- und Contentproduktion mit Büros in der Egyptian Media Production City, in Business Bay in Dubai und in Dschidda. Wir sind der Verantwortliche für die hier beschriebenen Daten.",
        "Bei Fragen zu dieser Erklärung schreiben Sie an bendary@globaluntoldstory.com."] },
      { heading: "Was Sie uns geben", body: [
        "Das Kontaktformular fragt nach Name, E-Mail-Adresse, Telefonnummer, der Sie interessierenden Leistung und Ihrer Nachricht. Nur Name, E-Mail und Nachricht sind erforderlich.",
        "Wir nutzen diese Angaben, um zu antworten und das angefragte Projekt zu planen. Wir verkaufen sie nicht und verwenden sie nicht für Werbung, um die Sie nicht gebeten haben.",
        "Ihre Anfrage wird uns per E-Mail zugestellt und in unserem Projektsystem gespeichert, damit wir das Gespräch fortsetzen können. Anfragen bewahren wir drei Jahre auf und löschen sie dann."] },
      { heading: "Was automatisch erhoben wird", body: [
        "Wir nutzen Google Analytics 4, um zu verstehen, welche Seiten gelesen werden und wie Besucher hierher gelangen. Erfasst werden Seitenaufrufe, ein ungefährer Standort auf Länderebene, Gerät, Browser und die verweisende Website. Google erhält diese Daten als Auftragsverarbeiter.",
        "Wir nutzen das Meta-Pixel, um zu messen, ob unsere Werbung die richtigen Zielgruppen erreicht. Es erfasst Seitenaufrufe und kann sie einem Meta-Konto zuordnen, wenn Sie dort angemeldet sind.",
        "In der EU und im Vereinigten Königreich wird keines von beiden vor Ihrer Zustimmung ausgelöst; anderswo laden sie mit der Seite. Sie können jederzeit ablehnen."] },
      { heading: "Wer sonst Zugriff hat", body: [
        "Vercel hostet diese Website und verarbeitet die Anfragen Ihres Browsers, einschließlich Ihrer IP-Adresse.",
        "Hostinger hostet unser Content-System, das Formularnachrichten speichert, und stellt die Benachrichtigungs-E-Mail zu.",
        "Google und Meta erhalten die oben beschriebenen Daten. Google Workspace betreibt unsere E-Mail.",
        "Das ist die vollständige Liste. Wir geben Ihre Daten an niemanden sonst weiter, sofern das Gesetz es nicht verlangt."] },
      { heading: "Wohin die Daten gehen", body: [
        "Unsere Büros liegen in Ägypten, den VAE und Saudi-Arabien, und die genannten Dienste arbeiten international — Ihre Daten werden daher außerhalb Ihres Landes verarbeitet. Google, Meta und Vercel stützen Übermittlungen aus der EU und dem Vereinigten Königreich auf Standardvertragsklauseln."] },
      { heading: "Ihre Rechte", body: [
        "Sie können eine Kopie der bei uns gespeicherten Daten verlangen, deren Berichtigung oder Löschung. Sie können der Analyse- und Werbeerfassung widersprechen und Ihre Einwilligung jederzeit widerrufen.",
        "Schreiben Sie an bendary@globaluntoldstory.com; wir antworten binnen dreißig Tagen. In der EU oder im Vereinigten Königreich können Sie sich an Ihre nationale Datenschutzbehörde wenden."] },
      { heading: "Kinder", body: [
        "Diese Website richtet sich an Personen, die Produktionen beauftragen. Sie richtet sich nicht an Kinder, und wir erheben wissentlich keine Daten von Personen unter sechzehn Jahren."] },
      { heading: "Änderungen", body: [
        "Ändert sich diese Erklärung, aktualisieren wir das Datum oben. Wesentliche Änderungen kündigen wir auf der Website an."] },
    ],
  },
  terms: {
    eyebrow: "Nutzungsbedingungen",
    title: "Nutzungsbedingungen",
    updated: "Zuletzt aktualisiert",
    intro:
      "Diese Bedingungen gelten für die Nutzung von globaluntoldstory.com. Sie gelten nicht für Produktionsarbeiten, für die der jeweils unterzeichnete Projektvertrag maßgeblich ist.",
    sections: [
      { heading: "Nutzung dieser Website", body: [
        "Sie dürfen diese Website lesen und ihre Links zu jedem rechtmäßigen Zweck teilen.",
        "Sie dürfen sie nicht vollständig kopieren, nicht in einem Tempo auslesen, das sie für andere beeinträchtigt, nicht auf Bereiche zugreifen, für die Ihnen kein Zugang eingeräumt wurde, und sie nicht als eigene Arbeit ausgeben."] },
      { heading: "Die gezeigten Arbeiten", body: [
        "Filme, Fotografien, Kampagnen und Texte auf dieser Website gehören Global Untold Story oder den Kunden, die sie beauftragt haben. Kundennamen und Logos gehören diesen Kunden und stehen hier, um von uns produzierte Arbeiten zu kennzeichnen.",
        "Nichts hiervon räumt Ihnen eine Lizenz zur Weiterverwendung ein. Wenn Sie eine möchten, fragen Sie uns."] },
      { heading: "Eine Anfrage ist kein Vertrag", body: [
        "Das Absenden des Formulars beginnt ein Gespräch. Es begründet keine Vereinbarung, reserviert keinen Termin und legt keinen Preis fest. Die Arbeit beginnt, wenn beide Seiten ein Angebot unterzeichnen.",
        "Auf dieser Website genannte Beträge, Zeitpläne oder Verfügbarkeiten sind Anhaltspunkte und hängen vom jeweiligen Projekt ab."] },
      { heading: "Richtigkeit", body: [
        "Wir halten diese Website aktuell, doch Referenzen, Leistungsbeschreibungen und Verfügbarkeiten ändern sich. Wir gewährleisten nicht, dass zum Zeitpunkt Ihres Besuchs alles vollständig oder aktuell ist."] },
      { heading: "Externe Links", body: [
        "Wenn wir auf andere Websites verweisen — soziale Netzwerke, Kunden, Partner — haben wir keinen Einfluss auf deren Inhalte und sind dafür nicht verantwortlich."] },
      { heading: "Haftung", body: [
        "Wir stellen diese Website wie besehen bereit. Soweit gesetzlich zulässig, haften wir nicht für Schäden aus ihrer Nutzung oder Nichterreichbarkeit.",
        "Die Haftung für Tod, Körperverletzung oder Arglist bleibt unberührt."] },
      { heading: "Anwendbares Recht", body: [
        "Diese Bedingungen unterliegen dem Recht der Arabischen Republik Ägypten; für Streitigkeiten hierüber sind deren Gerichte zuständig."] },
    ],
  },
  cookies: {
    eyebrow: "Cookies",
    title: "Cookie-Richtlinie",
    updated: "Zuletzt aktualisiert",
    intro:
      "Diese Seite führt jedes Cookie und jede vergleichbare Technologie auf, die diese Website verwendet, wozu sie dienen und wie sich die optionalen abschalten lassen.",
    sections: [
      { heading: "Was wir selbst setzen", body: [
        "Ihre Sprachwahl steckt in der Adresse, die Sie lesen — /de für Deutsch, ohne Präfix für Englisch — nicht in einem Cookie.",
        "Das Kontaktformular vergibt jedem Besucher ein kurzlebiges Token, damit wir eine Person von einem automatisierten Skript unterscheiden können. Es enthält nichts über Sie und läuft schnell ab.",
        "Ihre Antwort auf den Einwilligungsbanner wird lokal in Ihrem Browser gespeichert, damit die Frage nicht bei jedem Besuch erneut erscheint."] },
      { heading: "Google Analytics", body: [
        "Mess-ID G-G38ZL9GYXF. Setzt _ga und _ga_*, um Besuche zu zählen und wiederkehrende von neuen Leserinnen und Lesern zu unterscheiden. Laufzeit bis zu zwei Jahre.",
        "Das zeigt uns, welche Arbeiten und Artikel tatsächlich gelesen werden. Es identifiziert Sie nicht namentlich."] },
      { heading: "Meta-Pixel", body: [
        "Pixel-ID 780471777947136. Setzt _fbp und liest den Parameter _fbc, wenn Sie über eine Meta-Anzeige kommen. Laufzeit etwa drei Monate.",
        "Das misst, ob unsere Werbung Interessierte erreicht. Sind Sie im selben Browser bei Facebook oder Instagram angemeldet, kann Meta den Besuch diesem Konto zuordnen."] },
      { heading: "Abschalten", body: [
        "In der EU und im Vereinigten Königreich wird nichts vor Ihrer Zustimmung ausgelöst; Ablehnen genügt.",
        "Jeder Browser kann Cookies blockieren oder löschen — suchen Sie in den Einstellungen nach Datenschutz. Das Blockieren hindert diese Website nicht am Funktionieren: Nichts hier benötigt ein Cookie.",
        "Google bietet ein Deaktivierungs-Add-on für Analytics unter tools.google.com/dlpage/gaoptout. Die Werbeeinstellungen von Meta finden Sie in Ihren Kontoeinstellungen."] },
      { heading: "Änderungen", body: [
        "Fügen wir ein Tag hinzu oder entfernen es, ändert sich diese Seite mit und das Datum oben rückt vor."] },
    ],
  },
};

const ES: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Privacidad",
    title: "Política de privacidad",
    updated: "Última actualización",
    intro:
      "Esta política explica qué recoge Global Untold Story cuando usas globaluntoldstory.com, por qué, y qué puedes pedirnos al respecto.",
    sections: [
      { heading: "Quiénes somos", body: [
        "Global Untold Story es un estudio de producción de cine, vídeo y contenido con oficinas en Egyptian Media Production City, Business Bay (Dubái) y Yeda. Somos los responsables del tratamiento de los datos descritos aquí.",
        "Para cualquier asunto relacionado con esta política, escribe a bendary@globaluntoldstory.com."] },
      { heading: "Lo que nos facilitas", body: [
        "El formulario de contacto pide tu nombre, correo electrónico, teléfono, el servicio que te interesa y tu mensaje. Solo el nombre, el correo y el mensaje son obligatorios.",
        "Los usamos para responderte y planificar el trabajo que consultas. No los vendemos ni los usamos para publicidad que no hayas solicitado.",
        "Tu consulta nos llega por correo y se guarda en nuestro sistema de proyectos para retomar la conversación. Conservamos las consultas tres años y después las eliminamos."] },
      { heading: "Lo que se recoge automáticamente", body: [
        "Usamos Google Analytics 4 para saber qué páginas se leen y cómo llega la gente. Registra páginas vistas, una ubicación aproximada por país, dispositivo, navegador y sitio de procedencia. Google recibe estos datos como encargado del tratamiento.",
        "Usamos el píxel de Meta para medir si nuestra publicidad llega al público adecuado. Registra páginas vistas y puede vincularlas a una cuenta de Meta si has iniciado sesión en ella.",
        "En la Unión Europea y el Reino Unido ninguno se activa antes de tu consentimiento; en otros lugares se cargan con la página. Puedes rechazarlos en cualquier momento."] },
      { heading: "Quién más los ve", body: [
        "Vercel aloja este sitio y procesa las peticiones de tu navegador, incluida tu dirección IP.",
        "Hostinger aloja nuestro sistema de contenidos, que guarda los mensajes del formulario, y envía el correo de aviso.",
        "Google y Meta reciben los datos descritos arriba. Google Workspace gestiona nuestro correo.",
        "Esa es la lista completa. No compartimos tus datos con nadie más salvo obligación legal."] },
      { heading: "Dónde se tratan", body: [
        "Nuestras oficinas están en Egipto, Emiratos y Arabia Saudí, y los servicios anteriores operan internacionalmente, por lo que tus datos se tratan fuera de tu país. Google, Meta y Vercel aplican cláusulas contractuales tipo para las transferencias fuera de la UE y el Reino Unido."] },
      { heading: "Lo que puedes pedir", body: [
        "Puedes pedir una copia de lo que tenemos, su rectificación o su supresión. Puedes oponerte al seguimiento analítico y publicitario y retirar tu consentimiento cuando quieras.",
        "Escribe a bendary@globaluntoldstory.com y responderemos en treinta días. Si estás en la UE o el Reino Unido y no quedas conforme, puedes reclamar ante tu autoridad nacional de protección de datos."] },
      { heading: "Menores", body: [
        "Este sitio se dirige a quienes encargan trabajos de producción. No está dirigido a menores y no recogemos conscientemente datos de personas menores de dieciséis años."] },
      { heading: "Cambios", body: [
        "Cuando esta política cambie, actualizaremos la fecha de arriba. Los cambios importantes se anunciarán en el propio sitio."] },
    ],
  },
  terms: {
    eyebrow: "Condiciones",
    title: "Condiciones de uso",
    updated: "Última actualización",
    intro:
      "Estas condiciones cubren tu uso de globaluntoldstory.com. No cubren los trabajos de producción, regidos por el contrato firmado para cada proyecto.",
    sections: [
      { heading: "Uso de este sitio", body: [
        "Puedes leer este sitio y compartir sus enlaces con cualquier fin lícito.",
        "No puedes copiarlo por completo, extraerlo a un ritmo que lo degrade para los demás, intentar acceder a partes para las que no tienes permiso, ni presentarlo como obra propia."] },
      { heading: "Los trabajos mostrados", body: [
        "Las películas, fotografías, campañas y textos de este sitio pertenecen a Global Untold Story o a los clientes que los encargaron. Los nombres y logotipos de los clientes son suyos y aparecen aquí para identificar trabajos que produjimos.",
        "Nada de esto te concede licencia para reutilizarlos. Si quieres hacerlo, pregúntanos."] },
      { heading: "Una consulta no es un contrato", body: [
        "Enviar el formulario inicia una conversación. No crea un acuerdo, no reserva fechas ni fija precios. El trabajo empieza cuando ambas partes firman una propuesta.",
        "Las cifras, plazos o disponibilidades mencionados en este sitio son orientativos y dependen de las particularidades de cada proyecto."] },
      { heading: "Exactitud", body: [
        "Mantenemos el sitio al día, pero los trabajos, las descripciones de servicios y la disponibilidad cambian. No garantizamos que todo esté completo o actualizado en el momento en que lo leas."] },
      { heading: "Enlaces externos", body: [
        "Cuando enlazamos a otros sitios —redes sociales, clientes, socios— no controlamos lo que publican ni somos responsables de ello."] },
      { heading: "Responsabilidad", body: [
        "Ofrecemos este sitio tal cual. En la medida en que lo permita la ley, no respondemos por pérdidas derivadas de su uso o de no poder acceder a él.",
        "Nada de lo anterior limita la responsabilidad por fallecimiento, daños personales o fraude."] },
      { heading: "Ley aplicable", body: [
        "Estas condiciones se rigen por las leyes de la República Árabe de Egipto, y sus tribunales son competentes para los litigios relacionados con ellas."] },
    ],
  },
  cookies: {
    eyebrow: "Cookies",
    title: "Política de cookies",
    updated: "Última actualización",
    intro:
      "Esta página enumera todas las cookies y tecnologías similares que usa este sitio, para qué sirve cada una y cómo desactivar las opcionales.",
    sections: [
      { heading: "Lo que ponemos nosotros", body: [
        "Tu elección de idioma va en la dirección que lees —/es para español, sin prefijo para inglés— y no en una cookie.",
        "El formulario de contacto emite un testigo de corta duración a cada visitante para distinguir a una persona de un script automatizado. No contiene nada sobre ti y caduca enseguida.",
        "Tu respuesta al aviso de consentimiento se guarda localmente en tu navegador para no volver a preguntarte en cada visita."] },
      { heading: "Google Analytics", body: [
        "ID de medición G-G38ZL9GYXF. Pone _ga y _ga_* para contar visitas y distinguir a quien vuelve de quien llega por primera vez. Duran hasta dos años.",
        "Esto nos dice qué trabajos y artículos se leen de verdad. No te identifica por tu nombre."] },
      { heading: "Píxel de Meta", body: [
        "ID de píxel 780471777947136. Pone _fbp y lee el parámetro _fbc cuando llegas desde un anuncio de Meta. Dura unos tres meses.",
        "Mide si nuestra publicidad llega a personas interesadas. Si tienes la sesión iniciada en Facebook o Instagram en el mismo navegador, Meta puede vincular la visita a esa cuenta."] },
      { heading: "Cómo desactivarlas", body: [
        "En la Unión Europea y el Reino Unido no se activa nada antes de tu consentimiento; basta con rechazar.",
        "Cualquier navegador puede bloquear o borrar cookies: busca Privacidad en sus ajustes. Bloquearlas no impide que el sitio funcione; nada aquí necesita una cookie.",
        "Google publica un complemento de inhabilitación para Analytics en tools.google.com/dlpage/gaoptout. Los controles publicitarios de Meta están en los ajustes de tu cuenta."] },
      { heading: "Cambios", body: [
        "Si añadimos o quitamos una etiqueta, esta página cambia con ella y la fecha de arriba avanza."] },
    ],
  },
};

const IT: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Privacy",
    title: "Informativa sulla privacy",
    updated: "Ultimo aggiornamento",
    intro:
      "Questa informativa spiega che cosa raccoglie Global Untold Story quando usi globaluntoldstory.com, perché, e che cosa puoi chiederci.",
    sections: [
      { heading: "Chi siamo", body: [
        "Global Untold Story è uno studio di produzione di film, video e contenuti con sedi presso l\u2019Egyptian Media Production City, a Business Bay (Dubai) e a Gedda. Siamo il titolare del trattamento dei dati descritti qui.",
        "Per qualsiasi questione relativa a questa informativa, scrivi a bendary@globaluntoldstory.com."] },
      { heading: "Ciò che ci fornisci", body: [
        "Il modulo di contatto chiede nome, indirizzo e-mail, telefono, il servizio che ti interessa e il tuo messaggio. Solo nome, e-mail e messaggio sono obbligatori.",
        "Li usiamo per risponderti e per pianificare il lavoro di cui ci scrivi. Non li vendiamo e non li usiamo per comunicazioni commerciali che non hai richiesto.",
        "La tua richiesta ci arriva via e-mail e viene conservata nel nostro sistema progetti per riprendere la conversazione. Conserviamo le richieste per tre anni, poi le cancelliamo."] },
      { heading: "Ciò che viene raccolto automaticamente", body: [
        "Usiamo Google Analytics 4 per capire quali pagine vengono lette e come si arriva qui. Registra le pagine viste, una posizione approssimativa a livello di Paese, dispositivo, browser e sito di provenienza. Google riceve questi dati in qualità di responsabile.",
        "Usiamo il pixel di Meta per misurare se la nostra pubblicità raggiunge il pubblico giusto. Registra le pagine viste e può collegarle a un account Meta se hai effettuato l\u2019accesso.",
        "Nell\u2019Unione europea e nel Regno Unito nessuno dei due si attiva prima del tuo consenso; altrove si caricano con la pagina. Puoi rifiutare in qualsiasi momento."] },
      { heading: "Chi altro li vede", body: [
        "Vercel ospita questo sito ed elabora le richieste del tuo browser, incluso il tuo indirizzo IP.",
        "Hostinger ospita il nostro sistema di contenuti, che conserva i messaggi del modulo, e inoltra l\u2019e-mail di notifica.",
        "Google e Meta ricevono i dati descritti sopra. Google Workspace gestisce la nostra posta.",
        "Questo è l\u2019elenco completo. Non condividiamo i tuoi dati con nessun altro, salvo obbligo di legge."] },
      { heading: "Dove vengono trattati", body: [
        "Le nostre sedi sono in Egitto, negli Emirati e in Arabia Saudita, e i servizi sopra indicati operano a livello internazionale: i tuoi dati sono quindi trattati fuori dal tuo Paese. Google, Meta e Vercel utilizzano clausole contrattuali standard per i trasferimenti fuori dall\u2019UE e dal Regno Unito."] },
      { heading: "Che cosa puoi chiedere", body: [
        "Puoi chiedere una copia di ciò che conserviamo, la sua rettifica o la sua cancellazione. Puoi opporti al tracciamento analitico e pubblicitario e revocare il consenso in qualsiasi momento.",
        "Scrivi a bendary@globaluntoldstory.com: risponderemo entro trenta giorni. Se ti trovi nell\u2019UE o nel Regno Unito e non sei soddisfatto, puoi rivolgerti all\u2019autorità nazionale per la protezione dei dati."] },
      { heading: "Minori", body: [
        "Questo sito si rivolge a chi commissiona lavori di produzione. Non è destinato ai minori e non raccogliamo consapevolmente dati di persone di età inferiore ai sedici anni."] },
      { heading: "Modifiche", body: [
        "Quando questa informativa cambia, aggiorniamo la data in alto. Le modifiche sostanziali saranno annunciate sul sito."] },
    ],
  },
  terms: {
    eyebrow: "Condizioni",
    title: "Condizioni d\u2019uso",
    updated: "Ultimo aggiornamento",
    intro:
      "Queste condizioni riguardano l\u2019uso di globaluntoldstory.com. Non riguardano i lavori di produzione, disciplinati dal contratto firmato per ciascun progetto.",
    sections: [
      { heading: "Uso di questo sito", body: [
        "Puoi leggere questo sito e condividerne i link per qualsiasi finalità lecita.",
        "Non puoi copiarlo integralmente, estrarne i contenuti a un ritmo che ne degradi l\u2019accesso per gli altri, tentare di raggiungere parti a cui non ti è stato dato accesso, né presentarlo come lavoro tuo."] },
      { heading: "I lavori mostrati", body: [
        "Film, fotografie, campagne e testi presenti su questo sito appartengono a Global Untold Story o ai clienti che li hanno commissionati. Nomi e loghi dei clienti appartengono a loro e compaiono qui per identificare lavori da noi prodotti.",
        "Nulla di quanto qui contenuto ti concede una licenza di riutilizzo. Se ti interessa, chiedicelo."] },
      { heading: "Una richiesta non è un contratto", body: [
        "Inviare il modulo apre una conversazione. Non crea un accordo, non riserva una data e non fissa un prezzo. Il lavoro inizia quando entrambe le parti firmano una proposta.",
        "Importi, tempistiche o disponibilità citati su questo sito sono indicativi e dipendono dalle specificità del progetto."] },
      { heading: "Accuratezza", body: [
        "Manteniamo il sito aggiornato, ma portfolio, descrizioni dei servizi e disponibilità cambiano. Non garantiamo che tutto sia completo o aggiornato nel momento in cui lo leggi."] },
      { heading: "Link esterni", body: [
        "Quando rimandiamo ad altri siti — piattaforme social, clienti, partner — non controlliamo ciò che pubblicano e non ne siamo responsabili."] },
      { heading: "Responsabilità", body: [
        "Forniamo questo sito così com\u2019è. Nei limiti consentiti dalla legge, non rispondiamo di perdite derivanti dal suo utilizzo o dall\u2019impossibilità di accedervi.",
        "Nulla di quanto precede limita la responsabilità per morte, lesioni personali o dolo."] },
      { heading: "Legge applicabile", body: [
        "Queste condizioni sono regolate dalla legge della Repubblica Araba d\u2019Egitto, e i suoi tribunali sono competenti per le controversie che ne derivano."] },
    ],
  },
  cookies: {
    eyebrow: "Cookie",
    title: "Informativa sui cookie",
    updated: "Ultimo aggiornamento",
    intro:
      "Questa pagina elenca ogni cookie e tecnologia analoga usati dal sito, a che cosa serve ciascuno e come disattivare quelli facoltativi.",
    sections: [
      { heading: "Ciò che impostiamo noi", body: [
        "La scelta della lingua sta nell\u2019indirizzo che stai leggendo — /it per l\u2019italiano, senza prefisso per l\u2019inglese — non in un cookie.",
        "Il modulo di contatto rilascia a ogni visitatore un token di breve durata, per distinguere una persona da uno script automatico. Non contiene nulla che ti riguardi e scade rapidamente.",
        "La tua risposta al banner di consenso resta salvata localmente nel browser, per non ripeterti la domanda a ogni visita."] },
      { heading: "Google Analytics", body: [
        "ID di misurazione G-G38ZL9GYXF. Imposta _ga e _ga_* per contare le visite e distinguere un lettore che torna da uno nuovo. Durata fino a due anni.",
        "Ci dice quali lavori e quali articoli vengono davvero letti. Non ti identifica per nome."] },
      { heading: "Pixel di Meta", body: [
        "ID pixel 780471777947136. Imposta _fbp e legge il parametro _fbc quando arrivi da un annuncio Meta. Dura circa tre mesi.",
        "Misura se la nostra pubblicità raggiunge persone interessate. Se hai effettuato l\u2019accesso a Facebook o Instagram nello stesso browser, Meta può collegare la visita a quell\u2019account."] },
      { heading: "Come disattivarli", body: [
        "Nell\u2019Unione europea e nel Regno Unito nulla si attiva prima del tuo consenso: basta rifiutare.",
        "Ogni browser può bloccare o eliminare i cookie — cerca Privacy nelle impostazioni. Bloccarli non impedisce al sito di funzionare: nulla qui ha bisogno di un cookie.",
        "Google pubblica un componente aggiuntivo per disattivare Analytics su tools.google.com/dlpage/gaoptout. I controlli pubblicitari di Meta sono nelle impostazioni del tuo account."] },
      { heading: "Modifiche", body: [
        "Se aggiungiamo o rimuoviamo un tag, questa pagina cambia di conseguenza e la data in alto avanza."] },
    ],
  },
};

const PT: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Privacidade",
    title: "Política de privacidade",
    updated: "Última atualização",
    intro:
      "Esta política explica o que a Global Untold Story recolhe quando utiliza globaluntoldstory.com, porquê, e o que nos pode pedir.",
    sections: [
      { heading: "Quem somos", body: [
        "A Global Untold Story é um estúdio de produção de cinema, vídeo e conteúdo, com escritórios na Egyptian Media Production City, em Business Bay (Dubai) e em Jidá. Somos os responsáveis pelo tratamento dos dados aqui descritos.",
        "Para qualquer questão sobre esta política, escreva para bendary@globaluntoldstory.com."] },
      { heading: "O que nos fornece", body: [
        "O formulário de contacto pede o seu nome, e-mail, telefone, o serviço que lhe interessa e a sua mensagem. Apenas o nome, o e-mail e a mensagem são obrigatórios.",
        "Usamo-los para lhe responder e planear o trabalho sobre o qual nos escreve. Não os vendemos nem os usamos para comunicações comerciais que não pediu.",
        "O seu pedido chega-nos por e-mail e fica guardado no nosso sistema de projetos para retomarmos a conversa. Conservamos os pedidos durante três anos e depois eliminamo-los."] },
      { heading: "O que é recolhido automaticamente", body: [
        "Usamos o Google Analytics 4 para perceber que páginas são lidas e como se chega até aqui. Regista páginas vistas, uma localização aproximada ao nível do país, dispositivo, navegador e site de proveniência. A Google recebe estes dados na qualidade de subcontratante.",
        "Usamos o pixel da Meta para medir se a nossa publicidade chega ao público certo. Regista páginas vistas e pode associá-las a uma conta Meta se tiver sessão iniciada.",
        "Na União Europeia e no Reino Unido nenhum deles é acionado antes do seu consentimento; noutros locais carregam com a página. Pode recusar a qualquer momento."] },
      { heading: "Quem mais os vê", body: [
        "A Vercel aloja este site e processa os pedidos do seu navegador, incluindo o seu endereço IP.",
        "A Hostinger aloja o nosso sistema de conteúdos, que guarda as mensagens do formulário, e encaminha o e-mail de notificação.",
        "A Google e a Meta recebem os dados descritos acima. O Google Workspace assegura o nosso correio eletrónico.",
        "Esta é a lista completa. Não partilhamos os seus dados com mais ninguém, salvo imposição legal."] },
      { heading: "Onde são tratados", body: [
        "Os nossos escritórios ficam no Egito, nos Emirados e na Arábia Saudita, e os serviços acima operam internacionalmente, pelo que os seus dados são tratados fora do seu país. A Google, a Meta e a Vercel aplicam cláusulas contratuais-tipo às transferências para fora da UE e do Reino Unido."] },
      { heading: "O que pode pedir", body: [
        "Pode pedir uma cópia do que temos, a sua retificação ou o seu apagamento. Pode opor-se ao rastreio analítico e publicitário e retirar o consentimento quando quiser.",
        "Escreva para bendary@globaluntoldstory.com e responderemos em trinta dias. Se estiver na UE ou no Reino Unido e não ficar satisfeito, pode apresentar queixa à autoridade nacional de proteção de dados."] },
      { heading: "Menores", body: [
        "Este site destina-se a quem contrata trabalhos de produção. Não se dirige a crianças e não recolhemos conscientemente dados de pessoas com menos de dezasseis anos."] },
      { heading: "Alterações", body: [
        "Quando esta política mudar, atualizamos a data no topo. Alterações relevantes serão anunciadas no próprio site."] },
    ],
  },
  terms: {
    eyebrow: "Termos",
    title: "Termos de utilização",
    updated: "Última atualização",
    intro:
      "Estes termos abrangem a sua utilização de globaluntoldstory.com. Não abrangem os trabalhos de produção, regidos pelo contrato assinado para cada projeto.",
    sections: [
      { heading: "Utilizar este site", body: [
        "Pode ler este site e partilhar as suas ligações para qualquer fim lícito.",
        "Não pode copiá-lo integralmente, extraí-lo a um ritmo que o degrade para os outros, tentar aceder a partes para as quais não lhe foi dado acesso, nem apresentá-lo como trabalho seu."] },
      { heading: "Os trabalhos apresentados", body: [
        "Os filmes, fotografias, campanhas e textos deste site pertencem à Global Untold Story ou aos clientes que os encomendaram. Os nomes e logótipos dos clientes pertencem-lhes e surgem aqui para identificar trabalhos que produzimos.",
        "Nada aqui lhe concede licença para reutilizar qualquer um deles. Se quiser, pergunte-nos."] },
      { heading: "Um pedido não é um contrato", body: [
        "Enviar o formulário inicia uma conversa. Não cria um acordo, não reserva datas nem fixa preços. O trabalho começa quando ambas as partes assinam uma proposta.",
        "Valores, prazos ou disponibilidades referidos neste site são indicativos e dependem das especificidades de cada projeto."] },
      { heading: "Rigor", body: [
        "Mantemos o site atualizado, mas os trabalhos, as descrições de serviços e a disponibilidade mudam. Não garantimos que tudo esteja completo ou atualizado no momento em que o lê."] },
      { heading: "Ligações externas", body: [
        "Quando ligamos a outros sites — redes sociais, clientes, parceiros — não controlamos o que publicam nem somos responsáveis por isso."] },
      { heading: "Responsabilidade", body: [
        "Disponibilizamos este site tal como está. Na medida do permitido por lei, não respondemos por perdas decorrentes da sua utilização ou da impossibilidade de lhe aceder.",
        "Nada do exposto limita a responsabilidade por morte, danos pessoais ou dolo."] },
      { heading: "Lei aplicável", body: [
        "Estes termos regem-se pelas leis da República Árabe do Egito, sendo os seus tribunais competentes para os litígios que deles resultem."] },
    ],
  },
  cookies: {
    eyebrow: "Cookies",
    title: "Política de cookies",
    updated: "Última atualização",
    intro:
      "Esta página enumera todos os cookies e tecnologias semelhantes usados pelo site, para que serve cada um e como desativar os opcionais.",
    sections: [
      { heading: "O que definimos nós", body: [
        "A sua escolha de idioma está no endereço que está a ler — /pt para português, sem prefixo para inglês — e não num cookie.",
        "O formulário de contacto emite a cada visitante um token de curta duração, para distinguirmos uma pessoa de um script automático. Não contém nada sobre si e expira rapidamente.",
        "A sua resposta ao aviso de consentimento fica guardada localmente no navegador, para não voltarmos a perguntar em cada visita."] },
      { heading: "Google Analytics", body: [
        "ID de medição G-G38ZL9GYXF. Define _ga e _ga_* para contar visitas e distinguir quem regressa de quem chega pela primeira vez. Duram até dois anos.",
        "Isto diz-nos que trabalhos e que artigos são realmente lidos. Não o identifica pelo nome."] },
      { heading: "Pixel da Meta", body: [
        "ID do pixel 780471777947136. Define _fbp e lê o parâmetro _fbc quando chega através de um anúncio da Meta. Dura cerca de três meses.",
        "Mede se a nossa publicidade chega a pessoas interessadas. Se tiver sessão iniciada no Facebook ou no Instagram no mesmo navegador, a Meta pode associar a visita a essa conta."] },
      { heading: "Como desativá-los", body: [
        "Na União Europeia e no Reino Unido nada é acionado antes do seu consentimento: basta recusar.",
        "Qualquer navegador pode bloquear ou apagar cookies — procure Privacidade nas definições. Bloqueá-los não impede o site de funcionar: nada aqui precisa de um cookie.",
        "A Google publica um suplemento de desativação do Analytics em tools.google.com/dlpage/gaoptout. Os controlos publicitários da Meta estão nas definições da sua conta."] },
      { heading: "Alterações", body: [
        "Se acrescentarmos ou removermos uma etiqueta, esta página muda com ela e a data no topo avança."] },
    ],
  },
};

const BY_LOCALE: Partial<Record<Locale, Record<LegalKey, LegalDoc>>> = {
  en: EN,
  ar: AR,
  fr: FR,
  de: DE,
  es: ES,
  it: IT,
  pt: PT,
};

export function legalDoc(key: LegalKey, locale: string): LegalDoc {
  return (BY_LOCALE[locale as Locale] ?? BY_LOCALE[DEFAULT_LOCALE]!)[key];
}

export function hasTranslation(locale: string): boolean {
  return Boolean(BY_LOCALE[locale as Locale]);
}
