# Makefile for TSEA-X

.PHONY: setup dev dev-backend dev-frontend test docker-build docker-up clean

setup:
	@echo "Setting up project..."
	./dev-setup.sh

dev:
	@echo "Starting development environment..."
	make -j 2 dev-backend dev-frontend

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test:
	@echo "Running tests..."
	make test-backend
	make test-frontend

test-backend:
	cd backend && pytest

test-frontend:
	cd frontend && npm run lint && npm run build

docker-build:
	docker-compose -f docker-compose.production.yml build

docker-up:
	docker-compose -f docker-compose.production.yml up -d

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/.next
	rm -rf frontend/out
