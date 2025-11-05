import { PasswordService } from '../PasswordService'

describe('PasswordService', () => {
  let service: PasswordService

  beforeEach(() => {
    service = new PasswordService()
  })

  describe('hash', () => {
    it('should hash password with default salt rounds', async () => {
      const password = 'mySecurePassword123'

      const result = await service.hash(password)

      expect(result).toBeTruthy()
      expect(result).toContain('$2a$12$') // bcrypt format with 12 rounds
      expect(result.length).toBeGreaterThan(50) // bcrypt hashes are ~60 chars
    })

    it('should hash password with custom salt rounds', async () => {
      const customService = new PasswordService(10)
      const password = 'anotherPassword456'

      const result = await customService.hash(password)

      expect(result).toBeTruthy()
      expect(result).toContain('$2a$10$') // bcrypt format with 10 rounds
    })

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword'

      const hash1 = await service.hash(password)
      const hash2 = await service.hash(password)

      expect(hash1).not.toBe(hash2) // Different salts = different hashes
    })
  })

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'correctPassword'
      const hash = await service.hash(password)

      const result = await service.compare(password, hash)

      expect(result).toBe(true)
    })

    it('should return false for non-matching password and hash', async () => {
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'
      const hash = await service.hash(password)

      const result = await service.compare(wrongPassword, hash)

      expect(result).toBe(false)
    })

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#%&*()[]{}|'
      const hash = await service.hash(password)

      const result = await service.compare(password, hash)

      expect(result).toBe(true)
    })

    it('should handle unicode characters in password', async () => {
      const password = 'пароль密码🔐'
      const hash = await service.hash(password)

      const result = await service.compare(password, hash)

      expect(result).toBe(true)
    })
  })

  describe('constructor', () => {
    it('should use default salt rounds when not specified', async () => {
      const defaultService = new PasswordService()
      const password = 'test'

      const hash = await defaultService.hash(password)

      expect(hash).toContain('$2a$12$')
    })

    it('should use custom salt rounds when specified', async () => {
      const customService = new PasswordService(8)
      const password = 'test'

      const hash = await customService.hash(password)

      expect(hash).toContain('$2a$08$')
    })
  })
})
