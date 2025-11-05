import { NextResponse } from 'next/server'
import { z } from 'zod'
import { userService } from '@/lib/services/UserService'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = signupSchema.parse(body)

    // Use UserService to create user (Phase 2: Service Layer)
    const user = await userService.createUser({
      email,
      password,
      name,
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    // Handle user already exists error
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
