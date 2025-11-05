import { Service, ServiceCategory } from '@prisma/client'

export interface CreateServiceData {
  title: string
  description: string
  category: ServiceCategory
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly: boolean
  published: boolean
  userId: string
}

export interface UpdateServiceData {
  title?: string
  description?: string
  category?: ServiceCategory
  contactEmail?: string | null
  contactPhone?: string | null
  isPremiumOnly?: boolean
  published?: boolean
}

export interface IServiceRepository {
  /**
   * Find all published services
   */
  findAllPublished(): Promise<Service[]>

  /**
   * Find published free services
   */
  findPublishedFreeServices(): Promise<Service[]>

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
