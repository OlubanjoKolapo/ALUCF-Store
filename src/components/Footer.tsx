import { site } from '../data/site'
import { scrollToId, scrollToTop } from '../lib/scroll'
import { enquiryLink } from '../lib/whatsapp'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="shell py-20 md:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <img src="/brand/mark-white.png" alt="" className="mx-auto h-14 w-auto" />
          <h2 className="headline mt-7 text-[clamp(2rem,5.5vw,3.6rem)]">
            Say it out loud. Then wear it.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-fog">
            One tap into our WhatsApp and a real person picks it up. No accounts, no card
            details, no waiting on a form to be read.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              href={enquiryLink('I would like to place a merch order')}
              target="_blank"
              rel="noreferrer"
            >
              Order on WhatsApp
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId('shop')}>
              Back to the shop
            </Button>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 border-t border-paper/20 pt-10 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div>
            <p className="display text-xl italic">{site.tagline}</p>
            <p className="mt-2 max-w-xs text-[14px] text-fog/80">
              Merch of the {site.longName}. Printed in Kigali, to order.
            </p>
          </div>

          <nav>
            <h3 className="mb-3 text-[14px] font-semibold">Shop</h3>
            <ul className="grid gap-2">
              {[
                ['shop', 'All pieces'],
                ['studio', 'Design your own'],
                ['how', 'How it works'],
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToId(id)}
                    className="text-[14px] text-fog transition-colors hover:text-paper"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3 className="mb-3 text-[14px] font-semibold">Reach us</h3>
            <ul className="grid gap-2">
              <li>
                <a
                  href={enquiryLink('Hello!')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] text-fog transition-colors hover:text-paper"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] text-fog transition-colors hover:text-paper"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-[14px] text-fog transition-colors hover:text-paper"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </nav>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group grid h-12 w-12 shrink-0 place-items-center self-start rounded-full border border-paper/30 transition-colors hover:border-paper md:justify-self-end"
          >
            <span className="transition-transform duration-500 group-hover:-translate-y-1">
              ↑
            </span>
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-6 text-[13px] text-fog/60">
          <span>
            © {YEAR} {site.longName}
          </span>
          <span>{site.dropName}</span>
        </div>
      </div>
    </footer>
  )
}
