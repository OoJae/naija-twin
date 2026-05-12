**Winning the DSN x BCT LLM Agent Challenge**

*A strategic research dossier for the May 2026 submission*

Prepared for: **Joseph Olamiye (Oluwademilade)**

Institution: **Federal University of Technology Akure (FUTA)**

Competition: **DSN x BCT LLM Agent Challenge 3.0, May to June 2026**

Target: **1st place, ₦1,500,000, Bluechip talent conversation**

*This dossier maps the brief to the WWW 2025 AgentSociety Challenge (same datasets, same evaluation harness), surveys the SOTA in LLM-based user modeling and agentic recommendation, lays out a winning Twin-Loop architecture, builds the Nigerian voice playbook, identifies the engineering rigor judges actually reward, and ranks five candidate application concepts by win probability.*

**Executive Summary**

**The single most important finding**

The DSN/BCT 2026 brief is structurally identical to the WWW 2025 AgentSociety Challenge User Modeling Track, which used the exact same Yelp + Amazon + Goodreads triad and scored on rating accuracy plus a weighted sentiment/emotion/topic-relevance score for review text. The open-source simulator at github.com/tsinghua-fib-lab/WebSocietySimulator and the final leaderboard at tsinghua-fib-lab.github.io/AgentSocietyChallenge/pages/final_leaderboards.html are effectively a cheat-sheet. Clone that repo on Day 1 and study what beat baseline by 9 to 22%. This single insight collapses weeks of uncertainty into a known evaluation harness.

**Timing reality**

Per DSN\'s own substack, the deadline appears to be May 24 with the Grand Finale on June 10, not a unified June 10 deadline. Plan the engineering sprint against May 24 (13 days from kickoff) and reserve the remaining 17 days for paper polish, ablations, human evaluation, and rehearsing the live demo.

**Headline strategic bet**

Build one unified agent (an AgentCF-style Twin-Loop where the user simulator and the recommender share the same persona memory) so improvements to Task A directly improve Task B. Use hybrid Claude Sonnet 4.6 for reasoning, Groq-hosted Llama 3.3 70B for high-volume generation, and a Nigerian-language tool (Davlan AfriBERTa sentiment) exposed as an MCP tool. Wrap in Next.js plus FastAPI sidecar, deploy on Vercel plus Render, observable through Langfuse. Total spend under \$20 with Anthropic Student Builder credits. Win the bonus rubric with a measurable 200-item Nigerian-fit eval slice that doubles as a publishable benchmark contribution.

**The four headline metrics to pre-register**

|                                    |                  |                          |
|------------------------------------|------------------|--------------------------|
| **Metric**                         | **Target**       | **Baseline to beat**     |
| NDCG@10 on unified test split      | at or above 0.45 | P5 zero-shot \~0.32      |
| RMSE on Amazon Books rating        | at or below 1.00 | GPT-4o zero-shot \~1.12  |
| Faithfulness rate (NLI entailment) | at or above 90%  | Untuned GPT-4o \~73%     |
| Nigerian-fit (200-item benchmark)  | at or above 70%  | Untuned Claude 3.5 \~45% |

**1. State of the Art: LLM-Based Review and Rating Simulation**

The field crystallized in 2024 to 2025 around three architectural patterns: persona-memory agents (Agent4Rec, RecAgent, AgentCF), fine-tuned generative review models (Review-LLM, BIGRec, TALLRec), and chain-of-thought rating predictors (Reason4Rec, EXP3RT, Rec-SAVER).

**1.1 Review-LLM is the directly relevant paper**

Review-LLM (arxiv 2407.07487, July 2024) fine-tunes Llama-3-8B with the user\'s historical (title, review, rating) triples plus an explicit rating signal that forces the model to break out of its politeness bias on negative reviews. It beats GPT-3.5-Turbo and GPT-4o on BLEU/ROUGE/BERTScore on five Amazon sub-datasets, especially on the \'hard\' negative-review test set where frontier models collapse. Review-LLM\'s recipe (filter users with 10 to 30 interactions, last review as target, persona summary plus history plus target item in the prompt) is the single highest-signal template to copy.

**1.2 Reason4Rec and prompted alternatives for rating prediction**

For rating prediction, Reason4Rec (WSDM 2025, arxiv 2502.02061) is current SOTA on Amazon Music and Amazon Book. It decomposes the task into preference distillation, matching, and prediction, with GPT-3.5-Turbo as teacher distilled into Llama-3-8B via QLoRA on Unsloth. Average MAE reduction is roughly 0.02 versus prior SOTA, which is small but defensible.

A simpler and arguably more impressive recent finding: arxiv 2510.00449 (October 2025) shows OpenAI o3 with per-item user reviews in context delivers a 13.0% relative RMSE reduction with zero training. The implication is that a strong prompted approach is competitive if retrieval is sharp.

**1.3 Persona memory architectures**

Three foundational papers define how user state is stored and retrieved.

- Agent4Rec (SIGIR 2024, arxiv 2310.10108) introduced the canonical three-module split: Profile, Memory, Action. Memory has factual plus emotional components and supports reflection.

- RecAgent (TOIS 2025, arxiv 2306.02552) added the cognitive-psychology-inspired sensory/short-term/long-term hierarchy. This is the most copied design in subsequent work.

- AgentCF (WWW 2024, arxiv 2310.09233) is the key paper for a unified Task A + Task B system because it models both users AND items as agents that mutually update memories through collaborative reflection. The natural-language item summaries replace dense embeddings, which is exactly the kind of explainability judges reward.

**1.4 Competitive numbers to target**

On Yelp, Amazon, and Goodreads, the realistic targets are: ROUGE-1 F in the 18 to 25% range, ROUGE-L F in 14 to 20%, BERTScore F1 around 0.85 to 0.88 for fine-tuned Llama-8B systems versus 0.83 to 0.86 for GPT-4o zero-shot. Yelp RMSE typically 1.0 to 1.2; Amazon Books 0.8 to 1.0; MovieLens-1M 0.85 to 0.92. Review writing is open-ended, so competitive systems differentiate on 1 to 3 ROUGE points or 0.02 to 0.05 RMSE.

The AgentSociety final-phase winners hit 9 to 22% improvement over baseline on the composite metric (0.25 \* emotion + 0.25 \* sentiment + 0.5 \* topic_relevance), which weights semantic similarity over n-gram overlap. The actionable conclusion: optimize toward BERTScore and Sentence-BERT cosine, not just ROUGE.

**1.5 The verdict for a solo developer in five weeks**

QLoRA fine-tune Llama-3.1-8B or Qwen2.5-7B with Unsloth on Review-LLM\'s recipe, augmented with retrieval-augmented prompting using BLaIR embeddings (McAuley-Lab/BLaIR-base, specifically pretrained on Amazon Reviews 2023) for the top-5 most similar historical items per query. Pipeline-decode rating first, then condition the review on the predicted rating using the CIER pattern (arxiv 2504.05315, AAAI 2025), which eliminates the well-documented rating/sentiment incoherence in PETER and NRT. Use Claude as the teacher for distilling chain-of-thought reasoning traces (Reason4Rec pattern) over 5 to 10k samples per domain.

**2. State of the Art: Agentic Recommendation Systems**

**2.1 InteRecAgent: the dominant architecture**

For Task B, the dominant architecture is InteRecAgent (TOIS 2025, arxiv 2308.16505, Microsoft RecAI repo). It positions the LLM as a \'brain\' calling three tool buckets: information query (SQL on item table), retrieval (candidate generation), and ranking (a frozen CF model like SASRec). It adds a memory bus (intermediate results live outside the prompt to avoid token bloat on large candidate lists), dynamic demonstration-augmented planning (few-shot examples retrieved per query), and reflection. This three-tool taxonomy is the cleanest, most paper-friendly mental model and is directly implementable from the open-source repo.

**2.2 RecMind: Self-Inspiring planning**

RecMind (NAACL Findings 2024, arxiv 2308.14296) introduced Self-Inspiring planning, where the LLM retains all explored thought paths rather than discarding branches like CoT/ToT. It matches fully-trained P5 zero-shot on rating, sequential rec, direct rec, explanation, and review summarization on Amazon Beauty and Yelp. This is the single most demo-worthy reasoning pattern because the retained thought paths are legible to judges in a Langfuse trace.

**2.3 A-LLMRec and CoLLM: collaborative filtering meets LLMs**

The current best practical balance of collaborative filtering and LLMs is A-LLMRec (KDD 2024, arxiv 2404.11343): aligns a frozen SASRec embedding into a frozen LLM via a small alignment network, excelling across cold/warm/few-shot/cold-user/cross-domain settings. Combined with CoLLM (TKDE 2025, arxiv 2310.19488), which treats collaborative embeddings as a separate \'modality\' injected into the LLM prompt, you get a system that beats TALLRec in warm scenarios while keeping its cold advantage.

**2.4 The cold-start gap (25 points worth)**

For cold-start specifically (worth 25 points in Task B), the most under-used pattern is PEBOL (RecSys 2024, arxiv 2405.00981): Bayesian Optimization wrapped around an LLM acquisition function for natural-language preference elicitation, reporting up to 131% improvement over GPT-3.5 monolithic preference elicitation. It is decision-theoretic, explainable, and almost no hackathon team will implement it.

Pair PEBOL onboarding with ColdLLM (KDD 2024, arxiv 2402.09176), which uses an LLM simulator to generate plausible cold-item interactions and then scales a coupled filter to find the right user pool.

**2.5 Cross-domain transfer**

For cross-domain, the highest-leverage move is to store the user profile only in natural language rather than domain-specific embeddings (TALLRec/Chat-REC pattern), which gives instant transfer across Yelp/Amazon/Goodreads. Pair with LLMRec\'s (WSDM 2024, arxiv 2311.00423) strategy of LLM-generated item attribute features feeding a GNN backbone, which boosts cold-item recommendation specifically.

**2.6 AgentRecBench: the current benchmark to target**

AgentRecBench (NeurIPS 2025 D&B Spotlight, arxiv 2505.19623) unifies Yelp, Goodreads, and Amazon into a User-Review-Item graph with three scenarios (classic, evolving-interest, cold-start) and HR@{1,3,5} metrics. On Amazon cold-start, reported numbers on DeepSeek-V3: BaseAgent 16.3 HR@1-5, CoTAgent 19.3, RecHackers (the top team) 59.7, Agent4Rec 45.6. On Yelp, all agentic baselines struggle below 5%, which signals a real research gap. Even modest Yelp cold-start gains are publishable.

**2.7 GLoSS: a surprisingly reachable SOTA**

GLoSS (arxiv 2506.01910) is a 4-bit LoRA Llama-3 plus semantic dense retrieval system that reports Recall@5 improvements of +33.3% on Beauty, +52.8% on Toys, +15.2% on Sports versus ID-based SASRec/BERT4Rec, beating P5, GPT4Rec, LlamaRec, and E4SRec.

**3. The Unified Architecture (Twin-Loop)**

**3.1 The core design**

The cleanest design that addresses both tasks in one codebase is what this dossier calls the Twin-Loop architecture, adapted from AgentCF. Every user has a persistent natural-language profile (memory) in a vector DB. Every item has a memory of which user-profile-types liked it. Two agents share that state.

1.  The Recommender Agent runs a ReAct loop calling user-memory, item-memory, a SASRec/A-LLMRec retriever, and a ranker.

2.  The User Simulator Agent uses the SAME user-memory module to predict reviews and ratings for unseen items.

A reflection step writes new evidence back to memories after each turn. Because both agents share the user model, every improvement in the simulator (Task A\'s review fidelity, rating accuracy) directly improves the recommender (Task B\'s NDCG, cold-start). This is the single most important architectural decision in the dossier. It collapses what looks like two separate tasks into one optimization problem and gives the paper a unified narrative judges can grasp in 30 seconds.

**3.2 The full stack**

Layer on top of the Twin-Loop core:

- An InteRecAgent-style three-tool brain (SQL query, retrieval, ranking) using RecMind Self-Inspiring planning so all explored thought paths surface in the Langfuse trace.

- A PEBOL onboarding agent handles cold-start users via Bayesian preference elicitation.

- ColdLLM-style synthetic histories handle cold items.

- Cross-domain transfer is free because the user profile lives in natural language.

**3.3 Repos to start from**

Minimal combination to bootstrap:

- microsoft/RecAI (InteRecAgent)

- ghdtjr/A-LLMRec (frozen CF plus LLM alignment)

- wzf2000/MACRec (multi-agent scaffold for user/item agent roles)

- tsinghua-fib-lab/WebSocietySimulator (the evaluation harness aligned to the DSN brief)

- SAI990323/TALLRec (the LoRA recipe for the 7B base model)

**4. Nigerian Contextualization: The Unfair Advantage**

**4.1 The judging lever**

The rubric explicitly rewards \'behave and sound like Nigerians,\' which is the single largest differentiation lever for a Nigerian competitor. Authentic Nigerian voice is not one register; it is a continuum from Standard Nigerian English (used by bankers, news anchors, formal Jumia reviews) through code-switched social-media English with discourse-marker borrowing, through Nigerian Pidgin/Naija (PCM) used by youth and traders, into heavy code-switching with Yoruba, Igbo, or Hausa lexical insertions.

**4.2 Critical pitfall**

GPT-4o, Llama-3, and Claude all default to BBC West African Pidgin English (WAPE) rather than authentic Nigerian Naija/PCM, and tend to caricature with \'omo!\' or \'abeg\' on every sentence. Real Nigerian pragmatic markers cluster rather than blanket (per Unuabonah\'s corpus work in benjamins.com/catalog/prag.19038.unu). The paper \'Does Generative AI Speak Nigerian-Pidgin?\' (arxiv 2404.19442) explicitly documents this failure with the Warri dataset; pre-test all outputs against it.

**4.3 The Nigerian English lexicon**

Terms to ship in the system, with usage context for reviews:

|                                 |                                         |                                   |
|---------------------------------|-----------------------------------------|-----------------------------------|
| **Term**                        | **Meaning**                             | **Review context**                |
| wahala / no wahala              | Trouble / no trouble                    | Battery dey carry me, no wahala   |
| sapa                            | Financial hardship                      | This product save me from sapa    |
| japa                            | Flee abroad                             | Diaspora context                  |
| tear-rubber                     | Brand new, fresh from packaging         | Phone came tear-rubber, sealed    |
| tokunbo                         | Imported second-hand                    | Tokunbo iron, still strong        |
| e choke                         | Overwhelming, can be praise or critique | The sound, e choke!               |
| e pain me                       | Disappointment                          | ₦15k for this nonsense, e pain me |
| original / fake / package       | Genuine / counterfeit / deceptive       | Dominant axis in product reviews  |
| las las                         | Eventually (resigned acceptance)        | Las las, e still work             |
| no gree for anybody             | Stand your ground (2024 slang)          | Aggrieved tone                    |
| we move                         | We keep going                           | Resilient close                   |
| nawa o / yawa                   | Dismay / mess                           | Nawa o, three weeks for delivery  |
| jara                            | Bonus                                   | Vendor add jara, I appreciate     |
| abeg / sef / sha / o / na / ehn | Discourse markers                       | Cluster, do not blanket           |

**4.4 Grammar patterns beyond lexicon**

Aspect-rich verb chains (I don dey use am = present perfect continuous), reduplication for intensity (kia kia, small small, now now), sentence-final emphasis o, topic-prominent constructions (This phone, e get problem), plural pronoun una, 3SG inanimate e, religious interjections (Thank God, Alhamdulillah).

**4.5 Nigerian consumer behavior anchors**

Every review must reflect a subset of these realities:

- Counterfeit anxiety: originality is the highest praise

- Power-grid robustness: NEPA voltage spikes, generator-power survival, 8 to 10 outages per week per industry research

- Delivery reliability dominates ratings

- Family/community influence on purchase decisions (\'my pastor told me\', \'my sister suggested\', \'saw Davido use it\')

- Religious framing across both Christian and Muslim registers

- Festival-driven shopping cycles (Detty December alone drove 1.2M+ visitors to Lagos and \$71.6M in tourism revenue in 2024)

- Diaspora persona is its own register with nostalgic SNE plus Pidgin markers (\'E remind me of home\')

**4.6 Five Nigerian NLP assets to ship in-system**

|                                                |                                                               |                                                           |
|------------------------------------------------|---------------------------------------------------------------|-----------------------------------------------------------|
| **Asset**                                      | **URL**                                                       | **Use**                                                   |
| NaijaSenti corpus                              | huggingface.co/datasets/HausaNLP/NaijaSenti-Twitter           | Sentiment training signal, code-mixed                     |
| Davlan naija-twitter-sentiment-afriberta-large | huggingface.co/Davlan/naija-twitter-sentiment-afriberta-large | Post-generation sentiment/language ID, expose as MCP tool |
| AfriBERTa-large                                | huggingface.co/castorini/afriberta_large                      | Base encoder for retrieval, fine-tune target              |
| InkubaLM-0.4B                                  | huggingface.co/lelapa/InkubaLM-0.4B                           | Tiny Nigerian-aware LLM that runs on Colab T4             |
| Awarri N-ATLaS                                 | huggingface.co/NCAIR1/N-ATLaS                                 | Llama-3 fine-tuned on Yoruba/Hausa/Igbo/Nigerian English  |

**4.7 Contextualization strategies that judges will reward**

The single most powerful move is a register-conditioned system prompt with an explicit slider (register in {formal_sne, sne_with_markers, code_switch_youth, pidgin_heavy, diaspora}) exposed in the UI so judges see it as a feature. Pair with five named personas (Lagos banker, Kano civil servant, Onitsha trader, FUTA undergrad code-switcher, Houston-based diaspora nurse), each with religion, age, region, and language anchors, plus 10 hand-written gold example reviews each (60 total) seeding a RAG index.

Add a post-generation validation loop using the Davlan AfriBERTa sentiment classifier to reject generations that drift to neutral American English or whose Pidgin density does not match the requested register.

The crowning differentiator is a Nigerian-factor recommendation explanation layer: every recommendation surfaces reasons like \'handles voltage spikes from generators,\' \'12-month local warranty in Lagos,\' \'Halal-certified,\' \'rated 4.6 by 312 Lagos buyers,\' \'Detty December delivery SLA met.\' Features include power_stability_robustness, local_warranty_in_NG, delivery_to_lagos_under_48h, halal_certification, nollywood_BBN_endorsement_signal. This one feature, well-implemented, likely locks the bonus rubric mark.

**4.8 Pitfalls to avoid**

- Stereotype caricature (one marker per 2 to 3 sentences max in casual register, near-zero in formal)

- Treating Pidgin as broken English (it has its own grammar with dey/don/go aspect markers)

- Monolithic Lagos-Yoruba default (about 52% of Nigerians are Muslim, many northern Hausa-speaking)

- 419/Yahoo Boy tropes (especially counterproductive given Bluechip\'s bank clients)

- Religious mismatch across personas

- Tribal flattening (kia kia is Yoruba, kwenu is Igbo, walahi is Hausa/Arabic)

**5. What Wins LLM Agent Hackathons**

**5.1 The dominant solution paper template**

Synthesizing the Schifferer et al. \'Winning Amazon KDD Cup 24\' paper (arxiv 2408.04658), RecSys Challenge 2024 winners, and NeurIPS/AAAI reproducibility checklists, the dominant template for a winning solution paper is a NeurIPS workshop plus competition report hybrid, eight pages with this rhythm: competition overview, page 2 pipeline diagram, data construction (the real moat), modeling tricks, inference engineering, ablation table per technique with delta on metric, failure analyses, reproducibility note.

**5.2 The abstract/intro hook formula**

Four sentences. Sentence 1 states the gap. Sentence 2 gives contributions in numbers (\'+18% NDCG@10 over P5, hallucination rate cut from 31% to 7%\'). Sentence 3 is a one-line method gloss. Sentence 4 links code. Bait, contribution, method, proof, in four sentences.

**5.3 Top differentiation ideas ranked by impact times feasibility**

For a five-week solo build:

|                                                                   |                                     |          |
|-------------------------------------------------------------------|-------------------------------------|----------|
| **Idea**                                                          | **Why it wins**                     | **Time** |
| Faithfulness audit on every review (DeBERTa-v3-MNLI)              | Headline number nobody else has     | 2 days   |
| Self-consistency voting for ratings (5 samples, median)           | Big RMSE win, trivial cost          | 1 day    |
| Persona memory triad (episodic, semantic, procedural)             | Strong paper narrative              | 4 days   |
| Nigerian-fit benchmark of 200 hand-curated items                  | Publishable evaluation contribution | 3 days   |
| Cold-start concept bank with evidence-cited explanations          | Cross-domain transfer story         | 4 days   |
| Calibration analysis (reliability diagram, ECE)                   | Most teams stop at RMSE             | 1 day    |
| Counterfactual user simulator with demo button                    | Genuinely novel framing             | 3 days   |
| Active clarification loop on high-entropy predictions             | Demo wow factor                     | 2 days   |
| Hybrid local + API inference with p50/p95 reported                | Production maturity signal          | 2 days   |
| Multi-objective re-ranking (relevance + diversity + Nigerian-fit) | Differentiator with ablation        | 2 days   |

**5.4 Failure modes ranked by frequency**

- Demo breaks live (record a 3-minute video as fallback)

- Cold-start ignored despite being 25 points

- No baselines (ItemKNN, BM25, popularity, P5 are mandatory)

- Cherry-picked qualitative examples without quantitative anchors

- Closed-source or key-gated repo judges cannot run

- Single-seed numbers with no variance

- Vibes paper with adjectives and no tables

- Hallucinated citations (always verify every arxiv ID resolves)

- Over-engineered architecture with no ablation isolating each component

- Generic Nigerian contextualization that is just a Pidgin greeting

**5.5 The reproducibility checklist judges actually test**

One-command boot (docker compose up && make reproduce), uv.lock or requirements.lock pinning, seeds fixed for random/numpy/torch/transformers, versioned HuggingFace datasets and models with cards, pre-built artifacts in a release tarball with checksums, hardware and runtime declared (\'RTX 4090, 24GB, 47 min full train; CPU inference 3.2s p50\'), evaluate.py that runs all metrics from a single predictions CSV, public Langfuse demo project link, a 60-second quickstart.sh for impatient judges, GitHub Actions CI running a 10-user smoke eval. The absence of any of these gets papers desk-rejected.

**5.6 Human evaluation design**

Synthesizing G-Eval (arxiv 2303.16634), MT-Bench, and Prometheus: 50 held-out users, 3 generated reviews each = 150 items per system, 3 systems compared (yours, P5/TALLRec, GPT-4o zero-shot), 3 annotators. Run both pointwise Likert (faithfulness to history, stylistic fidelity, coherence, informativeness) and pairwise A/B. Report Krippendorff\'s alpha for Likert (target above 0.6) and Cohen\'s kappa for pairwise (target above 0.4). Use G-Eval with GPT-4 as judge as scalable fallback, anchored against a 30-human subset to compute Spearman rho correlation.

**5.7 Demonstrating agentic reasoning convincingly**

Set up Langfuse self-hosted on Day 2, with every tool call, LLM call, and retrieval captured with cost, latency, and parent-child structure. Export a public read-only demo project URL in the README. During the live demo, pause on a recommendation, expand the trace, narrate the agent\'s six-step flow. Add a counterfactual probe button that re-runs the agent with one history item removed and shows recommendation drift. This sells the agentic framing in 10 seconds.

**6. Implementation Stack for a Solo Nigerian Developer**

**6.1 The hybrid model layer**

Joseph\'s existing setup is already roughly 80% optimal. The wins are surgical additions, not rewrites.

- Claude Sonnet 4.6 (\$3/\$15 per MTok, 1M context, 90% off via prompt caching) for the reasoning loop

- Llama 3.3 70B on Groq (\$0.59/\$0.79 per MTok at 334 tokens/sec, free tier \~216M tokens/month) for high-volume persona/review generation

- Davlan AfriBERTa Naija-sentiment classifier as the Nigerian-NLU MCP tool

- Claude Opus 4.7 reserved for LLM-as-judge offline eval

The hybrid is critical because an agent re-sends the same tool schema every step, so caching shaves the dominant cost. Frontier-only burns budget fast; open-source-only loses on reasoning depth.

**6.2 Embedding and storage**

OpenAI text-embedding-3-small (\$0.02 per MTok) as default, swap to Cohere embed-v4 (\$0.10 to 0.12) if multilingual code-mixed retrieval underperforms on Nigerian text. Postgres + pgvector on Neon free tier for the vector DB (Joseph already uses Postgres; HNSW matches Qdrant up to 10M vectors; one DB to manage). Upstash Redis for semantic LLM-response cache and rate limiting.

**6.3 Backend pattern**

Hybrid Next.js + FastAPI sidecar in one Docker Compose. Next.js handles the streaming chat UI via Vercel AI SDK 6\'s ToolLoopAgent and MCP tool support. FastAPI sidecar handles batch jobs (review generation fan-out, embedding ingestion, nightly Langfuse eval cron), the MCP server, and the AfriBERTa classifier endpoint. This satisfies the \'containerized\' rubric without ditching Next.js. Multi-stage Python 3.12 slim base, uv sync with frozen no-dev, non-root user, HEALTHCHECK on /healthz.

**6.4 Hosting**

Vercel Hobby (free) for the Next.js front; Render Starter at \$7/mo for the FastAPI container (warm container, no cold-starts during judging week); HuggingFace Spaces Docker SDK as a backup public demo. Custom domain plus SSL on both for about \$10/year.

**6.5 Five-week budget reality**

Realistic spend across the five-week run, assuming aggressive prompt caching and Groq free tier for development:

- Claude Sonnet 4.6 reasoning loop with prompt caching: about \$9

- Groq Llama 3.3 70B batch generation: about \$15

- Embeddings: about \$0.20

- Render: \$7 for one month

- HuggingFace Spaces PRO optional: \$9

- Domain: \$10

- Total: about \$50, worst case \$120

Apply for the Anthropic Claude Student Builder Program in week one (about \$50 in API credits with .edu/.edu.ng approval, 5 to 7 day turnaround); OpenAI new account \$5; AWS Activate via Nigerian incubator letter \$1K to \$5K. Net out-of-pocket can be under \$20.

**6.6 Orchestration**

Keep Vercel AI SDK 6 (ToolLoopAgent with stepCountIs(20), native MCP, experimental_telemetry piping to Langfuse). Do not add LangGraph or DSPy mid-hackathon; the framework swap cost is not justified.

**6.7 MCP tools to expose**

- search_users(filters)

- get_user_history(user_id)

- rank_items(user_id, candidate_ids)

- generate_persona_review(item, style, register)

- classify_nigerian_sentiment(text)

- cold_start_elicit_preferences(user_id)

- counterfactual_probe(user_id, removed_item)

Each tool surfaces in Langfuse traces as a distinct span, which is exactly the \'agentic reasoning\' evidence judges look for.

**7. Competitive Intelligence: DSN, Bluechip, and the Nigerian AI Scene**

**7.1 Bluechip Technologies**

Bluechip Technologies is a Nigerian-Irish data-platform firm founded 2008 by Olumide Soyombo and Kazeem Tewogbade, specializing in data warehousing, BI, eKYC, customer personalization, and AI for banks and telcos. Stated clients: MTN, 9mobile, FirstBank, GTBank, Access Bank, Lafarge. Owned IP includes BluePrime (real-time profitability and conversion analytics for FIs), Cash Complete (vault/ATM forecasting), Cribro (data profiling, MDM), and BluBridge (FIRS e-invoicing). They run the annual Bluechip Data & AI Summit and operate across Nigeria, Kenya, Ghana, DRC, Zambia, with an Ireland office.

Their commercial DNA is bank and telco customer intelligence. A submission pitched as \'a customer-intelligence agent for Nigerian retail banking or telco subscribers\' with synthetic Nigerian-named users, naira amounts, MTN/GTBank-flavored transactions, and Pidgin-aware SMS sentiment analysis will land harder than a generic Yelp clone. Naija-Twin is positioned for exactly this.

**7.2 Data Science Nigeria**

DSN was founded in 2016 by Dr. Olubayo Adekanmbi (ex-MTN CTO, founder of Equalyz AI, Gates Foundation Grand Challenge winner for financial-inclusion LLMs). DSN\'s mission is \'raise one million AI talents in 10 years.\' Adekanmbi\'s public priorities are financial inclusion via LLMs, Nigerian languages, agentic AI, geospatial intelligence, responsible AI, and Africa-first data sovereignty (his commercial spinoff Equalyz AI ships OffGPT for on-premise sovereign deployment).

The 8th DSN Bootcamp in November 2025 crowned FUTA as AI School of the Year, which is Joseph\'s school. Mentioning the FUTA-DSN community affiliation in the paper costs nothing and provides free in-group credibility.

**7.3 Past DSN hackathon winning patterns**

Zindi archives plus the 2020 Kowope first-place by Aifenaike Alexander at github.com/aifenaike/DSN_KOWOPE show DSN judges reward feature-engineering depth, clear evaluation rigor, simplicity, and well-documented GitHub repos. For the LLM-agent format the equivalents are: clean tool use, evaluations on a held-out set, an ablation table, polished demo URL.

**7.4 Nigerian AI ecosystem names to cite for legitimacy**

Olubayo Adekanmbi (DSN/Equalyz), David Adelani (Masakhane, MasakhaNER, NaijaSenti), Shamsuddeen Hassan Muhammad (HausaNLP, NaijaSenti lead), Kelechi Ogueji (AfriBERTa), Bonaventure Dossou (AfroLM), Silas Adekunle and Eniola Edun (Awarri founders), Ife Adebara (AfroLID, Serengeti), Tejumade Afonja (AI Saturdays Lagos), Bosun Tijani (Minister of Communications spearheading N-ATLaS). Anchoring the project in this lineage signals ecosystem awareness; judges from DSN will notice.

**8. Five Candidate Concepts Ranked by Win Probability**

Each is buildable in five weeks by a solo developer using the recommended stack. Scored on rubric alignment (Tasks A + B), Nigerian-context bonus capture, novelty, and demo-ability for the live finale.

**Concept 1: Naija-Twin (RANKED \#1, CHOSEN)**

A unified customer-intelligence agent for Bluechip-style fintech personalization. Twin-Loop architecture with one shared persona memory feeding both a review/rating simulator (Task A) and an InteRecAgent-style recommender (Task B). Synthetic dataset of 10K Nigerian-named users with MTN/GTBank-flavored transactions, naira amounts, Yoruba/Hausa/Igbo SMS feedback. Register-conditioned generation across five personas. AfriBERTa as MCP tool.

\[object Object\]Best Bluechip narrative alignment, unifies both tasks under one defensible architecture, absorbs Concept 5\'s faithfulness audit and Concept 3\'s value-for-money features as paper subsections, and gives the live demo the strongest single hook (the Twin-Loop visualization in Langfuse).

**Concept 2: Jollof (RANKED \#3)**

A multi-domain recommender for Nigerian lifestyle (food, Nollywood, books, Afrobeats). Pure cross-domain play. Train on Amazon Books + Goodreads + a scraped Jumia/Chowdeck/Letterboxd-Nigeria corpus. Use natural-language profiles for free cross-domain transfer. PEBOL onboarding for cold users. Register slider in the UI.

\[object Object\]Best Nigerian-context immersion, weakest Bluechip fit.

**Concept 3: Sapa Sage (RANKED \#2)**

A value-for-money aware recommender for constrained budgets. Multi-objective optimization where the agent balances relevance, durability (NEPA-robustness score), local warranty availability, delivery SLA, and price-per-utility. Inflation-aware (Nigeria hit 34.8% in Dec 2024). Generates reviews with explicit budget framing (\'for ₦15k, you cannot beat this\').

\[object Object\]Strong novelty plus emotional resonance, moderate Bluechip fit.

**Concept 4: Aunty Recommender (RANKED \#5)**

A family-aware multi-stakeholder recommender. Models extended-family purchase consultation patterns. Uses multi-agent (MACRec template) where Manager, User, Family Influencer, and Reflector agents collaborate. Captures religious considerations, recommender-trust signals (Big Brother Naija, Davido endorsements), and pastor/imam recommendation patterns.

\[object Object\]High novelty, hardest to engineer in five weeks, multi-agent ablations are brutal.

**Concept 5: Counterfactual Voice (RANKED \#4)**

Doubles down on Task A. Every generated review carries an NLI-checked faithfulness score and a counterfactual probe (\'what if the user had bought X first?\'). Self-consistency rating with calibration diagram. Nigerian-fit benchmark of 200 items as separate eval.

\[object Object\]Strongest paper contribution on Task A, weakest Task B story.

**Win probability ranking**

Concept 1 \> Concept 3 \> Concept 2 \> Concept 5 \> Concept 4.

**9. Conclusion: The Winning Shape of the Submission**

Joseph\'s edge is not depth of compute or team size; it is architectural coherence plus authentic Nigerian context plus engineering rigor, in that order.

- The Twin-Loop unifies the two tasks into one optimization problem.

- The Nigerian-fit eval slice and AfriBERTa-in-the-loop turn the bonus rubric into a measurable contribution rather than vibes.

- The Langfuse trace, calibration diagram, faithfulness audit, and one-command Docker reproduction signal a maturity level few solo competitors will match.

- The paper structure mirrors the KDD Cup winner template, with proper baselines (ItemKNN, BM25, P5, TALLRec, GPT-4o zero-shot), ablations dropping one component at a time, and a real human-eval with Krippendorff\'s alpha reported.

The strategic risk is over-engineering. Multi-agent theater (Concept 4 territory) without ablations isolating each agent\'s contribution loses points rather than gains them. The discipline is to pre-register four headline metrics on Day 3 (NDCG@10, RMSE, faithfulness rate, Nigerian-slice accuracy) and optimize only those. Lock the paper outline by Day 7; fill it as experiments land. The paper grows alongside the code, not after.

The final and most important insight: the AgentSociety Challenge final leaderboard is a public document showing exactly which tricks moved the composite metric by 9 to 22% on the same evaluation Joseph faces. The first eight hours of this project should be spent reading those winning writeups, cloning WebSocietySimulator, and mapping the existing leaderboard into Joseph\'s chosen architecture. Everything in this dossier is downstream of that single act.

*Next deliverable: Naija-Twin Complete Build Manual (separate document).*
