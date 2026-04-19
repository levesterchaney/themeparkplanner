# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows

### 🔧 Backend CI (`backend-ci.yml`)
- **Triggers**: Push/PR to `main` or `develop` with backend changes
- **Tests**: Python 3.9, 3.10, 3.11 with PostgreSQL and Redis
- **Steps**:
  - Install dependencies
  - Run database migrations
  - Run tests with coverage
  - Upload coverage to Codecov

### 🎨 Frontend CI (`frontend-ci.yml`)
- **Triggers**: Push/PR to `main` or `develop` with frontend changes
- **Tests**: Node.js 18, 20
- **Steps**:
  - Install dependencies
  - Run ESLint
  - Run tests with coverage
  - Build application
  - Upload coverage to Codecov

### 🚀 Full Stack CI (`full-stack-ci.yml`)
- **Triggers**: Push/PR to `main` branch
- **Jobs**:
  - Backend tests (Python 3.11)
  - Frontend tests (Node.js 20)
  - Integration tests (both services)
- **Features**:
  - Health checks for API and frontend
  - Full stack deployment simulation
  - Ready for end-to-end testing

## Badge Usage

Add these badges to your README:

```markdown
![Backend CI](https://github.com/yourusername/themeparkplanner/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/yourusername/themeparkplanner/workflows/Frontend%20CI/badge.svg)
![Full Stack CI](https://github.com/yourusername/themeparkplanner/workflows/Full%20Stack%20CI/badge.svg)
```

## Test Coverage

### Current Status
- **Backend**: 55 tests passing with 89% coverage
- **Frontend**: 170+ tests passing with comprehensive UI coverage
- **Components**: Includes TabPanel, HeaderNav, and all authentication flows

## Configuration

### Backend Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `DEBUG`: Enable debug mode

### Frontend Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

### Secrets Configuration
Set these in your GitHub repository secrets:
- `CODECOV_TOKEN`: For coverage reporting (optional)
- `DATABASE_URL`: For integration tests

## Local Development

Use the test runners for local development:
```bash
# Backend
cd backend && ./run_tests.sh coverage

# Frontend
cd frontend && ./run_tests.sh coverage
```
