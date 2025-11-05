# Unit Testing Implementation Plan

**Project**: Next.js Subscription Platform
**Start Date**: TBD
**Goal**: Achieve 80%+ test coverage with comprehensive unit and integration tests
**Current Coverage**: ~0%
**Target Coverage**: 80%+

---

## Overview

This plan follows a progressive approach to testing, starting with simple, isolated unit tests and gradually building up to comprehensive integration and E2E tests. Each phase builds upon the previous one, ensuring a solid testing foundation.

### Testing Strategy

- **Phase 1**: Test infrastructure + Utilities (Quick wins, ~2-3 days)
- **Phase 2**: Service layer tests (Core business logic, ~3-4 days)
- **Phase 3**: Repository layer tests (Data access, ~3-4 days)
- **Phase 4**: Strategy pattern tests (Webhooks/Authorization, ~2-3 days)
- **Phase 5**: Integration tests (Combined layers, ~4-5 days)
- **Phase 6**: E2E API tests (Full stack, ~3-4 days)

**Total Estimated Time**: 17-23 days

---

## Phase 1: Test Infrastructure & Utilities (Quick Wins)

**Duration**: 2-3 days | **Priority**: High | **Complexity**: Low

### Goals
- Set up testing infrastructure (Jest, testing libraries)
- Test simple utilities first (easy wins for momentum)
- Establish testing patterns and conventions
- Create test helpers and mocks

### Tasks

#### 1.1 Setup Testing Infrastructure
- [ ] Install Jest and testing dependencies
- [ ] Configure Jest for TypeScript and Next.js
- [ ] Setup test file structure (\_\_tests\_\_ directories)
- [ ] Create jest.config.js with proper paths
- [ ] Add test scripts to package.json

#### 1.2 Test Utility Functions
- [ ] Test `lib/authorization/utils.ts`
  - `hasPremiumAccess()`
  - `checkResourceAccess()`
  - `filterByAccess()`
- [ ] Test `lib/utils/subscription.ts`
  - `hasAccess()`

#### 1.3 Create Test Helpers
- [ ] Create mock session objects
- [ ] Create mock user/subscription objects
- [ ] Create mock Prisma client
- [ ] Create mock Stripe client
- [ ] Document testing patterns

### Example Tests

```typescript
// lib/authorization/__tests__/utils.test.ts
import { hasPremiumAccess, checkResourceAccess } from '../utils'
import { Session } from 'next-auth'

describe('Authorization Utils', () => {
  describe('hasPremiumAccess', () => {
    it('should return true for active premium user', () => {
      const session: Session = {
        user: {
          subscription: {
            tier: 'PREMIUM',
            status: 'ACTIVE'
          }
        }
      }
      expect(hasPremiumAccess(session)).toBe(true)
    })

    it('should return false for free tier user', () => {
      const session: Session = {
        user: {
          subscription: {
            tier: 'FREE',
            status: 'ACTIVE'
          }
        }
      }
      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for inactive premium user', () => {
      const session: Session = {
        user: {
          subscription: {
            tier: 'PREMIUM',
            status: 'INACTIVE'
          }
        }
      }
      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for null session', () => {
      expect(hasPremiumAccess(null)).toBe(false)
    })
  })

  describe('checkResourceAccess', () => {
    it('should allow premium user to access premium resource', () => {
      const session: Session = {
        user: {
          subscription: { tier: 'PREMIUM', status: 'ACTIVE' }
        }
      }
      expect(checkResourceAccess(session, true)).toBe(true)
    })

    it('should allow any user to access free resource', () => {
      const session: Session = {
        user: {
          subscription: { tier: 'FREE', status: 'ACTIVE' }
        }
      }
      expect(checkResourceAccess(session, false)).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const session: Session = {
        user: {
          subscription: { tier: 'FREE', status: 'ACTIVE' }
        }
      }
      expect(checkResourceAccess(session, true)).toBe(false)
    })
  })
})
```

### Success Criteria
- ✅ Jest configured and running
- ✅ All utility functions have >90% coverage
- ✅ Test helpers created and documented
- ✅ CI/CD can run tests successfully
- ✅ Test patterns established

### Dependencies
- None (starting point)

---

## Phase 2: Service Layer Tests (Core Business Logic)

**Duration**: 3-4 days | **Priority**: High | **Complexity**: Medium

### Goals
- Test all service classes in isolation
- Mock repository dependencies
- Cover happy paths and error cases
- Test business logic thoroughly

### Tasks

#### 2.1 Test PasswordService
- [ ] Test `hash()` method
- [ ] Test `compare()` method
- [ ] Test with various password inputs
- [ ] Test error cases

#### 2.2 Test AuthService
- [ ] Test `authenticate()` with valid credentials
- [ ] Test `authenticate()` with invalid credentials
- [ ] Test `authenticate()` with non-existent user
- [ ] Mock UserRepository and PasswordService
- [ ] Test error handling

#### 2.3 Test UserService
- [ ] Test `createUser()` with valid data
- [ ] Test `createUser()` with duplicate email
- [ ] Test `getUserById()` found/not found
- [ ] Test `getUserByEmail()` found/not found
- [ ] Test `sanitizeUser()` removes password
- [ ] Mock UserRepository

#### 2.4 Test PaymentService
- [ ] Test `createCheckoutSession()` success
- [ ] Test `createPortalSession()` success
- [ ] Test `getCheckoutSession()` success
- [ ] Test error handling for Stripe failures
- [ ] Mock Stripe client

### Example Tests

```typescript
// lib/services/__tests__/AuthService.test.ts
import { AuthService } from '../AuthService'
import { IUserRepository } from '../interfaces/IUserRepository'
import { IPasswordService } from '../interfaces/IPasswordService'

describe('AuthService', () => {
  let authService: AuthService
  let mockPasswordService: jest.Mocked<IPasswordService>
  let mockUserRepository: jest.Mocked<IUserRepository>

  beforeEach(() => {
    mockPasswordService = {
      hash: jest.fn(),
      compare: jest.fn()
    }

    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    authService = new AuthService(mockPasswordService, mockUserRepository)
  })

  describe('authenticate', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        subscription: { tier: 'FREE', status: 'ACTIVE' }
      }

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(
        'test@example.com',
        'password123'
      )

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        subscription: mockUser.subscription
      })
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword'
      )
    })

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      const result = await authService.authenticate(
        'nonexistent@example.com',
        'password123'
      )

      expect(result).toBeNull()
      expect(mockPasswordService.compare).not.toHaveBeenCalled()
    })

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        subscription: { tier: 'FREE', status: 'ACTIVE' }
      }

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(false)

      const result = await authService.authenticate(
        'test@example.com',
        'wrongPassword'
      )

      expect(result).toBeNull()
    })

    it('should throw error when repository fails', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('Database error')
      )

      await expect(
        authService.authenticate('test@example.com', 'password123')
      ).rejects.toThrow('Database error')
    })
  })
})
```

### Success Criteria
- ✅ All services have >80% coverage
- ✅ All happy paths tested
- ✅ All error cases tested
- ✅ All dependencies properly mocked
- ✅ Tests run in isolation (no database)

### Dependencies
- Phase 1 complete (test helpers available)

---

## Phase 3: Repository Layer Tests (Data Access)

**Duration**: 3-4 days | **Priority**: High | **Complexity**: Medium-High

### Goals
- Test all repository classes
- Mock Prisma client properly
- Test CRUD operations
- Test query conditions and filters

### Tasks

#### 3.1 Test UserRepository
- [ ] Test `findById()` found/not found
- [ ] Test `findByEmail()` found/not found
- [ ] Test `create()` success
- [ ] Test `update()` success
- [ ] Test `delete()` success
- [ ] Mock Prisma client

#### 3.2 Test SubscriptionRepository
- [ ] Test `findByUserId()` found/not found
- [ ] Test `update()` with various tier/status
- [ ] Test `updateStripeCustomerId()`
- [ ] Mock Prisma client

#### 3.3 Test EventRepository
- [ ] Test `findAll()` returns all events
- [ ] Test `findByStatus()` filters correctly
- [ ] Test `findById()` found/not found
- [ ] Test `create()` success
- [ ] Test `registerUser()` success
- [ ] Test `registerUser()` duplicate prevention
- [ ] Mock Prisma client

#### 3.4 Test CourseRepository
- [ ] Test `findAll()` returns all courses
- [ ] Test `findByPublishedStatus()` filters correctly
- [ ] Test `findById()` found/not found
- [ ] Test `create()` success
- [ ] Test `enrollUser()` success
- [ ] Test `enrollUser()` duplicate prevention
- [ ] Mock Prisma client

#### 3.5 Test ServiceRepository
- [ ] Test `findAll()` returns all services
- [ ] Test `findByCategory()` filters correctly
- [ ] Test `create()` success
- [ ] Mock Prisma client

### Example Tests

```typescript
// lib/repositories/__tests__/PrismaUserRepository.test.ts
import { PrismaUserRepository } from '../PrismaUserRepository'
import { PrismaClient } from '@prisma/client'

// Mock Prisma client
jest.mock('@prisma/client')

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    } as any

    repository = new PrismaUserRepository(mockPrisma)
  })

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        subscription: { tier: 'FREE', status: 'ACTIVE' }
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await repository.findByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { subscription: true }
      })
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await repository.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create user with free subscription', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User',
        password: 'hashed'
      }

      const mockCreatedUser = {
        id: '1',
        ...userData,
        subscription: { tier: 'FREE', status: 'ACTIVE' }
      }

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const result = await repository.create(userData)

      expect(result).toEqual(mockCreatedUser)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          subscription: { create: { tier: 'FREE', status: 'ACTIVE' } }
        },
        include: { subscription: true }
      })
    })
  })
})
```

### Success Criteria
- ✅ All repositories have >80% coverage
- ✅ All CRUD operations tested
- ✅ All query filters tested
- ✅ Prisma properly mocked
- ✅ No actual database calls

### Dependencies
- Phase 1 complete (mock Prisma helper)

---

## Phase 4: Strategy Pattern Tests (Webhooks & Authorization)

**Duration**: 2-3 days | **Priority**: Medium | **Complexity**: Low-Medium

### Goals
- Test all webhook handlers
- Test all authorization strategies
- Test strategy registration and routing
- Cover all event types

### Tasks

#### 4.1 Test Webhook Handlers
- [ ] Test `CheckoutCompletedHandler.canHandle()`
- [ ] Test `CheckoutCompletedHandler.handle()` success
- [ ] Test `InvoicePaymentSucceededHandler.canHandle()`
- [ ] Test `InvoicePaymentSucceededHandler.handle()` success
- [ ] Test `SubscriptionDeletedHandler.canHandle()`
- [ ] Test `SubscriptionDeletedHandler.handle()` success
- [ ] Mock Stripe event objects
- [ ] Mock repository dependencies

#### 4.2 Test WebhookRouter
- [ ] Test `register()` adds handlers
- [ ] Test `route()` finds correct handler
- [ ] Test `route()` with no matching handler
- [ ] Test `route()` executes handler

#### 4.3 Test Authorization Strategies
- [ ] Test `PremiumAccessStrategy.canAccess()`
- [ ] Test `FreeAccessStrategy.canAccess()`
- [ ] Test `TierBasedStrategy.canAccess()`
- [ ] Test strategy name methods

#### 4.4 Test AuthorizationService
- [ ] Test `registerStrategy()` adds strategies
- [ ] Test `canAccess()` uses correct strategy
- [ ] Test `canAccess()` with default strategy
- [ ] Test `canAccess()` with non-existent strategy

### Example Tests

```typescript
// lib/webhooks/handlers/__tests__/CheckoutCompletedHandler.test.ts
import { CheckoutCompletedHandler } from '../CheckoutCompletedHandler'
import { ISubscriptionRepository } from '@/lib/repositories/interfaces'
import Stripe from 'stripe'

describe('CheckoutCompletedHandler', () => {
  let handler: CheckoutCompletedHandler
  let mockSubscriptionRepo: jest.Mocked<ISubscriptionRepository>

  beforeEach(() => {
    mockSubscriptionRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
      updateStripeCustomerId: jest.fn()
    } as any

    handler = new CheckoutCompletedHandler(mockSubscriptionRepo)
  })

  describe('canHandle', () => {
    it('should return true for checkout.session.completed', () => {
      expect(handler.canHandle('checkout.session.completed')).toBe(true)
    })

    it('should return false for other event types', () => {
      expect(handler.canHandle('invoice.payment_succeeded')).toBe(false)
      expect(handler.canHandle('customer.subscription.deleted')).toBe(false)
    })
  })

  describe('handle', () => {
    it('should update subscription when checkout completes', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'user123',
            subscription: 'sub_123',
            customer: 'cus_123'
          }
        }
      } as Stripe.Event

      const mockSubscription = {
        id: 'sub_123',
        default_payment_method: 'pm_123'
      }

      // Mock Stripe subscription retrieve
      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockSubscription)
      })

      await handler.handle(mockEvent)

      expect(mockSubscriptionRepo.update).toHaveBeenCalledWith('user123', {
        stripeSubscriptionId: 'sub_123',
        stripeCustomerId: 'cus_123',
        tier: expect.any(String),
        status: 'ACTIVE'
      })
    })
  })
})
```

### Success Criteria
- ✅ All handlers have >80% coverage
- ✅ All strategies have >90% coverage
- ✅ Router logic fully tested
- ✅ All event types covered

### Dependencies
- Phase 1 complete (mock helpers)
- Phase 3 complete (repository mocks)

---

## Phase 5: Integration Tests (Combined Layers)

**Duration**: 4-5 days | **Priority**: Medium | **Complexity**: High

### Goals
- Test service + repository interactions
- Test authorization + route interactions
- Use in-memory database or test database
- Test real data flows

### Tasks

#### 5.1 Setup Test Database
- [ ] Configure test database (SQLite in-memory or PostgreSQL test instance)
- [ ] Setup Prisma test client
- [ ] Create database seeding utilities
- [ ] Create database cleanup utilities

#### 5.2 Integration Test: User Registration Flow
- [ ] Test complete user creation with subscription
- [ ] Test password hashing integration
- [ ] Test database persistence
- [ ] Test error handling

#### 5.3 Integration Test: Authentication Flow
- [ ] Test login with real database
- [ ] Test password verification
- [ ] Test user not found scenario
- [ ] Test invalid password scenario

#### 5.4 Integration Test: Subscription Management
- [ ] Test subscription tier upgrade
- [ ] Test subscription status changes
- [ ] Test Stripe customer ID updates

#### 5.5 Integration Test: Event/Course Access
- [ ] Test premium user accessing premium content
- [ ] Test free user accessing free content
- [ ] Test free user denied premium content
- [ ] Test registration/enrollment flows

### Example Tests

```typescript
// __tests__/integration/user-registration.test.ts
import { UserService } from '@/lib/services'
import { PrismaUserRepository } from '@/lib/repositories'
import { PasswordService } from '@/lib/services'
import { PrismaClient } from '@prisma/client'

describe('User Registration Integration', () => {
  let prisma: PrismaClient
  let userService: UserService
  let userRepository: PrismaUserRepository
  let passwordService: PasswordService

  beforeAll(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } }
    })

    userRepository = new PrismaUserRepository(prisma)
    passwordService = new PasswordService()
    userService = new UserService(passwordService, userRepository)
  })

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create user with hashed password and free subscription', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    }

    const user = await userService.createUser(userData)

    // Verify user created
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)
    expect(user.password).toBeUndefined() // Should be sanitized

    // Verify in database
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email },
      include: { subscription: true }
    })

    expect(dbUser).toBeTruthy()
    expect(dbUser!.password).not.toBe('password123') // Should be hashed
    expect(dbUser!.subscription.tier).toBe('FREE')
    expect(dbUser!.subscription.status).toBe('ACTIVE')

    // Verify password was hashed
    const isValid = await passwordService.compare(
      'password123',
      dbUser!.password
    )
    expect(isValid).toBe(true)
  })

  it('should reject duplicate email', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    }

    await userService.createUser(userData)

    // Try to create again
    await expect(userService.createUser(userData)).rejects.toThrow()
  })
})
```

### Success Criteria
- ✅ All critical flows tested end-to-end
- ✅ Database interactions work correctly
- ✅ Error handling tested with real scenarios
- ✅ Tests run in isolated test database

### Dependencies
- Phase 2 complete (services tested)
- Phase 3 complete (repositories tested)

---

## Phase 6: E2E API Tests (Full Stack)

**Duration**: 3-4 days | **Priority**: Low-Medium | **Complexity**: High

### Goals
- Test API routes end-to-end
- Test HTTP request/response cycles
- Test authentication middleware
- Test authorization middleware

### Tasks

#### 6.1 Setup E2E Test Infrastructure
- [ ] Install supertest or similar HTTP testing library
- [ ] Configure Next.js test server
- [ ] Create authenticated request helpers
- [ ] Create test data factories

#### 6.2 Test Authentication Routes
- [ ] POST /api/auth/signup (success)
- [ ] POST /api/auth/signup (duplicate email)
- [ ] POST /api/auth/signin (success)
- [ ] POST /api/auth/signin (invalid credentials)

#### 6.3 Test Event Routes
- [ ] GET /api/events (free user sees free events only)
- [ ] GET /api/events (premium user sees all events)
- [ ] POST /api/events (authenticated user can create)
- [ ] POST /api/events/[id]/register (premium user can register)
- [ ] POST /api/events/[id]/register (free user denied for premium event)

#### 6.4 Test Course Routes
- [ ] GET /api/courses (free user sees free courses only)
- [ ] GET /api/courses (premium user sees all courses)
- [ ] POST /api/courses/[id]/enroll (premium user can enroll)
- [ ] POST /api/courses/[id]/enroll (free user denied for premium course)

#### 6.5 Test Subscription Routes
- [ ] POST /api/subscription/checkout (creates session)
- [ ] POST /api/subscription/portal (creates portal session)
- [ ] POST /api/webhooks/stripe (handles webhook events)

### Example Tests

```typescript
// __tests__/e2e/api/events.test.ts
import request from 'supertest'
import { createServer } from '@/test-utils/server'
import { createAuthenticatedSession } from '@/test-utils/auth'

describe('Events API E2E', () => {
  let server: any
  let freeUserToken: string
  let premiumUserToken: string

  beforeAll(async () => {
    server = await createServer()

    // Create test users
    freeUserToken = await createAuthenticatedSession({
      email: 'free@example.com',
      tier: 'FREE',
      status: 'ACTIVE'
    })

    premiumUserToken = await createAuthenticatedSession({
      email: 'premium@example.com',
      tier: 'PREMIUM',
      status: 'ACTIVE'
    })
  })

  describe('GET /api/events', () => {
    it('should return only free events for free user', async () => {
      const response = await request(server)
        .get('/api/events')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.every((e: any) => !e.isPremiumOnly)).toBe(true)
    })

    it('should return all events for premium user', async () => {
      const response = await request(server)
        .get('/api/events')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      // Should include premium events
      const hasPremiumEvents = response.body.some((e: any) => e.isPremiumOnly)
      expect(hasPremiumEvents).toBe(true)
    })

    it('should return only free events for unauthenticated user', async () => {
      const response = await request(server)
        .get('/api/events')
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.every((e: any) => !e.isPremiumOnly)).toBe(true)
    })
  })

  describe('POST /api/events/[id]/register', () => {
    it('should allow premium user to register for premium event', async () => {
      // Create premium event
      const event = await createTestEvent({ isPremiumOnly: true })

      const response = await request(server)
        .post(`/api/events/${event.id}/register`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(201)

      expect(response.body.eventId).toBe(event.id)
    })

    it('should deny free user from registering for premium event', async () => {
      // Create premium event
      const event = await createTestEvent({ isPremiumOnly: true })

      await request(server)
        .post(`/api/events/${event.id}/register`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403)
    })

    it('should allow free user to register for free event', async () => {
      // Create free event
      const event = await createTestEvent({ isPremiumOnly: false })

      const response = await request(server)
        .post(`/api/events/${event.id}/register`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(201)

      expect(response.body.eventId).toBe(event.id)
    })
  })
})
```

### Success Criteria
- ✅ All API routes tested
- ✅ Authentication flows verified
- ✅ Authorization flows verified
- ✅ HTTP status codes correct
- ✅ Response payloads validated

### Dependencies
- Phase 5 complete (integration tests working)

---

## Testing Infrastructure Details

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.12"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "jest --testPathPattern=__tests__/e2e"
  }
}
```

---

## Progress Tracking

### Phase Completion Checklist

- [ ] **Phase 1**: Test Infrastructure & Utilities
  - [ ] Jest setup complete
  - [ ] Utility tests complete (>90% coverage)
  - [ ] Test helpers created
  - [ ] Documentation written

- [ ] **Phase 2**: Service Layer Tests
  - [ ] PasswordService tests complete
  - [ ] AuthService tests complete
  - [ ] UserService tests complete
  - [ ] PaymentService tests complete
  - [ ] All services >80% coverage

- [ ] **Phase 3**: Repository Layer Tests
  - [ ] UserRepository tests complete
  - [ ] SubscriptionRepository tests complete
  - [ ] EventRepository tests complete
  - [ ] CourseRepository tests complete
  - [ ] ServiceRepository tests complete
  - [ ] All repositories >80% coverage

- [ ] **Phase 4**: Strategy Pattern Tests
  - [ ] Webhook handlers tests complete
  - [ ] WebhookRouter tests complete
  - [ ] Authorization strategies tests complete
  - [ ] AuthorizationService tests complete

- [ ] **Phase 5**: Integration Tests
  - [ ] Test database setup complete
  - [ ] User registration flow tested
  - [ ] Authentication flow tested
  - [ ] Subscription management tested
  - [ ] Content access tested

- [ ] **Phase 6**: E2E API Tests
  - [ ] Test server setup complete
  - [ ] Authentication routes tested
  - [ ] Event routes tested
  - [ ] Course routes tested
  - [ ] Subscription routes tested
  - [ ] Webhook routes tested

### Coverage Goals by Phase

| Phase | Target Coverage | Component |
|-------|----------------|-----------|
| 1 | 90%+ | Utilities |
| 2 | 80%+ | Services |
| 3 | 80%+ | Repositories |
| 4 | 80%+ | Strategies |
| 5 | - | Integration |
| 6 | - | E2E |
| **Overall** | **80%+** | **Entire Codebase** |

---

## Testing Best Practices

### 1. Test Naming Convention

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test
    })
  })
})
```

### 2. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should return user when credentials are valid', async () => {
  // Arrange
  const mockUser = { id: '1', email: 'test@example.com' }
  mockRepository.findByEmail.mockResolvedValue(mockUser)

  // Act
  const result = await service.authenticate('test@example.com', 'password')

  // Assert
  expect(result).toEqual(mockUser)
})
```

### 3. Mock Isolation

```typescript
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()

  // Create fresh instances
  mockRepository = createMockRepository()
  service = new Service(mockRepository)
})
```

### 4. Test Data Factories

```typescript
// test-utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  subscription: { tier: 'FREE', status: 'ACTIVE' },
  ...overrides
})
```

### 5. Avoid Test Interdependence

```typescript
// ❌ Bad - tests depend on order
it('should create user', () => { /* creates user */ })
it('should find created user', () => { /* relies on previous test */ })

// ✅ Good - tests are independent
it('should create user', () => {
  // Setup, create, assert, cleanup
})
it('should find user', () => {
  // Setup user, find, assert, cleanup
})
```

---

## Success Metrics

### Code Coverage
- Overall: 80%+
- Services: 80%+
- Repositories: 80%+
- Utilities: 90%+
- Strategies: 80%+

### Test Quality
- All happy paths covered
- All error cases covered
- All edge cases covered
- No flaky tests
- Fast execution (<30s for unit tests)

### Documentation
- All test patterns documented
- Test helpers documented
- Mock strategies documented
- Setup instructions clear

---

## Continuous Improvement

### After Initial Implementation
1. Monitor coverage trends
2. Add tests for bugs found in production
3. Refactor tests when refactoring code
4. Keep tests up to date with changes
5. Review and update this plan quarterly

### CI/CD Integration
1. Run tests on every push
2. Block PRs with failing tests
3. Block PRs with coverage drops
4. Generate coverage reports
5. Display coverage badges

---

**Next Steps**:
1. Review and approve this plan
2. Setup Phase 1 infrastructure
3. Begin with utility tests (quick wins)
4. Progress through phases systematically

**Estimated Completion**: 17-23 days for all 6 phases
**Current Status**: Not Started
**Last Updated**: 2025-11-05
