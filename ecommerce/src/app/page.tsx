import {ArrowRight, ShoppingBag} from 'lucide-react'
import Link from 'next/link'

import {ProductGrid} from '@/components/product-grid'
import {client} from '@/sanity/lib/client'
import {FEATURED_PRODUCTS_QUERY} from '@/sanity/queries'

export default async function HomePage() {
  const products = await client.fetch(FEATURED_PRODUCTS_QUERY)

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-neutral-950 px-4 py-20 text-center md:py-32">
        <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-pixel)] text-4xl tracking-tight text-white md:text-6xl">
          Quality essentials for everyday life
        </h1>

        <p className="mx-auto mt-6 max-w-md text-neutral-400">
          Thoughtfully designed clothing that combines comfort with timeless style.
        </p>

        <div className="mt-10">
          <Link
            href="/products"
            className="inline-flex h-14 items-center justify-center gap-3 bg-white px-10 text-sm font-medium tracking-wide text-neutral-900 uppercase transition-colors hover:bg-neutral-100"
          >
            <ShoppingBag className="h-5 w-5" />
            Shop All
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="relative z-10 mb-10 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl">
            Featured Products
          </h2>

          <Link
            href="/products"
            className="relative z-10 inline-flex h-11 items-center justify-center gap-2 bg-neutral-900 px-6 text-sm font-medium tracking-wide text-white uppercase transition-colors hover:bg-neutral-800"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={products} />
      </section>
    </main>
  )
}
