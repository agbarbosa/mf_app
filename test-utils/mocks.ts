import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'
import { ISubscriptionRepository } from '@/lib/repositories/interfaces/ISubscriptionRepository'
import { IEventRepository } from '@/lib/repositories/interfaces/IEventRepository'
import { ICourseRepository } from '@/lib/repositories/interfaces/ICourseRepository'
import { IServiceRepository } from '@/lib/repositories/interfaces/IServiceRepository'
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
 * Create mock SubscriptionRepository
 */
export const createMockSubscriptionRepository = (): jest.Mocked<ISubscriptionRepository> => ({
  findByUserId: jest.fn(),
  findByStripeSubscriptionId: jest.fn(),
  update: jest.fn(),
  updateByStripeSubscriptionId: jest.fn(),
  cancel: jest.fn(),
})

/**
 * Create mock EventRepository
 */
export const createMockEventRepository = (): jest.Mocked<IEventRepository> => ({
  findAll: jest.fn(),
  findFreeEvents: jest.fn(),
  findByStatus: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  registerUser: jest.fn(),
  unregisterUser: jest.fn(),
})

/**
 * Create mock CourseRepository
 */
export const createMockCourseRepository = (): jest.Mocked<ICourseRepository> => ({
  findAll: jest.fn(),
  findAllPublished: jest.fn(),
  findPublishedFreeCourses: jest.fn(),
  findByPublishedStatus: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  enrollUser: jest.fn(),
})

/**
 * Create mock ServiceRepository
 */
export const createMockServiceRepository = (): jest.Mocked<IServiceRepository> => ({
  findAll: jest.fn(),
  findAllPublished: jest.fn(),
  findPublishedFreeServices: jest.fn(),
  findByCategory: jest.fn(),
  findById: jest.fn(),
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
  validateSession: jest.fn(),
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
  eventRegistration: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  courseEnrollment: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
})
