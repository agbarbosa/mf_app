'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Course {
  id: string
  title: string
  description: string
  duration: number
  isPremiumOnly: boolean
  _count: {
    modules: number
    enrollments: number
  }
}

export default function CoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Successfully enrolled in course!')
        fetchCourses()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to enroll')
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
          <h1 className="text-3xl font-bold text-gray-900">Video Courses</h1>
          <p className="text-gray-600 mt-2">
            Learn at your own pace with our on-demand courses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{course.title}</CardTitle>
                  {course.isPremiumOnly && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Modules:</span>{' '}
                    {course._count.modules}
                  </p>
                  {course.duration && (
                    <p>
                      <span className="font-medium">Duration:</span>{' '}
                      {Math.floor(course.duration / 60)}h {course.duration % 60}m
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Students:</span>{' '}
                    {course._count.enrollments}
                  </p>
                </div>
                <Button
                  onClick={() => handleEnroll(course.id)}
                  className="w-full"
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
