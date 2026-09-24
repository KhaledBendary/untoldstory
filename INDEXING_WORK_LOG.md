# Website indexing work log

## 2026-09-18 - Step 1: baseline refresh and scope confirmation

- Owner: Codex / site owner
- Scope: read-only baseline refresh. No website files, DNS records, Search Console settings, sitemaps, indexing requests, or validation actions were changed.
- Historical reference files confirmed present and unchanged:
  - `C:\Users\A Store\Desktop\Website_Indexing_Report.pdf`
  - `C:\Users\A Store\Desktop\Website_Indexing_Tracker.xlsx`
- Historical scope: **All known pages**. Baseline prepared 2026-09-18; charts end 2026-09-14 and individual source crawl dates reach 2026-09-15.
- Historical counts retained as the baseline: 4 excluded by `noindex`; 238 discovered but not indexed; 10 crawled but not indexed; 252 distinct URLs total.
- Current public technical check on 2026-09-18:
  - `robots.txt` returned HTTP 200, allows crawling, and names `https://globaluntoldstory.com/sitemap.xml`.
  - Sitemap index returned HTTP 200 and lists 9 language sitemaps, each returning HTTP 200 with 43 URLs (387 advertised URLs total).
  - Full live audit checked all 387 advertised URLs: each returned HTTP 200, permits indexing, is self-canonical, and contains the complete indexable-language hreflang set.
  - All 3,483 reciprocal hreflang pairs agreed.
  - The five intentionally withheld languages remain `noindex` and do not appear in the sitemap.
- Current Google Search Console outcome: not confirmed. This workspace has no authenticated Search Console access, so the live Page Indexing counts, individual URL Inspection results, crawl dates, and sitemap-processing status remain unknown.
- Interpretation: the historical 252-URL report and the current 387-URL sitemap use different scopes. The public eligibility check is positive, but it neither proves Google has indexed the URLs nor explains the historical exclusions.
- Next action: obtain current Search Console evidence, then begin Step 2 by reviewing the four historically `noindex` URLs one at a time. Required evidence: a current **All known pages** export for each relevant Page Indexing status, plus URL Inspection screenshots or exported details for the four priority URLs.

## 2026-09-18 - Translation archive inventory and live-route comparison

- Owner: Codex / content owner
- Scope: read-only analysis of `C:\Users\A Store\Downloads\Compressed\Languages-20260918T200742Z-1-001.zip` against the current public site and the local route configuration. No website content, metadata, locale setting, sitemap, canonical, `noindex`, or deployment was changed.
- Archive inventory: 285 files: 19 English Word documents, 19 matching English PDFs, 19 matching English Pages packages, plus 19 Word documents in each of 12 supplied languages (Arabic, Chinese, French, German, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, and Swahili). This is 228 non-English Word documents. Turkish is absent.
- Each supplied translation language covers the same 19 subjects: home, services, about, work, all 13 service pages, and two work/project pages. The documents contain substantive body copy and SEO fields; the English PDFs and Pages assets are companion source formats, not additional page subjects.
- Live comparison: all 19 intended paths currently exist and returned HTTP 200 for every non-English site locale. The archive does not create new route coverage.
- Current route/content gaps in the archive: no contact, insights hub, legal pages, six insight articles, or 13 other project pages. That is 24 of the current 43 sitemap routes. Across all 13 non-English locale variants, the archive supplies 228 of 559 possible page-language records; 331 are not supplied, including every Turkish record.
- Import mapping required before any implementation: five document URLs use old service paths (production services, documentary, corporate video, event production, and performance marketing) and must be mapped to current routes; Chinese documents use `/zh-cn/`, while the website uses `/zh/`.
- Indexing interpretation: the archive can replace English fallback or partial body copy on its 19 supplied routes, especially for currently withheld Chinese, Japanese, Korean, Polish, and Swahili pages. It cannot establish translation completeness for those whole locales, so their current `noindex` policy should remain until the 24 missing routes in each locale are also completed and reviewed. It does not itself confirm or cause Google indexing.
- Follow-up: prepare a field-by-field import plan only after content-owner approval; retain current locale indexing policy, validate the five route remaps and Chinese locale code, and have native-language/content-owner review before publishing.

### Narrowed non-project content-import set

- Excluding the two project pages, the archive supplies translated copy for 17 shared targets: home, services, about, work, and 13 services.
- Chinese (`zh`), Japanese (`ja`), and Korean (`ko`): all 17 currently serve English-heavy main content despite a matching archive document being available.
- Polish (`pl`) and Swahili (`sw`): the 12 service pages from Commercial Video Production through Original IP Development currently serve English-heavy main content. Home, services, about, work, and On-Ground Egypt are already materially localized.
- Arabic, French, German, Italian, Portuguese, Russian, Spanish, and Turkish do not show an equivalent English-heavy gap across these 17 non-project targets. Turkish still has no archive package, but its existing non-project target pages are localized.
- This is a content-field import only; it does not require a route, canonical, sitemap, or indexing-policy change.

## 2026-09-19 - Targeted service translation import package

- Owner: Codex / content owner
- Approved scope: existing service translation fields only, on the `codex/website-testing` branch. No production deployment, Search Console, sitemap, canonical, route, or `noindex` change was authorized or made.
- Built `translation-imports/languages-20260918-target-services.json` from the supplied archive. It contains 63 checked service-language records: Chinese 13, Japanese 13, Korean 13, Polish 12, and Swahili 12. Every record has a non-empty title, short description, HTML body, SEO title, meta description, original filename, and source-document SHA-256 checksum.
- Added `scripts/apply-target-service-translations.mjs`. It validates the approved record counts, locale/slug uniqueness, required data, route-mapping state, Chinese locale handling, and source checksums. When database access is configured, it applies all records in one transaction and aborts if a field already has non-English or custom content.
- Validation passed: 63 records; no duplicates or blank required fields; 23 records use documented old-route-to-current-route mappings; 13 Chinese source headers use `/zh-cn/` but the target locale is `zh`.
- Apply attempt outcome: no database credential is configured in `.env.local`; additionally the local `node_modules` installation lacks the declared `postgres` package. No database or website change occurred.
- Repository checks: the package validator and importer syntax checks pass. Existing project-wide lint and TypeScript checks still fail on pre-existing admin and missing-dependency errors unrelated to this import.
- Next action: configure a non-production database URL and restore project dependencies, then run the guarded apply command and inspect its generated hash report before any deployment.

## 2026-09-19 - Step 2: Search Console evidence for historical noindex URLs

- Owner: site owner / Codex
- Scope: review of supplied Google Search Console screenshots only. No Test Live URL action, Request Indexing action, sitemap submission, validation, or website change was made.
- Confirmed historical inspection result for `https://globaluntoldstory.com/fr/services/dubbing-voice-over-localization`:
  - Search Console reports “URL is not on Google” and “Excluded by `noindex` tag”.
  - Googlebot smartphone last crawled it on 2026-09-01 11:34:23 AM; crawling and page fetch succeeded.
  - Search Console recorded `noindex` in the robots meta tag. Both the user-declared and Google-selected canonical were the inspected French URL.
  - The inspection lists `sitemap.xml` and `sitemap_index.xml`; no referring page was detected.
- Confirmed historical inspection result for `https://globaluntoldstory.com/tr/insights`:
  - Search Console reports “URL is not on Google” and “Excluded by `noindex` tag”.
  - Googlebot smartphone last crawled it on 2026-09-01 9:22:54 AM; crawling and page fetch succeeded.
  - Search Console recorded `noindex` in the robots meta tag. Both the user-declared and Google-selected canonical were the inspected Turkish URL.
  - The URL Inspection panel also showed “Temporary processing error” under Sitemaps. This does not establish a current sitemap fault and needs a separate current sitemap check.
- No usable inspection result was supplied for `https://globaluntoldstory.com/it/services/motion-graphics-cgi-vfx-ai` or `https://globaluntoldstory.com/fr/services/original-ip-development`: both screenshots show a leading `-` before `https`, which Search Console rejected as “Malformed URL”.
- Interpretation: the two valid screenshots confirm Google’s historical crawl-time exclusion, not the current live directive. The 2026-09-18 public eligibility audit found the Italian, French, and Turkish sitemap URLs indexable, so the next evidence must be Search Console’s Test Live URL result for all four URLs before proposing any correction.
- Next action: inspect each exact URL without a leading dash, run **Test Live URL** only, and capture the result that shows indexing allowed/disallowed, the canonical, and any live robots meta directive. Do not request indexing yet.

### Complete historical evidence and current public check

- The later screenshots supplied the complete historical URL Inspection details for all four URLs:
  - `https://globaluntoldstory.com/it/services/motion-graphics-cgi-vfx-ai`: last crawled 2026-09-02 9:34:30 PM; crawl allowed and fetch successful; `noindex` detected; self-canonical; no referring page; Search Console showed “Temporary processing error” for sitemap processing.
  - `https://globaluntoldstory.com/fr/services/dubbing-voice-over-localization`: last crawled 2026-09-01 11:34:23 AM; crawl allowed and fetch successful; `noindex` detected; self-canonical; no referring page; Search Console listed `sitemap.xml` and `sitemap_index.xml`.
  - `https://globaluntoldstory.com/tr/insights`: last crawled 2026-09-01 9:22:54 AM; crawl allowed and fetch successful; `noindex` detected; self-canonical; no referring page; Search Console showed “Temporary processing error” for sitemap processing.
  - `https://globaluntoldstory.com/fr/services/original-ip-development`: last crawled 2026-08-31 12:54:49 PM; crawl allowed and fetch successful; `noindex` detected; self-canonical; Search Console showed “Temporary processing error” for sitemap processing and listed the Russian and Spanish equivalent service pages as referrers.
- Current public read-only check on 2026-09-19 found all four URLs returning HTTP 200 with `<meta name="robots" content="index, follow">` and a self-referencing canonical. The historical `noindex` directive is therefore no longer present on the live pages.
- Current public sitemap check on 2026-09-19 found `https://globaluntoldstory.com/sitemap.xml` returning HTTP 200 as XML. `https://globaluntoldstory.com/sitemap_index.xml` returns a permanent HTTP 301 redirect to `sitemap.xml`. The historical “Temporary processing error” messages do not prove a current sitemap outage.
- Confirmed outcome: no code or dashboard correction is currently warranted for the four directives. They are technically eligible for indexing now, but Google has not yet recrawled these pages after the live directive changed.
- Remaining verification: run Search Console **Test Live URL** for each URL. If each result confirms indexing is allowed, the next proposed Search Console action is a limited Request Indexing submission for these four already-corrected public URLs; no Validate Fix action is proposed.

## 2026-09-19 — Translation language-quality review, source-guided repair authorization

- Owner: Codex / content owner
- Scope: local review copies only. The source archive at `C:UsersA StoreDownloadsCompressedLanguages-20260918T200742Z-1-001.zip`, the website, database, deployment, sitemap, and Search Console were not changed.
- Audit coverage: all 228 translated DOCX files and 71,410 visible text paragraphs. Mechanical checks found no hidden characters or repeated spaces. Language checks flagged significant Spanish source-quality issues and confirmed one Arabic duplicate final period and one French spelling correction.
- Authorization: content owner approved sentence-level Spanish repairs against the matching English documents, while preserving meaning.
- Current non-published review copy: 21 DOCX files (19 Spanish, one Arabic, one French) created under the separate Codex audit workspace. It contains 532 localized corrections and passes the mechanical recheck, but Spanish still requires further source-guided sentence repair. It is not import-ready and has not been supplied to the website.
- Verification limitation: the bundled DOCX renderer cannot run because its required LibreOffice executable is not available in this workspace. No edited DOCX is being delivered or proposed for import until rendering and language review are complete.
- Next: continue source-guided Spanish repair in controlled document batches, rerun structural/language checks, obtain native Korean and Swahili review, then provide an import proposal with changed-file inventory.


## 2026-09-19 — Step 2 request-for-indexing submitted

- Owner: site owner through Google Search Console
- Confirmed action: **Test Live URL** was run for each of the four historical noindex URLs. The owner then submitted **Request Indexing** for all four, and Search Console accepted the requests.
- Pages:
  - `/it/services/motion-graphics-cgi-vfx-ai`
  - `/fr/services/dubbing-voice-over-localization`
  - `/tr/insights`
  - `/fr/services/original-ip-development`
- Evidence confirmed: Google has been asked to recrawl the current live versions. Earlier URL Inspection screenshots showed historical `noindex` crawl results, while the current public technical check found HTTP 200, `index, follow`, and self-canonicals.
- Uncertain: whether and when Google will index each page; Search Console indexing requests do not guarantee inclusion.
- No site, DNS, sitemap, canonical, or robots change was made in this action.
- Follow-up: review URL Inspection and Page Indexing status around 2026-09-26, then again between 2026-10-03 and 2026-10-17. Do not use Validate Fix in place of checking the outcome.
- Next working step: Step 3 — inspect the eight priority default-language pages individually.


## 2026-09-19 — Step 3 partial evidence: priority default-language pages

- Owner: Codex / site owner through Google Search Console
- Scope: URL Inspection screenshots for six of eight priority default-language pages, plus a current public read-only technical check of all eight. No website, dashboard, database, deployment, sitemap, canonical, robots, or Search Console setting was changed.
- Search Console evidence supplied:
  - `/services`: **Discovered – currently not indexed**. Search Console shows sitemap references and Arabic, Russian, and `newfront.globaluntoldstory.com` referring pages, but no crawl, fetch, robots, or canonical data (all N/A).
  - `/about`: **Discovered – currently not indexed**. Search Console shows sitemap references and Turkish, Spanish, and `newfront.globaluntoldstory.com` referring pages, but no crawl, fetch, robots, or canonical data (all N/A).
  - `/contact`: **Indexed**.
  - `/services/commercial-photography`: **Indexed**.
  - `/services/documentary-production-egypt`: **Discovered – currently not indexed**. Search Console shows sitemap references and `newfront.globaluntoldstory.com` as a referrer, but no crawl, fetch, robots, or canonical data (all N/A).
  - `/services/dubbing-voice-over-localization`: **URL is unknown to Google**. Search Console reports no detected sitemap or referring page and has no crawl, fetch, robots, or canonical data.
- Missing owner evidence: `/services/event-production-live-streaming-egypt` and `/services/podcast-production` have not yet been supplied.
- Current public check: all eight priority URLs returned HTTP 200 with `index, follow` and a self-referencing canonical. Their live titles are present. This confirms present technical eligibility, but it does not prove that Google has crawled or indexed them.
- Evidence requiring later investigation: `newfront.globaluntoldstory.com` appears in several referring-page fields. Its current role and relation to the main site have not yet been established; no conclusion or correction is proposed.
- Next: receive the two missing inspections. Run **Test Live URL** for the four non-indexed URLs already evidenced (`/services`, `/about`, `/services/documentary-production-egypt`, `/services/dubbing-voice-over-localization`) before deciding whether a Request Indexing submission is appropriate. No action is needed for the two pages already indexed.
- Additional owner evidence received:
  - `/services/event-production-live-streaming-egypt`: **Discovered – currently not indexed**. Search Console shows sitemap references and the Arabic equivalent page as a referrer, but no crawl, fetch, robots, or canonical data (all N/A).
  - `/services/podcast-production`: **URL is unknown to Google**. Search Console reports no detected sitemap or referring page and has no crawl, fetch, robots, or canonical data.
- The evidence set for all eight priority default-language pages is now complete.
- Live Test evidence received for all six non-indexed priority pages on 2026-09-19. Each returned **URL is available to Google** and **Page can be indexed**:
  - `/services`
  - `/about`
  - `/services/documentary-production-egypt`
  - `/services/event-production-live-streaming-egypt`
  - `/services/dubbing-voice-over-localization`
  - `/services/podcast-production`
- The Live Test confirms current crawl and index eligibility. It does not confirm indexing or a date on which Google will index any URL.
- Proposed next action: submit one Request Indexing request for each of the six technically eligible pages. No site change or Validate Fix action is required.

## 2026-09-19 — Step 3 indexing requests submitted

- Owner: site owner through Google Search Console
- Reported action: after all six pages passed **Test Live URL**, the owner confirmed they completed the proposed **Request Indexing** submissions for:
  - `/services`
  - `/about`
  - `/services/documentary-production-egypt`
  - `/services/event-production-live-streaming-egypt`
  - `/services/dubbing-voice-over-localization`
  - `/services/podcast-production`
- Confirmed evidence: the six Live Tests showed that Google can access and index the current versions. `/contact` and `/services/commercial-photography` were already indexed and received no request.
- Uncertain: Google’s final index selection and timing. This is a site-owner report of submission; an acceptance screenshot was not retained in the work log.
- No website, dashboard, database, deployment, sitemap, canonical, robots, DNS, or Validate Fix action occurred.
- Follow-up: review individual status around 2026-09-26, then again between 2026-10-03 and 2026-10-17.
- Next working step: Step 4 — individual review of the ten historical `Crawled - currently not indexed` URLs.

## 2026-09-19 — Step 4 initial current public check

- Owner: Codex / site owner through Google Search Console
- Scope: current public read-only check of the ten historical `Crawled - currently not indexed` URLs from the original tracker. No website, dashboard, database, deployment, sitemap, canonical, robots, DNS, or Search Console setting was changed.
- Historical ten reviewed: Portuguese Engazaat project; Spanish Apache project; German Original IP service; Arabic ADNOC project; Arabic Dubbing service; Spanish Engazaat project; Spanish Alliance project; French Performance Marketing service; French ENAP project; Turkish “How to Choose…” article. Historical crawl dates ranged from 2026-09-10 through 2026-09-15.
- Current public technical finding: all ten return HTTP 200, contain `index, follow`, and declare a self-referencing canonical. The basic technical signals do not show a present exclusion or redirect problem.
- Current rendered-content observation: the Portuguese Engazaat project, Spanish Apache project, Spanish Engazaat project, and Turkish article expose English H1 and description text while the route declares a Portuguese, Spanish, or Turkish HTML language. This is evidence of incomplete visible localization or English fallback on these four routes. It is a plausible index-quality issue, but not a confirmed reason Google did not index them. The other six show route-appropriate heading and description language in the current page HTML.
- Remaining verification: obtain a current Google Index URL Inspection result for each of the ten, including Google’s stated status/reason and selected canonical where available. Do not request indexing yet; these pages were already crawled and need individual diagnosis first.

## 2026-09-19 — Redirect validation report review

- Owner: Codex / site owner through Google Search Console
- Scope: read-only review of the four pending examples in the historical “Page with redirect” validation. No website, dashboard, deployment, sitemap, robots, canonical, DNS, or Search Console action was changed.
- Current public results: each URL returns a single-hop permanent HTTP 301 redirect to a valid HTTP 200 destination:
  - `/it/` → `/it`
  - `/tr/services/photography` → `/tr/services/commercial-photography`
  - `/tr/` → `/tr`
  - `/about/` → `/about`
- Finding: these are normal URL-normalization or legacy-route redirects. Google should index the final destination when appropriate, not the redirecting URL. The historic validation failure only means Google still found redirect URLs during the validation period; it does not establish a current site fault.
- Decision: no technical correction or new validation is proposed. Keep redirect URLs out of the sitemap and use final URLs in internal links. Do not use **Start New Validation** for this report.
