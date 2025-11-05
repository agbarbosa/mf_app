// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom'

// Mock Prisma enums
jest.mock('@prisma/client', () => ({
  SubscriptionTier: {
    FREE: 'FREE',
    PREMIUM: 'PREMIUM',
  },
  SubscriptionStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    CANCELED: 'CANCELED',
    PAST_DUE: 'PAST_DUE',
  },
  EventStatus: {
    UPCOMING: 'UPCOMING',
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
  },
  PrismaClient: jest.fn().mockImplementation(() => ({
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
  })),
}))

// Mock repository singletons
jest.mock('@/lib/repositories', () => {
  const mockRepo = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  return {
    userRepository: mockRepo,
    subscriptionRepository: {
      findByUserId: jest.fn(),
      update: jest.fn(),
      updateStripeCustomerId: jest.fn(),
    },
    eventRepository: {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      registerUser: jest.fn(),
    },
    courseRepository: {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPublishedStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      enrollUser: jest.fn(),
    },
    serviceRepository: {
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    repositories: {},
  }
})

