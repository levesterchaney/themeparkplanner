#!/bin/bash

# Theme Park Planner Frontend Test Runner
# This script provides convenient ways to run tests with different options

set -e

echo "🧪 Theme Park Planner Frontend Test Runner"
echo "=========================================="

case "${1:-help}" in
    "test")
        echo "Running tests without coverage..."
        npm test -- --watchAll=false
        ;;
    "coverage")
        echo "Running tests with coverage..."
        npm run test:coverage
        echo ""
        echo "📊 Coverage summary generated!"
        echo "   - Terminal: Shows above"
        echo "   - HTML: coverage/lcov-report/index.html"
        echo ""
        echo "🎯 Coverage thresholds enforced:"
        echo "   - Global: 80% lines, 75% branches/functions"
        echo "   - Components: 85% lines, 80% branches/functions"
        echo "   - Services: 90% lines, 85% branches/functions"
        ;;
    "coverage-html")
        echo "Running tests and opening HTML coverage report..."
        npm run test:coverage
        if command -v open >/dev/null 2>&1; then
            open coverage/lcov-report/index.html
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open coverage/lcov-report/index.html
        else
            echo "HTML report generated at: coverage/lcov-report/index.html"
        fi
        ;;
    "watch")
        echo "Running tests in watch mode..."
        npm run test:watch
        ;;
    "quick")
        echo "Running tests quickly (no coverage, silent)..."
        npm test -- --watchAll=false --silent
        ;;
    "update-snapshots")
        echo "Updating test snapshots..."
        npm test -- --updateSnapshot --watchAll=false
        ;;
    "clean")
        echo "Cleaning test artifacts..."
        rm -rf coverage/
        find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
        echo "✅ Test artifacts cleaned!"
        ;;
    "lint-and-test")
        echo "Running linter and then tests..."
        npm run lint
        npm test -- --watchAll=false
        ;;
    "help"|*)
        echo "Usage: ./run_tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  test             - Run tests without coverage"
        echo "  coverage         - Run tests with coverage (default)"
        echo "  coverage-html    - Run tests with coverage and open HTML report"
        echo "  watch            - Run tests in watch mode"
        echo "  quick            - Run tests quickly (no coverage, silent)"
        echo "  update-snapshots - Update test snapshots"
        echo "  lint-and-test    - Run linter then tests"
        echo "  clean            - Clean test artifacts"
        echo "  help             - Show this help message"
        echo ""
        echo "⚠️  Coverage thresholds enforced (tests FAIL if below):"
        echo "   - Global: 80% lines, 75% branches/functions"
        echo "   - Components: 85% lines, 80% branches/functions"
        echo "   - Services: 90% lines, 85% branches/functions"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh coverage"
        echo "  ./run_tests.sh watch"
        echo "  ./run_tests.sh clean"
        ;;
esac
