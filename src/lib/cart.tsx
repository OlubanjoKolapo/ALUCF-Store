import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { CartLine } from './types'

const KEY = 'alucf.bag.v1'

type CartState = {
  lines: CartLine[]
  count: number
  total: number
  add: (line: Omit<CartLine, 'key'>) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  /** last line added — used to fire the "added to bag" flyout */
  lastAdded: string | null
}

const CartCtx = createContext<CartState | null>(null)

/** Catalogue lines with identical options merge; custom lines never do. */
function signature(l: Omit<CartLine, 'key'>) {
  if (l.kind === 'custom')
    return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${l.productId}-${l.colorway}-${l.size}`
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Blob URLs from a previous session are dead — drop the preview, keep the brief.
    return parsed.map((l: CartLine) =>
      l.custom?.upload?.url?.startsWith('blob:')
        ? { ...l, custom: { ...l.custom, upload: undefined } }
        : l,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* private mode — the bag just won't survive a refresh */
    }
  }, [lines])

  const add = useCallback((line: Omit<CartLine, 'key'>) => {
    const key = signature(line)
    setLines((prev) => {
      const at = prev.findIndex((l) => l.key === key)
      if (at === -1) return [...prev, { ...line, key }]
      const next = [...prev]
      next[at] = { ...next[at], qty: Math.min(99, next[at].qty + line.qty) }
      return next
    })
    setLastAdded(key)
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const total = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0)
    return { lines, count, total, add, setQty, remove, clear, lastAdded }
  }, [lines, add, setQty, remove, clear, lastAdded])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
