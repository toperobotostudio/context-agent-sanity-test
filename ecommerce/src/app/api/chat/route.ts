import {google} from '@ai-sdk/google'
import {createMCPClient} from '@ai-sdk/mcp'
import {convertToModelMessages, stepCountIs, streamText, type ToolSet, type UIMessage} from 'ai'
import {z} from 'zod'

import {CLIENT_TOOLS, productFiltersSchema, type UserContext} from '@/lib/client-tools'

/**
 * Client-side tools for capturing page context and controlling the UI.
 * No execute functions - execution happens on the client via onToolCall.
 */
const clientTools: ToolSet = {
  [CLIENT_TOOLS.PAGE_CONTEXT]: {
    description: `Page context as markdown: URL, title, and text content (headings, links, lists). Fast. No visuals.`,
    inputSchema: z.object({
      reason: z.string().describe('Why you need page context'),
    }),
  },
  [CLIENT_TOOLS.SCREENSHOT]: {
    description: `Visual screenshot of the page. You CANNOT see anything visual without this - no images, colors, layout, or appearance.`,
    inputSchema: z.object({
      reason: z.string().describe('Why you need a screenshot'),
    }),
  },
  [CLIENT_TOOLS.SET_FILTERS]: {
    description: `Update the product listing page filters. Only use AFTER you've used groq_query to: 1) get valid filter values (slugs/codes), and 2) confirm matching products exist. Use the exact values from your query. Do not use this tool blindly - you should already know what results the user will see.`,
    inputSchema: productFiltersSchema,
  },
}

const BASE_SYSTEM_PROMPT = `You are a friendly and knowledgeable shopping assistant for an online store. Your role is to help customers find products, answer questions about items, and provide helpful recommendations.

## Guidelines
- Be conversational and helpful, but concise
- When users ask about products, use the available tools to query the product catalog
- Always show products using the document directive syntax (see below)
- If you're unsure about something, say so rather than making things up
- Help users filter and find products based on their needs (category, brand, price range)

## Schema knowledge

The product schema has these key fields:
- \`title\` (string) — product name
- \`slug\` (slug) — URL slug
- \`price\` (number) — current selling price
- \`compareAtPrice\` (number) — original price before discount. If compareAtPrice > price, the product is **on sale**
- \`category\` (reference to category) — product category, has title and slug
- \`brand\` (reference to brand) — product brand, has title and slug
- \`features\` (array of strings) — product features
- \`tags\` (array of strings) — product tags
- \`inStock\` (boolean) — availability
- \`image\` (image) — product image
- \`shortDescription\` (text) — brief description
- \`description\` (block content) — rich text description

### Common queries
- **Products on sale**: \`*[_type == "product" && defined(compareAtPrice) && compareAtPrice > price]\`
- **Products by category**: \`*[_type == "product" && category->slug.current == "shoes"]\`
- **Products by brand**: \`*[_type == "product" && brand->slug.current == "alpine-edge"]\`
- **Products under a price**: \`*[_type == "product" && price < 100]\`
- **All categories**: \`*[_type == "category"]{title, "slug": slug.current}\`
- **All brands**: \`*[_type == "brand"]{title, "slug": slug.current}\`
`

interface BuildSystemPromptParams {
  userContext: UserContext
}

function buildSystemPrompt({userContext}: BuildSystemPromptParams): string {
  return `
${BASE_SYSTEM_PROMPT}

# Page context

The user's current page is provided below. Use this for questions like "Where am I?", "What page is this?", or "Give me a link."

<user-context>
  <document-title>${userContext.documentTitle}</document-title>
  <document-location>${userContext.documentLocation}</document-location>
</user-context>

For deeper page understanding, two tools are available:

- **get_page_context**: Returns the page as markdown (headings, links, lists). Use for "What's on this page?", "What products are shown?", "Summarize this page."
- **get_page_screenshot**: Returns a visual screenshot. Use only when you need to see images, colors, or layout—for questions like "What color is this?", "Does this look right?", "Show me what you see."

Choose the minimum level needed: user-context first, then get_page_context, then get_page_screenshot.

# Displaying products

Render products using document directives so the UI can display rich cards. Query Sanity to get the document _id and _type, then use this syntax:

Block format (for product lists):
::document{id="<_id>" type="<_type>"}

Inline format (within a sentence):
:document{id="<_id>" type="<_type>"}

Example response showing three jackets:
::document{id="product-abc123" type="product"}
::document{id="product-def456" type="product"}
::document{id="product-ghi789" type="product"}

Example inline: Check out the :document{id="product-abc123" type="product"} for a timeless look.

Write product names only inside directives. If page context mentions product names, summarize generically ("the products shown") or query Sanity for their IDs rather than repeating names as plain text.
`
}

export async function POST(req: Request) {
  const {
    messages,
    userContext,
  }: {messages: UIMessage[]; userContext: UserContext} = await req.json()

  if (!process.env.SANITY_CONTEXT_MCP_URL) {
    throw new Error('SANITY_CONTEXT_MCP_URL is not set')
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  }

  const mcpClient = await createMCPClient({
    transport: {
      type: 'http',
      url: process.env.SANITY_CONTEXT_MCP_URL,
      headers: {
        Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
      },
    },
  })

  const systemPrompt = buildSystemPrompt({userContext})

  try {
    const mcpTools = await mcpClient.tools()

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        ...mcpTools,
        ...clientTools,
      },
      stopWhen: stepCountIs(20),
      onFinish: async () => {
        await mcpClient.close()
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    await mcpClient.close()
    throw error
  }
}
