/* ------------------------------------------------------------------ *
 * The catalogue.
 *
 * Every piece is sold on a real photograph of someone wearing it —
 * no rendered mock-ups, no flat lays. A product has one or more
 * colourway variants, and each variant has its own set of shots.
 *
 * To add a piece: drop the photos in `public/shots/`, add a product
 * below, and that is the whole job.
 * ------------------------------------------------------------------ */

export type GarmentId = 'tee' | 'oversized' | 'crew' | 'hoodie' | 'cap'
export type ColorwayId =
  'black' | 'white' | 'bone' | 'cocoa' | 'midnight' | 'violet' | 'clay'
export type SizeId = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'OS'

export const sizes: SizeId[] = ['S', 'M', 'L', 'XL', 'XXL']

export const garments: Record<
  GarmentId,
  { label: string; short: string; plural: string }
> = {
  tee: { label: 'Classic Tee', short: 'Tee', plural: 'Tees' },
  oversized: { label: 'Oversized Tee', short: 'Oversized', plural: 'Oversized' },
  crew: { label: 'Crewneck', short: 'Crew', plural: 'Crewnecks' },
  hoodie: { label: 'Hoodie', short: 'Hoodie', plural: 'Hoodies' },
  cap: { label: 'Cap', short: 'Cap', plural: 'Caps' },
}

export type Colorway = {
  id: ColorwayId
  label: string
  /** swatch dot in the UI */
  swatch: string
  /** how artwork prints on it — used by the design studio */
  ink: 'light' | 'dark'
  /** cut-out blank for the studio preview; only the two house colours have one */
  blank?: string
}

export const colorways: Record<ColorwayId, Colorway> = {
  black: {
    id: 'black',
    label: 'Black',
    swatch: '#101010',
    ink: 'light',
    blank: '/brand/tee-black.png',
  },
  white: {
    id: 'white',
    label: 'White',
    swatch: '#ffffff',
    ink: 'dark',
    blank: '/brand/tee-white.png',
  },
  bone: { id: 'bone', label: 'Bone', swatch: '#efe7d8', ink: 'dark' },
  cocoa: { id: 'cocoa', label: 'Cocoa', swatch: '#4b2f24', ink: 'light' },
  midnight: { id: 'midnight', label: 'Midnight', swatch: '#1f2740', ink: 'light' },
  violet: { id: 'violet', label: 'Violet Wash', swatch: '#6a62a6', ink: 'light' },
  clay: { id: 'clay', label: 'Clay Wash', swatch: '#8c7355', ink: 'light' },
}

/** The studio only prints on the two house blanks. */
export const studioColorways: ColorwayId[] = ['black', 'white']

/** Which cut-out the studio preview should draw on. */
export const garmentPhoto = (_garment: GarmentId, colorway: ColorwayId) =>
  colorways[colorway].blank ?? colorways.black.blank!

/* ------------------------------------------------------------------ */

export type Shot = {
  src: string
  /** CSS object-position, so a face or a print never lands under the crop */
  focus?: string
  alt: string
}

export type Variant = {
  colorway: ColorwayId
  shots: Shot[]
}

export type Product = {
  id: string
  /** editorial number, 01 … */
  index: string
  name: string
  garment: GarmentId
  price: number
  /** the line the piece is built on */
  verse: string
  verseRef: string
  blurb: string
  details: string[]
  variants: Variant[]
  badge?: string
  /** caps and the like */
  oneSize?: boolean
}

export const products: Product[] = [
  {
    id: 'crowned-oversized',
    index: '01',
    name: 'Crowned',
    garment: 'oversized',
    price: 22000,
    verse: 'He was pierced for our transgressions, he was crushed for our iniquities.',
    verseRef: 'Isaiah 53:5',
    blurb:
      'The piece the drop is built around. A full back print — His name, and the crown inside it — on heavyweight boxy cotton.',
    details: [
      '240 gsm heavyweight cotton',
      'Boxy fit, dropped shoulder',
      'Full back print, small front cross',
    ],
    badge: 'Signature',
    variants: [
      {
        colorway: 'black',
        shots: [
          {
            src: '/shots/01.jpg',
            focus: '50% 44%',
            alt: 'Crowned oversized tee in black, back print',
          },
        ],
      },
      {
        colorway: 'white',
        shots: [
          { src: '/shots/02.jpg', alt: 'Crowned oversized tee in white, back print' },
        ],
      },
    ],
  },
  {
    id: 'crowned-wash',
    index: '02',
    name: 'Crowned — Vintage Wash',
    garment: 'oversized',
    price: 24000,
    verse: 'Though your sins are like scarlet, they shall be as white as snow.',
    verseRef: 'Isaiah 1:18',
    blurb:
      'The same back print on a garment-dyed, acid-washed body. Every single one comes out slightly different — that is the point.',
    details: [
      '240 gsm, garment dyed',
      'Mineral wash — no two identical',
      'Fades softly, on purpose',
    ],
    badge: 'Limited run',
    variants: [
      {
        colorway: 'violet',
        shots: [{ src: '/shots/04.jpg', alt: 'Crowned tee in violet acid wash' }],
      },
      {
        colorway: 'clay',
        shots: [{ src: '/shots/05.jpg', alt: 'Crowned tee in clay acid wash' }],
      },
    ],
  },
  {
    id: 'crowned-heavy',
    index: '03',
    name: 'Crowned — Heavyweight',
    garment: 'tee',
    price: 19000,
    verse: 'And he shall reign for ever and ever.',
    verseRef: 'Revelation 11:15',
    blurb:
      'Regular fit, heavier hand feel, back print front and centre with the ichthys mark under the collar. Three colours, all of them quiet.',
    details: [
      '210 gsm combed cotton',
      'Unisex regular fit',
      'Back print + small chest print',
    ],
    variants: [
      {
        colorway: 'bone',
        shots: [
          {
            src: '/shots/08.jpg',
            alt: 'Crowned heavyweight tee in bone, front and back',
          },
        ],
      },
      {
        colorway: 'cocoa',
        shots: [
          {
            src: '/shots/10.jpg',
            alt: 'Crowned heavyweight tee in cocoa, front and back',
          },
        ],
      },
      {
        colorway: 'midnight',
        shots: [
          {
            src: '/shots/09.jpg',
            alt: 'Crowned heavyweight tee in midnight, front and back',
          },
        ],
      },
    ],
  },
  {
    id: 'pocket-print',
    index: '04',
    name: 'Left Chest',
    garment: 'tee',
    price: 16000,
    verse: 'I have been crucified with Christ, and it is no longer I who live.',
    verseRef: 'Galatians 2:20',
    blurb:
      'Small where people look first, loud when you turn around. The one you reach for on a Tuesday morning with nothing to prove.',
    details: [
      '190 gsm combed cotton',
      'Unisex regular fit',
      'Left chest print, full back print',
    ],
    badge: 'Everyday',
    variants: [
      {
        colorway: 'black',
        shots: [
          { src: '/shots/07.jpg', alt: 'Left chest tee in black, worn' },
          { src: '/shots/06.jpg', alt: 'Left chest tee in black, front and back' },
        ],
      },
    ],
  },
  {
    id: 'fellowship-cap',
    index: '05',
    name: 'Fellowship Cap',
    garment: 'cap',
    price: 12000,
    verse: 'Let us not give up meeting together.',
    verseRef: 'Hebrews 10:25',
    blurb:
      'Unstructured six panel, curved brim, adjustable strap. Embroidered, not printed, so it survives Kigali sun and Kigali rain.',
    details: [
      'Brushed cotton, unstructured',
      'Adjustable metal strap',
      'Flat embroidery',
    ],
    oneSize: true,
    variants: [
      {
        colorway: 'black',
        shots: [{ src: '/shots/03.jpg', alt: 'Fellowship cap in black, worn' }],
      },
    ],
  },
]

/* ---------------- helpers ---------------- */

export const findVariant = (p: Product, c: ColorwayId): Variant =>
  p.variants.find((v) => v.colorway === c) ?? p.variants[0]

export const coverShot = (p: Product, c?: ColorwayId): Shot =>
  (c ? findVariant(p, c) : p.variants[0]).shots[0]

export const sizesFor = (p: Product): SizeId[] => (p.oneSize ? ['OS'] : sizes)

export const sizeLabel = (s: SizeId) => (s === 'OS' ? 'One size' : s)

/* ---------------- the studio ---------------- */

export type Face = 'display' | 'sans' | 'mono'

export type Print =
  | {
      kind: 'stack'
      lines: string[]
      face: Face
      italic?: boolean
      ref?: string
      scale?: number
    }
  | { kind: 'verse'; quote: string[]; ref: string; scale?: number }
  | { kind: 'mark'; label?: string; ref?: string }
  | { kind: 'wordmark'; ref?: string }
  | { kind: 'image'; src: string; label?: string }

export const verseLibrary = [
  { quote: 'Death and life are in the power of the tongue.', ref: 'Proverbs 18:21' },
  { quote: 'You are the light of the world.', ref: 'Matthew 5:14' },
  {
    quote: 'I can do all things through Christ who strengthens me.',
    ref: 'Philippians 4:13',
  },
  { quote: 'The joy of the Lord is my strength.', ref: 'Nehemiah 8:10' },
  { quote: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { quote: 'His mercies are new every morning.', ref: 'Lamentations 3:23' },
  { quote: 'We walk by faith, not by sight.', ref: '2 Corinthians 5:7' },
  { quote: 'Let your light shine before others.', ref: 'Matthew 5:16' },
]
