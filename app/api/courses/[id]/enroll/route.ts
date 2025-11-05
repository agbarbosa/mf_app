import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { courseRepository } from '@/lib/repositories'
import { checkResourceAccess } from '@/lib/authorization'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await courseRepository.findById(params.id)

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user has access
    if (!checkResourceAccess(session, course.isPremiumOnly)) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    // Enroll in course
    const enrollment = await courseRepository.enrollUser(
      params.id,
      session.user.id
    )

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}
