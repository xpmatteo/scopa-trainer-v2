.PHONY: test
test:
	open http://localhost:8000/web/tests.html
	@echo "Running tests..."

.PHONY: serve
serve:
	python -m http.server
	@echo "Server started at http://localhost:8000"
	@echo "Press Ctrl+C to stop the server"


