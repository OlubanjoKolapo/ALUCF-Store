import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useIsTouch } from '../../lib/hooks'

type Props = {
  children: ReactNode
  className?: string
  /** how far the element chases the pointer, in px */
  strength?: number
}

/** Element leans toward the cursor and springs back on leave. */
export default function Magnetic({ children, className, strength = 14 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const touch = useIsTouch()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 })

  if (reduce || touch) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        mx.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength)
        my.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
