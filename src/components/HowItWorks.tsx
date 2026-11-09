import { scrollToId } from '../lib/scroll'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

const STEPS = [
  {
    n: '01',
    title: 'Pick or design',
    body: 'Choose a piece from the drop, or write your own words onto one in the studio. You see exactly how it will print.',
  },
  {
    n: '02',
    title: 'Send on WhatsApp',
    body: 'Add your size and name. One tap opens WhatsApp with your order already typed out — you just press send.',
  },
  {
    n: '03',
    title: 'We confirm, then print',
    body: 'We reply with the final total and a mock-up if it is a custom piece. Pay by MoMo or cash at fellowship.',
  },
]

/**
 * Three steps, stated plainly. A WhatsApp checkout is unusual enough
 * that saying how it works up front removes most of the hesitation.
 */
export default function HowItWorks() {
  return (
    <section id="how" className="bg-ink py-18 text-paper md:py-24">
      <div className="shell">
        <Reveal>
          <span className="eyebrow opacity-50">No accounts, no card forms</span>
          <h2 className="headline mt-3 text-[clamp(2.3rem,6vw,4.4rem)]">
            How ordering works
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.08}>
              <div className="border-t border-paper/25 pt-5">
                <span className="headline block text-[2.6rem] opacity-30">{s.n}</span>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-fog">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center gap-5 border-t border-paper/15 pt-8">
            <Button onClick={() => scrollToId('shop')}>Start shopping</Button>
            <p className="text-[14px] text-fog/80">
              Nothing is charged on this site. We confirm every order in the chat first.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
