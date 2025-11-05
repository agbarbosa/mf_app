import { Course } from '@prisma/client'

export interface CreateCourseData {
  title: string
  description: string
  thumbnail?: string | null
  duration?: number | null
  isPremiumOnly: boolean
  published: boolean
}

export interface UpdateCourseData {
  title?: string
  description?: string
  thumbnail?: string | null
  duration?: number | null
  isPremiumOnly?: boolean
  published?: boolean
}

export interface CourseWithCounts extends Course {
  _count: {
    modules: number
    enrollments: number
  }
}

export interface ICourseRepository {
  /**
   * Find all published courses
   */
  findAllPublished(): Promise<CourseWithCounts[]>

  /**
   * Find published free courses
   */
  findPublishedFreeCourses(): Promise<CourseWithCounts[]>

  /**
   * Find course by ID
   */
  findById(id: string): Promise<Course | null>

  /**
   * Create new course
   */
  create(data: CreateCourseData): Promise<Course>

  /**
   * Update course
   */
  update(id: string, data: UpdateCourseData): Promise<Course>

  /**
   * Delete course
   */
  delete(id: string): Promise<void>

  /**
   * Enroll user in course
   */
  enrollUser(courseId: string, userId: string): Promise<void>
}
