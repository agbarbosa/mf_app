import { prisma } from '@/lib/prisma'
import {
  IUserRepository,
  UserWithSubscription,
  CreateUserData,
  UpdateUserData,
} from './interfaces/IUserRepository'

/**
 * Prisma implementation of IUserRepository
 * Handles all user data access operations using Prisma ORM
 */
export class PrismaUserRepository implements IUserRepository {
  /**
   * Find user by unique ID with subscription data
   * @param id - User ID
   * @returns User with subscription or null if not found
   */
  async findById(id: string): Promise<UserWithSubscription | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    })
  }

  /**
   * Find user by unique email with subscription data
   * @param email - User email
   * @returns User with subscription or null if not found
   */
  async findByEmail(email: string): Promise<UserWithSubscription | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    })
  }

  /**
   * Create new user with free subscription
   * @param data - User creation data
   * @returns Created user with subscription
   */
  async create(data: CreateUserData): Promise<UserWithSubscription> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        image: data.image,
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      include: { subscription: true },
    })
  }

  /**
   * Update existing user
   * @param id - User ID
   * @param data - Update data (partial)
   * @returns Updated user
   */
  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        image: data.image,
      },
    })
  }

  /**
   * Delete user by ID
   * @param id - User ID
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }
}

// Export singleton instance
export const userRepository = new PrismaUserRepository()
