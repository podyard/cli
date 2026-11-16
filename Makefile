# Podyard CLI — developer entry points.
# Run `make help` for a quick tour.

.PHONY: help install build typecheck test test:watch dev lint format lint:commit check clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_.-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (pnpm)
	pnpm install

build: ## Build with tsup
	pnpm run build

typecheck: ## Run TypeScript type checker (no emit)
	pnpm run typecheck

test: ## Run tests once
	pnpm run test

test:watch: ## Run tests in watch mode
	pnpm run test:watch

dev: ## Build in watch mode
	pnpm run dev

lint: ## Run biome check (Ultracite preset)
	pnpm run lint

format: ## Auto-fix with biome (Ultracite preset)
	pnpm run format

lint:commit: ## Validate last commit message against Conventional Commits
	pnpm run lint:commit

check: typecheck lint test ## Full local CI: typecheck + lint + test
	@echo "check: OK"

clean: ## Remove build artifacts and caches
	pnpm run clean
