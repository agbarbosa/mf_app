import { Session } from 'next-auth'

/**
 * Create mock session for testing
 */
export const createMockSession = (overrides: {
  tier?: string
  status?: string
  userId?: string
  email?: string
  name?: string
} = {}): Session => {
  return {
    user: {
      id: overrides.userId || 'test-user-id',
      email: overrides.email || 'test@example.com',
      name: overrides.name || 'Test User',
      subscription: {
        tier: overrides.tier || 'FREE',
        status: overrides.status || 'ACTIVE',
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
    tier: 'PREMIUM',
    status: 'ACTIVE',
  })
}

/**
 * Create mock free session
 */
export const createMockFreeSession = (): Session => {
  return createMockSession({
    tier: 'FREE',
    status: 'ACTIVE',
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
    tier: 'FREE',
    status: 'ACTIVE',
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

/**
 * Create mock service
 */
export const createMockService = (overrides: any = {}) => ({
  id: 'test-service-id',
  userId: 'test-user-id',
  title: 'Test Service',
  description: 'Test service description',
  category: 'CONSULTING',
  imageUrl: 'https://example.com/service.jpg',
  contactEmail: 'service@example.com',
  contactPhone: '+1234567890',
  isPremiumOnly: false,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
