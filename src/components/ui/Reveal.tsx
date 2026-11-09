import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** seconds */
  delay?: number
  y?: number
  blur?: boolean
  className?: string
  once?: boolean
  as?: 'div' | 'span' | 'li' | 'section' | 'figure'
}

/**
 * The house reveal: a short rise with a touch of blur, fired once when the
 * element is a third of the way into view. Used everywhere so the whole page
 * breathes with one rhythm instead of five different animations.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 26,
  blur = true,
  className,
  once = true,
  as = 'div',
}: Props) {
  const reduce = useReducedMotion()
  const M = motion[as]

  if (reduce) return <M className={className}>{children}</M>

  return (
    <M
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  )
}
