// Reusable GROQ fragments for consistent field selection

export const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  }
`

export const categoryFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current
`

export const brandFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current
`
