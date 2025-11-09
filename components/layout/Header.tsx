'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header() {
  const { data: session } = useSession()
  const t = useTranslations('nav')

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Mentor Futuro
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-primary-600">
                {t('events')}
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-primary-600">
                {t('courses')}
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-primary-600">
                {t('services')}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
                >
                  {t('dashboard')}
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut()}
                >
                  {t('signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500"
                >
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
