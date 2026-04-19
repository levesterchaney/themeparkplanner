# Theme Park Planner

A comprehensive theme park planning application that helps users organize and optimize their theme park visits with real-time data and intelligent itinerary planning.

## Project Structure

```
themeparkplanner/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas for API validation
│   │   ├── services/       # Business logic and external integrations
│   │   └── llm/           # LLM integration for intelligent planning
│   ├── alembic/           # Database migrations
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container configuration
├── frontend/               # Next.js frontend application
│   ├── src/               # Source code
│   │   ├── app/           # App Router pages and layouts
│   │   └── components/    # Reusable React components
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Frontend container configuration
├── docker-compose.yml     # Multi-service orchestration
├── .gitignore            # Git exclusions
└── README.md
```

## Tech Stack

### Backend (FastAPI)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: Async ORM for PostgreSQL database operations
- **PostgreSQL**: Primary database for application data
- **Redis**: Caching and session management
- **Pydantic**: Data validation and settings management
- **Alembic**: Database migration management

### Frontend (Next.js)
- **Next.js 16**: React framework with App Router
- **React 19**: UI library for building user interfaces
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Testing**: Jest + React Testing Library for comprehensive testing
- **ESLint**: Code linting and formatting

### Infrastructure
- **Docker**: Containerization for all services
- **Docker Compose**: Multi-container orchestration

### Key Features

- ✅ Async PostgreSQL connection with connection pooling
- ✅ Redis client for caching and real-time features
- ✅ Environment-based configuration management
- ✅ Comprehensive health check endpoints
- ✅ Automatic API documentation with OpenAPI/Swagger
- ✅ Database migrations with Alembic
- ✅ Complete authentication and authorization system
- ✅ User registration, login, logout, and session management
- ✅ Password reset functionality with email integration
- ✅ Responsive header navigation with authentication states
- ✅ Dark mode support and modern UI components
- ✅ Comprehensive unit test coverage (89% backend, 100% frontend)
- ✅ Component-level testing with Jest + React Testing Library
- 🔄 LLM integration for intelligent trip planning

## Quick Start

### Prerequisites

- **Docker**: Latest version
- **Docker Compose**: For orchestration

### Development Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd themeparkplanner
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **PostgreSQL**: localhost:5432
   - **Redis**: localhost:6379

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

### Alternative: Individual Service Setup

#### Backend Only
```bash
cd backend
docker build -t themeparkplanner-api .
docker run -p 8000:8000 themeparkplanner-api
```

#### Frontend Only
```bash
cd frontend
docker build -t themeparkplanner-ui .
docker run -p 3000:3000 themeparkplanner-ui
```

## Docker Development

### Useful Commands

```bash
# Start all services in background
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f api

# Rebuild and restart services
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Execute commands in running containers
docker-compose exec api bash
docker-compose exec frontend sh
```

### Environment Configuration

The application uses environment variables for configuration. Default values are set in `docker-compose.yml`:

- **Database**: PostgreSQL with user `tppuser` and database `themeparkplanner`
- **Redis**: Standard Redis configuration with persistence
- **API**: Development mode with hot reload enabled
- **Frontend**: Production build with optimized assets

## API Endpoints

### System

- `GET /` - Welcome message and API information
- `GET /docs` - Interactive API documentation (Swagger UI)

### Authentication API

- `POST /api/v1/auth/register` - User registration with validation
- `POST /api/v1/auth/login` - User login with session management
- `POST /api/v1/auth/logout` - User logout and session cleanup
- `POST /api/v1/auth/forgot-password` - Request password reset email
- `POST /api/v1/auth/reset-password` - Reset password with token validation

### Health & System API

- `GET /api/v1/health` - System health status (database, Redis, overall)

### Core API (Coming Soon)

- `/api/v1/parks` - Theme park data and information
- `/api/v1/attractions` - Attraction details and wait times
- `/api/v1/itineraries` - Trip planning and management
- `/api/v1/users` - User profiles and preferences

## Development

For detailed development information, see the individual README files:

- 📖 **[Backend Documentation](./backend/README.md)** - FastAPI setup, API documentation, testing, and deployment
- 📖 **[Frontend Documentation](./frontend/README.md)** - Next.js setup, component architecture, styling, and testing

### Quick Development Overview

**Backend Development**
- FastAPI with async PostgreSQL and Redis integration
- Database models with SQLAlchemy async ORM
- API routes with automatic OpenAPI documentation
- Comprehensive testing with pytest
- Database migrations with Alembic

**Frontend Development**
- Next.js 15 with App Router and React 19
- TypeScript for type safety
- Tailwind CSS for styling
- Component testing with Jest + React Testing Library
- Responsive design with dark mode support

### Local Development (Without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend Setup:**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Testing

**Backend Tests:**
```bash
cd backend
python3 -m pytest tests/ --cov=app --cov-report=html
# 55 tests passing, 89% coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
# 168+ tests passing, includes comprehensive auth flow testing
# Includes HeaderNav component tests and all authentication components
```

### Continuous Integration

The project includes GitHub Actions workflows for automated testing:

- **Backend CI**: Runs on non-main branches with backend changes
- **Frontend CI**: Runs on non-main branches with frontend changes
- **Full Stack CI**: Runs on main branch for complete integration testing

See [`.github/workflows/README.md`](./.github/workflows/README.md) for detailed CI/CD documentation.

### Environment Variables

For development, environment variables are configured in `docker-compose.yml`. For local overrides, create:

- `backend/.env` - Backend-specific environment variables
- `frontend/.env.local` - Frontend-specific environment variables

## Production Deployment

### Docker Production Setup

1. **Create production docker-compose override**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     api:
       environment:
         - ENVIRONMENT=production
         - DEBUG=false
         - SECRET_KEY=${PRODUCTION_SECRET_KEY}
     client:
       environment:
         - NODE_ENV=production
   ```

2. **Set production environment variables**
   ```env
   DATABASE_URL=postgresql+asyncpg://prod_user:prod_password@prod_host/prod_db
   REDIS_URL=redis://prod_redis_host:6379
   PRODUCTION_SECRET_KEY=your-very-long-and-secure-production-secret-key
   ```

3. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Performance Considerations

- **Backend**: Async PostgreSQL with connection pooling, Redis caching
- **Frontend**: Next.js production build with static optimization
- **Database**: Persistent volumes for data integrity
- **Containers**: Optimized Docker images for reduced size and startup time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (when available)
5. Submit a pull request

## License

[License information to be added]
