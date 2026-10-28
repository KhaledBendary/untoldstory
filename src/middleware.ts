import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function repairMojibake(pathname: string): string | null {
  try {
    const decoded = decodeURIComponent(pathname);
    // Matches 2-byte and 3-byte UTF-8 sequences misinterpreted as Latin-1 (e.g. %C3%98%C2... or %C3%A3%C2...)
    if (/[\u00C0-\u00DF][\u0080-\u00BF]|[\u00E0-\u00EF][\u0080-\u00BF]{2}/.test(decoded)) {
      const fixed = Buffer.from(decoded, 'binary').toString('utf8');
      if (fixed && fixed !== decoded && !fixed.includes('\uFFFD')) {
        return fixed;
      }
    }
  } catch {
    // If decodeURIComponent fails or corrupt, return null
  }
  return null;
}

// Quick in-memory lookup for retired services / top legacy 404s
const STATIC_REDIRECTS: Record<string, string> = {
  // 3D Animation retired service -> motion graphics
  '/services/animation-3d-production': '/services/motion-graphics-cgi-vfx-ai',
  '/en/services/animation-3d-production': '/services/motion-graphics-cgi-vfx-ai',
  '/ar/services/antaj-alrswm-almthrka-thlathya-alabaad': '/ar/services/رسوم-متحركة-وسي-جي-اي-ومؤثرات-بصرية-وذكاء-اص',
  '/ar/services/الرسوم-المتحركة-وإنتاج-3d': '/ar/services/رسوم-متحركة-وسي-جي-اي-ومؤثرات-بصرية-وذكاء-اص',
  '/ar/services/3d-animationsproduktion': '/ar/services/رسوم-متحركة-وسي-جي-اي-ومؤثرات-بصرية-وذكاء-اص',
  '/de/services/3d-animationsproduktion': '/de/services/motion-graphics-cgi-vfx-ai',
  '/de/services/animation-3d-production': '/de/services/motion-graphics-cgi-vfx-ai',
  '/es/services/produccion-de-animacion-3d': '/es/services/gráficos-en-movimiento-cgi-vfx-e-ia',
  '/es/services/animation-3d-production': '/es/services/gráficos-en-movimiento-cgi-vfx-e-ia',
  '/fr/services/production-danimation-3d': '/fr/services/animations-graphiques-cgi-vfx-et-ia',
  '/fr/services/animation-3d-production': '/fr/services/animations-graphiques-cgi-vfx-et-ia',
  '/it/services/produzione-di-animazione-3d': '/it/services/motion-graphics-cgi-vfx-e-ia',
  '/it/services/animation-3d-production': '/it/services/motion-graphics-cgi-vfx-e-ia',
  '/ru/services/animatsiya-3d-proizvodstva': '/ru/services/моушн-графика-cgi-vfx-и-ии',
  '/ru/services/animation-3d-production': '/ru/services/моушн-графика-cgi-vfx-и-ии',
  '/tr/services/3d-animasyon-uretimi': '/tr/services/motion-graphics-cgi-vfx-e-ia',
  '/tr/services/animation-3d-production': '/tr/services/motion-graphics-cgi-vfx-e-ia',
  '/pt/services/producao-de-animacao-3d': '/pt/services/motion-graphics-cgi-vfx-e-ia',
  '/pt/services/animation-3d-production': '/pt/services/motion-graphics-cgi-vfx-e-ia',
  '/zh/services/3d-dong-hua-zhi-zuo': '/zh/services/motion-graphics-cgi-vfx-e-ia',
  '/zh/services/animation-3d-production': '/zh/services/motion-graphics-cgi-vfx-e-ia',
  '/ja/services/3dアニメーション制作': '/ja/services/motion-graphics-cgi-vfx-e-ia',
  '/ja/services/animation-3d-production': '/ja/services/motion-graphics-cgi-vfx-e-ia',
  '/ko/services/3d-aenimeisyeon-jejak': '/ko/services/motion-graphics-cgi-vfx-e-ia',
  '/ko/services/animation-3d-production': '/ko/services/motion-graphics-cgi-vfx-e-ia',
  '/pl/services/produkcja-animacji-3d': '/pl/services/animacja-graficzna-cgi-vfx-i-ai',
  '/pl/services/animation-3d-production': '/pl/services/animacja-graficzna-cgi-vfx-i-ai',
  '/sw/services/uzalishaji-wa-uhuishaji-wa-3d': '/sw/services/motion-graphics-cgi-vfx-e-ia',
  '/sw/services/animation-3d-production': '/sw/services/motion-graphics-cgi-vfx-e-ia',

  // Draft pepsi project -> /work
  '/work/pepsi-arabia-freeze-commercial': '/work',
  '/en/work/pepsi-arabia-freeze-commercial': '/work',
  '/ar/work/pepsi-arabia-freeze-commercial': '/ar/work',

  // Top legacy 404s
  '/insights/cin-belgeseli-misir-cekimi': '/tr/insights/cin-belgeseli-misir-cekimi',
  '/ru/insights/misirda-bir-medya-produksiyon-ajansi-nasil-secilir': '/tr/insights/misirda-bir-medya-produksiyon-ajansi-nasil-secilir',
  '/services/producción-de-publicidad-comercial': '/es/services/producción-de-videos-comerciales',
  '/pt/work/campagna-csr-sulla-sicurezza-stradale-changan': '/pt/work/campanha-de-rse-de-segurança-rodoviária-da-changan',
  '/es/services/servicios-de-producción-en-egipto-para-equipos-internacionales': '/es/services/producción-en-terreno-en-egipto',
  '/pt/services/serviços-de-produção-no-egito-para-equipes-internacionais': '/pt/services/produção-no-local-no-egito',
  '/ar/work/ala-alard-msr': '/ar/work/على-الأرض-مصر',
  '/ar/blog-standard': '/ar/insights',
  '/team': '/about',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Direct static redirect check
  const destination = STATIC_REDIRECTS[pathname] || STATIC_REDIRECTS[decodeURIComponent(pathname)];
  if (destination) {
    const url = req.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, 301);
  }

  // 2. Check for mojibake / double-encoded path
  const repaired = repairMojibake(pathname);
  if (repaired && repaired !== pathname) {
    const url = req.nextUrl.clone();
    url.pathname = repaired;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - images/
     * - videos/
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|images/|videos/).*)',
  ],
};
