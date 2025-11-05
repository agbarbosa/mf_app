import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPremiumAccess } from '@/lib/authorization'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'

    let events

    if (session?.user) {
      const isPremium = hasPremiumAccess(session)

      if (isPremium || showAll) {
        events = await prisma.event.findMany({
          orderBy: { startDate: 'asc' },
          include: {
            _count: {
              select: { registrations: true },
            },
          },
        })
      } else {
        events = await prisma.event.findMany({
          where: { isPremiumOnly: false },
          orderBy: { startDate: 'asc' },
          include: {
            _count: {
              select: { registrations: true },
            },
          },
        })
      }
    } else {
      events = await prisma.event.findMany({
        where: { isPremiumOnly: false },
        orderBy: { startDate: 'asc' },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        location: body.location,
        imageUrl: body.imageUrl,
        maxAttendees: body.maxAttendees,
        isPremiumOnly: body.isPremiumOnly || false,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
