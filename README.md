# design

tapt.design: the design system for tapt. Today it is one headline. It grows into the single reference for the
tokens, type and components every tapt site and tool already shares by copy-paste.

## Where it sits

tapt is a hub and four tools for operators, each its own repo and Worker, all siblings of this folder on disk.

- root is tapt.so, the hub: Telegram sign-in, the shared accounts database, the TON wallet, the tool stack. The
  footer's pen-tool circle links here.
- migrate is tapt.software, the done-for-you migration funnel.
- tracker, player, former and booker are the tools at track., play., form. and book.tapt.so.

## What is shared today, and lives here from now on

- Product Sans, Regular at 400 and Bold mapped to 600, so font-semibold hits Bold. The files are in app/fonts.
- The token set in app/globals.css: background, foreground, surface, edge, ink, muted, spot. Light is white on
  white with zinc-200 edges; dark is a true black page with zinc-900 surfaces. root picks the theme from a cookie
  via data-theme on html; this site follows the OS until the system defines the switch.
- The star mark in app/tapt-mark.tsx and the bar in app/nav.tsx, copied from root.
- The footer pill family on tapt.so: 46px tall, rounded-full, border-edge, bg-surface, shadow-md, with a 36px slot
  per item and a bg-spot spotlight that turns the glyph to ink on hover. The socials bar, the theme toggle, the TON
  pill and the design circle are all that one pattern.

## Stack

Next.js 16 on Cloudflare Workers through OpenNext, Tailwind 4 via the Turbopack loader. Same setup as root and
migrate; see AGENTS.md before writing code, this Next.js is newer than training data.

- npm run dev
- npm run lint
- npm run deploy, which builds with OpenNext and deploys the Worker. Deploys are manual, never on push.

wrangler.jsonc routes tapt.design and www.tapt.design as custom domains, so Cloudflare owns the DNS record and the
certificate. The zone was added by hand before the first deploy.
