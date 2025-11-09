'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isPremiumOnly: boolean
  _count: {
    registrations: number
  }
}

export default function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Successfully registered for event!')
        fetchEvents()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to register')
      }
    } catch (error) {
      alert('Something went wrong')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
          <p className="text-gray-600 mt-2">
            Join our events and connect with the community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{event.title}</CardTitle>
                  {event.isPremiumOnly && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {event.location}
                  </p>
                  <p>
                    <span className="font-medium">Attendees:</span>{' '}
                    {event._count.registrations}
                  </p>
                </div>
                <Button
                  onClick={() => handleRegister(event.id)}
                  className="w-full"
                >
                  Register
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No events available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
