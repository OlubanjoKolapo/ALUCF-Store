import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { colorways, garments, sizeLabel } from '../data/products'
import { money, site } from '../data/site'
import { useCart } from '../lib/cart'
import { useEscape, useScrollLock } from '../lib/hooks'
import { scrollToId } from '../lib/scroll'
import { buildOrderMessage, orderRef, whatsappLink } from '../lib/whatsapp'
import type { OrderDetails } from '../lib/whatsapp'
import Tee from './Tee'
import Button from './ui/Button'

type Props = { open: boolean; onClose: () => void }
type Step = 'bag' | 'details' | 'sent'

const PLACEHOLDER = '250788000000'
const STEPS: { id: Step; label: string }[] = [
  { id: 'bag', label: 'Bag' },
  { id: 'details', label: 'Details' },
  { id: 'sent', label: 'Send' },
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function Bag({ open, onClose }: Props) {
  const { lines, total, count, setQty, remove, clear } = useCart()
  const [step, setStep] = useState<Step>('bag')
  const [copied, setCopied] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [ref] = useState(orderRef)
  const [details, setDetails] = useState<OrderDetails>({
    name: '',
    phone: '',
    cohort: '',
    fulfilment: site.fulfilment[0].id,
    notes: '',
  })

  useScrollLock(open)
  useEscape(open, onClose)

  const message = useMemo(
    () => buildOrderMessage(lines, details, ref),
    [lines, details, ref],
  )
  const link = whatsappLink(message)
  const ready = details.name.trim().length > 1 && details.phone.trim().length > 5
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const send = () => {
    window.open(link, '_blank', 'noopener,noreferrer')
    setStep('sent')
  }

  const shopInstead = () => {
    onClose()
    window.setTimeout(() => scrollToId('shop'), 260)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[220] flex justify-end">
          <motion.div
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.aside
            data-lenis-prevent
            className="relative z-10 flex h-full w-full flex-col bg-ink text-paper sm:w-[32rem] sm:border-l sm:border-paper/20"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* ---------------- header ---------------- */}
            <header className="shrink-0 border-b border-paper/15 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="headline text-[1.6rem]">
                  {step === 'bag'
                    ? 'Your bag'
                    : step === 'details'
                      ? 'Your details'
                      : 'Almost done'}
                </h2>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="eyebrow rounded-full border border-paper/20 px-3 py-1.5 text-[9px] opacity-50">
                    {ref}
                  </span>
                  <button
                    onClick={onClose}
                    aria-label="Close bag"
                    className="grid h-9 w-9 place-items-center rounded-full border border-paper/30 transition-colors hover:bg-paper hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* progress */}
              <ol className="mt-7 grid grid-cols-3 gap-2.5">
                {STEPS.map((s, i) => {
                  const done = i < stepIndex
                  const now = i === stepIndex
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() =>
                          i < stepIndex && step !== 'sent' ? setStep(s.id) : undefined
                        }
                        disabled={i >= stepIndex || step === 'sent'}
                        className="block w-full text-left disabled:cursor-default"
                      >
                        <span
                          className={`block h-0.5 w-full rounded-full transition-colors ${
                            done || now ? 'bg-paper' : 'bg-paper/20'
                          }`}
                        />
                        <span
                          className={`eyebrow mt-2 block text-[9.5px] transition-opacity ${
                            now ? 'opacity-100' : done ? 'opacity-55' : 'opacity-30'
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </header>

            <AnimatePresence mode="wait">
              {/* ================= bag ================= */}
              {step === 'bag' && (
                <motion.div
                  key="bag"
                  className="flex min-h-0 flex-1 flex-col"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.26 }}
                >
                  {lines.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-10 text-center">
                      <img
                        src="/brand/mark-white.png"
                        alt=""
                        className="h-14 w-auto opacity-25"
                      />
                      <div>
                        <p className="headline text-[1.4rem]">Nothing in here yet</p>
                        <p className="mt-2.5 text-[14px] leading-relaxed text-fog/80">
                          Pick a piece from the drop, or put your own words on one in the
                          studio.
                        </p>
                      </div>
                      <Button onClick={shopInstead}>Shop the drop</Button>
                    </div>
                  ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                      <ul className="grid gap-4">
                        <AnimatePresence initial={false}>
                          {lines.map((l) => (
                            <motion.li
                              key={l.key}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0, marginBottom: -16 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="flex gap-4 border-b border-paper/12 pb-5">
                                {l.thumb ? (
                                  <img
                                    src={l.thumb}
                                    alt=""
                                    className="h-28 w-[5.5rem] shrink-0 object-cover"
                                  />
                                ) : (
                                  <div
                                    className="grid h-28 w-[5.5rem] shrink-0 place-items-center px-2"
                                    style={{
                                      background:
                                        l.colorway === 'white' ? '#0f0f0f' : '#e9e9e9',
                                    }}
                                  >
                                    <Tee
                                      garment={l.garment}
                                      colorway={l.colorway}
                                      print={l.print}
                                      alt={l.name}
                                      className="w-full"
                                    />
                                  </div>
                                )}

                                <div className="flex min-w-0 flex-1 flex-col">
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.02em]">
                                      {l.name}
                                    </h3>
                                    <button
                                      onClick={() => remove(l.key)}
                                      aria-label={`Remove ${l.name}`}
                                      className="-mt-1 -mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] opacity-40 transition-opacity hover:bg-paper/10 hover:opacity-100"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <p className="mt-1 text-[12.5px] text-fog/75">
                                    {garments[l.garment].label} ·{' '}
                                    {colorways[l.colorway].label} · {sizeLabel(l.size)}
                                  </p>

                                  {l.custom?.lines?.length ? (
                                    <p className="mt-1.5 truncate text-[12.5px] text-fog">
                                      &ldquo;{l.custom.lines.join(' / ')}&rdquo;
                                    </p>
                                  ) : null}
                                  {l.custom?.upload && (
                                    <p className="eyebrow mt-1 text-[9px] opacity-40">
                                      + artwork to send in the chat
                                    </p>
                                  )}

                                  <div className="mt-auto flex items-center justify-between pt-3">
                                    <div className="flex items-center rounded-full border border-paper/25">
                                      <button
                                        onClick={() => setQty(l.key, l.qty - 1)}
                                        className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-paper hover:text-ink"
                                        aria-label="Fewer"
                                      >
                                        –
                                      </button>
                                      <span className="w-6 text-center font-mono text-[12px] tabular-nums">
                                        {l.qty}
                                      </span>
                                      <button
                                        onClick={() => setQty(l.key, l.qty + 1)}
                                        className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-paper hover:text-ink"
                                        aria-label="More"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <span className="font-mono text-[12.5px] tabular-nums">
                                      {money(l.unitPrice * l.qty)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>

                      <div className="mt-5 flex items-center justify-between">
                        <button
                          onClick={shopInstead}
                          className="text-[13px] text-fog underline underline-offset-4 transition-colors hover:text-paper"
                        >
                          Add something else
                        </button>
                        <button
                          onClick={clear}
                          className="text-[13px] text-fog/50 underline underline-offset-4 transition-colors hover:text-paper"
                        >
                          Empty the bag
                        </button>
                      </div>
                    </div>
                  )}

                  {lines.length > 0 && (
                    <footer className="shrink-0 border-t border-paper/15 px-6 py-5">
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                          <span className="eyebrow opacity-45">
                            Subtotal · {count} item{count === 1 ? '' : 's'}
                          </span>
                          <span className="mt-1.5 block font-mono text-2xl tabular-nums">
                            {money(total)}
                          </span>
                        </div>
                        <span className="max-w-[10rem] text-right text-[12px] text-fog/55">
                          Delivery agreed in the chat
                        </span>
                      </div>
                      <Button size="lg" full onClick={() => setStep('details')}>
                        Continue
                      </Button>
                    </footer>
                  )}
                </motion.div>
              )}

              {/* ================= details ================= */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  className="flex min-h-0 flex-1 flex-col"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.26 }}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-4">
                      <Input
                        label="Your name"
                        value={details.name}
                        onChange={(v) => setDetails((d) => ({ ...d, name: v }))}
                        placeholder="Grace Uwase"
                      />
                      <Input
                        label="WhatsApp number"
                        value={details.phone}
                        onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
                        placeholder="+250 7.. .. .. .."
                        type="tel"
                      />
                      <Input
                        label="Cohort or year (optional)"
                        value={details.cohort}
                        onChange={(v) => setDetails((d) => ({ ...d, cohort: v }))}
                        placeholder="BEL 2027"
                      />

                      <div className="mt-2">
                        <span className="eyebrow mb-2.5 block opacity-45">
                          How do you want it?
                        </span>
                        <div className="grid gap-2">
                          {site.fulfilment.map((f) => {
                            const on = details.fulfilment === f.id
                            return (
                              <button
                                key={f.id}
                                onClick={() =>
                                  setDetails((d) => ({ ...d, fulfilment: f.id }))
                                }
                                className={`flex items-start gap-3 border px-4 py-3 text-left transition-colors ${
                                  on
                                    ? 'border-paper bg-paper text-ink'
                                    : 'border-paper/20 hover:border-paper/60'
                                }`}
                              >
                                <span
                                  className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${
                                    on ? 'border-ink bg-ink' : 'border-paper/50'
                                  }`}
                                />
                                <span className="min-w-0">
                                  <span className="block text-[14px]">{f.label}</span>
                                  <span
                                    className={`mt-0.5 block text-[12px] ${
                                      on ? 'opacity-70' : 'text-fog/70'
                                    }`}
                                  >
                                    {f.note}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="eyebrow mb-2 block opacity-45">
                          Anything to add?
                        </span>
                        <textarea
                          rows={2}
                          value={details.notes}
                          onChange={(e) =>
                            setDetails((d) => ({
                              ...d,
                              notes: e.target.value.slice(0, 300),
                            }))
                          }
                          placeholder="A gift, a deadline, a question…"
                          className="w-full resize-none border border-paper/20 bg-transparent px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-paper/30 focus:border-paper"
                        />
                      </div>

                      {/* the exact message, folded away until asked for */}
                      <div className="mt-2 border border-paper/20">
                        <button
                          onClick={() => setShowMessage((v) => !v)}
                          aria-expanded={showMessage}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                        >
                          <span className="text-[13.5px]">What we will receive</span>
                          <span className="flex items-center gap-3">
                            <span className="eyebrow text-[9px] opacity-45">
                              {showMessage ? 'hide' : 'show'}
                            </span>
                            <motion.span
                              className="relative grid h-6 w-6 place-items-center rounded-full border border-paper/30"
                              animate={{ rotate: showMessage ? 45 : 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                            >
                              <span className="absolute h-px w-2.5 bg-paper" />
                              <span className="absolute h-2.5 w-px bg-paper" />
                            </motion.span>
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {showMessage && (
                            <motion.div
                              key="preview"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-paper/15 px-4 py-4">
                                <pre className="max-h-64 overflow-y-auto font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-fog">
                                  {message}
                                </pre>
                                <button
                                  onClick={() => {
                                    navigator.clipboard?.writeText(message)
                                    setCopied(true)
                                    window.setTimeout(() => setCopied(false), 1800)
                                  }}
                                  className="mt-3 text-[13px] underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
                                >
                                  {copied ? 'Copied' : 'Copy the message'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {site.whatsappNumber === PLACEHOLDER && (
                        <p className="border border-paper/40 p-3.5 text-[12px] leading-relaxed">
                          <span className="eyebrow block pb-1.5 text-[9px]">
                            Set-up step
                          </span>
                          The store still has the placeholder WhatsApp number. Edit{' '}
                          <code className="font-mono">whatsappNumber</code> in{' '}
                          <code className="font-mono">src/data/site.ts</code>.
                        </p>
                      )}
                    </div>
                  </div>

                  <footer className="shrink-0 border-t border-paper/15 px-6 py-5">
                    <div className="mb-4 flex items-end justify-between">
                      <span className="eyebrow opacity-45">
                        {count} item{count === 1 ? '' : 's'}
                      </span>
                      <span className="font-mono text-lg tabular-nums">
                        {money(total)}
                      </span>
                    </div>
                    <Button size="lg" full onClick={send} magnetic={ready}>
                      {ready ? 'Send order on WhatsApp' : 'Add your name and number'}
                    </Button>
                    <p className="mt-3 text-center text-[12px] text-fog/55">
                      Nothing is charged here — we confirm first
                    </p>
                  </footer>
                </motion.div>
              )}

              {/* ================= sent ================= */}
              {step === 'sent' && (
                <motion.div
                  key="sent"
                  className="flex flex-1 flex-col items-center justify-center gap-7 px-9 text-center"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <img src="/brand/mark-white.png" alt="" className="h-14 w-auto" />
                  <div>
                    <h3 className="headline text-[1.9rem]">WhatsApp is open</h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-fog">
                      Press send in the chat and we have your order. Keep the reference{' '}
                      <span className="font-mono text-paper">{ref}</span> handy.
                    </p>
                  </div>
                  <div className="grid w-full gap-2.5">
                    <Button
                      variant="outline"
                      full
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open the chat again
                    </Button>
                    <Button
                      variant="outline"
                      full
                      onClick={() => {
                        clear()
                        setStep('bag')
                        onClose()
                      }}
                    >
                      Done — clear my bag
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block opacity-45">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full border border-paper/20 bg-transparent px-4 text-[14px] outline-none transition-colors placeholder:text-paper/30 focus:border-paper"
      />
    </label>
  )
}
