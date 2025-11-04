import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAccess } from '@/lib/utils/subscription'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user has access
    if (
      !hasAccess(
        session.user.subscription?.tier,
        session.user.subscription?.status,
        event.isPremiumOnly
      )
    ) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered' },
        { status: 400 }
      )
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}
