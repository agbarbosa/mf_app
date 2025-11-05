.PHONY: help build up down logs restart clean dev dev-down prod-build prod-up migrate db-reset

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
build: ## Build production Docker images
	docker-compose build

up: ## Start production environment
	docker-compose up -d

down: ## Stop production environment
	docker-compose down

logs: ## View production logs
	docker-compose logs -f

restart: ## Restart production environment
	docker-compose restart

# Database commands
migrate: ## Run database migrations
	docker-compose exec app npx prisma migrate deploy

migrate-dev: ## Run database migrations (development)
	docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

db-reset: ## Reset database (WARNING: deletes all data)
	docker-compose down -v
	docker-compose up -d

# Utility commands
clean: ## Remove all containers, volumes, and images
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans

shell: ## Access application container shell
	docker-compose exec app sh

db-shell: ## Access database shell
	docker-compose exec db psql -U postgres -d mentor_futuro

prisma-studio: ## Open Prisma Studio
	docker-compose exec app npx prisma studio

# Build and deploy
prod-build: ## Build and start production environment
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Application running at http://localhost:3000"

# Quick start
install: ## Quick setup: copy env file and start development
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "Created .env file from .env.docker"; \
		echo "Please update .env with your actual values"; \
	else \
		echo ".env file already exists"; \
	fi
	@make dev

status: ## Show status of all containers
	docker-compose ps
