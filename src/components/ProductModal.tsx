import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { colorways, garments, sizeLabel, sizesFor } from '../data/products'
import type { ColorwayId, Product, SizeId } from '../data/products'
import { money } from '../data/site'
import { useCart } from '../lib/cart'
import { useEscape, useScrollLock } from '../lib/hooks'
import Shot from './Shot'
import Button from './ui/Button'

type Props = {
  product: Product | null
  /** the colour the card was showing when it was opened */
  colorway?: ColorwayId
  onClose: () => void
  onOpenBag: () => void
}

export default function ProductModal({ product, colorway, onClose, onOpenBag }: Props) {
  useScrollLock(!!product)
  useEscape(!!product, onClose)

  return (
    <AnimatePresence>
      {product && (
        <Panel
          key={`${product.id}-${colorway ?? ''}`}
          product={product}
          initialColorway={colorway}
          onClose={onClose}
          onOpenBag={onOpenBag}
        />
      )}
    </AnimatePresence>
  )
}

function Panel({
  product,
  initialColorway,
  onClose,
  onOpenBag,
}: {
  product: Product
  initialColorway?: ColorwayId
  onClose: () => void
  onOpenBag: () => void
}) {
  const { add } = useCart()

  /** every photograph of the piece, flattened, so the thumbnails show them all */
  const gallery = product.variants.flatMap((v) =>
    v.shots.map((shot) => ({ shot, colorway: v.colorway })),
  )
  const start = Math.max(
    0,
    gallery.findIndex(
      (g) => g.colorway === (initialColorway ?? product.variants[0].colorway),
    ),
  )

  const [active, setActive] = useState(start)
  const [size, setSize] = useState<SizeId | null>(product.oneSize ? 'OS' : null)
  const [qty, setQty] = useState(1)
  const [nudge, setNudge] = useState(0)

  const current = gallery[active]
  const options = sizesFor(product)

  const submit = () => {
    if (!size) {
      setNudge((n) => n + 1)
      return
    }
    add({
      kind: 'catalog',
      productId: product.id,
      name: product.name,
      garment: product.garment,
      colorway: current.colorway,
      size,
      qty,
      unitPrice: product.price,
      thumb: current.shot.src,
    })
    onClose()
    onOpenBag()
  }

  const pickColour = (c: ColorwayId) => {
    const i = gallery.findIndex((g) => g.colorway === c)
    if (i >= 0) setActive(i)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto md:items-center md:p-6">
      <motion.div
        className="fixed inset-0 bg-ink/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      <motion.div
        data-lenis-prevent
        className="relative z-10 w-full max-w-5xl bg-paper text-ink md:max-h-[92svh] md:overflow-y-auto"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-paper/90 text-ink ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-paper"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-[1.05fr_1fr]">
          {/* ---------------- photographs ---------------- */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Shot
                  shot={current.shot}
                  priority
                  alt={`${product.name} — ${colorways[current.colorway].label}`}
                />
              </motion.div>
            </AnimatePresence>

            {gallery.length > 1 && (
              <div className="flex gap-2 p-3 md:p-4">
                {gallery.map((g, i) => (
                  <button
                    key={`${g.colorway}-${i}`}
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    aria-label={`${colorways[g.colorway].label} view`}
                    className={`w-[4.5rem] shrink-0 transition-[outline-color] outline-2 outline-offset-2 ${
                      i === active
                        ? 'outline-ink'
                        : 'outline-transparent hover:outline-ink/25'
                    }`}
                  >
                    <Shot shot={g.shot} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- details ---------------- */}
          <div className="flex flex-col gap-7 p-6 pt-5 md:border-l md:border-ink/12 md:p-9">
            <div>
              <span className="eyebrow opacity-50">
                {product.index} · {garments[product.garment].label}
              </span>
              <h2 className="headline mt-3 text-[clamp(2rem,5vw,3.2rem)]">
                {product.name}
              </h2>
              <p className="mt-2 font-mono text-sm">{money(product.price)}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-smoke">
                {product.blurb}
              </p>
            </div>

            <figure className="border-l-2 border-ink/20 pl-4">
              <blockquote className="display text-[1.3rem] italic">
                &ldquo;{product.verse}&rdquo;
              </blockquote>
              <figcaption className="eyebrow mt-2.5 opacity-50">
                {product.verseRef}
              </figcaption>
            </figure>

            {product.variants.length > 1 && (
              <div>
                <span className="eyebrow opacity-50">
                  Colour — {colorways[current.colorway].label}
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const on = current.colorway === v.colorway
                    return (
                      <button
                        key={v.colorway}
                        onClick={() => pickColour(v.colorway)}
                        aria-pressed={on}
                        className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] transition-colors ${
                          on
                            ? 'border-ink bg-ink text-paper'
                            : 'border-ink/20 text-ink/70 hover:border-ink/60 hover:text-ink'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/25"
                          style={{ background: colorways[v.colorway].swatch }}
                        />
                        {colorways[v.colorway].label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <motion.div
              key={nudge}
              animate={nudge ? { x: [0, -6, 5, -3, 0] } : {}}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="eyebrow opacity-50">Size</span>
                <span className="text-[13px] text-smoke">Unisex</span>
              </div>
              <div
                className={`mt-3 grid gap-2 ${options.length > 1 ? 'grid-cols-5' : 'grid-cols-2'}`}
              >
                {options.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`h-12 border text-[13px] transition-colors ${
                      size === s
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/20 text-ink/70 hover:border-ink/60 hover:text-ink'
                    }`}
                  >
                    {sizeLabel(s)}
                  </button>
                ))}
              </div>
              {!size && nudge > 0 && (
                <p className="mt-2 text-[13px] text-ink">Choose a size to continue.</p>
              )}
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-ink/20">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-12 place-items-center transition-colors hover:bg-ink hover:text-paper"
                  aria-label="Fewer"
                >
                  –
                </button>
                <span className="w-10 text-center font-mono text-sm tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="grid h-12 w-12 place-items-center transition-colors hover:bg-ink hover:text-paper"
                  aria-label="More"
                >
                  +
                </button>
              </div>
              <div className="flex-1">
                <Button tone="light" size="lg" full onClick={submit}>
                  Add to bag
                </Button>
              </div>
            </div>

            <ul className="grid gap-2 border-t border-ink/12 pt-5">
              {product.details.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-[13.5px] text-smoke">
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-ink/40" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
