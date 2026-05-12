**Naija-Twin: The Complete Build Manual**

*A unified customer-intelligence agent for the DSN x BCT LLM Agent Challenge 2026*

Author: **Joseph Olamiye (Oluwademilade)**

Institution: **Federal University of Technology Akure (FUTA)**

Build window: **May 12 to May 24, 2026**

Live finale: **June 10, 2026**

Target: **1st place, the talent conversation, the paper**

*This manual is the single source of truth for the Naija-Twin build. Every architectural decision, every dependency, every line of the daily plan is here. The Claude Code master prompt at the end of this document boots a fresh session into this plan in one paste.*

**Part 1: Project North Star**

**1.1 What Naija-Twin Is**

Naija-Twin is a single agentic system that solves both hackathon tasks with one shared brain. A natural-language persona memory feeds two coupled agents: a User Simulator that generates reviews and predicts ratings for unseen items (Task A), and a Recommender Agent that produces personalized, cold-start-capable, cross-domain recommendations with explicit reasoning traces (Task B). Improvements to the persona memory lift both tasks simultaneously, because both agents read from and write to the same memory layer. The system speaks Nigerian English across five registers, with measurable behavioural fidelity validated by a held-out Nigerian-fit benchmark of 200 items.

**1.2 The Unfair Advantage (Three Levers)**

Three concrete differentiators carry the submission. Each is engineered, not asserted.

1.  Architectural coherence. Twin-Loop design where one persona memory drives both agents. Most competing teams will build two disconnected pipelines. We build one, and the paper opens with this diagram.

2.  Authentic Nigerian voice. A register slider, five anchored personas, a lexicon table grounded in linguistic research, and AfriBERTa post-generation validation. The bonus rubric line in the brief turns into a measurable contribution rather than a vibes claim.

3.  Engineering rigor. Langfuse traces on every tool call, faithfulness audit (NLI entailment) on every generated review, calibration curve on every rating prediction, one-command Docker reproduction, public demo URL. Judges read the paper first and run the code second, so both must impress.

**1.3 Win Conditions (Pre-Registered Metrics)**

Four headline numbers, locked by Day 3, optimized through Day 13. Every experiment is judged against whether it moves one of these.

|                   |                                                             |                  |                          |
|-------------------|-------------------------------------------------------------|------------------|--------------------------|
| **Metric**        | **Definition**                                              | **Target**       | **Baseline to beat**     |
| NDCG@10           | Unified Yelp+Amazon+Goodreads test split, holdout last item | at or above 0.45 | P5 zero-shot \~0.32      |
| RMSE              | Rating prediction, Amazon Books test fold                   | at or below 1.00 | GPT-4o zero-shot \~1.12  |
| Faithfulness rate | NLI entailment of generated review against user history     | at or above 90%  | Untuned GPT-4o \~73%     |
| Nigerian-fit      | 200-item human-judged authenticity benchmark                | at or above 70%  | Untuned Claude 3.5 \~45% |

**1.4 What Naija-Twin Is Not**

- Not a chatbot. The conversational surface is a thin wrapper over the two agents.

- Not a multi-agent theatre. Two agents share state. Adding a third without an ablation that justifies it is forbidden.

- Not a fine-tuned-from-scratch model. We adapt frozen open models with LoRA, retrieve aggressively, and let Claude do the reasoning.

- Not a Lagos-Yoruba monolith. The system represents northern Muslim, eastern Igbo, southern Yoruba, code-switching youth, and diaspora users with equal care.

- Not optional engineering. Reproducibility, traces, and the paper are first-class deliverables.

**Part 2: Hard Rules**

These rules govern every file, every commit, every prompt, every UI string. Violations cost points, time, or both.

4.  No em dashes. Anywhere. In code, prose, comments, UI copy, paper, README, prompts, system messages. Use commas, periods, colons, semicolons, or parentheses.

5.  Every number reported with seeds. Every metric in the paper runs three seeds; report mean and standard deviation.

6.  Every claim cited or measured. No adjectives without a number behind them. \'Strong improvement\' is banned; \'+0.04 NDCG@10 over P5 zero-shot, p \< 0.05\' is the standard.

7.  Reproducibility first, performance second. A working repo with a slightly weaker number beats a stronger number nobody can run.

8.  Nigerian voice authenticity beats density. One well-placed marker per paragraph in casual register, zero in formal. Reject blanket Pidgin.

9.  Naira amounts, Nigerian names, local landmarks. Every example in the paper, README, and demo uses the naira symbol, names like Adekunle or Halima, places like Onitsha or Wuse, not dollars, John, New York.

10. The paper grows with the code. Open paper/paper.md on Day 1; never let it become a Day 13 sprint.

11. Commit message format: type(scope): subject. Types: feat, fix, eval, paper, infra, data. Example: feat(twin-loop): add reflection step to persona memory.

12. No \'TODO\' comments in main. Open a GitHub issue or delete the line.

13. All env variables documented in .env.example with safe placeholder values. Never commit a real key.

**Part 3: Twin-Loop Architecture**

**3.1 The Core Insight**

The hackathon brief treats user modeling and recommendation as two tasks. They are the same task viewed from opposite directions. A system that knows how a user would rate an unseen item also knows which items to surface. A system that ranks items correctly has, implicitly, modeled the user. Naija-Twin makes this duality explicit by storing the user model once and using it from both directions. This is a direct adaptation of AgentCF (Zhang et al., WWW 2024), extended with the Reason4Rec deliberative pattern and the InteRecAgent tool brain.

**3.2 The Five Layers**

Reading top to bottom, every request flows through these layers in order.

|                |                                                                                                    |                                                |
|----------------|----------------------------------------------------------------------------------------------------|------------------------------------------------|
| **Layer**      | **Responsibility**                                                                                 | **Key tech**                                   |
| Surface        | Streaming chat UI, register slider, persona selector, demo controls                                | Next.js 15 + Vercel AI SDK 6                   |
| Orchestration  | ReAct loop, tool dispatch, reflection, self-consistency voting                                     | Vercel AI SDK ToolLoopAgent, Claude Sonnet 4.6 |
| Persona memory | Episodic, semantic, procedural memory per user; item memory per SKU                                | Postgres + pgvector, OpenAI embed-3-small      |
| Tool brain     | Information query, retrieval, ranking, generation, validation                                      | MCP server (FastAPI sidecar)                   |
| Model backbone | Reasoning (Claude), generation (Groq Llama 3.3 70B), classification (AfriBERTa), retrieval (BLaIR) | Hybrid hosted plus self-hosted                 |

**3.3 Data Flow, Task A (Review and Rating Simulation)**

Given a target user and a target unseen item, produce a predicted star rating and a written review.

14. Surface receives (user_id, item_id, register_preference).

15. Orchestrator loads user persona summary, last 30 interactions, and the top 5 most BLaIR-similar historical items.

16. Tool call rank_item_for_user returns a predicted relevance score; this feeds the rating prior.

17. Self-consistency: sample 5 rating predictions, take the median, compute entropy as a confidence signal.

18. If entropy exceeds threshold, optionally trigger active clarification, otherwise proceed.

19. Conditioned on the predicted rating, generate the review with Groq Llama 3.3 70B (faster, cheaper for the long generation).

20. Faithfulness audit: NLI classifier checks each review sentence against user history; sentences below threshold get regenerated up to 2 times.

21. Nigerian-fit validation: AfriBERTa classifies register; if mismatch with requested register, regenerate.

22. Write the review and rating back to a reflection log; update user persona memory with new evidence.

**3.4 Data Flow, Task B (Recommendation)**

Given a target user and an optional conversational query, return a top-10 ranked list with reasons.

23. Surface receives (user_id, query_text optional, context).

24. If cold-start user (fewer than 5 interactions), enter PEBOL onboarding: agent asks up to 3 preference-eliciting questions via Bayesian acquisition.

25. Orchestrator builds a query embedding (BLaIR for text, plus user persona summary embedding).

26. Tool call retrieve_candidates returns top 100 from A-LLMRec retriever (frozen SASRec aligned with LLM).

27. Tool call rank_candidates calls Claude Sonnet 4.6 with Reason4Rec deliberative prompt: distill preferences, match item features, predict satisfaction.

28. Multi-objective re-ranking: relevance, diversity, serendipity, Nigerian-fit score (power-stability, local warranty, delivery SLA).

29. Generate explanations per top-10 item, citing user history evidence and Nigerian-factor reasons.

30. Write the recommendation set and reasons to memory; if user accepts a recommendation, update item memory.

**3.5 The Reflection Loop**

After every Task A or Task B turn, a lightweight reflection step asks Claude Haiku 4.5: did the prediction match observed reality, and what should be updated in the user or item memory? This is the AgentCF collaborative reflection mechanism. Reflection runs asynchronously via a Redis queue; it never blocks the user response.

**3.6 Why This Wins Both Tasks**

Three reasons judges can articulate in 30 seconds after reading the architecture diagram.

- Shared memory means a single source of truth for the user. Improvements to persona quality lift both leaderboards.

- Natural-language profiles transfer cross-domain for free. A Yelp restaurant lover becomes a Goodreads cookbook reader without retraining.

- The reflection loop converts every interaction into training signal without weight updates. The system improves at inference time.

**Part 4: Tech Stack (Final Decisions)**

These choices are locked. Do not re-evaluate mid-build. The matrix below shows the decision, the alternatives considered, and why the alternative was rejected.

**4.1 Frontend**

|                          |                                                                          |                                             |
|--------------------------|--------------------------------------------------------------------------|---------------------------------------------|
| **Choice**               | **Reason**                                                               | **Rejected alternative**                    |
| Next.js 15 App Router    | Joseph\'s stack of record; streaming UI; Vercel deploy in one click      | Streamlit (judges judge engineering signal) |
| Vercel AI SDK 6          | Native MCP, ToolLoopAgent, streaming generation, Langfuse telemetry hook | LangChain JS (heavier, slower)              |
| Tailwind CSS + shadcn/ui | Production look in hours, not days                                       | Custom CSS                                  |
| TanStack Query           | Async state for tool results, optimistic updates                         | Plain fetch                                 |

**4.2 Backend Sidecar**

|                        |                                                                                        |                                           |
|------------------------|----------------------------------------------------------------------------------------|-------------------------------------------|
| **Choice**             | **Reason**                                                                             | **Rejected alternative**                  |
| FastAPI (Python 3.12)  | Best ergonomics for ML serving; Pydantic v2 validation; matches data science ecosystem | Express.js (Python ML libs are essential) |
| uv for env management  | 10x faster than pip; reproducible lockfile                                             | poetry (slower install)                   |
| Pydantic v2            | Schema validation for every tool I/O                                                   | dataclasses                               |
| Uvicorn with 4 workers | Async, production-grade                                                                | Gunicorn sync                             |

**4.3 Models**

|                                  |                                                          |                                                |
|----------------------------------|----------------------------------------------------------|------------------------------------------------|
| **Role**                         | **Model**                                                | **Cost note**                                  |
| Reasoning loop, agent brain      | Claude Sonnet 4.6                                        | \$3/\$15 per MTok, 90% off with prompt caching |
| High-volume review generation    | Llama 3.3 70B via Groq                                   | \$0.59/\$0.79 per MTok, 334 tok/s              |
| Reflection (async, cheap)        | Claude Haiku 4.5                                         | \$0.80/\$4 per MTok                            |
| Nigerian sentiment / language ID | Davlan AfriBERTa-large naija-sentiment                   | Free, runs on Render CPU                       |
| Text embeddings                  | OpenAI text-embedding-3-small                            | \$0.02 per MTok                                |
| Item embeddings for retrieval    | McAuley-Lab BLaIR-base                                   | Free, pre-trained on Amazon Reviews 2023       |
| NLI faithfulness audit           | MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | Free, runs on Render CPU                       |
| LLM-as-judge (offline eval only) | Claude Opus 4.7                                          | Reserved for human-eval correlation study      |

**4.4 Data Infrastructure**

|                                      |                                                            |                                        |
|--------------------------------------|------------------------------------------------------------|----------------------------------------|
| **Service**                          | **Use**                                                    | **Tier**                               |
| Neon Postgres + pgvector             | User profiles, item metadata, embeddings, reviews, ratings | Free tier, 3GB storage                 |
| Upstash Redis                        | Semantic LLM cache, rate limiting, reflection queue        | Free tier, 10k commands/day            |
| HuggingFace Hub                      | Model weights, dataset hosting for the Nigerian-fit slice  | Free public hosting                    |
| Langfuse (self-hosted or cloud free) | Trace every tool call, every LLM call, cost and latency    | Self-host on Render or free cloud tier |

**4.5 Hosting and CI**

|                             |                                  |                       |
|-----------------------------|----------------------------------|-----------------------|
| **Service**                 | **Purpose**                      | **Cost**              |
| Vercel Hobby                | Next.js frontend                 | Free                  |
| Render Starter              | FastAPI sidecar (warm container) | \$7/month             |
| HuggingFace Spaces (Docker) | Backup public demo               | Free                  |
| GitHub Actions              | CI smoke tests, eval re-runs     | Free for public repos |
| Custom domain (optional)    | naijatwin.com or similar         | \~\$10/year           |

**4.6 Total Budget**

Realistic spend across the five-week run, assuming aggressive prompt caching and Groq free tier for development:

- Claude Sonnet 4.6 (reasoning, with caching): \$9

- Groq Llama 3.3 70B (generation, free tier first, then paid burst): \$15

- Claude Haiku 4.5 (reflection): \$2

- Embeddings: \$0.20

- Render Starter, one month: \$7

- Domain (optional): \$10

- Buffer for human eval LLM-judge runs: \$5

- Total expected: \$48, hard cap \$120

Apply for Anthropic Claude Student Builder credits on Day 1. With a .edu.ng email and approval (5-7 days), expect \$50 in API credits, which fully offsets the projected spend.

**Part 5: Repository Structure**

A pnpm-workspace monorepo. Next.js and FastAPI sidecar live side by side. Data, evaluation, and paper directories are top-level so judges see them immediately when they open the repo on GitHub.

naija-twin/

├── apps/

│ ├── web/ \# Next.js 15 (App Router)

│ │ ├── app/

│ │ │ ├── (chat)/ \# Chat surface with register slider

│ │ │ ├── api/chat/ \# Streaming Vercel AI route

│ │ │ ├── api/simulate/ \# Task A endpoint

│ │ │ ├── api/recommend/ \# Task B endpoint

│ │ │ └── demo/ \# Counterfactual probe UI

│ │ ├── components/

│ │ ├── lib/

│ │ │ ├── agents/ \# ToolLoopAgent factories

│ │ │ ├── prompts/ \# System prompts per agent

│ │ │ ├── tools/ \# Vercel AI SDK tool definitions

│ │ │ └── langfuse.ts \# Telemetry init

│ │ └── package.json

│ └── api/ \# FastAPI sidecar

│ ├── naija_twin/

│ │ ├── main.py \# FastAPI app, MCP server

│ │ ├── memory/ \# PersonaMemory, ItemMemory modules

│ │ ├── retrieval/ \# BLaIR retriever, A-LLMRec wrapper

│ │ ├── ranking/ \# Reason4Rec ranker

│ │ ├── generation/ \# Review generator, faithfulness audit

│ │ ├── nigerian/ \# AfriBERTa wrapper, register validator

│ │ ├── cold_start/ \# PEBOL onboarding

│ │ ├── reflection/ \# Reflection worker

│ │ └── eval/ \# All eval scripts

│ ├── tests/

│ ├── pyproject.toml \# uv-managed

│ ├── uv.lock

│ └── Dockerfile

├── packages/

│ ├── core/ \# Shared TS types and Pydantic mirrors

│ └── prompts/ \# Markdown system prompts, version-controlled

├── data/

│ ├── raw/ \# Yelp, Amazon, Goodreads downloads (gitignored)

│ ├── processed/ \# Parquet sampled splits

│ └── naija_slice/ \# 200-item Nigerian-fit benchmark, committed

├── notebooks/ \# Exploration only, never on the critical path

├── eval/

│ ├── task_a/ \# Review and rating eval scripts

│ ├── task_b/ \# NDCG, HR, cold-start scripts

│ ├── faithfulness/ \# NLI audit

│ ├── calibration/ \# ECE, reliability diagrams

│ ├── human_eval/ \# Annotator templates, Krippendorff calc

│ ├── ablations/ \# Per-component ablation runs

│ └── results/ \# JSON outputs, all metric runs

├── paper/

│ ├── paper.md \# Living document, updated daily

│ ├── figures/ \# Architecture diagram, ablation tables

│ └── references.bib

├── scripts/

│ ├── download_datasets.sh

│ ├── build_naija_slice.py

│ ├── ingest_embeddings.py

│ └── quickstart.sh \# 60-second judge boot

├── docker-compose.yml

├── Makefile \# make reproduce, make eval, make demo

├── .env.example

├── README.md \# The judge-facing README

├── pnpm-workspace.yaml

└── .github/workflows/ci.yml

Two top-level conventions matter most for judging optics. First, the README is the welcome mat; it must include a \'Why this matters\' opener, the architecture diagram, a one-paste quickstart, the public Langfuse trace link, and the four headline metrics with their confidence intervals. Second, the Makefile encodes the reproducibility contract: \'make reproduce\' runs the full pipeline on a 1% sample in under 5 minutes for impatient judges; \'make eval\' runs the full eval; \'make demo\' boots the local stack.

**Part 6: Data Engineering**

**6.1 Source Datasets**

|                        |                                                    |                                                                |
|------------------------|----------------------------------------------------|----------------------------------------------------------------|
| **Dataset**            | **Where**                                          | **What we use**                                                |
| Yelp Open Dataset 2024 | yelp.com/dataset                                   | Restaurant reviews, business metadata, 6.9M reviews            |
| Amazon Reviews 2023    | amazon-reviews-2023.github.io (McAuley Lab)        | Books, Electronics, Beauty subsets; pre-built BLaIR embeddings |
| Goodreads UCSD         | cseweb.ucsd.edu/\~jmcauley/datasets/goodreads.html | Books reviews, \~15M reviews                                   |
| Nigerian-fit benchmark | Built by us, 200 items                             | Hand-curated for the bonus rubric                              |

**6.2 Sampling Strategy**

Full datasets are too large for five-week iteration. Sample aggressively but defensibly.

- Per dataset: 50,000 users, 100,000 items, 1,000,000 interactions. This matches AgentSociety Challenge scale.

- Filter users with fewer than 10 interactions (cold-start handled separately by PEBOL).

- Time-based split: train on first 80%, validate on next 10%, test on last 10%. Critical: do not random-split, because that leaks future preferences.

- Hold out a \'cold-item\' split: 5% of items never seen in training, for cross-domain and cold-start eval.

- Hold out a \'cold-user\' split: 5% of users with first interaction in the test window, for PEBOL eval.

**6.3 Schema (PostgreSQL)**

Six tables. Schema lives in apps/api/naija_twin/db/schema.sql, applied via alembic.

users (user_id PK, raw_meta JSONB, persona_summary TEXT,

persona_embedding VECTOR(1536), nigerian_persona TEXT,

register_default TEXT, created_at TIMESTAMP)

items (item_id PK, domain TEXT, raw_meta JSONB, title TEXT,

description TEXT, blair_embedding VECTOR(768),

nigerian_features JSONB, created_at TIMESTAMP)

interactions (id PK, user_id FK, item_id FK, rating REAL,

review_text TEXT, timestamp TIMESTAMP,

split TEXT) \-- \'train\' \| \'val\' \| \'test\' \| \'cold_item\' \| \'cold_user\'

user_memories (id PK, user_id FK, memory_type TEXT,

\-- \'episodic\' \| \'semantic\' \| \'procedural\'

content TEXT, embedding VECTOR(1536),

source_interaction_id FK, created_at TIMESTAMP)

item_memories (id PK, item_id FK, content TEXT,

embedding VECTOR(1536), updated_at TIMESTAMP)

reflections (id PK, user_id FK, item_id FK, predicted_rating REAL,

actual_rating REAL, predicted_review TEXT,

actual_review TEXT, faithfulness_score REAL,

memory_updates JSONB, created_at TIMESTAMP)

**6.4 The Nigerian-Fit Benchmark (200 items)**

This is the most valuable data artifact in the project. It anchors the bonus-rubric claim, doubles as a publishable contribution in the paper, and gives judges a tangible Nigerian thing to look at. Construction takes one full day.

**Composition**

|                                                |           |                                                                   |
|------------------------------------------------|-----------|-------------------------------------------------------------------|
| **Category**                                   | **Count** | **Example items**                                                 |
| Nollywood films                                | 40        | King of Boys, Lionheart, Battle on Buka Street, The Black Book    |
| Afrobeats and gospel albums                    | 30        | Made in Lagos, Twice as Tall, Love Damini, gospel by Mercy Chinwo |
| Local foods and restaurants (Lagos, Abuja, PH) | 40        | Buka, Mama Put, Iya Basira, modern bistros                        |
| Jumia electronics                              | 30        | Itel phones, Tecno Spark, Oraimo accessories, Bruhm appliances    |
| Books by Nigerian authors                      | 30        | Chimamanda, Wole Soyinka, Abi Dare, Akwaeke Emezi                 |
| Services and apps                              | 30        | PiggyVest, Cowrywise, OPay, Bolt, Chowdeck, GTBank app            |

**Per-item fields**

- name, category, description (1 sentence)

- nigerian_features: power_robustness, halal_or_haram, local_warranty, delivery_to_lagos_hours, price_naira

- two gold reviews per item: one Standard Nigerian English, one code-switched. Hand-written or curated, never LLM-generated.

- authentic_voice_anchor: 1 to 3 phrases that any Nigerian would recognize as right for this item

**Construction plan**

31. Day 4 morning: build the item list (4 hours).

32. Day 4 afternoon: write or curate the 400 gold reviews (4 hours, two per item). Joseph writes 200, Claude pair-writes 200 with explicit register prompts; Joseph reviews every Claude draft.

33. Day 4 evening: encode all 200 items with BLaIR embeddings; commit data/naija_slice/items.parquet and data/naija_slice/gold_reviews.parquet.

34. Hold these out from any training data forever. They are the bonus-rubric eval set.

**6.5 Synthetic Nigerian User Generation**

To prove Nigerian-fit on more than 200 items, generate 1,000 synthetic Nigerian users with realistic interaction histories. Use Claude Sonnet 4.6 to write user personas anchored on the five base personas (see Part 8), then use the user simulator itself to generate 30-50 reviews per user across the three domains. This synthetic-data-from-LLM loop is also a paper section (\'Self-bootstrapping evaluation\').

**6.6 Embedding Ingestion**

Batch all embeddings on Day 5. Approximate run times: BLaIR for 100k items via HuggingFace pipeline on a free Colab T4 takes \~90 minutes per domain; OpenAI embed-3-small for 50k user persona summaries takes \~15 minutes and costs about \$0.05. Persist to pgvector with HNSW index (m=16, ef_construction=64). Verify with a known nearest-neighbor sanity check.

**Part 7: Twin-Loop Core (PersonaMemory)**

This is the architectural heart of Naija-Twin. The PersonaMemory module is the single object that both agents read from and write to. Get this right and the rest is implementation; get this wrong and the architecture collapses into two disconnected pipelines like everyone else\'s submission.

**7.1 The Three Memory Types**

Borrowed from PersonaAgent (arxiv 2506.06254) and RecAgent. Cognitive-psychology grounded, papers love it, judges grasp it instantly.

|                 |                                                                                                                                                             |                                                          |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| **Memory type** | **Stores**                                                                                                                                                  | **Used by**                                              |
| Episodic        | Specific past events: (item, rating, review, timestamp). One row per interaction.                                                                           | Both agents, for retrieval and as evidence in reasoning. |
| Semantic        | Distilled facts about the user: \'prefers spicy food\', \'reads literary fiction\', \'budget-conscious below ₦50k\'. LLM-extracted, periodically refreshed. | Both agents, as the persona summary in every prompt.     |
| Procedural      | Behavioural rules: \'always rates 5 stars when product arrives early\', \'writes longer reviews when disappointed\', \'uses Pidgin when angry\'.            | User simulator, for stylistic conditioning.              |

**7.2 PersonaMemory API**

Python class lives in apps/api/naija_twin/memory/persona_memory.py. Exposed via MCP tools to both agents.

class PersonaMemory:

def \_\_init\_\_(self, user_id: str, db: Database):

self.user_id = user_id

self.db = db

async def get_persona_summary(self) -\> str:

\'\'\'Returns the current 200-word semantic summary.\'\'\'

async def get_episodic(self, k: int = 30,

similar_to: str \| None = None) -\> list\[Interaction\]:

\'\'\'Returns last k interactions, or top-k BLaIR-similar to similar_to.\'\'\'

async def get_procedural_rules(self) -\> list\[str\]:

\'\'\'Returns behavioural patterns like rating tendency, length, register.\'\'\'

async def update(self, new_interaction: Interaction,

reflection: Reflection) -\> MemoryUpdates:

\'\'\'Writes the interaction, queues a reflection job, updates semantic summary

if drift detected.\'\'\'

async def get_nigerian_register(self) -\> str:

\'\'\'Returns the inferred default register for this user.

One of: formal_sne, sne_with_markers, code_switch_youth,

pidgin_heavy, diaspora.\'\'\'

**7.3 Semantic Summary Generation**

On user creation or every 50 new interactions, regenerate the persona summary. Prompt template lives in packages/prompts/persona_summary.md. The summary must include: dominant categories, taste descriptors with evidence, price sensitivity, rating tendency (e.g., \'rates strict, median 3\'), review length, register, three named items the user has loved, two they\'ve disliked. Cap at 200 words.

**7.4 Memory Drift Detection**

Compute cosine similarity between the previous persona_embedding and the new one. If drift exceeds 0.15, log an event and trigger a fuller re-summarization. This is paper-worthy (\'Memory Stability Across Interaction Volume\', subsection in the User Modeling section).

**7.5 Item Memory (The Other Half of AgentCF)**

Item memory stores: which persona-types liked this item (with evidence), common complaints, common praise, sentiment polarity by register. Items also drift; an iPhone reviewed in 2018 is a different product to Nigerian buyers than one reviewed in 2025. Refresh item memory whenever its top-K associated reviews change.

**Part 8: Task A Implementation (User Modeling)**

**8.1 Rating Prediction**

Pipeline: retrieve user persona summary, retrieve top-5 BLaIR-similar items from user history, format as Reason4Rec deliberative prompt, sample 5 rating predictions from Claude Sonnet 4.6, take the median, log entropy as confidence.

**Prompt template (packages/prompts/rating_prediction.md)**

System: You predict how a specific user would rate an unseen item on

a 1 to 5 star scale. Reason step by step before answering.

User: Here is everything we know about the user.

Persona: {persona_summary}

Behavioural rules: {procedural_rules}

Recent ratings: {last_30_ratings}

Similar items the user rated: {top_5_blair_similar_with_ratings}

Target item:

Title: {item_title}

Description: {item_description}

Category: {item_category}

Reason: 1) What features matter to this user.

2\) Which similar items they rated and why.

3\) Where this item lands on those dimensions.

4\) Apply procedural rules (rating tendency, severity).

Output strictly as JSON: {\"reasoning\": str, \"rating\": float}

**Self-consistency voting**

Run the prompt 5 times at temperature 0.7. Compute median rating, mean reasoning quality (Claude Opus 4.7 judges), entropy across the 5 ratings. Median beats mean because it\'s robust to outliers. Entropy is the confidence signal: if greater than 0.6, mark prediction as low-confidence and (optionally) trigger active clarification.

**Calibration**

Compute Expected Calibration Error (ECE) and produce a reliability diagram. Most teams stop at RMSE. ECE on top of RMSE turns a 0.02 RMSE delta into a paper-worthy claim: \'Self-consistency reduces ECE by 38% while reducing RMSE by 0.04.\'

**8.2 Review Generation**

Pipeline: condition on the predicted rating from 8.1, retrieve top-5 BLaIR-similar items WITH their reviews, generate the review with Groq Llama 3.3 70B at temperature 0.8, run faithfulness audit, run Nigerian-register validation, regenerate failed sentences up to 2 times.

**Why rating-conditioned generation**

Without conditioning, models default to positive politeness and generate 4-star-feeling reviews for 2-star ratings (the well-documented PETER/NRT incoherence). Naija-Twin emits the rating first, then writes the review to match. This is the CIER pattern (arxiv 2504.05315) and it is the single highest-leverage trick for review quality.

**Prompt template (packages/prompts/review_generation.md)**

System: You are writing a review as a specific Nigerian user. Match

their voice, vocabulary, and rating-implied sentiment exactly.

User persona:

{persona_summary}

Register: {register} \# e.g., \'sne_with_markers\'

Rating you are writing for: {predicted_rating} stars

Examples of how this user writes (top-5 similar items):

{five_examples_review_text}

Target item:

{item_title}

{item_description}

Write a review in their voice. Length similar to their typical reviews

({avg_review_length} words). Match the register. If rating \<= 2 stars,

the review must convey dissatisfaction; if \>= 4, satisfaction.

Hard rule: do not use em dashes. Use commas, periods, parens.

Output only the review text, no preamble.

**8.3 Faithfulness Audit**

This is the most underrated trick in the manual. Most LLM review generators hallucinate plausible-sounding facts not present in the user\'s history. Naija-Twin checks every sentence.

**Mechanism**

35. Split generated review into sentences.

36. Build a \'premise\' from user history: persona summary + top-5 similar items + procedural rules.

37. For each sentence (the \'hypothesis\'), run DeBERTa-v3-MNLI: P(entailment), P(neutral), P(contradiction).

38. If P(contradiction) \> 0.4 OR P(entailment) \< 0.3, flag the sentence.

39. Regenerate flagged sentences with a focused prompt; if 2 retries fail, drop the sentence.

**Why this matters for the paper**

Most teams will report ROUGE and BERTScore and stop. We report faithfulness rate (% of generated sentences entailed by user history) before and after the audit. A table showing \'Untuned Claude: 73% faithful; with audit: 94% faithful\' is a publishable contribution. It also defends against the brutal human-eval question \'Is this review actually realistic for this user?\'

**8.4 Persona Summary Refresh**

Every 50 new interactions, regenerate the semantic summary. Compare embeddings; if drift \> 0.15, full re-summarization. Log all drift events for the paper\'s \'Memory Stability\' section.

**Part 9: Task B Implementation (Recommendation)**

**9.1 The Three-Tool Brain (InteRecAgent Pattern)**

Claude Sonnet 4.6 is the orchestrator. It has access to three tool buckets, plus the persona memory tools from Part 7.

|                   |                                                                      |                                         |
|-------------------|----------------------------------------------------------------------|-----------------------------------------|
| **Tool bucket**   | **Tools**                                                            | **Backing impl**                        |
| Information query | get_item_by_id, search_items_by_category, get_item_reviews_summary   | Postgres queries                        |
| Retrieval         | retrieve_blair_similar(query_text, k), retrieve_a_llmrec(user_id, k) | pgvector HNSW search + A-LLMRec wrapper |
| Ranking           | rank_candidates_reason4rec(user_id, candidate_ids)                   | Claude call with deliberative prompt    |

Two memory tools from Part 7 also exposed: get_persona_summary, get_episodic_similar. Plus the Nigerian validation tool from Part 10.

**9.2 The Reason4Rec Deliberative Prompt**

Three reasoning stages, one prompt, structured JSON output.

System: You rank candidate items for a specific user. Three stages.

Stage 1 (preference distillation): given the user persona, list 5

specific preferences with evidence from history.

Stage 2 (matching): for each candidate, score on each preference (-2 to 2)

with one-sentence justification.

Stage 3 (prediction): aggregate to a relevance score 0-1 per candidate.

Then re-rank from highest to lowest. Apply Nigerian-fit boost if

user has nigerian_persona set.

Output JSON: {preferences: \[\...\], scores: \[{item_id, score, reasons}\]}

**9.3 Cold-Start (PEBOL)**

Worth 25 points in the rubric. Most teams will hack this with a popularity baseline or skip it. PEBOL (RecSys 2024, arxiv 2405.00981) wraps Bayesian Optimization around an LLM acquisition function for natural-language preference elicitation. It reports up to 131% improvement over GPT-3.5 monolithic elicitation.

**Flow**

40. New user arrives, fewer than 5 interactions.

41. Agent maintains a posterior over user preferences as a list of natural-language hypotheses.

42. Each turn: LLM proposes 3 candidate questions; Bayesian acquisition picks the one with highest expected information gain (approximated by entropy reduction over the hypothesis set).

43. User answers. Posterior updated by LLM-based likelihood scoring.

44. After 3 turns, generate initial recommendations from the posterior.

45. Recommendations come with explicit reasons grounded in elicited preferences.

**Implementation note**

Joseph does not need to re-implement PEBOL from scratch. The paper\'s GitHub release has reference code; adapt it to our PersonaMemory abstraction and the Vercel AI SDK tool loop. Budget: 1.5 days, Day 8 and Day 9 morning.

**9.4 Cross-Domain Transfer**

Because user profiles live in natural language, cross-domain transfer is free at inference. A Goodreads-only user with a profile mentioning \'literary fiction with strong female protagonists\' transfers to Amazon Books cold-item recommendations without retraining.

For the paper, run a specific cross-domain ablation: train persona memory on Goodreads only, test recommendations on Amazon Books. Compare to a same-domain baseline. Report HR@10 gap.

**9.5 Multi-Objective Re-Ranking**

After Reason4Rec produces a relevance ranking, re-rank with a weighted Pareto front across four objectives:

- Relevance (Reason4Rec score, weight 0.5)

- Diversity (Maximum Marginal Relevance over BLaIR embeddings, weight 0.2)

- Serendipity (negative cosine to top-10 most-purchased items, weight 0.1)

- Nigerian-fit (power_robustness + local_warranty + delivery_sla + halal_match, weight 0.2)

Weights are tunable. Report a sensitivity analysis in the paper. The Nigerian-fit weight is the differentiator: enabling it for Nigerian-persona users and disabling it for others gives a clean ablation table row.

**9.6 Explanation Generation**

For every top-10 item, generate a one-sentence explanation citing evidence: \'Recommended because you rated \[item_X\] 5 stars and praised its battery life; this product has the same battery chip and a 12-month Lagos warranty.\' Explanations are extractive grounded in episodic memory, not free-form generation. This is non-negotiable for the contextual-relevance human-eval line.

**Part 10: The Nigerian Voice Layer**

This is the bonus-rubric anchor. Built once, integrated everywhere. The goal is for any Nigerian judge to read a generated review and say \'yes, that is one of us.\'

**10.1 The Register Spectrum**

Nigerian voice is not one register. Five registers along a continuum, each with anchored use cases.

|                   |                                                     |                                                                                                                        |                                         |
|-------------------|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| **Register**      | **Who uses it**                                     | **Marker density**                                                                                                     | **Example tone**                        |
| formal_sne        | Bankers, formal Jumia reviews, news writing         | Zero markers, near-standard English with subtle Nigerian English grammar (resumptive pronouns, mass-count differences) | Professional product critique           |
| sne_with_markers  | Everyday Nigerian English with light Pidgin markers | One marker every 2-3 sentences                                                                                         | Social media review, casual blog        |
| code_switch_youth | FUTA-age students, social media, Twitter Nigeria    | Heavy code-switching, Pidgin clauses, English clauses                                                                  | Slangy enthusiasm or dismissal          |
| pidgin_heavy      | Naija/PCM dominant, traders, market context         | Pidgin as base, minimal English insertion                                                                              | Vendor reviews, street-level commentary |
| diaspora          | Houston, London, Toronto Nigerians                  | SNE base with nostalgic Pidgin insertions about home                                                                   | Comparative tone (here vs naija)        |

**10.2 The Five Anchored Personas**

Each persona ships with a one-page profile, ten gold reviews across the three domains, a default register, and an embedded vector in the persona memory.

**Persona 1: Adekunle Bankole, Lagos Banker**

**Age:** 34

**Job:** Mid-level relationship manager at a tier-1 bank, Victoria Island

**Religion:** Pentecostal Christian

**Languages:** English (primary), Yoruba (home), light Pidgin

**Default register:** formal_sne

**Buying patterns:** Premium electronics, business books, fine dining, golf gear, premium spirits

**Voice markers:** \'Professional\' as praise; \'value for money\' as the central axis; cites warranty terms

Sample gold review (5-star, Bose QC45): \'The noise cancellation justifies the price point. Battery comfortably handles a Lagos-to-Abuja flight with the layover. Comfortable through three back-to-back meetings. Local warranty was honored at SLOT Computer Village without escalation. Recommended for any banker who commutes Third Mainland Bridge daily.\'

**Persona 2: Halima Ibrahim, Kano Civil Servant**

**Age:** 42

**Job:** Senior administrative officer, state ministry

**Religion:** Muslim

**Languages:** Hausa (primary), English (work), light Arabic

**Default register:** sne_with_markers (with occasional Hausa insertions like walahi, kai)

**Buying patterns:** Children\'s needs, modest clothing, religious materials, household appliances

**Voice markers:** \'Alhamdulillah\' on positive outcomes, \'Wallahi\' for emphasis, halal certification matters, family approval framing

Sample gold review (4-star, Bruhm freezer): \'Walahi the freezer is doing well. Five months now, no problem. NEPA voltage sometimes high but the surge protector dey hold am. My husband say na good buy. One small wahala, the inner light spoil after three months, but customer care fixed am quick. Alhamdulillah for vendors who keep their word.\'

**Persona 3: Chukwuma Okafor, Onitsha Trader**

**Age:** 38

**Job:** Electronics importer, Onitsha main market

**Religion:** Catholic

**Languages:** Igbo (primary), Pidgin (market), English (formal)

**Default register:** pidgin_heavy

**Buying patterns:** Bulk electronics, generators, motorcycles, family essentials

**Voice markers:** \'Original\' vs \'fake\' is the dominant axis, \'tear-rubber\' as praise, \'tokunbo\' for imported second-hand, prices and margins matter

Sample gold review (5-star, Sumec generator): \'This Sumec na original, no doubt. Buy am tear-rubber from authorized dealer, three months now e dey run my shop and house. Use am during PHCN wahala last week, e no shake. Fuel consumption fair sha. If you wan buy generator, no buy fake o, buy from authorized seller. Original na original.\'

**Persona 4: Ifeoma Eze, FUTA Undergrad**

**Age:** 21

**Job:** 300 level Computer Science, social media native

**Religion:** Christian, not super-strict

**Languages:** English, Igbo (home), heavy Pidgin code-switching, Yoruba slang

**Default register:** code_switch_youth

**Buying patterns:** Phones, sneakers, skincare, streaming, Afrobeats vinyl, Detty December events

**Voice markers:** \'No gree for anybody\', \'e choke\', \'🔥\', mentions Big Brother Naija and Davido, prices in ₦k notation

Sample gold review (2-star, off-brand earbuds, ₦8k): \'Babes, this one e pain me. Bought it ₦8k thinking I dey gain, na so the right earbud die after one week. The sound sef no get bass, like I dey listen to AM radio. The connection dey cut every five minutes, e choke (in a bad way). Just buy Oraimo or save up for AirPods abeg. Las las, ₦8k for the bin.\'

**Persona 5: Tunde Adeyemi, Houston-Based Diaspora**

**Age:** 31

**Job:** Software engineer, second-generation diaspora, visits naija twice a year

**Religion:** Lapsed Christian

**Languages:** American English (work), Pidgin (with naija friends), some Yoruba

**Default register:** diaspora

**Buying patterns:** Tech, food delivery, books about Nigeria, gifts for family back home, Afrobeats concerts

**Voice markers:** \'Back home\', \'in naija\', nostalgic comparisons, brings up exchange rate, cares about shipping to family

Sample gold review (5-star, Things Fall Apart re-read): \'Re-reading this for the third time and it still hits. Different now, reading it from Houston versus when we did it for SS3 in Lagos. Achebe\'s prose stays clean. Sent a copy to my niece in Surulere; ₦25k including shipping but worth it. If you grew up reading this back home and you\'re in the diaspora, you owe it to yourself to revisit.\'

**10.3 Lexicon Table (Use Sparingly, Authentically)**

|                            |                                                                    |                                 |
|----------------------------|--------------------------------------------------------------------|---------------------------------|
| **Term**                   | **Meaning**                                                        | **Best register**               |
| wahala / no wahala         | Trouble / no trouble                                               | All non-formal                  |
| sapa                       | Financial hardship                                                 | code_switch_youth, pidgin_heavy |
| japa                       | Flee abroad (often for opportunity)                                | diaspora, youth                 |
| tear-rubber                | Brand new, fresh from packaging                                    | pidgin_heavy, sne_with_markers  |
| tokunbo                    | Imported second-hand (positive connotation)                        | pidgin_heavy, traders           |
| e choke                    | Overwhelming, often positive (e choke!) or negative (in a bad way) | code_switch_youth               |
| e pain me                  | Disappointment, regret                                             | All non-formal                  |
| original vs fake           | Genuine vs counterfeit                                             | All registers                   |
| las las                    | Eventually, in the end (resigned)                                  | Non-formal                      |
| no gree for anybody        | Stand your ground (2024 slang)                                     | code_switch_youth               |
| we move                    | We keep going (resilient close)                                    | All non-formal                  |
| nawa o, yawa               | Dismay, mess                                                       | All non-formal                  |
| jara                       | Bonus, extra given                                                 | Traders, sne_with_markers       |
| abeg, sef, sha, o, na, ehn | Discourse markers (cluster, do not blanket)                        | All non-formal                  |
| Alhamdulillah, walahi      | Religious markers (Muslim)                                         | Muslim personas only            |
| Thank God, by His grace    | Religious markers (Christian)                                      | Christian personas              |

**10.4 Marker Density Rules**

Authentic Nigerian voice is about placement, not frequency. Following Unuabonah\'s corpus work on Nigerian Pidgin pragmatic markers, markers cluster around specific moments (exclamations, transitions, emotional peaks), not as decoration. Hard rules per register:

- formal_sne: 0 markers, but Nigerian English grammar (resumptive pronouns, \'as in\', \'in fact\')

- sne_with_markers: 1 marker per 60-80 words, placed at emotional or transitional points

- code_switch_youth: 2 to 4 markers per 80 words, including English slang like \'lowkey\', \'fr fr\', plus Pidgin

- pidgin_heavy: Pidgin as base grammar (dey, don, go aspect markers), English as the insertion language

- diaspora: 1 marker per 100 words, almost always nostalgic (\'back home\', \'in naija\')

**10.5 The AfriBERTa MCP Tool**

Davlan/naija-twitter-sentiment-afriberta-large, exposed as an MCP tool called classify_nigerian_register. Used in two places:

46. Inside the review generation loop as a post-hoc validator: classify generated text; if predicted register does not match requested register, regenerate.

47. Inside the recommendation explanation generator: classify user\'s historical review style to set the explanation tone.

Implementation: HuggingFace Inference API for first 30k calls (free), fall back to a small CPU instance on Render if needed. Caches results in Redis keyed by text hash.

**10.6 Nigerian-Factor Item Features**

Every item in the Nigerian-fit benchmark and every recommendation explanation surfaces these features when applicable:

- power_robustness: how well it handles NEPA voltage spikes (0-3 scale, manually annotated)

- local_warranty: months of in-Nigeria warranty

- delivery_to_lagos_hours: median fulfillment time

- halal_certification: boolean, matters for Muslim personas

- price_naira: at current exchange rate, with date stamp

- local_endorsement: BBN, Davido, Wizkid, pastor, traditional ruler signals if any

These features feed both the Nigerian-fit re-ranking objective (Part 9.5) and the explanation generator. They are the operational definition of \'sound like Nigerians\' that the rubric rewards.

**Part 11: MCP Tools (Full Specification)**

Every tool below is exposed via the MCP server in apps/api/naija_twin/main.py. Both the Next.js orchestrator and any external MCP client (Claude Desktop, claude.ai) can call them. Schemas are validated with Pydantic v2.

**11.1 Memory tools**

**get_persona_summary**(user_id) → str

**get_episodic**(user_id, k=30, similar_to=None) → list\[Interaction\]

**get_procedural_rules**(user_id) → list\[str\]

**update_memory**(user_id, interaction, reflection) → MemoryUpdates

**get_item_memory**(item_id) → ItemMemory

**11.2 Retrieval tools**

**retrieve_blair_similar**(query_text, k=10, domain=None) → list\[Item\]

**retrieve_a_llmrec**(user_id, k=100) → list\[Item\]

**search_items_by_category**(category, filters, k=20) → list\[Item\]

**11.3 Generation tools**

**predict_rating**(user_id, item_id, n_samples=5) → RatingPrediction

**generate_review**(user_id, item_id, predicted_rating, register=None) → Review

**generate_explanation**(user_id, item_id, recommendation_context) → str

**rank_candidates_reason4rec**(user_id, candidate_ids) → list\[ScoredCandidate\]

**11.4 Nigerian tools**

**classify_nigerian_register**(text) → RegisterClassification

**compute_nigerian_fit_score**(user_id, item_id) → float

**get_nigerian_persona_template**(persona_id) → PersonaTemplate

**11.5 Cold-start tools**

**cold_start_propose_question**(user_id, prior_answers) → str

**cold_start_update_posterior**(user_id, question, answer) → Posterior

**cold_start_recommend**(user_id, k=10) → list\[Item\]

**11.6 Audit tools**

**faithfulness_audit**(review_text, user_id) → list\[SentenceAudit\]

**counterfactual_probe**(user_id, remove_item_id) → Diff (recommendation drift)

**11.7 Tool design principles**

- Every tool has a Pydantic input model and a Pydantic output model. Schemas are auto-published to OpenAPI and to MCP.

- Every tool emits a Langfuse span with the user_id as the session ID.

- Every tool result is cached in Redis with a TTL of 1 hour unless explicitly bypassed.

- Every tool has at least one unit test in tests/test_tools.py.

- Tool names are snake_case, verb-first, no abbreviations. Names appear in Langfuse traces and judge demos.

**Part 12: Evaluation Harness**

All eval scripts live in eval/. Each produces a JSON in eval/results/{date}/{script}.json. The Makefile target \'make eval\' runs all of them. CI runs a smoke version on every PR.

**12.1 Task A metrics**

|                                  |                                 |                                                          |
|----------------------------------|---------------------------------|----------------------------------------------------------|
| **Metric**                       | **Script**                      | **What it measures**                                     |
| RMSE, MAE                        | eval/task_a/rating_metrics.py   | Rating prediction accuracy                               |
| Expected Calibration Error (ECE) | eval/task_a/calibration.py      | Confidence vs accuracy alignment                         |
| ROUGE-1, ROUGE-L, ROUGE-Lsum     | eval/task_a/review_rouge.py     | N-gram overlap with reference reviews                    |
| BERTScore F1                     | eval/task_a/review_bertscore.py | Semantic similarity                                      |
| Sentence-BERT cosine             | eval/task_a/review_sbert.py     | Embedding similarity (closer to AgentSociety metric)     |
| Faithfulness rate                | eval/faithfulness/audit.py      | % entailed sentences                                     |
| Register accuracy                | eval/task_a/register_match.py   | AfriBERTa-classified register matches requested register |

**12.2 Task B metrics**

|                               |                             |                                             |
|-------------------------------|-----------------------------|---------------------------------------------|
| **Metric**                    | **Script**                  | **What it measures**                        |
| NDCG@10                       | eval/task_b/ndcg.py         | Ranking quality, the rubric headline metric |
| Hit Rate@5, @10               | eval/task_b/hr.py           | Whether the target item is in top-k         |
| MRR                           | eval/task_b/mrr.py          | Reciprocal rank of target item              |
| Cold-Start HR@10              | eval/task_b/cold_start.py   | On the cold-user split                      |
| Cross-domain HR@10            | eval/task_b/cross_domain.py | Train on one domain, test on another        |
| Diversity (intra-list cosine) | eval/task_b/diversity.py    | Item variety in top-10                      |
| Serendipity                   | eval/task_b/serendipity.py  | Distance from popular items                 |

**12.3 Nigerian-fit eval**

On the held-out 200-item benchmark, run review generation under each of the 5 personas. For each (persona, item) pair:

- AfriBERTa register classification matches expected register: target at or above 70%

- Lexicon usage rate per register: target within 1 std of gold examples

- Nigerian-factor mention rate: % of reviews citing power_robustness, warranty, or delivery: target at or above 40% for relevant items

- Human-judged authenticity (Joseph plus 2 Nigerian friends): 5-point Likert, target at or above 4.0 mean

**12.4 Baselines (Mandatory)**

Every results table includes these baselines. Without them the paper looks naive.

|                                   |                                    |                                                |
|-----------------------------------|------------------------------------|------------------------------------------------|
| **Baseline**                      | **Why it matters**                 | **Expected to beat**                           |
| Popularity (most-rated items)     | The \'do-nothing\' lower bound     | Naija-Twin beats by 3-5x NDCG                  |
| ItemKNN (collaborative filtering) | Classic statistical baseline       | Naija-Twin beats by 1.5-2x                     |
| BM25 over item descriptions       | Pure text retrieval                | Naija-Twin beats by 1.5x                       |
| SASRec                            | Neural sequential baseline         | Naija-Twin beats on cold-start, parity on warm |
| P5 zero-shot                      | Generative recommendation baseline | Naija-Twin beats on all                        |
| TALLRec (LoRA Llama)              | LoRA fine-tuned LLM                | Naija-Twin beats on cold-start, parity on warm |
| GPT-4o zero-shot                  | Frontier LLM lower bound           | Naija-Twin beats by 5-10% NDCG                 |

**12.5 Ablation Table (Paper Centerpiece)**

Drop one component, re-run the four headline metrics. This table earns the paper its top score. Pre-build it on Day 8 so by Day 13 every cell is filled.

|                        |                                  |                              |                  |                  |
|------------------------|----------------------------------|------------------------------|------------------|------------------|
| **Variant**            | **NDCG@10**                      | **RMSE**                     | **Faithfulness** | **Nigerian-fit** |
| Full Naija-Twin        | (target)                         | (target)                     | (target)         | (target)         |
| No persona memory      | expected drop                    | expected drop                | expected drop    | expected drop    |
| No self-consistency    | small change                     | expected drop                | small change     | small change     |
| No faithfulness audit  | small change                     | small change                 | expected drop    | small change     |
| No PEBOL (cold-start)  | expected drop on cold-user split | (same)                       | (same)           | (same)           |
| No Nigerian re-ranking | small change                     | (same)                       | (same)           | expected drop    |
| No reflection loop     | expected drop after 50 turns     | expected drop after 50 turns | (same)           | (same)           |

**12.6 Human Evaluation**

50 held-out users, 3 generated reviews each = 150 review items. Three systems: Naija-Twin, GPT-4o zero-shot, TALLRec. Three annotators (Joseph plus 2 Nigerian friends). Each annotator rates each (review, user history) pair on a 5-point Likert across four dimensions:

- Stylistic fidelity (does this sound like this user?)

- Faithfulness (does this match what we know about them?)

- Coherence (is it well-written?)

- Nigerian authenticity (does this sound like a Nigerian?)

Report Krippendorff\'s alpha for inter-annotator agreement (target \> 0.6). Also run pairwise A/B preference. Use Claude Opus 4.7 as LLM-as-judge for the full 1000-item eval, calibrated against the 150-item human eval via Spearman rho (target \> 0.7).

**12.7 Reporting Standards**

- All metrics report mean ± std across 3 seeds.

- Statistical significance via paired bootstrap (10,000 resamples).

- Confidence intervals on the four headline metrics in the README.

- All eval JSON files committed to eval/results/ with the model version that produced them.

**Part 13: Reproducibility Checklist**

Judges attempt to run the code. Every item below must be checked before submission. This is the non-negotiable contract.

48. docker compose up boots the full stack in under 5 minutes from a clean clone.

49. make reproduce runs a 1% sample end-to-end in under 5 minutes; outputs match committed reference within tolerance.

50. make eval runs all metric scripts on full test split; outputs match the README claims.

51. uv.lock and pnpm-lock.yaml committed and current.

52. Seeds fixed: random.seed(42), numpy.random.seed(42), torch.manual_seed(42), transformers set_seed(42).

53. HuggingFace dataset and model versions pinned in code and listed in README.

54. .env.example has every required variable with a placeholder, including a sample Anthropic key, Groq key, OpenAI key, Neon URL, Upstash URL, Langfuse keys.

55. Hardware and runtime declared: \'tested on Ubuntu 22.04, Python 3.12, Node 20, 16GB RAM, full eval 47 min CPU + 12 min GPU.\'

56. evaluate.py runs all four headline metrics from a single predictions CSV.

57. Public Langfuse demo project URL in the README.

58. 60-second quickstart.sh for impatient judges.

59. GitHub Actions CI runs a 10-user smoke test on every PR; badge in README.

60. All notebooks have outputs cleared before commit.

61. No .env, no API keys, no large datasets committed (gitignore audited).

62. README has a \'Why this matters\' opener, architecture diagram, quickstart, demo URL, paper PDF link.

**Part 14: Solution Paper Outline (4 to 8 pages)**

The brief calls this \'the primary talent signal\' and \'what judges read first.\' Open paper/paper.md on Day 1. Fill sections as experiments land. No section is allowed to wait until Day 13.

**14.1 Structure (NeurIPS workshop format, 8 pages with references)**

**Abstract (150 words, 4 sentences)**

Sentence 1: the gap. Sentence 2: contributions in numbers. Sentence 3: method gloss. Sentence 4: code link.

**1. Introduction (0.75 pages)**

Three paragraphs. Para 1: most LLM rec systems treat users as static profiles; AgentCF and Agent4Rec point a way forward but stop at English-monolithic users. Para 2: Naija-Twin\'s three contributions. Para 3: paper roadmap.

**2. Related Work (0.5 pages)**

Three subsections, 4-5 citations each: user simulation (Agent4Rec, RecAgent, AgentCF, PersonaAgent), agentic recommendation (InteRecAgent, RecMind, Reason4Rec, A-LLMRec), low-resource language recommendation (NaijaSenti, AfriBERTa, Awarri N-ATLaS).

**3. The Twin-Loop Architecture (1.5 pages)**

Figure 1: architecture diagram. Subsections: 3.1 Persona Memory (triad), 3.2 User Simulator Agent, 3.3 Recommender Agent, 3.4 Reflection Loop. Every component cites the paper it extends and notes the extension.

**4. Nigerian Contextualization (1.5 pages)**

Figure 2: register spectrum, five personas. Subsections: 4.1 Register-conditioned generation, 4.2 The Nigerian-fit benchmark (200 items), 4.3 AfriBERTa post-validation, 4.4 Nigerian-factor item features. This section is the bonus-rubric anchor and the most novel contribution; it should read like a publishable evaluation paper.

**5. Experiments (2 pages)**

Subsections: 5.1 Datasets and splits, 5.2 Baselines, 5.3 Implementation details, 5.4 Task A results (Table 1: ratings, Table 2: review quality), 5.5 Task B results (Table 3: warm, Table 4: cold-start, Table 5: cross-domain), 5.6 Ablations (Table 6, the centerpiece), 5.7 Human evaluation, 5.8 Nigerian-fit benchmark results.

**6. Discussion (0.5 pages)**

What works, what does not, why. Honest failure cases. Inference cost and latency reported (p50/p95).

**7. Conclusion and Future Work (0.25 pages)**

Limitations: synthetic Nigerian users, single annotator-language, no fine-tuning. Future: scale to other African languages with the same infrastructure.

**References**

All citations verified to resolve. No hallucinated arxiv IDs. BibTeX in paper/references.bib.

**14.2 Writing rhythm**

Daily 30-minute paper writing slot, end of day. No exceptions. By Day 7 the abstract and introduction are draft-complete. By Day 10 sections 3 and 4 are complete. By Day 13 only section 5 numbers update and section 6 gets a polish.

**14.3 Voice**

Direct, concrete, numeric. No adjectives without numbers. No em dashes. Active voice. Past tense for what we did, present for what the system does. First-person singular \'I\' is fine for a solo submission and signals confidence.

**Part 15: Demo Strategy (For the June 10 Finale)**

Top 4 teams present live. The demo is the moment the paper, the code, and the Nigerian context collide into 5 minutes of judge experience. Rehearse 10 times.

**15.1 Live demo script (5 minutes)**

63. 0:00 to 0:30. Open on the architecture slide. One sentence: \'Naija-Twin solves both tasks with one shared brain.\' Show the Twin-Loop diagram.

64. 0:30 to 1:30. Switch to the running web app. Select Persona 2 (Halima Ibrahim, Kano civil servant). Ask: \'recommend a freezer.\' Watch the live Langfuse trace appear in the corner: PEBOL fires (cold-start mode for this fresh session), three preference questions, recommendation appears with Nigerian-factor explanation.

65. 1:30 to 3:00. Click the counterfactual probe. \'What if Halima had not previously bought the Tecno phone?\' Re-run; watch recommendations shift, narrate why. This is the visible agentic reasoning.

66. 3:00 to 4:00. Switch to Task A mode. Generate a review for Halima for the recommended freezer. Show the faithfulness audit panel: \'sentence 3 flagged, regenerated, now entailed.\' Show the AfriBERTa register classifier: \'matches sne_with_markers, confidence 0.87.\'

67. 4:00 to 4:45. Show the ablation table on screen. Point at one row: \'Removing persona memory drops NDCG@10 by 0.08, drops faithfulness by 21 percentage points, drops Nigerian-fit by 19 points. These three differentiators are doing real work.\'

68. 4:45 to 5:00. Close: \'One agent, one memory, two tasks, five Nigerian voices, all reproducible by docker compose up.\' Bow.

**15.2 Demo redundancy**

- Record a 3-minute polished video on Day 12. Hosted on YouTube unlisted, link in README. Insurance if the live demo crashes.

- Pre-cache 10 demo queries in Redis. Live demo uses one of them; if a fresh query fails, fall back instantly.

- Have the laptop, plus a phone hotspot, plus a USB key with the docker-compose stack ready to boot on the judge\'s laptop if needed.

- Test the demo on Render production URL three days before the finale.

**15.3 Slide deck (8 slides max)**

- Slide 1: Title, name, FUTA badge, one-sentence value proposition

- Slide 2: The brief in one sentence + four headline metrics (with confidence intervals)

- Slide 3: Twin-Loop architecture diagram

- Slide 4: The five personas (mini-portraits)

- Slide 5: Faithfulness audit + Nigerian-fit benchmark (one chart each)

- Slide 6: Ablation table (one slide, the centerpiece)

- Slide 7: Live demo (placeholder)

- Slide 8: Code link, paper link, contact

**Part 16: Daily Build Plan (May 12 to May 24)**

Thirteen days. Each day has a single primary goal and a 30-minute paper-writing slot at the end. Days are scoped for 6 to 8 hours of focused work. Friday and Saturday are the highest-leverage days; protect them.

**Day 1 (Mon May 12): Foundation and Reconnaissance**

- Apply for Anthropic Claude Student Builder credits (do this first, before lunch)

- Clone tsinghua-fib-lab/WebSocietySimulator; read the README, the leaderboard, the winning writeups

- Read Review-LLM (arxiv 2407.07487) and Reason4Rec (arxiv 2502.02061) end-to-end

- Run the master Claude Code prompt to scaffold the repo

- Commit empty paper/paper.md with the section headers and the abstract template

- Set up GitHub repo, Vercel project, Render account, Neon DB, Upstash Redis, Langfuse cloud free tier

- End of day: repo skeleton boots locally via docker compose up; an empty Langfuse trace fires successfully

**Day 2 (Tue May 13): Data Pipeline**

- Download Yelp, Amazon Reviews 2023 (Books + Beauty + Electronics), Goodreads

- Build the sampling script: 50k users, 100k items, 1M interactions per dataset

- Time-based split: 80/10/10, plus cold-item and cold-user holdouts

- Ingest into Neon Postgres with the six-table schema

- End of day: SELECT count(\*) returns \~3M interactions across three domains

**Day 3 (Wed May 14): Embeddings and Retrieval Baseline**

- Ingest BLaIR embeddings for Amazon (pre-built); compute BLaIR for Yelp and Goodreads

- Index all item embeddings in pgvector with HNSW

- Implement retrieve_blair_similar tool

- Run a popularity baseline and a BM25 baseline; commit baseline results to eval/results/

- Lock the four headline metrics in eval/README.md; publish initial values

- End of day: pgvector returns top-10 BLaIR-similar in under 50ms; baselines in eval/results/

**Day 4 (Thu May 15): The Nigerian-Fit Benchmark**

- Build the 200-item list across the six categories

- Write or curate 400 gold reviews (2 per item, across registers)

- Annotate every item with Nigerian-factor features

- Commit data/naija_slice/ with items.parquet, gold_reviews.parquet, and a README explaining the construction

- End of day: Nigerian-fit benchmark is a publishable artifact in its own right

**Day 5 (Fri May 16): PersonaMemory Module**

- Implement PersonaMemory class with three memory types

- Implement persona_summary generator (Claude Sonnet 4.6, prompt template in packages/prompts/)

- Generate persona summaries for all 50k users x 3 domains (batch overnight on Sonnet with caching)

- Embed all summaries with embed-3-small

- End of day: get_persona_summary(user_id) returns a 200-word coherent profile

**Day 6 (Sat May 17): User Simulator Agent (Rating)**

- Implement predict_rating tool with self-consistency (5 samples, median)

- Run rating prediction on the full test split

- Compute RMSE, MAE, ECE; commit to eval/results/

- Compare against GPT-4o zero-shot baseline and the in-context-reviews baseline (arxiv 2510.00449)

- End of day: RMSE on Amazon Books at or below 1.05, ECE reported

**Day 7 (Sun May 18): User Simulator Agent (Review)**

- Implement generate_review tool with rating conditioning and Groq Llama 3.3 70B

- Implement faithfulness audit (DeBERTa-MNLI)

- Run review generation on the full test split

- Compute ROUGE-1, ROUGE-L, BERTScore, Sentence-BERT cosine, faithfulness rate

- Halfway-point paper checkpoint: abstract, intro, sections 3 and 4 outlined

**Day 8 (Mon May 19): Recommender Agent (Three-Tool Brain)**

- Implement the InteRecAgent orchestrator in Next.js with Vercel AI SDK ToolLoopAgent

- Implement retrieve_a_llmrec (wrap a pre-trained SASRec)

- Implement rank_candidates_reason4rec

- Run NDCG@10 on the warm test split; commit results

- End of day: NDCG@10 at or above 0.40 on warm

**Day 9 (Tue May 20): Cold-Start (PEBOL)**

- Implement PEBOL Bayesian acquisition loop

- Run cold-user eval

- Compare against popularity baseline and a vanilla LLM-elicitation baseline

- Implement cross-domain eval: train on Goodreads, test on Amazon Books

- End of day: PEBOL beats popularity by at least 2x HR@10 on cold-user

**Day 10 (Wed May 21): Nigerian Voice Layer**

- Implement the register slider in the Next.js UI

- Implement classify_nigerian_register MCP tool (AfriBERTa)

- Wire the register validator into generate_review (regenerate on mismatch)

- Implement compute_nigerian_fit_score tool

- Wire Nigerian-fit re-ranking into the recommender

- Run the Nigerian-fit eval on the 200-item benchmark

- End of day: Nigerian-fit benchmark accuracy at or above 65%

**Day 11 (Thu May 22): Reflection Loop and Counterfactual Probe**

- Implement reflection worker on the Redis queue (Claude Haiku 4.5)

- Implement counterfactual_probe tool

- Run the full ablation table: drop each component, re-run all four metrics, 3 seeds each

- End of day: ablation table is fully populated

**Day 12 (Fri May 23): Polish, Demo Video, Paper Push**

- Run the human evaluation: 50 users x 3 systems x 3 annotators (Joseph + 2 friends)

- Compute Krippendorff alpha, Spearman with LLM-judge

- Record the 3-minute demo video

- Write paper sections 5 (Experiments) and 6 (Discussion) to completion

- Final pass on the README: architecture diagram, quickstart, demo URL, paper PDF link

- Run the reproducibility checklist end-to-end (Part 13)

**Day 13 (Sat May 24): Final Polish and Submit**

- Paper final read-through and PDF export (paper.md → pandoc → paper.pdf)

- Verify all citations resolve, no hallucinated arxiv IDs

- Lock all eval numbers; freeze the repo

- Build a tagged release on GitHub: v1.0.0 with all artifacts

- Submit the three deliverables before midnight: agent URL, paper PDF, GitHub repo URL

- Post the WhatsApp community announcement; sleep

**Days 14 to 28 (May 25 to June 8): Hardening Buffer**

Top 4 teams notified May 29 to June 1. If notified, use these days to polish the live demo (Part 15), record a higher-quality video, prepare slide deck, rehearse 10 times. If not notified, post the build-in-public Twitter thread, write a Substack postmortem, and pitch the system to Bluechip as a portfolio anchor.

**Part 17: Submission Checklist (May 24, by midnight WAT)**

The brief is explicit: three deliverables, no extensions. Verify each before submitting.

**17.1 Deliverable 1: Link to the Agent (Containerized App)**

- Public URL accessible without authentication

- Both Task A (review and rating simulation) and Task B (recommendation) endpoints functional

- Health-check endpoint returns 200 in under 1 second

- Tested from a fresh browser, fresh phone, and a different country (VPN)

- Loads in under 3 seconds on Nigerian 4G

- README explains the two endpoints with sample curl commands

**17.2 Deliverable 2: Solution Paper (4 to 8 pages)**

- PDF, 8 pages including references

- Abstract is 4 sentences, contributions in numbers

- All four headline metrics in the abstract with confidence intervals

- Architecture diagram on page 2

- Ablation table with all 6 ablations populated

- All citations resolve; BibTeX file committed

- No em dashes; verified with grep

**17.3 Deliverable 3: GitHub Repository**

- Public repo, MIT or Apache 2.0 license

- README has architecture diagram, quickstart, four headline metrics, demo URL, paper PDF link

- docker compose up boots the full stack in under 5 minutes

- make reproduce passes

- CI is green on the main branch

- Tagged release v1.0.0 with all artifacts

- Langfuse public demo project URL in README

- All eval JSON files in eval/results/ committed

**17.4 Final Submission Form**

The brief specifies a submission form. Paste the three URLs (deployed agent, paper PDF, GitHub repo). Double-check each one opens correctly from an incognito window before hitting submit.

**Part 18: Risk Register and Mitigations**

Known risks ranked by combined probability and impact. Each has a written mitigation. Review this list at the end of Days 5, 8, and 11.

|                                                   |                 |            |                                                                                                                                    |
|---------------------------------------------------|-----------------|------------|------------------------------------------------------------------------------------------------------------------------------------|
| **Risk**                                          | **Probability** | **Impact** | **Mitigation**                                                                                                                     |
| Anthropic Student Credits delayed beyond Day 7    | Medium          | High       | Fall back to Groq Llama 3.3 70B for reasoning; Claude Sonnet 4.6 only for the ranking step. Pre-charge \$20 to OpenAI as fallback. |
| Dataset download fails (Yelp gate)                | Low             | High       | Use HuggingFace Datasets mirror (e.g., shaowenchen/yelp-reviews). Have a backup mirror ready.                                      |
| pgvector index too slow                           | Medium          | Medium     | Drop HNSW dimensions to 256 via PCA; or shard by domain. Test on Day 3.                                                            |
| Human eval annotators drop out                    | Medium          | Medium     | Pre-arrange 4 friends, only need 2 plus Joseph. Pay each in airtime.                                                               |
| Live demo on June 10 crashes                      | Low             | High       | Pre-recorded 3-minute video as fallback; pre-cached Redis demo queries; USB key with docker stack.                                 |
| Render free tier rate-limited mid-demo            | Low             | High       | Pay for Render Starter (\$7) from Day 1; do not rely on free.                                                                      |
| Faithfulness audit too slow (DeBERTa-MNLI on CPU) | Medium          | Medium     | Batch audits; run async on the Redis queue; only audit final reviews not regen attempts.                                           |
| Solution paper rushed Day 13                      | High            | High       | Daily 30-minute paper slot, end of day, no exceptions. By Day 7 the abstract and intro are draft-complete.                         |
| Em dash slips into a generated review             | Medium          | Low        | Post-generation regex check; reject and regenerate.                                                                                |
| Nigerian voice judged stereotypical               | Medium          | High       | Pre-test 50 reviews with 2 Nigerian friends before Day 11; iterate the persona prompts based on feedback.                          |

**Part 19: Glossary**

|                      |                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------|
| **Term**             | **Meaning**                                                                                           |
| Twin-Loop            | The architectural pattern of two agents (User Simulator, Recommender) sharing one persona memory      |
| Persona memory       | The shared natural-language model of a user, with three memory types (episodic, semantic, procedural) |
| A-LLMRec             | Frozen-CF embedding aligned into a frozen LLM; the retriever backbone                                 |
| BLaIR                | Bridging Language and Items for Retrieval; the Amazon Reviews 2023 pretrained item embedding          |
| PEBOL                | Preference Elicitation by Bayesian Optimization with LLM acquisition; the cold-start mechanism        |
| Reason4Rec           | Deliberative three-stage ranking prompt (distillation, matching, prediction)                          |
| Reflection loop      | Async after-action review that updates persona and item memory based on observed outcomes             |
| Faithfulness audit   | NLI-based check that every generated sentence is entailed by user history                             |
| Register slider      | UI control letting the user select one of the five Nigerian voice registers                           |
| Nigerian-fit score   | A composite score over power robustness, local warranty, delivery SLA, halal match                    |
| Counterfactual probe | Removes one item from history, re-runs the recommender, surfaces the diff                             |
| Krippendorff alpha   | Inter-annotator agreement metric for the human eval; target above 0.6                                 |

**Part 20: Key References**

Every paper below has been read or is on the Day 1 reading list. The repo\'s paper/references.bib mirrors this list.

- Zhang et al. AgentCF: Collaborative Learning with Autonomous Language Agents for Recommender Systems. WWW 2024. arxiv 2310.09233

- Zhang et al. On Generative Agents in Recommendation (Agent4Rec). SIGIR 2024. arxiv 2310.10108

- Wang et al. User Behavior Simulation with LLM-based Agents (RecAgent). TOIS 2025. arxiv 2306.02552

- Sun et al. Review-LLM: Harnessing LLMs for Personalized Review Generation. arxiv 2407.07487

- Bao et al. Reason4Rec: LLMs for Recommendation with Deliberative User Preference Alignment. WSDM 2025. arxiv 2502.02061

- Huang et al. Recommender AI Agent (InteRecAgent). TOIS 2025. arxiv 2308.16505

- Wang et al. RecMind: LLM Powered Agent for Recommendation. NAACL Findings 2024. arxiv 2308.14296

- Kim et al. A-LLMRec: Bridging Items with Frozen LLM. KDD 2024. arxiv 2404.11343

- Handa et al. PEBOL: Bayesian Optimization for LLM Preference Elicitation. RecSys 2024. arxiv 2405.00981

- Lyu et al. LLMRec: Large Language Models with Graph Augmentation. WSDM 2024. arxiv 2311.00423

- Hou et al. Bridging Language and Items (BLaIR) and Amazon Reviews 2023. github.com/hyp1231/AmazonReviews2023

- Muhammad et al. NaijaSenti: A Nigerian Twitter Sentiment Corpus. arxiv 2201.08277

- Adelani et al. AfroLM and Afro-LID. Masakhane NLP works

- Ogueji et al. AfriBERTa. huggingface.co/castorini/afriberta_large

- Yong et al. Does Generative AI Speak Nigerian-Pidgin? arxiv 2404.19442

- Unuabonah, F. Borrowed Nigerian Pidgin pragmatic markers in Nigerian English. Pragmatics, 2021

- AgentSociety Challenge (WWW 2025): github.com/tsinghua-fib-lab/WebSocietySimulator

- Schifferer et al. Winning Amazon KDD Cup\'24. arxiv 2408.04658

- Anthropic. Claude Sonnet 4.6 prompt caching docs. docs.anthropic.com

- Langfuse. github.com/langfuse/langfuse

**Closing Note**

This manual is the build contract. It is intentionally exhaustive. Every section was written to answer a specific question Joseph would ask Claude Code at 2am on Day 9. The architecture is defensible; the timeline is feasible; the Nigerian voice is engineered, not asserted. The four headline metrics are pre-registered; the ablation table will show every component earning its place; the paper grows alongside the code, not after.

Three habits separate a winning solo submission from a participating one. First: open paper.md every single day before opening any code editor. Second: commit something every day, no matter how small, so the GitHub graph tells a story of consistent work. Third: run make eval at the end of every day so progress is measurable and regressions are immediate.

Bluechip Technologies wants to find people who can ship production AI for African banks and telcos. The submission needs to read like that person. Not a hackathon stunt. A small, complete, defensible system. The Twin-Loop is that system. Build it well.

*Good luck, Joseph. We move.*
