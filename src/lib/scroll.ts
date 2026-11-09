import Lenis from 'lenis'

let lenis: Lenis | null = null
let rafId = 0
let locks = 0

export function startSmoothScroll() {
  if (lenis) return lenis
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  })

  const raf = (time: number) => {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  return lenis
}

export function stopSmoothScroll() {
  cancelAnimationFrame(rafId)
  lenis?.destroy()
  lenis = null
  locks = 0
}

/** Freeze the page behind an overlay. Reference counted — nested overlays are safe. */
export function lockScroll() {
  locks += 1
  if (locks === 1) {
    lenis?.stop()
    document.body.dataset.locked = 'true'
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) {
    lenis?.start()
    delete document.body.dataset.locked
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.1 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
