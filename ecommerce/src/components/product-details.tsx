import Image from 'next/image'

import {formatPrice} from '@/lib/utils'
import {urlFor} from '@/sanity/lib/image'

import {AddToCartButton} from './add-to-cart-button'
import {Badge} from './ui/badge'

interface ProductDetailsProps {
  _id: string
  title: string | null
  slug: string | null
  brand?: {_id: string; title: string | null; slug: string | null} | null
  category?: {_id: string; title: string | null; slug: string | null} | null
  shortDescription?: string | null
  price: number | null
  compareAtPrice?: number | null
  features?: string[] | null
  tags?: string[] | null
  inStock?: boolean | null
  image?: {asset?: {_id: string; url: string; metadata?: {lqip?: string}} | null} | null
}

export function ProductDetails({
  _id,
  title,
  slug,
  brand,
  category,
  shortDescription,
  price,
  compareAtPrice,
  features,
  tags,
  inStock,
  image,
}: ProductDetailsProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > (price ?? 0)
  const imageUrl = image?.asset?.url ? urlFor(image).width(160).height(160).url() : undefined

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {image?.asset?.url ? (
          <Image
            src={urlFor(image).width(800).height(1067).url()}
            alt={title || 'Product image'}
            fill
            className="object-cover"
            priority
            placeholder={image.asset.metadata?.lqip ? 'blur' : 'empty'}
            blurDataURL={image.asset.metadata?.lqip || undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
        )}

        {hasDiscount && (
          <Badge className="absolute left-3 top-3" variant="destructive">
            Sale
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {(brand?.title || category?.title) && (
          <p className="text-sm text-neutral-500">
            {brand?.title}
            {brand?.title && category?.title && ' / '}
            {category?.title}
          </p>
        )}

        <h1 className="mt-2 font-[family-name:var(--font-pixel)] text-3xl tracking-tight md:text-4xl">{title}</h1>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-medium">{formatPrice(price)}</span>

          {hasDiscount && (
            <span className="text-lg text-neutral-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {shortDescription && (
          <p className="mt-5 leading-relaxed text-neutral-600">{shortDescription}</p>
        )}

        <AddToCartButton
          product={{
            _id,
            title: title || 'Product',
            slug: slug || '',
            price: price ?? 0,
            image: imageUrl,
          }}
          disabled={inStock === false}
        />

        {features && features.length > 0 && (
          <div className="mt-10 border-t border-neutral-200 pt-6">
            <p className="text-sm font-semibold uppercase tracking-wide">Features</p>

            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-neutral-600">
              {features.map((feature) => (
                <li key={feature}>– {feature}</li>
              ))}
            </ul>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <p className="text-sm font-semibold uppercase tracking-wide">Tags</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
