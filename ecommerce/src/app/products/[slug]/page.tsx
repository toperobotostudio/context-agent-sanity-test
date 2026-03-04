import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next/types'
import {cache} from 'react'

import {ProductDetails} from '@/components/product-details'
import {client} from '@/sanity/lib/client'
import {PRODUCT_QUERY, PRODUCT_SLUGS_QUERY} from '@/sanity/queries'

const getProduct = cache((slug: string) => client.fetch(PRODUCT_QUERY, {slug}))

interface Props {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const products = await client.fetch(PRODUCT_SLUGS_QUERY)
  return products.filter((p: {slug: string | null}) => p.slug).map((p: {slug: string}) => ({slug: p.slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const product = await getProduct(slug)
  if (!product) return {title: 'Product Not Found'}
  return {
    title: `${product.title} | Store`,
    description: product.shortDescription || `Shop ${product.title}`,
  }
}

export default async function ProductPage({params}: Props) {
  const {slug} = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/products" className="hover:text-neutral-900">
          Products
        </Link>

        {product.category && (
          <>
            <span className="mx-2">/</span>

            <span>{product.category.title}</span>
          </>
        )}
      </nav>

      <ProductDetails
        _id={product._id}
        title={product.title}
        slug={product.slug}
        brand={product.brand}
        category={product.category}
        shortDescription={product.shortDescription}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        features={product.features}
        tags={product.tags}
        inStock={product.inStock}
        image={product.image}
      />
    </main>
  )
}
