// Repository exports for easy importing
export * from './interfaces'

// Prisma Implementations
export { PrismaUserRepository, userRepository } from './PrismaUserRepository'
export {
  PrismaSubscriptionRepository,
  subscriptionRepository,
} from './PrismaSubscriptionRepository'
export { PrismaEventRepository, eventRepository } from './PrismaEventRepository'
export {
  PrismaCourseRepository,
  courseRepository,
} from './PrismaCourseRepository'
export {
  PrismaServiceRepository,
  serviceRepository,
} from './PrismaServiceRepository'

// Repository collection for convenience
export const repositories = {
  user: userRepository,
  subscription: subscriptionRepository,
  event: eventRepository,
  course: courseRepository,
  service: serviceRepository,
}
