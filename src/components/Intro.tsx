import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { useEffect } from 'react'
import { coverShot, products } from '../data/products'
import { site } from '../data/site'
import { lockScroll, unlockScroll } from '../lib/scroll'

const WORDS = ['Wear', 'the', 'word']
const CURTAIN = [0.76, 0, 0.24, 1] as const
const EASE = [0.16, 1, 0.3, 1] as const

/** Never hold the page hostage to a slow connection. */
const MIN_MS = 1500
const MAX_MS = 3200

/**
 * Two seconds of black before the page. It earns its keep: while the
 * counter runs, the hero photograph is fetched and decoded, so when the
 * curtain lifts the picture is already there instead of popping in.
 */
export default function Intro({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const progress = useMotionValue(0)
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(3, '0'))
  const bar = useTransform(progress, [0, 100], [0, 1])

  useEffect(() => {
    if (reduce) {
      onDone()
      return
    }

    // A reload halfway down the page would otherwise lift the curtain on the FAQ.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    lockScroll()

    let cancelled = false
    const img = new Image()
    img.src = coverShot(products[0]).src
    const decoded = img.decode().catch(() => undefined)
    const floor = new Promise((r) => window.setTimeout(r, MIN_MS))
    const ceiling = new Promise((r) => window.setTimeout(r, MAX_MS))
    const counted = new Promise<void>((r) => {
      animate(progress, 100, { duration: 1.5, ease: [0.65, 0, 0.35, 1], onComplete: r })
    })

    Promise.race([Promise.all([decoded, floor, counted]), ceiling]).then(() => {
      if (!cancelled) window.setTimeout(onDone, 120)
    })

    return () => {
      cancelled = true
      progress.stop()
      unlockScroll()
    }
  }, [reduce, onDone, progress])

  if (reduce) return null

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col overflow-hidden bg-ink text-paper"
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.85, ease: CURTAIN }}
      aria-hidden
    >
      {/* the contents lift a little faster than the curtain, so it reads as depth */}
      <motion.div
        className="flex flex-1 flex-col"
        exit={{ y: '-30%', opacity: 0 }}
        transition={{ duration: 0.7, ease: CURTAIN }}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.img
            src="/brand/mark-white.png"
            alt=""
            className="h-16 w-auto md:h-20"
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          <p className="headline mt-7 flex gap-[0.22em] text-[clamp(2.6rem,9vw,6rem)]">
            {WORDS.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.05em]">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, delay: 0.25 + i * 0.09, ease: EASE }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </p>

          <motion.p
            className="display mt-4 text-[clamp(1.05rem,2.4vw,1.4rem)] italic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          >
            Your words speak reality
          </motion.p>
        </div>

        <div className="shell flex items-end justify-between pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="eyebrow block opacity-50">{site.longName}</span>
            <span className="eyebrow mt-1.5 block opacity-30">{site.dropName}</span>
          </motion.div>
          <motion.span className="headline text-[clamp(2.8rem,8vw,5.5rem)] leading-none tabular-nums">
            {count}
          </motion.span>
        </div>
      </motion.div>

      <motion.span
        className="block h-[2px] origin-left bg-paper"
        style={{ scaleX: bar }}
      />
    </motion.div>
  )
}
