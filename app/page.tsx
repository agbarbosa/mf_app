import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Mentor Futuro
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our community and unlock exclusive access to events, courses, and professional networking opportunities.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button size="lg" className="bg-primary-900 hover:bg-primary-950">
                  View Premium Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Events Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access exclusive community events, workshops, and networking opportunities. Premium members get early access to all events.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Learn from industry experts with our on-demand video courses. Expand your skills at your own pace.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services Board</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with members offering professional services. Share your expertise and find the help you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <p className="text-3xl font-bold mt-4">$0<span className="text-lg text-gray-600">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Access to public events
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Limited course access
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Community forum access
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary-600">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <p className="text-3xl font-bold mt-4">$29<span className="text-lg text-gray-600">/month</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    All free features
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Exclusive premium events
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Full course library access
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Premium services directory
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <Link href="/subscribe">
                  <Button className="w-full">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
