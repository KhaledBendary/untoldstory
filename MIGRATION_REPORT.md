# Migration Report — The Untold Story

## Completed

The supplied React + Vite project was migrated to **Next.js 16.2.10 App Router** while preserving the existing content, visual system, Tailwind styling, responsive layout, Framer Motion animations, GSAP scroll effects, Lenis smooth scrolling, custom cursor, preloader, navigation and footer.

### Framework changes

- Replaced Vite with Next.js App Router.
- Replaced React Router with file-system routes and `next/link`.
- Replaced React Helmet usage with route-level Next.js Metadata API.
- Preserved React 19.2, TypeScript and Tailwind CSS 3.
- Removed Vite-only and Kimi inspection dependencies.
- Added production `next build` and `next start` workflows.

### Routes generated

- Homepage
- About
- Contact
- Services index
- 13 pre-rendered service detail pages
- Work index
- 12 pre-rendered project detail pages
- Insights index
- 5 pre-rendered article detail pages
- Custom 404 page
- Dynamic `robots.txt`
- Dynamic `sitemap.xml`

### SEO and discoverability

- Unique metadata per static page.
- Dynamic metadata for services, projects and articles.
- Canonical URLs.
- Open Graph and Twitter metadata.
- Organization, Website, Service, CreativeWork and Article structured data.
- Static generation through `generateStaticParams` for all detail pages.

### Validation completed

- `npm run build`: passed.
- TypeScript: passed.
- All 40 static/SSG outputs generated successfully.
- Runtime HTTP checks: passed for homepage, static pages, dynamic service/project/article pages, sitemap and robots.
- Unknown URL correctly returns HTTP 404.
- ESLint: no errors; only advisory warnings about retaining standard `<img>` tags and the external font stylesheet.

## Deliberately retained behavior

### Contact form

The original form opens the visitor's email application through a `mailto:` URL. It was preserved because no transactional-email service or API credentials were supplied. For direct website delivery, replace this with a Next.js Route Handler connected to Resend, SendGrid, Postmark, Amazon SES or the company's SMTP service.

### Images

The migration retains standard `<img>` elements to minimize visual and animation drift. Converting selected assets to `next/image` is a safe second optimization pass after visual approval.

### Fonts

Archivo, Inter and JetBrains Mono load through Google Fonts at runtime because local licensed font files were not included in the supplied project.

## Local use

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production verification

```bash
npm run build
npm start
```

## Vercel deployment

1. Create a new GitHub repository and upload this folder.
2. In Vercel, choose **Add New → Project**.
3. Import the repository.
4. Vercel should identify the framework as **Next.js**.
5. Keep the standard settings:
   - Build command: `next build`
   - Output: managed automatically by Next.js
6. Deploy to a temporary Vercel URL.
7. Test all pages and forms before connecting the production domain.

## Recommended next development pass

1. Connect the contact form to a secure email API.
2. Convert priority/LCP images to `next/image` after design comparison.
3. Add analytics and conversion events.
4. Add an editable CMS if the team needs to publish projects and articles without code changes.
5. Connect a staging subdomain before replacing the existing live website.
