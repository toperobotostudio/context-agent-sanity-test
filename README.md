# Sanity AI Agent Experiment

An experiment exploring two approaches to building AI-powered experiences with Sanity CMS as the content backbone. Both apps share the same Sanity project and dataset, demonstrating how structured content can power very different interfaces.

## The Two Apps

### 1. Chatbot Interface (port 3000)

A full-featured conversational AI chatbot built on the [Vercel Chatbot template](https://github.com/vercel/ai-chatbot). This is a standalone chat interface — no storefront, just a conversation window where the AI can query and discuss products from the Sanity catalog.

**Key points:**
- Based on Vercel's AI Chatbot template with Auth.js, Postgres persistence, and file storage
- Supports multiple model providers (OpenAI, Anthropic, Google, xAI) via Vercel AI Gateway
- Connected to Sanity via Agent Context MCP for product catalog access
- Chat history is saved to a database (Neon Postgres)
- Full authentication flow with user accounts

```bash
pnpm install
pnpm db:migrate
pnpm dev
# → http://localhost:3000
```

### 2. E-commerce Storefront (port 3001)

A minimal e-commerce storefront with a floating AI shopping assistant embedded as a chat widget. The AI is part of the shopping experience — it can answer questions about products, show product cards inline, capture what the user is looking at, and even control page filters.

**Key points:**
- Built with Next.js 16, Tailwind CSS v4, Geist fonts
- Google Gemini 2.5 Flash as the AI model
- Sanity Agent Context MCP for real-time product catalog queries
- Floating chat widget on every page (bottom-right corner)
- Working cart system with localStorage persistence
- Sharp, brutalist design — no rounded corners, pixel font headings

```bash
cd ecommerce
npm install
npm run dev
# → http://localhost:3001
```

See [`ecommerce/README.md`](./ecommerce/README.md) for detailed architecture and documentation.

## Shared Backend

### Sanity Studio

The Sanity Studio is deployed and also available locally in the `studio/` directory. It manages the product catalog shared by both apps.

- **Project ID:** `weml4cgs`
- **Dataset:** `production`
- **Content:** 8 products, 4 categories, 3 brands (with AI-generated images)

**Schema (flat, no variants):**

| Type | Fields |
|------|--------|
| **product** | title, slug, sku, price, compareAtPrice, image, shortDescription, description, category (ref), brand (ref), features, tags, inStock |
| **category** | title, slug, description |
| **brand** | title, slug, description |

```bash
cd studio
npm install
npx sanity dev
# → http://localhost:3333
```

### Sanity Agent Context MCP

Both apps connect to Sanity's Agent Context MCP endpoint, which gives the AI models the ability to run GROQ queries against the live dataset. This means the AI always works with real, up-to-date product data — not a stale copy or embedding.

## Project Structure

```
sanity-test/
├── app/                    # Chatbot app (port 3000)
│   ├── (auth)/             # Authentication pages
│   └── (chat)/             # Chat interface
├── components/             # Chatbot UI components
├── lib/                    # Chatbot utilities + database
├── ecommerce/              # E-commerce app (port 3001)
│   └── src/
│       ├── app/            # Pages: home, products, product detail, chat API
│       ├── components/     # Storefront + chat widget components
│       ├── lib/            # Cart, utils, client tools
│       └── sanity/         # Sanity client + GROQ queries
├── studio/                 # Sanity Studio
│   ├── sanity.config.ts    # Schema definitions (product, category, brand)
│   └── sanity.cli.ts       # CLI configuration
└── tests/                  # Playwright tests
```

## What We Explored

| Question | What we found |
|----------|--------------|
| Can structured CMS content power an AI agent? | Yes — Sanity's GROQ via MCP gives the AI precise, queryable access to the full catalog without embeddings or RAG pipelines. |
| Chat-only vs. embedded chat — which is better? | Different use cases. The standalone chatbot (3000) is better for open-ended exploration. The embedded widget (3001) shines when the AI can see and control the page the user is on. |
| Can the AI control the UI? | Yes — client-side tools let the AI set product filters and navigate the user to filtered views. The AI queries first to verify results exist, then applies filters. |
| How does page awareness work? | Three levels: basic context (title + URL sent with every message), page content (DOM extracted as markdown on demand), and screenshots (visual capture for layout/image questions). |
| Gemini vs. other models for shopping? | Gemini 2.5 Flash works well for tool-heavy workflows — fast response times and reliable tool calling. The MCP layer means the model is swappable. |

## Environment Variables

### Chatbot (root `.env.local`)

See `.env.example` for the full list. Key variables:
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (or individual provider keys)
- `AUTH_SECRET` — Auth.js secret
- `POSTGRES_URL` — Neon database connection string

### E-commerce (`ecommerce/.env.local`)

```env
GOOGLE_GENERATIVE_AI_API_KEY=...
NEXT_PUBLIC_SANITY_PROJECT_ID=weml4cgs
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...
SANITY_CONTEXT_MCP_URL=...
```

## Running Both Apps

```bash
# Terminal 1 — Chatbot
pnpm dev
# → http://localhost:3000

# Terminal 2 — E-commerce
cd ecommerce && npm run dev
# → http://localhost:3001

# Terminal 3 — Studio (optional)
cd studio && npx sanity dev
# → http://localhost:3333
```
