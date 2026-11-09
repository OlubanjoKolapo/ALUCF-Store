import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  colorways,
  garments,
  sizes,
  studioColorways,
  verseLibrary,
} from '../data/products'
import type { ColorwayId, Face, GarmentId, Print, SizeId } from '../data/products'
import { money } from '../data/site'
import { useCart } from '../lib/cart'
import { customPrice, studioGarments } from '../lib/types'
import Tee from './Tee'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

type Mode = 'words' | 'artwork'

const FACES: { id: Face; label: string; sample: React.CSSProperties }[] = [
  {
    id: 'sans',
    label: 'Bold',
    sample: { fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.03em' },
  },
  {
    id: 'display',
    label: 'Serif',
    sample: { fontFamily: 'var(--font-serif)', fontStyle: 'italic' },
  },
  {
    id: 'mono',
    label: 'Typewriter',
    sample: { fontFamily: 'var(--font-mono)', fontWeight: 500 },
  },
]

const MAX_LINES = 3
const MAX_CHARS = 16
const MAX_REF = 28
const QUICK_REFS = [
  'Isaiah 41:10',
  'Psalm 46:10',
  'Philippians 4:13',
  'Joshua 1:9',
  'John 3:16',
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function Studio({ onOpenBag }: { onOpenBag: () => void }) {
  const { add } = useCart()

  const [mode, setMode] = useState<Mode>('words')
  const [garment, setGarment] = useState<GarmentId>('oversized')
  const [colorway, setColorway] = useState<ColorwayId>('black')
  const [face, setFace] = useState<Face>('sans')
  const [lines, setLines] = useState<string[]>(['I AM', 'NOT', 'AFRAID'])
  const [verseRef, setVerseRef] = useState('Isaiah 41:10')
  const [note, setNote] = useState('')
  const [size, setSize] = useState<SizeId | null>(null)
  const [qty, setQty] = useState(1)
  const [upload, setUpload] = useState<{ name: string; url: string } | null>(null)
  const [nudge, setNudge] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const ref = verseRef.trim().toUpperCase() || undefined
  const written = useMemo(() => lines.map((l) => l.trim()).filter(Boolean), [lines])

  const print: Print = useMemo(() => {
    if (mode === 'artwork' && upload)
      return { kind: 'image', src: upload.url, label: ref }
    if (!written.length) return { kind: 'mark', ref }
    return { kind: 'stack', lines: written, face, italic: face === 'display', ref }
  }, [mode, upload, written, face, ref])

  const unitPrice = customPrice[garment]
  const onDark = colorway === 'white'

  const setLine = (i: number, v: string) =>
    setLines((prev) => prev.map((l, j) => (j === i ? v.slice(0, MAX_CHARS) : l)))

  const pickFile = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    // Not revoked on replace: bag lines and the order preview may still point
    // at the previous URL. The browser reclaims them on unload.
    setUpload({ name: file.name, url: URL.createObjectURL(file) })
    setMode('artwork')
  }

  const inspire = () => {
    const v = verseLibrary[Math.floor(Math.random() * verseLibrary.length)]
    const words = v.quote.replace(/[.,]/g, '').split(' ')
    const per = Math.ceil(words.length / MAX_LINES)
    setLines(
      Array.from({ length: MAX_LINES }, (_, i) =>
        words
          .slice(i * per, (i + 1) * per)
          .join(' ')
          .toUpperCase()
          .slice(0, MAX_CHARS),
      ),
    )
    setVerseRef(v.ref)
    setMode('words')
  }

  const submit = () => {
    if (!size) {
      setNudge((n) => n + 1)
      return
    }
    add({
      kind: 'custom',
      name: 'Custom piece',
      garment,
      colorway,
      size,
      qty,
      unitPrice,
      print,
      custom: {
        lines: mode === 'words' ? written : [],
        face,
        verseRef: ref,
        note: note.trim() || undefined,
        upload: upload ?? undefined,
      },
    })
    onOpenBag()
  }

  /* the order summary and the button — under the preview on a laptop, at the end on a phone */
  const checkout = (
    <div className="border-t border-ink/12 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">
            Custom {garments[garment].label}
          </p>
          <p className="mt-0.5 text-[13px] text-smoke">
            {colorways[colorway].label} · {size ?? 'No size yet'}
            {upload && mode === 'artwork' ? ' · your artwork' : ''}
          </p>
        </div>
        <p className="shrink-0 font-mono text-[15px] tabular-nums">
          {money(unitPrice * qty)}
        </p>
      </div>

      <div className="mt-4 flex items-stretch gap-3">
        <div className="flex items-center rounded-full border border-ink/20">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-[3.6rem] w-11 place-items-center rounded-l-full transition-colors hover:bg-ink/5"
            aria-label="Fewer"
          >
            –
          </button>
          <span className="w-6 text-center font-mono text-sm tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="grid h-[3.6rem] w-11 place-items-center rounded-r-full transition-colors hover:bg-ink/5"
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

      <AnimatePresence initial={false}>
        {!size && nudge > 0 && (
          <motion.p
            key="need-size"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-3 text-[13px] font-medium"
          >
            Pick a size in step 03 first.
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-[12.5px] leading-relaxed text-smoke">
        Nothing is charged here. We send you a mock-up on WhatsApp before anything is
        printed.
      </p>
    </div>
  )

  return (
    <section id="studio" className="bg-paper py-20 text-ink md:py-28">
      <div className="shell">
        <Reveal>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow opacity-50">The studio</span>
              <h2 className="headline mt-3 text-[clamp(2.4rem,6.5vw,5rem)]">
                Put your own words on it
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-smoke md:text-right">
              Type it and watch it land on the shirt. What you see is what we print — from{' '}
              {money(Math.min(...studioGarments.map((g) => customPrice[g])))}.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* ================= preview ================= */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <div
                className="relative overflow-hidden transition-colors duration-500"
                style={{ background: onDark ? '#141414' : '#efede9' }}
              >
                <div className="flex items-center justify-between px-5 pt-5">
                  <span
                    className={`eyebrow flex items-center gap-2 text-[9.5px] ${
                      onDark ? 'text-paper/60' : 'text-ink/50'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Live preview
                  </span>

                  {/* colour, right where you are looking */}
                  <div className="flex items-center gap-1.5 rounded-full bg-paper/90 p-1 shadow-sm ring-1 ring-ink/10">
                    {studioColorways.map((id) => {
                      const on = colorway === id
                      return (
                        <button
                          key={id}
                          onClick={() => setColorway(id)}
                          aria-pressed={on}
                          aria-label={colorways[id].label}
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                            on ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full ring-1 ring-ink/25"
                            style={{ background: colorways[id].swatch }}
                          />
                          {colorways[id].label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="px-8 pt-4 pb-10 sm:px-14">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={colorway}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.28, ease: EASE }}
                    >
                      <Tee
                        garment={garment}
                        colorway={colorway}
                        print={print}
                        alt="Your piece"
                        className="mx-auto w-full max-w-md"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 hidden lg:block">{checkout}</div>
          </div>

          {/* ================= controls ================= */}
          <ol className="border-t border-ink/12">
            <Step
              n="01"
              title="The blank"
              aside={`${garments[garment].label} · ${money(unitPrice)}`}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {studioGarments.map((g) => {
                  const on = garment === g
                  return (
                    <button
                      key={g}
                      onClick={() => setGarment(g)}
                      aria-pressed={on}
                      className={`flex flex-col items-start gap-1 border px-4 py-3.5 text-left transition-colors ${
                        on
                          ? 'border-ink bg-ink text-paper'
                          : 'border-ink/15 hover:border-ink/50'
                      }`}
                    >
                      <span className="text-[14px] font-medium">{garments[g].short}</span>
                      <span
                        className={`font-mono text-[11.5px] ${on ? 'opacity-70' : 'text-smoke'}`}
                      >
                        {money(customPrice[g])}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Step>

            <Step
              n="02"
              title="Your print"
              aside={mode === 'words' ? 'Words' : upload ? 'Your artwork' : 'Artwork'}
            >
              {/* mode switch */}
              <div className="grid grid-cols-2 rounded-full bg-ink/[0.05] p-1">
                {(
                  [
                    { id: 'words', label: 'Write words' },
                    { id: 'artwork', label: 'Upload artwork' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMode(t.id)}
                    aria-pressed={mode === t.id}
                    className="relative rounded-full py-2.5 text-[13.5px] transition-colors"
                  >
                    {mode === t.id && (
                      <motion.span
                        layoutId="studio-mode"
                        className="absolute inset-0 rounded-full bg-paper shadow-sm ring-1 ring-ink/10"
                        transition={{ duration: 0.35, ease: EASE }}
                      />
                    )}
                    <span
                      className={`relative ${mode === t.id ? 'font-medium' : 'text-smoke'}`}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {mode === 'words' ? (
                  <motion.div
                    key="words"
                    className="mt-5 grid gap-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div>
                      <div className="mb-2 flex items-baseline justify-between">
                        <Label>Your words</Label>
                        <button
                          onClick={inspire}
                          className="text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
                        >
                          Inspire me
                        </button>
                      </div>
                      <div className="grid gap-2">
                        {lines.map((l, i) => (
                          <label
                            key={i}
                            className="group flex items-center border border-ink/15 transition-colors focus-within:border-ink hover:border-ink/40"
                          >
                            <span className="w-11 shrink-0 text-center font-mono text-[11px] text-smoke">
                              {i + 1}
                            </span>
                            <input
                              value={l}
                              onChange={(e) => setLine(i, e.target.value)}
                              placeholder={i === 0 ? 'Line one' : 'Optional'}
                              spellCheck={false}
                              aria-label={`Line ${i + 1}`}
                              className="h-12 min-w-0 flex-1 bg-transparent pr-2 text-[15px] outline-none placeholder:text-ink/25"
                            />
                            <span
                              className={`w-14 shrink-0 pr-3 text-right font-mono text-[11px] tabular-nums ${
                                l.length >= MAX_CHARS ? 'text-ink' : 'text-ink/35'
                              }`}
                            >
                              {l.length}/{MAX_CHARS}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Typeface</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {FACES.map((f) => {
                          const on = face === f.id
                          return (
                            <button
                              key={f.id}
                              onClick={() => setFace(f.id)}
                              aria-pressed={on}
                              className={`flex flex-col items-center gap-1 border py-3.5 transition-colors ${
                                on
                                  ? 'border-ink bg-ink text-paper'
                                  : 'border-ink/15 hover:border-ink/50'
                              }`}
                            >
                              <span
                                className="text-[1.7rem] leading-none"
                                style={f.sample}
                              >
                                Aa
                              </span>
                              <span
                                className={`text-[12px] ${on ? 'opacity-75' : 'text-smoke'}`}
                              >
                                {f.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="artwork"
                    className="mt-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        pickFile(e.dataTransfer.files?.[0])
                      }}
                      className="flex cursor-pointer items-center gap-4 border border-dashed border-ink/30 p-4 transition-colors hover:border-ink"
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickFile(e.target.files?.[0])}
                      />
                      <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden bg-ink/[0.05]">
                        {upload ? (
                          <img
                            src={upload.url}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xl text-smoke">+</span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium">
                          {upload ? upload.name : 'Drop your design here'}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-smoke">
                          {upload ? 'Tap to replace' : 'or tap to browse · PNG or JPG'}
                        </span>
                      </span>
                    </label>
                    {upload && (
                      <button
                        onClick={() => {
                          setUpload(null)
                          if (fileRef.current) fileRef.current.value = ''
                        }}
                        className="mt-2.5 text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
                      >
                        Remove image
                      </button>
                    )}
                    <p className="mt-3 text-[13px] leading-relaxed text-smoke">
                      WhatsApp links can only carry text, so your order will say an image
                      is coming — send the picture as your next message in the chat.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* the reference — typed, not picked */}
              <div className="mt-6">
                <label htmlFor="studio-ref">
                  <Label>Bible reference (optional)</Label>
                </label>
                <div className="mt-2 flex items-center border border-ink/15 transition-colors focus-within:border-ink hover:border-ink/40">
                  <input
                    id="studio-ref"
                    value={verseRef}
                    onChange={(e) => setVerseRef(e.target.value.slice(0, MAX_REF))}
                    placeholder="e.g. Isaiah 41:10"
                    spellCheck={false}
                    autoComplete="off"
                    className="h-12 min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-ink/25"
                  />
                  {verseRef && (
                    <button
                      onClick={() => setVerseRef('')}
                      aria-label="Clear reference"
                      className="mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] text-smoke transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[12.5px]">
                  <span className="mr-1 text-smoke">Try</span>
                  {QUICK_REFS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setVerseRef(r)}
                      className={`rounded-full px-2.5 py-1 transition-colors ${
                        verseRef.toLowerCase() === r.toLowerCase()
                          ? 'bg-ink text-paper'
                          : 'bg-ink/[0.05] hover:bg-ink/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12.5px] text-smoke">
                  Printed small under your words, in capitals.
                </p>
              </div>
            </Step>

            <Step n="03" title="Size" aside={size ?? 'Unisex fit'} id="studio-size">
              <motion.div
                key={nudge}
                animate={nudge ? { x: [0, -6, 5, -3, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-5 gap-2"
              >
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`h-12 border text-[14px] transition-colors ${
                      size === s
                        ? 'border-ink bg-ink text-paper'
                        : !size && nudge > 0
                          ? 'border-ink/60'
                          : 'border-ink/15 hover:border-ink/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            </Step>

            <Step n="04" title="Anything else" aside="Optional">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 280))}
                rows={3}
                placeholder="A back print, placement, a second colour, a deadline…"
                className="w-full resize-none border border-ink/15 bg-transparent px-4 py-3.5 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-ink/25 hover:border-ink/40 focus:border-ink"
              />
              <p className="mt-1.5 text-right font-mono text-[11px] text-ink/35">
                {note.length}/280
              </p>
            </Step>

            <li className="pt-2 lg:hidden">{checkout}</li>
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------- building blocks ---------------- */

function Step({
  n,
  title,
  aside,
  id,
  children,
}: {
  n: string
  title: string
  aside?: string
  id?: string
  children: ReactNode
}) {
  return (
    <li id={id} className="border-b border-ink/12 py-7">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="flex items-baseline gap-3">
          <span className="font-mono text-[12px] text-ink/40">{n}</span>
          <span className="headline text-[1.45rem]">{title}</span>
        </h3>
        {aside && <span className="truncate text-[13px] text-smoke">{aside}</span>}
      </div>
      {children}
    </li>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-[13.5px] font-medium">{children}</span>
}
