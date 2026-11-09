import { scrollToId } from '../lib/scroll'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

const FACTS = [
  {
    k: 'Where the money goes',
    v: 'Straight back into fellowship — outreach weeks, retreats, and the people who cannot cover a ticket.',
  },
  {
    k: 'How it is made',
    v: 'Printed locally in Kigali, in small runs, to order. Nothing sits in a box waiting to be thrown out.',
  },
  {
    k: 'Who it is for',
    v: 'Anyone on campus. You do not have to be in the fellowship to wear what it believes.',
  },
]

/** Four photographs, shown plainly. */
const LOOKBOOK = [
  { src: '/shots/02.jpg', alt: 'Crowned oversized tee in white' },
  { src: '/shots/09.jpg', alt: 'Crowned heavyweight tee in midnight' },
  { src: '/shots/06.jpg', alt: 'Left chest tee, front and back' },
  { src: '/shots/04.jpg', alt: 'Crowned tee in violet acid wash' },
]

export default function Story() {
  return (
    <section id="about" className="bg-ink py-18 text-paper md:py-24">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow opacity-50">About</span>
            <h2 className="headline mt-3 text-[clamp(2.3rem,6vw,4.4rem)]">
              We are not selling clothes
            </h2>
            <p className="display mt-4 text-[clamp(1.4rem,3.2vw,2.1rem)] italic opacity-80">
              We are handing out sermons.
            </p>
            <p className="mt-7 max-w-lg leading-relaxed text-fog">
              ALUCF is the Christian Fellowship at African Leadership University. We
              gather, we pray, we argue about hard things, and we send each other out on
              Monday morning. This drop is the fellowship made wearable — every piece
              carries a line we have actually leaned on.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button onClick={() => scrollToId('shop')}>See the drop</Button>
              <img
                src="/brand/logo-white.png"
                alt="ALU Christian Fellowship"
                className="h-9 w-auto opacity-75"
              />
            </div>
          </Reveal>

          <dl className="grid content-start gap-7">
            {FACTS.map((f, i) => (
              <Reveal key={f.k} delay={i * 0.07}>
                <div className="border-t border-paper/20 pt-5">
                  <dt className="text-[15px] font-semibold tracking-[-0.01em]">{f.k}</dt>
                  <dd className="mt-2 max-w-md text-[15px] text-fog">{f.v}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* ---------------- lookbook ---------------- */}
        <Reveal>
          <div className="mt-16 flex items-end justify-between gap-6 border-t border-paper/20 pt-7">
            <h3 className="headline text-[clamp(1.5rem,3.4vw,2.4rem)]">Worn on campus</h3>
            <p className="max-w-xs text-right text-[13px] text-fog/70">
              Tag us and we will put you here.
            </p>
          </div>
        </Reveal>

        <ul className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {LOOKBOOK.map((s, i) => (
            <Reveal as="li" key={s.src} delay={i * 0.06}>
              <div className="relative aspect-square overflow-hidden bg-slate">
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
