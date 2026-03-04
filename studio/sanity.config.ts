import {visionTool} from '@sanity/vision'
import {defineConfig, defineType, defineField} from 'sanity'
import {structureTool} from 'sanity/structure'

// Inline schema types so the deployed Studio registers them in the schema store
const category = defineType({
  name: 'category',
  title: 'Categories',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'text'}),
  ],
})

const brand = defineType({
  name: 'brand',
  title: 'Brands',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'text'}),
  ],
})

const product = defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'sku', type: 'string'}),
    defineField({name: 'shortDescription', type: 'text', rows: 2}),
    defineField({name: 'description', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'category', type: 'reference', to: [{type: 'category'}], validation: (rule) => rule.required()}),
    defineField({name: 'brand', type: 'reference', to: [{type: 'brand'}]}),
    defineField({name: 'price', type: 'number', validation: (rule) => rule.required().min(0)}),
    defineField({name: 'compareAtPrice', type: 'number'}),
    defineField({name: 'tags', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'features', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'inStock', type: 'boolean', initialValue: true}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
  ],
})

export default defineConfig({
  name: 'default',
  title: 'E-commerce Agent Test',

  projectId: 'weml4cgs',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: [category, brand, product],
  },
})
