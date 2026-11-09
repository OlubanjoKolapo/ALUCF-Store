import clsx from 'clsx'
import type { MouseEventHandler, ReactNode } from 'react'
import Magnetic from './Magnetic'

type Props = {
  children: ReactNode
  /** filled, or a hairline outline that fills on hover */
  variant?: 'fill' | 'outline'
  /** the colour the surrounding section is painted — not the button */
  tone?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
  magnetic?: boolean
  full?: boolean
  href?: string
  target?: string
  rel?: string
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
  'aria-label'?: string
}

const SIZES = {
  sm: 'h-9 px-4 text-[10px]',
  md: 'h-12 px-6 text-[11px]',
  lg: 'h-[3.6rem] px-9 text-[11.5px]',
}

/**
 * Black and white only, so the hover is the whole trick: a panel of the
 * opposite colour rises from the bottom while the label rolls over to
 * its inverse. No colour, no shadow, no gradient.
 */
export default function Button({
  children,
  variant = 'fill',
  tone = 'dark',
  size = 'md',
  icon,
  className,
  magnetic = true,
  full = false,
  href,
  target,
  rel,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: Props) {
  const onDark = tone === 'dark'

  // base skin
  const base = onDark
    ? variant === 'fill'
      ? 'bg-paper text-ink'
      : 'border border-paper/35 text-paper'
    : variant === 'fill'
      ? 'bg-ink text-paper'
      : 'border border-ink/30 text-ink'

  // the panel that rises on hover, and the colour the label turns
  const sweep = onDark
    ? variant === 'fill'
      ? 'bg-ink'
      : 'bg-paper'
    : variant === 'fill'
      ? 'bg-paper'
      : 'bg-ink'

  const hoverText = onDark
    ? variant === 'fill'
      ? 'group-hover:text-paper'
      : 'group-hover:text-ink'
    : variant === 'fill'
      ? 'group-hover:text-ink'
      : 'group-hover:text-paper'

  const ring = onDark
    ? variant === 'fill'
      ? 'group-hover:ring-1 group-hover:ring-paper/40'
      : ''
    : variant === 'fill'
      ? 'group-hover:ring-1 group-hover:ring-ink/30'
      : ''

  const body = (
    <span
      className={clsx(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full',
        'eyebrow select-none transition-[box-shadow] duration-500',
        SIZES[size],
        base,
        ring,
        full && 'w-full',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'absolute inset-0 translate-y-full rounded-full transition-transform duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0',
          sweep,
        )}
      />
      <span
        className={clsx(
          'relative z-10 inline-flex items-center gap-2.5 transition-colors duration-[420ms]',
          hoverText,
        )}
      >
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-[560ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">
            {children}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block translate-y-full transition-transform duration-[560ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0"
          >
            {children}
          </span>
        </span>
        {icon && (
          <span className="shrink-0 transition-transform duration-500 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </span>
    </span>
  )

  const el = href ? (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={full ? 'block w-full' : 'inline-block'}
    >
      {body}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={full ? 'block w-full' : 'inline-block'}
    >
      {body}
    </button>
  )

  return magnetic && !disabled ? (
    <Magnetic strength={7} className={full ? 'w-full' : 'inline-block'}>
      {el}
    </Magnetic>
  ) : (
    el
  )
}
