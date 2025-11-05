import { hasPremiumAccess, checkResourceAccess, filterByAccess } from '../utils'
import { Session } from 'next-auth'
import { createMockSession, createMockPremiumSession, createMockFreeSession } from '@/test-utils/factories'

describe('Authorization Utils', () => {
  describe('hasPremiumAccess', () => {
    it('should return true for active premium user', () => {
      const session = createMockPremiumSession()
      expect(hasPremiumAccess(session)).toBe(true)
    })

    it('should return false for free tier user', () => {
      const session = createMockFreeSession()
      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for inactive premium user', () => {
      const session = createMockSession({
        tier: 'PREMIUM',
        status: 'INACTIVE',
      })
      expect(hasPremiumAccess(session)).toBe(false)
    })

    it('should return false for null session', () => {
      expect(hasPremiumAccess(null)).toBe(false)
    })

    it('should return false for session without subscription', () => {
      const session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
        },
      } as Session

      expect(hasPremiumAccess(session)).toBe(false)
    })
  })

  describe('checkResourceAccess', () => {
    it('should allow premium user to access premium resource', () => {
      const session = createMockPremiumSession()
      expect(checkResourceAccess(session, true)).toBe(true)
    })

    it('should allow premium user to access free resource', () => {
      const session = createMockPremiumSession()
      expect(checkResourceAccess(session, false)).toBe(true)
    })

    it('should allow free user to access free resource', () => {
      const session = createMockFreeSession()
      expect(checkResourceAccess(session, false)).toBe(true)
    })

    it('should deny free user access to premium resource', () => {
      const session = createMockFreeSession()
      expect(checkResourceAccess(session, true)).toBe(false)
    })

    it('should deny unauthenticated user access to premium resource', () => {
      expect(checkResourceAccess(null, true)).toBe(false)
    })

    it('should allow unauthenticated user access to free resource', () => {
      expect(checkResourceAccess(null, false)).toBe(true)
    })

    it('should deny inactive premium user access to premium resource', () => {
      const session = createMockSession({
        tier: 'PREMIUM',
        status: 'INACTIVE',
      })
      expect(checkResourceAccess(session, true)).toBe(false)
    })
  })

  describe('filterByAccess', () => {
    it('should return all items for premium user', () => {
      const session = createMockPremiumSession()
      const items = [
        { id: '1', title: 'Free Item', isPremiumOnly: false },
        { id: '2', title: 'Premium Item', isPremiumOnly: true },
      ]

      const filtered = filterByAccess(items, session)
      expect(filtered).toHaveLength(2)
      expect(filtered).toEqual(items)
    })

    it('should return only free items for free user', () => {
      const session = createMockFreeSession()
      const items = [
        { id: '1', title: 'Free Item', isPremiumOnly: false },
        { id: '2', title: 'Premium Item', isPremiumOnly: true },
      ]

      const filtered = filterByAccess(items, session)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
      expect(filtered[0].isPremiumOnly).toBe(false)
    })

    it('should return only free items for unauthenticated user', () => {
      const items = [
        { id: '1', title: 'Free Item', isPremiumOnly: false },
        { id: '2', title: 'Premium Item', isPremiumOnly: true },
      ]

      const filtered = filterByAccess(items, null)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should return empty array when no free items available for free user', () => {
      const session = createMockFreeSession()
      const items = [
        { id: '1', title: 'Premium Item 1', isPremiumOnly: true },
        { id: '2', title: 'Premium Item 2', isPremiumOnly: true },
      ]

      const filtered = filterByAccess(items, session)
      expect(filtered).toHaveLength(0)
    })

    it('should handle empty array', () => {
      const session = createMockPremiumSession()
      const items: Array<{ id: string; title: string; isPremiumOnly: boolean }> = []

      const filtered = filterByAccess(items, session)
      expect(filtered).toHaveLength(0)
    })
  })
})
