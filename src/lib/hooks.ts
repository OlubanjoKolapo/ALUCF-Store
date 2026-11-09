import { useEffect, useState } from 'react'
import { lockScroll, unlockScroll } from './scroll'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/** True on pointer-coarse / small screens, where the pinned rail is replaced by a swipe rail. */
export function useIsTouch() {
  return useMediaQuery('(hover: none), (max-width: 860px)')
}

/** Freeze the page while `active` is true. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockScroll()
    return unlockScroll
  }, [active])
}

/** Close on Escape. */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onClose])
}
