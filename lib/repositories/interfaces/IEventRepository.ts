import { Event, EventStatus } from '@prisma/client'

export interface CreateEventData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  imageUrl?: string | null
  maxAttendees?: number | null
  isPremiumOnly: boolean
  status?: EventStatus
}

export interface UpdateEventData {
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  location?: string
  imageUrl?: string | null
  maxAttendees?: number | null
  isPremiumOnly?: boolean
  status?: EventStatus
}

export interface EventWithRegistrationCount extends Event {
  _count: {
    registrations: number
  }
}

export interface IEventRepository {
  /**
   * Find all events with registration counts
   */
  findAll(): Promise<EventWithRegistrationCount[]>

  /**
   * Find only free (non-premium) events
   */
  findFreeEvents(): Promise<EventWithRegistrationCount[]>

  /**
   * Find event by ID
   */
  findById(id: string): Promise<Event | null>

  /**
   * Create new event
   */
  create(data: CreateEventData): Promise<Event>

  /**
   * Update event
   */
  update(id: string, data: UpdateEventData): Promise<Event>

  /**
   * Delete event
   */
  delete(id: string): Promise<void>

  /**
   * Register user for event
   */
  registerUser(eventId: string, userId: string): Promise<void>

  /**
   * Unregister user from event
   */
  unregisterUser(eventId: string, userId: string): Promise<void>
}
