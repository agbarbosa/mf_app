import { prisma } from '@/lib/prisma'
import { Course } from '@prisma/client'
import {
  ICourseRepository,
  CourseWithCounts,
  CreateCourseData,
  UpdateCourseData,
} from './interfaces/ICourseRepository'

/**
 * Prisma implementation of ICourseRepository
 * Handles all course data access operations using Prisma ORM
 */
export class PrismaCourseRepository implements ICourseRepository {
  /**
   * Find all published courses with module and enrollment counts
   * @returns Array of published courses
   */
  async findAllPublished(): Promise<CourseWithCounts[]> {
    return prisma.course.findMany({
      where: { published: true },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    })
  }

  /**
   * Find published free courses with counts
   * @returns Array of published free courses
   */
  async findPublishedFreeCourses(): Promise<CourseWithCounts[]> {
    return prisma.course.findMany({
      where: {
        published: true,
        isPremiumOnly: false,
      },
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    })
  }

  /**
   * Find course by ID
   * @param id - Course ID
   * @returns Course or null if not found
   */
  async findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { id },
    })
  }

  /**
   * Create new course
   * @param data - Course creation data
   * @returns Created course
   */
  async create(data: CreateCourseData): Promise<Course> {
    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        duration: data.duration,
        isPremiumOnly: data.isPremiumOnly,
        published: data.published,
      },
    })
  }

  /**
   * Update course
   * @param id - Course ID
   * @param data - Update data (partial)
   * @returns Updated course
   */
  async update(id: string, data: UpdateCourseData): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete course
   * @param id - Course ID
   */
  async delete(id: string): Promise<void> {
    await prisma.course.delete({
      where: { id },
    })
  }

  /**
   * Enroll user in course
   * @param courseId - Course ID
   * @param userId - User ID
   */
  async enrollUser(courseId: string, userId: string): Promise<void> {
    await prisma.courseEnrollment.create({
      data: {
        courseId,
        userId,
        progress: 0,
        completed: false,
      },
    })
  }
}

// Export singleton instance
export const courseRepository = new PrismaCourseRepository()
