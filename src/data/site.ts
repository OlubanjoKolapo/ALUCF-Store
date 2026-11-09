/**
 * Single place to edit everything the fellowship will want to change.
 * No code changes needed beyond this file for the common stuff.
 */
export const site = {
  name: 'ALUCF Store',
  longName: 'ALU Christian Fellowship',
  tagline: 'Wear The Word',

  /** ⚠️ REPLACE with the fellowship WhatsApp number. Digits only, full
   *  international format, no +, no spaces. e.g. Rwanda 0788123456 -> 250788123456 */
  whatsappNumber: '250788000000',

  instagram: 'https://instagram.com/',
  email: 'alucf.store@alustudent.com',

  currency: { code: 'RWF', position: 'suffix' as 'prefix' | 'suffix' },

  /** Pickup / delivery options offered at checkout. */
  fulfilment: [
    {
      id: 'campus',
      label: 'Campus pickup',
      note: 'ALU Kigali — collect at fellowship service',
    },
    {
      id: 'delivery',
      label: 'Kigali delivery',
      note: 'Rider dispatch, fee confirmed on WhatsApp',
    },
    {
      id: 'other',
      label: 'Something else',
      note: "Tell us on WhatsApp and we'll sort it",
    },
  ],

  dropName: 'Drop 01 — Living Letters',
  dropWindow: 'Orders close end of term',
} as const

export const money = (amount: number) => {
  const n = new Intl.NumberFormat('en-US').format(amount)
  return site.currency.position === 'prefix'
    ? `${site.currency.code} ${n}`
    : `${n} ${site.currency.code}`
}
