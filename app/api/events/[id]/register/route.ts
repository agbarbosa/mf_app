import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { eventRepository } from '@/lib/repositories'
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

    const event = await eventRepository.findById(params.id)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user has access
    if (!checkResourceAccess(session, event.isPremiumOnly)) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    // Register for event
    const registration = await eventRepository.registerUser(
      params.id,
      session.user.id
    )

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}
