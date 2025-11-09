import { prisma } from '@/lib/prisma'
import { Service, ServiceCategory } from '@prisma/client'
import {
  IServiceRepository,
  CreateServiceData,
  UpdateServiceData,
} from './interfaces/IServiceRepository'

/**
 * Prisma implementation of IServiceRepository
 * Handles all service directory data access operations using Prisma ORM
 */
export class PrismaServiceRepository implements IServiceRepository {
  /**
   * Find all services (including unpublished)
   * @returns Array of all services
   */
  async findAll(): Promise<Service[]> {
    return prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find all published services
   * @returns Array of published services
   */
  async findAllPublished(): Promise<Service[]> {
    return prisma.service.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find published free services
   * @returns Array of published free services
   */
  async findPublishedFreeServices(): Promise<Service[]> {
    return prisma.service.findMany({
      where: {
        published: true,
        isPremiumOnly: false,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find services by category and/or premium status
   * @param category - Optional service category filter
   * @param isPremiumOnly - Optional premium status filter
   * @returns Array of filtered services
   */
  async findByCategory(category?: ServiceCategory, isPremiumOnly?: boolean): Promise<Service[]> {
    const where: any = {}

    if (category !== undefined) {
      where.category = category
    }

    if (isPremiumOnly !== undefined) {
      where.isPremiumOnly = isPremiumOnly
    }

    return prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find service by ID
   * @param id - Service ID
   * @returns Service or null if not found
   */
  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    })
  }

  /**
   * Create new service
   * @param data - Service creation data
   * @returns Created service
   */
  async create(data: CreateServiceData): Promise<Service> {
    return prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        isPremiumOnly: data.isPremiumOnly,
        published: data.published,
        userId: data.userId,
      },
    })
  }

  /**
   * Update service
   * @param id - Service ID
   * @param data - Update data (partial)
   * @returns Updated service
   */
  async update(id: string, data: UpdateServiceData): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete service
   * @param id - Service ID
   */
  async delete(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    })
  }
}

// Export singleton instance
export const serviceRepository = new PrismaServiceRepository()
