import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { site } from '../data/site'
import { enquiryLink } from '../lib/whatsapp'
import Button from './ui/Button'
import Reveal from './ui/Reveal'

const QA = [
  {
    q: 'How do I pay?',
    a: 'Not on this site. Your order arrives in our WhatsApp as a tidy message, we confirm sizes and the final total, then you pay by MoMo or cash at fellowship. Nothing is charged automatically.',
  },
  {
    q: 'How long does a piece take?',
    a: 'Catalogue pieces usually go out within a week of the order being confirmed. Made-to-order designs take longer, because we send you a mock-up to approve before anything is printed.',
  },
  {
    q: 'Can I put any verse on a shirt?',
    a: 'Yes — up to three short lines in one of three typefaces, and you see exactly how it sits before you order. If the builder cannot do what you want, describe it in the notes and we will draw it with you.',
  },
  {
    q: 'What if the size is wrong?',
    a: 'Tell us in the chat. Unworn pieces can be swapped while the drop is still open, as long as it is not a made-to-order design.',
  },
  {
    q: 'I already have artwork. Can you print it?',
    a: 'Upload it in the studio so you can see it on the garment. A WhatsApp link cannot carry a file, so your order message says an image is coming and you send the picture as your next message in the chat.',
  },
  {
    q: 'Can my class or club order together?',
    a: 'Our favourite kind of order. Message us with roughly how many and what you want on them, and we will quote a group price.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="questions" className="bg-paper py-20 text-ink md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <span className="eyebrow opacity-50">Questions</span>
          <h2 className="headline mt-3 text-[clamp(2rem,4.6vw,3.2rem)]">
            Before you order
          </h2>
          <p className="mt-5 max-w-xs text-smoke">
            There is a human on the other end of the WhatsApp, usually within the hour.
          </p>
          <div className="mt-7">
            <Button
              tone="light"
              href={enquiryLink('I have a question about the merch')}
              target="_blank"
              rel="noreferrer"
            >
              Message the team
            </Button>
          </div>
          <p className="mt-5 text-[14px] text-smoke">{site.email}</p>
        </Reveal>

        <ul className="border-t border-ink/15">
          {QA.map((item, i) => {
            const on = open === i
            return (
              <Reveal as="li" key={item.q} delay={Math.min(i, 4) * 0.04}>
                <div className="border-b border-ink/15">
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    aria-expanded={on}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[17px] font-medium tracking-[-0.01em]">
                      {item.q}
                    </span>
                    <motion.span
                      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/25"
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="absolute h-px w-3 bg-ink" />
                      <span className="absolute h-3 w-px bg-ink" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 text-[15px] leading-relaxed text-smoke">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
