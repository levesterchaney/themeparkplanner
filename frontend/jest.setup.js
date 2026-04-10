import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies() {
    return {
      has: jest.fn(() => false),
      get: jest.fn(() => undefined),
    }
  },
}))

// Global test environment setup
global.fetch = jest.fn()