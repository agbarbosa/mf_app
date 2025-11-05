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
