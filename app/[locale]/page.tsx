'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100">
                  {t('hero.getStarted')}
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button size="lg" className="bg-primary-900 hover:bg-primary-950">
                  {t('hero.viewPlans')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('features.events.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.events.description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.courses.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.courses.description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('features.services.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('features.services.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{t('pricing.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing.free.title')}</CardTitle>
                <p className="text-3xl font-bold mt-4">
                  {t('pricing.free.price')}
                  <span className="text-lg text-gray-600">{t('pricing.free.period')}</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.free.features.publicEvents')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.free.features.limitedCourses')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.free.features.communityForum')}
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    {t('pricing.free.button')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary-600">
              <CardHeader>
                <CardTitle>{t('pricing.premium.title')}</CardTitle>
                <p className="text-3xl font-bold mt-4">
                  {t('pricing.premium.price')}
                  <span className="text-lg text-gray-600">{t('pricing.premium.period')}</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.premium.features.allFree')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.premium.features.exclusiveEvents')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.premium.features.fullCourseLibrary')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.premium.features.servicesDirectory')}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pricing.premium.features.prioritySupport')}
                  </li>
                </ul>
                <Link href="/subscribe">
                  <Button className="w-full">
                    {t('pricing.premium.button')}
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
