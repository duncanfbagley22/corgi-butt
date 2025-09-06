'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

    const { user, loading } = useAuth()

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-400">Logging in...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-400">
          You must be logged in to view this page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-xl">
            Welcome, {user.full_name || user.email} 👋
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
