# Theme Park Planner - Frontend

A modern Next.js frontend application for planning theme park visits with real-time data and intelligent recommendations.

## 🌟 Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **User Authentication** - Registration, login, logout with session management
- **Real-time Health Monitoring** - Backend API status dashboard
- **Responsive Design** - Mobile-first approach with dark mode support
- **Type Safety** - Full TypeScript implementation
- **Component Testing** - Jest + React Testing Library
- **Performance Optimized** - Next.js App Router with static generation

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   └── logout/         # Logout page
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   └── HealthCheck.tsx # System status component
│   ├── lib/                # Utilities and configurations
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   └── __tests__/          # Unit and component tests
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Components**: [React 19](https://react.dev/) - Latest React with concurrent features
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **Linting**: [ESLint](https://eslint.org/) - Code quality and consistency
- **Type Checking**: TypeScript compiler with strict mode
- **Package Manager**: npm with lockfile for reproducible builds

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+
- Backend API running at `http://localhost:8000` (default)

## 🚦 Quick Start

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Development settings (optional)
NEXT_PUBLIC_DEBUG=true
```

### 3. Start Development Server

```bash
# Development server with hot reload
npm run dev

# Application will start at http://localhost:3000
```

### 4. Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (600, 700) - Authentication, CTAs
- **Secondary**: Gray (50-900) - Text, backgrounds
- **Success**: Green (600, 400) - Success states
- **Error**: Red (600, 400) - Error states
- **Warning**: Yellow (600, 400) - Warning states

### Typography
- **Font**: Geist Sans - Modern, readable typeface
- **Mono**: Geist Mono - Code and technical content
- **Scales**: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl

### Components
- **Forms**: Consistent styling with validation states
- **Buttons**: Primary, secondary, and danger variants
- **Cards**: Elevated containers with shadows
- **Navigation**: Clean, accessible navigation patterns

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page with system status
- `/login` - User authentication
- `/register` - User registration
- `/logout` - Logout processing

### Protected Routes (Future)
- `/dashboard` - User dashboard
- `/parks` - Theme park listings
- `/trips` - Trip planning interface
- `/profile` - User profile management

### Route Structure
```typescript
// app/page.tsx - Homepage
// app/login/page.tsx - Login page
// app/register/page.tsx - Registration page
// app/logout/page.tsx - Logout processing
// app/layout.tsx - Root layout
// app/globals.css - Global styles
```

## 🧩 Component Architecture

### Core Components

**Authentication Components**
```typescript
// src/components/auth/RegistrationForm.tsx
export default function RegistrationForm() {
  // Form validation, submission, error handling
}

// src/components/auth/LoginForm.tsx  
export default function LoginForm() {
  // Login flow, session management
}
```

**System Components**
```typescript
// src/components/HealthCheck.tsx
export default function HealthCheck() {
  // Backend API health monitoring
}
```

### Component Patterns
- **Form Handling**: Controlled components with validation
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton screens and spinners
- **Responsive Design**: Mobile-first breakpoints

## 🔗 API Integration

### Service Layer Architecture

```typescript
// src/lib/api-client.ts
class ApiClient {
  private baseURL: string;
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    // HTTP client with error handling
  }
}

export const apiClient = new ApiClient();
```

### Authentication Service
```typescript
// src/services/auth.ts
export const authService = {
  register: async (data: RegistrationData) => {
    return apiClient.post('/api/v1/auth/register', data);
  },
  
  login: async (email: string, password: string) => {
    return apiClient.post('/api/v1/auth/login', { email, password });
  },
  
  logout: async () => {
    return apiClient.post('/api/v1/auth/logout');
  }
};
```

### Type Definitions
```typescript
// src/types/api.ts
export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database?: 'healthy' | 'unhealthy' | 'unknown';
  redis?: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Using test runner script
./run_tests.sh coverage
```

### Test Structure

```
src/__tests__/
├── components/
│   ├── HealthCheck.test.tsx        # Component testing
│   └── auth/
│       └── RegistrationForm.test.tsx # Form testing
└── services/
    └── auth.test.ts                # Service layer testing
```

### Testing Patterns

**Component Testing**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationForm from '@/components/auth/RegistrationForm';

describe('RegistrationForm', () => {
  test('validates required fields', async () => {
    render(<RegistrationForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
  });
});
```

**Service Testing**
```typescript
import { authService } from '@/services/auth';

describe('AuthService', () => {
  test('calls registration endpoint', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    
    await authService.register(userData);
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', userData);
  });
});
```

### Coverage Reports
- **Terminal**: Summary with missing coverage
- **HTML**: `coverage/lcov-report/index.html` - Detailed report
- **LCOV**: `coverage/lcov.info` - CI/CD integration

## 🎯 Performance Optimization

### Next.js Optimizations
- **App Router**: Latest routing with streaming
- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: Next.js automatic image optimization
- **Font Optimization**: Google Fonts with `next/font`
- **Bundle Analysis**: Built-in bundle analyzer

### Performance Metrics
```bash
# Analyze bundle size
npm run build && npx @next/bundle-analyzer

# Lighthouse audit
npm run build && npm start
# Then run Lighthouse on http://localhost:3000
```

### Code Splitting
```typescript
// Dynamic imports for code splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## 🔧 Development Tools

### Code Quality
```bash
# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

### Development Server
```bash
# Development with debugging
DEBUG=true npm run dev

# Development with specific port
PORT=3001 npm run dev

# Development with HTTPS
npm run dev --https
```

## 🌐 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Docker Deployment
```bash
# Build image
docker build -t themeparkplanner-frontend .

# Run container
docker run -p 3000:3000 themeparkplanner-frontend
```

### Static Export
```bash
# Generate static export
npm run build
npm run export

# Serve static files
npx serve out
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` | ✅ |
| `NEXT_PUBLIC_DEBUG` | Enable debug features | `false` | ❌ |
| `PORT` | Development server port | `3000` | ❌ |

### Next.js Configuration

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    // Enable latest Next.js features
  },
  
  images: {
    domains: ['example.com'], // External image domains
  },
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎨 Styling Guide

### Tailwind CSS Classes

**Layout**
```css
.container      /* Responsive container */
.mx-auto        /* Center horizontally */
.min-h-screen   /* Full viewport height */
.flex           /* Flexbox layout */
.grid           /* Grid layout */
```

**Spacing**
```css
.p-4           /* Padding: 1rem */
.m-8           /* Margin: 2rem */
.space-y-6     /* Vertical spacing between children */
```

**Colors**
```css
.bg-indigo-600    /* Primary background */
.text-gray-900    /* Primary text */
.border-gray-300  /* Border color */
```

### Dark Mode Support
```typescript
// Automatic dark mode based on system preference
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to user preference
</div>
```

## 🔒 Security

### Authentication Flow
1. **Registration**: Secure form with validation
2. **Session Management**: HTTP-only cookies
3. **Route Protection**: Middleware-based auth checks
4. **CSRF Protection**: Built-in Next.js protection

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options', 
    value: 'nosniff'
  }
];
```

## 📊 Monitoring

### Error Tracking
```typescript
// Error boundary for graceful error handling
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
  }
}
```

### Performance Monitoring
- **Core Web Vitals**: Built-in Next.js monitoring
- **Custom Analytics**: Google Analytics integration ready
- **Real User Monitoring**: Performance API usage

## 🤝 Contributing

### Development Workflow
1. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Standards**
   - Write TypeScript with strict typing
   - Add tests for new components
   - Follow existing code patterns
   - Use semantic commit messages

4. **Quality Checks**
   ```bash
   npm run lint        # Code linting
   npm run test        # Unit tests
   npm run build       # Production build test
   ```

5. **Submit Pull Request**
   - Ensure all checks pass
   - Add screenshots for UI changes
   - Update documentation if needed

### Code Standards
- **TypeScript**: Strict mode with proper typing
- **Components**: Functional components with hooks
- **Styling**: Tailwind classes, avoid inline styles
- **Testing**: Test user interactions, not implementation
- **Commits**: Conventional commit format

## 📝 Examples

### Form Component
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExampleForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // API call here
      router.push('/success');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

### API Service
```typescript
import { apiClient } from '@/lib/api-client';

export const exampleService = {
  async getData(id: string) {
    return apiClient.get<DataResponse>(`/api/v1/data/${id}`);
  },
  
  async createData(data: CreateDataRequest) {
    return apiClient.post<DataResponse>('/api/v1/data', data);
  }
};
```

## 🔍 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check TypeScript config
npx tsc --showConfig

# Validate types
npx tsc --noEmit
```

**API Connection Issues**
```bash
# Verify backend is running
curl http://localhost:8000/api/v1/health

# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=true npm run dev

# Check network requests in browser DevTools
# Monitor console for API errors
```

## 📈 Performance Metrics

### Key Metrics to Monitor
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Optimization Techniques
- Image optimization with `next/image`
- Font optimization with `next/font`
- Code splitting with dynamic imports
- Caching strategies with SWR or React Query

## 🎯 Roadmap

### Current Features ✅
- User authentication system
- Responsive design with Tailwind
- Component testing with Jest
- TypeScript integration
- Health monitoring dashboard

### In Development 🚧
- User dashboard interface
- Theme park data integration
- Trip planning components
- Real-time notifications
- Advanced form validation

### Future Enhancements 💡
- Progressive Web App (PWA)
- Offline functionality
- Push notifications
- Advanced animations
- Mobile app companion

---

## 📞 Support

For questions, issues, or contributions:

- **Development**: `npm run dev` and visit `http://localhost:3000`
- **Issues**: GitHub Issues
- **Documentation**: This README and inline code comments
- **API Integration**: Backend API docs at `/docs`

Built with ❤️ using Next.js and modern React patterns