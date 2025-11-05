import { IAuthService, AuthenticatedUser } from './interfaces/IAuthService'
import { IPasswordService } from './interfaces/IPasswordService'
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'
import { passwordService } from './PasswordService'
import { userRepository } from '@/lib/repositories'

/**
 * Authentication service
 * Handles user authentication and session validation
 *
 * Phase 3: Now uses IUserRepository for data access (decoupled from Prisma)
 */
export class AuthService implements IAuthService {
  constructor(
    private passwordService: IPasswordService,
    private userRepository: IUserRepository
  ) {}

  /**
   * Authenticate user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns Authenticated user data or null if authentication fails
   */
  async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticatedUser | null> {
    // Validate inputs
    if (!email || !password) {
      return null
    }

    // Find user by email using repository
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return null
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return null
    }

    // Return authenticated user (without sensitive data)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }
  }

  /**
   * Validate session token
   * @param token - Session token to validate
   * @returns User data if valid, null otherwise
   *
   * Note: This is a placeholder for future JWT validation.
   * Currently not implemented as NextAuth handles session validation.
   */
  async validateSession(token: string): Promise<AuthenticatedUser | null> {
    // Placeholder - NextAuth handles this currently
    // Will implement when we add custom JWT validation
    throw new Error('validateSession not implemented - use NextAuth session')
  }
}

// Export singleton instance
export const authService = new AuthService(passwordService, userRepository)
