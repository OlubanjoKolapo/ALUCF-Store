import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { colorways, findVariant, garments, products } from '../data/products'
import type { ColorwayId, GarmentId, Product } from '../data/products'
import { money } from '../data/site'
import { scrollToId } from '../lib/scroll'
import Shot from './Shot'
import Reveal from './ui/Reveal'

type Opener = (p: Product, c?: ColorwayId) => void

/** Only offer a filter for a garment that is actually in the drop. */
const FILTERS: { id: 'all' | GarmentId; label: string }[] = [
  { id: 'all', label: 'Everything' },
  ...(Object.keys(garments) as GarmentId[])
    .filter((g) => products.some((p) => p.garment === g))
    .map((g) => ({ id: g, label: garments[g].plural })),
]

/**
 * The main surface. Every card is a photograph of the piece being worn,
 * the colour dots swap the photograph in place, and nothing is hidden
 * behind a hover — phones have no hover and laptops should not make you
 * hunt for what you came for.
 */
export default function Shop({ onOpen }: { onOpen: Opener }) {
  const [filter, setFilter] = useState<'all' | GarmentId>('all')

  const shown = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.garment === filter)),
    [filter],
  )

  return (
    <section id="shop" className="bg-paper py-18 text-ink md:py-24">
      <div className="shell">
        <Reveal>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow opacity-50">The drop</span>
              <h2 className="headline mt-3 text-[clamp(2.4rem,6.5vw,5rem)]">
                Shop every piece
              </h2>
            </div>

            <div className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {FILTERS.map((f) => {
                const n =
                  f.id === 'all'
                    ? products.length
                    : products.filter((p) => p.garment === f.id).length
                const on = filter === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={on}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                      on
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/20 text-ink/70 hover:border-ink/60 hover:text-ink'
                    }`}
                  >
                    {f.label}
                    <span className="ml-1.5 opacity-50">{n}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        <ul className="mt-11 grid grid-cols-2 gap-x-4 gap-y-11 md:grid-cols-3 md:gap-x-6">
          {shown.map((p, i) => (
            <Card key={p.id} product={p} index={i} onOpen={onOpen} />
          ))}
          <StudioTile delay={Math.min(shown.length, 7) * 0.05} />
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Card({
  product,
  index,
  onOpen,
}: {
  product: Product
  index: number
  onOpen: Opener
}) {
  const [colorway, setColorway] = useState<ColorwayId>(product.variants[0].colorway)
  const shot = findVariant(product, colorway).shots[0]

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-6%' }}
      transition={{
        duration: 0.65,
        delay: Math.min(index, 7) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <button
        onClick={() => onOpen(product, colorway)}
        className="group relative block w-full overflow-hidden text-left"
        aria-label={`View ${product.name}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={colorway}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Shot
              shot={shot}
              zoom
              alt={`${product.name} — ${colorways[colorway].label}`}
            />
          </motion.div>
        </AnimatePresence>

        {product.badge && (
          <span className="eyebrow absolute top-3 left-3 bg-paper px-2.5 py-1.5 text-[9px] text-ink">
            {product.badge}
          </span>
        )}

        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink py-3 text-center text-[12px] text-paper transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0">
          View piece
        </span>
      </button>

      <div className="mt-3.5">
        <h3 className="headline text-[1.15rem] md:text-[1.35rem]">{product.name}</h3>
        <p className="mt-1.5 text-[13px] text-smoke">
          {garments[product.garment].label} · {money(product.price)}
        </p>

        {product.variants.length > 1 ? (
          <div className="mt-2.5 flex items-center gap-2">
            {product.variants.map((v) => {
              const on = v.colorway === colorway
              return (
                <button
                  key={v.colorway}
                  onClick={() => setColorway(v.colorway)}
                  aria-pressed={on}
                  aria-label={colorways[v.colorway].label}
                  title={colorways[v.colorway].label}
                  className={`h-4 w-4 rounded-full ring-1 transition-[box-shadow,transform] ${
                    on
                      ? 'ring-ink ring-offset-2 ring-offset-paper'
                      : 'ring-ink/25 hover:scale-110'
                  }`}
                  style={{ background: colorways[v.colorway].swatch }}
                />
              )
            })}
            <span className="ml-1 text-[12px] text-smoke">
              {colorways[colorway].label}
            </span>
          </div>
        ) : (
          <p className="mt-2.5 text-[12px] text-smoke">
            {colorways[product.variants[0].colorway].label}
          </p>
        )}
      </div>
    </motion.li>
  )
}

/** Fills the last slot in the grid, and says the thing people ask next. */
function StudioTile({ delay }: { delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-6%' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={() => scrollToId('studio')}
        className="group block w-full text-left"
        aria-label="Design your own piece"
      >
        <div className="relative flex aspect-square flex-col justify-between overflow-hidden bg-ink p-5 text-paper md:p-7">
          <span className="eyebrow opacity-55">Made to order</span>
          <span className="headline text-[clamp(1.6rem,4.2vw,2.6rem)]">
            Design
            <br />
            your own
          </span>
          <span className="flex items-center gap-2 text-[13px] opacity-75">
            Open the studio
            <span className="transition-transform duration-500 group-hover:translate-x-1.5">
              →
            </span>
          </span>
        </div>
      </button>
      <div className="mt-3.5">
        <h3 className="headline text-[1.05rem] md:text-[1.2rem]">Your words</h3>
        <p className="mt-1.5 text-[13px] text-smoke">
          Any verse, any line — from 14,500 RWF
        </p>
      </div>
    </motion.li>
  )
}
