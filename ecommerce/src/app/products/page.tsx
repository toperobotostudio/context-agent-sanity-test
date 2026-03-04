import {Suspense} from 'react'

import {FilterBar} from '@/components/filter-bar'
import {ProductGrid} from '@/components/product-grid'
import {ProductPagination} from '@/components/product-pagination'
import {type ProductFiltersInput} from '@/lib/client-tools'
import {client} from '@/sanity/lib/client'
import {FILTER_OPTIONS_QUERY} from '@/sanity/queries/filters'
import {
  buildFilteredProductsCountQuery,
  buildFilteredProductsQuery,
  PAGE_SIZE,
  SORT_OPTIONS,
} from '@/sanity/queries/products'

export const metadata = {
  title: 'All Products | Store',
  description: 'Browse our collection of quality essentials.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string
    category?: string | string[]
    brand?: string | string[]
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}

/** Convert URL param (string or string[]) to string[] or undefined */
function toArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) return value.length > 0 ? value : undefined
  return [value]
}

export default async function ProductsPage({searchParams}: ProductsPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1

  const validSort = SORT_OPTIONS.find((s) => s.value === params.sort)
  const filters: ProductFiltersInput = {
    category: toArray(params.category),
    brand: toArray(params.brand),
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: validSort?.value,
  }

  const productsQuery = buildFilteredProductsQuery(filters)
  const countQuery = buildFilteredProductsCountQuery(filters)

  const [filterOptions, products, totalCount] = await Promise.all([
    client.fetch(FILTER_OPTIONS_QUERY),
    client.fetch(productsQuery.query, {...productsQuery.params, page: currentPage}),
    client.fetch<number>(countQuery.query, countQuery.params),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const activeFilterLabels = getActiveFilterLabels(filters, filterOptions)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 font-[family-name:var(--font-pixel)] text-2xl">
          {activeFilterLabels.length > 0 ? activeFilterLabels.join(' · ') : 'All Products'}
        </h1>

        <p className="text-sm text-neutral-500">
          {`${totalCount} ${totalCount === 1 ? 'product' : 'products'}`}
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={<FilterBarSkeleton />}>
          <FilterBar filterOptions={filterOptions} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="py-16 text-center">
          <p className="text-neutral-500">No products match your filters.</p>

          <p className="mt-2 text-sm text-neutral-400">
            Try adjusting or clearing some filters to see more results.
          </p>
        </div>
      )}

      {totalPages > 1 && <ProductPagination currentPage={currentPage} totalPages={totalPages} />}
    </main>
  )
}

interface FilterOptionsResult {
  categories: Array<{_id: string; title: string | null; slug: string | null}>
  brands: Array<{_id: string; title: string | null; slug: string | null}>
  priceRange: {min: number | null; max: number | null}
}

function getActiveFilterLabels(
  filters: ProductFiltersInput,
  options: FilterOptionsResult,
): string[] {
  const labels: string[] = []

  if (filters.category?.length) {
    const names = filters.category
      .map((slug) => options.categories.find((c) => c.slug === slug)?.title)
      .filter(Boolean)
    if (names.length) labels.push(names.join(', '))
  }

  if (filters.brand?.length) {
    const names = filters.brand
      .map((slug) => options.brands.find((b) => b.slug === slug)?.title)
      .filter(Boolean)
    if (names.length) labels.push(names.join(', '))
  }

  if (filters.maxPrice) {
    labels.push(`Under $${filters.maxPrice}`)
  }

  return labels
}

function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {Array.from({length: 4}).map((_, i) => (
        <div key={i} className="h-9 w-[140px] animate-pulse bg-neutral-100" />
      ))}
    </div>
  )
}
