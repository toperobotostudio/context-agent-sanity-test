import {defineQuery} from 'next-sanity'

import {type ProductFiltersInput} from '@/lib/client-tools'

import {brandFragment, categoryFragment, imageFragment} from './fragments'

// Product card fragment for consistent field selection (internal)
const productCardFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "category": category->{ ${categoryFragment} },
  "brand": brand->{ ${brandFragment} },
  "image": image { ${imageFragment} },
  price,
  compareAtPrice
`

// Product card data (for grids/listings)
export const PRODUCTS_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && defined(slug.current)] | order(_createdAt desc) {
    ${productCardFragment}
  }
`)

// Featured products for homepage (limited)
export const FEATURED_PRODUCTS_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && defined(slug.current)] | order(_createdAt desc) [0...8] {
    ${productCardFragment}
  }
`)

// Single product with full details
export const PRODUCT_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    sku,
    shortDescription,
    description,
    features,
    tags,
    inStock,
    "category": category->{ ${categoryFragment} },
    "brand": brand->{ ${brandFragment} },
    "image": image { ${imageFragment} },
    price,
    compareAtPrice
  }
`)

// Product slugs for static generation
export const PRODUCT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && defined(slug.current)] {
    "slug": slug.current
  }
`)

// Pagination constants (multiple of 4 for grid layout)
export const PAGE_SIZE = 48

// Sort options configuration
export const SORT_OPTIONS = [
  {value: 'newest', label: 'Newest'},
  {value: 'price-asc', label: 'Price: Low to High'},
  {value: 'price-desc', label: 'Price: High to Low'},
  {value: 'title-asc', label: 'Name: A to Z'},
] as const

/**
 * Build a GROQ filter string from ProductFilters
 * Returns an array of filter conditions to be joined with &&
 */
interface FilterQueryResult {
  conditions: string[]
  params: Record<string, unknown>
}

function buildProductFilterConditions(filters: ProductFiltersInput): FilterQueryResult {
  const conditions: string[] = ['_type == "product"', 'defined(slug.current)']
  const params: Record<string, unknown> = {}

  if (filters.category?.length) {
    conditions.push(`category->slug.current in $categorySlugs`)
    params.categorySlugs = filters.category
  }

  if (filters.brand?.length) {
    conditions.push(`brand->slug.current in $brandSlugs`)
    params.brandSlugs = filters.brand
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`price >= $minPrice`)
    params.minPrice = filters.minPrice
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= $maxPrice`)
    params.maxPrice = filters.maxPrice
  }

  return {conditions, params}
}

/**
 * Build the order clause from sort option
 */
function buildProductSortClause(sort?: ProductFiltersInput['sort']): string {
  switch (sort) {
    case 'price-asc':
      return 'order(price asc)'
    case 'price-desc':
      return 'order(price desc)'
    case 'title-asc':
      return 'order(title asc)'
    case 'newest':
    default:
      return 'order(_createdAt desc)'
  }
}

interface FilteredQuery {
  query: string
  params: Record<string, unknown>
}

/**
 * Build the complete filtered products query with parameterized filters
 */
export function buildFilteredProductsQuery(
  filters: ProductFiltersInput,
  pageSize: number = PAGE_SIZE,
): FilteredQuery {
  const {conditions, params} = buildProductFilterConditions(filters)
  const sortClause = buildProductSortClause(filters.sort)

  return {
    query: /* groq */ `
      *[${conditions.join(' && ')}] | ${sortClause} [($page - 1) * ${pageSize}...$page * ${pageSize}] {
        ${productCardFragment}
      }
    `,
    params,
  }
}

/**
 * Build the count query for filtered products with parameterized filters
 */
export function buildFilteredProductsCountQuery(filters: ProductFiltersInput): FilteredQuery {
  const {conditions, params} = buildProductFilterConditions(filters)
  return {
    query: /* groq */ `count(*[${conditions.join(' && ')}])`,
    params,
  }
}
