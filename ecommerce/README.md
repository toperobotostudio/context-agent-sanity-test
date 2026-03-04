# E-commerce Storefront with AI Shopping Assistant

A minimal e-commerce storefront built with Next.js 16, Sanity CMS, and an AI-powered shopping assistant. The chat widget uses Google Gemini via Sanity's Agent Context MCP to provide conversational product discovery, filtering, and page awareness.

This project was built as an experiment exploring how structured content (Sanity) can power both a traditional storefront and an AI agent that understands the entire product catalog in real time.

## Architecture

```
ecommerce/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/chat/route.ts         # AI chat endpoint (Gemini + MCP)
│   │   ├── page.tsx                  # Homepage — hero + featured products
│   │   ├── products/
│   │   │   ├── page.tsx              # Filterable product listing
│   │   │   ├── [slug]/page.tsx       # Product detail page
│   │   │   └── loading.tsx           # Skeleton loader
│   │   ├── layout.tsx                # Root layout — fonts, cart, chat
│   │   └── globals.css               # Tailwind v4 + design tokens
│   │
│   ├── components/
│   │   ├── chat/                     # AI chat widget
│   │   │   ├── Chat.tsx              # Chat panel — useChat hook, tool handling
│   │   │   ├── ChatButton.tsx        # Floating toggle button (bottom-right)
│   │   │   ├── ChatInput.tsx         # Message input field
│   │   │   ├── Loader.tsx            # Typing indicator
│   │   │   ├── ToolCall.tsx          # Debug panel for tool calls (?debug=true)
│   │   │   └── message/
│   │   │       ├── Message.tsx       # User/assistant message bubbles
│   │   │       ├── TextPart.tsx      # Markdown renderer with agent directives
│   │   │       ├── Document.tsx      # Routes ::document{} directives by type
│   │   │       └── Product.tsx       # Fetches + renders product cards in chat
│   │   │
│   │   ├── header.tsx                # Site header with cart count
│   │   ├── product-card.tsx          # Product card (grid item)
│   │   ├── product-grid.tsx          # Responsive product grid
│   │   ├── product-details.tsx       # Full product detail view
│   │   ├── product-pagination.tsx    # Page navigation
│   │   ├── filter-bar.tsx            # Category, brand, price, sort filters
│   │   ├── add-to-cart-button.tsx    # Add to cart with confirmation
│   │   ├── cart-drawer.tsx           # Slide-in cart with quantity controls
│   │   └── ui/                       # Primitives (button, badge, select, pagination)
│   │
│   ├── lib/
│   │   ├── cart-context.tsx          # React Context cart with localStorage
│   │   ├── client-tools.ts           # Chat client tool definitions + schemas
│   │   ├── capture-context.ts        # Page context + screenshot capture
│   │   └── utils.ts                  # cn(), formatPrice()
│   │
│   ├── sanity/
│   │   ├── lib/
│   │   │   ├── client.ts             # Sanity client (next-sanity)
│   │   │   └── image.ts              # Image URL builder
│   │   └── queries/
│   │       ├── fragments.ts          # Reusable GROQ fragments
│   │       ├── products.ts           # Product queries + filter builder
│   │       ├── filters.ts            # Category/brand/price range queries
│   │       └── index.ts              # Barrel exports
│   │
│   └── types/
│       └── sanity.ts                 # TypeScript interfaces
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── .env.local                        # API keys + Sanity config (not committed)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Content | Sanity CMS (GROQ queries, CDN) |
| AI Model | Google Gemini 2.5 Flash via Vercel AI SDK |
| AI Context | Sanity Agent Context MCP |
| Styling | Tailwind CSS v4 |
| Fonts | Geist Sans, Geist Mono, Geist Pixel Circle |
| Icons | Lucide React |
| Language | TypeScript 5 |

## Key Features

### Storefront
- **Homepage** with dark hero section and featured products grid
- **Product listing** with server-side filtering by category, brand, price range, and sort order
- **Product detail pages** with image, pricing, sale badges, features, and tags
- **Shopping cart** — React Context with localStorage persistence, slide-in drawer, quantity controls

### AI Shopping Assistant
- **Floating chat widget** — accessible from every page via bottom-right button
- **Product-aware** — queries the Sanity catalog in real time via GROQ through MCP
- **Rich product cards** — renders interactive product cards inline in chat using `@sanity/agent-directives`
- **Page context** — reads the current page (title, URL, content, or screenshot) to answer questions about what the user is looking at
- **Filter control** — can navigate the user to filtered product views (e.g., "show me jackets under $100")
- **Debug mode** — append `?debug=true` to see raw tool calls and MCP interactions

### Design
- **Sharp corners** — no border-radius anywhere, enforced globally
- **Pixel font headings** — Geist Pixel Circle for all `h1`/`h2` elements
- **Minimal palette** — neutral-900 backgrounds, white text, neutral-100 cards

## How the AI Chat Works

The chat system uses a multi-layer architecture:

```
Browser (Chat.tsx)                    Server (api/chat/route.ts)
─────────────────                    ──────────────────────────
useChat() hook          ──POST──>    streamText() with Gemini
  │                                    │
  ├─ Sends user message               ├─ Connects to Sanity MCP
  │  + page context                    │  (groq_query, etc.)
  │                                    │
  ├─ Handles client tools:             ├─ Handles server tools:
  │  • get_page_context                │  • groq_query (via MCP)
  │  • get_page_screenshot             │  • initial_context (via MCP)
  │  • set_filters                     │
  │                                    ├─ System prompt with
  ├─ Renders ::document{}              │  schema knowledge
  │  directives as cards               │
  │                                    └─ Streams response back
  └─ Auto-scrolls
```

1. **User sends a message** — the `useChat` hook POSTs to `/api/chat` with the message and current page context (title + URL)
2. **Server connects to Sanity MCP** — creates an MCP client authenticated with a read token, giving Gemini access to GROQ queries against the product catalog
3. **Gemini reasons and calls tools** — it can query products, read page context, capture screenshots, or set product filters
4. **Client-side tools execute locally** — `get_page_context` extracts the DOM as markdown, `get_page_screenshot` captures the viewport, `set_filters` navigates to a filtered URL
5. **Products render as rich cards** — Gemini outputs `::document{id="..." type="product"}` directives, which the `TextPart` component (via `@sanity/agent-directives`) renders as interactive product cards with images and prices

## Sanity Schema

The project uses a flat product schema (no variants):

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Product name |
| `slug` | slug | URL-friendly identifier |
| `price` | number | Current selling price |
| `compareAtPrice` | number | Original price (if on sale) |
| `category` | reference → category | Has title and slug |
| `brand` | reference → brand | Has title and slug |
| `image` | image | Product image (direct, no variants) |
| `shortDescription` | text | Brief summary |
| `description` | block content | Rich text |
| `features` | array of strings | Product features |
| `tags` | array of strings | Tags |
| `inStock` | boolean | Availability |

## Getting Started

### Prerequisites

- Node.js 18+
- A Sanity project with products, categories, and brands
- A Google AI API key (Gemini)
- A Sanity Agent Context MCP endpoint

### Environment Variables

Create `.env.local` in the `ecommerce/` directory:

```env
# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your-read-token

# Sanity Agent Context MCP
SANITY_CONTEXT_MCP_URL=https://agent-context.api.sanity.io/mcp/sse?projectId=your-project-id&dataset=production
```

### Install and Run

```bash
cd ecommerce
npm install
npm run dev
```

The storefront runs on [http://localhost:3001](http://localhost:3001).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Start production server on port 3001 |
| `npm run lint` | Run ESLint |

## What We Learned

This experiment explored several ideas:

1. **Structured content as AI context** — Sanity's GROQ + MCP means the AI agent always has access to the real product catalog, not a stale snapshot. It queries live data the same way the storefront does.

2. **Client-side tool execution** — Some tools (page context, screenshots, filter navigation) must run in the browser. The AI SDK's `onToolCall` pattern makes this clean — the server defines tool schemas, the client provides execution.

3. **Document directives for rich rendering** — Instead of the AI outputting plain text product names, it outputs structured `::document{}` markers that the frontend renders as interactive cards with images and prices. This keeps the AI's output format-agnostic while the UI handles presentation.

4. **Flat schema simplicity** — A single `price` number field and direct `image` field (no variants, no nested price objects) keeps GROQ queries simple and reduces the cognitive load for both developers and AI agents.

5. **Sharp, minimal design** — Forcing `border-radius: 0` globally and using pixel fonts for headings creates a distinctive brutalist aesthetic that's easy to maintain consistently.

## Based On

Adapted from the [Sanity AI Shopping Assistant starter](https://github.com/sanity-labs/starters/tree/main/ai-shopping-assistant), with these changes:
- **Gemini** instead of Anthropic Claude
- **Flat product schema** — no variants, colors, sizes, or materials
- **Inline system prompt** — no `agent.config` Sanity document
- **No conversation persistence** — sessions are ephemeral
- **Geist fonts** with pixel variant headings
- **Client-side cart** with localStorage (no backend)
