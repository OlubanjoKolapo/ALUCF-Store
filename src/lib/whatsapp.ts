import { colorways, garments, sizeLabel } from '../data/products'
import { money, site } from '../data/site'
import type { CartLine } from './types'

export type OrderDetails = {
  name: string
  phone: string
  cohort: string
  fulfilment: string
  notes: string
}

const FACE_LABEL: Record<string, string> = {
  display: 'Serif italic',
  sans: 'Bold sans',
  mono: 'Mono / typewriter',
}

/** Short human-readable ref so the fellowship can track a chat. */
export function orderRef() {
  const chars = 'ACDEFGHJKLMNPQRTUVWXY349'
  let out = ''
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `ALUCF-${out}`
}

export function buildOrderMessage(
  lines: CartLine[],
  details: OrderDetails,
  ref: string,
): string {
  const out: string[] = []
  const fulfilment =
    site.fulfilment.find((f) => f.id === details.fulfilment)?.label ?? details.fulfilment

  out.push(`*ALUCF STORE — NEW ORDER*`)
  out.push(`Ref: ${ref}`)
  out.push(`Drop: ${site.dropName}`)
  out.push('')

  out.push('*— WHO —*')
  out.push(`Name: ${details.name || '(not given)'}`)
  if (details.phone) out.push(`Phone: ${details.phone}`)
  if (details.cohort) out.push(`Cohort / Year: ${details.cohort}`)
  out.push('')

  out.push('*— ORDER —*')
  let needsAttachment = false

  lines.forEach((l, i) => {
    const cw = colorways[l.colorway].label
    const gm = garments[l.garment].label
    out.push(`${i + 1}. ${l.kind === 'custom' ? 'CUSTOM DESIGN' : l.name} — ${gm}`)
    out.push(`   Colour: ${cw}`)
    out.push(`   Size: ${sizeLabel(l.size)}  |  Qty: ${l.qty}`)
    out.push(`   ${money(l.unitPrice)} each`)

    if (l.kind === 'custom' && l.custom) {
      const text = l.custom.lines.filter(Boolean)
      if (text.length) out.push(`   Front print: "${text.join(' / ')}"`)
      out.push(`   Typeface: ${FACE_LABEL[l.custom.face] ?? l.custom.face}`)
      if (l.custom.verseRef) out.push(`   Verse: ${l.custom.verseRef}`)
      if (l.custom.note) out.push(`   Brief: ${l.custom.note}`)
      if (l.custom.upload) {
        needsAttachment = true
        out.push(`   Reference image: ${l.custom.upload.name} (attached below)`)
      }
    }
    out.push('')
  })

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const total = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0)

  out.push('*— TOTAL —*')
  out.push(`${count} item${count === 1 ? '' : 's'} · ${money(total)}`)
  out.push('(final total confirmed by the team before payment)')
  out.push('')

  out.push('*— COLLECTION —*')
  out.push(fulfilment)
  if (details.notes) {
    out.push('')
    out.push('*— NOTES —*')
    out.push(details.notes)
  }

  if (needsAttachment) {
    out.push('')
    out.push('📎 Sending my design image as the next message in this chat.')
  }

  out.push('')
  out.push('— sent from the ALUCF Store')

  return out.join('\n')
}

export function whatsappLink(message: string, number = site.whatsappNumber) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

/** Quick enquiry link used by the nav and footer. */
export function enquiryLink(topic: string) {
  return whatsappLink(`Hi ALUCF Store 👋 — ${topic}`)
}
