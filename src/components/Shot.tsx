import clsx from 'clsx'
import type { Shot as ShotData } from '../data/products'

type Props = {
  shot: ShotData
  /** aspect ratio for the frame — square unless told otherwise */
  ratio?: string
  /** grow slightly when an ancestor marked `group` is hovered */
  zoom?: boolean
  /** above the fold: load it straight away */
  priority?: boolean
  className?: string
  /** override the alt text, e.g. when the surrounding card already names the piece */
  alt?: string
}

/**
 * A product photograph in a frame. Everything the shop shows is a real
 * picture of someone wearing the piece, so this is the single place that
 * decides how a photograph is cropped, loaded and hovered.
 */
export default function Shot({
  shot,
  ratio = '1 / 1',
  zoom = false,
  priority = false,
  className,
  alt,
}: Props) {
  return (
    <div
      className={clsx('relative overflow-hidden bg-slate', className)}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={shot.src}
        alt={alt ?? shot.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={clsx(
          'absolute inset-0 h-full w-full object-cover',
          zoom &&
            'transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]',
        )}
        style={{ objectPosition: shot.focus ?? '50% 50%' }}
      />
    </div>
  )
}
