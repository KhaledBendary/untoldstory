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
 * All fourteen locales are written. The fallback stays because adding a
 * language to LOCALE_CODES without adding it here would otherwise break the
 * build rather than degrade to English, and `hasTranslation` still drives the
 * notice on the page.
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

const TR: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Gizlilik",
    title: "Gizlilik Politikası",
    updated: "Son güncelleme",
    intro:
      "Bu politika, globaluntoldstory.com kullanırken Global Untold Story\u2019nin neleri topladığını, nedenini ve bizden neler isteyebileceğinizi açıklar.",
    sections: [
      { heading: "Biz kimiz", body: [
        "Global Untold Story; Egyptian Media Production City, Dubai Business Bay ve Cidde\u2019de ofisleri bulunan bir film, video ve içerik prodüksiyon stüdyosudur. Burada tanımlanan kişisel verilerin sorumlusu biziz.",
        "Bu politikaya ilişkin her konu için bendary@globaluntoldstory.com adresine yazın."] },
      { heading: "Bize verdikleriniz", body: [
        "İletişim formu adınızı, e-posta adresinizi, telefonunuzu, ilgilendiğiniz hizmeti ve mesajınızı ister. Yalnızca ad, e-posta ve mesaj zorunludur.",
        "Bunları size yanıt vermek ve sorduğunuz işi planlamak için kullanırız. Satmayız ve istemediğiniz pazarlama için kullanmayız.",
        "Talebiniz bize e-posta ile ulaşır ve görüşmeyi sürdürebilmemiz için proje sistemimizde saklanır. Talepleri üç yıl saklar, sonra sileriz."] },
      { heading: "Otomatik toplananlar", body: [
        "Hangi sayfaların okunduğunu ve buraya nasıl gelindiğini anlamak için Google Analytics 4 kullanıyoruz. Görüntülenen sayfaları, ülke düzeyinde yaklaşık konumu, cihazı, tarayıcıyı ve yönlendiren siteyi kaydeder. Google bu verileri veri işleyen sıfatıyla alır.",
        "Reklamlarımızın doğru kitlelere ulaşıp ulaşmadığını ölçmek için Meta Pikselini kullanıyoruz. Sayfa görüntülemelerini kaydeder ve oturumunuz açıksa bunları bir Meta hesabıyla ilişkilendirebilir.",
        "Avrupa Birliği ve Birleşik Krallık\u2019ta hiçbiri onayınız olmadan çalışmaz; diğer yerlerde sayfayla birlikte yüklenir. İstediğiniz zaman reddedebilirsiniz."] },
      { heading: "Başka kimler görüyor", body: [
        "Vercel bu siteyi barındırır ve IP adresiniz dahil tarayıcınızın isteklerini işler.",
        "Hostinger, form mesajlarını saklayan içerik sistemimizi barındırır ve bildirim e-postasını iletir.",
        "Google ve Meta yukarıda anlatılan verileri alır. E-postamızı Google Workspace taşır.",
        "Liste bundan ibarettir. Yasa gerektirmedikçe verilerinizi başka kimseyle paylaşmayız."] },
      { heading: "Nerede işleniyor", body: [
        "Ofislerimiz Mısır, BAE ve Suudi Arabistan\u2019dadır ve yukarıdaki hizmetler uluslararası çalışır; dolayısıyla verileriniz ülkenizin dışında işlenir. Google, Meta ve Vercel, AB ve Birleşik Krallık dışına aktarımlarda standart sözleşme hükümlerini kullanır."] },
      { heading: "Neler isteyebilirsiniz", body: [
        "Elimizdekilerin bir kopyasını, düzeltilmesini veya silinmesini isteyebilirsiniz. Analiz ve reklam takibine itiraz edebilir, onayınızı istediğiniz zaman geri çekebilirsiniz.",
        "bendary@globaluntoldstory.com adresine yazın; otuz gün içinde yanıtlarız. AB veya Birleşik Krallık\u2019taysanız ve sonuçtan memnun kalmazsanız ulusal veri koruma kurumunuza başvurabilirsiniz."] },
      { heading: "Çocuklar", body: [
        "Bu site prodüksiyon işi verenlere yöneliktir. Çocuklara yönelik değildir ve on altı yaşından küçüklerden bilerek veri toplamayız."] },
      { heading: "Değişiklikler", body: [
        "Bu politika değiştiğinde yukarıdaki tarihi güncelleriz. Önemli değişiklikler sitede duyurulur."] },
    ],
  },
  terms: {
    eyebrow: "Koşullar",
    title: "Kullanım Koşulları",
    updated: "Son güncelleme",
    intro:
      "Bu koşullar globaluntoldstory.com kullanımınızı kapsar. Prodüksiyon işlerini kapsamaz; onlar her proje için imzalanan sözleşmeye tabidir.",
    sections: [
      { heading: "Bu siteyi kullanmak", body: [
        "Bu siteyi okuyabilir, bağlantılarını hukuka uygun her amaçla paylaşabilirsiniz.",
        "Siteyi bütünüyle kopyalayamaz, başkaları için erişimi bozacak hızda veri çekemez, erişim verilmemiş bölümlere ulaşmaya çalışamaz ve kendi işiniz gibi sunamazsınız."] },
      { heading: "Burada gösterilen işler", body: [
        "Bu sitedeki filmler, fotoğraflar, kampanyalar ve metinler Global Untold Story\u2019ye veya bunları sipariş eden müşterilere aittir. Müşteri adları ve logoları onlara aittir ve ürettiğimiz işleri tanımlamak için burada yer alır.",
        "Buradaki hiçbir şey size yeniden kullanım lisansı vermez. İsterseniz bize sorun."] },
      { heading: "Talep sözleşme değildir", body: [
        "Formu göndermek bir görüşme başlatır. Anlaşma oluşturmaz, tarih ayırmaz, fiyat sabitlemez. İş, iki taraf da bir teklifi imzaladığında başlar.",
        "Bu sitede geçen rakamlar, süreler veya müsaitlik bilgileri yol göstericidir ve projenin ayrıntılarına bağlıdır."] },
      { heading: "Doğruluk", body: [
        "Siteyi güncel tutuyoruz; ancak işler, hizmet açıklamaları ve müsaitlik değişir. Okuduğunuz anda her şeyin eksiksiz veya güncel olduğunu garanti etmiyoruz."] },
      { heading: "Dış bağlantılar", body: [
        "Başka sitelere bağlantı verdiğimizde — sosyal platformlar, müşteriler, iş ortakları — yayımladıklarını denetlemeyiz ve bunlardan sorumlu değiliz."] },
      { heading: "Sorumluluk", body: [
        "Bu siteyi olduğu gibi sunuyoruz. Yasanın izin verdiği ölçüde, kullanımından veya erişilememesinden doğan zararlardan sorumlu değiliz.",
        "Yukarıdakiler ölüm, bedensel zarar veya hile hâlindeki sorumluluğu sınırlamaz."] },
      { heading: "Uygulanacak hukuk", body: [
        "Bu koşullar Mısır Arap Cumhuriyeti hukukuna tabidir ve bunlara ilişkin uyuşmazlıklarda Mısır mahkemeleri yetkilidir."] },
    ],
  },
  cookies: {
    eyebrow: "Çerezler",
    title: "Çerez Politikası",
    updated: "Son güncelleme",
    intro:
      "Bu sayfa sitenin kullandığı her çerezi ve benzeri teknolojiyi, her birinin ne işe yaradığını ve isteğe bağlı olanların nasıl kapatılacağını listeler.",
    sections: [
      { heading: "Kendi koyduklarımız", body: [
        "Dil tercihiniz okuduğunuz adreste taşınır — Türkçe için /tr, İngilizce için ön ek yok — çerezde değil.",
        "İletişim formu her ziyaretçiye kısa ömürlü bir jeton verir; böylece formu dolduran kişiyi otomatik bir betikten ayırırız. Hakkınızda hiçbir şey taşımaz ve hızla geçersizleşir.",
        "Onay bandına verdiğiniz yanıt tarayıcınızda yerel olarak saklanır; her ziyarette yeniden sormamak için."] },
      { heading: "Google Analytics", body: [
        "Ölçüm kimliği G-G38ZL9GYXF. Ziyaretleri saymak ve geri gelen okuru yeniden ayırmak için _ga ve _ga_* koyar. En fazla iki yıl kalır.",
        "Bu bize hangi işlerin ve yazıların gerçekten okunduğunu söyler. Sizi adınızla tanımlamaz."] },
      { heading: "Meta Pikseli", body: [
        "Piksel kimliği 780471777947136. _fbp koyar ve bir Meta reklamından geldiğinizde _fbc parametresini okur. Yaklaşık üç ay kalır.",
        "Reklamlarımızın ilgilenen kişilere ulaşıp ulaşmadığını ölçer. Aynı tarayıcıda Facebook veya Instagram oturumunuz açıksa Meta ziyareti o hesapla ilişkilendirebilir."] },
      { heading: "Nasıl kapatılır", body: [
        "Avrupa Birliği ve Birleşik Krallık\u2019ta onayınız olmadan hiçbiri çalışmaz; reddetmeniz yeterlidir.",
        "Her tarayıcı çerezleri engelleyebilir veya silebilir — ayarlarda Gizlilik bölümüne bakın. Engellemek sitenin çalışmasını durdurmaz; buradaki hiçbir şey çereze ihtiyaç duymaz.",
        "Google, Analytics için tools.google.com/dlpage/gaoptout adresinde bir devre dışı bırakma eklentisi yayımlar. Meta\u2019nın reklam denetimleri hesap ayarlarınızdadır."] },
      { heading: "Değişiklikler", body: [
        "Bir etiket ekler veya kaldırırsak bu sayfa da değişir ve yukarıdaki tarih ilerler."] },
    ],
  },
};

const RU: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Конфиденциальность",
    title: "Политика конфиденциальности",
    updated: "Последнее обновление",
    intro:
      "Эта политика объясняет, что собирает Global Untold Story при использовании globaluntoldstory.com, зачем и о чём вы можете нас попросить.",
    sections: [
      { heading: "Кто мы", body: [
        "Global Untold Story — студия производства фильмов, видео и контента с офисами в Egyptian Media Production City, Business Bay в Дубае и Джидде. Мы являемся оператором описанных здесь персональных данных.",
        "По любым вопросам этой политики пишите на bendary@globaluntoldstory.com."] },
      { heading: "Что вы сообщаете нам", body: [
        "Форма обратной связи запрашивает имя, адрес электронной почты, телефон, интересующую услугу и сообщение. Обязательны только имя, почта и сообщение.",
        "Мы используем их, чтобы ответить и спланировать работу, о которой вы пишете. Мы их не продаём и не используем для рассылок, о которых вы не просили.",
        "Ваш запрос приходит нам по почте и сохраняется в системе проектов, чтобы вернуться к разговору. Запросы храним три года, затем удаляем."] },
      { heading: "Что собирается автоматически", body: [
        "Мы используем Google Analytics 4, чтобы понимать, какие страницы читают и как на них попадают. Записываются просмотры страниц, примерное расположение на уровне страны, устройство, браузер и сайт-источник. Google получает эти данные как обработчик.",
        "Мы используем пиксель Meta, чтобы измерять, доходит ли наша реклама до нужной аудитории. Он записывает просмотры и может связать их с аккаунтом Meta, если вы в него вошли.",
        "В ЕС и Великобритании ни один из них не срабатывает до вашего согласия; в других местах они загружаются вместе со страницей. Вы можете отказаться в любой момент."] },
      { heading: "Кто ещё их видит", body: [
        "Vercel размещает этот сайт и обрабатывает запросы вашего браузера, включая IP-адрес.",
        "Hostinger размещает нашу систему управления контентом, где хранятся сообщения формы, и пересылает уведомление по почте.",
        "Google и Meta получают данные, описанные выше. Google Workspace обслуживает нашу электронную почту.",
        "Это полный список. Мы не передаём ваши данные никому другому, если этого не требует закон."] },
      { heading: "Где они обрабатываются", body: [
        "Наши офисы находятся в Египте, ОАЭ и Саудовской Аравии, а перечисленные сервисы работают по всему миру, поэтому данные обрабатываются за пределами вашей страны. Google, Meta и Vercel применяют стандартные договорные условия для передач за пределы ЕС и Великобритании."] },
      { heading: "О чём вы можете попросить", body: [
        "Вы можете запросить копию имеющихся у нас данных, их исправление или удаление. Вы можете возразить против аналитического и рекламного отслеживания и отозвать согласие в любое время.",
        "Напишите на bendary@globaluntoldstory.com — ответим в течение тридцати дней. Если вы в ЕС или Великобритании и ответ вас не устроил, вы можете обратиться в национальный орган по защите данных."] },
      { heading: "Дети", body: [
        "Этот сайт предназначен для тех, кто заказывает производство. Он не адресован детям, и мы сознательно не собираем данные лиц младше шестнадцати лет."] },
      { heading: "Изменения", body: [
        "При изменении политики мы обновляем дату вверху. О существенных изменениях сообщим на самом сайте."] },
    ],
  },
  terms: {
    eyebrow: "Условия",
    title: "Условия использования",
    updated: "Последнее обновление",
    intro:
      "Эти условия распространяются на использование globaluntoldstory.com. Они не распространяются на производственные работы — их регулирует договор, подписанный по конкретному проекту.",
    sections: [
      { heading: "Использование сайта", body: [
        "Вы можете читать этот сайт и делиться ссылками на него в любых законных целях.",
        "Нельзя копировать сайт целиком, выгружать его с частотой, ухудшающей доступ для других, пытаться попасть в разделы, доступ к которым вам не предоставлен, или выдавать его за свою работу."] },
      { heading: "Показанные работы", body: [
        "Фильмы, фотографии, кампании и тексты на этом сайте принадлежат Global Untold Story или заказчикам. Названия и логотипы клиентов принадлежат им и приведены здесь, чтобы обозначить произведённые нами работы.",
        "Ничто здесь не даёт вам лицензии на повторное использование. Если она нужна — спросите нас."] },
      { heading: "Запрос — не договор", body: [
        "Отправка формы начинает разговор. Она не создаёт соглашения, не резервирует дату и не фиксирует цену. Работа начинается, когда обе стороны подписывают предложение.",
        "Любые суммы, сроки или сведения о доступности на сайте носят ориентировочный характер и зависят от специфики проекта."] },
      { heading: "Точность", body: [
        "Мы поддерживаем сайт в актуальном состоянии, но портфолио, описания услуг и доступность меняются. Мы не гарантируем, что всё здесь полно и актуально в момент чтения."] },
      { heading: "Внешние ссылки", body: [
        "Когда мы ссылаемся на другие сайты — соцсети, клиентов, партнёров — мы не контролируем их содержимое и не отвечаем за него."] },
      { heading: "Ответственность", body: [
        "Мы предоставляем сайт как есть. В пределах, допускаемых законом, мы не отвечаем за убытки, возникшие из-за его использования или недоступности.",
        "Ничто из перечисленного не ограничивает ответственность за смерть, причинение вреда здоровью или обман."] },
      { heading: "Применимое право", body: [
        "Эти условия регулируются правом Арабской Республики Египет, и споры по ним подсудны её судам."] },
    ],
  },
  cookies: {
    eyebrow: "Файлы cookie",
    title: "Политика использования cookie",
    updated: "Последнее обновление",
    intro:
      "На этой странице перечислены все файлы cookie и схожие технологии, которые использует сайт, назначение каждого и способ отключить необязательные.",
    sections: [
      { heading: "Что устанавливаем мы", body: [
        "Выбранный язык хранится в самом адресе, который вы читаете — /ru для русского, без префикса для английского, — а не в cookie.",
        "Форма обратной связи выдаёт каждому посетителю короткоживущий токен, чтобы отличить человека от автоматического скрипта. Он не содержит сведений о вас и быстро истекает.",
        "Ваш ответ на баннер согласия сохраняется локально в браузере, чтобы не спрашивать при каждом визите."] },
      { heading: "Google Analytics", body: [
        "Идентификатор G-G38ZL9GYXF. Устанавливает _ga и _ga_*, чтобы считать визиты и отличать вернувшегося читателя от нового. Срок — до двух лет.",
        "Это показывает, какие работы и статьи действительно читают. Вас по имени это не идентифицирует."] },
      { heading: "Пиксель Meta", body: [
        "Идентификатор 780471777947136. Устанавливает _fbp и читает параметр _fbc, когда вы приходите из рекламы Meta. Срок — около трёх месяцев.",
        "Он измеряет, доходит ли реклама до заинтересованных людей. Если в том же браузере вы вошли в Facebook или Instagram, Meta может связать визит с этим аккаунтом."] },
      { heading: "Как отключить", body: [
        "В ЕС и Великобритании ничего не срабатывает до вашего согласия — достаточно отказаться.",
        "Любой браузер может блокировать или удалять cookie — ищите раздел конфиденциальности в настройках. Блокировка не мешает сайту работать: ничему здесь cookie не нужны.",
        "Google публикует надстройку для отключения Analytics на tools.google.com/dlpage/gaoptout. Рекламные настройки Meta находятся в параметрах вашего аккаунта."] },
      { heading: "Изменения", body: [
        "Если мы добавим или уберём тег, страница изменится вместе с ним, а дата вверху сдвинется."] },
    ],
  },
};

const PL: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Prywatność",
    title: "Polityka prywatności",
    updated: "Ostatnia aktualizacja",
    intro:
      "Ta polityka wyjaśnia, co Global Untold Story zbiera podczas korzystania z globaluntoldstory.com, dlaczego i o co możesz nas poprosić.",
    sections: [
      { heading: "Kim jesteśmy", body: [
        "Global Untold Story to studio produkcji filmowej, wideo i treści z biurami w Egyptian Media Production City, w Business Bay w Dubaju oraz w Dżuddzie. Jesteśmy administratorem opisanych tu danych osobowych.",
        "We wszystkich sprawach dotyczących tej polityki pisz na bendary@globaluntoldstory.com."] },
      { heading: "Co nam przekazujesz", body: [
        "Formularz kontaktowy prosi o imię i nazwisko, adres e-mail, telefon, interesującą Cię usługę oraz wiadomość. Obowiązkowe są tylko imię, e-mail i wiadomość.",
        "Używamy ich, aby odpowiedzieć i zaplanować pracę, o którą pytasz. Nie sprzedajemy ich i nie wykorzystujemy do marketingu, o który nie prosiłeś.",
        "Twoje zapytanie trafia do nas e-mailem i jest przechowywane w naszym systemie projektowym, byśmy mogli wrócić do rozmowy. Zapytania przechowujemy trzy lata, potem usuwamy."] },
      { heading: "Co zbierane jest automatycznie", body: [
        "Używamy Google Analytics 4, aby wiedzieć, które strony są czytane i skąd przychodzą odwiedzający. Zapisuje odsłony, przybliżoną lokalizację na poziomie kraju, urządzenie, przeglądarkę i witrynę odsyłającą. Google otrzymuje te dane jako podmiot przetwarzający.",
        "Używamy piksela Meta, aby mierzyć, czy nasze reklamy trafiają do właściwych odbiorców. Zapisuje odsłony i może powiązać je z kontem Meta, jeśli jesteś na nie zalogowany.",
        "W Unii Europejskiej i Wielkiej Brytanii żadne z nich nie uruchamia się przed Twoją zgodą; w innych miejscach ładują się wraz ze stroną. W każdej chwili możesz odmówić."] },
      { heading: "Kto jeszcze je widzi", body: [
        "Vercel hostuje tę witrynę i przetwarza żądania Twojej przeglądarki, w tym adres IP.",
        "Hostinger hostuje nasz system treści, w którym zapisywane są wiadomości z formularza, i przekazuje e-mail powiadamiający.",
        "Google i Meta otrzymują dane opisane powyżej. Google Workspace obsługuje naszą pocztę.",
        "To pełna lista. Nie udostępniamy Twoich danych nikomu innemu, chyba że wymaga tego prawo."] },
      { heading: "Gdzie są przetwarzane", body: [
        "Nasze biura znajdują się w Egipcie, ZEA i Arabii Saudyjskiej, a powyższe usługi działają międzynarodowo, więc Twoje dane są przetwarzane poza Twoim krajem. Google, Meta i Vercel stosują standardowe klauzule umowne dla transferów poza UE i Wielką Brytanię."] },
      { heading: "O co możesz poprosić", body: [
        "Możesz poprosić o kopię posiadanych przez nas danych, ich sprostowanie lub usunięcie. Możesz sprzeciwić się śledzeniu analitycznemu i reklamowemu oraz w każdej chwili wycofać zgodę.",
        "Napisz na bendary@globaluntoldstory.com — odpowiemy w ciągu trzydziestu dni. Jeśli jesteś w UE lub Wielkiej Brytanii i odpowiedź Cię nie zadowala, możesz złożyć skargę do krajowego organu ochrony danych."] },
      { heading: "Dzieci", body: [
        "Ta witryna jest skierowana do osób zlecających produkcje. Nie jest przeznaczona dla dzieci i świadomie nie zbieramy danych osób poniżej szesnastego roku życia."] },
      { heading: "Zmiany", body: [
        "Gdy ta polityka się zmieni, zaktualizujemy datę u góry. O istotnych zmianach poinformujemy na stronie."] },
    ],
  },
  terms: {
    eyebrow: "Regulamin",
    title: "Warunki korzystania",
    updated: "Ostatnia aktualizacja",
    intro:
      "Te warunki dotyczą korzystania z globaluntoldstory.com. Nie obejmują prac produkcyjnych, które reguluje umowa podpisana dla danego projektu.",
    sections: [
      { heading: "Korzystanie z witryny", body: [
        "Możesz czytać tę witrynę i udostępniać linki do niej w każdym zgodnym z prawem celu.",
        "Nie możesz kopiować jej w całości, pobierać danych w tempie pogarszającym dostęp innym, próbować sięgać do części, do których nie otrzymałeś dostępu, ani przedstawiać jej jako własnej pracy."] },
      { heading: "Prezentowane prace", body: [
        "Filmy, fotografie, kampanie i teksty w tej witrynie należą do Global Untold Story lub do klientów, którzy je zamówili. Nazwy i logotypy klientów należą do nich i występują tu, aby oznaczyć prace, które wykonaliśmy.",
        "Nic tutaj nie udziela Ci licencji na ponowne wykorzystanie. Jeśli jej potrzebujesz — zapytaj."] },
      { heading: "Zapytanie to nie umowa", body: [
        "Wysłanie formularza rozpoczyna rozmowę. Nie tworzy umowy, nie rezerwuje terminu i nie ustala ceny. Praca zaczyna się, gdy obie strony podpiszą ofertę.",
        "Kwoty, terminy czy dostępność wspomniane w witrynie mają charakter orientacyjny i zależą od specyfiki projektu."] },
      { heading: "Aktualność", body: [
        "Utrzymujemy witrynę na bieżąco, ale portfolio, opisy usług i dostępność się zmieniają. Nie gwarantujemy, że wszystko jest kompletne i aktualne w chwili czytania."] },
      { heading: "Linki zewnętrzne", body: [
        "Gdy linkujemy do innych witryn — mediów społecznościowych, klientów, partnerów — nie kontrolujemy tego, co publikują, i nie odpowiadamy za to."] },
      { heading: "Odpowiedzialność", body: [
        "Udostępniamy tę witrynę w stanie, w jakim jest. W zakresie dozwolonym prawem nie odpowiadamy za straty wynikające z korzystania z niej lub braku dostępu.",
        "Powyższe nie ogranicza odpowiedzialności za śmierć, szkodę na osobie ani oszustwo."] },
      { heading: "Prawo właściwe", body: [
        "Te warunki podlegają prawu Arabskiej Republiki Egiptu, a spory z nich wynikające rozstrzygają jej sądy."] },
    ],
  },
  cookies: {
    eyebrow: "Pliki cookie",
    title: "Polityka plików cookie",
    updated: "Ostatnia aktualizacja",
    intro:
      "Ta strona wymienia wszystkie pliki cookie i podobne technologie używane przez witrynę, ich przeznaczenie oraz sposób wyłączenia opcjonalnych.",
    sections: [
      { heading: "Co ustawiamy sami", body: [
        "Wybór języka zapisany jest w adresie, który czytasz — /pl dla polskiego, bez prefiksu dla angielskiego — a nie w pliku cookie.",
        "Formularz kontaktowy wydaje każdemu odwiedzającemu krótkotrwały token, abyśmy odróżnili człowieka od automatycznego skryptu. Nie zawiera niczego na Twój temat i szybko wygasa.",
        "Twoja odpowiedź na baner zgody zapisywana jest lokalnie w przeglądarce, aby nie pytać przy każdej wizycie."] },
      { heading: "Google Analytics", body: [
        "Identyfikator pomiaru G-G38ZL9GYXF. Ustawia _ga i _ga_*, aby liczyć wizyty i odróżniać powracającego czytelnika od nowego. Trwają do dwóch lat.",
        "Mówi nam to, które prace i artykuły są naprawdę czytane. Nie identyfikuje Cię z imienia i nazwiska."] },
      { heading: "Piksel Meta", body: [
        "Identyfikator 780471777947136. Ustawia _fbp i odczytuje parametr _fbc, gdy przychodzisz z reklamy Meta. Trwa około trzech miesięcy.",
        "Mierzy, czy nasze reklamy docierają do zainteresowanych. Jeśli w tej samej przeglądarce jesteś zalogowany na Facebooku lub Instagramie, Meta może powiązać wizytę z tym kontem."] },
      { heading: "Jak je wyłączyć", body: [
        "W Unii Europejskiej i Wielkiej Brytanii nic nie uruchamia się przed Twoją zgodą — wystarczy odmówić.",
        "Każda przeglądarka potrafi blokować lub usuwać pliki cookie — poszukaj Prywatności w ustawieniach. Zablokowanie ich nie przeszkadza witrynie działać: nic tutaj nie potrzebuje pliku cookie.",
        "Google udostępnia dodatek wyłączający Analytics pod adresem tools.google.com/dlpage/gaoptout. Ustawienia reklamowe Meta znajdziesz w ustawieniach swojego konta."] },
      { heading: "Zmiany", body: [
        "Jeśli dodamy lub usuniemy tag, ta strona zmieni się wraz z nim, a data u góry przesunie się."] },
    ],
  },
};

const ZH: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "隐私",
    title: "隐私政策",
    updated: "最后更新",
    intro:
      "本政策说明您在使用 globaluntoldstory.com 时 Global Untold Story 会收集哪些信息、原因，以及您可以要求我们做什么。",
    sections: [
      { heading: "我们是谁", body: [
        "Global Untold Story 是一家电影、视频与内容制作公司，办公室位于埃及传媒制作城、迪拜商业湾和吉达。我们是此处所述个人数据的控制者。",
        "与本政策相关的任何事宜，请写信至 bendary@globaluntoldstory.com。"] },
      { heading: "您提供的信息", body: [
        "联系表单会询问您的姓名、电子邮箱、电话、感兴趣的服务以及留言。其中只有姓名、邮箱和留言为必填。",
        "我们用这些信息回复您并筹划您咨询的项目。我们不会出售，也不会用于您未要求的营销。",
        "您的咨询会通过邮件发送给我们，并保存在项目系统中以便继续沟通。咨询记录保存三年后删除。"] },
      { heading: "自动收集的信息", body: [
        "我们使用 Google Analytics 4 了解哪些页面被阅读以及访客如何到达。它记录页面浏览、国家级别的大致位置、设备、浏览器和来源网站。Google 以数据处理者身份接收这些数据。",
        "我们使用 Meta 像素衡量广告是否触达了合适的受众。它记录页面浏览，若您已登录 Meta 账户，可将浏览与该账户关联。",
        "在欧盟和英国，两者均须先获得您的同意才会运行；其他地区随页面加载。您可随时拒绝。"] },
      { heading: "还有谁能看到", body: [
        "Vercel 托管本网站并处理您浏览器发出的请求，包括您的 IP 地址。",
        "Hostinger 托管我们的内容系统，其中保存表单留言，并转发通知邮件。",
        "Google 与 Meta 接收上述数据。我们的电子邮件由 Google Workspace 承载。",
        "这就是完整名单。除法律要求外，我们不会将您的数据提供给任何其他方。"] },
      { heading: "数据在哪里处理", body: [
        "我们的办公室位于埃及、阿联酋和沙特阿拉伯，上述服务在全球运行，因此您的数据会在您所在国家之外处理。对于欧盟和英国以外的传输，Google、Meta 和 Vercel 采用标准合同条款。"] },
      { heading: "您可以提出的要求", body: [
        "您可以索取我们所持数据的副本，要求更正或删除。您可以反对分析和广告追踪，并随时撤回同意。",
        "请写信至 bendary@globaluntoldstory.com，我们将在三十天内答复。若您在欧盟或英国且对答复不满意，可向所在国数据保护机构投诉。"] },
      { heading: "未成年人", body: [
        "本网站面向委托制作业务的人士，并非面向儿童，我们也不会有意收集十六岁以下人士的信息。"] },
      { heading: "变更", body: [
        "本政策变更时，我们会更新顶部日期。重大变更将在网站上公告。"] },
    ],
  },
  terms: {
    eyebrow: "条款",
    title: "使用条款",
    updated: "最后更新",
    intro:
      "本条款适用于您对 globaluntoldstory.com 的使用，不适用于制作业务——后者由各项目签署的合同约定。",
    sections: [
      { heading: "使用本网站", body: [
        "您可以出于任何合法目的阅读本网站并分享其链接。",
        "您不得整站复制、以影响他人访问的速率抓取、试图访问未获授权的部分，或将其冒充为自己的作品。"] },
      { heading: "此处展示的作品", body: [
        "本网站的影片、摄影、广告与文字归 Global Untold Story 或委托方所有。客户名称与标识归各客户所有，出现在此处用于标明我们制作的作品。",
        "本网站的任何内容均不授予您再次使用的许可。如有需要，请与我们联系。"] },
      { heading: "咨询不构成合同", body: [
        "提交表单只是开启对话，并不构成协议、不预留档期、也不锁定价格。工作自双方签署提案时开始。",
        "本网站提及的任何金额、周期或档期均为参考，取决于具体项目情况。"] },
      { heading: "准确性", body: [
        "我们会保持网站更新，但作品、服务说明与档期会变化。我们不保证您阅读时此处内容完整或最新。"] },
      { heading: "外部链接", body: [
        "当我们链接到其他网站——社交平台、客户、合作伙伴——我们无法控制其发布的内容，也不对其负责。"] },
      { heading: "责任", body: [
        "本网站按现状提供。在法律允许的范围内，我们不对因使用本网站或无法访问而产生的损失承担责任。",
        "上述内容不限制因死亡、人身伤害或欺诈而产生的责任。"] },
      { heading: "适用法律", body: [
        "本条款受阿拉伯埃及共和国法律管辖，相关争议由其法院管辖。"] },
    ],
  },
  cookies: {
    eyebrow: "Cookie",
    title: "Cookie 政策",
    updated: "最后更新",
    intro:
      "本页列出本网站使用的每一项 Cookie 及类似技术、各自的用途，以及如何关闭可选项。",
    sections: [
      { heading: "我们自己设置的", body: [
        "您选择的语言体现在您正在阅读的网址中——中文为 /zh，英文无前缀——而不是保存在 Cookie 里。",
        "联系表单会为每位访客签发一个短期令牌，以便区分真人与自动脚本。它不包含您的任何信息，且很快失效。",
        "您对同意提示的选择保存在浏览器本地，以免每次到访都重复询问。"] },
      { heading: "Google Analytics", body: [
        "衡量 ID 为 G-G38ZL9GYXF。设置 _ga 与 _ga_* 以统计访问量并区分回访读者与新读者，最长保留两年。",
        "这让我们知道哪些作品和文章确实被阅读，并不会以姓名识别您。"] },
      { heading: "Meta 像素", body: [
        "像素 ID 为 780471777947136。设置 _fbp，并在您通过 Meta 广告到达时读取 _fbc 参数，保留约三个月。",
        "它用于衡量广告是否触达了感兴趣的人群。若您在同一浏览器中登录了 Facebook 或 Instagram，Meta 可能将此次访问与该账户关联。"] },
      { heading: "如何关闭", body: [
        "在欧盟和英国，未经您同意不会运行任何项目——拒绝即可。",
        "任何浏览器都可以阻止或删除 Cookie，请在设置中查找隐私相关选项。阻止并不会影响本网站运行：此处没有任何功能依赖 Cookie。",
        "Google 在 tools.google.com/dlpage/gaoptout 提供 Analytics 停用插件。Meta 的广告设置位于您的账户设置中。"] },
      { heading: "变更", body: [
        "若我们新增或移除某项代码，本页会随之更新，顶部日期也会变更。"] },
    ],
  },
};

const JA: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "プライバシー",
    title: "プライバシーポリシー",
    updated: "最終更新",
    intro:
      "本ポリシーは、globaluntoldstory.com のご利用にあたり Global Untold Story が何を取得するか、その理由、そしてお客様が当社に何を求められるかを説明します。",
    sections: [
      { heading: "運営者について", body: [
        "Global Untold Story は、エジプト・メディアプロダクションシティ、ドバイのビジネスベイ、ジッダに拠点を置く映像・動画・コンテンツの制作スタジオです。本ポリシーに記載する個人データの管理者は当社です。",
        "本ポリシーに関するお問い合わせは bendary@globaluntoldstory.com までご連絡ください。"] },
      { heading: "お客様からいただく情報", body: [
        "お問い合わせフォームでは、お名前、メールアドレス、電話番号、ご関心のあるサービス、メッセージをお伺いします。必須項目はお名前・メールアドレス・メッセージのみです。",
        "これらはご返信と、ご相談内容の検討のために使用します。販売することはなく、ご依頼のない営業目的にも使用しません。",
        "お問い合わせはメールで当社に届き、やり取りを継続できるようプロジェクト管理システムに保存されます。保存期間は三年間で、その後削除します。"] },
      { heading: "自動的に取得される情報", body: [
        "どのページが読まれ、どのように到達したかを把握するため Google Analytics 4 を使用しています。ページビュー、国単位のおおよその位置、端末、ブラウザ、参照元サイトを記録します。Google は処理者としてこれらを受領します。",
        "広告が適切な相手に届いているかを測定するため Meta ピクセルを使用しています。ページビューを記録し、Meta アカウントにログイン中の場合はそれと関連付けられることがあります。",
        "EU および英国では、いずれも同意前には作動しません。それ以外の地域ではページとともに読み込まれます。いつでも拒否できます。"] },
      { heading: "ほかに閲覧する事業者", body: [
        "Vercel は本サイトをホストし、IP アドレスを含むブラウザからのリクエストを処理します。",
        "Hostinger はフォーム送信内容を保存するコンテンツ管理システムをホストし、通知メールを中継します。",
        "Google と Meta は上記のデータを受領します。当社のメールは Google Workspace が担っています。",
        "以上がすべてです。法令で求められる場合を除き、ほかの誰にもお客様のデータを提供しません。"] },
      { heading: "処理される場所", body: [
        "当社の拠点はエジプト、UAE、サウジアラビアにあり、上記サービスも国際的に稼働するため、お客様のデータはお客様の国以外でも処理されます。EU・英国域外への移転について、Google、Meta、Vercel は標準契約条項を用いています。"] },
      { heading: "お客様の権利", body: [
        "当社が保有する情報の写しの提供、訂正、削除をご請求いただけます。分析・広告目的の追跡に異議を述べること、同意をいつでも撤回することも可能です。",
        "bendary@globaluntoldstory.com までご連絡ください。三十日以内に回答します。EU または英国にお住まいでご納得いただけない場合は、各国のデータ保護当局に申し立てることができます。"] },
      { heading: "お子さまについて", body: [
        "本サイトは制作を発注される方に向けたものです。お子さま向けではなく、十六歳未満の方の情報を意図して取得することはありません。"] },
      { heading: "変更", body: [
        "本ポリシーを変更した場合は冒頭の日付を更新します。重要な変更はサイト上でお知らせします。"] },
    ],
  },
  terms: {
    eyebrow: "利用規約",
    title: "利用規約",
    updated: "最終更新",
    intro:
      "本規約は globaluntoldstory.com のご利用に適用されます。制作業務には適用されず、そちらは案件ごとに締結する契約が定めます。",
    sections: [
      { heading: "本サイトの利用", body: [
        "適法な目的であれば、本サイトを閲覧し、そのリンクを共有していただけます。",
        "サイト全体の複製、他の利用者の閲覧を妨げる速度での取得、アクセス権の与えられていない領域への到達の試み、および自らの制作物としての提示はご遠慮ください。"] },
      { heading: "掲載している作品", body: [
        "本サイトの映像、写真、キャンペーン、文章は Global Untold Story または発注いただいたクライアントに帰属します。クライアント名およびロゴは各社に帰属し、当社が手がけた仕事を示すために掲載しています。",
        "本サイトのいかなる内容も再利用の許諾を与えるものではありません。ご希望の際はお問い合わせください。"] },
      { heading: "お問い合わせは契約ではありません", body: [
        "フォームの送信は対話の開始にすぎません。合意の成立、日程の確保、価格の確定のいずれも生じません。作業は双方が提案書に署名した時点で開始します。",
        "本サイトに記載の金額、期間、稼働可否はいずれも目安であり、案件の内容により異なります。"] },
      { heading: "正確性", body: [
        "本サイトは随時更新していますが、実績、サービス内容、稼働状況は変化します。ご覧の時点ですべてが完全かつ最新であることを保証するものではありません。"] },
      { heading: "外部リンク", body: [
        "他のサイト（ソーシャルメディア、クライアント、パートナー）へリンクする場合、それらの掲載内容を当社が管理することはなく、責任も負いません。"] },
      { heading: "責任", body: [
        "本サイトは現状有姿で提供します。法令が許す範囲において、利用またはアクセス不能により生じた損害について責任を負いません。",
        "上記は、死亡、人身傷害、詐欺に関する責任を制限するものではありません。"] },
      { heading: "準拠法", body: [
        "本規約はエジプト・アラブ共和国法に準拠し、これに関する紛争は同国の裁判所が管轄します。"] },
    ],
  },
  cookies: {
    eyebrow: "Cookie",
    title: "Cookie ポリシー",
    updated: "最終更新",
    intro:
      "本ページでは、本サイトが使用するすべての Cookie および類似技術、それぞれの目的、任意のものを無効にする方法を掲載しています。",
    sections: [
      { heading: "当社が設定するもの", body: [
        "言語の選択は Cookie ではなく、ご覧いただいている URL に含まれます（日本語は /ja、英語は接頭辞なし）。",
        "お問い合わせフォームは、入力者と自動スクリプトを見分けるために訪問者ごとに短時間有効なトークンを発行します。お客様に関する情報は含まず、すぐに失効します。",
        "同意バナーへのご回答はブラウザ内にのみ保存され、訪問のたびに再度お尋ねしないようにしています。"] },
      { heading: "Google Analytics", body: [
        "測定 ID は G-G38ZL9GYXF です。訪問数の計測と再訪読者の判別のために _ga および _ga_* を設定し、最長二年間保持されます。",
        "どの作品や記事が実際に読まれているかを把握するためのもので、お名前で個人を特定するものではありません。"] },
      { heading: "Meta ピクセル", body: [
        "ピクセル ID は 780471777947136 です。_fbp を設定し、Meta 広告から到達した場合は _fbc パラメータを読み取ります。保持期間は約三か月です。",
        "広告が関心のある方に届いているかを測定します。同じブラウザで Facebook または Instagram にログインしている場合、Meta が訪問をそのアカウントと関連付けることがあります。"] },
      { heading: "無効にする方法", body: [
        "EU および英国では、同意前に作動するものはありません。拒否していただくだけで十分です。",
        "どのブラウザでも Cookie の拒否・削除が可能です（設定内の「プライバシー」をご確認ください）。拒否しても本サイトの動作には支障ありません。Cookie を必要とする機能はありません。",
        "Google は tools.google.com/dlpage/gaoptout で Analytics の無効化アドオンを提供しています。Meta の広告設定はアカウント設定内にあります。"] },
      { heading: "変更", body: [
        "タグを追加または削除した場合は本ページも更新し、冒頭の日付を変更します。"] },
    ],
  },
};

const KO: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "개인정보",
    title: "개인정보처리방침",
    updated: "최종 업데이트",
    intro:
      "이 방침은 globaluntoldstory.com 이용 시 Global Untold Story가 무엇을 수집하는지, 그 이유, 그리고 무엇을 요청하실 수 있는지 설명합니다.",
    sections: [
      { heading: "회사 소개", body: [
        "Global Untold Story는 이집트 미디어 프로덕션 시티, 두바이 비즈니스베이, 제다에 사무소를 둔 영화·영상·콘텐츠 제작 스튜디오입니다. 여기에 기술된 개인정보의 처리자는 당사입니다.",
        "이 방침과 관련한 문의는 bendary@globaluntoldstory.com으로 보내주십시오."] },
      { heading: "제공해 주시는 정보", body: [
        "문의 양식에서는 성함, 이메일 주소, 전화번호, 관심 서비스, 메시지를 요청합니다. 필수 항목은 성함·이메일·메시지뿐입니다.",
        "회신과 문의하신 작업의 검토를 위해 사용합니다. 판매하지 않으며, 요청하지 않으신 마케팅에도 사용하지 않습니다.",
        "문의는 이메일로 전달되며 대화를 이어갈 수 있도록 프로젝트 시스템에 보관됩니다. 문의는 3년간 보관 후 삭제합니다."] },
      { heading: "자동으로 수집되는 정보", body: [
        "어떤 페이지가 읽히고 어떤 경로로 방문하는지 파악하기 위해 Google Analytics 4를 사용합니다. 페이지 조회, 국가 단위의 대략적 위치, 기기, 브라우저, 유입 사이트를 기록합니다. Google은 수탁자로서 이 데이터를 받습니다.",
        "광고가 적절한 대상에게 도달하는지 측정하기 위해 Meta 픽셀을 사용합니다. 페이지 조회를 기록하며, Meta 계정에 로그인되어 있으면 해당 계정과 연결될 수 있습니다.",
        "EU와 영국에서는 동의 전에는 어느 것도 실행되지 않으며, 그 외 지역에서는 페이지와 함께 로드됩니다. 언제든 거부하실 수 있습니다."] },
      { heading: "그 밖에 열람하는 곳", body: [
        "Vercel은 이 사이트를 호스팅하며 IP 주소를 포함한 브라우저 요청을 처리합니다.",
        "Hostinger는 양식 메시지를 저장하는 콘텐츠 시스템을 호스팅하고 알림 이메일을 중계합니다.",
        "Google과 Meta는 위에 설명한 데이터를 받습니다. 이메일은 Google Workspace가 담당합니다.",
        "이것이 전부입니다. 법이 요구하는 경우를 제외하고 다른 누구와도 공유하지 않습니다."] },
      { heading: "처리 장소", body: [
        "사무소는 이집트, UAE, 사우디아라비아에 있으며 위 서비스는 국제적으로 운영되므로 데이터는 귀하의 국가 밖에서도 처리됩니다. EU·영국 역외 이전에 대해 Google, Meta, Vercel은 표준계약조항을 사용합니다."] },
      { heading: "요청하실 수 있는 사항", body: [
        "보유 중인 정보의 사본, 정정 또는 삭제를 요청하실 수 있습니다. 분석·광고 추적에 반대하거나 동의를 언제든 철회하실 수 있습니다.",
        "bendary@globaluntoldstory.com으로 연락 주시면 30일 이내에 답변드립니다. EU 또는 영국에 계시고 답변에 만족하지 못하실 경우 해당 국가의 개인정보 감독기구에 이의를 제기하실 수 있습니다."] },
      { heading: "아동", body: [
        "이 사이트는 제작을 의뢰하시는 분들을 위한 것으로 아동을 대상으로 하지 않으며, 16세 미만의 정보를 고의로 수집하지 않습니다."] },
      { heading: "변경", body: [
        "이 방침이 변경되면 상단 날짜를 갱신합니다. 중요한 변경 사항은 사이트에 공지합니다."] },
    ],
  },
  terms: {
    eyebrow: "이용약관",
    title: "이용약관",
    updated: "최종 업데이트",
    intro:
      "이 약관은 globaluntoldstory.com 이용에 적용됩니다. 제작 업무에는 적용되지 않으며, 해당 업무는 프로젝트별로 체결한 계약이 규율합니다.",
    sections: [
      { heading: "사이트 이용", body: [
        "적법한 목적이라면 이 사이트를 읽고 링크를 공유하실 수 있습니다.",
        "사이트 전체를 복제하거나, 타인의 접속을 저해하는 속도로 수집하거나, 접근 권한이 없는 영역에 접근을 시도하거나, 본인의 작업물로 제시하실 수 없습니다."] },
      { heading: "게시된 작업물", body: [
        "이 사이트의 영상, 사진, 캠페인, 문구는 Global Untold Story 또는 이를 의뢰한 고객에게 귀속됩니다. 고객명과 로고는 각 고객의 자산이며, 당사가 제작한 작업을 표시하기 위해 게재되었습니다.",
        "여기의 어떤 내용도 재사용 라이선스를 부여하지 않습니다. 필요하시면 문의해 주십시오."] },
      { heading: "문의는 계약이 아닙니다", body: [
        "양식 제출은 대화의 시작일 뿐입니다. 합의가 성립되거나 일정이 확보되거나 가격이 확정되지 않습니다. 작업은 양측이 제안서에 서명한 시점에 시작됩니다.",
        "이 사이트에 언급된 금액, 일정, 가용 여부는 참고 사항이며 프로젝트의 구체적 내용에 따라 달라집니다."] },
      { heading: "정확성", body: [
        "사이트를 최신 상태로 유지하지만 포트폴리오, 서비스 설명, 가용 여부는 변합니다. 열람 시점에 모든 내용이 완전하거나 최신이라고 보장하지 않습니다."] },
      { heading: "외부 링크", body: [
        "다른 사이트(소셜 플랫폼, 고객사, 파트너)로 연결하는 경우, 해당 사이트의 게시물은 당사가 관리하지 않으며 이에 대한 책임도 지지 않습니다."] },
      { heading: "책임", body: [
        "이 사이트는 있는 그대로 제공됩니다. 법이 허용하는 범위에서, 이용 또는 접속 불가로 발생한 손실에 대해 책임지지 않습니다.",
        "위 내용은 사망, 신체 상해, 사기에 대한 책임을 제한하지 않습니다."] },
      { heading: "준거법", body: [
        "이 약관은 이집트 아랍 공화국 법률의 적용을 받으며, 관련 분쟁은 해당 국가의 법원이 관할합니다."] },
    ],
  },
  cookies: {
    eyebrow: "쿠키",
    title: "쿠키 정책",
    updated: "최종 업데이트",
    intro:
      "이 페이지는 사이트가 사용하는 모든 쿠키와 유사 기술, 각각의 용도, 선택적 항목을 끄는 방법을 안내합니다.",
    sections: [
      { heading: "당사가 설정하는 것", body: [
        "언어 선택은 쿠키가 아니라 지금 보고 계신 주소에 담깁니다. 한국어는 /ko, 영어는 접두어가 없습니다.",
        "문의 양식은 사람과 자동 스크립트를 구분하기 위해 방문자마다 수명이 짧은 토큰을 발급합니다. 귀하에 관한 정보는 담고 있지 않으며 곧 만료됩니다.",
        "동의 배너에 대한 응답은 브라우저에 로컬로 저장되어 방문할 때마다 다시 묻지 않도록 합니다."] },
      { heading: "Google Analytics", body: [
        "측정 ID는 G-G38ZL9GYXF입니다. 방문 수를 집계하고 재방문 독자와 신규 독자를 구분하기 위해 _ga와 _ga_*를 설정하며 최대 2년간 유지됩니다.",
        "어떤 작업물과 글이 실제로 읽히는지 알려줄 뿐, 이름으로 개인을 식별하지 않습니다."] },
      { heading: "Meta 픽셀", body: [
        "픽셀 ID는 780471777947136입니다. _fbp를 설정하고 Meta 광고를 통해 유입된 경우 _fbc 매개변수를 읽습니다. 약 3개월간 유지됩니다.",
        "광고가 관심 있는 분들에게 도달하는지 측정합니다. 같은 브라우저에서 Facebook 또는 Instagram에 로그인되어 있으면 Meta가 방문을 해당 계정과 연결할 수 있습니다."] },
      { heading: "끄는 방법", body: [
        "EU와 영국에서는 동의 전에 실행되는 것이 없으며, 거부만 하시면 됩니다.",
        "모든 브라우저는 쿠키를 차단하거나 삭제할 수 있습니다. 설정에서 개인정보 항목을 확인해 주십시오. 차단해도 사이트 이용에는 지장이 없습니다. 여기에는 쿠키가 필요한 기능이 없습니다.",
        "Google은 tools.google.com/dlpage/gaoptout에서 Analytics 차단 부가기능을 제공합니다. Meta의 광고 설정은 계정 설정에 있습니다."] },
      { heading: "변경", body: [
        "태그를 추가하거나 제거하면 이 페이지도 함께 바뀌고 상단 날짜가 갱신됩니다."] },
    ],
  },
};

const SW: Record<LegalKey, LegalDoc> = {
  privacy: {
    eyebrow: "Faragha",
    title: "Sera ya Faragha",
    updated: "Ilisasishwa mwisho",
    intro:
      "Sera hii inaeleza kile Global Untold Story hukusanya unapotumia globaluntoldstory.com, kwa nini, na unachoweza kutuomba kuhusu hilo.",
    sections: [
      { heading: "Sisi ni nani", body: [
        "Global Untold Story ni studio ya utayarishaji wa filamu, video na maudhui yenye ofisi katika Egyptian Media Production City, Business Bay jijini Dubai, na Jeddah. Sisi ndio wadhibiti wa data binafsi zilizoelezwa hapa.",
        "Kwa jambo lolote kuhusu sera hii, andika kwa bendary@globaluntoldstory.com."] },
      { heading: "Unachotupa", body: [
        "Fomu ya mawasiliano huuliza jina lako, barua pepe, simu, huduma inayokuvutia na ujumbe wako. Jina, barua pepe na ujumbe pekee ndizo za lazima.",
        "Tunazitumia kukujibu na kupanga kazi unayouliza. Hatuziuzi wala hatuzitumii kwa matangazo usiyoyaomba.",
        "Ombi lako hutufikia kwa barua pepe na huhifadhiwa katika mfumo wetu wa miradi ili tuendelee na mazungumzo. Tunahifadhi maombi kwa miaka mitatu, kisha tunayafuta."] },
      { heading: "Kinachokusanywa kiotomatiki", body: [
        "Tunatumia Google Analytics 4 kuelewa kurasa zinazosomwa na jinsi watu wanavyofika. Hurekodi kurasa zilizotazamwa, eneo la takriban kwa kiwango cha nchi, kifaa, kivinjari na tovuti iliyokuleta. Google hupokea data hii kama msindikaji.",
        "Tunatumia Meta Pixel kupima kama matangazo yetu yanawafikia watu sahihi. Hurekodi kurasa zilizotazamwa na inaweza kuziunganisha na akaunti ya Meta ikiwa umeingia.",
        "Katika Umoja wa Ulaya na Uingereza, hakuna kinachoanza kabla ya ridhaa yako; kwingineko hupakia pamoja na ukurasa. Unaweza kukataa wakati wowote."] },
      { heading: "Nani mwingine anaziona", body: [
        "Vercel huandaa tovuti hii na kushughulikia maombi ya kivinjari chako, ikijumuisha anwani yako ya IP.",
        "Hostinger huandaa mfumo wetu wa maudhui, unaohifadhi ujumbe wa fomu, na hupeleka barua pepe ya taarifa.",
        "Google na Meta hupokea data iliyoelezwa hapo juu. Barua pepe yetu inaendeshwa na Google Workspace.",
        "Hiyo ndiyo orodha kamili. Hatushiriki data yako na mtu mwingine yeyote isipokuwa sheria inapotutaka."] },
      { heading: "Zinakoshughulikiwa", body: [
        "Ofisi zetu ziko Misri, Falme za Kiarabu na Saudi Arabia, na huduma zilizotajwa hufanya kazi kimataifa, hivyo data yako hushughulikiwa nje ya nchi yako. Google, Meta na Vercel hutumia vifungu vya kawaida vya mkataba kwa uhamishaji nje ya EU na Uingereza."] },
      { heading: "Unachoweza kuomba", body: [
        "Unaweza kuomba nakala ya tulichonacho, kuomba kirekebishwe, au kifutwe. Unaweza kupinga ufuatiliaji wa uchanganuzi na matangazo, na kuondoa ridhaa wakati wowote.",
        "Andika kwa bendary@globaluntoldstory.com nasi tutajibu ndani ya siku thelathini. Ukiwa EU au Uingereza na hukuridhika, unaweza kulalamika kwa mamlaka ya taifa lako ya ulinzi wa data."] },
      { heading: "Watoto", body: [
        "Tovuti hii ni kwa ajili ya wanaoagiza kazi za utayarishaji. Haikusudiwi watoto, na hatukusanyi kwa makusudi taarifa za mtu yeyote aliye chini ya miaka kumi na sita."] },
      { heading: "Mabadiliko", body: [
        "Sera hii inapobadilika, tunasasisha tarehe iliyo juu. Mabadiliko makubwa yatatangazwa kwenye tovuti yenyewe."] },
    ],
  },
  terms: {
    eyebrow: "Masharti",
    title: "Masharti ya Matumizi",
    updated: "Ilisasishwa mwisho",
    intro:
      "Masharti haya yanahusu matumizi yako ya globaluntoldstory.com. Hayahusu kazi za utayarishaji, ambazo huongozwa na mkataba uliotiwa saini kwa kila mradi.",
    sections: [
      { heading: "Kutumia tovuti hii", body: [
        "Unaweza kusoma tovuti hii na kushiriki viungo vyake kwa madhumuni yoyote halali.",
        "Huruhusiwi kuinakili yote, kuivuna kwa kasi inayoathiri wengine, kujaribu kufikia sehemu usizopewa ruhusa, wala kuiwasilisha kama kazi yako."] },
      { heading: "Kazi zilizoonyeshwa", body: [
        "Filamu, picha, kampeni na maandishi kwenye tovuti hii ni mali ya Global Untold Story au ya wateja walioziagiza. Majina na nembo za wateja ni mali yao na zinaonekana hapa kutambulisha kazi tulizotayarisha.",
        "Hakuna kilicho hapa kinachokupa leseni ya kuzitumia tena. Ukitaka, tuulize."] },
      { heading: "Ombi si mkataba", body: [
        "Kutuma fomu huanzisha mazungumzo. Haitengenezi makubaliano, hairidhii tarehe, wala haiwekei bei. Kazi huanza pande zote mbili zinapotia saini pendekezo.",
        "Takwimu, ratiba au upatikanaji vilivyotajwa kwenye tovuti hii ni vya mwongozo na hutegemea maelezo ya mradi husika."] },
      { heading: "Usahihi", body: [
        "Tunaisasisha tovuti, lakini kazi, maelezo ya huduma na upatikanaji hubadilika. Hatuhakikishi kila kitu hapa ni kamili au cha sasa wakati unaposoma."] },
      { heading: "Viungo vya nje", body: [
        "Tunapounganisha na tovuti nyingine — mitandao ya kijamii, wateja, washirika — hatudhibiti wanachochapisha wala hatuwajibiki nacho."] },
      { heading: "Dhima", body: [
        "Tunatoa tovuti hii kama ilivyo. Kwa kadiri sheria inavyoruhusu, hatuwajibiki kwa hasara zinazotokana na kuitumia au kushindwa kuifikia.",
        "Hakuna kilicho hapo juu kinachopunguza dhima kwa kifo, majeraha ya mwili, au udanganyifu."] },
      { heading: "Sheria inayotumika", body: [
        "Masharti haya yanaongozwa na sheria za Jamhuri ya Kiarabu ya Misri, na mahakama zake zina mamlaka juu ya migogoro inayohusiana nayo."] },
    ],
  },
  cookies: {
    eyebrow: "Vidakuzi",
    title: "Sera ya Vidakuzi",
    updated: "Ilisasishwa mwisho",
    intro:
      "Ukurasa huu unaorodhesha kila kidakuzi na teknolojia kama hizo zinazotumiwa na tovuti hii, kazi ya kila kimoja, na jinsi ya kuzima vile vya hiari.",
    sections: [
      { heading: "Tunachoweka sisi wenyewe", body: [
        "Chaguo lako la lugha liko katika anwani unayosoma — /sw kwa Kiswahili, bila kiambishi kwa Kiingereza — si katika kidakuzi.",
        "Fomu ya mawasiliano hutoa tokeni ya muda mfupi kwa kila mgeni ili tutofautishe mtu na hati otomatiki. Haina chochote kukuhusu na huisha haraka.",
        "Jibu lako kwa taarifa ya ridhaa huhifadhiwa ndani ya kivinjari chako, ili tusikuulize kila unapotembelea."] },
      { heading: "Google Analytics", body: [
        "Kitambulisho cha upimaji G-G38ZL9GYXF. Huweka _ga na _ga_* kuhesabu ziara na kutofautisha msomaji anayerudi na mgeni mpya. Hudumu hadi miaka miwili.",
        "Hii hutuambia kazi na makala zipi zinasomwa kwelikweli. Haikutambui kwa jina."] },
      { heading: "Meta Pixel", body: [
        "Kitambulisho 780471777947136. Huweka _fbp na husoma kigezo _fbc unapofika kupitia tangazo la Meta. Hudumu takriban miezi mitatu.",
        "Hupima kama matangazo yetu yanawafikia watu wenye nia. Ukiwa umeingia Facebook au Instagram katika kivinjari kilekile, Meta inaweza kuunganisha ziara na akaunti hiyo."] },
      { heading: "Jinsi ya kuvizima", body: [
        "Katika Umoja wa Ulaya na Uingereza hakuna kinachoanza kabla ya ridhaa yako; kukataa kunatosha.",
        "Kila kivinjari kinaweza kuzuia au kufuta vidakuzi — tafuta Faragha katika mipangilio yake. Kuvizuia hakuzuii tovuti hii kufanya kazi; hakuna kitu hapa kinachohitaji kidakuzi.",
        "Google huchapisha kiendelezi cha kuzima Analytics katika tools.google.com/dlpage/gaoptout. Vidhibiti vya matangazo vya Meta viko katika mipangilio ya akaunti yako."] },
      { heading: "Mabadiliko", body: [
        "Tukiongeza au kuondoa lebo, ukurasa huu hubadilika nayo na tarehe iliyo juu husonga mbele."] },
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
  tr: TR,
  ru: RU,
  pl: PL,
  zh: ZH,
  ja: JA,
  ko: KO,
  sw: SW,
};

export function legalDoc(key: LegalKey, locale: string): LegalDoc {
  return (BY_LOCALE[locale as Locale] ?? BY_LOCALE[DEFAULT_LOCALE]!)[key];
}

export function hasTranslation(locale: string): boolean {
  return Boolean(BY_LOCALE[locale as Locale]);
}
