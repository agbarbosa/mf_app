import { hash, compare } from 'bcryptjs'
import { IPasswordService } from './interfaces/IPasswordService'

/**
 * Password service using bcrypt for hashing
 * Implements secure password hashing and comparison
 */
export class PasswordService implements IPasswordService {
  private readonly saltRounds: number

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds
  }

  /**
   * Hash a plain text password using bcrypt
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    return hash(password, this.saltRounds)
  }

  /**
   * Compare a plain text password with a hash
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if password matches hash
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword)
  }
}

// Export singleton instance with default salt rounds
export const passwordService = new PasswordService()
