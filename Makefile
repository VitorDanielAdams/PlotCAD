# ══════════════════════════════════════════════════════════════════════════════
# PlotCAD — Operations Makefile
#
# Quick reference for common operations.
# Run: make <target>
# ══════════════════════════════════════════════════════════════════════════════

COMPOSE := docker compose -f docker-compose.prod.yaml --env-file .env.prod
CONTAINER_PG := plotcad-postgres
CONTAINER_REDIS := plotcad-redis

.PHONY: help up down status logs logs-api logs-pg backup restore deploy rollback \
        health db-shell redis-shell clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ── Lifecycle ────────────────────────────────────────────────────────────────

up: ## Start all services
	$(COMPOSE) up -d

down: ## Stop all services (preserves data)
	$(COMPOSE) down

restart-api: ## Restart the active API container
	@ACTIVE=$$(cat .active-slot 2>/dev/null || echo blue); \
	docker restart plotcad-api-$$ACTIVE

# ── Monitoring ───────────────────────────────────────────────────────────────

status: ## Show container status
	@docker ps --filter "name=plotcad" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "Active slot: $$(cat .active-slot 2>/dev/null || echo 'blue (default)')"

logs: ## Tail all container logs
	$(COMPOSE) logs -f --tail=50

logs-api: ## Tail API logs
	@ACTIVE=$$(cat .active-slot 2>/dev/null || echo blue); \
	docker logs -f --tail=100 plotcad-api-$$ACTIVE

logs-pg: ## Tail PostgreSQL logs
	docker logs -f --tail=100 $(CONTAINER_PG)

health: ## Check API health
	@ACTIVE=$$(cat .active-slot 2>/dev/null || echo blue); \
	PORT=$$(echo $$ACTIVE | sed 's/blue/5000/;s/green/5001/'); \
	curl -sf http://localhost:$$PORT/health && echo " OK" || echo " FAILED"

# ── Deploy ───────────────────────────────────────────────────────────────────

deploy: ## Deploy latest image (blue-green)
	sudo bash scripts/deploy.sh latest

rollback: ## Rollback to previous slot
	sudo bash scripts/deploy.sh latest --rollback

# ── Database ─────────────────────────────────────────────────────────────────

backup: ## Create database backup
	bash scripts/backup.sh

restore: ## List available backups (use: make restore FILE=<path>)
ifdef FILE
	bash scripts/backup.sh --restore $(FILE)
else
	bash scripts/backup.sh --restore
endif

db-shell: ## Open PostgreSQL interactive shell
	docker exec -it $(CONTAINER_PG) psql -U plotcad -d PlotCAD

redis-shell: ## Open Redis interactive shell
	docker exec -it $(CONTAINER_REDIS) redis-cli

# ── Maintenance ──────────────────────────────────────────────────────────────

clean: ## Remove unused Docker images and volumes
	docker image prune -f
	docker volume prune -f

disk: ## Show disk usage
	@echo "=== Docker ==="
	@docker system df
	@echo ""
	@echo "=== Backups ==="
	@du -sh /opt/plotcad/backups/ 2>/dev/null || echo "No backups"
	@echo ""
	@echo "=== Tiles ==="
	@du -sh /var/www/plotcad/tiles/ 2>/dev/null || echo "No tiles"
