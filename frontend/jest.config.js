const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    '!src/middleware.ts',
    '!src/app/api/health/route.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    // Per-directory thresholds (optional)
    'src/components/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    'src/services/': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
