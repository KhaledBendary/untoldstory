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

const BY_LOCALE: Partial<Record<Locale, Record<LegalKey, LegalDoc>>> = {
  en: EN,
  ar: AR,
  fr: FR,
};

export function legalDoc(key: LegalKey, locale: string): LegalDoc {
  return (BY_LOCALE[locale as Locale] ?? BY_LOCALE[DEFAULT_LOCALE]!)[key];
}

export function hasTranslation(locale: string): boolean {
  return Boolean(BY_LOCALE[locale as Locale]);
}
