// Repository exports for easy importing
export * from './interfaces'

// Prisma Implementations
export { PrismaUserRepository } from './PrismaUserRepository'
export { PrismaSubscriptionRepository } from './PrismaSubscriptionRepository'
export { PrismaEventRepository } from './PrismaEventRepository'
export { PrismaCourseRepository } from './PrismaCourseRepository'
export { PrismaServiceRepository } from './PrismaServiceRepository'

// Repository instances
export { userRepository } from './PrismaUserRepository'
export { subscriptionRepository } from './PrismaSubscriptionRepository'
export { eventRepository } from './PrismaEventRepository'
export { courseRepository } from './PrismaCourseRepository'
export { serviceRepository } from './PrismaServiceRepository'

// Repository collection for convenience
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
