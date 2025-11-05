import { AuthorizationService } from '../AuthorizationService'
import { PremiumAccessStrategy } from '../strategies/PremiumAccessStrategy'
import { FreeAccessStrategy } from '../strategies/FreeAccessStrategy'
import { IPermissionStrategy } from '../interfaces/IPermissionStrategy'

describe('AuthorizationService', () => {
  let service: AuthorizationService

  beforeEach(() => {
    service = new AuthorizationService()
  })

  describe('registerStrategy', () => {
    it('should register a strategy', () => {
      const strategy = new PremiumAccessStrategy()
      service.registerStrategy(strategy)

      const result = service.canAccess('PREMIUM', 'ACTIVE', { requiresPremium: true }, 'premium-access')
      expect(result).toBe(true)
    })

    it('should register multiple strategies', () => {
      const premiumStrategy = new PremiumAccessStrategy()
      const freeStrategy = new FreeAccessStrategy()

      service.registerStrategy(premiumStrategy)
      service.registerStrategy(freeStrategy)

      // Should be able to use both
      expect(
        service.canAccess('PREMIUM', 'ACTIVE', { requiresPremium: true }, 'premium-access')
      ).toBe(true)
      expect(
        service.canAccess('FREE', 'ACTIVE', { requiresPremium: false }, 'free-access')
      ).toBe(true)
    })

    it('should allow overriding existing strategy with same name', () => {
      const strategy1 = new PremiumAccessStrategy()
      const strategy2: IPermissionStrategy = {
        getName: () => 'premium-access',
        canAccess: jest.fn().mockReturnValue(false),
      }

      service.registerStrategy(strategy1)
      service.registerStrategy(strategy2)

      const result = service.canAccess('PREMIUM', 'ACTIVE', { requiresPremium: true }, 'premium-access')
      expect(result).toBe(false)
      expect(strategy2.canAccess).toHaveBeenCalled()
    })
  })

  describe('canAccess', () => {
    beforeEach(() => {
      service.registerStrategy(new PremiumAccessStrategy())
      service.registerStrategy(new FreeAccessStrategy())
    })

    it('should use specified strategy', () => {
      const result = service.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: true },
        'premium-access'
      )
      expect(result).toBe(true)
    })

    it('should fallback to default strategy for non-existent strategy', () => {
      // When strategy not found, it uses default (PremiumAccessStrategy)
      const result = service.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: true },
        'non-existent'
      )
      expect(result).toBe(true)
    })

    it('should use default strategy when no strategy name provided', () => {
      // Default strategy is PremiumAccessStrategy
      const result = service.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(true)
    })

    it('should use custom default strategy when provided in constructor', () => {
      const customService = new AuthorizationService(new FreeAccessStrategy())

      const result = customService.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should pass correct parameters to strategy', () => {
      const mockStrategy: IPermissionStrategy = {
        getName: () => 'mock-strategy',
        canAccess: jest.fn().mockReturnValue(true),
      }

      service.registerStrategy(mockStrategy)

      const tier = 'PREMIUM'
      const status = 'ACTIVE'
      const requirements = { requiresPremium: true }

      service.canAccess(tier, status, requirements, 'mock-strategy')

      expect(mockStrategy.canAccess).toHaveBeenCalledWith(tier, status, requirements)
    })
  })

  describe('getRegisteredStrategies', () => {
    it('should return list of registered strategy names', () => {
      service.registerStrategy(new FreeAccessStrategy())

      const strategies = service.getRegisteredStrategies()
      expect(strategies).toContain('premium-access') // default
      expect(strategies).toContain('free-access')
      expect(strategies.length).toBeGreaterThanOrEqual(2)
    })

    it('should include default strategy', () => {
      const strategies = service.getRegisteredStrategies()
      expect(strategies).toContain('premium-access') // default is PremiumAccessStrategy
      expect(strategies.length).toBeGreaterThanOrEqual(1)
    })
  })
})
