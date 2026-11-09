import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { coverShot, products } from '../data/products'
import { scrollToId } from '../lib/scroll'
import Button from './ui/Button'

const lead = products[0]
const photo = coverShot(lead)
const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  /** false while the intro is still on screen — everything waits for it */
  ready: boolean
}

/** A headline line that rises out of its own clipped box. */
function Line({
  children,
  show,
  delay,
}: {
  children: string
  show: boolean
  delay: number
}) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={false}
        animate={{ y: show ? '0%' : '108%' }}
        transition={reduce ? { duration: 0 } : { duration: 1.15, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * The photograph is the background. On a laptop it fills the right
 * three-fifths of the screen and dissolves into black on its left edge,
 * which is where the headline sits — so the type crosses onto the
 * picture without ever fighting it. On a phone the picture fills the top
 * of the screen and the headline lands on its lower fade.
 */
export default function Hero({ ready }: Props) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const drift = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%'])
  const dim = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.4])

  const rise = (delay: number) =>
    reduce ? { duration: 0 } : { duration: 0.9, delay, ease: EASE }

  return (
    <header
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden bg-ink text-paper"
    >
      {/* ================= the photograph ================= */}
      <motion.div
        className="absolute inset-x-0 top-0 -z-10 h-[72svh] overflow-hidden lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[60%]"
        style={{ y: drift, opacity: dim }}
      >
        <motion.img
          src={photo.src}
          alt={photo.alt}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-[50%_16%]"
          initial={false}
          animate={{ scale: ready ? 1 : 1.14 }}
          transition={reduce ? { duration: 0 } : { duration: 2.2, ease: EASE }}
        />

        {/* fades — black meets black, so the picture has no edge */}
        <span className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/75 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink via-ink/70 to-transparent lg:h-[42%] lg:via-ink/40" />
        <span className="absolute inset-y-0 left-0 hidden w-[42%] bg-gradient-to-r from-ink via-ink/55 to-transparent lg:block" />
      </motion.div>

      {/* ================= the words ================= */}
      <div className="mx-auto flex max-w-[104rem] flex-col px-[var(--gutter)] pt-[58svh] pb-14 lg:min-h-[max(100svh,46rem)] lg:justify-end lg:pt-40 lg:pb-20">
        <h1 className="headline text-[clamp(3.5rem,20vw,6.5rem)] md:text-[14vw] lg:text-[clamp(4.5rem,11.4vw,12rem)]">
          <Line show={ready} delay={0.16}>
            Wear
          </Line>
          <Line show={ready} delay={0.26}>
            the word
          </Line>
        </h1>

        <motion.div
          className="mt-8 flex flex-col gap-8 lg:mt-10"
          initial={false}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 18 }}
          transition={rise(0.5)}
        >
          <p className="max-w-[26rem] text-[1.0625rem] leading-relaxed text-paper/75">
            Merch of the ALU Christian Fellowship. Pick a piece or put your own words on
            one — your order goes straight to our WhatsApp.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => scrollToId('shop')}>
              Shop the drop
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId('studio')}>
              Design your own
            </Button>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
