'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Service {
  id: string
  title: string
  description: string
  category: string
  contactEmail: string
  contactPhone: string
  isPremiumOnly: boolean
  user: {
    name: string
    email: string
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Members Services</h1>
          <p className="text-gray-600 mt-2">
            Connect with community members offering professional services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{service.title}</CardTitle>
                  {service.isPremiumOnly && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
                <span className="text-sm text-primary-600 font-medium">
                  {service.category}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Offered by:</span> {service.user.name}
                  </p>
                  {service.contactEmail && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Email:</span>{' '}
                      <a
                        href={`mailto:${service.contactEmail}`}
                        className="text-primary-600 hover:underline"
                      >
                        {service.contactEmail}
                      </a>
                    </p>
                  )}
                  {service.contactPhone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {service.contactPhone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No services available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
