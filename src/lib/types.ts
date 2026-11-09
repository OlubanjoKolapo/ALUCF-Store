import type { ColorwayId, GarmentId, Print, SizeId } from '../data/products'

export type CustomSpec = {
  /** what the wearer wants on the chest */
  lines: string[]
  face: 'display' | 'sans' | 'mono'
  verseRef?: string
  /** free-text brief for anything the form cannot capture */
  note?: string
  /** a reference image the wearer picked locally */
  upload?: { name: string; url: string }
}

export type CartLine = {
  key: string
  kind: 'catalog' | 'custom'
  productId?: string
  name: string
  garment: GarmentId
  colorway: ColorwayId
  size: SizeId
  qty: number
  unitPrice: number
  /** catalogue lines carry the photograph; custom lines draw a preview instead */
  thumb?: string
  print?: Print
  custom?: CustomSpec
}

/** The blanks the studio can print on, in the order they are offered. */
export const studioGarments: GarmentId[] = ['tee', 'oversized', 'crew', 'hoodie']

/** What a made-to-order piece costs, by blank. */
export const customPrice: Record<GarmentId, number> = {
  tee: 14500,
  oversized: 17000,
  crew: 25000,
  hoodie: 29500,
  cap: 13000,
}
