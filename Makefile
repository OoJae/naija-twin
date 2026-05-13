.PHONY: setup dev demo reproduce eval paper lint test clean

setup:
	pnpm install
	cd apps/api && uv sync
	@echo "Setup complete. Copy .env.example to .env and fill in your keys."

dev:
	cd apps/api && uv run uvicorn naija_twin.main:app --port 8000 &
	pnpm dev

demo:
	cd apps/api && uv run uvicorn naija_twin.main:app --port 8000 &
	pnpm dev

reproduce:
	@echo "TODO: Full reproduction pipeline (Day 14+)"
	exit 1

eval:
	@echo "TODO: Evaluation harness (Day 10+)"
	exit 1

paper:
	cd paper && pandoc paper.md -o paper.pdf --citeproc

lint:
	cd apps/api && uv run ruff check .
	cd apps/web && pnpm lint

test:
	cd apps/api && uv run pytest tests/ -v
	cd apps/web && pnpm test

clean:
	rm -rf apps/web/.next apps/web/node_modules apps/api/.venv apps/api/__pycache__
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
