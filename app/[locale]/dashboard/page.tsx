import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      eventRegistrations: {
        include: {
          event: true,
        },
        take: 5,
        orderBy: {
          registeredAt: 'desc',
        },
      },
      enrollments: {
        include: {
          course: true,
        },
        take: 5,
        orderBy: {
          enrolledAt: 'desc',
        },
      },
    },
  })

  const isPremium = user?.subscription?.tier === 'PREMIUM'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and access your content
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">
                  {isPremium ? 'Premium' : 'Free'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.subscription?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user?.subscription?.status}
                </span>
              </div>
              {!isPremium ? (
                <Link
                  href="/subscribe"
                  className="block w-full px-4 py-2 text-base font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 text-center"
                >
                  Upgrade to Premium
                </Link>
              ) : (
                <form action="/api/subscription/portal" method="POST">
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-600">
                {user?.eventRegistrations.length || 0}
              </div>
              <p className="text-gray-600 mt-2">Total events registered</p>
              <Link
                href="/events"
                className="block w-full px-4 py-2 text-base font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 mt-4 text-center"
              >
                Browse Events
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-600">
                {user?.enrollments.length || 0}
              </div>
              <p className="text-gray-600 mt-2">Courses enrolled</p>
              <Link
                href="/courses"
                className="block w-full px-4 py-2 text-base font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 mt-4 text-center"
              >
                Browse Courses
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Event Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.eventRegistrations && user.eventRegistrations.length > 0 ? (
                <ul className="space-y-3">
                  {user.eventRegistrations.map((registration) => (
                    <li
                      key={registration.id}
                      className="border-b pb-3 last:border-b-0"
                    >
                      <h4 className="font-medium">{registration.event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(registration.event.startDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No event registrations yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.enrollments && user.enrollments.length > 0 ? (
                <ul className="space-y-3">
                  {user.enrollments.map((enrollment) => (
                    <li
                      key={enrollment.id}
                      className="border-b pb-3 last:border-b-0"
                    >
                      <h4 className="font-medium">{enrollment.course.title}</h4>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {enrollment.progress}% complete
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No course enrollments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
