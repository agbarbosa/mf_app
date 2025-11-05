# SOLID Principles Refactoring Plan

**Project**: Mentor Futuro Subscription Platform
**Created**: 2025-11-05
**Status**: Planning Phase
**Estimated Duration**: 6 Phases over 4-6 weeks

---

## 🎯 Goals

1. Improve code maintainability and testability
2. Reduce coupling between components
3. Enable easier feature additions and modifications
4. Follow SOLID principles without over-engineering
5. Maintain backward compatibility during migration

---

## 📋 Phased Approach

Each phase is independently deployable and testable. Phases can be deployed to production incrementally.

---

## Phase 1: Foundation & Abstractions (Week 1)

**Goal**: Create foundational abstractions and interfaces without breaking existing code.

**Estimated Time**: 3-4 days

### Tasks

#### 1.1 Create Repository Interfaces
**Files to Create**:
- `lib/repositories/interfaces/IUserRepository.ts`
- `lib/repositories/interfaces/ISubscriptionRepository.ts`
- `lib/repositories/interfaces/IEventRepository.ts`
- `lib/repositories/interfaces/ICourseRepository.ts`
- `lib/repositories/interfaces/IServiceRepository.ts`

**Example Structure**:
```typescript
// lib/repositories/interfaces/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}
```

#### 1.2 Create Service Interfaces
**Files to Create**:
- `lib/services/interfaces/IPasswordService.ts`
- `lib/services/interfaces/IAuthService.ts`
- `lib/services/interfaces/IPaymentService.ts`

**Example Structure**:
```typescript
// lib/services/interfaces/IPasswordService.ts
export interface IPasswordService {
  hash(password: string): Promise<string>
  compare(password: string, hash: string): Promise<boolean>
}
```

#### 1.3 Create Type Definitions
**Files to Create**:
- `types/repositories.ts` - DTOs for repository methods
- `types/services.ts` - DTOs for service methods

### Success Criteria
- [ ] All interfaces defined with TypeScript
- [ ] No breaking changes to existing code
- [ ] Documentation added for each interface
- [ ] Code compiles without errors

### Testing
- No tests needed yet (only interfaces)
- Verify TypeScript compilation

---

## Phase 2: Service Layer Introduction (Week 1-2)

**Goal**: Extract business logic into service classes, starting with simpler services.

**Estimated Time**: 4-5 days

### Tasks

#### 2.1 Implement PasswordService
**File to Create**: `lib/services/PasswordService.ts`

```typescript
import { hash, compare } from 'bcryptjs'
import { IPasswordService } from './interfaces/IPasswordService'

export class PasswordService implements IPasswordService {
  constructor(private saltRounds: number = 12) {}

  async hash(password: string): Promise<string> {
    return hash(password, this.saltRounds)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
  }
}

// Export singleton instance
export const passwordService = new PasswordService()
```

**Files to Update**:
- `app/api/auth/signup/route.ts` - Use `passwordService.hash()`
- `lib/auth.ts` - Use `passwordService.compare()`

#### 2.2 Implement AuthService
**File to Create**: `lib/services/AuthService.ts`

Extract logic from `lib/auth.ts` authorize function.

```typescript
export class AuthService implements IAuthService {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: IPasswordService
  ) {}

  async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) return null

    const isValid = await this.passwordService.compare(password, user.password)
    if (!isValid) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }
  }
}
```

**Files to Update**:
- `lib/auth.ts` - Call `authService.authenticate()`

#### 2.3 Implement UserService
**File to Create**: `lib/services/UserService.ts`

```typescript
export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: IPasswordService
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    // Check if user exists
    const existing = await this.userRepo.findByEmail(data.email)
    if (existing) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password)

    // Create user
    return this.userRepo.create({
      ...data,
      password: hashedPassword,
    })
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id)
  }
}
```

**Files to Update**:
- `app/api/auth/signup/route.ts` - Use `userService.createUser()`

### Success Criteria
- [ ] PasswordService implemented and tested
- [ ] AuthService implemented and tested
- [ ] UserService implemented and tested
- [ ] All existing API routes still work
- [ ] No regressions in functionality

### Testing
```bash
# Create test files
- lib/services/__tests__/PasswordService.test.ts
- lib/services/__tests__/AuthService.test.ts
- lib/services/__tests__/UserService.test.ts
```

### Rollback Plan
Services are additive - can simply revert to direct imports if issues arise.

---

## Phase 3: Repository Pattern Implementation (Week 2-3)

**Goal**: Abstract all Prisma database calls behind repository interfaces.

**Estimated Time**: 5-6 days

### Tasks

#### 3.1 Implement PrismaUserRepository
**File to Create**: `lib/repositories/PrismaUserRepository.ts`

```typescript
import { prisma } from '@/lib/prisma'
import { IUserRepository } from './interfaces/IUserRepository'
import { User, CreateUserData, UpdateUserData } from '@/types/repositories'

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    })
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

// Export singleton
export const userRepository = new PrismaUserRepository()
```

#### 3.2 Implement Other Repositories
**Files to Create**:
- `lib/repositories/PrismaSubscriptionRepository.ts`
- `lib/repositories/PrismaEventRepository.ts`
- `lib/repositories/PrismaCourseRepository.ts`
- `lib/repositories/PrismaServiceRepository.ts`

**Pattern**: Follow same structure as UserRepository

#### 3.3 Create Repository Factory
**File to Create**: `lib/repositories/index.ts`

```typescript
import { userRepository } from './PrismaUserRepository'
import { subscriptionRepository } from './PrismaSubscriptionRepository'
import { eventRepository } from './PrismaEventRepository'
import { courseRepository } from './PrismaCourseRepository'
import { serviceRepository } from './PrismaServiceRepository'

export const repositories = {
  user: userRepository,
  subscription: subscriptionRepository,
  event: eventRepository,
  course: courseRepository,
  service: serviceRepository,
}

export * from './interfaces/IUserRepository'
export * from './interfaces/ISubscriptionRepository'
export * from './interfaces/IEventRepository'
export * from './interfaces/ICourseRepository'
export * from './interfaces/IServiceRepository'
```

#### 3.4 Update Services to Use Repositories
**Files to Update**:
- `lib/services/AuthService.ts` - Inject userRepository
- `lib/services/UserService.ts` - Inject userRepository
- All other services created in Phase 2

#### 3.5 Gradually Migrate API Routes
**Migration Order** (one at a time):
1. `app/api/auth/signup/route.ts` ✓
2. `lib/auth.ts` (authorize function) ✓
3. `app/api/events/route.ts`
4. `app/api/courses/route.ts`
5. `app/api/services/route.ts`
6. `app/api/webhooks/stripe/route.ts`

### Success Criteria
- [ ] All repository implementations complete
- [ ] All services use repositories instead of direct Prisma
- [ ] At least 3 API routes migrated
- [ ] Full test coverage for repositories
- [ ] No database-related regressions

### Testing
```bash
# Integration tests with test database
- lib/repositories/__tests__/PrismaUserRepository.test.ts
- lib/repositories/__tests__/PrismaEventRepository.test.ts
# etc...
```

### Rollback Plan
Keep old Prisma calls commented out until full migration verified.

---

## Phase 4: Webhook Refactoring (Week 3)

**Goal**: Refactor webhook handler to use Strategy pattern for extensibility.

**Estimated Time**: 3-4 days

### Tasks

#### 4.1 Create Webhook Handler Interface
**File to Create**: `lib/webhooks/interfaces/IWebhookHandler.ts`

```typescript
import Stripe from 'stripe'

export interface IWebhookHandler {
  handle(event: Stripe.Event): Promise<void>
  canHandle(eventType: string): boolean
}
```

#### 4.2 Implement Individual Handlers
**Files to Create**:
- `lib/webhooks/handlers/CheckoutCompletedHandler.ts`
- `lib/webhooks/handlers/InvoicePaymentSucceededHandler.ts`
- `lib/webhooks/handlers/SubscriptionDeletedHandler.ts`

**Example**:
```typescript
// lib/webhooks/handlers/CheckoutCompletedHandler.ts
import { IWebhookHandler } from '../interfaces/IWebhookHandler'
import { ISubscriptionRepository } from '@/lib/repositories'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

export class CheckoutCompletedHandler implements IWebhookHandler {
  constructor(private subscriptionRepo: ISubscriptionRepository) {}

  canHandle(eventType: string): boolean {
    return eventType === 'checkout.session.completed'
  }

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    await this.subscriptionRepo.update(
      session.metadata?.userId!,
      {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        tier: 'PREMIUM',
        status: 'ACTIVE',
      }
    )
  }
}
```

#### 4.3 Create Webhook Router
**File to Create**: `lib/webhooks/WebhookRouter.ts`

```typescript
import { IWebhookHandler } from './interfaces/IWebhookHandler'
import Stripe from 'stripe'

export class WebhookRouter {
  private handlers: IWebhookHandler[] = []

  register(handler: IWebhookHandler): void {
    this.handlers.push(handler)
  }

  async route(event: Stripe.Event): Promise<void> {
    const handler = this.handlers.find(h => h.canHandle(event.type))

    if (!handler) {
      console.warn(`No handler found for event type: ${event.type}`)
      return
    }

    await handler.handle(event)
  }
}
```

#### 4.4 Update Webhook Route
**File to Update**: `app/api/webhooks/stripe/route.ts`

```typescript
import { WebhookRouter } from '@/lib/webhooks/WebhookRouter'
import { CheckoutCompletedHandler } from '@/lib/webhooks/handlers/CheckoutCompletedHandler'
import { InvoicePaymentSucceededHandler } from '@/lib/webhooks/handlers/InvoicePaymentSucceededHandler'
import { SubscriptionDeletedHandler } from '@/lib/webhooks/handlers/SubscriptionDeletedHandler'
import { repositories } from '@/lib/repositories'

const router = new WebhookRouter()
router.register(new CheckoutCompletedHandler(repositories.subscription))
router.register(new InvoicePaymentSucceededHandler(repositories.subscription))
router.register(new SubscriptionDeletedHandler(repositories.subscription))

export async function POST(req: Request) {
  // ... signature verification ...

  await router.route(event)

  return NextResponse.json({ received: true })
}
```

### Success Criteria
- [ ] All webhook handlers extracted to separate classes
- [ ] WebhookRouter implemented and working
- [ ] Easy to add new webhook event types
- [ ] Webhook functionality unchanged
- [ ] Tests for each handler

### Testing
```bash
# Unit tests with mocked Stripe events
- lib/webhooks/handlers/__tests__/CheckoutCompletedHandler.test.ts
- lib/webhooks/handlers/__tests__/InvoicePaymentSucceededHandler.test.ts
- lib/webhooks/__tests__/WebhookRouter.test.ts
```

### Rollback Plan
Keep old webhook handler code commented in route file.

---

## Phase 5: Access Control & Permissions (Week 4)

**Goal**: Create flexible, configuration-driven access control system.

**Estimated Time**: 4-5 days

### Tasks

#### 5.1 Create Permission Strategy Interface
**File to Create**: `lib/authorization/interfaces/IPermissionStrategy.ts`

```typescript
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export interface IPermissionStrategy {
  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    resourceRequirements?: ResourceRequirements
  ): boolean

  getName(): string
}

export interface ResourceRequirements {
  requiresPremium?: boolean
  requiredTier?: SubscriptionTier
  customCheck?: (tier?: SubscriptionTier, status?: SubscriptionStatus) => boolean
}
```

#### 5.2 Implement Permission Strategies
**Files to Create**:
- `lib/authorization/strategies/PremiumAccessStrategy.ts`
- `lib/authorization/strategies/FreeAccessStrategy.ts`
- `lib/authorization/strategies/TierBasedStrategy.ts`

**Example**:
```typescript
// lib/authorization/strategies/PremiumAccessStrategy.ts
export class PremiumAccessStrategy implements IPermissionStrategy {
  getName(): string {
    return 'premium-access'
  }

  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    requirements?: ResourceRequirements
  ): boolean {
    if (!requirements?.requiresPremium) {
      return true
    }

    return (
      userTier === SubscriptionTier.PREMIUM &&
      userStatus === SubscriptionStatus.ACTIVE
    )
  }
}
```

#### 5.3 Create Authorization Service
**File to Create**: `lib/authorization/AuthorizationService.ts`

```typescript
import { IPermissionStrategy } from './interfaces/IPermissionStrategy'
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

export class AuthorizationService {
  private strategies: Map<string, IPermissionStrategy> = new Map()
  private defaultStrategy: IPermissionStrategy

  constructor(defaultStrategy: IPermissionStrategy) {
    this.defaultStrategy = defaultStrategy
    this.registerStrategy(defaultStrategy)
  }

  registerStrategy(strategy: IPermissionStrategy): void {
    this.strategies.set(strategy.getName(), strategy)
  }

  canAccess(
    userTier?: SubscriptionTier,
    userStatus?: SubscriptionStatus,
    resourceRequirements?: ResourceRequirements,
    strategyName?: string
  ): boolean {
    const strategy = strategyName
      ? this.strategies.get(strategyName)
      : this.defaultStrategy

    if (!strategy) {
      throw new Error(`Strategy not found: ${strategyName}`)
    }

    return strategy.canAccess(userTier, userStatus, resourceRequirements)
  }
}

// Export singleton
export const authorizationService = new AuthorizationService(
  new PremiumAccessStrategy()
)
```

#### 5.4 Create Authorization Utilities
**File to Create**: `lib/authorization/utils.ts`

```typescript
import { authorizationService } from './AuthorizationService'
import { Session } from 'next-auth'

export function checkResourceAccess(
  session: Session | null,
  requiresPremium: boolean
): boolean {
  return authorizationService.canAccess(
    session?.user?.subscription?.tier,
    session?.user?.subscription?.status,
    { requiresPremium }
  )
}

export function filterByAccess<T extends { isPremiumOnly: boolean }>(
  items: T[],
  session: Session | null
): T[] {
  return items.filter(item =>
    checkResourceAccess(session, item.isPremiumOnly)
  )
}
```

#### 5.5 Update API Routes
**Files to Update**:
- `app/api/events/route.ts` - Use `checkResourceAccess()`
- `app/api/courses/route.ts` - Use `checkResourceAccess()`
- Remove direct `isPremium` checks

**Before**:
```typescript
const isPremium =
  session.user.subscription?.tier === 'PREMIUM' &&
  session.user.subscription?.status === 'ACTIVE'
```

**After**:
```typescript
import { checkResourceAccess } from '@/lib/authorization/utils'

const canAccessPremium = checkResourceAccess(session, true)
```

#### 5.6 Deprecate Old Utility
**File to Update**: `lib/utils/subscription.ts`

Add deprecation notice, keep for backward compatibility:
```typescript
/**
 * @deprecated Use authorizationService.canAccess() instead
 */
export function hasAccess(...) { ... }
```

### Success Criteria
- [ ] Authorization service implemented
- [ ] Multiple strategies available
- [ ] All routes use new authorization system
- [ ] Easy to add new permission rules
- [ ] Backward compatible

### Testing
```bash
- lib/authorization/__tests__/AuthorizationService.test.ts
- lib/authorization/strategies/__tests__/PremiumAccessStrategy.test.ts
```

---

## Phase 6: Dependency Injection & Final Cleanup (Week 5-6)

**Goal**: Implement DI container for better testability and complete the migration.

**Estimated Time**: 5-7 days

### Tasks

#### 6.1 Install DI Library
```bash
npm install tsyringe reflect-metadata
npm install --save-dev @types/node
```

#### 6.2 Setup DI Container
**File to Create**: `lib/di/container.ts`

```typescript
import 'reflect-metadata'
import { container } from 'tsyringe'

// Register repositories
import { PrismaUserRepository } from '@/lib/repositories/PrismaUserRepository'
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'

container.register<IUserRepository>('IUserRepository', {
  useClass: PrismaUserRepository,
})

// Register services
import { PasswordService } from '@/lib/services/PasswordService'
import { IPasswordService } from '@/lib/services/interfaces/IPasswordService'

container.register<IPasswordService>('IPasswordService', {
  useClass: PasswordService,
})

// ... register all other services and repositories

export { container }
```

#### 6.3 Update Services with DI Decorators
**Example**: `lib/services/UserService.ts`

```typescript
import { injectable, inject } from 'tsyringe'

@injectable()
export class UserService {
  constructor(
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IPasswordService') private passwordService: IPasswordService
  ) {}

  // ... methods
}
```

#### 6.4 Update API Routes to Use Container
**Example**: `app/api/auth/signup/route.ts`

```typescript
import { container } from '@/lib/di/container'
import { UserService } from '@/lib/services/UserService'

export async function POST(req: Request) {
  const userService = container.resolve(UserService)
  // ... use service
}
```

#### 6.5 Create Service Factory Pattern (Alternative to DI)
**File to Create**: `lib/factories/ServiceFactory.ts`

If DI is too complex, use factory pattern:

```typescript
import { repositories } from '@/lib/repositories'
import { UserService } from '@/lib/services/UserService'
import { PasswordService } from '@/lib/services/PasswordService'
import { AuthService } from '@/lib/services/AuthService'

const passwordService = new PasswordService()

export class ServiceFactory {
  static createUserService(): UserService {
    return new UserService(
      repositories.user,
      passwordService
    )
  }

  static createAuthService(): AuthService {
    return new AuthService(
      repositories.user,
      passwordService
    )
  }
}
```

#### 6.6 Update Stripe Integration
**File to Create**: `lib/services/PaymentService.ts`

Abstract Stripe behind interface:

```typescript
import { IPaymentService } from './interfaces/IPaymentService'
import { stripe } from '@/lib/stripe'

export class StripePaymentService implements IPaymentService {
  async createCheckoutSession(
    userId: string,
    email: string,
    priceId: string
  ): Promise<{ url: string }> {
    const session = await stripe.checkout.sessions.create({
      // ... configuration
    })
    return { url: session.url! }
  }

  async createPortalSession(customerId: string): Promise<{ url: string }> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
    return { url: session.url }
  }
}
```

**Files to Update**:
- `app/api/subscription/checkout/route.ts` - Use PaymentService
- `lib/stripe.ts` - Keep as internal implementation detail

#### 6.7 Add Comprehensive Tests
**Create Test Suite**:
- Integration tests for complete flows
- E2E tests for critical paths
- Mock all external dependencies (Stripe, Prisma)

```bash
# Test structure
__tests__/
├── integration/
│   ├── auth.test.ts
│   ├── subscription.test.ts
│   └── events.test.ts
├── e2e/
│   ├── signup-flow.test.ts
│   └── subscription-flow.test.ts
└── setup/
    ├── test-db.ts
    └── mocks.ts
```

#### 6.8 Documentation Update
**Files to Create/Update**:
- `docs/ARCHITECTURE.md` - Document new architecture
- `docs/TESTING.md` - Testing guide
- `docs/CONTRIBUTING.md` - How to add features
- Update `README.md` - Add architecture section

#### 6.9 Code Cleanup
**Tasks**:
- Remove old commented code
- Remove deprecated utilities
- Update all imports to use new paths
- Run linter and fix issues
- Update TypeScript strict mode if not enabled

### Success Criteria
- [ ] DI container working across application
- [ ] All services injected properly
- [ ] 80%+ test coverage
- [ ] All documentation updated
- [ ] No deprecated code remaining
- [ ] Production deployment successful

### Testing
- Full regression test suite
- Load testing for performance
- Security audit

---

## 📊 Success Metrics

Track these metrics throughout refactoring:

### Code Quality
- [ ] Test Coverage: Target 80%+
- [ ] TypeScript Strict Mode: Enabled
- [ ] Linter Warnings: 0
- [ ] Code Duplication: <5%

### SOLID Compliance
- [ ] SRP Violations: 0 critical
- [ ] OCP Violations: 0 critical
- [ ] DIP Violations: 0 (all abstractions in place)

### Performance
- [ ] API Response Time: No regression (±5%)
- [ ] Database Query Count: Reduced or same
- [ ] Bundle Size: No significant increase

### Developer Experience
- [ ] New Feature Development: 30% faster
- [ ] Test Writing: 50% easier
- [ ] Bug Fix Time: 40% faster

---

## 🔄 Migration Checklist

Use this checklist to track progress:

### Phase 1: Foundation ✓
- [ ] Repository interfaces created
- [ ] Service interfaces created
- [ ] Type definitions created

### Phase 2: Services ✓
- [ ] PasswordService implemented
- [ ] AuthService implemented
- [ ] UserService implemented
- [ ] Unit tests written

### Phase 3: Repositories ✓
- [ ] PrismaUserRepository
- [ ] PrismaSubscriptionRepository
- [ ] PrismaEventRepository
- [ ] PrismaCourseRepository
- [ ] PrismaServiceRepository
- [ ] All API routes migrated
- [ ] Integration tests written

### Phase 4: Webhooks ✓
- [ ] Webhook handlers extracted
- [ ] WebhookRouter implemented
- [ ] Route updated
- [ ] Tests written

### Phase 5: Authorization ✓
- [ ] Permission strategies created
- [ ] AuthorizationService implemented
- [ ] API routes updated
- [ ] Tests written

### Phase 6: DI & Cleanup ✓
- [ ] DI container setup
- [ ] Services updated with decorators
- [ ] Routes using container
- [ ] PaymentService abstracted
- [ ] Tests comprehensive
- [ ] Documentation complete
- [ ] Code cleaned up

---

## ⚠️ Risk Management

### Identified Risks

1. **Breaking Changes**
   - Mitigation: Incremental deployment, feature flags
   - Rollback: Keep old code until verified

2. **Performance Degradation**
   - Mitigation: Benchmark each phase
   - Rollback: Quick revert via Git

3. **Test Coverage Gaps**
   - Mitigation: Write tests before refactoring
   - Rollback: Don't deploy without tests

4. **Team Learning Curve**
   - Mitigation: Documentation and pair programming
   - Support: Code reviews and knowledge sharing

### Rollback Strategy
Each phase has isolated changes that can be rolled back independently:
```bash
# Example rollback
git revert <commit-hash-of-phase>
npm run build
npm run test
# Deploy previous version
```

---

## 📅 Timeline

| Phase | Duration | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| Phase 1 | 3-4 days | None | Immediately |
| Phase 2 | 4-5 days | Phase 1 | Phase 1 complete |
| Phase 3 | 5-6 days | Phase 2 | Phase 2 complete |
| Phase 4 | 3-4 days | Phase 3 | Phase 3 at 50% |
| Phase 5 | 4-5 days | Phase 3 | Phase 3 complete |
| Phase 6 | 5-7 days | All previous | All phases at 80% |

**Total Estimated Time**: 24-31 days (4-6 weeks)

### Parallel Work Opportunities
- Phases 4 and 5 can be done in parallel after Phase 3 reaches 50%
- Testing can be written alongside each phase
- Documentation can be written concurrently

---

## 🎓 Learning Resources

### For the Team

1. **SOLID Principles**
   - [Uncle Bob's SOLID Principles](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
   - [SOLID in TypeScript](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)

2. **Repository Pattern**
   - [Martin Fowler: Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

3. **Dependency Injection**
   - [TSyringe Documentation](https://github.com/microsoft/tsyringe)
   - [DI in TypeScript](https://khalilstemmler.com/articles/tutorials/dependency-injection-inversion-explained/)

4. **Testing**
   - [Testing with Prisma](https://www.prisma.io/docs/guides/testing/unit-testing)
   - [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 📞 Support & Questions

During implementation, reference this plan and:
1. Check the current phase checklist
2. Review success criteria
3. Run tests after each change
4. Document any deviations from plan
5. Update this document with learnings

---

## 📝 Notes

- This plan is flexible - adjust based on learnings
- Prioritize quality over speed
- Each phase should be production-ready
- Don't skip testing
- Keep stakeholders informed of progress

**Last Updated**: 2025-11-05
**Next Review**: After Phase 1 completion
