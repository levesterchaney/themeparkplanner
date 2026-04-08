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
│   └── Dockerfile         # Container configuration
└── README.md
```

## Backend API

The backend is built with FastAPI and provides a robust, async API with the following features:

### Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: Async ORM for PostgreSQL database operations
- **PostgreSQL**: Primary database for application data
- **Redis**: Caching and session management
- **Pydantic**: Data validation and settings management
- **Alembic**: Database migration management

### Key Features

- ✅ Async PostgreSQL connection with connection pooling
- ✅ Redis client for caching and real-time features
- ✅ Environment-based configuration management
- ✅ Comprehensive health check endpoints
- ✅ Automatic API documentation with OpenAPI/Swagger
- 🔄 Database migrations with Alembic
- 🔄 Authentication and authorization
- 🔄 LLM integration for intelligent trip planning

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/themeparkplanner
   REDIS_URL=redis://localhost:6379
   SECRET_KEY=your-super-secret-key-here
   ENVIRONMENT=development
   DEBUG=true
   ```

4. **Run database migrations** (when available)
   ```bash
   alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

### Docker Setup (Alternative)

```bash
cd backend
docker build -t themeparkplanner-api .
docker run -p 8000:8000 themeparkplanner-api
```

## API Endpoints

### Health Checks

- `GET /api/v1/health` - Overall system health
- `GET /api/v1/health/database` - Database connectivity
- `GET /api/v1/health/redis` - Redis connectivity

### Core API (Coming Soon)

- `/api/v1/parks` - Theme park data and information
- `/api/v1/attractions` - Attraction details and wait times
- `/api/v1/itineraries` - Trip planning and management
- `/api/v1/users` - User accounts and preferences

## Development

### Environment Configuration

The application uses Pydantic Settings for configuration management. Key settings include:

- **Database**: Connection URL, pool size, and overflow settings
- **Redis**: Connection URL and pool configuration
- **API**: Version prefix and project metadata
- **Security**: Secret keys and token expiration
- **Environment**: Development/production mode and debug settings

### Database Models

Database models are defined in `app/models/` using SQLAlchemy's async ORM. The base model class is configured in `app/core/database.py`.

### Adding New Endpoints

1. Create route handlers in `app/api/`
2. Define Pydantic schemas in `app/schemas/`
3. Add business logic to `app/services/`
4. Include routers in `app/main.py`

## Production Deployment

### Environment Variables

Set these environment variables for production:

```env
DATABASE_URL=postgresql+asyncpg://prod_user:prod_password@prod_host/prod_db
REDIS_URL=redis://prod_redis_host:6379
SECRET_KEY=production-secret-key-very-long-and-secure
ENVIRONMENT=production
DEBUG=false
```

### Performance Considerations

- PostgreSQL connection pooling is configured for optimal performance
- Redis is used for caching frequently accessed data
- Async endpoints handle concurrent requests efficiently
- Health checks ensure service reliability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (when available)
5. Submit a pull request

## License

[License information to be added]
