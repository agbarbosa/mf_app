import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { serviceRepository } from '@/lib/repositories'
import { hasPremiumAccess } from '@/lib/authorization'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    let services

    if (session?.user) {
      const isPremium = hasPremiumAccess(session)

      if (isPremium) {
        services = await serviceRepository.findAll()
      } else {
        services = await serviceRepository.findByCategory(undefined, false)
      }
    } else {
      services = await serviceRepository.findByCategory(undefined, false)
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

    const service = await serviceRepository.create({
      userId: session.user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      isPremiumOnly: body.isPremiumOnly || false,
      published: body.published || false,
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
