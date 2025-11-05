import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { authService } from './services/AuthService'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Use AuthService for authentication (Phase 2: Service Layer)
        const user = await authService.authenticate(
          credentials.email,
          credentials.password
        )

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string

        // Fetch latest subscription info
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { subscription: true },
        })

        if (user?.subscription) {
          session.user.subscription = {
            tier: user.subscription.tier,
            status: user.subscription.status,
          }
        }
      }
      return session
    },
  },
}
