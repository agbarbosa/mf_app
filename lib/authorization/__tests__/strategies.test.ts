import { PremiumAccessStrategy } from '../strategies/PremiumAccessStrategy'
import { FreeAccessStrategy } from '../strategies/FreeAccessStrategy'
import { TierBasedStrategy } from '../strategies/TierBasedStrategy'

describe('Authorization Strategies', () => {
  describe('PremiumAccessStrategy', () => {
    let strategy: PremiumAccessStrategy

    beforeEach(() => {
      strategy = new PremiumAccessStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('premium-access')
    })

    it('should allow access when not requiring premium', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should allow premium user access to premium resource', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should deny inactive premium user access', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        'INACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should deny when tier is undefined', () => {
      const result = strategy.canAccess(
        undefined,
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should deny when status is undefined', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        undefined,
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })
  })

  describe('FreeAccessStrategy', () => {
    let strategy: FreeAccessStrategy

    beforeEach(() => {
      strategy = new FreeAccessStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('free-access')
    })

    it('should allow access to free resources', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should deny access to premium resources', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should allow access when requirements not specified', () => {
      // When no requirements, strategy allows access (not requiring premium = allow)
      const result = strategy.canAccess('FREE', 'ACTIVE')
      expect(result).toBe(true)
    })

    it('should allow access for any tier when not requiring premium', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })
  })

  describe('TierBasedStrategy', () => {
    let strategy: TierBasedStrategy

    beforeEach(() => {
      strategy = new TierBasedStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('tier-based')
    })

    it('should allow premium user access to premium resource', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should allow free user access when not requiring premium', () => {
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { requiresPremium: false }
      )
      expect(result).toBe(true)
    })

    it('should use custom check when provided', () => {
      const customCheck = jest.fn().mockReturnValue(true)
      const result = strategy.canAccess(
        'FREE',
        'ACTIVE',
        { customCheck }
      )
      expect(result).toBe(true)
      expect(customCheck).toHaveBeenCalledWith('FREE', 'ACTIVE')
    })

    it('should return false when custom check fails', () => {
      const customCheck = jest.fn().mockReturnValue(false)
      const result = strategy.canAccess(
        'PREMIUM',
        'ACTIVE',
        { customCheck }
      )
      expect(result).toBe(false)
    })

    it('should deny access when tier is undefined and requiring premium', () => {
      const result = strategy.canAccess(
        undefined,
        'ACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should deny access when status is not ACTIVE and requiring premium', () => {
      const result = strategy.canAccess(
        'PREMIUM',
        'INACTIVE',
        { requiresPremium: true }
      )
      expect(result).toBe(false)
    })

    it('should allow access when no requirements specified', () => {
      // When no requirements, strategy allows access by default
      const result = strategy.canAccess('FREE', 'ACTIVE')
      expect(result).toBe(true)
    })
  })
})
