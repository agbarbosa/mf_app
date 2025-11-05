import { UserService, CreateUserDto } from '../UserService'
import { IPasswordService } from '../interfaces/IPasswordService'
import { IUserRepository } from '@/lib/repositories/interfaces/IUserRepository'
import { createMockPasswordService, createMockUserRepository } from '@/test-utils/mocks'
import { createMockUser } from '@/test-utils/factories'

describe('UserService', () => {
  let userService: UserService
  let mockPasswordService: jest.Mocked<IPasswordService>
  let mockUserRepository: jest.Mocked<IUserRepository>

  beforeEach(() => {
    mockPasswordService = createMockPasswordService()
    mockUserRepository = createMockUserRepository()
    userService = new UserService(mockPasswordService, mockUserRepository)
  })

  describe('createUser', () => {
    const validUserData: CreateUserDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
    }

    it('should create user with hashed password', async () => {
      const hashedPassword = '$2a$12$hashedPassword'
      const createdUser = createMockUser({
        email: validUserData.email,
        name: validUserData.name,
        password: hashedPassword,
      })

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockPasswordService.hash.mockResolvedValue(hashedPassword)
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await userService.createUser(validUserData)

      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        image: createdUser.image,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        subscription: createdUser.subscription,
      })
      expect(result).not.toHaveProperty('password')
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        validUserData.email
      )
      expect(mockPasswordService.hash).toHaveBeenCalledWith(
        validUserData.password
      )
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: validUserData.email,
        name: validUserData.name,
        password: hashedPassword,
        image: undefined,
      })
    })

    it('should throw error when user already exists', async () => {
      const existingUser = createMockUser({
        email: validUserData.email,
      })

      mockUserRepository.findByEmail.mockResolvedValue(existingUser)

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        'User already exists'
      )
      expect(mockPasswordService.hash).not.toHaveBeenCalled()
      expect(mockUserRepository.create).not.toHaveBeenCalled()
    })

    it('should create user with image', async () => {
      const userDataWithImage: CreateUserDto = {
        ...validUserData,
        image: 'https://example.com/avatar.jpg',
      }
      const hashedPassword = '$2a$12$hashedPassword'
      const createdUser = createMockUser({
        ...userDataWithImage,
        password: hashedPassword,
        image: userDataWithImage.image,
      })

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockPasswordService.hash.mockResolvedValue(hashedPassword)
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await userService.createUser(userDataWithImage)

      expect(result.image).toBe(userDataWithImage.image)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: userDataWithImage.email,
        name: userDataWithImage.name,
        password: hashedPassword,
        image: userDataWithImage.image,
      })
    })

    it('should create user with null image', async () => {
      const userDataWithNullImage: CreateUserDto = {
        ...validUserData,
        image: null,
      }
      const hashedPassword = '$2a$12$hashedPassword'
      const createdUser = createMockUser({
        ...userDataWithNullImage,
        password: hashedPassword,
        image: null,
      })

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockPasswordService.hash.mockResolvedValue(hashedPassword)
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await userService.createUser(userDataWithNullImage)

      expect(result.image).toBeNull()
    })

    it('should propagate password hashing errors', async () => {
      const error = new Error('Hashing failed')

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockPasswordService.hash.mockRejectedValue(error)

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        'Hashing failed'
      )
      expect(mockUserRepository.create).not.toHaveBeenCalled()
    })

    it('should propagate repository errors', async () => {
      const hashedPassword = '$2a$12$hashedPassword'
      const error = new Error('Database error')

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockPasswordService.hash.mockResolvedValue(hashedPassword)
      mockUserRepository.create.mockRejectedValue(error)

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('getUserById', () => {
    it('should return user without password when found', async () => {
      const mockUser = createMockUser()

      mockUserRepository.findById.mockResolvedValue(mockUser)

      const result = await userService.getUserById(mockUser.id)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        subscription: mockUser.subscription,
      })
      expect(result).not.toHaveProperty('password')
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id)
    })

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      const result = await userService.getUserById('non-existent-id')

      expect(result).toBeNull()
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id')
    })

    it('should propagate repository errors', async () => {
      const error = new Error('Database error')
      mockUserRepository.findById.mockRejectedValue(error)

      await expect(userService.getUserById('some-id')).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('getUserByEmail', () => {
    it('should return user without password when found', async () => {
      const mockUser = createMockUser()

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)

      const result = await userService.getUserByEmail(mockUser.email)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        subscription: mockUser.subscription,
      })
      expect(result).not.toHaveProperty('password')
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email)
    })

    it('should return null when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      const result = await userService.getUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com'
      )
    })

    it('should propagate repository errors', async () => {
      const error = new Error('Database error')
      mockUserRepository.findByEmail.mockRejectedValue(error)

      await expect(
        userService.getUserByEmail('test@example.com')
      ).rejects.toThrow('Database error')
    })
  })

  describe('updateUser', () => {
    const userId = 'user-123'

    it('should update user without password', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      }
      const updatedUser = createMockUser({
        id: userId,
        ...updateData,
      })

      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await userService.updateUser(userId, updateData)

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        subscription: updatedUser.subscription,
      })
      expect(result).not.toHaveProperty('password')
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        name: updateData.name,
        email: updateData.email,
        image: undefined,
      })
      expect(mockPasswordService.hash).not.toHaveBeenCalled()
    })

    it('should update user with password', async () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newPassword123',
      }
      const hashedPassword = '$2a$12$newHashedPassword'
      const updatedUser = createMockUser({
        id: userId,
        name: updateData.name,
        password: hashedPassword,
      })

      mockPasswordService.hash.mockResolvedValue(hashedPassword)
      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await userService.updateUser(userId, updateData)

      expect(result).not.toHaveProperty('password')
      expect(mockPasswordService.hash).toHaveBeenCalledWith(updateData.password)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        name: updateData.name,
        email: undefined,
        image: undefined,
        password: hashedPassword,
      })
    })

    it('should update only specific fields', async () => {
      const updateData = {
        image: 'https://example.com/new-avatar.jpg',
      }
      const updatedUser = createMockUser({
        id: userId,
        image: updateData.image,
      })

      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await userService.updateUser(userId, updateData)

      expect(result.image).toBe(updateData.image)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        name: undefined,
        email: undefined,
        image: updateData.image,
      })
    })

    it('should propagate password hashing errors', async () => {
      const updateData = {
        password: 'newPassword123',
      }
      const error = new Error('Hashing failed')

      mockPasswordService.hash.mockRejectedValue(error)

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'Hashing failed'
      )
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })

    it('should propagate repository errors', async () => {
      const updateData = {
        name: 'Updated Name',
      }
      const error = new Error('Database error')

      mockUserRepository.update.mockRejectedValue(error)

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const userId = 'user-123'

      mockUserRepository.delete.mockResolvedValue(undefined)

      await userService.deleteUser(userId)

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
    })

    it('should propagate repository errors', async () => {
      const userId = 'user-123'
      const error = new Error('Database error')

      mockUserRepository.delete.mockRejectedValue(error)

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        'Database error'
      )
    })
  })
})
