import clsx from 'clsx'
import { colorways, garmentPhoto } from '../data/products'
import type { ColorwayId, Face, GarmentId, Print } from '../data/products'

/* ------------------------------------------------------------------ *
 * A photographed blank with the artwork composited onto the cloth.
 *
 * The print is a real DOM layer blended into the photograph — multiply
 * for dark ink on a white tee, lighten for white ink on a black one — so
 * the fabric's folds come through it the way they do on a real garment.
 * Sizing is in container units, so one component serves an 80px bag
 * thumbnail and a full-bleed hero without a second set of numbers.
 * ------------------------------------------------------------------ */

export const TEE_ASPECT = 508 / 531

/** where the chest print sits, as a share of the photo box */
const PRINT = { top: 31, width: 43 }

const FACE: Record<Face, { family: string; weight: number; adv: number; track: string }> =
  {
    sans: { family: 'var(--font-sans)', weight: 800, adv: 0.6, track: '-0.03em' },
    display: { family: 'var(--font-serif)', weight: 400, adv: 0.44, track: '-0.01em' },
    mono: { family: 'var(--font-mono)', weight: 500, adv: 0.68, track: '0.1em' },
  }

/** optical fit: size the longest line to fill the print area */
function fit(lines: string[], face: Face, scale = 1) {
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '')
  const per = FACE[face].adv + (face === 'mono' ? 0.1 : 0)
  return Math.min(
    10.8,
    Math.max(1.5, (PRINT.width / Math.max(1, longest.length * per)) * scale),
  )
}

export type TeeProps = {
  garment: GarmentId
  colorway: ColorwayId
  print?: Print
  className?: string
  /** a real print is never perfectly square to the hem */
  tilt?: number
  alt?: string
  /** hide the artwork, e.g. a blank in the studio */
  bare?: boolean
  /** 'print' zooms the chest — a second view out of the one photograph */
  view?: 'full' | 'print'
}

export default function Tee({
  garment,
  colorway,
  print,
  className,
  tilt = 0,
  alt,
  bare = false,
  view = 'full',
}: TeeProps) {
  const cw = colorways[colorway]
  const light = cw.ink === 'light'
  const zoomed = view === 'print'

  return (
    <div
      className={clsx('relative', zoomed && 'overflow-hidden', className)}
      style={{ containerType: 'inline-size', aspectRatio: String(TEE_ASPECT) }}
    >
      <div
        className="absolute inset-0"
        style={
          zoomed ? { transform: 'scale(2.4)', transformOrigin: '50% 41%' } : undefined
        }
      >
        <img
          src={garmentPhoto(garment, colorway)}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            filter: light
              ? 'drop-shadow(0 16px 24px rgba(0,0,0,0.45))'
              : 'drop-shadow(0 16px 24px rgba(0,0,0,0.22))',
          }}
        />

        {print && !bare && (
          <div
            className={clsx(
              'pointer-events-none absolute left-1/2 text-center',
              light ? 'print-light' : 'print-dark',
            )}
            style={{
              top: `${PRINT.top}%`,
              width: `${PRINT.width}cqw`,
              color: light ? '#f4f4f4' : '#0d0d0d',
              transform: `translateX(-50%) rotate(${tilt}deg)`,
            }}
          >
            <Artwork print={print} light={light} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Artwork({ print, light }: { print: Print; light: boolean }) {
  if (print.kind === 'stack') {
    const size = fit(print.lines, print.face, print.scale)
    const f = FACE[print.face]
    return (
      <>
        {print.lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: f.family,
              fontWeight: f.weight,
              fontStyle: print.italic ? 'italic' : 'normal',
              fontSize: `${size}cqw`,
              letterSpacing: f.track,
              lineHeight: print.face === 'display' ? 0.88 : 1,
            }}
          >
            {line}
          </div>
        ))}
        {print.ref && <Ref text={print.ref} />}
      </>
    )
  }

  if (print.kind === 'verse') {
    // Left aligned like a page of scripture, but the block itself is centred
    // on the chest — otherwise it reads as though the print slipped sideways.
    const size = fit(print.quote, 'display', (print.scale ?? 1) * 0.86)
    return (
      <div className="inline-block text-left">
        {print.quote.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: FACE.display.family,
              fontStyle: 'italic',
              fontSize: `${size}cqw`,
              lineHeight: 1.02,
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: '1.2cqw',
            width: '8cqw',
            height: '0.22cqw',
            background: 'currentColor',
            opacity: 0.75,
          }}
        />
        <Ref text={print.ref.toUpperCase()} align="left" />
      </div>
    )
  }

  if (print.kind === 'mark' || print.kind === 'wordmark') {
    const isMark = print.kind === 'mark'
    const src = isMark
      ? light
        ? '/brand/mark-white.png'
        : '/brand/mark-black.png'
      : light
        ? '/brand/logo-white.png'
        : '/brand/logo-black.png'
    return (
      <>
        <img
          src={src}
          alt=""
          draggable={false}
          className="mx-auto block"
          style={{ width: isMark ? '25cqw' : '40cqw' }}
        />
        {isMark && print.label && (
          <div
            style={{
              marginTop: '1.6cqw',
              fontFamily: FACE.sans.family,
              fontWeight: 800,
              fontSize: '3.5cqw',
              letterSpacing: '0.16em',
            }}
          >
            {print.label}
          </div>
        )}
        {print.ref && <Ref text={print.ref} />}
      </>
    )
  }

  return (
    <>
      <img
        src={print.src}
        alt=""
        draggable={false}
        className="mx-auto block"
        style={{ width: '34cqw', maxHeight: '34cqw', objectFit: 'contain' }}
      />
      {print.label && <Ref text={print.label} />}
    </>
  )
}

function Ref({ text, align = 'center' }: { text: string; align?: 'center' | 'left' }) {
  return (
    <div
      style={{
        marginTop: '1.5cqw',
        fontFamily: FACE.mono.family,
        fontSize: '1.65cqw',
        letterSpacing: '0.3em',
        opacity: 0.8,
        textAlign: align,
      }}
    >
      {text}
    </div>
  )
}
