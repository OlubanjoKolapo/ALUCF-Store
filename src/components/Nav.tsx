import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { useCart } from '../lib/cart'
import { useEscape, useScrollLock } from '../lib/hooks'
import { scrollToId, scrollToTop } from '../lib/scroll'
import { enquiryLink } from '../lib/whatsapp'

const LINKS = [
  { id: 'shop', label: 'Shop' },
  { id: 'studio', label: 'Design yours' },
  { id: 'how', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'questions', label: 'FAQ' },
]

/** Whichever section is crossing the middle of the screen is the live one. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    )
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return active
}

/**
 * A notice strip over a black bar. The strip folds away on the first
 * scroll so the bar stays shallow, and the bar goes solid at the same
 * moment, because the section beneath it is white.
 */
export default function Nav({ onOpenBag }: { onOpenBag: () => void }) {
  const { count } = useCart()
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [menu, setMenu] = useState(false)
  const active = useActiveSection()

  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40))
  useScrollLock(menu)
  useEscape(menu, () => setMenu(false))

  const go = (id: string) => {
    setMenu(false)
    window.setTimeout(() => scrollToId(id), menu ? 220 : 0)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[150] text-paper transition-colors duration-300 ${
          solid ? 'bg-ink/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        {/* ---------------- notice strip ---------------- */}
        <div
          aria-hidden={solid}
          className={`overflow-hidden bg-paper text-ink transition-[max-height,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
            solid ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
          }`}
        >
          <p className="eyebrow flex h-9 items-center justify-center gap-3 px-4 text-center text-[10px]">
            Printed in Kigali
            <span className="opacity-30">/</span>
            Campus pickup at fellowship
            <span className="hidden opacity-30 sm:inline">/</span>
            <span className="hidden sm:inline">Pay on MoMo, never on this site</span>
          </p>
        </div>

        <nav
          className={`shell grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-6 border-b transition-colors duration-300 ${
            solid ? 'border-paper/12' : 'border-transparent'
          }`}
        >
          <button
            onClick={scrollToTop}
            className="flex items-center gap-3"
            aria-label="Back to top"
          >
            <img src="/brand/mark-white.png" alt="ALUCF" className="h-10 w-auto" />
          </button>

          <ul className="hidden items-center justify-center gap-9 lg:flex">
            {LINKS.map((l) => {
              const on = active === l.id
              return (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    aria-current={on ? 'true' : undefined}
                    className={`group relative py-1 text-[14px] transition-opacity ${
                      on ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {l.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 block h-px bg-paper transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                        on ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-end gap-2">
            <a
              href={enquiryLink('I have a question about the merch')}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 items-center rounded-full border border-paper/35 px-4 text-[13px] transition-colors hover:border-paper xl:inline-flex"
            >
              WhatsApp us
            </a>

            <button
              onClick={onOpenBag}
              className={`flex h-10 items-center gap-2.5 rounded-full border px-4 text-[13px] transition-colors ${
                count > 0
                  ? 'border-paper bg-paper text-ink'
                  : 'border-paper/40 hover:bg-paper hover:text-ink'
              }`}
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
            >
              Bag
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[11px] tabular-nums ${
                  count > 0 ? 'bg-ink text-paper' : 'bg-paper/15'
                }`}
              >
                {count}
              </span>
            </button>

            <button
              onClick={() => setMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-paper/40 transition-colors hover:border-paper lg:hidden"
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-[4px]">
                <span className="block h-px w-4 bg-paper" />
                <span className="block h-px w-4 bg-paper" />
                <span className="block h-px w-4 bg-paper" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ---------------- mobile menu ---------------- */}
      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[240] flex flex-col bg-ink text-paper lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="shell flex h-[4.25rem] shrink-0 items-center justify-between">
              <img src="/brand/mark-white.png" alt="" className="h-8 w-auto" />
              <button
                onClick={() => setMenu(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-paper/40"
              >
                ✕
              </button>
            </div>

            <ul className="shell flex flex-1 flex-col justify-center">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  className="border-b border-paper/15 first:border-t"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.05 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <button
                    onClick={() => go(l.id)}
                    className="flex w-full items-baseline justify-between gap-4 py-5 text-left"
                  >
                    <span className="headline text-[2.1rem]">{l.label}</span>
                    <span className="eyebrow opacity-35">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="shell flex shrink-0 flex-col gap-3 pb-9">
              <a
                href={enquiryLink('I have a question about the merch')}
                target="_blank"
                rel="noreferrer"
                className="flex h-13 items-center justify-center rounded-full bg-paper text-[13px] font-medium text-ink"
              >
                Message us on WhatsApp
              </a>
              <p className="text-center text-[12.5px] text-fog/60">{site.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
