# Testing Phase 1: Quick Start Guide

**Goal**: Get testing infrastructure running and write your first tests in 1-2 hours

---

## Step 1: Install Dependencies (5 minutes)

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/jest-dom
```

---

## Step 2: Configure Jest (10 minutes)

Create `jest.config.js` in project root:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom'
```

---

## Step 3: Add Test Scripts (2 minutes)

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Step 4: Create Your First Test (15 minutes)

Create `lib/authorization/__tests__/utils.test.ts`:

```typescript
import { hasPremiumAccess, checkResourceAccess } from '../utils'
import { Session } from 'next-auth'

describe('Authorization Utils', () => {
  describe('hasPremiumAccess', () => {
    it('should return true for active premium user', () => {
      const session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          subscription: {
            tier: 'PREMIUM',
            status: 'ACTIVE',
          },
        },
      } as Session

      expect(hasPremiumAccess(session)).toBe(true)
    })

    it('should return false for free tier user', () => {
      const session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          subscription: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      } as Session

      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for inactive premium user', () => {
      const session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          subscription: {
            tier: 'PREMIUM',
            status: 'INACTIVE',
          },
        },
      } as Session

      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for null session', () => {
      expect(hasPremiumAccess(null)).toBe(false)
    })

    it('should return false for session without subscription', () => {
      const session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
        },
      } as Session

      expect(hasPremiumAccess(session)).toBe(false)
    })
  })

  describe('checkResourceAccess', () => {
    it('should allow premium user to access premium resource', () => {
      const session = {
        user: {
          subscription: { tier: 'PREMIUM', status: 'ACTIVE' },
        },
      } as Session

      expect(checkResourceAccess(session, true)).toBe(true)
    })

    it('should allow premium user to access free resource', () => {
      const session = {
        user: {
          subscription: { tier: 'PREMIUM', status: 'ACTIVE' },
        },
      } as Session

      expect(checkResourceAccess(session, false)).toBe(true)
    })

    it('should allow free user to access free resource', () => {
      const session = {
        user: {
          subscription: { tier: 'FREE', status: 'ACTIVE' },
        },
      } as Session

      expect(checkResourceAccess(session, false)).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const session = {
        user: {
          subscription: { tier: 'FREE', status: 'ACTIVE' },
        },
      } as Session

      expect(checkResourceAccess(session, true)).toBe(false)
    })

    it('should deny unauthenticated user access to premium resource', () => {
      expect(checkResourceAccess(null, true)).toBe(false)
    })

    it('should allow unauthenticated user access to free resource', () => {
      expect(checkResourceAccess(null, false)).toBe(true)
    })
  })
})
```

---

## Step 5: Run Your First Test (2 minutes)

```bash
npm test
```

You should see output like:

```
PASS  lib/authorization/__tests__/utils.test.ts
  Authorization Utils
    hasPremiumAccess
      ✓ should return true for active premium user (2 ms)
      ✓ should return false for free tier user (1 ms)
      ✓ should return false for inactive premium user
      ✓ should return false for null session
      ✓ should return false for session without subscription (1 ms)
    checkResourceAccess
      ✓ should allow premium user to access premium resource (1 ms)
      ✓ should allow premium user to access free resource
      ✓ should allow free user to access free resource
      ✓ should deny free user access to premium resource
      ✓ should deny unauthenticated user access to premium resource
      ✓ should allow unauthenticated user access to free resource (1 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## Step 6: Create Test Helpers (20 minutes)

Create `test-utils/factories.ts`:

```typescript
import { Session } from 'next-auth'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

/**
 * Create mock session for testing
 */
export const createMockSession = (overrides: {
  tier?: SubscriptionTier
  status?: SubscriptionStatus
  userId?: string
  email?: string
} = {}): Session => {
  return {
    user: {
      id: overrides.userId || 'test-user-id',
      email: overrides.email || 'test@example.com',
      name: 'Test User',
      subscription: {
        tier: overrides.tier || SubscriptionTier.FREE,
        status: overrides.status || SubscriptionStatus.ACTIVE,
      },
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } as Session
}

/**
 * Create mock premium session
 */
export const createMockPremiumSession = (): Session => {
  return createMockSession({
    tier: SubscriptionTier.PREMIUM,
    status: SubscriptionStatus.ACTIVE,
  })
}

/**
 * Create mock free session
 */
export const createMockFreeSession = (): Session => {
  return createMockSession({
    tier: SubscriptionTier.FREE,
    status: SubscriptionStatus.ACTIVE,
  })
}

/**
 * Create mock user with subscription
 */
export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  subscription: {
    id: 'test-sub-id',
    userId: 'test-user-id',
    tier: SubscriptionTier.FREE,
    status: SubscriptionStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides.subscription,
  },
  ...overrides,
})

/**
 * Create mock event
 */
export const createMockEvent = (overrides: any = {}) => ({
  id: 'test-event-id',
  title: 'Test Event',
  description: 'Test event description',
  startDate: new Date(),
  endDate: new Date(),
  location: 'Test Location',
  imageUrl: 'https://example.com/image.jpg',
  maxAttendees: 100,
  isPremiumOnly: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/**
 * Create mock course
 */
export const createMockCourse = (overrides: any = {}) => ({
  id: 'test-course-id',
  title: 'Test Course',
  description: 'Test course description',
  thumbnail: 'https://example.com/thumb.jpg',
  duration: 60,
  isPremiumOnly: false,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
```

Create `test-utils/mocks.ts`:

```typescript
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'
import { IPasswordService } from '@/lib/services/interfaces/IPasswordService'
import { IAuthService } from '@/lib/services/interfaces/IAuthService'

/**
 * Create mock UserRepository
 */
export const createMockUserRepository = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

/**
 * Create mock PasswordService
 */
export const createMockPasswordService = (): jest.Mocked<IPasswordService> => ({
  hash: jest.fn(),
  compare: jest.fn(),
})

/**
 * Create mock AuthService
 */
export const createMockAuthService = (): jest.Mocked<IAuthService> => ({
  authenticate: jest.fn(),
})

/**
 * Create mock Prisma client
 */
export const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  service: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
})
```

---

## Step 7: Write More Tests Using Helpers (20 minutes)

Create `lib/authorization/__tests__/strategies.test.ts`:

```typescript
import { PremiumAccessStrategy } from '../strategies/PremiumAccessStrategy'
import { FreeAccessStrategy } from '../strategies/FreeAccessStrategy'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

describe('Authorization Strategies', () => {
  describe('PremiumAccessStrategy', () => {
    let strategy: PremiumAccessStrategy

    beforeEach(() => {
      strategy = new PremiumAccessStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('premium-access')
    })

    it('should allow access when not requiring premium', () => {
      const result = strategy.canAccess(
        SubscriptionTier.FREE,
        SubscriptionStatus.ACTIVE,
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should allow premium user access to premium resource', () => {
      const result = strategy.canAccess(
        SubscriptionTier.PREMIUM,
        SubscriptionStatus.ACTIVE,
        { requiresPremium: true }
      )
      expect(result).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const result = strategy.canAccess(
        SubscriptionTier.FREE,
        SubscriptionStatus.ACTIVE,
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should deny inactive premium user access', () => {
      const result = strategy.canAccess(
        SubscriptionTier.PREMIUM,
        SubscriptionStatus.INACTIVE,
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })
  })

  describe('FreeAccessStrategy', () => {
    let strategy: FreeAccessStrategy

    beforeEach(() => {
      strategy = new FreeAccessStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('free-access')
    })

    it('should allow access to free resources', () => {
      const result = strategy.canAccess(
        SubscriptionTier.FREE,
        SubscriptionStatus.ACTIVE,
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should deny access to premium resources', () => {
      const result = strategy.canAccess(
        SubscriptionTier.FREE,
        SubscriptionStatus.ACTIVE,
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })
  })
})
```

---

## Step 8: Check Coverage (5 minutes)

```bash
npm run test:coverage
```

Look for output like:

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |   87.50 |    83.33 |   90.00 |   87.50 |
 authorization       |  100.00 |   100.00 |  100.00 |  100.00 |
  utils.ts           |  100.00 |   100.00 |  100.00 |  100.00 |
 authorization/...   |   85.71 |    75.00 |   85.71 |   85.71 |
  PremiumAccess...   |   85.71 |    75.00 |   85.71 |   85.71 |
  FreeAccess...      |   85.71 |    75.00 |   85.71 |   85.71 |
----------------------|---------|----------|---------|---------|
```

---

## Step 9: Setup Watch Mode (2 minutes)

For development, run tests in watch mode:

```bash
npm run test:watch
```

This will:
- Re-run tests when files change
- Show only failed tests
- Allow filtering by test name
- Provide quick feedback loop

---

## Step 10: Add CI Integration (10 minutes)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Generate coverage
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        fail_ci_if_error: true
```

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/...'"

**Solution**: Check `moduleNameMapper` in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Issue: "Unexpected token import/export"

**Solution**: Ensure `ts-jest` is configured:

```javascript
transform: {
  '^.+\\.tsx?$': 'ts-jest',
}
```

### Issue: Prisma types not found in tests

**Solution**: Generate Prisma client before tests:

```json
{
  "scripts": {
    "pretest": "prisma generate",
    "test": "jest"
  }
}
```

### Issue: Tests are slow

**Solution**: Run tests in parallel:

```json
{
  "scripts": {
    "test": "jest --maxWorkers=4"
  }
}
```

---

## Next Steps

1. ✅ Complete Phase 1 setup (you're done!)
2. 📝 Move to Phase 2: Service Layer Tests
3. 📈 Track coverage improvements
4. 🔄 Add more test helpers as needed

---

## Quick Reference

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- utils.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="premium"
```

### Generate coverage report
```bash
npm run test:coverage
```

### Debug tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

**Congratulations!** You've completed Phase 1 setup. You now have:
- ✅ Jest configured and running
- ✅ First tests passing
- ✅ Test helpers created
- ✅ Coverage tracking enabled
- ✅ Ready for Phase 2!

**Time invested**: ~1-2 hours
**Value gained**: Testing infrastructure + 11 passing tests
**Next**: Continue with Phase 2 (Service Layer Tests)
