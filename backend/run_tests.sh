#!/bin/bash

# Theme Park Planner Backend Test Runner
# This script provides convenient ways to run tests with different options

set -e

echo "🧪 Theme Park Planner Backend Test Runner"
echo "========================================"

case "${1:-help}" in
    "test")
        echo "Running tests without coverage..."
        pytest --no-cov
        ;;
    "coverage")
        echo "Running tests with coverage..."
        pytest
        echo ""
        echo "📊 Coverage summary generated!"
        echo "   - Terminal: Shows above"
        echo "   - HTML: htmlcov/index.html"
        echo "   - XML: coverage.xml"
        echo ""
        echo "🎯 Coverage threshold: 80% (will fail if below)"
        ;;
    "coverage-html")
        echo "Running tests and opening HTML coverage report..."
        pytest
        if command -v open >/dev/null 2>&1; then
            open htmlcov/index.html
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open htmlcov/index.html
        else
            echo "HTML report generated at: htmlcov/index.html"
        fi
        ;;
    "quick")
        echo "Running tests quickly (no coverage, less verbose)..."
        pytest --no-cov -q
        ;;
    "watch")
        echo "Running tests in watch mode..."
        if command -v pytest-watch >/dev/null 2>&1; then
            pytest-watch -- --no-cov
        else
            echo "❌ pytest-watch not installed. Install with: pip install pytest-watch"
            exit 1
        fi
        ;;
    "clean")
        echo "Cleaning test artifacts..."
        rm -rf htmlcov/
        rm -f coverage.xml
        rm -f .coverage
        find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
        find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
        echo "✅ Test artifacts cleaned!"
        ;;
    "help"|*)
        echo "Usage: ./run_tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  test          - Run tests without coverage"
        echo "  coverage      - Run tests with coverage (default)"
        echo "  coverage-html - Run tests with coverage and open HTML report"
        echo "  quick         - Run tests quickly (no coverage, minimal output)"
        echo "  watch         - Run tests in watch mode (requires pytest-watch)"
        echo "  clean         - Clean test artifacts"
        echo "  help          - Show this help message"
        echo ""
        echo "⚠️  Coverage threshold: Tests will FAIL if coverage drops below 80%"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh coverage"
        echo "  ./run_tests.sh quick"
        echo "  ./run_tests.sh clean"
        ;;
esac
