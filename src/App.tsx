import { AnimatePresence } from 'framer-motion'
import { useCallback, useLayoutEffect, useState } from 'react'
import type { ColorwayId, Product } from './data/products'
import { CartProvider } from './lib/cart'
import { startSmoothScroll, stopSmoothScroll } from './lib/scroll'

import Bag from './components/Bag'
import Campaign from './components/Campaign'
import Faq from './components/Faq'
import Footer from './components/Footer'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Intro from './components/Intro'
import Nav from './components/Nav'
import ProductModal from './components/ProductModal'
import Shop from './components/Shop'
import Story from './components/Story'
import Studio from './components/Studio'

type Opened = { product: Product; colorway?: ColorwayId }

export default function App() {
  const [piece, setPiece] = useState<Opened | null>(null)
  const [bag, setBag] = useState(false)

  const [intro, setIntro] = useState(true)

  // Layout effect, so smooth scroll exists before the intro asks to lock it.
  useLayoutEffect(() => {
    startSmoothScroll()
    return stopSmoothScroll
  }, [])

  const endIntro = useCallback(() => setIntro(false), [])

  const openBag = useCallback(() => setBag(true), [])
  const openPiece = useCallback(
    (product: Product, colorway?: ColorwayId) => setPiece({ product, colorway }),
    [],
  )

  return (
    <CartProvider>
      <Nav onOpenBag={openBag} />

      <main>
        <Hero ready={!intro} />
        <Shop onOpen={openPiece} />
        <Campaign />
        <HowItWorks />
        <Studio onOpenBag={openBag} />
        <Story />
        <Faq />
        <Footer />
      </main>

      <ProductModal
        product={piece?.product ?? null}
        colorway={piece?.colorway}
        onClose={() => setPiece(null)}
        onOpenBag={openBag}
      />
      <Bag open={bag} onClose={() => setBag(false)} />

      <AnimatePresence>
        {intro && <Intro key="intro" onDone={endIntro} />}
      </AnimatePresence>
    </CartProvider>
  )
}
