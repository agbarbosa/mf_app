import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'
import { IPasswordService } from './interfaces/IPasswordService'
import { passwordService } from './PasswordService'

/**
 * User service
 * Handles user management and business logic
 *
 * Note: Currently uses Prisma directly. Will be refactored to use
 * IUserRepository in Phase 3 for better testability and decoupling.
 */

export interface CreateUserDto {
  email: string
  name: string
  password: string
  image?: string | null
}

export interface UserWithoutPassword {
  id: string
  email: string
  name: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export class UserService {
  constructor(private passwordService: IPasswordService) {}

  /**
   * Create a new user with free subscription
   * @param data - User creation data
   * @returns Created user without password
   * @throws Error if user already exists
   */
  async createUser(data: CreateUserDto): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password)

    // Create user with free subscription
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        image: data.image,
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
    })

    // Return user without password
    return this.sanitizeUser(user)
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User without password, or null if not found
   */
  async getUserById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return this.sanitizeUser(user)
  }

  /**
   * Get user by email
   * @param email - User email
   * @returns User without password, or null if not found
   */
  async getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return this.sanitizeUser(user)
  }

  /**
   * Update user
   * @param id - User ID
   * @param data - Update data (partial)
   * @returns Updated user without password
   */
  async updateUser(
    id: string,
    data: Partial<CreateUserDto>
  ): Promise<UserWithoutPassword> {
    const updateData: any = {
      email: data.email,
      name: data.name,
      image: data.image,
    }

    // If password is being updated, hash it
    if (data.password) {
      updateData.password = await this.passwordService.hash(data.password)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return this.sanitizeUser(user)
  }

  /**
   * Delete user
   * @param id - User ID
   */
  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  /**
   * Remove password from user object
   * @param user - User with password
   * @returns User without password
   */
  private sanitizeUser(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

// Export singleton instance
export const userService = new UserService(passwordService)
