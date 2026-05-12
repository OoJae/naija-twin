---
title: "Naija-Twin: A Unified Agentic System for Nigerian Contextualized User Modeling and Recommendation"
authors:
  - name: Joseph Olamiye
    affiliation: "DSN x BCT LLM Agent Challenge 3.0"
date: 2026-05-12
bibliography: references.bib
---

## Abstract

<!-- Four sentences: (1) Problem statement, (2) Our approach, (3) Key results, (4) Significance. -->
<!-- Example: "Personalized recommendation in low-resource markets like Nigeria faces cold-start, cross-domain, and cultural fit challenges. We present Naija-Twin, a unified agentic system that uses a shared persona memory to drive both user simulation and recommendation tasks. Evaluated on a 200-item Nigerian benchmark, Naija-Twin achieves +X.XX NDCG@10 over zero-shot baselines while maintaining faithfulness above Y.YY. Our results demonstrate that persona-grounded agents can bridge the gap between global LLMs and local market needs." -->

## 1. Introduction

<!-- - Motivation: why Nigerian e-commerce needs better personalization -->
<!-- - Problem: cold-start, cross-domain, cultural fit, register mismatch -->
<!-- - Contribution 1: Twin-Loop architecture (shared persona memory) -->
<!-- - Contribution 2: Nigerian contextualization (register classification, cultural scoring) -->
<!-- - Contribution 3: Naija Slice benchmark (200 hand-curated items) -->
<!-- - Contribution 4: Faithfulness-aware generation with reflection loop -->

## 2. Related Work

<!-- - AgentCF (WWW 2024): collaborative filtering with LLM agents -->
<!-- - Reason4Rec: deliberative reasoning for recommendations -->
<!-- - InteRecAgent: three-tool brain for interactive recommendation -->
<!-- - PEBOL: persona-elicitation for cold-start -->
<!-- - Nigerian NLP: AfriBERTa, Naija Twitter sentiment -->
<!-- - Gap: no prior work combines all of these for Nigerian market -->

## 3. The Twin-Loop Architecture

<!-- - 3.1 Persona Memory Layer (semantic + episodic) -->
<!-- - 3.2 User Simulator Agent (Task A: reviews + ratings) -->
<!-- - 3.3 Recommender Agent (Task B: cold-start, cross-domain, multi-turn) -->
<!-- - 3.4 Reflection Loop (async critique, faithfulness checking) -->
<!-- - 3.5 MCP Tool Interface (Vercel AI SDK integration) -->

## 4. Nigerian Contextualization

<!-- - 4.1 Register Classification (formal, pidgin, street, tech, market) -->
<!-- - 4.2 Cultural Fit Scoring -->
<!-- - 4.3 Naija Slice Benchmark (200 items, 4 categories, Naira pricing) -->
<!-- - 4.4 Nigerian Example Seeds (Adekunle, Halima, Chukwuma, Ifeoma, Tunde) -->

## 5. Experiments

<!-- - 5.1 Setup: datasets, baselines, metrics (NDCG@K, Hit@K, faithfulness) -->
<!-- - 5.2 Task A Results: user simulation quality -->
<!-- - 5.3 Task B Results: recommendation quality -->
<!-- - 5.4 Cold-Start Analysis: PEBOL vs zero-shot -->
<!-- - 5.5 Ablations: memory contribution, register effect, reflection impact -->
<!-- - 5.6 Calibration: reliability diagrams, ECE -->

## 6. Discussion

<!-- - Why shared memory lifts both tasks -->
<!-- - Register mismatch: when the model speaks wrong Nigerian English -->
<!-- - Failure modes: items with no cultural signal, users with sparse history -->
<!-- - Cost analysis: prompt caching savings, Groq throughput -->

## 7. Conclusion

<!-- - Summary of contributions -->
<!-- - Limitations: 200-item benchmark, single-market focus -->
<!-- - Future work: multi-market expansion, real-time learning, human eval -->

## References

<!-- Populated from references.bib -->
