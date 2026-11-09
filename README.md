# ALUCF — Wear The Word

Merch store for the ALU Christian Fellowship. Browse the drop, design your own
piece, and check out straight into the fellowship WhatsApp — no accounts, no
payment forms, no backend.

Vite + React + TypeScript, Tailwind v4, Framer Motion, Lenis.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview
```

`dist/` is plain static files — Vercel, Netlify, Cloudflare Pages or GitHub
Pages will all serve it as-is.

---

## Set it up

### 1. The WhatsApp number — required

`src/data/site.ts`:

```ts
whatsappNumber: '250788000000',
```

Digits only, full international format, no `+` and no spaces. A Rwandan number
`0788 123 456` becomes `250788123456`.

Until this changes, the checkout drawer shows a set-up notice so nobody sends
an order into the void.

### 2. Everything else in `src/data/site.ts`

Fellowship name, tagline, Instagram, email, currency, drop name, and the
pickup / delivery options offered at checkout.

---

## The design

Black and white chrome. The garments carry all the colour.

- **Headlines are Anton** — heavy, condensed, loud enough to hold its own next
  to a full-bleed photograph. Body copy is Geist at 17px, meta is Geist Mono,
  and Instrument Serif italic is kept for scripture and asides only.
- **Every product is sold on a real photograph of someone wearing it.** No
  rendered mock-ups in the shop. The only drawn garment left on the site is the
  studio preview, and it is labelled _Live preview_ so nobody mistakes it for a
  product shot.
- **Nothing is hidden behind a hover.** Phones have no hover, and laptops
  should not make you hunt for what you came for.
- Sections alternate ink and paper for rhythm; the nav goes solid black the
  moment you scroll, because the section beneath it is white.

**The intro** (`src/components/Intro.tsx`) is about two seconds of black —
mark, headline, a 000→100 counter — before a curtain lifts on the page. It is
not decoration for its own sake: while it runs, the hero photograph is fetched
and decoded, so the picture is already there when the curtain goes. It waits at
least 1.5s and never more than 3.2s, skips entirely for reduced motion, and the
hero holds its entrance until the curtain starts to lift. To drop it, remove
`<Intro>` from `src/App.tsx` and pass `ready` to `<Hero>` as `true`.

**The hero** uses the lead piece's photograph as its background — the right
three-fifths of the screen on a laptop, dissolving into black where the
headline sits; the top of the screen on a phone, with the headline on its lower
fade. It drifts slightly on scroll.

Page order: hero → shop → campaign → how ordering works → the studio
→ about and lookbook → FAQ → footer.

## The photographs

They live in `public/shots/` as `01.jpg` … `10.jpg`. Every one of them appears
somewhere on the page.

Each is cropped to a square by `src/components/Shot.tsx`, which is the single
place that decides how a photograph is framed, loaded and hovered. A shot can
carry a `focus` (a CSS `object-position`) so a face or a print never lands
under the crop line — `/shots/01.jpg` uses one.

### Swapping in your own shoot

Replace the files in `public/shots/` and point the catalogue at them. Square,
front-on, consistent framing is all the layout asks for.

One thing in the supplied placeholders to fix with a real shoot: the cap in
`03.jpg` carries another brand's embroidery. (`01.jpg` had a watermark along
its bottom edge — that strip has been cropped off the file.)

---

## The catalogue

`src/data/products.ts`. A product is a piece; a variant is a colourway; a
variant has its own photographs:

```ts
{
  id: 'crowned-heavy',
  index: '03',                      // the editorial number
  name: 'Crowned — Heavyweight',
  garment: 'tee',                   // tee | oversized | crew | hoodie | cap
  price: 19000,
  verse: 'And he shall reign for ever and ever.',
  verseRef: 'Revelation 11:15',
  blurb: 'Regular fit, heavier hand feel…',
  details: ['210 gsm combed cotton', 'Unisex regular fit', 'Back print + small chest print'],
  variants: [
    { colorway: 'bone',     shots: [{ src: '/shots/08.jpg', alt: '…' }] },
    { colorway: 'cocoa',    shots: [{ src: '/shots/10.jpg', alt: '…' }] },
    { colorway: 'midnight', shots: [{ src: '/shots/09.jpg', alt: '…' }] },
  ],
}
```

- The **first variant** is what the shop card shows; its colour dots swap the
  photograph in place, and the chosen colour follows you into the modal.
- The **product modal** flattens every variant's shots into one gallery, so a
  piece with three colours gets three thumbnails.
- `oneSize: true` (the cap) replaces the size grid with a single _One size_.

Colourways are declared once in the same file — label, swatch dot, and whether
artwork prints light or dark on them. Add a colour there before using it.

## The studio

`src/components/Studio.tsx` is the only place that still draws a garment
rather than photographing one, because it has to show words that do not exist
yet. It composites a real DOM text layer onto a cut-out blank with
`mix-blend-mode`, so the fabric's folds come through the print.

The blanks live in `public/brand/` (`tee-white.png`, `tee-black.png`) and were
cut out of `assets/shirt demo.avif` by `scripts/prepare-assets.mjs`:

```bash
npm i -D playwright-core
node scripts/prepare-assets.mjs
```

It needs a local Chrome (set `CHROME_PATH` if yours is somewhere unusual),
which it uses purely as an image decoder. It also derives the black colourway
from the white one, and reconstructs the checkerboard "transparency" the
supplied mockup was flattened onto. A file that already has an alpha channel
skips all of that — drop it straight into `public/brand/`.

Studio options are deliberately narrower than the catalogue:
`studioColorways` in `src/data/products.ts` and `studioGarments` in
`src/lib/types.ts`.

---

## How checkout works

1. Someone fills their bag — catalogue pieces, custom pieces, or both.
2. **Continue** collects a name, WhatsApp number, cohort, and a pickup or
   delivery choice.
3. The drawer shows the exact message that will be sent, with a copy button.
4. **Send order on WhatsApp** opens `wa.me` with that message pre-typed. They
   press send; it lands in the fellowship chat with a reference like
   `ALUCF-GRQN`.

Nothing is charged and nothing is stored on a server. The bag lives in the
browser's `localStorage` so it survives a refresh.

### One limitation worth knowing

A `wa.me` link can carry **text only** — it cannot attach a file. So when
someone uploads artwork in the studio, the order message says an image is
coming and asks them to send it as the next message in the chat. The studio
says this on screen and the FAQ repeats it. Confirm the artwork in the chat
before printing. Automatic image delivery would need the WhatsApp Business API
and a small backend.

---

## Layout of the code

```
assets/                  the raw files you supplied
scripts/
  prepare-assets.mjs     assets/ -> public/brand/ (studio blanks + logos)
public/
  shots/                 the product photography
  brand/                 logos, marks, studio blanks
src/
  data/
    site.ts              fellowship details, WhatsApp number, currency
    products.ts          catalogue, colourways, verse library
  lib/
    cart.tsx             bag state + localStorage
    whatsapp.ts          builds the order message and the wa.me link
    scroll.ts            Lenis, and scroll locking for overlays
    hooks.ts             media queries, scroll lock, escape key
    types.ts             cart line shape, made-to-order prices
  components/
    Shot.tsx             one photograph, framed and cropped
    Hero.tsx             headline, copy, the lead piece
    Shop.tsx             the grid, its filters and colour dots
    Campaign.tsx         the half-type half-photograph band
    HowItWorks.tsx       the three ordering steps
    Studio.tsx           design your own
    Tee.tsx              the drawn blank the studio previews on
    Story.tsx            about the fellowship, and the lookbook
    Faq.tsx              accordion
    Footer.tsx
    ProductModal.tsx     product detail and its photo gallery
    Bag.tsx              bag -> details -> WhatsApp
    ui/                  Button, Reveal, Magnetic
```

Made-to-order prices live in `customPrice` in `src/lib/types.ts`, separate from
catalogue prices.

Reduced motion is respected throughout: smooth scroll is off and every reveal
resolves instantly.
