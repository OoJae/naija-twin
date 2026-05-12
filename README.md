# Naija-Twin

**Your AI twin that thinks Naija.**

A unified agentic system for user modeling and recommendation, built for the DSN x BCT LLM Agent Challenge 3.0. One shared persona memory brain drives two coupled agents: a User Simulator (Task A) and a Recommender (Task B).

## Architecture: Twin-Loop

```
                    ┌─────────────────────┐
                    │   Persona Memory    │
                    │   (Semantic +       │
                    │    Episodic)        │
                    └────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼                              ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  Task A:        │          │  Task B:        │
    │  User Simulator │          │  Recommender    │
    │  (Reviews +     │          │  (Cold-start,   │
    │   Ratings)      │          │   Cross-domain, │
    │                 │          │   Multi-turn)   │
    └─────────────────┘          └─────────────────┘
              │                              │
              └──────────────┬──────────────┘
                             ▼
                    ┌─────────────────────┐
                    │  Reflection Loop    │
                    │  (Async critique,   │
                    │   faithfulness)     │
                    └─────────────────────┘
```

## Headline Metrics

| Metric | Score | Baseline |
|--------|-------|----------|
| Task A NDCG@10 | TBD | TBD |
| Task B NDCG@10 | TBD | TBD |
| Faithfulness | TBD | TBD |
| Cold-Start Hit Rate | TBD | TBD |

## Quickstart

```bash
# Clone and enter
git clone https://github.com/your-org/naija-twin.git
cd naija-twin

# Configure environment
cp .env.example .env
# Edit .env with your API keys (Anthropic, Groq, OpenAI, Neon, Upstash, Langfuse)

# Install dependencies
pnpm install
cd apps/api && uv sync && cd ../..

# Start services
docker compose up -d

# Run development servers
pnpm dev          # Next.js frontend on http://localhost:3000
cd apps/api && uv run uvicorn naija_twin.main:app --reload  # FastAPI on http://localhost:8000
```

## Example: Adekunle from Wuse

Adekunle lives in Wuse, Abuja. He buys electronics from Jumia and fashion from Konga. When he first opens Naija-Twin, the system asks him three questions in Nigerian pidgin:

> "Oga Adekunle, wetin you dey look for? Phone wey fine, or cloth wey sharp?"

From his answers, the Twin-Loop builds a persona and starts recommending items from the Naija Slice benchmark: 200 hand-curated products across electronics, fashion, food, and services, all priced in Naira.

## Tech Stack

- **Frontend**: Next.js 15, Vercel AI SDK 6, Tailwind, shadcn/ui
- **Backend**: FastAPI (Python 3.12), Pydantic v2, uv
- **Models**: Claude Sonnet 4.6, Llama 3.3 70B (Groq), Claude Haiku 4.5
- **Nigerian NLP**: Davlan/naija-twitter-sentiment-afriberta-large
- **Embeddings**: BLaIR-base (items), text-embedding-3-small (text)
- **Storage**: Neon Postgres + pgvector, Upstash Redis
- **Observability**: Langfuse

## Project Structure

```
naija-twin/
├── apps/web/         # Next.js 15 frontend
├── apps/api/         # FastAPI sidecar
├── packages/core/    # Shared TypeScript utilities
├── packages/prompts/ # Prompt templates
├── data/naija_slice/ # 200-item Nigerian benchmark (committed)
├── eval/             # Evaluation harness
├── paper/            # Living research paper
└── scripts/          # Data pipeline and setup
```

## Demo

[Coming soon](#)

## Paper

[Coming soon](#)

## License

MIT
