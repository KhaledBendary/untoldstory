# September 2026 targeted service translations

`languages-20260918-target-services.json` is a content-only import package built from the supplied language archive. It contains the translations that were confirmed to be present in the archive but still displayed English service-body content on the public site:

- Chinese: 13 services
- Japanese: 13 services
- Korean: 13 services
- Polish: 12 services (On-Ground Egypt was already localized)
- Swahili: 12 services (On-Ground Egypt was already localized)

Each record contains the existing service slug, the translated title, short description, full HTML body, SEO title, and meta description. It also retains the original archive filename and a SHA-256 checksum of that Word document.

Five source document paths have old route names. The package maps them to the existing service records; it does not create new URLs. Chinese source headers use `/zh-cn/`, but the package writes to the website's existing `zh` locale and does not introduce `/zh-cn/` paths.

Validate the package without connecting to a database:

```powershell
node scripts/apply-target-service-translations.mjs --validate
```

Apply only after the testing environment has both the `postgres` package installed and a test-database `DATABASE_URL` or `DATABASE_URL_UNPOOLED` in `.env.local`:

```powershell
node scripts/apply-target-service-translations.mjs --apply --report translation-imports/apply-report.json
```

The apply operation is one database transaction. It stops before writing if a target field already has non-English or custom content, and it does not change URLs, locale policy, `noindex`, canonical tags, sitemaps, publication status, or production deployment.
