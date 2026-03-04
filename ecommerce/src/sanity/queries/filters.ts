import {defineQuery} from 'next-sanity'

// All filter options in a single query for efficiency
export const FILTER_OPTIONS_QUERY = defineQuery(/* groq */ `{
  "categories": *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current
  },
  "brands": *[_type == "brand" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current
  },
  "priceRange": {
    "min": math::min(*[_type == "product" && defined(price)].price),
    "max": math::max(*[_type == "product" && defined(price)].price)
  }
}`)
