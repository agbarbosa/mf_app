# Phase 1 Quick Start Guide

**Start implementing SOLID refactoring immediately with this guide**

---

## 🎯 Phase 1 Goal

Create all necessary interfaces and type definitions without breaking any existing code. This is the foundation for all future phases.

**Time Estimate**: 3-4 days
**Risk Level**: LOW (no breaking changes)
**Can Deploy**: Yes (nothing changes functionally)

---

## 📝 Step-by-Step Implementation

### Step 1: Create Directory Structure (5 minutes)

```bash
# Create all necessary directories
mkdir -p lib/repositories/interfaces
mkdir -p lib/services/interfaces
mkdir -p types/dto
```

### Step 2: Create Repository Interfaces (60 minutes)

#### 2.1 User Repository Interface

**File**: `lib/repositories/interfaces/IUserRepository.ts`

```typescript
import { User, Subscription } from '@prisma/client'

export type UserWithSubscription = User & {
  subscription: Subscription | null
}

export interface CreateUserData {
  email: string
  name: string
  password: string
  image?: string | null
}

export interface UpdateUserData {
  email?: string
  name?: string
  password?: string
  image?: string | null
}

export interface IUserRepository {
  /**
   * Find user by unique ID
   */
  findById(id: string): Promise<UserWithSubscription | null>

  /**
   * Find user by unique email
   */
  findByEmail(email: string): Promise<UserWithSubscription | null>

  /**
   * Create new user with free subscription
   */
  create(data: CreateUserData): Promise<UserWithSubscription>

  /**
   * Update existing user
   */
  update(id: string, data: UpdateUserData): Promise<User>

  /**
   * Delete user by ID
   */
  delete(id: string): Promise<void>
}
```

#### 2.2 Subscription Repository Interface

**File**: `lib/repositories/interfaces/ISubscriptionRepository.ts`

```typescript
import { Subscription, SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export interface UpdateSubscriptionData {
  tier?: SubscriptionTier
  status?: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  stripeCurrentPeriodEnd?: Date
}

export interface ISubscriptionRepository {
  /**
   * Find subscription by user ID
   */
  findByUserId(userId: string): Promise<Subscription | null>

  /**
   * Find subscription by Stripe subscription ID
   */
  findByStripeSubscriptionId(subscriptionId: string): Promise<Subscription | null>

  /**
   * Update subscription
   */
  update(userId: string, data: UpdateSubscriptionData): Promise<Subscription>

  /**
   * Update subscription by Stripe subscription ID
   */
  updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    data: UpdateSubscriptionData
  ): Promise<Subscription>

  /**
   * Cancel subscription
   */
  cancel(userId: string): Promise<Subscription>
}
```

#### 2.3 Event Repository Interface

**File**: `lib/repositories/interfaces/IEventRepository.ts`

```typescript
import { Event, EventStatus } from '@prisma/client'

export interface CreateEventData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  imageUrl?: string | null
  maxAttendees?: number | null
  isPremiumOnly: boolean
  status?: EventStatus
}

export interface UpdateEventData {
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  location?: string
  imageUrl?: string | null
  maxAttendees?: number | null
  isPremiumOnly?: boolean
  status?: EventStatus
}

export interface EventWithRegistrationCount extends Event {
  _count: {
    registrations: number
  }
}

export interface IEventRepository {
  /**
   * Find all events with registration counts
   */
  findAll(): Promise<EventWithRegistrationCount[]>

  /**
   * Find only free (non-premium) events
   */
  findFreeEvents(): Promise<EventWithRegistrationCount[]>

  /**
   * Find event by ID
   */
  findById(id: string): Promise<Event | null>

  /**
   * Create new event
   */
  create(data: CreateEventData): Promise<Event>

  /**
   * Update event
   */
  update(id: string, data: UpdateEventData): Promise<Event>

  /**
   * Delete event
   */
  delete(id: string): Promise<void>

  /**
   * Register user for event
   */
  registerUser(eventId: string, userId: string): Promise<void>

  /**
   * Unregister user from event
   */
  unregisterUser(eventId: string, userId: string): Promise<void>
}
```

#### 2.4 Course Repository Interface

**File**: `lib/repositories/interfaces/ICourseRepository.ts`

```typescript
import { Course } from '@prisma/client'

export interface CreateCourseData {
  title: string
  description: string
  thumbnail?: string | null
  duration?: number | null
  isPremiumOnly: boolean
  published: boolean
}

export interface UpdateCourseData {
  title?: string
  description?: string
  thumbnail?: string | null
  duration?: number | null
  isPremiumOnly?: boolean
  published?: boolean
}

export interface CourseWithCounts extends Course {
  _count: {
    modules: number
    enrollments: number
  }
}

export interface ICourseRepository {
  /**
   * Find all published courses
   */
  findAllPublished(): Promise<CourseWithCounts[]>

  /**
   * Find published free courses
   */
  findPublishedFreeCourses(): Promise<CourseWithCounts[]>

  /**
   * Find course by ID
   */
  findById(id: string): Promise<Course | null>

  /**
   * Create new course
   */
  create(data: CreateCourseData): Promise<Course>

  /**
   * Update course
   */
  update(id: string, data: UpdateCourseData): Promise<Course>

  /**
   * Delete course
   */
  delete(id: string): Promise<void>

  /**
   * Enroll user in course
   */
  enrollUser(courseId: string, userId: string): Promise<void>
}
```

#### 2.5 Service Repository Interface

**File**: `lib/repositories/interfaces/IServiceRepository.ts`

```typescript
import { Service, ServiceCategory } from '@prisma/client'

export interface CreateServiceData {
  title: string
  description: string
  category: ServiceCategory
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly: boolean
  published: boolean
  userId: string
}

export interface UpdateServiceData {
  title?: string
  description?: string
  category?: ServiceCategory
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly?: boolean
  published?: boolean
}

export interface IServiceRepository {
  /**
   * Find all published services
   */
  findAllPublished(): Promise<Service[]>

  /**
   * Find published free services
   */
  findPublishedFreeServices(): Promise<Service[]>

  /**
   * Find service by ID
   */
  findById(id: string): Promise<Service | null>

  /**
   * Create new service
   */
  create(data: CreateServiceData): Promise<Service>

  /**
   * Update service
   */
  update(id: string, data: UpdateServiceData): Promise<Service>

  /**
   * Delete service
   */
  delete(id: string): Promise<void>
}
```

### Step 3: Create Service Interfaces (30 minutes)

#### 3.1 Password Service Interface

**File**: `lib/services/interfaces/IPasswordService.ts`

```typescript
export interface IPasswordService {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>

  /**
   * Compare plain text password with hash
   */
  compare(password: string, hash: string): Promise<boolean>
}
```

#### 3.2 Auth Service Interface

**File**: `lib/services/interfaces/IAuthService.ts`

```typescript
export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  image?: string | null
}

export interface IAuthService {
  /**
   * Authenticate user with email and password
   * Returns user data if successful, null otherwise
   */
  authenticate(email: string, password: string): Promise<AuthenticatedUser | null>

  /**
   * Validate session token
   */
  validateSession(token: string): Promise<AuthenticatedUser | null>
}
```

#### 3.3 Payment Service Interface

**File**: `lib/services/interfaces/IPaymentService.ts`

```typescript
export interface CheckoutSessionResult {
  url: string
  sessionId?: string
}

export interface PortalSessionResult {
  url: string
}

export interface IPaymentService {
  /**
   * Create Stripe checkout session for subscription
   */
  createCheckoutSession(
    userId: string,
    email: string,
    priceId: string
  ): Promise<CheckoutSessionResult>

  /**
   * Create Stripe billing portal session
   */
  createPortalSession(customerId: string): Promise<PortalSessionResult>

  /**
   * Retrieve checkout session by ID
   */
  getCheckoutSession(sessionId: string): Promise<any>
}
```

### Step 4: Create Index Files (10 minutes)

#### 4.1 Repository Interfaces Index

**File**: `lib/repositories/interfaces/index.ts`

```typescript
export * from './IUserRepository'
export * from './ISubscriptionRepository'
export * from './IEventRepository'
export * from './ICourseRepository'
export * from './IServiceRepository'
```

#### 4.2 Service Interfaces Index

**File**: `lib/services/interfaces/index.ts`

```typescript
export * from './IPasswordService'
export * from './IAuthService'
export * from './IPaymentService'
```

### Step 5: Verify Everything Compiles (5 minutes)

```bash
# Check for TypeScript errors
npm run build

# Or just type check
npx tsc --noEmit
```

Expected: **Zero errors** (only interfaces, no implementations yet)

---

## ✅ Completion Checklist

After completing Phase 1, you should have:

- [ ] 5 repository interface files created
- [ ] 3 service interface files created
- [ ] 2 index files created
- [ ] Zero TypeScript compilation errors
- [ ] No changes to existing functionality
- [ ] All interfaces properly documented

**Total Files Created**: 10 files
**Total Lines of Code**: ~400-500 lines

---

## 🧪 How to Verify Success

### 1. TypeScript Compilation

```bash
npm run build
# Should succeed with no errors
```

### 2. Import Interfaces in Any File (Test)

Create a test file to verify imports work:

**File**: `lib/test-imports.ts` (delete after testing)

```typescript
import {
  IUserRepository,
  IEventRepository,
  ICourseRepository,
} from './repositories/interfaces'

import {
  IPasswordService,
  IAuthService,
  IPaymentService,
} from './services/interfaces'

// If this file compiles without errors, Phase 1 is successful!
console.log('All interfaces imported successfully')
```

```bash
npx tsc lib/test-imports.ts
# Should compile without errors
rm lib/test-imports.ts
```

### 3. Git Check

```bash
git status
# Should show 10 new files

git add .
git commit -m "feat: Phase 1 - Add repository and service interfaces (SOLID refactoring)"
```

---

## 🎓 Understanding What You Built

### Repository Interfaces

These define **what data operations** are available, without specifying **how** they work.

**Benefits**:
- Swap Prisma for another ORM later (MongoDB, TypeORM, etc.)
- Easy to mock for testing
- Clear contract for data access

### Service Interfaces

These define **what business operations** are available.

**Benefits**:
- Can change implementation (bcrypt → argon2, Stripe → Paddle)
- Easy to test business logic
- Clear separation of concerns

---

## 🚀 Next Steps

After Phase 1 completion:

1. **Update Progress Tracker**:
   ```markdown
   Phase 1: ✅ Complete
   Started: [DATE]
   Completed: [DATE]
   ```

2. **Review with Team**:
   - Show the interface files
   - Explain the abstractions
   - Answer questions

3. **Move to Phase 2**:
   - Implement PasswordService
   - Implement AuthService
   - Implement UserService

---

## ❓ Common Questions

### Q: Why create interfaces if we only have one implementation?

**A**: Even with one implementation, interfaces provide:
- Clear contracts
- Better testability
- Future flexibility
- Self-documenting code

### Q: Isn't this over-engineering for a small app?

**A**: Phase 1 is minimal - just type definitions. It's low risk and sets up future phases. You can stop after any phase if it feels like too much.

### Q: Can I deploy Phase 1 to production?

**A**: Yes! Phase 1 doesn't change any functionality - it just adds unused interfaces. Zero risk.

### Q: How long will this really take?

**A**: For one developer:
- Experienced: 2-3 hours
- Moderate: 4-5 hours
- Learning: 6-8 hours

---

## 🆘 Troubleshooting

### Issue: TypeScript errors about Prisma types

**Solution**: Regenerate Prisma client
```bash
npx prisma generate
```

### Issue: Import paths not working

**Solution**: Check `tsconfig.json` has correct paths
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Types seem redundant with Prisma

**Solution**: That's intentional! Repository interfaces are separate from ORM types for flexibility.

---

## 📚 Additional Resources

- [Repository Pattern Explained](https://martinfowler.com/eaaCatalog/repository.html)
- [Interface Segregation Principle](https://stackify.com/interface-segregation-principle/)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)

---

**Ready?** Start with Step 1 and work through sequentially. Good luck! 🚀
