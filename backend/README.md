# Theme Park Planner - Backend API

A FastAPI-based backend service for planning theme park visits with real-time data and intelligent recommendations.

## 🚀 Features

- **User Authentication** - Registration, login, logout with secure session management
- **User Preferences** - Customizable settings for party size, thrill levels, dietary restrictions
- **Health Monitoring** - Database and Redis health checks with detailed status
- **API Documentation** - Auto-generated OpenAPI/Swagger documentation
- **Database Migrations** - Alembic-based schema management
- **Comprehensive Testing** - Unit tests with coverage reporting

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/           # API route handlers
│   ├── core/          # Configuration, database, Redis
│   ├── models/        # SQLAlchemy database models
│   └── main.py        # FastAPI application entry point
├── alembic/           # Database migration files
├── tests/             # Unit and integration tests
└── requirements.txt   # Python dependencies
```

## 🛠️ Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High performance Python API framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) async ORM
- **Cache**: [Redis](https://redis.io/) - Session storage and caching
- **Authentication**: bcrypt password hashing with secure session tokens
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) - Database schema management
- **Testing**: [pytest](https://pytest.org/) with async support and coverage
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) - Lightning fast ASGI server

## 📋 Prerequisites

- Python 3.9+ 
- PostgreSQL 12+
- Redis 6+
- pip or pipenv

## 🚦 Quick Start

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/themeparkplanner
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379

# Application  
DEBUG=true
PROJECT_NAME="Theme Park Planner API"
API_V1_STR="/api/v1"
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head

# Verify setup
python -c "from app.core.database import engine; print('Database connected!')"
```

### 4. Start Development Server

```bash
# Development server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server will start at http://localhost:8000
# API docs available at http://localhost:8000/docs
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | System health check |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/logout` | POST | User logout |
| `/` | GET | API information |

### Authentication Flow

1. **Registration**: `POST /api/v1/auth/register`
   ```json
   {
     "email": "user@example.com",
     "password": "SecurePassword123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login**: `POST /api/v1/auth/login`
   ```json
   {
     "email": "user@example.com", 
     "password": "SecurePassword123"
   }
   ```

3. **Session**: Secure HTTP-only cookies automatically handle authentication

## 🗄️ Database Schema

### Core Models

- **Users** - User accounts with authentication
- **UserPreferences** - Customizable user settings
- **Sessions** - Secure session management
- **PasswordResetTokens** - Password recovery tokens

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Check current status
alembic current

# View migration history
alembic history
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/api/test_user_auth.py

# Run tests in watch mode (requires pytest-watch)
pytest-watch

# Using test runner script
./run_tests.sh coverage
```

### Test Structure

```
tests/
├── conftest.py           # Test configuration and fixtures
├── api/
│   ├── test_health.py    # Health endpoint tests
│   └── test_user_auth.py # Authentication tests
└── models/               # Model tests (future)
```

### Coverage Reports
- **Terminal**: Shows missing lines
- **HTML**: `htmlcov/index.html` - Detailed coverage report
- **XML**: `coverage.xml` - For CI/CD integration

## 🔧 Development Tools

### Code Quality
```bash
# Format code
black app tests

# Sort imports  
isort app tests

# Type checking
mypy app

# Linting
flake8 app tests
```

### Database Tools
```bash
# Reset database (development only)
alembic downgrade base && alembic upgrade head

# Create test database
createdb themeparkplanner_test
```

## 🐳 Docker Support

### Development with Docker

```bash
# Build image
docker build -t themeparkplanner-backend .

# Run with docker-compose (includes PostgreSQL and Redis)
docker-compose up -d

# Run migrations in container
docker-compose exec backend alembic upgrade head
```

### Production Deployment

```bash
# Production build
docker build -f Dockerfile.prod -t themeparkplanner-backend:prod .

# Run with production settings
docker run -p 8000:8000 --env-file .env.prod themeparkplanner-backend:prod
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | ✅ |
| `DEBUG` | Enable debug mode | `false` | ❌ |
| `PROJECT_NAME` | API project name | `Theme Park Planner API` | ❌ |
| `API_V1_STR` | API version prefix | `/api/v1` | ❌ |
| `DATABASE_POOL_SIZE` | DB connection pool size | `5` | ❌ |
| `DATABASE_MAX_OVERFLOW` | DB pool max overflow | `10` | ❌ |

### CORS Configuration

```python
# In app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## 📊 Monitoring & Logging

### Health Checks
- **Database**: Connection and query test
- **Redis**: Connection and ping test  
- **System**: Overall application status

### Logging
```python
import logging

logger = logging.getLogger(__name__)
logger.info("API request processed")
```

## 🔐 Security

### Authentication
- **Password Hashing**: bcrypt with salt
- **Session Management**: Secure HTTP-only cookies
- **Token Security**: URL-safe random tokens
- **CORS**: Configured for frontend domain

### Best Practices
- Environment variables for secrets
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- Rate limiting (future enhancement)

## 🚀 Performance

### Database Optimization
- Connection pooling
- Async SQLAlchemy operations
- Query optimization with indexes
- Migration-based schema management

### Caching Strategy
- Redis for session storage
- Future: API response caching
- Database query result caching

## 🤝 Contributing

1. **Setup Development Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Run Tests**
   ```bash
   ./run_tests.sh coverage
   ```

4. **Submit Pull Request**
   - Ensure tests pass
   - Add tests for new features
   - Update documentation

### Code Standards
- Follow PEP 8 style guidelines
- Add type hints for all functions
- Write docstrings for public methods
- Maintain test coverage above 80%

## 📝 API Examples

### Registration
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "SecurePassword123", 
       "firstName": "John",
       "lastName": "Doe"
     }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -c cookies.txt \
     -d '{
       "email": "john@example.com",
       "password": "SecurePassword123"
     }'
```

### Health Check  
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify connection string
echo $DATABASE_URL
```

**Redis Connection Error**  
```bash
# Check Redis is running
redis-cli ping

# Verify connection string
echo $REDIS_URL
```

**Migration Errors**
```bash
# Check current migration status
alembic current

# Reset migrations (development only)
alembic downgrade base
alembic upgrade head
```

### Debug Mode
Enable debug mode for detailed error messages:
```bash
DEBUG=true uvicorn app.main:app --reload
```

## 📈 Performance Monitoring

### Key Metrics
- Response time per endpoint
- Database query performance  
- Memory usage
- Active sessions

### Tools
- Built-in health checks at `/api/v1/health`
- Database connection monitoring
- Redis connectivity status
- Custom performance middlewares

## 🎯 Roadmap

### Current Features ✅
- User authentication system
- Database migrations  
- Health monitoring
- Comprehensive testing
- API documentation

### Planned Features 🚧
- Park data integration
- Trip planning algorithms
- Real-time wait times
- Push notifications
- Advanced analytics

### Future Enhancements 💡
- GraphQL API support
- WebSocket connections
- Microservices architecture
- Machine learning recommendations
- Mobile app API extensions

---

## 📞 Support

For questions, issues, or contributions:

- **Documentation**: `/docs` endpoint when running
- **Issues**: GitHub Issues
- **API Reference**: Interactive docs at `/docs`

Built with ❤️ using FastAPI and modern Python