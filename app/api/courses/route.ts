import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPremiumAccess } from '@/lib/authorization'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    let courses

    if (session?.user) {
      const isPremium = hasPremiumAccess(session)

      if (isPremium) {
        courses = await prisma.course.findMany({
          where: { published: true },
          include: {
            _count: {
              select: { modules: true, enrollments: true },
            },
          },
        })
      } else {
        courses = await prisma.course.findMany({
          where: { published: true, isPremiumOnly: false },
          include: {
            _count: {
              select: { modules: true, enrollments: true },
            },
          },
        })
      }
    } else {
      courses = await prisma.course.findMany({
        where: { published: true, isPremiumOnly: false },
        include: {
          _count: {
            select: { modules: true, enrollments: true },
          },
        },
      })
    }

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        isPremiumOnly: body.isPremiumOnly || false,
        duration: body.duration,
        published: body.published || false,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
