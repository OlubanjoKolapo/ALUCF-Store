import { scrollToId } from '../lib/scroll'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

/**
 * A full-bleed breath between the shop and the studio: half type, half
 * photograph. Splitting it rather than laying type over the picture keeps
 * the words readable and the photograph at its own resolution.
 */
export default function Campaign() {
  return (
    <section className="bg-ink text-paper">
      <div className="grid lg:grid-cols-2">
        <div className="order-2 flex items-center px-[var(--gutter)] py-16 md:py-24 lg:order-1 lg:justify-end lg:py-28">
          <Reveal className="w-full max-w-xl lg:pr-8">
            <span className="eyebrow opacity-60">Proverbs 18:21</span>
            <h2 className="headline mt-4 text-[clamp(2.6rem,7vw,5rem)]">
              Your words
              <br />
              speak reality
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-fog">
              Death and life are in the power of the tongue. So we print the things worth
              repeating — and if the line you need is not in the drop, you can put it on a
              shirt yourself in about a minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => scrollToId('studio')}>
                Design your own
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToId('shop')}>
                See the drop
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="relative order-1 min-h-[22rem] lg:order-2 lg:min-h-[40rem]">
          <img
            src="/shots/05.jpg"
            alt="Clay wash tee with the Crowned back print"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-[50%_38%]"
          />
        </div>
      </div>
    </section>
  )
}
