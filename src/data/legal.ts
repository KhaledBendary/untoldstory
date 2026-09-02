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
const BY_LOCALE: Partial<Record<Locale, Record<LegalKey, LegalDoc>>> = {
  en: EN,
  ar: AR,
};

export function legalDoc(key: LegalKey, locale: string): LegalDoc {
  return (BY_LOCALE[locale as Locale] ?? BY_LOCALE[DEFAULT_LOCALE]!)[key];
}

export function hasTranslation(locale: string): boolean {
  return Boolean(BY_LOCALE[locale as Locale]);
}
