import Link from "next/link";
import "./globals.css";
import { LOCALE_CODES, localeDir, localizedPath, type Locale } from "@/lib/i18n";

/**
 * Rendered on every 404, in every language.
 *
 * Deliberately a server component with its own markup rather than the client
 * <NotFound />: that one calls useLanguage(), and Next renders the not-found
 * boundary outside the provider tree, so the hook threw and the page shipped
 * an empty Suspense shell — no heading, no links, nothing for a visitor who
 * mistyped a URL and nothing for a crawler either.
 *
 * Next does not pass params to a not-found boundary, so the copy is a small
 * table here instead of the main translation file.
 */
const COPY: Record<string, { eyebrow: string; line: string; home: string; work: string; contact: string }> = {
  en: { eyebrow: "Error 404", line: "This story hasn't been shot yet", home: "Back home", work: "See our work", contact: "Start a project" },
  ar: { eyebrow: "خطأ 404", line: "القصة دي لسه ما اتصورتش", home: "الرئيسية", work: "شوف أعمالنا", contact: "ابدأ مشروع" },
  de: { eyebrow: "Fehler 404", line: "Diese Geschichte wurde noch nicht gedreht", home: "Zur Startseite", work: "Unsere Arbeiten", contact: "Projekt starten" },
  es: { eyebrow: "Error 404", line: "Esta historia aún no se ha rodado", home: "Inicio", work: "Nuestro trabajo", contact: "Empezar un proyecto" },
  fr: { eyebrow: "Erreur 404", line: "Cette histoire n'a pas encore été tournée", home: "Accueil", work: "Nos réalisations", contact: "Démarrer un projet" },
  it: { eyebrow: "Errore 404", line: "Questa storia non è ancora stata girata", home: "Home", work: "I nostri lavori", contact: "Avvia un progetto" },
  pt: { eyebrow: "Erro 404", line: "Esta história ainda não foi filmada", home: "Início", work: "Os nossos trabalhos", contact: "Começar um projeto" },
  tr: { eyebrow: "Hata 404", line: "Bu hikâye henüz çekilmedi", home: "Ana sayfa", work: "Çalışmalarımız", contact: "Projeye başla" },
  ru: { eyebrow: "Ошибка 404", line: "Эта история ещё не снята", home: "На главную", work: "Наши работы", contact: "Начать проект" },
  zh: { eyebrow: "错误 404", line: "这个故事还没有拍摄", home: "返回首页", work: "查看作品", contact: "开始项目" },
  ja: { eyebrow: "エラー 404", line: "この物語はまだ撮影されていません", home: "ホームへ", work: "実績を見る", contact: "プロジェクトを始める" },
  ko: { eyebrow: "오류 404", line: "이 이야기는 아직 촬영되지 않았습니다", home: "홈으로", work: "작업 보기", contact: "프로젝트 시작" },
  pl: { eyebrow: "Błąd 404", line: "Ta historia nie została jeszcze nakręcona", home: "Strona główna", work: "Nasze prace", contact: "Rozpocznij projekt" },
  sw: { eyebrow: "Hitilafu 404", line: "Hadithi hii bado haijapigwa picha", home: "Nyumbani", work: "Kazi zetu", contact: "Anza mradi" },
};

export default function NotFoundPage() {
  const copy = COPY.en;

  return (
    <div className="grain bg-[#0a0a0a] min-h-screen text-[#fafafa] flex flex-col items-center justify-center px-5 text-center">
      <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/55 mb-6">( {copy.eyebrow} )</p>

      <h1 className="font-display font-black uppercase leading-[0.85] tracking-tight text-[28vw] md:text-[16vw] text-outline select-none">
        404
      </h1>

      <p className="font-display font-bold uppercase text-xl md:text-2xl -mt-4 md:-mt-8 mb-10">{copy.line}</p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
        >
          {copy.home}
        </Link>
        <Link
          href="/work"
          className="inline-flex items-center gap-3 border border-white/25 px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:border-white/70 transition-colors"
        >
          {copy.work}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-3 border border-white/25 px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:border-white/70 transition-colors"
        >
          {copy.contact}
        </Link>
      </div>

      {/* A visitor who landed here in the wrong language still gets a way across. */}
      <nav aria-label="Languages" className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-2xl">
        {LOCALE_CODES.map((code: Locale) => (
          <Link
            key={code}
            href={localizedPath("/", code)}
            dir={localeDir(code)}
            className="font-mono2 text-[10px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
          >
            {code}
          </Link>
        ))}
      </nav>
    </div>
  );
}
