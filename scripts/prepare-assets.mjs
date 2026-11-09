/*
 * Turns the raw files in /assets into the web assets in /public/brand.
 *
 *   npm i -D playwright-core
 *   node scripts/prepare-assets.mjs
 *
 * It drives a local Chrome purely as an image decoder (AVIF in, canvas out),
 * so set CHROME_PATH if yours is not in the default place.
 *
 * What it does:
 *   - cuts the garment out of a mockup whose "transparency" was flattened
 *     into a checkerboard (see the long comment below — the light squares of
 *     that checkerboard are the same white as the shirt, so it takes more
 *     than a threshold)
 *   - derives the black colourway from the white one by remapping the
 *     tonal range, which keeps every fold
 *   - splits the wreath emblem off the logo lockup and makes white versions
 *
 * With a real photo that already has an alpha channel, none of the
 * checkerboard work applies — drop the file straight into /public/brand.
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'assets')
const OUT = path.join(ROOT, 'public/brand')
fs.mkdirSync(OUT, { recursive: true })
const b64 = (f) => fs.readFileSync(path.join(SRC, f)).toString('base64')

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const page = await browser.newPage()

const result = await page.evaluate(
  async ({ shirt, logoBlack }) => {
    const log = []
    const load = (mime, d) =>
      new Promise((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = `data:${mime};base64,${d}`
      })
    const toCanvas = (img) => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0)
      return c
    }

    /* ==================================================================
     * The mockup's "transparency" is a flattened checkerboard. Its light
     * squares are the same white as the garment and its dark squares are
     * only ~9 levels below the garment's deepest folds, so no single
     * threshold separates them.
     *
     * What IS unambiguous is the alternation: every background cell sits
     * ~32 levels away from its four neighbours, while a cell covered by
     * cloth sits within a few levels of them. Classify cells on that,
     * then refine the boundary per pixel inside the dark squares (where
     * the two tones really are far apart) and diffuse that answer across
     * the light squares.
     * ================================================================== */
    const sImg = await load('image/avif', shirt)
    const sc = toCanvas(sImg)
    const W = sc.width
    const H = sc.height
    const px = sc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data
    const lum = (x, y) => px[(y * W + x) * 4]

    /* ---- 1. grid.
     *   The checkerboard is a square wave, so find it the way you find any
     *   periodic signal: take the strongest frequency of a border strip.
     *   Counting run boundaries or searching integer periods both drift by
     *   a fraction of a cell over 60 cells, which is enough to flip the
     *   parity near the far edge and scramble everything downstream. ---- */
    const fitAxis = (signal) => {
      const N = signal.length
      let mean = 0
      for (const v of signal) mean += v
      mean /= N
      const s = signal.map((v) => v - mean)
      let best = { mag: -1, f: 0, theta: 0 }
      // full period of the square wave is two cells: look near 24-25px
      for (let f = 1 / 34; f <= 1 / 16; f += 1e-6) {
        let re = 0
        let im = 0
        for (let i = 0; i < N; i++) {
          const a = 2 * Math.PI * f * i
          re += s[i] * Math.cos(a)
          im -= s[i] * Math.sin(a)
        }
        const mag = re * re + im * im
        if (mag > best.mag) best = { mag, f, theta: Math.atan2(im, re) }
      }
      const S = 1 / (2 * best.f) // one cell
      // zero crossings of cos(2*pi*f*y + theta) are the cell boundaries
      let y0 = (Math.PI / 2 - best.theta) / (2 * Math.PI * best.f)
      y0 -= Math.ceil(y0 / S) * S
      return { S, phase: y0 }
    }
    const strip = (get, N, M) => {
      const out = new Float64Array(N)
      for (let i = 0; i < N; i++) {
        let v = 0
        for (let k = 0; k < M; k++) v += get(i, k)
        out[i] = v / M
      }
      return out
    }
    const ax = fitAxis(strip((i, k) => lum(i, 1 + k * 2), W, 3))
    const ay = fitAxis(strip((i, k) => lum(1 + k * 2, i), H, 3))
    const CI = (x) => Math.floor((x - ax.phase) / ax.S)
    const CJ = (y) => Math.floor((y - ay.phase) / ay.S)
    log.push(
      `grid cell ${ax.S.toFixed(4)} x ${ay.S.toFixed(4)}, phase ` +
        `${ax.phase.toFixed(2)} / ${ay.phase.toFixed(2)}`,
    )

    /* ---- 2. the two tones, and which parity is dark ---- */
    const parityMean = (par) => {
      const vals = []
      const take = (x, y) => {
        if (((CI(x) + CJ(y)) & 1) !== par) return
        vals.push(lum(x, y))
      }
      for (let y = 2; y < H - 2; y++) for (const x of [2, 5, W - 6, W - 3]) take(x, y)
      for (let x = 2; x < W - 2; x++) for (const y of [2, 5, H - 6, H - 3]) take(x, y)
      vals.sort((a, b) => a - b)
      return vals.length ? vals[vals.length >> 1] : 128
    }
    const m0 = parityMean(0)
    const m1 = parityMean(1)
    const darkParity = m0 < m1 ? 0 : 1
    const darkTone = Math.round(Math.min(m0, m1))
    const lightTone = Math.round(Math.max(m0, m1))
    const isDarkSq = (x, y) => ((CI(x) + CJ(y)) & 1) === darkParity
    log.push(`tones ${darkTone}/${lightTone}, dark parity ${darkParity}`)

    /* ---- 3. classify whole cells, not pixels.
     *   Comparing a cell median against the tone its parity SHOULD have is
     *   unambiguous on dark squares. On light squares cloth and background
     *   read the same -- but a light square under the garment is ringed by
     *   dark squares that read as cloth, so a flood fill from the border
     *   can never reach it. Topology settles what the tones cannot. ---- */
    const i0 = CI(0)
    const j0 = CJ(0)
    const cols = CI(W - 1) - i0 + 1
    const rows = CJ(H - 1) - j0 + 1
    const cellBg = new Uint8Array(cols * rows)
    for (let cj = 0; cj < rows; cj++) {
      const y0 = Math.max(0, Math.ceil(ay.phase + (cj + j0) * ay.S) + 2)
      const y1 = Math.min(H, Math.floor(ay.phase + (cj + j0 + 1) * ay.S) - 2)
      for (let ci = 0; ci < cols; ci++) {
        const x0 = Math.max(0, Math.ceil(ax.phase + (ci + i0) * ax.S) + 2)
        const x1 = Math.min(W, Math.floor(ax.phase + (ci + i0 + 1) * ax.S) - 2)
        const v = []
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) v.push(lum(x, y))
        if (!v.length) {
          cellBg[cj * cols + ci] = 1
          continue
        }
        v.sort((a, b) => a - b)
        const m = v[v.length >> 1]
        const expected = ((ci + i0 + cj + j0) & 1) === darkParity ? darkTone : lightTone
        cellBg[cj * cols + ci] = Math.abs(m - expected) <= 6 ? 1 : 0
      }
    }

    const reached = new Uint8Array(cols * rows)
    const cq = []
    for (let i = 0; i < cols; i++) cq.push(i, (rows - 1) * cols + i)
    for (let j = 0; j < rows; j++) cq.push(j * cols, j * cols + cols - 1)
    while (cq.length) {
      const c = cq.pop()
      if (reached[c] || !cellBg[c]) continue
      reached[c] = 1
      const x = c % cols
      const y = (c / cols) | 0
      if (x > 0) cq.push(c - 1)
      if (x < cols - 1) cq.push(c + 1)
      if (y > 0) cq.push(c - cols)
      if (y < rows - 1) cq.push(c + cols)
    }
    const cloth = new Uint8Array(cols * rows)
    for (let k = 0; k < cloth.length; k++) cloth[k] = reached[k] ? 0 : 1
    log.push(`cloth cells ${cloth.reduce((a, b) => a + b, 0)} / ${cols * rows}`)

    const cellMorph = (src, grow) => {
      const dst = new Uint8Array(src.length)
      for (let cj = 0; cj < rows; cj++)
        for (let ci = 0; ci < cols; ci++) {
          let v = grow ? 0 : 1
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const a = Math.min(cols - 1, Math.max(0, ci + dx))
              const b = Math.min(rows - 1, Math.max(0, cj + dy))
              const s2 = src[b * cols + a]
              v = grow ? v | s2 : v & s2
            }
          dst[cj * cols + ci] = v
        }
      return dst
    }
    const core = cellMorph(cloth, false)
    const wide = cellMorph(cloth, true)

    /* ---- 4. refine the edge per pixel inside the one-cell band. Dark
     *   squares give a clean answer there; light squares inherit it by
     *   diffusion across the 12px gap, which over so short a span is close
     *   enough to linear that the contour stays true. ---- */
    const UNKNOWN = -1
    const alpha = new Float32Array(W * H).fill(UNKNOWN)
    for (let y = 0; y < H; y++) {
      const cj = Math.min(rows - 1, Math.max(0, CJ(y) - j0))
      for (let x = 0; x < W; x++) {
        const ci = Math.min(cols - 1, Math.max(0, CI(x) - i0))
        const k = cj * cols + ci
        const p = y * W + x
        if (core[k]) alpha[p] = 1
        else if (!wide[k]) alpha[p] = 0
        else if (isDarkSq(x, y)) alpha[p] = Math.abs(lum(x, y) - darkTone) > 13 ? 1 : 0
      }
    }
    let pending = 0
    for (let p = 0; p < alpha.length; p++) if (alpha[p] === UNKNOWN) pending++
    log.push(`band pixels to diffuse ${pending}`)
    for (let it = 0; it < 60 && pending > 0; it++) {
      const prev = Float32Array.from(alpha)
      pending = 0
      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          const p = y * W + x
          if (prev[p] !== UNKNOWN) continue
          let s2 = 0
          let n = 0
          const take = (o) => {
            if (prev[o] !== UNKNOWN) {
              s2 += prev[o]
              n++
            }
          }
          take(p - 1)
          take(p + 1)
          take(p - W)
          take(p + W)
          if (n) alpha[p] = s2 / n
          else pending++
        }
    }
    for (let p = 0; p < alpha.length; p++) if (alpha[p] === UNKNOWN) alpha[p] = 0

    const mask = new Uint8Array(W * H)
    for (let p = 0; p < mask.length; p++) mask[p] = alpha[p] >= 0.5 ? 1 : 0
    const sqMorph = (src, r, max) => {
      const a = new Uint8Array(W * H)
      const b = new Uint8Array(W * H)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let v = max ? 0 : 1
          for (let d = -r; d <= r; d++) {
            const s2 = src[y * W + Math.min(W - 1, Math.max(0, x + d))]
            v = max ? v | s2 : v & s2
          }
          a[y * W + x] = v
        }
      for (let x = 0; x < W; x++)
        for (let y = 0; y < H; y++) {
          let v = max ? 0 : 1
          for (let d = -r; d <= r; d++) {
            const s2 = a[Math.min(H - 1, Math.max(0, y + d)) * W + x]
            v = max ? v | s2 : v & s2
          }
          b[y * W + x] = v
        }
      return b
    }
    // Gentle only: a kernel near the cell size would quantise the contour
    // back to the 12px grid and throw away the per-pixel edge just won.
    let clean = sqMorph(sqMorph(mask, 2, false), 2, true)
    clean = sqMorph(sqMorph(clean, 3, true), 3, false)

    // keep the largest blob, then fill anything the outside cannot reach
    const lbl = new Int32Array(W * H).fill(-1)
    let bestLab = -1
    let bestN = 0
    let lab = 0
    for (let k = 0; k < clean.length; k++) {
      if (!clean[k] || lbl[k] >= 0) continue
      const q2 = [k]
      lbl[k] = lab
      let n = 0
      while (q2.length) {
        const c = q2.pop()
        n++
        const x = c % W
        const y = (c / W) | 0
        const push = (o, ok) => {
          if (ok && clean[o] && lbl[o] < 0) {
            lbl[o] = lab
            q2.push(o)
          }
        }
        push(c - 1, x > 0)
        push(c + 1, x < W - 1)
        push(c - W, y > 0)
        push(c + W, y < H - 1)
      }
      if (n > bestN) {
        bestN = n
        bestLab = lab
      }
      lab++
    }
    for (let k = 0; k < clean.length; k++) clean[k] = lbl[k] === bestLab ? 1 : 0
    const outsidePx = new Uint8Array(W * H)
    const q4 = []
    for (let x = 0; x < W; x++) q4.push(x, (H - 1) * W + x)
    for (let y = 0; y < H; y++) q4.push(y * W, y * W + W - 1)
    while (q4.length) {
      const c = q4.pop()
      if (outsidePx[c] || clean[c]) continue
      outsidePx[c] = 1
      const x = c % W
      const y = (c / W) | 0
      if (x > 0) q4.push(c - 1)
      if (x < W - 1) q4.push(c + 1)
      if (y > 0) q4.push(c - W)
      if (y < H - 1) q4.push(c + W)
    }
    for (let k = 0; k < clean.length; k++) if (!outsidePx[k]) clean[k] = 1

    /* The dark squares pin the contour exactly; the light squares between
     * them only ever guess. That leaves a rag at the 12px cell scale on an
     * edge that is genuinely smooth. Blurring the mask well past one cell
     * and re-thresholding is a curvature limit: it averages the reliable
     * samples and drops anything that oscillates faster than the garment
     * ever could. */
    const boxBlur = (src, r) => {
      const a = new Float32Array(W * H)
      const b = new Float32Array(W * H)
      const win = 2 * r + 1
      for (let y = 0; y < H; y++) {
        let acc = 0
        for (let d = -r; d <= r; d++) acc += src[y * W + Math.min(W - 1, Math.max(0, d))]
        for (let x = 0; x < W; x++) {
          a[y * W + x] = acc / win
          const outIdx = Math.min(W - 1, Math.max(0, x - r))
          const inIdx = Math.min(W - 1, Math.max(0, x + r + 1))
          acc += src[y * W + inIdx] - src[y * W + outIdx]
        }
      }
      for (let x = 0; x < W; x++) {
        let acc = 0
        for (let d = -r; d <= r; d++) acc += a[Math.min(H - 1, Math.max(0, d)) * W + x]
        for (let y = 0; y < H; y++) {
          b[y * W + x] = acc / win
          const outIdx = Math.min(H - 1, Math.max(0, y - r))
          const inIdx = Math.min(H - 1, Math.max(0, y + r + 1))
          acc += a[inIdx * W + x] - a[outIdx * W + x]
        }
      }
      return b
    }

    let f = new Float32Array(W * H)
    for (let k = 0; k < clean.length; k++) f[k] = clean[k]
    for (let i = 0; i < 3; i++) f = boxBlur(f, 7)
    const firm = new Float32Array(W * H)
    for (let k = 0; k < f.length; k++) firm[k] = f[k] >= 0.5 ? 1 : 0
    f = boxBlur(firm, 1)

    const out = document.createElement('canvas')
    out.width = W
    out.height = H
    const octx = out.getContext('2d')
    const oimg = octx.createImageData(W, H)
    for (let p = 0; p < W * H; p++) {
      const a = Math.max(0, Math.min(1, (f[p] - 0.5) * 2.2 + 0.5))
      oimg.data[p * 4] = px[p * 4]
      oimg.data[p * 4 + 1] = px[p * 4 + 1]
      oimg.data[p * 4 + 2] = px[p * 4 + 2]
      oimg.data[p * 4 + 3] = Math.round(a * 255)
    }
    octx.putImageData(oimg, 0, 0)

    let minX = W
    let minY = H
    let maxX = 0
    let maxY = 0
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (oimg.data[(y * W + x) * 4 + 3] > 12) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
    log.push(`bbox ${minX},${minY} -> ${maxX},${maxY}`)

    /* ---- 5. crop, and build the black colourway ---- */
    const pad = 6
    const cw = maxX - minX + pad * 2
    const ch = maxY - minY + pad * 2
    const crop = document.createElement('canvas')
    crop.width = cw
    crop.height = ch
    crop.getContext('2d').drawImage(out, minX - pad, minY - pad, cw, ch, 0, 0, cw, ch)
    const cd = crop.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, cw, ch)

    const hist = new Uint32Array(256)
    let n = 0
    for (let i = 0; i < cd.data.length; i += 4)
      if (cd.data[i + 3] > 200) {
        hist[cd.data[i]]++
        n++
      }
    let acc = 0,
      lo = 0
    for (let v = 0; v < 256; v++) {
      acc += hist[v]
      if (acc > n * 0.02) {
        lo = v
        break
      }
    }
    log.push(`tonal floor ${lo}`)

    const blk = document.createElement('canvas')
    blk.width = cw
    blk.height = ch
    const bctx = blk.getContext('2d')
    const bd = bctx.createImageData(cw, ch)
    for (let i = 0; i < cd.data.length; i += 4) {
      const t = Math.max(0, Math.min(1, (cd.data[i] - lo) / Math.max(1, 255 - lo)))
      const v = Math.round(11 + Math.pow(t, 0.75) * 48)
      bd.data[i] = v
      bd.data[i + 1] = v
      bd.data[i + 2] = v
      bd.data[i + 3] = cd.data[i + 3]
    }
    bctx.putImageData(bd, 0, 0)

    /* ---- 6. logo emblem ---- */
    const lb = await load('image/png', logoBlack)
    const lc = toCanvas(lb)
    const lw = lc.width
    const lh = lc.height
    const ld = lc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, lw, lh).data
    const colCov = new Uint32Array(lw)
    for (let x = 0; x < lw; x++) {
      let c = 0
      for (let y = 0; y < lh; y++) if (ld[(y * lw + x) * 4 + 3] > 24) c++
      colCov[x] = c
    }
    let emblemEnd = -1
    let run = 0
    for (let x = Math.round(lw * 0.2); x < lw; x++) {
      if (colCov[x] === 0) {
        run++
        if (run > 18) {
          emblemEnd = x - run
          break
        }
      } else run = 0
    }
    if (emblemEnd < 0) emblemEnd = Math.round(lw * 0.35)
    const mark = document.createElement('canvas')
    mark.width = emblemEnd
    mark.height = lh
    mark.getContext('2d').drawImage(lc, 0, 0, emblemEnd, lh, 0, 0, emblemEnd, lh)
    const markW = document.createElement('canvas')
    markW.width = emblemEnd
    markW.height = lh
    const mi = mark.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, emblemEnd, lh)
    for (let i = 0; i < mi.data.length; i += 4) {
      mi.data[i] = 255
      mi.data[i + 1] = 255
      mi.data[i + 2] = 255
    }
    markW.getContext('2d').putImageData(mi, 0, 0)

    // white version of the full lockup too
    const logoW = document.createElement('canvas')
    logoW.width = lw
    logoW.height = lh
    const li = lc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, lw, lh)
    for (let i = 0; i < li.data.length; i += 4) {
      li.data[i] = 255
      li.data[i + 1] = 255
      li.data[i + 2] = 255
    }
    logoW.getContext('2d').putImageData(li, 0, 0)

    const png = (c) => c.toDataURL('image/png').split(',')[1]
    return {
      log,
      teeWhite: png(crop),
      teeBlack: png(blk),
      mark: png(mark),
      markWhite: png(markW),
      logoWhite: png(logoW),
      tee: { w: cw, h: ch },
    }
  },
  { shirt: b64('shirt demo.avif'), logoBlack: b64('ALU Christian Fellowship black (1).png') },
)

const write = (n, d) => fs.writeFileSync(path.join(OUT, n), Buffer.from(d, 'base64'))
write('tee-white.png', result.teeWhite)
write('tee-black.png', result.teeBlack)
write('mark-black.png', result.mark)
write('mark-white.png', result.markWhite)
write('logo-white.png', result.logoWhite)
fs.copyFileSync(
  path.join(SRC, 'ALU Christian Fellowship black (1).png'),
  path.join(OUT, 'logo-black.png'),
)
console.log(result.log.join('\n'))
console.log('tee', JSON.stringify(result.tee))
await browser.close()
