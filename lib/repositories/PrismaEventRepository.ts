import { prisma } from '@/lib/prisma'
import { Event, EventStatus } from '@prisma/client'
import {
  IEventRepository,
  EventWithRegistrationCount,
  CreateEventData,
  UpdateEventData,
} from './interfaces/IEventRepository'

/**
 * Prisma implementation of IEventRepository
 * Handles all event data access operations using Prisma ORM
 */
export class PrismaEventRepository implements IEventRepository {
  /**
   * Find all events with registration counts
   * @returns Array of events with registration counts
   */
  async findAll(): Promise<EventWithRegistrationCount[]> {
    return prisma.event.findMany({
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
  }

  /**
   * Find only free (non-premium) events
   * @returns Array of free events with registration counts
   */
  async findFreeEvents(): Promise<EventWithRegistrationCount[]> {
    return prisma.event.findMany({
      where: { isPremiumOnly: false },
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
  }

  /**
   * Find events by status and/or premium status
   * @param status - Optional event status filter
   * @param isPremiumOnly - Optional premium status filter
   * @returns Array of filtered events with registration counts
   */
  async findByStatus(status?: EventStatus, isPremiumOnly?: boolean): Promise<EventWithRegistrationCount[]> {
    const where: any = {}

    if (status !== undefined) {
      where.status = status
    }

    if (isPremiumOnly !== undefined) {
      where.isPremiumOnly = isPremiumOnly
    }

    return prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
  }

  /**
   * Find event by ID
   * @param id - Event ID
   * @returns Event or null if not found
   */
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id },
    })
  }

  /**
   * Create new event
   * @param data - Event creation data
   * @returns Created event
   */
  async create(data: CreateEventData): Promise<Event> {
    return prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        imageUrl: data.imageUrl,
        maxAttendees: data.maxAttendees,
        isPremiumOnly: data.isPremiumOnly,
        status: data.status || 'UPCOMING',
      },
    })
  }

  /**
   * Update event
   * @param id - Event ID
   * @param data - Update data (partial)
   * @returns Updated event
   */
  async update(id: string, data: UpdateEventData): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete event
   * @param id - Event ID
   */
  async delete(id: string): Promise<void> {
    await prisma.event.delete({
      where: { id },
    })
  }

  /**
   * Register user for event
   * @param eventId - Event ID
   * @param userId - User ID
   */
  async registerUser(eventId: string, userId: string): Promise<void> {
    await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    })
  }

  /**
   * Unregister user from event
   * @param eventId - Event ID
   * @param userId - User ID
   */
  async unregisterUser(eventId: string, userId: string): Promise<void> {
    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    })
  }
}

// Export singleton instance
export const eventRepository = new PrismaEventRepository()
