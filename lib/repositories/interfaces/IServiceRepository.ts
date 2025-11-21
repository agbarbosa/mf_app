import { Service } from '@prisma/client'

export interface CreateServiceData {
  title: string
  description: string
  category: string
  imageUrl?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly: boolean
  published: boolean
  userId: string
}

export interface UpdateServiceData {
  title?: string
  description?: string
  category?: string
  imageUrl?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly?: boolean
  published?: boolean
}

export interface IServiceRepository {
  /**
   * Find all services (including unpublished)
   */
  findAll(): Promise<Service[]>

  /**
   * Find all published services
   */
  findAllPublished(): Promise<Service[]>

  /**
   * Find published free services
   */
  findPublishedFreeServices(): Promise<Service[]>

  /**
   * Find services by category and/or premium status
   * @param category - Optional service category filter
   * @param isPremiumOnly - Optional premium status filter
   */
  findByCategory(category?: string, isPremiumOnly?: boolean): Promise<Service[]>

  /**
   * Find service by ID
   */
  findById(id: string): Promise<Service | null>

  /**
   * Create new service
   */
  create(data: CreateServiceData): Promise<Service>

  /**
   * Update service
   */
  update(id: string, data: UpdateServiceData): Promise<Service>

  /**
   * Delete service
   */
  delete(id: string): Promise<void>
}
