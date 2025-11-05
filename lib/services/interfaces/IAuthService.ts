export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  image?: string | null
}

export interface IAuthService {
  /**
   * Authenticate user with email and password
   * Returns user data if successful, null otherwise
   */
  authenticate(email: string, password: string): Promise<AuthenticatedUser | null>

  /**
   * Validate session token
   */
  validateSession(token: string): Promise<AuthenticatedUser | null>
}
