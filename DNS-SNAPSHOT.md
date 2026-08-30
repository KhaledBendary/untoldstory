# DNS snapshot — globaluntoldstory.com

Taken 2026-08-30 13:35 UTC, while the site was live on Vercel and mail was
working. Keep this. If nameservers ever move, every record below has to exist
at the new provider **before** the switch, or mail stops.

Nameservers at the time: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
Registrar: Hostinger operations, UAB (expires 2027-02-11)

## Mail — recreate these first

Losing any of them stops mail for the whole domain. Mail is Google Workspace
and has nothing to do with where the website is hosted.

| Type | Name | Priority | Value |
|---|---|---|---|
| MX | `@` | 1 | `aspmx.l.google.com.` |
| MX | `@` | 5 | `alt1.aspmx.l.google.com.` |
| MX | `@` | 5 | `alt2.aspmx.l.google.com.` |
| MX | `@` | 10 | `alt3.aspmx.l.google.com.` |
| MX | `@` | 10 | `alt4.aspmx.l.google.com.` |
| TXT | `@` | — | `v=spf1 include:_spf.google.com ~all` |

The SPF line is what stopped Microsoft rejecting mail with
`450 4.7.26 … unless they pass either SPF or DKIM validation`. Without it that
comes straight back.

Not yet created, worth adding whichever host runs DNS:

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:bendary@globaluntoldstory.com` |
| TXT | `google._domainkey` | generated in Google Admin → Gmail → Authenticate email |

## The API — must not change

| Type | Name | Value |
|---|---|---|
| A | `api` | `217.65.156.99` |

That is the Laravel backend on Hostinger. The website reads all its content
from it, so if this record is wrong the site renders empty.

## The website

Currently Vercel:

| Type | Name | Value |
|---|---|---|
| A | `@` | `216.198.79.65`, `216.198.79.1` |
| A | `www` | `64.29.17.1`, `216.198.79.1` |

**These are the only records that change when the site moves.** Point `@` (and
`www`) at the Hostinger IP and leave everything above untouched.

`www` also 301s to the apex in `next.config.ts`, so it only needs to resolve.

## Leftovers

`mail`, `webmail` and `autodiscover` resolve to Vercel IPs — Vercel answers
every subdomain, so these are not real records and serve nothing. Google
Workspace does not need them. Do not recreate them; if anything they are worth
deleting, since `mail.globaluntoldstory.com` currently points at a web server
that knows nothing about mail.

## Verifying after any change

```bash
nslookup -type=MX globaluntoldstory.com 8.8.8.8
nslookup -type=TXT globaluntoldstory.com 8.8.8.8
nslookup -type=A api.globaluntoldstory.com 8.8.8.8
```

MX must list all five Google hosts, TXT must show the SPF line, and `api` must
still be `217.65.156.99`. Then send a real message to an Outlook or Hotmail
address — that is the one that fails first when SPF is missing.
