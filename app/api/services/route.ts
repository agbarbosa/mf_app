import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    let services

    if (session?.user) {
      const isPremium =
        session.user.subscription?.tier === 'PREMIUM' &&
        session.user.subscription?.status === 'ACTIVE'

      if (isPremium) {
        services = await prisma.service.findMany({
          where: { published: true },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      } else {
        services = await prisma.service.findMany({
          where: { published: true, isPremiumOnly: false },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    } else {
      services = await prisma.service.findMany({
        where: { published: true, isPremiumOnly: false },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch services' },
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

    const service = await prisma.service.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        imageUrl: body.imageUrl,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        isPremiumOnly: body.isPremiumOnly || false,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
