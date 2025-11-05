import { AuthService } from '../AuthService'
import { IPasswordService } from '../interfaces/IPasswordService'
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'
import { createMockPasswordService, createMockUserRepository } from '@/test-utils/mocks'
import { createMockUser } from '@/test-utils/factories'

describe('AuthService', () => {
  let authService: AuthService
  let mockPasswordService: jest.Mocked<IPasswordService>
  let mockUserRepository: jest.Mocked<IUserRepository>

  beforeEach(() => {
    mockPasswordService = createMockPasswordService()
    mockUserRepository = createMockUserRepository()
    authService = new AuthService(mockPasswordService, mockUserRepository)
  })

  describe('authenticate', () => {
    const validEmail = 'test@example.com'
    const validPassword = 'password123'
    const hashedPassword = '$2a$12$hashedPassword'

    it('should return user data when credentials are valid', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, validPassword)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
      })
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validEmail)
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        validPassword,
        hashedPassword
      )
    })

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      const result = await authService.authenticate(validEmail, validPassword)

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validEmail)
      expect(mockPasswordService.compare).not.toHaveBeenCalled()
    })

    it('should return null when password is invalid', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(false)

      const result = await authService.authenticate(validEmail, 'wrongPassword')

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validEmail)
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        'wrongPassword',
        hashedPassword
      )
    })

    it('should return null when email is empty', async () => {
      const result = await authService.authenticate('', validPassword)

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled()
      expect(mockPasswordService.compare).not.toHaveBeenCalled()
    })

    it('should return null when password is empty', async () => {
      const result = await authService.authenticate(validEmail, '')

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled()
      expect(mockPasswordService.compare).not.toHaveBeenCalled()
    })

    it('should return null when both email and password are empty', async () => {
      const result = await authService.authenticate('', '')

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled()
      expect(mockPasswordService.compare).not.toHaveBeenCalled()
    })

    it('should not include password in returned user data', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, validPassword)

      expect(result).not.toHaveProperty('password')
      expect(result).not.toHaveProperty('subscription')
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
      })
    })

    it('should handle user with null name', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
        name: null,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, validPassword)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: null,
        image: mockUser.image,
      })
    })

    it('should handle user with null image', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
        image: null,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, validPassword)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: null,
      })
    })

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed')
      mockUserRepository.findByEmail.mockRejectedValue(error)

      await expect(
        authService.authenticate(validEmail, validPassword)
      ).rejects.toThrow('Database connection failed')
    })

    it('should propagate password service errors', async () => {
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })
      const error = new Error('Password comparison failed')

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockRejectedValue(error)

      await expect(
        authService.authenticate(validEmail, validPassword)
      ).rejects.toThrow('Password comparison failed')
    })

    it('should handle email with different cases', async () => {
      const mockUser = createMockUser({
        email: validEmail.toLowerCase(),
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(
        validEmail.toUpperCase(),
        validPassword
      )

      expect(result).not.toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        validEmail.toUpperCase()
      )
    })

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+tag@example.com'
      const mockUser = createMockUser({
        email: specialEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(specialEmail, validPassword)

      expect(result).not.toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(specialEmail)
    })

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, longPassword)

      expect(result).not.toBeNull()
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        longPassword,
        hashedPassword
      )
    })

    it('should handle passwords with special characters', async () => {
      const specialPassword = 'P@$$w0rd!#%&*()[]{}|<>?'
      const mockUser = createMockUser({
        email: validEmail,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      mockPasswordService.compare.mockResolvedValue(true)

      const result = await authService.authenticate(validEmail, specialPassword)

      expect(result).not.toBeNull()
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        specialPassword,
        hashedPassword
      )
    })
  })

  describe('validateSession', () => {
    it('should throw error as it is not implemented', async () => {
      await expect(authService.validateSession('some-token')).rejects.toThrow(
        'validateSession not implemented - use NextAuth session'
      )
    })

    it('should throw error for empty token', async () => {
      await expect(authService.validateSession('')).rejects.toThrow(
        'validateSession not implemented - use NextAuth session'
      )
    })

    it('should throw error for any token value', async () => {
      await expect(
        authService.validateSession('any-random-token-123')
      ).rejects.toThrow('validateSession not implemented - use NextAuth session')
    })
  })
})
