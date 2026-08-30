# Moving the site to Hostinger

The site currently runs on Vercel. Hostinger ran it before, under Passenger and
Node 22, so the shape of the deployment is known — `hbuilds/current/nodejs`
still holds the old `server.js` and `.next` from that setup.

Read `DNS-SNAPSHOT.md` alongside this. Mail is the thing that breaks.

## Mail is not affected by moving the site

Mail is Google Workspace. It is decided entirely by the MX records, and those
have nothing to do with which server answers on port 443. Moving the website
does not touch mail **as long as the MX and SPF records survive.**

They only stop surviving if the nameservers move. Hence the two routes below.

## Route A — leave DNS at Vercel, point only the site (recommended)

Change one record. Mail is never in the blast radius, and rolling back is
changing it back.

1. In the Vercel account that holds the domain: DNS → the `@` A record →
   replace the Vercel IP with the Hostinger IP.
2. Do the same for `www`.
3. Leave MX, TXT and `api` exactly as they are.

Vercel keeps answering DNS queries; it just stops being told to serve the site.

## Route B — move nameservers to Hostinger

Only worth it if the domain must be fully managed at Hostinger.

1. **Create every record from `DNS-SNAPSHOT.md` in the Hostinger DNS zone
   first** — all five MX, the SPF TXT, and the `api` A record.
2. Verify against Hostinger's nameservers directly, before switching:
   ```bash
   nslookup -type=MX globaluntoldstory.com ns1.dns-parking.com
   ```
3. Only then change the nameservers at the registrar.
4. Re-verify with `8.8.8.8` an hour later.

Doing step 3 before step 1 takes mail down for as long as it takes to notice.

## Building for Hostinger

Passenger starts a plain Node process, so the build has to be the self-contained
one. `next.config.ts` emits it when `HOSTINGER_BUILD` is set:

```bash
HOSTINGER_BUILD=1 npm run build
```

That produces `.next/standalone`, which contains its own `server.js` and the
node_modules it actually needs.

**Build on a machine that is not Hostinger.** The build fetches every page from
`api.globaluntoldstory.com`, which is itself on Hostinger and starts returning
500s past roughly eleven concurrent requests. Building on the same box makes the
API compete with its own build. The old setup did exactly this with
`"cpus": 63` in the config, and that is why pages used to ship with fallback
metadata.

Upload to the server:

```
.next/standalone/    → hbuilds/current/nodejs/
.next/static/        → hbuilds/current/nodejs/.next/static/
public/              → hbuilds/current/nodejs/public/
```

`standalone` deliberately omits `.next/static` and `public`; copying them is
not optional.

## Passenger

The existing `public_html/.htaccess` already has the right shape:

```apache
PassengerAppRoot /home/u402044559/domains/globaluntoldstory.com/hbuilds/current/nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir /home/u402044559/domains/globaluntoldstory.com/hbuilds/current/nodejs/tmp
```

Keep the www→apex redirect block above it. Restart after each deploy:

```bash
touch hbuilds/current/nodejs/tmp/restart.txt
```

Set `API_BASE_URL=https://api.globaluntoldstory.com/api/v1` in the environment.

## What is lost, and what has to be re-checked

Vercel provides things Passenger does not. None are fatal; all change behaviour.

- **Security headers.** They come from `next.config.ts` `headers()`, which Next
  serves itself — so they survive. Confirm anyway; if Apache strips or
  duplicates any, the CSP is the one that matters, because a broken CSP
  silently kills Google Analytics and the Meta Pixel.
- **Image optimisation** runs in-process instead of on a CDN. On shared hosting
  this is the most expensive thing the app does.
- **ISR** needs a writable `.next/cache`. Check after the first content edit.
- **No CDN.** Every request reaches Egypt-hosted hardware. Expect slower
  first-byte times worldwide than the current setup.

## Verify before calling it done

```bash
npm run seo:crawl -- https://globaluntoldstory.com
```

It walks all 490 URLs and checks title, description, canonical, lang, dir, h1,
hreflang and structured data on each. It passed on Vercel; it should pass here.

Then, in a browser on the live site:

```js
typeof fbq        // "function"  — Meta Pixel survived the CSP
typeof gtag       // "function"  — GA survived the CSP
```

And send a message to an Outlook address to confirm mail still authenticates.
