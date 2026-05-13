# Naija-Twin

**Your AI twin that thinks Naija.**

Most LLM recommendation systems treat user modeling and recommendation as two separate pipelines. Naija-Twin collapses them into one. A single persona memory brain drives both a User Simulator (Task A: reviews and ratings) and a Recommender (Task B: cold-start, cross-domain, multi-turn). Every improvement to the persona lifts both tasks at once. The system speaks authentic Nigerian English across five registers, validated by AfriBERTa, and is evaluated on a 200-item Nigerian-fit benchmark built from scratch.

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

| Metric | Target | Baseline |
|--------|--------|----------|
| NDCG@10 (unified test split) | >= 0.45 | P5 zero-shot ~0.32 |
| RMSE (Amazon Books rating) | <= 1.00 | GPT-4o zero-shot ~1.12 |
| Faithfulness rate (NLI entailment) | >= 90% | Untuned GPT-4o ~73% |
| Nigerian-fit (200-item benchmark) | >= 70% | Untuned Claude 3.5 ~45% |

## Quickstart

```bash
# Clone and enter
git clone https://github.com/OoJae/naija-twin.git
cd naija-twin

# Configure environment
cp .env.example .env
# Edit .env with your API keys (Anthropic, Groq, OpenAI, Neon, Upstash, Langfuse)

# Install dependencies
pnpm install
cd apps/api && uv sync && cd ../..

# Run (uses cloud Neon + Upstash, no Docker needed for dev)
make dev
# Next.js frontend: http://localhost:3000
# FastAPI sidecar:  http://localhost:8000
```

### Production (Docker)

```bash
docker compose up -d
# Boots local Postgres + Redis + FastAPI container
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
